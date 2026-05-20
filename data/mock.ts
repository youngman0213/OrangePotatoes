import type { ClubPost, Match, NewsItem, Player, Standing, Video } from "@/types";

export const gangwonTeamName = "강원FC";

export const matches: Match[] = [
  {
    id: "m1",
    competition: "K리그1",
    round: "15R",
    date: "2026-05-24T16:30:00+09:00",
    homeTeam: "강원FC",
    awayTeam: "FC서울",
    venue: "강릉종합운동장",
    isHome: true,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    ticketUrl: "https://www.ticketlink.co.kr",
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: null
  },
  {
    id: "m2",
    competition: "K리그1",
    round: "14R",
    date: "2026-05-17T19:00:00+09:00",
    homeTeam: "수원FC",
    awayTeam: "강원FC",
    venue: "수원종합운동장",
    isHome: false,
    status: "finished",
    homeScore: 1,
    awayScore: 2,
    ticketUrl: null,
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: "https://www.youtube.com"
  },
  {
    id: "m3",
    competition: "코리아컵",
    round: "16강",
    date: "2026-05-20T19:30:00+09:00",
    homeTeam: "강원FC",
    awayTeam: "부산아이파크",
    venue: "춘천송암스포츠타운",
    isHome: true,
    status: "live",
    homeScore: 0,
    awayScore: 0,
    ticketUrl: "https://www.ticketlink.co.kr",
    broadcastUrl: "https://www.youtube.com",
    highlightUrl: null
  },
  {
    id: "m4",
    competition: "K리그1",
    round: "13R",
    date: "2026-05-10T14:00:00+09:00",
    homeTeam: "강원FC",
    awayTeam: "대전하나시티즌",
    venue: "강릉종합운동장",
    isHome: true,
    status: "finished",
    homeScore: 3,
    awayScore: 1,
    ticketUrl: null,
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: "https://www.youtube.com"
  },
  {
    id: "m5",
    competition: "K리그1",
    round: "16R",
    date: "2026-06-01T19:00:00+09:00",
    homeTeam: "울산 HD",
    awayTeam: "강원FC",
    venue: "문수축구경기장",
    isHome: false,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    ticketUrl: "https://www.ticketlink.co.kr",
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: null
  }
];

export const news: NewsItem[] = [
  {
    id: "n1",
    title: "강원FC, 서울전 앞두고 공격 전환 속도 점검",
    source: "스포츠데일리",
    url: "https://example.com/news/gangwon-preview",
    summary: "다가오는 홈 경기에서 강원FC가 전방 압박과 빠른 측면 전개를 핵심 과제로 준비한다.",
    publishedAt: "2026-05-20T09:00:00+09:00",
    category: "match-preview",
    thumbnailUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "n2",
    title: "수원 원정 승리, 중원 압박이 만든 값진 승점 3",
    source: "풋볼리포트",
    url: "https://example.com/news/gangwon-review",
    summary: "강원FC는 원정 경기에서 후반 집중력을 앞세워 역전 흐름을 지켜냈다.",
    publishedAt: "2026-05-18T11:20:00+09:00",
    category: "match-review",
    thumbnailUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "n3",
    title: "강원FC 측면 자원 복귀 임박, 로테이션 폭 넓어진다",
    source: "강원스포츠",
    url: "https://example.com/news/injury",
    summary: "부상에서 회복 중인 측면 자원이 팀 훈련에 합류하며 다음 일정 출전 가능성을 높였다.",
    publishedAt: "2026-05-16T16:40:00+09:00",
    category: "transfer-injury",
    thumbnailUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "n4",
    title: "주장 인터뷰: 홈 팬 앞에서 더 높은 에너지 보여주겠다",
    source: "K풋볼뉴스",
    url: "https://example.com/news/interview",
    summary: "선수단은 빡빡한 일정 속에서도 홈 경기 분위기를 반전의 계기로 삼겠다는 의지를 전했다.",
    publishedAt: "2026-05-15T08:10:00+09:00",
    category: "interview",
    thumbnailUrl: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "n5",
    title: "강원FC 홈경기 운영 동선 일부 변경 안내",
    source: "지역신문",
    url: "https://example.com/news/admin",
    summary: "구단은 관중 입장 편의를 위해 일부 게이트와 매표 동선을 조정할 예정이다.",
    publishedAt: "2026-05-14T13:30:00+09:00",
    category: "club-admin",
    thumbnailUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "n6",
    title: "신예 미드필더 성장세, 강원 중원 경쟁에 활력",
    source: "스포츠타임",
    url: "https://example.com/news/young-player",
    summary: "최근 교체 출전 시간을 늘린 신예 미드필더가 공수 연결에서 좋은 평가를 받고 있다.",
    publishedAt: "2026-05-12T10:00:00+09:00",
    category: "other",
    thumbnailUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80"
  }
];

export const clubPosts: ClubPost[] = [
  {
    id: "c1",
    title: "FC서울전 홈경기 티켓 오픈 안내",
    platform: "ticket",
    url: "https://example.com/club/ticket-open",
    publishedAt: "2026-05-20T10:00:00+09:00",
    type: "티켓"
  },
  {
    id: "c2",
    title: "5월 홈경기 MD 팝업 스토어 운영",
    platform: "md",
    url: "https://example.com/club/md-popup",
    publishedAt: "2026-05-19T15:00:00+09:00",
    type: "MD"
  },
  {
    id: "c3",
    title: "경기장 도착 인증 이벤트",
    platform: "event",
    url: "https://www.instagram.com",
    publishedAt: "2026-05-18T18:00:00+09:00",
    type: "이벤트"
  },
  {
    id: "c4",
    title: "경기 하이라이트 업로드",
    platform: "youtube",
    url: "https://www.youtube.com",
    publishedAt: "2026-05-18T21:30:00+09:00",
    type: "영상"
  },
  {
    id: "c5",
    title: "팬 사인회 사전 신청 안내",
    platform: "facebook",
    url: "https://www.facebook.com",
    publishedAt: "2026-05-13T12:10:00+09:00",
    type: "이벤트"
  },
  {
    id: "c6",
    title: "홈경기 관람 유의사항 공지",
    platform: "official",
    url: "https://example.com/club/notice",
    publishedAt: "2026-05-12T09:00:00+09:00",
    type: "공지"
  },
  {
    id: "c7",
    title: "선수단 훈련 현장 포토",
    platform: "instagram",
    url: "https://www.instagram.com",
    publishedAt: "2026-05-11T17:30:00+09:00",
    type: "SNS"
  }
];

export const videos: Video[] = [
  {
    id: "v1",
    title: "수원FC전 하이라이트",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    publishedAt: "2026-05-18T22:00:00+09:00",
    category: "highlight"
  },
  {
    id: "v2",
    title: "주장 경기 전 인터뷰",
    youtubeId: "ysz5S6PUM-U",
    thumbnailUrl: "https://i.ytimg.com/vi/ysz5S6PUM-U/hqdefault.jpg",
    publishedAt: "2026-05-17T10:00:00+09:00",
    category: "interview"
  },
  {
    id: "v3",
    title: "서울전 대비 훈련 스케치",
    youtubeId: "jNQXAC9IVRw",
    thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    publishedAt: "2026-05-16T19:00:00+09:00",
    category: "training"
  },
  {
    id: "v4",
    title: "라커룸 비하인드",
    youtubeId: "M7lc1UVf-VE",
    thumbnailUrl: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
    publishedAt: "2026-05-11T20:00:00+09:00",
    category: "behind"
  }
];

export const standings: Standing[] = [
  { rank: 1, team: "울산 HD", played: 14, wins: 9, draws: 3, losses: 2, goalsFor: 27, goalsAgainst: 14, goalDifference: 13, points: 30, recentForm: ["W", "W", "D", "W", "L"] },
  { rank: 2, team: "전북 현대", played: 14, wins: 8, draws: 4, losses: 2, goalsFor: 24, goalsAgainst: 12, goalDifference: 12, points: 28, recentForm: ["W", "D", "W", "W", "D"] },
  { rank: 3, team: "김천 상무", played: 14, wins: 7, draws: 4, losses: 3, goalsFor: 21, goalsAgainst: 15, goalDifference: 6, points: 25, recentForm: ["D", "W", "W", "L", "W"] },
  { rank: 4, team: "강원FC", played: 14, wins: 7, draws: 3, losses: 4, goalsFor: 22, goalsAgainst: 18, goalDifference: 4, points: 24, recentForm: ["W", "W", "L", "D", "W"] },
  { rank: 5, team: "FC서울", played: 14, wins: 6, draws: 4, losses: 4, goalsFor: 20, goalsAgainst: 17, goalDifference: 3, points: 22, recentForm: ["L", "W", "D", "W", "D"] },
  { rank: 6, team: "포항 스틸러스", played: 14, wins: 5, draws: 6, losses: 3, goalsFor: 19, goalsAgainst: 16, goalDifference: 3, points: 21, recentForm: ["D", "D", "W", "L", "W"] },
  { rank: 7, team: "대전하나시티즌", played: 14, wins: 5, draws: 3, losses: 6, goalsFor: 18, goalsAgainst: 22, goalDifference: -4, points: 18, recentForm: ["L", "L", "W", "D", "W"] },
  { rank: 8, team: "수원FC", played: 14, wins: 4, draws: 4, losses: 6, goalsFor: 16, goalsAgainst: 19, goalDifference: -3, points: 16, recentForm: ["L", "W", "L", "D", "L"] }
];

export const players: Player[] = [
  { id: "p1", name: "이광연", number: 1, position: "GK", birthDate: "1999-09-11", nationality: "대한민국", imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=700&q=80", appearances: 12, goals: 0, assists: 0 },
  { id: "p2", name: "김영빈", number: 2, position: "DF", birthDate: "1991-09-20", nationality: "대한민국", imageUrl: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=700&q=80", appearances: 13, goals: 1, assists: 0 },
  { id: "p3", name: "강투지", number: 74, position: "DF", birthDate: "1998-05-11", nationality: "브라질", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=80", appearances: 11, goals: 0, assists: 1 },
  { id: "p4", name: "한국영", number: 8, position: "MF", birthDate: "1990-04-19", nationality: "대한민국", imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=700&q=80", appearances: 14, goals: 1, assists: 2 },
  { id: "p5", name: "양민혁", number: 47, position: "MF", birthDate: "2006-04-16", nationality: "대한민국", imageUrl: "https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=700&q=80", appearances: 14, goals: 4, assists: 3 },
  { id: "p6", name: "가브리엘", number: 99, position: "FW", birthDate: "1997-03-05", nationality: "브라질", imageUrl: "https://images.unsplash.com/photo-1504016798967-59a258e9386d?auto=format&fit=crop&w=700&q=80", appearances: 13, goals: 7, assists: 1 },
  { id: "p7", name: "정한민", number: 19, position: "FW", birthDate: "2001-01-08", nationality: "대한민국", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=700&q=80", appearances: 9, goals: 2, assists: 2 },
  { id: "p8", name: "송준석", number: 34, position: "DF", birthDate: "2001-06-12", nationality: "대한민국", imageUrl: "https://images.unsplash.com/photo-1505244278364-0656a4a6ac1b?auto=format&fit=crop&w=700&q=80", appearances: 8, goals: 0, assists: 2 }
];
