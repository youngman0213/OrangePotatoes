import type { ReactNode } from "react";
import type { Standing } from "@/types";
import { classNames, isGangwon } from "@/lib/utils";

const labels = {
  summaryTitle: "\uac15\uc6d0FC \ud604\uc7ac \uc21c\uc704",
  rank: "\uc21c\uc704",
  team: "\ud300",
  played: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328",
  record: "\uc804\uc801",
  goalsFor: "\ub4dd\uc810",
  goalsAgainst: "\uc2e4\uc810",
  goalDifference: "\ub4dd\uc2e4",
  points: "\uc2b9\uc810",
  form: "\ucd5c\uadfc 5\uacbd\uae30",
  empty: "K\ub9ac\uadf8 \uacf5\uc2dd \ud300 \uc21c\uc704 \uc5f0\ub3d9\uc744 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4."
};

export function StandingTable({ standings }: { standings: Standing[] }) {
  const gangwon = standings.find((row) => isGangwon(row.team));

  return (
    <section className="grid gap-4">
      {gangwon ? <GangwonSummaryCard standing={gangwon} /> : null}

      <div className="grid gap-3 md:hidden">
        {standings.length ? standings.map((row) => (
          <StandingCard key={row.team} standing={row} />
        )) : (
          <div className="rounded-lg bg-white px-4 py-8 text-center text-sm font-bold text-slate-500 shadow-card ring-1 ring-slate-100">
            {labels.empty}
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100 md:block">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gangwon-navy text-xs uppercase text-white">
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
                <Td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</Td>
                <Td strong>{row.points}</Td>
                <Td>
                  <div className="flex gap-1">
                    {row.recentForm.map((form, index) => (
                      <span
                        key={`${row.team}-${index}`}
                        className={classNames(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white",
                          form === "W" && "bg-emerald-500",
                          form === "D" && "bg-slate-400",
                          form === "L" && "bg-red-500"
                        )}
                      >
                        {form}
                      </span>
                    ))}
                  </div>
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
    </section>
  );
}

function GangwonSummaryCard({ standing }: { standing: Standing }) {
  return (
    <article className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-white/75">Gangwon Focus</p>
          <h2 className="mt-1 text-xl font-black">{labels.summaryTitle}</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-gangwon-orange">
          {standing.rank}{labels.rank}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <SummaryMetric label={labels.points} value={standing.points} />
        <SummaryMetric label={labels.played} value={standing.played} />
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

function StandingCard({ standing }: { standing: Standing }) {
  const highlighted = isGangwon(standing.team);

  return (
    <article className={classNames(
      "rounded-lg bg-white p-4 shadow-card ring-1",
      highlighted ? "ring-orange-200 bg-orange-50/70" : "ring-slate-100"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={classNames(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black",
            highlighted ? "bg-gangwon-orange text-white" : "bg-slate-100 text-slate-700"
          )}>
            {standing.rank || "-"}
          </span>
          <div className="min-w-0">
            <h3 className={classNames("truncate text-lg font-black", highlighted ? "text-gangwon-orange" : "text-gangwon-navy")}>
              {standing.team}
            </h3>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {standing.played}{labels.played} / {standing.wins}{labels.wins} {standing.draws}{labels.draws} {standing.losses}{labels.losses}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-bold text-slate-400">{labels.points}</p>
          <p className="text-2xl font-black text-gangwon-navy">{standing.points}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <CardMetric label={labels.goalDifference} value={formatGoalDifference(standing.goalDifference)} highlighted={highlighted} />
        <CardMetric label={labels.record} value={`${standing.goalsFor}:${standing.goalsAgainst}`} highlighted={highlighted} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-3 ring-1 ring-slate-100">
        <span className="text-xs font-black text-slate-500">{labels.form}</span>
        <FormDots team={standing.team} form={standing.recentForm} />
      </div>
    </article>
  );
}

function CardMetric({ label, value, highlighted }: { label: string; value: ReactNode; highlighted: boolean }) {
  return (
    <div className={classNames("rounded-lg px-3 py-3", highlighted ? "bg-white" : "bg-slate-50")}>
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-gangwon-navy">{value}</p>
    </div>
  );
}

function FormDots({ team, form, light = false }: { team: string; form: Standing["recentForm"]; light?: boolean }) {
  if (!form.length) {
    return <span className={classNames("text-xs font-bold", light ? "text-white/75" : "text-slate-400")}>-</span>;
  }

  return (
    <div className="flex shrink-0 gap-1">
      {form.map((result, index) => (
        <span
          key={`${team}-${index}-${result}`}
          className={classNames(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white",
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
