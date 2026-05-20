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
  gangwon: "\uac15\uc6d0FC",
  nextMatch: "\ub2e4\uc74c \uacbd\uae30",
  recentMatch: "\ucd5c\uadfc \uacbd\uae30",
  noResult: "\uacb0\uacfc \uc5c6\uc74c",
  afterFinished: "\uacbd\uae30 \uc885\ub8cc \ud6c4 \uc5c5\ub370\uc774\ud2b8",
  currentRank: "\ud604\uc7ac \uc21c\uc704",
  noStanding: "\uc21c\uc704 \uc815\ubcf4 \uc5c6\uc74c",
  todaySchedule: "\uc624\ub298 \uc8fc\uc694 \uc77c\uc815",
  noSchedule: "\uc624\ub298 \ub4f1\ub85d\ub41c \uc77c\uc815 \uc5c6\uc74c",
  scheduleFallback: "\uc0c8 \uc77c\uc815\uc774 \uc0dd\uae30\uba74 \ud45c\uc2dc\ub429\ub2c8\ub2e4",
  recentNews: "\ucd5c\uadfc \ub274\uc2a4",
  clubPosts: "\uad6c\ub2e8 \uacf5\uc2dd \uc18c\uc2dd",
  latestVideos: "\ucd5c\uc2e0 \uc601\uc0c1",
  games: "\uacbd\uae30",
  wins: "\uc2b9",
  draws: "\ubb34",
  losses: "\ud328",
  points: "\uc2b9\uc810",
  rankSuffix: "\uc704",
  countSuffix: "\uac1c \uc77c\uc815"
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
          <SectionHeader title={text.nextMatch} eyebrow="Match Day" href="/matches" />
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
            meta={gangwonStanding ? `${gangwonStanding.played}${text.games} ${gangwonStanding.wins}${text.wins} ${gangwonStanding.draws}${text.draws} ${gangwonStanding.losses}${text.losses}` : "K League 1"}
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
        <SectionHeader title={text.recentNews} eyebrow="News" href="/news" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortByPublishedDesc(news).slice(0, 5).map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      </section>

      <section>
        <SectionHeader title={text.clubPosts} eyebrow="Club" href="/club" />
        <div className="grid gap-4 md:grid-cols-3">
          {sortByPublishedDesc(clubPosts).slice(0, 3).map((post) => <ClubPostCard key={post.id} post={post} />)}
        </div>
      </section>

      <section>
        <SectionHeader title={text.latestVideos} eyebrow="Video" href="/videos" />
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
