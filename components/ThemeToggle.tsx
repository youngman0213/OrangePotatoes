"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { classNames } from "@/lib/utils";

type ThemeMode = "system" | "light" | "dark";

const storageKey = "orange-potatoes-theme";

const modes: Array<{ value: ThemeMode; label: string; icon: typeof Monitor }> = [
  { value: "system", label: "시스템", icon: Monitor },
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon }
];

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readSavedMode();
    setMode(saved);
    setReady(true);
    applyTheme(saved);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (readSavedMode() === "system") applyTheme("system");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  function changeMode(nextMode: ThemeMode) {
    setMode(nextMode);
    localStorage.setItem(storageKey, nextMode);
    applyTheme(nextMode);
  }

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1" aria-label="화면 모드 선택">
      {modes.map((item) => {
        const Icon = item.icon;
        const active = ready && mode === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => changeMode(item.value)}
            className={classNames(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
              active
                ? "bg-gangwon-orange text-white shadow-sm"
                : "text-slate-500 hover:bg-white hover:text-gangwon-orange"
            )}
            title={`${item.label} 모드`}
            aria-label={`${item.label} 모드`}
            aria-pressed={active}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function readSavedMode(): ThemeMode {
  const saved = localStorage.getItem(storageKey);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  const root = document.documentElement;

  root.classList.toggle("theme-dark", isDark);
  root.classList.toggle("theme-light", !isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}
