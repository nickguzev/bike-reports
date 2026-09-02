import type { TrackPoint } from "@/lib/gpx";

type StopMarker = { lat: number; lon: number; label?: string };

type Props = {
  track: TrackPoint[] | null;
  dayTracks?: TrackPoint[][] | null;
  waypointCount: number;
  stopMarker?: StopMarker;
};

const W = 680;
const H = 260;
const PAD = 30;

const DAY_TONES = ["var(--route)", "var(--moss)"];

export default function RouteMap({ track, dayTracks, waypointCount, stopMarker }: Props) {
  if (dayTracks && dayTracks.length > 0) {
    return <MultiDayTrack days={dayTracks} stopMarker={stopMarker} />;
  }
  if (track && track.length > 1) {
    return <SingleTrack track={track} stopMarker={stopMarker} />;
  }
  return <SchematicRoute count={Math.max(waypointCount, 2)} />;
}

function bounds(allPoints: TrackPoint[]) {
  const lats = allPoints.map((p) => p.lat);
  const lons = allPoints.map((p) => p.lon);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
}

function makeProjector(b: ReturnType<typeof bounds>) {
  const latRange = b.maxLat - b.minLat || 1;
  const lonRange = b.maxLon - b.minLon || 1;
  const availW = W - PAD * 2;
  const availH = H - PAD * 2;
  const scale = Math.min(availW / lonRange, availH / latRange);
  const drawW = lonRange * scale;
  const drawH = latRange * scale;
  const offsetX = (W - drawW) / 2;
  const offsetY = (H - drawH) / 2;

  return {
    scale,
    project: (p: TrackPoint) => ({
      x: offsetX + (p.lon - b.minLon) * scale,
      y: offsetY + drawH - (p.lat - b.minLat) * scale,
    }),
  };
}

/** Nice-ish graticule step for the given coordinate range. */
function niceStep(range: number): number {
  const steps = [0.05, 0.1, 0.25, 0.5, 1, 2, 5];
  for (const s of steps) {
    if (range / s <= 6) return s;
  }
  return 5;
}

function Graticule({
  b,
  project,
}: {
  b: ReturnType<typeof bounds>;
  project: (p: TrackPoint) => { x: number; y: number };
}) {
  const latStep = niceStep(b.maxLat - b.minLat);
  const lonStep = niceStep(b.maxLon - b.minLon);

  const lats: number[] = [];
  for (let v = Math.ceil(b.minLat / latStep) * latStep; v <= b.maxLat; v += latStep) lats.push(v);
  const lons: number[] = [];
  for (let v = Math.ceil(b.minLon / lonStep) * lonStep; v <= b.maxLon; v += lonStep) lons.push(v);

  return (
    <g>
      {lats.map((lat) => {
        const y = project({ lat, lon: b.minLon }).y;
        return (
          <g key={`lat-${lat}`}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--line)" strokeWidth={0.75} strokeDasharray="2 4" />
            <text x={4} y={y + 3} fontSize="8" fontFamily="var(--font-body)" fill="var(--ink-faint)">
              {lat.toFixed(2)}°
            </text>
          </g>
        );
      })}
      {lons.map((lon) => {
        const x = project({ lat: b.minLat, lon }).x;
        return (
          <g key={`lon-${lon}`}>
            <line x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="var(--line)" strokeWidth={0.75} strokeDasharray="2 4" />
            <text x={x + 3} y={H - 6} fontSize="8" fontFamily="var(--font-body)" fill="var(--ink-faint)">
              {lon.toFixed(2)}°
            </text>
          </g>
        );
      })}
    </g>
  );
}

function MultiDayTrack({ days, stopMarker }: { days: TrackPoint[][]; stopMarker?: StopMarker }) {
  const all = days.flat();
  const b = bounds(all);
  const { project } = makeProjector(b);

  const stop = stopMarker ? project(stopMarker) : null;
  const start = project(days[0][0]);
  const end = project(days[days.length - 1][days[days.length - 1].length - 1]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Трек поездки по дням">
      <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--paper-dim)" opacity={0.5} />
      <Graticule b={b} project={project} />

      {days.map((day, i) => {
        const d =
          "M " +
          day
            .map((p) => {
              const q = project(p);
              return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
            })
            .join(" L ");
        const dayStart = project(day[0]);
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke={DAY_TONES[i % DAY_TONES.length]}
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={dayStart.x}
              cy={dayStart.y}
              r={7}
              fill="var(--paper)"
              stroke={DAY_TONES[i % DAY_TONES.length]}
              strokeWidth={1.5}
            />
            <text
              x={dayStart.x}
              y={dayStart.y + 3}
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="var(--font-display)"
              fontWeight={700}
              fill={DAY_TONES[i % DAY_TONES.length]}
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {stop && (
        <g>
          <circle cx={stop.x} cy={stop.y} r={5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2} />
          {stopMarker?.label && (
            <text
              x={stop.x}
              y={stop.y - 10}
              textAnchor="middle"
              fontSize="9.5"
              fontFamily="var(--font-display)"
              fontWeight={700}
              fill="var(--ink)"
            >
              {stopMarker.label}
            </text>
          )}
        </g>
      )}

      <circle cx={start.x} cy={start.y} r={4} fill="var(--ink)" />
      <circle cx={end.x} cy={end.y} r={4} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2} />
    </svg>
  );
}

function SingleTrack({ track, stopMarker }: { track: TrackPoint[]; stopMarker?: StopMarker }) {
  const b = bounds(track);
  const { project } = makeProjector(b);

  const pathD =
    "M " +
    track
      .map((p) => {
        const q = project(p);
        return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
      })
      .join(" L ");
  const start = project(track[0]);
  const end = project(track[track.length - 1]);
  const stop = stopMarker ? project(stopMarker) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Трек поездки">
      <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--paper-dim)" opacity={0.5} />
      <Graticule b={b} project={project} />
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
          <circle cx={stop.x} cy={stop.y} r={5.5} fill="var(--paper)" stroke="var(--moss)" strokeWidth={2.5} />
          <circle cx={stop.x} cy={stop.y} r={2} fill="var(--moss)" />
          {stopMarker?.label && (
            <text
              x={stop.x}
              y={stop.y - 11}
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
      <circle cx={start.x} cy={start.y} r={4.5} fill="var(--ink)" />
      <circle cx={end.x} cy={end.y} r={4.5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2} />
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
