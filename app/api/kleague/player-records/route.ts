import { NextResponse } from "next/server";
import { getCacheControlHeader } from "@/lib/kleague/cache";
import { getVerifiedPlayerRecords } from "@/lib/kleague";

export const revalidate = 21600;

const allowedSortFields = new Set(["goals", "assists", "offencePoints", "yellowCards", "matchesPlayed", "bestEleven"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonCode = searchParams.get("seasonCode") ?? "2026";
  const teamCode = searchParams.get("teamCode") ?? undefined;
  const sortFieldParam = searchParams.get("sortField") ?? "goals";
  const sortField = allowedSortFields.has(sortFieldParam) ? (sortFieldParam as "goals" | "assists" | "offencePoints" | "yellowCards" | "matchesPlayed" | "bestEleven") : "goals";
  const pageSize = Math.max(1, Math.min(Number(searchParams.get("pageSize")) || 100, 200));
  const result = await getVerifiedPlayerRecords({ seasonCode, teamCode, sortField, pageSize });

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": getCacheControlHeader()
    }
  });
}
