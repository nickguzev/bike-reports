import type { Metadata } from "next";
import { PT_Sans_Narrow, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { getYearRange } from "@/lib/trips";

const ptSansNarrow = PT_Sans_Narrow({
  variable: "--font-condensed",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
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
    <html lang="ru" className={`${ptSansNarrow.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
