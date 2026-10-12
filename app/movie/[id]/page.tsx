import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { ErrorModal } from "@/components/ErrorModal";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { getMovieDetails, TmdbApiError } from "@/lib/tmdb";

async function MovieDetails({
  params,
}: Pick<PageProps<"/movie/[id]">, "params">) {
  const { id } = await params;
  let movie: Awaited<ReturnType<typeof getMovieDetails>>;

  try {
    movie = await getMovieDetails(id, process.env.TMDB_ACCESS_TOKEN);
  } catch (error) {
    return (
      <ErrorModal
        message={
          error instanceof TmdbApiError
            ? error.message
            : "Não foi possível carregar os detalhes do filme. Tente novamente mais tarde."
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] lg:gap-10">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-xl bg-placeholder lg:mx-0">
        {movie.poster ? (
          <Image
            src={movie.poster}
            alt={`Pôster de ${movie.title}`}
            fill
            priority
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 320px, calc(100vw - 2rem)"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm text-muted">
            Pôster
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {movie.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {movie.year} · {movie.duration} ·{" "}
          {movie.genres.length
            ? movie.genres.join(", ")
            : "Gêneros não informados"}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground">
            Nota {movie.rating}
          </span>
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-background"
          >
            <HeartIcon />
            Adicionar aos favoritos
          </button>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-foreground">Sinopse</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {movie.synopsis}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-foreground">
            Elenco principal
          </h2>
          {movie.cast.length ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {movie.cast.map((actor) => (
                <article key={actor.id} className="min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-placeholder">
                    {actor.profile ? (
                      <Image
                        src={actor.profile}
                        alt={`Foto de ${actor.name}`}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 20vw, 45vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-2 truncate text-sm font-semibold text-foreground">
                    {actor.name}
                  </h3>
                  <p className="truncate text-sm text-muted">
                    {actor.character}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Elenco não disponível.</p>
          )}
        </section>

        {movie.trailer ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground">Trailer</h2>
            <div className="mt-4 aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface">
              <iframe
                title={`Trailer de ${movie.title}`}
                src={movie.trailer}
                className="size-full"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default function MovieDetailsPage(props: PageProps<"/movie/[id]">) {
  return (
    <main className="px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
      <Link
        href="/"
        className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-sm text-sm text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeftIcon /> Voltar à listagem
      </Link>
      <Suspense fallback={<LoadingOverlay />}>
        <MovieDetails params={props.params} />
      </Suspense>
    </main>
  );
}
