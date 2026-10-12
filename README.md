# Catálogo de Filmes

![Referência visual da página inicial do Catálogo de Filmes](./design-references/stitch/filmes-populares.png)

## 💬 Descrição

O Catálogo de Filmes é uma aplicação web para descobrir filmes populares, encontrar títulos por busca e gênero, ordenar resultados e consultar detalhes como sinopse, nota, elenco e trailers. Também permite salvar filmes favoritos para acessá-los novamente.

## 📄 Enunciado

[Teste técnico para desenvolvedor frontend](./teste_tecnico_desenvolvedor_frontend.pdf).

## ✨ Funcionalidades

- [x] Listagem da primeira página de filmes populares do TMDB;
  - [ ] Paginação de resultados;
  - [x] Busca por título com debounce de 2 segundos;
  - [x] Filtro por gênero, com nomes em português;
  - [x] Ordenação decrescente por popularidade, nota e data completa de lançamento;
- [x] Página de detalhe em `/movie/[id]` com dados do TMDB, sinopse, elenco principal e trailer quando disponível;
- [ ] Favoritos com persistência no client e listagem dos filmes favoritos;
  - [x] Interface da página `/favorites` com estado vazio; a funcionalidade de favoritar e persistir ainda está pendente.

## 🌐 Ambientes

### Local

O servidor de desenvolvimento fica disponível em [localhost:3000](http://localhost:3000) após iniciar a aplicação.

### Produção

Aplicação: [teste-tecnico-upflow.vercel.app](https://teste-tecnico-upflow.vercel.app/).

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/);
- npm, incluído na instalação do Node.js.

### Instalação e execução

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/zehguilherme/teste-tecnico-upflow.git
cd teste-tecnico-upflow
```

Instale as dependências:

```bash
npm install
```

Configure o **API Read Access Token** do TMDB na variável `TMDB_ACCESS_TOKEN` do arquivo `.env` antes de iniciar a aplicação. Use o `.env.example` como referência e mantenha o valor real do token apenas no `.env`, que não deve ser enviado ao Git.

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O token é usado somente pelo servidor e não deve receber o prefixo `NEXT_PUBLIC_`. Na hospedagem, cadastre a mesma variável nas configurações de ambiente do projeto.

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🚀 Tecnologias

- [Next.js 16](https://nextjs.org/) e [React 19](https://react.dev/) — aplicação web e componentes;
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática;
- [Node.js](https://nodejs.org/) e [npm](https://www.npmjs.com/) — ambiente de execução e gerenciamento de dependências e scripts;
- [Tailwind CSS 4](https://tailwindcss.com/) — estilos;
- [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) — empacotamento da aplicação e integração com o Tailwind CSS;
- [Jest 30](https://jestjs.io/) — testes automatizados, integrado ao Next.js com `next/jest`;
- [ESLint 9](https://eslint.org/) — análise estática do código;
- [Prettier](https://prettier.io/) — formatação dos arquivos compatíveis;
- [API do TMDB](https://developer.themoviedb.org/) — dados e imagens dos filmes;
- [Vercel](https://vercel.com/) — hospedagem da aplicação em produção.

## 🏗️ Arquitetura

A aplicação usa Next.js com App Router. A página inicial está em `app/page.tsx`, a consulta ao TMDB está em `lib/tmdb.ts`, o layout global e os metadados estão em `app/layout.tsx`, e o cabeçalho compartilhado está em `components/Header.tsx`. O componente `MovieCatalog` controla os critérios no navegador e consulta a rota `GET /api/movies`, que autentica as requisições ao TMDB no servidor. Ainda não há persistência de dados.

## 🧭 Decisões técnicas e trade-offs

- **Next.js com App Router e TypeScript:** tecnologias definidas pelo enunciado, usadas como base da aplicação;
- **Tailwind CSS:** usado para aplicar estilos diretamente nos componentes e manter cores, espaçamentos e comportamento responsivo consistentes. Isso reduz a necessidade de folhas de estilo separadas, embora possa deixar os componentes com classes extensas;
- **Elementos nativos de formulário:** busca e filtros usam input e select do HTML, envolvidos por componentes React reutilizáveis. Isso aproveita semântica, acessibilidade e comportamento padrão do navegador; em contrapartida, a aparência dos controles pode variar entre navegadores;
- **API do TMDB:** a Home busca no servidor a primeira página de filmes populares e os gêneros em português brasileiro. Busca, gênero e ordenação podem ser combinados; a paginação continua pendente;
- **Pôsteres com `next/image`:** os cards usam imagens responsivas com otimização do Next.js, preservando a proporção de 2:3; os quatro primeiros pôsteres usam `loading="eager"` para não atrasar o LCP da primeira linha no desktop, e os demais usam `loading="lazy"`; a configuração permite imagens de `image.tmdb.org/t/p/w500/`;
- **Persistência de favoritos:** é um requisito funcional, mas ainda não está implementado no projeto atual.

## 🔌 API

O projeto consome a [API pública do TMDB](https://developer.themoviedb.org) com `fetch` nativo no servidor e a variável `TMDB_ACCESS_TOKEN`. A Home apresenta título, nota, ano e pôster dos filmes populares. A página `/movie/[id]` busca os detalhes, créditos, traduções e trailers do filme; usa o primeiro idioma disponível para a sinopse seguindo a prioridade português, inglês e idioma original. As imagens do TMDB são exibidas com `next/image`. Enquanto os dados carregam, as páginas usam o componente reutilizável `LoadingOverlay`; quando a API retorna um erro, exibem `ErrorModal` com a mensagem do TMDB ou uma mensagem segura em português. A paginação ainda não foi implementada.

### Busca e filtros

- A busca consulta `/search/movie` no TMDB após **2 segundos sem novas teclas**, encontrando títulos além da listagem inicial. O campo aceita até 200 caracteres. Espaços nas extremidades são removidos; limpar a busca ou usar apenas espaços aplica imediatamente os demais critérios.
- Os gêneros vêm de `/genre/movie/list?language=pt-BR` e ficam em cache no servidor por 24 horas. “Todos” remove a restrição por gênero.
- Sem título, gênero “Todos” e ordenação por popularidade, a consulta usa `/movie/popular`. Outros critérios sem título usam `/discover/movie`, com gênero e ordenação aplicados pelo TMDB ao catálogo.
- Com título, o TMDB não oferece gênero nem ordenação em `/search/movie`: o servidor filtra e ordena **somente os resultados da primeira página da busca** (até 20 filmes). Um gênero pode produzir uma lista vazia mesmo que existam filmes correspondentes em páginas posteriores. Essa limitação deverá ser considerada na issue de paginação (#8).
- A ordenação é decrescente e usa popularidade e nota numéricas, sem arredondar a nota antes de comparar, ou a data completa de lançamento. Datas ausentes ficam por último.
- Limpar o título preserva gênero e ordenação. Consultas antigas são canceladas e suas respostas ignoradas. Durante a atualização, os controles permanecem visíveis e habilitados; resultados vazios mostram uma mensagem, e falhas permitem fechar o modal e alterar os critérios para tentar novamente.
- O navegador acessa apenas `/api/movies`; o token permanece no servidor. A rota valida os critérios antes de consultar o TMDB.

## 🎨 Layout e design system

As imagens de referência para as telas de filmes populares, detalhe do filme e favoritos estão em [`design-references/stitch/`](./design-references/stitch/). A Home usa dados atuais do TMDB, com busca e filtros funcionais; paginação e funcionalidade de favoritos continuam pendentes. A rota `/favorites` apresenta o estado vazio e um aviso enquanto favoritos não estiverem disponíveis. Cada card aponta para `/movie/[id]`, que exibe os dados atuais do filme. Os botões de favoritos permanecem desabilitados até a implementação desse recurso. As cores, tipografia e estilos globais estão definidos em `app/globals.css`; use os tokens de cor nas classes, sem valores literais nos componentes. Após alterações de interface, valide o código e a renderização em desktop e mobile com a skill [`stitch-design-validation`](./.agents/skills/stitch-design-validation/SKILL.md).

## ✅ Testes e validações

O workflow **CI** executa automaticamente em pushes para `develop` e `master` e em pull requests destinados a essas branches. Com Node.js 22, instala as dependências com `npm ci` e executa, em sequência, `npm run format:check`, `npm run lint` e `npm test -- --ci`. Qualquer falha reprova o check **Validações**. Os testes usam respostas controladas do TMDB; o workflow não precisa de token nem de secrets da API.

Para impedir merges quando as verificações falharem, configure a proteção da branch ou um ruleset no GitHub e marque **Validações** como check obrigatório. O workflow executa as verificações, mas essa regra de merge precisa ser configurada no repositório.

A aplicação carrega dados reais do TMDB. Nos testes com Jest, a resposta da API é substituída por respostas controladas para verificar a conversão dos filmes, busca, gênero, ordenação e tratamento de erros, sem fazer chamadas ao TMDB. Os testes do `MovieCatalog` usam `jest-environment-jsdom` para exercitar os controles reais, debounce, limpeza da busca, resultados vazios, recuperação após erros e respostas fora de ordem. A rota também é testada para conferir a autenticação no servidor e a validação dos critérios. Execute-os com:

```bash
npm test
npm test -- lib/tmdb.test.ts
```

O lint e o build verificam automaticamente se os arquivos estão formatados. Para formatar todos os arquivos compatíveis ou conferir a formatação sem modificá-los, execute:

```bash
npm run format
npm run format:check
```

No VS Code, instale a extensão recomendada **Prettier - Code formatter** (`esbenp.prettier-vscode`). O workspace a configura como formatador padrão e aplica a formatação ao salvar.

## 📁 Estrutura do projeto

```text
app/                          # Página inicial, layout, estilos globais e favicon
components/                   # Componentes reutilizáveis, incluindo o cabeçalho
design-references/stitch/     # Referências visuais das telas
public/                       # Arquivos estáticos públicos
package.json                  # Dependências e scripts do projeto
```

## Acompanhamento

As alterações no projeto podem ser acompanhadas no [GitHub Projects](https://github.com/users/zehguilherme/projects/18).
