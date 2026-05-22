import { ExternalLink } from "lucide-react";
import type { ClubPost } from "@/types";
import { formatShortDate } from "@/lib/utils";

const platformLabels: Record<ClubPost["platform"], string> = {
  official: "공지",
  instagram: "인스타그램",
  youtube: "유튜브",
  facebook: "페이스북",
  ticket: "티켓",
  md: "MD",
  event: "이벤트"
};

export function ClubPostCard({ post }: { post: ClubPost }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-gangwon-navy px-3 py-1 text-xs font-black text-white">{platformLabels[post.platform]}</span>
        <span className="text-xs font-bold text-slate-400">{formatShortDate(post.publishedAt)}</span>
      </div>
      <h3 className="text-base font-black text-gangwon-navy">{post.title}</h3>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-bold text-gangwon-orange">{post.type}</span>
        <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-black text-slate-600 hover:text-gangwon-orange">
          바로가기
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
