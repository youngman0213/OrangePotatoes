import { XMLParser } from "fast-xml-parser";
import type { NewsCategory, NewsItem } from "@/types";

interface GoogleNewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
  description?: string;
}

interface ParsedNewsItem extends NewsItem {
  sourcePublishedAt?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true
});

const rssSources = [
  { label: "전체", url: createGoogleNewsRssUrl("\uac15\uc6d0FC") },
  { label: "K리그", url: createGoogleNewsRssUrl("\uac15\uc6d0FC K\ub9ac\uadf8") },
  { label: "강원 축구", url: createGoogleNewsRssUrl("\uac15\uc6d0 \ucd95\uad6c") },
  { label: "Gangwon FC", url: createGoogleNewsRssUrl("Gangwon FC") },
  {
    label: "스포츠니어스",
    url: "https://news.google.com/rss/search?q=%EA%B0%95%EC%9B%90FC+site:sports-g.com+when%3A15d&hl=ko&gl=KR&ceid=KR:ko",
    sourceName: "sports-g.com"
  }
];
const maxNewsAgeDays = 15;
const newsCategoryKeywords: Record<"match" | "player" | "club", string[]> = {
  match: ["경기", "vs", "골", "승", "패", "무승부", "결과", "득점", "실점", "하이라이트", "프리뷰", "리뷰", "분석"],
  player: ["선수", "영입", "이적", "계약", "부상", "복귀", "국가대표", "대표팀", "출전", "훈련"],
  club: ["구단", "감독", "코치", "선임", "티켓", "이벤트", "공식", "U-18", "유스"]
};
const fallbackNewsUrl = "https://news.google.com/search?q=%EA%B0%95%EC%9B%90FC&hl=ko&gl=KR&ceid=KR:ko";
const fallbackTitle = "\uac15\uc6d0FC \ub274\uc2a4";
const fallbackSummary = "\uc6d0\ubb38 \ub9c1\ud06c\uc5d0\uc11c \uae30\uc0ac \ub0b4\uc6a9\uc744 \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";
const knownStaleTitleKeys = [
  normalizeNewsTitle("서울·강원FC, 아시아 챔피언스리그 16강 진출…울산은 탈락"),
  normalizeNewsTitle("K리그1 강원-울산, 수원FC-제주 경기 시간 변경")
];
const blockedNewsSources = ["transfermarkt", "mhnse.com", "mhn"];
const blockedNewsTitleKeywords = ["군수", "도의원", "선거", "유세", "공약", "후보"];

export async function fetchGangwonNews(limit = 45): Promise<NewsItem[]> {
  const results = await Promise.allSettled(rssSources.map((source, sourceIndex) => fetchNewsSource(source, sourceIndex)));
  const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  if (!items.length) {
    throw new Error("News feed request failed");
  }

  const verifiedItems = await verifyOriginalPublishedDates(items);
  return sortNewsByPublishedDesc(dedupeNews(verifiedItems.filter(shouldKeepNewsItem))).slice(0, limit);
}

async function fetchNewsSource(source: { label: string; url: string; sourceName?: string }, sourceIndex: number): Promise<ParsedNewsItem[]> {
  const response = await fetch(source.url, {
    next: { revalidate: 60 * 20 },
    headers: {
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`News feed request failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items: GoogleNewsItem[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items.map((item, index) => {
    const rawTitle = cleanText(item.title ?? fallbackTitle);
    const title = cleanNewsTitle(rawTitle);
    const itemSource = typeof item.source === "string" ? item.source : item.source?.["#text"] ?? "Google News";
    const displaySource = source.sourceName ?? itemSource;
    const summary = cleanNewsSummary(cleanText(stripHtml(item.description ?? "")), displaySource);

    return {
      id: `google-news-${sourceIndex}-${index}-${item.pubDate ?? title}`,
      title,
      source: displaySource,
      url: item.link ?? source.url,
      summary: summary || fallbackSummary,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      sourcePublishedAt: undefined,
      category: categorizeNews(title),
      thumbnailUrl: ""
    };
  });
}

async function verifyOriginalPublishedDates(items: ParsedNewsItem[]) {
  const settled = await Promise.allSettled(items.map(async (item) => {
    const sourcePublishedAt = await fetchOriginalPublishedAt(item.url);
    return sourcePublishedAt ? { ...item, publishedAt: sourcePublishedAt, sourcePublishedAt } : item;
  }));

  return settled.map((result, index) => result.status === "fulfilled" ? result.value : items[index]).filter((item): item is ParsedNewsItem => Boolean(item));
}

async function fetchOriginalPublishedAt(url: string) {
  if (!url || url.includes("news.google.com/")) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 60 * 12 },
      signal: controller.signal,
      headers: {
        "User-Agent": "OrangePotatoesFanHub/1.0",
        Accept: "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    const originalDate = parseOriginalArticleDate(html);
    if (originalDate) return originalDate.toISOString();

    const matched = html.match(/<(?:meta|time|span|p|div)[^>]+(?:property|name|itemprop|datetime|content)=["'](?:article:published_time|datePublished|pubdate|published_time|regdate)["'][^>]*(?:content|datetime)=["']([^"']+)["']/i)
      ?? html.match(/<(?:meta|time|span|p|div)[^>]+(?:content|datetime)=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["'](?:article:published_time|datePublished|pubdate|published_time|regdate|date)["']/i)
      ?? html.match(/(?:입력|등록|승인)\s*[:：]?\s*(\d{4}[.-]\d{1,2}[.-]\d{1,2}(?:\s+\d{1,2}:\d{2})?)/);

    if (!matched?.[1]) return null;

    const parsed = parseKoreanDate(matched[1]);
    return parsed && isRecentDate(parsed) ? parsed.toISOString() : parsed?.toISOString() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function createGoogleNewsRssUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${maxNewsAgeDays}d`)}&hl=ko&gl=KR&ceid=KR:ko`;
}

function isRecentNewsItem(item: NewsItem) {
  const publishedTime = new Date(item.publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) return false;

  return isRecentDate(new Date(publishedTime));
}

function shouldKeepNewsItem(item: ParsedNewsItem) {
  if (!isRecentNewsItem(item)) return false;
  if (!isArticleLikeNews(item)) return false;
  if (!item.sourcePublishedAt && isLikelyStaleGoogleNewsItem(item)) return false;

  return true;
}

function isArticleLikeNews(item: NewsItem) {
  const text = `${item.title} ${item.summary}`;
  const source = item.source.toLowerCase();
  if (blockedNewsSources.some((blocked) => source.includes(blocked))) return false;
  if (!hasHangul(item.title)) return false;
  if (blockedNewsTitleKeywords.some((keyword) => item.title.includes(keyword))) return false;
  if (!isGangwonFcRelevantNews(text)) return false;

  return true;
}

function isGangwonFcRelevantNews(text: string) {
  if (/강원\s*FC/i.test(text)) return true;
  if (/gangwon\s*fc/i.test(text)) return true;
  if (/K리그|케이리그|ACLE|아시아\s*챔피언스리그|코리아컵/i.test(text) && /강원/i.test(text)) return true;

  return false;
}

function isLikelyStaleGoogleNewsItem(item: NewsItem) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const titleKey = normalizeNewsTitle(item.title);

  if (knownStaleTitleKeys.includes(titleKey)) return true;
  if (/(8월|9월|10월|11월|12월).*(이달의|영플레이어|선수상|수상)/.test(text)) return true;

  return false;
}

function hasHangul(value: string) {
  return /[\uac00-\ud7a3]/.test(value);
}

function isRecentDate(date: Date) {
  const maxAgeMs = maxNewsAgeDays * 24 * 60 * 60 * 1000;
  return Date.now() - date.getTime() <= maxAgeMs;
}

function parseKoreanDate(value: string) {
  const normalized = value.trim().replace(/\./g, "-").replace(/\s+/g, " ");
  const date = new Date(normalized);
  return Number.isFinite(date.getTime()) ? date : null;
}

function parseOriginalArticleDate(html: string) {
  const plainText = cleanText(stripHtml(html));
  const registered = plainText.match(/(?:등록|입력|승인)\s*[:：]?\s*(\d{4}[.-]\d{1,2}[.-]\d{1,2}(?:\s+\d{1,2}:\d{2})?)/);
  return registered?.[1] ? parseKoreanDate(registered[1]) : null;
}

function dedupeNews(items: NewsItem[]) {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const seenTitleKeys: string[] = [];
  const unique: NewsItem[] = [];

  for (const item of items) {
    const urlKey = normalizeNewsUrl(item.url);
    const titleKey = normalizeNewsTitle(item.title);

    if (urlKey && seenUrls.has(urlKey)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;
    if (seenTitleKeys.some((seenTitle) => areSameStoryTitle(seenTitle, titleKey))) continue;

    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) {
      seenTitles.add(titleKey);
      seenTitleKeys.push(titleKey);
    }
    unique.push(item);
  }

  return unique;
}

function sortNewsByPublishedDesc(items: NewsItem[]) {
  return [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function normalizeNewsUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    parsed.searchParams.delete("utm_content");
    parsed.searchParams.delete("utm_term");
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return (url || fallbackNewsUrl).toLowerCase();
  }
}

function normalizeNewsTitle(title: string) {
  return title
    .replace(/\s-\s[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/g, " ")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/["']/g, "")
    .replace(/[^0-9A-Za-z\uac00-\ud7a3]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanNewsTitle(title: string) {
  return title
    .replace(/\s-\s[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/g, "")
    .replace(/\s-\s[^-]{2,30}$/g, "")
    .trim();
}

function cleanNewsSummary(summary: string, source: string) {
  const escapedSource = escapeRegExp(source);

  return summary
    .replace(new RegExp(`\\s${escapedSource}$`, "i"), "")
    .replace(/\s[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/g, "")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function areSameStoryTitle(a: string, b: string) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) >= 18;

  const aTokens = a.split(" ").filter((token) => token.length > 1);
  const bTokens = b.split(" ").filter((token) => token.length > 1);
  const shorter = aTokens.length <= bTokens.length ? aTokens : bTokens;
  const longer = aTokens.length <= bTokens.length ? bTokens : aTokens;

  if (shorter.length < 6) return false;

  const overlap = shorter.filter((token) => longer.indexOf(token) >= 0).length;
  return overlap / shorter.length >= 0.9;
}

function categorizeNews(title: string): NewsCategory {
  const normalizedTitle = title.toLowerCase();

  for (const keyword of newsCategoryKeywords.match) {
    if (normalizedTitle.includes(keyword.toLowerCase())) return "match";
  }
  for (const keyword of newsCategoryKeywords.player) {
    if (normalizedTitle.includes(keyword.toLowerCase())) return "player";
  }
  for (const keyword of newsCategoryKeywords.club) {
    if (normalizedTitle.includes(keyword.toLowerCase())) return "club";
  }
  return "other";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function cleanText(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
