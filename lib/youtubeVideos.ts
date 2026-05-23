import { XMLParser } from "fast-xml-parser";
import type { Video, VideoCategory } from "@/types";

const youtubeFeedBaseUrl = "https://www.youtube.com/feeds/videos.xml";
const coupangKLeaguePlaylistId = "PLWTZYHe9YKAKlowFKOlQDtcrfE-ldfMVq";
const gangwonFcChannelId = "UCuLjoid8kKTKITvkUP94kJA";
const cacheSeconds = 60 * 60 * 6;

const gangwonKeywords = ["강원", "강원FC", "Gangwon", "Gangwon FC"];
const highlightKeywords = ["하이라이트", "Highlights", "Highlight", "2-Minute", "2 Minute", "5-Min", "5 Minute", "H/L"];

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true
});

interface YouTubeFeedEntry {
  title?: string;
  videoId?: string;
  published?: string;
  author?: {
    name?: string;
  };
  group?: {
    description?: string;
    thumbnail?: {
      "@_url"?: string;
    };
  };
}

export async function fetchCoupangGangwonHighlights(limit = 12): Promise<Video[]> {
  const playlistUrl = `${youtubeFeedBaseUrl}?playlist_id=${coupangKLeaguePlaylistId}`;
  const playlistVideos = await fetchFeedVideos(playlistUrl, 50);

  return uniqueVideos(playlistVideos)
    .filter(isGangwonVideo)
    .filter(isHighlightVideo)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function fetchGangwonOfficialVideos(limit = 12): Promise<Video[]> {
  const channelUrl = `${youtubeFeedBaseUrl}?channel_id=${gangwonFcChannelId}`;
  const videos = await fetchFeedVideos(channelUrl, Math.min(Math.max(limit, 12), 50));

  return uniqueVideos(videos)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function isGangwonVideo(video: Pick<Video, "title" | "description">) {
  const text = `${video.title} ${video.description ?? ""}`.toLowerCase();
  return gangwonKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function isHighlightVideo(video: Pick<Video, "title" | "description">) {
  const text = `${video.title} ${video.description ?? ""}`.toLowerCase();
  return highlightKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

async function fetchFeedVideos(feedUrl: string, maxResults: number) {
  const response = await fetch(feedUrl, {
    next: { revalidate: cacheSeconds },
    headers: {
      Accept: "application/atom+xml, application/xml, text/xml",
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube feed request failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);
  const rawEntries = parsed?.feed?.entry;
  const entries: YouTubeFeedEntry[] = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];

  return entries
    .slice(0, maxResults)
    .map(toFeedVideo)
    .filter((video): video is Video => Boolean(video));
}

function toFeedVideo(entry: YouTubeFeedEntry): Video | null {
  const youtubeId = entry.videoId?.trim();
  if (!youtubeId) return null;

  const title = decodeHtml(entry.title?.trim() || "강원FC 영상");
  const description = decodeHtml(entry.group?.description?.trim() ?? "");
  const channelTitle = decodeHtml(entry.author?.name?.trim() ?? "YouTube");

  return {
    id: `youtube-${youtubeId}`,
    title,
    youtubeId,
    thumbnailUrl: entry.group?.thumbnail?.["@_url"] ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    publishedAt: entry.published ?? new Date().toISOString(),
    category: categorizeVideo(`${title} ${description}`),
    channelTitle,
    description
  };
}

function uniqueVideos(videos: Video[]) {
  const seen = new Set<string>();
  return videos.filter((video) => {
    if (seen.has(video.youtubeId)) return false;
    seen.add(video.youtubeId);
    return true;
  });
}

function categorizeVideo(text: string): VideoCategory {
  if (isHighlightVideo({ title: text })) return "highlight";
  if (/(인터뷰|수훈|소감|기자회견|interview)/i.test(text)) return "interview";
  if (/(훈련|트레이닝|연습|training)/i.test(text)) return "training";
  if (/(비하인드|출근길|라커룸|브이로그|스케치|behind)/i.test(text)) return "behind";

  return "other";
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
