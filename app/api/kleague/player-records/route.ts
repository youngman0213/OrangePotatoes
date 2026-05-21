import { NextResponse } from "next/server";
import { getKLeaguePlayerRecords } from "@/lib/naverKleague";

export const revalidate = 60 * 60 * 6;

const allowedSortFields = new Set(["goals", "assists", "offencePoints", "yellowCards"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonCode = searchParams.get("seasonCode") ?? "2026";
  const teamCode = searchParams.get("teamCode") ?? undefined;
  const sortFieldParam = searchParams.get("sortField") ?? "goals";
  const sortField = allowedSortFields.has(sortFieldParam) ? (sortFieldParam as "goals" | "assists" | "offencePoints" | "yellowCards") : "goals";
  const pageSize = Math.min(Number(searchParams.get("pageSize")) || 100, 200);
  const result = await getKLeaguePlayerRecords({ seasonCode, teamCode, sortField, pageSize });

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600, stale-if-error=86400"
    }
  });
}
