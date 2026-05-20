import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  const content = (
    <div className="relative min-h-24 overflow-hidden rounded-lg bg-white p-4">
      <span className="inline-flex rounded-full bg-gangwon-orange px-3 py-1 text-xs font-black text-white">{player.position}</span>
      <span className="pointer-events-none absolute right-4 top-2 text-6xl font-black leading-none text-gangwon-orange/25">{player.number}</span>
      <h3 className="relative mt-7 text-xl font-black text-gangwon-navy">{player.name}</h3>
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
