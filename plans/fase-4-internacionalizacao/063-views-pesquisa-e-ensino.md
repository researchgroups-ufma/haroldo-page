# Plano 063 — Views: Pesquisa e Ensino

**Status:** TODO
**RFs cobertos:** sabatina fase 4, Decisão 6; §10.4; RF-22, RF-13, RF-23 sem mudança de comportamento; menor adiado do polimento (linha de projeto duplicada)
**Depende de:** planos 055, 056, 058, 059
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 6)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O corpo de `pesquisa.astro` e `ensino.astro` vira `ResearchView` e `TeachingView`; a linha de projeto,
hoje escrita duas vezes em `pesquisa.astro`, vira o componente `ProjectItem.astro`; os links para as
disciplinas saem de `coursePath`. O HTML das rotas PT não muda.

## Arquivos afetados

- `src/views/ResearchView.astro`, `src/views/TeachingView.astro` — novos
- `src/components/ProjectItem.astro` — novo
- `src/pages/pesquisa.astro`, `src/pages/ensino.astro` — viram páginas finas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. Sem rota EN e sem `localize` aqui (066, 067).

## Contexto necessário

**Padrão de view e de página fina:** o do plano 062 (leia `plans/fase-4-internacionalizacao/062-views-home-sobre-e-404.md`,
seção "Contexto necessário") — `lang: Locale` obrigatória, `const t = strings(lang)`, página fina com
cabeçalho §10.1 e `<XView lang="pt" />`.

**`pesquisa.astro` (163 linhas):** o `<li class="projeto-linha py-3">…</li>` aparece duas vezes,
idêntico (linhas 89–106 dentro das linhas de pesquisa e 123–140 em "Outros projetos"), junto com a
função `projectMeta` (46–52). Extraia para `ProjectItem.astro` com prop `project`
(`CollectionEntry<'projetos'>`), levando `projectMeta` para dentro dele e trocando `pt.research.status`
por `t.research.status` (idioma pelo caminho, decisão de fatiamento 2 do README da fase). **O `<li>`
fica no componente**, com a mesma classe `projeto-linha` — a régua é do `<style>` da view
(`.projeto-linha { border-top… }`, 159–161). Cuidado: estilo escopado de componente não alcança
elemento de outro componente; a regra `.projeto-linha` tem de ir para o `ProjectItem` (ou virar
`:global` na view). Confirme a régua no navegador (passo 6), porque o comparador **remove** `<style>`
e não vê essa diferença.

**`ensino.astro` (138 linhas):** os dois `href={\`/ensino/${courseSlug(course.filePath)}/\`}` (69 e 107)
→ `coursePath(courseSlug(course.filePath), lang)` (056). `formatDate(latest.data, 'pt')` (059) →
`formatDate(latest.data, lang)`. `pt.teaching.*` → `t.teaching.*`. `buildCourseSlugs(disciplinas)`
fica (reprova slug duplicado no build).

**Tamanho:** views e `ProjectItem` < 150 linhas.

**Prova:** comparador (055) todo `IGUAL`, mais o navegador para as réguas.

**Regras de código:** README da fase 4. Os comentários `// RN-01`, `// RN-03`, `// RN-04` existentes vão
junto com o código que eles explicam.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `ProjectItem.astro`, as duas views e as duas páginas finas → verify: `npx astro check` colado; `wc -l` dos cinco arquivos colado.
3. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0.
4. Sem `pt` direto nem `/ensino/` escrito à mão → verify: `grep -n "i18n/pt'\|/ensino/" src/views/ResearchView.astro src/views/TeachingView.astro src/components/ProjectItem.astro` colado (esperado: vazio).
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados.
6. **Orquestrador — navegador:** `/pesquisa/` e `/ensino/` a 360/768/1440 — `[scrollWidth, clientWidth]`; régua fina acima de **cada** projeto (dentro da linha e em "Outros projetos", se houver) e régua forte no topo de cada linha de pesquisa; link de disciplina atual e anterior levando à página certa.

## Critérios de aceitação

- [x] `ResearchView`, `TeachingView` e `ProjectItem` criados; a linha de projeto existe uma vez só
- [x] Links de disciplina por `coursePath`; nenhum `pt` direto
- [x] Views, componente e páginas abaixo de 150 linhas (contagem colada)
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [x] Réguas de projeto e de linha conferidas no navegador (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

Executor: implementer, 2026-09-30.

**Onde ficou a regra `.projeto-linha`:** no `<style>` escopado do próprio `ProjectItem.astro` (o `<li>` mora lá); a view mantém só `.linha-pesquisa` e `TeachingView` mantém `.disciplina-anterior`. O comparador remove `<style>`, então isto não está provado por ele.

**Grep do passo 4:** o padrão do plano casa uma única linha, o comentário do cabeçalho §10.1 da `TeachingView`. O bloco seguinte repete o padrão só em código e dá zero. O critério não foi reescrito.

**Não rodei:** o passo 6 (navegador) é do orquestrador; o critério correspondente fica vazio. Também não rodei `npm audit` nem consultei o CI.

**Correção do ciclo de revisão (2026-09-30):** `ResearchView.astro` tinha BOM e acentos duplamente codificados; foi regravado em UTF-8 sem BOM (ver o bloco de codificação). Os blocos dos passos 2 a 5 foram recapturados depois disso; o do passo 1 é o retrato original, anterior a qualquer edição em `src/`.

### Passo 1 — retrato "antes" (`build:pipeline` antes de qualquer edição em `src/`; depois `retrato`)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:37:27
   Duration  1.16s (transform 1.84s, setup 0ms, import 3.03s, tests 69ms, environment 0ms)

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
12:37:57 [content] Syncing content
12:37:57 [content] Synced content
12:37:57 [types] Generated 520ms
12:37:57 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (72 files): 
- 0 errors
- 0 warnings
- 0 hints

12:38:05 [content] Syncing content
12:38:05 [content] Synced content
12:38:05 [types] Generated 517ms
12:38:05 [build] output: "static"
12:38:05 [build] mode: "static"
12:38:05 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:38:05 [build] Collecting build info...
12:38:05 [build] ✓ Completed in 557ms.
12:38:06 [build] Building static entrypoints...
12:38:06 [vite] ✓ built in 393ms
12:38:06 [vite] ✓ built in 100ms
12:38:06 [build] Rearranging server assets...

 generating static routes 
12:38:06   ├─ /404.html (+14ms) 
12:38:06   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
12:38:06   ├─ /ensino/2026-2-relatividade-geral/index.html (+95ms) 
12:38:06   ├─ /ensino/index.html (+5ms) 
12:38:06   ├─ /pesquisa/index.html (+5ms) 
12:38:06   ├─ /publicacoes/index.html (+5ms) 
12:38:06   ├─ /sobre/index.html (+5ms) 
12:38:06   ├─ /index.html (+3ms) 
12:38:06 ✓ Completed in 170ms.

12:38:06 [build] ✓ Completed in 728ms.
12:38:06 [build] 8 page(s) built in 1.34s
12:38:06 [build] Complete!
EXIT=0
```

```
retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\18c65f1f-10a0-4ce2-9c55-67926d12ad96\scratchpad\063\antes.json
EXIT=0
```

### Passo 2 — `npx astro check`

```
12:47:01 [content] Syncing content
12:47:01 [content] Synced content
12:47:01 [types] Generated 527ms
12:47:01 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (75 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 2 — `wc -l` dos cinco arquivos

```
  125 src/views/ResearchView.astro
  148 src/views/TeachingView.astro
   73 src/components/ProjectItem.astro
   24 src/pages/pesquisa.astro
   24 src/pages/ensino.astro
  394 total
```

### Passo 3 — `build:pipeline` depois das edições

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:46:07
   Duration  1.34s (transform 2.05s, setup 0ms, import 3.44s, tests 79ms, environment 0ms)

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
12:46:44 [content] Syncing content
12:46:44 [content] Synced content
12:46:44 [types] Generated 511ms
12:46:44 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (75 files): 
- 0 errors
- 0 warnings
- 0 hints

12:46:54 [content] Syncing content
12:46:54 [content] Synced content
12:46:54 [types] Generated 528ms
12:46:54 [build] output: "static"
12:46:54 [build] mode: "static"
12:46:54 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:46:54 [build] Collecting build info...
12:46:54 [build] ✓ Completed in 570ms.
12:46:54 [build] Building static entrypoints...
12:46:55 [vite] ✓ built in 387ms
12:46:55 [vite] ✓ built in 94ms
12:46:55 [build] Rearranging server assets...

 generating static routes 
12:46:55   ├─ /404.html (+12ms) 
12:46:55   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
12:46:55   ├─ /ensino/2026-2-relatividade-geral/index.html (+94ms) 
12:46:55   ├─ /ensino/index.html (+7ms) 
12:46:55   ├─ /pesquisa/index.html (+7ms) 
12:46:55   ├─ /publicacoes/index.html (+7ms) 
12:46:55   ├─ /sobre/index.html (+7ms) 
12:46:55   ├─ /index.html (+5ms) 
12:46:55 ✓ Completed in 180ms.

12:46:55 [build] ✓ Completed in 745ms.
12:46:55 [build] 8 page(s) built in 1.33s
12:46:55 [build] Complete!
EXIT=0
```

### Passo 3 — retrato "depois"

```
retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\18c65f1f-10a0-4ce2-9c55-67926d12ad96\scratchpad\063\depois.json
EXIT=0
```

### Passo 3 — `comparar antes.json depois.json`

```
IGUAL      404.html
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

### Passo 4 — grep do plano (`i18n/pt'|/ensino/`) sobre as três views/componente

```
src/views/TeachingView.astro:6: *  Descrição    : View de `/ensino/` (e da rota EN, plano 067; sabatina fase
EXIT=0
```

### Passo 4 — mesmo padrão restrito a código (fora do bloco `/** … */`), com o comando

```
$ cat grep-codigo.sh
for f in src/views/ResearchView.astro src/views/TeachingView.astro src/components/ProjectItem.astro; do awk -v F="$f" '/^\/\*\*/{c=1} !c && /i18n\/pt'"'"'|\/ensino\//{print F":"NR":"$0; n++} /\*\//{c=0} END{print F": acertos em codigo (fora do bloco /** */) = " n+0}' "$f"; done
$ bash grep-codigo.sh
src/views/ResearchView.astro: acertos em codigo (fora do bloco /** */) = 0
src/views/TeachingView.astro: acertos em codigo (fora do bloco /** */) = 0
src/components/ProjectItem.astro: acertos em codigo (fora do bloco /** */) = 0
```

### Citações RN-01, RN-03, RN-04 no PRD

```
$ grep -n "^| RN-0[134] " PRD.md | cut -c1-80
296:| RN-01 | Conteúdo com `publicado = false` não aparece em nenhuma página 
298:| RN-03 | Uma disciplina é "atual" ou "anterior"; a transição é manual, 
299:| RN-04 | Aulas, listas e materiais são ordenados pela posição definida p
```

### Codificação dos cinco arquivos de `src/` (UTF-8, sem BOM, sem mojibake)

```
src/views/ResearchView.astro: JavaScript source, Unicode text, UTF-8 text
grep -c 'Ã\|â€\|Â' src/views/ResearchView.astro -> 0
src/views/TeachingView.astro: JavaScript source, Unicode text, UTF-8 text
grep -c 'Ã\|â€\|Â' src/views/TeachingView.astro -> 0
src/components/ProjectItem.astro: JavaScript source, Unicode text, UTF-8 text
grep -c 'Ã\|â€\|Â' src/components/ProjectItem.astro -> 0
src/pages/pesquisa.astro: JavaScript source, Unicode text, UTF-8 text
grep -c 'Ã\|â€\|Â' src/pages/pesquisa.astro -> 0
src/pages/ensino.astro: JavaScript source, Unicode text, UTF-8 text
grep -c 'Ã\|â€\|Â' src/pages/ensino.astro -> 0
```

### Passo 5 — `npm run lint`

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 5 — `npm run format:check`

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 5 — `npm run test:coverage`

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  12:46:03
   Duration  2.02s (transform 6.01s, setup 0ms, import 10.84s, tests 391ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 295/295 )
Branches     : 100% ( 148/148 )
Functions    : 100% ( 79/79 )
Lines        : 100% ( 263/263 )
================================================================================
EXIT=0
```

### Passo 5 — `npm run test:dist`

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  12:46:57
   Duration  364ms (transform 62ms, setup 0ms, import 132ms, tests 77ms, environment 0ms)

EXIT=0
```


### Passo 6 — navegador (orquestrador)

2026-09-30, Vivaldi pela extensão, `npx wrangler dev --port 8787` sobre o `dist/` da primeira rodada
do `triage-runner`. Depois do ciclo de correção (só comentários em `ResearchView.astro`), o `dist/`
do `triage2` saiu idêntico byte a byte ao medido (`cmp` de `dist/pesquisa/index.html` e
`dist/ensino/index.html` contra as cópias guardadas antes do rebuild: `pesquisa-identico`,
`ensino-identico`), então a medição vale para o estado final.

Réguas e larguras em `/pesquisa/` (0.8px é 1px sob o zoom de 125% da janela); saída literal do
`javascript_tool`:

```
tinta=rgb(17, 17, 18) regua=rgb(214, 211, 207)
linha[0] 0px none rgb(17, 17, 18) projetos=0
linha[1] 0.8px solid rgb(17, 17, 18) projetos=1
linha[2] 0.8px solid rgb(17, 17, 18) projetos=1
projeto[0] dentro 0.8px solid rgb(214, 211, 207) attrs=class,data-astro-cid-gjxckoxw
projeto[1] dentro 0.8px solid rgb(214, 211, 207) attrs=class,data-astro-cid-gjxckoxw
/pesquisa/ 360: iw=360 sw=[350,350]
/pesquisa/ 768: iw=768 sw=[758,758]
/pesquisa/ 1440: iw=1440 sw=[1440,1440]
/ensino/ 360: iw=360 sw=[360,360]
/ensino/ 768: iw=768 sw=[768,768]
/ensino/ 1440: iw=1440 sw=[1440,1440]
```

"dentro" significa dentro de um `.linha-pesquisa`. O terceiro bloco (`linha[2]`) é "Outros
projetos", que também é uma `<section class="linha-pesquisa">` no `dist/`: `projeto[0]` fica na
linha "Sombras de buracos negros" e `projeto[1]` em "Outros projetos". Os dois têm régua fina
(`--color-regua`). Os blocos de linha a partir do segundo têm régua forte (`--color-tinta`), e o
primeiro fica sem borda, como no `<style>` original. `scrollWidth = clientWidth` em todas as
larguras.

Links de disciplina em `/ensino/` (`fetch` de cada `href` e `<h1>` do destino), e depois um clique
real no link da disciplina atual:

```
atual "Relatividade Geral" -> /ensino/2026-2-relatividade-geral/ 200 h1="Relatividade Geral"
anterior "2025.1Mecânica Clássica›" -> /ensino/2025-1-mecanica-classica/ 200 h1="Mecânica Clássica"
click=312,334
/ensino/2026-2-relatividade-geral/ h1="Relatividade Geral"
```
