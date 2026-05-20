"use client";

import { useMemo, useState } from "react";
import { FilterTabs } from "@/components/FilterTabs";
import type { Standing } from "@/types";
import { classNames, isGangwon } from "@/lib/utils";

const tabs = [
  { label: "\ud300 \uc21c\uc704", value: "points" },
  { label: "\ud300 \ub4dd\uc810", value: "goalsFor" },
  { label: "\ud300 \uc2e4\uc810", value: "goalsAgainst" }
];

const labels = {
  title: "\ud300 \uc9c0\ud45c",
  points: "\uc2b9\uc810",
  goalsFor: "\ub4dd\uc810",
  goalsAgainst: "\uc2e4\uc810",
  played: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328"
};

export function TeamRankTabs({ standings }: { standings: Standing[] }) {
  const [active, setActive] = useState<"points" | "goalsFor" | "goalsAgainst">("points");
  const rows = useMemo(() => {
    const sorted = [...standings].sort((a, b) => {
      if (active === "goalsAgainst") return a.goalsAgainst - b.goalsAgainst;
      return b[active] - a[active];
    });

    return sorted.slice(0, 12);
  }, [active, standings]);

  return (
    <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-gangwon-navy">{labels.title}</h2>
        <FilterTabs tabs={tabs} active={active} onChange={(value) => setActive(value as typeof active)} />
      </div>
      <div className="grid gap-2">
        {rows.map((row, index) => (
          <div key={`${active}-${row.team}`} className={classNames("flex items-center justify-between gap-3 rounded-lg px-4 py-3", isGangwon(row.team) ? "bg-orange-50 ring-1 ring-orange-100" : "bg-slate-50")}>
            <div className="flex min-w-0 items-center gap-3">
              <span className={classNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black", isGangwon(row.team) ? "bg-gangwon-orange text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className={classNames("truncate font-black", isGangwon(row.team) ? "text-gangwon-orange" : "text-slate-900")}>{row.team}</p>
                <p className="text-xs font-bold text-slate-400">
                  {row.played}{labels.played} {row.wins}{labels.wins} {row.draws}{labels.draws} {row.losses}{labels.losses}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-gangwon-orange ring-1 ring-orange-100">
              {row[active]}{labels[active]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
