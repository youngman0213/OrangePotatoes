import { XMLParser } from "fast-xml-parser";
import type { Video, VideoCategory } from "@/types";

const youtubeFeedBaseUrl = "https://www.youtube.com/feeds/videos.xml";
const coupangKLeaguePlaylistId = "PLWTZYHe9YKAKlowFKOlQDtcrfE-ldfMVq";
const kLeagueHighlightsChannelId = "UCYVxbD_KLbC39PPW9iTBcmQ";
const gangwonFcChannelId = "UCuLjoid8kKTKITvkUP94kJA";
const cacheSeconds = 60 * 60 * 3;

const gangwonKeywords = ["\uac15\uc6d0", "\uac15\uc6d0FC", "Gangwon", "Gangwon FC"];
const highlightKeywords = [
  "\ud558\uc774\ub77c\uc774\ud2b8",
  "\uace8\uc7a5\uba74",
  "\uace8\ubaa8\uc74c",
  "\ub4dd\uc810",
  "\ud480 \ud558\uc774\ub77c\uc774\ud2b8",
  "Highlights",
  "Highlight",
  "2-Minute",
  "2 Minute",
  "5-Min",
  "5 Minute",
  "H/L"
];

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true
});

const fallbackHighlights: Video[] = [
  createFallbackVideo({
    youtubeId: "0deY-mQTzDg",
    title: "[2026 K리그1] 15R 강원 vs 울산 풀 하이라이트",
    publishedAt: "2026-05-17T16:00:07+00:00",
    channelTitle: "쿠팡플레이 스포츠",
    category: "highlight"
  }),
  createFallbackVideo({
    youtubeId: "MunwIvE-53U",
    title: "[2026 K리그1] 15R 강원 vs 울산 2분 하이라이트",
    publishedAt: "2026-05-17T13:30:22+00:00",
    channelTitle: "쿠팡플레이 스포츠",
    category: "highlight"
  }),
  createFallbackVideo({
    youtubeId: "70vycixx-H0",
    title: "[30분 하이라이트] 하나은행 K리그1 2026 15R 강원 vs 울산",
    publishedAt: "2026-05-17T14:00:09+00:00",
    channelTitle: "K LEAGUE Highlights",
    category: "highlight"
  })
];

const fallbackClubVideos: Video[] = [
  createFallbackVideo({
    youtubeId: "33FGJbGzhgA",
    title: "[WE UP : 偉業 EP.16] 꿈을 향한 발걸음은 멈추지 않는다",
    publishedAt: "2026-05-23T02:00:10+00:00",
    channelTitle: "강원FC",
    category: "other"
  }),
  createFallbackVideo({
    youtubeId: "AEuRWXUQD5o",
    title: "[뷰잉파티] 감자아일랜드와 함께한 강원FC 뷰잉파티 현장",
    publishedAt: "2026-05-22T02:30:03+00:00",
    channelTitle: "강원FC",
    category: "behind"
  }),
  createFallbackVideo({
    youtubeId: "VZLP3cz70dI",
    title: "[WE UP : 偉業 EP.15] 다시 뜨거워진 강릉의 밤",
    publishedAt: "2026-05-20T03:00:17+00:00",
    channelTitle: "강원FC",
    category: "other"
  }),
  createFallbackVideo({
    youtubeId: "YEInctz2d5A",
    title: "[R15 골] 26.5.17 R15 골장면 vs울산 HD FC",
    publishedAt: "2026-05-17T13:47:12+00:00",
    channelTitle: "강원FC",
    category: "highlight"
  })
];

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

export async function fetchGangwonHighlights(limit = 12): Promise<Video[]> {
  const [coupangResult, kLeagueResult] = await Promise.allSettled([
    fetchCoupangGangwonHighlights(limit),
    fetchKLeagueGangwonHighlights(limit)
  ]);

  const coupangVideos = coupangResult.status === "fulfilled" ? coupangResult.value : [];
  const kLeagueVideos = kLeagueResult.status === "fulfilled" ? kLeagueResult.value : [];
  const videos = uniqueVideos([...coupangVideos, ...kLeagueVideos])
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (videos.length ? videos : fallbackHighlights).slice(0, limit);
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

export async function fetchKLeagueGangwonHighlights(limit = 12): Promise<Video[]> {
  const channelUrl = `${youtubeFeedBaseUrl}?channel_id=${kLeagueHighlightsChannelId}`;
  const videos = await fetchFeedVideos(channelUrl, 50);

  return uniqueVideos(videos)
    .filter(isGangwonVideo)
    .filter(isHighlightVideo)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function fetchGangwonOfficialVideos(limit = 12): Promise<Video[]> {
  try {
    const channelUrl = `${youtubeFeedBaseUrl}?channel_id=${gangwonFcChannelId}`;
    const videos = await fetchFeedVideos(channelUrl, Math.min(Math.max(limit, 12), 50));

    return uniqueVideos(videos)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  } catch {
    return fallbackClubVideos.slice(0, limit);
  }
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

  const title = decodeHtml(entry.title?.trim() || "\uac15\uc6d0FC \uc601\uc0c1");
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

function createFallbackVideo(video: Pick<Video, "youtubeId" | "title" | "publishedAt" | "channelTitle" | "category">): Video {
  return {
    id: `youtube-${video.youtubeId}`,
    title: video.title,
    youtubeId: video.youtubeId,
    thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
    publishedAt: video.publishedAt,
    category: video.category,
    channelTitle: video.channelTitle,
    description: video.title
  };
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
