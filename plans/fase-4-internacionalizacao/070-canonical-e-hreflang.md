# Plano 070 — `canonical` e `hreflang` com `x-default` (RF-30)

**Status:** TODO
**RFs cobertos:** **RF-30** (canonical, `hreflang`), RN-09; sabatina fase 4, Decisões 6 e 10; §12 fase 4, item 7 (com o 071)
**Depende de:** planos 066, 067, 068 (todas as rotas EN existem)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Todo `<head>` (exceto as duas 404) traz `<link rel="canonical">` para a própria URL e três
`<link rel="alternate" hreflang>` — `pt-BR`, `en` e `x-default` apontando para a versão PT —, todos
absolutos e recíprocos entre o par PT/EN.

## Arquivos afetados

- `src/lib/routes.ts` — `alternateLinks(pathname)`
- `tests/lib/routes.test.ts` — acompanha
- `src/layouts/BaseLayout.astro` — canonical e alternates no `<head>`; prop `notFound?`
- `src/views/NotFoundView.astro` — passa `notFound` ao `BaseLayout`
- `tests/dist/site-gerado.test.ts` — canonical e alternates por rota

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Não** mexa em `robots.txt` nem em `public/_headers` (fase 5, Q-05).

## Contexto necessário

**Decisão 10** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): "O `hreflang` do `<head>` inclui
`x-default` apontando para a versão PT (RN-09, idioma canônico)." **Decisão 6:** o mapa de rotas é a
fonte do `hreflang`. **Decisão de fatiamento 9** (README da fase): as 404 não têm canonical nem
`hreflang`.

**`alternateLinks(pathname: string): { hreflang: string; path: string }[]`** em `src/lib/routes.ts`
(056): para uma rota PT ou EN, devolve `[{ hreflang: 'pt-BR', path: <PT> }, { hreflang: 'en', path:
<EN> }, { hreflang: 'x-default', path: <PT> }]`, com caminhos normalizados com barra final, usando
`localeFromPath`/`counterpartPath` e `HTML_LANG`. Rota sem par lança (herda de `counterpartPath`). Só
caminho, sem origem: `routes.ts` **não** pode importar valor de `src/lib/config.ts` (o 071 importa
`routes.ts` a partir do `astro.config.mjs`; armadilha 3 do README da fase). Testes cobrindo Home,
rota fixa, disciplina e os dois idiomas.

**`BaseLayout.astro`:** URL absoluta = `new URL(path, siteConfig.siteUrl).href` (`siteConfig.siteUrl`
vem de `PUBLIC_SITE_URL` ou do default `https://haroldo-page.and-near.workers.dev`,
`src/lib/config.ts:31-40`). O canonical usa o caminho da própria página normalizado com barra final —
o mesmo formato dos links internos (auto-trailing-slash do Worker). Prop nova `notFound?: boolean`
(ausente = `false`): com `true`, nenhum canonical nem alternate. Atualize a nota do cabeçalho
("canonical, Open Graph e `hreflang` ficam para as fases 4 e 5" → só o Open Graph fica para a fase 5).

**Testes de `dist`:** para todo `.html` fora de `admin/` e das duas 404: exatamente um canonical, igual
à URL da própria rota; exatamente três alternates com `hreflang` `pt-BR`, `en`, `x-default`; o
alternate `pt-BR` e o `x-default` iguais; **reciprocidade** — a página apontada pelo alternate `en`
existe em `dist/` e aponta de volta para esta no seu alternate `pt-BR`. Nas duas 404: zero canonical,
zero alternate. A origem esperada no teste sai do mesmo default (`siteConfig.siteUrl` — o teste roda
em Node sem `PUBLIC_SITE_URL`; se o CI definir a variável, compare pela **origem lida do canonical da
Home**, não por literal).

**Regras de código:** README da fase 4. Cite **RF-30** e **RN-09** (x-default no PT).

## Passos

1. `alternateLinks` e testes → verify: `npm test -- --reporter=verbose tests/lib/routes.test.ts` colado.
2. `BaseLayout` e `NotFoundView` → verify: `npx astro check` colado.
3. Build → verify: `npm run build:pipeline` colado; `grep -o '<link rel="\(canonical\|alternate\)"[^>]*>' dist/sobre/index.html dist/en/teaching/2026-2-relatividade-geral/index.html dist/404.html dist/en/404.html` colado.
4. Testes de `dist` → verify: `npm run test:dist` colado.
5. Canário: troque temporariamente o `x-default` para o caminho EN → o teste de `dist` reprova; desfaça → verify: saídas coladas.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] `alternateLinks` testado nas rotas fixas, na disciplina e nos dois idiomas
- [x] Toda página (fora as 404) com um canonical para si e os três alternates absolutos, recíprocos, `x-default` = PT
- [x] As duas 404 sem canonical e sem alternate
- [x] `robots.txt` e `_headers` intocados (`git diff --stat` colado)
- [x] Canário do passo 5 vermelho
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

**Não rodei:** o passo de navegador (o plano não tem), `npm audit`, `npm ci`, a verificação independente do `triage-runner`, a revisão, o CI e qualquer commit/push. `Status:` fica `TODO`.

### Passo 1 — `alternateLinks` e testes (`npm test -- --reporter=verbose tests/lib/routes.test.ts`)

Estado final. O vermelho inicial (10 testes novos falhando com `alternateLinks is not a function`) foi visto na sessão, mas não capturado em arquivo; não colo aqui.

```text
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/lib/routes.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/routes.test.ts > HTML_LANG > pt → "pt-BR", en → "en" 2ms
 ✓ tests/lib/routes.test.ts > routePath > home → / (pt) e /en/ (en) 0ms
 ✓ tests/lib/routes.test.ts > routePath > about → /sobre/ (pt) e /en/about/ (en) 0ms
 ✓ tests/lib/routes.test.ts > routePath > research → /pesquisa/ (pt) e /en/research/ (en) 0ms
 ✓ tests/lib/routes.test.ts > routePath > teaching → /ensino/ (pt) e /en/teaching/ (en) 0ms
 ✓ tests/lib/routes.test.ts > routePath > publications → /publicacoes/ (pt) e /en/publications/ (en) 0ms
 ✓ tests/lib/routes.test.ts > coursePath > mesmo slug nos dois idiomas (sabatina fase 4, Decisão 3) 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /en → en 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /en/ → en 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /en/about/ → en 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /en/teaching/2026-2-relatividade-geral/ → en 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > / → pt (prefixo só conta como segmento inteiro) 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /sobre → pt (prefixo só conta como segmento inteiro) 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /enx/ → pt (prefixo só conta como segmento inteiro) 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /ensino/ → pt (prefixo só conta como segmento inteiro) 0ms
 ✓ tests/lib/routes.test.ts > localeFromPath > /ensino/2026-2-relatividade-geral/ → pt (prefixo só conta como segmento inteiro) 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > home: / ↔ /en/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > about: /sobre/ ↔ /en/about/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > research: /pesquisa/ ↔ /en/research/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > teaching: /ensino/ ↔ /en/teaching/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > publications: /publicacoes/ ↔ /en/publications/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > sem barra final: /sobre → /en/about/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > sem barra final: /en/about → /sobre/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > sem barra final: /en → / 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > sem barra final: /ensino → /en/teaching/ 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > disciplina: o slug passa intacto, com ou sem barra 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > 404 PT (/404) → Home EN 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > 404 PT (/404/) → Home EN 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > 404 PT (/404.html) → Home EN 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > 404 EN (/en/404) → Home PT 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > 404 EN (/en/404/) → Home PT 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > 404 EN (/en/404.html) → Home PT 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > caminho sem par (/cv/) lança nomeando o caminho 1ms
 ✓ tests/lib/routes.test.ts > counterpartPath > caminho sem par (/en/cv/) lança nomeando o caminho 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > caminho sem par (/ensino/a/b/) lança nomeando o caminho 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > caminho sem par (/enx/) lança nomeando o caminho 0ms
 ✓ tests/lib/routes.test.ts > counterpartPath > caminho sem par (/sobre.html) lança nomeando o caminho 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > home: pt-BR, en e x-default (PT) a partir de qualquer dos dois idiomas 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > about: pt-BR, en e x-default (PT) a partir de qualquer dos dois idiomas 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > research: pt-BR, en e x-default (PT) a partir de qualquer dos dois idiomas 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > teaching: pt-BR, en e x-default (PT) a partir de qualquer dos dois idiomas 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > publications: pt-BR, en e x-default (PT) a partir de qualquer dos dois idiomas 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > disciplina: o slug passa intacto e o x-default é o caminho PT 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > aceita o caminho sem barra final e devolve todos com barra final 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > caminho sem par (/cv/) lança nomeando o caminho 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > caminho sem par (/en/cv/) lança nomeando o caminho 0ms
 ✓ tests/lib/routes.test.ts > alternateLinks (RF-30, RN-09) > caminho sem par (/enx/) lança nomeando o caminho 0ms

 Test Files  1 passed (1)
      Tests  47 passed (47)
   Start at  11:56:33
   Duration  221ms (transform 40ms, setup 0ms, import 60ms, tests 9ms, environment 0ms)

EXIT=0
```

### Passo 1 — `routes.ts` continua só com `import type` de `config.ts` (`grep -n '^import' src/lib/routes.ts`)

```text
26:import type { Locale } from './config';
```

### Passo 2 — `npx astro check`

```text
12:08:10 [content] Syncing content
12:08:10 [content] Synced content
12:08:10 [types] Generated 511ms
12:08:10 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (93 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 3 — `npm run build:pipeline` (depois de desfeitos os canários)

```text
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:08:17
   Duration  1.19s (transform 1.92s, setup 0ms, import 3.12s, tests 79ms, environment 0ms)

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
12:08:46 [content] Syncing content
12:08:46 [content] Synced content
12:08:46 [types] Generated 501ms
12:08:46 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (93 files): 
- 0 errors
- 0 warnings
- 0 hints

12:08:55 [content] Syncing content
12:08:55 [content] Synced content
12:08:55 [types] Generated 506ms
12:08:55 [build] output: "static"
12:08:55 [build] mode: "static"
12:08:55 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:08:55 [build] Collecting build info...
12:08:55 [build] ✓ Completed in 551ms.
12:08:55 [build] Building static entrypoints...
12:08:55 [vite] ✓ built in 387ms
12:08:55 [vite] ✓ built in 93ms
12:08:55 [build] Rearranging server assets...

 generating static routes 
12:08:56   ├─ /404.html (+14ms) 
12:08:56   ├─ /en/404/index.html (+5ms) 
12:08:56   ├─ /en/about/index.html (+8ms) 
12:08:56   ├─ /en/publications/index.html (+6ms) 
12:08:56   ├─ /en/research/index.html (+6ms) 
12:08:56   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+4ms) 
12:08:56   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+96ms) 
12:08:56   ├─ /en/teaching/index.html (+7ms) 
12:08:56   ├─ /en/index.html (+7ms) 
12:08:56   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
12:08:56   ├─ /ensino/2026-2-relatividade-geral/index.html (+14ms) 
12:08:56   ├─ /ensino/index.html (+5ms) 
12:08:56   ├─ /pesquisa/index.html (+4ms) 
12:08:56   ├─ /publicacoes/index.html (+4ms) 
12:08:56   ├─ /sobre/index.html (+3ms) 
12:08:56   ├─ /index.html (+3ms) 
12:08:56 ✓ Completed in 229ms.

12:08:56 [build] ✓ Completed in 745ms.
12:08:56 [build] 16 page(s) built in 1.35s
12:08:56 [build] Complete!
EXIT=0

FullName                                           Length LastWriteTime      
--------                                           ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html    6883 02/10/2026 12:08:56
S:\Projetos\academic_page\haroldo\dist\404.html      9540 02/10/2026 12:08:56
S:\Projetos\academic_page\haroldo\dist\en\404.html   9566 02/10/2026 12:08:56
```

### Passo 3 — canonical e alternates no `dist/` (PT e EN com os quatro links; as duas 404 sem nenhuma linha)

```text
dist/sobre/index.html:<link rel="canonical" href="https://haroldo-page.and-near.workers.dev/sobre/">
dist/sobre/index.html:<link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/sobre/">
dist/sobre/index.html:<link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/about/">
dist/sobre/index.html:<link rel="alternate" hreflang="x-default" href="https://haroldo-page.and-near.workers.dev/sobre/">
dist/en/teaching/2026-2-relatividade-geral/index.html:<link rel="canonical" href="https://haroldo-page.and-near.workers.dev/en/teaching/2026-2-relatividade-geral/">
dist/en/teaching/2026-2-relatividade-geral/index.html:<link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/ensino/2026-2-relatividade-geral/">
dist/en/teaching/2026-2-relatividade-geral/index.html:<link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/teaching/2026-2-relatividade-geral/">
dist/en/teaching/2026-2-relatividade-geral/index.html:<link rel="alternate" hreflang="x-default" href="https://haroldo-page.and-near.workers.dev/ensino/2026-2-relatividade-geral/">
EXIT=0
```

### Passo 3 — `<head>` de uma página PT, uma EN e a 404 (até o primeiro `<script`)

```text
== dist/sobre/index.html
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sobre — Haroldo Lima Junior</title><meta name="description" content="Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA."><link rel="canonical" href="https://haroldo-page.and-near.workers.dev/sobre/"><link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/sobre/"><link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/about/"><link rel="alternate" hreflang="x-default" href="https://haroldo-page.and-near.workers.dev/sobre/"><link rel="preload" href="/_astro/archivo-latin-300-normal.AMs-pvbP.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#efedea"><script
== dist/en/about/index.html
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>About — Haroldo Lima Junior</title><meta name="description" content="Academic website of Prof. Haroldo Cilas Duarte Lima Junior, Assistant Professor of Physics at the Federal University of Maranhão (UFMA)."><link rel="canonical" href="https://haroldo-page.and-near.workers.dev/en/about/"><link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/sobre/"><link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/about/"><link rel="alternate" hreflang="x-default" href="https://haroldo-page.and-near.workers.dev/sobre/"><link rel="preload" href="/_astro/archivo-latin-300-normal.AMs-pvbP.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#efedea"><script
== dist/404.html
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Página não encontrada — Haroldo Lima Junior</title><meta name="description" content="Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA."><link rel="preload" href="/_astro/archivo-latin-300-normal.AMs-pvbP.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#efedea"><script
```

### Passo 4 — `npm run test:dist`

```text
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  38 passed (38)
   Start at  12:08:57
   Duration  485ms (transform 96ms, setup 0ms, import 175ms, tests 178ms, environment 0ms)

EXIT=0
```

### Passo 5 — canário 1: `x-default` apontando para o caminho EN em `routes.ts`; build

```text
11:54:54 [build] ✓ Completed in 858ms.
11:54:54 [build] 16 page(s) built in 1.51s
11:54:54 [build] Complete!
EXIT=0
```

### Passo 5 — canário 1: `test:dist` (vermelho)

```text
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (38 tests | 1 failed) 205ms
     × toda página tem os alternates pt-BR, en e x-default, absolutos, com x-default = pt-BR 7ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > toda página tem os alternates pt-BR, en 
e x-default, absolutos, com x-default = pt-BR
AssertionError: /en/about/: x-default: expected 'https://haroldo-page.and-near.workers…' to be 
'https://haroldo-page.and-near.workers…' // Object.is equality

Expected: "https://haroldo-page.and-near.workers.dev/sobre/"
Received: "https://haroldo-page.and-near.workers.dev/en/about/"

 ❯ tests/dist/site-gerado.test.ts:536:52
    534|         `${origin}${localeFromPath(route) === 'en' ? route : counterpa…
    535|       );
    536|       expect(xDefault.href, `${route}: x-default`).toBe(pt.href);
       |                                                    ^
    537|     }
    538|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 37 passed (38)
   Start at  11:55:02
   Duration  543ms (transform 105ms, setup 0ms, import 197ms, tests 205ms, environment 0ms)

EXIT=1
```

### Passo 5 — canário 2: origem errada (`https://errado.test`) no `BaseLayout`; build

```text
12:07:56 [build] ✓ Completed in 801ms.
12:07:56 [build] 16 page(s) built in 1.42s
12:07:56 [build] Complete!
EXIT=0
```

### Passo 5 — canário 2: `test:dist` (vermelho)

```text
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (38 tests | 4 failed) 158ms
     × a origem do canonical da Home é a de `siteConfig.siteUrl` 7ms
     × toda página (fora as 404) tem um canonical, igual à URL da própria rota 1ms
     × toda página tem os alternates pt-BR, en e x-default, absolutos, com x-default = pt-BR 2ms
     × reciprocidade: a página apontada pelo alternate en existe e aponta de volta no pt-BR 2ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > a origem do canonical da Home é a de 
`siteConfig.siteUrl`
AssertionError: expected 'https://errado.test' to be 'https://haroldo-page.and-near.workers…' // Object.is equality

Expected: "https://haroldo-page.and-near.workers.dev"
Received: "https://errado.test"

 ❯ tests/dist/site-gerado.test.ts:510:57
    508|
    509|   it('a origem do canonical da Home é a de `siteConfig.siteUrl`', () =…
    510|     expect(new URL(canonicals(read('/'))[0][1]).origin).toBe(origin);
       |                                                         ^
    511|   });
    512|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > toda página (fora as 404) tem um 
canonical, igual à URL da própria rota
AssertionError: /en/about/: canonical: expected 'https://errado.test/en/about/' to be 
'https://haroldo-page.and-near.workers…' // Object.is equality

Expected: "https://haroldo-page.and-near.workers.dev/en/about/"
Received: "https://errado.test/en/about/"

 ❯ tests/dist/site-gerado.test.ts:517:50
    515|       const found = canonicals(readFileSync(file, 'utf-8'));
    516|       expect(found.length, `${route}: ${found.length} canonicals`).toB…
    517|       expect(found[0][1], `${route}: canonical`).toBe(`${origin}${rout…
       |                                                  ^
    518|     }
    519|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > toda página tem os alternates pt-BR, en 
e x-default, absolutos, com x-default = pt-BR
AssertionError: /en/about/: pt-BR: expected 'https://errado.test/sobre/' to be 
'https://haroldo-page.and-near.workers…' // Object.is equality

Expected: "https://haroldo-page.and-near.workers.dev/sobre/"
Received: "https://errado.test/sobre/"

 ❯ tests/dist/site-gerado.test.ts:529:42
    527|       ).toEqual(['pt-BR', 'en', 'x-default']);
    528|       const [pt, en, xDefault] = found;
    529|       expect(pt.href, `${route}: pt-BR`).toBe(
       |                                          ^
    530|         `${origin}${localeFromPath(route) === 'pt' ? route : counterpa…
    531|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > reciprocidade: a página apontada pelo 
alternate en existe e aponta de volta no pt-BR
AssertionError:  não aponta de volta para o pt-BR de /en/about/: expected 'https://errado.test/' to be 
'https://errado.test/sobre/' // Object.is equality

Expected: "https://errado.test/sobre/"
Received: "https://errado.test/"

 ❯ tests/dist/site-gerado.test.ts:549:81
    547|       const ptHref = back.find((a) => a.hreflang === 'pt-BR')?.href;
    548|       const own = alternates(readFileSync(file, 'utf-8'))[0].href;
    549|       expect(ptHref, `${enRoute} não aponta de volta para o pt-BR de $…
       |                                                                                 ^
    550|     }
    551|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 34 passed (38)
   Start at  12:07:57
   Duration  492ms (transform 102ms, setup 0ms, import 190ms, tests 158ms, environment 0ms)

EXIT=1
```

### Passo 5 — canários desfeitos editando de volta

```text
$ grep -n "x-default', path" src/lib/routes.ts
134:    { hreflang: 'x-default', path: pt },

$ grep -n "const absolute" src/layouts/BaseLayout.astro
69:const absolute = (path: string) => new URL(path, siteConfig.siteUrl).href;
```

### Passo 6 — `npm run lint`

```text
> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 6 — `npm run format:check`

```text
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 6 — `npm run test:coverage`

```text
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  365 passed (365)
   Start at  12:09:05
   Duration  1.79s (transform 5.38s, setup 0ms, import 9.68s, tests 369ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 299/299 )
Branches     : 100% ( 152/152 )
Functions    : 100% ( 80/80 )
Lines        : 100% ( 267/267 )
================================================================================
EXIT=0
```

### Critério `robots.txt` e `_headers` intocados

```text
$ git diff --stat
 .../070-canonical-e-hreflang.md                    | 401 ++++++++++++++++++++-
 src/layouts/BaseLayout.astro                       |  38 +-
 src/lib/routes.ts                                  |  24 +-
 src/views/NotFoundView.astro                       |   4 +-
 tests/dist/site-gerado.test.ts                     |  78 +++-
 tests/lib/routes.test.ts                           |  35 ++
 6 files changed, 561 insertions(+), 19 deletions(-)

$ git status --short
 M plans/fase-4-internacionalizacao/070-canonical-e-hreflang.md
 M src/layouts/BaseLayout.astro
 M src/lib/routes.ts
 M src/views/NotFoundView.astro
 M tests/dist/site-gerado.test.ts
 M tests/lib/routes.test.ts

$ git diff --stat -- public/robots.txt public/_headers
EXIT=0
```

### Contagem de linhas dos arquivos tocados

`BaseLayout.astro` passa de 150 linhas; aceito sem extração (PRD v0.1.71).

```text
  136 src/lib/routes.ts
  135 tests/lib/routes.test.ts
  152 src/layouts/BaseLayout.astro
   80 src/views/NotFoundView.astro
  697 tests/dist/site-gerado.test.ts
 1200 total
```

### BOM, codificação e mojibake

```text
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0

$ file (arquivos tocados)
src/lib/routes.ts:                                            JavaScript source, Unicode text, UTF-8 text
tests/lib/routes.test.ts:                                     JavaScript source, Unicode text, UTF-8 text
src/layouts/BaseLayout.astro:                                 JavaScript source, Unicode text, UTF-8 text
src/views/NotFoundView.astro:                                 JavaScript source, Unicode text, UTF-8 text
tests/dist/site-gerado.test.ts:                               JavaScript source, Unicode text, UTF-8 text
plans/fase-4-internacionalizacao/070-canonical-e-hreflang.md: HTML document, Unicode text, UTF-8 text, with very long lines (897)

$ grep -c 'Ã\|â€\|Â' (arquivos tocados + plano)
src/lib/routes.ts: 0
tests/lib/routes.test.ts: 0
src/layouts/BaseLayout.astro: 0
src/views/NotFoundView.astro: 0
tests/dist/site-gerado.test.ts: 0
plans/fase-4-internacionalizacao/070-canonical-e-hreflang.md: 0
```

### Suíte autoritativa (orquestrador)

A verificação oficial é a segunda rodada do `triage-runner`: lint, format, coverage (365 testes, 100%), `build:pipeline` (`astro check` 0/0/0, 16 páginas), `test:dist` (38 testes) e `audit`, todos `EXIT=0`. As capturas estão em `scratchpad/070/triage2/`. A primeira rodada, também verde, foi a do ciclo 1 da revisão. Essa revisão reprovou por teste tautológico na origem do canonical e por um comentário falso no `BaseLayout`; os dois foram corrigidos no ciclo 2.
