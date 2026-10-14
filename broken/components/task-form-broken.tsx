// ❌ BROKEN (deliberate demo) — see docs/RESCUE-REPORT.md #5, #6, #10
//
// What's wrong here:
//   #5  — No input validation: empty titles, 5MB strings, anything is written
//         to the database.
//   #6  — No error handling: if the insert throws, the exception propagates and
//         React unmounts the tree → white screen of death.
//   #10 — No ownership on writes: the row is inserted with no owner_id, so
//         there is no way to know whose task it is — and no policy stops one
//         user deleting another user's rows.

"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase-broken";

export function BrokenTaskForm() {
  const [title, setTitle] = useState("");

  async function submit() {
    // ❌ #5: no validation at all.
    // ❌ #10: no owner attached to the write.
    // ❌ #6: no try/catch — a failure here white-screens the app.
    await supabase.from("tasks").insert({ title });
    setTitle("");
    window.location.reload(); // ❌ full page reload instead of updating state
  }

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task"
      />
      <button onClick={submit}>Add</button>
    </div>
  );
}
