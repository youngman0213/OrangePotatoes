"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FilterTabs } from "@/components/FilterTabs";
import { classNames } from "@/lib/utils";
import type { LeaguePlayerStat } from "@/types";

interface PlayerStatsPanelProps {
  stats: LeaguePlayerStat[];
}

type StatKey = "goals" | "assists" | "yellowCards";

const labels = {
  gangwonTitle: "\uac15\uc6d0 \uc120\uc218 \uac1c\uc778\uae30\ub85d",
  leagueTitle: "\ub9ac\uadf8 \uac1c\uc778 \uc21c\uc704",
  loadFailed: "\uac15\uc6d0 \uc120\uc218 \uac1c\uc778\uae30\ub85d\uc744 \ud45c\uc2dc\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
  goals: "\ub4dd\uc810",
  assists: "\ub3c4\uc6c0",
  yellowCards: "\uacbd\uace0",
  goal: "\uace8",
  assist: "\ub3c4\uc6c0",
  card: "\uc7a5",
  count: "\uac1c",
  played: "\ucd9c\uc804",
  games: "\uacbd\uae30",
  empty: "\ud45c\uc2dc\ud560 \uae30\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  gangwonBadge: "\uac15\uc6d0"
};

const gangwonTabs = [
  { label: labels.goals, value: "goals" },
  { label: labels.assists, value: "assists" },
  { label: labels.yellowCards, value: "yellowCards" }
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

export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  const [activeGangwon, setActiveGangwon] = useState<StatKey>("goals");
  const [activeLeague, setActiveLeague] = useState<"goals" | "assists">("goals");
  const gangwonStats = useMemo(() => stats.filter((item) => item.club === "GANGWON"), [stats]);
  const gangwonRows = useMemo(() => getTopRows(gangwonStats, activeGangwon, true), [activeGangwon, gangwonStats]);
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
    <section className="grid gap-5">
      <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100 sm:p-5">
        <StatsHeader eyebrow="Gangwon Player Stats" title={labels.gangwonTitle}>
          <FilterTabs tabs={gangwonTabs} active={activeGangwon} onChange={(value) => setActiveGangwon(value as StatKey)} />
        </StatsHeader>
        <StatsList rows={gangwonRows} valueKey={activeGangwon} highlighted />
      </article>

      <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100 sm:p-5">
        <StatsHeader eyebrow="League Player Rank" title={labels.leagueTitle}>
          <FilterTabs tabs={leagueTabs} active={activeLeague} onChange={(value) => setActiveLeague(value as "goals" | "assists")} />
        </StatsHeader>
        <StatsList rows={leagueRows} valueKey={activeLeague} showClub />
      </article>
    </section>
  );
}

function getTopRows(rows: LeaguePlayerStat[], key: StatKey, includeZero = false) {
  return [...rows]
    .filter((row) => includeZero || row[key] > 0)
    .sort((a, b) => b[key] - a[key] || b.attackPoints - a.attackPoints || b.played - a.played)
    .slice(0, 5);
}

function StatsHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase text-gangwon-orange">{eyebrow}</p>
        <h2 className="text-xl font-black text-gangwon-navy">{title}</h2>
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {rows.map((row, index) => {
        const isGangwon = row.club === "GANGWON" || row.club.includes("\uac15\uc6d0");
        const rowHighlighted = highlighted || (showClub && isGangwon);

        return (
          <div
            key={`${valueKey}-${row.name}-${index}`}
            className={classNames(
              "flex min-w-0 items-center justify-between gap-3 rounded-lg px-4 py-4 ring-1",
              rowHighlighted ? "bg-orange-50 ring-orange-100" : "bg-slate-50 ring-transparent"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={classNames(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black",
                rowHighlighted ? "bg-gangwon-orange text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              )}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-black text-slate-900">{row.name}</p>
                  {showClub && isGangwon ? <span className="shrink-0 rounded-full bg-gangwon-orange px-2 py-0.5 text-[10px] font-black text-white">{labels.gangwonBadge}</span> : null}
                </div>
                <p className="mt-1 truncate text-xs font-bold text-slate-400">
                  {showClub ? row.club : `${labels.played} ${row.played || "-"}${labels.games}`}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-black text-slate-400">{statLabelMap[valueKey]}</p>
              <p className="text-xl font-black text-gangwon-orange">{Number(row[valueKey] ?? 0)}<span className="text-sm">{suffixMap[valueKey]}</span></p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
