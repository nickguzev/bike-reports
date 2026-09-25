import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { getTrackForSlug, getDayTracksForSlug, getCategorizedTrackForSlug, type TrackPoint, type CategorizedSegment } from "@/lib/gpx";

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
  routeSummary?: string;
  year: number;
  order?: number;
  country: string;
  dates: string;
  days?: number;
  placeholder: boolean;
  distanceKm?: number;
  elevationM?: number;
  punctures?: number;
  lostBikes?: number;
  participants: string[];
  participantCount?: number;
  route: string[];
  overnightStop?: { lat: number; lon: number; label?: string };
  geo?: {
    coastPoints: TrackPoint[];
    cities?: { lat: number; lon: number; name: string }[];
    mountainSide?: "north" | "none";
    seaSide?: "south" | "north" | "east" | "west" | "none";
  };
  dailyKm: number[];
  gpxUrl?: string;
  source?: string;
  /** Cover photo: frontmatter `cover`, else the first photo of the report. */
  cover?: string;
  /** Every photo in the report, in order (for the cover picker). */
  photos: string[];
  sections: TripSection[];
  track: TrackPoint[] | null;
  dayTracks: TrackPoint[][][] | null;
  categorizedTrack: CategorizedSegment[] | null;
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
  const leading = html.slice(0, matches[0].index!).trim();
  if (leading) {
    sections.push({ html: leading });
  }
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
  const photos = [...content.matchAll(/<!--\s*(?:photo|gallery):\s*([\s\S]*?)-->/g)].flatMap((m) =>
    m[1].split(",").map((s) => s.trim()).filter(Boolean)
  );
  let contentHtml = marked.parse(content, { async: false }) as string;

  // Photo markers (<!-- photo: URL -->) render as plain <img> tags pointing
  // wherever the URL points — currently our R2 bucket, one file per trip
  // folder, uploaded separately from this repo.
  contentHtml = contentHtml.replace(
    /<!--\s*photo:\s*(\S+?)\s*-->/g,
    (_match, url) =>
      `<img src="${url}" alt="" loading="lazy" class="trip-photo" />`
  );

  // Gallery markers (<!-- gallery: url1, url2, ... -->) render a grid of
  // thumbnails; they are regular .trip-photo images, so the lightbox works.
  contentHtml = contentHtml.replace(/<!--\s*gallery:\s*([\s\S]*?)-->/g, (_match, list: string) => {
    const imgs = list
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => `<img src="${url}" alt="" loading="lazy" class="trip-photo trip-gallery__img" />`)
      .join("");
    return `<div class="trip-gallery">${imgs}</div>`;
  });

  // Short self-hosted clips (<!-- clips: /videos/a.mp4, /videos/b.mp4 -->),
  // poster = same path with .jpg.
  contentHtml = contentHtml.replace(/<!--\s*clips:\s*([\s\S]*?)-->/g, (_match, list: string) => {
    const vids = list
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(
        (url) =>
          `<video class="trip-clip" src="${url}" poster="${url.replace(/\.mp4$/, ".jpg")}" controls playsinline preload="none"></video>`
      )
      .join("");
    return `<div class="trip-clips">${vids}</div>`;
  });

  // External film link card (<!-- film: url | title | note -->).
  contentHtml = contentHtml.replace(/<!--\s*film:\s*([\s\S]*?)-->/g, (_match, body: string) => {
    const [url, title, note] = body.split("|").map((s) => s.trim());
    return `<a class="trip-film" href="${url}" target="_blank" rel="noopener noreferrer"><span class="trip-film__play" aria-hidden="true">▶</span><span><span class="trip-film__title">${title ?? "Смотреть видео"}</span>${note ? `<span class="trip-film__note">${note}</span>` : ""}</span></a>`;
  });

  // Video markers (<!-- video: instagram-url -->) render as Instagram's own
  // official embed widget (blockquote + their embed.js processes it client
  // side — see components loaded in the trip page). Not a reproduction of
  // the video itself, just the sanctioned embed Instagram provides.
  contentHtml = contentHtml.replace(
    /<!--\s*video:\s*(\S+?)\s*-->/g,
    (_match, rawUrl) => {
      const url = rawUrl.split("?")[0].replace(/\/$/, "") + "/";
      return `<blockquote class="instagram-media trip-video" data-instgrm-permalink="${url}" data-instgrm-version="14"><a href="${url}" target="_blank" rel="noopener noreferrer">Смотреть в Instagram</a></blockquote>`;
    }
  );

  return {
    slug,
    title: data.title,
    subtitle: data.subtitle,
    routeSummary: data.routeSummary,
    year: data.year,
    order: data.order,
    country: data.country,
    dates: data.dates,
    days: data.days,
    placeholder: Boolean(data.placeholder),
    distanceKm: data.distanceKm,
    elevationM: data.elevationM,
    punctures: data.punctures,
    lostBikes: data.lostBikes,
    participants: data.participants ?? [],
    participantCount: data.participantCount,
    route: data.route ?? [],
    overnightStop: data.overnightStop,
    geo: data.geoCoast
      ? {
          coastPoints: data.geoCoast,
          cities: data.geoCities,
          mountainSide: data.geoMountains,
          seaSide: data.geoSea,
        }
      : undefined,
    dailyKm: data.dailyKm ?? [],
    gpxUrl: data.gpxUrl,
    source: data.source,
    cover: data.cover ?? photos[0],
    photos,
    sections: splitIntoSections(contentHtml),
    track: getTrackForSlug(slug),
    dayTracks: getDayTracksForSlug(slug),
    categorizedTrack: getCategorizedTrackForSlug(slug),
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
