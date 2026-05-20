import type { LeaguePlayerStat } from "@/types";

interface PlayerStatsPanelProps {
  stats: LeaguePlayerStat[];
}

const labels = {
  title: "\uac1c\uc778 \uae30\ub85d",
  loadFailed: "K\ub9ac\uadf8 \uacf5\uc2dd \uac1c\uc778 \uae30\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
  topScorer: "\uac15\uc6d0 \ucd5c\ub2e4 \ub4dd\uc810",
  topAssister: "\uac15\uc6d0 \ucd5c\ub2e4 \ub3c4\uc6c0",
  topYellowCards: "\uac15\uc6d0 \uacbd\uace0 \uc0c1\uc704",
  officialBasis: "\uacf5\uc2dd \uae30\ub85d \uae30\uc900",
  pageBasis: "\ud45c\uc2dc\ub41c \uac15\uc6d0 \uc120\uc218 \uae30\ub85d \uae30\uc900",
  goalsRank: "\uac15\uc6d0 \ub4dd\uc810",
  assistsRank: "\uac15\uc6d0 \ub3c4\uc6c0",
  yellowRank: "\uac15\uc6d0 \uacbd\uace0",
  goal: "\uace8",
  assist: "\ub3c4\uc6c0",
  card: "\uc7a5"
};

export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  const gangwonStats = stats.filter((item) => item.club === "GANGWON");
  const topScorer = [...gangwonStats].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...gangwonStats].sort((a, b) => b.assists - a.assists)[0];
  const goals = [...gangwonStats].filter((row) => row.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const assists = [...gangwonStats].filter((row) => row.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5);
  const yellows = [...gangwonStats].filter((row) => row.yellowCards > 0).sort((a, b) => b.yellowCards - a.yellowCards).slice(0, 5);

  if (!stats.length) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
        <h2 className="text-lg font-black text-gangwon-navy">{labels.title}</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">{labels.loadFailed}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <RecordSummary title={labels.topScorer} value={topScorer ? `${topScorer.name}` : "-"} meta={topScorer ? `${topScorer.goals}${labels.goal} ${topScorer.assists}${labels.assist}` : labels.officialBasis} />
        <RecordSummary title={labels.topAssister} value={topAssister ? `${topAssister.name}` : "-"} meta={topAssister ? `${topAssister.goals}${labels.goal} ${topAssister.assists}${labels.assist}` : labels.officialBasis} />
        <RecordSummary title={labels.topYellowCards} value={yellows[0]?.name ?? "-"} meta={yellows[0] ? `${yellows[0].yellowCards}${labels.card}` : labels.officialBasis} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RankingList title={labels.goalsRank} rows={goals} valueKey="goals" suffix={labels.goal} emptyText={labels.officialBasis} />
        <RankingList title={labels.assistsRank} rows={assists} valueKey="assists" suffix={labels.assist} emptyText={labels.officialBasis} />
        <RankingList title={labels.yellowRank} rows={yellows} valueKey="yellowCards" suffix={labels.card} emptyText={labels.officialBasis} />
      </div>
    </section>
  );
}

function RecordSummary({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase text-gangwon-orange">{title}</p>
      <h3 className="mt-2 text-xl font-black text-gangwon-navy">{value}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500">{meta}</p>
    </article>
  );
}

function RankingList({
  title,
  rows,
  valueKey,
  suffix
  ,
  emptyText
}: {
  title: string;
  rows: LeaguePlayerStat[];
  valueKey: "goals" | "assists" | "yellowCards";
  suffix: string;
  emptyText: string;
}) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <h3 className="mb-4 text-lg font-black text-gangwon-navy">{title}</h3>
      <div className="grid gap-3">
        {rows.length ? rows.map((row, index) => (
          <div key={`${title}-${row.name}-${index}`} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-black text-slate-800">{index + 1}. {row.name}</p>
              <p className="text-xs font-bold text-slate-400">GANGWON</p>
            </div>
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-gangwon-orange">
              {row[valueKey]}{suffix}
            </span>
          </div>
        )) : <p className="text-sm font-bold text-slate-500">{emptyText}</p>}
      </div>
    </article>
  );
}
