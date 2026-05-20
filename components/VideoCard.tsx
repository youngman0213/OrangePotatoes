import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import type { Video } from "@/types";
import { formatShortDate } from "@/lib/utils";

const videoCategoryLabels: Record<Video["category"], string> = {
  highlight: "하이라이트",
  interview: "인터뷰",
  training: "훈련",
  behind: "비하인드",
  other: "기타"
};

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
      <div className="relative aspect-video bg-slate-100">
        <Image src={video.thumbnailUrl} alt="" fill sizes="(min-width: 768px) 320px, 100vw" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">{videoCategoryLabels[video.category]}</span>
        <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-gangwon-orange text-white shadow-lg">
          <Play size={22} fill="currentColor" aria-hidden="true" />
        </span>
      </div>
      <div className="p-4">
        <p className="mb-2 text-xs font-bold text-slate-400">{formatShortDate(video.publishedAt)}</p>
        <h3 className="line-clamp-2 text-base font-black text-gangwon-navy">{video.title}</h3>
        <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-slate-700 hover:text-gangwon-orange">
          YouTube
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
