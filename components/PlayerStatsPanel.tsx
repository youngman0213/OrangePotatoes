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
  teamGoalsFor?: number;
}

type StatKey = "goals" | "assists" | "attackPoints" | "yellowCards" | "bestEleven" | "mom";
type GangwonTabKey = "summary" | StatKey | "averageRating";
type TopCard = {
  title: string;
  primary: string;
  secondary?: string;
  tab?: GangwonTabKey;
};

const labels = {
  gangwonTitle: "\uac15\uc6d0 \uc120\uc218 \uac1c\uc778\uae30\ub85d",
  leagueTitle: "\ub9ac\uadf8 \uac1c\uc778 \uc21c\uc704",
  ratingTitle: "\ud3c9\uade0\ud3c9\uc810",
  ratingFailed: "\ud3c9\uc810 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
  loadFailed: "\uac15\uc6d0 \uc120\uc218 \uac1c\uc778\uae30\ub85d\uc744 \ud45c\uc2dc\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
  summary: "\uc694\uc57d",
  goals: "\ub4dd\uc810",
  assists: "\ub3c4\uc6c0",
  attackPoints: "\uacf5\uaca9P",
  yellowCards: "\uacbd\uace0",
  bestEleven: "\ubca0\uc2a4\ud2b811",
  mom: "MOM",
  goal: "\uace8",
  card: "\uc7a5",
  times: "\ud68c",
  count: "\uac1c",
  point: "P",
  games: "\uacbd\uae30",
  empty: "\ud45c\uc2dc\ud560 \uae30\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  gangwonBadge: "\uac15\uc6d0",
  topTitle: "\uac15\uc6d0 \ub9ac\uadf8 TOP \uae30\ub85d",
  scoringDuo: "\uac15\uc6d0 \uacf5\uaca9 \ub4c0\uc624",
  scoringTop: "\ub4dd\uc810 TOP10",
  recognized: "\ub9ac\uadf8\uac00 \uc778\uc815\ud55c \uac15\uc6d0",
  ratingTop: "\ud3c9\uade0\ud3c9\uc810",
  combinedGoals: "\ud569\uc0b0",
  teamGoalsShare: "\ud300 \ub4dd\uc810\uc758",
  bestElevenTotal: "\ubca0\uc2a4\ud2b811",
  momTotal: "MOM"
};

const gangwonTabs = [
  { label: labels.summary, value: "summary" },
  { label: labels.goals, value: "goals" },
  { label: labels.assists, value: "assists" },
  { label: labels.attackPoints, value: "attackPoints" },
  { label: labels.yellowCards, value: "yellowCards" },
  { label: labels.bestEleven, value: "bestEleven" },
  { label: labels.mom, value: "mom" },
  { label: labels.ratingTitle, value: "averageRating" }
];

const leagueTabs = [
  { label: labels.goals, value: "goals" },
  { label: labels.assists, value: "assists" }
];

const suffixMap: Record<StatKey, string> = {
  goals: labels.goal,
  assists: labels.count,
  attackPoints: labels.point,
  yellowCards: labels.card,
  bestEleven: labels.times,
  mom: labels.times
};

const topTenLimit = 10;

export function PlayerStatsPanel({ stats, ratings = [], ratingsError = false, teamGoalsFor = 0 }: PlayerStatsPanelProps) {
  const [activeGangwon, setActiveGangwon] = useState<GangwonTabKey>("summary");
  const [activeLeague, setActiveLeague] = useState<"goals" | "assists">("goals");
  const gangwonStats = useMemo(() => stats.filter((item) => isGangwon(item.club)), [stats]);
  const gangwonRows = useMemo(() => isStatTab(activeGangwon) ? getTopRows(gangwonStats, activeGangwon, activeGangwon !== "mom") : [], [activeGangwon, gangwonStats]);
  const leagueRows = useMemo(() => getTopRows(stats, activeLeague), [activeLeague, stats]);
  const topCards = useMemo(() => createTopCards(stats, gangwonStats, ratings, teamGoalsFor), [stats, gangwonStats, ratings, teamGoalsFor]);

  if (!stats.length) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="text-lg font-black text-gangwon-navy dark:text-white">{labels.gangwonTitle}</h2>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">{labels.loadFailed}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 sm:gap-5">
      <article className="rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 sm:p-5">
        <StatsHeader title={labels.gangwonTitle}>
          <FilterTabs tabs={gangwonTabs} active={activeGangwon} onChange={(value) => setActiveGangwon(value as GangwonTabKey)} />
        </StatsHeader>
        {activeGangwon === "summary" ? (
          <TopCards cards={topCards} onSelect={(tab) => setActiveGangwon(tab)} />
        ) : activeGangwon === "averageRating" ? (
          <RatingPanel ratings={ratings} hasError={ratingsError} />
        ) : (
          <StatsList rows={gangwonRows} valueKey={activeGangwon} highlighted />
        )}
      </article>

      <article className="rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 sm:p-5">
        <StatsHeader title={labels.leagueTitle}>
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
      {hasError ? (
        <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{labels.ratingFailed}</p>
      ) : ratings.length ? (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
          {ratings.map((row) => (
            <div key={row.playerKey} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-orange-50 px-3 py-3 ring-1 ring-orange-100 dark:bg-slate-800 dark:ring-slate-700 sm:px-4 sm:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gangwon-orange text-xs font-black text-white sm:h-9 sm:w-9 sm:text-sm">
                  {row.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white sm:text-base">{row.playerName}</p>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-500 ring-1 ring-orange-100 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700">
                      {row.ratingMatches}{labels.games}
                    </span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-black text-gangwon-orange sm:text-xl">{formatRating(row.averageRating)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{labels.ratingFailed}</p>
      )}
    </div>
  );
}

function TopCards({ cards, onSelect }: { cards: TopCard[]; onSelect: (tab: GangwonTabKey) => void }) {
  if (!cards.length) {
    return <p className="rounded-lg bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{labels.empty}</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.title}
          type="button"
          onClick={() => card.tab ? onSelect(card.tab) : undefined}
          className="rounded-lg bg-slate-50 px-3 py-3 text-left ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-orange-50 hover:ring-orange-100 dark:bg-slate-800/70 dark:ring-slate-700 dark:hover:bg-slate-800 sm:px-4 sm:py-4"
        >
          <p className="text-xs font-black text-gangwon-orange">{card.title}</p>
          <p className="mt-1 truncate text-base font-black text-slate-900 dark:text-white sm:text-lg">{card.primary}</p>
          {card.secondary ? <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{card.secondary}</p> : null}
        </button>
      ))}
    </div>
  );
}

function getTopRows(rows: LeaguePlayerStat[], key: StatKey, includeZero = false, limit = 5) {
  return [...rows]
    .filter((row) => includeZero || getStatValue(row, key) > 0)
    .sort((a, b) => getStatValue(b, key) - getStatValue(a, key) || b.attackPoints - a.attackPoints || b.played - a.played)
    .slice(0, limit);
}

function isStatTab(value: GangwonTabKey): value is StatKey {
  return value !== "summary" && value !== "averageRating";
}

function getStatValue(row: LeaguePlayerStat, key: StatKey) {
  return Number(row[key] ?? 0);
}

function sumStat(rows: LeaguePlayerStat[], key: StatKey) {
  return rows.reduce((sum, row) => sum + getStatValue(row, key), 0);
}

function formatStatSummary(rows: LeaguePlayerStat[], key: StatKey) {
  return rows.map((row) => `${row.name} ${getStatValue(row, key)}${suffixMap[key]}`).join(" \u00b7 ");
}

function formatRating(value: number) {
  return value.toFixed(2);
}

function StatsHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div>
        <h2 className="text-lg font-black text-gangwon-navy dark:text-white sm:text-xl">{title}</h2>
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
    return <p className="rounded-lg bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{labels.empty}</p>;
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
              rowHighlighted ? "bg-orange-50 ring-orange-100 dark:bg-slate-800 dark:ring-orange-500/40" : "bg-slate-50 ring-transparent dark:bg-slate-800/70"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={classNames(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-9 sm:w-9 sm:text-sm",
                rowHighlighted ? "bg-gangwon-orange text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
              )}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-black text-slate-900 dark:text-white sm:text-base">{row.name}</p>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-400 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700">
                    {row.played || "-"}{labels.games}
                  </span>
                </div>
                {showClub ? (
                  <p className={classNames("mt-0.5 truncate text-[11px] font-black leading-none", gangwonClub ? "text-gangwon-orange" : "text-slate-400")}>
                    {gangwonClub ? labels.gangwonBadge : formatClubLabel(row.club)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-black text-gangwon-orange sm:text-xl">{getStatValue(row, valueKey)}<span className="text-sm">{suffixMap[valueKey]}</span></p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function createTopCards(
  stats: LeaguePlayerStat[],
  gangwonStats: LeaguePlayerStat[],
  ratings: GangwonPlayerRating[],
  teamGoalsFor: number
): TopCard[] {
  const cards: TopCard[] = [];
  const scoringDuo = getTopRows(gangwonStats, "goals").slice(0, 2);
  const scoringDuoGoals = scoringDuo.reduce((sum, row) => sum + row.goals, 0);

  if (scoringDuo.length >= 2 && scoringDuoGoals > 0) {
    const share = teamGoalsFor > 0 ? Math.round((scoringDuoGoals / teamGoalsFor) * 100) : 0;
    cards.push({
      title: labels.scoringDuo,
      primary: scoringDuo.map((row) => row.name).join(" + "),
      secondary: `${labels.combinedGoals} ${scoringDuoGoals}${labels.goal}${share ? ` \u00b7 ${labels.teamGoalsShare} ${share}%` : ""}`,
      tab: "goals"
    });
  }

  const leagueScorers = getTopRows(stats, "goals", false, topTenLimit).filter((row) => isGangwon(row.club));
  if (leagueScorers.length) {
    cards.push({
      title: labels.scoringTop,
      primary: formatStatSummary(leagueScorers.slice(0, 2), "goals"),
      tab: "goals"
    });
  }

  const bestElevenTotal = sumStat(gangwonStats, "bestEleven");
  const momTotal = sumStat(gangwonStats, "mom");
  if (bestElevenTotal > 0 || momTotal > 0) {
    const bestElevenLeader = getTopRows(gangwonStats, "bestEleven").find((row) => getStatValue(row, "bestEleven") > 0);
    const momLeader = getTopRows(gangwonStats, "mom").find((row) => getStatValue(row, "mom") > 0);

    cards.push({
      title: labels.recognized,
      primary: [
        bestElevenTotal > 0 ? `${labels.bestElevenTotal} ${bestElevenTotal}${labels.times}` : "",
        momTotal > 0 ? `${labels.momTotal} ${momTotal}${labels.times}` : ""
      ].filter(Boolean).join(" \u00b7 "),
      secondary: [
        bestElevenLeader ? `${bestElevenLeader.name} ${getStatValue(bestElevenLeader, "bestEleven")}${labels.times}` : "",
        momLeader ? `${momLeader.name} ${getStatValue(momLeader, "mom")}${labels.times}` : ""
      ].filter(Boolean).join(" \u00b7 "),
      tab: momTotal > 0 ? "mom" : "bestEleven"
    });
  }

  if (ratings.length) {
    cards.push({
      title: labels.ratingTop,
      primary: ratings.slice(0, 2).map((row) => `${row.playerName} ${formatRating(row.averageRating)}`).join(" \u00b7 "),
      tab: "averageRating"
    });
  }

  return cards;
}

function formatClubLabel(club: string) {
  const clubMap: Record<string, string> = {
    "\uc6b8\uc0b0 HD": "\uc6b8\uc0b0 HD",
    "\ud3ec\ud56d \uc2a4\ud2f8\ub7ec\uc2a4": "\ud3ec\ud56d",
    "\uc81c\uc8fc SK": "\uc81c\uc8fc",
    "\uc804\ubd81 \ud604\ub300": "\uc804\ubd81",
    "FC\uc11c\uc6b8": "\uc11c\uc6b8",
    "\ub300\uc804\ud558\ub098\uc2dc\ud2f0\uc98c": "\ub300\uc804",
    "\uc778\ucc9c \uc720\ub098\uc774\ud2f0\ub4dc": "\uc778\ucc9c",
    "\uad11\uc8fcFC": "\uad11\uc8fc",
    "\ubd80\ucc9cFC1995": "\ubd80\ucc9c",
    "FC\uc548\uc591": "\uc548\uc591",
    "\uae40\ucc9c \uc0c1\ubb34": "\uae40\ucc9c"
  };

  return clubMap[club] ?? club;
}
