import { comparePlayerRecords, compareStandings } from "@/lib/kleague/compare";
import { fetchNaverCombinedPlayerRecords, fetchNaverPlayerRecords, fetchNaverStandings } from "@/lib/kleague/naver";
import { fetchOfficialPlayerRecords, fetchOfficialStandings } from "@/lib/kleague/official";
import { GANGWON_TEAM_CODE, KLEAGUE_NAME, KLEAGUE_SEASON, type GangwonSummary, type PlayerSortField, type VerifiedApiResponse, type VerifiedPlayerRecord, type VerifiedStanding } from "@/lib/kleague/types";

export async function getVerifiedStandings(seasonCode = KLEAGUE_SEASON): Promise<VerifiedApiResponse<VerifiedStanding>> {
  try {
    const [officialRows, naverRows] = await Promise.all([
      safeRead(() => fetchOfficialStandings(seasonCode)),
      safeRead(() => fetchNaverStandings(seasonCode))
    ]);
    const compared = compareStandings(officialRows, naverRows);

    return makeResponse(seasonCode, compared.data, compared.mismatches, naverRows.length ? "naver-sports" : officialRows.length ? "kleague-official" : "none");
  } catch (error) {
    return makeResponse(seasonCode, [], [], "none", getErrorMessage(error));
  }
}

export async function getVerifiedPlayerRecords({
  seasonCode = KLEAGUE_SEASON,
  teamCode,
  sortField = "goals",
  pageSize = 200
}: {
  seasonCode?: string;
  teamCode?: string;
  sortField?: PlayerSortField;
  pageSize?: number;
} = {}): Promise<VerifiedApiResponse<VerifiedPlayerRecord>> {
  try {
    const [officialRows, naverRows] = await Promise.all([
      safeRead(() => fetchOfficialPlayerRecords(seasonCode)),
      safeRead(() => fetchNaverPlayerRecords({ seasonCode, teamCode, sortField, pageSize }))
    ]);
    const compared = comparePlayerRecords(filterPlayerRows(officialRows, teamCode), naverRows);

    return makeResponse(seasonCode, compared.data, compared.mismatches, naverRows.length ? "naver-sports" : officialRows.length ? "kleague-official" : "none");
  } catch (error) {
    return makeResponse(seasonCode, [], [], "none", getErrorMessage(error));
  }
}

export async function getVerifiedCombinedPlayerRecords(seasonCode = KLEAGUE_SEASON): Promise<VerifiedApiResponse<VerifiedPlayerRecord>> {
  try {
    const [officialRows, naverRows] = await Promise.all([
      safeRead(() => fetchOfficialPlayerRecords(seasonCode)),
      safeRead(() => fetchNaverCombinedPlayerRecords(seasonCode))
    ]);
    const compared = comparePlayerRecords(officialRows, naverRows);

    return makeResponse(seasonCode, compared.data, compared.mismatches, naverRows.length ? "naver-sports" : officialRows.length ? "kleague-official" : "none");
  } catch (error) {
    return makeResponse(seasonCode, [], [], "none", getErrorMessage(error));
  }
}

export async function getVerifiedGangwonSummary(seasonCode = KLEAGUE_SEASON): Promise<VerifiedApiResponse<GangwonSummary>> {
  const [standings, goals, assists, yellowCards] = await Promise.all([
    getVerifiedStandings(seasonCode),
    getVerifiedPlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "goals", pageSize: 100 }),
    getVerifiedPlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "assists", pageSize: 100 }),
    getVerifiedPlayerRecords({ seasonCode, teamCode: GANGWON_TEAM_CODE, sortField: "yellowCards", pageSize: 100 })
  ]);
  const mismatches = [...standings.mismatches, ...goals.mismatches, ...assists.mismatches, ...yellowCards.mismatches];
  const errors = [standings.error, goals.error, assists.error, yellowCards.error].filter(Boolean).join(" / ") || undefined;

  return makeResponse(
    seasonCode,
    [{
      standing: standings.data.find((row) => row.teamCode === GANGWON_TEAM_CODE) ?? null,
      topScorers: goals.data.filter((row) => row.goals > 0).slice(0, 5),
      topAssists: assists.data.filter((row) => row.assists > 0).slice(0, 5),
      topYellowCards: yellowCards.data.filter((row) => row.yellowCards > 0).slice(0, 5)
    }],
    mismatches,
    standings.displaySource === "naver-sports" || goals.displaySource === "naver-sports" ? "naver-sports" : "kleague-official",
    errors
  );
}

function makeResponse<T>(
  seasonCode: string,
  data: T[],
  mismatches: VerifiedApiResponse<T>["mismatches"],
  displaySource: VerifiedApiResponse<T>["displaySource"],
  error?: string
): VerifiedApiResponse<T> {
  return {
    source: "kleague-data-portal",
    verifiedBy: "naver-sports",
    displaySource,
    seasonCode,
    league: KLEAGUE_NAME,
    updatedAt: new Date().toISOString(),
    hasMismatch: mismatches.length > 0,
    mismatches,
    data,
    ...(error ? { error } : {})
  };
}

async function safeRead<T>(reader: () => Promise<T[]>): Promise<T[]> {
  try {
    return await reader();
  } catch (error) {
    console.error(`[kleague] Source read failed: ${getErrorMessage(error)}`);
    return [];
  }
}

function filterPlayerRows(rows: Awaited<ReturnType<typeof fetchOfficialPlayerRecords>>, teamCode?: string) {
  if (!teamCode) return rows;
  return rows.filter((row) => row.teamCode === teamCode);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown K League data error.";
}
