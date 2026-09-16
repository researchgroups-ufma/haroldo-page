# Plano 036 — Tokens de cor, escala tipográfica e Archivo auto-hospedada

**Status:** DONE
**RFs cobertos:** RNF-01, RNF-03, RNF-15, RF-32 (base do movimento); pré-requisito do item
"Identidade visual aplicada" do §12 da fase 3
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`src/styles/global.css` passa a conter todo o sistema visual que não é componente: os seis tokens de
cor, as três famílias, a escala tipográfica fluida, a margem lateral, o foco visível e as regras de
movimento com `prefers-reduced-motion`. A Archivo (pesos 200 e 300, só latin) é servida pelo próprio
site via `@fontsource/archivo`, sem nenhuma requisição a terceiro.

## Arquivos afetados

- `package.json` — `@fontsource/archivo` em `dependencies`, **versão exata** (sem `^`)
- `package-lock.json` — consequência do install
- `src/styles/global.css` — reescrito (hoje só `@import 'tailwindcss';`)
- `plans/fase-3-site-publico/.gitkeep` — **removido** com `git rm` (a pasta já tem conteúdo)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Projeto.** `haroldo-page`: Astro 7.2.10 estático (D-01), Tailwind 4.3.3 via `@tailwindcss/vite`
(`astro.config.mjs`), TinaCMS. Nenhuma página real existe ainda; `src/pages/index.astro` é
placeholder e **não** é tocado aqui.

**Fonte da especificação:** `docs/identidade-visual.md`, seções **2 (Cor)**, **3 (Tipografia)**,
**4 (Grade e espaçamento)** e **7 (Movimento)**. Leia as quatro inteiras. `ref/` não existe para
você — não procure.

**Como os tokens viram CSS (decisão deste plano).** Tailwind 4 gera utilitários a partir de
variáveis em `@theme`, e exige o prefixo do namespace. O nome do token da identidade vira sufixo:

| Identidade | Variável em `@theme` | Utilitários gerados (exemplo) |
|---|---|---|
| `--papel` `#EFEDEA` | `--color-papel` | `bg-papel`, `text-papel` |
| `--bloco` `#F7F6F4` | `--color-bloco` | `bg-bloco` |
| `--tinta` `#111112` | `--color-tinta` | `text-tinta`, `border-tinta` |
| `--secundario` `#5A5754` | `--color-secundario` | `text-secundario` |
| `--regua` `#D6D3CF` | `--color-regua` | `border-regua` |
| `--tracejado` `#9A9691` | `--color-tracejado` | `border-tracejado` (só borda) |
| cinza de comentário `#6E6A66` | `--color-comentario` | usado pelo tema Shiki do plano 049 |
| texto | `--font-texto`: `"Helvetica Neue", Helvetica, Arial, sans-serif` | `font-texto` |
| display | `--font-display`: `"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif` | `font-display` |
| código | `--font-codigo`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | `font-codigo` |
| breakpoints | `--breakpoint-sm: 40rem`, `--breakpoint-lg: 64rem` (e remova os demais com `--breakpoint-*: initial` antes) | `sm:`, `lg:` |

**Escala tipográfica** — um `@utility` por token da tabela "Escala" do §3 da identidade, com
`font-size`, `line-height`, `letter-spacing`, `font-family` e `font-weight` exatamente como na
tabela: `text-display-1`, `text-display-2`, `text-numeral`, `text-numeral-sm`, `text-ano`,
`text-titulo-item`, `text-corpo`, `text-pequeno`, `text-rotulo` (este com `text-transform:
uppercase` e `0.14em`). Os `clamp(...)` são copiados literalmente da tabela. Mais dois utilitários:
`px-margem` (`padding-inline: clamp(1.25rem, 4vw, 3.5rem)`) e `max-w-medida` (`max-width: 38rem`).

**Base (em `@layer base`):** `html` com `background: var(--color-papel)`, `color:
var(--color-tinta)`, `font-family: var(--font-texto)`, `font-size: 100%` (corpo 16 px);
`:focus-visible { outline: 2px solid var(--color-tinta); outline-offset: 3px; }`; `.sr-only` já
existe no Tailwind — não recrie.

**Movimento (§7 da identidade).** Duas classes que o plano 043 aplica no cabeçalho de página:

- `.regua-entrada` — régua forte que se desenha: `transform-origin: left`, animação de
  `scaleX(0)` → `scaleX(1)` em 500 ms.
- `.titulo-entrada` — `<h1>` que sobe 8 px e aparece: `translateY(8px)`/`opacity: 0` → estado final
  em 400 ms, atraso de 100 ms.

**Regra que não se negocia:** os `@keyframes` e o estado inicial oculto ficam **dentro** de
`@media (prefers-reduced-motion: no-preference) { ... }`. Fora dela, as classes não fazem nada — se
o CSS falhar ou o usuário pedir movimento reduzido, o texto está visível no estado final. Acrescente
também `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:
0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
} }`. A transição de hover de 120 ms é dos componentes, não daqui.

**Fonte.** `npm install --save-exact @fontsource/archivo`. Depois do install, **confira** que
existem `node_modules/@fontsource/archivo/latin-200.css` e `latin-300.css` (convenção do
Fontsource v5) e importe **só esses dois** no topo de `global.css`, depois de `@import
'tailwindcss';`. O Fontsource já declara `font-display: swap`; confira no CSS importado e cite a
linha. **Não** importe `index.css` (traz todos os subsets e o peso 400).

**Armadilhas.**
- `ref/` está no `.gitignore` e o Prettier 3 respeita o `.gitignore`: **não** mexa em
  `.prettierignore`.
- Churn de lockfile: o install deve acrescentar um pacote. Se o diff do `package-lock.json` mudar
  versão de outro pacote, pare e reporte (lição da fase 0, plano 007).
- `prettier-plugin-tailwindcss` está instalado; rode `npm run format` só sobre `src/styles/global.css`
  (`npx prettier --write src/styles/global.css`), não sobre o repositório.

## Passos

1. `git rm plans/fase-3-site-publico/.gitkeep` → verify: `git status --short plans/fase-3-site-publico` colado mostrando `D  plans/fase-3-site-publico/.gitkeep`.
2. Instalar `@fontsource/archivo` com versão exata → verify: `grep -n "fontsource" package.json` colado sem `^`; `git diff --stat package-lock.json` colado; `ls node_modules/@fontsource/archivo/latin-200.css node_modules/@fontsource/archivo/latin-300.css` colado.
3. Reescrever `src/styles/global.css` com imports, `@theme`, `@utility`, `@layer base` e movimento, com um comentário de topo apontando `docs/identidade-visual.md` §2–§4 e §7 → verify: `npx prettier --check src/styles/global.css` colado.
4. Build → verify: `npm run build:pipeline` com a saída do `astro check` e do `astro build` colada; em seguida `ls dist/_astro/*.woff2` colado (arquivos `archivo-latin-200-normal-*.woff2` e `-300-`) e `grep -rl "fonts.googleapis\|fonts.gstatic" dist/ --include=*.css --include=*.html` colado **vazio**.
5. Canário do utilitário (antes, `git status --short src/pages/index.astro` tem de sair vazio — senão o `checkout` do fim apagaria trabalho alheio; nesse caso pule e declare): `grep -o "text-display-1" dist/_astro/*.css` só aparece se alguma página usar a classe — como nenhuma usa ainda, prove que o utilitário compila adicionando **temporariamente** `class="text-display-1 bg-papel"` ao `<h1>` de `src/pages/index.astro`, rode `npx astro build`, cole `grep -o "clamp(2.625rem[^;]*" dist/_astro/*.css`, e **reverta** com `git checkout -- src/pages/index.astro` → verify: `git status --short src/pages` colado limpo.
6. Portão completo → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] `@fontsource/archivo` em `dependencies` com versão exata; nenhum outro pacote mudou de versão no lock
- [x] `global.css` importa apenas `latin-200.css` e `latin-300.css` do Fontsource
- [x] Os seis tokens de cor, o cinza de comentário, as três famílias e os nove utilitários da escala existem com os valores literais do §2/§3 da identidade
- [x] Breakpoints `sm` = 40rem e `lg` = 64rem, sem os defaults do Tailwind
- [x] Keyframes e estado inicial oculto só dentro de `prefers-reduced-motion: no-preference`; bloco `reduce` zera animações e transições
- [x] `dist/` contém os `.woff2` da Archivo 200/300 e nenhuma referência a `fonts.googleapis`/`fonts.gstatic`

> **Emenda 2026-09-16 (decisão do stakeholder, revisão do 036):** o critério vale para o site
> público — `dist/` excluindo `dist/admin/`. O bundle do painel TinaCMS em `dist/admin/` carrega a
> Inter de `fonts.googleapis.com`; é código de terceiro, anterior a este plano, e o passo 4 e a
> regra do README da fase ("no HTML/CSS") já tinham esse recorte. Dívida registrada no README da
> fase.

- [x] Canário do passo 5 mostrou o `clamp` compilado e foi revertido
- [x] `lint`, `format:check`, `test:coverage` e `build:pipeline` verdes, com saída colada
- [x] `.gitkeep` da pasta da fase removido

## Evidência

### Passo 1 — `.gitkeep` removido

```
$ git rm plans/fase-3-site-publico/.gitkeep
rm 'plans/fase-3-site-publico/.gitkeep'
$ git status --short plans/fase-3-site-publico
D  plans/fase-3-site-publico/.gitkeep
```

### Passo 2 — `@fontsource/archivo` instalada, versão exata

```
$ grep -n "fontsource" package.json
23:    "@fontsource/archivo": "5.3.0",
```

```
$ git diff --stat package-lock.json
 package-lock.json | 10 ++++++++++
 1 file changed, 10 insertions(+)
```

```
$ git diff package-lock.json
diff --git a/package-lock.json b/package-lock.json
index 8aed6da..e07a6c7 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -8,6 +8,7 @@
       "name": "haroldo-page",
       "version": "0.1.0",
       "dependencies": {
+        "@fontsource/archivo": "5.3.0",
         "@tailwindcss/vite": "4.3.3",
         "@tinacms/astro": "0.6.1",
         "astro": "7.2.10",
@@ -1960,6 +1961,15 @@
       "integrity": "sha512-HpCo8tmWzLVad5s2d19EhAz5zqrrQ6s69qd6moPMQvkOuSwDT1YgRfWSVuc4ennqrgv3OHppiOGMQ7oC13yIww==",
       "license": "MIT"
     },
+    "node_modules/@fontsource/archivo": {
+      "version": "5.3.0",
+      "resolved": "https://registry.npmjs.org/@fontsource/archivo/-/archivo-5.3.0.tgz",
+      "integrity": "sha512-5DIMgPVJRi62OqdOVoogCFxP73EkNM/E0YVTSDIQlDEJfDbxqZduwM/YoNZwC9Sx1CDgpKinqf8ckRY1QNIecw==",
+      "license": "OFL-1.1",
+      "funding": {
+        "url": "https://github.com/sponsors/ayuhito"
+      }
+    },
     "node_modules/@graphiql/plugin-doc-explorer": {
       "version": "0.2.2",
       "resolved": "https://registry.npmjs.org/@graphiql/plugin-doc-explorer/-/plugin-doc-explorer-0.2.2.tgz",
```

Só inserções: um pacote novo acrescentado ao `dependencies` de `haroldo-page` e um novo nó
`node_modules/@fontsource/archivo`. Nenhuma linha de versão de pacote pré-existente foi tocada.

```
$ ls node_modules/@fontsource/archivo/latin-200.css node_modules/@fontsource/archivo/latin-300.css
node_modules/@fontsource/archivo/latin-200.css
node_modules/@fontsource/archivo/latin-300.css
```

`font-display: swap` confirmado em `node_modules/@fontsource/archivo/latin-200.css:5` (e igualmente
em `latin-300.css:5`):

```
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-display: swap;
  font-weight: 200;
  src: url(./files/archivo-latin-200-normal.woff2) format('woff2'), url(./files/archivo-latin-200-normal.woff) format('woff');
}
```

### Passo 3 — `global.css` reescrito

```
$ npx prettier --check src/styles/global.css
Checking formatting...
All matched files use Prettier code style!
```

### Passo 4 — Build

```
$ npm run build:pipeline

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  18:05:23
   Duration  1.57s (transform 1.49s, setup 0ms, import 2.93s, tests 60ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ─────────────────────────────────────────────────────╮
│  🦙 Tina Config                                                            │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main │
│  🤖 Auto-generated files                                                   │
│     GraphQL Client:     tina/__generated__/client.ts                       │
│     Typescript Types:   tina/__generated__/types.ts                        │
│     Static HTML file:   public/admin/index.html                           │
╰─────────────────────────────────────────────────────────────────────────────╯
18:06:31 [vite] Re-optimizing dependencies because lockfile has changed
18:06:33 [content] Syncing content
18:06:33 [content] Synced content
18:06:33 [types] Generated 1.48s
18:06:33 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (19 files):
- 0 errors
- 0 warnings
- 0 hints

18:06:40 [content] Syncing content
18:06:40 [content] Synced content
18:06:40 [types] Generated 425ms
18:06:40 [build] output: "static"
18:06:40 [build] mode: "static"
18:06:40 [build] directory: S:\Projetos\academic_page\haroldo\dist\
18:06:40 [build] Collecting build info...
18:06:40 [build] ✓ Completed in 462ms.
18:06:40 [build] Building static entrypoints...
18:06:40 [vite] ✓ built in 396ms
18:06:40 [vite] ✓ built in 47ms
18:06:40 [build] Rearranging server assets...

 generating static routes
18:06:40   ├─ /index.html (+9ms)
18:06:40 ✓ Completed in 21ms.
18:06:40 [build] ✓ Completed in 511ms.
18:06:40 [build] 1 page(s) built in 998ms
18:06:40 [build] Complete!
```

```
$ ls dist/_astro/*.woff2
dist/_astro/archivo-latin-200-normal.-8LHm73D.woff2
dist/_astro/archivo-latin-300-normal.AMs-pvbP.woff2

$ grep -rl "fonts.googleapis\|fonts.gstatic" dist/ --include=*.css --include=*.html
(vazio, exit 1)
```

**Emenda 2026-09-16 (ciclo 1 de correção):** o grep acima é restrito a `.css`/`.html`, recorte do
passo 4 e da regra "no HTML/CSS" do README da fase. Sem esse recorte, `dist/` inteiro (que inclui o
painel `/admin` gerado pelo `tinacms build`, código de terceiro) tem uma ocorrência:

```
$ grep -rlE "fonts.googleapis|fonts.gstatic" dist/; echo "exit=$?"
dist/admin/assets/index-xGzT6BsI.js
exit=0
```

```
$ grep -rlE "fonts.googleapis|fonts.gstatic" dist/ --exclude-dir=admin; echo "exit=$?"
exit=1
```

Ver a emenda ao critério de aceitação da linha 113 acima e a dívida acrescentada em
`plans/fase-3-site-publico/README.md`.

### Passo 5 — Canário do utilitário `text-display-1` (revertido)

```
$ git status --short src/pages/index.astro
(vazio)
```

Editado temporariamente `src/pages/index.astro`: `<h1 class="text-3xl font-semibold">` →
`<h1 class="text-display-1 bg-papel">`.

```
$ npx astro build
18:06:55 [content] Syncing content
18:06:55 [content] Synced content
18:06:55 [types] Generated 432ms
18:06:55 [build] output: "static"
18:06:55 [build] mode: "static"
18:06:55 [build] directory: S:\Projetos\academic_page\haroldo\dist\
18:06:55 [build] Collecting build info...
18:06:55 [build] ✓ Completed in 467ms.
18:06:55 [build] Building static entrypoints...
18:06:55 [vite] ✓ built in 227ms
18:06:55 [vite] ✓ built in 45ms
18:06:55 [build] Rearranging server assets...

 generating static routes
18:06:55   ├─ /index.html (+9ms)
18:06:55 ✓ Completed in 20ms.
18:06:55 [build] ✓ Completed in 365ms.
18:06:55 [build] 1 page(s) built in 852ms
18:06:55 [build] Complete!
```

```
$ grep -o "text-display-1" dist/_astro/*.css
text-display-1

$ grep -o "clamp(2.625rem[^;]*" dist/_astro/*.css
clamp(2.625rem,1.9rem + 3.2vw,5rem)
```

Revertido:

```
$ git checkout -- src/pages/index.astro
$ git status --short src/pages
(vazio)
```

### Passo 6 — Portão completo

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

(exit 0, sem saída)
```

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  18:07:31
   Duration  1.04s (transform 1.61s, setup 0ms, import 2.71s, tests 84ms, environment 1ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )
================================================================================
```

### `git status --short` final (arquivos deste plano)

```
 M package-lock.json
 M package.json
D  plans/fase-3-site-publico/.gitkeep
 M src/styles/global.css
```

### O que NÃO rodou

- Verificação no navegador (`astro preview`, DevTools, larguras 360/768/1440, Tab) — este plano não
  cria rota nova nem componente visível; a identidade visual é conferida rota a rota nos planos 042
  em diante e transversalmente no 053, conforme a tabela "Onde cada item do §12 fecha" do README da
  fase.
- `npm ci` e `npm audit --audit-level=high` — não fazem parte dos passos deste plano; ficam para a
  verificação autoritativa do orquestrador/CI.
- Nenhum plano nem teste novo de `src/lib/` ou `tests/` foi criado — o plano 036 é só tokens de CSS
  e a fonte; não há lógica em TypeScript para testar, logo não há canário de teste unitário a
  reverter (o "canário" deste plano é o utilitário CSS do passo 5, coberto acima).
- Não commitei nada (`Status:` permanece `TODO`; checkboxes não marcadas — ficam para a promoção do
  orquestrador).

### Verificação autoritativa e promoção (orquestrador, 2026-09-16)

**Verificação independente** (`triage-runner`, sobre o working tree revisado, antes do commit;
o relatório veio parcialmente resumido pelo agente — os números abaixo são os que ele transcreveu):
`npm ci` exit 0 sem reescrever o lock; `npm audit --audit-level=high` exit 0 (8 moderadas
pré-existentes); `npm run lint` exit 0; `npm run format:check` → `All matched files use Prettier
code style!`; `npm run test:coverage` → 6 arquivos, 122 testes, cobertura 100% (32/32 statements,
4/4 branches, 2/2 functions, 31/31 lines); `npm run build:pipeline` → `tests/content` 108 testes,
`astro check` `0 errors, 0 warnings, 0 hints`, `Complete!`, nenhuma linha `[ERROR]`.

**Revisão:** reprovada em um ciclo, só por redação do critério de Google Fonts (ver a emenda
acima); CSS conferido linha a linha contra `docs/identidade-visual.md` §2–§4 e §7. A correção
tocou só este plano e o README da fase; o diff de código ficou idêntico ao revisado.
Observações não bloqueantes do revisor, para os planos seguintes: (1) o Tailwind 4 varre os `.md`
versionados de `plans/` e `docs/`, que citam `text-display-1` — o canário do passo 5 cumpre o
critério ao pé da letra, mas "a classe só aparece se alguma página usar" é falso, e canário de CSS
por "a classe está no bundle" não discrimina; (2) o CSS de movimento fica fora de `@layer` e vence
utilitários em cascata (sem conflito hoje; conferir no 043).

**CI sobre o commit empurrado `fb117b6`:**

```
$ gh api repos/researchgroups-ufma/haroldo-page/commits/fb117b6/check-runs --jq '.check_runs[] | "\(.name)\t\(.conclusion)\t\(.details_url)"'
Workers Builds: haroldo-page	success	https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production/builds/b65c0a26-2ce7-440c-92aa-8930c033ab29
qualidade	success	https://github.com/researchgroups-ufma/haroldo-page/actions/runs/35151738105/job/104981447246
```
