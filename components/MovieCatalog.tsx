"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { MovieCard } from "@/components/MovieCard";
import { ErrorModal } from "@/components/ErrorModal";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import type { MovieCardData, MovieCriteria, MovieGenre } from "@/lib/tmdb";

type MovieCatalogProps = {
  initialMovies: MovieCardData[];
  initialGenres: MovieGenre[];
  initialError?: string;
};

export function MovieCatalog({
  initialMovies,
  initialGenres,
  initialError,
}: MovieCatalogProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [genres, setGenres] = useState(initialGenres);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState<MovieCriteria | null>(null);
  const searchReadyAt = useRef(0);
  const current = criteria ?? {
    query: "",
    genre: "all",
    sort: "popularity",
  };
  const updateMovieCriteria = (query: string, genre: string, sort: string) =>
    setCriteria({ query, genre, sort });

  useEffect(() => {
    if (!criteria) return;
    const controller = new AbortController();
    let active = true;
    const query = criteria.query.trim();
    const timer = setTimeout(
      async () => {
        setLoading(true);
        setError(undefined);
        let errorMessage =
          "Não foi possível carregar os filmes. Tente novamente mais tarde.";
        try {
          const params = new URLSearchParams({
            query,
            genre: criteria.genre,
            sort: criteria.sort,
          });
          const response = await fetch(`/api/movies?${params}`, {
            signal: controller.signal,
          });
          const data = await response.json();
          if (!active) return;
          if (!response.ok) {
            if (typeof data.error === "string" && data.error.trim())
              errorMessage = data.error;
            throw new Error();
          }
          setMovies(data.movies);
          setGenres(data.genres);
        } catch {
          if (!active) return;
          setMovies([]);
          setError(errorMessage);
        } finally {
          if (active) setLoading(false);
        }
      },
      Math.max(0, searchReadyAt.current - Date.now()),
    );
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [criteria]);

  return (
    <>
      <section
        aria-label="Filtros de filmes"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_200px]"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <Input
            id="movie-search"
            name="movie-search"
            type="search"
            maxLength={200}
            label="Buscar por título"
            placeholder="Digite o nome de um filme"
            value={current.query}
            onChange={(event) => {
              if (!event.target.value.trim() && !current.query.trim()) return;
              searchReadyAt.current = event.target.value.trim()
                ? Date.now() + 2000
                : 0;
              updateMovieCriteria(
                event.target.value,
                current.genre,
                current.sort,
              );
            }}
          />
        </div>
        <Select
          id="genre"
          name="genre"
          label="Gênero"
          value={current.genre}
          onChange={(event) =>
            updateMovieCriteria(current.query, event.target.value, current.sort)
          }
          options={[
            { label: "Todos", value: "all" },
            ...genres.map((genre) => ({
              label: genre.name,
              value: String(genre.id),
            })),
          ]}
        />
        <Select
          id="sort"
          name="sort"
          label="Ordenar por"
          value={current.sort}
          onChange={(event) =>
            updateMovieCriteria(
              current.query,
              current.genre,
              event.target.value,
            )
          }
          options={[
            { label: "Popularidade", value: "popularity" },
            { label: "Nota", value: "rating" },
            { label: "Data de lançamento", value: "release-date" },
          ]}
        />
      </section>
      {loading ? (
        <LoadingOverlay inline />
      ) : error ? (
        <ErrorModal message={error} />
      ) : movies.length === 0 ? (
        <p role="status" className="text-muted">
          Nenhum filme encontrado. Tente alterar a busca ou os filtros.
        </p>
      ) : (
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
      )}
    </>
  );
}
