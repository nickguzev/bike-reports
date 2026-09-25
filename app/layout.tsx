import type { Metadata } from "next";
import { Unbounded, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { getYearRange } from "@/lib/trips";
import SiteHeader from "@/components/SiteHeader";

const unbounded = Unbounded({
  variable: "--font-condensed",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const { min, max } = getYearRange();

export const metadata: Metadata = {
  title: `Велотрипы ${min}–${max}`,
  description: "Интерактивный архив отчётов о велопутешествиях по России и Европе.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${sourceSerif.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="site-footer__inner">
            <span>
              Велотрипы · {min}–{max}
            </span>
            <a href="https://moscross-nickguzev-2002s-projects.vercel.app" target="_blank" rel="noopener noreferrer">
              Ещё наш проект — Протыки Москвы ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
