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

const newsUrl = "https://news.google.com/rss/search?q=%EA%B0%95%EC%9B%90FC&hl=ko&gl=KR&ceid=KR:ko";
const fallbackTitle = "\uac15\uc6d0FC \ub274\uc2a4";
const fallbackSummary = "\uc6d0\ubb38 \ub9c1\ud06c\uc5d0\uc11c \uae30\uc0ac \ub0b4\uc6a9\uc744 \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";

export async function fetchGangwonNews(limit = 20): Promise<NewsItem[]> {
  const response = await fetch(newsUrl, {
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

  const normalizedItems = items.map((item, index) => {
    const title = cleanText(item.title ?? fallbackTitle);
    const summary = cleanText(stripHtml(item.description ?? ""));
    const source = typeof item.source === "string" ? item.source : item.source?.["#text"] ?? "Google News";

    return {
      id: `google-news-${index}-${item.pubDate ?? title}`,
      title,
      source,
      url: item.link ?? newsUrl,
      summary: summary || fallbackSummary,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      category: categorizeNews(title, summary),
      thumbnailUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80"
    };
  });

  return dedupeNews(normalizedItems).slice(0, limit);
}

function dedupeNews(items: NewsItem[]) {
  const seenUrls = new Set<string>();
  const seenTitles: string[] = [];
  const unique: NewsItem[] = [];

  for (const item of items) {
    const urlKey = normalizeNewsUrl(item.url);
    const titleKey = normalizeNewsTitle(item.title);

    if (urlKey && seenUrls.has(urlKey)) continue;
    if (seenTitles.some((seenTitle) => areSimilarTitles(seenTitle, titleKey))) continue;

    if (urlKey) seenUrls.add(urlKey);
    seenTitles.push(titleKey);
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
    return url.toLowerCase();
  }
}

function normalizeNewsTitle(title: string) {
  return title
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/[“”"'‘’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function areSimilarTitles(a: string, b: string) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) >= 18;

  const aTokens = new Set(a.split(" ").filter((token) => token.length > 1));
  const bTokens = new Set(b.split(" ").filter((token) => token.length > 1));
  const intersection = Array.from(aTokens).filter((token) => bTokens.has(token)).length;
  const base = Math.min(aTokens.size, bTokens.size);

  return base >= 5 && intersection / base >= 0.8;
}

function categorizeNews(title: string, summary: string): NewsCategory {
  const text = `${title} ${summary}`;

  if (/(preview|\ud504\ub9ac\ubdf0|\uc804\ub9dd|\uc55e\ub450\uace0|\uc0c1\ub300|\ucd9c\uaca9|\ub300\uacb0)/i.test(text)) return "match-preview";
  if (/(review|\ub9ac\ubdf0|\uc2b9\ub9ac|\ud328\ubc30|\ubb34\uc2b9\ubd80|\uacb0\uacfc|\ud558\uc774\ub77c\uc774\ud2b8|\ub4dd\uc810)/i.test(text)) return "match-review";
  if (/(\uc774\uc801|\uc601\uc785|\ubd80\uc0c1|\ubcf5\uadc0|\uacb0\uc7a5|\uacc4\uc57d)/.test(text)) return "transfer-injury";
  if (/(\uc778\ud130\ubdf0|\ub9d0\ud588\ub2e4|\ubc1d\ud614\ub2e4|\uc18c\uac10)/.test(text)) return "interview";
  if (/(\uacf5\uc9c0|\uc6b4\uc601|\uc9d5\uacc4|\uad6c\ub2e8|\ud589\uc815|\ud2f0\ucf13|\uc774\ubca4\ud2b8)/.test(text)) return "club-admin";

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
