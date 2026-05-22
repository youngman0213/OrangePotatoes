import type { Video, VideoCategory } from "@/types";

const youtubeApiBaseUrl = "https://www.googleapis.com/youtube/v3/search";
const coupangPlaySportsChannelId = "UCnBht7BrOx-A328KFXgysqQ";
const gangwonFcChannelId = "UCuLjoid8kKTKITvkUP94kJA";
const cacheSeconds = 60 * 60 * 6;

const gangwonKeywords = ["강원", "강원FC", "Gangwon", "Gangwon FC"];
const highlightKeywords = ["하이라이트", "Highlights", "Highlight", "2-Minute", "2 Minute", "5-Min", "5 Minute", "H/L"];

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: {
    message?: string;
  };
}

interface YouTubeSearchItem {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: { url?: string };
      high?: { url?: string };
      default?: { url?: string };
    };
  };
}

export async function fetchCoupangGangwonHighlights(limit = 12): Promise<Video[]> {
  const latestChannelVideos = searchYouTubeVideos({
    channelId: coupangPlaySportsChannelId,
    maxResults: 50
  });
  const keywordVideos = Promise.all(gangwonKeywords.map((keyword) => searchYouTubeVideos({
    channelId: coupangPlaySportsChannelId,
    query: keyword,
    maxResults: 10
  })));
  const [latest, keywordResults] = await Promise.all([latestChannelVideos, keywordVideos]);

  return uniqueVideos([...latest, ...keywordResults.flat()])
    .filter(isGangwonVideo)
    .filter(isHighlightVideo)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function fetchGangwonOfficialVideos(limit = 12): Promise<Video[]> {
  const videos = await searchYouTubeVideos({
    channelId: gangwonFcChannelId,
    maxResults: limit
  });

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

async function searchYouTubeVideos({
  channelId,
  query,
  maxResults
}: {
  channelId: string;
  query?: string;
  maxResults: number;
}) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
    key: apiKey
  });

  if (query) params.set("q", query);

  const response = await fetch(`${youtubeApiBaseUrl}?${params.toString()}`, {
    next: { revalidate: cacheSeconds }
  });
  const payload = await response.json() as YouTubeSearchResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `YouTube API request failed: ${response.status}`);
  }

  return (payload.items ?? []).map(toVideo).filter((video): video is Video => Boolean(video));
}

function toVideo(item: YouTubeSearchItem): Video | null {
  const youtubeId = item.id?.videoId;
  const snippet = item.snippet;
  if (!youtubeId || !snippet?.title) return null;

  return {
    id: `youtube-${youtubeId}`,
    title: decodeHtml(snippet.title),
    youtubeId,
    thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    publishedAt: snippet.publishedAt ?? new Date().toISOString(),
    category: categorizeVideo(`${snippet.title} ${snippet.description ?? ""}`),
    channelTitle: snippet.channelTitle,
    description: snippet.description ?? ""
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
