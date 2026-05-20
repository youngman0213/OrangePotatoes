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
    const title = entry.title ?? "\uac15\uc6d0FC \uc601\uc0c1";

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
  if (/(\ud558\uc774\ub77c\uc774\ud2b8|\uace8\uc7a5\uba74|\uace8\ubaa8\uc74c|\ub4dd\uc810)/.test(title)) return "highlight";
  if (/(\uc778\ud130\ubdf0|\uc218\ud6c8|\uc18c\uac10|\uae30\uc790\ud68c\uacac)/.test(title)) return "interview";
  if (/(\ud6c8\ub828|\ud2b8\ub808\uc774\ub2dd|\uc5f0\uc2b5)/.test(title)) return "training";
  if (/(\ube44\ud558\uc778\ub4dc|\ucd9c\uadfc\uae38|\ub77c\ucee4\ub8f8|\ube0c\uc774\ub85c\uadf8|\uc2a4\ucf00\uce58)/.test(title)) return "behind";

  return "other";
}
