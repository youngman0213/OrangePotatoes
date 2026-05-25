import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import { matches as mockMatches, news as mockNews, standings, videos as mockVideos } from "@/data/mock";
import { attachGoalEvents } from "@/lib/matchGoals";
import { fetchGangwonNews } from "@/lib/newsFeed";
import { fetchOfficialMatches } from "@/lib/officialFeed";
import { formatDate, getNextMatch, getRecentMatch, sortByPublishedDesc } from "@/lib/utils";
import { fetchGangwonOfficialVideos } from "@/lib/youtubeVideos";
import type { Match, Standing } from "@/types";

const text = {
  gangwon: "\uac15\uc6d0FC",
  nextMatch: "\ub2e4\uc74c \uacbd\uae30",
  noNextMatch: "\uc608\uc815\ub41c \uacbd\uae30 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  noResult: "\uacb0\uacfc \uc5c6\uc74c",
  afterFinished: "\uacbd\uae30 \uc885\ub8cc \ud6c4 \uc5c5\ub370\uc774\ud2b8",
  currentRank: "\ud604\uc7ac \uc21c\uc704",
  recentNews: "\ucd5c\uc2e0 \ub274\uc2a4",
  latestVideos: "\ucd5c\uc2e0 \uc601\uc0c1",
  games: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328",
  goalsFor: "\ub4dd\uc810",
  goalsAgainst: "\uc2e4\uc810",
  points: "\uc2b9\uc810",
  rankSuffix: "\uc704"
};

export default async function HomePage() {
  const [matchesResult, newsResult, videosResult] = await Promise.allSettled([
    fetchOfficialMatches().then(attachGoalEvents),
    fetchGangwonNews(8),
    fetchGangwonOfficialVideos(8)
  ]);

  const matches = matchesResult.status === "fulfilled" && matchesResult.value.length ? matchesResult.value : mockMatches;
  const news = newsResult.status === "fulfilled" && newsResult.value.length ? newsResult.value : mockNews;
  const videos = videosResult.status === "fulfilled" && videosResult.value.length ? videosResult.value : mockVideos;
  const nextMatch = getNextMatch(matches);
  const recentMatch = getRecentMatch(matches);
  const gangwonStanding = standings.find((team) => team.team === text.gangwon);
  const goalsForRank = gangwonStanding ? getMetricRank(standings, "goalsFor", "desc", gangwonStanding.team) : null;
  const goalsAgainstRank = gangwonStanding ? getMetricRank(standings, "goalsAgainst", "asc", gangwonStanding.team) : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:items-start">
        <div className="grid gap-6">
          <section className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
            <SectionHeader title={text.nextMatch} eyebrow={"\uacbd\uae30 \uc815\ubcf4"} href="/matches" compact />
            {nextMatch ? (
              <MatchCard match={nextMatch} featured embedded />
            ) : (
              <InfoCard
                icon={<CalendarDays size={22} />}
                label={text.nextMatch}
                title={text.noNextMatch}
                meta={"\uacbd\uae30 \ud398\uc774\uc9c0\uc5d0\uc11c \uc804\uccb4 \uc77c\uc815\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694."}
              />
            )}
          </section>

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <MobileRankCard standing={gangwonStanding} goalsForRank={goalsForRank} goalsAgainstRank={goalsAgainstRank} />
            <MobileRecentMatchCard
              match={recentMatch}
              meta={recentMatch ? `${formatDate(recentMatch.date)} / ${recentMatch.competition}` : text.afterFinished}
            />
          </div>

          <section className="hidden lg:block">
            <RecentMatchCard
              match={recentMatch}
              meta={recentMatch ? `${formatDate(recentMatch.date)} / ${recentMatch.competition}` : text.afterFinished}
            />
          </section>

          <section>
            <SectionHeader title={text.recentNews} eyebrow={"\uae30\uc0ac \ubaa8\uc74c"} href="/news" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortByPublishedDesc(news).slice(0, 3).map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <div className="hidden lg:block">
            <RankCard standing={gangwonStanding} goalsForRank={goalsForRank} goalsAgainstRank={goalsAgainstRank} />
          </div>
          <section>
            <SectionHeader title={text.latestVideos} eyebrow={"\uc601\uc0c1 \ubaa8\uc74c"} href="/videos" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {sortByPublishedDesc(videos).slice(0, 2).map((video) => (
                <VideoCard key={video.id} video={video} compact />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, title, meta }: { icon: ReactNode; label: string; title: string; meta: string }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-gangwon-orange">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <h3 className="mt-1 text-lg font-black text-gangwon-navy">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-500">{meta}</p>
    </article>
  );
}

function RecentMatchCard({ match, meta }: { match?: Match; meta: string }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <p className="text-xs font-black text-gangwon-navy">{"\ucd5c\uadfc \uacbd\uae30 \uacb0\uacfc"}</p>
      {match ? (
        <ScoreBoard match={match} size="desktop" />
      ) : (
        <h3 className="mt-3 text-center text-2xl font-black text-gangwon-navy">{text.noResult}</h3>
      )}
      <p className="mt-3 text-center text-sm font-bold text-slate-500">{meta}</p>
    </article>
  );
}

function RankCard({ standing, goalsForRank, goalsAgainstRank }: { standing?: Standing; goalsForRank: number | null; goalsAgainstRank: number | null }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-gangwon-navy">{text.currentRank}</p>
          <h3 className="mt-1 text-3xl font-black text-gangwon-navy">{standing ? `${standing.rank}${text.rankSuffix}` : "-"}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400">{text.points}</p>
          <p className="mt-1 text-2xl font-black text-gangwon-orange">{standing ? standing.points : "-"}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3">
        <div>
          <p className="text-sm font-black text-slate-600">
            {standing ? `${standing.played}${text.games} ${standing.wins}${text.wins} ${standing.draws}${text.draws} ${standing.losses}${text.losses}` : "K\ub9ac\uadf81"}
          </p>
          {standing ? (
            <p className="mt-1 text-xs font-bold text-slate-400">
              {text.goalsFor} {standing.goalsFor} {formatRankSuffix(goalsForRank)} / {text.goalsAgainst} {standing.goalsAgainst} {formatRankSuffix(goalsAgainstRank)}
            </p>
          ) : null}
        </div>
        <RecentForm form={standing?.recentForm ?? []} size="md" />
      </div>
    </article>
  );
}

function MobileRankCard({ standing, goalsForRank, goalsAgainstRank }: { standing?: Standing; goalsForRank: number | null; goalsAgainstRank: number | null }) {
  return (
    <article className="flex min-h-[148px] flex-col rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black text-gangwon-navy">{text.currentRank}</p>
          <h3 className="mt-1 text-[32px] font-black leading-none text-gangwon-navy">{standing ? `${standing.rank}${text.rankSuffix}` : "-"}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400">{text.points}</p>
          <p className="mt-1 text-2xl font-black leading-none text-gangwon-orange">{standing ? standing.points : "-"}</p>
        </div>
      </div>
      <p className="mt-2 truncate text-center text-xs font-black leading-4 text-slate-600">
        {standing ? `${standing.played}${text.games} ${standing.wins}${text.wins} ${standing.draws}${text.draws} ${standing.losses}${text.losses}` : "K\ub9ac\uadf81"}
      </p>
      {standing ? (
        <p className="mt-1 text-center text-[11px] font-bold text-slate-400">
          {text.goalsFor} {standing.goalsFor} {formatRankSuffix(goalsForRank)} / {text.goalsAgainst} {standing.goalsAgainst} {formatRankSuffix(goalsAgainstRank)}
        </p>
      ) : null}
      <div className="mt-auto flex justify-center pt-1.5">
        <RecentForm form={standing?.recentForm ?? []} size="sm" />
      </div>
    </article>
  );
}

function MobileRecentMatchCard({ match, meta }: { match?: Match; meta: string }) {
  return (
    <article className="flex min-h-[136px] flex-col rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100">
      <p className="text-xs font-black text-gangwon-navy">{"\ucd5c\uadfc \uacbd\uae30 \uacb0\uacfc"}</p>
      {match ? (
        <ScoreBoard match={match} size="mobile" />
      ) : (
        <h3 className="mt-4 line-clamp-2 text-center text-[15px] font-black leading-5 text-gangwon-navy">{text.noResult}</h3>
      )}
      <p className="mt-auto line-clamp-1 pt-2 text-center text-[11px] font-bold text-slate-400">{meta}</p>
    </article>
  );
}

function ScoreBoard({ match, size }: { match: Match; size: "mobile" | "desktop" }) {
  const compact = size === "mobile";

  return (
    <div className={compact ? "mt-2 grid grid-cols-[1fr_auto_1fr] items-start gap-1.5" : "mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-4"}>
      <TeamScoreBlock name={match.homeTeam} compact={compact} />
      <div className={compact ? "pt-2 text-center" : "pt-4 text-center"}>
        <p className={compact ? "text-[24px] font-black leading-none text-gangwon-navy" : "text-3xl font-black leading-none text-gangwon-navy"}>
          {match.homeScore ?? "-"}:{match.awayScore ?? "-"}
        </p>
      </div>
      <TeamScoreBlock name={match.awayTeam} compact={compact} />
      <div className="col-span-3">
        <GoalEventSummary match={match} compact={compact} />
      </div>
    </div>
  );
}

function TeamScoreBlock({ name, compact }: { name: string; compact: boolean }) {
  const colors = getTeamBadgeColors(name);

  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span
        className={`${compact ? "h-8 w-8 text-[10px]" : "h-12 w-12 text-sm"} flex items-center justify-center rounded-full font-black shadow-sm`}
        style={{ backgroundColor: colors.background, color: colors.text }}
      >
        {getTeamShortName(name)}
      </span>
    </div>
  );
}

function GoalEventSummary({ match, compact }: { match: Match; compact: boolean }) {
  const homeGoals = getTeamGoals(match, match.homeTeam);
  const awayGoals = getTeamGoals(match, match.awayTeam);

  if (!homeGoals.length && !awayGoals.length) return null;

  return (
    <div className={compact ? "mt-2 grid grid-cols-[1fr_auto_1fr] gap-1.5 text-[9px] font-bold text-slate-400" : "mt-3 grid grid-cols-[1fr_auto_1fr] gap-4 text-xs font-bold text-slate-400"}>
      <GoalList goals={homeGoals} align="right" />
      <span aria-hidden="true" />
      <GoalList goals={awayGoals} align="left" />
    </div>
  );
}

function GoalList({ goals, align }: { goals: NonNullable<Match["goalEvents"]>; align: "left" | "right" }) {
  if (!goals.length) return <span />;

  return (
    <div className={align === "right" ? "grid justify-items-end text-right" : "grid justify-items-start text-left"}>
      {goals.map((goal, index) => (
        <span key={`${goal.playerName}-${goal.minute}-${index}`} className="max-w-full truncate">
          {formatGoalMinute(goal)} {goal.playerName}
        </span>
      ))}
    </div>
  );
}

function RecentForm({ form, size }: { form: string[]; size: "sm" | "md" }) {
  if (!form.length) return <span className="text-sm font-bold text-slate-400">-</span>;

  return (
    <div className={size === "sm" ? "flex gap-1.5" : "flex gap-1.5"}>
      {form.slice(0, 5).map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={`${size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-xs"} flex items-center justify-center rounded-full pt-px font-black leading-none text-white ${
            result === "W" ? "bg-gangwon-orange" : result === "D" ? "bg-slate-400" : "bg-red-500"
          }`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function getTeamGoals(match: Match, teamName: string) {
  return (match.goalEvents ?? []).filter((goal) => isSameTeam(goal.team, teamName));
}

function formatGoalMinute(goal: NonNullable<Match["goalEvents"]>[number]) {
  return goal.stoppageTime ? `${goal.minute}+${goal.stoppageTime}'` : `${goal.minute}'`;
}

function isSameTeam(goalTeam: string, matchTeam: string) {
  const goal = normalizeTeamName(goalTeam);
  const match = normalizeTeamName(matchTeam);
  return match.includes(goal) || goal.includes(match);
}

function normalizeTeamName(name: string) {
  const aliases: Record<string, string> = {
    gangwon: "\uac15\uc6d0",
    ulsan: "\uc6b8\uc0b0",
    pohang: "\ud3ec\ud56d",
    jeju: "\uc81c\uc8fc",
    jeonbuk: "\uc804\ubd81",
    seoul: "\uc11c\uc6b8",
    daejeon: "\ub300\uc804",
    incheon: "\uc778\ucc9c",
    anyang: "\uc548\uc591",
    gimcheon: "\uae40\ucc9c",
    gwangju: "\uad11\uc8fc",
    bucheon: "\ubd80\ucc9c"
  };
  const normalized = name
    .toLowerCase()
    .replace(/fc|hd|hyundai|hana|citizen|steelers|united|sk/g, "")
    .replace(/[\s-]+/g, "")
    .trim();
  const alias = Object.entries(aliases).find(([key]) => normalized.includes(key));

  return alias ? alias[1] : name.replace(/FC|HD|\ud558\ub098\uc2dc\ud2f0\uc98c/g, "").trim();
}

function getTeamBadgeColors(name: string) {
  const colors = [
    { keyword: "\uac15\uc6d0", background: "#f37021", text: "#ffffff" },
    { keyword: "\uc6b8\uc0b0", background: "#0f4c9a", text: "#ffffff" },
    { keyword: "\uc804\ubd81", background: "#0b8f3a", text: "#ffffff" },
    { keyword: "\uc11c\uc6b8", background: "#d71920", text: "#ffffff" },
    { keyword: "\ud3ec\ud56d", background: "#d71920", text: "#ffffff" },
    { keyword: "\ub300\uc804", background: "#8b1d41", text: "#ffffff" },
    { keyword: "\uad11\uc8fc", background: "#f5c400", text: "#111827" },
    { keyword: "\uc81c\uc8fc", background: "#e35205", text: "#ffffff" },
    { keyword: "\uae40\ucc9c", background: "#b91c1c", text: "#ffffff" },
    { keyword: "\uc548\uc591", background: "#581c87", text: "#ffffff" },
    { keyword: "\uc218\uc6d0", background: "#1d4ed8", text: "#ffffff" },
    { keyword: "\uc778\ucc9c", background: "#111827", text: "#ffffff" }
  ];

  return colors.find((item) => name.includes(item.keyword)) ?? { background: "#101827", text: "#ffffff" };
}

function getTeamShortName(name: string) {
  return normalizeTeamName(name).slice(0, 2);
}

function getMetricRank(rows: Standing[], key: "goalsFor" | "goalsAgainst", direction: "asc" | "desc", team: string) {
  const sorted = [...rows].sort((a, b) => {
    const diff = direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    return diff || a.rank - b.rank;
  });
  const index = sorted.findIndex((row) => row.team === team);

  return index >= 0 ? index + 1 : null;
}

function formatRankSuffix(rank: number | null) {
  return rank ? `(${rank}\uc704)` : "";
}
