import type { ReactNode } from "react";
import { Activity, Shield, Target } from "lucide-react";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { fetchKLeaguePlayerStats, fetchKLeagueStandings } from "@/lib/officialFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const labels = {
  gangwon: "\uac15\uc6d0FC",
  title: "K\ub9ac\uadf81 \uc21c\uc704",
  currentRank: "\ud604\uc7ac \uc21c\uc704",
  points: "\uc2b9\uc810",
  rankSuffix: "\uc704",
  teamGoals: "\ud300 \ub4dd\uc810",
  goalsSuffix: "\uace8",
  teamConceded: "\ud300 \uc2e4\uc810",
  concededSuffix: "\uc2e4\uc810",
  gamesBasis: "\uacbd\uae30 \uae30\uc900",
  goalDifference: "\ub4dd\uc2e4\ucc28",
  playerStats: "\uac1c\uc778 \uae30\ub85d",
  source: "\ub370\uc774\ud130 \ucd9c\ucc98: K\ub9ac\uadf8 \ud3ec\ud138"
};

export default async function StandingsPage() {
  const [standingsResult, statsResult] = await Promise.allSettled([
    fetchKLeagueStandings(),
    fetchKLeaguePlayerStats()
  ]);
  const tableStandings = standingsResult.status === "fulfilled" && standingsResult.value.length ? standingsResult.value : standings;
  const gangwon = tableStandings.find((standing) => standing.team === labels.gangwon);
  const playerStats = statsResult.status === "fulfilled" && statsResult.value.length ? statsResult.value : fallbackPlayerStats;

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow="Table" />
      <p className="text-sm font-bold text-slate-500">{labels.source}</p>
      {gangwon ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={<Activity size={22} />} label={labels.currentRank} value={`${gangwon.rank}${labels.rankSuffix}`} meta={`${labels.points} ${gangwon.points}`} />
          <SummaryCard icon={<Target size={22} />} label={labels.teamGoals} value={`${gangwon.goalsFor}${labels.goalsSuffix}`} meta={`${gangwon.played}${labels.gamesBasis}`} />
          <SummaryCard icon={<Shield size={22} />} label={labels.teamConceded} value={`${gangwon.goalsAgainst}${labels.concededSuffix}`} meta={`${labels.goalDifference} ${gangwon.goalDifference > 0 ? `+${gangwon.goalDifference}` : gangwon.goalDifference}`} />
        </div>
      ) : null}

      <StandingTable standings={tableStandings} />

      <SectionHeader title={labels.playerStats} eyebrow="Player Stats" />
      <PlayerStatsPanel stats={playerStats} />
    </div>
  );
}

function SummaryCard({ icon, label, value, meta }: { icon: ReactNode; label: string; value: string; meta: string }) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-gangwon-orange">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <h3 className="mt-1 text-2xl font-black text-gangwon-navy">{value}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500">{meta}</p>
    </article>
  );
}
