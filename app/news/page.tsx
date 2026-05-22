"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { news as mockNews } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";
import type { NewsCategory, NewsItem } from "@/types";

const tabs: Array<{ label: string; value: NewsCategory | "all" }> = [
  { label: "전체", value: "all" },
  { label: "경기", value: "match" },
  { label: "선수/이적", value: "player" },
  { label: "구단", value: "club" }
];

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [items, setItems] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((response) => response.json())
      .then((data: { items?: NewsItem[] }) => {
        if (data.items?.length) setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = useMemo(
    () => sortByPublishedDesc(items).filter((item) => category === "all" || item.category === category),
    [category, items]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title="뉴스" eyebrow="기사 모음" />
      <FilterTabs tabs={tabs} active={category} onChange={(value) => setCategory(value as NewsCategory | "all")} />
      {loading ? (
        <LoadingState />
      ) : filteredNews.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      ) : (
        <EmptyState title="조건에 맞는 뉴스가 없습니다." />
      )}
    </div>
  );
}
