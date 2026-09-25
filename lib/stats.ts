import { getAllTrips, type Trip } from "@/lib/trips";
import { getAllPeople } from "@/lib/people";
import { getTrackForSlug, getDayTracksForSlug, getCategorizedTrackForSlug, type TrackPoint } from "@/lib/gpx";
import type { TripTrack } from "@/components/AllTracksMap";

export function getSiteStats() {
  const trips = getAllTrips();
  const realTrips = trips.filter((t) => !t.placeholder);
  const people = getAllPeople();

  const totalKm = realTrips.reduce((sum, t) => sum + (t.distanceKm ?? 0), 0);
  const totalElevation = realTrips.reduce((sum, t) => sum + (t.elevationM ?? 0), 0);
  const tripsWithKm = realTrips.filter((t) => typeof t.distanceKm === "number");
  const longestTrip = tripsWithKm.length
    ? tripsWithKm.reduce((a, b) => ((b.distanceKm ?? 0) > (a.distanceKm ?? 0) ? b : a))
    : null;

  return {
    tripCount: trips.length,
    reportedTripCount: realTrips.length,
    totalKm,
    totalElevation,
    peopleCount: people.length,
    longestTrip,
  };
}

function countryCount(trip: Trip): number {
  if (!trip.country) return 0;
  return trip.country.split("·").map((s) => s.trim()).filter(Boolean).length;
}

export function getTripRankings() {
  const trips = getAllTrips().filter((t) => !t.placeholder);

  const byDuration = trips
    .filter((t) => typeof t.days === "number" && t.days > 0)
    .sort((a, b) => (b.days ?? 0) - (a.days ?? 0));

  const byDistance = trips
    .filter((t) => typeof t.distanceKm === "number")
    .sort((a, b) => (b.distanceKm ?? 0) - (a.distanceKm ?? 0));

  const byAvgKmPerDay = trips
    .filter((t) => typeof t.distanceKm === "number" && typeof t.days === "number" && t.days > 0)
    .map((t) => ({ trip: t, avg: Math.round((t.distanceKm! / t.days!) * 10) / 10 }))
    .sort((a, b) => b.avg - a.avg);

  const byCountries = trips
    .map((t) => ({ trip: t, count: countryCount(t) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const byParticipants = trips
    .filter((t) => t.participants.length > 0)
    .sort((a, b) => b.participants.length - a.participants.length);

  return { byDuration, byDistance, byAvgKmPerDay, byCountries, byParticipants };
}

/** Flattened single-line tracks for every trip that has real GPS data, for the overview map. */
export function getAllTripTracks(): TripTrack[] {
  const trips = getAllTrips().filter((t) => !t.placeholder);
  const result: TripTrack[] = [];

  for (const t of trips) {
    const dayTracks = getDayTracksForSlug(t.slug);
    const single = getTrackForSlug(t.slug);
    const categorized = getCategorizedTrackForSlug(t.slug);
    let points: TrackPoint[] = [];

    if (dayTracks) {
      points = dayTracks.flat(2);
    } else if (single) {
      points = single;
    } else if (categorized) {
      points = categorized.filter((s) => s.category === "cycling").flatMap((s) => s.points);
    }

    if (points.length > 1) {
      result.push({ slug: t.slug, title: t.title, year: t.year, points });
    }
  }

  return result;
}

/** How many times each country has been visited, across every trip. */
export function getCountryVisits(): { country: string; count: number }[] {
  const trips = getAllTrips().filter((t) => !t.placeholder && t.country);
  const counts = new Map<string, number>();

  for (const t of trips) {
    const countries = t.country
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean)
      // the country field is repurposed as a plain description for at least
      // one trip ("из Выборга в Санкт-Петербург") — real country names are
      // always capitalized, so skip anything that isn't.
      .filter((s) => s[0] === s[0].toUpperCase() && s[0] !== s[0].toLowerCase());
    for (const c of countries) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country, "ru"));
}

/**
 * One point per riding day across every trip, in chronological order, for a
 * "is the average daily distance trending up?" chart. Trips without a per-day
 * breakdown get their total distance split evenly across their days
 * (flagged as estimated so the chart can show them differently).
 */
export function getDailyKmTrend(): { label: string; km: number; estimated?: boolean }[] {
  const trips = [...getAllTrips()]
    .filter(
      (t) =>
        !t.placeholder &&
        (t.dailyKm?.length || (typeof t.distanceKm === "number" && (t.days ?? 0) > 0))
    )
    .sort((a, b) => a.year - b.year || (a.order ?? 0) - (b.order ?? 0));

  const points: { label: string; km: number; estimated?: boolean }[] = [];
  for (const t of trips) {
    if (t.dailyKm?.length) {
      t.dailyKm.forEach((km, i) => points.push({ label: `${t.year}·${i + 1}`, km }));
    } else {
      const days = t.days!;
      const avg = Math.round((t.distanceKm! / days) * 10) / 10;
      for (let i = 0; i < days; i++) {
        points.push({ label: `${t.year}·${i + 1}`, km: avg, estimated: true });
      }
    }
  }
  return points;
}
