import Link from "next/link";
import { Trophy } from "lucide-react";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/matches", label: "경기" },
  { href: "/standings", label: "순위" },
  { href: "/news", label: "뉴스" },
  { href: "/videos", label: "영상" },
  { href: "/club", label: "소식" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gangwon-orange text-white">
            <Trophy size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-black leading-5 text-gangwon-navy">강원FC HUB</span>
            <span className="text-xs font-bold text-slate-500">비공식 팬 정보</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-bold text-slate-600 hover:bg-orange-50 hover:text-gangwon-orange">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
