"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { ExternalImage } from "@/components/ExternalImage";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`;

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
      <div className="relative aspect-video bg-slate-100">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setIsPlaying(true)} className="group block h-full w-full text-left">
            <ExternalImage src={video.thumbnailUrl} />
            <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">{videoCategoryLabels[video.category]}</span>
            <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-gangwon-orange text-white shadow-lg transition group-hover:scale-105">
              <Play size={22} fill="currentColor" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="mb-2 text-xs font-bold text-slate-400">
          {formatShortDate(video.publishedAt)}{video.channelTitle ? ` / ${video.channelTitle}` : ""}
        </p>
        <h3 className="line-clamp-2 text-base font-black text-gangwon-navy">{video.title}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setIsPlaying(true)} className="inline-flex items-center gap-1 text-sm font-black text-gangwon-orange">
            재생하기
            <Play size={15} fill="currentColor" aria-hidden="true" />
          </button>
          <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-black text-slate-700 hover:text-gangwon-orange">
            유튜브로 보기
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
