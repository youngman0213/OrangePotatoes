"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { matches as mockMatches } from "@/data/mock";
import { getMatchMonth } from "@/lib/utils";
import type { Match } from "@/types";

const labels = {
  title: "\uacbd\uae30 \uc77c\uc815/\uacb0\uacfc",
  eyebrow: "\uacbd\uae30 \uc815\ubcf4",
  empty: "\uc870\uac74\uc5d0 \ub9de\ub294 \uacbd\uae30\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  all: "\uc804\uccb4",
  home: "\ud648",
  away: "\uc6d0\uc815"
};

export default function MatchesPage() {
  const [items, setItems] = useState<Match[]>(mockMatches);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("all");
  const [venue, setVenue] = useState("all");

  const months = useMemo(
    () =>
      Array.from(new Set(items.map((match) => getMatchMonth(match.date)))).sort(
        (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
      ),
    [items]
  );

  useEffect(() => {
    fetch("/api/matches")
      .then((response) => response.json())
      .then((data: { items?: Match[] }) => {
        if (data.items?.length) setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = useMemo(
    () =>
      sortMatchesForResults(items).filter((match) => {
        const monthMatch = month === "all" || getMatchMonth(match.date) === month;
        const venueMatch = venue === "all" || (venue === "home" ? match.isHome : !match.isHome);
        return monthMatch && venueMatch;
      }),
    [items, month, venue]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow={labels.eyebrow} />
      <div className="grid gap-3">
        <FilterTabs tabs={[{ label: labels.all, value: "all" }, ...months.map((item) => ({ label: item, value: item }))]} active={month} onChange={setMonth} />
        <FilterTabs tabs={[{ label: labels.all, value: "all" }, { label: labels.home, value: "home" }, { label: labels.away, value: "away" }]} active={venue} onChange={setVenue} />
      </div>
      {loading ? (
        <LoadingState />
      ) : filteredMatches.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      ) : (
        <EmptyState title={labels.empty} />
      )}
    </div>
  );
}

function sortMatchesForResults(items: Match[]) {
  return [...items].sort((a, b) => {
    if (a.status === "scheduled" && b.status !== "scheduled") return 1;
    if (a.status !== "scheduled" && b.status === "scheduled") return -1;

    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (a.status === "scheduled" && b.status === "scheduled") {
      return aTime - bTime;
    }

    return bTime - aTime;
  });
}
