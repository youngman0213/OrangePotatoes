export function LoadingState() {
  return (
    <div className="grid gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-lg bg-white shadow-card ring-1 ring-slate-100" />
      ))}
    </div>
  );
}
