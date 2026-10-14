"use client";

import { useState, useTransition } from "react";
import { toggleTask, deleteTask } from "@/app/actions";
import type { Task } from "@/lib/types";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-700 ring-red-200",
  medium: "bg-amber-100 text-amber-700 ring-amber-200",
  low: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onToggle() {
    setError(null);
    startTransition(async () => {
      const res = await toggleTask(task.id, !task.done);
      if (!res.ok) setError(res.error);
    });
  }

  function onDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
        disabled={isPending}
        aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="h-5 w-5 shrink-0 cursor-pointer accent-indigo-600"
      />
      <div className="min-w-0 flex-1">
        {/* Finding #4 fix: React escapes this by default — no dangerouslySetInnerHTML. */}
        <p
          className={`truncate text-sm font-medium ${
            task.done ? "text-slate-400 line-through" : "text-slate-900"
          }`}
          title={task.title}
        >
          {task.title}
        </p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>
      <button
        onClick={onDelete}
        disabled={isPending}
        aria-label={`Delete "${task.title}"`}
        className="shrink-0 rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        ✕
      </button>
      {error && (
        <p role="alert" className="w-full text-xs text-red-600">
          {error}
        </p>
      )}
    </li>
  );
}
