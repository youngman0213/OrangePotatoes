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
  { label: decodeLabel("\uc804\uccb4"), value: "all" },
  { label: "GK", value: "GK" },
  { label: "DF", value: "DF" },
  { label: "MF", value: "MF" },
  { label: "FW", value: "FW" }
];

const groupTabs = [
  { label: decodeLabel("\uc120\uc218"), value: "players" },
  { label: decodeLabel("\ucf54\uce6d\uc2a4\ud0dc\ud504"), value: "coaches" }
];

const labels = {
  squad: decodeLabel("\uc120\uc218\ub2e8"),
  noPlayers: decodeLabel("\uc870\uac74\uc5d0 \ub9de\ub294 \uc120\uc218\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."),
  noCoaches: decodeLabel("\ucf54\uce6d\uc2a4\ud0dc\ud504 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.")
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
      <SectionHeader title={labels.squad} eyebrow="Squad" />
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

function decodeLabel(value: string) {
  return value;
}
