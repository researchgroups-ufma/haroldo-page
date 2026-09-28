# Plano 058 — Layout e cabeçalhos escolhem o dicionário pelo caminho

**Status:** TODO
**RFs cobertos:** §8.3 (`lang` no elemento raiz de cada árvore de idioma), §10.4, M-07 (meta description fora do dicionário)
**Depende de:** planos 056 (`localeFromPath`, `routePath`, `HTML_LANG`, `navItems`), 057 (`strings`, `site.description`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`BaseLayout`, `SiteHeader` e `PageHeader` deixam de importar `pt` e passam a usar o dicionário do
idioma do caminho: `<html lang>`, `<title>`, meta description, "Pular para o conteúdo", menu, rótulo
da navegação e o link do nome para a Home do idioma. O `PageHeader` aceita `lang` no título e na
linha de meta (para o conteúdo em fallback das rotas EN). As páginas PT continuam **idênticas**.

## Arquivos afetados

- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/components/PageHeader.astro` — props opcionais `titleLang` e `metaLang`
- `src/lib/config.ts` — sai `description` do `siteConfig` (a meta description passa a vir de `t.site.description`)
- `tests/i18n/pt.test.ts` — só o teste de `site.description` e o import de `siteConfig`, que dependiam do campo removido (autorizado pelo orquestrador em 2026-09-28; o teste nasceu no 057, depois do grep de 2026-09-24 citado no Contexto)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. O seletor de idioma **não** entra aqui (069): o comentário
> `<!-- fase 4: seletor de idioma (RF-29) -->` do `SiteHeader` fica onde está.

## Contexto necessário

**Decisão de fatiamento 2** (README da fase): os componentes compartilhados derivam o idioma de
`localeFromPath(Astro.url.pathname)` (056) — não recebem prop. Padrão em cada um:

```astro
import { strings } from '../i18n';
import { localeFromPath } from '../lib/routes';
const lang = localeFromPath(Astro.url.pathname);
const t = strings(lang);
```

**`BaseLayout.astro`** (123 linhas; ler inteiro): hoje `<html lang="pt-BR">` fixo (linha 57),
`pt.site.pageTitle` (54), `pt.site.skipToContent` (78) e `description = siteConfig.description` (50).
Troque por `HTML_LANG[lang]`, `t.site.pageTitle`, `t.site.skipToContent` e `description =
t.site.description`. Atualize a docstring da prop `description` ("Ausente: usa `t.site.description`").
A nota do cabeçalho "canonical, Open Graph e `hreflang` ficam para as fases 4 e 5" continua verdade
até o 070 — não mexa nela.

**`SiteHeader.astro`** (142 linhas): `pt.site.menu`, `pt.site.mainNavLabel`, `pt.nav[item.key]`, o
`navItems('pt')` que o 056 deixou, e o `href="/"` do nome (linha 38) → `routePath('home', lang)`. O
filtro "sem Início" deve passar a ser por **chave** (`item.key !== 'home'`), não por `href !== '/'`,
porque o `href` da Home EN é `/en/`.

**`PageHeader.astro`** (100 linhas): acrescente `titleLang?: string` e `metaLang?: string`, aplicados
como `lang={…}` no `<h1>` e no `<p>` de meta; ausentes = sem atributo (Astro não renderiza atributo
`undefined` — confirme no `dist/`). Docstring com o comportamento de prop ausente (§10.2). O uso vem
no 067 (nome da disciplina em fallback).

**`config.ts`:** remova `description` do `siteConfig` e ajuste a docstring/cabeçalho. Conferido por
grep em 2026-09-24: nenhum teste lê `siteConfig.description` (`tests/lib/config.test.ts` testa
`locales`, `defaultLocale`, `author`).

**Por que isso importa para a M-07:** `siteConfig.description` é texto em português fora do
dicionário; em `/en` ele sairia na meta description sem que o teste da Decisão 12 (que compara
valores do dicionário `pt`) visse.

**Regras de código:** README da fase 4. Atualize "Atualizado em", "Versão" e "Dependências" nos
cabeçalhos dos quatro arquivos.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. Editar os quatro arquivos → verify: `npx astro check` colado.
3. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0. Cole também `grep -o '<html lang="[^"]*"' dist/index.html dist/sobre/index.html dist/404.html` e `grep -o '<meta name="description" content="[^"]*"' dist/index.html`.
4. Canário de idioma pelo caminho: crie **temporariamente** `src/pages/en/sonda.astro` que só renderiza `<BaseLayout title="x"><PageHeader slot="cabecalho" title="x" titleLang="pt-BR" /></BaseLayout>`; build; cole de `dist/en/sonda/index.html`: `<html lang="en"`, o `<title>` com o formato de `en.site.pageTitle`, a meta description de `en.site.description`, "Skip…" do `en`, o rótulo `aria-label` da navegação do `en`, `href="/en/"` no nome e `lang="pt-BR"` no `<h1>`. **Apague o arquivo** (é novo e não commitado: apagar, não `git checkout`), rebuild, e cole `ls dist/en` mostrando que `sonda` sumiu → verify: saídas coladas.
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; `npm run test:dist` colado (as rotas PT seguem com `lang="pt-BR"`).

## Critérios de aceitação

- [x] Nenhum dos quatro arquivos importa `pt` direto; o idioma vem de `localeFromPath`
- [x] `siteConfig.description` removido; meta description sai de `t.site.description`
- [x] Nome no cabeçalho aponta para `routePath('home', lang)`; filtro do menu por chave
- [x] `PageHeader` com `titleLang`/`metaLang` opcionais, sem atributo quando ausentes
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [x] Canário do passo 4: página sob `/en/` sai com `lang="en"` e textos do `en`; arquivo temporário apagado
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

### Autorização — `tests/i18n/pt.test.ts` entra no escopo

O orquestrador autorizou, em 2026-09-28, incluir `tests/i18n/pt.test.ts` em "Arquivos afetados"
(além dos quatro do plano), limitado ao teste `site.description` e ao import de `siteConfig` que
dependiam do campo removido por este plano. Esse teste nasceu no plano 057 (`82a7947`,
2026-09-28), depois do grep de 2026-09-24 citado no "Contexto necessário" do 058 — por isso não
apareceu naquela conferência. O executor havia parado e reportado o achado antes de qualquer
edição (nenhum `Write`/`Edit`/`git` executado até então); o orquestrador respondeu autorizando a
opção (a): trocar `toBe(siteConfig.description)` pelo literal atual (byte a byte) e renomear o
título do `it`. Nada mais mudou nesse arquivo. `src/i18n/pt.ts:65-67` (comentário que cita "até o
058 remover o campo") foi deixado como está por decisão explícita do orquestrador — está fora do
escopo do plano e é comentário histórico.

### Correções do ciclo 1 de revisão (REPROVADO)

1. **Citação errada.** `src/layouts/BaseLayout.astro:52` e `src/components/SiteHeader.astro:31`
   citavam "sabatina fase 4, Decisão 6" — mas a Decisão 6 da sabatina é "página fina + view que
   recebe `lang`", o **oposto** do que essas linhas fazem. A regra correta é a **decisão 2 do
   fatiamento da fase 4** (README da fase 4, "Decisões tomadas no fatiamento", item 2 — o próprio
   plano já a cita assim na linha 33). Corrigido nas duas linhas, no formato de `pt.ts:65`
   ("decisão N do fatiamento da fase 4"). Grep de conferência logo abaixo.
2. **Rótulo errado no passo 5.** O bloco antes rotulado "diff resultante, só formatação" era, na
   verdade, o `git diff HEAD` inteiro de `PageHeader.astro` — funcional (props `titleLang`/
   `metaLang`, atributos `lang`) mais a formatação do `prettier --write`. Rótulo corrigido abaixo:
   nenhuma frase afirma mais que o diff inteiro é formatação.
3. **Canário desatualizado.** O canário do passo 4 havia sido capturado às 13:51-13:52, antes do
   `prettier --write` das 13:53:09 em `PageHeader.astro`. Refeito inteiro sobre o código final
   (depois das correções 1 e 2): sonda criada, build, trechos capturados, apagada com
   `Remove-Item` (nunca `git checkout` — arquivo novo, não commitado), rebuild, `Test-Path` e
   `git status --short`. Blocos substituídos na seção do passo 4, abaixo.

Grep de citações depois da correção 1:

`grep -rn "Decisão\|decisão" src/layouts/BaseLayout.astro src/components/SiteHeader.astro src/components/PageHeader.astro src/lib/config.ts tests/i18n/pt.test.ts`:

```
src/layouts/BaseLayout.astro:52:// decisão 2 do fatiamento da fase 4: componentes compartilhados derivam o idioma do caminho.
src/components/SiteHeader.astro:31:// decisão 2 do fatiamento da fase 4: componentes compartilhados derivam o idioma do caminho.
tests/i18n/pt.test.ts:84:describe('pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4)', () => {
tests/i18n/pt.test.ts:105:  it('date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4)', () => {
```

As duas ocorrências em `tests/i18n/pt.test.ts` (linhas 84 e 105) são citações pré-existentes do
plano 057, no formato correto, e não foram tocadas por este plano.

### Passo 1 — retrato "antes" (`npm run build:pipeline`; árvore em `1c3d4f9`, sem edição)

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  13:45:31
   Duration  896ms (transform 1.40s, setup 0ms, import 2.30s, tests 62ms, environment 0ms)

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
13:46:02 [content] Syncing content
13:46:02 [content] Synced content
13:46:02 [types] Generated 423ms
13:46:02 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

13:46:09 [content] Syncing content
13:46:09 [content] Synced content
13:46:09 [types] Generated 421ms
13:46:09 [build] output: "static"
13:46:09 [build] mode: "static"
13:46:09 [build] directory: S:\Projetos\academic_page\haroldo\dist\
13:46:09 [build] Collecting build info...
13:46:09 [build] ✓ Completed in 457ms.
13:46:09 [build] Building static entrypoints...
13:46:10 [vite] ✓ built in 347ms
13:46:10 [vite] ✓ built in 79ms
13:46:10 [build] Rearranging server assets...

 generating static routes 
13:46:10   ├─ /404.html (+13ms) 
13:46:10   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
13:46:10   ├─ /ensino/2026-2-relatividade-geral/index.html (+88ms) 
13:46:10   ├─ /ensino/index.html (+5ms) 
13:46:10   ├─ /pesquisa/index.html (+4ms) 
13:46:10   ├─ /publicacoes/index.html (+4ms) 
13:46:10   ├─ /sobre/index.html (+4ms) 
13:46:10   ├─ /index.html (+3ms) 
13:46:10 ✓ Completed in 155ms.

13:46:10 [build] ✓ Completed in 653ms.
13:46:10 [build] 8 page(s) built in 1.13s
13:46:10 [build] Complete!
```

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\d2f7ef8b-a67f-4e64-b966-5b958fd51a91\scratchpad\058\antes.json
```

### Passo 2 — edição dos quatro arquivos (+ `tests/i18n/pt.test.ts` autorizado); `npx astro check`

Saída final, capturada depois da correção 1 (última edição de código deste plano):

```
﻿14:09:56 [content] Syncing content
14:09:56 [content] Synced content
14:09:56 [types] Generated 430ms
14:09:56 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### Passo 3 — comparação (`npm run build:pipeline`; retrato "depois"; `comparar` contra o `antes.json` do passo 1; greps)

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  14:10:13
   Duration  870ms (transform 1.40s, setup 0ms, import 2.27s, tests 58ms, environment 0ms)

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
14:10:45 [content] Syncing content
14:10:45 [content] Synced content
14:10:45 [types] Generated 422ms
14:10:45 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

14:10:53 [content] Syncing content
14:10:53 [content] Synced content
14:10:53 [types] Generated 411ms
14:10:53 [build] output: "static"
14:10:53 [build] mode: "static"
14:10:53 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:10:53 [build] Collecting build info...
14:10:53 [build] ✓ Completed in 446ms.
14:10:53 [build] Building static entrypoints...
14:10:54 [vite] ✓ built in 325ms
14:10:54 [vite] ✓ built in 73ms
14:10:54 [build] Rearranging server assets...

 generating static routes 
14:10:54   ├─ /404.html (+11ms) 
14:10:54   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:10:54   ├─ /ensino/2026-2-relatividade-geral/index.html (+82ms) 
14:10:54   ├─ /ensino/index.html (+4ms) 
14:10:54   ├─ /pesquisa/index.html (+4ms) 
14:10:54   ├─ /publicacoes/index.html (+3ms) 
14:10:54   ├─ /sobre/index.html (+4ms) 
14:10:54   ├─ /index.html (+3ms) 
14:10:54 ✓ Completed in 141ms.

14:10:54 [build] ✓ Completed in 597ms.
14:10:54 [build] 8 page(s) built in 1.05s
14:10:54 [build] Complete!
```

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\d2f7ef8b-a67f-4e64-b966-5b958fd51a91\scratchpad\058\depois.json
```

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
```

`grep -o '<html lang="[^"]*"' dist/index.html dist/sobre/index.html dist/404.html`:

```
dist/index.html:<html lang="pt-BR"
dist/sobre/index.html:<html lang="pt-BR"
dist/404.html:<html lang="pt-BR"
```

`grep -o '<meta name="description" content="[^"]*"' dist/index.html`:

```
<meta name="description" content="Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA."
```

### Passo 4 — canário de idioma pelo caminho (`src/pages/en/sonda.astro`, temporário), refeito sobre o código final

Build com a sonda presente:

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  14:11:30
   Duration  873ms (transform 1.34s, setup 0ms, import 2.22s, tests 57ms, environment 0ms)

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
14:12:03 [content] Syncing content
14:12:03 [content] Synced content
14:12:03 [types] Generated 415ms
14:12:03 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (68 files): 
- 0 errors
- 0 warnings
- 0 hints

14:12:11 [content] Syncing content
14:12:11 [content] Synced content
14:12:11 [types] Generated 414ms
14:12:11 [build] output: "static"
14:12:11 [build] mode: "static"
14:12:11 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:12:11 [build] Collecting build info...
14:12:11 [build] ✓ Completed in 450ms.
14:12:11 [build] Building static entrypoints...
14:12:12 [vite] ✓ built in 326ms
14:12:12 [vite] ✓ built in 76ms
14:12:12 [build] Rearranging server assets...

 generating static routes 
14:12:12   ├─ /404.html (+11ms) 
14:12:12   ├─ /en/sonda/index.html (+3ms) 
14:12:12   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:12:12   ├─ /ensino/2026-2-relatividade-geral/index.html (+83ms) 
14:12:12   ├─ /ensino/index.html (+4ms) 
14:12:12   ├─ /pesquisa/index.html (+4ms) 
14:12:12   ├─ /publicacoes/index.html (+4ms) 
14:12:12   ├─ /sobre/index.html (+4ms) 
14:12:12   ├─ /index.html (+3ms) 
14:12:12 ✓ Completed in 145ms.

14:12:12 [build] ✓ Completed in 616ms.
14:12:12 [build] 9 page(s) built in 1.12s
14:12:12 [build] Complete!
```

Trechos de `dist/en/sonda/index.html`:

```
== html lang ==
<html lang="en"
== title ==
<title>x — Haroldo Lima Junior</title>
== meta description ==
<meta name="description" content="Academic website of Prof. Haroldo Cilas Duarte Lima Junior, Assistant Professor of Physics at the Federal University of Maranhão (UFMA)."
== skip to content ==
focus:z-50 focus:px-4 focus:py-2">Skip to content
== nav aria-label ==
aria-label="Main navigation"
== h1 lang ==
<h1 class="text-display-2 titulo-entrada" lang="pt-BR" data-astro-cid-b2i3gsw2>
```

`href` do nome (âncora `vt-nome`):

```
<a href="/en/" class="vt-nome text-display-2"
```

Arquivo apagado com `Remove-Item` (novo, não commitado — nunca `git checkout`). Rebuild sem a sonda:

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  14:12:37
   Duration  879ms (transform 1.42s, setup 0ms, import 2.28s, tests 61ms, environment 0ms)

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
14:13:09 [content] Syncing content
14:13:09 [content] Synced content
14:13:09 [types] Generated 426ms
14:13:09 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

14:13:18 [content] Syncing content
14:13:18 [content] Synced content
14:13:18 [types] Generated 408ms
14:13:18 [build] output: "static"
14:13:18 [build] mode: "static"
14:13:18 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:13:18 [build] Collecting build info...
14:13:18 [build] ✓ Completed in 444ms.
14:13:18 [build] Building static entrypoints...
14:13:18 [vite] ✓ built in 329ms
14:13:18 [vite] ✓ built in 73ms
14:13:18 [build] Rearranging server assets...

 generating static routes 
14:13:18   ├─ /404.html (+10ms) 
14:13:18   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:13:18   ├─ /ensino/2026-2-relatividade-geral/index.html (+81ms) 
14:13:18   ├─ /ensino/index.html (+5ms) 
14:13:18   ├─ /pesquisa/index.html (+4ms) 
14:13:18   ├─ /publicacoes/index.html (+4ms) 
14:13:18   ├─ /sobre/index.html (+4ms) 
14:13:18   ├─ /index.html (+3ms) 
14:13:18 ✓ Completed in 143ms.

14:13:18 [build] ✓ Completed in 596ms.
14:13:18 [build] 8 page(s) built in 1.09s
14:13:18 [build] Complete!
```

`Test-Path dist\en` e `git status --short`, depois do rebuild sem a sonda:

```
﻿Test-Path dist\en -> False
 M plans/fase-4-internacionalizacao/058-layout-e-cabecalhos-por-idioma.md
 M src/components/PageHeader.astro
 M src/components/SiteHeader.astro
 M src/layouts/BaseLayout.astro
 M src/lib/config.ts
 M tests/i18n/pt.test.ts
```

### Observação 4 — prova de "sem atributo quando ausente" (`PageHeader`, critério de aceitação 4)

Contagem de ` lang="` em cada `.html` do `dist/` final (sem a sonda), com
`grep -o ' lang="[^"]*"' <arq> | sort | uniq -c`. As oito rotas do site (nenhuma passa
`titleLang`/`metaLang`) mostram só o `lang` do `<html>`, uma vez cada — nenhum atributo extra
veio do `PageHeader`. `dist/admin/index.html` é a página estática do painel TinaCMS, gerada pelo
`tinacms build` e fora do escopo deste plano (não usa `BaseLayout`/`PageHeader`) — por isso o
`lang="en"` isolado ali não é evidência de nada deste plano.

```
== dist/404.html ==
      1  lang="pt-BR"
== dist/admin/index.html ==
      1  lang="en"
== dist/ensino/2025-1-mecanica-classica/index.html ==
      1  lang="pt-BR"
== dist/ensino/2026-2-relatividade-geral/index.html ==
      1  lang="pt-BR"
== dist/ensino/index.html ==
      1  lang="pt-BR"
== dist/index.html ==
      1  lang="pt-BR"
== dist/pesquisa/index.html ==
      1  lang="pt-BR"
== dist/publicacoes/index.html ==
      1  lang="pt-BR"
== dist/sobre/index.html ==
      1  lang="pt-BR"
```

Junto com o comparador do passo 3 (8/8 `IGUAL`, que prova que as rotas reais ficaram byte a byte
iguais ao `dist/` de antes da mudança — sem `titleLang`/`metaLang`, elas já não tinham `lang` no
`<h1>`/`<p>` antes deste plano), esta contagem é a prova, no `dist/`, do critério 4.

### Passo 5 — portão de qualidade

`npm run format:check`, rodado antes de gerar os blocos desta seção (verde nesta rodada — a
correção 1 só mexeu em comentários de linha, sem impacto de formatação; a quebra do bloco
`meta &&` de `PageHeader.astro`, aplicada no ciclo anterior de revisão por `prettier --write`,
está refletida no diff abaixo):

```
﻿
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`git diff HEAD -- src/components/PageHeader.astro`, no estado final (depois do `prettier --write`
do ciclo anterior): é a edição **inteira** que este plano fez nesse arquivo — funcional (props
`titleLang`/`metaLang`, atributo `lang` no `<h1>` e no `<p>` de meta, cabeçalho §10.1) **e**
formatação; só a quebra de linha do bloco `meta &&` (para o mesmo padrão já usado pelo bloco
`back &&` do mesmo arquivo) veio do `prettier --write` — o resto do diff é a mudança funcional do
plano:

```
diff --git a/src/components/PageHeader.astro b/src/components/PageHeader.astro
index 79dc8ca..df9694a 100644
--- a/src/components/PageHeader.astro
+++ b/src/components/PageHeader.astro
@@ -11,13 +11,13 @@
  *                 `aside` opcional que compõe a coluna direita a partir de `lg`.
  *  Autor        : Desenvolvedor
  *  Criado em    : 2026-09-17
- *  Atualizado em: 2026-09-24
- *  Versão       : 0.4.0
+ *  Atualizado em: 2026-09-28
+ *  Versão       : 0.5.0
  *
  *  Dependências : src/styles/global.css (classes `regua-entrada`/`titulo-entrada`
  *                 do plano 036, tokens `--color-tinta`/`--color-secundario`)
- *  Entradas     : props `title`, `meta` (opcional), `back` (opcional); slot
- *                 nomeado `aside` (opcional)
+ *  Entradas     : props `title`, `meta` (opcional), `back` (opcional), `titleLang`
+ *                 (opcional), `metaLang` (opcional); slot nomeado `aside` (opcional)
  *  Saídas       : `<div>` com título (+ seta, + meta, + coluna `aside`) e a régua forte
  *  Uso          : import PageHeader from '../components/PageHeader.astro'
  *
@@ -35,9 +35,13 @@ export interface Props {
   meta?: string;
   /** Seta de volta à esquerda do título: destino e nome acessível (ex.: "Voltar para Ensino"). Ausente = nada. */
   back?: { href: string; label: string };
+  /** `lang` do `<h1>`, para o título em fallback (RN-06) nas rotas `/en`. Ausente = sem atributo. */
+  titleLang?: string;
+  /** `lang` da linha de `meta`, para o texto em fallback (RN-06) nas rotas `/en`. Ausente = sem atributo. */
+  metaLang?: string;
 }
 
-const { title, meta, back } = Astro.props;
+const { title, meta, back, titleLang, metaLang } = Astro.props;
 // Sem slot `aside`, o título ocupa a largura inteira — sem grade nem coluna vazia.
 const hasAside = Astro.slots.has('aside');
 ---
@@ -69,9 +73,15 @@ const hasAside = Astro.slots.has('aside');
             </a>
           )
         }
-        <h1 class="text-display-2 titulo-entrada">{title}</h1>
+        <h1 class="text-display-2 titulo-entrada" lang={titleLang}>{title}</h1>
       </div>
-      {meta && <p class="text-pequeno text-secundario mt-2">{meta}</p>}
+      {
+        meta && (
+          <p class="text-pequeno text-secundario mt-2" lang={metaLang}>
+            {meta}
+          </p>
+        )
+      }
     </div>
     {
       hasAside && (
```

`npm run lint`:

```
﻿
> haroldo-page@0.1.0 lint
> eslint .

```

`npm run test:coverage`:

```
﻿
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  19 passed (19)
      Tests  320 passed (320)
   Start at  14:14:04
   Duration  1.32s (transform 3.85s, setup 0ms, import 7.05s, tests 261ms, environment 2ms)

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
```

`npm run test:dist` (sobre o `dist/` do build final, sem a sonda):

```
﻿
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  14:14:18
   Duration  289ms (transform 53ms, setup 0ms, import 108ms, tests 58ms, environment 0ms)

```

### O que não rodei

Não rodei nada além dos comandos dos passos 1-5 do plano e das correções pedidas pela revisão do
ciclo 1. Não commitei (`Status` permanece `TODO`). Não rodei `npm audit`, `npm ci`, CI do GitHub
Actions nem Workers Builds — são verificações do `triage-runner`/orquestrador, não deste plano. Não
abri o navegador — este plano não tem passo de verificação visual (não está marcado "orquestrador
(navegador)" na tabela de estado da fase 4).
