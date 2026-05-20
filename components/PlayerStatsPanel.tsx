import type { LeaguePlayerStat } from "@/types";

interface PlayerStatsPanelProps {
  stats: LeaguePlayerStat[];
}

const labels = {
  title: "\uac1c\uc778 \uae30\ub85d",
  loadFailed: "K\ub9ac\uadf8 \uacf5\uc2dd \uac1c\uc778 \uae30\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
  topScorer: "\ucd5c\ub2e4 \ub4dd\uc810\uc790",
  gangwonTopScorer: "\uac15\uc6d0 \ub4dd\uc810 \uc0c1\uc704",
  gangwonYellowCards: "\uac15\uc6d0 \uacbd\uace0",
  officialBasis: "\uacf5\uc2dd \uae30\ub85d \uae30\uc900",
  pageBasis: "\uac1c\uc778 \uae30\ub85d \ud398\uc774\uc9c0 \ub178\ucd9c \uc120\uc218 \uae30\uc900",
  goalsRank: "\ub4dd\uc810 \uc21c\uc704",
  assistsRank: "\ub3c4\uc6c0 \uc21c\uc704",
  yellowRank: "\uacbd\uace0 \uc21c\uc704",
  goal: "\uace8",
  assist: "\ub3c4\uc6c0",
  card: "\uc7a5"
};

export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  const topScorer = [...stats].sort((a, b) => b.goals - a.goals)[0];
  const gangwonStats = stats.filter((item) => item.club === "GANGWON");
  const goals = [...stats].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const assists = [...stats].sort((a, b) => b.assists - a.assists).slice(0, 5);
  const yellows = [...stats].sort((a, b) => b.yellowCards - a.yellowCards).slice(0, 5);

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
        <RecordSummary title={labels.topScorer} value={topScorer ? `${topScorer.name}` : "-"} meta={topScorer ? `${topScorer.club} / ${topScorer.goals}${labels.goal}` : "-"} />
        <RecordSummary title={labels.gangwonTopScorer} value={gangwonStats[0]?.name ?? "-"} meta={gangwonStats[0] ? `${gangwonStats[0].goals}${labels.goal} ${gangwonStats[0].assists}${labels.assist}` : labels.officialBasis} />
        <RecordSummary title={labels.gangwonYellowCards} value={`${gangwonStats.reduce((sum, item) => sum + item.yellowCards, 0)}${labels.card}`} meta={labels.pageBasis} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RankingList title={labels.goalsRank} rows={goals} valueKey="goals" suffix={labels.goal} />
        <RankingList title={labels.assistsRank} rows={assists} valueKey="assists" suffix={labels.assist} />
        <RankingList title={labels.yellowRank} rows={yellows} valueKey="yellowCards" suffix={labels.card} />
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
}: {
  title: string;
  rows: LeaguePlayerStat[];
  valueKey: "goals" | "assists" | "yellowCards";
  suffix: string;
}) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <h3 className="mb-4 text-lg font-black text-gangwon-navy">{title}</h3>
      <div className="grid gap-3">
        {rows.map((row, index) => (
          <div key={`${title}-${row.name}-${index}`} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-black text-slate-800">{index + 1}. {row.name}</p>
              <p className="text-xs font-bold text-slate-400">{row.club}</p>
            </div>
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-gangwon-orange">
              {row[valueKey]}{suffix}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
