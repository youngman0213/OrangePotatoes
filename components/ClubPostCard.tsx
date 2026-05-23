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
    <a
      href={post.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-orange-100"
    >
      <article>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-gangwon-navy px-3 py-1 text-xs font-black text-white">{platformLabels[post.platform]}</span>
          <span className="text-xs font-bold text-slate-400">{formatShortDate(post.publishedAt)}</span>
        </div>
        <h3 className="text-base font-black text-gangwon-navy">{post.title}</h3>
        <p className="mt-4 text-sm font-bold text-gangwon-orange">{post.type}</p>
      </article>
    </a>
  );
}
