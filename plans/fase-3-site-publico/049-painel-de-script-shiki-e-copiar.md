# Plano 049 — Painel de script: Shiki monocromático e botão copiar (RF-37, F-13)

**Status:** TODO
**RFs cobertos:** **RF-37**, **F-13**, RN-05 (código no próprio conteúdo), RNF-02, RNF-15, RF-26
**Depende de:** planos 041 (`groupScriptsByLesson`), 048 (página de disciplina e `LessonList`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Os scripts de cada disciplina aparecem com destaque de sintaxe gerado **no build**, num tema de três
tons de cinza, com botão "Copiar código" que funciona por teclado e anuncia "Copiado" — agrupados sob
a aula correspondente, e os demais num grupo geral da disciplina (F-13).

## Arquivos afetados

- `src/lib/code-theme.ts` — novo: tema Shiki `monochromeTheme` e `shikiLanguage`
- `tests/lib/code-theme.test.ts` — novo
- `src/components/ScriptPanel.astro` — novo (inclui o `<script>` do botão copiar)
- `src/components/LessonList.astro` — acrescenta a prop `byLesson` e renderiza os painéis
- `src/pages/ensino/[slug].astro` — passa `byLesson` e renderiza a seção "Scripts da disciplina"

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Não rode build ao mesmo tempo que outro executor.

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §5.6 (Painel de script), §2 (cores e contrastes,
inclusive o `#6E6A66`), §3 (monoespaçada **só** aqui, do sistema), §7 ("Copiado" como movimento que
responde a ação). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**Destaque no build (README da fase, decisão 5).** Use `import { Code } from 'astro:components'`. As
props relevantes, conferidas em `node_modules/astro/components/Code.astro`: `code`, `lang?:
CodeLanguage` (default `"plaintext"`), `theme?: ThemePresets | ThemeRegistration |
ThemeRegistrationRaw` (default `"github-dark"`), `wrap?: boolean | null`. O componente gera HTML com
`style` inline por token e **nenhum JS**. **Não** instale `shiki`, `prismjs` nem nada: o Shiki já vem
com o Astro.

**`src/lib/code-theme.ts`:**
- `export const monochromeTheme` — objeto de tema no formato TextMate/Shiki (`name`, `type: 'light'`,
  `colors: { 'editor.background': '#F7F6F4', 'editor.foreground': '#111112' }`, `tokenColors: [...]`),
  com exatamente três cores de primeiro plano:
  - `#111112` (`--tinta`) — padrão;
  - `#5A5754` (`--secundario`) — escopos `keyword`, `storage`, `keyword.control`, `storage.type`;
  - `#6E6A66` (comentário) — escopos `comment`, `string`, `punctuation.definition.comment`,
    `punctuation.definition.string`.
  Sem negrito/itálico (monocromático é tom, não peso). Tipagem: `ThemeRegistration` importado de
  `shiki` **como tipo** (`import type`) — se o tipo não resolver sem declarar `shiki` como dependência,
  tipe estruturalmente e registre na Evidência; **não** acrescente dependência.
- `export function shikiLanguage(linguagem: 'python' | 'r' | 'matlab' | 'bash' | 'outro'): string` —
  `python`→`python`, `r`→`r`, `matlab`→`matlab`, `bash`→`bash`, `outro`→`plaintext`. O enum vem de
  `scriptSchema.linguagem` (`src/content.config.ts:342`); tipe a partir de `disciplinasSchema` para
  o `astro check` reprovar se o enum mudar.
- Por que as cores são essas: contraste calculado na identidade (§2) — `#6E6A66` dá 4,96:1 sobre
  `#F7F6F4`, `#5A5754` 6,65:1, `#111112` 17,47:1; todos ≥ 4,5:1 (RNF-15).

**Teste `code-theme.test.ts`:** (1) toda cor de `tokenColors[*].settings.foreground` e de
`colors['editor.foreground']` pertence a `{#111112, #5A5754, #6E6A66}` (normalize maiúsculas);
(2) nenhum `fontStyle` além de `''`/ausente; (3) `shikiLanguage` para os cinco valores; (4) as chaves
testadas em (3) são exatamente as opções do enum `linguagem`. `scriptSchema` **não** é exportado de
`src/content.config.ts` (e o arquivo não pode ser editado nesta fase): chegue ao enum por
`disciplinasSchema.shape.scripts`, desembrulhando o `optional` e o `array` com a API do Zod 4
(`astro/zod`), e cole na Evidência a expressão que funcionou.

**`ScriptPanel.astro`** (§5.6) — props: `script` (`{ titulo, descricao?, linguagem, codigo, url? }`).
- `<article>` com `bg-bloco border border-regua`; a partir de `lg`, duas colunas (texto à esquerda,
  código à direita); abaixo, empilha.
- Esquerda: rubrica `pt.script.eyebrow(pt.script.language[linguagem])` (`text-rotulo`) · título
  `<h3 class="text-titulo-item">` · `descricao` via `toParagraphs` · botão **Copiar código**
  (`<button type="button">`, variante sólida visual da pílula, alvo ≥ 44 px) · `ExternalLink` com
  `pt.script.openFile` **só se `url`**.
- Direita: `<Code code={codigo} lang={shikiLanguage(linguagem)} theme={monochromeTheme} />` dentro de
  um contêiner com `font-codigo text-[0.875rem] overflow-x-auto` — **a rolagem horizontal é dentro
  do bloco**, nunca da página (RF-26). Sem `wrap`: Python depende da indentação visível.
- Região `<span aria-live="polite" class="sr-only" data-status></span>` para anunciar "Copiado".

**Botão copiar — melhoria progressiva (§1 regra 3).** O botão nasce com `hidden` no HTML. O
`<script>` do componente (empacotado pelo Astro, **sem** `is:inline`, deduplicado entre painéis):
para cada `article[data-script]`, se `navigator.clipboard?.writeText` existe, remove `hidden`; no
clique, copia **`codigo` exato** — lido de `pre > code`.`textContent` do bloco gerado pelo `<Code>`
(confira no HTML gerado que `textContent` devolve o código byte a byte; se não devolver, grave o código
num `<template data-code>{codigo}</template>` escapado pelo Astro e leia `content.textContent` —
registre qual caminho usou) —, troca o texto do botão para `pt.script.copied` e escreve o mesmo texto
no `aria-live` por 2 s, depois volta a `pt.script.copy`. Os dois textos chegam ao script por
`data-copy-label`/`data-copied-label` no botão (nada de string de interface no JS). Falha do
`writeText` (permissão) → texto do botão não muda; sem `alert`.

**Integração (F-13, RF-37).**
- `[slug].astro`: `const { byLesson, general } = groupScriptsByLesson(data.aulas ?? [], data.scripts
  ?? [])`; passa `byLesson` ao `LessonList`; acrescenta `<section id="scripts">` com `<h2>`
  `pt.course.courseScripts` e um `ScriptPanel` por item de `general`, **só se `general.length > 0`**,
  **depois** de Aulas e antes de Listas (ordem do §6.5). Remova o comentário `// plano 049` deixado
  pelo 048.
- `LessonList.astro`: prop `byLesson: Script[][]`; sob cada aula `i`, os `ScriptPanel` de
  `byLesson[i]`, na ordem.

**Dados atuais** (`content/disciplinas/2026.2-relatividade-geral.md:56-71`): um script Python, `aula:
4`, com `url`, código de 9 linhas com indentação de 4 espaços, linha em branco, aspas simples e duplas
e f-string. Esperado: painel sob a aula 4 ("A métrica de Kerr…"), nenhuma seção "Scripts da
disciplina", link "Abrir arquivo ↗".

**RNF-02:** o JS total da página tem de continuar pequeno. Registre o tamanho do `.js` do copiar
(passo 4); o limite de 50 KB comprimido é conferido pelo 052.

## Passos

1. `code-theme.ts` + teste → verify: `npx vitest run tests/lib/code-theme.test.ts` colado.
2. `ScriptPanel.astro`, `LessonList.astro`, `[slug].astro` → verify: `npx astro check` com resumo colado.
3. Build → verify: `npm run build:pipeline` colado. No HTML de `dist/ensino/2026-2-relatividade-geral/index.html`: cole `grep -o 'color:#[0-9A-Fa-f]*' ... | sort | uniq -c` (só os três tons, mais o fundo), `grep -c 'Scripts da disciplina' ...` (0) e a posição do painel depois do título da aula 4 (`grep -n 'A métrica de Kerr\|Raio do horizonte de Kerr' ...`).
4. JS → verify: `ls -l dist/_astro/*.js` colado e, para o arquivo referenciado pela página, o tamanho gzip (`node -e "const z=require('zlib'),f=require('fs');console.log(z.gzipSync(f.readFileSync(process.argv[1])).length)" <arquivo>`).
5. Canário F-13, sem tocar em `content/`: em `[slug].astro`, passe temporariamente `[]` como `aulas` a `groupScriptsByLesson`, build, cole `grep -c 'Scripts da disciplina' ...` = 1 e o painel presente; desfaça → verify: saídas coladas e versão final conferida.
6. Orquestrador — navegador em `/ensino/2026-2-relatividade-geral/`, 360/768/1440: `[scrollWidth, clientWidth]` iguais **com o bloco de código rolando por dentro** em 360 (transcreva `scrollWidth` do `<pre>` maior que o seu `clientWidth`); clicar "Copiar código" e colar num editor — cole aqui o texto colado e compare com o `codigo` do arquivo (indentação intacta); ativar o botão só por teclado (Tab + Enter); "Copiado" aparece e volta em ~2 s; *Accessibility* do DevTools mostra o `aria-live`. Com JS desligado: botão ausente, código visível. Com *prefers-reduced-motion: reduce*: sem transição.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Destaque gerado no build pelo `<Code>` do Astro, só com `#111112`, `#5A5754` e `#6E6A66` no primeiro plano; nenhuma dependência nova
- [ ] Script com `aula` casando aparece sob a aula; órfão ou sem `aula` vai para "Scripts da disciplina" (canário do passo 5) — F-13
- [ ] Botão copiar oculto sem JS, copia o código exato (conferido colando), anuncia "Copiado" por `aria-live` e funciona por teclado
- [ ] Rolagem horizontal só dentro do bloco de código em 360 px; página sem rolagem horizontal
- [ ] "Abrir arquivo ↗" só com `url`
- [ ] Tamanho gzip do JS da página registrado
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [ ] `test:coverage` (≥ 80%), `astro check`, `lint`, `format:check`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–5, 7) e pelo orquestrador (6). Declare o que NÃO rodou.>
