import Link from "next/link";
import type { Trip } from "@/lib/trips";

type Props = {
  prev: Trip | null;
  next: Trip | null;
  compact?: boolean;
};

export default function TripPager({ prev, next, compact = false }: Props) {
  if (compact) {
    return (
      <nav className="trip-pager-compact">
        {prev ? (
          <Link href={`/trips/${prev.slug}`} className="trip-pager-compact__link">
            ← {prev.year}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/trips/${next.slug}`} className="trip-pager-compact__link">
            {next.year} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    );
  }

  return (
    <nav className="trip-pager">
      {prev ? (
        <Link href={`/trips/${prev.slug}`} className="trip-pager__link trip-pager__link--prev">
          <span className="trip-pager__arrow">←</span>
          <span>
            <span className="trip-pager__label">Предыдущий отчёт</span>
            <span className="trip-pager__title">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/trips/${next.slug}`} className="trip-pager__link trip-pager__link--next">
          <span>
            <span className="trip-pager__label">Следующий отчёт</span>
            <span className="trip-pager__title">{next.title}</span>
          </span>
          <span className="trip-pager__arrow">→</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
