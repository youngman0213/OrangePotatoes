import type { Match, MatchGoalEvent } from "@/types";

const kLeagueMatchInfoUrl = "https://www.kleague.com/api/ddf/match/matchInfo.do";

interface KLeagueMatchEvent {
  eventName?: string;
  teamName?: string;
  playerName?: string;
  halfType?: number;
  timeMin?: number;
  timeSec?: number;
}

interface KLeagueMatchInfoResponse {
  data?: {
    firstHalf?: KLeagueMatchEvent[];
    secondHalf?: KLeagueMatchEvent[];
    extraTimeFirstHalf?: KLeagueMatchEvent[];
    extraTimeSecondHalf?: KLeagueMatchEvent[];
  };
}

interface KLeagueMatchParams {
  year: string;
  gameId: string;
  meetSeq: string;
}

export async function attachGoalEvents(matches: Match[]) {
  const settled = await Promise.allSettled(
    matches.map(async (match) => ({
      ...match,
      goalEvents: match.status === "finished" ? await fetchMatchGoalEvents(match) : []
    }))
  );

  return settled.map((result, index) => result.status === "fulfilled" ? result.value : matches[index]);
}

async function fetchMatchGoalEvents(match: Match): Promise<MatchGoalEvent[]> {
  const params = parseKLeagueMatchParams(match);
  if (!params) return [];

  const response = await fetch(kLeagueMatchInfoUrl, {
    method: "POST",
    next: { revalidate: 60 * 60 * 6 },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "OrangePotatoesFanHub/1.0"
    },
    body: new URLSearchParams({
      year: params.year,
      meetSeq: params.meetSeq,
      gameId: params.gameId
    })
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as KLeagueMatchInfoResponse;
  const events = [
    ...(payload.data?.firstHalf ?? []),
    ...(payload.data?.secondHalf ?? []),
    ...(payload.data?.extraTimeFirstHalf ?? []),
    ...(payload.data?.extraTimeSecondHalf ?? [])
  ];

  return events
    .filter((event) => event.eventName === "\ub4dd\uc810" && event.playerName)
    .map(toGoalEvent)
    .sort((a, b) => a.minute + (a.stoppageTime ?? 0) / 100 - (b.minute + (b.stoppageTime ?? 0) / 100));
}

function parseKLeagueMatchParams(match: Match): KLeagueMatchParams | null {
  const url = match.detailUrl ?? match.highlightUrl;
  if (url) {
    try {
      const parsed = new URL(url);
      const year = parsed.searchParams.get("year");
      const gameId = parsed.searchParams.get("gameId");
      const meetSeq = parsed.searchParams.get("meetSeq");
      if (year && gameId && meetSeq) return { year, gameId, meetSeq };
    } catch {
      return null;
    }
  }

  const matched = match.id.match(/^kleague-match-(\d{4})-(\d+)-(\d+)-(\d+)$/);
  return matched ? { year: matched[1], gameId: matched[3], meetSeq: matched[4] } : null;
}

function toGoalEvent(event: KLeagueMatchEvent): MatchGoalEvent {
  const roundedMinute = Number(event.timeMin ?? 0) + (Number(event.timeSec ?? 0) > 0 ? 1 : 0);
  const isSecondHalf = event.halfType === 2;
  const displayMinute = isSecondHalf ? Math.min(roundedMinute + 45, 90) : Math.min(roundedMinute, 45);
  const stoppageTime = roundedMinute > 45 ? roundedMinute - 45 : undefined;

  return {
    team: event.teamName ?? "",
    playerName: event.playerName ?? "",
    minute: displayMinute,
    stoppageTime
  };
}
