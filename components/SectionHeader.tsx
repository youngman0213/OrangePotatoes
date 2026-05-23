import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  href?: string;
  actionLabel?: string;
  compact?: boolean;
}

export function SectionHeader({ title, eyebrow, href, actionLabel = "전체 보기", compact = false }: SectionHeaderProps) {
  return (
    <div className={`${compact ? "mb-3" : "mb-4"} flex items-end justify-between gap-4`}>
      <div>
        {eyebrow ? <p className="text-xs font-bold tracking-wide text-gangwon-orange">{eyebrow}</p> : null}
        <h2 className={`${compact ? "text-lg" : "text-xl"} font-black text-gangwon-navy`}>{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-gangwon-orange">
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
