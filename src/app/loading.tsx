// Finding #7 fix: route-level loading skeleton — visitors never stare at
// a blank page while data loads.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10" aria-busy="true" aria-label="Loading tasks">
      <div className="mb-8 text-center">
        <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mx-auto mt-3 h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="mx-auto mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </main>
  );
}
