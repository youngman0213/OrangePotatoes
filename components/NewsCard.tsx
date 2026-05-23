import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/types";

const categoryLabels: Record<NewsItem["category"], string> = {
  match: "경기",
  player: "선수",
  transfer: "이적",
  injury: "부상",
  interview: "인터뷰",
  preview: "프리뷰",
  review: "리뷰",
  club: "구단",
  ticket: "티켓",
  event: "이벤트",
  other: "기타"
};

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-black text-gangwon-orange">
          {categoryLabels[item.category]}
        </span>
        <span className="text-xs font-bold text-slate-400">{formatNewsDate(item.publishedAt)}</span>
      </div>
      <h3 className="line-clamp-2 text-base font-black leading-6 text-gangwon-navy">{item.title}</h3>
      <p className="mt-2 hidden text-sm leading-6 text-slate-500 sm:line-clamp-2 sm:block">{item.summary}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="truncate text-xs font-black text-slate-500">{item.source}</span>
        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-gangwon-orange">
          원문 보기
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function formatNewsDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date)).replace(/\.$/, "").replace(/\s/g, "");
}
