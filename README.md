# Catálogo de Filmes

![Referência visual da página inicial do Catálogo de Filmes](./design-references/stitch/filmes-populares.png)

## 💬 Descrição

O Catálogo de Filmes é uma aplicação web para descobrir filmes populares, encontrar títulos por busca e gênero, ordenar resultados e consultar detalhes como sinopse, nota, elenco e trailers. Também permite salvar filmes favoritos para acessá-los novamente.

## ✨ Funcionalidades

- [x] Listagem da primeira página de filmes populares do TMDB;
  - [ ] Paginação de resultados;
  - [ ] Busca por título;
  - [ ] Filtro por gênero;
  - [ ] Ordenação por popularidade, nota e data de lançamento;
- [ ] Página de detalhe em `/movie/[id]` com sinopse, nota, elenco principal e trailer, quando houver;
- [ ] Favoritos com persistência no client e uma página ou aba que liste os favoritos.

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
- [Tailwind CSS 4](https://tailwindcss.com/) — estilos;
- [ESLint 9](https://eslint.org/) — análise estática do código;
- [Prettier](https://prettier.io/) — formatação dos arquivos compatíveis.

## 🏗️ Arquitetura

A aplicação usa Next.js com App Router. A página inicial está em `app/page.tsx`, a consulta ao TMDB está em `lib/tmdb.ts`, o layout global e os metadados estão em `app/layout.tsx`, e o cabeçalho compartilhado está em `components/Header.tsx`. Ainda não há backend próprio nem persistência de dados.

## 🧭 Decisões técnicas e trade-offs

- **Next.js com App Router e TypeScript:** tecnologias definidas pelo enunciado, usadas como base da aplicação;
- **Tailwind CSS:** usado para aplicar estilos diretamente nos componentes e manter cores, espaçamentos e comportamento responsivo consistentes. Isso reduz a necessidade de folhas de estilo separadas, embora possa deixar os componentes com classes extensas;
- **Elementos nativos de formulário:** busca e filtros usam input e select do HTML, envolvidos por componentes React reutilizáveis. Isso aproveita semântica, acessibilidade e comportamento padrão do navegador; em contrapartida, a aparência dos controles pode variar entre navegadores;
- **API do TMDB:** a Home busca no servidor a primeira página de filmes populares em português brasileiro; a paginação continua pendente;
- **Pôsteres com `next/image`:** os cards usam imagens responsivas com otimização do Next.js, preservando a proporção de 2:3; os quatro primeiros pôsteres usam `loading="eager"` para não atrasar o LCP da primeira linha no desktop, e os demais usam `loading="lazy"`; a configuração permite imagens de `image.tmdb.org/t/p/w500/`;
- **Persistência de favoritos:** é um requisito funcional, mas ainda não está implementado no projeto atual.

## 🔌 API

O projeto consome a [API pública do TMDB](https://developer.themoviedb.org) com `fetch` nativo no servidor e a variável `TMDB_ACCESS_TOKEN`. A Home apresenta título, nota, ano e pôster dos filmes populares. Enquanto os dados carregam, usa o componente reutilizável `LoadingOverlay`; outros fluxos assíncronos podem usá-lo como estado de carregamento. Quando a API retorna um erro, a Home abre uma modal com a mensagem específica do TMDB ou uma mensagem segura em português. A paginação ainda não foi implementada.

## 🎨 Layout e design system

As imagens de referência para as telas de filmes populares, detalhe do filme e favoritos estão em [`design-references/stitch/`](./design-references/stitch/). A Home usa dados atuais do TMDB e mantém busca, filtros, favoritos e paginação sem comportamento funcional. Cada card aponta para `/movie/[id]`, mas a página de detalhe ainda não está implementada. As cores, tipografia e estilos globais estão definidos em `app/globals.css`; use os tokens de cor nas classes, sem valores literais nos componentes. Após alterações de interface, valide o código e a renderização em desktop e mobile com a skill [`stitch-design-validation`](./.agents/skills/stitch-design-validation/SKILL.md).

## ✅ Testes e validações

A aplicação carrega dados reais do TMDB. Nos testes com Jest, a resposta da API é substituída por respostas controladas para verificar a conversão dos filmes e o tratamento de erros, sem fazer chamadas ao TMDB. Execute-os com:

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
