"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { plural, TRIP_FORMS } from "@/lib/plural";

export type TripListItem = {
  slug: string;
  year: number;
  title: string;
  subtitle?: string;
  meta: string;
  dates?: string;
  cover?: string;
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
          <select id="filter-person" value={person} onChange={(e) => setPerson(e.target.value)}>
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
          <select id="filter-country" value={country} onChange={(e) => setCountry(e.target.value)}>
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
        <div className="banner-list">
          {shown.map((trip) => (
            <Link
              key={trip.slug}
              href={`/trips/${trip.slug}`}
              className={`trip-banner${trip.placeholder ? " trip-banner--soon" : ""}`}
            >
              <div className={`trip-banner__media${trip.cover ? "" : " trip-banner__media--empty"}`}>
                {trip.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={trip.cover} alt="" loading="lazy" className="trip-banner__img" />
                )}
                <div className="trip-banner__shade" />
                <div className="trip-banner__overlay">
                  <span className="kicker">
                    {trip.year}
                    {trip.dates && !trip.placeholder ? ` · ${trip.dates}` : ""}
                  </span>
                  <span className="trip-banner__title">{trip.title}</span>
                  {trip.subtitle && <span className="trip-banner__subtitle">{trip.subtitle}</span>}
                  {trip.placeholder && <span className="trip-banner__subtitle">скоро анонсируем</span>}
                </div>
              </div>
              {!trip.placeholder && (
                <div className="trip-banner__details">
                  <span className="trip-banner__route">{trip.meta}</span>
                  <span className="trip-banner__stats">
                    {typeof trip.distanceKm === "number" && (
                      <span>
                        <b>{trip.distanceKm}</b> км
                      </span>
                    )}
                    {trip.days ? (
                      <span>
                        <b>{trip.days}</b> {plural(trip.days, ["день", "дня", "дней"])}
                      </span>
                    ) : null}
                    {trip.participants.length ? (
                      <span>
                        <b>{trip.participants.length}</b>{" "}
                        {plural(trip.participants.length, ["участник", "участника", "участников"])}
                      </span>
                    ) : null}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
