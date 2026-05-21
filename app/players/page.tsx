"use client";

import { useEffect, useMemo, useState } from "react";
import { CoachCard } from "@/components/CoachCard";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { PlayerCard } from "@/components/PlayerCard";
import { SectionHeader } from "@/components/SectionHeader";
import { coaches as mockCoaches, players as mockPlayers } from "@/data/mock";
import type { Coach, Player } from "@/types";

const positionTabs = [
  { label: "전체", value: "all" },
  { label: "GK", value: "GK" },
  { label: "DF", value: "DF" },
  { label: "MF", value: "MF" },
  { label: "FW", value: "FW" }
];

const groupTabs = [
  { label: "선수", value: "players" },
  { label: "코칭스태프", value: "coaches" }
];

const labels = {
  squad: "선수단",
  noPlayers: "조건에 맞는 선수가 없습니다.",
  noCoaches: "코칭스태프 정보가 없습니다."
};

export default function PlayersPage() {
  const [group, setGroup] = useState("players");
  const [position, setPosition] = useState("all");
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [coaches, setCoaches] = useState<Coach[]>(mockCoaches);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/squad")
      .then((response) => response.json())
      .then((data: { players?: Player[]; coaches?: Coach[] }) => {
        if (data.players?.length) setPlayers(data.players);
        if (data.coaches?.length) setCoaches(data.coaches);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPlayers = useMemo(
    () => players.filter((player) => position === "all" || player.position === position),
    [players, position]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title={labels.squad} eyebrow="선수 정보" />
      <div className="grid gap-3">
        <FilterTabs tabs={groupTabs} active={group} onChange={setGroup} />
        {group === "players" ? <FilterTabs tabs={positionTabs} active={position} onChange={setPosition} /> : null}
      </div>

      {loading ? (
        <LoadingState />
      ) : group === "players" ? (
        filteredPlayers.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} />)}
          </div>
        ) : (
          <EmptyState title={labels.noPlayers} />
        )
      ) : coaches.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {coaches.map((coach) => <CoachCard key={coach.id} coach={coach} />)}
        </div>
      ) : (
        <EmptyState title={labels.noCoaches} />
      )}
    </div>
  );
}
