import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { getVerifiedCombinedPlayerRecords, getVerifiedStandings } from "@/lib/kleague";
import { getGangwonAverageRatings } from "@/lib/kleague/ratings";
import type { LeaguePlayerStat } from "@/types";

export const revalidate = 21600;

const labels = {
  playerStats: "개인 기록",
  source: "데이터 출처: K리그 공식 기록 / 검증: 네이버 스포츠",
  checkedAt: "기준 시각"
};

export default async function StandingsPage() {
  const [standingsResult, statsResult, ratingsResult] = await Promise.allSettled([
    getVerifiedStandings(),
    getVerifiedCombinedPlayerRecords(),
    getGangwonAverageRatings()
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
    club: row.teamCode === "21" ? "강원FC" : row.teamName,
    goals: row.goals,
    assists: row.assists,
    attackPoints: row.attackPoints,
    yellowCards: row.yellowCards,
    redCards: row.redCards,
    played: row.matches
  })) : [];
  const playerStats = fetchedPlayerStats.length ? mergePlayerStats(fetchedPlayerStats) : fallbackPlayerStats;
  const playerRatings = ratingsResult.status === "fulfilled" ? ratingsResult.value : [];
  const ratingsError = ratingsResult.status === "rejected";
  const updatedAt = standingsResult.status === "fulfilled" ? standingsResult.value.updatedAt : statsResult.status === "fulfilled" ? statsResult.value.updatedAt : new Date().toISOString();

  return (
    <div className="grid gap-5 sm:gap-6">
      <StandingTable standings={tableStandings} />

      <SectionHeader title={labels.playerStats} />
      <PlayerStatsPanel stats={playerStats} ratings={playerRatings} ratingsError={ratingsError} />
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
