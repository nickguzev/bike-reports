import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getAllSlugs, getTripBySlug, getAdjacentTrips } from "@/lib/trips";
import DailyKmChart from "@/components/DailyKmChart";
import InteractiveMap from "@/components/InteractiveMap";
import AuthorBlock from "@/components/AuthorBlock";
import ParticipantsLine from "@/components/ParticipantsLine";
import TripPager from "@/components/TripPager";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const trip = getTripBySlug(slug);
    return {
      title: `${trip.title} (${trip.year}) — Велотрипы`,
      description: trip.subtitle || `Отчёт о велопоездке: ${trip.title}, ${trip.year}`,
    };
  } catch {
    return { title: "Поездка — Велотрипы" };
  }
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

  return (
    <div className="wrap">
      <div className="trip-top-nav">
        <Link href="/" className="trip-back">
          ← Все поездки
        </Link>
        <TripPager prev={prev} next={next} compact />
      </div>

      <article>
        <div className="trip-hero">
          {trip.country && <p className="trip-hero__country">{trip.country}</p>}
          <h1 className="trip-hero__title">{trip.title}</h1>
          {trip.subtitle && <p className="trip-hero__subtitle">{trip.subtitle}</p>}
          {trip.routeSummary && <p className="trip-hero__route">{trip.routeSummary}</p>}
          {trip.dates && <p className="trip-hero__dates">{trip.dates}</p>}
        </div>

        {trip.placeholder && !trip.route?.length && !trip.track && !trip.dayTracks && !trip.categorizedTrack && !trip.distanceKm && trip.sections.every((s) => !s.html.trim()) ? (
          <p className="empty-state">Отчёт об этой поездке ещё готовится.</p>
        ) : (
          <>
            {(trip.track || trip.dayTracks || trip.categorizedTrack || trip.route?.length) ? (
              <div className="route-map">
                <InteractiveMap
                  track={trip.track}
                  dayTracks={trip.dayTracks}
                  categorizedTrack={trip.categorizedTrack}
                  waypointCount={trip.route.length}
                  stopMarker={trip.overnightStop}
                  geo={trip.geo}
                />
                {(trip.track || trip.dayTracks || trip.categorizedTrack) && (
                  <a
                    href={`/tracks/${trip.slug}.gpx`}
                    download
                    className="route-map__caption"
                  >
                    Скачать трек (GPX) ↓
                  </a>
                )}
                {trip.gpxUrl && (
                  <a
                    href={trip.gpxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="route-map__caption"
                  >
                    Источник трека ↗
                  </a>
                )}
              </div>
            ) : null}

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
              {trip.days ?? trip.dailyKm?.length ? (
                <div className="stat">
                  <span className="stat__value">{trip.days ?? trip.dailyKm.length}</span>
                  <span className="stat__label">дней</span>
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

            {trip.placeholder ? (
              <p className="empty-state">Текст отчёта в процессе — участники дописывают воспоминания.</p>
            ) : (
              <div className="trip-body">
                {trip.sections.map((section, i) => (
                  <div key={i} className="trip-section">
                    <AuthorBlock authorSlug={section.authorSlug} />
                    <div dangerouslySetInnerHTML={{ __html: section.html }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </article>

      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />

      <TripPager prev={prev} next={next} />
    </div>
  );
}
