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
  title: "\ub274\uc2a4",
  eyebrow: "\uae30\uc0ac \ubaa8\uc74c",
  empty: "\uc870\uac74\uc5d0 \ub9de\ub294 \ub274\uc2a4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  all: "\uc804\uccb4",
  match: "\uacbd\uae30",
  player: "\uc120\uc218",
  transfer: "\uc774\uc801/\ubd80\uc0c1",
  club: "\uad6c\ub2e8"
};

const tabs: Array<{ label: string; value: NewsCategory | "all" }> = [
  { label: labels.all, value: "all" },
  { label: labels.match, value: "match" },
  { label: labels.player, value: "player" },
  { label: labels.transfer, value: "transfer" },
  { label: labels.club, value: "club" }
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
      <SectionHeader title={labels.title} eyebrow={labels.eyebrow} />
      <FilterTabs tabs={tabs} active={category} onChange={(value) => setCategory(value as NewsCategory | "all")} />
      {loading ? (
        <LoadingState />
      ) : filteredNews.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      ) : (
        <EmptyState title={labels.empty} />
      )}
    </div>
  );
}
