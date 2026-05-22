"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/types";

interface VideosResponse {
  highlights?: Video[];
  clubVideos?: Video[];
  error?: string;
}

export default function VideosPage() {
  const [highlights, setHighlights] = useState<Video[]>([]);
  const [clubVideos, setClubVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((response) => response.json())
      .then((data: VideosResponse) => {
        setHighlights(data.highlights ?? []);
        setClubVideos(data.clubVideos ?? []);
        setError(data.error ?? "");
      })
      .catch(() => setError("영상을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6">
        <SectionHeader title="영상" eyebrow="영상 모음" />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section>
        <SectionHeader title="하이라이트" eyebrow="쿠팡플레이 스포츠" />
        {highlights.length ? (
          <VideoGrid videos={highlights} />
        ) : (
          <EmptyState title={error || "표시할 하이라이트 영상이 없습니다."} />
        )}
      </section>

      <section>
        <SectionHeader title="구단 유튜브" eyebrow="강원FC 공식 채널" />
        {clubVideos.length ? (
          <VideoGrid videos={clubVideos} />
        ) : (
          <EmptyState title={error || "표시할 구단 영상이 없습니다."} />
        )}
      </section>
    </div>
  );
}

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => <VideoCard key={video.id} video={video} />)}
    </div>
  );
}
