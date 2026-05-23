import { SearchX } from "lucide-react";

export function EmptyState({
  title = "표시할 정보가 없습니다.",
  action
}: {
  title?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-lg bg-white p-8 text-center shadow-card ring-1 ring-slate-100">
      <SearchX className="mx-auto mb-3 text-slate-300" size={34} aria-hidden="true" />
      <p className="font-bold text-slate-600">{title}</p>
      {action ? (
        <a
          href={action.href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 hover:bg-gangwon-orange hover:text-white"
        >
          {action.label}
        </a>
      ) : null}
    </div>
  );
}
