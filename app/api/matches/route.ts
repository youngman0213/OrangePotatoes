import { NextResponse } from "next/server";
import { matches as mockMatches } from "@/data/mock";
import { attachGoalEvents } from "@/lib/matchGoals";
import { fetchOfficialMatches } from "@/lib/officialFeed";

export const revalidate = 120;

const cacheControl = "public, s-maxage=120, stale-while-revalidate=120, stale-if-error=3600";

export async function GET() {
  try {
    const items = await attachGoalEvents(await fetchOfficialMatches());
    return NextResponse.json(
      { items, source: "gangwon-official-site" },
      { headers: { "Cache-Control": cacheControl } }
    );
  } catch {
    return NextResponse.json(
      { items: mockMatches, source: "mock-fallback" },
      { status: 200, headers: { "Cache-Control": cacheControl } }
    );
  }
}
