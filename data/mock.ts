import type { ClubPost, Coach, Match, NewsItem, Player, Standing, Video } from "@/types";

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

export const standings: Standing[] = [];

export const players: Player[] = [
  { id: "fallback-player-1", name: "\uae40\ub300\uc6d0", number: 7, position: "FW", profileUrl: "https://www.gangwon-fc.com/squad/player" },
  { id: "fallback-player-2", name: "\ubc15\uccad\ud6a8", number: 1, position: "GK", profileUrl: "https://www.gangwon-fc.com/squad/player" }
];

export const coaches: Coach[] = [
  { id: "fallback-coach-1", name: "\uc815\uacbd\ud638", role: "\uac10\ub3c5", profileUrl: "https://www.gangwon-fc.com/squad/coach" }
];
