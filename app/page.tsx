import Link from "next/link";
import { getAllTrips, getYearRange } from "@/lib/trips";
import DailyKmChart from "@/components/DailyKmChart";

export default function Home() {
  const trips = getAllTrips();
  const { min, max } = getYearRange();

  return (
    <div className="wrap">
      <header className="site-header">
        <div className="site-header__row">
          <Link href="/" className="wordmark">
            вело<span>журнал</span>
          </Link>
        </div>
      </header>

      <h1 className="home-title">
        Велотрипы {min}–{max}
      </h1>

      <main>
        {trips.length === 0 ? (
          <p className="empty-state">Пока ни одной записи — первая поездка уже готовится.</p>
        ) : (
          <div className="trip-list">
            {trips.map((trip) =>
              trip.placeholder ? (
                <Link
                  key={trip.slug}
                  href={`/trips/${trip.slug}`}
                  className="trip-row trip-row--placeholder"
                >
                  <span className="trip-row__year">{trip.year}</span>
                  <span>
                    <span className="trip-row__title">{trip.title}</span>
                    <span className="trip-row__meta">{trip.country}</span>
                  </span>
                  <span className="trip-row__soon">скоро</span>
                </Link>
              ) : (
                <Link key={trip.slug} href={`/trips/${trip.slug}`} className="trip-row">
                  <span className="trip-row__year">{trip.year}</span>
                  <span>
                    <span className="trip-row__title">{trip.title}</span>
                    <span className="trip-row__meta">
                      {trip.country} · {trip.distanceKm} км · {trip.participants.length}{" "}
                      {pluralParticipants(trip.participants.length)}
                    </span>
                  </span>
                  <span className="trip-row__chart">
                    <DailyKmChart dailyKm={trip.dailyKm} compact />
                  </span>
                </Link>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function pluralParticipants(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "участник";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "участника";
  return "участников";
}
