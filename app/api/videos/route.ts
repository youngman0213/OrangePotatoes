import { NextResponse } from "next/server";
import {
  fetchCoupangGangwonHighlights,
  fetchGangwonOfficialVideos,
  fetchKLeagueGangwonHighlights
} from "@/lib/youtubeVideos";

export const revalidate = 10800;

export async function GET() {
  const [highlightsResult, kLeagueHighlightsResult, clubVideosResult] = await Promise.allSettled([
    fetchCoupangGangwonHighlights(12),
    fetchKLeagueGangwonHighlights(12),
    fetchGangwonOfficialVideos(12)
  ]);

  const highlights = highlightsResult.status === "fulfilled" ? highlightsResult.value : [];
  const kLeagueHighlights = kLeagueHighlightsResult.status === "fulfilled" ? kLeagueHighlightsResult.value : [];
  const clubVideos = clubVideosResult.status === "fulfilled" ? clubVideosResult.value : [];
  const errors = [
    highlightsResult.status === "rejected" ? getVideoErrorMessage(highlightsResult.reason) : "",
    kLeagueHighlightsResult.status === "rejected" ? getVideoErrorMessage(kLeagueHighlightsResult.reason) : "",
    clubVideosResult.status === "rejected" ? getVideoErrorMessage(clubVideosResult.reason) : ""
  ].filter(Boolean);

  return NextResponse.json(
    {
      highlights,
      kLeagueHighlights,
      clubVideos,
      items: [...highlights, ...kLeagueHighlights, ...clubVideos],
      source: "youtube-rss",
      error: errors[0],
      updatedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10800, stale-while-revalidate=10800, stale-if-error=86400"
      }
    }
  );
}

function getVideoErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "";

  if (/quota|Quota|Search Queries|youtube\.googleapis\.com/.test(rawMessage)) {
    return "오늘 YouTube API 사용량을 초과했습니다. 공식 채널에서 확인해주세요.";
  }

  return "영상을 불러오지 못했습니다. 공식 채널에서 확인해주세요.";
}
