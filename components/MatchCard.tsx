import { ExternalLink, MapPin, Radio, Ticket } from "lucide-react";
import type { Match } from "@/types";
import { classNames, formatDate, formatTime, isGangwon, statusLabel, statusTone } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  featured?: boolean;
  embedded?: boolean;
}

const labels = {
  home: "\ud648",
  away: "\uc6d0\uc815",
  ticket: "\ud2f0\ucf13",
  broadcast: "\uc911\uacc4",
  highlight: "\ud558\uc774\ub77c\uc774\ud2b8",
  detail: "\uc0c1\uc138 \uacb0\uacfc"
};

export function MatchCard({ match, featured = false, embedded = false }: MatchCardProps) {
  const showScore = match.status !== "scheduled";

  return (
    <article className={classNames("rounded-lg bg-white p-4", embedded ? "bg-slate-50 ring-1 ring-slate-100" : "shadow-card ring-1 ring-slate-100", featured && "border-l-4 border-gangwon-orange", featured && !embedded && "p-5")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-gangwon-orange">{match.competition}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{match.round}</span>
          <span className={classNames("rounded-full px-3 py-1 text-xs font-black", statusTone[match.status])}>{statusLabel[match.status]}</span>
        </div>
        <span className="text-sm font-bold text-slate-500">{match.isHome ? labels.home : labels.away}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <TeamName name={match.homeTeam} align="right" />
        <div className="min-w-24 rounded-lg bg-slate-50 px-4 py-2.5 text-center">
          {showScore ? (
            <p className="text-2xl font-black text-gangwon-navy sm:text-3xl">
              {match.homeScore} : {match.awayScore}
            </p>
          ) : (
            <p className="text-base font-black text-gangwon-navy sm:text-lg">{formatTime(match.date)}</p>
          )}
        </div>
        <TeamName name={match.awayTeam} align="left" />
      </div>

      {showScore && match.goalEvents?.length ? <GoalEventSummary match={match} /> : null}

      <div className="mt-4 grid justify-items-center gap-2 text-center text-sm text-slate-500">
        <p className="font-bold text-slate-700">
          {formatDate(match.date, { year: "numeric" })} {formatTime(match.date)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} aria-hidden="true" />
          {match.venue}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {match.status === "scheduled" ? (
          <ActionLink href={match.ticketUrl} label={labels.ticket} icon="ticket" />
        ) : (
          <ActionLink href={match.detailUrl ?? null} label={labels.detail} icon="external" />
        )}
        <ActionLink href={match.broadcastUrl} label={labels.broadcast} icon="radio" />
        <ActionLink href={match.highlightUrl} label={labels.highlight} icon="external" />
      </div>
    </article>
  );
}

function GoalEventSummary({ match }: { match: Match }) {
  const homeGoals = getTeamGoals(match, match.homeTeam);
  const awayGoals = getTeamGoals(match, match.awayTeam);

  return (
    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-3 text-xs font-bold text-slate-500">
      <GoalList goals={homeGoals} align="right" />
      <span aria-hidden="true" />
      <GoalList goals={awayGoals} align="left" />
    </div>
  );
}

function GoalList({ goals, align }: { goals: NonNullable<Match["goalEvents"]>; align: "left" | "right" }) {
  if (!goals.length) return <span />;

  return (
    <div className={classNames("grid gap-1", align === "right" ? "justify-items-end text-right" : "justify-items-start text-left")}>
      {goals.map((goal, index) => (
        <span key={`${goal.playerName}-${goal.minute}-${index}`} className="max-w-full truncate">
          {formatGoalMinute(goal)} {goal.playerName}
        </span>
      ))}
    </div>
  );
}

function getTeamGoals(match: Match, teamName: string) {
  return (match.goalEvents ?? []).filter((goal) => isSameTeam(goal.team, teamName));
}

function formatGoalMinute(goal: NonNullable<Match["goalEvents"]>[number]) {
  return goal.stoppageTime ? `${goal.minute}+${goal.stoppageTime}'` : `${goal.minute}'`;
}

function isSameTeam(goalTeam: string, matchTeam: string) {
  const goal = normalizeTeamName(goalTeam);
  const match = normalizeTeamName(matchTeam);
  return match.includes(goal) || goal.includes(match);
}

function normalizeTeamName(name: string) {
  const aliases: Record<string, string> = {
    gangwon: "\uac15\uc6d0",
    ulsan: "\uc6b8\uc0b0",
    pohang: "\ud3ec\ud56d",
    jeju: "\uc81c\uc8fc",
    jeonbuk: "\uc804\ubd81",
    seoul: "\uc11c\uc6b8",
    daejeon: "\ub300\uc804",
    incheon: "\uc778\ucc9c",
    anyang: "\uc548\uc591",
    gimcheon: "\uae40\ucc9c",
    gwangju: "\uad11\uc8fc",
    bucheon: "\ubd80\ucc9c"
  };
  const normalized = name
    .toLowerCase()
    .replace(/fc|hd|hyundai|hana|citizen|steelers|united|sk/g, "")
    .replace(/[\s-]+/g, "")
    .trim();
  const alias = Object.entries(aliases).find(([key]) => normalized.includes(key));

  return alias ? alias[1] : name.replace(/FC|HD|\ud604\ub300|\uc0c1\ubb34|\uc2a4\ud2f8\ub7ec\uc2a4|\ud558\ub098\uc2dc\ud2f0\uc98c/g, "").trim();
}

function TeamName({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <p className={classNames("text-lg font-black sm:text-xl", align === "right" ? "text-right" : "text-left", isGangwon(name) ? "text-gangwon-orange" : "text-gangwon-navy")}>
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
