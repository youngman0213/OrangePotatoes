import { NextResponse } from "next/server";
import { fetchMatchGoalEvents } from "@/lib/matchEvents";
import type { Match } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const match = (await request.json()) as Match;
    const data = await fetchMatchGoalEvents(match);

    return NextResponse.json({ data, updatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Goal event request failed"
      },
      { status: 200 }
    );
  }
}
