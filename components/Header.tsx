"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderProps = {
  favoritesCount?: number;
};

export default function Header({ favoritesCount = 0 }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background px-4 sm:px-8">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Catálogo, página inicial"
          className="shrink-0 text-xl font-bold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Catálogo<span className="text-primary">.</span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-1 sm:gap-2"
        >
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 ${
              pathname === "/"
                ? "bg-surface text-foreground"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            Explorar
          </Link>
          <button
            type="button"
            disabled
            aria-label={`Favoritos, ${favoritesCount} filmes`}
            className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted opacity-70 sm:px-4"
          >
            Favoritos
            <span
              aria-hidden="true"
              className="min-w-7 rounded-full bg-surface px-2 py-0.5 text-center text-xs font-semibold text-foreground"
            >
              {favoritesCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
