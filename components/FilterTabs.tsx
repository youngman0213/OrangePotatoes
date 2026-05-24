"use client";

import { classNames } from "@/lib/utils";

interface FilterTabsProps {
  tabs: Array<{ label: string; value: string }>;
  active: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-px pb-2 pt-1">
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
