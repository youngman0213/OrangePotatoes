import * as cheerio from "cheerio";
import { cachedExternalJson } from "@/lib/kleague/cache";
import { KLEAGUE_SEASON, type SourcePlayerRecord, type SourceStanding } from "@/lib/kleague/types";
import { normalizePlayerName, normalizeTeamCode, normalizeTeamName, toNumber } from "@/lib/kleague/normalize";

const KLEAGUE_PORTAL_URL = "https://portal.kleague.com/user/loginById.do?portalGuest=rstNE9zxjdkUC9kbUA08XQ%3D%3D";
const KLEAGUE_PLAYER_URL = "https://www.kleague.com/record/player.do";

export async function fetchOfficialStandings(seasonCode = KLEAGUE_SEASON): Promise<SourceStanding[]> {
  const html = await cachedExternalJson(`official-standings-${seasonCode}`, () => requestText(KLEAGUE_PORTAL_URL));
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);
  const startIndex = lines.findIndex((line) => line.includes("\ud300\uc21c\uc704\ud45c"));

  if (startIndex === -1) {
    logUnexpected("standings", lines.slice(0, 80));
    return [];
  }

  const standings: SourceStanding[] = [];

  for (const line of lines.slice(startIndex)) {
    if (line.includes("\ucd5c\uadfc 6\uacbd\uae30")) break;

    const matched = line.match(/^(\d{1,2})\s+([\uac00-\ud7a3A-Za-z0-9 ]+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)$/);
    if (!matched) continue;

    const [, rank, team, played, points, wins, draws, losses, goalsFor, goalsAgainst, goalDifference] = matched;
    const teamCode = normalizeTeamCode(team);

    standings.push({
      source: "kleague-official",
      rank: Number(rank),
      teamCode,
      teamName: normalizeTeamName(teamCode, team),
      played: Number(played),
      wins: Number(wins),
      draws: Number(draws),
      losses: Number(losses),
      goalsFor: Number(goalsFor),
      goalsAgainst: Number(goalsAgainst),
      goalDifference: Number(goalDifference),
      points: Number(points),
      recentForm: []
    });
  }

  return standings;
}

export async function fetchOfficialPlayerRecords(seasonCode = KLEAGUE_SEASON): Promise<SourcePlayerRecord[]> {
  const html = await cachedExternalJson(`official-player-records-${seasonCode}`, () => requestText(KLEAGUE_PLAYER_URL));
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);
  const clubs = [
    "DAEJEON HANA",
    "SEOUL",
    "ULSAN",
    "JEONBUK",
    "GANGWON",
    "POHANG",
    "INCHEON",
    "ANYANG",
    "JEJU",
    "BUCHEON",
    "GIMCHEON",
    "GWANGJU"
  ];
  const records: SourcePlayerRecord[] = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index];
    const matchedClub = clubs.find((club) => line.endsWith(` ${club}`));
    const rankMatch = line.match(/^(\d{1,3})\s+(.+)$/);

    if (!rankMatch || !matchedClub) continue;

    const numbers = lines
      .slice(index + 1, index + 4)
      .join(" ")
      .split(" ")
      .map(Number);

    if (numbers.length < 14 || numbers.some((value) => Number.isNaN(value))) continue;

    const rank = Number(rankMatch[1]);
    const nameWithClub = rankMatch[2];
    const rawName = nameWithClub.slice(0, -matchedClub.length).trim();
    const teamCode = officialClubCode(matchedClub);

    records.push({
      source: "kleague-official",
      rank,
      playerName: normalizePlayerName(rawName),
      teamCode,
      teamName: normalizeTeamName(teamCode, matchedClub),
      goals: toNumber(numbers[0]),
      assists: toNumber(numbers[1]),
      attackPoints: toNumber(numbers[2]),
      matches: toNumber(numbers[11]),
      yellowCards: toNumber(numbers[8]),
      redCards: toNumber(numbers[9])
    });
  }

  if (!records.length) {
    logUnexpected("player-records", lines.slice(70, 140));
  }

  return records;
}

async function requestText(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 },
    headers: {
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`K League official request failed: ${response.status}`);
  }

  return response.text();
}

function officialClubCode(club: string) {
  const clubMap: Record<string, string> = {
    SEOUL: "09",
    ULSAN: "01",
    JEONBUK: "05",
    GANGWON: "21",
    POHANG: "03",
    INCHEON: "18",
    ANYANG: "27",
    JEJU: "04",
    BUCHEON: "26",
    "DAEJEON HANA": "10",
    GIMCHEON: "35",
    GWANGJU: "22"
  };

  return clubMap[club] ?? "";
}

function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function logUnexpected(label: string, payload: unknown) {
  const preview = JSON.stringify(payload).slice(0, 800);
  console.error(`[kleague-official] Unexpected ${label} response: ${preview}`);
}
