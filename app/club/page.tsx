"use client";

import { useEffect, useMemo, useState } from "react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { SectionHeader } from "@/components/SectionHeader";
import { clubPosts as mockClubPosts } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";
import type { ClubPost } from "@/types";

const tabs = [
  { label: "전체", value: "all" },
  { label: "공식 홈페이지", value: "official" },
  { label: "인스타그램", value: "instagram" },
  { label: "유튜브", value: "youtube" },
  { label: "페이스북", value: "facebook" },
  { label: "티켓", value: "ticket" },
  { label: "MD", value: "md" },
  { label: "이벤트", value: "event" }
];

export default function ClubPage() {
  const [platform, setPlatform] = useState("all");
  const [items, setItems] = useState<ClubPost[]>(mockClubPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/club-posts")
      .then((response) => response.json())
      .then((data: { items?: ClubPost[] }) => {
        if (data.items?.length) setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(
    () => sortByPublishedDesc(items).filter((post) => platform === "all" || post.platform === platform),
    [platform, items]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title="구단 소식" eyebrow="Official Channels" />
      <FilterTabs tabs={tabs} active={platform} onChange={setPlatform} />
      {loading ? (
        <LoadingState />
      ) : filteredPosts.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => <ClubPostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <EmptyState title="조건에 맞는 구단 소식이 없습니다." />
      )}
    </div>
  );
}
