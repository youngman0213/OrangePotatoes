import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  const content = (
    <div className="relative min-h-24 overflow-hidden">
      <span className="inline-flex rounded-full bg-gangwon-orange px-3 py-1 text-xs font-black text-white">{player.position}</span>
      <span className="pointer-events-none absolute -right-1 -top-4 text-7xl font-black leading-none text-gangwon-navy/10">{player.number}</span>
      <h3 className="relative mt-7 text-xl font-black text-gangwon-navy">{player.name}</h3>
    </div>
  );

  if (player.profileUrl) {
    return (
      <a href={player.profileUrl} target="_blank" rel="noreferrer" className="block rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-gangwon-orange/30">
        {content}
      </a>
    );
  }

  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      {content}
    </article>
  );
}
