"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { TrackPoint } from "@/lib/gpx";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const PAPER_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#ece7d8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7c8570" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ece7d8" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#4c5744" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#c7bd9e" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#ece7d8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e1dac4" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d8cfae" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d6cd" }] },
];

export type TripTrack = {
  slug: string;
  title: string;
  year: number;
  points: TrackPoint[]; // flattened, single line is enough for an overview map
};

function colorForIndex(i: number, total: number): string {
  const hue = Math.round((i / Math.max(total, 1)) * 320); // avoid wrapping into near-duplicate reds
  return `hsl(${hue}, 55%, 38%)`;
}

export default function AllTracksMap({ tracks }: { tracks: TripTrack[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    API_KEY ? "loading" : "error"
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const polylines = useRef<Record<string, google.maps.Polyline>>({});

  useEffect(() => {
    if (!API_KEY || !mapRef.current || tracks.length === 0) {
      setStatus("error");
      return;
    }

    setOptions({ key: API_KEY, v: "weekly" });

    importLibrary("maps")
      .then(() => {
        if (!mapRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
          mapId: "BIKEREPORTS_ALL_TRACKS",
          styles: PAPER_STYLE,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
        });

        const bounds = new google.maps.LatLngBounds();

        tracks.forEach((t, i) => {
          const path = t.points.map((p) => ({ lat: p.lat, lng: p.lon }));
          const poly = new google.maps.Polyline({
            path,
            strokeColor: colorForIndex(i, tracks.length),
            strokeOpacity: 0.8,
            strokeWeight: 2.5,
            map,
          });
          polylines.current[t.slug] = poly;
          path.forEach((p) => bounds.extend(p));
        });

        map.fitBounds(bounds, 16);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const [slug, poly] of Object.entries(polylines.current)) {
      const isHovered = hovered === slug;
      poly.setOptions({
        strokeOpacity: hovered ? (isHovered ? 1 : 0.15) : 0.8,
        strokeWeight: isHovered ? 5 : 2.5,
        zIndex: isHovered ? 10 : 1,
      });
    }
  }, [hovered]);

  if (status === "error") {
    return (
      <p className="empty-state">
        Общая карта пока не загрузилась — либо не настроен ключ карт, либо нет ни одного трипа с реальным треком.
      </p>
    );
  }

  return (
    <div className="all-tracks-map">
      <div
        ref={mapRef}
        className="interactive-map interactive-map--tall"
        style={{ opacity: status === "ready" ? 1 : 0 }}
        role="img"
        aria-label="Карта всех треков"
      />
      <div className="all-tracks-legend">
        {tracks.map((t, i) => (
          <Link
            key={t.slug}
            href={`/trips/${t.slug}`}
            className="all-tracks-legend__item"
            onMouseEnter={() => setHovered(t.slug)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="all-tracks-legend__swatch"
              style={{ background: colorForIndex(i, tracks.length) }}
            />
            <span>
              {t.year} — {t.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
