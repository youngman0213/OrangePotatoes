import type { ReactNode } from "react";
import type { Standing } from "@/types";
import { classNames, isGangwon } from "@/lib/utils";

const labels = {
  summaryTitle: "\ud604\uc7ac \uc21c\uc704",
  leagueListTitle: "\ub9ac\uadf8 \uc21c\uc704",
  rank: "\uc21c\uc704",
  place: "\uc704",
  team: "\ud300",
  played: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328",
  wdl: "\uc2b9/\ubb34/\ud328",
  goalsFor: "\ub4dd\uc810",
  goalsAgainst: "\uc2e4\uc810",
  goalDifference: "\ub4dd\uc2e4",
  points: "\uc2b9\uc810",
  form: "\ucd5c\uadfc 5\uacbd\uae30",
  empty: "\ud45c\uc2dc\ud560 \uc21c\uc704 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."
};

export function StandingTable({ standings }: { standings: Standing[] }) {
  const gangwon = standings.find((row) => isGangwon(row.team));
  const goalsForRank = gangwon ? getMetricRank(standings, "goalsFor", "desc", gangwon.team) : null;
  const goalsAgainstRank = gangwon ? getMetricRank(standings, "goalsAgainst", "asc", gangwon.team) : null;

  return (
    <section className="grid gap-3">
      {gangwon ? <GangwonSummaryCard standing={gangwon} goalsForRank={goalsForRank} goalsAgainstRank={goalsAgainstRank} /> : null}
      <LeagueTable standings={standings} />
    </section>
  );
}

function LeagueTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h3 className="text-lg font-black text-gangwon-navy dark:text-white">{labels.leagueListTitle}</h3>
      </div>

      <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
        <table className="w-full min-w-[520px] text-left text-xs sm:min-w-[680px] sm:text-sm">
          <thead className="bg-gangwon-navy text-white dark:bg-slate-950">
            <tr>
              <Th>{labels.rank}</Th>
              <Th>{labels.team}</Th>
              <Th>{labels.played}</Th>
              <Th>{labels.wins}</Th>
              <Th>{labels.draws}</Th>
              <Th>{labels.losses}</Th>
              <Th>{labels.goalsFor}</Th>
              <Th>{labels.goalsAgainst}</Th>
              <Th>{labels.goalDifference}</Th>
              <Th>{labels.points}</Th>
              <Th className="hidden lg:table-cell">{labels.form}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {standings.length ? standings.map((row) => (
              <tr key={row.team} className={classNames(isGangwon(row.team) ? "bg-orange-50 dark:bg-orange-500/10" : "bg-white dark:bg-slate-900")}>
                <Td strong>{row.rank || "-"}</Td>
                <Td>
                  <span className={classNames("font-black", isGangwon(row.team) ? "text-gangwon-orange" : "text-gangwon-navy dark:text-white")}>{row.team}</span>
                </Td>
                <Td>{row.played}</Td>
                <Td>{row.wins}</Td>
                <Td>{row.draws}</Td>
                <Td>{row.losses}</Td>
                <Td>{row.goalsFor}</Td>
                <Td>{row.goalsAgainst}</Td>
                <Td>{formatGoalDifference(row.goalDifference)}</Td>
                <Td strong>{row.points}</Td>
                <Td className="hidden lg:table-cell">
                  <FormDots team={row.team} form={row.recentForm.slice(0, 5)} compact />
                </Td>
              </tr>
            )) : (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  {labels.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GangwonSummaryCard({
  standing,
  goalsForRank,
  goalsAgainstRank
}: {
  standing: Standing;
  goalsForRank: number | null;
  goalsAgainstRank: number | null;
}) {
  return (
    <article className="rounded-lg border-l-4 border-gangwon-orange bg-white p-3.5 text-gangwon-navy shadow-card ring-1 ring-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-black sm:text-xl">{labels.summaryTitle}</h2>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-gangwon-orange ring-1 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/30">
          {standing.rank}{labels.place}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
        <SummaryMetric label={labels.played} value={standing.played} />
        <SummaryMetric label={labels.wdl} value={`${standing.wins}/${standing.draws}/${standing.losses}`} />
        <SummaryMetric label={labels.points} value={standing.points} />
        <SummaryMetric label={labels.goalsFor} value={`${standing.goalsFor} ${formatRankSuffix(goalsForRank)}`} />
        <SummaryMetric label={labels.goalsAgainst} value={`${standing.goalsAgainst} ${formatRankSuffix(goalsAgainstRank)}`} />
        <SummaryMetric label={labels.goalDifference} value={formatGoalDifference(standing.goalDifference)} />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
        <span className="text-xs font-black text-slate-500 dark:text-slate-400">{labels.form}</span>
        <FormDots team={standing.team} form={standing.recentForm} light />
      </div>
    </article>
  );
}

function SummaryMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800">
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">{label}</p>
      <p className="mt-0.5 text-lg font-black text-gangwon-navy dark:text-white sm:mt-1 sm:text-2xl">{value}</p>
    </div>
  );
}

function FormDots({ team, form, light = false, compact = false }: { team: string; form: Standing["recentForm"]; light?: boolean; compact?: boolean }) {
  if (!form.length) {
    return <span className="text-xs font-bold text-slate-400">-</span>;
  }

  return (
    <div className="flex shrink-0 gap-1">
      {form.map((result, index) => (
        <span
          key={`${team}-${index}-${result}`}
          className={classNames(
            "flex items-center justify-center rounded-full pt-px text-xs font-black leading-none text-white",
            compact ? "h-[18px] w-[18px] text-[9px]" : "h-6 w-6",
            result === "W" && "bg-gangwon-orange",
            result === "D" && "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-white",
            result === "L" && "bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-100"
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : value;
}

function getMetricRank(rows: Standing[], key: "goalsFor" | "goalsAgainst", direction: "asc" | "desc", team: string) {
  const sorted = [...rows].sort((a, b) => {
    const diff = direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    return diff || a.rank - b.rank;
  });
  const index = sorted.findIndex((row) => row.team === team);

  return index >= 0 ? index + 1 : null;
}

function formatRankSuffix(rank: number | null) {
  return rank ? `(${rank}\uc704)` : "";
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={classNames("whitespace-nowrap px-2.5 py-2.5 font-black sm:px-4 sm:py-3", className)}>{children}</th>;
}

function Td({ children, strong = false, className }: { children: ReactNode; strong?: boolean; className?: string }) {
  return <td className={classNames("whitespace-nowrap px-2.5 py-3 text-slate-600 dark:text-slate-300 sm:px-4 sm:py-4", strong && "font-black text-gangwon-navy dark:text-white", className)}>{children}</td>;
}
