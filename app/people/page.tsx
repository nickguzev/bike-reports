import Link from "next/link";
import type { Metadata } from "next";
import { getAllPeople } from "@/lib/people";
import { BIOS } from "@/lib/bios";

export const metadata: Metadata = {
  title: "Единовеломышленники — Велотрипы",
  description: "Кто все эти люди, которые уже полтора десятка лет ездят на великах.",
};

export default function PeopleIndexPage() {
  const people = getAllPeople().sort(
    (a, b) => b.tripCount - a.tripCount || b.totalKm - a.totalKm
  );

  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <div className="trip-hero">
        <h1 className="trip-hero__title">Единовеломышленники</h1>
        <p className="trip-hero__subtitle">
          Компания, на которой всё держится — от письма про фестиваль в 2010-м до
          сегодняшнего дня.
        </p>
      </div>

      <div className="people-index">
        {people.map((person) => (
          <div key={person.slug} className="people-index__card">
            <div className="people-index__header">
              <Link href={`/people/${person.slug}`} className="people-index__name">
                {person.name}
              </Link>
              <span className="people-index__stats">
                {person.tripCount} {pluralTrips(person.tripCount)}
                {person.totalKm > 0 ? ` · ${person.totalKm} км` : ""}
              </span>
            </div>
            {BIOS[person.slug] && (
              <p className="people-index__bio">{BIOS[person.slug]}</p>
            )}
          </div>
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
