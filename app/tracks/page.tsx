import Link from "next/link";
import type { Metadata } from "next";
import { getAllTrips } from "@/lib/trips";
import { getOriginalTracksForSlug, formatFileSize } from "@/lib/originalTracks";

export const metadata: Metadata = {
  title: "Архив треков — Велотрипы",
  description: "Оригинальные, необработанные файлы треков по всем поездкам — для скачивания и переиспользования.",
};

export default function TracksArchivePage() {
  const trips = getAllTrips()
    .map((trip) => ({ trip, files: getOriginalTracksForSlug(trip.slug) }))
    .filter((x) => x.files.length > 0);

  const totalSize = trips.reduce(
    (sum, { files }) => sum + files.reduce((s, f) => s + f.size, 0),
    0
  );
  const totalFiles = trips.reduce((sum, { files }) => sum + files.length, 0);

  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>

      <div className="trip-hero">
        <h1 className="trip-hero__title">Архив треков</h1>
        <p className="trip-hero__subtitle">
          Оригинальные файлы в том виде, в каком они были присланы — без обрезки точек,
          с полной высотой и временными метками. То, что видно на картах по трипам —
          это уже упрощённая версия для быстрой отрисовки; здесь — исходники.
        </p>
        <p className="chart-block__label">
          {totalFiles} файлов · {formatFileSize(totalSize)} суммарно
        </p>
      </div>

      <div className="tracks-archive">
        {trips.map(({ trip, files }) => (
          <div key={trip.slug} className="tracks-archive__trip">
            <div className="tracks-archive__trip-header">
              <Link href={`/trips/${trip.slug}`} className="tracks-archive__trip-title">
                {trip.year} — {trip.title}
              </Link>
            </div>
            <ul className="tracks-archive__file-list">
              {files.map((f) => (
                <li key={f.filename}>
                  <a href={`/original-tracks/${trip.slug}/${f.filename}`} download>
                    {f.label}
                  </a>
                  <span className="tracks-archive__file-meta">
                    {f.filename} · {formatFileSize(f.size)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
