import { NextResponse } from "next/server";
import { matches as mockMatches } from "@/data/mock";
import { attachGoalEvents } from "@/lib/matchGoals";
import { fetchOfficialMatches } from "@/lib/officialFeed";

export async function GET() {
  try {
    const items = await attachGoalEvents(await fetchOfficialMatches());
    return NextResponse.json(
      { items, source: "gangwon-official-site" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { items: mockMatches, source: "mock-fallback" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
