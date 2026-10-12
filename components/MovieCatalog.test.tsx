/** @jest-environment jsdom */
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MovieCatalog } from "./MovieCatalog";

const initialMovies = [
  { id: 1, title: "Popular inicial", rating: "7,0", year: "2025" },
];
const genres = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
];
let container: HTMLDivElement;
let root: Root;
let request: ReturnType<typeof jest.fn<typeof fetch>>;
const originalFetch = globalThis.fetch;

function response(title: string | null, status = 200) {
  return {
    ok: status === 200,
    json: async () =>
      status === 200
        ? {
            movies: title ? [{ ...initialMovies[0], id: 99, title }] : [],
            genres,
          }
        : { error: "TMDB indisponível" },
  } as Response;
}

beforeEach(async () => {
  jest.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  request = jest
    .fn<typeof fetch>()
    .mockImplementation(async () => response("Resultado atual"));
  globalThis.fetch = request;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MovieCatalog initialMovies={initialMovies} initialGenres={genres} />,
    );
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

async function change(id: string, value: string) {
  const control = container.querySelector(`#${id}`) as
    HTMLInputElement | HTMLSelectElement;
  const prototype =
    control instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : HTMLSelectElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(
      control,
      value,
    );
    control.dispatchEvent(
      new Event(control instanceof HTMLInputElement ? "input" : "change", {
        bubbles: true,
      }),
    );
  });
}

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

test("preserva populares, rótulos e links; busca só após 2 segundos sem novas teclas", async () => {
  expect(container.querySelector('a[href="/movie/1"]')).not.toBeNull();
  expect(
    container.querySelector('label[for="movie-search"]')?.textContent,
  ).toBe("Buscar por título");
  await change("movie-search", "Ma");
  await advance(1500);
  await change("movie-search", "Matrix");
  await advance(1999);
  expect(request).not.toHaveBeenCalled();
  await advance(1);
  expect(
    new URL(
      String(request.mock.calls[0][0]),
      "http://localhost",
    ).searchParams.get("query"),
  ).toBe("Matrix");
  expect(container.textContent).toContain("Resultado atual");
  expect(container.querySelector('a[href="/movie/99"]')).not.toBeNull();
});

test("não consulta a API ao digitar espaços enquanto a busca está vazia", async () => {
  await change("movie-search", " ");
  await change("movie-search", "  ");
  await change("movie-search", "   ");
  await advance(5000);
  expect(request).not.toHaveBeenCalled();
});

test("combina controles e limpar a busca preserva gênero e ordenação", async () => {
  await change("movie-search", "Matrix");
  await change("genre", "28");
  await change("sort", "rating");
  await advance(2000);
  const first = new URL(String(request.mock.calls[0][0]), "http://localhost");
  expect([...first.searchParams.entries()]).toEqual([
    ["query", "Matrix"],
    ["genre", "28"],
    ["sort", "rating"],
  ]);
  await change("movie-search", "   ");
  await advance(0);
  const latest = new URL(
    String(request.mock.calls.at(-1)![0]),
    "http://localhost",
  );
  expect(latest.searchParams.get("query")).toBe("");
  expect(latest.searchParams.get("genre")).toBe("28");
  expect(latest.searchParams.get("sort")).toBe("rating");
  await change("genre", "all");
  await advance(0);
  expect(
    new URL(
      String(request.mock.calls.at(-1)![0]),
      "http://localhost",
    ).searchParams.get("genre"),
  ).toBe("all");
});

test("editar um título já consultado também reinicia o debounce", async () => {
  await change("movie-search", "Matrix");
  await advance(2000);
  await change("movie-search", "Matrix ");
  await advance(1999);
  expect(request).toHaveBeenCalledTimes(1);
  await advance(1);
  expect(request).toHaveBeenCalledTimes(2);
});

test("mudar filtro durante a digitação respeita o intervalo desde a última tecla", async () => {
  await change("movie-search", "Matrix");
  await advance(2000);
  await change("movie-search", "Matrix ");
  await advance(1000);
  await change("genre", "28");
  await advance(999);
  expect(request).toHaveBeenCalledTimes(1);
  await advance(1);
  expect(request).toHaveBeenCalledTimes(2);
});

test("ignora respostas antigas mesmo quando o transporte não respeita abort", async () => {
  let finishOld: (value: Response) => void = () => {};
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishOld = resolve;
      }),
  );
  await change("sort", "rating");
  await advance(0);
  expect(container.textContent).toContain("Aguarde um momento");
  expect(
    container.querySelector<HTMLInputElement>("#movie-search")?.disabled,
  ).toBe(false);
  await change("sort", "release-date");
  await advance(0);
  await act(async () => {
    finishOld(response("Resultado antigo"));
  });
  expect(container.textContent).toContain("Resultado atual");
  expect(container.textContent).not.toContain("Resultado antigo");
});

test("comunica ausência de resultados, falha HTTP e recuperação após alterar critérios", async () => {
  request
    .mockResolvedValueOnce(response(null))
    .mockResolvedValueOnce(response(null, 503));
  await change("genre", "28");
  await advance(0);
  expect(container.querySelector('[role="status"]')?.textContent).toContain(
    "Nenhum filme",
  );
  await change("genre", "12");
  await advance(0);
  expect(container.querySelector("dialog")?.open).toBe(true);
  expect(container.textContent).toContain("TMDB indisponível");
  await act(async () => {
    container
      .querySelector<HTMLButtonElement>('button[aria-label="Fechar modal"]')!
      .click();
  });
  await change("genre", "all");
  await advance(0);
  expect(container.querySelector("dialog")).toBeNull();
  expect(container.textContent).toContain("Resultado atual");
});

test("falha de rede usa mensagem segura e pode ser tentada novamente", async () => {
  request.mockRejectedValueOnce(new Error("secret"));
  await change("sort", "rating");
  await advance(0);
  expect(container.textContent).toContain(
    "Não foi possível carregar os filmes",
  );
  expect(container.textContent).not.toContain("secret");
  await act(async () => {
    container
      .querySelector<HTMLButtonElement>('button[aria-label="Fechar modal"]')!
      .click();
  });
  await change("sort", "popularity");
  await advance(0);
  expect(container.textContent).toContain("Resultado atual");
});
