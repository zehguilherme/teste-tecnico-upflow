import { Suspense } from "react";
import { connection } from "next/server";
import { MovieCatalog } from "@/components/MovieCatalog";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import {
  getMovieGenres,
  getPopularMovies,
  TmdbApiError,
  type MovieCardData,
  type MovieGenre,
} from "@/lib/tmdb";

async function PopularMovies() {
  await connection();
  let movies: MovieCardData[] = [];
  let genres: MovieGenre[] = [];
  let errorMessage: string | undefined;
  try {
    [movies, genres] = await Promise.all([
      getPopularMovies(process.env.TMDB_ACCESS_TOKEN),
      getMovieGenres(process.env.TMDB_ACCESS_TOKEN),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof TmdbApiError
        ? error.message
        : "Não foi possível carregar os filmes. Tente novamente mais tarde.";
  }
  return (
    <MovieCatalog
      initialMovies={movies}
      initialGenres={genres}
      initialError={errorMessage}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pb-16 pt-8 sm:px-8 sm:pt-9">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Filmes populares
      </h1>
      <Suspense fallback={<LoadingOverlay />}>
        <PopularMovies />
      </Suspense>
    </main>
  );
}
