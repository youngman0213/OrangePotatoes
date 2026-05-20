import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  const content = (
    <div className="group relative min-h-36 overflow-hidden rounded-lg bg-gradient-to-br from-white to-orange-50/50 p-5">
      <span className="pointer-events-none absolute right-4 top-3 text-[5rem] font-black leading-none text-gangwon-orange/15 transition-colors duration-300 group-hover:text-gangwon-orange/25 sm:right-5 sm:text-[5.75rem]">
        {player.number}
      </span>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full bg-gangwon-orange px-3 py-1 text-xs font-black text-white shadow-sm">
          {player.position}
        </span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-gangwon-orange ring-1 ring-orange-100">
          No. {player.number}
        </span>
      </div>

      <div className="relative z-10 mt-10">
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
