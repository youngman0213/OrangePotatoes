"use client";

import { classNames } from "@/lib/utils";

interface FilterTabsProps {
  tabs: Array<{ label: string; value: string }>;
  active: string;
  onChange: (value: string) => void;
  wrap?: boolean;
}

export function FilterTabs({ tabs, active, onChange, wrap = false }: FilterTabsProps) {
  return (
    <div className={classNames("flex gap-2 px-px pb-2 pt-1", wrap ? "flex-wrap overflow-visible" : "overflow-x-auto")}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={classNames(
            "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
            active === tab.value
              ? "bg-gangwon-orange text-white shadow-sm"
              : "bg-white text-slate-600 ring-1 ring-slate-200/70 hover:bg-orange-50 hover:text-gangwon-orange"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
