import type { Match, MatchGoalEvent } from "@/types";

const kLeagueMatchInfoUrl = "https://www.kleague.com/api/ddf/match/matchInfo.do";
const kLeagueScheduleUrl = "https://www.kleague.com/getScheduleList.do";
const gangwonTeamId = "K21";

interface KLeagueMatchEvent {
  eventName?: string;
  teamName?: string;
  playerId?: string;
  playerName?: string;
  halfType?: number;
  timeMin?: number;
  timeSec?: number;
}

interface KLeagueMatchInfoResponse {
  data?: {
    firstHalf?: KLeagueMatchEvent[];
    secondHalf?: KLeagueMatchEvent[];
    firstHalfList?: KLeagueMatchEvent[];
    secondHalfList?: KLeagueMatchEvent[];
    extraTimeFirstHalf?: KLeagueMatchEvent[];
    extraTimeSecondHalf?: KLeagueMatchEvent[];
    extraTimeFirstHalfList?: KLeagueMatchEvent[];
    extraTimeSecondHalfList?: KLeagueMatchEvent[];
  };
}

interface KLeagueScheduleItem {
  year: number;
  leagueId: number;
  gameId: number;
  gameDate: string;
  meetSeq: number;
  homeTeamName: string;
  awayTeamName: string;
}

interface KLeagueScheduleResponse {
  data?: {
    scheduleList?: KLeagueScheduleItem[];
  };
}

interface KLeagueMatchParams {
  year: string;
  gameId: string;
  meetSeq: string;
}

export async function fetchMatchGoalEvents(match: Match): Promise<MatchGoalEvent[]> {
  if (match.status !== "finished") return [];
  const params = await resolveKLeagueMatchParams(match);
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
    ...(payload.data?.firstHalfList ?? []),
    ...(payload.data?.secondHalfList ?? []),
    ...(payload.data?.extraTimeFirstHalf ?? []),
    ...(payload.data?.extraTimeSecondHalf ?? []),
    ...(payload.data?.extraTimeFirstHalfList ?? []),
    ...(payload.data?.extraTimeSecondHalfList ?? [])
  ];

  return events
    .filter((event) => event.eventName === "\ub4dd\uc810" && event.playerName)
    .map(toGoalEvent)
    .sort((a, b) => (a.minute + (a.stoppageTime ?? 0) / 100) - (b.minute + (b.stoppageTime ?? 0) / 100));
}

async function resolveKLeagueMatchParams(match: Match): Promise<KLeagueMatchParams | null> {
  return parseKLeagueMatchId(match.id) ?? fetchKLeagueMatchParamsBySchedule(match).catch(() => null);
}

function parseKLeagueMatchId(id: string): KLeagueMatchParams | null {
  const matched = id.match(/^kleague-match-(\d{4})-(\d+)-(\d+)-(\d+)$/);
  if (!matched) return null;

  return {
    year: matched[1],
    gameId: matched[3],
    meetSeq: matched[4]
  };
}

async function fetchKLeagueMatchParamsBySchedule(match: Match): Promise<KLeagueMatchParams | null> {
  const matchDay = match.date.slice(0, 10);
  const [year = "2026", month = "01"] = matchDay.split("-");
  const response = await fetch(kLeagueScheduleUrl, {
    method: "POST",
    next: { revalidate: 60 * 60 * 6 },
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent": "OrangePotatoesFanHub/1.0"
    },
    body: JSON.stringify({
      leagueId: "1",
      year,
      month,
      teamId: gangwonTeamId
    })
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as KLeagueScheduleResponse;
  const schedule = (payload.data?.scheduleList ?? []).find((item) => {
    const itemDay = item.gameDate.replace(/\./g, "-");
    return (
      itemDay === matchDay &&
      isSameTeamName(item.homeTeamName, match.homeTeam) &&
      isSameTeamName(item.awayTeamName, match.awayTeam)
    );
  });

  if (!schedule) return null;

  return {
    year: String(schedule.year),
    gameId: String(schedule.gameId),
    meetSeq: String(schedule.meetSeq)
  };
}

function isSameTeamName(a: string, b: string) {
  const left = normalizeTeamName(a);
  const right = normalizeTeamName(b);
  return left.includes(right) || right.includes(left);
}

function normalizeTeamName(name: string) {
  return name.replace(/FC|HD|\ud604\ub300|\uc0c1\ubb34|\uc2a4\ud2f8\ub7ec\uc2a4|\ud558\ub098\uc2dc\ud2f0\uc98c/g, "").trim();
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
