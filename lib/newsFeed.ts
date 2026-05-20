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

const newsUrl =
  "https://news.google.com/rss/search?q=%EA%B0%95%EC%9B%90FC&hl=ko&gl=KR&ceid=KR:ko";

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

  return items.slice(0, limit).map((item, index) => {
    const title = cleanText(item.title ?? "강원FC 뉴스");
    const summary = cleanText(stripHtml(item.description ?? ""));
    const source = typeof item.source === "string" ? item.source : item.source?.["#text"] ?? "Google News";

    return {
      id: `google-news-${index}-${item.pubDate ?? title}`,
      title,
      source,
      url: item.link ?? newsUrl,
      summary: summary || "원문 링크에서 기사 내용을 확인할 수 있습니다.",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      category: categorizeNews(title, summary),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80"
    };
  });
}

function categorizeNews(title: string, summary: string): NewsCategory {
  const text = `${title} ${summary}`;

  if (/(프리뷰|전망|앞두고|상대|출격|대결)/.test(text)) return "match-preview";
  if (/(리뷰|승리|패배|무승부|결과|하이라이트|득점)/.test(text)) return "match-review";
  if (/(이적|영입|부상|복귀|결장|계약)/.test(text)) return "transfer-injury";
  if (/(인터뷰|말했다|밝혔다|소감)/.test(text)) return "interview";
  if (/(공지|운영|징계|구단|행정|티켓|이벤트)/.test(text)) return "club-admin";

  return "other";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function cleanText(value: string) {
  return value.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}
