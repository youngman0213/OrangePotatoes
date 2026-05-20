import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { TeamRankTabs } from "@/components/TeamRankTabs";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { fetchKLeaguePlayerStats, fetchKLeagueStandings } from "@/lib/officialFeed";

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
  const playerStats = statsResult.status === "fulfilled" && statsResult.value.length ? statsResult.value : fallbackPlayerStats;

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow="Table" />
      <p className="text-sm font-bold text-slate-500">{labels.source}</p>
      <TeamRankTabs standings={tableStandings} />
      <StandingTable standings={tableStandings} />

      <SectionHeader title={labels.playerStats} eyebrow="Player Stats" />
      <PlayerStatsPanel stats={playerStats} />
    </div>
  );
}
