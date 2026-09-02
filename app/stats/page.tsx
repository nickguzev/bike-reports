import Link from "next/link";
import { getSiteStats, getTripRankings, getAllTripTracks, getDailyKmTrend } from "@/lib/stats";
import { getAllPeople } from "@/lib/people";
import AllTracksMap from "@/components/AllTracksMap";
import KmTrendChart from "@/components/KmTrendChart";

export default function StatsPage() {
  const stats = getSiteStats();
  const rankings = getTripRankings();
  const tracks = getAllTripTracks();
  const trend = getDailyKmTrend();
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
          Все треки на одной карте и разбивка по поездкам и участникам.
        </p>
      </div>

      <AllTracksMap tracks={tracks} />

      <div className="stat-strip">
        <div className="stat">
          <span className="stat__value">{stats.tripCount}</span>
          <span className="stat__label">поездок</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.totalKm}</span>
          <span className="stat__label">км</span>
        </div>
        {stats.totalElevation > 0 && (
          <div className="stat">
            <span className="stat__value">{(stats.totalElevation / 1000).toFixed(1)}</span>
            <span className="stat__label">км набора высоты</span>
          </div>
        )}
        <div className="stat">
          <span className="stat__value">{stats.peopleCount}</span>
          <span className="stat__label">участников</span>
        </div>
      </div>

      <h2 className="section-title">Рейтинги поездок</h2>
      <div className="ranking-grid">
        <RankingBlock
          title="По продолжительности"
          items={rankings.byDuration.slice(0, 5).map((t) => ({
            slug: t.slug,
            label: t.title,
            value: `${t.days} дн.`,
          }))}
        />
        <RankingBlock
          title="По суммарному километражу"
          items={rankings.byDistance.slice(0, 5).map((t) => ({
            slug: t.slug,
            label: t.title,
            value: `${t.distanceKm} км`,
          }))}
        />
        <RankingBlock
          title="По среднему км/день"
          items={rankings.byAvgKmPerDay.slice(0, 5).map(({ trip, avg }) => ({
            slug: trip.slug,
            label: trip.title,
            value: `${avg} км/д`,
          }))}
        />
        <RankingBlock
          title="По числу стран"
          items={rankings.byCountries.slice(0, 5).map(({ trip, count }) => ({
            slug: trip.slug,
            label: trip.title,
            value: `${count}`,
          }))}
        />
        <RankingBlock
          title="По числу участников"
          items={rankings.byParticipants.slice(0, 5).map((t) => ({
            slug: t.slug,
            label: t.title,
            value: `${t.participants.length}`,
          }))}
        />
      </div>

      <h2 className="section-title">Километраж по дням</h2>
      <KmTrendChart points={trend} />

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

function RankingBlock({
  title,
  items,
}: {
  title: string;
  items: { slug: string; label: string; value: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="ranking-block">
      <p className="ranking-block__title">{title}</p>
      <ol className="ranking-block__list">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/trips/${item.slug}`}>{item.label}</Link>
            <span>{item.value}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
