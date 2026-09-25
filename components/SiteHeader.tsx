"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Поездки", match: (p: string) => p === "/" || p.startsWith("/trips") },
  { href: "/stats", label: "Карта и цифры", match: (p: string) => p.startsWith("/stats") },
  { href: "/people", label: "Люди", match: (p: string) => p.startsWith("/people") },
  { href: "/tracks", label: "Треки", match: (p: string) => p.startsWith("/tracks") },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  // trip pages draw the header over their cover photo
  const overlay = pathname.startsWith("/trips/");
  return (
    <header className={`site-header${overlay ? " site-header--overlay" : ""}`}>
      <div className="site-header__inner">
        <Link href="/" className="site-header__logo">
          Велотрипы
        </Link>
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
        </nav>
      </div>
    </header>
  );
}
