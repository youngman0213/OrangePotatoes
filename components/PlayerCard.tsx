import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  const content = (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="relative min-h-24 overflow-hidden bg-gangwon-orange px-5 py-4">
        <span className="relative z-10 inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-black text-gangwon-orange shadow-sm">
          {player.position}
        </span>
        <span className="player-number-watermark pointer-events-none absolute right-4 top-1 text-[4.8rem] font-black leading-none text-white transition-transform duration-300 group-hover:scale-105 sm:text-[5.3rem]">
          {player.number}
        </span>
      </div>

      <div className="px-5 py-4">
        <h3 className="text-xl font-black text-slate-950">{player.name}</h3>
      </div>
    </div>
  );

  if (player.profileUrl) {
    return (
      <a href={player.profileUrl} target="_blank" rel="noreferrer" className="group block rounded-lg bg-white shadow-card ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gangwon-orange/30">
        {content}
      </a>
    );
  }

  return (
    <article className="group rounded-lg bg-white shadow-card ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gangwon-orange/30">
      {content}
    </article>
  );
}
