import { NextResponse } from "next/server";
import { matches as mockMatches } from "@/data/mock";
import { fetchOfficialMatches } from "@/lib/officialFeed";

export async function GET() {
  try {
    const items = await fetchOfficialMatches();
    return NextResponse.json({ items, source: "gangwon-official-site" });
  } catch {
    return NextResponse.json({ items: mockMatches, source: "mock-fallback" }, { status: 200 });
  }
}
