# Plano 056 — Mapa de rotas PT↔EN, idioma pelo caminho e navegação por idioma

**Status:** TODO
**RFs cobertos:** base de RF-29 e RF-30 (`hreflang`); RN-09; sabatina fase 4, Decisões 3 e 6; dívida (e) da fase 3
**Depende de:** plano 055 (comparador)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um módulo único, `src/lib/routes.ts`, sabe o caminho de cada rota nos dois idiomas, o idioma de um
caminho e o par de um caminho no outro idioma. A navegação passa a ser gerada por idioma. As páginas
PT continuam **idênticas**.

## Arquivos afetados

- `src/lib/routes.ts` — novo
- `tests/lib/routes.test.ts` — novo
- `src/lib/navigation.ts` — `NAV_ITEMS` vira `navItems(locale)`; `isActivePath` generalizado para a Home EN
- `tests/lib/navigation.test.ts` — acompanha
- `src/components/SiteHeader.astro`, `src/pages/index.astro`, `src/pages/404.astro` — só trocam `NAV_ITEMS` por `navItems('pt')`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite.

## Contexto necessário

**Decisões da sabatina** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): **Decisão 3** — a
disciplina usa em `/en` o **mesmo slug PT** (`/ensino/<slug>/` ↔ `/en/teaching/<slug>/`); não há
slug de `en.nome` nem redirecionamento (as Decisões 1 e 2 estão substituídas). **Decisão 6** — o
mapa de segmentos PT↔EN fica **num único módulo em `src/lib/`**, usado pelo menu, pelo seletor e pelo
`hreflang`. RF-29 fixa `/ensino` → `/en/teaching`.

**Mapa (fixado):**

| Chave | PT | EN |
|---|---|---|
| `home` | `/` | `/en/` |
| `about` | `/sobre/` | `/en/about/` |
| `research` | `/pesquisa/` | `/en/research/` |
| `teaching` | `/ensino/` | `/en/teaching/` |
| `publications` | `/publicacoes/` | `/en/publications/` |
| disciplina | `/ensino/<slug>/` | `/en/teaching/<slug>/` |

**API de `src/lib/routes.ts` (fixada):**

```ts
import type { Locale } from './config'; // SÓ `import type` — ver armadilha 3 do README da fase
export const HTML_LANG = { pt: 'pt-BR', en: 'en' } as const satisfies Record<Locale, string>;
export type RouteKey = 'home' | 'about' | 'research' | 'teaching' | 'publications';
export function routePath(key: RouteKey, locale: Locale): string;
export function coursePath(slug: string, locale: Locale): string;
export function localeFromPath(pathname: string): Locale;   // '/en' e '/en/…' → 'en'; resto → 'pt'
export function counterpartPath(pathname: string): string;  // par no outro idioma
```

Regras de `localeFromPath`: `'/en'`, `'/en/'`, `'/en/about/'` → `'en'`; `'/'`, `'/sobre'`, `'/enx/'`,
`'/ensino/'` → `'pt'` (prefixo só conta como segmento inteiro).

Regras de `counterpartPath`, aceitando caminho com ou sem barra final (o `Astro.url.pathname` do
build pode vir das duas formas) e devolvendo **sempre com barra final**: as cinco rotas fixas e a
disciplina trocam pelo mapa (o slug passa intacto); `'/404'`, `'/404/'` e `'/404.html'` → `'/en/'`, e
`'/en/404'` (mesmas variantes) → `'/'` (decisão 8 do README da fase: a 404 não tem "mesma página");
qualquer outro caminho **lança** `Error` nomeando o caminho — rota nova sem par reprova o build em vez
de gerar link quebrado.

**`src/lib/navigation.ts`:** hoje exporta `NAV_ITEMS` (lista PT `as const satisfies …`) e
`isActivePath(href, pathname)`. Troque `NAV_ITEMS` por `navItems(locale: Locale)`, que devolve
`{ key, href }[]` na mesma ordem (home, about, research, teaching, publications), com `href` de
`routePath`. **Armadilha:** `isActivePath` trata `'/'` como caso especial (só ativo em `'/'` exato);
todo outro `href` é ativo por prefixo. `'/en/'` é prefixo de toda rota EN — generalize: **o `href` da
Home de qualquer idioma** só é ativo em igualdade exata. Mantenha os seis testes existentes de
`tests/lib/navigation.test.ts` passando e acrescente: `'/en/'` inativo em `'/en/about/'`, ativo em
`'/en/'` e `'/en'`; `'/en/teaching/'` ativo em `'/en/teaching/2026-2-relatividade-geral/'`.

**Callers de `NAV_ITEMS`** (conferidos por grep em 2026-09-24): `src/components/SiteHeader.astro:27,30`,
`src/pages/index.astro:35,47`, `src/pages/404.astro:33,46`. Troque por `navItems('pt')` e nada mais —
as views dos planos 062–064 passam a usar o idioma da rota.

**Cobertura:** `vitest.config.ts` inclui `src/lib/**/*.ts` com thresholds; mire 100% de linhas e
ramos em `routes.ts` (a fase 3 fechou em 100%).

**Regras de código:** README da fase 4, seção "Regras de código que todo plano desta fase herda".
Cite **RN-09** onde o PT é o idioma sem prefixo e **RF-29** no par de rotas.

## Passos

1. Retrato "antes": `npm run build:pipeline` e `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. Escrever `src/lib/routes.ts` e `tests/lib/routes.test.ts` (todas as linhas das duas tabelas acima, as variantes de barra e o `throw`) → verify: `npm test -- --reporter=verbose tests/lib/routes.test.ts` colado.
3. `navItems` e `isActivePath` generalizado, com os testes novos → verify: `npm test -- --reporter=verbose tests/lib/navigation.test.ts` colado.
4. Trocar os três callers → verify: `npx astro check` colado.
5. Retrato "depois" e comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — **toda rota `IGUAL`**, exit 0.
6. Canário do `throw`: um teste que chama `counterpartPath('/cv/')` e espera erro já está no passo 2; mostre-o vermelho trocando temporariamente o `throw` por `return '/'` e desfaça → verify: saída vermelha e verde coladas.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados (linhas de `routes.ts` e `navigation.ts` na tabela de cobertura).

## Critérios de aceitação

- [x] `routePath`, `coursePath`, `localeFromPath`, `counterpartPath` e `HTML_LANG` com a API e as regras do Contexto, testados linha a linha das tabelas
- [x] `counterpartPath` lança para caminho sem par (canário do passo 6)
- [x] `navItems(locale)` substitui `NAV_ITEMS`; `'/en/'` não fica ativo nas rotas EN internas
- [x] `routes.ts` sem import de valor (só `import type`)
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL` (passo 5)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

Executado em 2026-09-25, inline (`superpowers:executing-plans`), branch `fase-4-inline`. Código final:
`9cb54f1` (trabalho em `d44a874`; `9cb54f1` só reescreveu um comentário de `routes.ts` e a data dos
três callers, observações da revisão). Todos os blocos abaixo são o conteúdo integral do arquivo
indicado, capturado com `NO_COLOR=1` depois da última edição de código e inserido por script; o
verificador de fidelidade está no relatório.

**Passos 1 e 5** — prova de "PT idêntico" refeita com o comparador final do 055 (que mantém os
`<script>` e compara o script externo pelo conteúdo): build real com `src/` e `tests/` de `0ebf8ed`
(antes do 056, `git checkout 0ebf8ed -- src tests`) e build real do `HEAD` (`git checkout HEAD -- src
tests`; `git status --short` vazio depois), um retrato de cada.

Build "antes" (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/build-antes.txt -->

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  15:07:43
   Duration  3.98s (transform 6.67s, setup 0ms, import 9.45s, tests 270ms, environment 1ms)

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
15:10:03 [content] Syncing content
15:10:03 [content] Synced content
15:10:03 [types] Generated 1.23s
15:10:03 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (63 files): 
- 0 errors
- 0 warnings
- 0 hints

15:10:40 [content] Syncing content
15:10:40 [content] Synced content
15:10:40 [types] Generated 7.43s
15:10:40 [build] output: "static"
15:10:40 [build] mode: "static"
15:10:40 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:10:40 [build] Collecting build info...
15:10:40 [build] ✓ Completed in 7.67s.
15:10:40 [build] Building static entrypoints...
15:10:43 [vite] ✓ built in 2.80s
15:10:44 [vite] ✓ built in 1.05s
15:10:44 [build] Rearranging server assets...

 generating static routes 
15:10:44   ├─ /404.html (+103ms) 
15:10:44   ├─ /ensino/2025-1-mecanica-classica/index.html (+76ms) 
15:10:44   ├─ /ensino/2026-2-relatividade-geral/index.html (+498ms) 
15:10:45   ├─ /ensino/index.html (+52ms) 
15:10:45   ├─ /pesquisa/index.html (+52ms) 
15:10:45   ├─ /publicacoes/index.html (+42ms) 
15:10:45   ├─ /sobre/index.html (+29ms) 
15:10:45   ├─ /index.html (+19ms) 
15:10:45 ✓ Completed in 1.05s.

15:10:45 [build] ✓ Completed in 5.19s.
15:10:45 [build] 8 page(s) built in 12.90s
15:10:45 [build] Complete!
```

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/retrato-antes.txt -->

```
retrato: 8 rota(s) de dist em C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/antes.json
```

Build "depois", `HEAD` (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/build-depois.txt -->

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  15:10:58
   Duration  9.78s (transform 21.99s, setup 0ms, import 25.81s, tests 548ms, environment 1ms)

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
15:12:37 [content] Syncing content
15:12:37 [content] Synced content
15:12:37 [types] Generated 1.61s
15:12:37 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (63 files): 
- 0 errors
- 0 warnings
- 0 hints

15:12:57 [content] Syncing content
15:12:57 [content] Synced content
15:12:57 [types] Generated 1.64s
15:12:57 [build] output: "static"
15:12:57 [build] mode: "static"
15:12:57 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:12:57 [build] Collecting build info...
15:12:57 [build] ✓ Completed in 1.72s.
15:12:57 [build] Building static entrypoints...
15:12:59 [vite] ✓ built in 1.04s
15:12:59 [vite] ✓ built in 209ms
15:12:59 [build] Rearranging server assets...

 generating static routes 
15:12:59   ├─ /404.html (+24ms) 
15:12:59   ├─ /ensino/2025-1-mecanica-classica/index.html (+28ms) 
15:12:59   ├─ /ensino/2026-2-relatividade-geral/index.html (+374ms) 
15:12:59   ├─ /ensino/index.html (+44ms) 
15:12:59   ├─ /pesquisa/index.html (+43ms) 
15:12:59   ├─ /publicacoes/index.html (+40ms) 
15:12:59   ├─ /sobre/index.html (+46ms) 
15:13:00   ├─ /index.html (+32ms) 
15:13:00 ✓ Completed in 716ms.

15:13:00 [build] ✓ Completed in 2.12s.
15:13:00 [build] 8 page(s) built in 3.87s
15:13:00 [build] Complete!
```

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/retrato-depois.txt -->

```
retrato: 8 rota(s) de dist em C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/depois.json
```

`comparar antes.json depois.json` (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/comparar.txt -->

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
```

**Passo 2** — o teste foi escrito antes do módulo e visto vermelho (`Test Files 1 failed`, import de
`src/lib/routes` inexistente); o caso `'/sobre.html'` foi acrescentado e visto vermelho antes da
correção de `counterpartPath`. Saída final, `npm test -- --reporter=verbose tests/lib/routes.test.ts`
(exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo2.txt -->

```

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

 Test Files  1 passed (1)
      Tests  37 passed (37)
   Start at  15:13:55
   Duration  427ms (transform 47ms, setup 0ms, import 73ms, tests 10ms, environment 0ms)
```

**Passo 3** — os testes novos foram vistos vermelhos antes da mudança (6 falhas). Saída final,
`npm test -- --reporter=verbose tests/lib/navigation.test.ts` (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo3.txt -->

```

> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/lib/navigation.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/navigation.test.ts > isActivePath > "/" ativo só em "/" 2ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/sobre/" ativo em "/sobre" e "/sobre/" 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/ensino/" ativo em "/ensino/2026-2-relatividade-geral/" 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/ensino/" inativo em "/ensinox/" 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/ensino" (sem barra) ativo em "/ensino/algo/" 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/ensino" (sem barra) inativo em "/ensinox/" (sem falso positivo de prefixo) 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/en/" (Home EN) inativo em "/en/about/" 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/en/" ativo em "/en/" e "/en" 0ms
 ✓ tests/lib/navigation.test.ts > isActivePath > "/en/teaching/" ativo em "/en/teaching/2026-2-relatividade-geral/" 0ms
 ✓ tests/lib/navigation.test.ts > navItems > pt: as cinco rotas na ordem do menu, com os caminhos PT 1ms
 ✓ tests/lib/navigation.test.ts > navItems > en: mesma ordem, com os caminhos EN 0ms
 ✓ tests/lib/navigation.test.ts > navItems > pt: todo href termina em "/" 0ms
 ✓ tests/lib/navigation.test.ts > navItems > en: todo href termina em "/" 0ms
 ✓ tests/lib/navigation.test.ts > navItems > todo key existe em pt.nav 1ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  15:14:00
   Duration  480ms (transform 66ms, setup 0ms, import 99ms, tests 8ms, environment 0ms)
```

**Passo 4** — `npx astro check` (exit 0). `SiteHeader.astro` e `index.astro` já tinham
uma `const navItems` local; o import entrou como `navItems as navItemsFor`:

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo4-astro-check.txt -->

```
15:14:15 [content] Syncing content
15:14:15 [content] Synced content
15:14:15 [types] Generated 3.19s
15:14:15 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (63 files): 
- 0 errors
- 0 warnings
- 0 hints
```

**Passo 6** — canário: `throw` trocado por `return '/'` (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo6-vermelho.txt -->

```

> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/lib/routes.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/routes.test.ts > HTML_LANG > pt → "pt-BR", en → "en" 3ms
 ✓ tests/lib/routes.test.ts > routePath > home → / (pt) e /en/ (en) 1ms
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
 × tests/lib/routes.test.ts > counterpartPath > caminho sem par (/cv/) lança nomeando o caminho 7ms
   → expected [Function] to throw an error
 × tests/lib/routes.test.ts > counterpartPath > caminho sem par (/en/cv/) lança nomeando o caminho 1ms
   → expected [Function] to throw an error
 × tests/lib/routes.test.ts > counterpartPath > caminho sem par (/ensino/a/b/) lança nomeando o caminho 1ms
   → expected [Function] to throw an error
 × tests/lib/routes.test.ts > counterpartPath > caminho sem par (/enx/) lança nomeando o caminho 1ms
   → expected [Function] to throw an error
 × tests/lib/routes.test.ts > counterpartPath > caminho sem par (/sobre.html) lança nomeando o caminho 1ms
   → expected [Function] to throw an error

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/routes.test.ts > counterpartPath > caminho sem par (/cv/) lança nomeando o caminho
 FAIL  tests/lib/routes.test.ts > counterpartPath > caminho sem par (/en/cv/) lança nomeando o caminho
 FAIL  tests/lib/routes.test.ts > counterpartPath > caminho sem par (/ensino/a/b/) lança nomeando o caminho
 FAIL  tests/lib/routes.test.ts > counterpartPath > caminho sem par (/enx/) lança nomeando o caminho
 FAIL  tests/lib/routes.test.ts > counterpartPath > caminho sem par (/sobre.html) lança nomeando o caminho
AssertionError: expected [Function] to throw an error

- Expected:
null

+ Received:
undefined

 ❯ tests/lib/routes.test.ts:97:43
     95|     'caminho sem par (%s) lança nomeando o caminho',
     96|     (path) => {
     97|       expect(() => counterpartPath(path)).toThrow(path);
       |                                           ^
     98|     },
     99|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 32 passed (37)
   Start at  15:14:38
   Duration  617ms (transform 67ms, setup 0ms, import 107ms, tests 20ms, environment 0ms)
```

Restaurado (`git status --short` vazio) (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo6-verde.txt -->

```

> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/lib/routes.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/routes.test.ts > HTML_LANG > pt → "pt-BR", en → "en" 2ms
 ✓ tests/lib/routes.test.ts > routePath > home → / (pt) e /en/ (en) 1ms
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
 ✓ tests/lib/routes.test.ts > counterpartPath > home: / ↔ /en/ 1ms
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

 Test Files  1 passed (1)
      Tests  37 passed (37)
   Start at  15:14:45
   Duration  503ms (transform 56ms, setup 0ms, import 89ms, tests 12ms, environment 0ms)
```

**Passo 7** — `npm run lint` (exit 0), `npm run format:check` (exit 0), `npm run test:coverage` (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo7-lint.txt -->

```

> haroldo-page@0.1.0 lint
> eslint .
```

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo7-format.txt -->

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo7-coverage.txt -->

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  18 passed (18)
      Tests  303 passed (303)
   Start at  15:15:17
   Duration  5.04s (transform 12.85s, setup 0ms, import 20.62s, tests 458ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 263/263 )
Branches     : 100% ( 127/127 )
Functions    : 100% ( 65/65 )
Lines        : 100% ( 238/238 )
================================================================================
```

A tabela do reporter `text` omite arquivos em 100% (`skipFull`). Por arquivo, reporter
`json-summary` sobre os dois testes do plano (`scratchpad/ev056/cov/coverage-summary.json`):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo7-cobertura-por-arquivo.txt -->

```
src/lib/navigation.ts linhas 7/7 ramos 6/6 funções 3/3
src/lib/routes.ts linhas 17/17 ramos 21/21 funções 5/5
```

`routes.ts` tem um único import, `import type { Locale } from './config'`.