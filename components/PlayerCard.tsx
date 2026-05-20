import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  const content = (
    <div className="relative min-h-28 overflow-hidden rounded-lg bg-white p-4">
      <span className="inline-flex rounded-full bg-gangwon-orange px-2.5 py-1 text-[11px] font-black text-white sm:px-3 sm:text-xs">{player.position}</span>
      <span className="pointer-events-none absolute right-3 top-3 text-5xl font-black leading-none text-gangwon-orange/25 sm:right-4 sm:top-2 sm:text-6xl">{player.number}</span>
      <h3 className="relative mt-8 break-keep text-lg font-black text-gangwon-navy sm:text-xl">{player.name}</h3>
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
