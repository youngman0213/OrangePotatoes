import { ExternalLink } from "lucide-react";
import type { Player } from "@/types";

const labels = {
  officialSquad: "\uac15\uc6d0FC \uacf5\uc2dd \uc120\uc218\ub2e8 \uae30\uc900",
  officialProfile: "\uacf5\uc2dd \ud504\ub85c\ud544"
};

export function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-gangwon-orange px-3 py-1 text-sm font-black text-white">#{player.number}</span>
        <span className="rounded-full bg-gangwon-navy px-3 py-1 text-xs font-black text-white">{player.position}</span>
      </div>
      <h3 className="text-xl font-black text-gangwon-navy">{player.name}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500">{labels.officialSquad}</p>
      {player.profileUrl ? (
        <a href={player.profileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-black text-slate-600 hover:text-gangwon-orange">
          {labels.officialProfile}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      ) : null}
    </article>
  );
}
