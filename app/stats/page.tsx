import Link from "next/link";
import { getSiteStats } from "@/lib/stats";
import { getAllPeople } from "@/lib/people";

export default function StatsPage() {
  const stats = getSiteStats();
  const people = getAllPeople().sort(
    (a, b) => b.tripCount - a.tripCount || b.totalKm - a.totalKm
  );

  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <div className="trip-hero">
        <h1 className="trip-hero__title">Карта и статистика</h1>
        <p className="trip-hero__subtitle">
          Общая карта со всеми треками появится здесь позже. Пока — разбивка по
          участникам.
        </p>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <span className="stat__value">{stats.tripCount}</span>
          <span className="stat__label">поездок в архиве</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.totalKm}</span>
          <span className="stat__label">суммарных километров</span>
        </div>
        {stats.totalElevation > 0 && (
          <div className="stat">
            <span className="stat__value">{stats.totalElevation}</span>
            <span className="stat__label">метров набора</span>
          </div>
        )}
        <div className="stat">
          <span className="stat__value">{stats.peopleCount}</span>
          <span className="stat__label">участников</span>
        </div>
        {stats.longestTrip && (
          <div className="stat">
            <span className="stat__value">{stats.longestTrip.distanceKm}</span>
            <span className="stat__label">рекорд — {stats.longestTrip.title}</span>
          </div>
        )}
      </div>

      <h2 className="section-title">Участники</h2>
      <div className="person-list">
        {people.map((person) => (
          <Link key={person.slug} href={`/people/${person.slug}`} className="person-row">
            <span className="person-row__name">{person.name}</span>
            <span className="person-row__trips">
              {person.tripCount} {pluralTrips(person.tripCount)}
            </span>
            <span className="person-row__km">
              {person.totalKm > 0 ? `${person.totalKm} км` : "—"}
            </span>
          </Link>
        ))}
      </div>

      <p className="empty-state">
        Общая карта маршрутов и разбивка по дням появятся здесь по мере наполнения
        архива.
      </p>
    </div>
  );
}

function pluralTrips(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "поездка";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "поездки";
  return "поездок";
}
