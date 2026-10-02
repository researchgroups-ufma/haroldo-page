# Plano 068 — 404 em inglês e a prova do Worker (RF-27, Decisão 9)

**Status:** TODO
**RFs cobertos:** **RF-27**, RNF-03, D-01; sabatina fase 4, Decisões 6 e 9; §12 fase 4, item 5 (fecha, com 065–067)
**Depende de:** planos 065 (árvore `/en`, testes de `dist` por idioma), 062 (`NotFoundView`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código e prova local) + **orquestrador** (prova em produção, depois do push)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera `dist/en/404.html`, a 404 em inglês, e fica **provado por artefato** — no `wrangler dev`
e em produção — que `/en/<inexistente>` responde `404` com esse corpo e que `/<inexistente>` continua
respondendo `404` com o `dist/404.html`. Se a prova refutar a premissa, o plano **para** e devolve a
questão ao stakeholder.

## Arquivos afetados

- `src/pages/en/404.astro` — novo (página fina: `<NotFoundView lang="en" />`)
- `astro.config.mjs` — **só se** o passo 2 mostrar `dist/en/404/index.html` (tática pré-autorizada, abaixo)
- `tests/dist/site-gerado.test.ts` — `dist/en/404.html` nas rotas fixas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Não** altere `wrangler.toml` — o que se prova é a configuração existente. **Não** rode
> `npm run deploy` nem `wrangler deploy` (publicaria o disco local em produção).

## Contexto necessário

**Decisão 9** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): "gerar `dist/en/404.html`… O modo
`404-page` serve o `404.html` mais próximo na árvore de pastas, então `/en/<inexistente>` deve receber
a 404 em inglês sem código no Worker. **Isso é premissa, não fato verificado:** o plano tem de provar
por artefato, no `wrangler dev` e em produção, que `/en/<inexistente>` responde `404` com corpo igual
ao `dist/en/404.html` e que `/<inexistente>` continua com o `dist/404.html`, como o plano 051 fez. Se
a prova refutar a premissa, o plano cai numa 404 bilíngue única e volta ao stakeholder para emendar o
RF-27."

**Ramo de saída, explícito:** se o `wrangler dev` **ou** a produção servirem para `/en/<inexistente>`
qualquer coisa que não seja `404` com o corpo de `dist/en/404.html` (ex.: o `dist/404.html` em
português, ou corpo vazio), **pare**, registre a saída na Evidência e devolva ao orquestrador. **Não**
implemente 404 bilíngue, lógica no Worker nem redirecionamento — isso é emenda do RF-27, decisão do
stakeholder.

**Configuração atual** (`wrangler.toml:13-18`): `[assets] directory = "./dist"`,
`not_found_handling = "404-page"`. Não declara `html_handling` (default `auto-trailing-slash`).

**Nome do arquivo gerado — confira antes de tudo.** `src/pages/404.astro` sai como `dist/404.html`
porque o Astro trata `/404` como página de status. É provável que `/en/404` **não** tenha esse
tratamento e saia como `dist/en/404/index.html` — confirme no build e leia o trecho do Astro que decide
o nome (procure `404` em `node_modules/astro/dist/core/util.js` ou `…/build/…`; cole o trecho). Se sair
`dist/en/404/index.html`, a **tática pré-autorizada** (decisão de fatiamento 14 do README da fase) é
uma integração inline em `astro.config.mjs` com o gancho `astro:build:done` que move
`<dist>/en/404/index.html` para `<dist>/en/404.html` e remove a pasta vazia — build estático, sem
código no Worker (D-01). Comentário com o porquê, e o cabeçalho §10.1 do `astro.config.mjs`
atualizado. Qualquer outra saída (mudar `build.format`, `trailingSlash`) **não** está autorizada: pare
e reporte.

**Caminho sem par:** `counterpartPath('/en/404')` → `'/'` (056); a 404 EN não tem `canonical` nem
`hreflang` (decisão de fatiamento 9; o 070 implementa). A lista "All pages" vem de `navItems('en')`
(062), "Home" primeiro. Nenhum `<script>` no `<main>` (051). Nenhum aviso: a 404 não exibe conteúdo.

**Prova local** (padrão do 051, PowerShell 5.1, sem `&&`):

```powershell
npx wrangler dev   # http://localhost:8787 ; encerrar com Ctrl+C ou taskkill /T /F, porta conferida livre
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/en/rota-que-nao-existe
curl.exe -s http://localhost:8787/en/rota-que-nao-existe -o <scratch>\en404.html ; Get-FileHash <scratch>\en404.html ; Get-FileHash dist\en\404.html
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/rota-que-nao-existe
curl.exe -s http://localhost:8787/rota-que-nao-existe -o <scratch>\pt404.html ; Get-FileHash <scratch>\pt404.html ; Get-FileHash dist\404.html
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/en/about/
```

Esperado: `404`, hashes iguais (EN); `404`, hashes iguais (PT); `200`.

**Canário da prova:** renomeie `dist/en/404.html` para `dist/en/404.bak`, reinicie o `wrangler dev` e
mostre o que `/en/rota-que-nao-existe` recebe (o esperado é o `dist/404.html` em português — o "mais
próximo" subindo a árvore); restaure e confira o hash.

**Prova em produção (orquestrador, depois do push e do check `Workers Builds: haroldo-page`
`success`):** os mesmos `curl.exe -sSi` contra `https://haroldo-page.and-near.workers.dev`, com
SHA-256 do corpo comparado ao `dist/en/404.html` e ao `dist/404.html` do build revisado; data, horário,
SHA do commit e id da versão. **Nenhum outro push na janela.** Linha de base antes do push: o que
`/en/rota-que-nao-existe` responde hoje (esperado: `404` com o `dist/404.html` em português).

**Testes de `dist`:** `en/404.html` nas rotas fixas; o `lang="en"`, o `<h1>` único e o vt-nome/vt-menu
já valem para ele pelos testes gerais.

**Regras de código:** README da fase 4. Cite **RF-27**.

## Passos

1. Página fina `src/pages/en/404.astro` → verify: `npx astro check` colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/en` colado; trecho do Astro que decide o nome do arquivo colado. Se `dist/en/404/index.html`: aplicar a tática pré-autorizada, rebuild, e colar `ls dist/en` com `404.html` e sem a pasta `404`.
3. Prova local → verify: as saídas dos `curl.exe` e `Get-FileHash` do Contexto coladas; servidor encerrado e porta 8787 livre.
4. Canário da prova → verify: saídas coladas; hash de `dist/en/404.html` igual antes e depois.
5. Testes de `dist` → verify: `npm run test:dist` colado.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador — navegador** em `http://localhost:8787/en/rota-que-nao-existe` a 360/768/1440: `[scrollWidth, clientWidth]`, lista "All pages" com as cinco rotas EN, texto em inglês.
8. **Orquestrador — produção** (Contexto) → verify: linha de base, checks do commit e as respostas com SHA-256 coladas.

## Critérios de aceitação

- [x] `dist/en/404.html` gerado (diretamente ou pela tática pré-autorizada, com o trecho do Astro colado)
- [x] Local: `/en/<inexistente>` → `404` com corpo igual a `dist/en/404.html`; `/<inexistente>` → `404` com corpo igual a `dist/404.html`; `/en/about/` → `200`
- [x] Canário: sem `dist/en/404.html`, `/en/<inexistente>` cai no que o Worker achar mais próximo (saída colada)
- [ ] Produção: as mesmas duas respostas, com SHA-256, data, commit e versão (orquestrador)
- [ ] Se a premissa cair: plano parado e devolvido, sem 404 bilíngue improvisada
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

Executada em 2026-10-02 pelo executor (`implementer`). Data local confirmada pelo despacho; blocos copiados dos `.txt` do scratch por script, sem BOM.

**Tática pré-autorizada: NECESSÁRIA** (o build gerou `dist/en/404/index.html`). **Premissa da Decisão 9: CONFIRMADA no `wrangler dev`** — o ramo de saída não foi acionado.

### Passo 1 — `astro check` depois da página `src/pages/en/404.astro` (estado final dos arquivos)

Capturado por `npx astro check` ao final de todas as edições; `src/pages/en/404.astro` tem 28 linhas (view fina).

```
10:26:22 [content] Syncing content
10:26:22 [content] Synced content
10:26:22 [types] Generated 560ms
10:26:22 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (92 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 2 — build sem a tática: o Astro gerou `dist/en/404/index.html`

Primeiro `npm run build:pipeline` (antes de editar `astro.config.mjs`); a linha `/en/404/index.html` mostra o nome gerado.

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  10:20:56
   Duration  1.16s (transform 1.89s, setup 0ms, import 3.03s, tests 78ms, environment 0ms)

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
10:21:32 [content] Syncing content
10:21:32 [content] Synced content
10:21:32 [types] Generated 515ms
10:21:32 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (92 files): 
- 0 errors
- 0 warnings
- 0 hints

10:21:42 [content] Syncing content
10:21:42 [content] Synced content
10:21:42 [types] Generated 564ms
10:21:42 [build] output: "static"
10:21:42 [build] mode: "static"
10:21:42 [build] directory: S:\Projetos\academic_page\haroldo\dist\
10:21:42 [build] Collecting build info...
10:21:42 [build] ✓ Completed in 615ms.
10:21:42 [build] Building static entrypoints...
10:21:43 [vite] ✓ built in 451ms
10:21:43 [vite] ✓ built in 112ms
10:21:43 [build] Rearranging server assets...

 generating static routes 
10:21:43   ├─ /404.html (+14ms) 
10:21:43   ├─ /en/404/index.html (+5ms) 
10:21:43   ├─ /en/about/index.html (+10ms) 
10:21:43   ├─ /en/publications/index.html (+6ms) 
10:21:43   ├─ /en/research/index.html (+7ms) 
10:21:43   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
10:21:43   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+105ms) 
10:21:43   ├─ /en/teaching/index.html (+8ms) 
10:21:43   ├─ /en/index.html (+8ms) 
10:21:43   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
10:21:43   ├─ /ensino/2026-2-relatividade-geral/index.html (+15ms) 
10:21:43   ├─ /ensino/index.html (+4ms) 
10:21:43   ├─ /pesquisa/index.html (+4ms) 
10:21:43   ├─ /publicacoes/index.html (+3ms) 
10:21:43   ├─ /sobre/index.html (+4ms) 
10:21:43   ├─ /index.html (+2ms) 
10:21:43 ✓ Completed in 248ms.

10:21:43 [build] ✓ Completed in 882ms.
10:21:43 [build] 16 page(s) built in 1.52s
10:21:43 [build] Complete!
EXIT=0
```

### Passo 2 — `dist/en` antes da tática

Há a pasta `404` e **não** há `404.html`: a tática pré-autorizada é necessária.

```
Name         Mode  
----         ----  
404          d-----
about        d-----
publications d-----
research     d-----
teaching     d-----
index.html   -a----
```

### Passo 2 — trecho do Astro que decide o nome do arquivo

Só `/404` e `/500` (`STATUS_CODE_PAGES`) viram `<nome>.html` no formato `directory`; qualquer outra rota vira `<rota>/index.html`.

```
--- node_modules\astro\dist\core\output-filename.js (linhas 1-17)
import { removeTrailingForwardSlash } from "./path.js";
const STATUS_CODE_PAGES = /* @__PURE__ */ new Set(["/404", "/500"]);
function getOutputFilename(buildFormat, name, routeData) {
  if (routeData.type === "endpoint") {
    return name;
  }
  if (name === "/" || name === "") {
    return name === "" ? "index.html" : "/index.html";
  }
  if (buildFormat === "file" || STATUS_CODE_PAGES.has(name)) {
    return `${removeTrailingForwardSlash(name || "index")}.html`;
  }
  if (buildFormat === "preserve" && !routeData.isIndex) {
    return `${removeTrailingForwardSlash(name || "index")}.html`;
  }
  return `${removeTrailingForwardSlash(name)}/index.html`;
}
--- node_modules\astro\dist\core\build\common.js (linha 4 e linhas 25-27, 56-59)
const STATUS_CODE_PAGES = /* @__PURE__ */ new Set(["/404", "/500"]);
          if (STATUS_CODE_PAGES.has(pathname)) {
            return new URL("." + appendForwardSlash(npath.dirname(pathname)), outRoot);
          }
          if (STATUS_CODE_PAGES.has(pathname)) {
            const baseName = npath.basename(pathname);
            return new URL("./" + (baseName || "index") + ".html", outFolder);
          }
```

### Passo 2 — tática pré-autorizada aplicada (diff de `astro.config.mjs` e `tests/dist/site-gerado.test.ts`)

Integração inline `english404FileName` com o gancho `astro:build:done`; nenhuma mudança em `build.format`, `trailingSlash` ou `wrangler.toml`.

```
diff --git a/astro.config.mjs b/astro.config.mjs
index 6b7ad70..aa81cad 100644
--- a/astro.config.mjs
+++ b/astro.config.mjs
@@ -3,6 +3,8 @@ import { defineConfig } from 'astro/config';
 import { loadEnv } from 'vite';
 import tailwindcss from '@tailwindcss/vite';
 import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
+import { existsSync, renameSync, rmdirSync } from 'node:fs';
+import { fileURLToPath } from 'node:url';
 
 // astro.config.mjs roda em Node antes de o Astro/Vite aplicar `.env` ao
 // processo — `process.env.PUBLIC_SITE_URL` ficaria sempre `undefined` quando
@@ -14,6 +16,27 @@ import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
 // nem as demais, que este arquivo não usa.
 const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? '', process.cwd(), 'PUBLIC_');
 
+// RF-27 (sabatina fase 4, Decisão 9 e decisão de fatiamento 14): o Astro só grava
+// `/404` como `404.html` (`STATUS_CODE_PAGES` em `core/output-filename.js` e
+// `core/build/common.js` contém apenas `/404` e `/500`); `/en/404` sai como
+// `en/404/index.html`. O Worker (`not_found_handling = "404-page"`) procura
+// `404.html` subindo a árvore, então o arquivo é movido para `en/404.html` depois
+// do build. Tática estática, sem código no Worker (D-01); não muda `build.format`.
+/** @type {import('astro').AstroIntegration} */
+const english404FileName = {
+  name: 'english-404-file-name',
+  hooks: {
+    'astro:build:done': ({ dir }) => {
+      const outDir = fileURLToPath(dir);
+      const folder = `${outDir}en/404`;
+      const generated = `${folder}/index.html`;
+      if (!existsSync(generated)) return;
+      renameSync(generated, `${outDir}en/404.html`);
+      rmdirSync(folder);
+    },
+  },
+};
+
 /**
  * ============================================================================
  *  Arquivo      : astro.config.mjs
@@ -21,13 +44,15 @@ const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? '', process.cwd(), '
  *  Descrição    : Configuração do Astro em modo estático (D-01), sem adapter
  *                 e sem SSR, com o plugin Vite do Tailwind 4 (RNF-02, RNF-12)
  *                 e o plugin de dev do TinaCMS que resolve `/admin` sem sufixo
- *                 durante `astro dev`.
+ *                 durante `astro dev`, mais a integração inline que grava a
+ *                 404 em inglês como `dist/en/404.html` (RF-27, plano 068).
  *  Autor        : Desenvolvedor
  *  Criado em    : 2026-09-01
- *  Atualizado em: 2026-09-02
- *  Versão       : 0.2.0
+ *  Atualizado em: 2026-10-02
+ *  Versão       : 0.3.0
  *
- *  Dependências : astro, @tailwindcss/vite, @tinacms/astro (tinaAdminDevRedirect), vite (loadEnv)
+ *  Dependências : astro, @tailwindcss/vite, @tinacms/astro (tinaAdminDevRedirect), vite (loadEnv),
+ *                 node:fs, node:url
  *  Entradas     : variável de ambiente PUBLIC_SITE_URL (opcional), lida via
  *                 `loadEnv` do `.env`/ambiente real — ver nota acima
  *  Saídas       : configuração consumida pelo CLI do Astro (`astro build`/`astro dev`)
@@ -44,6 +69,7 @@ const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? '', process.cwd(), '
 export default defineConfig({
   output: 'static',
   site: PUBLIC_SITE_URL ?? 'https://haroldo-page.and-near.workers.dev',
+  integrations: [english404FileName],
   vite: {
     plugins: [tailwindcss(), tinaAdminDevRedirect()],
   },
diff --git a/tests/dist/site-gerado.test.ts b/tests/dist/site-gerado.test.ts
index a8fdc49..3e14c4e 100644
--- a/tests/dist/site-gerado.test.ts
+++ b/tests/dist/site-gerado.test.ts
@@ -5,7 +5,7 @@
  *  Descrição    : Teste de integração sobre o `dist/` recém-gerado (§11 do PRD, nível
  *                 "Integração": rotas geradas, nenhum rascunho publicado), RN-01 (rascunho nunca
  *                 aparece no HTML), RNF-02 (JS < 50 KB gzip por rota, zero framework de UI), RF-10
- *                 (disciplina não publicada não gera página), RF-27 (existência de `dist/404.html`)
+ *                 (disciplina não publicada não gera página), RF-27 (existência de `dist/404.html` e `dist/en/404.html`)
  *                 e §8.3 (um `<h1>` por página, `lang` por árvore: pt-BR; en sob `dist/en/`). Lê arquivos de `dist/`, não sobe
  *                 servidor. Roda separado da suíte padrão (`vitest.dist.config.ts`, plano 052,
  *                 README da fase 3, decisão 9) porque depende de `npm run build:pipeline` já ter
@@ -106,7 +106,7 @@ function listMarkdownFiles(dir: string): string[] {
 }
 
 describe('rotas fixas existem (§11)', () => {
-  it('dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem', () => {
+  it('dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes, dist/404.html e dist/en/404.html existem', () => {
     const rotasFixas = [
       'index.html',
       'sobre/index.html',
@@ -119,6 +119,7 @@ describe('rotas fixas existem (§11)', () => {
       'en/research/index.html',
       'en/publications/index.html',
       'en/teaching/index.html',
+      'en/404.html',
     ];
     for (const rota of rotasFixas) {
       expect(existsSync(join(distDir, rota)), `esperava dist/${rota}`).toBe(true);
--- src/pages/en/404.astro (novo, nao rastreado), linhas:
28
```

### Passo 2 — rebuild final com a tática (`npm run build:pipeline`, estado final)

Mesmo comando depois de todas as edições; exit 0.

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  10:25:31
   Duration  1.18s (transform 1.91s, setup 0ms, import 3.10s, tests 84ms, environment 0ms)

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
10:26:06 [content] Syncing content
10:26:06 [content] Synced content
10:26:06 [types] Generated 506ms
10:26:06 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (92 files): 
- 0 errors
- 0 warnings
- 0 hints

10:26:16 [content] Syncing content
10:26:16 [content] Synced content
10:26:16 [types] Generated 494ms
10:26:16 [build] output: "static"
10:26:16 [build] mode: "static"
10:26:16 [build] directory: S:\Projetos\academic_page\haroldo\dist\
10:26:16 [build] Collecting build info...
10:26:16 [build] ✓ Completed in 536ms.
10:26:16 [build] Building static entrypoints...
10:26:17 [vite] ✓ built in 394ms
10:26:17 [vite] ✓ built in 99ms
10:26:17 [build] Rearranging server assets...

 generating static routes 
10:26:17   ├─ /404.html (+13ms) 
10:26:17   ├─ /en/404/index.html (+4ms) 
10:26:17   ├─ /en/about/index.html (+7ms) 
10:26:17   ├─ /en/publications/index.html (+8ms) 
10:26:17   ├─ /en/research/index.html (+6ms) 
10:26:17   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
10:26:17   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+90ms) 
10:26:17   ├─ /en/teaching/index.html (+8ms) 
10:26:17   ├─ /en/index.html (+6ms) 
10:26:17   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
10:26:17   ├─ /ensino/2026-2-relatividade-geral/index.html (+14ms) 
10:26:17   ├─ /ensino/index.html (+3ms) 
10:26:17   ├─ /pesquisa/index.html (+3ms) 
10:26:17   ├─ /publicacoes/index.html (+4ms) 
10:26:17   ├─ /sobre/index.html (+3ms) 
10:26:17   ├─ /index.html (+3ms) 
10:26:17 ✓ Completed in 217ms.

10:26:17 [build] ✓ Completed in 787ms.
10:26:17 [build] 16 page(s) built in 1.40s
10:26:17 [build] Complete!
EXIT=0
```

### Passo 2 — `dist/en` com a tática: `404.html` e sem a pasta `404`

```
Name         Mode  
----         ----  
about        d-----
publications d-----
research     d-----
teaching     d-----
404.html     -a----
index.html   -a----
```

### Passo 2 — conteúdo de `dist/en/404.html` (`lang`, `<h1>` único, texto em inglês)

```
<html ...> de dist/en/404.html:
<html lang="en">
h1 (count):
1
texto:
<h1 class="text-display-2 titulo-entrada" data-astro-cid-b2i3gsw2>Page not found</h1>
All pages
```

### Passo 3 — linha de base antes de qualquer mudança (produção do orquestrador; arquivo `linha-de-base.txt`)

Arquivo do orquestrador, colado sem alteração: o `dist/404.html` em português do commit `6750ffd` serve as duas rotas inexistentes.

```
Fri Oct  2 10:19:56     2026
HEAD 6750ffda9a3fb4a316a9556997d06b403ce18369
/en/rota-que-nao-existe 404
/rota-que-nao-existe 404
0d4c75d0363e19f51907e3169055d3bf186dff4e8627cd257171a4ccdf89ad99 *base_en_rota-que-nao-existe.html
0d4c75d0363e19f51907e3169055d3bf186dff4e8627cd257171a4ccdf89ad99 *base_rota-que-nao-existe.html
0d4c75d0363e19f51907e3169055d3bf186dff4e8627cd257171a4ccdf89ad99 *dist/404.html
```

### Passo 3 — prova local no `wrangler dev` (porta 8787, `wrangler.toml` inalterado)

Servidor subido com `npx wrangler dev --port 8787`. Esperado: `404` e hashes iguais (EN); `404` e hashes iguais (PT); `200`. O último status (`/en/teaching/nada/`, rota EN inexistente de segundo nível) é extra.

```
== EN inexistente: status
404
hash corpo servido EN


Algorithm : SHA256
Hash      : 9AD925D6D6BB7145798B1757B9D2C00DAD7D031056765F5C05B03B0F5F74F891



hash dist\en\404.html


Algorithm : SHA256
Hash      : 9AD925D6D6BB7145798B1757B9D2C00DAD7D031056765F5C05B03B0F5F74F891



== PT inexistente: status
404
hash corpo servido PT


Algorithm : SHA256
Hash      : 0D4C75D0363E19F51907E3169055D3BF186DFF4E8627CD257171A4CCDF89AD99



hash dist\404.html


Algorithm : SHA256
Hash      : 0D4C75D0363E19F51907E3169055D3BF186DFF4E8627CD257171A4CCDF89AD99



== /en/about/ status
200
== extra: /en/teaching/nada status
404
```

### Passo 3 — servidor encerrado e portas livres

Encerrado com `taskkill /T /F` no PID raiz; `Get-NetTCPConnection` confere 8787, 4321 e 9000.

```
taskkill PID 14852
ÊXITO: o processo com PID 11676 (processo filho de PID 12476) foi finalizado.
ÊXITO: o processo com PID 7056 (processo filho de PID 11040) foi finalizado.
ÊXITO: o processo com PID 17432 (processo filho de PID 12552) foi finalizado.
ÊXITO: o processo com PID 12476 (processo filho de PID 12552) foi finalizado.
ÊXITO: o processo com PID 11040 (processo filho de PID 12552) foi finalizado.
ÊXITO: o processo com PID 12552 (processo filho de PID 4204) foi finalizado.
ÊXITO: o processo com PID 4204 (processo filho de PID 6416) foi finalizado.
ÊXITO: o processo com PID 6416 (processo filho de PID 19592) foi finalizado.
ÊXITO: o processo com PID 19880 (processo filho de PID 14852) foi finalizado.
ÊXITO: o processo com PID 19592 (processo filho de PID 14852) foi finalizado.
ÊXITO: o processo com PID 14852 (processo filho de PID 13640) foi finalizado.
Listen 8787/4321/9000:
(nenhuma conexao em Listen)
```

### Passo 4 — canário: `dist/en/404.html` renomeado para `404.bak`

Hash antes de renomear e listagem de `dist/en` com a pasta sem o `404.html`.

```
hash antes


Hash : 9AD925D6D6BB7145798B1757B9D2C00DAD7D031056765F5C05B03B0F5F74F891



ls dist\en
about
publications
research
teaching
404.bak
index.html
```

### Passo 4 — canário: o que `/en/rota-que-nao-existe` recebe sem o arquivo

Novo `wrangler dev`. O corpo recebido tem o hash do `dist/404.html` em português e `lang="pt-BR"`: o Worker sobe a árvore até o `404.html` mais próximo.

```
status /en/rota-que-nao-existe
404
hash do corpo recebido


Hash : 0D4C75D0363E19F51907E3169055D3BF186DFF4E8627CD257171A4CCDF89AD99



hash dist\404.html (PT)


Hash : 0D4C75D0363E19F51907E3169055D3BF186DFF4E8627CD257171A4CCDF89AD99



lang do corpo recebido
<html lang="pt-BR">
```

### Passo 4 — canário desfeito: servidor encerrado, portas livres e hash restaurado

Renomeado de volta (`Rename-Item`); o hash de `dist/en/404.html` é igual ao de antes do canário.

```
Listen 8787/4321/9000:
(nenhuma conexao em Listen)
ls dist\en
about
publications
research
teaching
404.html
index.html
hash depois


Hash : 9AD925D6D6BB7145798B1757B9D2C00DAD7D031056765F5C05B03B0F5F74F891
```

### Passo 5 — `npm run test:dist` com `en/404.html` ausente (antes da tática; falha primeiro)

Teste novo (`en/404.html` nas rotas fixas) contra o `dist/` do build sem a tática.

```
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (30 tests | 1 failed) 120ms
     × dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes, dist/404.html e dist/en/404.html existem 6ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, 
dist/ensino, dist/publicacoes, dist/404.html e dist/en/404.html existem
AssertionError: esperava dist/en/404.html: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/dist/site-gerado.test.ts:125:72
    123|     ];
    124|     for (const rota of rotasFixas) {
    125|       expect(existsSync(join(distDir, rota)), `esperava dist/${rota}`)…
       |                                                                        ^
    126|     }
    127|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 29 passed (30)
   Start at  10:22:16
   Duration  418ms (transform 82ms, setup 0ms, import 161ms, tests 120ms, environment 0ms)

EXIT=1
```

### Passo 5 — `npm run test:dist` verde (estado final)

```
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  30 passed (30)
   Start at  10:26:19
   Duration  431ms (transform 86ms, setup 0ms, import 171ms, tests 130ms, environment 0ms)

EXIT=0
```

### Passo 6 — `npm run lint`

```
> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 6 — `npm run format:check`

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 6 — `npm run test:coverage`

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  10:25:22
   Duration  1.83s (transform 5.45s, setup 0ms, import 9.83s, tests 387ms, environment 3ms)

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

### Verificação final (fidelidade dos blocos, `file`, mojibake)

```
OK check3.txt
OK build1.txt
OK ls-en1.txt
OK astro-trecho.txt
OK diff.txt
OK build3.txt
OK ls-en3.txt
OK en404-conteudo.txt
OK linha-de-base.txt
OK prova-local.txt
OK encerra1.txt
OK canario-antes.txt
OK canario-resposta.txt
OK canario-restaura.txt
OK test-dist-vermelho.txt
OK test-dist3.txt
OK lint.txt
OK format.txt
OK coverage.txt
blocos lidos: 21 esperados: 19

$ file src/pages/en/404.astro astro.config.mjs tests/dist/site-gerado.test.ts
src/pages/en/404.astro:                                                  JavaScript source, Unicode text, UTF-8 text
astro.config.mjs:                                                        JavaScript source, Unicode text, UTF-8 text
tests/dist/site-gerado.test.ts:                                          JavaScript source, Unicode text, UTF-8 text
plans/fase-4-internacionalizacao/068-404-em-ingles-e-prova-do-worker.md: HTML document, Unicode text, UTF-8 text

mojibake (grep -c 'Ã\|â€\|Â'), arquivos tocados e plano:
src/pages/en/404.astro: 0
astro.config.mjs: 0
tests/dist/site-gerado.test.ts: 0
plans/fase-4-internacionalizacao/068-404-em-ingles-e-prova-do-worker.md: 1
```

### Não rodado pelo executor

- Passo 7 (navegador a 360/768/1440 em `http://localhost:8787/en/rota-que-nao-existe`): do orquestrador, **não rodado**.
- Passo 8 (produção: linha de base, checks do commit, `curl.exe -sSi` com SHA-256): do orquestrador, **não rodado**; os critérios de produção e "premissa cair" ficam vazios (a premissa não caiu no `wrangler dev`).
- `npm audit`, `npm run deploy` e `wrangler deploy`: não rodados (proibidos ou fora do plano). `Status:` fica `TODO`; nada commitado nem empurrado.
- Nenhum servidor ficou vivo: 8787, 4321 e 9000 conferidas livres nos blocos de encerramento.

### BOM no plano

```
$ grep -o BOM-utf8 <plano> | wc -l   (padrão: os três bytes EF BB BF)
0
```

### Passo 7 — Navegador (orquestrador)

Rodado pelo orquestrador em 2026-10-02, às 10:38, no Vivaldi com a extensão, sobre `npx wrangler dev` (porta 8787, `wrangler.toml` inalterado). O `wrangler dev` servia o `dist/` do build autoritativo do triage2 (10:36). Há uma cópia em `scratchpad/068/dist-medido`, e a comparação por hash com o `dist/` no fim das medidas deu `diferencas=0`. Antes de abrir o navegador, `curl.exe` em `/en/rota-que-nao-existe` respondeu `404`. A rota foi carregada num `<iframe>` com `box-sizing:content-box`, e o `innerWidth` conferido saiu igual à largura pedida. Legenda: `doc` é o par `[scrollWidth, clientWidth]` do documento; `conteudo` é o mesmo par para `#conteudo`.

Saída transcrita do `javascript_tool`:

```
Fri Oct 02 2026 10:38:38
360 inner=360 doc=[360,360] conteudo=[320,320] html=en h1=1:Page not found ptBR=0 links=Home›=/en/ | About›=/en/about/ | Research›=/en/research/ | Teaching›=/en/teaching/ | Publications›=/en/publications/
768 inner=768 doc=[768,768] conteudo=[707,707] html=en h1=1:Page not found ptBR=0 links=Home›=/en/ | About›=/en/about/ | Research›=/en/research/ | Teaching›=/en/teaching/ | Publications›=/en/publications/
1440 inner=1440 doc=[1440,1440] conteudo=[1328,1328] html=en h1=1:Page not found ptBR=0 links=Home›=/en/ | About›=/en/about/ | Research›=/en/research/ | Teaching›=/en/teaching/ | Publications›=/en/publications/
texto=Skip to contentHaroldo LimaMenuAbout›Research›Teaching›Publications›Page not foundError 404The address may have changed with the semester. Materials from previous courses remain on the Teaching page.All pagesHome›About›Research›Teaching›Publications›
```

- **Rolagem horizontal (RF-26):** os pares são iguais nas três larguras.
- **Lista "All pages":** tem as cinco rotas EN, com "Home" primeiro e barra final em todas.
- **Texto em inglês:** a página não tem nenhum elemento `lang="pt-BR"`. O texto do documento inteiro, sem `script` e `style` (na linha `texto=`), está todo em inglês.
- **Encerramento:** o `wrangler dev` foi encerrado com `taskkill /T /F`. Depois disso, nenhuma escuta nas portas 8787, 4321 e 9000 (`escutando=0`).
