/** @jest-environment jsdom */
import { expect, jest, test } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Header } from "./Header";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

test("exibe link para favoritos com contador zerado", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement("div");
  document.body.append(container);
  const root: Root = createRoot(container);

  await act(async () => root.render(<Header />));
  const favoritesLink = container.querySelector<HTMLAnchorElement>(
    'a[href="/favorites"]',
  );
  expect(favoritesLink).not.toBeNull();
  expect(favoritesLink?.getAttribute("href")).toBe("/favorites");
  expect(container.textContent).toContain("0");

  await act(async () => root.unmount());
  container.remove();
});
