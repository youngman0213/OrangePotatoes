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
  { label: "\ud558\uc774\ub77c\uc774\ud2b8", value: "highlights" },
  { label: "\uad6c\ub2e8 \uc720\ud29c\ube0c", value: "club" }
];

const labels = {
  title: "\uc601\uc0c1",
  eyebrow: "\uc601\uc0c1 \ubaa8\uc74c",
  loading: "\uc601\uc0c1\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.",
  loadFailed: "\uc601\uc0c1\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4. \uacf5\uc2dd \ucc44\ub110\uc5d0\uc11c \ud655\uc778\ud574\uc8fc\uc138\uc694.",
  noHighlights: "\ud45c\uc2dc\ud560 \ud558\uc774\ub77c\uc774\ud2b8 \uc601\uc0c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  noClubVideos: "\ud45c\uc2dc\ud560 \uad6c\ub2e8 \uc601\uc0c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  officialYoutube: "\uacf5\uc2dd \uc720\ud29c\ube0c\uc5d0\uc11c \ubcf4\uae30"
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
        <LoadingState message={labels.loading} />
      ) : activeVideos.length ? (
        <VideoGrid videos={activeVideos} />
      ) : (
        <EmptyState
          title={emptyText}
          action={{
            label: labels.officialYoutube,
            href: activeTab === "highlights"
              ? "https://www.youtube.com/@kleaguehighlights/videos"
              : "https://www.youtube.com/@gangwonfc2008/videos"
          }}
        />
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
