import { expect, jest, test } from "@jest/globals";
import { getPopularMovies } from "./tmdb";

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
