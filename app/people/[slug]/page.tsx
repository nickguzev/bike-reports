import Link from "next/link";
import { plural, TRIP_FORMS } from "@/lib/plural";
import { notFound } from "next/navigation";
import { getAllPeople, getPersonBySlug } from "@/lib/people";
import { BIOS } from "@/lib/bios";

export function generateStaticParams() {
  return getAllPeople().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);
  return {
    title: person ? `${person.name} — Велотрипы` : "Участник — Велотрипы",
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);
  if (!person) notFound();

  return (
    <div className="wrap">
      <Link href="/people" className="trip-back">
        ← Все участники
      </Link>

      <div className="trip-hero">
        <h1 className="trip-hero__title">{person.name}</h1>
        {BIOS[person.slug] && <p className="person-bio">{BIOS[person.slug]}</p>}
      </div>

      <div className="stat-strip">
        <div className="stat">
          <span className="stat__value">{person.tripCount}</span>
          <span className="stat__label">
            {plural(person.tripCount, TRIP_FORMS)}
          </span>
        </div>
        {person.totalKm > 0 && (
          <div className="stat">
            <span className="stat__value">{person.totalKm}</span>
            <span className="stat__label">суммарных километров</span>
          </div>
        )}
      </div>

      <div className="trip-list">
        {person.trips
          .slice()
          .sort((a, b) => b.year - a.year)
          .map((trip) => (
            <Link key={trip.slug} href={`/trips/${trip.slug}`} className="trip-row">
              <span className="trip-row__year">{trip.year}</span>
              <span>
                <span className="trip-row__title">{trip.title}</span>
                <span className="trip-row__meta">{trip.routeSummary || trip.country}</span>
              </span>
              <span />
            </Link>
          ))}
      </div>
    </div>
  );
}

