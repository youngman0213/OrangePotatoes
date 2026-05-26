import { LeaguePlayerStatsPanel, PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { LeagueStandingTable, StandingTable } from "@/components/StandingTable";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { getVerifiedCombinedPlayerRecords, getVerifiedStandings } from "@/lib/kleague";
import { normalizeTeamName } from "@/lib/kleague/normalize";
import { getGangwonAverageRatings } from "@/lib/kleague/ratings";
import type { LeaguePlayerStat } from "@/types";

export const revalidate = 21600;

const labels = {
  source: "\ub370\uc774\ud130 \ucd9c\ucc98: K\ub9ac\uadf8 \uacf5\uc2dd \uae30\ub85d / \uac80\uc99d: \ub124\uc774\ubc84 \uc2a4\ud3ec\uce20",
  checkedAt: "\uae30\uc900 \uc2dc\uac01"
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
    club: normalizeTeamName(row.teamCode, row.teamName),
    goals: row.goals,
    assists: row.assists,
    attackPoints: row.attackPoints,
    yellowCards: row.yellowCards,
    redCards: row.redCards,
    played: row.matches,
    bestEleven: row.bestEleven ?? 0,
    mom: row.mom ?? 0
  })) : [];

  const playerStats = fetchedPlayerStats.length ? mergePlayerStats(fetchedPlayerStats) : normalizeFallbackPlayerStats(fallbackPlayerStats);
  const playerRatings = ratingsResult.status === "fulfilled" ? ratingsResult.value : [];
  const ratingsError = ratingsResult.status === "rejected";
  const gangwonStanding = tableStandings.find((row) => row.team.includes("\uac15\uc6d0"));
  const updatedAt = standingsResult.status === "fulfilled" ? standingsResult.value.updatedAt : statsResult.status === "fulfilled" ? statsResult.value.updatedAt : new Date().toISOString();

  return (
    <div className="grid gap-5 sm:gap-6">
      <StandingTable standings={tableStandings} />

      <PlayerStatsPanel
        stats={playerStats}
        ratings={playerRatings}
        ratingsError={ratingsError}
        teamGoalsFor={gangwonStanding?.goalsFor ?? 0}
        showLeagueStats={false}
      />
      <LeagueStandingTable standings={tableStandings} />
      <LeaguePlayerStatsPanel stats={playerStats} />
      <p className="text-xs font-bold text-slate-400">{labels.source} / {labels.checkedAt}: {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(updatedAt))}</p>
    </div>
  );
}

function normalizeFallbackPlayerStats(rows: LeaguePlayerStat[]) {
  return rows.map((row) => ({
    ...row,
    club: normalizeTeamName(undefined, row.club)
  }));
}

function mergePlayerStats(rows: LeaguePlayerStat[]) {
  const merged = new Map<string, LeaguePlayerStat>();

  for (const row of rows) {
    const normalizedRow = {
      ...row,
      club: normalizeTeamName(undefined, row.club)
    };
    const key = `${normalizedRow.name}-${normalizedRow.club}`;
    const current = merged.get(key);

    if (!current) {
      merged.set(key, normalizedRow);
      continue;
    }

    merged.set(key, {
      ...current,
      rank: Math.min(current.rank, normalizedRow.rank),
      goals: Math.max(current.goals, normalizedRow.goals),
      assists: Math.max(current.assists, normalizedRow.assists),
      attackPoints: Math.max(current.attackPoints, normalizedRow.attackPoints),
      yellowCards: Math.max(current.yellowCards, normalizedRow.yellowCards),
      redCards: Math.max(current.redCards, normalizedRow.redCards),
      played: Math.max(current.played, normalizedRow.played),
      bestEleven: Math.max(current.bestEleven ?? 0, normalizedRow.bestEleven ?? 0),
      mom: Math.max(current.mom ?? 0, normalizedRow.mom ?? 0)
    });
  }

  return Array.from(merged.values());
}
