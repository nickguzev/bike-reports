import type { TrackPoint, CategorizedSegment } from "@/lib/gpx";

type StopMarker = { lat: number; lon: number; label?: string };
type CityMarker = { lat: number; lon: number; name: string };
type GeoBackdrop = {
  coastPoints: TrackPoint[]; // ordered along the coast
  cities?: CityMarker[];
  mountainSide?: "north" | "none";
  seaSide?: "south" | "north" | "east" | "west" | "none";
};

type Props = {
  track: TrackPoint[] | null;
  dayTracks?: TrackPoint[][][] | null;
  categorizedTrack?: CategorizedSegment[] | null;
  waypointCount: number;
  stopMarker?: StopMarker;
  geo?: GeoBackdrop;
};

const W = 680;
const H = 260;
const PAD = 30;

const DAY_TONES = ["var(--route)", "var(--moss)"];

export const CATEGORY_COLORS: Record<CategorizedSegment["category"], string> = {
  cycling: "var(--route)",
  hiking: "var(--moss)",
  walk: "#a8875a",
  transport: "var(--ink-faint)",
};

export const CATEGORY_LABELS: Record<CategorizedSegment["category"], string> = {
  cycling: "На велосипеде",
  hiking: "Пешком в горах",
  walk: "Прогулка по городу",
  transport: "Паром / переезд",
};

export default function RouteMap({ track, dayTracks, categorizedTrack, waypointCount, stopMarker, geo }: Props) {
  if (categorizedTrack && categorizedTrack.length > 0) {
    return <CategorizedTrack segments={categorizedTrack} stopMarker={stopMarker} geo={geo} />;
  }
  if (dayTracks && dayTracks.length > 0) {
    return <MultiDayTrack days={dayTracks} stopMarker={stopMarker} geo={geo} />;
  }
  if (track && track.length > 1) {
    return <SingleTrack track={track} stopMarker={stopMarker} geo={geo} />;
  }
  return <SchematicRoute count={Math.max(waypointCount, 2)} />;
}

function GeoBackdropLayer({
  geo,
  b,
  project,
}: {
  geo: GeoBackdrop;
  b: ReturnType<typeof bounds>;
  project: (p: TrackPoint) => { x: number; y: number };
}) {
  const coastXY = geo.coastPoints.map(project);
  const coastPath = "M " + coastXY.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

  const seaSide = geo.seaSide ?? "south";
  const first = coastXY[0];
  const last = coastXY[coastXY.length - 1];
  const edge: Record<string, number> = { south: H + 20, north: -20, east: W + 20, west: -20 };
  const isVertical = seaSide === "south" || seaSide === "north";
  const closeCoord = edge[seaSide];
  const seaPath =
    seaSide === "none"
      ? null
      : isVertical
        ? coastPath + ` L ${last.x.toFixed(1)},${closeCoord} L ${first.x.toFixed(1)},${closeCoord} Z`
        : coastPath + ` L ${closeCoord},${last.y.toFixed(1)} L ${closeCoord},${first.y.toFixed(1)} Z`;

  return (
    <g>
      {seaPath && <path d={seaPath} fill="var(--route-soft)" opacity={0.16} />}
      <path
        d={coastPath}
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.55}
      />

      {geo.mountainSide === "north" && (
        <g opacity={0.35}>
          {Array.from({ length: 7 }).map((_, i) => {
            const x = PAD + 10 + i * ((W - PAD * 2 - 20) / 6);
            const peak = 10 + (i % 3) * 6;
            return (
              <path
                key={i}
                d={`M ${x - 16},${PAD + 22} L ${x},${PAD + 22 - peak} L ${x + 16},${PAD + 22} Z`}
                fill="var(--ink-faint)"
              />
            );
          })}
        </g>
      )}

      {geo.cities?.map((city) => {
        const p = project(city);
        return (
          <g key={city.name}>
            <circle cx={p.x} cy={p.y} r={2.25} fill="var(--ink-faint)" />
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor="middle"
              fontSize="8"
              fontFamily="var(--font-body)"
              fontStyle="italic"
              fill="var(--ink-faint)"
            >
              {city.name}
            </text>
          </g>
        );
      })}
    </g>
  );
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

function CategorizedTrack({
  segments,
  stopMarker,
  geo,
}: {
  segments: CategorizedSegment[];
  stopMarker?: StopMarker;
  geo?: GeoBackdrop;
}) {
  const all = segments.flatMap((s) => s.points).concat(geo?.coastPoints ?? []);
  const b = bounds(all);
  const { project } = makeProjector(b);
  const stop = stopMarker ? project(stopMarker) : null;

  const usedCategories = [...new Set(segments.map((s) => s.category))] as CategorizedSegment["category"][];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "hidden" }} role="img" aria-label="Карта поездки с разными видами передвижения">
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--paper-dim)" opacity={0.5} />
        <Graticule b={b} project={project} />
        {geo && <GeoBackdropLayer geo={geo} b={b} project={project} />}

        {segments.map((seg, i) => {
          const d =
            "M " +
            seg.points
              .map((p) => {
                const q = project(p);
                return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
              })
              .join(" L ");
          const isTransport = seg.category === "transport";
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={CATEGORY_COLORS[seg.category]}
              strokeWidth={isTransport ? 1.5 : 2.5}
              strokeDasharray={isTransport ? "5 4" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={isTransport ? 0.6 : 0.95}
            />
          );
        })}

        {stop && (
          <g>
            <circle cx={stop.x} cy={stop.y} r={5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2} />
            {stopMarker?.label && (
              <text x={stop.x} y={stop.y - 10} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-display)" fontWeight={700} fill="var(--ink)">
                {stopMarker.label}
              </text>
            )}
          </g>
        )}
      </svg>
      <div className="track-legend">
        {usedCategories.map((cat) => (
          <span key={cat} className="track-legend__item">
            <span
              className="track-legend__swatch"
              style={{
                background: cat === "transport" ? "transparent" : CATEGORY_COLORS[cat],
                borderColor: CATEGORY_COLORS[cat],
                borderStyle: cat === "transport" ? "dashed" : "solid",
              }}
            />
            {CATEGORY_LABELS[cat]}
          </span>
        ))}
      </div>
    </div>
  );
}

function MultiDayTrack({
  days,
  stopMarker,
  geo,
}: {
  days: TrackPoint[][][];
  stopMarker?: StopMarker;
  geo?: GeoBackdrop;
}) {
  const all = geo?.coastPoints?.length ? geo.coastPoints : days.flat(2);
  const b = bounds(all);
  const { project } = makeProjector(b);

  const stop = stopMarker ? project(stopMarker) : null;
  const firstDay = days[0][0];
  const lastDay = days[days.length - 1][days[days.length - 1].length - 1];
  const start = project(firstDay[0]);
  const end = project(lastDay[lastDay.length - 1]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "hidden" }} role="img" aria-label="Трек поездки по дням">
      <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--paper-dim)" opacity={0.5} />
      <Graticule b={b} project={project} />
      {geo && <GeoBackdropLayer geo={geo} b={b} project={project} />}

      {days.map((segments, i) => {
        const dayStart = project(segments[0][0]);
        const tone = DAY_TONES[i % DAY_TONES.length];
        return (
          <g key={i}>
            {segments.map((seg, si) => {
              const d =
                "M " +
                seg
                  .map((p) => {
                    const q = project(p);
                    return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
                  })
                  .join(" L ");
              return (
                <path
                  key={si}
                  d={d}
                  fill="none"
                  stroke={tone}
                  strokeWidth={2.25}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx={dayStart.x} cy={dayStart.y} r={7} fill="var(--paper)" stroke={tone} strokeWidth={1.5} />
            <text
              x={dayStart.x}
              y={dayStart.y + 3}
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="var(--font-display)"
              fontWeight={700}
              fill={tone}
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

function SingleTrack({
  track,
  stopMarker,
  geo,
}: {
  track: TrackPoint[];
  stopMarker?: StopMarker;
  geo?: GeoBackdrop;
}) {
  const b = bounds(geo?.coastPoints?.length ? geo.coastPoints : track);
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
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "hidden" }} role="img" aria-label="Трек поездки">
      <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--paper-dim)" opacity={0.5} />
      <Graticule b={b} project={project} />
      {geo && <GeoBackdropLayer geo={geo} b={b} project={project} />}
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
