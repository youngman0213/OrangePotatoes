import { ExternalLink } from "lucide-react";
import type { Coach } from "@/types";

const labels = {
  officialProfile: "\uacf5\uc2dd \ud504\ub85c\ud544"
};

export function CoachCard({ coach }: { coach: Coach }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <span className="rounded-full bg-gangwon-navy px-3 py-1 text-xs font-black text-white">{coach.role}</span>
      <h3 className="mt-4 text-lg font-black text-gangwon-navy">{coach.name}</h3>
      {coach.profileUrl ? (
        <a href={coach.profileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-slate-600 hover:text-gangwon-orange">
          {labels.officialProfile}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      ) : null}
    </article>
  );
}
