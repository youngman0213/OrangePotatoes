import type { ReactNode } from "react";
import { Activity, Shield, Target } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { StandingTable } from "@/components/StandingTable";
import { standings } from "@/data/mock";

export default function StandingsPage() {
  const gangwon = standings.find((standing) => standing.team === "강원FC");

  return (
    <div className="grid gap-6">
      <SectionHeader title="K리그1 순위" eyebrow="Table" />
      {gangwon ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={<Activity size={22} />} label="현재 순위" value={`${gangwon.rank}위`} meta={`승점 ${gangwon.points}`} />
          <SummaryCard icon={<Target size={22} />} label="팀 득점" value={`${gangwon.goalsFor}골`} meta={`${gangwon.played}경기 기준`} />
          <SummaryCard icon={<Shield size={22} />} label="팀 실점" value={`${gangwon.goalsAgainst}실점`} meta={`득실차 ${gangwon.goalDifference > 0 ? `+${gangwon.goalDifference}` : gangwon.goalDifference}`} />
        </div>
      ) : null}
      <StandingTable standings={standings} />
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
