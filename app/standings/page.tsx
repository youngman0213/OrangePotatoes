import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { fetchKLeaguePlayerStats, fetchKLeagueStandings } from "@/lib/officialFeed";
import type { LeaguePlayerStat } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const labels = {
  title: "K\ub9ac\uadf81 \uc21c\uc704",
  playerStats: "\uac1c\uc778 \uae30\ub85d",
  source: "\ub370\uc774\ud130 \ucd9c\ucc98: K\ub9ac\uadf8 \ud3ec\ud138"
};

export default async function StandingsPage() {
  const [standingsResult, statsResult] = await Promise.allSettled([
    fetchKLeagueStandings(),
    fetchKLeaguePlayerStats()
  ]);
  const tableStandings = standingsResult.status === "fulfilled" && standingsResult.value.length ? standingsResult.value : standings;
  const fetchedPlayerStats = statsResult.status === "fulfilled" ? statsResult.value : [];
  const playerStats = mergePlayerStats([...fallbackPlayerStats, ...fetchedPlayerStats]);

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow="Table" />
      <p className="text-sm font-bold text-slate-500">{labels.source}</p>
      <StandingTable standings={tableStandings} />

      <SectionHeader title={labels.playerStats} eyebrow="Player Stats" />
      <PlayerStatsPanel stats={playerStats} />
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
