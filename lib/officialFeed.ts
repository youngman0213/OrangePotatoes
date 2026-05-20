import * as cheerio from "cheerio";
import type { ClubPlatform, ClubPost, Coach, LeaguePlayerStat, Match, Player, PlayerPosition, Standing } from "@/types";

const officialBaseUrl = "https://www.gangwon-fc.com";
const scheduleUrl = `${officialBaseUrl}/match/schedule?league=all`;
const playerUrl = `${officialBaseUrl}/squad/player`;
const coachUrl = `${officialBaseUrl}/squad/coach`;
const playerRankUrl = "https://www.kleague.com/record/player.do";
const portalMainUrl = "https://portal.kleague.com/user/loginById.do?portalGuest=rstNE9zxjdkUC9kbUA08XQ%3D%3D";

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

export async function fetchOfficialMatches(limit = 24): Promise<Match[]> {
  const html = await fetchText(scheduleUrl);
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
      id: `official-match-${matches.length}`,
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
      ticketUrl: "https://ticket.interpark.com",
      broadcastUrl: "https://www.coupangplay.com",
      highlightUrl: score === "VS" ? null : "https://www.youtube.com/user/gangwonfc"
    });
  }

  return matches.slice(0, limit);
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

export async function fetchKLeaguePlayerStats(limit = 30): Promise<LeaguePlayerStat[]> {
  const portalStats = await fetchKLeaguePortalPlayerStats();
  const fullStats = await fetchKLeagueFullPlayerStats(limit);
  return mergePlayerStats([...portalStats, ...fullStats]).slice(0, limit);
}

async function fetchKLeagueFullPlayerStats(limit = 80): Promise<LeaguePlayerStat[]> {
  const html = await fetchText(playerRankUrl);
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalize)
    .filter(Boolean);
  const clubs = ["SEOUL", "ULSAN", "JEONBUK", "GANGWON", "POHANG", "INCHEON", "ANYANG", "JEJU", "BUCHEON", "DAEJEON HANA", "GIMCHEON", "GWANGJU"];
  const stats: LeaguePlayerStat[] = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index];
    const matchedClub = clubs.find((club) => line.endsWith(` ${club}`));
    const rankMatch = line.match(/^(\d{1,2})\s+(.+)$/);

    if (!rankMatch || !matchedClub) continue;

    const numbers = lines
      .slice(index + 1, index + 4)
      .join(" ")
      .split(" ")
      .map(Number);
    if (numbers.length < 14 || numbers.some((value) => Number.isNaN(value))) continue;

    const rank = Number(rankMatch[1]);
    const nameWithClub = rankMatch[2];
    const englishName = nameWithClub.slice(0, -matchedClub.length).trim();
    const normalizedClub = matchedClub === "DAEJEON HANA" ? "DAEJEON HANA" : matchedClub;
    const name = translatePlayerName(englishName, normalizedClub);

    stats.push({
      rank,
      name,
      club: normalizedClub,
      goals: numbers[0],
      assists: numbers[1],
      attackPoints: numbers[2],
      yellowCards: numbers[8],
      redCards: numbers[9],
      played: numbers[11]
    });
  }

  return stats.slice(0, limit);
}

function mergePlayerStats(rows: LeaguePlayerStat[]) {
  const merged = new Map<string, LeaguePlayerStat>();

  for (const row of rows) {
    const key = `${row.name}-${row.club}`;
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
      yellowCards: Math.max(current.yellowCards, row.yellowCards),
      redCards: Math.max(current.redCards, row.redCards),
      played: Math.max(current.played, row.played)
    });
  }

  return Array.from(merged.values());
}

async function fetchKLeaguePortalPlayerStats(): Promise<LeaguePlayerStat[]> {
  const html = await fetchText(portalMainUrl);
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalize)
    .filter(Boolean);
  const stats = new Map<string, LeaguePlayerStat>();

  addPortalFeaturedStat(lines, "\ub4dd\uc810\uc21c\uc704", "\ub4dd\uc810", "goals", stats);
  addPortalFeaturedStat(lines, "\ub3c4\uc6c0\uc21c\uc704", "\ub3c4\uc6c0", "assists", stats);
  addPortalRankingStats(lines, "\ub4dd\uc810\uc21c\uc704", "\ub4dd\uc810", "goals", stats);
  addPortalRankingStats(lines, "\ub3c4\uc6c0\uc21c\uc704", "\ub3c4\uc6c0", "assists", stats);

  return Array.from(stats.values()).sort((a, b) => a.rank - b.rank);
}

function addPortalFeaturedStat(
  lines: string[],
  sectionTitle: string,
  statLabel: string,
  statKey: "goals" | "assists",
  stats: Map<string, LeaguePlayerStat>
) {
  const startIndex = lines.findIndex((line) => line === sectionTitle);
  if (startIndex === -1) return;

  const statIndex = lines.slice(startIndex, startIndex + 40).findIndex((line) => line === statLabel);
  if (statIndex === -1) return;

  const scope = lines.slice(startIndex, startIndex + 40);
  const club = scope.find((line, index) => line.startsWith("* ") && scope[index + 1]?.startsWith("* "))?.replace("* ", "");
  const name = scope.find((line, index) => scope[index - 1]?.startsWith("* ") && line.startsWith("* "))?.replace("* ", "");
  const value = Number(scope[statIndex + 1]?.replace("* ", ""));
  const playedLabelIndex = scope.findIndex((line) => line === "\ucd9c\uc804");
  const played = Number(scope[playedLabelIndex + 1]?.replace("* ", "")) || 0;

  if (!club || !name || Number.isNaN(value)) return;

  upsertPortalStat(stats, {
    rank: 1,
    name,
    club: normalizePortalClub(club),
    goals: statKey === "goals" ? value : 0,
    assists: statKey === "assists" ? value : 0,
    attackPoints: value,
    yellowCards: 0,
    redCards: 0,
    played
  });
}

function addPortalRankingStats(
  lines: string[],
  sectionTitle: string,
  statLabel: string,
  statKey: "goals" | "assists",
  stats: Map<string, LeaguePlayerStat>
) {
  const headerIndex = lines.findIndex((line) => line === `\uc21c\uc704 \uc120\uc218 \uad6c\ub2e8 ${statLabel} \uacbd\uae30\ub2f9`);
  if (headerIndex === -1) return;

  for (const line of lines.slice(headerIndex + 1, headerIndex + 8)) {
    if (line.startsWith("###")) break;
    const matched = line.match(/^(\d{1,2})\s+(.+?)\s+([\uac00-\ud7a3A-Za-z0-9]+)\s+(\d+)\s+[\d.]+$/);
    if (!matched) continue;

    const [, rank, name, club, value] = matched;
    upsertPortalStat(stats, {
      rank: Number(rank),
      name,
      club: normalizePortalClub(club),
      goals: statKey === "goals" ? Number(value) : 0,
      assists: statKey === "assists" ? Number(value) : 0,
      attackPoints: Number(value),
      yellowCards: 0,
      redCards: 0,
      played: 0
    });
  }
}

function upsertPortalStat(stats: Map<string, LeaguePlayerStat>, next: LeaguePlayerStat) {
  const key = `${next.name}-${next.club}`;
  const current = stats.get(key);

  if (!current) {
    stats.set(key, next);
    return;
  }

  stats.set(key, {
    ...current,
    rank: Math.min(current.rank, next.rank),
    goals: Math.max(current.goals, next.goals),
    assists: Math.max(current.assists, next.assists),
    attackPoints: Math.max(current.attackPoints, next.attackPoints)
  });
}

function normalizePortalClub(club: string) {
  const clubMap: Record<string, string> = {
    "\uac15\uc6d0": "GANGWON",
    "\uc778\ucc9c": "INCHEON",
    "\ud3ec\ud56d": "POHANG",
    "\uc6b8\uc0b0": "ULSAN",
    "\ub300\uc804": "DAEJEON HANA",
    "\uc548\uc591": "ANYANG",
    "\uc11c\uc6b8": "SEOUL",
    "\uae40\ucc9c": "GIMCHEON"
  };

  return clubMap[club] ?? club;
}

function translatePlayerName(name: string, club: string) {
  if (club !== "GANGWON") return name;

  const normalizedName = name.toUpperCase().replace(/\s+/g, " ").trim();
  const gangwonNameMap: Record<string, string> = {
    "ABDALLAH HLEIHIL": "\uc544\ubd80\ub2ec\ub77c",
    "DAEWON KIM": "\uae40\ub300\uc6d0",
    "KIM DAEWON": "\uae40\ub300\uc6d0",
    "SEUNGWON LEE": "\uc774\uc2b9\uc6d0",
    "LEE SEUNGWON": "\uc774\uc2b9\uc6d0",
    "GEONHUI KIM": "\uae40\uac74\ud76c",
    "GEONHEE KIM": "\uae40\uac74\ud76c",
    "KIM GEONHUI": "\uae40\uac74\ud76c",
    "JUNSEO JIN": "\uc9c4\uc900\uc11c",
    "JIN JUNSEO": "\uc9c4\uc900\uc11c",
    "YUNGU KANG": "\uac15\uc724\uad6c",
    "KANG YUNGU": "\uac15\uc724\uad6c",
    "MINWOO SEO": "\uc11c\ubbfc\uc6b0",
    "SEO MINWOO": "\uc11c\ubbfc\uc6b0",
    "DONGHYEON KIM": "\uae40\ub3d9\ud604",
    "DONGHYUN KIM": "\uae40\ub3d9\ud604",
    "KIM DONGHYEON": "\uae40\ub3d9\ud604",
    "CHEONGHYO PARK": "\ubc15\uccad\ud6a8",
    "PARK CHEONGHYO": "\ubc15\uccad\ud6a8",
    "SEUNGBIN JEONG": "\uc815\uc2b9\ube48",
    "JEONG SEUNGBIN": "\uc815\uc2b9\ube48",
    "GIHYEOK LEE": "\uc774\uae30\ud601",
    "LEE GIHYEOK": "\uc774\uae30\ud601",
    "JAEHYEON MO": "\ubaa8\uc7ac\ud604",
    "MO JAEHYEON": "\ubaa8\uc7ac\ud604",
    "YOUNGJUN GO": "\uace0\uc601\uc900",
    "GO YOUNGJUN": "\uace0\uc601\uc900"
  };

  return gangwonNameMap[normalizedName] ?? name;
}

export async function fetchKLeagueStandings(): Promise<Standing[]> {
  const html = await fetchText(portalMainUrl);
  const $ = cheerio.load(html);
  const lines = $("body")
    .text()
    .split("\n")
    .map(normalize)
    .filter(Boolean);
  const standings: Standing[] = [];
  const startIndex = lines.findIndex((line) => line.includes("\ud300\uc21c\uc704\ud45c"));

  if (startIndex === -1) return [];

  for (const line of lines.slice(startIndex)) {
    if (line.includes("\ucd5c\uadfc 6\uacbd\uae30")) break;

    const matched = line.match(/^(\d{1,2})\s+([\uac00-\ud7a3A-Za-z0-9 ]+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)$/);
    if (!matched) continue;

    const [, rank, team, played, points, wins, draws, losses, goalsFor, goalsAgainst, goalDifference] = matched;
    standings.push({
      rank: Number(rank),
      team: normalizeStandingTeam(team),
      played: Number(played),
      wins: Number(wins),
      draws: Number(draws),
      losses: Number(losses),
      goalsFor: Number(goalsFor),
      goalsAgainst: Number(goalsAgainst),
      goalDifference: Number(goalDifference),
      points: Number(points),
      recentForm: []
    });
  }

  return standings;
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

function toIsoDate(year: number, dateText: string) {
  const matched = dateText.match(/^(\d{2})\/(\d{2})\s+\(.+\)\s+(\d{2}):(\d{2})$/);
  if (!matched) return new Date().toISOString();

  const [, month, day, hour, minute] = matched;
  return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
}

function normalizeTeam(team: string) {
  return team === ko.gangwonShort ? ko.gangwon : team;
}

function normalizeStandingTeam(team: string) {
  const teamMap: Record<string, string> = {
    "\uc11c\uc6b8": "FC\uc11c\uc6b8",
    "\uc6b8\uc0b0": "\uc6b8\uc0b0 HD",
    "\uc804\ubd81": "\uc804\ubd81 \ud604\ub300",
    "\uac15\uc6d0": "\uac15\uc6d0FC",
    "\ud3ec\ud56d": "\ud3ec\ud56d \uc2a4\ud2f8\ub7ec\uc2a4",
    "\uc778\ucc9c": "\uc778\ucc9c \uc720\ub098\uc774\ud2f0\ub4dc",
    "\uc548\uc591": "FC\uc548\uc591",
    "\uc81c\uc8fc": "\uc81c\uc8fc SK",
    "\ubd80\ucc9c": "\ubd80\ucc9cFC1995",
    "\ub300\uc804": "\ub300\uc804\ud558\ub098\uc2dc\ud2f0\uc98c",
    "\uae40\ucc9c": "\uae40\ucc9c \uc0c1\ubb34",
    "\uad11\uc8fc": "\uad11\uc8fcFC"
  };

  return teamMap[team] ?? team;
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  return `${officialBaseUrl}${href.startsWith("/") ? href : `/${href}`}`;
}
