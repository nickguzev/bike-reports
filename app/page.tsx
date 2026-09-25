import Link from "next/link";
import { getAllTrips, getYearRange } from "@/lib/trips";
import TripList, { type TripListItem } from "@/components/TripList";

export default function Home() {
  const trips = getAllTrips();
  const { min, max } = getYearRange();
  const items: TripListItem[] = trips.map((trip) => ({
    slug: trip.slug,
    year: trip.year,
    title: trip.title,
    meta: trip.routeSummary || trip.country,
    placeholder: trip.placeholder,
    distanceKm: trip.distanceKm,
    days: trip.days ?? (trip.dailyKm?.length || undefined),
    participants: trip.participants,
    countries: (trip.country || "").split("·").map((s) => s.trim()).filter(Boolean),
  }));

  return (
    <div className="wrap">
      <a
        href="https://moscross-nickguzev-2002s-projects.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="sibling-project-link"
      >
        Ещё один наш проект — Протыки Москвы →
      </a>

      <h1 className="home-title">
        <span className="home-title__main">Велотрипы</span>
        <span className="home-title__years">
          {min}–{max}
        </span>
      </h1>

      <Link href="/stats" className="home-stats-link">
        Карта и статистика всех поездок →
      </Link>
      <br />
      <Link href="/people" className="home-stats-link">
        Единовеломышленники →
      </Link>
      <br />
      <Link href="/tracks" className="home-stats-link">
        Архив треков →
      </Link>

      <main>
        {trips.length === 0 ? (
          <p className="empty-state">Пока ни одной записи — первая поездка уже готовится.</p>
        ) : (
          <TripList trips={items} />
        )}
      </main>
    </div>
  );
}

