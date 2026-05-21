export const KLEAGUE_SEASON = "2026";
export const KLEAGUE_NAME = "K League 1";
export const GANGWON_TEAM_CODE = "21";
export const CACHE_SECONDS = 60 * 60 * 6;
export const CACHE_MS = CACHE_SECONDS * 1000;

export type DataSource = "kleague-official" | "naver-sports";
export type RecordKind = "standings" | "player-records" | "gangwon-summary";
export type PlayerSortField = "goals" | "assists" | "offencePoints" | "yellowCards";

export interface KLeagueMismatch {
  type: "standings_mismatch" | "player_record_mismatch";
  teamName?: string;
  playerName?: string;
  field: string;
  officialValue: number | string | null;
  naverValue: number | string | null;
  appliedValue: number | string | null;
  checkedAt: string;
}

export interface VerifiedApiResponse<T> {
  source: "kleague-data-portal";
  verifiedBy: "naver-sports";
  displaySource: "naver-sports" | "kleague-official" | "none";
  seasonCode: string;
  league: typeof KLEAGUE_NAME;
  updatedAt: string;
  hasMismatch: boolean;
  mismatches: KLeagueMismatch[];
  data: T[];
  error?: string;
}

export interface SourceStanding {
  source: DataSource;
  rank: number;
  teamCode?: string;
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

export interface SourcePlayerRecord {
  source: DataSource;
  rank: number;
  playerId?: string;
  playerName: string;
  teamCode?: string;
  teamName: string;
  goals: number;
  assists: number;
  attackPoints: number;
  matches: number;
  yellowCards: number;
  redCards: number;
}

export interface VerifiedStanding extends Omit<SourceStanding, "source"> {
  source: DataSource;
  verifiedBy: "naver-sports";
  hasMismatch: boolean;
  mismatches: KLeagueMismatch[];
  officialValue: SourceStanding | null;
  naverValue: SourceStanding | null;
}

export interface VerifiedPlayerRecord extends Omit<SourcePlayerRecord, "source"> {
  source: DataSource;
  verifiedBy: "naver-sports";
  hasMismatch: boolean;
  mismatches: KLeagueMismatch[];
  officialValue: SourcePlayerRecord | null;
  naverValue: SourcePlayerRecord | null;
}

export interface GangwonSummary {
  standing: VerifiedStanding | null;
  topScorers: VerifiedPlayerRecord[];
  topAssists: VerifiedPlayerRecord[];
  topYellowCards: VerifiedPlayerRecord[];
}
