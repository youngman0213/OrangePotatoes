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
  title: "경기 일정/결과",
  eyebrow: "경기 정보",
  all: "전체",
  home: "홈",
  away: "원정",
  loading: "경기 정보를 불러오는 중입니다.",
  empty: "표시할 경기 정보가 없습니다.",
  error: "경기 정보를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.",
  official: "K리그 공식 일정 보기"
};

export default function MatchesPage() {
  const [items, setItems] = useState<Match[]>(mockMatches);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());
  const [venue, setVenue] = useState("all");

  useEffect(() => {
    let mounted = true;

    fetch("/api/matches")
      .then((response) => {
        if (!response.ok) throw new Error("matches request failed");
        return response.json();
      })
      .then((data: { items?: Match[] }) => {
        if (!mounted) return;
        if (Array.isArray(data.items) && data.items.length) {
          setItems(data.items);
        }
        setHasError(false);
      })
      .catch(() => {
        if (!mounted) return;
        setHasError(true);
        setItems(mockMatches);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const months = useMemo(
    () =>
      Array.from(new Set(items.map((match) => getMatchMonth(match.date)))).sort(
        (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
      ),
    [items]
  );

  const filteredMatches = useMemo(
    () =>
      sortMatchesForResults(items).filter((match) => {
        const activeMonth = month !== "all" && months.includes(month) ? month : "all";
        const monthMatch = activeMonth === "all" || getMatchMonth(match.date) === activeMonth;
        const venueMatch = venue === "all" || (venue === "home" ? match.isHome : !match.isHome);
        return monthMatch && venueMatch;
      }),
    [items, month, months, venue]
  );

  const activeMonth = month !== "all" && months.includes(month) ? month : "all";

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow={labels.eyebrow} />
      <div className="grid gap-3">
        <FilterTabs tabs={[{ label: labels.all, value: "all" }, ...months.map((item) => ({ label: item, value: item }))]} active={activeMonth} onChange={setMonth} wrap />
        <FilterTabs tabs={[{ label: labels.all, value: "all" }, { label: labels.home, value: "home" }, { label: labels.away, value: "away" }]} active={venue} onChange={setVenue} />
      </div>

      {loading ? (
        <LoadingState message={labels.loading} />
      ) : filteredMatches.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      ) : (
        <EmptyState
          title={hasError ? labels.error : labels.empty}
          action={{ label: labels.official, href: "https://www.kleague.com/schedule.do?leagueId=1" }}
        />
      )}
    </div>
  );
}

function getCurrentMonth() {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric"
  }).format(new Date());
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
