import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const TRIPS_DIR = path.join(process.cwd(), "content", "trips");

marked.setOptions({ breaks: true });

export type Trip = {
  slug: string;
  title: string;
  subtitle?: string;
  year: number;
  country: string;
  dates: string;
  distanceKm: number;
  elevationM?: number;
  punctures?: number;
  lostBikes?: number;
  participants: string[];
  route: string[];
  dailyKm: number[];
  gpxUrl?: string;
  source?: string;
  contentHtml: string;
};

function readSlugs(): string[] {
  if (!fs.existsSync(TRIPS_DIR)) return [];
  return fs
    .readdirSync(TRIPS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllTrips(): Trip[] {
  const trips = readSlugs().map((slug) => getTripBySlug(slug));
  return trips.sort((a, b) => b.year - a.year);
}

export function getTripBySlug(slug: string): Trip {
  const raw = fs.readFileSync(path.join(TRIPS_DIR, `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);
  const contentHtml = marked.parse(content, { async: false }) as string;

  return {
    slug,
    title: data.title,
    subtitle: data.subtitle,
    year: data.year,
    country: data.country,
    dates: data.dates,
    distanceKm: data.distanceKm,
    elevationM: data.elevationM,
    punctures: data.punctures,
    lostBikes: data.lostBikes,
    participants: data.participants ?? [],
    route: data.route ?? [],
    dailyKm: data.dailyKm ?? [],
    gpxUrl: data.gpxUrl,
    source: data.source,
    contentHtml,
  };
}

export function getAllSlugs(): string[] {
  return readSlugs();
}
