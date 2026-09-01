import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getTripBySlug } from "@/lib/trips";
import DailyKmChart from "@/components/DailyKmChart";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let trip;
  try {
    trip = getTripBySlug(slug);
  } catch {
    notFound();
  }
  if (!trip) notFound();

  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <article>
        <div className="trip-hero">
          <p className="trip-hero__eyebrow">
            {trip.country} · {trip.dates}
          </p>
          <h1 className="trip-hero__title">{trip.title}</h1>
          {trip.subtitle && <p className="trip-hero__subtitle">{trip.subtitle}</p>}
        </div>

        <div className="stat-strip">
          <div className="stat">
            <span className="stat__value">{trip.distanceKm}</span>
            <span className="stat__label">километров</span>
          </div>
          {trip.elevationM ? (
            <div className="stat">
              <span className="stat__value">{trip.elevationM}</span>
              <span className="stat__label">метров набора</span>
            </div>
          ) : null}
          {trip.dailyKm?.length ? (
            <div className="stat">
              <span className="stat__value">{trip.dailyKm.length}</span>
              <span className="stat__label">ходовых дней</span>
            </div>
          ) : null}
          {typeof trip.punctures === "number" ? (
            <div className="stat">
              <span className="stat__value">{trip.punctures}</span>
              <span className="stat__label">проколов</span>
            </div>
          ) : null}
          {typeof trip.lostBikes === "number" && trip.lostBikes > 0 ? (
            <div className="stat">
              <span className="stat__value">{trip.lostBikes}</span>
              <span className="stat__label">потерянных велосипеда</span>
            </div>
          ) : null}
        </div>

        {trip.route?.length ? (
          <p className="route-line">
            {trip.route.map((point, i) => (
              <span key={i}>
                <strong>{point}</strong>
                {i < trip.route.length - 1 ? " → " : ""}
              </span>
            ))}
          </p>
        ) : null}

        {trip.dailyKm?.length ? (
          <div className="chart-block">
            <DailyKmChart dailyKm={trip.dailyKm} />
            <p className="chart-block__label">километраж по дням</p>
          </div>
        ) : null}

        <div
          className="trip-body"
          dangerouslySetInnerHTML={{ __html: trip.contentHtml }}
        />

        <div className="photo-empty">Фотографии этой поездки восстанавливаются с форума — скоро появятся здесь.</div>

        <div className="trip-footer">
          {trip.participants?.length ? (
            <div className="trip-footer__block">
              <p className="trip-footer__label">участники</p>
              <p className="trip-footer__value">{trip.participants.join(", ")}</p>
            </div>
          ) : null}
          {trip.gpxUrl ? (
            <div className="trip-footer__block">
              <p className="trip-footer__label">трек</p>
              <p className="trip-footer__value">
                <a href={trip.gpxUrl} target="_blank" rel="noopener noreferrer">
                  {trip.gpxUrl}
                </a>
              </p>
            </div>
          ) : null}
          {trip.source ? (
            <div className="trip-footer__block">
              <p className="trip-footer__label">источник</p>
              <p className="trip-footer__value">
                <a href={trip.source} target="_blank" rel="noopener noreferrer">
                  форум Винского
                </a>
              </p>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
