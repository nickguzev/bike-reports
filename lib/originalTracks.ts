import fs from "fs";
import path from "path";

export type OriginalTrackFile = {
  label: string;
  filename: string;
  size: number; // bytes, resolved at build time
};

const DIR = path.join(process.cwd(), "public", "original-tracks");

// slug -> [{ label, filename }] — filename is relative to public/original-tracks/<slug>/
const MANIFEST: Record<string, { label: string; filename: string }[]> = {
  "austria-slovakia-hungary-2010": [
    { label: "Полный экспорт (13 сегментов, дни 1/3/4/5)", filename: "full-export.kml" },
  ],
  "england-2025": [
    { label: "День 1", filename: "day-1.gpx" },
    { label: "День 2", filename: "day-2.gpx" },
    { label: "День 3", filename: "day-3.gpx" },
    { label: "День 4", filename: "day-4.gpx" },
    { label: "День 5", filename: "day-5.gpx" },
    { label: "День 6", filename: "day-6.gpx" },
  ],
  "kirill-solo-2026": [
    { label: "Дни 1–8 (единый файл)", filename: "all-days.gpx" },
  ],
  "lazurny-bereg-2011": [
    { label: "Дни 1–8 (единый файл, 45 сегментов)", filename: "all-days.gpx" },
  ],
  "belarus-2012": [{ label: "Витебск — Орша", filename: "route.gpx" }],
  "montenegro-italy-2016": [
    { label: "Дни 1–9 (единый файл)", filename: "all-days.kmz" },
    { label: "День 4 полностью (восстановлен через AllTrails, CSV)", filename: "day-4-full.csv" },
  ],
  "norway-2018": [
    { label: "Полный экспорт из Google My Maps (с цветовой разметкой)", filename: "all-segments.kml" },
    { label: "Первый экспорт (неполный, для истории)", filename: "all-segments-v1.kmz" },
  ],
  "kaliningrad-copenhagen-2014": [
    { label: "Полный экспорт из Google My Tracks", filename: "all-days.kml" },
  ],
  "austria-2024": [
    { label: "День 1 (утро)", filename: "day-1-morning.gpx" },
    { label: "День 1 (вечер)", filename: "day-1-evening.gpx" },
    { label: "День 2", filename: "day-2.gpx" },
    { label: "День 3", filename: "day-3.gpx" },
    { label: "День 4", filename: "day-4.gpx" },
  ],
  "italy-france-2023": [
    { label: "День 1", filename: "day-1.gpx" },
    { label: "День 2", filename: "day-2.gpx" },
    { label: "День 3", filename: "day-3.gpx" },
    { label: "День 4", filename: "day-4.gpx" },
    { label: "День 5", filename: "day-5.gpx" },
  ],
  "vyborg-spb-2026": [
    { label: "День 1 (Выборг — Флотский мыс)", filename: "day-1.gpx" },
    { label: "День 2 (Флотский мыс — Санкт-Петербург)", filename: "day-2.gpx" },
  ],
  "estonia-2017": [{ label: "Дни 1–4 (единый файл)", filename: "all-days.kmz" }],
  "rostov-krasnodar-2019": [{ label: "Дни 1–5 (единый файл)", filename: "all-days.kmz" }],
  "turkey-2022": [{ label: "Дни 1–6 (единый файл)", filename: "all-days.kmz" }],
  "elets-2013": [{ label: "Набережная — Елец", filename: "route.gpx" }],
  "rybinsk-yaroslavl-kostroma-2015": [
    { label: "Дни 1–2 (полный, оба дня)", filename: "all-days.kmz" },
    { label: "День 2 (частичный дубль)", filename: "day-2-partial.kmz" },
  ],
};

export function getOriginalTracksForSlug(slug: string): OriginalTrackFile[] {
  const entries = MANIFEST[slug];
  if (!entries) return [];
  return entries
    .map((e) => {
      const filePath = path.join(DIR, slug, e.filename);
      if (!fs.existsSync(filePath)) return null;
      return { ...e, size: fs.statSync(filePath).size };
    })
    .filter((x): x is OriginalTrackFile => x !== null);
}

export function getAllOriginalTrackSlugs(): string[] {
  return Object.keys(MANIFEST).filter((slug) => getOriginalTracksForSlug(slug).length > 0);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} КБ`;
  return `${(kb / 1024).toFixed(1)} МБ`;
}
