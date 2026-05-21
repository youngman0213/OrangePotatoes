import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { getVerifiedCombinedPlayerRecords, getVerifiedStandings } from "@/lib/kleague";
import type { LeaguePlayerStat } from "@/types";

export const revalidate = 21600;

const labels = {
  title: "K\ub9ac\uadf81 \uc21c\uc704",
  playerStats: "\uac1c\uc778 \uae30\ub85d",
  source: "\ub370\uc774\ud130 \ucd9c\ucc98: K\ub9ac\uadf8 \uacf5\uc2dd \uae30\ub85d / \uac80\uc99d: \ub124\uc774\ubc84 \uc2a4\ud3ec\uce20",
  checkedAt: "\uae30\uc900 \uc2dc\uac01"
};

export default async function StandingsPage() {
  const [standingsResult, statsResult] = await Promise.allSettled([
    getVerifiedStandings(),
    getVerifiedCombinedPlayerRecords()
  ]);
  const tableStandings = standingsResult.status === "fulfilled" && standingsResult.value.data.length ? standingsResult.value.data.map((row) => ({
    rank: row.rank,
    team: row.teamName,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
    recentForm: row.recentForm.filter((value): value is "W" | "D" | "L" => value === "W" || value === "D" || value === "L")
  })) : standings;
  const fetchedPlayerStats = statsResult.status === "fulfilled" ? statsResult.value.data.map((row) => ({
    rank: row.rank,
    name: row.playerName,
    club: row.teamCode === "21" ? "\uac15\uc6d0FC" : row.teamName,
    goals: row.goals,
    assists: row.assists,
    attackPoints: row.attackPoints,
    yellowCards: row.yellowCards,
    redCards: row.redCards,
    played: row.matches
  })) : [];
  const playerStats = fetchedPlayerStats.length ? mergePlayerStats(fetchedPlayerStats) : fallbackPlayerStats;
  const updatedAt = standingsResult.status === "fulfilled" ? standingsResult.value.updatedAt : statsResult.status === "fulfilled" ? statsResult.value.updatedAt : new Date().toISOString();

  return (
    <div className="grid gap-8">
      <SectionHeader title={labels.title} eyebrow="\uc21c\uc704\ud45c" />
      <StandingTable standings={tableStandings} />

      <SectionHeader title={labels.playerStats} eyebrow="\uc120\uc218 \uae30\ub85d" />
      <PlayerStatsPanel stats={playerStats} />
      <p className="text-xs font-bold text-slate-400">{labels.source} / {labels.checkedAt}: {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(updatedAt))}</p>
    </div>
  );
}

function mergePlayerStats(rows: LeaguePlayerStat[]) {
  const merged = new Map<string, LeaguePlayerStat>();

  for (const row of rows) {
    const key = `${row.name}-${row.club}`;
    const current = merged.get(key);

    if (!current) {
      merged.set(key, row);
      continue;
    }

    merged.set(key, {
      ...current,
      rank: Math.min(current.rank, row.rank),
      goals: Math.max(current.goals, row.goals),
      assists: Math.max(current.assists, row.assists),
      attackPoints: Math.max(current.attackPoints, row.attackPoints),
      yellowCards: Math.max(current.yellowCards, row.yellowCards),
      redCards: Math.max(current.redCards, row.redCards),
      played: Math.max(current.played, row.played)
    });
  }

  return Array.from(merged.values());
}
