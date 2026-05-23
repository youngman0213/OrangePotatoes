"use client";

import { useEffect, useMemo, useState } from "react";
import { Instagram, Megaphone, ShoppingBag, Ticket, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ClubPostCard } from "@/components/ClubPostCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { SectionHeader } from "@/components/SectionHeader";
import { clubPosts as mockClubPosts } from "@/data/mock";
import { sortByPublishedDesc } from "@/lib/utils";
import type { ClubPost } from "@/types";

const ticketUrl = "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07002&TeamCode=PS014";

const labels = {
  pageTitle: "\uad6c\ub2e8 \uc18c\uc2dd",
  channels: "\uacf5\uc2dd \ucc44\ub110",
  noticeTitle: "\uacf5\uc9c0",
  noticeEyebrow: "\uad6c\ub2e8 \uc54c\ub9bc",
  noNotice: "\ud45c\uc2dc\ud560 \uacf5\uc9c0\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  ticket: "\ud2f0\ucf13 \uc608\ub9e4",
  official: "\uacf5\uc2dd \ud648\ud398\uc774\uc9c0",
  instagram: "\uc778\uc2a4\ud0c0\uadf8\ub7a8",
  youtube: "\uc720\ud29c\ube0c",
  store: "MD \uc2a4\ud1a0\uc5b4"
};

const quickLinks = [
  {
    title: labels.ticket,
    href: ticketUrl,
    icon: Ticket,
    featured: true
  },
  {
    title: labels.official,
    href: "https://www.gangwon-fc.com/",
    icon: Megaphone
  },
  {
    title: labels.instagram,
    href: "https://www.instagram.com/gangwon_fc/",
    icon: Instagram
  },
  {
    title: labels.youtube,
    href: "https://www.youtube.com/@gangwonfc2008/videos",
    icon: Youtube
  },
  {
    title: labels.store,
    href: "https://gangwon-fc.imweb.me/",
    icon: ShoppingBag
  }
];

export default function ClubPage() {
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

  const officialPosts = useMemo(
    () => sortByPublishedDesc(items).filter((post) => post.platform === "official"),
    [items]
  );

  return (
    <div className="grid gap-8">
      <section>
        <SectionHeader title={labels.pageTitle} eyebrow={labels.channels} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {quickLinks.map((link) => <QuickLinkCard key={link.title} {...link} />)}
        </div>
      </section>

      <section>
        <SectionHeader title={labels.noticeTitle} eyebrow={labels.noticeEyebrow} />
        {loading ? (
          <LoadingState />
        ) : officialPosts.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {officialPosts.map((post) => <ClubPostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <EmptyState title={labels.noNotice} />
        )}
      </section>
    </div>
  );
}

function QuickLinkCard({
  title,
  href,
  icon: Icon,
  featured = false
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  featured?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`rounded-lg px-3 py-4 shadow-card ring-1 transition hover:-translate-y-0.5 ${featured ? "bg-gangwon-orange text-white ring-orange-200" : "bg-white text-gangwon-navy ring-slate-100 hover:ring-orange-100"}`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${featured ? "bg-white/15 text-white" : "bg-orange-50 text-gangwon-orange"}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black">{title}</h3>
        </div>
      </div>
    </a>
  );
}
