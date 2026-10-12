import { afterEach, expect, jest, test } from "@jest/globals";
import { GET } from "./route";

const originalFetch = globalThis.fetch;
const originalToken = process.env.TMDB_ACCESS_TOKEN;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.TMDB_ACCESS_TOKEN;
  else process.env.TMDB_ACCESS_TOKEN = originalToken;
});

test("rota combina critérios, autentica só no servidor e devolve cards e gêneros", async () => {
  process.env.TMDB_ACCESS_TOKEN = "server-only-secret";
  const calls: { url: string; options?: RequestInit }[] = [];
  globalThis.fetch = jest
    .fn<typeof fetch>()
    .mockImplementation(async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json(
        String(url).includes("/genre/")
          ? { genres: [{ id: 28, name: "Ação" }] }
          : {
              results: [
                {
                  id: 1,
                  title: "Matrix",
                  vote_average: 8.2,
                  popularity: 30,
                  genre_ids: [28],
                  release_date: "1999-03-31",
                },
                {
                  id: 2,
                  title: "Outro",
                  vote_average: 9,
                  popularity: 50,
                  genre_ids: [12],
                  release_date: "2025-10-10",
                },
              ],
            },
      );
    });
  const response = await GET(
    new Request(
      "http://localhost/api/movies?query=Matrix&genre=28&sort=rating",
    ),
  );
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.movies).toEqual([
    { id: 1, title: "Matrix", rating: "8,2", year: "1999" },
  ]);
  expect(body.genres).toEqual([{ id: 28, name: "Ação" }]);
  expect(JSON.stringify(body)).not.toContain("server-only-secret");
  expect(new URL(calls[0].url).searchParams.get("query")).toBe("Matrix");
  for (const call of calls)
    expect(call.options?.headers).toEqual({
      Authorization: "Bearer server-only-secret",
      accept: "application/json",
    });
});

test("rota rejeita critérios inválidos e não revela erros internos", async () => {
  globalThis.fetch = jest
    .fn<typeof fetch>()
    .mockRejectedValue(new Error("server-only-secret"));
  process.env.TMDB_ACCESS_TOKEN = "server-only-secret";
  const invalid = await GET(
    new Request("http://localhost/api/movies?sort=__proto__"),
  );
  expect(invalid.ok).toBe(false);
  expect(await invalid.json()).toEqual({
    error: "Critérios de busca inválidos.",
  });
  expect(globalThis.fetch).not.toHaveBeenCalled();
  const unavailable = await GET(
    new Request("http://localhost/api/movies?query=Matrix"),
  );
  expect(unavailable.status).toBe(502);
  expect(await unavailable.json()).toEqual({
    error: "Não foi possível carregar os filmes. Tente novamente mais tarde.",
  });
});
