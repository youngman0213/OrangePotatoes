import { makePlayerKey, makeTeamKey } from "@/lib/kleague/normalize";
import type { KLeagueMismatch, SourcePlayerRecord, SourceStanding, VerifiedPlayerRecord, VerifiedStanding } from "@/lib/kleague/types";

const standingFields: Array<keyof Pick<SourceStanding, "rank" | "played" | "wins" | "draws" | "losses" | "goalsFor" | "goalsAgainst" | "goalDifference" | "points">> = [
  "rank",
  "played",
  "wins",
  "draws",
  "losses",
  "goalsFor",
  "goalsAgainst",
  "goalDifference",
  "points"
];

const playerFields: Array<keyof Pick<SourcePlayerRecord, "rank" | "goals" | "assists" | "attackPoints" | "matches" | "yellowCards" | "redCards" | "bestEleven" | "mom">> = [
  "rank",
  "goals",
  "assists",
  "attackPoints",
  "matches",
  "yellowCards",
  "redCards",
  "bestEleven",
  "mom"
];

export function compareStandings(officialRows: SourceStanding[], naverRows: SourceStanding[]) {
  const checkedAt = new Date().toISOString();
  const officialMap = new Map(officialRows.map((row) => [makeTeamKey(row.teamCode, row.teamName), row]));
  const naverMap = new Map(naverRows.map((row) => [makeTeamKey(row.teamCode, row.teamName), row]));
  const keys = Array.from(naverMap.size ? naverMap.keys() : officialMap.keys());
  const data: VerifiedStanding[] = [];
  const mismatches: KLeagueMismatch[] = [];

  for (const key of keys) {
    const officialValue = officialMap.get(key) ?? null;
    const naverValue = naverMap.get(key) ?? null;
    const applied = naverValue ?? officialValue;
    if (!applied) continue;

    const rowMismatches = officialValue && naverValue ? collectStandingMismatches(officialValue, naverValue, checkedAt) : [];
    mismatches.push(...rowMismatches);
    data.push({
      ...applied,
      source: naverValue ? "naver-sports" : "kleague-official",
      verifiedBy: "naver-sports",
      hasMismatch: rowMismatches.length > 0,
      mismatches: rowMismatches,
      officialValue,
      naverValue
    });
  }

  logMismatches(mismatches);

  return {
    data: data.sort((a, b) => a.rank - b.rank),
    mismatches
  };
}

export function comparePlayerRecords(officialRows: SourcePlayerRecord[], naverRows: SourcePlayerRecord[]) {
  const checkedAt = new Date().toISOString();
  const officialMap = new Map(officialRows.map((row) => [makePlayerKey(row.playerId, row.playerName, row.teamCode, row.teamName), row]));
  const naverMap = new Map(naverRows.map((row) => [makePlayerKey(row.playerId, row.playerName, row.teamCode, row.teamName), row]));
  const keys = Array.from(naverMap.size ? naverMap.keys() : officialMap.keys());
  const data: VerifiedPlayerRecord[] = [];
  const mismatches: KLeagueMismatch[] = [];

  for (const key of keys) {
    const officialValue = officialMap.get(key) ?? null;
    const naverValue = naverMap.get(key) ?? null;
    const applied = naverValue ?? officialValue;
    if (!applied) continue;

    const rowMismatches = officialValue && naverValue ? collectPlayerMismatches(officialValue, naverValue, checkedAt) : [];
    mismatches.push(...rowMismatches);
    data.push({
      ...applied,
      source: naverValue ? "naver-sports" : "kleague-official",
      verifiedBy: "naver-sports",
      hasMismatch: rowMismatches.length > 0,
      mismatches: rowMismatches,
      officialValue,
      naverValue
    });
  }

  logMismatches(mismatches);

  return {
    data,
    mismatches
  };
}

function collectStandingMismatches(officialValue: SourceStanding, naverValue: SourceStanding, checkedAt: string) {
  return standingFields.flatMap((field) => {
    if (officialValue[field] === naverValue[field]) return [];

    return [{
      type: "standings_mismatch" as const,
      teamName: naverValue.teamName,
      field,
      officialValue: officialValue[field],
      naverValue: naverValue[field],
      appliedValue: naverValue[field],
      checkedAt
    }];
  });
}

function collectPlayerMismatches(officialValue: SourcePlayerRecord, naverValue: SourcePlayerRecord, checkedAt: string) {
  return playerFields.flatMap((field) => {
    if (officialValue[field] === naverValue[field]) return [];

    return [{
      type: "player_record_mismatch" as const,
      teamName: naverValue.teamName,
      playerName: naverValue.playerName,
      field,
      officialValue: officialValue[field],
      naverValue: naverValue[field],
      appliedValue: naverValue[field],
      checkedAt
    }];
  });
}

function logMismatches(mismatches: KLeagueMismatch[]) {
  if (!mismatches.length) return;
  console.warn(`[kleague-compare] ${mismatches.length} mismatch(es): ${JSON.stringify(mismatches.slice(0, 20))}`);
}
