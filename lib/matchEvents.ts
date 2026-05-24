import type { Match, MatchGoalEvent } from "@/types";

const kLeagueMatchInfoUrl = "https://www.kleague.com/api/ddf/match/matchInfo.do";
const kLeaguePlayerRecordUrl = "https://www.kleague.com/record/player.do";

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
    extraTimeFirstHalf?: KLeagueMatchEvent[];
    extraTimeSecondHalf?: KLeagueMatchEvent[];
  };
}

export async function fetchMatchGoalEvents(match: Match): Promise<MatchGoalEvent[]> {
  const params = parseKLeagueMatchId(match.id);
  if (!params || match.status !== "finished") return [];
  const playerNameMap = await fetchPlayerNameMap(params.year).catch(() => new Map<string, string>());

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
    .map((event) => toGoalEvent(event, playerNameMap))
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

async function fetchPlayerNameMap(year: string) {
  const url = `${kLeaguePlayerRecordUrl}?leagueId=1&year=${year}&recordType=player`;
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 12 },
    headers: {
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) return new Map<string, string>();

  const html = await response.text();
  const map = new Map<string, string>();
  const pattern = /playerDetail\.do\?playerId=(\d+)['"][^>]*>\s*([^<]+)\s*</g;
  let matched: RegExpExecArray | null;

  while ((matched = pattern.exec(html))) {
    map.set(matched[1], decodeHtml(matched[2].trim()));
  }

  return map;
}

function toGoalEvent(event: KLeagueMatchEvent, playerNameMap: Map<string, string>): MatchGoalEvent {
  const half = getHalf(event.halfType);
  const rawMinute = Number(event.timeMin ?? 0);
  const roundedMinute = rawMinute + (Number(event.timeSec ?? 0) > 0 ? 1 : 0);
  const baseMinute = half === "second" ? roundedMinute + 45 : roundedMinute;
  const minute = roundedMinute > 45 && half !== "second" ? 45 : baseMinute;
  const stoppageTime = roundedMinute > 45 && half !== "second" ? roundedMinute - 45 : undefined;

  return {
    team: event.teamName ?? "",
    playerName: normalizePlayerName(event.playerName ?? "", event.playerId, playerNameMap),
    minute,
    stoppageTime,
    half
  };
}

function normalizePlayerName(name: string, playerId: string | undefined, playerNameMap: Map<string, string>) {
  const namesByEnglish: Record<string, string> = {
    "MARKO TUCI": "\uac15\ud22c\uc9c0",
    "MARKO TUCIC": "\uac15\ud22c\uc9c0",
    "BYEONGCHAN CHOE": "\ucd5c\ubcd1\ucc2c",
    "BYUNGCHAN CHOE": "\ucd5c\ubcd1\ucc2c"
  };

  if (playerId && playerNameMap.has(playerId)) return playerNameMap.get(playerId) ?? name;
  return namesByEnglish[name.toUpperCase()] ?? name;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getHalf(value: number | undefined): MatchGoalEvent["half"] {
  if (value === 1) return "first";
  if (value === 2) return "second";
  if (value === 3) return "extra";
  return "unknown";
}
