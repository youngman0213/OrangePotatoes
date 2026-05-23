"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FilterTabs } from "@/components/FilterTabs";
import { classNames, isGangwon } from "@/lib/utils";
import type { GangwonPlayerRating } from "@/lib/kleague/types";
import type { LeaguePlayerStat } from "@/types";

interface PlayerStatsPanelProps {
  stats: LeaguePlayerStat[];
  ratings?: GangwonPlayerRating[];
  ratingsError?: boolean;
}

type StatKey = "goals" | "assists" | "yellowCards";
type GangwonTabKey = StatKey | "averageRating";

const labels = {
  gangwonTitle: "강원 선수 개인기록",
  leagueTitle: "리그 개인 순위",
  ratingTitle: "평균평점",
  ratingEyebrow: "K리그 공식 경기 평점 기반 평균",
  ratingDescription: "경기별 선수 평점을 누적해 계산한 팬사이트 자체 평균입니다.",
  ratingFailed: "평점 데이터를 불러오지 못했습니다.",
  ratingMatches: "반영",
  latestRating: "최근",
  loadFailed: "강원 선수 개인기록을 표시할 수 없습니다.",
  goals: "득점",
  assists: "도움",
  yellowCards: "경고",
  goal: "골",
  assist: "도움",
  card: "장",
  count: "개",
  played: "출전",
  games: "경기",
  empty: "표시할 기록이 없습니다.",
  gangwonBadge: "강원"
};

const gangwonTabs = [
  { label: labels.goals, value: "goals" },
  { label: labels.assists, value: "assists" },
  { label: labels.yellowCards, value: "yellowCards" },
  { label: labels.ratingTitle, value: "averageRating" }
];

const leagueTabs = [
  { label: labels.goals, value: "goals" },
  { label: labels.assists, value: "assists" }
];

const suffixMap: Record<StatKey, string> = {
  goals: labels.goal,
  assists: labels.count,
  yellowCards: labels.card
};

const statLabelMap: Record<StatKey, string> = {
  goals: labels.goals,
  assists: labels.assists,
  yellowCards: labels.yellowCards
};

export function PlayerStatsPanel({ stats, ratings = [], ratingsError = false }: PlayerStatsPanelProps) {
  const [activeGangwon, setActiveGangwon] = useState<GangwonTabKey>("goals");
  const [activeLeague, setActiveLeague] = useState<"goals" | "assists">("goals");
  const gangwonStats = useMemo(() => stats.filter((item) => isGangwon(item.club)), [stats]);
  const gangwonRows = useMemo(() => activeGangwon === "averageRating" ? [] : getTopRows(gangwonStats, activeGangwon, true), [activeGangwon, gangwonStats]);
  const leagueRows = useMemo(() => getTopRows(stats, activeLeague), [activeLeague, stats]);

  if (!stats.length) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
        <h2 className="text-lg font-black text-gangwon-navy">{labels.gangwonTitle}</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">{labels.loadFailed}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 sm:gap-5">
      <article className="rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100 sm:p-5">
        <StatsHeader eyebrow={labels.gangwonTitle} title={labels.gangwonTitle} hideTitle>
          <FilterTabs tabs={gangwonTabs} active={activeGangwon} onChange={(value) => setActiveGangwon(value as GangwonTabKey)} />
        </StatsHeader>
        {activeGangwon === "averageRating" ? (
          <RatingPanel ratings={ratings} hasError={ratingsError} />
        ) : (
          <StatsList rows={gangwonRows} valueKey={activeGangwon} highlighted />
        )}
      </article>

      <article className="rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100 sm:p-5">
        <StatsHeader eyebrow={labels.leagueTitle} title={labels.leagueTitle} hideTitle>
          <FilterTabs tabs={leagueTabs} active={activeLeague} onChange={(value) => setActiveLeague(value as "goals" | "assists")} />
        </StatsHeader>
        <StatsList rows={leagueRows} valueKey={activeLeague} showClub />
      </article>
    </section>
  );
}

function RatingPanel({ ratings, hasError }: { ratings: GangwonPlayerRating[]; hasError: boolean }) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-xs font-black uppercase text-gangwon-orange">{labels.ratingEyebrow}</p>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-400">{labels.ratingDescription}</p>
      </div>

      {hasError ? (
        <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500">{labels.ratingFailed}</p>
      ) : ratings.length ? (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
          {ratings.map((row) => (
            <div key={row.playerKey} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-orange-50 px-3 py-3 ring-1 ring-orange-100 sm:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gangwon-orange text-xs font-black text-white sm:h-9 sm:w-9 sm:text-sm">
                  {row.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-black text-slate-900 sm:text-base">{row.playerName}</p>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-500 ring-1 ring-orange-100">
                      {row.number} / {row.position}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {labels.ratingMatches} {row.ratingMatches}경기 · {labels.latestRating} {formatRating(row.latestRating)}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-black text-slate-400">{labels.ratingTitle}</p>
                <p className="text-lg font-black text-gangwon-orange sm:text-xl">{formatRating(row.averageRating)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500">{labels.ratingFailed}</p>
      )}
    </div>
  );
}

function getTopRows(rows: LeaguePlayerStat[], key: StatKey, includeZero = false) {
  return [...rows]
    .filter((row) => includeZero || row[key] > 0)
    .sort((a, b) => b[key] - a[key] || b.attackPoints - a.attackPoints || b.played - a.played)
    .slice(0, 5);
}

function formatRating(value: number) {
  return value.toFixed(2);
}

function StatsHeader({ eyebrow, title, children, hideTitle = false }: { eyebrow: string; title: string; children: ReactNode; hideTitle?: boolean }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div>
        <p className="text-xs font-black uppercase text-gangwon-orange">{eyebrow}</p>
        {hideTitle ? null : <h2 className="text-lg font-black text-gangwon-navy sm:text-xl">{title}</h2>}
      </div>
      {children}
    </div>
  );
}

function StatsList({
  rows,
  valueKey,
  highlighted = false,
  showClub = false
}: {
  rows: LeaguePlayerStat[];
  valueKey: StatKey;
  highlighted?: boolean;
  showClub?: boolean;
}) {
  if (!rows.length) {
    return <p className="rounded-lg bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">{labels.empty}</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
      {rows.map((row, index) => {
        const gangwonClub = isGangwon(row.club);
        const rowHighlighted = highlighted || (showClub && gangwonClub);

        return (
          <div
            key={`${valueKey}-${row.name}-${index}`}
            className={classNames(
              "flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-3 ring-1 sm:px-4 sm:py-4",
              rowHighlighted ? "bg-orange-50 ring-orange-100" : "bg-slate-50 ring-transparent"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={classNames(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-9 sm:w-9 sm:text-sm",
                rowHighlighted ? "bg-gangwon-orange text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              )}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-black text-slate-900 sm:text-base">{row.name}</p>
                  {showClub ? (
                    <span className={classNames(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black",
                      gangwonClub ? "bg-gangwon-orange text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"
                    )}>
                      {gangwonClub ? labels.gangwonBadge : row.club}
                    </span>
                  ) : null}
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-400 ring-1 ring-slate-200">
                    {row.played || "-"}{labels.games}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-black text-slate-400">{statLabelMap[valueKey]}</p>
              <p className="text-lg font-black text-gangwon-orange sm:text-xl">{Number(row[valueKey] ?? 0)}<span className="text-sm">{suffixMap[valueKey]}</span></p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
