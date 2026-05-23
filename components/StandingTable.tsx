import type { ReactNode } from "react";
import type { Standing } from "@/types";
import { classNames, isGangwon } from "@/lib/utils";

const labels = {
  summaryTitle: "강원FC 현재 순위",
  leagueListTitle: "리그 전체 순위",
  rank: "순위",
  place: "위",
  team: "팀",
  played: "경기",
  wins: "승",
  draws: "무",
  losses: "패",
  wdl: "승/무/패",
  goalsFor: "득점",
  goalsAgainst: "실점",
  goalDifference: "득실",
  points: "승점",
  form: "최근 5경기",
  empty: "표시할 순위 정보가 없습니다."
};

export function StandingTable({ standings }: { standings: Standing[] }) {
  const gangwon = standings.find((row) => isGangwon(row.team));

  return (
    <section className="grid gap-4">
      {gangwon ? <GangwonSummaryCard standing={gangwon} /> : null}
      <LeagueTable standings={standings} />
    </section>
  );
}

function LeagueTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-black text-gangwon-orange">순위표</p>
          <h3 className="text-lg font-black text-gangwon-navy">{labels.leagueListTitle}</h3>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full min-w-[680px] text-left text-xs sm:text-sm">
          <thead className="bg-gangwon-navy text-white">
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
              <Th>{labels.form}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.length ? standings.map((row) => (
              <tr key={row.team} className={classNames(isGangwon(row.team) ? "bg-orange-50" : "bg-white")}>
                <Td strong>{row.rank || "-"}</Td>
                <Td>
                  <span className={classNames("font-black", isGangwon(row.team) ? "text-gangwon-orange" : "text-gangwon-navy")}>{row.team}</span>
                </Td>
                <Td>{row.played}</Td>
                <Td>{row.wins}</Td>
                <Td>{row.draws}</Td>
                <Td>{row.losses}</Td>
                <Td>{row.goalsFor}</Td>
                <Td>{row.goalsAgainst}</Td>
                <Td>{formatGoalDifference(row.goalDifference)}</Td>
                <Td strong>{row.points}</Td>
                <Td>
                  <FormDots team={row.team} form={row.recentForm.slice(0, 5)} compact />
                </Td>
              </tr>
            )) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-sm font-bold text-slate-500">
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

function GangwonSummaryCard({ standing }: { standing: Standing }) {
  return (
    <article className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-white/75">강원 요약</p>
          <h2 className="mt-1 text-xl font-black">{labels.summaryTitle}</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-gangwon-orange">
          {standing.rank}{labels.place}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <SummaryMetric label={labels.played} value={standing.played} />
        <SummaryMetric label={labels.wdl} value={`${standing.wins}/${standing.draws}/${standing.losses}`} />
        <SummaryMetric label={labels.points} value={standing.points} />
        <SummaryMetric label={labels.goalDifference} value={formatGoalDifference(standing.goalDifference)} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-3">
        <span className="text-xs font-black text-white/75">{labels.form}</span>
        <FormDots team={standing.team} form={standing.recentForm} light />
      </div>
    </article>
  );
}

function SummaryMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-3">
      <p className="text-xs font-bold text-white/70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function FormDots({ team, form, light = false, compact = false }: { team: string; form: Standing["recentForm"]; light?: boolean; compact?: boolean }) {
  if (!form.length) {
    return <span className={classNames("text-xs font-bold", light ? "text-white/75" : "text-slate-400")}>-</span>;
  }

  return (
    <div className="flex shrink-0 gap-1">
      {form.map((result, index) => (
        <span
          key={`${team}-${index}-${result}`}
          className={classNames(
            "flex items-center justify-center rounded-full text-xs font-black text-white",
            compact ? "h-4 w-4 text-[9px]" : "h-6 w-6",
            result === "W" && "bg-emerald-500",
            result === "D" && "bg-slate-400",
            result === "L" && "bg-red-500"
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

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-black">{children}</th>;
}

function Td({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return <td className={classNames("whitespace-nowrap px-4 py-4 text-slate-600", strong && "font-black text-gangwon-navy")}>{children}</td>;
}
