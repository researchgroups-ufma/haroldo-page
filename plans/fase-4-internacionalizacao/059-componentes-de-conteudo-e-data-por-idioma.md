# Plano 059 — Componentes de conteúdo e data por idioma

**Status:** TODO
**RFs cobertos:** §8.3 (data no formato do locale da rota), §10.4; menor adiado do polimento (`hover:underline` sem o afastamento único)
**Depende de:** planos 055 (comparador), 056 (`localeFromPath`), 057 (`strings`, `date.format`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 6)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Os componentes de conteúdo usam o dicionário do idioma do caminho, e `formatDate` formata a data
pelo locale (`10/08/2026` em PT; `August 10, 2026` em EN). As páginas PT continuam **idênticas**,
com uma única diferença deliberada e listada: o sublinhado de hover dos títulos de aula, lista,
material e link ganha o afastamento de 6 px do resto do site.

## Arquivos afetados

- `src/lib/date.ts` — `formatDate(value, lang)`
- `tests/lib/date.test.ts` — acompanha
- `src/components/ExternalLink.astro`
- `src/components/LessonList.astro` — dicionário, `formatDate(…, lang)` e a classe de hover
- `src/components/ScriptPanel.astro`
- `src/components/CourseResources.astro` — dicionário, `formatDate(…, lang)` e a classe de hover
- `src/components/PublicationItem.astro`
- `src/pages/ensino.astro` — só a chamada `formatDate(latest.data)` → `formatDate(latest.data, 'pt')`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite.

## Contexto necessário

**Padrão** (decisão de fatiamento 2 do README da fase): em cada componente,
`const lang = localeFromPath(Astro.url.pathname); const t = strings(lang);` e troca de `pt.` por
`t.`. Usos atuais de `pt` (grep de 2026-09-24): `ExternalLink.astro:39` (`site.opensInNewTab`),
`LessonList.astro:71` (`course.lessonNumber`), `ScriptPanel.astro:58,69,70,73,78`
(`script.eyebrow`, `script.language`, `copy`, `copied`, `openFile`), `CourseResources.astro:52,61,72,76,93,100,111`,
`PublicationItem.astro:47-49` (`publications.doi`/`arxiv`/`pdf`).

**`src/lib/date.ts`** (45 linhas): `formatDate(value)` casa `^(\d{4})-(\d{2})-(\d{2})$` sobre
`value.trim()` e devolve `dd/mm/aaaa`; fora do padrão, devolve `value.trim()`. Nova assinatura:
`formatDate(value: string, lang: Locale): string` — casou o padrão, delega a
`strings(lang).date.format(year, month, day)` (057); não casou, devolve `value.trim()` como hoje. Sem
`Date` nem `Intl` (a nota do cabeçalho explica o fuso). Callers conferidos por grep:
`LessonList.astro:72`, `CourseResources.astro:61`, `src/pages/ensino.astro:83`.
`tests/lib/date.test.ts`: os casos PT existentes passam a chamar com `'pt'`; acrescente EN
(`'2026-08-10'` → `'August 10, 2026'`, `'2026-03-05'` → `'March 5, 2026'`, texto livre intacto, mês
`13` conforme o `en.date.format` do 057).

**Hover (menor adiado do polimento, `plans/README.md` "Para a fase 4", item 5):** a identidade
(`docs/identidade-visual.md` §5.3) diz "Hover: sublinhado de 1 px deslocado 6 px no título"; o resto
do site usa `decoration-1 underline-offset-[6px]` com o `hover:underline` (ex.:
`src/pages/ensino.astro:114`, `src/pages/404.astro:49`). Em `LessonList.astro:75` e
`CourseResources.astro:56,78,115` falta o afastamento. Acrescente `decoration-1 underline-offset-[6px]`
a essas quatro classes — e **só** a elas (o link "Acessar" da bibliografia usa `underline` fixo, não
hover; não mexa).

**Prova em duas etapas**, para a diferença deliberada não se misturar com a refatoração:
1. só a troca de dicionário e de `formatDate` → comparador **todo `IGUAL`**;
2. depois a classe de hover → comparador `DIFERENTE` **apenas** nas rotas `ensino/<slug>/index.html`,
   e o contexto impresso mostrando só a classe nova.

**Regras de código:** README da fase 4.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `date.ts` e o teste → verify: `npm test -- --reporter=verbose tests/lib/date.test.ts` colado.
3. Troca de dicionário nos cinco componentes e a chamada em `ensino.astro` → verify: `npx astro check` colado.
4. Etapa 1 → verify: `npm run build:pipeline`; `retrato <scratch>\meio.json`; `comparar antes.json meio.json` colado — toda rota `IGUAL`, exit 0.
5. Classe de hover nos quatro links → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar meio.json depois.json` colado — `DIFERENTE` só nas páginas de disciplina, com o contexto mostrando `decoration-1 underline-offset-[6px]`; demais `IGUAL`.
6. **Orquestrador — navegador** (README da fase): `/ensino/2026-2-relatividade-geral/` a 1440: hover num título de aula e num material mostra o sublinhado afastado como o de `/ensino/`; data da aula em `dd/mm/aaaa`; `[scrollWidth, clientWidth]` a 360/768/1440.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados.

## Critérios de aceitação

- [x] Nenhum dos cinco componentes importa `pt` direto
- [x] `formatDate(value, lang)` com testes PT e EN; nenhum `Date`/`Intl`
- [x] Etapa 1 do comparador toda `IGUAL`; etapa 2 `DIFERENTE` só nas páginas de disciplina e só pela classe de hover
- [x] Hover com o afastamento de 6 px observado no navegador (passo 6, orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

### Correções do ciclo 1 de revisão (REPROVADO)

1. **Cabeçalho §10.1 desatualizado.** `src/components/LessonList.astro:8` dizia "descrição, data
   pt-BR quando houver" — falso depois deste plano, porque a data passou a sair no formato do
   locale da rota (`formatDate(aula.data, lang)`, §8.3 do PRD), não sempre em pt-BR. Corrigido para
   "descrição, data no formato do locale da rota quando houver (§8.3 do PRD)". Conferido por
   `grep -n "pt-BR\|dd/mm" src/components/LessonList.astro src/components/CourseResources.astro
   src/lib/date.ts src/components/ExternalLink.astro src/components/ScriptPanel.astro
   src/components/PublicationItem.astro src/pages/ensino.astro tests/lib/date.test.ts`: nenhuma
   outra ocorrência nos arquivos afetados descreve o formato da data de forma desatualizada —
   `date.ts:6` diz "`dd/mm/aaaa` em PT" (explicitamente escopado ao locale PT, continua verdade) e
   `date.test.ts:5` é o nome de um teste que roda com `lang: 'pt'` (também verdade).
2. **Evidência do passo 5 sem `.txt` e com erro de fato.** O bloco de contagem por arquivo não
   tinha o comando que o gerou, não tinha `.txt` de origem, misturava anotação dentro do bloco de
   código, e descrevia as cinco ocorrências de `404.html` como um "botão 'Todas as páginas'" — não
   há botão: são os cinco links `<a>` da lista sob o título "Todas as páginas"
   (`src/pages/404.astro:46-49`, dentro de `navItems('pt').map(...)`), e a ocorrência de
   `/ensino/` é o título da disciplina anterior (`src/pages/ensino.astro:114`) — as duas já tinham
   essa classe antes deste plano. Refeito: laço de contagem capturado em `.txt` (comando + saída
   literal, sem anotação dentro do bloco), a explicação em prosa fora do bloco de código, abaixo.

Como a correção 1 editou um comentário de `src/components/LessonList.astro` depois dos blocos já
capturados, a ordem obrigatória (edições → build → verificações finais) foi refeita: `npx astro
check` (passo 3), `build:pipeline` com um retrato novo em `depois2.json` — não sobrescrevendo
`depois.json` — mais `comparar depois.json depois2.json` (prova de que a correção de texto não
mudou o `dist/`) e `comparar meio.json depois2.json` (novo bloco final da etapa 2), e o portão do
passo 7 (`lint`, `format:check`, `test:coverage`, `test:dist`). Os blocos desses passos, abaixo,
são as capturas refeitas depois da correção — a captura anterior a elas não aparece mais nesta
seção.

### Passo 1 — retrato "antes" (`npm run build:pipeline`; árvore em `515da7d`, sem edição)

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  15:23:04
   Duration  909ms (transform 1.35s, setup 0ms, import 2.23s, tests 58ms, environment 0ms)

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
15:23:35 [content] Syncing content
15:23:35 [content] Synced content
15:23:35 [types] Generated 416ms
15:23:35 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

15:23:43 [content] Syncing content
15:23:43 [content] Synced content
15:23:43 [types] Generated 404ms
15:23:43 [build] output: "static"
15:23:43 [build] mode: "static"
15:23:43 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:23:43 [build] Collecting build info...
15:23:43 [build] ✓ Completed in 439ms.
15:23:43 [build] Building static entrypoints...
15:23:43 [vite] ✓ built in 334ms
15:23:43 [vite] ✓ built in 74ms
15:23:43 [build] Rearranging server assets...

 generating static routes 
15:23:44   ├─ /404.html (+11ms) 
15:23:44   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
15:23:44   ├─ /ensino/2026-2-relatividade-geral/index.html (+82ms) 
15:23:44   ├─ /ensino/index.html (+4ms) 
15:23:44   ├─ /pesquisa/index.html (+5ms) 
15:23:44   ├─ /publicacoes/index.html (+4ms) 
15:23:44   ├─ /sobre/index.html (+5ms) 
15:23:44   ├─ /index.html (+3ms) 
15:23:44 ✓ Completed in 146ms.

15:23:44 [build] ✓ Completed in 610ms.
15:23:44 [build] 8 page(s) built in 1.11s
15:23:44 [build] Complete!
EXIT=0
```

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\53cca4d5-8b1a-44f1-b616-f47fe760fbbb\scratchpad\059\antes.json
EXIT=0
```

### Passo 2 — `date.ts` (assinatura `formatDate(value, lang)`) e `tests/lib/date.test.ts`

`npm test -- --reporter=verbose tests/lib/date.test.ts`:

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/lib/date.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/date.test.ts > formatDate > formata aaaa-mm-dd como dd/mm/aaaa em pt 1ms
 ✓ tests/lib/date.test.ts > formatDate > remove espaço nas pontas antes de formatar 0ms
 ✓ tests/lib/date.test.ts > formatDate > devolve texto livre sem alteração 0ms
 ✓ tests/lib/date.test.ts > formatDate > não formata ano ou mês com um dígito 0ms
 ✓ tests/lib/date.test.ts > formatDate > não formata data com hora 0ms
 ✓ tests/lib/date.test.ts > formatDate > determinismo de fuso > não depende do fuso da máquina de build 1ms
 ✓ tests/lib/date.test.ts > formatDate > locale en (§8.3 do PRD; decisão 6 do fatiamento da fase 4) > formata aaaa-mm-dd como "Month D, aaaa" 0ms
 ✓ tests/lib/date.test.ts > formatDate > locale en (§8.3 do PRD; decisão 6 do fatiamento da fase 4) > não acrescenta zero à esquerda no dia 0ms
 ✓ tests/lib/date.test.ts > formatDate > locale en (§8.3 do PRD; decisão 6 do fatiamento da fase 4) > devolve texto livre sem alteração 0ms
 ✓ tests/lib/date.test.ts > formatDate > locale en (§8.3 do PRD; decisão 6 do fatiamento da fase 4) > mês fora de 01–12 devolve o valor como digitado, sem inventar mês 0ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  15:24:19
   Duration  192ms (transform 46ms, setup 0ms, import 65ms, tests 4ms, environment 0ms)

EXIT=0
```

### Passo 3 — troca de dicionário nos cinco componentes e em `ensino.astro` (só a chamada `formatDate`)

`npx astro check`, recapturado depois da correção 1 do ciclo de revisão (última edição de código
deste plano — o comentário de `LessonList.astro:8`):

```
﻿15:37:23 [content] Syncing content
15:37:23 [content] Synced content
15:37:23 [types] Generated 437ms
15:37:23 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 4 — etapa 1 do comparador (dicionário + `formatDate`, sem classe de hover)

`npm run build:pipeline`:

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  15:26:06
   Duration  951ms (transform 1.43s, setup 0ms, import 2.40s, tests 61ms, environment 0ms)

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
15:26:36 [content] Syncing content
15:26:36 [content] Synced content
15:26:36 [types] Generated 442ms
15:26:36 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

15:26:45 [content] Syncing content
15:26:45 [content] Synced content
15:26:45 [types] Generated 413ms
15:26:45 [build] output: "static"
15:26:45 [build] mode: "static"
15:26:45 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:26:45 [build] Collecting build info...
15:26:45 [build] ✓ Completed in 449ms.
15:26:45 [build] Building static entrypoints...
15:26:45 [vite] ✓ built in 325ms
15:26:45 [vite] ✓ built in 76ms
15:26:45 [build] Rearranging server assets...

 generating static routes 
15:26:45   ├─ /404.html (+11ms) 
15:26:45   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
15:26:45   ├─ /ensino/2026-2-relatividade-geral/index.html (+84ms) 
15:26:45   ├─ /ensino/index.html (+5ms) 
15:26:45   ├─ /pesquisa/index.html (+4ms) 
15:26:45   ├─ /publicacoes/index.html (+4ms) 
15:26:45   ├─ /sobre/index.html (+4ms) 
15:26:45   ├─ /index.html (+2ms) 
15:26:45 ✓ Completed in 144ms.

15:26:45 [build] ✓ Completed in 597ms.
15:26:45 [build] 8 page(s) built in 1.10s
15:26:45 [build] Complete!
EXIT=0
```

`node scripts/comparar-dist.mjs retrato`:

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\53cca4d5-8b1a-44f1-b616-f47fe760fbbb\scratchpad\059\meio.json
EXIT=0
```

`node scripts/comparar-dist.mjs comparar antes.json meio.json` — toda rota `IGUAL`, exit 0:

```
﻿IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
EXIT=0
```

### Passo 5 — etapa 2 do comparador (classe `decoration-1 underline-offset-[6px]` nas quatro classes `hover:underline`)

Recapturado inteiro depois da correção 1 do ciclo de revisão — `depois.json` (retrato de antes da
correção) fica preservado; o retrato novo vai para `depois2.json`.

`npm run build:pipeline`:

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  15:37:39
   Duration  907ms (transform 1.44s, setup 0ms, import 2.37s, tests 57ms, environment 0ms)

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
15:38:10 [content] Syncing content
15:38:11 [content] Synced content
15:38:11 [types] Generated 429ms
15:38:11 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

15:38:19 [content] Syncing content
15:38:19 [content] Synced content
15:38:19 [types] Generated 416ms
15:38:19 [build] output: "static"
15:38:19 [build] mode: "static"
15:38:19 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:38:19 [build] Collecting build info...
15:38:19 [build] ✓ Completed in 452ms.
15:38:19 [build] Building static entrypoints...
15:38:19 [vite] ✓ built in 340ms
15:38:20 [vite] ✓ built in 74ms
15:38:20 [build] Rearranging server assets...

 generating static routes 
15:38:20   ├─ /404.html (+10ms) 
15:38:20   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
15:38:20   ├─ /ensino/2026-2-relatividade-geral/index.html (+85ms) 
15:38:20   ├─ /ensino/index.html (+5ms) 
15:38:20   ├─ /pesquisa/index.html (+4ms) 
15:38:20   ├─ /publicacoes/index.html (+4ms) 
15:38:20   ├─ /sobre/index.html (+4ms) 
15:38:20   ├─ /index.html (+3ms) 
15:38:20 ✓ Completed in 146ms.

15:38:20 [build] ✓ Completed in 643ms.
15:38:20 [build] 8 page(s) built in 1.10s
15:38:20 [build] Complete!
EXIT=0
```

`node scripts/comparar-dist.mjs retrato`:

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\53cca4d5-8b1a-44f1-b616-f47fe760fbbb\scratchpad\059\depois2.json
EXIT=0
```

`node scripts/comparar-dist.mjs comparar depois.json depois2.json` — prova de que a correção 1 (só
um comentário de `LessonList.astro`) não mudou o `dist/`: toda rota `IGUAL`, exit 0:

```
﻿IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
EXIT=0
```

`node scripts/comparar-dist.mjs comparar meio.json depois2.json` — bloco final da etapa 2:
`DIFERENTE` esperado (diferença deliberada da classe de hover), exit 1 esperado do comparador nesta
etapa; só `ensino/2026-2-relatividade-geral/index.html` diverge (a outra disciplina,
`ensino/2025-1-mecanica-classica`, não tem aulas/materiais/listas/links no conteúdo — nada que
renderize um link `hover:underline`), e o contexto impresso mostra exatamente a classe nova
acrescentada ao `hover:underline` já existente — mesmo resultado de antes da correção 1 (que não
tocou o `dist/`, confirmado acima):

```
﻿IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
DIFERENTE  ensino/2026-2-relatividade-geral/index.html
           primeira divergência no caractere 6362
           antes : …Aula 1</span>10/08/2026</p><h3 class="text-titulo-item mt-1"><a href="https://exemplo.invalid/rg-2026-2/aula-01" class="hover:underline" target="_blank" rel="noopener noreferrer">Variedades, tensores e a conexão de Levi-Civita<span aria-hid…
           depois: …Aula 1</span>10/08/2026</p><h3 class="text-titulo-item mt-1"><a href="https://exemplo.invalid/rg-2026-2/aula-01" class="decoration-1 underline-offset-[6px] hover:underline" target="_blank" rel="noopener noreferrer">Variedades, tensores e a …
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
EXIT=1
```

Confirmação por grep, sobre o `dist/` deste build (`depois2.json`, o mesmo da captura acima) — a
página de disciplina que mudou tem só a classe nova nos dez links `hover:underline` (nenhum
`class="hover:underline"` cru restante); as demais rotas não ganharam nenhuma ocorrência nova de
`underline-offset-[6px]`:

```
$ grep -o 'decoration-1 underline-offset-\[6px\] hover:underline' dist/ensino/2026-2-relatividade-geral/index.html | wc -l
10
$ grep -o 'class="hover:underline"' dist/ensino/2026-2-relatividade-geral/index.html | wc -l
0
$ for f in dist/404.html dist/ensino/2025-1-mecanica-classica/index.html dist/ensino/index.html dist/index.html dist/pesquisa/index.html dist/publicacoes/index.html dist/sobre/index.html; do echo "$f:"; grep -o 'underline-offset-\[6px\]' "$f" | wc -l; done
dist/404.html:
5
dist/ensino/2025-1-mecanica-classica/index.html:
0
dist/ensino/index.html:
1
dist/index.html:
0
dist/pesquisa/index.html:
0
dist/publicacoes/index.html:
0
dist/sobre/index.html:
0
EXIT=0
```

As cinco ocorrências de `dist/404.html` são os cinco links `<a>` da lista sob o título "Todas as
páginas" (`src/pages/404.astro:46-49`, dentro de `navItems('pt').map(...)`) e a uma ocorrência de
`dist/ensino/index.html` é o título da disciplina anterior (`src/pages/ensino.astro:114`) — as duas
já tinham essa classe antes deste plano, fora do escopo dele, e batem com o `IGUAL` que o
comparador deu às duas rotas.

### Passo 6 — navegador (orquestrador)

Não rodado pelo executor; rodado pelo orquestrador em 2026-09-28, 15:46–15:48 (horário de Brasília),
no Vivaldi com a extensão, aba visível, sobre `npx astro preview` do `dist/` do build da triage do
ciclo 2 (15:43:22, retrato igual a `depois2.json` segundo a revisão). Transcrição do que o
`javascript_tool` devolveu; servidor encerrado com `npx astro preview stop` ao final.

**Hover real (mouse da extensão, janela de 1495 px de viewport, `devicePixelRatio` 1,25):**

| Página | Elemento sob o mouse | `:hover` | `text-decoration-line` | `text-underline-offset` | `text-decoration-thickness` |
|---|---|---|---|---|---|
| `/ensino/2026-2-relatividade-geral/` (aba Aulas) | título de aula "Variedades, tensores e a conexão de Levi-Civita" | sim | `underline` | `6px` | `1px` |
| `/ensino/2026-2-relatividade-geral/` (aba Materiais complementares, aberta por clique real) | material "Slides — Módulo 1: geometria diferencial" | sim | `underline` | `6px` | `1px` |
| `/ensino/` (referência, `ensino.astro:114`) | título "Mecânica Clássica" | sim | `underline` | `6px` | `1px` |

Nas capturas ampliadas das três, o sublinhado aparece afastado da linha de base, igual nas três.
Sem hover, os dez links com a classe nova na página da disciplina têm `text-decoration-line: none`
e offset `6px` / espessura `1px` computados.

**Data da aula:** o texto do `<main>` na aba Aulas traz `10/08/2026`, `17/08/2026`, `24/08/2026`,
`31/08/2026`, `14/09/2026`: todas em `dd/mm/aaaa`. `<html lang="pt-BR">`.

**Largura** (`<iframe>` com `box-sizing:content-box`, `innerWidth` conferido igual à largura; cada
aba mostrada por vez, `[scrollWidth, clientWidth]` do documento do iframe):

| Largura | `innerWidth` | aulas | listas | materiais | bibliografia | links |
|---|---|---|---|---|---|---|
| 360 | 360 | 350, 350 | 360, 360 | 350, 350 | 350, 350 | 360, 360 |
| 768 | 768 | 758, 758 | 768, 768 | 768, 768 | 768, 768 | 768, 768 |
| 1440 | 1440 | 1440, 1440 | 1440, 1440 | 1440, 1440 | 1440, 1440 | 1440, 1440 |

Os dois números são iguais em toda célula (a diferença de 10 px quando há rolagem vertical é a
barra de rolagem). Elemento cortado: **não**. A 360, a aba Aulas tem 13 elementos com borda direita
além de 360 px; todos são linhas de `<code>` dentro do `<pre class="astro-code">` do painel de
script, que tem `overflow-x: auto` e borda direita em 285 px: é a rolagem interna do bloco de
código, anterior a este plano, e não corte da página.

### Passo 7 — portão de qualidade (sobre o `dist/` do build do passo 5, o último — `depois2.json`)

Recapturado depois da correção 1 do ciclo de revisão.

`npm run lint`:

```
﻿
> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

`npm run format:check`:

```
﻿
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

`npm run test:coverage`:

```
﻿
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  19 passed (19)
      Tests  324 passed (324)
   Start at  15:38:57
   Duration  1.44s (transform 4.40s, setup 0ms, import 7.82s, tests 267ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 276/276 )
Branches     : 100% ( 134/134 )
Functions    : 100% ( 73/73 )
Lines        : 100% ( 250/250 )
================================================================================
EXIT=0
```

`npm run test:dist`:

```
﻿
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  15:38:59
   Duration  257ms (transform 45ms, setup 0ms, import 99ms, tests 29ms, environment 0ms)

EXIT=0
```

### O que não rodei

Não rodei nada além dos comandos dos passos 1–5 e 7 do plano. Não rodei o passo 6 (navegador) — é do
orquestrador, ver acima. Não rodei `npm audit`, `npm ci`, CI do GitHub Actions nem Workers Builds —
são verificações do `triage-runner`/orquestrador, não deste plano. Não commitei (`Status` permanece
`TODO`).
