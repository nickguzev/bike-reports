import Link from "next/link";
import { slugifyName } from "@/lib/slugify";

export default function ParticipantsLine({ names }: { names: string[] }) {
  if (!names || names.length === 0) return null;

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
