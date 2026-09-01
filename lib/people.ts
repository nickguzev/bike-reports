import { getAllTrips, type Trip } from "@/lib/trips";
import { slugifyName } from "@/lib/slugify";

export type Person = {
  slug: string;
  name: string;
  trips: Trip[];
  tripCount: number;
  totalKm: number;
};

export function getAllPeople(): Person[] {
  const trips = getAllTrips();
  const bySlug = new Map<string, Person>();

  for (const trip of trips) {
    for (const name of trip.participants) {
      const slug = slugifyName(name);
      if (!bySlug.has(slug)) {
        bySlug.set(slug, { slug, name, trips: [], tripCount: 0, totalKm: 0 });
      }
      const person = bySlug.get(slug)!;
      person.trips.push(trip);
      person.tripCount += 1;
      person.totalKm += trip.distanceKm ?? 0;
    }
  }

  return [...bySlug.values()];
}

export function getPersonBySlug(slug: string): Person | undefined {
  return getAllPeople().find((p) => p.slug === slug);
}
