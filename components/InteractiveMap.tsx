"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { TrackPoint, CategorizedSegment } from "@/lib/gpx";
import { MAP_PALETTE, useTheme } from "@/lib/mapTheme";
import RouteMap, { CATEGORY_COLORS, CATEGORY_LABELS } from "@/components/RouteMap";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
type StopMarker = { lat: number; lon: number; label?: string };

type Props = {
  dayTracks?: TrackPoint[][][] | null;
  track?: TrackPoint[] | null;
  categorizedTrack?: CategorizedSegment[] | null;
  stopMarker?: StopMarker;
  waypointCount?: number;
  geo?: React.ComponentProps<typeof RouteMap>["geo"];
};

export default function InteractiveMap({
  dayTracks,
  track,
  categorizedTrack,
  stopMarker,
  waypointCount = 0,
  geo,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const hasData =
    (categorizedTrack?.length ?? 0) > 0 || (dayTracks?.length ?? 0) > 0 || (track?.length ?? 0) > 1;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    API_KEY && hasData ? "loading" : "error"
  );

  useEffect(() => {
    if (!API_KEY || !mapRef.current) return;
    const pal = MAP_PALETTE[theme];

    const hasCategorized = categorizedTrack && categorizedTrack.length > 0;
    const days: TrackPoint[][][] = dayTracks?.length
      ? dayTracks
      : track && track.length > 1
      ? [[track]]
      : [];
    if (!hasCategorized && days.length === 0) return;

    setOptions({ key: API_KEY, v: "weekly" });

    importLibrary("maps")
      .then(async () => {
        await importLibrary("marker");
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          styles: pal.styles as google.maps.MapTypeStyle[],
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        });

        const bounds = new google.maps.LatLngBounds();

        if (hasCategorized) {
          categorizedTrack!.forEach((seg) => {
            const path = seg.points.map((p) => ({ lat: p.lat, lng: p.lon }));
            const isTransport = seg.category === "transport";
            new google.maps.Polyline({
              path,
              strokeColor: pal.category[seg.category],
              strokeOpacity: isTransport ? 0.55 : 0.9,
              strokeWeight: isTransport ? 2 : 3,
              icons: isTransport
                ? [
                    {
                      icon: { path: "M 0,-1 0,1", strokeOpacity: 0.6, scale: 3 },
                      offset: "0",
                      repeat: "14px",
                    },
                  ]
                : undefined,
              map,
            });
            path.forEach((p) => bounds.extend(p));
          });
        } else {
          days.forEach((segments, dayIndex) => {
            const color = pal.dayColors[dayIndex % pal.dayColors.length];
            segments.forEach((seg) => {
              const path = seg.map((p) => ({ lat: p.lat, lng: p.lon }));
              new google.maps.Polyline({
                path,
                strokeColor: color,
                strokeOpacity: 0.9,
                strokeWeight: 3,
                map,
              });
              path.forEach((p) => bounds.extend(p));
            });
          });

          const firstPoint = days[0][0][0];
          const lastDaySegments = days[days.length - 1];
          const lastSeg = lastDaySegments[lastDaySegments.length - 1];
          const lastPoint = lastSeg[lastSeg.length - 1];

          new google.maps.Marker({
            position: { lat: firstPoint.lat, lng: firstPoint.lon },
            map,
            label: { text: "1", color: pal.startLabel, fontSize: "11px", fontWeight: "700" },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: pal.startFill,
              fillOpacity: 1,
              strokeWeight: 0,
            },
          });
          new google.maps.Marker({
            position: { lat: lastPoint.lat, lng: lastPoint.lon },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: pal.endFill,
              fillOpacity: 1,
              strokeColor: pal.endStroke,
              strokeWeight: 2,
            },
          });
        }

        if (stopMarker) {
          new google.maps.Marker({
            position: { lat: stopMarker.lat, lng: stopMarker.lon },
            map,
            title: stopMarker.label,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: pal.endFill,
              fillOpacity: 1,
              strokeColor: pal.stopStroke,
              strokeWeight: 2.5,
            },
          });
          bounds.extend({ lat: stopMarker.lat, lng: stopMarker.lon });
        }

        map.fitBounds(bounds, 24);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  if (status === "error") {
    return (
      <RouteMap
        track={track ?? null}
        dayTracks={dayTracks}
        categorizedTrack={categorizedTrack}
        waypointCount={waypointCount}
        stopMarker={stopMarker}
        geo={geo}
      />
    );
  }

  const usedCategories = categorizedTrack
    ? [...new Set(categorizedTrack.map((s) => s.category))]
    : [];

  return (
    <div>
      <div
        ref={mapRef}
        className="interactive-map"
        style={{ opacity: status === "ready" ? 1 : 0 }}
        role="img"
        aria-label="Интерактивная карта трека"
      />
      {usedCategories.length > 0 && (
        <div className="track-legend">
          {usedCategories.map((cat) => (
            <span key={cat} className="track-legend__item">
              <span
                className="track-legend__swatch"
                style={{
                  borderColor: CATEGORY_COLORS[cat],
                  borderStyle: cat === "transport" ? "dashed" : "solid",
                }}
              />
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
