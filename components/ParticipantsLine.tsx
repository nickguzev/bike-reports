import Link from "next/link";
import { slugifyName } from "@/lib/slugify";

export default function ParticipantsLine({
  names,
  count,
}: {
  names: string[];
  count?: number;
}) {
  if (names && names.length > 0) {
    return (
      <p className="people-line">
        <span className="people-line__label">участники</span>{" "}
        {names.map((name, i) => (
          <span key={name}>
            <Link href={`/people/${slugifyName(name)}`} className="people-line__link">
              {name}
            </Link>
            {i < names.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
    );
  }

  if (count) {
    return (
      <p className="people-line">
        <span className="people-line__label">участники</span> {count} человек
        (имена пока не восстановлены)
      </p>
    );
  }

  return null;
}
