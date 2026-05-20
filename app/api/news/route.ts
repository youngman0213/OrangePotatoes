import { NextResponse } from "next/server";
import { news as mockNews } from "@/data/mock";
import { fetchGangwonNews } from "@/lib/newsFeed";

export async function GET() {
  try {
    const items = await fetchGangwonNews();
    return NextResponse.json({ items, source: "google-news-rss" });
  } catch {
    return NextResponse.json({ items: mockNews, source: "mock-fallback" }, { status: 200 });
  }
}
