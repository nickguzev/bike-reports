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
