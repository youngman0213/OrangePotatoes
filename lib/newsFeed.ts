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
const fallbackNewsUrl = "https://news.google.com/search?q=%EA%B0%95%EC%9B%90FC&hl=ko&gl=KR&ceid=KR:ko";
const fallbackTitle = "\uac15\uc6d0FC \ub274\uc2a4";
const fallbackSummary = "\uc6d0\ubb38 \ub9c1\ud06c\uc5d0\uc11c \uae30\uc0ac \ub0b4\uc6a9\uc744 \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";

export async function fetchGangwonNews(limit = 45): Promise<NewsItem[]> {
  const results = await Promise.allSettled(newsQueries.map((query, queryIndex) => fetchNewsQuery(query, queryIndex)));
  const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  if (!items.length) {
    throw new Error("News feed request failed");
  }

  return dedupeNews(items).slice(0, limit);
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
      category: categorizeNews(title, summary, source),
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

function categorizeNews(title: string, summary: string, source = ""): NewsCategory {
  const text = `${title} ${summary} ${source}`;

  if (/(\ubd80\uc0c1|\uacb0\uc7a5|\ubcf5\uadc0|\uc7ac\ud65c|\ud68c\ubcf5)/.test(text)) return "injury";
  if (/(\uc774\uc801|\uc601\uc785|\uc784\ub300|\uacc4\uc57d|\ud569\ub958|\ubc29\ucd9c|\uc7ac\uacc4\uc57d)/.test(text)) return "transfer";
  if (/(\ud2f0\ucf13|\uc608\ub9e4|\uc785\uc7a5\uad8c|\uc785\uc7a5)/.test(text)) return "ticket";
  if (/(\uc774\ubca4\ud2b8|\ud589\uc0ac|\ud32c\uc0ac\uc778\ud68c|MD|\uacbd\ud488|\ud478\ub4dc\ud2b8\ub7ed)/i.test(text)) return "event";
  if (/(\uc778\ud130\ubdf0|\uc18c\uac10|\uac01\uc624|\ub9d0\ud588\ub2e4|\ubc1d\ud614\ub2e4|\uc77c\ubb38\uc77c\ub2f5)/.test(text)) return "interview";
  if (/(\ud504\ub9ac\ubdf0|\uc804\ub9dd|\uc55e\ub450\uace0|\uc608\uace0)/.test(text)) return "preview";
  if (/(\ub9ac\ubdf0|\uacb0\uacfc|\uc2b9\ub9ac|\ud328\ubc30|\ubb34\uc2b9\ubd80|\uc885\ub8cc)/.test(text)) return "review";
  if (/(K\ub9ac\uadf8|\uacbd\uae30|\ub77c\uc6b4\ub4dc|\ub9de\ub300\uacb0|\uc6d0\uc815|\ud648\uacbd\uae30|\uc120\ubc1c|\ub77c\uc778\uc5c5|\ub300\uacb0|\ucd9c\uaca9|\ub4dd\uc810|\ub3c4\uc6c0|\ud558\uc774\ub77c\uc774\ud2b8)/i.test(text)) return "match";
  if (/(\uad6c\ub2e8|\ub300\ud45c\uc774\uc0ac|\uc6b4\uc601|\ubc1c\ud45c|\uacf5\uc9c0|\ud589\uc815|\uc9d5\uacc4|\uc720\ub2c8\ud3fc)/.test(text)) return "club";
  if (/(\uc120\uc218|\ud65c\uc57d|\ub4dd\uc810|\ub3c4\uc6c0|\ub370\ubdf0|\uac10\ub3c5|\ucf54\uce58|\uacf5\uaca9\uc218|\ubbf8\ub4dc\ud544\ub354|\uc218\ube44\uc218|\uace8\ud0a4\ud37c)/.test(text)) return "player";

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
