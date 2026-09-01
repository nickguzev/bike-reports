import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPeople, getPersonBySlug } from "@/lib/people";

export function generateStaticParams() {
  return getAllPeople().map((p) => ({ slug: p.slug }));
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
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <div className="trip-hero">
        <h1 className="trip-hero__title">{person.name}</h1>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <span className="stat__value">{person.tripCount}</span>
          <span className="stat__label">
            {pluralTrips(person.tripCount)}
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
                <span className="trip-row__meta">{trip.country}</span>
              </span>
              <span />
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
