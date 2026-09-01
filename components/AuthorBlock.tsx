import { getAuthor } from "@/lib/authors";

export default function AuthorBlock({ authorSlug }: { authorSlug?: string }) {
  if (!authorSlug) return null;
  const author = getAuthor(authorSlug);
  if (!author) return null;

  return (
    <div className="author-block">
      <span className="avatar" aria-hidden="true">
        {author.initials}
      </span>
      <span className="author-block__name">{author.name} рассказывает:</span>
    </div>
  );
}
