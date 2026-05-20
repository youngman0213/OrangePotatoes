"use client";

import { useMemo, useState } from "react";
import { FilterTabs } from "@/components/FilterTabs";
import type { LeaguePlayerStat } from "@/types";

interface PlayerStatsPanelProps {
  stats: LeaguePlayerStat[];
}

const labels = {
  title: "\uac15\uc6d0 \uc120\uc218 \uac1c\uc778\uae30\ub85d",
  loadFailed: "\uac15\uc6d0 \uc120\uc218 \uac1c\uc778\uae30\ub85d\uc744 \ud45c\uc2dc\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
  goals: "\ub4dd\uc810",
  assists: "\ub3c4\uc6c0",
  yellowCards: "\uacbd\uace0",
  goal: "\uace8",
  assist: "\ub3c4\uc6c0",
  card: "\uc7a5",
  played: "\ucd9c\uc804",
  games: "\uacbd\uae30",
  empty: "\ud45c\uc2dc\ud560 \uae30\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."
};

const tabs = [
  { label: labels.goals, value: "goals" },
  { label: labels.assists, value: "assists" },
  { label: labels.yellowCards, value: "yellowCards" }
];

const suffixMap = {
  goals: labels.goal,
  assists: labels.assist,
  yellowCards: labels.card
};

export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  const [active, setActive] = useState<"goals" | "assists" | "yellowCards">("goals");
  const gangwonStats = useMemo(() => stats.filter((item) => item.club === "GANGWON"), [stats]);
  const rows = useMemo(
    () =>
      [...gangwonStats]
        .filter((row) => row[active] > 0)
        .sort((a, b) => b[active] - a[active])
        .slice(0, 5),
    [active, gangwonStats]
  );

  if (!gangwonStats.length) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
        <h2 className="text-lg font-black text-gangwon-navy">{labels.title}</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">{labels.loadFailed}</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gangwon-orange">Gangwon Player Stats</p>
          <h2 className="text-xl font-black text-gangwon-navy">{labels.title}</h2>
        </div>
        <FilterTabs tabs={tabs} active={active} onChange={(value) => setActive(value as typeof active)} />
      </div>

      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((row, index) => (
            <div key={`${active}-${row.name}`} className="flex items-center justify-between gap-3 rounded-lg bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gangwon-orange text-sm font-black text-white">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-900">{row.name}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {labels.played} {row.played || "-"}{labels.games}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-gangwon-orange ring-1 ring-orange-100">
                {row[active]}{suffixMap[active]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">{labels.empty}</p>
      )}
    </section>
  );
}
