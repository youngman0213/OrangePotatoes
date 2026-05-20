import type { ReactNode } from "react";
import type { Standing } from "@/types";
import { classNames, isGangwon } from "@/lib/utils";

export function StandingTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gangwon-navy text-xs uppercase text-white">
            <tr>
              <Th>순위</Th>
              <Th>팀</Th>
              <Th>경기</Th>
              <Th>승</Th>
              <Th>무</Th>
              <Th>패</Th>
              <Th>득점</Th>
              <Th>실점</Th>
              <Th>득실</Th>
              <Th>승점</Th>
              <Th>최근 5경기</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((row) => (
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
            ))}
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
