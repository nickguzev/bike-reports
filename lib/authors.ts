export type Author = {
  slug: string;
  name: string;
  initials: string;
};

export const AUTHORS: Record<string, Author> = {
  zhenyok: { slug: "zhenyok", name: "Женёк", initials: "ЖК" },
  kirill: { slug: "kirill", name: "Кирилл", initials: "КП" },
  kolya: { slug: "kolya", name: "Коля", initials: "КГ" },
};

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS[slug];
}
