import { NextResponse } from "next/server";
import { getCacheControlHeader } from "@/lib/kleague/cache";
import { getGangwonAverageRatings } from "@/lib/kleague/ratings";

export const revalidate = 21600;

export async function GET() {
  try {
    const data = await getGangwonAverageRatings();

    return NextResponse.json(
      {
        source: "kleague-official-match-rating",
        note: "K리그 공식 경기 평점 기반 평균. 경기별 선수 평점을 누적해 계산한 팬사이트 자체 평균입니다.",
        updatedAt: new Date().toISOString(),
        data
      },
      { headers: { "Cache-Control": getCacheControlHeader() } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        source: "kleague-official-match-rating",
        note: "K리그 공식 경기 평점 기반 평균. 경기별 선수 평점을 누적해 계산한 팬사이트 자체 평균입니다.",
        updatedAt: new Date().toISOString(),
        data: [],
        error: error instanceof Error ? error.message : "평점 데이터를 불러오지 못했습니다."
      },
      { headers: { "Cache-Control": getCacheControlHeader() }, status: 200 }
    );
  }
}
