"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

const PRIORITIES = ["all", "low", "medium", "high"] as const;

// Filters + pagination drive the URL so the list is shareable and the
// server always returns a bounded page (finding #9).
export function TaskFilters({
  total,
  page,
  pageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const activePriority = searchParams.get("priority") ?? "all";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.set("page", "1");
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Debounced search — no request storm on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (q !== current) {
        updateParams((p) => {
          if (q.trim()) p.set("q", q.trim());
          else p.delete("q");
        });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [q, searchParams, updateParams]);

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
        />
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Filter by priority">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() =>
                updateParams((params) => {
                  if (p === "all") params.delete("priority");
                  else params.set("priority", p);
                })
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                activePriority === p
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span aria-live="polite">
          {isPending
            ? "Loading…"
            : `${total} task${total === 1 ? "" : "s"} · page ${page} of ${totalPages}`}
        </span>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || isPending}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          ←
        </button>
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || isPending}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
}
