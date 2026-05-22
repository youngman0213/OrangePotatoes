import { NextResponse } from "next/server";
import { fetchCoupangGangwonHighlights, fetchGangwonOfficialVideos } from "@/lib/youtubeVideos";

export const revalidate = 21600;

export async function GET() {
  try {
    const [highlights, clubVideos] = await Promise.all([
      fetchCoupangGangwonHighlights(12),
      fetchGangwonOfficialVideos(12)
    ]);

    return NextResponse.json(
      {
        highlights,
        clubVideos,
        items: [...highlights, ...clubVideos],
        source: "youtube-data-api",
        updatedAt: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600"
        }
      }
    );
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "";
    const message = rawMessage.includes("YOUTUBE_API_KEY")
      ? "유튜브 API 키가 설정되지 않았습니다."
      : rawMessage || "영상을 불러오지 못했습니다.";

    return NextResponse.json(
      {
        highlights: [],
        clubVideos: [],
        items: [],
        source: "youtube-data-api",
        error: message,
        updatedAt: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}
