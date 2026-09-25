"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { plural, TRIP_FORMS } from "@/lib/plural";

export type TripListItem = {
  slug: string;
  year: number;
  title: string;
  meta: string;
  placeholder: boolean;
  distanceKm?: number;
  days?: number;
  participants: string[];
  countries: string[];
};

type Option = { value: string; count: number };

function countOptions(items: TripListItem[], pick: (t: TripListItem) => string[]): Option[] {
  const counts = new Map<string, number>();
  for (const t of items) for (const v of pick(t)) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "ru"));
}

export default function TripList({ trips }: { trips: TripListItem[] }) {
  const [person, setPerson] = useState("");
  const [country, setCountry] = useState("");

  const real = useMemo(() => trips.filter((t) => !t.placeholder), [trips]);
  const people = useMemo(() => countOptions(real, (t) => t.participants), [real]);
  const countries = useMemo(() => countOptions(real, (t) => t.countries), [real]);

  const filtering = Boolean(person || country);
  const shown = filtering
    ? real.filter(
        (t) =>
          (!person || t.participants.includes(person)) && (!country || t.countries.includes(country))
      )
    : trips;

  return (
    <>
      <div className="trip-filters">
        <label className="trip-filters__field">
          <span className="trip-filters__label">участник</span>
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            <option value="">все</option>
            {people.map((p) => (
              <option key={p.value} value={p.value}>
                {p.value} ({p.count})
              </option>
            ))}
          </select>
        </label>
        <label className="trip-filters__field">
          <span className="trip-filters__label">страна</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">все</option>
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value} ({c.count})
              </option>
            ))}
          </select>
        </label>
        {filtering && (
          <span className="trip-filters__summary">
            {shown.length} {plural(shown.length, TRIP_FORMS)} ·{" "}
            <button
              type="button"
              className="trip-filters__reset"
              onClick={() => {
                setPerson("");
                setCountry("");
              }}
            >
              сбросить
            </button>
          </span>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="empty-state">Таких поездок пока не было — но всё впереди.</p>
      ) : (
        <div className="trip-list">
          {shown.map((trip) => (
            <Link
              key={trip.slug}
              href={`/trips/${trip.slug}`}
              className={`trip-row${trip.placeholder ? " trip-row--placeholder" : ""}`}
            >
              <span className="trip-row__year">{trip.year}</span>
              <span>
                <span className="trip-row__title">{trip.title}</span>
                <span className="trip-row__meta">{trip.meta}</span>
              </span>
              {trip.placeholder ? (
                <span className="trip-row__soon">скоро анонсируем</span>
              ) : (
                <span className="trip-row__stats">
                  {typeof trip.distanceKm === "number" && (
                    <span className="trip-row__stat">
                      <b>{trip.distanceKm}</b> км
                    </span>
                  )}
                  {trip.days ? (
                    <span className="trip-row__stat">
                      <b>{trip.days}</b> дн.
                    </span>
                  ) : null}
                  {trip.participants.length ? (
                    <span className="trip-row__stat">
                      <b>{trip.participants.length}</b> уч.
                    </span>
                  ) : null}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
