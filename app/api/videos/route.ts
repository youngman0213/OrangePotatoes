import { NextResponse } from "next/server";
import { fetchCoupangGangwonHighlights, fetchGangwonOfficialVideos } from "@/lib/youtubeVideos";

export const revalidate = 21600;

export async function GET() {
  const [highlightsResult, clubVideosResult] = await Promise.allSettled([
    fetchCoupangGangwonHighlights(12),
    fetchGangwonOfficialVideos(12)
  ]);

  const highlights = highlightsResult.status === "fulfilled" ? highlightsResult.value : [];
  const clubVideos = clubVideosResult.status === "fulfilled" ? clubVideosResult.value : [];
  const errors = [
    highlightsResult.status === "rejected" ? getVideoErrorMessage(highlightsResult.reason) : "",
    clubVideosResult.status === "rejected" ? getVideoErrorMessage(clubVideosResult.reason) : ""
  ].filter(Boolean);

  return NextResponse.json(
    {
      highlights,
      clubVideos,
      items: [...highlights, ...clubVideos],
      source: "youtube-data-api",
      error: errors[0],
      updatedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600, stale-if-error=86400"
      }
    }
  );
}

function getVideoErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "";

  if (rawMessage.includes("YOUTUBE_API_KEY")) {
    return "YouTube API 키가 설정되지 않았습니다.";
  }

  if (/quota|Quota|Search Queries|youtube\.googleapis\.com/.test(rawMessage)) {
    return "오늘 YouTube API 사용량을 초과했습니다. 공식 채널에서 확인해주세요.";
  }

  return "영상을 불러오지 못했습니다. 공식 채널에서 확인해주세요.";
}
