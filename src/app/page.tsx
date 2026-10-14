import { Suspense } from "react";
import { getTasks } from "@/lib/tasks";
import { PAGE_SIZE, PRIORITIES } from "@/lib/constants";
import { TaskForm } from "@/components/task-form";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";

// Always render on the server at request time — never a stale prerender.
export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  priority?: string;
  page?: string;
}

function parseParams(sp: SearchParams) {
  const q = (sp.q ?? "").trim().slice(0, 100);
  const priority = (PRIORITIES as readonly string[]).includes(sp.priority ?? "")
    ? (sp.priority as string)
    : "all";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  return { q, priority, page };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, priority, page } = parseParams(await searchParams);
  const { tasks, total } = await getTasks({ q, priority, page });
  const hasQuery = q.length > 0 || priority !== "all";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Rescued by RescueKit — production build
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Taskly
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          A team task board, rebuilt the right way: RLS, validation, error
          handling, and clean UX.{" "}
          <a
            href="https://github.com/muhammadalithind12-create/rescuekit/blob/main/docs/RESCUE-REPORT.md"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
          >
            Read the rescue report →
          </a>
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <TaskForm />
        <Suspense fallback={<div className="h-10" aria-hidden="true" />}>
          <TaskFilters total={total} page={page} pageSize={PAGE_SIZE} />
        </Suspense>
        <TaskList tasks={tasks} hasQuery={hasQuery} />
      </div>

      <footer className="mt-10 text-center text-xs text-slate-400">
        Demo runs on a shared demo identity — no sign-up needed. In production
        this wires to Supabase Auth; RLS policies already enforce owner-only access.
      </footer>
    </main>
  );
}
