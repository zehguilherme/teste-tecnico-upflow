import Link from "next/link";

export default function FavoritesPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pb-16 pt-8 sm:px-8 sm:pt-9">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Meus favoritos
      </h1>
      <section
        aria-labelledby="favorites-empty-title"
        className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-12 text-center"
        role="status"
      >
        <h2
          id="favorites-empty-title"
          className="text-xl font-semibold text-foreground"
        >
          Você ainda não tem filmes favoritos.
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
          A funcionalidade de favoritos ainda não está disponível.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Explorar filmes
        </Link>
      </section>
    </main>
  );
}
