import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/types";
import { formatShortDate } from "@/lib/utils";

const categoryLabels: Record<NewsItem["category"], string> = {
  "match-preview": "경기 프리뷰",
  "match-review": "경기 리뷰",
  "transfer-injury": "이적/부상",
  interview: "인터뷰",
  "club-admin": "구단 행정",
  other: "기타"
};

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-gangwon-orange">{categoryLabels[item.category]}</span>
        <span className="text-xs font-bold text-slate-400">{formatShortDate(item.publishedAt)}</span>
      </div>
      <h3 className="line-clamp-3 text-base font-black leading-6 text-gangwon-navy">{item.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{item.summary}</p>
      <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-black text-slate-700 hover:text-gangwon-orange">
        {item.source}
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    </article>
  );
}
