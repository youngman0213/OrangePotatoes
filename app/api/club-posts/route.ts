import { NextResponse } from "next/server";
import { clubPosts as mockClubPosts } from "@/data/mock";
import { fetchOfficialClubPosts } from "@/lib/officialFeed";

export async function GET() {
  try {
    const items = await fetchOfficialClubPosts();
    return NextResponse.json({ items, source: "gangwon-official-site" });
  } catch {
    return NextResponse.json({ items: mockClubPosts, source: "mock-fallback" }, { status: 200 });
  }
}
