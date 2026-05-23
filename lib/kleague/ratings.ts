import { cachedExternalJson } from "@/lib/kleague/cache";
import { KLEAGUE_SEASON, type GangwonPlayerRating } from "@/lib/kleague/types";
import { fetchOfficialMatches } from "@/lib/officialFeed";
import type { Match } from "@/types";

type RatingAccumulator = {
  playerKey: string;
  playerName: string;
  number: number;
  position: string;
  totalRating: number;
  ratingMatches: number;
  latestRating: number;
  latestMatchDate: string;
};

type MatchIdentity = {
  year: string;
  leagueId: string;
  gameId: string;
  meetSeq: string;
};

type KLeagueMatchRecordPlayer = {
  teamName?: string | null;
  playerId?: string | null;
  playerName?: string | null;
  backNo?: string | number | null;
  playerPos?: string | null;
  playerPoint?: number | string | null;
};

type KLeagueMatchRecordDetailResponse = {
  resultCode?: string;
  data?: {
    listA?: KLeagueMatchRecordPlayer[];
    listH?: KLeagueMatchRecordPlayer[];
  };
};

const kLeagueBaseUrl = "https://www.kleague.com";
const gangwonTeamName = "\uac15\uc6d0FC";
const minimumRatingMatches = 3;

const teamNameToId: Record<string, string> = {
  "\uc6b8\uc0b0 HD": "K01",
  "\ud3ec\ud56d": "K03",
  "\uc81c\uc8fc": "K04",
  "\uc804\ubd81": "K05",
  "FC\uc11c\uc6b8": "K09",
  "\ub300\uc804": "K10",
  "\uc778\ucc9c": "K18",
  "\uac15\uc6d0FC": "K21",
  "\uad11\uc8fc": "K22",
  "\ubd80\ucc9c": "K26",
  "\uc548\uc591": "K27",
  "\uae40\ucc9c": "K35"
};

export async function getGangwonAverageRatings(seasonCode = KLEAGUE_SEASON): Promise<GangwonPlayerRating[]> {
  return cachedExternalJson(`gangwon-average-ratings-v2-${seasonCode}`, () => fetchGangwonAverageRatings(seasonCode));
}

async function fetchGangwonAverageRatings(seasonCode: string): Promise<GangwonPlayerRating[]> {
  const matches = await fetchOfficialMatches();
  const finishedLeagueMatches = matches
    .filter((match) => match.status === "finished" && match.id.includes(`kleague-match-${seasonCode}-`))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const settled = await Promise.allSettled(finishedLeagueMatches.map(fetchMatchRatings));
  const rows = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const byPlayer = new Map<string, RatingAccumulator>();

  for (const row of rows) {
    const current = byPlayer.get(row.playerKey);

    if (!current) {
      byPlayer.set(row.playerKey, { ...row, totalRating: row.latestRating, ratingMatches: 1 });
      continue;
    }

    current.totalRating += row.latestRating;
    current.ratingMatches += 1;

    if (new Date(row.latestMatchDate).getTime() >= new Date(current.latestMatchDate).getTime()) {
      current.latestRating = row.latestRating;
      current.latestMatchDate = row.latestMatchDate;
    }
  }

  return Array.from(byPlayer.values())
    .filter((row) => row.ratingMatches >= minimumRatingMatches)
    .map((row) => ({
      rank: 0,
      playerKey: row.playerKey,
      playerName: row.playerName,
      number: row.number,
      position: row.position,
      averageRating: roundRating(row.totalRating / row.ratingMatches),
      ratingMatches: row.ratingMatches,
      latestRating: row.latestRating,
      latestMatchDate: row.latestMatchDate
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.ratingMatches - a.ratingMatches || b.latestRating - a.latestRating)
    .slice(0, 5)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

async function fetchMatchRatings(match: Match): Promise<RatingAccumulator[]> {
  const identity = parseMatchIdentity(match.id);
  if (!identity) return [];

  const response = await fetch(`${kLeagueBaseUrl}/api/ddf/match/getMatchRecordAllDetail.do`, {
    method: "POST",
    next: { revalidate: 60 * 60 * 12 },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "OrangePotatoesFanHub/1.0"
    },
    body: createMatchRecordBody(identity, match)
  });

  if (!response.ok) {
    throw new Error(`K League rating API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as KLeagueMatchRecordDetailResponse;
  if (payload.resultCode !== "200") return [];

  const players = match.isHome ? payload.data?.listH ?? [] : payload.data?.listA ?? [];
  const rows: RatingAccumulator[] = [];

  for (const player of players) {
    const number = toNumber(String(player.backNo ?? ""));
    const position = cleanText(player.playerPos ?? "");
    const playerName = cleanPlayerName(player.playerName ?? "");
    const rating = toRating(String(player.playerPoint ?? ""));

    if (!number || !playerName || !position || !rating || rating <= 0) continue;

    rows.push({
      playerKey: player.playerId ? `${player.playerId}-${number}` : `${playerName}-${number}-${position}`,
      playerName,
      number,
      position,
      latestRating: rating,
      latestMatchDate: match.date,
      totalRating: rating,
      ratingMatches: 1
    });
  }

  return rows;
}

function parseMatchIdentity(id: string): MatchIdentity | null {
  const matched = id.match(/^kleague-match-(\d{4})-(\d+)-(\d+)-(\d+)$/);
  if (!matched) return null;

  return {
    year: matched[1],
    leagueId: matched[2],
    gameId: matched[3],
    meetSeq: matched[4]
  };
}

function createMatchRecordBody(identity: MatchIdentity, match: Match) {
  const roundId = match.round.match(/\d+/)?.[0] ?? "";

  return new URLSearchParams({
    year: identity.year,
    yearTst: identity.year,
    meetSeq: identity.meetSeq,
    gameId: identity.gameId,
    gameIdTst: identity.gameId,
    homeTeam: getTeamId(match.homeTeam),
    awayTeam: getTeamId(match.awayTeam),
    roundId
  }).toString();
}

function getTeamId(teamName: string) {
  return teamNameToId[teamName] ?? (teamName === "\uac15\uc6d0" ? teamNameToId[gangwonTeamName] : "");
}

function cleanPlayerName(value: string) {
  return cleanText(value)
    .replace(/\(\d{2}\)/g, "")
    .replace(/[☆★]/g, "")
    .replace(/\(C\)/g, "")
    .trim();
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toNumber(value: string) {
  const parsed = Number(cleanText(value).replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toRating(value: string) {
  const parsed = Number(cleanText(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundRating(value: number) {
  return Math.round(value * 100) / 100;
}
