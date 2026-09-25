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
    subtitle: trip.subtitle,
    meta: trip.routeSummary || trip.country,
    dates: trip.dates,
    cover: trip.cover,
    placeholder: trip.placeholder,
    distanceKm: trip.distanceKm,
    days: trip.days ?? (trip.dailyKm?.length || undefined),
    participants: trip.participants,
    countries: (trip.country || "").split("·").map((s) => s.trim()).filter(Boolean),
  }));

  return (
    <div className="wrap wrap--wide">
      <h1 className="home-title">
        <span className="home-title__main">Велотрипы</span>
        <span className="home-title__years">
          {min}–{max}
        </span>
      </h1>

      <nav className="home-links" aria-label="Разделы">
        <Link href="/stats" className="home-stats-link">
          Карта и статистика всех поездок →
        </Link>
        <Link href="/people" className="home-stats-link">
          Единовеломышленники →
        </Link>
        <Link href="/tracks" className="home-stats-link">
          Архив треков →
        </Link>
      </nav>

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
