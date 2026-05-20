"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import { videos as mockVideos } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";
import type { Video } from "@/types";

const tabs = [
  { label: "전체", value: "all" },
  { label: "하이라이트", value: "highlight" },
  { label: "인터뷰", value: "interview" },
  { label: "훈련", value: "training" },
  { label: "비하인드", value: "behind" },
  { label: "기타", value: "other" }
];

export default function VideosPage() {
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState<Video[]>(mockVideos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((response) => response.json())
      .then((data: { items?: Video[] }) => {
        if (data.items?.length) setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredVideos = useMemo(
    () => sortByPublishedDesc(items).filter((video) => category === "all" || video.category === category),
    [category, items]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title="영상" eyebrow="YouTube" />
      <FilterTabs tabs={tabs} active={category} onChange={setCategory} />
      {loading ? (
        <LoadingState />
      ) : filteredVideos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      ) : (
        <EmptyState title="조건에 맞는 영상이 없습니다." />
      )}
    </div>
  );
}
