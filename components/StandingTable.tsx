import type { ReactNode } from "react";
import type { Standing } from "@/types";
import { classNames, isGangwon } from "@/lib/utils";

const labels = {
  rank: "\uc21c\uc704",
  team: "\ud300",
  played: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328",
  goalsFor: "\ub4dd\uc810",
  goalsAgainst: "\uc2e4\uc810",
  goalDifference: "\ub4dd\uc2e4",
  points: "\uc2b9\uc810",
  form: "\ucd5c\uadfc 5\uacbd\uae30",
  empty: "K\ub9ac\uadf8 \uacf5\uc2dd \ud300 \uc21c\uc704 \uc5f0\ub3d9\uc744 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4."
};

export function StandingTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
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
                <Td strong>{row.rank}</Td>
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
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-black">{children}</th>;
}

function Td({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return <td className={classNames("whitespace-nowrap px-4 py-4 text-slate-600", strong && "font-black text-gangwon-navy")}>{children}</td>;
}
