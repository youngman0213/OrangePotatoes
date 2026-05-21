import type { ReactNode } from "react";
import { CalendarDays, Goal, Table2 } from "lucide-react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import { clubPosts as mockClubPosts, matches as mockMatches, news as mockNews, standings, videos as mockVideos } from "@/data/mock";
import { fetchGangwonNews } from "@/lib/newsFeed";
import { fetchOfficialClubPosts, fetchOfficialMatches } from "@/lib/officialFeed";
import { formatDate, formatTime, getNextMatch, getRecentMatch, sortByPublishedDesc } from "@/lib/utils";
import { fetchGangwonVideos } from "@/lib/videoFeed";

const text = {
  gangwon: "강원FC",
  nextMatch: "다음 경기",
  recentMatch: "최근 경기",
  noResult: "결과 없음",
  afterFinished: "경기 종료 후 업데이트",
  currentRank: "현재 순위",
  noStanding: "순위 정보 없음",
  todaySchedule: "오늘 주요 일정",
  noSchedule: "오늘 등록된 일정 없음",
  scheduleFallback: "새 일정이 생기면 표시됩니다",
  recentNews: "최근 뉴스",
  clubPosts: "구단 공식 소식",
  latestVideos: "최신 영상",
  games: "경기",
  wins: "승",
  draws: "무",
  losses: "패",
  points: "승점",
  rankSuffix: "위",
  countSuffix: "개 일정"
};

export default async function HomePage() {
  const [matchesResult, newsResult, clubPostsResult, videosResult] = await Promise.allSettled([
    fetchOfficialMatches(8),
    fetchGangwonNews(8),
    fetchOfficialClubPosts(8),
    fetchGangwonVideos(8)
  ]);

  const matches = matchesResult.status === "fulfilled" && matchesResult.value.length ? matchesResult.value : mockMatches;
  const news = newsResult.status === "fulfilled" && newsResult.value.length ? newsResult.value : mockNews;
  const clubPosts = clubPostsResult.status === "fulfilled" && clubPostsResult.value.length ? clubPostsResult.value : mockClubPosts;
  const videos = videosResult.status === "fulfilled" && videosResult.value.length ? videosResult.value : mockVideos;
  const nextMatch = getNextMatch(matches);
  const recentMatch = getRecentMatch(matches);
  const gangwonStanding = standings.find((team) => team.team === text.gangwon);
  const todaySchedule = matches.filter((match) => formatDate(match.date) === formatDate(new Date().toISOString()));

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div>
          <SectionHeader title={text.nextMatch} eyebrow="경기 정보" href="/matches" />
          {nextMatch ? <MatchCard match={nextMatch} featured /> : null}
        </div>
        <div className="grid gap-4">
          <InfoCard
            icon={<Goal size={22} />}
            label={text.recentMatch}
            title={recentMatch ? `${recentMatch.homeTeam} ${recentMatch.homeScore} : ${recentMatch.awayScore} ${recentMatch.awayTeam}` : text.noResult}
            meta={recentMatch ? `${formatDate(recentMatch.date)} / ${recentMatch.competition}` : text.afterFinished}
          />
          <InfoCard
            icon={<Table2 size={22} />}
            label={text.currentRank}
            title={gangwonStanding ? `${gangwonStanding.rank}${text.rankSuffix} / ${text.points} ${gangwonStanding.points}` : text.noStanding}
            meta={gangwonStanding ? `${gangwonStanding.played}${text.games} ${gangwonStanding.wins}${text.wins} ${gangwonStanding.draws}${text.draws} ${gangwonStanding.losses}${text.losses}` : "K리그1"}
          />
          <InfoCard
            icon={<CalendarDays size={22} />}
            label={text.todaySchedule}
            title={todaySchedule.length ? `${todaySchedule.length}${text.countSuffix}` : text.noSchedule}
            meta={todaySchedule[0] ? `${formatTime(todaySchedule[0].date)} ${todaySchedule[0].venue}` : text.scheduleFallback}
          />
        </div>
      </section>

      <section>
        <SectionHeader title={text.recentNews} eyebrow="기사 모음" href="/news" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortByPublishedDesc(news).slice(0, 5).map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      </section>

      <section>
        <SectionHeader title={text.clubPosts} eyebrow="공식 채널" href="/club" />
        <div className="grid gap-4 md:grid-cols-3">
          {sortByPublishedDesc(clubPosts).slice(0, 3).map((post) => <ClubPostCard key={post.id} post={post} />)}
        </div>
      </section>

      <section>
        <SectionHeader title={text.latestVideos} eyebrow="영상 모음" href="/videos" />
        <div className="grid gap-4 md:grid-cols-3">
          {sortByPublishedDesc(videos).slice(0, 3).map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, title, meta }: { icon: ReactNode; label: string; title: string; meta: string }) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-gangwon-orange">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <h3 className="mt-1 text-xl font-black text-gangwon-navy">{title}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500">{meta}</p>
    </article>
  );
}
