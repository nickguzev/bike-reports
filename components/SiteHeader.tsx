"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/", label: "Поездки", match: (p: string) => p === "/" || p.startsWith("/trips") },
  { href: "/stats", label: "Карта и цифры", match: (p: string) => p.startsWith("/stats") },
  { href: "/people", label: "Люди", match: (p: string) => p.startsWith("/people") },
  { href: "/tracks", label: "Треки", match: (p: string) => p.startsWith("/tracks") },
];

export function ExtArrow() {
  // drawn, not the ↗ character: phones swap that one for a blue emoji
  return (
    <svg className="ext-arrow" viewBox="0 0 12 12" width="0.7em" height="0.7em" aria-hidden="true">
      <path d="M3 9l6-6M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  // trip pages draw the header over their cover photo
  const overlay = pathname.startsWith("/trips/");
  return (
    <header className={`site-header${overlay ? " site-header--overlay" : ""}`}>
      <div className="site-header__inner">
        {/* the home page already carries the big title, so no logo there */}
        {pathname !== "/" && (
          <Link href="/" className="site-header__logo">
            Велотрипы
          </Link>
        )}
        {/* trip pages keep only the logo (link home) and the theme toggle */}
        {!overlay && (
          <nav className="site-header__nav" aria-label="Разделы">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`site-header__link${item.match(pathname) ? " site-header__link--active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://moscross-nickguzev-2002s-projects.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="site-header__link"
            >
              Протыки Москвы <ExtArrow />
            </a>
          </nav>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
