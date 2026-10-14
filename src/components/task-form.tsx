"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask, initialState } from "@/app/actions";

// Finding #5 fix in the UI: inline field errors, no silent failures.
export function TaskForm() {
  const [state, formAction, isPending] = useActionState(createTask, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const titleErrors = state.fieldErrors?.title;
  const priorityErrors = state.fieldErrors?.priority;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="title" className="sr-only">
            Task title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={200}
            placeholder="What needs doing? e.g. Review the rescue report"
            disabled={isPending}
            aria-invalid={!!titleErrors}
            aria-describedby={titleErrors ? "title-error" : undefined}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
          />
          {titleErrors && (
            <p id="title-error" className="mt-1 text-xs text-red-600">
              {titleErrors.join(" ")}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="priority" className="sr-only">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            disabled={isPending}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 sm:w-auto"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {priorityErrors && (
            <p className="mt-1 text-xs text-red-600">{priorityErrors.join(" ")}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Adding…" : "Add task"}
        </button>
      </div>
      {/* Finding #6 fix: failures surface here as a message, never a white screen. */}
      {!state.ok && state.error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
