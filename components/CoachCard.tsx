import type { Coach } from "@/types";

export function CoachCard({ coach }: { coach: Coach }) {
  const content = (
    <>
      <span className="rounded-full bg-gangwon-navy px-3 py-1 text-xs font-black text-white">{coach.role}</span>
      <h3 className="mt-4 text-lg font-black text-gangwon-navy">{coach.name}</h3>
    </>
  );

  if (coach.profileUrl) {
    return (
      <a href={coach.profileUrl} target="_blank" rel="noreferrer" className="block rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-gangwon-orange/30">
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
