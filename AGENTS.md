## Idioma da documentação

- Escreva em português o conteúdo de todos os arquivos Markdown (`.md`) do projeto.

## README

- Ao verificar alterações pertinentes no projeto que precisem ser refletidas na documentação, atualize as informações correspondentes no `README.md`.

## Nomes de componentes

- Ao criar, renomear ou revisar nomes de componentes de interface, seguir a skill `component-naming-pascalcase`.

## Ícones SVG

- Não use SVGs diretamente no JSX de outros componentes. Encapsule cada SVG em um componente próprio dentro de `components/icons/`, com arquivo em PascalCase.

## Exports TypeScript

- Em arquivos `.ts` e `.tsx`, use exports nomeados; evite `export default`.
- Exceção: arquivos de convenção do Next.js que exigem exportação padrão devem manter `export default`. Isso inclui componentes do App Router, como `page.tsx`, `layout.tsx`, `template.tsx`, `default.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`, `forbidden.tsx` e `unauthorized.tsx`, e o arquivo de configuração `next.config.ts`.

## Formatação

- Use o Prettier para formatar todos os arquivos compatíveis alterados antes de concluir uma tarefa e confirme com `npm run format:check`.

## Referência de design

- Ao criar ou alterar interfaces, siga sempre o design do [projeto Upflow — Catálogo de Filmes no Stitch](https://stitch.withgoogle.com/projects/9710530646483095648), incluindo cores, tipografia, espaçamentos, componentes e Header.
- As imagens usadas como base para criar o layout no Stitch estão na pasta [design-references/stitch/](design-references/stitch/).
- Após cada alteração de interface, siga a skill [stitch-design-validation](.agents/skills/stitch-design-validation/SKILL.md) para conferir o código e a interface renderizada em desktop e mobile; corrija divergências introduzidas e repita a validação antes de concluir.

## Cores

- Não use cores literais em classes Tailwind, estilos inline ou CSS de componentes. Use a classe correspondente a um token definido em `app/globals.css` (`border-border`, por exemplo); mantenha os valores hexadecimais centralizados nos tokens do tema.

## Regras de Git

- Escreva todas as mensagens de commit em português e siga o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).
- Não execute operações Git — incluindo commit, push, merge, rebase ou criação de PR — sem autorização explícita do usuário.
