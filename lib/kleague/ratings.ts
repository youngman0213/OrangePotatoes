import * as cheerio from "cheerio";
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
  gameId: string;
  meetSeq: string;
};

const kLeagueBaseUrl = "https://www.kleague.com";
const minimumRatingMatches = 3;

export async function getGangwonAverageRatings(seasonCode = KLEAGUE_SEASON): Promise<GangwonPlayerRating[]> {
  return cachedExternalJson(`gangwon-average-ratings-${seasonCode}`, () => fetchGangwonAverageRatings(seasonCode));
}

async function fetchGangwonAverageRatings(seasonCode: string): Promise<GangwonPlayerRating[]> {
  const matches = await fetchOfficialMatches();
  const finishedLeagueMatches = matches
    .filter((match) => match.status === "finished" && match.competition.includes("K리그1"))
    .filter((match) => match.id.includes(`kleague-match-${seasonCode}-`))
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

  const response = await fetch(createPdfDownloadUrl(identity), {
    next: { revalidate: 60 * 60 * 12 },
    headers: {
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`K League rating page request failed: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const table = $(".player-table").eq(match.isHome ? 0 : 1);
  const rows: RatingAccumulator[] = [];

  table.find("tbody tr").each((_, row) => {
    const cells = $(row).find("td").toArray().map((cell) => $(cell));
    if (cells.length < 13) return;

    const number = toNumber(cells[0].text());
    const position = cleanText(cells[1].text());
    const playerName = cleanPlayerName(cells[2].clone().children().remove().end().text());
    const rating = toRating(cells[12].text());

    if (!number || !playerName || !position || !rating || rating <= 0) return;

    rows.push({
      playerKey: `${playerName}-${number}-${position}`,
      playerName,
      number,
      position,
      latestRating: rating,
      latestMatchDate: match.date,
      totalRating: rating,
      ratingMatches: 1
    });
  });

  return rows;
}

function parseMatchIdentity(id: string): MatchIdentity | null {
  const matched = id.match(/^kleague-match-(\d{4})-(\d+)-(\d+)-(\d+)$/);
  if (!matched) return null;

  return {
    year: matched[1],
    gameId: matched[3],
    meetSeq: matched[4]
  };
}

function createPdfDownloadUrl(identity: MatchIdentity) {
  return `${kLeagueBaseUrl}/match/pdfDownload.do?gameId=${identity.gameId}&meetSeq=${identity.meetSeq}&year=${identity.year}`;
}

function cleanPlayerName(value: string) {
  return cleanText(value)
    .replace(/\(\d{2}\)/g, "")
    .replace(/[★☆↓↑]/g, "")
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
