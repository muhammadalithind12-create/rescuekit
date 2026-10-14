# RescueKit 🛟

**Taking AI-generated prototypes to production — demonstrated, not just claimed.**

RescueKit is a *demonstration* of a vibe-code rescue: a small team task app
("Taskly") built **twice**. First, the deliberately broken version exhibiting
the 10 most common AI-generated-app failures (preserved in `/broken` as a
reference — labeled, never deployed). Then the production rescue: the live,
working app you see when you open the demo.

> **Honest framing:** Taskly is not a real client project. It was constructed
> to show exactly what a professional rescue audit looks like — the same
> format delivered to real clients.

## What's here

| Path | What it is |
|------|------------|
| `src/` | The **rescued app** — production-grade Next.js 16 + Supabase task board |
| `broken/` | The **deliberate failures** — 4 files, each tagged with its finding number. Do not deploy. |
| `docs/RESCUE-REPORT.md` | ⭐ **The showpiece** — the full audit report: executive summary, 10 findings with severity ratings, fixes, and a reusable rescue checklist |
| `supabase/migrations/001_taskly.sql` | Tasks table + Row Level Security + seed data |

## The 10 findings (fixed)

1. 🔴 `service_role` key hardcoded and shipped client-side
2. 🔴 No Row Level Security — any visitor reads/writes all data
3. 🔴 Fake authentication via `localStorage`
4. 🟠 Stored XSS via `dangerouslySetInnerHTML` on task titles
5. 🟠 No input validation on writes
6. 🟠 No error handling — failures white-screen the app
7. 🟡 No loading states
8. 🟠 Real secrets committed to the git repo
9. 🟡 Unbounded query — no pagination or limits
10. 🟡 No ownership recorded or enforced on writes

Full detail in [`docs/RESCUE-REPORT.md`](docs/RESCUE-REPORT.md).

## The rescued app

A clean team task board with:

- Task list with **search, priority filter, and pagination** (bounded queries)
- **Zod-validated** task creation via server actions with inline field errors
- Toggle done / delete with confirmation and graceful failure messages
- **Loading skeletons**, **error boundaries**, and **empty states** throughout
- **RLS-enforced** data access — the anon key can only touch the demo owner's rows
- No login wall: runs on a documented demo identity so visitors can try it instantly (production path = wire Supabase Auth, swap one line in the RLS policy)

## Setup

```bash
npm install
```

Create `.env.local` (never commit it):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the migration in your Supabase project's SQL editor:

```
supabase/migrations/001_taskly.sql
```

Then:

```bash
npm run dev
```

The migration seeds demo tasks, so the board is useful on first load.

## Tech stack

Next.js 16 · React 19 · TypeScript · Supabase (PostgreSQL + RLS) · Tailwind CSS v4 · Zod

## Attribution

All code in this repository is **original**, written for this demonstration.
No starter or third-party application code was used. Inspired by real rescue
engagements on AI-generated codebases.
