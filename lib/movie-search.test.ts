import { expect, jest, test } from "@jest/globals";
import { getMovies, getMovieGenres, TmdbApiError } from "./tmdb";

const results = [
  {
    id: 1,
    title: "Primeiro",
    vote_average: 8.21,
    popularity: 10,
    genre_ids: [28],
    release_date: "2025-01-20",
  },
  {
    id: 2,
    title: "Segundo",
    vote_average: 8.24,
    popularity: 30,
    genre_ids: [28, 12],
    release_date: "2025-11-02",
  },
  {
    id: 3,
    title: "Outro gênero",
    vote_average: 9,
    popularity: 50,
    genre_ids: [12],
    release_date: "2026-01-01",
  },
];

test("busca títulos no TMDB e combina gênero com ordenação numérica e data completa", async () => {
  for (const sort of ["popularity", "rating", "release-date"] as const) {
    const request = jest
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ results }));
    const movies = await getMovies(
      { query: "  Filme & título  ", genre: "28", sort },
      "secret",
      request,
    );
    expect(movies.map((movie) => movie.id)).toEqual([2, 1]);
    const url = new URL(String(request.mock.calls[0][0]));
    expect(url.pathname).toBe("/3/search/movie");
    expect(url.searchParams.get("query")).toBe("Filme & título");
    expect(url.searchParams.get("language")).toBe("pt-BR");
    expect(url.searchParams.get("page")).toBe("1");
    expect(movies[0].rating).toBe("8,2");
  }
});

test.each([
  ["popularity", "popularity.desc"],
  ["rating", "vote_average.desc"],
  ["release-date", "primary_release_date.desc"],
])(
  "descobre filmes por gênero e ordenação %s sem limitar aos populares iniciais",
  async (sort, tmdbSort) => {
    const request = jest
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ results }));
    await getMovies({ query: "   ", genre: "28", sort }, "secret", request);
    const url = new URL(String(request.mock.calls[0][0]));
    expect(url.pathname).toBe("/3/discover/movie");
    expect(url.searchParams.get("with_genres")).toBe("28");
    expect(url.searchParams.get("sort_by")).toBe(tmdbSort);
    expect(url.searchParams.has("query")).toBe(false);
  },
);

test("busca vazia com critérios padrão preserva a listagem popular", async () => {
  const request = jest
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ results }));
  const movies = await getMovies(
    { query: "  ", genre: "all", sort: "popularity" },
    "secret",
    request,
  );
  expect(String(request.mock.calls[0][0])).toBe(
    "https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1",
  );
  expect(movies.map((movie) => movie.id)).toEqual([1, 2, 3]);
});

test("Todos remove o filtro, datas ausentes ficam por último e nenhum resultado é válido", async () => {
  const request = jest.fn<typeof fetch>().mockImplementation(async () =>
    Response.json({
      results: [...results, { ...results[0], id: 4, release_date: "" }],
    }),
  );
  const movies = await getMovies(
    { query: "Filme", genre: "all", sort: "release-date" },
    "secret",
    request,
  );
  expect(movies.map((movie) => movie.id)).toEqual([3, 2, 1, 4]);
  await expect(
    getMovies(
      { query: "Filme", genre: "99", sort: "rating" },
      "secret",
      request,
    ),
  ).resolves.toEqual([]);
  await expect(
    getMovies(
      { query: "Nada", genre: "all", sort: "rating" },
      "secret",
      jest.fn<typeof fetch>().mockResolvedValue(Response.json({ results: [] })),
    ),
  ).resolves.toEqual([]);
});

test("carrega gêneros em português e rejeita respostas inválidas", async () => {
  const request = jest
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ genres: [{ id: 28, name: "Ação" }] }));
  await expect(getMovieGenres("secret", request)).resolves.toEqual([
    { id: 28, name: "Ação" },
  ]);
  expect(String(request.mock.calls[0][0])).toBe(
    "https://api.themoviedb.org/3/genre/movie/list?language=pt-BR",
  );
  for (const data of [{}, { genres: [{ id: "28", name: "Ação" }] }]) {
    await expect(
      getMovieGenres(
        "secret",
        jest.fn<typeof fetch>().mockResolvedValue(Response.json(data)),
      ),
    ).rejects.toBeInstanceOf(TmdbApiError);
  }
});

test("rejeita critérios inválidos antes de consultar a API e mantém mensagens seguras", async () => {
  const request = jest.fn<typeof fetch>();
  for (const criteria of [
    { query: "Filme", genre: "-1", sort: "rating" },
    { query: "Filme", genre: "28|12", sort: "rating" },
    { query: "Filme", genre: "all", sort: "unknown" },
  ])
    await expect(getMovies(criteria, "secret", request)).rejects.toBeInstanceOf(
      TmdbApiError,
    );
  expect(request).not.toHaveBeenCalled();
  const criteria = { query: "Filme", genre: "all", sort: "rating" };
  await expect(getMovies(criteria, undefined, request)).rejects.toBeInstanceOf(
    TmdbApiError,
  );
  await expect(
    getMovies(
      criteria,
      "secret",
      jest.fn<typeof fetch>().mockRejectedValue(new Error("secret")),
    ),
  ).rejects.toMatchObject({
    message: "Não foi possível carregar os filmes. Tente novamente mais tarde.",
  });
  await expect(
    getMovies(
      criteria,
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ status_message: "Indisponível" }, { status: 503 }),
        ),
    ),
  ).rejects.toMatchObject({ message: "Indisponível" });
  await expect(
    getMovies(
      criteria,
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ results: [{ ...results[0], genre_ids: "28" }] }),
        ),
    ),
  ).rejects.toBeInstanceOf(TmdbApiError);
});
