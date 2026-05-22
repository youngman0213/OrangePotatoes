import type { Video, VideoCategory } from "@/types";

const youtubeSearchUrl = "https://www.googleapis.com/youtube/v3/search";
const youtubePlaylistItemsUrl = "https://www.googleapis.com/youtube/v3/playlistItems";
const coupangPlaySportsChannelId = "UCnBht7BrOx-A328KFXgysqQ";
const coupangKLeaguePlaylistId = "PLWTZYHe9YKAKlowFKOlQDtcrfE-ldfMVq";
const gangwonFcChannelId = "UCuLjoid8kKTKITvkUP94kJA";
const cacheSeconds = 60 * 60 * 6;

const gangwonKeywords = ["\uac15\uc6d0", "\uac15\uc6d0FC", "Gangwon", "Gangwon FC"];
const highlightKeywords = ["\ud558\uc774\ub77c\uc774\ud2b8", "Highlights", "Highlight", "2-Minute", "2 Minute", "5-Min", "5 Minute", "H/L"];

interface YouTubeApiResponse<T> {
  items?: T[];
  error?: {
    message?: string;
  };
}

interface YouTubeSearchItem {
  id?: {
    videoId?: string;
  };
  snippet?: YouTubeSnippet;
}

interface YouTubePlaylistItem {
  snippet?: YouTubeSnippet & {
    resourceId?: {
      videoId?: string;
    };
  };
}

interface YouTubeSnippet {
  title?: string;
  description?: string;
  publishedAt?: string;
  channelTitle?: string;
  thumbnails?: {
    medium?: { url?: string };
    high?: { url?: string };
    default?: { url?: string };
  };
}

export async function fetchCoupangGangwonHighlights(limit = 12): Promise<Video[]> {
  const [playlistVideos, latestChannelVideos, keywordResults] = await Promise.all([
    fetchPlaylistVideos(coupangKLeaguePlaylistId, 50),
    searchYouTubeVideos({ channelId: coupangPlaySportsChannelId, maxResults: 25 }),
    Promise.all(gangwonKeywords.map((keyword) => searchYouTubeVideos({
      channelId: coupangPlaySportsChannelId,
      query: keyword,
      maxResults: 10
    })))
  ]);

  return uniqueVideos([...playlistVideos, ...latestChannelVideos, ...keywordResults.flat()])
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

async function fetchPlaylistVideos(playlistId: string, maxResults: number) {
  const apiKey = getYouTubeApiKey();
  const params = new URLSearchParams({
    part: "snippet",
    playlistId,
    maxResults: String(maxResults),
    key: apiKey
  });

  const response = await fetch(`${youtubePlaylistItemsUrl}?${params.toString()}`, {
    next: { revalidate: cacheSeconds }
  });
  const payload = await response.json() as YouTubeApiResponse<YouTubePlaylistItem>;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `YouTube playlist request failed: ${response.status}`);
  }

  return (payload.items ?? []).map(toPlaylistVideo).filter((video): video is Video => Boolean(video));
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
  const apiKey = getYouTubeApiKey();
  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
    key: apiKey
  });

  if (query) params.set("q", query);

  const response = await fetch(`${youtubeSearchUrl}?${params.toString()}`, {
    next: { revalidate: cacheSeconds }
  });
  const payload = await response.json() as YouTubeApiResponse<YouTubeSearchItem>;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `YouTube search request failed: ${response.status}`);
  }

  return (payload.items ?? []).map(toSearchVideo).filter((video): video is Video => Boolean(video));
}

function getYouTubeApiKey() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  return apiKey;
}

function toSearchVideo(item: YouTubeSearchItem): Video | null {
  return toVideo(item.id?.videoId, item.snippet);
}

function toPlaylistVideo(item: YouTubePlaylistItem): Video | null {
  return toVideo(item.snippet?.resourceId?.videoId, item.snippet);
}

function toVideo(youtubeId: string | undefined, snippet: YouTubeSnippet | undefined): Video | null {
  if (!youtubeId || !snippet?.title) return null;

  const title = decodeHtml(snippet.title);
  const description = snippet.description ?? "";

  return {
    id: `youtube-${youtubeId}`,
    title,
    youtubeId,
    thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    publishedAt: snippet.publishedAt ?? new Date().toISOString(),
    category: categorizeVideo(`${title} ${description}`),
    channelTitle: snippet.channelTitle,
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
  if (/(\uc778\ud130\ubdf0|\uc218\ud6c8|\uc18c\uac10|\uae30\uc790\ud68c\uacac|interview)/i.test(text)) return "interview";
  if (/(\ud6c8\ub828|\ud2b8\ub808\uc774\ub2dd|\uc5f0\uc2b5|training)/i.test(text)) return "training";
  if (/(\ube44\ud558\uc778\ub4dc|\ucd9c\uadfc\uae38|\ub77c\ucee4\ub8f8|\ube0c\uc774\ub85c\uadf8|\uc2a4\ucf00\uce58|behind)/i.test(text)) return "behind";

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
