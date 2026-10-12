import { getMovies, getMovieGenres, TmdbApiError } from "@/lib/tmdb";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const token = process.env.TMDB_ACCESS_TOKEN;
    const movies = await getMovies(
      {
        query: params.get("query") ?? "",
        genre: params.get("genre") ?? "all",
        sort: params.get("sort") ?? "popularity",
      },
      token,
    );
    const genres = await getMovieGenres(token);
    return Response.json({ movies, genres });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof TmdbApiError
            ? error.message
            : "Não foi possível carregar os filmes. Tente novamente mais tarde.",
      },
      { status: 502 },
    );
  }
}
