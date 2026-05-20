"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { PlayerCard } from "@/components/PlayerCard";
import { SectionHeader } from "@/components/SectionHeader";
import { players } from "@/data/mock";

const tabs = [
  { label: "전체", value: "all" },
  { label: "GK", value: "GK" },
  { label: "DF", value: "DF" },
  { label: "MF", value: "MF" },
  { label: "FW", value: "FW" }
];

export default function PlayersPage() {
  const [position, setPosition] = useState("all");
  const filteredPlayers = useMemo(
    () => players.filter((player) => position === "all" || player.position === position),
    [position]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader title="선수단" eyebrow="Squad" />
      <FilterTabs tabs={tabs} active={position} onChange={setPosition} />
      {filteredPlayers.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} />)}
        </div>
      ) : (
        <EmptyState title="조건에 맞는 선수가 없습니다." />
      )}
    </div>
  );
}
