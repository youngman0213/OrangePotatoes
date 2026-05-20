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
  { rank: 0, team: "\uac15\uc6d0FC", played: 15, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: ["D", "D", "D", "D", "D"] }
];

export const playerStats: LeaguePlayerStat[] = [
  { rank: 4, name: "ABDALLAH HLEIHIL", club: "GANGWON", goals: 6, assists: 0, attackPoints: 6, yellowCards: 2, redCards: 0, played: 15 },
  { rank: 9, name: "DAEWON KIM", club: "GANGWON", goals: 5, assists: 3, attackPoints: 8, yellowCards: 3, redCards: 0, played: 15 },
  { rank: 1, name: "STEFAN MUGOSA", club: "INCHEON", goals: 7, assists: 1, attackPoints: 8, yellowCards: 1, redCards: 0, played: 12 },
  { rank: 2, name: "Hojae LEE", club: "POHANG", goals: 7, assists: 0, attackPoints: 7, yellowCards: 3, redCards: 0, played: 15 },
  { rank: 3, name: "Yago CARIELLO RIBEIRO", club: "ULSAN", goals: 6, assists: 0, attackPoints: 6, yellowCards: 1, redCards: 0, played: 12 },
  { rank: 8, name: "Donggyeong LEE", club: "ULSAN", goals: 5, assists: 3, attackPoints: 8, yellowCards: 3, redCards: 0, played: 14 },
  { rank: 24, name: "Minkyu SONG", club: "SEOUL", goals: 3, assists: 3, attackPoints: 6, yellowCards: 0, redCards: 0, played: 15 }
];

export const players: Player[] = [
  { id: "fallback-player-1", name: "\uae40\ub300\uc6d0", number: 7, position: "FW", profileUrl: "https://www.gangwon-fc.com/squad/player" },
  { id: "fallback-player-2", name: "\ubc15\uccad\ud6a8", number: 1, position: "GK", profileUrl: "https://www.gangwon-fc.com/squad/player" }
];

export const coaches: Coach[] = [
  { id: "fallback-coach-1", name: "\uc815\uacbd\ud638", role: "\uac10\ub3c5", profileUrl: "https://www.gangwon-fc.com/squad/coach" }
];
