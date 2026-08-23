import { NextResponse } from "next/server";
import { getCacheControlHeader, getCacheSeconds } from "@/lib/kleague/cache";
import { getVerifiedStandings } from "@/lib/kleague";

export const revalidate = getCacheSeconds();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonCode = searchParams.get("seasonCode") ?? "2026";
  const result = await getVerifiedStandings(seasonCode);

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": getCacheControlHeader()
    }
  });
}
