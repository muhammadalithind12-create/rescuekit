import { TaskItem } from "./task-item";
import type { Task } from "@/lib/types";

export function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-4xl" aria-hidden="true">
        {hasQuery ? "🔍" : "📝"}
      </p>
      <h2 className="mt-3 text-base font-semibold text-slate-900">
        {hasQuery ? "No tasks match your search" : "No tasks yet"}
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        {hasQuery
          ? "Try a different keyword or clear the priority filter."
          : "Add your first task above to get started."}
      </p>
    </div>
  );
}

export function TaskList({ tasks, hasQuery }: { tasks: Task[]; hasQuery: boolean }) {
  if (tasks.length === 0) {
    return <EmptyState hasQuery={hasQuery} />;
  }
  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
