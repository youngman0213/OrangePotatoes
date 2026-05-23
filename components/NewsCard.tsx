import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/types";
import { formatShortDate } from "@/lib/utils";

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
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-black text-gangwon-orange">
          {categoryLabels[item.category]}
        </span>
        <span className="text-xs font-bold text-slate-400">{formatShortDate(item.publishedAt)}</span>
      </div>
      <h3 className="line-clamp-3 text-base font-black leading-6 text-gangwon-navy">{item.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{item.summary}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-1 text-sm font-black text-slate-700 hover:text-gangwon-orange"
      >
        {item.source}
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    </article>
  );
}
