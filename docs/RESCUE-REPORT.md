# RescueKit Audit Report — "Taskly"

**Engagement:** Production-rescue audit of an AI-generated team task application ("Taskly")
**Auditor:** RescueKit (Muhammad)
**Date:** October 2026
**Status:** ✅ All findings remediated and verified

> **A note on honesty:** Taskly is a *demonstration*, not a real client project.
> It was built deliberately broken to exhibit the 10 most common failures found
> in AI-generated ("vibe-coded") applications, then rescued to production
> standard. The broken reference implementation is preserved in `/broken`
> (labeled, never deployed); the rescued app is the code that actually runs.
> The findings, severities, and fixes below are real — they are exactly the
> issues this class of audit uncovers in production codebases.

---

## Executive summary

Taskly arrived as a working-looking prototype: tasks rendered, a form added
rows, and the demo "felt done." Underneath, it had **three critical
vulnerabilities** — including a full-privilege database key shipped to every
visitor's browser and no access control whatsoever — plus seven high/medium
defects spanning security, data integrity, and user experience.

The rescue rewrote the data layer, access control, and UI feedback paths while
keeping the product's scope identical. Every finding below was fixed, and the
live application demonstrates the before/after: `/broken` shows what was
shipped; the running app shows what it should have been.

**Outcome:** 10 findings → 10 fixed. Zero secrets in the client bundle. RLS
enforced on every row. Validated inputs, graceful errors, loading states, and
bounded queries throughout.

---

## Findings at a glance

| ID | Severity | Finding |
|----|----------|---------|
| #1 | 🔴 Critical | `service_role` key hardcoded and shipped client-side |
| #2 | 🔴 Critical | No Row Level Security — any visitor reads/writes all data |
| #3 | 🔴 Critical | Fake authentication via `localStorage` |
| #4 | 🟠 High | Stored XSS via `dangerouslySetInnerHTML` on task titles |
| #5 | 🟠 High | No input validation on writes |
| #6 | 🟠 High | No error handling — failures white-screen the app |
| #7 | 🟡 Medium | No loading states |
| #8 | 🟠 High | Real secrets committed to the git repo |
| #9 | 🟡 Medium | Unbounded query — no pagination or limits |
| #10 | 🟡 Medium | No ownership recorded or enforced on writes |

---

## Detailed findings

### #1 — `service_role` key hardcoded and shipped client-side 🔴 Critical

**What was wrong** — `broken/lib/supabase-broken.ts` created the Supabase
client with the **`service_role` key hardcoded in source**. Because this file
is imported by client components, the key was bundled and sent to every
visitor's browser.

**Why it matters** — The service_role key bypasses Row Level Security
entirely. Anyone who opened DevTools → Network → JS bundle had full admin
read/write/delete on the entire database: all tables, all users, forever
(until the key was rotated).

**How it was fixed** — `src/lib/supabase/server.ts`
The client now uses only the **publishable anon key**, read from environment
variables at request time on the server. The service_role key does not exist
in this codebase's client paths at all.

```ts
// server-only client, anon key from env — never bundled to the browser
return createServerClient(url, anonKey, { cookies: { ... } });
```

---

### #2 — No Row Level Security: any visitor reads/writes all data 🔴 Critical

**What was wrong** — `broken/app/tasks-broken/page.tsx` ran
`supabase.from("tasks").select("*")` with no auth check. The `tasks` table had
**RLS disabled**, so one visitor's query returned every user's tasks — and the
exposed service_role key (#1) meant anyone could also write or delete them.

**Why it matters** — This is a complete data-breach primitive: cross-user
data exposure with no exploit skill required. It is also the single most
common finding in Supabase-backed vibe-coded apps.

**How it was fixed** — `supabase/migrations/001_taskly.sql`
RLS is **enabled**, and a single owner-scoped policy governs all operations:

```sql
alter table public.rk_tasks enable row level security;

create policy "rk_tasks_demo_owner"
  on public.rk_tasks for all
  to anon, authenticated
  using (owner_id = 'demo-user-001')
  with check (owner_id = 'demo-user-001');
```

The demo runs on a fixed demo identity so visitors need no login; the policy
is written so swapping `'demo-user-001'` for `(auth.uid()::text)` after wiring
Supabase Auth is a one-line change. Queries additionally filter
`owner_id` app-side as defense in depth (`src/lib/tasks.ts`).

---

### #3 — Fake authentication via `localStorage` 🔴 Critical

**What was wrong** — `broken/lib/auth-broken.ts` "logged in" users by writing
`{ name, role: "admin" }` to `localStorage`. No password, no server check. Any
visitor could grant themselves admin in DevTools with one line.

**Why it matters** — Client-side state is never identity. Every "protected"
page and every role check built on this was theater.

**How it was fixed** — The demo drops the fake login entirely instead of
dressing it up: a documented demo identity (`src/lib/constants.ts`,
`DEMO_OWNER_ID`) with **server-enforced** scoping. The migration's RLS policy
(#2) is the real authority, and the report documents the production path:
wire Supabase Auth → RLS keys off `auth.uid()` → no code changes needed in
the data layer beyond the policy swap.

---

### #4 — Stored XSS via `dangerouslySetInnerHTML` on task titles 🟠 High

**What was wrong** — `broken/app/tasks-broken/page.tsx` rendered titles with
`dangerouslySetInnerHTML={{ __html: t.title }}`. A task titled
`<img src=x onerror="…">` would execute JavaScript in every visitor's browser
— session theft, defacement, or worse, persisted in the database.

**Why it matters** — Stored XSS turns a task board into a malware
distribution point. It survives page reloads and hits every user.

**How it was fixed** — `src/components/task-item.tsx`
Titles render as plain React text nodes, which escape HTML by default:

```tsx
<p className="truncate ...">{task.title}</p>  {/* escaped, never raw HTML */}
```

Combined with the 200-character limit (#5), there is no injection vector left.

---

### #5 — No input validation on writes 🟠 High

**What was wrong** — `broken/components/task-form-broken.tsx` inserted
whatever the input held: empty strings, 5MB pastes, emoji floods. The database
was the only "validator," and it had none.

**Why it matters** — Garbage in, garbage forever: broken layouts, wasted
storage, and a foothold for payload-based attacks.

**How it was fixed** — `src/lib/validations.ts` + `src/app/actions.ts`
A Zod schema validates on the server before any write; the form surfaces
per-field errors inline via `useActionState`:

```ts
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required.")
    .max(200, "Title must be 200 characters or fewer."),
  priority: z.enum(["low", "medium", "high"]),
});
```

The database `CHECK` constraint (`char_length(title) between 1 and 200`)
backs it up at the storage layer.

---

### #6 — No error handling: failures white-screen the app 🟠 High

**What was wrong** — `broken/components/task-form-broken.tsx` had no
try/catch. Any rejected promise propagated and React unmounted the tree: the
user's reward for a failed save was a blank white page and lost input.

**Why it matters** — Users can't distinguish "broken" from "slow," and they
don't come back to find out. Every unhandled rejection is also a potential
information leak in disguise.

**How it was fixed** — `src/app/actions.ts` + `src/app/error.tsx`
Every server action wraps I/O in try/catch and returns a structured
`{ ok, error }` result; forms render the message inline. A route-level error
boundary catches anything unexpected and offers a retry:

```tsx
// error.tsx — friendly fallback, never a white screen
<h1>Something went wrong</h1>
<p>We couldn't load your tasks just now. Your data is safe…</p>
<button onClick={reset}>Try again</button>
```

---

### #7 — No loading states 🟡 Medium

**What was wrong** — `broken/app/tasks-broken/page.tsx` rendered nothing
until the query resolved — blank page on slow connections, with no indication
anything was happening.

**Why it matters** — Perceived performance *is* performance. Blank screens
read as broken; skeletons read as fast.

**How it was fixed** — `src/app/loading.tsx`
A route-level skeleton mirrors the page layout (header, form, list rows) and
shows automatically during navigation and refetch. Interactive mutations show
pending states (`Adding…`, dimmed rows) instead of freezing.

---

### #8 — Real secrets committed to the git repo 🟠 High

**What was wrong** — `broken/lib/supabase-broken.ts` contained the real
project URL and service_role key, committed to git. Secrets in history are
permanent: deleting the file later doesn't remove it from clones, forks, or
the reflog — and scanners harvest GitHub for exactly this.

**Why it matters** — A leaked service_role key is a standing invitation to
total database compromise, and rotation is painful once the key is in the
wild.

**How it was fixed** — `.gitignore` + env-only configuration
`.env*` files are git-ignored from day one; keys exist only in the hosting
provider's environment variables. The rescued codebase contains **zero**
secrets — verified by repo-wide search. (The broken reference key in
`/broken` is a redacted placeholder, not a real credential.)

---

### #9 — Unbounded query: no pagination or limits 🟡 Medium

**What was wrong** — `broken/app/tasks-broken/page.tsx` ran a bare
`.select("*")`. Fine at 12 rows; at 10,000 rows the page ships megabytes of
JSON, blocks rendering, and hammers the database on every visit.

**Why it matters** — This is how prototypes die in production: the demo works,
the launch doesn't. Unbounded queries are a latency and cost cliff.

**How it was fixed** — `src/lib/tasks.ts` + `src/components/task-filters.tsx`
Every read is a bounded, paginated query (`PAGE_SIZE = 8`, `.range()`), with
server-side search and priority filtering so the database — not the browser —
does the work:

```ts
const { data, error, count } = await query
  .order("created_at", { ascending: false })
  .range(from, from + PAGE_SIZE - 1);
```

Pagination state lives in the URL, so pages are shareable and refresh-safe.

---

### #10 — No ownership recorded or enforced on writes 🟡 Medium

**What was wrong** — `broken/components/task-form-broken.tsx` inserted rows
with no `owner_id`. There was no record of whose task was whose — and nothing
stopped one user deleting another's rows.

**Why it matters** — Without ownership, access control is impossible to
retrofit: you can't write a policy around a column that doesn't exist, and
backfilling ownership after launch is guesswork.

**How it was fixed** — `supabase/migrations/001_taskly.sql` + `src/app/actions.ts`
`owner_id` is `NOT NULL` with a default, every write sets it explicitly, and
every mutation re-filters by it — with the RLS policy (#2) as the final
enforcer. Ownership was designed in from row one, not bolted on later.

---

## Rescue checklist (reusable for client work)

Use this on any AI-generated codebase before it goes live:

- [ ] **Secrets audit** — `service_role` / private keys only in server env, never in the client bundle or git history (#1, #8)
- [ ] **RLS on every table** — enabled + policies tested with a second user (#2)
- [ ] **Real auth** — server-verified sessions; no `localStorage` identity (#3)
- [ ] **Output escaping** — no `dangerouslySetInnerHTML` on user data (#4)
- [ ] **Input validation** — schema-validated on the server, mirrored in the UI (#5)
- [ ] **Error boundaries** — every async path has a failure UI; no white screens (#6)
- [ ] **Loading states** — skeletons for routes, pending states for mutations (#7)
- [ ] **Bounded queries** — pagination/limits on every list; no bare `select("*")` (#9)
- [ ] **Ownership by design** — `owner_id` on every user row from migration one (#10)
- [ ] **Verify, don't trust** — test the live deployment as a stranger: second browser, no session, DevTools open

---

*RescueKit — taking AI-generated prototypes to production, one audit at a time.*
