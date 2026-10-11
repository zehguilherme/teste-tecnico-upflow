import { Suspense } from "react";
import { connection } from "next/server";
import { Input } from "@/components/Input";
import { MovieCard } from "@/components/MovieCard";
import { Select } from "@/components/Select";
import { ErrorModal } from "@/components/ErrorModal";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { getPopularMovies, TmdbApiError } from "@/lib/tmdb";

async function PopularMovies() {
  let movies: Awaited<ReturnType<typeof getPopularMovies>> | null;
  let errorMessage =
    "Não foi possível carregar os filmes. Tente novamente mais tarde.";

  await connection();

  try {
    movies = await getPopularMovies(process.env.TMDB_ACCESS_TOKEN);
  } catch (error) {
    movies = null;
    errorMessage = error instanceof TmdbApiError ? error.message : errorMessage;
  }

  if (movies === null) {
    return <ErrorModal message={errorMessage} />;
  }

  if (movies.length === 0) {
    return <p role="status">Nenhum filme popular encontrado.</p>;
  }

  return (
    <section
      aria-label="Filmes populares"
      className="grid grid-cols-1 gap-x-6 gap-y-6 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          {...movie}
          loading={index < 4 ? "eager" : "lazy"}
        />
      ))}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pb-16 pt-8 sm:px-8 sm:pt-9">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Filmes populares
      </h1>

      <section
        aria-label="Filtros de filmes"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_200px]"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <Input
            id="movie-search"
            name="movie-search"
            type="search"
            disabled
            label="Buscar por título"
            placeholder="Digite o nome de um filme"
          />
        </div>
        <Select
          id="genre"
          name="genre"
          disabled
          label="Gênero"
          defaultValue="all"
          options={[{ label: "Todos", value: "all" }]}
        />
        <Select
          id="sort"
          name="sort"
          disabled
          label="Ordenar por"
          defaultValue="popularity"
          options={[
            { label: "Popularidade", value: "popularity" },
            { label: "Nota", value: "rating" },
            { label: "Data de lançamento", value: "release-date" },
          ]}
        />
      </section>

      <Suspense fallback={<LoadingOverlay />}>
        <PopularMovies />
      </Suspense>
    </main>
  );
}
