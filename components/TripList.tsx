"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type View = "banner" | "cards" | "rows";
const VIEW_KEY = "trip-list-view";
const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: "banner", label: "Развёрнутый вид", icon: "M3 4h18v7H3zM3 14h18v6H3z" },
  { id: "cards", label: "Карточки", icon: "M3 4h8v7H3zM13 4h8v7h-8zM3 13h8v7H3zM13 13h8v7h-8z" },
  { id: "rows", label: "Список", icon: "M3 5h18v2.5H3zM3 10.75h18v2.5H3zM3 16.5h18V19H3z" },
];

function Stats({ trip, short }: { trip: TripListItem; short?: boolean }) {
  return (
    <>
      {typeof trip.distanceKm === "number" && (
        <span>
          <b>{trip.distanceKm}</b> км
        </span>
      )}
      {trip.days ? (
        <span>
          <b>{trip.days}</b> {short ? "дн." : plural(trip.days, ["день", "дня", "дней"])}
        </span>
      ) : null}
      {trip.participants.length ? (
        <span>
          <b>{trip.participants.length}</b>{" "}
          {short ? "уч." : plural(trip.participants.length, ["участник", "участника", "участников"])}
        </span>
      ) : null}
    </>
  );
}

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
  const [view, setView] = useState<View>("banner");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "banner" || saved === "cards" || saved === "rows") setView(saved);
    } catch {
      /* no storage — default view */
    }
  }, []);

  const pickView = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

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
        <div className="view-switch" role="group" aria-label="Вид списка">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`view-switch__btn${view === v.id ? " view-switch__btn--on" : ""}`}
              aria-pressed={view === v.id}
              aria-label={v.label}
              title={v.label}
              onClick={() => pickView(v.id)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d={v.icon} fill="currentColor" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="empty-state">Таких поездок пока не было — но всё впереди.</p>
      ) : view === "rows" ? (
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
                  <Stats trip={trip} short />
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : view === "cards" ? (
        <div className="card-grid">
          {shown.map((trip) => (
            <Link
              key={trip.slug}
              href={`/trips/${trip.slug}`}
              className={`trip-card${trip.placeholder ? " trip-card--soon" : ""}`}
            >
              <div className={`trip-card__cover${trip.cover ? "" : " trip-card__cover--empty"}`}>
                {trip.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={trip.cover} alt="" loading="lazy" />
                ) : (
                  <span className="trip-card__cover-text">
                    {trip.placeholder ? "скоро анонсируем" : trip.meta}
                  </span>
                )}
                <span className="trip-card__year">{trip.year}</span>
              </div>
              <span className="trip-card__title">{trip.title}</span>
              {trip.subtitle && <span className="trip-card__sub">{trip.subtitle}</span>}
              {!trip.placeholder && (
                <span className="trip-card__meta">
                  <Stats trip={trip} short />
                </span>
              )}
            </Link>
          ))}
        </div>
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
                    <Stats trip={trip} />
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
