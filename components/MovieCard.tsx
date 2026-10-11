import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@/components/icons/HeartIcon";

type MovieCardProps = {
  id: number;
  title: string;
  rating: string;
  year: string;
  poster?: string;
  loading?: "eager" | "lazy";
  isFavorite?: boolean;
};

export function MovieCard({
  id,
  title,
  rating,
  year,
  poster,
  loading = "lazy",
  isFavorite = false,
}: MovieCardProps) {
  return (
    <article className="relative min-w-0">
      <Link
        href={`/movie/${id}`}
        className="group block rounded-xl transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-placeholder">
          {poster ? (
            <Image
              src={poster}
              alt={`Pôster de ${title}`}
              fill
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 360px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-muted">
              Pôster
            </span>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-background/20 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
        <h2
          className="mt-3 truncate text-base font-semibold text-foreground"
          title={title}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Nota {rating} <span aria-hidden="true">·</span> {year}
        </p>
      </Link>
      <button
        type="button"
        disabled
        aria-label={`${isFavorite ? "Remover dos" : "Adicionar aos"} favoritos: ${title}`}
        className={`absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-background/90 ${isFavorite ? "text-primary" : "text-foreground"} disabled:cursor-not-allowed`}
      >
        <HeartIcon filled={isFavorite} />
      </button>
    </article>
  );
}
