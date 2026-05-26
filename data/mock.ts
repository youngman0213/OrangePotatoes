import type { ClubPost, Coach, LeaguePlayerStat, Match, NewsItem, Player, Standing, Video } from "@/types";

export const gangwonTeamName = "\uac15\uc6d0FC";

export const matches: Match[] = [
  {
    id: "m1",
    competition: "K\ub9ac\uadf81",
    round: "15R",
    date: "2026-05-24T16:30:00+09:00",
    homeTeam: "\uac15\uc6d0FC",
    awayTeam: "FC\uc11c\uc6b8",
    venue: "\uac15\ub989\ud558\uc774\uc6d0",
    isHome: true,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    ticketUrl: "https://ticket.interpark.com",
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: null
  },
  {
    id: "m2",
    competition: "K\ub9ac\uadf81",
    round: "14R",
    date: "2026-05-17T19:00:00+09:00",
    homeTeam: "\uac15\uc6d0FC",
    awayTeam: "\uc6b8\uc0b0 HD",
    venue: "\uac15\ub989\ud558\uc774\uc6d0",
    isHome: true,
    status: "finished",
    homeScore: 2,
    awayScore: 0,
    ticketUrl: null,
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: "https://www.youtube.com/user/gangwonfc"
  }
];

export const news: NewsItem[] = [
  {
    id: "n1",
    title: "\uac15\uc6d0FC \ucd5c\uc2e0 \ub274\uc2a4",
    source: "Google News",
    url: "https://news.google.com/search?q=%EA%B0%95%EC%9B%90FC&hl=ko&gl=KR&ceid=KR%3Ako",
    summary: "\uc2e4\uc81c \ub274\uc2a4 \uc5f0\ub3d9\uc774 \uc2e4\ud328\ud560 \uacbd\uc6b0 \ud45c\uc2dc\ub418\ub294 \ub300\uccb4 \ub370\uc774\ud130\uc785\ub2c8\ub2e4.",
    publishedAt: "2026-05-20T09:00:00+09:00",
    category: "other",
    thumbnailUrl: ""
  }
];

export const clubPosts: ClubPost[] = [
  {
    id: "c1",
    title: "\uac15\uc6d0FC \uacf5\uc2dd \ud648\ud398\uc774\uc9c0",
    platform: "official",
    url: "https://www.gangwon-fc.com/",
    publishedAt: "2026-05-20T09:00:00+09:00",
    type: "\uacf5\uc9c0"
  }
];

export const videos: Video[] = [
  {
    id: "v1",
    title: "\uac15\uc6d0FC \uacf5\uc2dd \uc720\ud29c\ube0c",
    youtubeId: "",
    thumbnailUrl: "",
    publishedAt: "2026-05-20T09:00:00+09:00",
    category: "other"
  }
];

export const standings: Standing[] = [
  { rank: 1, team: "FC\uc11c\uc6b8", played: 15, wins: 10, draws: 2, losses: 3, goalsFor: 27, goalsAgainst: 12, goalDifference: 15, points: 32, recentForm: ["W", "W", "W", "D", "W"] },
  { rank: 2, team: "\uc6b8\uc0b0 HD", played: 15, wins: 8, draws: 2, losses: 5, goalsFor: 22, goalsAgainst: 20, goalDifference: 2, points: 26, recentForm: ["W", "L", "W", "W", "L"] },
  { rank: 3, team: "\uc804\ubd81 \ud604\ub300", played: 15, wins: 7, draws: 5, losses: 3, goalsFor: 21, goalsAgainst: 12, goalDifference: 9, points: 26, recentForm: ["W", "W", "D", "W", "W"] },
  { rank: 4, team: "\uac15\uc6d0FC", played: 15, wins: 6, draws: 6, losses: 3, goalsFor: 19, goalsAgainst: 10, goalDifference: 9, points: 24, recentForm: ["W", "W", "D", "D", "W"] },
  { rank: 5, team: "\ud3ec\ud56d \uc2a4\ud2f8\ub7ec\uc2a4", played: 15, wins: 6, draws: 4, losses: 5, goalsFor: 12, goalsAgainst: 12, goalDifference: 0, points: 22, recentForm: ["L", "W", "D", "W", "L"] },
  { rank: 6, team: "\uc778\ucc9c \uc720\ub098\uc774\ud2f0\ub4dc", played: 15, wins: 6, draws: 3, losses: 6, goalsFor: 21, goalsAgainst: 17, goalDifference: 4, points: 21, recentForm: ["W", "L", "W", "L", "W"] },
  { rank: 7, team: "FC\uc548\uc591", played: 15, wins: 4, draws: 8, losses: 3, goalsFor: 19, goalsAgainst: 16, goalDifference: 3, points: 20, recentForm: ["D", "W", "D", "D", "L"] },
  { rank: 8, team: "\uc81c\uc8fc SK", played: 15, wins: 5, draws: 3, losses: 7, goalsFor: 13, goalsAgainst: 16, goalDifference: -3, points: 18, recentForm: ["L", "L", "W", "D", "L"] },
  { rank: 9, team: "\ubd80\ucc9cFC1995", played: 15, wins: 4, draws: 5, losses: 6, goalsFor: 11, goalsAgainst: 15, goalDifference: -4, points: 17, recentForm: ["W", "D", "L", "L", "W"] },
  { rank: 10, team: "\ub300\uc804\ud558\ub098\uc2dc\ud2f0\uc98c", played: 15, wins: 4, draws: 4, losses: 7, goalsFor: 17, goalsAgainst: 16, goalDifference: 1, points: 16, recentForm: ["L", "D", "W", "L", "L"] },
  { rank: 11, team: "\uae40\ucc9c \uc0c1\ubb34", played: 15, wins: 2, draws: 8, losses: 5, goalsFor: 15, goalsAgainst: 21, goalDifference: -6, points: 14, recentForm: ["D", "L", "D", "L", "D"] },
  { rank: 12, team: "\uad11\uc8fcFC", played: 15, wins: 1, draws: 4, losses: 10, goalsFor: 7, goalsAgainst: 37, goalDifference: -30, points: 7, recentForm: ["L", "L", "L", "D", "L"] }
];

export const playerStats: LeaguePlayerStat[] = [
  { rank: 1, name: "\ubb34\uace0\uc0ac", club: "INCHEON", goals: 7, assists: 1, attackPoints: 8, yellowCards: 1, redCards: 0, played: 12 },
  { rank: 2, name: "\uc774\ud638\uc7ac", club: "POHANG", goals: 7, assists: 0, attackPoints: 7, yellowCards: 3, redCards: 0, played: 15 },
  { rank: 3, name: "\uc57c\uace0", club: "ULSAN", goals: 6, assists: 0, attackPoints: 6, yellowCards: 1, redCards: 0, played: 12 },
  { rank: 4, name: "\uc544\ubd80\ub2ec\ub77c", club: "GANGWON", goals: 6, assists: 0, attackPoints: 6, yellowCards: 2, redCards: 0, played: 15 },
  { rank: 5, name: "\uae40\ub300\uc6d0", club: "GANGWON", goals: 5, assists: 3, attackPoints: 8, yellowCards: 3, redCards: 0, played: 15, bestEleven: 5, mom: 6 },
  { rank: 5, name: "\ub9d0\ucef9", club: "ULSAN", goals: 5, assists: 2, attackPoints: 7, yellowCards: 0, redCards: 0, played: 9 },
  { rank: 6, name: "\uac15\ud22c\uc9c0", club: "GANGWON", goals: 2, assists: 0, attackPoints: 2, yellowCards: 4, redCards: 0, played: 12, bestEleven: 2 },
  { rank: 7, name: "\ubaa8\uc7ac\ud604", club: "GANGWON", goals: 2, assists: 3, attackPoints: 5, yellowCards: 3, redCards: 0, played: 15, bestEleven: 2 },
  { rank: 8, name: "\ucd5c\ubcd1\ucc2c", club: "GANGWON", goals: 1, assists: 0, attackPoints: 1, yellowCards: 0, redCards: 0, played: 11 },
  { rank: 9, name: "\uac15\uc900\ud601", club: "GANGWON", goals: 0, assists: 2, attackPoints: 2, yellowCards: 4, redCards: 0, played: 15 },
  { rank: 1, name: "\uc11c\uc9c4\uc218", club: "DAEJEON HANA", goals: 2, assists: 3, attackPoints: 5, yellowCards: 0, redCards: 0, played: 11 },
  { rank: 2, name: "\ub9c8\ud14c\uc6b0\uc2a4", club: "ANYANG", goals: 4, assists: 3, attackPoints: 7, yellowCards: 0, redCards: 0, played: 13 },
  { rank: 3, name: "\uc774\ub3d9\uacbd", club: "ULSAN", goals: 5, assists: 3, attackPoints: 8, yellowCards: 3, redCards: 0, played: 14 },
  { rank: 4, name: "\uc774\uc815\ud0dd", club: "GIMCHEON", goals: 0, assists: 3, attackPoints: 3, yellowCards: 0, redCards: 0, played: 14 },
  { rank: 5, name: "\uc1a1\ubbfc\uaddc", club: "SEOUL", goals: 3, assists: 3, attackPoints: 6, yellowCards: 0, redCards: 0, played: 15 }
];

export const players: Player[] = [
  { id: "fallback-player-1", name: "\uae40\ub300\uc6d0", number: 7, position: "FW", profileUrl: "https://www.gangwon-fc.com/squad/player" },
  { id: "fallback-player-2", name: "\ubc15\uccad\ud6a8", number: 1, position: "GK", profileUrl: "https://www.gangwon-fc.com/squad/player" }
];

export const coaches: Coach[] = [
  { id: "fallback-coach-1", name: "\uc815\uacbd\ud638", role: "\uac10\ub3c5", profileUrl: "https://www.gangwon-fc.com/squad/coach" }
];
