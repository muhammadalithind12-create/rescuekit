"use client";

// Finding #6 fix: route-level error boundary. A failed query renders this
// friendly fallback with a retry — never a white screen of death.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
        <p className="text-4xl" aria-hidden="true">
          ⚠️
        </p>
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
          We couldn&apos;t load your tasks just now. Your data is safe — this is
          usually a temporary connection issue.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mx-auto mt-4 max-w-full overflow-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-red-300">
            {error.message}
          </pre>
        )}
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
