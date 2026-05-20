import { NextResponse } from "next/server";
import { coaches as mockCoaches, players as mockPlayers } from "@/data/mock";
import { fetchOfficialCoaches, fetchOfficialPlayers } from "@/lib/officialFeed";

export async function GET() {
  const [playersResult, coachesResult] = await Promise.allSettled([
    fetchOfficialPlayers(),
    fetchOfficialCoaches()
  ]);

  const players = playersResult.status === "fulfilled" && playersResult.value.length ? playersResult.value : mockPlayers;
  const coaches = coachesResult.status === "fulfilled" && coachesResult.value.length ? coachesResult.value : mockCoaches;

  return NextResponse.json({
    players,
    coaches,
    source: "gangwon-official-site"
  });
}
