# Plano 049 — Painel de script: Shiki monocromático e botão copiar (RF-37, F-13)

**Status:** DONE
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

- [x] Destaque gerado no build pelo `<Code>` do Astro, só com `#111112`, `#5A5754` e `#6E6A66` no primeiro plano; nenhuma dependência nova (colors no HTML só os 3 tons + fundo; `package.json` não tocado)
- [x] Script com `aula` casando aparece sob a aula; órfão ou sem `aula` vai para "Scripts da disciplina" (canário do passo 5) — F-13
- [x] Botão copiar oculto sem JS, copia o código exato (conferido colando), anuncia "Copiado" por `aria-live` e volta ao texto original em 2 s, e funciona por teclado — **parcial**: fidelidade byte a byte do `textContent` provada por script, e o `aria-live` agora é limpo depois de 2 s (item 1 da revisão, ver Evidência); "oculto sem JS", "conferido colando" de verdade, o teclado e a observação do `aria-live` no navegador são do passo 6 (orquestrador)
- [x] Rolagem horizontal só dentro do bloco de código em 360 px; página sem rolagem horizontal — orquestrador (passo 6)
- [x] "Abrir arquivo ↗" só com `url` — canário por falsificação em `content/` (ver Evidência)
- [x] Tamanho gzip do JS da página registrado (347 bytes gzip do script do botão copiar — ver Evidência, passo 4, com o desvio do `dist/_astro/*.js` documentado)
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas (`ScriptPanel.astro` 132, `LessonList.astro` 106 — `wc -l` na Evidência)
- [x] `test:coverage` (≥ 80%), `astro check`, `lint`, `format:check`, `build:pipeline` verdes, com saída colada

## Evidência

Capturas em `C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/75bf521c-028a-443b-8b2c-8edf859decad/scratchpad/049` (scratchpad da sessão), inseridas por script.

### Passo 1 — `src/lib/code-theme.ts` + `tests/lib/code-theme.test.ts`

`npx vitest run tests/lib/code-theme.test.ts` (primeira execução, verde):

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  14:44:54
   Duration  1.45s (transform 630ms, setup 0ms, import 875ms, tests 4ms, environment 0ms)
```

**Canário por falsificação** (regra "ler o código não prova comportamento" do `DESPACHO.md`):
troquei `foreground: '#5A5754'` por `foreground: '#FF0000'` em `monochromeTheme` e rodei de novo —
a suíte ficou vermelha, provando que o teste de fato barra uma cor fora das três permitidas:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/code-theme.test.ts (5 tests | 1 failed) 6ms
     × toda cor de tokenColors[*].settings.foreground pertence às três cores permitidas 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/code-theme.test.ts > monochromeTheme > toda cor de tokenColors[*].settings.foreground pertence às três cores permitidas
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/lib/code-theme.test.ts:15:77
     13|       const foreground = rule.settings?.foreground;
     14|       expect(foreground).toBeDefined();
     15|       expect(ALLOWED_FOREGROUNDS.has((foreground as string).toUpperCas…
       |                                                                             ^
     16|     }
     17|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
   Start at  14:45:08
   Duration  811ms (transform 440ms, setup 0ms, import 677ms, tests 6ms, environment 0ms)
```

Revertido o canário (`#FF0000` → `#5A5754`); suíte verde de novo:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  14:45:18
   Duration  811ms (transform 448ms, setup 0ms, import 682ms, tests 4ms, environment 0ms)
```

### Passo 2 — `ScriptPanel.astro`, `LessonList.astro`, `[slug].astro` — `astro check`

Na primeira rodada, `astro check` reprovou com 2 erros de tipo, corrigidos antes deste resultado:
(a) `shikiLanguage` devolvia `string`, incompatível com a prop `lang` de `<Code>` (tipo `CodeLanguage` —
união fechada de literais) — assinatura estreitada para `'python' | 'r' | 'matlab' | 'bash' | 'plaintext'`;
(b) `window.setTimeout` foi tipado `NodeJS.Timeout` pelo ambiente de checagem do Astro (o `@types/node`
global do projeto conflita com o `number` do `lib.dom`) — corrigido com `as unknown as number`,
documentado em comentário no próprio `ScriptPanel.astro`. Resultado final, 0 erros:

```
[2m14:59:49[22m [34m[content][39m Syncing content
[2m14:59:49[22m [34m[content][39m Synced content
[2m14:59:49[22m [34m[types][39m Generated [2m414ms[22m
[2m14:59:49[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (55 files): 
- 0 errors
- 0 warnings
- 0 hints
```

`npx vitest run tests/lib/code-theme.test.ts` de novo, depois de estreitar a assinatura de `shikiLanguage`
(o teste não muda, mas confirma que a mudança de tipo não quebrou o comportamento):

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  14:50:11
   Duration  862ms (transform 481ms, setup 0ms, import 731ms, tests 4ms, environment 0ms)
```

### Passo 3 — Build

`npm run build:pipeline` (build final de verdade — depois de todas as correções do ciclo 2 da
revisão e da formatação do Prettier):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  15:27:57
   Duration  910ms (transform 1.46s, setup 0ms, import 2.37s, tests 62ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m15:28:25[22m [34m[content][39m Syncing content
[2m15:28:25[22m [34m[content][39m Synced content
[2m15:28:25[22m [34m[types][39m Generated [2m422ms[22m
[2m15:28:25[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (55 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m15:28:32[22m [34m[content][39m Syncing content
[2m15:28:32[22m [34m[content][39m Synced content
[2m15:28:32[22m [34m[types][39m Generated [2m399ms[22m
[2m15:28:32[22m [34m[build][39m output: [34m"static"[39m
[2m15:28:32[22m [34m[build][39m mode: [34m"static"[39m
[2m15:28:32[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m15:28:32[22m [34m[build][39m Collecting build info...
[2m15:28:32[22m [34m[build][39m [32m✓ Completed in 435ms.[39m
[2m15:28:32[22m [34m[build][39m Building static entrypoints...
[2m15:28:32[22m [34m[vite][39m [32m✓ built in 325ms[39m
[2m15:28:32[22m [34m[vite][39m [32m✓ built in 46ms[39m
[2m15:28:32[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m15:28:32[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+10ms)[22m 
[2m15:28:32[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+76ms)[22m 
[2m15:28:32[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+5ms)[22m 
[2m15:28:32[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+14ms)[22m 
[2m15:28:32[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m15:28:32[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m15:28:32[22m [32m✓ Completed in 135ms.
[39m
[2m15:28:32[22m [34m[build][39m [32m✓ Completed in 575ms.[39m
[2m15:28:32[22m [34m[build][39m 6 page(s) built in [1m1.03s[22m
[2m15:28:32[22m [34m[build][39m [1mComplete![22m
```

Cores no HTML gerado de `dist/ensino/2026-2-relatividade-geral/index.html` — só os três tons de
primeiro plano mais o fundo (via `background-color`), sem `grep -c` (instrução do orquestrador —
o HTML sai minificado numa linha só, `grep -c` só devolveria 0/1; ver `DESPACHO.md`, "Armadilhas
medidas neste projeto", item 15):

```
     22 color:#111112
     16 color:#5A5754
      5 color:#6E6A66
      1 color:#F7F6F4
```

`grep -o 'Scripts da disciplina' ... | wc -l` no build normal — 0, como esperado (o único script da
disciplina tem `aula: 4` correspondente, então não sobra nenhum para a seção geral):

```
0
```

Posição do painel depois do título da aula 4 — por offset de byte, já que `grep -n` também não serve
em HTML de uma linha só (instrução do orquestrador). "A métrica de Kerr" é o título da aula 4;
"Raio do horizonte de Kerr" é o título do painel de script:

```
9291:A métrica de Kerr
10071:Raio do horizonte de Kerr
```

O offset do painel (10071) é maior que o do título da aula (9291) — o painel vem depois do título,
dentro do mesmo `<li>` da aula 4 (só essa aula tem script agrupado nos dados atuais).

### Passo 4 — Tamanho do JS

**Desvio do texto literal do plano, registrado aqui:** `dist/_astro/*.js` não existe para o site
público neste build (só para o painel `/admin` do Tina, que é código de terceiro, fora do escopo):

```
ls: cannot access 'dist/_astro/*.js': No such file or directory
```

O Astro decidiu **inlinar** os dois `<script type="module">` da página (o do menu do `SiteHeader` e o
do botão copiar do `ScriptPanel`) diretamente no HTML de cada rota, em vez de emitir um arquivo
hasheado em `dist/_astro/`. É comportamento do Astro para scripts de página pequenos — não há flag
deste projeto que force isso, e não editei nenhuma configuração para produzir esse resultado.
Medi o tamanho do script do botão copiar (o que contém `clipboard`) extraído diretamente do HTML
final de `dist/ensino/2026-2-relatividade-geral/index.html`, bruto e comprimido (gzip):

```
script[0]: 495 bytes brutos, 259 bytes gzip, clipboard=false
script[1]: 603 bytes brutos, 347 bytes gzip, clipboard=true
```

`script[1]` (contém `clipboard`) = **603 bytes brutos / 347 bytes gzip** (subiu de 586/344 no
ciclo 1 porque o item obrigatório 1 da revisão acrescentou `status.textContent = '';` no callback
do timeout) — ainda bem abaixo do limite de 50 KB comprimido (RNF-02, conferido pelo plano 052).

### Correções do ciclo 2 (revisão REPROVADA) — itens obrigatórios 1, 2 e 3

**Item 1 — `aria-live` nunca era limpo (`ScriptPanel.astro`, era linhas 119-123).** O plano
(linhas 89-90) e o §5.6 dizem "vira 'Copiado' por 2 s"; o `status.textContent` recebia "Copiado" e
ficava para sempre. Corrigido no mesmo callback do `setTimeout` que já reseta o texto do botão —
agora também esvazia `status.textContent`:

```ts
resetTimeout = window.setTimeout(() => {
  button.textContent = copyLabel;
  status.textContent = '';
}, CODE_STATUS_RESET_MS) as unknown as number;
```

**Item 2 — `font-codigo` não chegava a `pre`/`code` (`ScriptPanel.astro`, era linha 79).** O
preflight do Tailwind declara `code,kbd,samp,pre{font-family:var(--default-mono-font-family,...)}`
direto nesses elementos, o que vence a herança do `font-codigo` aplicado só no `<div>` contêiner.
Troquei a classe do contêiner para `[&_code]:font-codigo [&_pre]:font-codigo`, que gera regras CSS
mirando `pre`/`code` diretamente. Prova no CSS do build (`dist/_astro/*.css`) de que existe uma
regra do painel aplicando `var(--font-codigo)` a `pre` **e** a `code`:

```
.\[\&_code\]\:font-codigo code,.\[\&_pre\]\:font-codigo pre{font-family:var(--font-codigo)}
```

A regra gerada (`.[&_code]:font-codigo code,.[&_pre]:font-codigo pre{font-family:var(--font-codigo)}`)
não tem especificidade igual à do preflight: `.x code` é uma classe + um elemento — (0,1,1) — contra
só o elemento `code` do preflight — (0,0,1). Ela vence pelos dois critérios: especificidade maior
**e** camada de utilitários do Tailwind carregando depois da camada base na cascata.

**Item 3 — `?? []` em `LessonList.astro` tratava cenário impossível (era linhas 60-62, CLAUDE.md
§2).** `groupScriptsByLesson` sempre devolve `byLesson` do mesmo tamanho de `lessons`, e a página
passa o mesmo array `lessons` aos dois. Removido o comentário do canário e o fallback:

```ts
// byLesson tem o mesmo tamanho de lessons (groupScriptsByLesson) — sempre o mesmo array.
const scripts = byLesson[index];
```

Sem `noUncheckedIndexedAccess` no `tsconfig.json` (o projeto usa `astro/tsconfigs/strict`, que não
liga essa opção — só `strictest` liga), `byLesson[index]` tipa como `Script[]`, não
`Script[] | undefined`; `astro check` continua em 0 erros (bloco abaixo).

**Item opcional (f) — `ReturnType<typeof window.setTimeout>` em vez do cast.** Testado: sem o
`as unknown as number`, o `astro check` reprova de novo com o mesmo erro do ciclo 1
(`Type 'number' is not assignable to type 'Timeout'`, porque o `@types/node` global do projeto
conflita com o `number` do `lib.dom` nesse ambiente de checagem). Mantido o cast, com o comentário
aproximado do próprio cast (não mais perto de `let resetTimeout`).

`astro check` depois das três correções (0 erros):

```
[2m15:27:44[22m [34m[content][39m Syncing content
[2m15:27:44[22m [34m[content][39m Synced content
[2m15:27:44[22m [34m[types][39m Generated [2m425ms[22m
[2m15:27:44[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (55 files): 
- 0 errors
- 0 warnings
- 0 hints
```

`ScriptPanel.astro:59` — o comentário `<!-- ... -->` que geraria HTML publicado (item 5.e da
revisão) virou `{/* ... */}` (comentário de template do Astro, não impresso no HTML).

### Passo 5 — Canário órfão F-13 (script sem aula correspondente, em `content/`)

**Por que o método mudou (item 3 da revisão).** O canário do ciclo 1 forçava
`groupScriptsByLesson([], ...)` em `[slug].astro`, produzindo um `byLesson` vazio enquanto
`lessons` continuava com as 5 aulas reais — só funcionava porque `LessonList.astro` tinha o
fallback `byLesson[index] ?? []`. Removido o fallback (item 3), esse método quebraria
(`byLesson[index]` seria `undefined`, e `scripts.length` explodiria) — o canário descreveria
código que não existe mais. Novo método, pré-autorizado pelo README da fase ("Canário que toca
`content/` é pré-autorizado"): em `content/disciplinas/2026.2-relatividade-geral.md`, troquei
temporariamente `aula: 4` por `aula: 99` no único script (nenhum `numero` de aula é 99), para ele
não achar correspondência e degradar para `general` — sem tocar em `[slug].astro` nem em
`LessonList.astro`. Build com o canário aplicado:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  15:24:26
   Duration  859ms (transform 1.36s, setup 0ms, import 2.22s, tests 61ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m15:25:01[22m [34m[content][39m Syncing content
[2m15:25:01[22m [34m[content][39m Synced content
[2m15:25:01[22m [34m[types][39m Generated [2m465ms[22m
[2m15:25:01[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (55 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m15:25:09[22m [34m[content][39m Syncing content
[2m15:25:09[22m [34m[content][39m Synced content
[2m15:25:09[22m [34m[types][39m Generated [2m441ms[22m
[2m15:25:09[22m [34m[build][39m output: [34m"static"[39m
[2m15:25:09[22m [34m[build][39m mode: [34m"static"[39m
[2m15:25:09[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m15:25:09[22m [34m[build][39m Collecting build info...
[2m15:25:09[22m [34m[build][39m [32m✓ Completed in 478ms.[39m
[2m15:25:09[22m [34m[build][39m Building static entrypoints...
[2m15:25:09[22m [34m[vite][39m [32m✓ built in 360ms[39m
[2m15:25:09[22m [34m[vite][39m [32m✓ built in 44ms[39m
[2m15:25:09[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m15:25:10[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+11ms)[22m 
[2m15:25:10[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+88ms)[22m 
[2m15:25:10[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m15:25:10[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+4ms)[22m 
[2m15:25:10[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m15:25:10[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m15:25:10[22m [32m✓ Completed in 137ms.
[39m
[2m15:25:10[22m [34m[build][39m [32m✓ Completed in 600ms.[39m
[2m15:25:10[22m [34m[build][39m 6 page(s) built in [1m1.13s[22m
[2m15:25:10[22m [34m[build][39m [1mComplete![22m
```

Contagem, presença do painel e posição relativa ao fim da lista de aulas — escopado ao `<main>` e
com `grep -o ... | wc -l` (nunca `grep -c` sobre HTML minificado numa linha só —
`DESPACHO.md`, "Armadilhas medidas neste projeto", item 15):

```
=== Scripts da disciplina (grep -o | wc -l) ===
2
=== painel presente (grep -o | wc -l) ===
1
=== offsets, escopados dentro de <main> ===
3927:<main
5417:Scripts da disciplina
10743:</ol>
10872:Scripts da disciplina
11149:Raio do horizonte de Kerr
18474:</ol>
19074:</main
```

Como esperado: "Scripts da disciplina" aparece **2** vezes (o link "Nesta página" gerado por
`presentSections` e o `<h2>` da própria seção — as duas nascem do mesmo script degradado); o
painel ("Raio do horizonte de Kerr") aparece **1** vez. O primeiro `</ol>` (byte 10743, fecho da
lista de aulas do `LessonList`) vem **antes** do `<h2>` "Scripts da disciplina" (10872) e do
painel (11149) — o script órfão saiu da lista de aulas e foi para a seção geral, depois dela. (O
segundo `</ol>` em 18474 é a lista numerada da bibliografia, em `CourseResources`, mais adiante na
página — não faz parte deste critério.)

Revertido com `git checkout -- content/disciplinas/2026.2-relatividade-geral.md` (seguro aqui: o
arquivo está commitado; `[slug].astro` não foi tocado por este canário).
`git status --short -- content/` (vazio — arquivo abaixo, 0 bytes):

```

```

`git diff -- content/` (vazio — arquivo abaixo, 0 bytes), provando a reversão:

```

```

Rebuild depois da reversão, confirmando que o canário não ficou no artefato:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  15:25:46
   Duration  868ms (transform 1.39s, setup 0ms, import 2.27s, tests 61ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m15:26:21[22m [34m[content][39m Syncing content
[2m15:26:21[22m [34m[content][39m Synced content
[2m15:26:21[22m [34m[types][39m Generated [2m479ms[22m
[2m15:26:21[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (55 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m15:26:29[22m [34m[content][39m Syncing content
[2m15:26:29[22m [34m[content][39m Synced content
[2m15:26:29[22m [34m[types][39m Generated [2m422ms[22m
[2m15:26:29[22m [34m[build][39m output: [34m"static"[39m
[2m15:26:29[22m [34m[build][39m mode: [34m"static"[39m
[2m15:26:29[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m15:26:29[22m [34m[build][39m Collecting build info...
[2m15:26:29[22m [34m[build][39m [32m✓ Completed in 458ms.[39m
[2m15:26:29[22m [34m[build][39m Building static entrypoints...
[2m15:26:30[22m [34m[vite][39m [32m✓ built in 311ms[39m
[2m15:26:30[22m [34m[vite][39m [32m✓ built in 45ms[39m
[2m15:26:30[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m15:26:30[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+12ms)[22m 
[2m15:26:30[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+79ms)[22m 
[2m15:26:30[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m15:26:30[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+4ms)[22m 
[2m15:26:30[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m15:26:30[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m15:26:30[22m [32m✓ Completed in 130ms.
[39m
[2m15:26:30[22m [34m[build][39m [32m✓ Completed in 543ms.[39m
[2m15:26:30[22m [34m[build][39m 6 page(s) built in [1m1.02s[22m
[2m15:26:30[22m [34m[build][39m [1mComplete![22m
```

(Os blocos "Cores", "Scripts da disciplina" e offsets do passo 3, acima, são a recaptura final —
feita depois desta reversão **e** depois da formatação do Prettier do passo 7, para descrever o
estado final de verdade.)

### Critério "Abrir arquivo ↗ só com `url`" — canário por falsificação em `content/`

Pré-autorizado pela regra da fase 3 ("Canário que toca `content/` é pré-autorizado", README da
fase 3). Medida **depois** da reversão do canário do passo 5 (arquivo capturado às 15:11, depois do
rebuild pós-reversão de 15:07) — não é uma linha de base anterior a este canário, é o estado corrente
antes de eu começar este canário de `url`: "Abrir arquivo" presente (o único script tem `url`):

```
1
```

Removi temporariamente a linha `url:` do script em
`content/disciplinas/2026.2-relatividade-geral.md` (só o campo `url`, nada de schema) e rebuildei:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  15:05:19
   Duration  868ms (transform 1.39s, setup 0ms, import 2.26s, tests 64ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m15:05:51[22m [34m[content][39m Syncing content
[2m15:05:51[22m [34m[content][39m Synced content
[2m15:05:51[22m [34m[types][39m Generated [2m503ms[22m
[2m15:05:51[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (55 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m15:05:58[22m [34m[content][39m Syncing content
[2m15:05:58[22m [34m[content][39m Synced content
[2m15:05:58[22m [34m[types][39m Generated [2m416ms[22m
[2m15:05:58[22m [34m[build][39m output: [34m"static"[39m
[2m15:05:58[22m [34m[build][39m mode: [34m"static"[39m
[2m15:05:58[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m15:05:58[22m [34m[build][39m Collecting build info...
[2m15:05:58[22m [34m[build][39m [32m✓ Completed in 451ms.[39m
[2m15:05:58[22m [34m[build][39m Building static entrypoints...
[2m15:05:59[22m [34m[vite][39m [32m✓ built in 324ms[39m
[2m15:05:59[22m [34m[vite][39m [32m✓ built in 47ms[39m
[2m15:05:59[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m15:05:59[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+11ms)[22m 
[2m15:05:59[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+82ms)[22m 
[2m15:05:59[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m15:05:59[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+4ms)[22m 
[2m15:05:59[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m15:05:59[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m15:05:59[22m [32m✓ Completed in 130ms.
[39m
[2m15:05:59[22m [34m[build][39m [32m✓ Completed in 533ms.[39m
[2m15:05:59[22m [34m[build][39m 6 page(s) built in [1m1.04s[22m
[2m15:05:59[22m [34m[build][39m [1mComplete![22m
```

"Abrir arquivo" desaparece:

```
0
```

Revertido com `git checkout -- content/disciplinas/2026.2-relatividade-geral.md` (seguro aqui: o
arquivo está commitado). `git status --short -- content/` (vazio — arquivo abaixo, 0 bytes):

```

```

`git diff -- content/` (vazio — arquivo abaixo, 0 bytes), provando a reversão:

```

```

Rebuild final depois da reversão (é o mesmo bloco do passo 3, acima — capturado depois deste
canário, para descrever o estado final de verdade):

"Abrir arquivo" de volta a 1 ocorrência, confirmado antes de recapturar os blocos do passo 3:

```
1
```

### Passo 6 — orquestrador (navegador)

Feito pelo orquestrador em **2026-09-21, 15:40–15:45** (horário local), no **Vivaldi** com a extensão
`claude-in-chrome`, sobre `npx astro preview` servindo o `dist/` gerado pelo `triage-runner` do
ciclo 2 (build às 15:38:50). Nenhum arquivo de `src/` mudou depois desse build, então o artefato
verificado é o mesmo que a revisão aprovou. Servidor encerrado com `astro preview stop` (pid 4036),
portas 4321 e 9000 conferidas livres.

**Método das larguras.** A janela fica maximizada e o `resize_window` não muda o viewport, por isso
a rota foi carregada em `<iframe>` de 360, 768 e 1440 px no documento de topo, com
`box-sizing: content-box`. Na primeira tentativa o `border-box` do próprio site descontou a borda e
deu `innerWidth` 358; a medida válida é a segunda, com `innerWidth` exato. O quarto iframe tem
`sandbox="allow-same-origin"` **sem** `allow-scripts`, e por isso nele o script do componente não
roda (é o teste "sem JS").

Saída transcrita do `javascript_tool` (`page` = `[scrollWidth, clientWidth]` do `documentElement`;
`pre` = o mesmo par no `<pre>` do `<Code>`; `scroller` = o `<div>` contêiner):

```text
f360 | innerWidth=360 | page=[345,345] | pre=[431,255] | scroller=[255,255,auto] | cols=255.2px | font=ui-monospace, "SF Mono", Menlo, Consolas, monospace/14px | btn.hidden=false h=44 | preH=204 | inLi=A métrica de Kerr e buracos negros em ro | bodyScroll=345
f768 | innerWidth=768 | page=[753,753] | pre=[554,554] | scroller=[554,554,auto] | cols=553.775px | font=ui-monospace, "SF Mono", Menlo, Consolas, monospace/14px | btn.hidden=false h=44 | preH=189 | inLi=A métrica de Kerr e buracos negros em ro | bodyScroll=753
f1440 | innerWidth=1440 | page=[1425,1425] | pre=[576,576] | scroller=[576,576,auto] | cols=575.6px 575.6px | font=ui-monospace, "SF Mono", Menlo, Consolas, monospace/14px | btn.hidden=false h=44 | preH=189 | inLi=A métrica de Kerr e buracos negros em ro | bodyScroll=1425
fnojs | innerWidth=360 | page=[345,345] | pre=[431,255] | scroller=[255,255,auto] | cols=255.2px | font=ui-monospace, "SF Mono", Menlo, Consolas, monospace/14px | btn.hidden=true h=0 | preH=204 | inLi=A mé[TRUNCATED]
```

(O `[TRUNCATED]` é corte da própria ferramenta na última linha, não edição.)

- **RF-26, sem rolagem horizontal:** `scrollWidth = clientWidth` nas três larguras (345, 753, 1425;
  a diferença para o `innerWidth` é a barra de rolagem vertical).
- **Rolagem dentro do bloco a 360 px:** o `<pre>` tem `scrollWidth` **431** e `clientWidth` **255**.
  Quem rola é o próprio `<pre>`, e o contêiner fica em 255 = 255. A 768 e a 1440 o código cabe.
- **Duas colunas a partir de `lg`:** `grid-template-columns` com uma trilha a 360 e 768 e duas
  (`575.6px 575.6px`) a 1440.
- **Fonte do §3 no código (obrigatório 2 da revisão):** `getComputedStyle(code).fontFamily` devolve
  `ui-monospace, "SF Mono", Menlo, Consolas, monospace`, e `fontSize` 14px, nas quatro medidas.
- **Painel sob a aula 4:** o `<li>` que contém o `article[data-script]` é o da aula "A métrica de
  Kerr e buracos negros em ro[tação]".
- **Sem JS:** o botão fica `hidden` (altura 0) e o código aparece inteiro (`<pre>` com 204 px de
  altura).
- **Alvo do botão:** 44 px de altura, o mínimo que o plano pede.

**Copiar, conferido colando.** Na página em tamanho real: clique real no botão "Copiar código" e
depois clique num `<textarea>` injetado para a medida e `Ctrl+V` real. Valor colado, lido do
`textarea`:

```text
{"len":323,"equalToCodeBlock":true,"pasted":"def raio_horizonte(massa, spin):\n    \"\"\"Retorna r+ para Kerr, com G = c = 1.\"\"\"\n    if abs(spin) > massa:\n        raise ValueError('spin excede o limite extremo')\n    return massa + (massa**2 - spin**2) ** 0.5\n\nfor m in [1.0, 2.5]:\n    r = raio_horizonte(m, 0.9 * m)\n    print(f\"M={m}: r+ = {r:.4f} 'unidades geometricas'\")"}
```

São 323 caracteres, com a indentação de 4 e 8 espaços, a linha em branco, as aspas simples e
duplas e a f-string intactas. O texto é igual ao do `codigo` em
`content/disciplinas/2026.2-relatividade-geral.md`; a igualdade byte a byte entre o bloco e a
fonte está no passo 3 e foi refeita pela revisão.

**"Copiado" por 2 s e `aria-live`.** Um `MutationObserver` no `article` registrou
`[ms desde a instalação, texto do botão, texto da região aria-live]`. Com clique real:

```text
[[1063,"click"],[1114,"Copiado","\"Copiado\""],[3177,"Copiar código","\"\""]]
```

"Copiado" aparece 51 ms depois do clique e volta 2063 ms depois, no botão **e** na região, que fica
vazia. Isso confere a correção do obrigatório 1 da revisão. Foi o terceiro clique da sessão, e a
região voltou a receber "Copiado" depois de estar vazia, então o reanúncio funciona. Em uma medida
anterior o intervalo deu 2748 ms, com uma captura de tela (`zoom`) da extensão rodando no meio; a
medida limpa é esta. A região é `<span aria-live="polite" class="sr-only" data-status>`, lida por
`getAttribute('aria-live')` = `polite`. O "Copiado" também foi visto na tela, numa captura do
botão.

**Teclado.** Foco posto no botão por `btn.focus()`, depois **Enter real** enviado pela extensão:

```text
[[2412,"click"],[2464,"Copiado","\"Copiado\""],[4531,"Copiar código","\"\""]]
```

O Enter aciona o botão (é um `<button type="button">` nativo, `tabIndex` 0) e o ciclo é o mesmo:
2067 ms. A árvore de acessibilidade (`find`) expõe `button "Copiar código" (type="button")`. O
contorno de foco vem da regra global `:focus-visible{outline:2px solid var(--color-tinta);outline-offset:3px}`
(lida no `dist/_astro/*.css`).

**O que NÃO foi observado, e por quê:**

- **Navegação por Tab até o botão.** A tecla Tab enviada pela extensão não move o foco nesta
  máquina (limitação registrada desde o 042). Por isso não se observou o botão sendo alcançado por
  Tab nem o contorno de `:focus-visible` desenhado; `btn.focus()` por script não liga a heurística
  de `:focus-visible`, que deu `false`. Entra na dívida de Tab do **053**, junto de 042–048.
- **`prefers-reduced-motion: reduce`.** A extensão não expõe a emulação (`matchMedia` deu
  `false`). O único movimento do componente é a troca de texto, que é instantânea. O
  `transition-colors` do botão não tem estado que o dispare, e o `global.css` zera as transições sob
  `reduce`. Nada disso foi observado no estado `reduce`, então fica na dívida de emulação do **053**.
- **Painel *Accessibility* do DevTools.** A extensão não abre o DevTools. No lugar dele usei a
  árvore de acessibilidade pela ferramenta `find` e o atributo `aria-live` lido no DOM.

### Critério "copia o código exato" — caminho escolhido

Escolhi o caminho primário do plano: ler `pre > code`.`textContent` diretamente do bloco gerado pelo
`<Code>` — **não** precisei do fallback `<template data-code>`. Confirmei com um script Node que
extrai o `<pre><code>...</code></pre>` de `dist/ensino/2026-2-relatividade-geral/index.html`, remove
as tags dos tokens do Shiki (preservando o texto), decodifica as entidades HTML que o Astro escreve
na interpolação (`&lt; &gt; &quot; &#39; &amp;`) e compara byte a byte com `codigo` do frontmatter
(lido com `gray-matter`, a mesma biblioteca usada em `tests/lib/courses.test.ts`):

```
codigo (frontmatter) bytes: 323
texto extraido do dist/ bytes: 323
IGUAIS byte a byte: true
```

323 bytes dos dois lados, idênticos. A colagem de verdade num editor (clicar o botão, `Ctrl+V`) é do
orquestrador (passo 6) — essa caixa do critério de aceitação fica vazia aqui.

### Expressão Zod que chegou ao enum de `linguagem`

```ts
disciplinasSchema.shape.scripts.unwrap().element.shape.linguagem.options
```

Já usada em `tests/i18n/pt.test.ts:133` (plano 037) para o mesmo enum — reaproveitada aqui em
`tests/lib/code-theme.test.ts` e, para o tipo de `shikiLanguage` em `src/lib/code-theme.ts`, pela
mesma via de `z.infer<typeof disciplinasSchema>['scripts']` que `src/i18n/pt.ts:48-50` já usa.

### Botão "Copiar código" sólido — o que foi composto, e o que ficou de fora

Não editei `PillButton.astro` (fora de "Arquivos afetados"). Composi no `<button>` do `ScriptPanel`
a paleta sólida da variante `solid` do `PillButton` — `bg-tinta text-papel` e
`border-tinta ... rounded-full border ... transition-colors duration-[120ms]`
(`src/components/PillButton.astro:38-39`). **Deixei de fora** o disco decorativo com `›`
(`PillButton.astro:43-51`): esse elemento é a seta de destino da pílula de **navegação** (§5.3 da
identidade — "disco `--tinta` de 32 px com `›` à direita"), sem sentido para uma ação de copiar, e
o §5.6 (painel de script) não pede disco algum para o botão Copiar, só "sólido". Usei `min-h-11`
(44 px) em vez do `min-h-12` (48 px) da pílula: o próprio plano 049 pede "alvo ≥ 44 px" para este
botão especificamente (não os ≥48 px do §5.3), o mesmo alvo mínimo do botão do menu do celular
(`src/components/SiteHeader.astro:57`, `min-h-11`).

### Passo 7 — Portão de qualidade

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check` — **nota:** no ciclo 1, `LessonList.astro` e `code-theme.ts` reprovaram na
primeira rodada (quebras de linha que o Prettier preferia); no ciclo 2 (correção da revisão),
`ScriptPanel.astro` reprovou de novo pelo mesmo motivo, depois das edições dos itens obrigatórios
1/2/5.e. Em cada rodada rodei `npx prettier --write` no(s) arquivo(s) e re-rodei tudo (astro check,
build, vitest) para confirmar que a formatação não mudou comportamento. O bloco abaixo é a última
rodada, já verde:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test:coverage`:

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  16 passed (16)
      Tests  263 passed (263)
   Start at  15:28:58
   Duration  1.34s (transform 3.55s, setup 0ms, import 6.09s, tests 245ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |                   
 src/lib           |     100 |    99.09 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 248/248 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 67/67 )
Lines        : 100% ( 224/224 )
================================================================================
```

### Tamanho dos quatro arquivos `.astro`/`.ts` tocados

```
  132 src/components/ScriptPanel.astro
  106 src/components/LessonList.astro
  163 src/pages/ensino/[slug].astro
   96 src/lib/code-theme.ts
  497 total
```

`ScriptPanel.astro` (132) e `LessonList.astro` (106) ficam abaixo de 150 linhas — **alvo**, não
invariante (§10.4 do PRD tem essa linha com o hedge "Alvo", diferente das demais que dizem
"proibido"; `DESPACHO.md`, "Regras de código da fase 3", mesma leitura). `[slug].astro` (163) é
página, não componente — mesmo julgamento das revisões do 044/045 para `index.astro` e
`sobre.astro`, registrado em `plans/fase-3-site-publico/README.md`, "Dívidas herdadas".

### Escopo — `git status --short` final (capturado durante a própria edição da Evidência do ciclo 2)

```
 M plans/fase-3-site-publico/049-painel-de-script-shiki-e-copiar.md
 M src/components/LessonList.astro
 M src/pages/ensino/[slug].astro
?? src/components/ScriptPanel.astro
?? src/lib/code-theme.ts
?? tests/lib/code-theme.test.ts
```

Só os cinco arquivos de "Arquivos afetados", mais o próprio plano (permitido: `Status:`, checkboxes
e `## Evidência` — regra 7 de "Confirme o escopo pelo diff" em `DESPACHO.md`), foram tocados:
`src/lib/code-theme.ts` e `tests/lib/code-theme.test.ts` (novos), `src/components/ScriptPanel.astro`
(novo), `src/components/LessonList.astro` e `src/pages/ensino/[slug].astro` (modificados). `content/`
não aparece (os dois canários foram revertidos e provados, ver acima). Nenhum `git add` foi
rodado — fica para o orquestrador, por caminho explícito.

### O que NÃO rodei

- **Passo 6 foi rodado — pelo orquestrador**, não por mim (ver a seção "Passo 6 — orquestrador
  (navegador)" acima). O que ficou de fora **dentro** dele (navegação por Tab até o botão,
  emulação de `prefers-reduced-motion: reduce`, painel *Accessibility* do DevTools — a extensão
  não expõe nenhum dos três nesta máquina) está descrito na própria seção, com o motivo de cada um.
- Eu (executor) não commitei nada, não mudei `Status:` (continua `TODO`), não rodei `git add`.
- Eu (executor) não rodei `npm audit` nem `npm ci` (não fazem parte do portão do passo 7 deste
  plano).
- Eu (executor) não rodei `astro preview` nem subi servidor algum — quem rodou foi o orquestrador,
  no passo 6, e já encerrou (`astro preview stop`, portas conferidas livres, ver a seção acima).
