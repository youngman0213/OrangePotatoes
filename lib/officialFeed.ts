import * as cheerio from "cheerio";
import type { ClubPlatform, ClubPost, Coach, Match, Player, PlayerPosition } from "@/types";

const officialBaseUrl = "https://www.gangwon-fc.com";
const scheduleUrl = `${officialBaseUrl}/match/schedule?league=all`;
const scheduleSeasonYear = 2026;
const scheduleSeasonStartMonth = 2;
const scheduleSeasonEndMonth = 12;
const kLeagueBaseUrl = "https://www.kleague.com";
const kLeagueScheduleUrl = `${kLeagueBaseUrl}/getScheduleList.do`;
const gangwonTeamId = "K21";
const playerUrl = `${officialBaseUrl}/squad/player`;
const coachUrl = `${officialBaseUrl}/squad/coach`;

const ko = {
  gangwon: "\uac15\uc6d0FC",
  gangwonShort: "\uac15\uc6d0",
  headCoach: "\uc815\uacbd\ud638",
  headCoachRole: "\uac10\ub3c5",
  officialYoutube: "\uac15\uc6d0FC \uacf5\uc2dd \uc720\ud29c\ube0c \ucc44\ub110",
  officialInstagram: "\uac15\uc6d0FC \uacf5\uc2dd \uc778\uc2a4\ud0c0\uadf8\ub7a8",
  officialShop: "\uac15\uc6d0FC \uacf5\uc2dd \uc628\ub77c\uc778 \uc2a4\ud1a0\uc5b4",
  video: "\uc601\uc0c1",
  notice: "\uacf5\uc9c0",
  ticket: "\ud2f0\ucf13",
  md: "MD",
  event: "\uc774\ubca4\ud2b8",
  bid: "\uacf5\uace0",
  kLeague: "K\ub9ac\uadf81",
  koreaCup: "\ucf54\ub9ac\uc544\ucef5",
  hanaBank: "\ud558\ub098\uc740\ud589 "
};

const kLeagueTeamNames: Record<string, string> = {
  K01: "\uc6b8\uc0b0 HD",
  K03: "\ud3ec\ud56d",
  K04: "\uc81c\uc8fc",
  K05: "\uc804\ubd81",
  K09: "FC\uc11c\uc6b8",
  K10: "\ub300\uc804",
  K18: "\uc778\ucc9c",
  K21: "\uac15\uc6d0FC",
  K22: "\uad11\uc8fc",
  K26: "\ubd80\ucc9c",
  K27: "\uc548\uc591",
  K35: "\uae40\ucc9c"
};

const stadiumNames: Record<string, string> = {
  "\uac15\ub989\ud558\uc774\uc6d0\uc544\ub808\ub098": "\uac15\ub989\ud558\uc774\uc6d0\uc544\ub808\ub098",
  "\uac15\ub989\ud558\uc774\uc6d0": "\uac15\ub989\ud558\uc774\uc6d0\uc544\ub808\ub098",
  "\uc778\ucc9c \uc804\uc6a9": "\uc778\ucc9c \ucd95\uad6c\uc804\uc6a9\uacbd\uae30\uc7a5",
  "\uc778\ucc9c \ucd95\uad6c \uc804\uc6a9\uacbd\uae30\uc7a5": "\uc778\ucc9c \ucd95\uad6c\uc804\uc6a9\uacbd\uae30\uc7a5",
  "\uad11\uc8fc \uc6d4\ub4dc\ucef5": "\uad11\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  "\ub300\uc804W": "\ub300\uc804\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  "\uae40\ucc9c": "\uae40\ucc9c\uc885\ud569\uc6b4\ub3d9\uc7a5",
  "\ud3ec\ud56d\uc2a4\ud2f8\uc57c\ub4dc": "\ud3ec\ud56d\uc2a4\ud2f8\uc57c\ub4dc",
  "\uc804\uc8fcW": "\uc804\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  "\uc11c\uc6b8W": "\uc11c\uc6b8\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  "\uc6b8\uc0b0\ubb38\uc218": "\uc6b8\uc0b0\ubb38\uc218\ucd95\uad6c\uacbd\uae30\uc7a5",
  "\uc81c\uc8fcW": "\uc81c\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  "\uc548\uc591\uc885\ud569": "\uc548\uc591\uc885\ud569\uc6b4\ub3d9\uc7a5"
};

const stadiumAliases = [
  { keyword: "\uac15\ub989\ud558\uc774\uc6d0", name: "\uac15\ub989\ud558\uc774\uc6d0\uc544\ub808\ub098" },
  { keyword: "\uc778\ucc9c", name: "\uc778\ucc9c \ucd95\uad6c\uc804\uc6a9\uacbd\uae30\uc7a5" },
  { keyword: "\uad11\uc8fc", name: "\uad11\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5" },
  { keyword: "\ub300\uc804", name: "\ub300\uc804\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5" },
  { keyword: "\uae40\ucc9c", name: "\uae40\ucc9c\uc885\ud569\uc6b4\ub3d9\uc7a5" },
  { keyword: "\ud3ec\ud56d", name: "\ud3ec\ud56d\uc2a4\ud2f8\uc57c\ub4dc" },
  { keyword: "\uc804\uc8fc", name: "\uc804\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5" },
  { keyword: "\uc11c\uc6b8", name: "\uc11c\uc6b8\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5" },
  { keyword: "\uc6b8\uc0b0", name: "\uc6b8\uc0b0\ubb38\uc218\ucd95\uad6c\uacbd\uae30\uc7a5" },
  { keyword: "\uc81c\uc8fc", name: "\uc81c\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5" },
  { keyword: "\uc548\uc591", name: "\uc548\uc591\uc885\ud569\uc6b4\ub3d9\uc7a5" },
  { keyword: "\ubd80\ucc9c", name: "\ubd80\ucc9c\uc885\ud569\uc6b4\ub3d9\uc7a5" }
];

const homeStadiumByTeamId: Record<string, string> = {
  K01: "\uc6b8\uc0b0\ubb38\uc218\ucd95\uad6c\uacbd\uae30\uc7a5",
  K02: "\uc218\uc6d0\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  K03: "\ud3ec\ud56d\uc2a4\ud2f8\uc57c\ub4dc",
  K04: "\uc81c\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  K05: "\uc804\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  K06: "\ubd80\uc0b0\uc544\uc2dc\uc544\ub4dc\uc8fc\uacbd\uae30\uc7a5",
  K07: "\uad11\uc591\ucd95\uad6c\uc804\uc6a9\uad6c\uc7a5",
  K08: "\ud0c4\ucc9c\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K09: "\uc11c\uc6b8\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  K10: "\ub300\uc804\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  K17: "\ub300\uad6cDGB\ub300\uad6c\uc740\ud589\ud30c\ud06c",
  K18: "\uc778\ucc9c \ucd95\uad6c\uc804\uc6a9\uacbd\uae30\uc7a5",
  K20: "\ucc3d\uc6d0\ucd95\uad6c\uc13c\ud130",
  K21: "\uac15\ub989\ud558\uc774\uc6d0\uc544\ub808\ub098",
  K22: "\uad11\uc8fc\uc6d4\ub4dc\ucef5\uacbd\uae30\uc7a5",
  K26: "\ubd80\ucc9c\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K27: "\uc548\uc591\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K29: "\uc218\uc6d0\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K31: "\ubaa9\ub3d9\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K32: "\uc548\uc0b0\uc640\uc2a4\ud0c0\ub514\uc6c0",
  K34: "\uc774\uc21c\uc2e0\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K35: "\uae40\ucc9c\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K36: "\uae40\ud3ec\uc194\ud130\ucd95\uad6c\uc7a5",
  K37: "\uccad\uc8fc\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K38: "\ucc9c\uc548\uc885\ud569\uc6b4\ub3d9\uc7a5",
  K39: "\ud654\uc131\uc885\ud569\uacbd\uae30\ud0c0\uc6b4",
  K40: "\ud30c\uc8fc\uc2a4\ud0c0\ub514\uc6c0",
  K41: "\uae40\ud574\uc6b4\ub3d9\uc7a5",
  K42: "\uc6a9\uc778\ubbf8\ub974\uc2a4\ud0c0\ub514\uc6c0"
};

interface KLeagueScheduleItem {
  year: number;
  leagueId: number;
  roundId: number;
  gameId: number;
  gameDate: string;
  gameTime: string;
  endYn: "Y" | "N";
  meetName: string;
  homeTeam: string;
  homeTeamName: string;
  awayTeam: string;
  awayTeamName: string;
  fieldName?: string | null;
  fieldNameFull?: string | null;
  homeGoal: number | null;
  awayGoal: number | null;
  broadcastName?: string | null;
  meetSeq: number;
  company?: string | null;
  goodsCode?: string | null;
}

interface KLeagueScheduleResponse {
  resultCode?: string;
  data?: {
    scheduleList?: KLeagueScheduleItem[];
  };
}

export async function fetchOfficialClubPosts(limit = 12): Promise<ClubPost[]> {
  const html = await fetchText(officialBaseUrl);
  const $ = cheerio.load(html);
  const posts: ClubPost[] = [];
  const seen = new Set<string>();

  $("a").each((_, element) => {
    const title = normalize($(element).text());
    const date = title.match(/20\d{2}-\d{2}-\d{2}/)?.[0];
    const href = $(element).attr("href");

    if (!date || !href || seen.has(title)) return;
    if (!isOfficialNoticeLike(title)) return;

    seen.add(title);
    posts.push({
      id: `official-${posts.length}-${date}`,
      title: title.replace(date, "").trim(),
      platform: "official",
      url: toAbsoluteUrl(href),
      publishedAt: `${date}T09:00:00+09:00`,
      type: getClubPostType(title)
    });
  });

  const channelPosts: ClubPost[] = [
    makeChannelPost("official-youtube", ko.officialYoutube, "youtube", "https://www.youtube.com/user/gangwonfc", ko.video),
    makeChannelPost("official-instagram", ko.officialInstagram, "instagram", "https://www.instagram.com/gangwon_fc", "SNS"),
    makeChannelPost("official-shop", ko.officialShop, "md", "https://gangwon-fc.imweb.me/", ko.md)
  ];

  return [...posts, ...channelPosts].slice(0, limit);
}

export async function fetchOfficialMatches(limit?: number): Promise<Match[]> {
  const months = Array.from(
    { length: scheduleSeasonEndMonth - scheduleSeasonStartMonth + 1 },
    (_, index) => scheduleSeasonStartMonth + index
  );
  const results = await Promise.allSettled(months.map((month) => fetchKLeagueScheduleMonth(scheduleSeasonYear, month)));
  const matches = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  if (!matches.length) {
    const fallbackMatches = await fetchOfficialMatchesByUrl(scheduleUrl);
    return typeof limit === "number" ? fallbackMatches.slice(0, limit) : fallbackMatches;
  }

  const uniqueMatches = dedupeMatches(matches);
  return typeof limit === "number" ? uniqueMatches.slice(0, limit) : uniqueMatches;
}

async function fetchKLeagueScheduleMonth(year: number, month: number): Promise<Match[]> {
  const response = await fetch(kLeagueScheduleUrl, {
    method: "POST",
    next: { revalidate: 60 * 60 },
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent": "OrangePotatoesFanHub/1.0"
    },
    body: JSON.stringify({
      leagueId: "1",
      year: String(year),
      month: String(month).padStart(2, "0"),
      teamId: gangwonTeamId
    })
  });

  if (!response.ok) {
    throw new Error(`K League schedule request failed: ${response.status}`);
  }

  const payload = (await response.json()) as KLeagueScheduleResponse;
  const scheduleList = payload.data?.scheduleList ?? [];

  return scheduleList.map(normalizeKLeagueMatch);
}

function normalizeKLeagueMatch(item: KLeagueScheduleItem): Match {
  const isFinished = item.endYn === "Y";

  return {
    id: `kleague-match-${item.year}-${item.leagueId}-${item.gameId}-${item.meetSeq}`,
    competition: normalizeCompetition(item.meetName),
    round: item.roundId ? `${item.roundId}R` : item.meetName,
    date: toIsoDateFromKLeague(item.gameDate, item.gameTime),
    homeTeam: normalizeTeam(item.homeTeamName, item.homeTeam),
    awayTeam: normalizeTeam(item.awayTeamName, item.awayTeam),
    venue: normalizeStadium(item.fieldNameFull || item.fieldName || "", item.homeTeam),
    isHome: item.homeTeam === gangwonTeamId,
    status: isFinished ? "finished" : "scheduled",
    homeScore: isFinished ? item.homeGoal : null,
    awayScore: isFinished ? item.awayGoal : null,
    ticketUrl: isFinished ? null : createTicketUrl(),
    broadcastUrl: "https://www.coupangplay.com",
    highlightUrl: isFinished ? createKLeagueMatchUrl(item, 4) : null,
    detailUrl: isFinished ? createKLeagueMatchUrl(item, 0) : null
  };
}

async function fetchOfficialMatchesByUrl(url: string): Promise<Match[]> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalize)
    .filter(Boolean);

  const matches: Match[] = [];
  const year = findScheduleYear(lines);

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\d{2}\/\d{2}\s+\(.+\)\s+\d{2}:\d{2}$/.test(lines[index])) continue;

    const dateText = lines[index];
    const block: string[] = [];

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (/^\d{2}\/\d{2}\s+\(.+\)\s+\d{2}:\d{2}$/.test(lines[cursor])) break;
      if (/COPYRIGHT/.test(lines[cursor])) break;
      block.push(lines[cursor]);
    }

    const competition = block.find((line) => /K\ub9ac\uadf8|\ucf54\ub9ac\uc544\ucef5|AFC|ACLE/.test(line)) ?? ko.kLeague;
    const scoreIndex = block.findIndex((line) => /^\d+:\d+$/.test(line) || line === "VS");

    if (scoreIndex < 2 || !block[scoreIndex + 1]) continue;

    const venue = block[0];
    const homeTeam = block[scoreIndex - 1];
    const awayTeam = block[scoreIndex + 1];
    const score = block[scoreIndex];
    const [homeScore, awayScore] = score.includes(":") ? score.split(":").map(Number) : [null, null];

    matches.push({
      id: `official-match-${year}-${dateText}-${homeTeam}-${awayTeam}`,
      competition: normalizeCompetition(competition),
      round: competition.replace(ko.hanaBank, "").trim(),
      date: toIsoDate(year, dateText),
      homeTeam: normalizeTeam(homeTeam),
      awayTeam: normalizeTeam(awayTeam),
      venue,
      isHome: normalizeTeam(homeTeam) === ko.gangwon,
      status: score === "VS" ? "scheduled" : "finished",
      homeScore,
      awayScore,
      ticketUrl: score === "VS" ? "https://ticket.interpark.com" : null,
      broadcastUrl: "https://www.coupangplay.com",
      highlightUrl: score === "VS" ? null : "https://www.youtube.com/user/gangwonfc",
      detailUrl: score === "VS" ? null : createKLeagueScheduleUrl(year, dateText)
    });
  }

  return matches;
}

export async function fetchOfficialPlayers(): Promise<Player[]> {
  const html = await fetchText(playerUrl);
  const $ = cheerio.load(html);
  const players = new Map<string, Player>();

  $("a").each((_, element) => {
    const title = normalize($(element).text());
    const matched = title.match(/^(\d{1,2})\s+(GK|DF|MF|FW)\s+(.+?)\s+\ub354\ubcf4\uae30$/);
    const href = $(element).attr("href");

    if (!matched) return;

    const [, number, position, name] = matched;
    const id = `official-player-${number}-${position}`;
    players.set(id, {
      id,
      name,
      number: Number(number),
      position: position as PlayerPosition,
      profileUrl: href ? toAbsoluteUrl(href) : playerUrl
    });
  });

  return Array.from(players.values()).sort((a, b) => a.number - b.number);
}

export async function fetchOfficialCoaches(): Promise<Coach[]> {
  const html = await fetchText(coachUrl);
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalize)
    .filter(Boolean);

  const rolePattern = /^(\uac10\ub3c5|\uc218\uc11d\ucf54\uce58|GK\ucf54\uce58|\ucf54\uce58|\ud53c\uc9c0\uceec\ucf54\uce58|\uc804\ub825\ubd84\uc11d\uad00|\uc758\ubb34\ud300\uc7a5|\uc758\ubb34\ud2b8\ub808\uc774\ub108|\ud1b5\uc5ed|\uc7a5\ube44\uad00\ub9ac\uc0ac)$/;
  const coaches: Coach[] = [];
  const seen = new Set<string>();
  const headCoach = findHeadCoach(lines) ?? ko.headCoach;

  if (headCoach) {
    const headCoachId = `official-coach-head-${headCoach}`;
    seen.add(headCoachId);
    coaches.push({
      id: headCoachId,
      role: ko.headCoachRole,
      name: headCoach,
      profileUrl: coachUrl
    });
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    const role = lines[index];
    const name = lines[index + 1];

    if (!rolePattern.test(role)) continue;
    if (!name || /Image|GANGWON|home|COPYRIGHT/.test(name)) continue;
    if (role === ko.headCoachRole && name === headCoach) continue;

    const id = `official-coach-${role}-${name}`;
    if (seen.has(id)) continue;
    seen.add(id);
    coaches.push({
      id,
      role,
      name,
      profileUrl: coachUrl
    });
  }

  return coaches;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 60 * 30 },
    headers: {
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Official site request failed: ${response.status}`);
  }

  return response.text();
}

function makeChannelPost(id: string, title: string, platform: ClubPlatform, url: string, type: string): ClubPost {
  return {
    id,
    title,
    platform,
    url,
    publishedAt: new Date().toISOString(),
    type
  };
}

function isOfficialNoticeLike(title: string) {
  return /(\uacf5\uc9c0|\uc548\ub0b4|\uacf5\uace0|\ubaa8\uc9d1|\uc2dc\uc98c|\ud648\uacbd\uae30|\ud2f0\ucf13|\uc720\ub2c8\ud3fc|\ud478\ub4dc\ud2b8\ub7ed|\ucc44\uc6a9|\uac15\uc6d0FC)/.test(title);
}

function getClubPostType(title: string) {
  if (/(\ud2f0\ucf13|\uc785\uc7a5|\uc608\ub9e4)/.test(title)) return ko.ticket;
  if (/(\uc720\ub2c8\ud3fc|\uc2a4\ud1a0\uc5b4|MD)/.test(title)) return ko.md;
  if (/(\uc774\ubca4\ud2b8|\ubaa8\uc9d1)/.test(title)) return ko.event;
  if (/(\ucc44\uc6a9|\uc785\ucc30|\uacf5\uace0)/.test(title)) return ko.bid;

  return ko.notice;
}

function normalizeCompetition(competition: string) {
  if (competition.includes(ko.koreaCup)) return ko.koreaCup;
  if (competition.includes("AFC") || competition.includes("ACLE")) return "AFC";
  return ko.kLeague;
}

function findHeadCoach(lines: string[]) {
  const headCoachIndex = lines.findIndex((line) => line.includes("HEAD COACH"));
  if (headCoachIndex === -1) return null;

  return lines.slice(headCoachIndex + 1).find((line) => /^[\uac00-\ud7a3]{2,5}$/.test(line)) ?? null;
}

function findScheduleYear(lines: string[]) {
  const yearMonth = lines.find((line) => /^20\d{2}\s+\d{2}$/.test(line));
  return yearMonth ? Number(yearMonth.slice(0, 4)) : new Date().getFullYear();
}

function createScheduleUrl(year: number, month: number) {
  const paddedMonth = String(month).padStart(2, "0");
  return `${scheduleUrl}&year=${year}&month=${paddedMonth}`;
}

function dedupeMatches(matches: Match[]) {
  const seen = new Set<string>();
  const unique: Match[] = [];

  for (const match of matches) {
    const key = `${match.date}-${match.homeTeam}-${match.awayTeam}`;
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(match);
  }

  return unique;
}

function toIsoDate(year: number, dateText: string) {
  const matched = dateText.match(/^(\d{2})\/(\d{2})\s+\(.+\)\s+(\d{2}):(\d{2})$/);
  if (!matched) return new Date().toISOString();

  const [, month, day, hour, minute] = matched;
  return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
}

function toIsoDateFromKLeague(date: string, time: string) {
  const [year, month, day] = date.split(".");
  return `${year}-${month}-${day}T${time}:00+09:00`;
}

function createKLeagueMatchUrl(item: KLeagueScheduleItem, tab: number) {
  return `${kLeagueBaseUrl}/match.do?year=${item.year}&leagueId=${item.leagueId}&gameId=${item.gameId}&meetSeq=${item.meetSeq}&startTabNum=${tab}`;
}

function createKLeagueScheduleUrl(year: number, dateText: string) {
  const matched = dateText.match(/^(\d{2})\/(\d{2})/);
  const month = matched ? matched[1] : "01";

  return `https://www.kleague.com/schedule.do?leagueId=1&year=${year}&month=${month}`;
}

function createTicketUrl() {
  return "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07002&TeamCode=PS014";
}

function normalizeTeam(team: string, teamId?: string) {
  if (teamId && kLeagueTeamNames[teamId]) return kLeagueTeamNames[teamId];
  if (kLeagueTeamNames[team]) return kLeagueTeamNames[team];
  if (team === ko.gangwonShort || team === "Gangwon" || team === "Gangwon FC") return ko.gangwon;
  if (team === "\uc11c\uc6b8") return "FC\uc11c\uc6b8";
  if (team === "\uc6b8\uc0b0") return "\uc6b8\uc0b0 HD";

  return team;
}

function normalizeStadium(stadium: string, homeTeamId?: string) {
  if (homeTeamId && homeStadiumByTeamId[homeTeamId]) return homeStadiumByTeamId[homeTeamId];

  const normalized = stadium.replace(/\s+/g, "");
  const exact = stadiumNames[stadium] ?? stadiumNames[normalized];
  if (exact) return exact;

  const alias = stadiumAliases.find((item) => normalized.includes(item.keyword.replace(/\s+/g, "")));
  return alias?.name ?? stadium;
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  return `${officialBaseUrl}${href.startsWith("/") ? href : `/${href}`}`;
}
