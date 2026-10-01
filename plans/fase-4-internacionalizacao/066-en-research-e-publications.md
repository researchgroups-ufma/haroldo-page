# Plano 066 — `/en/research/` e `/en/publications/`

**Status:** DONE
**RFs cobertos:** **RF-28**, RF-22, RF-13, RF-25, RN-01, RN-02, RN-06, RN-07, **F-07**, RF-26; sabatina fase 4, Decisões 4, 6, 13 e 15
**Depende de:** planos 065 (aviso, `LangText`, testes de `dist` por idioma), 063 (`ResearchView`, `ProjectItem`), 064 (`PublicationsView`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 8)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existem `/en/research/` e `/en/publications/`, com interface em inglês, conteúdo resolvido campo a
campo e o aviso único quando algo caiu no português. As rotas PT não mudam.

## Arquivos afetados

- `src/pages/en/research.astro`, `src/pages/en/publications.astro` — novos (páginas finas)
- `src/views/ResearchView.astro` — `localize` em `titulo`/`resumo`/`corpo` das linhas e o aviso
- `src/components/ProjectItem.astro` — `localize` em `titulo`/`descricao`; `portugueseOnly` em `financiador`/`colaboradores` (Decisão 13)
- `src/views/PublicationsView.astro` — só a interface por idioma; **sem** aviso (nenhum campo exibido é "T" nem "P")
- `tests/dist/site-gerado.test.ts` — rotas EN novas; rascunho ausente também em `/en`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Canário em `content/` autorizado só em
> `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`** (passo 5), revertido por
> `git checkout --`.

> **Emenda de 2026-10-01:** (1) além do arquivo acima, o orquestrador autorizou canários em
> `content/linhas-pesquisa/*.md` e `content/projetos/*.md` (passo 5 e canário 5b), revertidos por
> `git checkout -- content/`. (2) A frase do passo 5 "Que campo 'P' não liga o aviso já está provado
> ... pelos canários (c)/(d) do 065" envelheceu: o (d) saiu do 065 e o (c) dá aviso 0 por construção
> (Decisão 16: a Sobre EN não mostra o aviso). O canário 5b, numa página que **mostra** o aviso (a
> Pesquisa EN), substitui essa prova. O corpo do plano não foi reescrito.

## Contexto necessário

**Padrão do 065** (leia `plans/fase-4-internacionalizacao/065-en-home-e-about-com-aviso.md`, "Contexto
necessário"): `localize`/`localizeOptional` para campo "T" e `portugueseOnly` para campo "P" (061), `lang` direto no elemento de bloco, `LangText` para
texto em linha, `FallbackNotice` com `show = hasFallback([...])` como primeiro filho do conteúdo, e o
HTML PT idêntico provado pelo comparador com `--ignorar '^en/'`.

**Campos** (tabela "Classificação dos campos exibidos em `/en`" do README da fase):
- Linhas de pesquisa: `titulo`, `resumo`, `corpo` → `line.data.en?.x` (T). **Conteúdo real:**
  `content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md` tem só
  `en.titulo` — é o único caso real de tradução parcial da fase: título em inglês sem `lang`, `resumo`
  e `corpo` em português com `lang="pt-BR"`. A outra linha não tem `en`.
- Projetos: `titulo`, `descricao` (T); `periodo` (F); `financiador`, `colaboradores` (P: `lang="pt-BR"` em `/en`, **sem** aviso — Decisão 13). Status
  (`t.research.status`) é dicionário. Nenhum projeto tem `en` hoje.
- Publicações: o único campo traduzível, `resumo`, **não é exibido** (§6.6 da identidade; Decisão 15:
  a página fica só com título, ano, autores, veículo e links). `titulo` e
  `veiculo` são "F" pela exceção da Decisão 13 (em geral já estão em inglês); `autores`, `ano`, `doi`,
  `arxiv`, `pdf_url` são factuais (RN-07). **Portanto `/en/publications/` não tem aviso nem
  `lang="pt-BR"` no `<main>`** — é o comportamento esperado, e o `PublicationItem.astro` não muda. Ordem e
  agrupamento (RN-02) não mudam por idioma (`groupByYear`, `compareWithinYear` em `pt-BR`).
- Âncoras (`id` das linhas, `ano-2026`) continuam iguais nos dois idiomas; não são texto visível.

**RN-01 em `/en`:** existe publicação real com `publicado: false`
(`content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`). O
teste "rascunho nunca aparece em HTML algum" já percorre todo `.html` — confirme que ele pega os
arquivos de `dist/en/` (a função `listSiteHtmlFiles` é recursiva) e cole a saída.

**Páginas finas:** `<ResearchView lang="en" />` e `<PublicationsView lang="en" />`.

**Testes de `dist`:** acrescentar `en/research/index.html` e `en/publications/index.html` às rotas
fixas; a asserção do aviso (065) passa a valer para as rotas novas; o teste do GSAP sob demanda
(348–366) passa a checar também `en/publications/index.html`.

**Regras de código:** README da fase 4.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `localize` em `ResearchView` e `ProjectItem`, `portugueseOnly` em `financiador`/`colaboradores`; `PublicationsView` por idioma; páginas finas → verify: `npx astro check` colado.
3. Build e PT idêntico → verify: `npm run build:pipeline` colado; `retrato <scratch>\depois.json`; `comparar antes.json depois.json --ignorar '^en/'` colado — toda rota PT `IGUAL`.
4. HTML EN real → verify: no `<main>` de `dist/en/research/index.html`, o título da linha traduzida sem `lang` e o `resumo` dela com `lang="pt-BR"` (trechos colados); contagens de `lang="pt-BR"` e do aviso nas duas rotas (em `/en/publications/`: 0 e 0).
5. Canário **em `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`** (autorizado): acrescente `en: { titulo, descricao }` → build → o projeto sai em inglês sem `lang` em `/en/research/` e **igual** em `/pesquisa/`; no mesmo build, `financiador`/`colaboradores` do projeto saem com `lang="pt-BR"` em `/en/research/` e sem `lang` em `/pesquisa/` (trechos colados). Que campo "P" não liga o aviso já está provado pelo teste do 061 e pelos canários (c)/(d) do 065 — aqui o aviso segue ligado pela linha real parcialmente traduzida; reverter com `git checkout --`; rebuild → verify: trechos antes/depois, `git status --short` sem `content/` e `git diff -- content/` vazio colados.
6. Testes de `dist` → verify: `npm run test:dist` colado.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
8. **Orquestrador — navegador:** `/en/research/` e `/en/publications/` a 360/768/1440 — `[scrollWidth, clientWidth]`; aviso (se houver) uma vez; sanfona de `/en/publications/` a 1440; interface toda em inglês fora dos elementos `lang="pt-BR"`; o rascunho ausente.

## Critérios de aceitação

- [x] `/en/research/` e `/en/publications/` gerados, com `<html lang="en">` e interface do `en.ts`
- [x] A linha com `en.titulo` mostra o título em inglês e o resumo em português marcado, com o aviso uma vez — tradução parcial real e o exemplo do RF-28 (Decisão 15)
- [x] Projeto traduzido sai em inglês e o PT não muda (canário do passo 5)
- [x] `financiador`/`colaboradores` por `portugueseOnly`, com `lang="pt-BR"` em `/en` (Decisão 13); aviso uma vez em `/en/research/` quando campo "T" caiu no PT
- [x] `/en/publications/` sem aviso e sem `lang="pt-BR"` no `<main>` (título e veículo são "F", Decisão 13)
- [x] Rascunho ausente de `dist/en/**` (teste de `dist`)
- [x] Rotas PT idênticas (comparador com `--ignorar '^en/'`)
- [x] Navegador: sem rolagem horizontal; sanfona funcionando em `/en/publications/` (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

### Passo 1 — retrato "antes" (PT, antes de qualquer edição de `src/`)

Fim do `npm run build:pipeline` (últimas 14 linhas; a captura bruta completa é `build-antes.txt`) e `node scripts/comparar-dist.mjs retrato antes.json`. As 10 rotas de antes incluem as da 065.

build "antes" (fim):

```
12:45:41   ├─ /en/index.html (+6ms) 
12:45:41   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
12:45:41   ├─ /ensino/2026-2-relatividade-geral/index.html (+153ms) 
12:45:41   ├─ /ensino/index.html (+7ms) 
12:45:41   ├─ /pesquisa/index.html (+8ms) 
12:45:41   ├─ /publicacoes/index.html (+10ms) 
12:45:41   ├─ /sobre/index.html (+6ms) 
12:45:41   ├─ /index.html (+5ms) 
12:45:41 ✓ Completed in 255ms.

12:45:41 [build] ✓ Completed in 916ms.
12:45:41 [build] 10 page(s) built in 1.53s
12:45:41 [build] Complete!
EXIT=0
```

retrato antes:

```
retrato: 10 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a575f299-6965-4a5e-bba7-bd2e7a5217af\scratchpad\p066\antes.json
EXIT=0
```

### Passo 2 — `astro check` (estado final do código)

Rodado depois da última edição de `src/` e `tests/`.

npx astro check:

```
12:47:31 [content] Syncing content
12:47:31 [content] Synced content
12:47:31 [types] Generated 522ms
12:47:31 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (89 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 3 — build com as páginas finas EN (build final, depois da reversão dos canários)

`npm run build:pipeline` completo, seguido dos carimbos. `/en/research/index.html` e `/en/publications/index.html` estão na lista de rotas geradas (12 páginas).

npm run build:pipeline:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:51:32
   Duration  1.36s (transform 2.08s, setup 0ms, import 3.51s, tests 94ms, environment 0ms)

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
12:52:10 [content] Syncing content
12:52:10 [content] Synced content
12:52:10 [types] Generated 631ms
12:52:10 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (89 files): 
- 0 errors
- 0 warnings
- 0 hints

12:52:21 [content] Syncing content
12:52:21 [content] Synced content
12:52:21 [types] Generated 569ms
12:52:21 [build] output: "static"
12:52:21 [build] mode: "static"
12:52:21 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:52:21 [build] Collecting build info...
12:52:21 [build] ✓ Completed in 614ms.
12:52:21 [build] Building static entrypoints...
12:52:22 [vite] ✓ built in 477ms
12:52:22 [vite] ✓ built in 102ms
12:52:22 [build] Rearranging server assets...

 generating static routes 
12:52:22   ├─ /404.html (+15ms) 
12:52:22   ├─ /en/about/index.html (+13ms) 
12:52:22   ├─ /en/publications/index.html (+9ms) 
12:52:22   ├─ /en/research/index.html (+9ms) 
12:52:22   ├─ /en/index.html (+8ms) 
12:52:22   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
12:52:22   ├─ /ensino/2026-2-relatividade-geral/index.html (+140ms) 
12:52:22   ├─ /ensino/index.html (+6ms) 
12:52:22   ├─ /pesquisa/index.html (+7ms) 
12:52:22   ├─ /publicacoes/index.html (+6ms) 
12:52:22   ├─ /sobre/index.html (+4ms) 
12:52:22   ├─ /index.html (+3ms) 
12:52:22 ✓ Completed in 260ms.

12:52:22 [build] ✓ Completed in 918ms.
12:52:22 [build] 12 page(s) built in 1.59s
12:52:22 [build] Complete!
EXIT=0

FullName                                                          Length LastWriteTime      
--------                                                          ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html                   6266 01/10/2026 12:52:22
S:\Projetos\academic_page\haroldo\dist\pesquisa\index.html         10432 01/10/2026 12:52:22
S:\Projetos\academic_page\haroldo\dist\en\research\index.html      10696 01/10/2026 12:52:22
S:\Projetos\academic_page\haroldo\dist\en\publications\index.html  11237 01/10/2026 12:52:22
```

### Passo 3 — rotas PT idênticas

`retrato depois.json` e `comparar antes.json depois.json --ignorar '^en/'` sobre o `dist/` do build final.

retrato depois:

```
retrato: 12 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a575f299-6965-4a5e-bba7-bd2e7a5217af\scratchpad\p066\depois.json
EXIT=0
```

comparar:

```
IGUAL      404.html
IGNORADA   en/about/index.html
IGNORADA   en/index.html
IGNORADA   en/publications/index.html
IGNORADA   en/research/index.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 4
EXIT=0
```

### Passo 4 — HTML EN com o conteúdo real (build final)

Contagens sobre o `<main>` (`grep -o '<main.*</main>' | grep -o <padrão> | wc -l`, script `medir.sh`); `<html lang="en"` e `<title>` sobre o arquivo todo. O título da linha traduzida sai sem `lang`; o `resumo` dela sai em português com `lang="pt-BR"`. Os 9 `lang="pt-BR"` de `/en/research/` são: resumo e corpo da linha 1, título e resumo da linha 2, título e descrição dos 2 projetos e o `financiador` do projeto de Kerr. `/en/publications/`: 0 e 0. A marcação de `data-astro-cid-*` é omitida da exibição do trecho (só do trecho; a contagem é sobre o HTML cru).

trecho e medição, dist/en/research/ e dist/en/publications/:

```
== dist/en/research/index.html (main, data-astro-cid-* omitido da exibição)
-- <h2 id="relatividade[^>]*>[^<]*</h2><p[^>]*>[^<]{0,60}
<h2 id="relatividade-geral-e-teorias-alternativas-de-gravitacao-titulo" class="text-display-2">General relativity and alternative theories of gravity</h2><p class="text-corpo max-w-medida mt-3 text-secundario" lang="pt-BR">Estudo de soluções da relatividade geral e de teorias altern
== dist/en/research/index.html
lang="pt-BR" no main: 9
aviso no main: 1
<html lang="en": 1
title: <title>Research — Haroldo Lima Junior</title>
== dist/en/publications/index.html
lang="pt-BR" no main: 0
aviso no main: 0
<html lang="en": 1
title: <title>Publications — Haroldo Lima Junior</title>
```

### Passo 5 — canário em `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`

Só `en.titulo` e `en.descricao` acrescentados ao projeto. O projeto sai em inglês sem `lang` em `/en/research/` e igual em `/pesquisa/` (`pesquisa/index.html IGUAL` no comparador). O único campo "P" que existe no conteúdo é o `financiador` ("Sem financiamento externo"; nenhum projeto tem `colaboradores`): sai com `lang="pt-BR"` em `/en/research/` e sem `lang` em `/pesquisa/`. O aviso segue 1 (linhas reais parcialmente traduzidas). `lang="pt-BR"` no `<main>`: 7 (a linha 1 sem resumo/corpo em inglês = 2, a linha 2 = 2 [título e resumo], o outro projeto = 2 [título e descrição], o `financiador` = 1).

build (canário 5, fim):

```
12:49:57 ✓ Completed in 287ms.

12:49:57 [build] ✓ Completed in 969ms.
12:49:57 [build] 12 page(s) built in 1.65s
12:49:57 [build] Complete!
EXIT=0
```

comparar PT (canário 5):

```
retrato: 12 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a575f299-6965-4a5e-bba7-bd2e7a5217af\scratchpad\p066\c5.json
IGUAL      404.html
IGNORADA   en/about/index.html
IGNORADA   en/index.html
IGNORADA   en/publications/index.html
IGNORADA   en/research/index.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 4
EXIT=0
```

trechos e medição (canário 5):

```
== dist/en/research/index.html (main, data-astro-cid-* omitido da exibição)
-- <h3[^>]*>[^<]*</h3>
<h3 class="text-titulo-item" lang="pt-BR">Sombras de buracos negros em gravitação modificada</h3>
<h3 class="text-titulo-item">Tidal forces in Kerr spacetimes</h3>
-- <p[^>]*>Sem financiamento externo</p>
<p class="text-pequeno text-secundario mt-1" lang="pt-BR">Sem financiamento externo</p>
== dist/pesquisa/index.html (main, data-astro-cid-* omitido da exibição)
-- <h3[^>]*>[^<]*</h3>
<h3 class="text-titulo-item">Sombras de buracos negros em gravitação modificada</h3>
<h3 class="text-titulo-item">Forças de maré em espaços-tempos de Kerr</h3>
-- <p[^>]*>Sem financiamento externo</p>
<p class="text-pequeno text-secundario mt-1">Sem financiamento externo</p>
== dist/en/research/index.html
lang="pt-BR" no main: 7
aviso no main: 1
<html lang="en": 1
title: <title>Research — Haroldo Lima Junior</title>
```

### Passo 5b — canário da Decisão 13 numa página que mostra o aviso

Além do canário 5, `en.titulo`, `en.resumo` e `en.corpo` das duas linhas de pesquisa e `en.titulo`/`en.descricao` do outro projeto: nenhum campo "T" cai no PT. A Pesquisa EN é uma página que **mostra** o aviso (a Sobre EN não, Decisão 16), então aqui o aviso 0 é consequência de não haver campo "T" caído e não de a página não ter o aviso. O único `lang="pt-BR"` do `<main>` é o do `financiador` (campo "P"): 1 = número de campos "P" exibidos. Campo "P" marca o idioma e não liga o aviso (Decisão 13).

build (canário 5b, fim):

```
12:51:12 ✓ Completed in 202ms.

12:51:12 [build] ✓ Completed in 836ms.
12:51:12 [build] 12 page(s) built in 1.41s
12:51:12 [build] Complete!
EXIT=0
```

trechos e medição (canário 5b):

```
== dist/en/research/index.html (main, data-astro-cid-* omitido da exibição)
-- <h2[^>]*>[^<]*</h2>
<h2 id="relatividade-geral-e-teorias-alternativas-de-gravitacao-titulo" class="text-display-2">General relativity and alternative theories of gravity</h2>
<h2 id="sombras-de-buracos-negros-titulo" class="text-display-2">Black hole shadows</h2>
<h2 id="outros-projetos" class="text-rotulo text-secundario">Other projects</h2>
-- <h3[^>]*>[^<]*</h3>
<h3 class="text-titulo-item">Black hole shadows in modified gravity</h3>
<h3 class="text-titulo-item">Tidal forces in Kerr spacetimes</h3>
-- <p[^>]*>Sem financiamento externo</p>
<p class="text-pequeno text-secundario mt-1" lang="pt-BR">Sem financiamento externo</p>
== dist/en/research/index.html
lang="pt-BR" no main: 1
aviso no main: 0
<html lang="en": 1
title: <title>Research — Haroldo Lima Junior</title>
== dist/en/publications/index.html
lang="pt-BR" no main: 0
aviso no main: 0
<html lang="en": 1
title: <title>Publications — Haroldo Lima Junior</title>
```

### Passo 5 — reversão e estado final

Depois de `git checkout -- content/`, o build do passo 3 foi refeito (os blocos dos passos 2, 3, 4 e 6 são dele). `git status --short` sem `content/`, `git diff -- content/` vazio, e contagens de linhas das views e componentes tocados.

git status, diff de content/:

```
$ git status --short
 M src/components/ProjectItem.astro
 M src/views/PublicationsView.astro
 M src/views/ResearchView.astro
 M tests/dist/site-gerado.test.ts
?? src/pages/en/publications.astro
?? src/pages/en/research.astro
$ git diff -- content/ | wc -l
0
```

wc -l:

```
$ wc -l (views e componentes tocados)
  149 src/views/ResearchView.astro
  111 src/views/PublicationsView.astro
   86 src/components/ProjectItem.astro
   24 src/pages/en/research.astro
   24 src/pages/en/publications.astro
  394 total
```

### Passo 6 — `npm run test:dist`

Sobre o `dist/` do build final do passo 3. A segunda captura (reporter verbose, mesmo `dist/`) mostra que o teste "rascunho nunca aparece em HTML algum" percorre `dist/en/` (`listSiteHtmlFiles` é recursiva; o teste novo "a varredura inclui as rotas de dist/en/" confere as duas rotas) e o resultado dos testes de aviso e de GSAP.

npm run test:dist:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  26 passed (26)
   Start at  12:52:24
   Duration  511ms (transform 91ms, setup 0ms, import 194ms, tests 144ms, environment 0ms)

EXIT=0
```

test:dist verbose:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 1412 bytes
  /en/about/index.html → 1412 bytes
  /en/index.html → 1153 bytes
  /en/publications/index.html → 2876 bytes
  /en/research/index.html → 1412 bytes
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
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > a varredura inclui as rotas de dist/en/ (o rascunho também some em /en/) 2ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 1ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e `lang` por árvore (pt-BR; en sob dist/en/) (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 8ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e `lang` por árvore (pt-BR; en sob dist/en/) (§8.3) > todo .html de dist/ (fora de admin/) declara o <html lang> da sua árvore (pt-BR; en sob dist/en/) 7ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/ o aviso aparece no máximo uma vez no <main> 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/about/ o aviso aparece exatamente 0 vezes no <main> (Decisão 16) 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/research/ o aviso aparece no máximo uma vez no <main> 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/publications/ não há aviso nem lang="pt-BR" no <main> 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > nenhuma rota fora de dist/en/ traz o aviso 5ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 7ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 13ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 8ms
 ✓ tests/dist/site-gerado.test.ts > View Transitions: nomes únicos por página > cada .html tem no máximo um vt-nome e um vt-menu, e ao menos um vt-nome 7ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > HTML de /publicacoes/ não carrega o ScrollTrigger de saída (GSAP sob demanda) 1ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > HTML de /en/publications/ não carrega o ScrollTrigger de saída (GSAP sob demanda) 1ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > dist/favicon.svg existe e toda página o declara 6ms
 ✓ tests/dist/site-gerado.test.ts > navegação principal sem "Início" > em toda página, o <nav> principal não tem link para "/" — a volta à Home é o nome 7ms
 ✓ tests/dist/site-gerado.test.ts > página de disciplina: seta de volta no lugar da trilha > sem "Trilha de navegação"; um link "Voltar para Ensino" para /ensino/ antes do <h1> 1ms
 ✓ tests/dist/site-gerado.test.ts > contato da Home igual ao da Sobre > mesmos links, na mesma sequência, começando pelo e-mail 2ms
 ✓ tests/dist/site-gerado.test.ts > contato da Home igual ao da Sobre > o mesmo vale em inglês (/en/ e /en/about/) 1ms
 ✓ tests/dist/site-gerado.test.ts > cabeçalho de página fora da área que rola > nas páginas internas, o <h1> vem antes do #conteudo (que rola), não dentro dele 7ms
 ✓ tests/dist/site-gerado.test.ts > sublinhado que segue o cursor (link-traco) no menu e no contato > todo link do menu principal usa link-traco 8ms
 ✓ tests/dist/site-gerado.test.ts > sublinhado que segue o cursor (link-traco) no menu e no contato > todo link do contato (Home e Sobre) usa link-traco 2ms

 Test Files  1 passed (1)
      Tests  26 passed (26)
   Start at  12:52:33
   Duration  411ms (transform 78ms, setup 0ms, import 161ms, tests 104ms, environment 0ms)

EXIT=0
```

### Passo 7 — portão

`npm run lint`, `npm run format:check`, `npm run test:coverage`.

lint:

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

format:check:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

test:coverage:

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  12:52:41
   Duration  1.86s (transform 5.43s, setup 0ms, import 9.78s, tests 368ms, environment 3ms)

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


### Passo 8 — Navegador (orquestrador)

Rodado pelo orquestrador em 2026-10-01, das 12:57 às 13:20, no Vivaldi com a extensão, sobre `npx astro preview` (porta 4321) servindo o `dist/` do build autoritativo (12:56:10). Uma cópia do `dist/` medido está em `scratchpad\dist066`. Cada rota foi carregada num `<iframe>` com `box-sizing:content-box`, com `innerWidth` conferido igual à largura. Legenda: `sw` é `[scrollWidth, clientWidth]` do documento; `conteudoW` é o mesmo par para `#conteudo`; `alemDaBorda` conta os elementos do `<main>` com `right` além da largura; `ptBR` conta os `main [lang="pt-BR"]`; `aviso` é o texto de `en.fallback.notice` no documento e no `<main>`; `rascunho` diz se o texto "geodésicas nulas" aparece. Esse texto é do título da publicação real com `publicado: false`.

Saída transcrita do `javascript_tool`:

```
Thu Oct 01 2026 12:57:39
/en/research/ 360x800 inner=360 sw=[350,350] conteudoW=[310,310] alemDaBorda=0 ptBR=9 aviso=1/1 top=212 html=en rascunho=false
/en/research/ 768x1024 inner=768 sw=[758,758] conteudoW=[696,696] alemDaBorda=0 ptBR=9 aviso=1/1 top=188 html=en rascunho=false
/en/research/ 1440x800 inner=1440 sw=[1440,1440] conteudoW=[1328,1328] alemDaBorda=0 ptBR=9 aviso=1/1 top=214 html=en rascunho=false
/en/publications/ 360x800 inner=360 sw=[350,350] conteudoW=[310,310] alemDaBorda=0 ptBR=0 aviso=0/0 html=en rascunho=false
/en/publications/ 768x1024 inner=768 sw=[768,768] conteudoW=[707,707] alemDaBorda=0 ptBR=0 aviso=0/0 html=en rascunho=false
/en/publications/ 1440x800 inner=1440 sw=[1440,1440] conteudoW=[1328,1328] alemDaBorda=0 ptBR=0 aviso=0/0 html=en rascunho=false
```

- **Rolagem horizontal (RF-26):** os pares são iguais nas três larguras e nas duas rotas, e nenhum elemento passa da borda. Onde aparece 350 ou 758, a diferença é a barra vertical do documento (10 px).
- **Aviso:** aparece uma vez em `/en/research/`, como primeiro filho de `#conteudo`. Não aparece em `/en/publications/`.
- **Interface em inglês:** retirei de cada rota as subárvores `[lang="pt-BR"]`, `<script>` e `<style>`, e listei os textos e os `aria-label`/`alt`/`title` que sobraram.
  - Em `/en/research/`: "Skip to content", "Haroldo Lima", "Menu", "About", "›", "Research", "Teaching", "Publications", "Research areas and projects", o aviso, "General relativity and alternative theories of gravity" (o título traduzido da linha), "2025.1– · In progress", "Other projects", "2023.1–2025.2 · Completed" e "Main navigation". Nenhum texto em português.
  - Em `/en/publications/`: a interface está em inglês ("Publications", "DOI", "PDF", "(opens in new tab)"). Os títulos das publicações aparecem em português sem `lang` porque título e veículo são "F", como define a Decisão 13. A saída da ferramenta truncou depois do ano 2023.
- **Rascunho:** o título "[EXEMPLO] Notas sobre geodésicas nulas em métricas estacionárias" não aparece em nenhuma largura das duas rotas.
- **Sanfona de `/en/publications/` (página de topo, 1495 px, rolagem pela roda):** o GSAP foi baixado (2 recursos `gsap`/`ScrollTrigger`).
  - Com `#conteudo` em 0, a altura dos corpos dos anos (2025, 2024, 2023) era `166, 0, 0`.
  - Em 500 px: `13, 153, 0`. O ano 2025 fecha e o 2024 abre.
  - Em 914 px: `0, 0, 87`. Só 2023 fica aberto.
  - As capturas de tela mostram os anos fechando e abrindo. A sanfona funciona, igual à de `/publicacoes/`.
- **Defeito encontrado, que não é deste plano:** no fim da rolagem, o corpo do ano **aberto** fica `inert` e o do ano fechado 2025 fica sem `inert`.
  - Medido em `/publicacoes/` (PT) com a aba **visível**, em 4 leituras de 0 a 2000 ms depois de a rolagem parar: `0`, `0i`, `87i` (o `i` marca `inert`).
  - `elementFromPoint` no centro do link "DOI" de 2023 não devolve o link, então ele não recebe clique.
  - A rota EN reproduz o mesmo estado. O código é o `syncInert` de `src/scripts/publications-accordion.ts`, que entrou no `f41556a` (2026-09-24), antes da fase 4. O 066 não tocou nesse arquivo.
  - Causa provável (dedução da leitura do código, não medida): o `syncInert` roda no `onUpdate` da rolagem, mas com `scrub: 0.4` a animação termina depois do último `onUpdate`.
  - Fica fora do escopo deste plano; vai para o stakeholder decidir o tratamento.
- **Foco por teclado:** não verificado, porque a tecla Tab da extensão não move o foco nesta máquina.

### Desvios e observações

- `financiador` e `colaboradores` saem num único `<p>` (como já eram), marcado uma vez por `portugueseOnly` sobre o texto junto. Um projeto com os dois campos conta 1 elemento `lang="pt-BR"`, não 2. No conteúdo real só existe `financiador`; nenhum projeto tem `colaboradores`, então o canário prova o `financiador`.
- O aviso da Pesquisa EN conta também o fallback de `titulo`/`descricao` dos projetos. `ProjectItem` resolve os campos para renderizar e a `ResearchView` repete o `localize` desses dois campos só para alimentar `hasFallback`.
- `PublicationsView` não mudou de comportamento: já recebia `lang` e usava `strings(lang)`; só o cabeçalho foi atualizado (rota EN e a razão de não haver aviso).
- Canário de controle com campo "T" caído num estado que também tem campo "P" não foi feito à parte: o build do passo 3 (conteúdo real) já mostra o aviso 1 com o `financiador` presente.

### Não rodei

- `npm audit`: não pedido neste plano; é do `triage-runner`.
- Commit e mudança de `Status:`: não são do executor.

### Fidelidade e BOM

Saída do verificador (rodado depois da última edição do plano, sobre os blocos acima) e conferências. O `1` do `grep -c` de mojibake no plano é a palavra "Âncoras" (linha 57, preexistente, texto legítimo); o `1` das caixas vazias é a do navegador, do orquestrador.

```
$ verificador de fidelidade
OK        build-antes-fim.txt - build "antes" (fim)
OK        retrato-antes.txt - retrato antes
OK        check.txt - npx astro check
OK        build.txt - npm run build:pipeline
OK        retrato-depois.txt - retrato depois
OK        comparar.txt - comparar
OK        medicao-real.txt - trecho e medição, dist/en/research/ e dist/en/publications/
OK        build-c5-fim.txt - build (canário 5, fim)
OK        comparar-c5.txt - comparar PT (canário 5)
OK        medicao-c5.txt - trechos e medição (canário 5)
OK        build-c5b-fim.txt - build (canário 5b, fim)
OK        medicao-c5b.txt - trechos e medição (canário 5b)
OK        revert.txt - git status, diff de content/
OK        wc.txt - wc -l
OK        test-dist.txt - npm run test:dist
OK        test-dist-verbose.txt - test:dist verbose
OK        lint.txt - lint
OK        format.txt - format:check
OK        coverage.txt - test:coverage
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0
$ file (arquivos tocados)
src/views/ResearchView.astro:                                       JavaScript source, Unicode text, UTF-8 text
src/views/PublicationsView.astro:                                   JavaScript source, Unicode text, UTF-8 text
src/components/ProjectItem.astro:                                   JavaScript source, Unicode text, UTF-8 text
src/pages/en/research.astro:                                        JavaScript source, Unicode text, UTF-8 text
src/pages/en/publications.astro:                                    JavaScript source, Unicode text, UTF-8 text
tests/dist/site-gerado.test.ts:                                     JavaScript source, Unicode text, UTF-8 text
plans/fase-4-internacionalizacao/066-en-research-e-publications.md: Unicode text, UTF-8 text, with very long lines (687)
$ grep -c 'Ã\|â€\|Â' (arquivos tocados)
src/views/ResearchView.astro:0
src/views/PublicationsView.astro:0
src/components/ProjectItem.astro:0
src/pages/en/research.astro:0
src/pages/en/publications.astro:0
tests/dist/site-gerado.test.ts:0
plans/fase-4-internacionalizacao/066-en-research-e-publications.md:1
$ grep -c '^- \[ \]' <plano>
1
```
