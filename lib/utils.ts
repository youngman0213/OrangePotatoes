import type { Match, MatchStatus } from "@/types";

export const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    ...options
  }).format(new Date(date));

export const formatTime = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(date));

export const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));

export const statusLabel: Record<MatchStatus, string> = {
  scheduled: "\uc608\uc815",
  live: "\uc9c4\ud589\uc911",
  finished: "\uc885\ub8cc"
};

export const statusTone: Record<MatchStatus, string> = {
  scheduled: "bg-slate-100 text-slate-700",
  live: "bg-red-50 text-red-600 ring-1 ring-red-100",
  finished: "bg-gangwon-navy text-white"
};

export const getMatchMonth = (date: string) => `${new Date(date).getMonth() + 1}\uc6d4`;

export const sortByDateAsc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const sortByDateDesc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const sortByPublishedDesc = <T extends { publishedAt: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export const getNextMatch = (matches: Match[]) =>
  sortByDateAsc(matches).find((match) => match.status !== "finished");

export const getRecentMatch = (matches: Match[]) =>
  [...matches]
    .filter((match) => match.status === "finished")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

export const isGangwon = (team: string) =>
  team === "\uac15\uc6d0FC" || team === "GANGWON" || team.includes("\uac15\uc6d0");
