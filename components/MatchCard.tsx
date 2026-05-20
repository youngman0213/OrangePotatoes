import { ExternalLink, MapPin, Radio, Ticket } from "lucide-react";
import type { Match } from "@/types";
import { classNames, formatDate, formatTime, isGangwon, statusLabel, statusTone } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

export function MatchCard({ match, featured = false }: MatchCardProps) {
  const showScore = match.status !== "scheduled";

  return (
    <article className={classNames("rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100", featured && "border-l-4 border-gangwon-orange p-5")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-gangwon-orange">{match.competition}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{match.round}</span>
          <span className={classNames("rounded-full px-3 py-1 text-xs font-black", statusTone[match.status])}>{statusLabel[match.status]}</span>
        </div>
        <span className="text-sm font-bold text-slate-500">{match.isHome ? "HOME" : "AWAY"}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamName name={match.homeTeam} align="right" />
        <div className="min-w-20 rounded-lg bg-slate-50 px-3 py-2 text-center">
          {showScore ? (
            <p className="text-2xl font-black text-gangwon-navy">{match.homeScore} : {match.awayScore}</p>
          ) : (
            <p className="text-sm font-black text-gangwon-navy">{formatTime(match.date)}</p>
          )}
        </div>
        <TeamName name={match.awayTeam} align="left" />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-500">
        <p className="font-bold text-slate-700">{formatDate(match.date, { year: "numeric" })} {formatTime(match.date)}</p>
        <p className="flex items-center gap-2"><MapPin size={16} aria-hidden="true" />{match.venue}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionLink href={match.ticketUrl} label="티켓" icon="ticket" />
        <ActionLink href={match.broadcastUrl} label="중계" icon="radio" />
        <ActionLink href={match.highlightUrl} label="하이라이트" icon="external" />
      </div>
    </article>
  );
}

function TeamName({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <p className={classNames("text-base font-black sm:text-lg", align === "right" ? "text-right" : "text-left", isGangwon(name) ? "text-gangwon-orange" : "text-gangwon-navy")}>
      {name}
    </p>
  );
}

function ActionLink({ href, label, icon }: { href: string | null; label: string; icon: "ticket" | "radio" | "external" }) {
  if (!href) {
    return null;
  }

  const Icon = icon === "ticket" ? Ticket : icon === "radio" ? Radio : ExternalLink;

  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-gangwon-orange hover:text-white">
      <Icon size={14} aria-hidden="true" />
      {label}
    </a>
  );
}
