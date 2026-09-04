import Link from "next/link";
import { getAllTrips, getYearRange, type Trip } from "@/lib/trips";

export default function Home() {
  const trips = getAllTrips();
  const { min, max } = getYearRange();

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
          <div className="trip-list">
            {trips.map((trip) => (
              <Link
                key={trip.slug}
                href={`/trips/${trip.slug}`}
                className={`trip-row${trip.placeholder ? " trip-row--placeholder" : ""}`}
              >
                <span className="trip-row__year">{trip.year}</span>
                <span>
                  <span className="trip-row__title">{trip.title}</span>
                  <span className="trip-row__meta">{trip.country}</span>
                </span>
                {trip.placeholder ? (
                  <span className="trip-row__soon">скоро анонсируем</span>
                ) : (
                  <span className="trip-row__stats">{statBits(trip)}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function statBits(trip: Trip) {
  const days = trip.days ?? (trip.dailyKm?.length || undefined);
  const peopleCount = trip.participants.length;
  return (
    <>
      {typeof trip.distanceKm === "number" && (
        <span className="trip-row__stat">
          <b>{trip.distanceKm}</b> км
        </span>
      )}
      {days ? (
        <span className="trip-row__stat">
          <b>{days}</b> дн.
        </span>
      ) : null}
      {peopleCount ? (
        <span className="trip-row__stat">
          <b>{peopleCount}</b> уч.
        </span>
      ) : null}
    </>
  );
}
