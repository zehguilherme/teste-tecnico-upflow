"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderProps = {
  favoritesCount?: number;
};

export function Header({ favoritesCount = 0 }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-background">
      <div className="border-b border-border sm:mx-8">
        <div className="flex h-[72px] items-center justify-between gap-2 px-4 min-[360px]:gap-4 sm:px-0">
          <Link
            href="/"
            aria-label="Catálogo, página inicial"
            className="shrink-0 text-xl font-bold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Catálogo<span className="text-primary">.</span>
          </Link>

          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-0 min-[360px]:gap-1 sm:gap-2"
          >
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`rounded-lg px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-[360px]:px-3 sm:px-4 ${
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
              className="flex cursor-not-allowed items-center gap-1 rounded-lg px-2 py-2 text-sm text-muted opacity-70 min-[360px]:gap-2 min-[360px]:px-3 sm:px-4"
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
      </div>
    </header>
  );
}
