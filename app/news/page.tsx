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

const labels = {
  title: "뉴스",
  eyebrow: "기사 모음",
  loading: "뉴스를 불러오는 중입니다.",
  empty: "조건에 맞는 뉴스가 없습니다.",
  error: "뉴스를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.",
  all: "전체",
  match: "경기",
  player: "선수·이적",
  club: "구단"
};

const tabs: Array<{ label: string; value: NewsCategory | "all" }> = [
  { label: labels.all, value: "all" },
  { label: labels.match, value: "match" },
  { label: labels.player, value: "player" },
  { label: labels.club, value: "club" }
];

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [items, setItems] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((response) => {
        if (!response.ok) throw new Error("news request failed");
        return response.json();
      })
      .then((data: { items?: NewsItem[] }) => {
        if (data.items?.length) setItems(data.items);
        setHasError(false);
      })
      .catch(() => {
        setItems(mockNews);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = useMemo(
    () => sortByPublishedDesc(items).filter((item) => category === "all" || item.category === category),
    [category, items]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow={labels.eyebrow} />
      <FilterTabs tabs={tabs} active={category} onChange={(value) => setCategory(value as NewsCategory | "all")} />
      {loading ? (
        <LoadingState message={labels.loading} />
      ) : filteredNews.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      ) : (
        <EmptyState title={hasError ? labels.error : labels.empty} />
      )}
    </div>
  );
}
