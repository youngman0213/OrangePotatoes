import { NextResponse } from "next/server";
import { getVerifiedCombinedPlayerRecords, getVerifiedGangwonSummary, getVerifiedStandings } from "@/lib/kleague";
import { isRefreshWindow } from "@/lib/kleague/cache";

export const revalidate = 0;

export async function GET() {
  const seasonCode = "2026";
  const [standings, playerRecords, gangwonSummary] = await Promise.all([
    getVerifiedStandings(seasonCode),
    getVerifiedCombinedPlayerRecords(seasonCode),
    getVerifiedGangwonSummary(seasonCode)
  ]);

  return NextResponse.json({
    ok: true,
    refreshWindow: isRefreshWindow(),
    seasonCode,
    updatedAt: new Date().toISOString(),
    standingsCount: standings.data.length,
    playerRecordsCount: playerRecords.data.length,
    gangwonSummaryCount: gangwonSummary.data.length,
    errors: [standings.error, playerRecords.error, gangwonSummary.error].filter(Boolean)
  });
}
