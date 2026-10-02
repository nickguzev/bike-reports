"use client";

import { setTheme, useTheme } from "@/lib/mapTheme";

export default function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? "Включить тёмную тему" : "Включить светлую тему"}
      title={next === "dark" ? "Тёмная тема" : "Светлая тема"}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="theme-toggle__moon">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="theme-toggle__sun">
        <circle cx="12" cy="12" r="4.5" fill="currentColor" />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </button>
  );
}
