export type MatchStatus = "scheduled" | "live" | "finished";
export type NewsCategory =
  | "match"
  | "player"
  | "transfer"
  | "club"
  | "other";
export type ClubPlatform = "official" | "instagram" | "youtube" | "facebook" | "ticket" | "md" | "event";
export type VideoCategory = "highlight" | "interview" | "training" | "behind" | "other";
export type PlayerPosition = "GK" | "DF" | "MF" | "FW";

export interface Match {
  id: string;
  competition: string;
  round: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  isHome: boolean;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  ticketUrl: string | null;
  broadcastUrl: string | null;
  highlightUrl: string | null;
  detailUrl?: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  category: NewsCategory;
  thumbnailUrl: string;
}

export interface ClubPost {
  id: string;
  title: string;
  platform: ClubPlatform;
  url: string;
  publishedAt: string;
  type: string;
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  publishedAt: string;
  category: VideoCategory;
  channelTitle?: string;
  description?: string;
}

export interface Standing {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: Array<"W" | "D" | "L">;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  birthDate?: string;
  nationality?: string;
  imageUrl?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
  profileUrl?: string;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  profileUrl?: string;
}

export interface LeaguePlayerStat {
  rank: number;
  name: string;
  club: string;
  goals: number;
  assists: number;
  attackPoints: number;
  yellowCards: number;
  redCards: number;
  played: number;
}
