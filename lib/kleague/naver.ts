import { cachedExternalJson } from "@/lib/kleague/cache";
import { GANGWON_TEAM_CODE, KLEAGUE_SEASON, type PlayerSortField, type SourcePlayerRecord, type SourceStanding } from "@/lib/kleague/types";
import { normalizePlayerName, normalizeTeamName, splitRecentForm, toNumber } from "@/lib/kleague/normalize";

const NAVER_API_BASE = "https://api-gw.sports.naver.com/statistics/categories/kleague/seasons";

interface NaverTeamStatsResponse {
  result?: {
    seasonTeamStats?: NaverTeamStatRow[];
  };
}

interface NaverPlayerStatsResponse {
  result?: {
    seasonPlayerStats?: NaverPlayerStatRow[];
  };
}

interface NaverTeamStatRow {
  teamId?: string;
  teamName?: string;
  teamShortName?: string;
  rank?: number | null;
  matchesPlayed?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals?: number | null;
  goalsConceded?: number | null;
  goalsDifference?: number | null;
  points?: number | null;
  lastFiveGames?: string | null;
}

interface NaverPlayerStatRow {
  playerId?: string;
  playerName?: string;
  fullName?: string;
  teamId?: string;
  teamName?: string;
  teamShortName?: string;
  goals?: number | null;
  assists?: number | null;
  offencePoints?: number | null;
  yellowCards?: number | null;
  redCards?: number | null;
  matchesPlayed?: number | null;
}

export async function fetchNaverStandings(seasonCode = KLEAGUE_SEASON): Promise<SourceStanding[]> {
  const url = `${NAVER_API_BASE}/${seasonCode}/teams?sortField=rank&sortDirection=asc&page=1&pageSize=20`;
  const json = await cachedExternalJson(`naver-standings-${seasonCode}`, () => requestJson<NaverTeamStatsResponse>(url));
  const rows = json.result?.seasonTeamStats;

  if (!Array.isArray(rows)) {
    logUnexpected("standings", json);
    return [];
  }

  return rows.map((row) => {
    const goalsFor = toNumber(row.goals);
    const goalsAgainst = toNumber(row.goalsConceded);
    const teamCode = row.teamId ?? "";

    return {
      source: "naver-sports",
      rank: toNumber(row.rank),
      teamCode,
      teamName: normalizeTeamName(teamCode, row.teamName ?? row.teamShortName ?? ""),
      played: toNumber(row.matchesPlayed),
      wins: toNumber(row.wins),
      draws: toNumber(row.draws),
      losses: toNumber(row.losses),
      goalsFor,
      goalsAgainst,
      goalDifference: typeof row.goalsDifference === "number" ? row.goalsDifference : goalsFor - goalsAgainst,
      points: toNumber(row.points),
      recentForm: splitRecentForm(row.lastFiveGames)
    };
  });
}

export async function fetchNaverPlayerRecords({
  seasonCode = KLEAGUE_SEASON,
  teamCode,
  sortField = "goals",
  pageSize = 200
}: {
  seasonCode?: string;
  teamCode?: string;
  sortField?: PlayerSortField;
  pageSize?: number;
} = {}): Promise<SourcePlayerRecord[]> {
  const params = new URLSearchParams({
    sortField,
    sortDirection: "desc",
    page: "1",
    pageSize: String(pageSize)
  });

  if (teamCode) params.set("teamCode", teamCode);

  const url = `${NAVER_API_BASE}/${seasonCode}/players?${params.toString()}`;
  const key = `naver-players-${seasonCode}-${teamCode ?? "all"}-${sortField}-${pageSize}`;
  const json = await cachedExternalJson(key, () => requestJson<NaverPlayerStatsResponse>(url));
  const rows = json.result?.seasonPlayerStats;

  if (!Array.isArray(rows)) {
    logUnexpected("player-records", json);
    return [];
  }

  return rows.map((row, index) => {
    const teamCodeValue = row.teamId ?? "";

    return {
      source: "naver-sports",
      rank: index + 1,
      playerId: row.playerId,
      playerName: normalizePlayerName(row.playerName || row.fullName || ""),
      teamCode: teamCodeValue,
      teamName: normalizeTeamName(teamCodeValue, row.teamName ?? row.teamShortName ?? ""),
      goals: toNumber(row.goals),
      assists: toNumber(row.assists),
      attackPoints: toNumber(row.offencePoints),
      matches: toNumber(row.matchesPlayed),
      yellowCards: toNumber(row.yellowCards),
      redCards: toNumber(row.redCards)
    };
  });
}

export async function fetchNaverCombinedPlayerRecords(seasonCode = KLEAGUE_SEASON) {
  const [goals, assists, gangwon] = await Promise.all([
    fetchNaverPlayerRecords({ seasonCode, sortField: "goals", pageSize: 200 }),
    fetchNaverPlayerRecords({ seasonCode, sortField: "assists", pageSize: 200 }),
    fetchNaverPlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "offencePoints", pageSize: 100 })
  ]);

  return mergePlayerRecords([...goals, ...assists, ...gangwon]);
}

function mergePlayerRecords(rows: SourcePlayerRecord[]) {
  const merged = new Map<string, SourcePlayerRecord>();

  for (const row of rows) {
    const key = row.playerId || `${row.playerName}-${row.teamCode || row.teamName}`;
    const current = merged.get(key);

    if (!current) {
      merged.set(key, row);
      continue;
    }

    merged.set(key, {
      ...current,
      rank: Math.min(current.rank, row.rank),
      goals: Math.max(current.goals, row.goals),
      assists: Math.max(current.assists, row.assists),
      attackPoints: Math.max(current.attackPoints, row.attackPoints),
      matches: Math.max(current.matches, row.matches),
      yellowCards: Math.max(current.yellowCards, row.yellowCards),
      redCards: Math.max(current.redCards, row.redCards)
    });
  }

  return Array.from(merged.values());
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 },
    headers: {
      Accept: "application/json",
      Referer: "https://m.sports.naver.com/",
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Naver Sports API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function logUnexpected(label: string, payload: unknown) {
  const preview = JSON.stringify(payload).slice(0, 800);
  console.error(`[kleague-naver] Unexpected ${label} response: ${preview}`);
}
