import type { ReactNode } from "react";
import { CalendarDays, ExternalLink, Goal, HomeIcon, Youtube } from "lucide-react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import { clubPosts as mockClubPosts, matches as mockMatches, news as mockNews, standings, videos as mockVideos } from "@/data/mock";
import { fetchGangwonNews } from "@/lib/newsFeed";
import { fetchOfficialClubPosts, fetchOfficialMatches } from "@/lib/officialFeed";
import { formatDate, getNextMatch, getRecentMatch, sortByPublishedDesc } from "@/lib/utils";
import { fetchGangwonVideos } from "@/lib/videoFeed";
import type { Standing } from "@/types";

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
  clubPosts: "구단 공식 소식",
  latestVideos: "최신 영상",
  officialLinks: "공식 링크",
  allNews: "전체 보기",
  games: "경기",
  wins: "승",
  draws: "무",
  losses: "패",
  points: "승점",
  rankSuffix: "위"
};

export default async function HomePage() {
  const [matchesResult, newsResult, clubPostsResult, videosResult] = await Promise.allSettled([
    fetchOfficialMatches(),
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:items-start">
      <div className="grid gap-6">
        <section>
          <SectionHeader title={text.nextMatch} eyebrow="경기 정보" href="/matches" />
          {nextMatch ? (
            <MatchCard match={nextMatch} featured />
          ) : (
            <InfoCard icon={<CalendarDays size={22} />} label={text.nextMatch} title={text.noNextMatch} meta="경기 페이지에서 전체 일정을 확인해주세요." />
          )}
        </section>

        <div className="lg:hidden">
          <RankCard standing={gangwonStanding} />
        </div>

        <section>
          <InfoCard
            icon={<Goal size={22} />}
            label={text.recentMatch}
            title={recentMatch ? `${recentMatch.homeTeam} ${recentMatch.homeScore} : ${recentMatch.awayScore} ${recentMatch.awayTeam}` : text.noResult}
            meta={recentMatch ? `${formatDate(recentMatch.date)} / ${recentMatch.competition}` : text.afterFinished}
          />
        </section>

        <section>
          <SectionHeader title={text.recentNews} eyebrow="기사 모음" href="/news" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortByPublishedDesc(news).slice(0, 3).map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        </section>

        <section>
          <SectionHeader title={text.clubPosts} eyebrow="공식 채널" href="/club" />
          <div className="grid gap-3 md:grid-cols-3">
            {sortByPublishedDesc(clubPosts).slice(0, 3).map((post) => <ClubPostCard key={post.id} post={post} />)}
          </div>
        </section>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-24">
        <div className="hidden lg:block">
          <RankCard standing={gangwonStanding} />
        </div>
        <section>
          <SectionHeader title={text.latestVideos} eyebrow="영상 모음" href="/videos" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {sortByPublishedDesc(videos).slice(0, 2).map((video) => <VideoCard key={video.id} video={video} compact />)}
          </div>
        </section>
        <OfficialLinks />
      </aside>
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

function RankCard({ standing }: { standing?: Standing }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-gangwon-orange">{text.currentRank}</p>
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
        <p className="text-sm font-black text-slate-600">
          {standing ? `${standing.played}${text.games} ${standing.wins}${text.wins} ${standing.draws}${text.draws} ${standing.losses}${text.losses}` : "K리그1"}
        </p>
        <div className="flex gap-1.5">
          {(standing?.recentForm.length ? standing.recentForm : []).slice(0, 5).map((form, index) => (
            <span
              key={`${form}-${index}`}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white ${form === "W" ? "bg-gangwon-orange" : form === "D" ? "bg-slate-400" : "bg-red-500"}`}
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

function OfficialLinks() {
  const links = [
    { href: "https://www.gangwon-fc.com/", label: "공식 홈페이지", icon: HomeIcon },
    { href: "https://www.youtube.com/@gangwonfc2008/videos", label: "공식 유튜브", icon: Youtube },
    { href: "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07002&TeamCode=PS014", label: "티켓 예매", icon: ExternalLink }
  ];

  return (
    <section>
      <SectionHeader title={text.officialLinks} eyebrow="바로가기" />
      <div className="grid gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-black text-gangwon-navy shadow-card ring-1 ring-slate-100 hover:text-gangwon-orange">
              <span className="inline-flex items-center gap-2">
                <Icon size={17} className="text-gangwon-orange" aria-hidden="true" />
                {link.label}
              </span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </section>
  );
}
