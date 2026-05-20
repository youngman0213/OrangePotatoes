import { NextResponse } from "next/server";
import { videos as mockVideos } from "@/data/mock";
import { fetchGangwonVideos } from "@/lib/videoFeed";

export async function GET() {
  try {
    const items = await fetchGangwonVideos();
    return NextResponse.json({ items, source: "youtube-rss" });
  } catch {
    return NextResponse.json({ items: mockVideos, source: "mock-fallback" }, { status: 200 });
  }
}
