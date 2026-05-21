import { NextResponse } from "next/server";
import { getGangwonSummary } from "@/lib/naverKleague";

export const revalidate = 60 * 60 * 6;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonCode = searchParams.get("seasonCode") ?? "2026";
  const result = await getGangwonSummary(seasonCode);

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600, stale-if-error=86400"
    }
  });
}
