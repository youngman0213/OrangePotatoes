import { XMLParser } from "fast-xml-parser";
import type { Video, VideoCategory } from "@/types";

const channelId = "UCuLjoid8kKTKITvkUP94kJA";
const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true
});

interface YouTubeEntry {
  title?: string;
  videoId?: string;
  published?: string;
  group?: {
    thumbnail?: {
      "@_url"?: string;
    };
  };
}

export async function fetchGangwonVideos(limit = 12): Promise<Video[]> {
  const response = await fetch(feedUrl, {
    next: { revalidate: 60 * 30 },
    headers: {
      "User-Agent": "OrangePotatoesFanHub/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube feed request failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);
  const rawEntries = parsed?.feed?.entry;
  const entries: YouTubeEntry[] = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];

  return entries.slice(0, limit).map((entry, index) => {
    const youtubeId = entry.videoId ?? "";
    const title = entry.title ?? "강원FC 영상";

    return {
      id: `youtube-${youtubeId || index}`,
      title,
      youtubeId,
      thumbnailUrl: entry.group?.thumbnail?.["@_url"] ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      publishedAt: entry.published ?? new Date().toISOString(),
      category: categorizeVideo(title)
    };
  });
}

function categorizeVideo(title: string): VideoCategory {
  if (/(하이라이트|골장면|골모음|득점)/.test(title)) return "highlight";
  if (/(인터뷰|수훈|소감|기자회견)/.test(title)) return "interview";
  if (/(훈련|트레이닝|연습)/.test(title)) return "training";
  if (/(비하인드|출근길|라커룸|브이로그|스케치)/.test(title)) return "behind";

  return "other";
}
