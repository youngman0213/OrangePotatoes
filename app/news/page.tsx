"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { news as mockNews } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";
import type { NewsItem } from "@/types";

const tabs = [
  { label: "전체", value: "all" },
  { label: "경기 프리뷰", value: "match-preview" },
  { label: "경기 리뷰", value: "match-review" },
  { label: "이적/부상", value: "transfer-injury" },
  { label: "인터뷰", value: "interview" },
  { label: "구단 행정", value: "club-admin" },
  { label: "기타", value: "other" }
];

export default function NewsPage() {
  const [category, setCategory] = useState("all");
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
      <SectionHeader title="뉴스" eyebrow="Linked Articles" />
      <FilterTabs tabs={tabs} active={category} onChange={setCategory} />
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
