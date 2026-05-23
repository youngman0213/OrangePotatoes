import Link from "next/link";
import { Trophy } from "lucide-react";

const navItems = [
  { href: "/", label: "\ud648" },
  { href: "/matches", label: "\uacbd\uae30" },
  { href: "/standings", label: "\uc21c\uc704" },
  { href: "/players", label: "\uc120\uc218" },
  { href: "/news", label: "\ub274\uc2a4" },
  { href: "/club", label: "\uc18c\uc2dd" },
  { href: "/videos", label: "\uc601\uc0c1" }
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
            <span className="block text-lg font-black leading-5 text-gangwon-navy">\uac15\uc6d0FC HUB</span>
            <span className="text-xs font-bold text-slate-500">Unofficial Fan Info</span>
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
