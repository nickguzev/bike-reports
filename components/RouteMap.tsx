import type { TrackPoint } from "@/lib/gpx";

type StopMarker = { lat: number; lon: number; label?: string };

type Props = {
  track: TrackPoint[] | null;
  waypointCount: number;
  stopMarker?: StopMarker;
};

const W = 680;
const H = 200;
const PAD = 24;

export default function RouteMap({ track, waypointCount, stopMarker }: Props) {
  if (track && track.length > 1) {
    return <RealTrack track={track} stopMarker={stopMarker} />;
  }
  return <SchematicRoute count={Math.max(waypointCount, 2)} />;
}

function RealTrack({ track, stopMarker }: { track: TrackPoint[]; stopMarker?: StopMarker }) {
  const lats = track.map((p) => p.lat);
  const lons = track.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat || 1;
  const lonRange = maxLon - minLon || 1;

  // preserve aspect ratio: scale by the tighter of the two axes
  const availW = W - PAD * 2;
  const availH = H - PAD * 2;
  const scale = Math.min(availW / lonRange, availH / latRange);
  const drawW = lonRange * scale;
  const drawH = latRange * scale;
  const offsetX = (W - drawW) / 2;
  const offsetY = (H - drawH) / 2;

  const project = (p: TrackPoint) => {
    const x = offsetX + (p.lon - minLon) * scale;
    const y = offsetY + drawH - (p.lat - minLat) * scale; // flip: north up
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const pathD = "M " + track.map(project).join(" L ");
  const start = project(track[0]).split(",");
  const end = project(track[track.length - 1]).split(",");
  const stop = stopMarker ? project(stopMarker).split(",") : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Трек поездки">
      <path
        d={pathD}
        fill="none"
        stroke="var(--route)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {stop && (
        <g>
          <circle cx={stop[0]} cy={stop[1]} r={5.5} fill="var(--paper)" stroke="var(--moss)" strokeWidth={2.5} />
          <circle cx={stop[0]} cy={stop[1]} r={2} fill="var(--moss)" />
          {stopMarker?.label && (
            <text
              x={Number(stop[0])}
              y={Number(stop[1]) - 11}
              textAnchor="middle"
              fontSize="10"
              fontFamily="var(--font-display)"
              fontWeight={700}
              fill="var(--moss)"
            >
              {stopMarker.label}
            </text>
          )}
        </g>
      )}
      <circle cx={start[0]} cy={start[1]} r={4.5} fill="var(--ink)" />
      <circle
        cx={end[0]}
        cy={end[1]}
        r={4.5}
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth={2}
      />
    </svg>
  );
}

/** No real track yet — a quiet decorative placeholder, not a fake map. */
function SchematicRoute({ count }: { count: number }) {
  const n = Math.min(count, 10);
  const usableW = W - PAD * 2;
  const midY = H / 2;
  const amplitude = 22;

  const points = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const x = PAD + t * usableW;
    const y = midY + Math.sin(t * Math.PI * 1.6) * amplitude;
    return { x, y };
  });

  const pathD =
    "M " + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Маршрут поездки">
      <path
        d={pathD}
        fill="none"
        stroke="var(--route-soft)"
        strokeWidth={2}
        strokeDasharray="1 9"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--route)" />
      ))}
    </svg>
  );
}
