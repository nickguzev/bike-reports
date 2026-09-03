import fs from "fs";
import path from "path";

export type TrackPoint = { lat: number; lon: number };

const TRACKS_DIR = path.join(process.cwd(), "content", "tracks");

export function getTrackForSlug(slug: string): TrackPoint[] | null {
  const filePath = path.join(TRACKS_DIR, `${slug}.gpx`);
  if (!fs.existsSync(filePath)) return null;

  const xml = fs.readFileSync(filePath, "utf-8");
  const points: TrackPoint[] = [];
  const re = /<trkpt\s+lat="(-?\d+(?:\.\d+)?)"\s+lon="(-?\d+(?:\.\d+)?)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    points.push({ lat: parseFloat(m[1]), lon: parseFloat(m[2]) });
  }
  return points.length > 1 ? points : null;
}

/**
 * Multi-day track: content/tracks/<slug>.json = TrackPoint[][][]
 * (day -> segment -> point). Each day is one or more segments; a new
 * segment starts wherever the recorded track has a real gap (e.g. a
 * transfer by car/train/plane), so segments are never connected by a
 * straight line across the gap.
 */
export function getDayTracksForSlug(slug: string): TrackPoint[][][] | null {
  const filePath = path.join(TRACKS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  // categorized-format files are a flat array of {category, points} objects, not day arrays
  if ("category" in (parsed[0] ?? {})) return null;
  return parsed as TrackPoint[][][];
}

export type CategorizedSegment = {
  category: "cycling" | "hiking" | "walk" | "transport";
  label: string;
  points: TrackPoint[];
};

/**
 * Mixed-mode track: content/tracks/<slug>.json — for trips that combine
 * real cycling with hiking side-trips, ferries, or other transport. Only
 * "cycling" segments should count toward distance/elevation stats;
 * everything else is shown on the map but excluded from the numbers.
 */
export function getCategorizedTrackForSlug(slug: string): CategorizedSegment[] | null {
  const filePath = path.join(TRACKS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  if (!("category" in (parsed[0] ?? {}))) return null;
  return parsed as CategorizedSegment[];
}
