/** @jest-environment jsdom */
import { expect, test } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import FavoritesPage from "./page";

test("apresenta estado vazio e link para explorar filmes", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement("div");
  document.body.append(container);
  const root: Root = createRoot(container);

  await act(async () => root.render(<FavoritesPage />));

  expect(container.querySelector("h1")?.textContent).toBe("Meus favoritos");
  expect(container.textContent).toContain(
    "Você ainda não tem filmes favoritos.",
  );
  expect(container.textContent).toContain(
    "A funcionalidade de favoritos ainda não está disponível.",
  );
  expect(container.querySelector('a[href="/"]')?.textContent).toContain(
    "Explorar filmes",
  );
  expect(container.querySelector("article")).toBeNull();

  await act(async () => root.unmount());
  container.remove();
});
