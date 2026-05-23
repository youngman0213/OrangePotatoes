import { Play } from "lucide-react";
import { ExternalImage } from "@/components/ExternalImage";
import type { Video } from "@/types";

const videoCategoryLabels: Record<Video["category"], string> = {
  highlight: "하이라이트",
  interview: "인터뷰",
  training: "훈련",
  behind: "비하인드",
  other: "기타"
};

export function VideoCard({ video, compact = false }: { video: Video; compact?: boolean }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <article>
        <div className="relative aspect-video bg-slate-100">
          <ExternalImage src={video.thumbnailUrl} />
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-black text-white">{videoCategoryLabels[video.category]}</span>
          <span className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-gangwon-orange text-white shadow-lg transition group-hover:scale-105">
            <Play size={20} fill="currentColor" aria-hidden="true" />
          </span>
        </div>
        <div className={compact ? "p-3" : "p-4"}>
          <h3 className="line-clamp-2 text-sm font-black leading-6 text-gangwon-navy sm:text-base">{video.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="truncate">{video.channelTitle || "YouTube"}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{formatVideoDate(video.publishedAt)}</span>
          </div>
        </div>
      </article>
    </a>
  );
}

function formatVideoDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date)).replace(/\.$/, "").replace(/\s/g, "");
}
