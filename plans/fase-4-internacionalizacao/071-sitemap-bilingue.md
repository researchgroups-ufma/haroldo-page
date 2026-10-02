# Plano 071 — Sitemap bilíngue com `@astrojs/sitemap` (RF-30, Decisão 10)

**Status:** DONE
**RFs cobertos:** **RF-30** (sitemap bilíngue, nenhum rascunho), RF-10, RN-01; §7.2 (dependência nova); sabatina fase 4, Decisões 10 e 14; §12 fase 4, item 7 (fecha, com o 070)
**Depende de:** plano 070 (`alternateLinks`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera `sitemap-index.xml` e o sitemap com **todas** as rotas públicas dos dois idiomas, cada uma
com os pares `alternate`, **sem** as duas 404, **sem** rascunho e sem o `/admin`. A dependência nova
está fixada em versão exata e o `npm audit` do CI segue verde. O `robots.txt` **não muda**.

## Arquivos afetados

- `package.json`, `package-lock.json` — `@astrojs/sitemap` em versão exata
- `astro.config.mjs` — a integração
- `tests/dist/site-gerado.test.ts` — asserções sobre o sitemap

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`public/robots.txt` e `public/_headers` não mudam** (Decisão 10: o robots continua
> `Disallow` até a Q-05, fase 5).

## Contexto necessário

**Decisão 10** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): `@astrojs/sitemap`, com a opção
`i18n` (`pt-BR` na raiz, `en` em `/en`) para os pares `alternate`, e filtro que tira as duas 404. O
`robots.txt` continua `Disallow` até a Q-05; só então aponta o `sitemap-index.xml` (o comentário atual
de `public/robots.txt:6` já prevê). Rascunho não gera página, então fica fora sem lógica extra (RN-01,
RF-10). Custo aceito: dependência sujeita ao `npm audit` do CI (plano 032, ADR-0010: reprova em
`high`/`critical`).

**Versão:** escolha a versão mais recente de `@astrojs/sitemap` cujo `peerDependencies` aceite
`astro@7.2.10` (`package.json` fixa versões exatas, sem `^`): cole `npm view @astrojs/sitemap version
peerDependencies` e instale com `npm install --save-exact @astrojs/sitemap@<versão>`. Confira o churn
do lockfile (`git diff --stat package-lock.json`): pacotes além da integração e das dependências dela
são sinal de alerta (lição da fase 0) — reporte antes de seguir.

**`astro.config.mjs`** (51 linhas; `site` já definido, linha 46 — a integração exige). Filtro das
duas 404: pelo `pathname` de `new URL(page)`, casando `/404/` e `/en/404/` com ou sem barra.

**Decisão 14 — os pares com segmentos traduzidos** (Q-F4-2, respondida em 2026-09-24). Espera-se (não verificado no fatiamento) que a opção
`i18n` pareie URLs pelo caminho **sem** o prefixo de idioma, o que só casaria `/` com `/en/`. Por isso
o plano **mede antes de escolher**:
- **Ramo A** (a Decisão 10 ao pé da letra): configure `i18n: { defaultLocale: 'pt', locales: { pt:
  'pt-BR', en: 'en' } }`, gere o sitemap e confira os `xhtml:link` de `/sobre/` e
  `/ensino/2026-2-relatividade-geral/`. Se eles pareiam com `/en/about/` e
  `/en/teaching/2026-2-relatividade-geral/`, fique no ramo A.
- **Ramo B**, se não parearem: tire a opção `i18n` e preencha `item.links` na opção `serialize` da
  mesma integração a partir de `alternateLinks(new URL(item.url).pathname)` (070), com a origem do
  próprio `item.url`, no formato `{ url, lang }` que a integração espera (cole o tipo de
  `node_modules/@astrojs/sitemap` que define `links`). **Autorizado pela Decisão 14 sem nova
  consulta; não reabre a Decisão 10** (mesma integração, mesmo filtro, mesmas páginas).
  Registre na Evidência o sitemap do ramo A que motivou a troca.

**`astro.config.mjs` importando TypeScript:** o ramo B importa `./src/lib/routes.ts`. `routes.ts` só
tem `import type` (056, 070). Se o carregamento da configuração recusar o import `.ts`, pare e reporte
— não duplique o mapa de rotas no `.mjs`.

**Testes de `dist`** (o sitemap sai em `dist/`, então as asserções vão para `tests/dist/`): o conjunto
de `<loc>` é **igual** ao conjunto de rotas `.html` de `dist/` fora de `admin/` e das duas 404
(convertidas para URL absoluta com barra final); nenhum `<loc>` com `/404` nem `/admin`; nenhuma
disciplina rascunho (invariante, como o teste "rascunho não gera página"); todo `<loc>` com os
alternates `pt-BR` e `en` recíprocos, iguais aos `<link rel="alternate">` do `<head>` da mesma página
(070). Sem contagem exata de conteúdo (README da fase 3, decisão 6).

**Regras de código:** README da fase 4. Comentário no `astro.config.mjs` com **RF-30** e o motivo do
filtro; atualize o cabeçalho §10.1 (Dependências, Notas).

## Passos

1. Versão e instalação → verify: `npm view …` colado; `git diff package.json` e `git diff --stat package-lock.json` colados.
2. Ramo A → verify: `npm run build:pipeline` colado; `ls dist/sitemap*` e o trecho do sitemap com os `xhtml:link` de `/sobre/` e da disciplina colados; decisão de ramo registrada.
3. (Se ramo B) `serialize` com `alternateLinks` → verify: build e o mesmo trecho colados, agora com os pares traduzidos.
4. Testes de `dist` → verify: `npm run test:dist` colado.
5. Canário: tire temporariamente o filtro das 404 → o teste reprova com `/404/` no sitemap; desfaça → verify: saídas coladas.
6. `npm audit --audit-level=high` → verify: saída e `$LASTEXITCODE` (0) colados.
7. Portão → verify: `npm ci` (sem reescrever o lock), `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; `git diff --stat -- public/` vazio.

## Critérios de aceitação

- [x] `@astrojs/sitemap` em versão exata, `peerDependencies` compatível colado, churn do lock conferido
- [x] Sitemap com exatamente as rotas públicas dos dois idiomas; sem 404, sem `/admin`, sem rascunho (teste)
- [x] Todo `<loc>` com os pares `pt-BR`/`en` recíprocos e iguais aos do `<head>`; ramo (A ou B) registrado com a evidência que o decidiu
- [x] Canário do passo 5 vermelho
- [x] `npm audit --audit-level=high` exit 0
- [x] `robots.txt` e `_headers` intocados
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

Executor: implementer. Todos os blocos são saída literal dos `.txt` capturados na execução de 2026-10-02; `Status:` fica `TODO`, sem commit.

### Passo 1 — versão e instalação

`npm view @astrojs/sitemap version peerDependencies dependencies` (sem `peerDependencies` declarado; a compatibilidade com `astro@7.2.10` se prova pelo build e pelo sitemap gerado, abaixo):

```
version = '3.7.4'
dependencies = { zod: '^4.3.6', sitemap: '^9.0.0' }
EXIT=0
```

`npm install --save-exact @astrojs/sitemap@3.7.4`:

```

added 3 packages, and audited 1520 packages in 6s

328 packages are looking for funding
  run `npm fund` for details

9 vulnerabilities (1 low, 8 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
```

`git diff package.json` e `git diff --stat package-lock.json`:

```
diff --git a/package.json b/package.json
index 68c3e3e..9029b66 100644
--- a/package.json
+++ b/package.json
@@ -21,6 +21,7 @@
     "deploy": "vitest run tests/content && npm run build && wrangler deploy"
   },
   "dependencies": {
+    "@astrojs/sitemap": "3.7.4",
     "@fontsource/archivo": "5.3.0",
     "@tailwindcss/vite": "4.3.3",
     "@tinacms/astro": "0.6.1",
 package-lock.json | 42 +++++++++++++++++++++++++++++++++++++++---
 1 file changed, 39 insertions(+), 3 deletions(-)
```

Pacotes que entraram no lock (`git diff -U0 package-lock.json`, com 5 linhas de contexto: a linha da chave de cada pacote aparece junto do marcador que mudou): `@astrojs/sitemap`, `sitemap`, `@types/sax` entram; `@types/node`, `arg` e `undici-types` perdem o marcador `dev`/`devOptional` porque `sitemap` os puxa como dependência de produção. Nenhuma mudança em `astro`, `tinacms` ou `@tinacms/*`; `zod` não ganhou cópia nova:

```

+    "node_modules/@astrojs/sitemap": {
     "node_modules/@astrojs/telemetry": {
     "node_modules/@types/node": {
-      "devOptional": true,
+    "node_modules/@types/sax": {
     "node_modules/@types/tern": {
       "dev": true,
     "node_modules/arg": {
-      "dev": true,
     "node_modules/argparse": {
+    "node_modules/sitemap": {
     "node_modules/slash": {
       "dev": true,
     "node_modules/undici-types": {
-      "devOptional": true,
     "node_modules/unenv": {
```

### Passo 2 — ramo A (opção `i18n`) e a decisão de ramo

Build do ramo A: `sitemap({ filter, i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en' } } })`:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:45:47
   Duration  1.23s (transform 2.01s, setup 0ms, import 3.21s, tests 79ms, environment 0ms)

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
12:46:16 [vite] Re-optimizing dependencies because lockfile has changed
12:46:17 [content] Syncing content
12:46:17 [content] Synced content
12:46:17 [types] Generated 623ms
12:46:17 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (93 files): 
- 0 errors
- 0 warnings
- 0 hints

12:46:25 [content] Syncing content
12:46:26 [content] Synced content
12:46:26 [types] Generated 508ms
12:46:26 [build] output: "static"
12:46:26 [build] mode: "static"
12:46:26 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:46:26 [build] Collecting build info...
12:46:26 [build] ✓ Completed in 552ms.
12:46:26 [build] Building static entrypoints...
12:46:26 [vite] ✓ built in 402ms
12:46:26 [vite] ✓ built in 97ms
12:46:26 [build] Rearranging server assets...

 generating static routes 
12:46:26   ├─ /404.html (+15ms) 
12:46:26   ├─ /en/404/index.html (+5ms) 
12:46:26   ├─ /en/about/index.html (+8ms) 
12:46:26   ├─ /en/publications/index.html (+7ms) 
12:46:26   ├─ /en/research/index.html (+6ms) 
12:46:26   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+4ms) 
12:46:26   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+94ms) 
12:46:26   ├─ /en/teaching/index.html (+10ms) 
12:46:26   ├─ /en/index.html (+6ms) 
12:46:26   ├─ /ensino/2025-1-mecanica-classica/index.html (+24ms) 
12:46:26   ├─ /ensino/2026-2-relatividade-geral/index.html (+15ms) 
12:46:26   ├─ /ensino/index.html (+4ms) 
12:46:26   ├─ /pesquisa/index.html (+3ms) 
12:46:26   ├─ /publicacoes/index.html (+4ms) 
12:46:26   ├─ /sobre/index.html (+4ms) 
12:46:26   ├─ /index.html (+3ms) 
12:46:26 ✓ Completed in 251ms.

12:46:26 [build] ✓ Completed in 811ms.
12:46:26 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
12:46:26 [build] 16 page(s) built in 1.40s
12:46:26 [build] Complete!
EXIT=0
```

Sitemap do ramo A: só `/` e `/en/` formam par; `/sobre/`, `/en/about/` e as disciplinas saem sem `xhtml:link`. **Decisão: ramo B** (Decisão 14):

```
$ ls dist/sitemap*
dist/sitemap-0.xml
dist/sitemap-index.xml

$ sed s/<url>/\n<url>/g dist/sitemap-0.xml (trecho /sobre/ e /ensino/2026-2-relatividade-geral/ + home)
<url><loc>https://haroldo-page.and-near.workers.dev/</loc><xhtml:link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/"/><xhtml:link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/"/></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/</loc><xhtml:link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/"/><xhtml:link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/"/></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/about/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/publications/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/research/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/teaching/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/teaching/2025-1-mecanica-classica/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/en/teaching/2026-2-relatividade-geral/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/ensino/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/ensino/2025-1-mecanica-classica/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/ensino/2026-2-relatividade-geral/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/pesquisa/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/publicacoes/</loc></url>
<url><loc>https://haroldo-page.and-near.workers.dev/sobre/</loc></url></urlset>
```

`test:dist` contra o `dist/` do ramo A: o teste dos alternates reprova:

```

 ❯ tests/dist/site-gerado.test.ts (44 tests | 1 failed) 183ms
     × todo <loc> traz os alternates pt-BR, en e x-default, iguais aos do <head> da mesma página 7ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > todo <loc> traz os alternates pt-BR, en e 
x-default, iguais aos do <head> da mesma página
AssertionError: /: alternates do sitemap × do <head>: expected [ { hreflang: 'pt-BR', …(1) }, …(1) ] to deeply equal [ 
{ hreflang: 'pt-BR', …(1) }, …(2) ]
 ❯ tests/dist/site-gerado.test.ts:622:68
    622|       expect(links, `${route}: alternates do sitemap × do <head>`).toE…
 Test Files  1 failed (1)
      Tests  1 failed | 43 passed (44)
   Duration  511ms (transform 104ms, setup 0ms, import 190ms, tests 183ms, environment 0ms)
EXIT=1
```

### Passo 3 — ramo B (`serialize` com `alternateLinks`), estado final

`npm run build:pipeline` final (o `astro.config.mjs` importa `./src/lib/routes.ts` sem recusa do carregamento; `astro check` 0/0/0) e a listagem dos sitemaps:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:51:03
   Duration  1.24s (transform 1.98s, setup 0ms, import 3.25s, tests 83ms, environment 0ms)

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
12:52:17 [vite] [optimizer] bundling dependencies...
12:52:18 [content] Syncing content
12:52:18 [content] Synced content
12:52:18 [types] Generated 1.72s
12:52:18 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (93 files): 
- 0 errors
- 0 warnings
- 0 hints

12:52:27 [content] Syncing content
12:52:27 [content] Synced content
12:52:27 [types] Generated 509ms
12:52:27 [build] output: "static"
12:52:27 [build] mode: "static"
12:52:27 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:52:27 [build] Collecting build info...
12:52:27 [build] ✓ Completed in 553ms.
12:52:27 [build] Building static entrypoints...
12:52:28 [vite] ✓ built in 487ms
12:52:28 [vite] ✓ built in 158ms
12:52:28 [build] Rearranging server assets...

 generating static routes 
12:52:28   ├─ /404.html (+14ms) 
12:52:28   ├─ /en/404/index.html (+5ms) 
12:52:28   ├─ /en/about/index.html (+9ms) 
12:52:28   ├─ /en/publications/index.html (+6ms) 
12:52:28   ├─ /en/research/index.html (+6ms) 
12:52:28   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
12:52:28   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+91ms) 
12:52:28   ├─ /en/teaching/index.html (+9ms) 
12:52:28   ├─ /en/index.html (+5ms) 
12:52:28   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
12:52:28   ├─ /ensino/2026-2-relatividade-geral/index.html (+14ms) 
12:52:28   ├─ /ensino/index.html (+4ms) 
12:52:28   ├─ /pesquisa/index.html (+4ms) 
12:52:28   ├─ /publicacoes/index.html (+4ms) 
12:52:28   ├─ /sobre/index.html (+3ms) 
12:52:28   ├─ /index.html (+3ms) 
12:52:28 ✓ Completed in 223ms.

12:52:28 [build] ✓ Completed in 960ms.
12:52:28 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
12:52:28 [build] 16 page(s) built in 1.56s
12:52:28 [build] Complete!
EXIT=0

FullName                                                 Length LastWriteTime      
--------                                                 ------ -------------      
S:\Projetos\academic_page\haroldo\dist\sitemap-0.xml       6152 02/10/2026 12:52:28
S:\Projetos\academic_page\haroldo\dist\sitemap-index.xml    204 02/10/2026 12:52:28
```

Trecho do sitemap de `/sobre/` e da disciplina, com os pares traduzidos:

```
$ trechos de dist/sitemap-0.xml
<url><loc>https://haroldo-page.and-near.workers.dev/ensino/2026-2-relatividade-geral/</loc><xhtml:link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/ensino/2026-2-relatividade-geral/"/><xhtml:link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/teaching/2026-2-relatividade-geral/"/><xhtml:link rel="alternate" hreflang="x-default" href="https://haroldo-page.and-near.workers.dev/ensino/2026-2-relatividade-geral/"/></url>
<url><loc>https://haroldo-page.and-near.workers.dev/sobre/</loc><xhtml:link rel="alternate" hreflang="pt-BR" href="https://haroldo-page.and-near.workers.dev/sobre/"/><xhtml:link rel="alternate" hreflang="en" href="https://haroldo-page.and-near.workers.dev/en/about/"/><xhtml:link rel="alternate" hreflang="x-default" href="https://haroldo-page.and-near.workers.dev/sobre/"/></url></urlset>
```

`git diff -- astro.config.mjs`:

```
diff --git a/astro.config.mjs b/astro.config.mjs
index aa81cad..107c2e1 100644
--- a/astro.config.mjs
+++ b/astro.config.mjs
@@ -3,8 +3,10 @@ import { defineConfig } from 'astro/config';
 import { loadEnv } from 'vite';
 import tailwindcss from '@tailwindcss/vite';
 import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
+import sitemap from '@astrojs/sitemap';
 import { existsSync, renameSync, rmdirSync } from 'node:fs';
-import { fileURLToPath } from 'node:url';
+import { URL, fileURLToPath } from 'node:url';
+import { alternateLinks } from './src/lib/routes.ts';
 
 // astro.config.mjs roda em Node antes de o Astro/Vite aplicar `.env` ao
 // processo — `process.env.PUBLIC_SITE_URL` ficaria sempre `undefined` quando
@@ -37,6 +39,30 @@ const english404FileName = {
   },
 };
 
+// RF-30 (sabatina fase 4, Decisão 10): o sitemap lista toda rota pública dos dois idiomas, sem as
+// duas 404. A 404 é servida em qualquer caminho inexistente e não é página indexável; o filtro
+// casa o `pathname` que a integração vê (`/404/` e `/en/404/`, com ou sem barra final).
+// Rascunho (RN-01) não gera página, então fica fora sem lógica extra.
+/** @param {string} page URL absoluta de uma página gerada. */
+function isIndexablePage(page) {
+  return !/^\/(en\/)?404\/?$/.test(new URL(page).pathname);
+}
+
+// RF-30, RN-09 e sabatina fase 4, Decisão 14: a opção `i18n` da integração pareia URLs pelo
+// caminho sem o prefixo de idioma e só casa `/` com `/en/` (medido no plano 071); com os
+// segmentos traduzidos (`/sobre/` ↔ `/en/about/`) os pares saem do mapa de rotas de
+// `src/lib/routes.ts`, a mesma fonte do `<head>`. Os três pares são os do `<head>` (pt-BR, en e
+// `x-default`), com a origem da própria URL do item.
+/** @param {import('@astrojs/sitemap').SitemapItem} item */
+function withAlternateLinks(item) {
+  const { origin, pathname } = new URL(item.url);
+  item.links = alternateLinks(pathname).map(({ hreflang, path }) => ({
+    lang: hreflang,
+    url: `${origin}${path}`,
+  }));
+  return item;
+}
+
 /**
  * ============================================================================
  *  Arquivo      : astro.config.mjs
@@ -44,15 +70,16 @@ const english404FileName = {
  *  Descrição    : Configuração do Astro em modo estático (D-01), sem adapter
  *                 e sem SSR, com o plugin Vite do Tailwind 4 (RNF-02, RNF-12)
  *                 e o plugin de dev do TinaCMS que resolve `/admin` sem sufixo
- *                 durante `astro dev`, mais a integração inline que grava a
- *                 404 em inglês como `dist/en/404.html` (RF-27, plano 068).
+ *                 durante `astro dev`, a integração inline que grava a
+ *                 404 em inglês como `dist/en/404.html` (RF-27, plano 068) e o
+ *                 sitemap bilíngue (RF-30, plano 071).
  *  Autor        : Desenvolvedor
  *  Criado em    : 2026-09-01
  *  Atualizado em: 2026-10-02
- *  Versão       : 0.3.0
+ *  Versão       : 0.4.0
  *
  *  Dependências : astro, @tailwindcss/vite, @tinacms/astro (tinaAdminDevRedirect), vite (loadEnv),
- *                 node:fs, node:url
+ *                 @astrojs/sitemap, src/lib/routes.ts (`alternateLinks`), node:fs, node:url
  *  Entradas     : variável de ambiente PUBLIC_SITE_URL (opcional), lida via
  *                 `loadEnv` do `.env`/ambiente real — ver nota acima
  *  Saídas       : configuração consumida pelo CLI do Astro (`astro build`/`astro dev`)
@@ -63,13 +90,21 @@ const english404FileName = {
  *                 aqui — o site é 100% estático (D-01). `tinaAdminDevRedirect`
  *                 só age em dev (`apply: 'serve'`); o build de produção serve
  *                 `public/admin/index.html` diretamente — sem SSR, sem visual
- *                 editing (D-02).
+ *                 editing (D-02). `src/lib/routes.ts` só pode ter `import type`
+ *                 (puxar valor de `config.ts` leria `import.meta.env` aqui). O
+ *                 `robots.txt` não muda: segue `Disallow` até a Q-05 (Decisão 10).
  * ============================================================================
  */
 export default defineConfig({
   output: 'static',
   site: PUBLIC_SITE_URL ?? 'https://haroldo-page.and-near.workers.dev',
-  integrations: [english404FileName],
+  integrations: [
+    english404FileName,
+    sitemap({
+      filter: isIndexablePage,
+      serialize: withAlternateLinks,
+    }),
+  ],
   vite: {
     plugins: [tailwindcss(), tinaAdminDevRedirect()],
   },
```

### Passo 4 — testes de `dist`

`npm run test:dist` sobre o `dist/` final (inclui o teste de invariante "todo `<loc>` de disciplina tem o slug de uma disciplina publicada"; o conjunto esperado de `<loc>` vem das rotas `.html` de `dist/` e da origem de `siteConfig.siteUrl`, não do sitemap):

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  44 passed (44)
   Start at  13:02:45
   Duration  557ms (transform 103ms, setup 0ms, import 189ms, tests 217ms, environment 0ms)

EXIT=0
```

### Passo 5 — canário do filtro das 404

Filtro trocado por `return true` (desfeito editando de volta), `build:pipeline` e `test:dist`: `/en/404/` aparece no sitemap e 4 asserções reprovam; a última linha é a contagem de ocorrências de `404` em `dist/sitemap-0.xml`. Os blocos do `dist/` acima foram recapturados depois do desfazer:

```
12:49:06 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
12:49:06 [build] 16 page(s) built in 1.43s
12:49:06 [build] Complete!
EXIT=0

 ❯ tests/dist/site-gerado.test.ts (44 tests | 4 failed) 194ms
     × o conjunto de <loc> é exatamente o das rotas .html de dist/ (fora de admin/ e das 404) 7ms
     × nenhum <loc> com /404 nem /admin, e nenhum duplicado 1ms
     × todo <loc> traz os alternates pt-BR, en e x-default, iguais aos do <head> da mesma página 2ms
     × os pares são recíprocos: o par aponta para um <loc> que aponta de volta 2ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > o conjunto de <loc> é exatamente o das rotas 
.html de dist/ (fora de admin/ e das 404)
AssertionError: expected [ …(15) ] to deeply equal [ …(14) ]
+   "https://haroldo-page.and-near.workers.dev/en/404/",
 ❯ tests/dist/site-gerado.test.ts:592:46
 FAIL  tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > nenhum <loc> com /404 nem /admin, e nenhum 
duplicado
AssertionError: https://haroldo-page.and-near.workers.dev/en/404/: expected 'https://haroldo-page.and-near.workers…' 
not to match /\/404|\/admin/404|\
/\/404|\/admin/
"https://haroldo-page.and-near.workers.dev/en/404/"
 ❯ tests/dist/site-gerado.test.ts:598:28
    598|       expect(loc, loc).not.toMatch(/\/404|\/admin/);
 FAIL  tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > todo <loc> traz os alternates pt-BR, en e 
x-default, iguais aos do <head> da mesma página
Error: ENOENT: no such file or directory, open 'S:\Projetos\academic_page\haroldo\dist\en\404\index.html'
 ❯ tests/dist/site-gerado.test.ts:620:31
    622|       expect(links, `${route}: alternates do sitemap × do <head>`).toE…
 FAIL  tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > os pares são recíprocos: o par aponta para 
um <loc> que aponta de volta
AssertionError: https://haroldo-page.and-near.workers.dev/ não aponta de volta: expected [ { hreflang: 'pt-BR', …(1) 
}, …(2) ] to deeply equal [ { hreflang: 'pt-BR', …(1) }, …(2) ]
-     "href": "https://haroldo-page.and-near.workers.dev/en/404/",
 ❯ tests/dist/site-gerado.test.ts:631:74
 Test Files  1 failed (1)
      Tests  4 failed | 40 passed (44)
   Duration  535ms (transform 108ms, setup 0ms, import 195ms, tests 194ms, environment 0ms)
EXIT=1
2
```

Canário do teste de invariante das disciplinas: o slug `2026-2-relatividade-geral` retirado do conjunto de publicadas no próprio teste (desfeito editando de volta; `content/` intocado), `test:dist` vermelho nomeando o `<loc>`:

```

 ❯ tests/dist/site-gerado.test.ts (44 tests | 1 failed) 202ms
     × todo <loc> de disciplina tem o slug de uma disciplina publicada (nenhum rascunho) 6ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > todo <loc> de disciplina tem o slug de uma 
disciplina publicada (nenhum rascunho)
AssertionError: https://haroldo-page.and-near.workers.dev/en/teaching/2026-2-relatividade-geral/: slug fora das 
disciplinas publicadas: expected false to be true // Object.is equality
 Test Files  1 failed (1)
      Tests  1 failed | 43 passed (44)
   Duration  546ms (transform 112ms, setup 0ms, import 199ms, tests 202ms, environment 0ms)
EXIT=1
```

### Passo 6 — `npm audit --audit-level=high`

exit 0 (as 9 vulnerabilidades `low`/`moderate` já existiam antes da instalação: o `npm install` imprimiu 9 e o `audit` também):

```
# npm audit report

dompurify  3.4.13 - 3.4.15
DOMPurify: IN_PLACE: node-removing afterSanitize hook leaves detached subtree event handlers armed, causing DOM XSS - https://github.com/advisories/GHSA-p98j-92pf-mc4p
fix available via `npm audit fix`
node_modules/dompurify

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

9 vulnerabilities (1 low, 8 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
EXIT=0
```

### Passo 7 — portão

`npm ci` seguido de `git diff --stat package-lock.json` e do hash SHA-256 do lock antes e depois (iguais: o `npm ci` não reescreveu o lock):

```

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
 package-lock.json | 42 +++++++++++++++++++++++++++++++++++++++---
 1 file changed, 39 insertions(+), 3 deletions(-)
84C83D0E821F99694713D1E1B9E079D0EA8D3B6133AFBEC16AC96EC58363DF0B
84C83D0E821F99694713D1E1B9E079D0EA8D3B6133AFBEC16AC96EC58363DF0B
```

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

`npm run format:check`:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

`npm run test:coverage`:

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  365 passed (365)
   Start at  13:02:52
   Duration  1.95s (transform 6.27s, setup 0ms, import 10.96s, tests 373ms, environment 3ms)

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

`git status --short` e `git diff --stat -- public/` (vazio entre `--- public:` e `--- end`):

```
 M astro.config.mjs
 M package-lock.json
 M package.json
 M tests/dist/site-gerado.test.ts
--- public:
--- end
 package-lock.json | 42 +++++++++++++++++++++++++++++++++++++++---
 1 file changed, 39 insertions(+), 3 deletions(-)
```

### Ramo escolhido

**Ramo B.** A opção `i18n` (ramo A) pareou só `/` com `/en/`; `/sobre/`, `/en/about/` e as duas disciplinas ficaram sem `xhtml:link` (bloco do passo 2). O `serialize` preenche `item.links` com `alternateLinks(pathname)` do plano 070, no formato `{ lang, url }` de `LinkItem` (`node_modules/sitemap/dist/esm/lib/types.d.ts:275`: `lang`, `hreflang?`, `url`; o `sitemap` grava `link.lang || link.hreflang`). Os três pares incluem `x-default`, para ficarem iguais ao `<head>` (070). Ordem das integrações: `english404FileName` antes de `sitemap`; a ordem não importa, porque o sitemap lê a lista de páginas que o Astro entrega ao `astro:build:done` e não o `dist/`. O Astro/sitemap descarta `/404` sozinho, mas `/en/404/` vazou sem o filtro (canário do passo 5), então o filtro é necessário.

### O que NÃO rodou

- Passo de navegador: não há neste plano.
- `npm audit fix`: nunca rodou.
- CI do GitHub Actions e Workers Builds: sem commit nem push, ficam para o orquestrador.
- `node scripts/verificar-promocao.mjs 071`: do orquestrador.
- `triage-runner` e `code-reviewer`: do orquestrador.
- `robots.txt` e `_headers`: intocados (`git diff --stat -- public/` vazio).

### Verificações finais

- Fidelidade dos 19 blocos acima contra os `.txt` capturados (BOM removido na leitura): `OK` nos 19, saída do verificador em `verif.txt` do scratchpad.
- `grep -o $'\xEF\xBB\xBF' <plano> | wc -l` → `0`; o mesmo `0` em `astro.config.mjs`, `tests/dist/site-gerado.test.ts` e `package.json`. `file` dos três: UTF-8 sem BOM.
- `grep -c 'Ã\|â€\|Â'` → `0` nos três arquivos de código; no plano casa só o título "O que NÃO rodou" (maiúscula legítima, não mojibake).
- Desvio: `astro.config.mjs` importa `URL` de `node:url` porque o `eslint` (`no-undef`) reprovou o global `URL` no `.mjs` (primeira rodada do lint, `EXIT=1`; o bloco do lint acima é a segunda). O `status.txt` foi capturado antes desta seção, por isso não lista este plano como modificado.
- Dívida para o 072 (herdada do 070): `routeOf` do teste de `dist` agora existe em três `describe` (seletor, canonical, sitemap); subir para o escopo do módulo.


- Correção da revisão: `test:dist`, `lint`, `format:check` e `test:coverage` recapturados acima; sem rebuild, porque o teste lê o `dist/` atual e nenhum código de build mudou depois do último `build:pipeline`.

### Suíte autoritativa (orquestrador)

A verificação oficial é a segunda rodada do `triage-runner`: lint, format, coverage (365 testes, 100%), `build:pipeline` (`astro check` 0/0/0, 16 páginas, `sitemap-index.xml` e `sitemap-0.xml`), `test:dist` (44 testes) e `audit`, todos `EXIT=0`. As capturas estão em `scratchpad/071/triage2/`. A revisão reprovou o ciclo 1 por dois motivos: o critério 1 foi reescrito, e o teste de rascunho não fazia nenhuma asserção. Os dois foram corrigidos no ciclo 2.
