import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { getTrackForSlug, type TrackPoint } from "@/lib/gpx";

const TRIPS_DIR = path.join(process.cwd(), "content", "trips");

marked.setOptions({ breaks: true });

export type TripSection = {
  authorSlug?: string;
  html: string;
};

export type Trip = {
  slug: string;
  title: string;
  subtitle?: string;
  year: number;
  order?: number;
  country: string;
  dates: string;
  placeholder: boolean;
  distanceKm?: number;
  elevationM?: number;
  punctures?: number;
  lostBikes?: number;
  participants: string[];
  participantCount?: number;
  route: string[];
  dailyKm: number[];
  gpxUrl?: string;
  source?: string;
  sections: TripSection[];
  track: TrackPoint[] | null;
};

function readSlugs(): string[] {
  if (!fs.existsSync(TRIPS_DIR)) return [];
  return fs
    .readdirSync(TRIPS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function splitIntoSections(html: string): TripSection[] {
  const marker = /<!--\s*author:\s*(\S+?)\s*-->/g;
  const matches = [...html.matchAll(marker)];
  if (matches.length === 0) return [{ html }];

  const sections: TripSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : html.length;
    sections.push({
      authorSlug: matches[i][1],
      html: html.slice(start, end).trim(),
    });
  }
  return sections;
}

export function getTripBySlug(slug: string): Trip {
  const raw = fs.readFileSync(path.join(TRIPS_DIR, `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);
  let contentHtml = marked.parse(content, { async: false }) as string;

  // Photo markers (<!-- photo: URL -->) render as plain <img> tags pointing
  // wherever the URL points — currently our R2 bucket, one file per trip
  // folder, uploaded separately from this repo.
  contentHtml = contentHtml.replace(
    /<!--\s*photo:\s*(\S+?)\s*-->/g,
    (_match, url) =>
      `<img src="${url}" alt="" loading="lazy" class="trip-photo" />`
  );

  return {
    slug,
    title: data.title,
    subtitle: data.subtitle,
    year: data.year,
    order: data.order,
    country: data.country,
    dates: data.dates,
    placeholder: Boolean(data.placeholder),
    distanceKm: data.distanceKm,
    elevationM: data.elevationM,
    punctures: data.punctures,
    lostBikes: data.lostBikes,
    participants: data.participants ?? [],
    participantCount: data.participantCount,
    route: data.route ?? [],
    dailyKm: data.dailyKm ?? [],
    gpxUrl: data.gpxUrl,
    source: data.source,
    sections: splitIntoSections(contentHtml),
    track: getTrackForSlug(slug),
  };
}

export function getAllTrips(): Trip[] {
  const trips = readSlugs().map((slug) => getTripBySlug(slug));
  return trips.sort(
    (a, b) => b.year - a.year || (b.order ?? 0) - (a.order ?? 0)
  );
}

/** Chronological (oldest → newest) order, for prev/next navigation. */
export function getChronologicalTrips(): Trip[] {
  return [...getAllTrips()].sort(
    (a, b) => a.year - b.year || (a.order ?? 0) - (b.order ?? 0)
  );
}

export function getAdjacentTrips(slug: string): {
  prev: Trip | null;
  next: Trip | null;
} {
  const ordered = getChronologicalTrips();
  const i = ordered.findIndex((t) => t.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? ordered[i - 1] : null,
    next: i < ordered.length - 1 ? ordered[i + 1] : null,
  };
}

export function getYearRange(): { min: number; max: number } {
  const trips = getAllTrips();
  const years = trips.map((t) => t.year);
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function getAllSlugs(): string[] {
  return readSlugs();
}
