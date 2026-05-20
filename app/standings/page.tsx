import type { ReactNode } from "react";
import { Activity, Shield, Target } from "lucide-react";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { playerStats as fallbackPlayerStats, standings } from "@/data/mock";
import { fetchKLeaguePlayerStats } from "@/lib/officialFeed";

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
  notice: "\ud300 \uc21c\uc704\ub294 \ud604\uc7ac \uacf5\uc2dd \ud300 \uc21c\uc704 \ub370\uc774\ud130 \uc5f0\ub3d9 \uc804\uae4c\uc9c0 \ub300\uccb4 \ub370\uc774\ud130\ub85c \ud45c\uc2dc\ub429\ub2c8\ub2e4. \uac1c\uc778 \uae30\ub85d\uc740 K\ub9ac\uadf8 \uacf5\uc2dd Player Rank \ud398\uc774\uc9c0 \uae30\uc900\uc73c\ub85c \ubd88\ub7ec\uc635\ub2c8\ub2e4.",
  playerStats: "\uac1c\uc778 \uae30\ub85d"
};

export default async function StandingsPage() {
  const gangwon = standings.find((standing) => standing.team === labels.gangwon);
  const statsResult = await Promise.allSettled([fetchKLeaguePlayerStats()]);
  const playerStats = statsResult[0].status === "fulfilled" && statsResult[0].value.length ? statsResult[0].value : fallbackPlayerStats;

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.title} eyebrow="Table" />
      {gangwon ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={<Activity size={22} />} label={labels.currentRank} value={`${gangwon.rank}${labels.rankSuffix}`} meta={`${labels.points} ${gangwon.points}`} />
          <SummaryCard icon={<Target size={22} />} label={labels.teamGoals} value={`${gangwon.goalsFor}${labels.goalsSuffix}`} meta={`${gangwon.played}${labels.gamesBasis}`} />
          <SummaryCard icon={<Shield size={22} />} label={labels.teamConceded} value={`${gangwon.goalsAgainst}${labels.concededSuffix}`} meta={`${labels.goalDifference} ${gangwon.goalDifference > 0 ? `+${gangwon.goalDifference}` : gangwon.goalDifference}`} />
        </div>
      ) : null}

      <StandingTable standings={standings} />

      <div className="rounded-lg bg-orange-50 p-4 text-sm font-bold leading-6 text-slate-700 ring-1 ring-orange-100">
        {labels.notice}
      </div>

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
