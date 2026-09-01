import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getTripBySlug, getAdjacentTrips } from "@/lib/trips";
import DailyKmChart from "@/components/DailyKmChart";
import RouteMap from "@/components/RouteMap";
import AuthorBlock from "@/components/AuthorBlock";
import ParticipantsLine from "@/components/ParticipantsLine";

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

  const { prev, next } = getAdjacentTrips(slug);
  const hasReport = !trip.placeholder;

  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <article>
        <div className="trip-hero">
          {trip.country && <p className="trip-hero__country">{trip.country}</p>}
          <h1 className="trip-hero__title">{trip.title}</h1>
          {trip.subtitle && <p className="trip-hero__subtitle">{trip.subtitle}</p>}
          {trip.dates && <p className="trip-hero__dates">{trip.dates}</p>}
        </div>

        {!hasReport ? (
          <p className="empty-state">Отчёт об этой поездке ещё готовится.</p>
        ) : (
          <>
            <div className="route-map">
              <RouteMap track={trip.track} waypointCount={trip.route.length} />
              {trip.gpxUrl && (
                <a
                  href={trip.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="route-map__caption"
                >
                  GPX-трек ↗
                </a>
              )}
            </div>

            <div className="stat-strip">
              {typeof trip.distanceKm === "number" && (
                <div className="stat">
                  <span className="stat__value">{trip.distanceKm}</span>
                  <span className="stat__label">километров</span>
                </div>
              )}
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

            {trip.dailyKm?.length ? (
              <div className="chart-block">
                <DailyKmChart dailyKm={trip.dailyKm} />
                <p className="chart-block__label">километраж по дням</p>
              </div>
            ) : null}

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

            <ParticipantsLine names={trip.participants} count={trip.participantCount} />

            <div className="trip-body">
              {trip.sections.map((section, i) => (
                <div key={i} className="trip-section">
                  <AuthorBlock authorSlug={section.authorSlug} />
                  <div dangerouslySetInnerHTML={{ __html: section.html }} />
                </div>
              ))}
            </div>
          </>
        )}
      </article>

      <nav className="trip-pager">
        {prev ? (
          <Link href={`/trips/${prev.slug}`} className="trip-pager__link trip-pager__link--prev">
            <span className="trip-pager__arrow">←</span>
            <span>
              <span className="trip-pager__label">Предыдущий отчёт</span>
              <span className="trip-pager__title">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/trips/${next.slug}`} className="trip-pager__link trip-pager__link--next">
            <span>
              <span className="trip-pager__label">Следующий отчёт</span>
              <span className="trip-pager__title">{next.title}</span>
            </span>
            <span className="trip-pager__arrow">→</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
