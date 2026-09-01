import Link from "next/link";
import { getChronologicalTrips, getYearRange, type Trip } from "@/lib/trips";
import DailyKmChart from "@/components/DailyKmChart";

export default function Home() {
  const trips = getChronologicalTrips();
  const { min, max } = getYearRange();

  return (
    <div className="wrap">
      <h1 className="home-title">
        <span className="home-title__main">Велотрипы</span>
        <span className="home-title__years">
          {min}–{max}
        </span>
      </h1>

      <Link href="/stats" className="home-stats-link">
        Карта и статистика всех поездок →
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
                  <span className="trip-row__meta">{rowMeta(trip)}</span>
                </span>
                {trip.dailyKm?.length ? (
                  <span className="trip-row__chart">
                    <DailyKmChart dailyKm={trip.dailyKm} compact />
                  </span>
                ) : trip.placeholder ? (
                  <span className="trip-row__soon">скоро</span>
                ) : (
                  <span />
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function rowMeta(trip: Trip): string {
  const parts: string[] = [];
  if (trip.country) parts.push(trip.country);
  if (typeof trip.distanceKm === "number") parts.push(`${trip.distanceKm} км`);
  if (trip.dailyKm?.length) parts.push(`${trip.dailyKm.length} дн.`);
  const peopleCount = trip.participants.length || trip.participantCount;
  if (peopleCount) parts.push(`${peopleCount} ${pluralParticipants(peopleCount)}`);
  return parts.join(" · ");
}

function pluralParticipants(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "участник";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "участника";
  return "участников";
}
