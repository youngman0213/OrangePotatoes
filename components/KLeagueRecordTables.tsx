import type { ReactNode } from "react";
import type { VerifiedPlayerRecord, VerifiedStanding } from "@/lib/kleague/types";

const labels = {
  standings: "K\ub9ac\uadf81 \uc21c\uc704",
  players: "\uc120\uc218 \uac1c\uc778\uae30\ub85d",
  rank: "\uc21c\uc704",
  team: "\ud300",
  player: "\uc120\uc218",
  played: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328",
  goalsFor: "\ub4dd\uc810",
  goalsAgainst: "\uc2e4\uc810",
  goalDifference: "\ub4dd\uc2e4",
  points: "\uc2b9\uc810",
  goals: "\ub4dd\uc810",
  assists: "\ub3c4\uc6c0",
  attackPoints: "\uacf5\uaca9P",
  yellowCards: "\uacbd\uace0",
  source: "\ub370\uc774\ud130 \ucd9c\ucc98: \ub124\uc774\ubc84 \uc2a4\ud3ec\uce20"
};

export function KLeagueRecordTables({
  standings,
  playerRecords
}: {
  standings: VerifiedStanding[];
  playerRecords: VerifiedPlayerRecord[];
}) {
  return (
    <section className="grid gap-4">
      <RecordTable title={labels.standings}>
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
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {standings.map((row) => (
            <tr key={row.teamCode} className={row.teamCode === "21" ? "bg-orange-50" : "bg-white"}>
              <Td>{row.rank}</Td>
              <Td strong={row.teamCode === "21"}>{row.teamName}</Td>
              <Td>{row.played}</Td>
              <Td>{row.wins}</Td>
              <Td>{row.draws}</Td>
              <Td>{row.losses}</Td>
              <Td>{row.goalsFor}</Td>
              <Td>{row.goalsAgainst}</Td>
              <Td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</Td>
              <Td>{row.points}</Td>
            </tr>
          ))}
        </tbody>
      </RecordTable>

      <RecordTable title={labels.players}>
        <thead className="bg-gangwon-navy text-xs uppercase text-white">
          <tr>
            <Th>{labels.rank}</Th>
            <Th>{labels.player}</Th>
            <Th>{labels.team}</Th>
            <Th>{labels.goals}</Th>
            <Th>{labels.assists}</Th>
            <Th>{labels.attackPoints}</Th>
            <Th>{labels.yellowCards}</Th>
            <Th>{labels.played}</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {playerRecords.map((row) => (
            <tr key={`${row.playerName}-${row.teamCode}`} className={row.teamCode === "21" ? "bg-orange-50" : "bg-white"}>
              <Td>{row.rank}</Td>
              <Td strong={row.teamCode === "21"}>{row.playerName}</Td>
              <Td>{row.teamName}</Td>
              <Td>{row.goals}</Td>
              <Td>{row.assists}</Td>
              <Td>{row.attackPoints}</Td>
              <Td>{row.yellowCards}</Td>
              <Td>{row.matches}</Td>
            </tr>
          ))}
        </tbody>
      </RecordTable>

      <p className="text-xs font-bold text-slate-400">{labels.source}</p>
    </section>
  );
}

function RecordTable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
      <h2 className="px-4 py-3 text-lg font-black text-gangwon-navy">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">{children}</table>
      </div>
    </article>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-black">{children}</th>;
}

function Td({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return <td className={`whitespace-nowrap px-4 py-3 ${strong ? "font-black text-gangwon-orange" : "font-bold text-slate-600"}`}>{children}</td>;
}
