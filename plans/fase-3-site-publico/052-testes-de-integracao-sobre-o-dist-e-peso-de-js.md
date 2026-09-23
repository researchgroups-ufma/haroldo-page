# Plano 052 — Testes de integração sobre o `dist/` e peso de JS (§11, RN-01, RNF-02)

**Status:** TODO
**RFs cobertos:** §11 (nível "Integração": rotas geradas, nenhum rascunho publicado), **RN-01**,
**RNF-02**, RF-10, RF-27 (existência de `404.html`), §8.3 (um `<h1>`, `lang`)
**Depende de:** planos 041 (`courseSlug`) e **044–051** (todas as rotas prontas)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um teste Vitest lê o `dist/` recém-gerado e reprova se faltar rota, se um rascunho aparecer em
qualquer HTML, se uma página tiver mais ou menos de um `<h1>`, se houver requisição a fonte de
terceiro, ou se o JavaScript de alguma rota passar de 50 KB comprimido. Ele roda no CI depois do
`build:pipeline`.

## Arquivos afetados

- `tests/dist/site-gerado.test.ts` — novo
- `vitest.dist.config.ts` — novo: config só para `tests/dist/`
- `vitest.config.ts` — `exclude` de `tests/dist/**` na suíte padrão
- `package.json` — script `test:dist`
- `.github/workflows/ci.yml` — passo `npm run test:dist` depois de `npm run build:pipeline`
- `.gitignore` — (autorizado pela orquestração em 2026-09-23 — o padrão `dist/` ignorava `tests/dist/`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** altere o `build:pipeline` (README da fase, decisão 9; ADR-0009).
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Por que config separada.** `vitest.config.ts:6` inclui `tests/**/*.test.ts` e o CI roda
`npm run test:coverage` **antes** do build (`.github/workflows/ci.yml:34` e `:51`). Um teste sobre
`dist/` na suíte padrão falharia no CI por `dist/` não existir. Então:
- `vitest.config.ts`: acrescente `exclude: [...configDefaults.exclude, 'tests/dist/**']`
  (`import { configDefaults } from 'vitest/config'`), com comentário do porquê. **Não** mexa em
  `coverage` nem `thresholds`.
- `vitest.dist.config.ts`: `getViteConfig` como o outro (`astro/config`), `test.include:
  ['tests/dist/**/*.test.ts']`, `environment: 'node'`, sem `coverage`. O `eslint.config.js:48` já dá
  `process` global para `**/*.config.{js,mjs,cjs,ts}` — o nome casa.
- `package.json`: `"test:dist": "vitest run -c vitest.dist.config.ts"`.
- `ci.yml`: novo passo **após** `- run: npm run build:pipeline` (e o `env` dele), com comentário de
  uma linha explicando que depende do `dist/` gerado no passo anterior. **Não** use
  `continue-on-error`.

**O teste lê arquivos, não sobe servidor.** `node:fs`, `node:path`, `node:zlib`, `gray-matter` (já é
`devDependency`; ver como `tests/content/conteudo-valido.test.ts` o usa). Sem dependência nova. Se
`dist/` não existir, o `beforeAll` falha com mensagem "rode `npm run build:pipeline` antes de
`npm run test:dist`".

**Asserções (cada uma um `it` nomeado):**

1. **Rotas fixas existem:** `dist/index.html`, `dist/sobre/index.html`, `dist/pesquisa/index.html`,
   `dist/ensino/index.html`, `dist/publicacoes/index.html`, `dist/404.html`.
2. **Cada disciplina publicada gera página (§11, RF-06):** para cada `content/disciplinas/*.md` com
   `publicado: true`, existe `dist/ensino/<courseSlug(caminho)>/index.html` (`courseSlug` de
   `src/lib/courses.ts`). E o inverso: nenhuma pasta em `dist/ensino/` sem disciplina publicada
   correspondente (**rascunho não gera página**, RF-10).
3. **Nenhum rascunho aparece em HTML algum (RN-01):** para cada arquivo de `content/{linhas-pesquisa,
   projetos,disciplinas,publicacoes}/*.md` com `publicado: false`, o título (`titulo`, ou `nome` em
   disciplinas) **não** aparece em nenhum `.html` de `dist/` — compare contra o título com escape HTML
   (`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`; confira no HTML gerado
   qual escape o Astro usa para aspas e ajuste, registrando) **e** contra o texto cru. Hoje há um:
   `content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`,
   título `[EXEMPLO] Notas sobre geodésicas nulas em métricas estacionárias`. Se um dia não houver
   nenhum rascunho, o teste passa trivialmente — **escreva isso no nome do `it`** para ninguém ler o
   verde como prova.
4. **Um `<h1>` por página e `lang="pt-BR"`** em todo `.html` de `dist/` exceto `dist/admin/**` (o
   painel do Tina, copiado de `public/admin/`, não é do site).
5. **Nenhuma fonte de terceiro:** nenhum `.html` ou `.css` de `dist/` (fora de `admin/`) contém
   `fonts.googleapis.com` nem `fonts.gstatic.com`.
6. **RNF-02 — JS < 50 KB comprimido por rota:** para cada `.html` fora de `admin/`, some o tamanho
   `gzipSync` de (a) cada `<script ... src="/_astro/....js">` referenciado, lido de `dist/`, **mais**
   os módulos que ele importa estaticamente (`import ... from "./x.js"` / `import"./x.js"` no início
   do arquivo — resolva recursivamente, sem contar duas vezes), e (b) o conteúdo de cada `<script>`
   inline. Asserção `< 50 * 1024`. A mensagem de falha nomeia a rota e o total. **Imprima** (com
   `console.log`) a tabela rota → bytes gzip, para a Evidência.
7. **Zero framework de UI (RNF-02):** nenhum JS referenciado pelas rotas do site contém as strings
   `react-dom` ou `__REACT_DEVTOOLS` (o React do painel mora em `dist/admin/`, fora do escopo).

**Conteúdo real e o save do professor.** Todas as asserções são **invariantes** (existência,
ausência, limite) — nenhuma contagem exata de conteúdo (README da fase, decisão 6).

**Falsificabilidade — obrigatória, uma por asserção que muda comportamento.** Cada canário altera
`dist/` (ou uma cópia) **ou** o teste, nunca `content/` nem `src/`, e é revertido com novo build.

## Passos

1. Configs e script (`vitest.config.ts`, `vitest.dist.config.ts`, `package.json`) → verify: `npm run test:coverage` colado mostrando que a contagem de arquivos de teste **não** inclui `tests/dist` (e cobertura ≥ 80%).
2. `tests/dist/site-gerado.test.ts` → verify: `npm run build:pipeline` e depois `npm run test:dist` colados, com a tabela de JS por rota.
3. Canários sobre `dist/` (rebuild ao final): (a) apague `dist/404.html` → asserção 1 vermelha; (b) acrescente o título do rascunho num comentário em `dist/sobre/index.html` → asserção 3 vermelha; (c) duplique o `<h1>` em `dist/pesquisa/index.html` → asserção 4 vermelha; (d) acrescente `<link href="https://fonts.googleapis.com/css2">` em `dist/index.html` → asserção 5 vermelha; (e) acrescente em `dist/index.html` um `<script>` inline de 60 KB de texto aleatório não compressível (gere com `crypto.randomBytes(60000).toString('base64')`) → asserção 6 vermelha; (f) crie `dist/ensino/pasta-fantasma/index.html` → asserção 2 vermelha → verify: as seis saídas vermelhas coladas; `npm run build:pipeline` + `npm run test:dist` finais verdes colados.
4. `ci.yml` → verify: `git diff .github/workflows/ci.yml` colado (gerado por comando, depois da última edição).
5. Portão → verify: `npm run lint`, `npm run format:check` colados.
6. **Orquestrador, na promoção:** o run do CI do commit mostra o passo `npm run test:dist` verde **nominalmente** no log (`gh run view <id> --log | Select-String "test:dist"`) → verify: saída colada com o id do run e `conclusion: success`.

## Critérios de aceitação

- [x] `npm run test:coverage` não roda `tests/dist`; `npm run test:dist` roda só ele
- [x] As sete asserções existem, com nomes que dizem o que provam (inclusive o caso trivial da asserção 3)
- [x] Os seis canários do passo 3 mostrados vermelhos e o estado final verde (+ g e h pedidos pela orquestração)
- [x] Tabela de JS gzip por rota colada, todas < 50 KB
- [x] Passo novo no CI depois do `build:pipeline`, sem `continue-on-error`; `build:pipeline` inalterado
- [ ] CI do commit com `test:dist` visível no log e `conclusion: success`
- [x] `lint` e `format:check` verdes, com saída colada; cabeçalho §10.1 e TSDoc nos arquivos novos

## Evidência

<Preenchido pelo executor (1–5) e pelo orquestrador (6). Declare o que NÃO rodou.>

### Passo 1 — `vitest.config.ts` exclui `tests/dist/**`; `vitest.dist.config.ts` e `package.json` novos/editados

`npm run test:coverage` (a contagem de arquivos de teste é **16**, sem `tests/dist/site-gerado.test.ts` — que já existia no disco neste ponto —, e a cobertura segue em 100%, acima do threshold de 80%):

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  16 passed (16)
      Tests  263 passed (263)
   Start at  13:23:23
   Duration  2.02s (transform 5.81s, setup 0ms, import 9.75s, tests 345ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |                   
 src/lib           |     100 |    99.09 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 248/248 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 67/67 )
Lines        : 100% ( 224/224 )
================================================================================
```

### Passo 2 — `tests/dist/site-gerado.test.ts`: `build:pipeline` + `test:dist`

`npm run build:pipeline` (0 errors, 0 warnings, 0 hints no `astro check`; `Complete!` no `astro build`):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:23:32
   Duration  1.24s (transform 1.92s, setup 0ms, import 3.21s, tests 69ms, environment 0ms)

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
[2m13:24:04[22m [34m[content][39m Syncing content
[2m13:24:04[22m [34m[content][39m Synced content
[2m13:24:04[22m [34m[types][39m Generated [2m537ms[22m
[2m13:24:04[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (60 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:24:13[22m [34m[content][39m Syncing content
[2m13:24:13[22m [34m[content][39m Synced content
[2m13:24:13[22m [34m[types][39m Generated [2m493ms[22m
[2m13:24:13[22m [34m[build][39m output: [34m"static"[39m
[2m13:24:13[22m [34m[build][39m mode: [34m"static"[39m
[2m13:24:13[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:24:13[22m [34m[build][39m Collecting build info...
[2m13:24:13[22m [34m[build][39m [32m✓ Completed in 534ms.[39m
[2m13:24:13[22m [34m[build][39m Building static entrypoints...
[2m13:24:14[22m [34m[vite][39m [32m✓ built in 383ms[39m
[2m13:24:14[22m [34m[vite][39m [32m✓ built in 62ms[39m
[2m13:24:14[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:24:14[22m   [34m├─[39m [2m/404.html[22m [2m(+14ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+4ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+90ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+6ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+7ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+5ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m13:24:14[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m13:24:14[22m [32m✓ Completed in 163ms.
[39m
[2m13:24:14[22m [34m[build][39m [32m✓ Completed in 678ms.[39m
[2m13:24:14[22m [34m[build][39m 8 page(s) built in [1m1.27s[22m
[2m13:24:14[22m [34m[build][39m [1mComplete![22m
```

`npm run test:dist -- --reporter=verbose` (as nove asserções verdes, com a tabela rota → bytes gzip de JS — todas as 8 rotas do site muito abaixo do limite de 50 KB; hoje o site não referencia nenhum `<script src="/_astro/....js">`, só `<script type="module">` inline, então o total por rota é só o inline):

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 259 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 1ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 5ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 7ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 6ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 4ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  13:24:23
   Duration  276ms (transform 59ms, setup 0ms, import 118ms, tests 29ms, environment 0ms)
```

### Passo 3 — Seis canários sobre `dist/` (nunca `content/` nem `src/`), rebuild ao final

Canários, todos editando `dist/` diretamente (não versionado — revertido por rebuild, não por `git checkout`):

- (a) apagado `dist/404.html` → esperada asserção 1 vermelha
- (b) acrescentado `<!-- [EXEMPLO] Notas sobre geodésicas nulas em métricas estacionárias -->` antes de `</body>` em `dist/sobre/index.html` → esperada asserção 3 vermelha
- (c) duplicado o `<h1>` de `dist/pesquisa/index.html` (mesmo elemento reinserido antes de `</body>`) → esperada asserção 4 vermelha
- (d) acrescentado `<link href="https://fonts.googleapis.com/css2">` antes de `</head>` em `dist/index.html` → esperada asserção 5 vermelha
- (e) acrescentado `<script>` inline de 60 000 bytes de base64 aleatório (`crypto.randomBytes(60000).toString('base64')`, não compressível) em `dist/index.html` → esperada asserção 6 vermelha
- (f) criado `dist/ensino/pasta-fantasma/index.html` sem disciplina correspondente em `content/` → esperada asserção 2 (inversa) vermelha

`npm run test:dist -- --reporter=verbose` com os seis canários aplicados — **6 de 9 testes vermelhos**, um por asserção afetada, as três restantes (existência por disciplina, `lang`, zero framework) inalteradas e continuam verdes:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /ensino/pasta-fantasma/index.html → 0 bytes
  /index.html → 60554 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 × tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 6ms
   → esperava dist/404.html: expected false to be true // Object.is equality
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 × tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 1ms
   → dist/ensino/pasta-fantasma/ não corresponde a nenhuma disciplina publicada: expected false to be true // Object.is equality
 × tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 1ms
   → título do rascunho "[EXEMPLO] Notas sobre geodésicas nulas em métricas estacionárias" (S:\Projetos\academic_page\haroldo\content\publicacoes\2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md) aparece em S:\Projetos\academic_page\haroldo\dist\sobre\index.html: expected true to be false // Object.is equality
 × tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
   → S:\Projetos\academic_page\haroldo\dist\pesquisa\index.html tem 2 <h1>, esperado 1: expected 2 to be 1 // Object.is equality
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 5ms
 × tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 4ms
   → S:\Projetos\academic_page\haroldo\dist\index.html referencia fonts.googleapis.com: expected true to be false // Object.is equality
 × tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 8ms
   → rota /index.html tem 60554 bytes gzip de JS, limite 51200: expected 60554 to be less than 51200
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem
AssertionError: esperava dist/404.html: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/dist/site-gerado.test.ts:103:72
    101|     ];
    102|     for (const rota of rotasFixas) {
    103|       expect(existsSync(join(distDir, rota)), `esperava dist/${rota}`)…
       |                                                                        ^
    104|     }
    105|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página)
AssertionError: dist/ensino/pasta-fantasma/ não corresponde a nenhuma disciplina publicada: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/dist/site-gerado.test.ts:130:113
    128|       .map((entry) => entry.name);
    129|     for (const pasta of pastas) {
    130|       expect(slugsEsperados.has(pasta), `dist/ensino/${pasta}/ não cor…
       |                                                                                                                 ^
    131|         true,
    132|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado)
AssertionError: título do rascunho "[EXEMPLO] Notas sobre geodésicas nulas em métricas estacionárias" (S:\Projetos\academic_page\haroldo\content\publicacoes\2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md) aparece em S:\Projetos\academic_page\haroldo\dist\sobre\index.html: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/dist/site-gerado.test.ts:169:13
    167|             apareceCru || apareceEscapado,
    168|             `título do rascunho "${titulo}" (${arquivo}) aparece em ${…
    169|           ).toBe(false);
       |             ^
    170|         });
    171|       }
 ❯ tests/dist/site-gerado.test.ts:162:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1>
AssertionError: S:\Projetos\academic_page\haroldo\dist\pesquisa\index.html tem 2 <h1>, esperado 1: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ tests/dist/site-gerado.test.ts:183:66
    181|       const conteudo = readFileSync(file, 'utf-8');
    182|       const h1Count = (conteudo.match(/<h1[\s>]/g) ?? []).length;
    183|       expect(h1Count, `${file} tem ${h1Count} <h1>, esperado 1`).toBe(…
       |                                                                  ^
    184|     }
    185|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com
AssertionError: S:\Projetos\academic_page\haroldo\dist\index.html referencia fonts.googleapis.com: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/dist/site-gerado.test.ts:200:100
    198|     for (const file of arquivos) {
    199|       const conteudo = readFileSync(file, 'utf-8');
    200|       expect(conteudo.includes('fonts.googleapis.com'), `${file} refer…
       |                                                                                                    ^
    201|         false,
    202|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
AssertionError: rota /index.html tem 60554 bytes gzip de JS, limite 51200: expected 60554 to be less than 51200
 ❯ tests/dist/site-gerado.test.ts:277:91
    275|     }
    276|     for (const { rota, bytes } of tabela) {
    277|       expect(bytes, `rota ${rota} tem ${bytes} bytes gzip de JS, limit…
       |                                                                                           ^
    278|         LIMITE_BYTES,
    279|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 3 passed (9)
   Start at  13:20:35
   Duration  305ms (transform 59ms, setup 0ms, import 119ms, tests 37ms, environment 0ms)
```

Canários revertidos: `rm -rf dist/ensino/pasta-fantasma` seguido de novo `npm run build:pipeline` — o rebuild completo substitui `dist/404.html`, `dist/sobre/index.html`, `dist/pesquisa/index.html` e `dist/index.html` pelas versões geradas do zero a partir de `content/`/`src/`, sem o comentário, o `<h1>` duplicado, o `<link>` de fonte nem o `<script>` de 60 KB. `git status --short` confirma que nenhum canário tocou `content/` nem `src/` (`dist/` não é rastreado pelo Git — ver "O que NÃO rodei" abaixo sobre a armadilha achada em `.gitignore`).

Estado final, depois do rebuild — **mesmos dois blocos do Passo 2** (`build:pipeline` limpo e `test:dist` com as nove asserções verdes): a última execução de `npm run build:pipeline` e de `npm run test:dist` nesta sessão já é, ela mesma, o "estado final verde" pedido pelo passo 3 — não há uma terceira captura porque o Passo 2 foi recapturado *depois* da reversão dos canários e da correção do Passo 5 (ver abaixo), para o bloco colado descrever o estado final dos arquivos, como a regra 7 do despacho exige. Reafirmando: os dois blocos do Passo 2 acima **são** a evidência de "`build:pipeline` + `test:dist` finais verdes" deste passo.

### Passo 4 — `.github/workflows/ci.yml`

`git diff .github/workflows/ci.yml` (gerado por comando, depois da última edição):

```diff
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index c430019..1b464a2 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -52,3 +52,5 @@ jobs:
         env:
           TINA_CLIENT_ID: ${{ secrets.TINA_CLIENT_ID }}
           TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
+      # tests/dist/**: lê o dist/ recém-gerado pelo build:pipeline acima (plano 052, §11)
+      - run: npm run test:dist
```

### Passo 5 — Portão: `lint` e `format:check`

Achado durante este passo: a primeira versão de `vitest.config.ts` mantinha `/// <reference types="vitest/config" />` **e** acrescentava `import { configDefaults } from 'vitest/config'` — as duas coisas para o mesmo módulo disparam `@typescript-eslint/triple-slash-reference` (regra "prefer-import" quando existe um import ES6 do mesmo módulo). Corrigido removendo a referência de tripla barra (o import cobre a mesma tipagem). `npm run build:pipeline` recapturado no Passo 2 depois da correção confirma `0 errors, 0 warnings, 0 hints`.

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check`:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### O que eu NÃO rodei

- **Passo 6 (orquestrador):** não rodei o CI do commit — não existe commit; `Status:` fica `TODO` e eu não commito (regra 3 do despacho). O checkbox correspondente do critério de aceitação fica vazio.
- Não rodei `npm ci`, `npm audit` nem o navegador — fora do escopo deste plano (não há rota nova nem UI).

### Achado bloqueante — `.gitignore` também ignora `tests/dist/`

`.gitignore:5` tem `dist/` sem barra inicial, então o padrão casa **qualquer** diretório chamado `dist` em qualquer profundidade — inclusive `tests/dist/`. Confirmado com `git status`/`git add`:

```
$ git status --short
 M .github/workflows/ci.yml
 M package.json
 M vitest.config.ts
?? vitest.dist.config.ts

$ git add tests/dist/site-gerado.test.ts
The following paths are ignored by one of your .gitignore files:
tests/dist
hint: Use -f if you really want to add them.
```

`tests/dist/site-gerado.test.ts` **não aparece** no `git status` e não pode ser adicionado sem `-f`. `.gitignore` não está em "Arquivos afetados" deste plano — não o toquei. Isto bloqueia a promoção: sem corrigir o padrão (ex.: ancorar para `/dist/`), o arquivo de teste nunca entra no commit. Reportado ao orquestrador para decisão — não é ambiguidade que eu deva resolver sozinho ampliando o escopo do plano.

### Orquestração, 2026-09-23 — `.gitignore` corrigido; canários (g) e (h)

O orquestrador confirmou o bloqueio (`git check-ignore -v` → `.gitignore:5:dist/`) e autorizou tocar **só a linha 5** de `.gitignore`: `dist/` → `/dist/`, ancorando o padrão na raiz, com uma frase a mais no comentário explicando o motivo. `.gitignore` foi acrescentado a "Arquivos afetados" com a nota de autorização.

`git check-ignore -v tests/dist/site-gerado.test.ts` (esperado: saída vazia, `exit 1` — deixou de ser ignorado):

```
exit=1
```

`git check-ignore -v dist/index.html` (esperado: continua casando, `exit 0` — o `dist/` da raiz segue ignorado):

```
.gitignore:6:/dist/	dist/index.html
exit=0
```

`git status --short` depois da correção — `tests/dist/` passou a aparecer como não rastreado:

```
$ git status --short
 M .github/workflows/ci.yml
 M .gitignore
 M package.json
 M plans/fase-3-site-publico/052-testes-de-integracao-sobre-o-dist-e-peso-de-js.md
 M vitest.config.ts
?? tests/dist/
?? vitest.dist.config.ts
```

**Canário (g) — asserção 6, import estático recursivo seguido de verdade.** Criado `dist/_astro/canario-a.js` com só `import"./canario-b.js";` e `dist/_astro/canario-b.js` com ~60 KB de base64 aleatório num comentário; acrescentado `<script type="module" src="/_astro/canario-a.js"></script>` em `dist/index.html`. Sem seguir o import estático o teste passaria (o arquivo referenciado diretamente é pequeno); com a resolução recursiva implementada, o total da rota `/index.html` soma os dois arquivos e estoura o limite.

**Canário (h) — asserção 7, zero framework de UI.** Criado `dist/_astro/canario-react.js` contendo a string `react-dom`; acrescentado `<script type="module" src="/_astro/canario-react.js"></script>` em `dist/sobre/index.html`.

`npm run test:dist -- --reporter=verbose` com os dois canários aplicados — **2 de 9 testes vermelhos**, exatamente as asserções 6 e 7, as outras sete inalteradas e continuam verdes:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 60584 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 327 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 1ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 5ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 4ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 6ms
 × tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 11ms
   → rota /index.html tem 60584 bytes gzip de JS, limite 51200: expected 60584 to be less than 51200
 × tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 7ms
   → S:\Projetos\academic_page\haroldo\dist\sobre\index.html referencia react-dom: expected true to be false // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
AssertionError: rota /index.html tem 60584 bytes gzip de JS, limite 51200: expected 60584 to be less than 51200
 ❯ tests/dist/site-gerado.test.ts:277:91
    275|     }
    276|     for (const { rota, bytes } of tabela) {
    277|       expect(bytes, `rota ${rota} tem ${bytes} bytes gzip de JS, limit…
       |                                                                                           ^
    278|         LIMITE_BYTES,
    279|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/)
AssertionError: S:\Projetos\academic_page\haroldo\dist\sobre\index.html referencia react-dom: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/dist/site-gerado.test.ts:312:78
    310|         }
    311|         for (const body of bodies) {
    312|           expect(body.includes('react-dom'), `${file} referencia react…
       |                                                                              ^
    313|           expect(body.includes('__REACT_DEVTOOLS'), `${file} referenci…
    314|         }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 7 passed (9)
   Start at  13:28:37
   Duration  344ms (transform 54ms, setup 0ms, import 119ms, tests 38ms, environment 0ms)
```

Canários revertidos: apagados `dist/_astro/canario-a.js`, `dist/_astro/canario-b.js` e `dist/_astro/canario-react.js`, seguido de novo `npm run build:pipeline` (0 errors, 0 warnings, 0 hints; `Complete!`), que regenera `dist/index.html` e `dist/sobre/index.html` do zero, sem os `<script>` acrescentados:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:28:45
   Duration  1.20s (transform 1.89s, setup 0ms, import 3.13s, tests 83ms, environment 0ms)

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
[2m13:29:18[22m [34m[content][39m Syncing content
[2m13:29:18[22m [34m[content][39m Synced content
[2m13:29:18[22m [34m[types][39m Generated [2m533ms[22m
[2m13:29:18[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (60 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:29:28[22m [34m[content][39m Syncing content
[2m13:29:28[22m [34m[content][39m Synced content
[2m13:29:28[22m [34m[types][39m Generated [2m495ms[22m
[2m13:29:28[22m [34m[build][39m output: [34m"static"[39m
[2m13:29:28[22m [34m[build][39m mode: [34m"static"[39m
[2m13:29:28[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:29:28[22m [34m[build][39m Collecting build info...
[2m13:29:28[22m [34m[build][39m [32m✓ Completed in 537ms.[39m
[2m13:29:28[22m [34m[build][39m Building static entrypoints...
[2m13:29:29[22m [34m[vite][39m [32m✓ built in 369ms[39m
[2m13:29:29[22m [34m[vite][39m [32m✓ built in 61ms[39m
[2m13:29:29[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:29:29[22m   [34m├─[39m [2m/404.html[22m [2m(+11ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+4ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+91ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+5ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+7ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+5ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m13:29:29[22m   [34m├─[39m [2m/index.html[22m [2m(+4ms)[22m 
[2m13:29:29[22m [32m✓ Completed in 159ms.
[39m
[2m13:29:29[22m [34m[build][39m [32m✓ Completed in 662ms.[39m
[2m13:29:29[22m [34m[build][39m 8 page(s) built in [1m1.22s[22m
[2m13:29:29[22m [34m[build][39m [1mComplete![22m
```

`npm run test:dist -- --reporter=verbose` final, depois do rebuild — as nove asserções verdes de novo, tabela de JS por rota igual à do Passo 2 (nenhum resíduo dos canários g/h):

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 259 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 1ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 4ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 6ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 7ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 4ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  13:29:37
   Duration  285ms (transform 58ms, setup 0ms, import 118ms, tests 30ms, environment 0ms)
```

`git status --short` e `git diff --stat -- content/ src/` confirmam que nada em `content/` ou `src/` foi tocado pelos canários g/h:

```
$ git status --short
 M .github/workflows/ci.yml
 M .gitignore
 M package.json
 M plans/fase-3-site-publico/052-testes-de-integracao-sobre-o-dist-e-peso-de-js.md
 M vitest.config.ts
?? tests/dist/
?? vitest.dist.config.ts

$ git diff --stat -- content/ src/
(vazio)
```

#### Verificador de fidelidade (rodado de novo, com os blocos novos)

```
OK  passo1-test-coverage.txt
OK  passo2-build-pipeline.txt
OK  passo2-test-dist.txt
OK  passo3-canarios-vermelho.txt
OK  passo4-git-diff-ci.txt
OK  passo5-lint.txt
OK  passo5-format.txt
OK  passo6-check-ignore-tests-dist.txt
OK  passo6-check-ignore-dist-index.txt
OK  passo6-canarios-gh-vermelho.txt
OK  passo6-build-pipeline-final.txt
OK  passo6-test-dist-final-verde.txt
```

Nota (ciclo 2): os arquivos `passo6-*` acima foram renomeados no ciclo 2 para `orq-check-ignore-*` /
`orq-ciclo1-*`, com conteúdo idêntico — ver a lista completa no "Verificador de fidelidade (ciclo 2)".

## Ciclo 2 — correções pedidas pela revisão

A revisão do ciclo 1 reprovou dois obrigatórios sobre `tests/dist/site-gerado.test.ts` (chave do
`visited` em dois formatos de caminho, contando o mesmo módulo duas vezes; travessia de
`<script>` reimplementada em duas funções) e um terceiro (`src`/import que não resolve contava
`0` em silêncio, em vez de reprovar nomeando a rota e o caminho). Correções, só dentro de "Arquivos
afetados":

- `tests/dist/site-gerado.test.ts`: as duas funções (`gzipSizeWithStaticImports` +
  `routeJsGzipBytes`, e a travessia duplicada dentro do `it` da asserção 7) foram substituídas por
  uma função única, `routeScriptFiles(routeHtmlPath, htmlContent)`, que devolve
  `{ externos: string[], inlines: string[] }`. A chave de deduplicação do `visited` passou a ser
  `resolve()` de `node:path` nos dois casos (`<script src>` e specifier de import), em vez de
  `join` (win32) num lugar e `posix.normalize(posix.join(...))` no outro. Um `src`/import que não
  resolve para arquivo existente agora lança um `Error` nomeando a rota e o caminho resolvido, em
  vez de `return 0`. Acrescentado um comentário dizendo que imports dentro de `<script>` inline e
  specifiers absolutos não são seguidos — o Vite só emite import relativo entre chunks de
  `dist/_astro/`.
- `.github/workflows/ci.yml`: o comentário do passo novo ficou sem acento, como o resto do arquivo
  (`lê` → `le`, `recém` → `recem`).

### Por que `npm run test:dist` local usa `-- --reporter=verbose`

O Vitest 4.1.11 detecta variáveis de ambiente de agente de IA (`CLAUDECODE`, `AI_AGENT`, via
`std-env`) e troca automaticamente para o reporter `agent`, que roda com
`silent: "passed-only"` — descarta o `console.log` de todo teste que passa, inclusive a tabela
rota → bytes gzip da asserção 6. `--reporter=verbose` força o reporter humano de volta, que sempre
imprime o `console.log`. No CI (`.github/workflows/ci.yml`) essas variáveis não existem, então
`npm run test:dist` sem flag nenhuma já sai com a tabela — o passo do CI não precisa do
`--reporter=verbose`.

### `npm run build:pipeline` (ciclo 2, antes dos canários) — 0 errors, 0 warnings, 0 hints

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:39:36
   Duration  1.15s (transform 1.85s, setup 0ms, import 3.01s, tests 71ms, environment 0ms)

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
[2m13:40:13[22m [34m[content][39m Syncing content
[2m13:40:13[22m [34m[content][39m Synced content
[2m13:40:13[22m [34m[types][39m Generated [2m552ms[22m
[2m13:40:13[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (60 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:40:23[22m [34m[content][39m Syncing content
[2m13:40:23[22m [34m[content][39m Synced content
[2m13:40:23[22m [34m[types][39m Generated [2m574ms[22m
[2m13:40:23[22m [34m[build][39m output: [34m"static"[39m
[2m13:40:23[22m [34m[build][39m mode: [34m"static"[39m
[2m13:40:23[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:40:23[22m [34m[build][39m Collecting build info...
[2m13:40:23[22m [34m[build][39m [32m✓ Completed in 617ms.[39m
[2m13:40:23[22m [34m[build][39m Building static entrypoints...
[2m13:40:23[22m [34m[vite][39m [32m✓ built in 408ms[39m
[2m13:40:23[22m [34m[vite][39m [32m✓ built in 59ms[39m
[2m13:40:23[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:40:23[22m   [34m├─[39m [2m/404.html[22m [2m(+15ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+4ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+110ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+6ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+6ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+6ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+6ms)[22m 
[2m13:40:23[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m13:40:23[22m [32m✓ Completed in 187ms.
[39m
[2m13:40:23[22m [34m[build][39m [32m✓ Completed in 723ms.[39m
[2m13:40:23[22m [34m[build][39m 8 page(s) built in [1m1.36s[22m
[2m13:40:23[22m [34m[build][39m [1mComplete![22m
```

### `npm run test:dist -- --reporter=verbose` (ciclo 2, baseline depois da correção) — nove verdes, mesma tabela de antes

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 259 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 1ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 5ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 7ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 6ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 6ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  13:40:34
   Duration  294ms (transform 59ms, setup 0ms, import 119ms, tests 33ms, environment 0ms)
```

### Canário (i) — asserção 6, prova de que o módulo importado é contado UMA vez

Em `dist/index.html`, dois `<script type="module" src>`: um para `dist/_astro/canario-x.js`
(conteúdo: só `import"./canario-y.js";`) e outro **direto** para `dist/_astro/canario-y.js`
(~20 KB de base64 aleatório, não compressível). Sem deduplicação por chave única, `canario-y.js`
seria somado duas vezes — uma pelo `<script src>` direto, outra pelo import de `canario-x.js`.

Tamanhos esperados, calculados por um script Node à parte (`canario-i-expected.mjs`, não é o teste
real — só confere a conta):

```
baseline (dist/index.html sem canário, tabela do build atual) = 259 bytes
gzip(dist/_astro/canario-x.js) = 60 bytes
gzip(dist/_astro/canario-y.js) = 20125 bytes
esperado = baseline + gzip(x) + gzip(y), y contado UMA vez = 20444 bytes
```

`npm run test:dist -- --reporter=verbose` com o canário (i) aplicado — **todas as nove asserções
continuam verdes** (o canário não estoura o limite de 50 KB de propósito, para poder mostrar o
número exato na tabela em vez de só "vermelho"); a linha de `/index.html` na tabela bate,
byte a byte, com o "esperado" acima (`20444`), confirmando que `canario-y.js` foi contado **uma**
vez:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 20444 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 2ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 1ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 5ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 6ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 8ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 9ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 6ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  13:42:07
   Duration  323ms (transform 54ms, setup 0ms, import 122ms, tests 41ms, environment 0ms)
```

**Contraprova — reconstrução parcial, sem o ramo inline, da lógica do ciclo 1
(`canario-i-versao-antiga.mjs`, não é código do projeto, só documenta o defeito), rodada sobre o
mesmo `dist/index.html` do canário (i):** soma `canario-y.js` duas vezes, porque a chave de
`<script src>` (`join`, formato win32) e a do import (`posix.normalize(posix.join(...))`, formato
posix) nunca colidem no mesmo `Set`:

```
Total (lógica do ciclo 1, com o mesmo dist/index.html do canário i) = 40310 bytes
Total correto (lógica do ciclo 2, medido por npm run test:dist) = 20444 bytes
CONFIRMADO: a lógica antiga soma canario-y.js mais de uma vez (contagem dupla)
```

`40310 = 60 (gzip de canario-x.js) + 2 × 20125 (gzip de canario-y.js, contado duas vezes)` — sem o
termo de baseline/inline: `routeJsGzipBytesOld`, na reconstrução, omite o ramo
`else if (inlineBody.trim() !== '')` que o `routeJsGzipBytes` do ciclo 1 tinha, então não soma os
259 bytes de `<script>` inline de `dist/index.html`. Por isso a diferença entre a lógica antiga
(`40310`) e a corrigida (`20444`) não é só o gzip de `canario-y.js` somado a mais: é
`19866 = 20125 − 259` — o `canario-y.js` contado a mais, menos o inline que a reconstrução não soma.

### Canário (j) — asserções 6 e 7, `src` que não resolve reprova nomeando a rota e o caminho

Acrescentado `<script type="module" src="/_astro/nao-existe.js"></script>` em `dist/index.html`
(com o canário (i) ainda presente). `npm run test:dist -- --reporter=verbose` — as duas asserções
que usam `routeScriptFiles` (6 e 7) ficam vermelhas com a mesma mensagem, nomeando a rota
(`/index.html`) e o caminho absoluto resolvido; as outras sete continuam verdes:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 1ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 5ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 5ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 7ms
 × tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 8ms
   → /index.html: script referenciado não existe em dist/ — caminho resolvido "S:\Projetos\academic_page\haroldo\dist\_astro\nao-existe.js"
 × tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 4ms
   → /index.html: script referenciado não existe em dist/ — caminho resolvido "S:\Projetos\academic_page\haroldo\dist\_astro\nao-existe.js"

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Error: /index.html: script referenciado não existe em dist/ — caminho resolvido "S:\Projetos\academic_page\haroldo\dist\_astro\nao-existe.js"
 ❯ collect tests/dist/site-gerado.test.ts:259:13
    257|     visited.add(key);
    258|     if (!existsSync(key)) {
    259|       throw new Error(
       |             ^
    260|         `${routeLabel(routeHtmlPath)}: script referenciado não existe …
    261|       );
 ❯ routeScriptFiles tests/dist/site-gerado.test.ts:280:7
 ❯ tests/dist/site-gerado.test.ts:297:37

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/)
Error: /index.html: script referenciado não existe em dist/ — caminho resolvido "S:\Projetos\academic_page\haroldo\dist\_astro\nao-existe.js"
 ❯ collect tests/dist/site-gerado.test.ts:259:13
    257|     visited.add(key);
    258|     if (!existsSync(key)) {
    259|       throw new Error(
       |             ^
    260|         `${routeLabel(routeHtmlPath)}: script referenciado não existe …
    261|       );
 ❯ routeScriptFiles tests/dist/site-gerado.test.ts:280:7
 ❯ tests/dist/site-gerado.test.ts:317:37

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 7 passed (9)
   Start at  13:42:49
   Duration  301ms (transform 53ms, setup 0ms, import 118ms, tests 35ms, environment 0ms)
```

### Reversão e estado final

Apagados `dist/_astro/canario-x.js` e `dist/_astro/canario-y.js` (o `<script>` para
`nao-existe.js` nunca criou arquivo — não havia o que apagar), seguido de novo
`npm run build:pipeline` (0 errors, 0 warnings, 0 hints; `Complete!`; `dist/_astro/` sem nenhum
`canario-*` depois do rebuild, confirmado com `ls`):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:42:57
   Duration  1.30s (transform 2.03s, setup 0ms, import 3.37s, tests 77ms, environment 1ms)

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
[2m13:43:34[22m [34m[content][39m Syncing content
[2m13:43:34[22m [34m[content][39m Synced content
[2m13:43:34[22m [34m[types][39m Generated [2m493ms[22m
[2m13:43:34[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (60 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:43:43[22m [34m[content][39m Syncing content
[2m13:43:43[22m [34m[content][39m Synced content
[2m13:43:43[22m [34m[types][39m Generated [2m521ms[22m
[2m13:43:43[22m [34m[build][39m output: [34m"static"[39m
[2m13:43:43[22m [34m[build][39m mode: [34m"static"[39m
[2m13:43:43[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:43:43[22m [34m[build][39m Collecting build info...
[2m13:43:43[22m [34m[build][39m [32m✓ Completed in 563ms.[39m
[2m13:43:43[22m [34m[build][39m Building static entrypoints...
[2m13:43:44[22m [34m[vite][39m [32m✓ built in 386ms[39m
[2m13:43:44[22m [34m[vite][39m [32m✓ built in 58ms[39m
[2m13:43:44[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:43:44[22m   [34m├─[39m [2m/404.html[22m [2m(+13ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+88ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+5ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+5ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+6ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m13:43:44[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m13:43:44[22m [32m✓ Completed in 154ms.
[39m
[2m13:43:44[22m [34m[build][39m [32m✓ Completed in 661ms.[39m
[2m13:43:44[22m [34m[build][39m 8 page(s) built in [1m1.24s[22m
[2m13:43:44[22m [34m[build][39m [1mComplete![22m
```

`npm run test:dist -- --reporter=verbose` final — nove verdes, tabela igual à do baseline:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 259 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 2ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 1ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 6ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 6ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 7ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 4ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  13:43:55
   Duration  277ms (transform 51ms, setup 0ms, import 108ms, tests 33ms, environment 0ms)
```

### Portão — `lint` e `format:check` (ciclo 2, depois de todas as edições, inclusive `ci.yml`)

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check`:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`git diff .github/workflows/ci.yml` (comentário sem acento):

```diff
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index c430019..968aa6e 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -52,3 +52,5 @@ jobs:
         env:
           TINA_CLIENT_ID: ${{ secrets.TINA_CLIENT_ID }}
           TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
+      # tests/dist/**: le o dist/ recem-gerado pelo build:pipeline acima (plano 052, §11)
+      - run: npm run test:dist
```

### Verificador de fidelidade (ciclo 2)

Substituído pela saída real de `node verify-fidelity3.mjs` (ciclo 3 da revisão: a lista antiga
tinha 11 linhas, cobrindo só os blocos do ciclo 2; esta cobre os 23 blocos do plano inteiro,
ciclo 1 + ciclo 2, e foi a última edição feita neste arquivo):

```
OK  passo1-test-coverage.txt
OK  passo2-build-pipeline.txt
OK  passo2-test-dist.txt
OK  passo3-canarios-vermelho.txt
OK  passo4-git-diff-ci.txt
OK  passo5-lint.txt
OK  passo5-format.txt
OK  orq-check-ignore-tests-dist.txt
OK  orq-check-ignore-dist-index.txt
OK  orq-ciclo1-canarios-gh-vermelho.txt
OK  orq-ciclo1-build-pipeline-final.txt
OK  orq-ciclo1-test-dist-final-verde.txt
OK  orq2-build-pipeline.txt
OK  orq2-test-dist-baseline.txt
OK  orq2-canario-i-esperado.txt
OK  orq2-canario-i.txt
OK  orq2-canario-i-versao-antiga.txt
OK  orq2-canario-j-vermelho.txt
OK  orq2-build-pipeline-final.txt
OK  orq2-test-dist-final-verde.txt
OK  orq2-lint.txt
OK  orq2-format.txt
OK  orq2-git-diff-ci.txt

TODOS OS BLOCOS OK
```

### O que eu NÃO rodei (ciclo 2)

- O mesmo do ciclo 1: CI do commit (não existe commit), `npm ci`, `npm audit`, navegador — fora do
  escopo deste plano.


