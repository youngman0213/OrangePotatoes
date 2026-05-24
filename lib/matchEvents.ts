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

export async function fetchMatchGoalEvents(match: Match): Promise<MatchGoalEvent[]> {
  const params = parseKLeagueMatchId(match.id);
  if (!params || match.status !== "finished") return [];

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
    .sort((a, b) => (a.minute + (a.stoppageTime ?? 0) / 100) - (b.minute + (b.stoppageTime ?? 0) / 100));
}

function parseKLeagueMatchId(id: string) {
  const matched = id.match(/^kleague-match-(\d{4})-(\d+)-(\d+)-(\d+)$/);
  if (!matched) return null;

  return {
    year: matched[1],
    leagueId: matched[2],
    gameId: matched[3],
    meetSeq: matched[4]
  };
}

function toGoalEvent(event: KLeagueMatchEvent): MatchGoalEvent {
  const half = getHalf(event.halfType);
  const rawMinute = Number(event.timeMin ?? 0);
  const roundedMinute = rawMinute + (Number(event.timeSec ?? 0) > 0 ? 1 : 0);
  const baseMinute = half === "second" ? roundedMinute + 45 : roundedMinute;
  const minute = roundedMinute > 45 && half !== "second" ? 45 : baseMinute;
  const stoppageTime = roundedMinute > 45 && half !== "second" ? roundedMinute - 45 : undefined;

  return {
    team: event.teamName ?? "",
    playerName: event.playerName ?? "",
    minute,
    stoppageTime,
    half
  };
}

function getHalf(value: number | undefined): MatchGoalEvent["half"] {
  if (value === 1) return "first";
  if (value === 2) return "second";
  if (value === 3) return "extra";
  return "unknown";
}
