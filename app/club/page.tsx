"use client";

import { useMemo, useState } from "react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { SectionHeader } from "@/components/SectionHeader";
import { clubPosts } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";

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
  const filteredPosts = useMemo(
    () => sortByPublishedDesc(clubPosts).filter((post) => platform === "all" || post.platform === platform),
    [platform]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title="구단 소식" eyebrow="Official Channels" />
      <FilterTabs tabs={tabs} active={platform} onChange={setPlatform} />
      {filteredPosts.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => <ClubPostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <EmptyState title="조건에 맞는 구단 소식이 없습니다." />
      )}
    </div>
  );
}
