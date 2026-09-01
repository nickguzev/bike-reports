import { getAllTrips } from "@/lib/trips";
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
