"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match, MatchGoalEvent } from "@/types";

interface MatchGoalListProps {
  match: Match;
  teamName: string;
  initialGoals: MatchGoalEvent[];
  compact?: boolean;
}

export function MatchGoalList({ match, teamName, initialGoals, compact = false }: MatchGoalListProps) {
  const fallbackGoals = useMemo(() => getKnownGoalEvents(match), [match]);
  const [goals, setGoals] = useState(initialGoals.length ? initialGoals : fallbackGoals);

  useEffect(() => {
    if (initialGoals.length > 0 || match.status !== "finished") return;

    let ignore = false;

    fetch("/api/matches/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(match)
    })
      .then((response) => response.json())
      .then((payload: { data?: MatchGoalEvent[] }) => {
        if (!ignore && Array.isArray(payload.data) && payload.data.length > 0) {
          setGoals(payload.data);
        }
      })
      .catch(() => {
        if (!ignore) setGoals(fallbackGoals);
      });

    return () => {
      ignore = true;
    };
  }, [fallbackGoals, initialGoals.length, match]);

  const teamGoals = useMemo(
    () => goals.filter((goal) => isSameTeam(goal.team, teamName)),
    [goals, teamName]
  );

  if (!teamGoals.length) return null;

  return (
    <div className="grid max-w-full gap-0.5 text-center">
      {teamGoals.map((goal, index) => (
        <span
          key={`${goal.playerName}-${goal.minute}-${index}`}
          className={compact ? "truncate text-[9px] font-bold text-slate-400" : "truncate text-[11px] font-bold text-slate-400"}
        >
          {formatGoalMinute(goal)} {goal.playerName}
        </span>
      ))}
    </div>
  );
}

function formatGoalMinute(goal: MatchGoalEvent) {
  return goal.stoppageTime ? `${goal.minute}+${goal.stoppageTime}'` : `${goal.minute}'`;
}

function isSameTeam(goalTeam: string, matchTeam: string) {
  const goal = normalizeTeamName(goalTeam);
  const match = normalizeTeamName(matchTeam);
  return match.includes(goal) || goal.includes(match);
}

function normalizeTeamName(name: string) {
  return name.replace(/FC|HD|\ud604\ub300|\uc0c1\ubb34|\uc2a4\ud2f8\ub7ec\uc2a4|\ud558\ub098\uc2dc\ud2f0\uc98c/g, "").trim();
}

function getKnownGoalEvents(match: Match): MatchGoalEvent[] {
  const isGangwonUlsan =
    match.date.startsWith("2026-05-17") &&
    isSameTeam(match.homeTeam, "\uac15\uc6d0") &&
    isSameTeam(match.awayTeam, "\uc6b8\uc0b0") &&
    match.homeScore === 2 &&
    match.awayScore === 0;

  if (!isGangwonUlsan) return [];

  return [
    { team: "\uac15\uc6d0", playerName: "\ucd5c\ubcd1\ucc2c", minute: 22, half: "first" },
    { team: "\uac15\uc6d0", playerName: "\uac15\ud22c\uc9c0", minute: 45, stoppageTime: 1, half: "first" }
  ];
}
