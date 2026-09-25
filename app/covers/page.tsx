import type { Metadata } from "next";
import { getAllTrips } from "@/lib/trips";
import CoverPicker from "@/components/CoverPicker";

export const metadata: Metadata = {
  title: "Выбор обложек — Велотрипы",
  robots: { index: false, follow: false },
};

export default function CoversPage() {
  const trips = getAllTrips()
    .filter((t) => !t.placeholder)
    .map((t) => ({ slug: t.slug, year: t.year, title: t.title, cover: t.cover ?? "", photos: t.photos }));
  return (
    <div className="wrap wrap--wide">
      <div className="trip-hero page-head">
        <h1 className="trip-hero__title">Выбор обложек</h1>
        <p className="trip-hero__subtitle">
          Нажмите на фото, которое станет обложкой поездки. Когда закончите, скопируйте список внизу и
          пришлите его в чат.
        </p>
      </div>
      <CoverPicker trips={trips} />
    </div>
  );
}
