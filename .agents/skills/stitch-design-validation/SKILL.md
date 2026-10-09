---
name: stitch-design-validation
description: Valida código e interface renderizada contra o design do projeto Upflow no Google Stitch após criar ou alterar interfaces, componentes ou estilos neste repositório.
---

# Validação do design no Stitch

Use esta skill após cada alteração de interface neste projeto, incluindo mudanças em componentes e estilos. O objetivo é manter a implementação alinhada ao [projeto Upflow no Stitch](https://stitch.withgoogle.com/projects/9710530646483095648).

## Procedimento

1. Consulte a referência do Stitch e as imagens correspondentes em `design-references/stitch/`.
2. Revise o código alterado: cores devem usar utilitários Tailwind associados aos tokens de `app/globals.css`; compare também tipografia, espaçamentos, componentes e Header com as referências.
3. Abra a aplicação no navegador disponibilizado pelo Codex e inspecione as áreas afetadas em desktop e mobile, incluindo estados relevantes, como foco, hover e desabilitado.
4. Compare visualmente a interface renderizada com o Stitch. Corrija divergências introduzidas pela alteração e repita as verificações de código e navegador.

Se o Stitch estiver inacessível, use as imagens em `design-references/stitch/` como referência e informe essa limitação. Se a interface não puder ser renderizada ou comparada, descreva o impedimento e não declare a validação visual como concluída. Recorra ao MCP do Playwright caso o navegador do Codex não esteja disponível.
