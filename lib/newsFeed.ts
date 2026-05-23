import { XMLParser } from "fast-xml-parser";
import type { NewsCategory, NewsItem } from "@/types";

interface GoogleNewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
  description?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true
});

const newsQueries = [
  "\uac15\uc6d0FC",
  "\uac15\uc6d0FC K\ub9ac\uadf8",
  "\uac15\uc6d0 \ucd95\uad6c",
  "Gangwon FC"
];
const newsCategoryKeywords: Record<"match" | "player" | "club", string[]> = {
  match: ["경기", "vs", "골", "승", "패", "무승부", "결과", "득점", "실점", "하이라이트", "프리뷰", "리뷰", "분석"],
  player: ["선수", "영입", "이적", "계약", "부상", "복귀", "국가대표", "대표팀", "출전", "훈련"],
  club: ["구단", "감독", "코치", "선임", "티켓", "이벤트", "공식", "U-18", "유스"]
};
const fallbackNewsUrl = "https://news.google.com/search?q=%EA%B0%95%EC%9B%90FC&hl=ko&gl=KR&ceid=KR:ko";
const fallbackTitle = "\uac15\uc6d0FC \ub274\uc2a4";
const fallbackSummary = "\uc6d0\ubb38 \ub9c1\ud06c\uc5d0\uc11c \uae30\uc0ac \ub0b4\uc6a9\uc744 \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";

export async function fetchGangwonNews(limit = 45): Promise<NewsItem[]> {
  const results = await Promise.allSettled(newsQueries.map((query, queryIndex) => fetchNewsQuery(query, queryIndex)));
  const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  if (!items.length) {
    throw new Error("News feed request failed");
  }

  return sortNewsByPublishedDesc(dedupeNews(items)).slice(0, limit);
}

async function fetchNewsQuery(query: string, queryIndex: number): Promise<NewsItem[]> {
  const feedUrl = createGoogleNewsRssUrl(query);
  const response = await fetch(feedUrl, {
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
    const summary = cleanText(stripHtml(item.description ?? ""));
    const source = typeof item.source === "string" ? item.source : item.source?.["#text"] ?? "Google News";

    return {
      id: `google-news-${queryIndex}-${index}-${item.pubDate ?? title}`,
      title,
      source,
      url: item.link ?? feedUrl,
      summary: summary || fallbackSummary,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      category: categorizeNews(title),
      thumbnailUrl: ""
    };
  });
}

function createGoogleNewsRssUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
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
