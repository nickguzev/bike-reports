import { getAllTrips, type Trip } from "@/lib/trips";
import { getAllPeople } from "@/lib/people";

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

  return { byDuration, byDistance, byAvgKmPerDay, byCountries };
}
