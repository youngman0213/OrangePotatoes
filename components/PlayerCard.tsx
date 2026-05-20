import { ExternalImage } from "@/components/ExternalImage";
import type { Player } from "@/types";
import { formatShortDate } from "@/lib/utils";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-slate-100">
      <div className="relative aspect-[4/3] bg-slate-100">
        <ExternalImage src={player.imageUrl} alt={`${player.name} 선수 이미지`} />
        <span className="absolute left-3 top-3 rounded-full bg-gangwon-orange px-3 py-1 text-sm font-black text-white">#{player.number}</span>
        <span className="absolute right-3 top-3 rounded-full bg-gangwon-navy px-3 py-1 text-xs font-black text-white">{player.position}</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-black text-gangwon-navy">{player.name}</h3>
        <p className="mt-1 text-sm font-bold text-slate-500">{player.nationality} · {formatShortDate(player.birthDate)}</p>
        <div className="mt-4 grid grid-cols-3 rounded-lg bg-slate-50 text-center">
          <Stat label="출전" value={player.appearances} />
          <Stat label="득점" value={player.goals} />
          <Stat label="도움" value={player.assists} />
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3">
      <p className="text-lg font-black text-gangwon-navy">{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}
