import type { NewsItem } from "@/types";

const categoryLabels: Record<NewsItem["category"], string> = {
  match: "경기",
  player: "선수·이적",
  transfer: "선수·이적",
  injury: "선수·이적",
  interview: "선수·이적",
  preview: "경기",
  review: "경기",
  club: "구단",
  ticket: "구단",
  event: "구단",
  other: "전체"
};

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-orange-100"
    >
      <article>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-black text-gangwon-orange">
            {categoryLabels[item.category]}
          </span>
          <span className="text-xs font-bold text-slate-400">{formatNewsDate(item.publishedAt)}</span>
        </div>
        <h3 className="line-clamp-2 text-base font-black leading-6 text-gangwon-navy">{item.title}</h3>
        <p className="mt-2 hidden text-sm leading-6 text-slate-500 sm:line-clamp-2 sm:block">{item.summary}</p>
        <p className="mt-4 truncate text-xs font-black text-slate-500">{item.source}</p>
      </article>
    </a>
  );
}

function formatNewsDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date)).replace(/\.$/, "").replace(/\s/g, "");
}
