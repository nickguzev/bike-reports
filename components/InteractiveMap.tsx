"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { TrackPoint, CategorizedSegment } from "@/lib/gpx";
import RouteMap, { CATEGORY_COLORS, CATEGORY_LABELS } from "@/components/RouteMap";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DAY_COLORS = ["#c1501b", "#445c3c", "#7c8570", "#8a4b2e", "#5c6b45"];

// Muted "paper" map styling to match the site's palette instead of Google's defaults.
const PAPER_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#ece7d8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7c8570" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ece7d8" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#4c5744" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#c7bd9e" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#ece7d8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e1dac4" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d8cfae" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d6cd" }] },
];

// Google Maps needs real hex colors, not our CSS custom properties.
const CATEGORY_HEX: Record<CategorizedSegment["category"], string> = {
  cycling: "#c1501b",
  hiking: "#445c3c",
  walk: "#a8875a",
  transport: "#7c8570",
};

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
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    API_KEY ? "loading" : "error"
  );

  useEffect(() => {
    if (!API_KEY || !mapRef.current) return;

    const hasCategorized = categorizedTrack && categorizedTrack.length > 0;
    const days: TrackPoint[][][] = dayTracks?.length
      ? dayTracks
      : track && track.length > 1
      ? [[track]]
      : [];
    if (!hasCategorized && days.length === 0) {
      setStatus("error");
      return;
    }

    setOptions({ key: API_KEY, v: "weekly" });

    importLibrary("maps")
      .then(async () => {
        await importLibrary("marker");
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          mapId: "BIKEREPORTS_MAP",
          styles: PAPER_STYLE,
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
              strokeColor: CATEGORY_HEX[seg.category],
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
            const color = DAY_COLORS[dayIndex % DAY_COLORS.length];
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
            label: { text: "1", color: "#ece7d8", fontSize: "11px", fontWeight: "700" },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: "#212f1f",
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
              fillColor: "#ece7d8",
              fillOpacity: 1,
              strokeColor: "#212f1f",
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
              fillColor: "#ece7d8",
              fillOpacity: 1,
              strokeColor: "#445c3c",
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
  }, []);

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
