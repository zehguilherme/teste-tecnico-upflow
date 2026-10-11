type TmdbMovie = {
  id: number;
  title: string;
  vote_average: number;
  release_date?: string;
  poster_path?: string | null;
};

type MovieCardData = {
  id: number;
  title: string;
  rating: string;
  year: string;
  poster?: string;
};

const fallbackErrorMessage =
  "Não foi possível carregar os filmes. Tente novamente mais tarde.";

export class TmdbApiError extends Error {
  constructor(message = fallbackErrorMessage) {
    super(message);
    this.name = "TmdbApiError";
  }
}

function isTmdbMovie(movie: unknown): movie is TmdbMovie {
  if (typeof movie !== "object" || movie === null) return false;

  return (
    "id" in movie &&
    typeof movie.id === "number" &&
    "title" in movie &&
    typeof movie.title === "string" &&
    "vote_average" in movie &&
    typeof movie.vote_average === "number" &&
    (!("release_date" in movie) || typeof movie.release_date === "string") &&
    (!("poster_path" in movie) ||
      movie.poster_path === null ||
      typeof movie.poster_path === "string")
  );
}

export async function getPopularMovies(
  token: string | undefined,
  request: typeof fetch = fetch,
): Promise<MovieCardData[]> {
  try {
    if (!token) throw new Error("Missing token");

    const response = await request(
      "https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "status_message" in data &&
        typeof data.status_message === "string" &&
        data.status_message.trim()
          ? data.status_message
          : fallbackErrorMessage;
      throw new TmdbApiError(message);
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("results" in data) ||
      !Array.isArray(data.results)
    ) {
      throw new Error("Invalid response");
    }

    return data.results.map((entry: unknown) => {
      if (!isTmdbMovie(entry)) throw new Error("Invalid movie");

      const movie = entry;
      return {
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
        year: movie.release_date?.match(/^\d{4}/)?.[0] ?? "Ano não informado",
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : undefined,
      };
    });
  } catch (error) {
    if (error instanceof TmdbApiError) throw error;
    throw new TmdbApiError();
  }
}
