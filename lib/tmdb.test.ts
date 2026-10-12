import { expect, jest, test } from "@jest/globals";
import { getMovieDetails, getPopularMovies, TmdbApiError } from "./tmdb";

test("converte os detalhes e seleciona trailer por idioma e oficialidade", async () => {
  const request = jest.fn<typeof fetch>();
  request
    .mockResolvedValueOnce(
      Response.json({
        id: 123,
        title: "Filme de teste",
        vote_average: 8.26,
        release_date: "2025-03-20",
        runtime: 121,
        genres: [{ id: 1, name: "Aventura" }],
        overview: "Sinopse em português",
        poster_path: "/poster.jpg",
        original_language: "ja",
        translations: {
          translations: [
            { iso_639_1: "en", data: { overview: "English synopsis" } },
          ],
        },
        credits: {
          cast: [
            {
              id: 1,
              name: "Atriz",
              character: "Pessoa",
              profile_path: "/a.jpg",
            },
            { id: 2, name: "Ator 2", character: "Papel" },
            { id: 3, name: "Ator 3", character: "Papel" },
            { id: 4, name: "Ator 4", character: "Papel" },
            { id: 5, name: "Ator 5", character: "Papel" },
          ],
        },
      }),
    )
    .mockResolvedValueOnce(
      Response.json({
        id: 123,
        results: [
          {
            key: "english",
            name: "Trailer em inglês",
            site: "YouTube",
            type: "Trailer",
            iso_639_1: "en",
            official: true,
          },
          {
            key: "japanese",
            name: "Trailer original",
            site: "YouTube",
            type: "Trailer",
            iso_639_1: "ja",
            official: true,
          },
          {
            key: "portuguese",
            name: "Trailer em português",
            site: "YouTube",
            type: "Trailer",
            iso_639_1: "pt",
            official: false,
          },
          {
            key: "portuguese-official",
            name: "Trailer oficial em português",
            site: "YouTube",
            type: "Trailer",
            iso_639_1: "pt",
            official: true,
          },
          {
            key: "vimeo",
            name: "Trailer externo",
            site: "Vimeo",
            type: "Trailer",
            iso_639_1: "pt",
            official: true,
          },
          {
            key: "other",
            name: "Teaser",
            site: "YouTube",
            type: "Teaser",
            iso_639_1: "pt",
            official: true,
          },
        ],
      }),
    );

  await expect(
    getMovieDetails("123", "secret", request),
  ).resolves.toStrictEqual({
    title: "Filme de teste",
    year: "2025",
    duration: "2h 1min",
    genres: ["Aventura"],
    rating: "8,3",
    synopsis: "Sinopse em português",
    poster: "https://image.tmdb.org/t/p/w500/poster.jpg",
    cast: [
      {
        id: 1,
        name: "Atriz",
        character: "Pessoa",
        profile: "https://image.tmdb.org/t/p/w185/a.jpg",
      },
      { id: 2, name: "Ator 2", character: "Papel", profile: undefined },
      { id: 3, name: "Ator 3", character: "Papel", profile: undefined },
      { id: 4, name: "Ator 4", character: "Papel", profile: undefined },
    ],
    trailer: "https://www.youtube-nocookie.com/embed/portuguese-official",
  });
  expect(request).toHaveBeenNthCalledWith(
    1,
    "https://api.themoviedb.org/3/movie/123?language=pt-BR&append_to_response=credits%2Ctranslations",
    expect.objectContaining({ cache: "no-store" }),
  );
  expect(request).toHaveBeenNthCalledWith(
    2,
    "https://api.themoviedb.org/3/movie/123/videos?language=pt-BR&include_video_language=pt%2Cen%2Cja%2Cnull",
    expect.objectContaining({ cache: "no-store" }),
  );
});

test("usa sinopse em inglês, idioma original e outra tradução nessa ordem", async () => {
  const response = (overview: string, translations: unknown) => [
    Response.json({
      id: 5,
      title: "Filme",
      vote_average: 0,
      original_language: "ja",
      overview,
      translations: { translations },
      credits: { cast: [] },
    }),
    Response.json({ results: [] }),
  ];

  const englishRequest = jest.fn<typeof fetch>();
  englishRequest
    .mockResolvedValueOnce(
      response("", [
        { iso_639_1: "en", data: { overview: "Sinopse inglesa" } },
        { iso_639_1: "ja", data: { overview: "Sinopse original" } },
      ])[0],
    )
    .mockResolvedValueOnce(response("", [])[1]);
  await expect(
    getMovieDetails("5", "secret", englishRequest),
  ).resolves.toMatchObject({ synopsis: "Sinopse inglesa" });

  const originalRequest = jest.fn<typeof fetch>();
  originalRequest
    .mockResolvedValueOnce(
      response("", [
        { iso_639_1: "ja", data: { overview: "Sinopse original" } },
      ])[0],
    )
    .mockResolvedValueOnce(response("", [])[1]);
  await expect(
    getMovieDetails("5", "secret", originalRequest),
  ).resolves.toMatchObject({ synopsis: "Sinopse original" });

  const otherRequest = jest.fn<typeof fetch>();
  otherRequest
    .mockResolvedValueOnce(
      response("", [
        { iso_639_1: "fr", data: { overview: "Autre synopsis" } },
      ])[0],
    )
    .mockResolvedValueOnce(response("", [])[1]);
  await expect(
    getMovieDetails("5", "secret", otherRequest),
  ).resolves.toMatchObject({ synopsis: "Autre synopsis" });
});

test("usa placeholders para dados opcionais e rejeita IDs inválidos e filmes inexistentes", async () => {
  const request = jest
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      Response.json({ id: 8, title: "Filme", vote_average: 0 }),
    )
    .mockResolvedValueOnce(Response.json({ results: [] }));

  await expect(getMovieDetails("8", "secret", request)).resolves.toMatchObject({
    year: "Ano não informado",
    duration: "Duração não informada",
    genres: [],
    rating: "0,0",
    synopsis: "Sinopse não disponível.",
    poster: undefined,
    cast: [],
    trailer: undefined,
  });

  const invalidRequest = jest.fn<typeof fetch>();
  await expect(getMovieDetails("1x", "secret", invalidRequest)).rejects.toThrow(
    "Filme não encontrado.",
  );
  expect(invalidRequest).not.toHaveBeenCalled();

  await expect(
    getMovieDetails(
      "99",
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json({}, { status: 404 })),
    ),
  ).rejects.toThrow("Filme não encontrado.");
});

test("converte falhas HTTP, resposta inválida e erro de rede em TmdbApiError", async () => {
  const missingTokenRequest = jest.fn<typeof fetch>();
  await expect(
    getMovieDetails("1", undefined, missingTokenRequest),
  ).rejects.toBeInstanceOf(TmdbApiError);
  expect(missingTokenRequest).not.toHaveBeenCalled();

  await expect(
    getMovieDetails(
      "1",
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          Response.json({ status_message: "Token inválido" }, { status: 401 }),
        ),
    ),
  ).rejects.toMatchObject({ name: "TmdbApiError", message: "Token inválido" });

  await expect(
    getMovieDetails(
      "1",
      "secret",
      jest.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ id: 1 })),
    ),
  ).rejects.toBeInstanceOf(TmdbApiError);

  await expect(
    getMovieDetails(
      "1",
      "secret",
      jest.fn<typeof fetch>().mockResolvedValueOnce(new Response("not json")),
    ),
  ).rejects.toBeInstanceOf(TmdbApiError);

  await expect(
    getMovieDetails(
      "1",
      "secret",
      jest.fn<typeof fetch>().mockRejectedValueOnce(new Error("offline")),
    ),
  ).rejects.toBeInstanceOf(TmdbApiError);

  await expect(
    getMovieDetails(
      "1",
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json({}, { status: 500 })),
    ),
  ).rejects.toMatchObject({
    name: "TmdbApiError",
    message: "Não foi possível carregar os filmes. Tente novamente mais tarde.",
  });
});

test("converte os filmes populares do TMDB para os cards da página", async () => {
  const request = jest.fn<typeof fetch>();
  request.mockResolvedValueOnce(
    Response.json({
      results: [
        {
          id: 123,
          title: "Filme popular",
          vote_average: 8.26,
          release_date: "2025-03-20",
          poster_path: "/poster.jpg",
        },
        {
          id: 456,
          title: "Sem poster",
          vote_average: 7,
        },
      ],
    }),
  );

  const movies = await getPopularMovies("secret", request);

  expect(request).toHaveBeenCalledWith(
    "https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1",
    expect.objectContaining({
      headers: {
        Authorization: "Bearer secret",
        accept: "application/json",
      },
      cache: "no-store",
    }),
  );
  expect(movies).toStrictEqual([
    {
      id: 123,
      title: "Filme popular",
      rating: "8,3",
      year: "2025",
      poster: "https://image.tmdb.org/t/p/w500/poster.jpg",
    },
    {
      id: 456,
      title: "Sem poster",
      rating: "7,0",
      year: "Ano não informado",
      poster: undefined,
    },
  ]);
});

test("retorna lista vazia quando o TMDB não encontra filmes", async () => {
  const request = jest
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({ results: [] }));

  await expect(getPopularMovies("secret", request)).resolves.toStrictEqual([]);
});

test("rejeita token ausente, falhas HTTP, JSON inválido e resposta incompleta", async () => {
  const fallbackMessage =
    "Não foi possível carregar os filmes. Tente novamente mais tarde.";

  await expect(
    getPopularMovies("", jest.fn<typeof fetch>()),
  ).rejects.toMatchObject({
    message: fallbackMessage,
  });

  await expect(
    getPopularMovies(
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          Response.json({ status_message: "Token inválido" }, { status: 401 }),
        ),
    ),
  ).rejects.toMatchObject({ message: "Token inválido" });

  await expect(
    getPopularMovies(
      "secret",
      jest.fn<typeof fetch>().mockResolvedValueOnce(new Response("not json")),
    ),
  ).rejects.toMatchObject({ message: fallbackMessage });

  await expect(
    getPopularMovies(
      "secret",
      jest
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json({ results: [{ id: 1 }] })),
    ),
  ).rejects.toMatchObject({ message: fallbackMessage });

  await expect(
    getPopularMovies(
      "secret",
      jest.fn<typeof fetch>().mockRejectedValueOnce(new Error("offline")),
    ),
  ).rejects.toMatchObject({ message: fallbackMessage });
});

test("usa mensagem segura quando o erro HTTP não inclui status_message", async () => {
  const request = jest
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({}, { status: 500 }));

  await expect(getPopularMovies("secret", request)).rejects.toMatchObject({
    message: "Não foi possível carregar os filmes. Tente novamente mais tarde.",
  });
});
