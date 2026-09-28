# Plano 057 — Dicionário `en.ts`, chaves novas e `strings(lang)`

**Status:** TODO
**RFs cobertos:** §10.4 (strings de interface), M-07 (parte unitária), F-07 (texto do aviso), RF-29 (texto do seletor), §8.3 (data por locale); sabatina fase 4, Decisões 4, 5, 11 e 12; dívida (d) da fase 3
**Depende de:** plano 055 (comparador)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **stakeholder** (revisão do texto em inglês — passo obrigatório antes do DONE, Decisão 11)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe `src/i18n/en.ts`, com o tipo `UiStrings` inteiro traduzido, e `strings(lang)` devolve o
dicionário do idioma. O `pt.ts` ganha, de uma vez, todas as chaves que a fase usa. Um teste reprova
valor inglês copiado do português. As páginas PT continuam **idênticas**, e o stakeholder aprovou o
inglês antes do DONE.

## Arquivos afetados

- `src/i18n/pt.ts` — chaves novas; sai `about.eyebrow`; cabeçalho atualizado
- `src/i18n/en.ts` — novo
- `src/i18n/index.ts` — novo (`strings`)
- `tests/i18n/pt.test.ts` — testes das chaves novas
- `tests/i18n/en.test.ts` — novo
- `tests/i18n/excecoes-m07.ts` — novo (lista de valores iguais nos dois idiomas; reusada pelo 072)
- `src/pages/sobre.astro` — só `BaseLayout title={pt.about.eyebrow}` → `title={pt.nav.about}`
- `src/pages/publicacoes.astro` — só `BaseLayout title={pt.publications.title}` → `title={pt.nav.publications}` (o `<h1>` continua `pt.publications.title`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Este é o único plano da fase que edita os dicionários** (README da fase).

## Contexto necessário

**Decisão 11** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): o executor escreve o `en.ts`; o
**stakeholder revisa antes do DONE**, com uma tabela PT → EN de **todas** as strings anexada à
Evidência, e a revisão é um passo explícito com a aprovação registrada. **Decisão 12:** o teste da
M-07 precisa de uma lista explícita de exceções para valores iguais nos dois idiomas — ela nasce
aqui, em `tests/i18n/excecoes-m07.ts`, e o 072 a reusa.

**Estado atual** (`src/i18n/pt.ts`, 167 linhas): objeto `pt` com os grupos `site`, `nav`, `about`,
`research`, `teaching`, `course`, `script`, `publications`, `notFound`, e `export type UiStrings =
typeof pt`. Os mapas de enum usam `satisfies Record<…>` tipado pelos schemas Zod — mantenha.

**Chaves novas no `pt.ts` (fixadas no fatiamento, README da fase, decisões 4–6):**

| Chave | Valor PT | Uso |
|---|---|---|
| `site.description` | **exatamente** o valor atual de `siteConfig.description` (`src/lib/config.ts:45-46`): `'Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA.'` | meta description; o 058 troca o `BaseLayout` e remove `siteConfig.description` |
| `language.code` | `'EN'` | texto visível do seletor na página PT (Decisão 5: o link mostra o idioma de **destino**) |
| `language.name` | `'English version'` | nome acessível por extenso, **no idioma de destino** (o link leva `lang="en"`, Decisão 5) |
| `fallback.notice` | `'Parte do conteúdo desta página só está disponível em português.'` | aviso da Decisão 4; só aparece em `/en`, mas o tipo exige o par |
| `date.format` | `(year: string, month: string, day: string) => \`${day}/${month}/${year}\`` | §8.3; o 059 troca `formatDate` para usá-la |

**Sai:** `about.eyebrow` (`'Sobre'`), usado só em `src/pages/sobre.astro:77` como título da aba. A
chave de `<title>` das rotas fixas passa a ser `nav[chave]` (decisão 5 do README da fase, dívida (d)
da fase 3). `pt.nav.about` e `pt.nav.publications` têm os mesmos valores (`'Sobre'`,
`'Publicações'`), então o HTML não muda — é o que o comparador prova.

**`en.ts`:** `export const en: UiStrings = { … }` — todo valor em inglês, escrito por você. Sem
tradução automática colada sem leitura. Pontos fixos:
- `language.code = 'PT'`, `language.name = 'Versão em português'` (destino é o PT).
- `fallback.notice`: a Decisão 4 dá o exemplo "Some content on this page is only available in
  Portuguese" — use-o, com ponto final.
- `date.format(year, month, day)`: "March 15, 2026" (§8.3 do PRD) — `${MONTHS[m-1]} ${Number(day)},
  ${year}`, com `MONTHS` constante no próprio `en.ts`. **Mês fora de `01`–`12` devolve
  `${year}-${month}-${day}`** (decisão 6 do README da fase: o PT não valida calendário e o EN não
  inventa mês). Nada de `Date`/`Intl` (fuso, ver `src/lib/date.ts`).
- Funções (`pageTitle`, `portraitAlt`, `lessonNumber`, `dueDate`, `script.eyebrow`) com o mesmo
  formato de parâmetros.

**`src/i18n/index.ts`:** `export function strings(lang: Locale): UiStrings` (`Locale` de
`src/lib/config.ts`, que já exporta `'pt' | 'en'`). Cabeçalho §10.1 e TSDoc.

**`tests/i18n/en.test.ts`** (padrão de `tests/i18n/pt.test.ts`, que já tem `collectLeafStrings`):
nenhuma folha vazia; mapas de enum com as mesmas chaves, na mesma ordem, dos schemas; `strings('pt')
=== pt` e `strings('en') === en`; `date.format` nos dois (inclusive o mês `'13'`); e o **teste de valor
copiado**: para cada folha string e cada função (avaliada com argumentos de amostra), `en !== pt`,
**exceto** as chaves listadas em `tests/i18n/excecoes-m07.ts`.

**`tests/i18n/excecoes-m07.ts`:** exporta a lista de **caminhos de chave** (ex.:
`'about.links.orcid'`) cujo valor é legitimamente igual nos dois idiomas, cada um com um comentário
de uma linha dizendo por quê (nome próprio, sigla, empréstimo usual em inglês). Candidatos prováveis
hoje: `site.menu` ("Menu"), `about.links.orcid`/`scholar`/`arxiv`/`researchgate`/`github`,
`course.links` ("Links"), `course.materialType.slides`, `script.language.python`/`r`/`matlab`/`bash`,
`publications.type.preprint`, `publications.doi`/`arxiv`/`pdf`. **A lista final é a que o seu `en.ts`
produzir**, e cada item entra na tabela de revisão.

**Tabela de revisão (Decisão 11):** gerada **por script** a partir dos dois dicionários (funções
avaliadas com argumentos de amostra — mostre os argumentos), em Markdown: `chave | PT | EN | igual?`.
Vai para a Evidência. O executor **não** marca a revisão como feita.

**Regras de código:** README da fase 4. O dicionário não recebe dado de conteúdo.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `pt.ts` (chaves novas, sai `about.eyebrow`), `index.ts`, `en.ts`; as duas páginas → verify: `npx astro check` colado (o tipo `UiStrings` obriga o `en` a ter toda chave).
3. Testes (`pt.test.ts`, `en.test.ts`, `excecoes-m07.ts`) → verify: `npm test -- --reporter=verbose tests/i18n` colado.
4. Canário do teste de valor copiado: troque temporariamente `en.nav.about` por `'Sobre'` → vermelho nomeando a chave; desfaça → verify: as duas saídas coladas.
5. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0.
6. Tabela de revisão gerada por script → verify: tabela inteira colada na Evidência, com o comando que a gerou.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
8. **Stakeholder (dependente de humano):** lê a tabela do passo 6 e aprova ou pede mudança. Mudança pedida → o executor ajusta, repete 3, 5 e 6. **O orquestrador registra na Evidência a aprovação, com data e o que mudou**; sem esse registro o plano não vai a DONE.

## Critérios de aceitação

- [x] `en.ts` implementa `UiStrings` inteiro; `strings(lang)` devolve o dicionário do idioma
- [x] As cinco chaves novas existem nos dois dicionários; `site.description` PT é byte a byte o valor de `siteConfig.description`; `about.eyebrow` saiu
- [x] `en.date.format` produz "March 15, 2026" para `('2026','03','15')` e devolve ISO para mês fora de 01–12 (teste)
- [x] Teste de valor copiado reprova (canário do passo 4) e a lista de exceções tem uma justificativa por item
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [x] Tabela PT → EN de todas as strings na Evidência, gerada por script
- [x] **Revisão do stakeholder registrada na Evidência, com data** (Decisão 11)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

### Ciclo 2 -- correcoes da revisao

Revisao do ciclo 1 REPROVOU com 3 correcoes obrigatorias e 4 observacoes. O que mudou:

1. **`FUNCTION_SAMPLES` com argumento diferente por idioma mascarava copia** -- `en.course.dueDate` copiado literal de `pt` (`(d) => \`Entrega ${d}\``) passava no teste porque a amostra de `pt` era `'15/08/2026'` e a de `en` era `'August 15, 2026'` (datas diferentes escondiam o texto fixo igual). Corrigido: **um so argumento por funcao, usado nos dois idiomas** (`tests/i18n/en.test.ts`). Consequencia prevista pelo revisor: `site.pageTitle` passou a dar igual nos dois idiomas (o unico texto fixo e o separador `" \u2014 "`, sem nada traduzivel) e entrou em `tests/i18n/excecoes-m07.ts` com justificativa de uma linha. Canario novo (`course.dueDate` copiado) abaixo, no passo 4.
2. **Blocos do canario do passo 4 (`nav.about`) eram de antes do `prettier --write` em `en.test.ts`** -- refeitos os dois (vermelho/verde), agora depois de toda edicao desta sessao, e mais o canario novo do item 1 (`course.dueDate`).
3. **Citacoes de decisao trocadas** -- a regra do mes fora de 01-12 e a decisao 6 **do fatiamento da fase 4** (README da fase, "Decisoes tomadas no fatiamento", item 6), nao a Decisao 6 da sabatina (que e sobre pagina fina + view). As chaves novas / `site.description` / a existencia do `en.ts` vem da decisao 4 **do fatiamento** (item 4 da mesma lista); a revisao do `en.ts` pelo stakeholder e a Decisao 11 **da sabatina**. Corrigido em `src/i18n/pt.ts` (linhas do cabecalho e do comentario de `site.description`), `src/i18n/en.ts` (comentario de `date.format`), `tests/i18n/pt.test.ts` e `tests/i18n/en.test.ts` (titulos de `describe`/`it`). `grep -rn "Decisao" src/i18n tests/i18n` conferido linha a linha, colado abaixo.

Observacoes (baratas, feitas junto):

4. `tests/i18n/en.test.ts` ganhou a asserção `excecoes-m07 -- lista coerente com os dicionarios`: para cada caminho de `M07_EXCEPTIONS`, resolve o valor nos dois dicionarios (com a amostra de `FUNCTION_SAMPLES` quando e funcao) e exige `pt === en` -- uma entrada obsoleta (chave renomeada/removida) reprova em vez de passar em silencio.
5. `npx astro check` do passo 2 recapturado depois de todas as edicoes desta sessao (o bloco do ciclo 1 era de antes dos testes).
6. `src/i18n/en.ts:26`: `(Decisão 5)` -> `(sabatina fase 4, Decisão 5)`.
7. `src/i18n/en.ts:78-79`: comentario corrigido para "devolve aaaa-mm-dd como veio" (antes dizia "devolve o valor digitado", que nao descrevia o formato produzido).

Nenhum texto em ingles (valores de `en.ts`) foi alterado -- e revisao do stakeholder, fora do escopo desta correcao.

Comando: `grep -rn "Decisão" src/i18n tests/i18n` (todas as ocorrencias, conferidas linha a linha contra o README da fase 4):

```
src/i18n/en.ts:7: *                 fase 4, Decisão 11: escrito pelo executor, revisado pelo
src/i18n/en.ts:23: *                 fase 4, Decisão 11). `language.name` guarda o nome
src/i18n/en.ts:26: *                 entrada leva ao PT (sabatina fase 4, Decisão 5). Dados que
src/i18n/index.ts:6: *                 pelo idioma da rota (sabatina fase 4, Decisão 6: cada
src/i18n/pt.ts:26: *                 stakeholder (sabatina fase 4, Decisão 11); as chaves novas
src/i18n/pt.ts:80:  // sabatina fase 4, Decisão 5: o link do seletor mostra o idioma de destino — nas páginas PT, o
src/i18n/pt.ts:86:  // F-07 / sabatina fase 4, Decisão 4: aviso único por página quando algum texto caiu no PT.
tests/i18n/en.test.ts:23: * (sabatina fase 4, Decisão 12). **O mesmo argumento vale para `pt` e para `en`**: só assim uma
tests/i18n/en.test.ts:132:describe('en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12)', () => {
tests/i18n/excecoes-m07.ts:10: *                 Decisão 12) e é reusada pelo teste da M-07 sobre o `dist/`
```

### Ciclo 3 -- revisao do stakeholder (2026-09-28): 11 valores de `en.ts`

O stakeholder revisou a tabela PT -> EN do passo 6 e pediu mudancas em `src/i18n/en.ts` -- primeiro 4, depois um adendo de mais 7 (nomenclatura de davidtong.org). Lista final aplicada, as 11 linhas mudadas (nenhum outro valor de `en.ts` mudou; `pt.ts` nao mudou):

| # | Chave | Antes | Depois |
|---|---|---|---|
| 1 | `site.description` | "...Adjunct Professor A in the Department of Physics..." | "...Assistant Professor of Physics at the Federal University of Maranhão (UFMA)." |
| 2 | `research.title` | 'Lines and projects' | 'Research areas and projects' |
| 3 | `about.education` | 'Academic education' | 'Education' |
| 4 | `course.access` | 'Access' | 'Open' |
| 5 | `about.areas` | 'Areas of expertise' | 'Research interests' |
| 6 | `course.lessons` | 'Lessons' | 'Lectures' |
| 7 | `course.lessonNumber` | `` (n) => `Lesson ${n}` `` | `` (n) => `Lecture ${n}` `` |
| 8 | `teaching.latestLesson` | 'Latest lesson' | 'Latest lecture' |
| 9 | `course.noLessons` | 'No lessons published yet.' | 'No lectures published yet.' |
| 10 | `course.problemSets` | 'Problem sets' | 'Problem sheets' |
| 11 | `course.back` | 'Back to Teaching' | 'All courses' |

Nenhum teste cita esses valores literalmente (conferido por grep antes de editar) -- nenhum teste precisou de ajuste. Nenhum dos 11 valores novos colide com o `pt.ts` correspondente; o teste de valor copiado (`tests/i18n/en.test.ts`) continua verde **sem exceção nova** em `tests/i18n/excecoes-m07.ts` (confirmado no passo 3 abaixo -- mesmas 28 asserções do ciclo 2, mesma lista de exceções). Todos os passos 2-7 abaixo foram recapturados depois da ultima edicao desta sessao.


### Passo 1 -- Retrato "antes" (arvore limpa, HEAD f255f56)

Nao recapturado neste ciclo -- descreve o estado antes de qualquer edicao desta sessao (o `en.ts` nao existia commitado nesse estado e nenhuma pagina PT o importa), que nao mudou.

Comando: `npm run build:pipeline 2>&1 | Tee-Object -FilePath <scratch>\passo1-build-antes.txt`

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  10:36:19
   Duration  1.78s (transform 1.69s, setup 0ms, import 3.36s, tests 77ms, environment 0ms)

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
10:37:36 [content] Syncing content
10:37:36 [content] Synced content
10:37:36 [types] Generated 534ms
10:37:36 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (63 files): 
- 0 errors
- 0 warnings
- 0 hints

10:37:47 [content] Syncing content
10:37:47 [content] Synced content
10:37:47 [types] Generated 479ms
10:37:47 [build] output: "static"
10:37:47 [build] mode: "static"
10:37:47 [build] directory: S:\Projetos\academic_page\haroldo\dist\
10:37:47 [build] Collecting build info...
10:37:47 [build] ✓ Completed in 515ms.
10:37:47 [build] Building static entrypoints...
10:37:48 [vite] ✓ built in 602ms
10:37:48 [vite] ✓ built in 134ms
10:37:48 [build] Rearranging server assets...

 generating static routes 
10:37:48   ├─ /404.html (+13ms) 
10:37:48   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
10:37:48   ├─ /ensino/2026-2-relatividade-geral/index.html (+110ms) 
10:37:48   ├─ /ensino/index.html (+6ms) 
10:37:48   ├─ /pesquisa/index.html (+5ms) 
10:37:48   ├─ /publicacoes/index.html (+5ms) 
10:37:48   ├─ /sobre/index.html (+5ms) 
10:37:48   ├─ /index.html (+4ms) 
10:37:48 ✓ Completed in 190ms.

10:37:48 [build] ✓ Completed in 979ms.
10:37:48 [build] 8 page(s) built in 1.52s
10:37:48 [build] Complete!
```

Comando: `node scripts/comparar-dist.mjs retrato <scratch>\antes.json`

```
retrato: 8 rota(s) de dist em C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/d2f7ef8b-a67f-4e64-b966-5b958fd51a91/scratchpad/057/antes.json
```

### Passo 2 -- `pt.ts`, `en.ts`, `index.ts` e as duas paginas (recapturado no ciclo 3)

Comando: `npx astro check 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo2-astro-check.txt` (depois das 11 edicoes de `en.ts` do ciclo 3)

```
﻿13:11:25 [content] Syncing content
13:11:25 [content] Synced content
13:11:25 [types] Generated 430ms
13:11:25 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 3 -- Testes (`pt.test.ts`, `en.test.ts`, `excecoes-m07.ts`) (recapturado no ciclo 3)

Comando: `npm test -- --reporter=verbose tests/i18n 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo3-vitest.txt`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/pt.test.ts > pt.site > pageTitle interpola página e site 1ms
 ✓ tests/i18n/pt.test.ts > pt.course > lessonNumber devolve "Aula N" 0ms
 ✓ tests/i18n/pt.test.ts > pt.course > dueDate interpola a data 0ms
 ✓ tests/i18n/pt.test.ts > pt.script > eyebrow interpola a linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 2ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/pt.test.ts > pt.site.portraitAlt > monta o texto alternativo do retrato 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > site.description é, byte a byte, o valor de siteConfig.description 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > language.code e language.name apontam para o idioma de destino (EN) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > fallback.notice tem o texto do aviso de idioma (F-07) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > about.eyebrow saiu do dicionário (dívida (d) da fase 3) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 3ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('pt') devolve o mesmo objeto que pt 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('en') devolve o mesmo objeto que en 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > produz "March 15, 2026" para ('2026','03','15') (§8.3) 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > devolve aaaa-mm-dd para mês fora de 01–12, sem inventar mês (decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts 0ms
 ✓ tests/i18n/en.test.ts > excecoes-m07 — lista coerente com os dicionários (reusada pelo plano 072) > todo caminho de M07_EXCEPTIONS existe nos dois dicionários e tem pt === en 0ms

 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  13:12:08
   Duration  804ms (transform 831ms, setup 0ms, import 1.33s, tests 13ms, environment 0ms)
```

### Passo 4 -- Canarios do teste de valor copiado (refeitos no ciclo 3, depois das 11 edicoes)

**Canario A -- `en.nav.about` trocado por `'Sobre'`.** `en.ts` e arquivo novo nao commitado; desfeito **editando o arquivo de volta**, nunca `git checkout --`.

Vermelho:

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/pt.test.ts > pt.site > pageTitle interpola página e site 1ms
 ✓ tests/i18n/pt.test.ts > pt.course > lessonNumber devolve "Aula N" 0ms
 ✓ tests/i18n/pt.test.ts > pt.course > dueDate interpola a data 0ms
 ✓ tests/i18n/pt.test.ts > pt.script > eyebrow interpola a linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 2ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/pt.test.ts > pt.site.portraitAlt > monta o texto alternativo do retrato 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > site.description é, byte a byte, o valor de siteConfig.description 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > language.code e language.name apontam para o idioma de destino (EN) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > fallback.notice tem o texto do aviso de idioma (F-07) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > about.eyebrow saiu do dicionário (dívida (d) da fase 3) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 3ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('pt') devolve o mesmo objeto que pt 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('en') devolve o mesmo objeto que en 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > produz "March 15, 2026" para ('2026','03','15') (§8.3) 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > devolve aaaa-mm-dd para mês fora de 01–12, sem inventar mês (decisão 6 do fatiamento da fase 4) 0ms
 × tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts 4ms
   → expected [ 'nav.about: "Sobre"' ] to deeply equal []
 ✓ tests/i18n/en.test.ts > excecoes-m07 — lista coerente com os dicionários (reusada pelo plano 072) > todo caminho de M07_EXCEPTIONS existe nos dois dicionários e tem pt === en 0ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, 
exceto as chaves de tests/i18n/excecoes-m07.ts
AssertionError: expected [ 'nav.about: "Sobre"' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "nav.about: \"Sobre\"",
+ ]

 ❯ tests/i18n/en.test.ts:139:20
    137|       if (ptValue === enValue) iguais.push(`${path}: "${ptValue}"`);
    138|     });
    139|     expect(iguais).toEqual([]);
       |                    ^
    140|   });
    141| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 27 passed (28)
   Start at  13:12:25
   Duration  809ms (transform 839ms, setup 0ms, import 1.33s, tests 16ms, environment 0ms)
```

Verde (canario desfeito, `en.nav.about` de volta a `'About'`):

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/pt.test.ts > pt.site > pageTitle interpola página e site 1ms
 ✓ tests/i18n/pt.test.ts > pt.course > lessonNumber devolve "Aula N" 0ms
 ✓ tests/i18n/pt.test.ts > pt.course > dueDate interpola a data 0ms
 ✓ tests/i18n/pt.test.ts > pt.script > eyebrow interpola a linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 2ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/pt.test.ts > pt.site.portraitAlt > monta o texto alternativo do retrato 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > site.description é, byte a byte, o valor de siteConfig.description 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > language.code e language.name apontam para o idioma de destino (EN) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > fallback.notice tem o texto do aviso de idioma (F-07) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > about.eyebrow saiu do dicionário (dívida (d) da fase 3) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 3ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('pt') devolve o mesmo objeto que pt 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('en') devolve o mesmo objeto que en 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > produz "March 15, 2026" para ('2026','03','15') (§8.3) 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > devolve aaaa-mm-dd para mês fora de 01–12, sem inventar mês (decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts 0ms
 ✓ tests/i18n/en.test.ts > excecoes-m07 — lista coerente com os dicionários (reusada pelo plano 072) > todo caminho de M07_EXCEPTIONS existe nos dois dicionários e tem pt === en 0ms

 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  13:12:42
   Duration  821ms (transform 875ms, setup 0ms, import 1.38s, tests 13ms, environment 0ms)
```

**Canario B -- `en.course.dueDate` copiado literal de `pt` (`` (d) => `Entrega ${d}` ``).**

Vermelho:

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/pt.test.ts > pt.site > pageTitle interpola página e site 1ms
 ✓ tests/i18n/pt.test.ts > pt.course > lessonNumber devolve "Aula N" 0ms
 ✓ tests/i18n/pt.test.ts > pt.course > dueDate interpola a data 0ms
 ✓ tests/i18n/pt.test.ts > pt.script > eyebrow interpola a linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 2ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/pt.test.ts > pt.site.portraitAlt > monta o texto alternativo do retrato 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > site.description é, byte a byte, o valor de siteConfig.description 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > language.code e language.name apontam para o idioma de destino (EN) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > fallback.notice tem o texto do aviso de idioma (F-07) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > about.eyebrow saiu do dicionário (dívida (d) da fase 3) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 3ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('pt') devolve o mesmo objeto que pt 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('en') devolve o mesmo objeto que en 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > produz "March 15, 2026" para ('2026','03','15') (§8.3) 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > devolve aaaa-mm-dd para mês fora de 01–12, sem inventar mês (decisão 6 do fatiamento da fase 4) 0ms
 × tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts 4ms
   → expected [ Array(1) ] to deeply equal []
 ✓ tests/i18n/en.test.ts > excecoes-m07 — lista coerente com os dicionários (reusada pelo plano 072) > todo caminho de M07_EXCEPTIONS existe nos dois dicionários e tem pt === en 0ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, 
exceto as chaves de tests/i18n/excecoes-m07.ts
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "course.dueDate: \"Entrega 15/08/2026\"",
+ ]

 ❯ tests/i18n/en.test.ts:139:20
    137|       if (ptValue === enValue) iguais.push(`${path}: "${ptValue}"`);
    138|     });
    139|     expect(iguais).toEqual([]);
       |                    ^
    140|   });
    141| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 27 passed (28)
   Start at  13:12:57
   Duration  797ms (transform 822ms, setup 0ms, import 1.32s, tests 16ms, environment 0ms)
```

Verde (canario desfeito, `en.course.dueDate` de volta a `` (d: string) => `Due ${d}` ``):

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/en.test.ts > en — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 3ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/en.test.ts > en — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('pt') devolve o mesmo objeto que pt 0ms
 ✓ tests/i18n/en.test.ts > strings(lang) > strings('en') devolve o mesmo objeto que en 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > produz "March 15, 2026" para ('2026','03','15') (§8.3) 0ms
 ✓ tests/i18n/en.test.ts > en.date.format > devolve aaaa-mm-dd para mês fora de 01–12, sem inventar mês (decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts 0ms
 ✓ tests/i18n/en.test.ts > excecoes-m07 — lista coerente com os dicionários (reusada pelo plano 072) > todo caminho de M07_EXCEPTIONS existe nos dois dicionários e tem pt === en 0ms
 ✓ tests/i18n/pt.test.ts > pt.site > pageTitle interpola página e site 1ms
 ✓ tests/i18n/pt.test.ts > pt.course > lessonNumber devolve "Aula N" 0ms
 ✓ tests/i18n/pt.test.ts > pt.course > dueDate interpola a data 0ms
 ✓ tests/i18n/pt.test.ts > pt.script > eyebrow interpola a linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia 2ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > research.status igual, na ordem, a projetosSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.status igual, na ordem, a disciplinasSchema.shape.status 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem 0ms
 ✓ tests/i18n/pt.test.ts > pt — mapas de enum alinhados aos schemas Zod > publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options 0ms
 ✓ tests/i18n/pt.test.ts > pt.site.portraitAlt > monta o texto alternativo do retrato 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > site.description é, byte a byte, o valor de siteConfig.description 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > language.code e language.name apontam para o idioma de destino (EN) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > fallback.notice tem o texto do aviso de idioma (F-07) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4) 0ms
 ✓ tests/i18n/pt.test.ts > pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4) > about.eyebrow saiu do dicionário (dívida (d) da fase 3) 0ms

 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  13:13:14
   Duration  798ms (transform 828ms, setup 0ms, import 1.33s, tests 13ms, environment 0ms)
```

### Passo 5 -- Comparacao do `dist/` (antes x depois) (recapturado no ciclo 3)

Comando: `npm run build:pipeline 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo5-build-depois.txt`

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  13:13:33
   Duration  908ms (transform 1.44s, setup 0ms, import 2.34s, tests 69ms, environment 0ms)

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
13:14:06 [content] Syncing content
13:14:06 [content] Synced content
13:14:06 [types] Generated 417ms
13:14:06 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

13:14:15 [content] Syncing content
13:14:15 [content] Synced content
13:14:15 [types] Generated 408ms
13:14:15 [build] output: "static"
13:14:15 [build] mode: "static"
13:14:15 [build] directory: S:\Projetos\academic_page\haroldo\dist\
13:14:15 [build] Collecting build info...
13:14:15 [build] ✓ Completed in 443ms.
13:14:15 [build] Building static entrypoints...
13:14:15 [vite] ✓ built in 363ms
13:14:15 [vite] ✓ built in 76ms
13:14:15 [build] Rearranging server assets...

 generating static routes 
13:14:15   ├─ /404.html (+11ms) 
13:14:15   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
13:14:15   ├─ /ensino/2026-2-relatividade-geral/index.html (+86ms) 
13:14:15   ├─ /ensino/index.html (+4ms) 
13:14:15   ├─ /pesquisa/index.html (+4ms) 
13:14:15   ├─ /publicacoes/index.html (+5ms) 
13:14:15   ├─ /sobre/index.html (+4ms) 
13:14:15   ├─ /index.html (+3ms) 
13:14:15 ✓ Completed in 152ms.

13:14:15 [build] ✓ Completed in 647ms.
13:14:15 [build] 8 page(s) built in 1.11s
13:14:15 [build] Complete!
```

Comando: `node scripts/comparar-dist.mjs retrato <scratch>\ciclo3\depois.json`

```
retrato: 8 rota(s) de dist em C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/d2f7ef8b-a67f-4e64-b966-5b958fd51a91/scratchpad/057/ciclo3/depois.json
```

Comando: `node scripts/comparar-dist.mjs comparar <scratch>\antes.json <scratch>\ciclo3\depois.json` (contra o retrato "antes" do passo 1, de HEAD f255f56 -- `en.ts` nao e importado por nenhuma pagina PT, entao a mudanca de texto em ingles nao pode aparecer no `dist/` das rotas PT)

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

### Passo 6 -- Tabela de revisao PT -> EN (Decisao 11), gerada por script (regenerada no ciclo 3)

Mesmo script do ciclo 2 (`<scratch>\gerar-tabela-revisao.mjs`), sem mudanca de logica -- so o conteudo de `en.ts` mudou.

Comando: `node --experimental-strip-types <scratch>\gerar-tabela-revisao.mjs 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo6-tabela.txt`. Copia atualizada em `<scratch>\tabela-revisao.md`.

```markdown
| Chave | PT | EN | Amostra | Igual? |
|---|---|---|---|---|
| `site.skipToContent` | Pular para o conteúdo | Skip to content | - | nao |
| `site.menu` | Menu | Menu | - | sim (excecao M-07) |
| `site.mainNavLabel` | Navegação principal | Main navigation | - | nao |
| `site.opensInNewTab` | (abre em nova aba) | (opens in new tab) | - | nao |
| `site.description` | Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA. | Academic website of Prof. Haroldo Cilas Duarte Lima Junior, Assistant Professor of Physics at the Federal University of Maranhão (UFMA). | - | nao |
| `site.pageTitle` | Sobre — Haroldo Lima Junior | Sobre — Haroldo Lima Junior | ("Sobre", "Haroldo Lima Junior") | sim (excecao M-07) |
| `site.portraitAlt` | Retrato de Haroldo Lima | Portrait of Haroldo Lima | ("Haroldo Lima") | nao |
| `nav.home` | Início | Home | - | nao |
| `nav.about` | Sobre | About | - | nao |
| `nav.research` | Pesquisa | Research | - | nao |
| `nav.teaching` | Ensino | Teaching | - | nao |
| `nav.publications` | Publicações | Publications | - | nao |
| `language.code` | EN | PT | - | nao |
| `language.name` | English version | Versão em português | - | nao |
| `fallback.notice` | Parte do conteúdo desta página só está disponível em português. | Some content on this page is only available in Portuguese. | - | nao |
| `date.format` | 15/03/2026 | March 15, 2026 | ("2026", "03", "15") | nao |
| `about.title` | Biografia e formação | Biography and education | - | nao |
| `about.education` | Formação acadêmica | Education | - | nao |
| `about.experience` | Atuação profissional | Professional experience | - | nao |
| `about.areas` | Áreas de atuação | Research interests | - | nao |
| `about.contact` | Contato | Contact | - | nao |
| `about.links.lattes` | Currículo Lattes | Lattes CV | - | nao |
| `about.links.orcid` | ORCID | ORCID | - | sim (excecao M-07) |
| `about.links.scholar` | Google Scholar | Google Scholar | - | sim (excecao M-07) |
| `about.links.arxiv` | arXiv | arXiv | - | sim (excecao M-07) |
| `about.links.researchgate` | ResearchGate | ResearchGate | - | sim (excecao M-07) |
| `about.links.github` | GitHub | GitHub | - | sim (excecao M-07) |
| `about.links.institucional` | Página institucional | Institutional page | - | nao |
| `about.links.cv` | Currículo em PDF | CV (PDF) | - | nao |
| `research.title` | Linhas e projetos | Research areas and projects | - | nao |
| `research.otherProjects` | Outros projetos | Other projects | - | nao |
| `research.status.em andamento` | Em andamento | In progress | - | nao |
| `research.status.concluído` | Concluído | Completed | - | nao |
| `teaching.title` | Disciplinas | Courses | - | nao |
| `teaching.current` | Atuais | Current | - | nao |
| `teaching.previous` | Anteriores | Previous | - | nao |
| `teaching.noCurrent` | Nenhuma disciplina neste semestre. | No courses this semester. | - | nao |
| `teaching.noPrevious` | Nenhuma disciplina anterior. | No previous courses. | - | nao |
| `teaching.latestLesson` | Última aula | Latest lecture | - | nao |
| `course.back` | Voltar para Ensino | All courses | - | nao |
| `course.status.atual` | Atual | Current | - | nao |
| `course.status.anterior` | Anterior | Previous | - | nao |
| `course.tabsLabel` | Seções da disciplina | Course sections | - | nao |
| `course.syllabus` | Ementa | Syllabus | - | nao |
| `course.lessons` | Aulas | Lectures | - | nao |
| `course.courseScripts` | Scripts da disciplina | Course scripts | - | nao |
| `course.problemSets` | Listas de exercícios | Problem sheets | - | nao |
| `course.materials` | Materiais complementares | Additional materials | - | nao |
| `course.bibliography` | Bibliografia | Bibliography | - | nao |
| `course.links` | Links | Links | - | sim (excecao M-07) |
| `course.noLessons` | Nenhuma aula publicada ainda. | No lectures published yet. | - | nao |
| `course.lessonNumber` | Aula 3 | Lecture 3 | (3) | nao |
| `course.access` | Acessar | Open | - | nao |
| `course.dueDate` | Entrega 15/08/2026 | Due 15/08/2026 | ("15/08/2026") | nao |
| `course.materialType.slides` | Slides | Slides | - | sim (excecao M-07) |
| `course.materialType.notas` | Notas | Notes | - | nao |
| `course.materialType.complementar` | Complementar | Supplementary | - | nao |
| `script.eyebrow` | Script · Python | Script · Python | ("Python") | sim (excecao M-07) |
| `script.language.python` | Python | Python | - | sim (excecao M-07) |
| `script.language.r` | R | R | - | sim (excecao M-07) |
| `script.language.matlab` | MATLAB | MATLAB | - | sim (excecao M-07) |
| `script.language.bash` | Bash | Bash | - | sim (excecao M-07) |
| `script.language.outro` | Código | Code | - | nao |
| `script.copy` | Copiar código | Copy code | - | nao |
| `script.copied` | Copiado | Copied | - | nao |
| `script.openFile` | Abrir arquivo | Open file | - | nao |
| `publications.title` | Publicações | Publications | - | nao |
| `publications.type.artigo` | Artigo | Article | - | nao |
| `publications.type.preprint` | Preprint | Preprint | - | sim (excecao M-07) |
| `publications.type.capítulo` | Capítulo | Chapter | - | nao |
| `publications.type.livro` | Livro | Book | - | nao |
| `publications.type.anais` | Anais | Proceedings | - | nao |
| `publications.type.tese` | Tese | Thesis | - | nao |
| `publications.type.outro` | Outro | Other | - | nao |
| `publications.doi` | DOI | DOI | - | sim (excecao M-07) |
| `publications.arxiv` | arXiv | arXiv | - | sim (excecao M-07) |
| `publications.pdf` | PDF | PDF | - | sim (excecao M-07) |
| `notFound.eyebrow` | Erro 404 | Error 404 | - | nao |
| `notFound.title` | Página não encontrada | Page not found | - | nao |
| `notFound.body` | O endereço pode ter mudado de semestre. Materiais de disciplinas anteriores continuam na página de Ensino. | The address may have changed with the semester. Materials from previous courses remain on the Teaching page. | - | nao |
| `notFound.allPages` | Todas as páginas | All pages | - | nao |
```

### Passo 7 -- Portao de qualidade (recapturado no ciclo 3)

Comando: `npm run lint 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo7-lint.txt`

```
﻿
> haroldo-page@0.1.0 lint
> eslint .
```

Comando: `npm run format:check 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo7-format.txt`

```
﻿
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

Comando: `npm run test:coverage 2>&1 | Tee-Object -FilePath <scratch>\ciclo3\passo7-coverage.txt`

```
﻿
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  19 passed (19)
      Tests  320 passed (320)
   Start at  13:15:09
   Duration  1.36s (transform 4.05s, setup 0ms, import 7.31s, tests 296ms, environment 2ms)

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

### Passo 8 -- Revisao do stakeholder (Decisao 11)

**Registro do orquestrador, 2026-09-28.** O stakeholder revisou a tabela PT -> EN em duas rodadas:

1. Sobre a tabela do ciclo 2, aprovou com as quatro mudanças sugeridas pelo orquestrador (itens 1 a 4 da tabela do "Ciclo 3" acima) e pediu que o inglês seguisse a nomenclatura de <https://davidtong.org/teaching/> e do resto daquele site. Daí os itens 5 a 11 (Lectures, Problem sheets, All courses, Research interests) e a forma final do item 1 ("Assistant Professor of Physics at ...", no molde de "Professor of Theoretical Physics, University of Cambridge").
2. Sobre os 11 valores finais apresentados em tabela, respondeu **"Aprovado."** em 2026-09-28.

Ficaram de fora, por decisão do orquestrador declarada ao stakeholder: o Title Case de davidtong.org (o site mantém caixa de frase nos dois idiomas) e o título "Lecture Notes" para `teaching.title` (a página lista disciplinas, não notas; ficou "Courses"). A tabela do passo 6 acima é a versão aprovada.

