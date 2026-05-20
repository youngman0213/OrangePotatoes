"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Megaphone, Newspaper, PlaySquare, Table2, Users } from "lucide-react";
import { classNames } from "@/lib/utils";

const items = [
  { href: "/", label: "홈", icon: Home },
  { href: "/matches", label: "경기", icon: CalendarDays },
  { href: "/news", label: "뉴스", icon: Newspaper },
  { href: "/club", label: "소식", icon: Megaphone },
  { href: "/videos", label: "영상", icon: PlaySquare },
  { href: "/standings", label: "순위", icon: Table2 },
  { href: "/players", label: "선수", icon: Users }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white md:hidden">
      <div className="grid grid-cols-7">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold",
                active ? "text-gangwon-orange" : "text-slate-500"
              )}
            >
              <Icon size={21} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
