import type { ReactNode } from "react";
import { CalendarDays, ExternalLink, HomeIcon, Youtube } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import { matches as mockMatches, news as mockNews, standings, videos as mockVideos } from "@/data/mock";
import { fetchMatchGoalEvents } from "@/lib/matchEvents";
import { fetchGangwonNews } from "@/lib/newsFeed";
import { fetchOfficialMatches } from "@/lib/officialFeed";
import { formatDate, getNextMatch, getRecentMatch, sortByPublishedDesc } from "@/lib/utils";
import { fetchGangwonVideos } from "@/lib/videoFeed";
import type { Match, MatchGoalEvent, Standing } from "@/types";

const text = {
  gangwon: "강원FC",
  nextMatch: "다음 경기",
  noNextMatch: "예정된 경기 정보가 없습니다.",
  recentMatch: "최근 경기",
  noResult: "결과 없음",
  afterFinished: "경기 종료 후 업데이트",
  currentRank: "현재 순위",
  noStanding: "순위 정보 없음",
  recentForm: "최근 5경기",
  recentNews: "최신 뉴스",
  latestVideos: "최신 영상",
  officialLinks: "공식 링크",
  allNews: "전체 보기",
  games: "경기",
  wins: "승",
  draws: "무",
  losses: "패",
  goalsFor: "득점",
  goalsAgainst: "실점",
  points: "승점",
  rankSuffix: "위"
};

export default async function HomePage() {
  const [matchesResult, newsResult, videosResult] = await Promise.allSettled([
    fetchOfficialMatches(),
    fetchGangwonNews(8),
    fetchGangwonVideos(8)
  ]);

  const matches = matchesResult.status === "fulfilled" && matchesResult.value.length ? matchesResult.value : mockMatches;
  const news = newsResult.status === "fulfilled" && newsResult.value.length ? newsResult.value : mockNews;
  const videos = videosResult.status === "fulfilled" && videosResult.value.length ? videosResult.value : mockVideos;
  const nextMatch = getNextMatch(matches);
  const recentMatch = getRecentMatch(matches);
  const recentMatchGoals = recentMatch ? await fetchMatchGoalEvents(recentMatch).catch(() => []) : [];
  const gangwonStanding = standings.find((team) => team.team === text.gangwon);
  const goalsForRank = gangwonStanding ? getMetricRank(standings, "goalsFor", "desc", gangwonStanding.team) : null;
  const goalsAgainstRank = gangwonStanding ? getMetricRank(standings, "goalsAgainst", "asc", gangwonStanding.team) : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:items-start">
        <div className="grid gap-6">
          <section className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
            <SectionHeader title={text.nextMatch} eyebrow="경기 정보" href="/matches" compact />
            {nextMatch ? (
              <MatchCard match={nextMatch} featured embedded />
            ) : (
              <InfoCard icon={<CalendarDays size={22} />} label={text.nextMatch} title={text.noNextMatch} meta="경기 페이지에서 전체 일정을 확인해주세요." />
            )}
          </section>

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <MobileRankCard standing={gangwonStanding} goalsForRank={goalsForRank} goalsAgainstRank={goalsAgainstRank} />
            <MobileRecentMatchCard
              match={recentMatch}
              goals={recentMatchGoals}
              meta={recentMatch ? `${formatDate(recentMatch.date)} / ${recentMatch.competition}` : text.afterFinished}
            />
          </div>

          <section className="hidden lg:block">
            <RecentMatchCard
              match={recentMatch}
              goals={recentMatchGoals}
              meta={recentMatch ? `${formatDate(recentMatch.date)} / ${recentMatch.competition}` : text.afterFinished}
            />
          </section>

          <section>
            <SectionHeader title={text.recentNews} eyebrow="기사 모음" href="/news" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortByPublishedDesc(news).slice(0, 3).map((item) => <NewsCard key={item.id} item={item} />)}
            </div>
          </section>

          <div className="hidden lg:block">
            <OfficialLinks />
          </div>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <div className="hidden lg:block">
            <RankCard standing={gangwonStanding} goalsForRank={goalsForRank} goalsAgainstRank={goalsAgainstRank} />
          </div>
          <section>
            <SectionHeader title={text.latestVideos} eyebrow="영상 모음" href="/videos" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {sortByPublishedDesc(videos).slice(0, 2).map((video) => <VideoCard key={video.id} video={video} compact />)}
            </div>
          </section>
        </aside>
      </div>

      <div className="lg:hidden">
        <OfficialLinks />
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

function RecentMatchCard({ match, goals, meta }: { match?: Match; goals: MatchGoalEvent[]; meta: string }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <p className="text-xs font-black text-gangwon-navy">최근 경기 결과</p>
      {match ? (
        <>
          <ScoreBoard match={match} goals={goals} size="desktop" />
        </>
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
          <h3 className="mt-1 text-3xl font-black text-gangwon-navy">
            {standing ? `${standing.rank}${text.rankSuffix}` : "-"}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400">{text.points}</p>
          <p className="mt-1 text-2xl font-black text-gangwon-orange">
            {standing ? standing.points : "-"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3">
        <div>
          <p className="text-sm font-black text-slate-600">
            {standing ? `${standing.played}${text.games} ${standing.wins}${text.wins} ${standing.draws}${text.draws} ${standing.losses}${text.losses}` : "K리그1"}
          </p>
          {standing ? (
            <p className="mt-1 text-xs font-bold text-slate-400">
              {text.goalsFor} {standing.goalsFor} {formatRankSuffix(goalsForRank)} / {text.goalsAgainst} {standing.goalsAgainst} {formatRankSuffix(goalsAgainstRank)}
            </p>
          ) : null}
        </div>
        <div className="flex gap-1.5">
          {(standing?.recentForm.length ? standing.recentForm : []).slice(0, 5).map((form, index) => (
            <span
              key={`${form}-${index}`}
              className={`flex h-7 w-7 items-center justify-center rounded-full pt-px text-xs font-black leading-none text-white ${form === "W" ? "bg-gangwon-orange" : form === "D" ? "bg-slate-400" : "bg-red-500"}`}
            >
              {form}
            </span>
          ))}
          {!standing?.recentForm.length ? <span className="text-sm font-bold text-slate-400">-</span> : null}
        </div>
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
          <h3 className="mt-1 text-[32px] font-black leading-none text-gangwon-navy">
            {standing ? `${standing.rank}${text.rankSuffix}` : "-"}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400">{text.points}</p>
          <p className="mt-1 text-2xl font-black leading-none text-gangwon-orange">{standing ? standing.points : "-"}</p>
        </div>
      </div>
      <p className="mt-2 truncate text-center text-xs font-black leading-4 text-slate-600">
        {standing ? `${standing.played}${text.games} ${standing.wins}${text.wins} ${standing.draws}${text.draws} ${standing.losses}${text.losses}` : "K리그1"}
      </p>
      {standing ? (
        <p className="mt-1 text-center text-[11px] font-bold text-slate-400">
          {text.goalsFor} {standing.goalsFor} {formatRankSuffix(goalsForRank)} / {text.goalsAgainst} {standing.goalsAgainst} {formatRankSuffix(goalsAgainstRank)}
        </p>
      ) : null}
      <div className="mt-auto flex justify-center gap-1.5 pt-1.5">
        {(standing?.recentForm.length ? standing.recentForm : []).slice(0, 5).map((form, index) => (
          <span
            key={`${form}-${index}`}
            className={`flex h-5 w-5 items-center justify-center rounded-full pt-px text-[9px] font-black leading-none text-white ${form === "W" ? "bg-gangwon-orange" : form === "D" ? "bg-slate-400" : "bg-red-500"}`}
          >
            {form}
          </span>
        ))}
        {!standing?.recentForm.length ? <span className="text-xs font-bold text-slate-400">-</span> : null}
      </div>
    </article>
  );
}

function MobileRecentMatchCard({ match, goals, meta }: { match?: Match; goals: MatchGoalEvent[]; meta: string }) {
  return (
    <article className="flex min-h-[136px] flex-col rounded-lg bg-white p-3 shadow-card ring-1 ring-slate-100">
      <p className="text-xs font-black text-gangwon-navy">최근 경기 결과</p>
      {match ? (
        <>
          <ScoreBoard match={match} goals={goals} size="mobile" />
        </>
      ) : (
        <h3 className="mt-4 line-clamp-2 text-center text-[15px] font-black leading-5 text-gangwon-navy">{text.noResult}</h3>
      )}
      <p className="mt-auto line-clamp-1 pt-2 text-center text-[11px] font-bold text-slate-400">{meta}</p>
    </article>
  );
}

function ScoreBoard({ match, goals, size }: { match: Match; goals: MatchGoalEvent[]; size: "mobile" | "desktop" }) {
  const compact = size === "mobile";
  const homeGoals = goals.filter((goal) => isSameScoreTeam(goal.team, match.homeTeam));
  const awayGoals = goals.filter((goal) => isSameScoreTeam(goal.team, match.awayTeam));

  return (
    <div className={compact ? "mt-2 grid grid-cols-[1fr_auto_1fr] items-start gap-1.5" : "mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-4"}>
      <TeamScoreBlock name={match.homeTeam} goals={homeGoals} compact={compact} isHome />
      <div className={compact ? "pt-2 text-center" : "pt-4 text-center"}>
        <p className={compact ? "text-[24px] font-black leading-none text-gangwon-navy" : "text-3xl font-black leading-none text-gangwon-navy"}>
          {match.homeScore ?? "-"}:{match.awayScore ?? "-"}
        </p>
      </div>
      <TeamScoreBlock name={match.awayTeam} goals={awayGoals} compact={compact} />
    </div>
  );
}

function TeamScoreBlock({ name, goals, compact, isHome = false }: { name: string; goals: MatchGoalEvent[]; compact: boolean; isHome?: boolean }) {
  const colors = getTeamBadgeColors(name);

  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span className={`${compact ? "h-8 w-8 text-[10px]" : "h-12 w-12 text-sm"} flex items-center justify-center rounded-full font-black shadow-sm`} style={{ backgroundColor: colors.background, color: colors.text }}>
        {getTeamShortName(name)}
      </span>
      {goals.length ? (
        <div className="grid max-w-full gap-0.5 text-center">
          {goals.map((goal, index) => (
            <span key={`${goal.playerName}-${goal.minute}-${index}`} className={compact ? "truncate text-[9px] font-bold text-slate-400" : "truncate text-[11px] font-bold text-slate-400"}>
              {formatGoalMinute(goal)} {goal.playerName}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatGoalMinute(goal: MatchGoalEvent) {
  return goal.stoppageTime ? `${goal.minute}+${goal.stoppageTime}'` : `${goal.minute}'`;
}

function isSameScoreTeam(goalTeam: string, matchTeam: string) {
  return matchTeam.includes(goalTeam) || goalTeam.includes(matchTeam.replace("FC", "").replace("HD", "").trim());
}

function getTeamBadgeColors(name: string) {
  const normalized = name.toLowerCase();
  const colors = [
    { keyword: "강원", background: "#f37021", text: "#ffffff" },
    { keyword: "울산", background: "#0f4c9a", text: "#ffffff" },
    { keyword: "전북", background: "#0b8f3a", text: "#ffffff" },
    { keyword: "서울", background: "#d71920", text: "#ffffff" },
    { keyword: "포항", background: "#d71920", text: "#ffffff" },
    { keyword: "대전", background: "#8b1d41", text: "#ffffff" },
    { keyword: "광주", background: "#f5c400", text: "#111827" },
    { keyword: "제주", background: "#e35205", text: "#ffffff" },
    { keyword: "김천", background: "#b91c1c", text: "#ffffff" },
    { keyword: "안양", background: "#581c87", text: "#ffffff" },
    { keyword: "수원", background: "#1d4ed8", text: "#ffffff" },
    { keyword: "인천", background: "#111827", text: "#ffffff" }
  ];

  return colors.find((item) => normalized.includes(item.keyword)) ?? { background: "#101827", text: "#ffffff" };
}

function getTeamShortName(name: string) {
  return name
    .replace("FC", "")
    .replace("HD", "")
    .replace("하나시티즌", "")
    .trim()
    .slice(0, 2);
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
  return rank ? `(${rank}위)` : "";
}

function OfficialLinks() {
  const links = [
    { href: "https://www.gangwon-fc.com/", label: "공식 홈페이지", icon: HomeIcon },
    { href: "https://www.youtube.com/@gangwonfc2008/videos", label: "공식 유튜브", icon: Youtube },
    { href: "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07002&TeamCode=PS014", label: "티켓 예매", icon: ExternalLink }
  ];

  return (
    <section>
      <SectionHeader title={text.officialLinks} eyebrow="바로가기" />
      <div className="grid gap-2 sm:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="flex items-center rounded-lg bg-white px-4 py-3 text-sm font-black text-gangwon-navy shadow-card ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:text-gangwon-orange hover:ring-orange-100">
              <span className="inline-flex items-center gap-2">
                <Icon size={17} className="text-gangwon-orange" aria-hidden="true" />
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
