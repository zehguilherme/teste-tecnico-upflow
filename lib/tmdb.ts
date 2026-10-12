type TmdbMovie = {
  id: number;
  title: string;
  vote_average: number;
  popularity?: number;
  genre_ids?: number[];
  release_date?: string;
  poster_path?: string | null;
};

export type MovieCardData = {
  id: number;
  title: string;
  rating: string;
  year: string;
  poster?: string;
};

export type MovieGenre = { id: number; name: string };
export type MovieCriteria = { query: string; genre: string; sort: string };

export type MovieDetails = {
  title: string;
  year: string;
  duration: string;
  genres: string[];
  rating: string;
  synopsis: string;
  poster?: string;
  cast: {
    id: number;
    name: string;
    character: string;
    profile?: string;
  }[];
  trailer?: string;
};

const fallbackErrorMessage =
  "Não foi possível carregar os filmes. Tente novamente mais tarde.";

export class TmdbApiError extends Error {
  constructor(message = fallbackErrorMessage) {
    super(message);
    this.name = "TmdbApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function tmdbErrorMessage(data: unknown) {
  return isRecord(data) &&
    typeof data.status_message === "string" &&
    data.status_message.trim()
    ? data.status_message
    : fallbackErrorMessage;
}

async function readTmdbResponse(response: Response) {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (response.status === 404) {
      throw new TmdbApiError("Filme não encontrado.");
    }
    throw new TmdbApiError();
  }

  if (!response.ok) {
    throw new TmdbApiError(
      response.status === 404
        ? "Filme não encontrado."
        : tmdbErrorMessage(data),
    );
  }
  if (!isRecord(data)) throw new TmdbApiError();
  return data;
}

function imageUrl(path: unknown, size: "w185" | "w500") {
  return typeof path === "string" && path.startsWith("/")
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : undefined;
}

function localizedSynopsis(movie: Record<string, unknown>) {
  const overview =
    typeof movie.overview === "string" ? movie.overview.trim() : "";
  if (overview) return overview;

  const translations =
    isRecord(movie.translations) &&
    Array.isArray(movie.translations.translations)
      ? movie.translations.translations.filter(isRecord)
      : [];
  const originalLanguage =
    typeof movie.original_language === "string" ? movie.original_language : "";
  const candidates = [
    translations.find(
      (translation) =>
        translation.iso_639_1 === "en" &&
        isRecord(translation.data) &&
        typeof translation.data.overview === "string" &&
        translation.data.overview.trim(),
    ),
    translations.find(
      (translation) =>
        translation.iso_639_1 === originalLanguage &&
        isRecord(translation.data) &&
        typeof translation.data.overview === "string" &&
        translation.data.overview.trim(),
    ),
    translations.find(
      (translation) =>
        isRecord(translation.data) &&
        typeof translation.data.overview === "string" &&
        translation.data.overview.trim(),
    ),
  ];
  const translation = candidates.find(isRecord);
  return isRecord(translation?.data) &&
    typeof translation.data.overview === "string"
    ? translation.data.overview.trim()
    : "Sinopse não disponível.";
}

function trailerUrl(
  data: Record<string, unknown>,
  preferredLanguages: string[],
) {
  if (!Array.isArray(data.results)) return undefined;
  const trailers = data.results.filter(
    (entry): entry is Record<string, unknown> =>
      isRecord(entry) &&
      entry.site === "YouTube" &&
      entry.type === "Trailer" &&
      typeof entry.key === "string" &&
      /^[\w-]+$/.test(entry.key) &&
      typeof entry.iso_639_1 === "string",
  );
  trailers.sort((a, b) => {
    const languageDifference =
      preferredLanguages.indexOf(String(a.iso_639_1)) -
      preferredLanguages.indexOf(String(b.iso_639_1));
    return (
      languageDifference ||
      Number(b.official === true) - Number(a.official === true)
    );
  });
  return trailers[0]
    ? `https://www.youtube-nocookie.com/embed/${trailers[0].key}`
    : undefined;
}

export async function getMovieDetails(
  id: string,
  token: string | undefined,
  request: typeof fetch = fetch,
): Promise<MovieDetails> {
  const movieId = Number(id);
  if (!Number.isSafeInteger(movieId) || movieId < 1) {
    throw new TmdbApiError("Filme não encontrado.");
  }

  try {
    if (!token) throw new Error("Missing token");
    const headers = {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    };
    const options = { headers, cache: "no-store" as const };
    const movie = await readTmdbResponse(
      await request(
        `https://api.themoviedb.org/3/movie/${movieId}?language=pt-BR&append_to_response=credits%2Ctranslations`,
        options,
      ),
    );

    if (
      movie.id !== movieId ||
      typeof movie.title !== "string" ||
      typeof movie.vote_average !== "number"
    ) {
      throw new TmdbApiError();
    }

    const originalLanguage =
      typeof movie.original_language === "string"
        ? movie.original_language
        : "";
    const preferredLanguages = [...new Set(["pt", "en", originalLanguage])];
    const videos = await readTmdbResponse(
      await request(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?language=pt-BR&include_video_language=${encodeURIComponent(`${preferredLanguages.join(",")},null`)}`,
        options,
      ),
    );
    const creditData = isRecord(movie.credits) ? movie.credits : {};
    const cast = Array.isArray(creditData.cast)
      ? creditData.cast
          .filter(
            (person): person is Record<string, unknown> =>
              isRecord(person) &&
              typeof person.id === "number" &&
              typeof person.name === "string",
          )
          .slice(0, 4)
          .map((person) => ({
            id: person.id as number,
            name: person.name as string,
            character:
              typeof person.character === "string" && person.character.trim()
                ? person.character
                : "Personagem não informado",
            profile: imageUrl(person.profile_path, "w185"),
          }))
      : [];
    const releaseDate =
      typeof movie.release_date === "string" ? movie.release_date : "";
    const runtime =
      typeof movie.runtime === "number" && movie.runtime > 0
        ? movie.runtime
        : undefined;

    return {
      title: movie.title,
      year: releaseDate.match(/^\d{4}/)?.[0] ?? "Ano não informado",
      duration: runtime
        ? runtime >= 60
          ? `${Math.floor(runtime / 60)}h ${runtime % 60}min`
          : `${runtime}min`
        : "Duração não informada",
      genres: Array.isArray(movie.genres)
        ? movie.genres
            .filter(
              (genre): genre is Record<string, unknown> =>
                isRecord(genre) && typeof genre.name === "string",
            )
            .map((genre) => genre.name as string)
        : [],
      rating: movie.vote_average.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      synopsis: localizedSynopsis(movie),
      poster: imageUrl(movie.poster_path, "w500"),
      cast,
      trailer: trailerUrl(videos, preferredLanguages),
    };
  } catch (error) {
    if (error instanceof TmdbApiError) throw error;
    throw new TmdbApiError();
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

function movieCardData(movie: TmdbMovie): MovieCardData {
  return {
    id: movie.id,
    title: movie.title,
    rating: movie.vote_average.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    year: movie.release_date?.match(/^\d{4}/)?.[0] ?? "Ano não informado",
    poster: imageUrl(movie.poster_path, "w500"),
  };
}

export async function getMovieGenres(
  token: string | undefined,
  request: typeof fetch = fetch,
): Promise<MovieGenre[]> {
  try {
    if (!token) throw new TmdbApiError();
    const data = await readTmdbResponse(
      await request(
        "https://api.themoviedb.org/3/genre/movie/list?language=pt-BR",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          next: { revalidate: 86400 },
        },
      ),
    );
    if (
      !Array.isArray(data.genres) ||
      !data.genres.every(
        (genre) =>
          isRecord(genre) &&
          Number.isSafeInteger(genre.id) &&
          Number(genre.id) > 0 &&
          typeof genre.name === "string",
      )
    )
      throw new TmdbApiError();
    return data.genres as MovieGenre[];
  } catch (error) {
    if (error instanceof TmdbApiError) throw error;
    throw new TmdbApiError();
  }
}

export async function getMovies(
  criteria: MovieCriteria,
  token: string | undefined,
  request: typeof fetch = fetch,
): Promise<MovieCardData[]> {
  const sortOptions: Record<string, string> = {
    popularity: "popularity.desc",
    rating: "vote_average.desc",
    "release-date": "primary_release_date.desc",
  };
  if (
    typeof criteria.query !== "string" ||
    criteria.query.length > 200 ||
    !Object.hasOwn(sortOptions, criteria.sort) ||
    (criteria.genre !== "all" &&
      (!/^\d+$/.test(criteria.genre) ||
        !Number.isSafeInteger(Number(criteria.genre)) ||
        Number(criteria.genre) < 1))
  )
    throw new TmdbApiError("Critérios de busca inválidos.");
  const query = criteria.query.trim();
  if (!query && criteria.genre === "all" && criteria.sort === "popularity") {
    return getPopularMovies(token, request);
  }
  try {
    if (!token) throw new TmdbApiError();
    const params = new URLSearchParams({
      language: "pt-BR",
      page: "1",
      include_adult: "false",
    });
    if (query) params.set("query", query);
    else {
      params.set("sort_by", sortOptions[criteria.sort]);
      if (criteria.genre !== "all") params.set("with_genres", criteria.genre);
    }
    const data = await readTmdbResponse(
      await request(
        `https://api.themoviedb.org/3/${query ? "search" : "discover"}/movie?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          cache: "no-store",
        },
      ),
    );
    if (!Array.isArray(data.results)) throw new TmdbApiError();
    const movies = data.results.map((entry: unknown) => {
      if (
        !isTmdbMovie(entry) ||
        !isRecord(entry) ||
        typeof entry.popularity !== "number" ||
        !Number.isFinite(entry.popularity) ||
        !Number.isFinite(entry.vote_average) ||
        !Array.isArray(entry.genre_ids) ||
        !entry.genre_ids.every(Number.isSafeInteger)
      )
        throw new TmdbApiError();
      return entry as TmdbMovie & { popularity: number; genre_ids: number[] };
    });
    if (query) {
      // shortcut: filtra e ordena só a página de busca atual; ampliar ao implementar paginação.
      const filtered = movies.filter(
        (movie) =>
          criteria.genre === "all" ||
          movie.genre_ids.includes(Number(criteria.genre)),
      );
      filtered.sort((a, b) =>
        criteria.sort === "release-date"
          ? (b.release_date ?? "").localeCompare(a.release_date ?? "")
          : criteria.sort === "rating"
            ? b.vote_average - a.vote_average
            : b.popularity - a.popularity,
      );
      return filtered.map(movieCardData);
    }
    return movies.map(movieCardData);
  } catch (error) {
    if (error instanceof TmdbApiError) throw error;
    throw new TmdbApiError();
  }
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
      throw new TmdbApiError(tmdbErrorMessage(data));
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

      return movieCardData(entry);
    });
  } catch (error) {
    if (error instanceof TmdbApiError) throw error;
    throw new TmdbApiError();
  }
}
