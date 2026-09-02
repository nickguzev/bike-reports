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
  const days = JSON.parse(raw) as TrackPoint[][][];
  return Array.isArray(days) && days.length > 0 ? days : null;
}
