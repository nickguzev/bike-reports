import Link from "next/link";
import { getSiteStats } from "@/lib/stats";

export default function StatsPage() {
  const stats = getSiteStats();

  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <div className="trip-hero">
        <h1 className="trip-hero__title">Карта и статистика</h1>
        <p className="trip-hero__subtitle">
          Раздел в разработке: общая карта со всеми треками и разбивка по поездкам,
          участникам, высоте и рекордам.
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

      <p className="empty-state">
        Общая карта маршрутов и подробная аналитика по годам, людям и дням появятся
        здесь по мере наполнения архива.
      </p>
    </div>
  );
}
