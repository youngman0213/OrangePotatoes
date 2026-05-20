import * as cheerio from "cheerio";
import type { ClubPost, Match } from "@/types";

const officialBaseUrl = "https://www.gangwon-fc.com";
const scheduleUrl = `${officialBaseUrl}/match/schedule?league=all`;

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
    if (!/(공지|안내|공고|모집|시즌|홈경기|티켓|유니폼|푸드트럭|채용|강원FC)/.test(title)) return;

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

  return [
    ...posts.slice(0, limit),
    {
      id: "official-youtube",
      title: "강원FC 공식 유튜브 채널",
      platform: "youtube",
      url: "https://www.youtube.com/user/gangwonfc",
      publishedAt: new Date().toISOString(),
      type: "영상"
    },
    {
      id: "official-instagram",
      title: "강원FC 공식 인스타그램",
      platform: "instagram",
      url: "https://www.instagram.com/gangwon_fc",
      publishedAt: new Date().toISOString(),
      type: "SNS"
    },
    {
      id: "official-shop",
      title: "강원FC 공식 온라인 스토어",
      platform: "md",
      url: "https://gangwon-fc.imweb.me/",
      publishedAt: new Date().toISOString(),
      type: "MD"
    }
  ].slice(0, limit);
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
      if (/개인정보처리방침|대표전화|COPYRIGHT/.test(lines[cursor])) break;
      block.push(lines[cursor]);
    }

    const competition = block.find((line) => /K리그|코리아컵|AFC|ACLE/.test(line)) ?? "K리그1";
    const scoreIndex = block.findIndex((line) => /^\d+:\d+$/.test(line) || line === "VS");

    if (scoreIndex < 2 || !block[scoreIndex + 1]) continue;

    const venue = block[0];
    const homeTeam = block[scoreIndex - 1];
    const awayTeam = block[scoreIndex + 1];
    const score = block[scoreIndex];
    const [homeScore, awayScore] = score.includes(":") ? score.split(":").map(Number) : [null, null];

    matches.push({
      id: `official-match-${matches.length}`,
      competition: competition.includes("코리아컵") ? "코리아컵" : competition.includes("AFC") || competition.includes("ACLE") ? "AFC" : "K리그1",
      round: competition.replace("하나은행 ", "").trim(),
      date: toIsoDate(year, dateText),
      homeTeam: normalizeTeam(homeTeam),
      awayTeam: normalizeTeam(awayTeam),
      venue,
      isHome: normalizeTeam(homeTeam) === "강원FC",
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

function getClubPostType(title: string) {
  if (/티켓|입장|예매/.test(title)) return "티켓";
  if (/유니폼|스토어|MD/.test(title)) return "MD";
  if (/이벤트|모집/.test(title)) return "이벤트";
  if (/채용|입찰|공고/.test(title)) return "공고";

  return "공지";
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
  return team === "강원" ? "강원FC" : team;
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  return `${officialBaseUrl}${href.startsWith("/") ? href : `/${href}`}`;
}
