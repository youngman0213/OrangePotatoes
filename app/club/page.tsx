"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { ExternalLink, Instagram, Megaphone, ShoppingBag, Ticket, Youtube } from "lucide-react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { LoadingState } from "@/components/LoadingState";
import { SectionHeader } from "@/components/SectionHeader";
import { clubPosts as mockClubPosts } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";
import type { ClubPost } from "@/types";

const ticketUrl = "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07002&TeamCode=PS014";

const tabs = [
  { label: "전체", value: "all" },
  { label: "공지", value: "official" },
  { label: "티켓", value: "ticket" },
  { label: "MD", value: "md" },
  { label: "이벤트", value: "event" },
  { label: "유튜브", value: "youtube" },
  { label: "인스타그램", value: "instagram" }
];

const quickLinks = [
  {
    title: "티켓 예매",
    description: "강원FC 홈경기 예매 페이지로 이동합니다.",
    href: ticketUrl,
    label: "예매하기",
    icon: Ticket,
    featured: true
  },
  {
    title: "공식 홈페이지",
    description: "구단 공지, 일정, 선수단 정보를 확인합니다.",
    href: "https://www.gangwon-fc.com/",
    label: "바로가기",
    icon: Megaphone
  },
  {
    title: "공식 인스타그램",
    description: "사진과 현장 소식을 공식 채널에서 확인합니다.",
    href: "https://www.instagram.com/gangwon_fc/",
    label: "보러가기",
    icon: Instagram
  },
  {
    title: "공식 유튜브",
    description: "구단 영상과 현장 콘텐츠를 확인합니다.",
    href: "https://www.youtube.com/@gangwonfc2008/videos",
    label: "보러가기",
    icon: Youtube
  },
  {
    title: "MD 스토어",
    description: "유니폼과 구단 상품을 확인합니다.",
    href: "https://gangwon-fc.imweb.me/",
    label: "쇼핑하기",
    icon: ShoppingBag
  }
];

export default function ClubPage() {
  const [platform, setPlatform] = useState("all");
  const [items, setItems] = useState<ClubPost[]>(mockClubPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/club-posts")
      .then((response) => response.json())
      .then((data: { items?: ClubPost[] }) => {
        if (data.items?.length) setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(
    () => sortByPublishedDesc(items).filter((post) => platform === "all" || post.platform === platform),
    [platform, items]
  );

  return (
    <div className="grid gap-8">
      <section>
        <SectionHeader title="구단 소식" eyebrow="공식 채널" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map((link) => <QuickLinkCard key={link.title} {...link} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="공지와 이벤트" eyebrow="구단 알림" />
        <FilterTabs tabs={tabs} active={platform} onChange={setPlatform} />
        <div className="mt-4">
          {loading ? (
            <LoadingState />
          ) : filteredPosts.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => <ClubPostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <EmptyState title="조건에 맞는 구단 소식이 없습니다." />
          )}
        </div>
      </section>
    </div>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  label,
  icon: Icon,
  featured = false
}: {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  featured?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`rounded-lg p-4 shadow-card ring-1 transition hover:-translate-y-0.5 ${featured ? "bg-gangwon-orange text-white ring-orange-200" : "bg-white text-gangwon-navy ring-slate-100 hover:ring-orange-100"}`}
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${featured ? "bg-white/15 text-white" : "bg-orange-50 text-gangwon-orange"}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="text-base font-black">{title}</h3>
      <p className={`mt-2 min-h-10 text-sm font-bold ${featured ? "text-white/80" : "text-slate-500"}`}>{description}</p>
      <span className={`mt-4 inline-flex items-center gap-1 text-sm font-black ${featured ? "text-white" : "text-gangwon-orange"}`}>
        {label}
        <ExternalLink size={15} aria-hidden="true" />
      </span>
    </a>
  );
}
