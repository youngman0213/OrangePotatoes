const NAVER_API_BASE = "https://api-gw.sports.naver.com/statistics/categories/kleague/seasons";
const DEFAULT_SEASON = "2026";
const GANGWON_TEAM_CODE = "21";
const CACHE_SECONDS = 60 * 60 * 6;
const CACHE_MS = CACHE_SECONDS * 1000;

type CacheEntry<T> = {
  data: T;
  cachedAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __naverKleagueCache?: Map<string, CacheEntry<unknown>>;
  __naverKleaguePending?: Map<string, Promise<unknown>>;
};

const naverCache = globalCache.__naverKleagueCache ?? new Map<string, CacheEntry<unknown>>();
const naverPending = globalCache.__naverKleaguePending ?? new Map<string, Promise<unknown>>();

globalCache.__naverKleagueCache = naverCache;
globalCache.__naverKleaguePending = naverPending;

export interface KLeagueApiResponse<T> {
  source: "naver-sports";
  seasonCode: string;
  updatedAt: string;
  data: T[];
  error?: string;
}

export interface KLeagueStanding {
  rank: number;
  teamCode: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: string[];
}

export interface KLeaguePlayerRecord {
  rank: number;
  playerName: string;
  teamCode: string;
  teamName: string;
  goals: number;
  assists: number;
  attackPoints: number;
  matches: number;
  yellowCards: number;
  redCards: number;
}

export interface GangwonSummary {
  standing: KLeagueStanding | null;
  topScorers: KLeaguePlayerRecord[];
  topAssists: KLeaguePlayerRecord[];
  topYellowCards: KLeaguePlayerRecord[];
}

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

export async function getKLeagueStandings(seasonCode = DEFAULT_SEASON): Promise<KLeagueApiResponse<KLeagueStanding>> {
  try {
    const url = `${NAVER_API_BASE}/${seasonCode}/teams?sortField=rank&sortDirection=asc&page=1&pageSize=20`;
    const json = await fetchNaverJson<NaverTeamStatsResponse>(url);
    const rows = json.result?.seasonTeamStats;

    if (!Array.isArray(rows)) {
      logUnexpected("standings", json);
      return emptyResponse(seasonCode, "Naver standings response shape changed.");
    }

    return {
      source: "naver-sports",
      seasonCode,
      updatedAt: new Date().toISOString(),
      data: rows.map(normalizeStanding).sort((a, b) => a.rank - b.rank)
    };
  } catch (error) {
    return emptyResponse(seasonCode, getErrorMessage(error));
  }
}

export async function getKLeaguePlayerRecords({
  seasonCode = DEFAULT_SEASON,
  teamCode,
  sortField = "goals",
  pageSize = 200
}: {
  seasonCode?: string;
  teamCode?: string;
  sortField?: "goals" | "assists" | "offencePoints" | "yellowCards";
  pageSize?: number;
} = {}): Promise<KLeagueApiResponse<KLeaguePlayerRecord>> {
  try {
    const params = new URLSearchParams({
      sortField,
      sortDirection: "desc",
      page: "1",
      pageSize: String(pageSize)
    });

    if (teamCode) params.set("teamCode", teamCode);

    const url = `${NAVER_API_BASE}/${seasonCode}/players?${params.toString()}`;
    const json = await fetchNaverJson<NaverPlayerStatsResponse>(url);
    const rows = json.result?.seasonPlayerStats;

    if (!Array.isArray(rows)) {
      logUnexpected("player-records", json);
      return emptyResponse(seasonCode, "Naver player records response shape changed.");
    }

    return {
      source: "naver-sports",
      seasonCode,
      updatedAt: new Date().toISOString(),
      data: rows.map((row, index) => normalizePlayerRecord(row, index))
    };
  } catch (error) {
    return emptyResponse(seasonCode, getErrorMessage(error));
  }
}

export async function getGangwonSummary(seasonCode = DEFAULT_SEASON): Promise<KLeagueApiResponse<GangwonSummary>> {
  const [standings, scorers, assists, yellowCards] = await Promise.all([
    getKLeagueStandings(seasonCode),
    getKLeaguePlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "goals", pageSize: 100 }),
    getKLeaguePlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "assists", pageSize: 100 }),
    getKLeaguePlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "yellowCards", pageSize: 100 })
  ]);

  const error = [standings.error, scorers.error, assists.error, yellowCards.error].filter(Boolean).join(" / ") || undefined;
  const standing = standings.data.find((row) => row.teamCode === GANGWON_TEAM_CODE) ?? null;

  return {
    source: "naver-sports",
    seasonCode,
    updatedAt: new Date().toISOString(),
    data: [
      {
        standing,
        topScorers: scorers.data.filter((row) => row.goals > 0).slice(0, 5),
        topAssists: assists.data.filter((row) => row.assists > 0).slice(0, 5),
        topYellowCards: yellowCards.data.filter((row) => row.yellowCards > 0).slice(0, 5)
      }
    ],
    ...(error ? { error } : {})
  };
}

export async function getCombinedPlayerRecords(seasonCode = DEFAULT_SEASON) {
  const [goals, assists, gangwon] = await Promise.all([
    getKLeaguePlayerRecords({ seasonCode, sortField: "goals", pageSize: 200 }),
    getKLeaguePlayerRecords({ seasonCode, sortField: "assists", pageSize: 200 }),
    getKLeaguePlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "offencePoints", pageSize: 100 })
  ]);

  return {
    source: "naver-sports" as const,
    seasonCode,
    updatedAt: new Date().toISOString(),
    data: mergePlayerRecords([...goals.data, ...assists.data, ...gangwon.data]),
    error: [goals.error, assists.error, gangwon.error].filter(Boolean).join(" / ") || undefined
  };
}

function normalizeStanding(row: NaverTeamStatRow): KLeagueStanding {
  const goalsFor = toNumber(row.goals);
  const goalsAgainst = toNumber(row.goalsConceded);

  return {
    rank: toNumber(row.rank),
    teamCode: row.teamId ?? "",
    teamName: normalizeTeamName(row.teamId, row.teamName ?? row.teamShortName ?? ""),
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
}

function normalizePlayerRecord(row: NaverPlayerStatRow, index: number): KLeaguePlayerRecord {
  return {
    rank: index + 1,
    playerName: row.playerName || row.fullName || "",
    teamCode: row.teamId ?? "",
    teamName: normalizeTeamName(row.teamId, row.teamName ?? row.teamShortName ?? ""),
    goals: toNumber(row.goals),
    assists: toNumber(row.assists),
    attackPoints: toNumber(row.offencePoints),
    matches: toNumber(row.matchesPlayed),
    yellowCards: toNumber(row.yellowCards),
    redCards: toNumber(row.redCards)
  };
}

function mergePlayerRecords(rows: KLeaguePlayerRecord[]) {
  const merged = new Map<string, KLeaguePlayerRecord>();

  for (const row of rows) {
    const key = `${row.playerName}-${row.teamCode}`;
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

async function fetchNaverJson<T>(url: string): Promise<T> {
  const cached = naverCache.get(url) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && now - cached.cachedAt < CACHE_MS) {
    return cached.data;
  }

  if (!isNaverRefreshWindow()) {
    if (cached) {
      return cached.data;
    }

    throw new Error("Naver Sports cache is empty and refresh is blocked before 12:00 KST.");
  }

  const pending = naverPending.get(url) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const request = requestNaverJson<T>(url)
    .then((data) => {
      naverCache.set(url, { data, cachedAt: Date.now() });
      return data;
    })
    .catch((error) => {
      if (cached) {
        naverCache.set(url, { data: cached.data, cachedAt: Date.now() });
        console.error(`[naverKleague] Keeping stale cache after request failure: ${getErrorMessage(error)}`);
        return cached.data;
      }

      throw error;
    })
    .finally(() => {
      naverPending.delete(url);
    });

  naverPending.set(url, request);
  return request;
}

async function requestNaverJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: CACHE_SECONDS },
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

function normalizeTeamName(teamCode: string | undefined, teamName: string) {
  const teamMap: Record<string, string> = {
    "01": "\uc6b8\uc0b0 HD",
    "03": "\ud3ec\ud56d \uc2a4\ud2f8\ub7ec\uc2a4",
    "04": "\uc81c\uc8fc SK",
    "05": "\uc804\ubd81 \ud604\ub300",
    "09": "FC\uc11c\uc6b8",
    "10": "\ub300\uc804\ud558\ub098\uc2dc\ud2f0\uc98c",
    "18": "\uc778\ucc9c \uc720\ub098\uc774\ud2f0\ub4dc",
    "21": "\uac15\uc6d0FC",
    "22": "\uad11\uc8fcFC",
    "26": "\ubd80\ucc9cFC1995",
    "27": "FC\uc548\uc591",
    "35": "\uae40\ucc9c \uc0c1\ubb34"
  };

  return teamMap[teamCode ?? ""] ?? teamName;
}

function splitRecentForm(form: string | null | undefined) {
  return (form ?? "")
    .split("")
    .filter((value) => value === "W" || value === "D" || value === "L");
}

function isNaverRefreshWindow() {
  const koreaHour = (new Date().getUTCHours() + 9) % 24;
  return koreaHour >= 12;
}

function toNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function emptyResponse<T>(seasonCode: string, error: string): KLeagueApiResponse<T> {
  return {
    source: "naver-sports",
    seasonCode,
    updatedAt: new Date().toISOString(),
    data: [],
    error
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Naver Sports API error.";
}

function logUnexpected(label: string, payload: unknown) {
  const preview = JSON.stringify(payload).slice(0, 800);
  console.error(`[naverKleague] Unexpected ${label} response: ${preview}`);
}
