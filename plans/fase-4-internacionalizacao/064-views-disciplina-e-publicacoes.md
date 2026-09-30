# Plano 064 — Views: Disciplina e Publicações

**Status:** DONE
**RFs cobertos:** sabatina fase 4, Decisões 3 e 6; §10.4; RF-24, RF-37, F-06, F-13, RF-25, RN-02 sem mudança de comportamento
**Depende de:** planos 055, 056, 058, 059
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 7)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O corpo de `ensino/[slug].astro` e de `publicacoes.astro` vira `CourseView` e `PublicationsView`; as
abas da disciplina (marcação, script e estilo) viram `CourseTabs.astro`; o script da sanfona de
Publicações sai para um módulo; o `getStaticPaths` da disciplina vira uma função reusável pela rota EN
(067). As páginas ficam finas, as views abaixo de 150 linhas, e o HTML das rotas PT não muda.

## Arquivos afetados

- `src/views/CourseView.astro`, `src/views/PublicationsView.astro` — novos
- `src/views/course-paths.ts` — novo (`courseStaticPaths()`)
- `src/components/CourseTabs.astro` — novo
- `src/scripts/publications-accordion.ts` — novo (o `<script>` da sanfona, sem mudança de lógica)
- `src/scripts/course-tabs.ts` — novo; acrescentado em 2026-09-30 por decisão do stakeholder: o `<script>` dentro do `CourseTabs` era emitido antes dos painéis e o comparador dava DIFERENTE
- `src/pages/ensino/[slug].astro`, `src/pages/publicacoes.astro` — viram páginas finas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. Sem rota EN e sem `localize` aqui (066, 067).

## Contexto necessário

**Padrão de view e de página fina:** o do plano 062 (`plans/fase-4-internacionalizacao/062-views-home-sobre-e-404.md`,
"Contexto necessário").

**Disciplina (`src/pages/ensino/[slug].astro`, 261 linhas):**
- `getStaticPaths` (54–63) → `src/views/course-paths.ts`, `export async function courseStaticPaths()`
  com o mesmo corpo (`filterPublished`, `buildCourseSlugs`, `params: { slug: courseSlug(...) }`,
  `props: { course }`). **Decisão 3** da sabatina: o slug é o mesmo nos dois idiomas, então a rota EN
  (067) reusa a mesma função. A página fina: `export const getStaticPaths = courseStaticPaths;` (ou
  `export async function getStaticPaths() { return courseStaticPaths(); }` — use a forma que o
  `astro check` aceitar) e `<CourseView lang="pt" course={Astro.props.course} />`. `src/views/` **não**
  está na cobertura do Vitest (`vitest.config.ts` inclui `src/lib/**` e `src/i18n/**`); a função é
  coberta pelo build e pelo `test:dist`.
- `CourseTabs.astro` recebe `tabs` (`{ id, key }[]` de `presentSections`, já sem `syllabus`) e
  renderiza o `#curso-abas` (107–131), o `<style>` das abas (161–205, inclusive os `:global([data-abas]
  …)`) e o `<script>` (207–260), sem mudança de lógica. Rótulos por `t.course[tab.key]`, `aria-label`
  por `t.course.tabsLabel`.
- `CourseView`: o restante (cabeçalho com `back`, painéis, `CourseResources`), com
  `back={{ href: routePath('teaching', lang), label: t.course.back }}` no lugar do `'/ensino/'` fixo
  (91) e `t.course.status[data.status]` na meta. O `tests/dist/site-gerado.test.ts` (389–407) exige o
  link "Voltar para Ensino" com `href="/ensino/"` antes do `<h1>` — continua valendo.

**Publicações (`src/pages/publicacoes.astro`, 208 linhas):** o `<script>` (98–207) vai para
`src/scripts/publications-accordion.ts`, importado por `<script>import '../scripts/publications-accordion';</script>`
na view (padrão de script processado do Astro). **O GSAP continua por `import()` dinâmico** — o teste
`tests/dist/site-gerado.test.ts:348-366` reprova se o ScrollTrigger for carregado de saída; ele tem de
seguir verde. `PublicationsView`: `BaseLayout title={t.nav.publications}` (o 057 já fez a troca) e
`<h1>` `t.publications.title`.

**Tamanho:** cada view, `CourseTabs` e o módulo < 150 linhas.

**Prova:** o comparador remove `<style>` mas **mantém** os `<script>` inline e compara o script
externo pelo conteúdo, não pelo nome do chunk (055, emendado em 2026-09-25) — mover o script da
sanfona para a view não muda o retrato se o conteúdo for o mesmo. Ele prova marcação e scripts; **o
navegador prova o comportamento das abas e da sanfona** (passo 7). As duas provas são necessárias.
**Limite do comparador (revisão do 055):** ele lê o conteúdo do script externo só um nível abaixo —
os chunks que ele importa (gsap, ScrollTrigger) entram só pelo nome. Se a extração fizer o Vite
separar a lógica da sanfona num chunk compartilhado, essa lógica sai do retrato: confira no `dist/`
que o chunk de entrada de `publicacoes/` continua contendo a lógica, e diga isso na Evidência.

**Regras de código:** README da fase 4. Os comentários de RF-37/F-13/F-06/RN-04/RN-02 vão com o código
que explicam. O módulo `.ts` em `src/scripts/` leva cabeçalho §10.1 e TSDoc na função exportada, se
houver; a lógica é a atual, só mudada de arquivo.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `course-paths.ts`, `CourseTabs.astro`, `CourseView.astro` e a página fina da disciplina → verify: `npx astro check` colado.
3. `publications-accordion.ts`, `PublicationsView.astro` e a página fina → verify: `npx astro check` colado; `wc -l` dos sete arquivos colado.
4. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0.
5. `npm run test:dist` → verify: saída colada, incluindo o teste do ScrollTrigger e o da seta de volta.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador — navegador:** `/ensino/2026-2-relatividade-geral/` (abas: clique, setas ←/→, `#listas` na URL escolhe a aba; sem JS, seções empilhadas) e `/publicacoes/` a 1440 sem movimento reduzido (sanfona: rolar fecha o ano e abre o seguinte; clique no ano) e a 360 (anos todos abertos); `[scrollWidth, clientWidth]` a 360/768/1440 nas duas.

## Critérios de aceitação

- [x] `CourseView`, `PublicationsView`, `CourseTabs`, `course-paths.ts` e `publications-accordion.ts` criados; páginas finas
- [x] Voltar para Ensino por `routePath`; nenhum `pt` direto nas views e no componente
- [x] Todos os arquivos novos e as páginas abaixo de 150 linhas (contagem colada)
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [x] `test:dist` verde, inclusive "GSAP sob demanda" e "seta de volta"
- [x] Abas e sanfona funcionando como antes no navegador (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

### Passo 1 — retrato "antes" (`build-antes.txt`, `retrato-antes.txt`)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  13:21:56
   Duration  1.23s (transform 1.93s, setup 0ms, import 3.24s, tests 83ms, environment 1ms)

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
13:22:34 [content] Syncing content
13:22:34 [content] Synced content
13:22:34 [types] Generated 531ms
13:22:34 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (75 files): 
- 0 errors
- 0 warnings
- 0 hints

13:22:44 [content] Syncing content
13:22:44 [content] Synced content
13:22:44 [types] Generated 514ms
13:22:44 [build] output: "static"
13:22:44 [build] mode: "static"
13:22:44 [build] directory: S:\Projetos\academic_page\haroldo\dist\
13:22:44 [build] Collecting build info...
13:22:44 [build] ✓ Completed in 555ms.
13:22:44 [build] Building static entrypoints...
13:22:44 [vite] ✓ built in 397ms
13:22:45 [vite] ✓ built in 97ms
13:22:45 [build] Rearranging server assets...

 generating static routes 
13:22:45   ├─ /404.html (+12ms) 
13:22:45   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
13:22:45   ├─ /ensino/2026-2-relatividade-geral/index.html (+103ms) 
13:22:45   ├─ /ensino/index.html (+6ms) 
13:22:45   ├─ /pesquisa/index.html (+6ms) 
13:22:45   ├─ /publicacoes/index.html (+6ms) 
13:22:45   ├─ /sobre/index.html (+6ms) 
13:22:45   ├─ /index.html (+4ms) 
13:22:45 ✓ Completed in 182ms.

13:22:45 [build] ✓ Completed in 765ms.
13:22:45 [build] 8 page(s) built in 1.34s
13:22:45 [build] Complete!
EXIT=0
retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\18c65f1f-10a0-4ce2-9c55-67926d12ad96\scratchpad\064\antes.json
EXIT=0
```

### Passos 2 e 3 — `npx astro check` (`check.txt`)

```
13:30:27 [content] Syncing content
13:30:27 [content] Synced content
13:30:27 [types] Generated 523ms
13:30:27 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (81 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 3 — `wc -l` (`wc.txt`)

```
  129 src/views/CourseView.astro
  108 src/views/PublicationsView.astro
   43 src/views/course-paths.ts
  110 src/components/CourseTabs.astro
  132 src/scripts/publications-accordion.ts
   75 src/scripts/course-tabs.ts
   30 src/pages/ensino/[slug].astro
   24 src/pages/publicacoes.astro
  651 total
```

### Passo 4 — build "depois" e comparador (`build-depois.txt`, `retrato-depois.txt`, `comparar.txt`)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  13:30:37
   Duration  1.18s (transform 1.87s, setup 0ms, import 3.08s, tests 70ms, environment 0ms)

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
13:31:13 [content] Syncing content
13:31:13 [content] Synced content
13:31:13 [types] Generated 553ms
13:31:13 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (81 files): 
- 0 errors
- 0 warnings
- 0 hints

13:31:24 [content] Syncing content
13:31:24 [content] Synced content
13:31:24 [types] Generated 551ms
13:31:24 [build] output: "static"
13:31:24 [build] mode: "static"
13:31:24 [build] directory: S:\Projetos\academic_page\haroldo\dist\
13:31:24 [build] Collecting build info...
13:31:24 [build] ✓ Completed in 592ms.
13:31:24 [build] Building static entrypoints...
13:31:24 [vite] ✓ built in 417ms
13:31:24 [vite] ✓ built in 102ms
13:31:24 [build] Rearranging server assets...

 generating static routes 
13:31:24   ├─ /404.html (+12ms) 
13:31:24   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
13:31:24   ├─ /ensino/2026-2-relatividade-geral/index.html (+107ms) 
13:31:25   ├─ /ensino/index.html (+6ms) 
13:31:25   ├─ /pesquisa/index.html (+5ms) 
13:31:25   ├─ /publicacoes/index.html (+4ms) 
13:31:25   ├─ /sobre/index.html (+5ms) 
13:31:25   ├─ /index.html (+3ms) 
13:31:25 ✓ Completed in 180ms.

13:31:25 [build] ✓ Completed in 791ms.
13:31:25 [build] 8 page(s) built in 1.44s
13:31:25 [build] Complete!
EXIT=0

FullName                                                      Length LastWriteTime      
--------                                                      ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html               6266 30/09/2026 13:31:25
S:\Projetos\academic_page\haroldo\dist\publicacoes\index.html  11213 30/09/2026 13:31:25
retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\18c65f1f-10a0-4ce2-9c55-67926d12ad96\scratchpad\064\depois.json
EXIT=0
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

### Passo 4 — chunks de entrada de `/publicacoes/` (sanfona) e da disciplina (abas) (`chunk-prova.txt`)

```
== dist/publicacoes/index.html (script externo)
entrada: /_astro/PublicationsView.astro_astro_type_script_index_0_lang.BjLtZERv.js
  pub-ano-corpo -> 1
  (min-width: 64rem) -> 1
  curso-abas -> 0
  ArrowRight -> 0
  hashchange -> 0
import(`./gsap.wzadwL2c.js`)
import(`./ScrollTrigger.BXR6Gh-7.js`)
== dist/ensino/2026-2-relatividade-geral/index.html (script inline, sem src)
scripts com src: 0
  curso-abas -> 2
  ArrowRight -> 1
  hashchange -> 1
  data-abas -> 4
posicao do script das abas: 22533; </main> em: 22103
```

### Passo 5 — `npm run test:dist` (`test-dist.txt`)

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 1412 bytes
  /ensino/2025-1-mecanica-classica/index.html → 1975 bytes
  /ensino/2026-2-relatividade-geral/index.html → 2322 bytes
  /ensino/index.html → 1412 bytes
  /index.html → 1153 bytes
  /pesquisa/index.html → 1412 bytes
  /publicacoes/index.html → 2876 bytes
  /sobre/index.html → 1412 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 2ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 4ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 7ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 9ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 6ms
 ✓ tests/dist/site-gerado.test.ts > View Transitions: nomes únicos por página > cada .html tem no máximo um vt-nome e um vt-menu, e ao menos um vt-nome 5ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > HTML de /publicacoes/ não carrega o ScrollTrigger de saída (GSAP sob demanda) 1ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > dist/favicon.svg existe e toda página o declara 4ms
 ✓ tests/dist/site-gerado.test.ts > navegação principal sem "Início" > em toda página, o <nav> principal não tem link para "/" — a volta à Home é o nome 7ms
 ✓ tests/dist/site-gerado.test.ts > página de disciplina: seta de volta no lugar da trilha > sem "Trilha de navegação"; um link "Voltar para Ensino" para /ensino/ antes do <h1> 2ms
 ✓ tests/dist/site-gerado.test.ts > contato da Home igual ao da Sobre > mesmos links, na mesma sequência, começando pelo e-mail 2ms
 ✓ tests/dist/site-gerado.test.ts > cabeçalho de página fora da área que rola > nas páginas internas, o <h1> vem antes do #conteudo (que rola), não dentro dele 5ms
 ✓ tests/dist/site-gerado.test.ts > sublinhado que segue o cursor (link-traco) no menu e no contato > todo link do menu principal usa link-traco 5ms
 ✓ tests/dist/site-gerado.test.ts > sublinhado que segue o cursor (link-traco) no menu e no contato > todo link do contato (Home e Sobre) usa link-traco 1ms

 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  13:31:26
   Duration  329ms (transform 57ms, setup 0ms, import 121ms, tests 68ms, environment 0ms)

EXIT=0
```

### Passo 6 — `npm run lint` (`lint.txt`)

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 6 — `npm run format:check` (`format.txt`)

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 6 — `npm run test:coverage` (`coverage.txt`)

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  13:31:34
   Duration  1.78s (transform 5.04s, setup 0ms, import 9.22s, tests 329ms, environment 3ms)

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

### Codificação dos arquivos tocados (`encoding.txt`)

```
src/pages/ensino/[slug].astro: JavaScript source, Unicode text, UTF-8 text | mojibake=0
src/pages/publicacoes.astro: JavaScript source, Unicode text, UTF-8 text | mojibake=0
src/components/CourseTabs.astro: JavaScript source, Unicode text, UTF-8 text | mojibake=0
src/views/CourseView.astro: JavaScript source, Unicode text, UTF-8 text | mojibake=0
src/views/PublicationsView.astro: JavaScript source, Unicode text, UTF-8 text | mojibake=0
src/views/course-paths.ts: JavaScript source, Unicode text, UTF-8 text | mojibake=0
src/scripts/publications-accordion.ts: HTML document, Unicode text, UTF-8 text | mojibake=0
src/scripts/course-tabs.ts: HTML document, Unicode text, UTF-8 text | mojibake=0
```

### Desvio de escopo (decisão do stakeholder, 2026-09-30)

Com o `<script>` dentro de `CourseTabs.astro`, o comparador deu `DIFERENTE` nas duas disciplinas (o
script saía antes dos painéis) e o componente ficou com 164 linhas (os dois fatos: relatados, sem saída
guardada — a rodada foi sobrescrita pela refeita). O stakeholder autorizou o arquivo
`src/scripts/course-tabs.ts`, importado no fim de `CourseView`; os blocos acima já descrevem essa
versão final (comparador com as 8 rotas `IGUAL`, `wc -l` com oito arquivos). O retrato "antes" é o
original, do passo 1. Não rodei: o passo 7 (navegador, do orquestrador), `npm audit` e o triage-runner.

### Passo 7 — navegador (orquestrador)

2026-09-30, Vivaldi pela extensão. **Linha de base:** antes do despacho, o `dist/` do HEAD
(`83eb074`) foi copiado para `<scratch>\dist-antes` e servido por `python -m http.server 8788`;
o `dist/` final (build do `triage-runner`, 13:34) foi servido por `npx wrangler dev --port 8787`.
As mesmas medidas rodaram nos dois.

Larguras, abas e sanfona a 360 por `<iframe>` (`box-sizing:content-box`); sem JS por
`sandbox="allow-same-origin"`. Setas por `KeyboardEvent` despachado na aba (a tecla real não chega
ao iframe nesta máquina). Saída literal do `javascript_tool` sobre o `dist/` final — a da linha de
base (8787 servindo o `dist/` do HEAD, antes do executor, com um roteiro de formato um pouco
diferente) deu os mesmos valores nas linhas equivalentes — larguras, as sete linhas das abas,
`alturas=166,0,0 inert=011 gsap=2` a 1440 e `alturas=317,294,196 inert=000 gsap=0` a 360:

```
/ensino/2026-2-relatividade-geral/ 360: iw=360 sw=[350,350]
/ensino/2026-2-relatividade-geral/ 768: iw=768 sw=[758,758]
/ensino/2026-2-relatividade-geral/ 1440: iw=1440 sw=[1440,1440]
/publicacoes/ 360: iw=360 sw=[350,350]
/publicacoes/ 768: iw=768 sw=[768,768]
/publicacoes/ 1440: iw=1440 sw=[1440,1440]
abas ids=aba-aulas,aba-listas,aba-materiais,aba-bibliografia,aba-links tablist.hidden=false
abas inicial: sel=0 visíveis=10000 hash=
abas clique[1]: sel=1 visíveis=01000 hash=#listas
abas ArrowRight de [1]: sel=2 visíveis=00100 hash=#materiais foco=aba-materiais
abas ArrowLeft de [0]: sel=4 visíveis=00001 hash=#links foco=aba-links
abas #listas: sel=1 visíveis=01000 hash=#listas
abas sem JS: tablist.hidden=true seções=aulas:visível:h>0,listas:visível:h>0,materiais:visível:h>0,bibliografia:visível:h>0,links:visível:h>0
sanfona 1440 (iframe) inicial: st=0 alturas=166,0,0 inert=011 gsap=2
sanfona 360: st=0 alturas=317,294,196 inert=000 gsap=0
```

Sanfona a 1440 na página de topo (janela com `innerWidth=1495`, `prefers-reduced-motion: reduce`
falso), sem movimento reduzido. O `scrub` e a rolagem suave dependem de `requestAnimationFrame`, que
nesta máquina só avança quando a janela é pintada: a rolagem foi feita pela roda do mouse (a
extensão captura a tela a cada rolagem), e o clique no ano foi medido pelo destino que ele pede ao
`scrollTo` (registrado por um invólucro instalado antes dos cliques). Roteiro: clique real em
"2024", clique real em "2023", 5 passos de roda para baixo. Linha de base (8788):

```
inicial st=0 alturas=166,0,0 inert=011
depois da rolagem st=500 alturas=0,145,11 inert=100
scrollTo({"top":399.999,"behavior":"smooth"}) em #conteudo
scrollTo({"top":799.999,"behavior":"smooth"}) em #conteudo
```

`dist/` final (8787):

```
inicial st=0 alturas=166,0,0 inert=011
depois da rolagem st=500 alturas=0,145,11 inert=100
scrollTo({"top":399.999,"behavior":"smooth"}) em #conteudo
scrollTo({"top":799.999,"behavior":"smooth"}) em #conteudo
```

Rolar fecha 2025 (altura 0, `inert`) e abre 2024; o clique em cada ano pede a rolagem até o rótulo
daquele ano (400 e 800 = 1 e 2 × `TRANSITION`); a 360 os anos ficam todos abertos e o GSAP não é
baixado. Igual à linha de base em tudo.

Contagem de U+FEFF neste plano, medida pelo orquestrador depois do ciclo 2
(`grep -o $'\xEF\xBB\xBF' <plano> | wc -l`): `0`.

### Verificação autoritativa e CI (orquestrador)

Rodada do `triage-runner` em 2026-09-30, depois da última edição de código (o ciclo 2 de revisão
mudou só o plano, que está no `.prettierignore`). Revisão: APROVADO no ciclo 2.

```
audit.txt:EXIT=0
build.txt:EXIT=0
coverage.txt:EXIT=0
format.txt:EXIT=0
lint.txt:EXIT=0
test-dist.txt:EXIT=0
```

Check-runs do commit de trabalho `98d1014`, empurrado:

```
Workers Builds: haroldo-page: completed / success
qualidade: completed / success
```
