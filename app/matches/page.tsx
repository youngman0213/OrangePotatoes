"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { matches } from "@/data/mock";
import { getMatchMonth, sortByDateAsc } from "@/lib/utils";

export default function MatchesPage() {
  const months = Array.from(new Set(matches.map((match) => getMatchMonth(match.date))));
  const [month, setMonth] = useState("all");
  const [venue, setVenue] = useState("all");
  const filteredMatches = useMemo(
    () =>
      sortByDateAsc(matches).filter((match) => {
        const monthMatch = month === "all" || getMatchMonth(match.date) === month;
        const venueMatch = venue === "all" || (venue === "home" ? match.isHome : !match.isHome);
        return monthMatch && venueMatch;
      }),
    [month, venue]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title="경기 일정/결과" eyebrow="Fixtures & Results" />
      <div className="grid gap-3">
        <FilterTabs tabs={[{ label: "전체", value: "all" }, ...months.map((item) => ({ label: item, value: item }))]} active={month} onChange={setMonth} />
        <FilterTabs tabs={[{ label: "전체", value: "all" }, { label: "홈", value: "home" }, { label: "원정", value: "away" }]} active={venue} onChange={setVenue} />
      </div>
      {filteredMatches.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      ) : (
        <EmptyState title="조건에 맞는 경기가 없습니다." />
      )}
    </div>
  );
}
