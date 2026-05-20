import type { ReactNode } from "react";
import { CalendarDays, Goal, Table2 } from "lucide-react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoCard } from "@/components/VideoCard";
import { clubPosts, matches, news, standings, videos } from "@/data/mock";
import { formatDate, formatTime, getNextMatch, getRecentMatch, sortByPublishedDesc } from "@/lib/utils";

export default function HomePage() {
  const nextMatch = getNextMatch(matches);
  const recentMatch = getRecentMatch(matches);
  const gangwonStanding = standings.find((team) => team.team === "강원FC");
  const todaySchedule = matches.filter((match) => formatDate(match.date) === formatDate(new Date().toISOString()));

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div>
          <SectionHeader title="다음 경기" eyebrow="Match Day" href="/matches" />
          {nextMatch ? <MatchCard match={nextMatch} featured /> : null}
        </div>
        <div className="grid gap-4">
          <InfoCard icon={<Goal size={22} />} label="최근 경기" title={recentMatch ? `${recentMatch.homeTeam} ${recentMatch.homeScore} : ${recentMatch.awayScore} ${recentMatch.awayTeam}` : "결과 없음"} meta={recentMatch ? `${formatDate(recentMatch.date)} · ${recentMatch.competition}` : "경기 종료 후 업데이트"} />
          <InfoCard icon={<Table2 size={22} />} label="현재 순위" title={gangwonStanding ? `${gangwonStanding.rank}위 · 승점 ${gangwonStanding.points}` : "순위 정보 없음"} meta={gangwonStanding ? `${gangwonStanding.played}경기 ${gangwonStanding.wins}승 ${gangwonStanding.draws}무 ${gangwonStanding.losses}패` : "K리그1"} />
          <InfoCard icon={<CalendarDays size={22} />} label="오늘 주요 일정" title={todaySchedule.length ? `${todaySchedule.length}개 일정` : "오늘 등록된 일정 없음"} meta={todaySchedule[0] ? `${formatTime(todaySchedule[0].date)} ${todaySchedule[0].venue}` : "새 일정이 생기면 표시됩니다"} />
        </div>
      </section>

      <section>
        <SectionHeader title="최근 뉴스" eyebrow="News" href="/news" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortByPublishedDesc(news).slice(0, 5).map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="구단 공식 소식" eyebrow="Club" href="/club" />
        <div className="grid gap-4 md:grid-cols-3">
          {sortByPublishedDesc(clubPosts).slice(0, 3).map((post) => <ClubPostCard key={post.id} post={post} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="최신 영상" eyebrow="Video" href="/videos" />
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
