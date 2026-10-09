import { Input } from "@/components/Input";
import { MovieCard } from "@/components/MovieCard";
import { Select } from "@/components/Select";

const movies = [
  { id: 1, title: "O Último Horizonte", rating: "8,4", year: "2025" },
  {
    id: 2,
    title: "Entre Dois Mundos",
    rating: "7,9",
    year: "2024",
    isFavorite: true,
  },
  { id: 3, title: "A Cidade Silenciosa", rating: "8,1", year: "2023" },
  { id: 4, title: "Depois da Tempestade", rating: "7,6", year: "2025" },
  { id: 5, title: "Luzes da Meia-noite", rating: "8,7", year: "2022" },
  { id: 6, title: "O Peso do Amanhã", rating: "7,8", year: "2024" },
  { id: 7, title: "Memórias de Inverno", rating: "8,2", year: "2021" },
  { id: 8, title: "Além do Impossível", rating: "7,5", year: "2025" },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pb-16 pt-8 sm:px-8 sm:pt-9">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Filmes populares
      </h1>

      <section
        aria-label="Filtros de filmes"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_200px]"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <Input
            id="movie-search"
            name="movie-search"
            type="search"
            disabled
            label="Buscar por título"
            placeholder="Digite o nome de um filme"
          />
        </div>
        <Select
          id="genre"
          name="genre"
          disabled
          label="Gênero"
          defaultValue="all"
          options={[{ label: "Todos", value: "all" }]}
        />
        <Select
          id="sort"
          name="sort"
          disabled
          label="Ordenar por"
          defaultValue="popularity"
          options={[
            { label: "Popularidade", value: "popularity" },
            { label: "Nota", value: "rating" },
            { label: "Data de lançamento", value: "release-date" },
          ]}
        />
      </section>

      <section
        aria-label="Filmes populares"
        className="grid grid-cols-1 gap-x-6 gap-y-6 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </section>
    </main>
  );
}
