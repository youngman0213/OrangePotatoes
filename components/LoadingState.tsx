export function LoadingState({ message = "정보를 불러오는 중입니다." }: { message?: string }) {
  return (
    <div className="grid gap-3">
      <p className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-card ring-1 ring-slate-100">
        {message}
      </p>
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-lg bg-white shadow-card ring-1 ring-slate-100" />
      ))}
    </div>
  );
}
