"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/types";

interface VideosResponse {
  highlights?: Video[];
  clubVideos?: Video[];
  error?: string;
}

type VideoTab = "highlights" | "club";

const tabs = [
  { label: "하이라이트", value: "highlights" },
  { label: "구단 유튜브", value: "club" }
];

const labels = {
  title: "영상",
  eyebrow: "영상 모음",
  loadFailed: "영상을 불러오지 못했습니다.",
  noHighlights: "표시할 하이라이트 영상이 없습니다.",
  noClubVideos: "표시할 구단 영상이 없습니다."
};

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<VideoTab>("highlights");
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
      .catch(() => setError(labels.loadFailed))
      .finally(() => setLoading(false));
  }, []);

  const activeVideos = useMemo(
    () => activeTab === "highlights" ? highlights : clubVideos,
    [activeTab, clubVideos, highlights]
  );
  const emptyText = error || (activeTab === "highlights" ? labels.noHighlights : labels.noClubVideos);

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow={labels.eyebrow} />
      <FilterTabs tabs={tabs} active={activeTab} onChange={(value) => setActiveTab(value as VideoTab)} />

      {loading ? (
        <LoadingState />
      ) : activeVideos.length ? (
        <VideoGrid videos={activeVideos} />
      ) : (
        <EmptyState title={emptyText} />
      )}
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
