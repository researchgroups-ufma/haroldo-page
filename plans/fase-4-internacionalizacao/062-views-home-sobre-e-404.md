# Plano 062 — Views: Home, Sobre e 404

**Status:** DONE
**RFs cobertos:** sabatina fase 4, Decisão 6 (página fina + view); §10.4 (componentes < 150 linhas); RF-20, RF-21, RF-27 sem mudança de comportamento
**Depende de:** planos 055 (comparador), 056 (`routePath`, `navItems`), 058 e 059 (dicionário por caminho), 060 (`areas[].nome`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 6)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O corpo de `index.astro`, `sobre.astro` e `404.astro` vira `HomeView`, `AboutView` e `NotFoundView`
em `src/views/`, cada uma recebendo `lang`; as três páginas ficam finas. O HTML das rotas PT não muda.

## Arquivos afetados

- `src/views/HomeView.astro`, `src/views/AboutView.astro`, `src/views/NotFoundView.astro` — novos
- `src/pages/index.astro`, `src/pages/sobre.astro`, `src/pages/404.astro` — viram páginas finas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Nenhuma rota EN é criada aqui** (065, 068), e **nenhum fallback** (`localize`) entra
> nas views ainda — a view só troca `pt` por `strings(lang)` e `href` fixo por `routePath`.

## Contexto necessário

**Decisão 6** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): "o corpo de cada página vira um
componente de view que recebe `lang`; cada rota tem dois arquivos finos em `src/pages/` e
`src/pages/en/` … que só chamam a view." Decisões de fatiamento 2 e 3 do README da fase: a view
recebe `lang` como **prop obrigatória** (`lang: Locale`), usa `const t = strings(lang)` e
`navItems(lang)`/`routePath(…, lang)`; views em `src/views/` com sufixo `View.astro`.

**Página fina (modelo):**

```astro
---
/** cabeçalho §10.1 completo (obrigatório também na página fina) */
import AboutView from '../views/AboutView.astro';
---

<AboutView lang="pt" />
```

A view pode chamar `getCollection` no próprio frontmatter (é componente Astro; a página não precisa
passar dados). `Astro.url` dentro da view é o da página.

**O que muda em cada view, além do `lang`:**
- `HomeView` (hoje `index.astro`, 145 linhas): `NAV_ITEMS`/`navItems('pt')` → `navItems(lang)`
  filtrado por **chave** (`key !== 'home'`), não por `href !== '/'`; `pt.` → `t.`; o resto igual.
  `areas` já é `{ nome }` desde o 060.
- `AboutView` (hoje `sobre.astro`, 143): `pt.` → `t.`; `BaseLayout title={t.nav.about}` (o 057 já
  trocou).
- `NotFoundView` (hoje `404.astro`, 71): `navItems(lang)` com os cinco itens ("Início" primeiro,
  RF-27); `pt.` → `t.`.

O cabeçalho §10.1 de cada view herda a descrição da página de origem (rota, RF, notas) e diz "view de
`/` e `/en/`" etc. As notas sobre F-08 dos cabeçalhos atuais de `index.astro` e `sobre.astro` citam
uma regra que o §5.4 do PRD chama de "Imagem ausente" — mantenha a citação só onde ela se refere a
imagem ausente (`foto`), como hoje; não crie citação nova de F-08.

**Tamanho:** cada view < 150 linhas (§10.4, alvo). `sobre.astro` tem 143 hoje e a view acrescenta
pouco; se passar de 150, pare e reporte o que ocupa as linhas.

**Prova:** comparador (055) todo `IGUAL`. **A 404 é `dist/404.html`** — confirme que continua saindo
com esse nome (o `dist/404/index.html` quebraria o Worker, plano 051).

**Registro para o orquestrador, na promoção:** o §7.5 do PRD ganha `src/views/` (Decisão 6, impacto no
§7.5).

**Regras de código:** README da fase 4.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. As três views e as três páginas finas → verify: `npx astro check` colado; `wc -l src/views/*.astro src/pages/index.astro src/pages/sobre.astro src/pages/404.astro` colado.
3. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0; `ls dist/404.html` colado.
4. Nenhum `pt` direto nem `href` interno fixo nas views → verify: `grep -n "i18n/pt'\|href=\"/" src/views/HomeView.astro src/views/AboutView.astro src/views/NotFoundView.astro` colado (esperado: vazio).
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados.
6. **Orquestrador — navegador** (README da fase): `/`, `/sobre/` e `/rota-inexistente` (no `npx wrangler dev`) a 360/768/1440 — `[scrollWidth, clientWidth]`, a transição de página entre Home e Sobre (vt-nome/vt-menu), Home e Sobre sem rolagem vertical a 1440×800.

## Critérios de aceitação

- [x] `HomeView`, `AboutView` e `NotFoundView` com `lang: Locale` obrigatória; páginas finas só chamam a view
- [x] Nenhuma view importa `pt` direto nem tem `href` interno fixo
- [x] Views e páginas abaixo de 150 linhas (contagem colada)
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL`; `dist/404.html` presente
- [x] Navegador: sem rolagem horizontal nas três larguras e transição entre páginas funcionando (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

Executado em 2026-09-30.

### Passo 1 — build "antes" (antes de qualquer edição em `src/`), `build-antes.txt`

```text

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  11:53:44
   Duration  2.22s (transform 2.32s, setup 0ms, import 4.61s, tests 115ms, environment 0ms)

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
11:55:31 [content] Syncing content
11:55:31 [content] Synced content
11:55:31 [types] Generated 796ms
11:55:31 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (69 files): 
- 0 errors
- 0 warnings
- 0 hints

11:55:43 [content] Syncing content
11:55:43 [content] Synced content
11:55:43 [types] Generated 569ms
11:55:43 [build] output: "static"
11:55:43 [build] mode: "static"
11:55:43 [build] directory: S:\Projetos\academic_page\haroldo\dist\
11:55:43 [build] Collecting build info...
11:55:43 [build] ✓ Completed in 613ms.
11:55:43 [build] Building static entrypoints...
11:55:44 [vite] ✓ built in 687ms
11:55:44 [vite] ✓ built in 176ms
11:55:44 [build] Rearranging server assets...

 generating static routes 
11:55:44   ├─ /404.html (+14ms) 
11:55:44   ├─ /ensino/2025-1-mecanica-classica/index.html (+5ms) 
11:55:44   ├─ /ensino/2026-2-relatividade-geral/index.html (+151ms) 
11:55:45   ├─ /ensino/index.html (+6ms) 
11:55:45   ├─ /pesquisa/index.html (+6ms) 
11:55:45   ├─ /publicacoes/index.html (+11ms) 
11:55:45   ├─ /sobre/index.html (+8ms) 
11:55:45   ├─ /index.html (+6ms) 
11:55:45 ✓ Completed in 253ms.

11:55:45 [build] ✓ Completed in 1.20s.
11:55:45 [build] 8 page(s) built in 1.84s
11:55:45 [build] Complete!
EXIT=0
```

### Passo 1 — retrato "antes", `retrato-antes.txt`

```text
retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\18c65f1f-10a0-4ce2-9c55-67926d12ad96\scratchpad\062\antes.json
```

### Passo 2 — `npx astro check`, `check.txt`

```text
12:08:02 [content] Syncing content
12:08:02 [content] Synced content
12:08:02 [types] Generated 518ms
12:08:02 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (72 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 2 — `wc -l`, `wc.txt`

```text
  149 src/views/AboutView.astro
  148 src/views/HomeView.astro
   80 src/views/NotFoundView.astro
   24 src/pages/index.astro
   24 src/pages/sobre.astro
   27 src/pages/404.astro
  452 total
```

### Passo 3 — build "depois", `build-depois.txt`

```text

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:08:11
   Duration  1.19s (transform 1.91s, setup 0ms, import 3.10s, tests 82ms, environment 0ms)

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
12:08:47 [content] Syncing content
12:08:47 [content] Synced content
12:08:47 [types] Generated 530ms
12:08:47 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (72 files): 
- 0 errors
- 0 warnings
- 0 hints

12:08:58 [content] Syncing content
12:08:58 [content] Synced content
12:08:58 [types] Generated 604ms
12:08:58 [build] output: "static"
12:08:58 [build] mode: "static"
12:08:58 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:08:58 [build] Collecting build info...
12:08:58 [build] ✓ Completed in 648ms.
12:08:58 [build] Building static entrypoints...
12:08:58 [vite] ✓ built in 415ms
12:08:58 [vite] ✓ built in 94ms
12:08:58 [build] Rearranging server assets...

 generating static routes 
12:08:58   ├─ /404.html (+17ms) 
12:08:58   ├─ /ensino/2025-1-mecanica-classica/index.html (+5ms) 
12:08:58   ├─ /ensino/2026-2-relatividade-geral/index.html (+141ms) 
12:08:59   ├─ /ensino/index.html (+8ms) 
12:08:59   ├─ /pesquisa/index.html (+7ms) 
12:08:59   ├─ /publicacoes/index.html (+6ms) 
12:08:59   ├─ /sobre/index.html (+5ms) 
12:08:59   ├─ /index.html (+4ms) 
12:08:59 ✓ Completed in 233ms.

12:08:59 [build] ✓ Completed in 827ms.
12:08:59 [build] 8 page(s) built in 1.49s
12:08:59 [build] Complete!
EXIT=0
```

### Passo 3 — comparador e `dist/404.html`, `comparar.txt`

```text
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

FullName                                        Length
--------                                        ------
S:\Projetos\academic_page\haroldo\dist\404.html   9275
```

### Passo 4 — grep de `pt` direto e `href` fixo (vazio = `GREP_EXIT=1`), `grep.txt`

```text
GREP_EXIT=1
```

### Passo 5 — `npm run lint`, `lint.txt`

```text

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 5 — `npm run format:check`, `format.txt`

```text

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 5 — `npm run test:coverage`, `coverage.txt`

```text

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  12:09:06
   Duration  1.80s (transform 5.34s, setup 0ms, import 9.57s, tests 411ms, environment 4ms)

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

### Passo 5 — `npm run test:dist`, `test-dist.txt`

```text

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  12:09:09
   Duration  363ms (transform 63ms, setup 0ms, import 140ms, tests 73ms, environment 0ms)

EXIT=0
```

### Não rodado

- **Passo 6 (navegador)**: é do orquestrador; não foi rodado porque o executor não tem navegador. Nenhum equivalente foi inventado.
- `npm audit`, CI do GitHub e Workers Builds: não rodados (fora do escopo do executor).

### Correções do ciclo de revisão

- `AboutView.astro`: citação `(F-08)` trocada por `(RF-21)` na Descrição; `NotFoundView.astro`: Descrição reescrita como "View de `/404` e da 404 de `/en/`".
- Blocos recapturados: `astro check`, `wc -l`, build "depois", comparador, grep, lint, format, coverage e test:dist.

### Passo 6 — navegador (orquestrador)

2026-09-30, Vivaldi pela extensão, `npx wrangler dev --port 8787` sobre o `dist/` do `triage2`
(build 12:12:05). Medidas por `<iframe>` com `box-sizing:content-box` (`iw` = `innerWidth`),
`sw` = `[scrollWidth, clientWidth]` e `v` = `[scrollHeight, clientHeight]` do `documentElement`.
Saída literal do `javascript_tool`:

```
/ 360: iw=360 sw=[350,350] v=[1119,800] vt=0 lang=pt-BR
/ 768: iw=768 sw=[768,768] v=[1000,1000] vt=0 lang=pt-BR
/ 1440: iw=1440 sw=[1440,1440] v=[800,800] vt=0 lang=pt-BR
/sobre/ 360: iw=360 sw=[350,350] v=[1494,800] vt=0 lang=pt-BR
/sobre/ 768: iw=768 sw=[758,758] v=[1001,1000] vt=0 lang=pt-BR
/sobre/ 1440: iw=1440 sw=[1440,1440] v=[800,800] vt=0 lang=pt-BR
/rota-inexistente 360: iw=360 sw=[360,360] v=[800,800] vt=0 lang=pt-BR
/rota-inexistente 768: iw=768 sw=[768,768] v=[1000,1000] vt=0 lang=pt-BR
/rota-inexistente 1440: iw=1440 sw=[1440,1440] v=[800,800] vt=0 lang=pt-BR
```

`scrollWidth = clientWidth` em todas as medidas: nenhuma rolagem horizontal. Onde `clientWidth` é
menor que `iw`, a diferença é a barra de rolagem vertical. A 1440×800, Home e Sobre dão
`scrollHeight = clientHeight` (800): sem rolagem vertical. (`vt=0` conta um seletor por atributo
que não se aplica aqui; a transição foi medida abaixo.) `fetch('/rota-inexistente')` deu
`{"status404":404,"title404":"Página não encontrada — Haroldo Lima Junior"}`.

Transição de página: um ouvinte de `pageswap` foi instalado na página de saída e o link foi
clicado de verdade. Leitura na página de chegada:

```
{"here":"/sobre/","swap":"{\"from\":\"/\",\"hasVT\":true,\"to\":\"http://127.0.0.1:8787/sobre/\"}","vt":["nome","menu"]}
{"here":"/","swap":"{\"from\":\"/sobre/\",\"hasVT\":true}"}
```

Home → Sobre (link "Sobre" do menu da Home) e Sobre → Home (nome no cabeçalho): as duas navegações
abriram `viewTransition`, e `.vt-nome`/`.vt-menu` computam `view-transition-name` `nome` e `menu`.

### Verificação autoritativa e CI (orquestrador)

Segunda rodada do `triage-runner`, em 2026-09-30, depois da correção do ciclo de revisão e do commit
`8e74700` (`wrangler` 4.145.0 e `brace-expansion`/`undici` no lock, para os avisos `high` do `npm audit`,
sem relação com este plano). A primeira rodada reprovou só no `audit`. Revisão: APROVADO no ciclo 2.

```
audit.txt:EXIT=0
build.txt:EXIT=0
coverage.txt:EXIT=0
format.txt:EXIT=0
lint.txt:EXIT=0
test-dist.txt:EXIT=0
```

Check-runs do commit de trabalho `156b130`, empurrado:

```
Workers Builds: haroldo-page: completed / success
qualidade: completed / success
```
