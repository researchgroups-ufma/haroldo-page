# Plano 067 — `/en/teaching/` e `/en/teaching/<slug>/`

**Status:** DONE
**RFs cobertos:** **RF-28**, **RF-29** (slug igual nos dois idiomas), RF-23, RF-24, RF-37, F-06, F-13, RN-01, RN-03, RN-04, RN-06, **F-07**, RF-26, §8.3 (data); sabatina fase 4, Decisões 3, 4, 6 e 13
**Depende de:** planos 065, 063 (`TeachingView`), 064 (`CourseView`, `course-paths.ts`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 9)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existem `/en/teaching/` e uma `/en/teaching/<slug>/` por disciplina publicada, **com o mesmo slug da
rota PT**, interface em inglês, datas "March 15, 2026", conteúdo resolvido campo a campo e o aviso
único. As rotas PT não mudam.

## Arquivos afetados

- `src/pages/en/teaching.astro`, `src/pages/en/teaching/[slug].astro` — novos (páginas finas)
- `src/views/TeachingView.astro` — `localize` em `nome`/`descricao`; `portugueseOnly` em "Última aula"; aviso
- `src/views/CourseView.astro` — `localize` em `nome`/`descricao`/`ementa`; `titleLang` no `PageHeader`; aviso
- `src/components/LessonList.astro`, `src/components/CourseResources.astro`, `src/components/ScriptPanel.astro` — `portugueseOnly` nos campos "P" (Decisão 13)
- `tests/dist/site-gerado.test.ts` — disciplina EN por disciplina publicada, seta "Back to Teaching", rotas fixas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Canário em `content/` autorizado só em `content/disciplinas/2025.1-mecanica-classica.md`**
> (passo 6), revertido por `git checkout --`.

> **Emenda de 2026-10-02:** o `TeachingView.astro` passou de 148 para 175 linhas com o fallback. O dono
> do produto aceitou o excesso sem extração e estendeu a regra a todo plano (PRD §10.4, v0.1.71). A
> Evidência registra a contagem de linhas final das views e componentes tocados.
>
> Autorização adicional (2026-10-02): canário em `content/disciplinas/2026.2-relatividade-geral.md` e
> `content/disciplinas/2025.1-mecanica-classica.md`, juntos, para isolar "P não liga o aviso"; revertidos por `git checkout --`.

## Contexto necessário

**Decisão 3** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): a disciplina usa em `/en` o
**mesmo slug PT** (`/en/teaching/2026-2-relatividade-geral/`); **não** há slug derivado de `en.nome`
nem página de redirecionamento (Decisões 1 e 2 substituídas). A página EN reusa
`courseStaticPaths()` de `src/views/course-paths.ts` (064) — o mesmo conjunto de slugs, então todo
`/ensino/<slug>/` tem par.

**Padrão do 065** (`plans/fase-4-internacionalizacao/065-en-home-e-about-com-aviso.md`, "Contexto
necessário"): `localize` para "T", `portugueseOnly` para "P", `lang` no elemento de bloco, `LangText` em linha, `FallbackNotice` com
`hasFallback`, HTML PT idêntico por comparador com `--ignorar '^en/'`.

**Campos** (tabela do README da fase): `nome`, `descricao`, `ementa` → `course.data.en?.x` (T). No
`CourseView`, o `<h1>` é o nome: passe `titleLang={nome.lang}` ao `PageHeader` (prop do 058) e use
`nome.text` também no `<title>`. A meta "código · semestre · status" é factual + dicionário, sem
`lang`. Datas: `formatDate(x, lang)` (059) já produz o formato EN. Os campos das listas embutidas
(`aulas[].titulo`/`descricao`, `listas[].titulo`, `materiais[].titulo`/`descricao`,
`bibliografia[].referencia`, `links[].titulo`, `scripts[].titulo`/`descricao`) são "P" — **Decisão 13**: passam por `portugueseOnly(texto, lang)`
(061), recebem `lang="pt-BR"` em `/en` e **não** ligam o aviso. Por isso os componentes não devolvem
sinal nenhum à view: derivam o idioma do caminho (decisão de fatiamento 2) e a view calcula
`hasFallback` só com `nome`, `descricao` e `ementa`. **Não** use `localize(texto, undefined, lang)` em
campo "P" — ligaria o aviso em toda disciplina com aula. O código-fonte dos scripts (`codigo`) é factual e nunca leva `lang`.

**Estados vazios e ordem** não mudam por idioma: "Aulas" sempre presente com o estado vazio de F-06
(`t.course.noLessons`), RN-04 na ordem das aulas, F-13 nos scripts órfãos, RN-03 em atuais ×
anteriores (a ordenação por `nome` em `splitCourses` continua com o nome PT, `pt-BR`).

**Links:** `TeachingView` já usa `coursePath(…, lang)` (063); em `/en/teaching/` eles apontam para
`/en/teaching/<slug>/`. A seta de volta do `CourseView` já usa `routePath('teaching', lang)` (064).

**Testes de `dist`:** rotas fixas + `en/teaching/index.html`; "toda disciplina publicada tem
`dist/ensino/<slug>/`" (116–143) passa a exigir também `dist/en/teaching/<slug>/index.html`, e a
recíproca (nenhuma pasta em `dist/en/teaching/` sem disciplina publicada); "seta de volta" (389–407)
passa a cobrir as páginas EN, com o rótulo de `en.course.back` e `href="/en/teaching/"`.

**Regras de código:** README da fase 4. Cite **RF-29** onde o slug é reaproveitado.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `localize` em `TeachingView` e `CourseView`, `portugueseOnly` nos componentes; páginas finas → verify: `npx astro check` colado.
3. Build e PT idêntico → verify: `npm run build:pipeline` colado (rotas `/en/teaching/…` na lista); `retrato <scratch>\depois.json`; `comparar antes.json depois.json --ignorar '^en/'` colado — toda rota PT `IGUAL`.
4. Pares de slug → verify: `ls dist/ensino` e `ls dist/en/teaching` colados — mesmos nomes de pasta.
5. HTML EN real → verify: em `dist/en/teaching/2026-2-relatividade-geral/index.html`, escopado ao `<main>`: `<h1 lang="pt-BR">` (sem `en.nome`), uma data de aula no formato EN, "Lesson N" no texto de leitor de tela, um título de aula com `lang="pt-BR"`, contagem do aviso (1, pelo `nome`) — trechos colados.
6. Canário **em `content/disciplinas/2025.1-mecanica-classica.md`** (autorizado): acrescente `en: { nome: 'Classical Mechanics', descricao: 'Undergraduate course.' }` → build → em `/en/teaching/` e na página EN da disciplina o nome sai em inglês **sem** `lang`, e a página EN da disciplina fica **sem** aviso (todo campo "T" exibido traduzido; ela não tem ementa nem aula); `ls dist/en/teaching` mostra o **mesmo** slug `2025-1-mecanica-classica` (nenhuma pasta `classical-mechanics`, Decisão 3); `/ensino/` inalterado; reverter com `git checkout --`; rebuild → verify: saídas, `git status --short` sem `content/` e `git diff -- content/` vazio colados.
7. Testes de `dist` → verify: `npm run test:dist` colado.
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
9. **Orquestrador — navegador:** `/en/teaching/` e as duas disciplinas EN a 360/768/1440 — `[scrollWidth, clientWidth]`; abas (clique e setas) com rótulos em inglês; botão "Copy code" vira o texto do `en` ao copiar; seta de volta para `/en/teaching/`; aviso uma vez; interface toda em inglês fora dos elementos `lang="pt-BR"`.

## Critérios de aceitação

- [x] `/en/teaching/` e uma `/en/teaching/<slug>/` por disciplina publicada, com o **mesmo slug** da rota PT (Decisão 3)
- [x] Nome/descrição/ementa em inglês quando há `en`, em português com `lang="pt-BR"` quando não; `<h1>` com `lang` pelo `titleLang`
- [x] Datas no formato EN; estados vazios, ordem das aulas e scripts órfãos iguais ao PT
- [x] Campos "P" (aulas, listas, materiais, bibliografia, links, scripts) com `lang="pt-BR"` em `/en`, sem ligar o aviso (Decisão 13); aviso uma vez quando campo "T" caiu no PT, e nenhum com todo "T" traduzido (canário do passo 6)
- [x] Traduzir `en.nome` não muda o slug (canário do passo 6)
- [x] Rotas PT idênticas (comparador com `--ignorar '^en/'`)
- [x] `test:dist` cobre o par de toda disciplina publicada e a seta de volta EN
- [x] Navegador: sem rolagem horizontal; abas e "copiar" funcionando em inglês (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

Execução de 2026-10-02. Passos 1 a 8 rodados pelo executor; o passo 9 (navegador) foi rodado pelo orquestrador, na seção própria no fim desta Evidência. Capturas com `NO_COLOR=1` (sem códigos ANSI).

Emenda de 2026-10-02 (dono do produto): `TeachingView.astro` aceito com mais de 150 linhas, sem extração; a contagem final está no bloco "Contagem de linhas e codificação".

### Passo 1 — retrato "antes"

Fim do `npm run build:pipeline` (últimas 8 linhas) e `retrato antes.json`, sobre o `dist/` do HEAD (já com `/en/research/` e `/en/publications/`; 12 rotas). O HEAD mudou depois só em PRD/plans.
build "antes" (fim):

```
08:40:48   ├─ /sobre/index.html (+4ms) 
08:40:48   ├─ /index.html (+2ms) 
08:40:48 ✓ Completed in 200ms.

08:40:48 [build] ✓ Completed in 805ms.
08:40:48 [build] 12 page(s) built in 1.39s
08:40:48 [build] Complete!
EXIT=0
```
retrato antes:

```
retrato: 12 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a7b90709-d452-447e-b671-ba0d05da6696\scratchpad\067\antes.json
EXIT=0
```

### Passo 2 — `astro check` (estado final do código)

npx astro check:

```
09:16:59 [content] Syncing content
09:16:59 [content] Synced content
09:16:59 [types] Generated 510ms
09:16:59 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (91 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 3 — build final (depois da última edição; revertido o canário e refeito)

`npm run build:pipeline` completo seguido da listagem de carimbos; as três rotas `/en/teaching/…` estão na lista.

npm run build:pipeline:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  09:23:42
   Duration  1.22s (transform 1.90s, setup 0ms, import 3.12s, tests 84ms, environment 0ms)

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
09:24:10 [content] Syncing content
09:24:10 [content] Synced content
09:24:10 [types] Generated 555ms
09:24:10 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (91 files): 
- 0 errors
- 0 warnings
- 0 hints

09:24:19 [content] Syncing content
09:24:20 [content] Synced content
09:24:20 [types] Generated 521ms
09:24:20 [build] output: "static"
09:24:20 [build] mode: "static"
09:24:20 [build] directory: S:\Projetos\academic_page\haroldo\dist\
09:24:20 [build] Collecting build info...
09:24:20 [build] ✓ Completed in 562ms.
09:24:20 [build] Building static entrypoints...
09:24:20 [vite] ✓ built in 420ms
09:24:20 [vite] ✓ built in 96ms
09:24:20 [build] Rearranging server assets...

 generating static routes 
09:24:20   ├─ /404.html (+12ms) 
09:24:20   ├─ /en/about/index.html (+9ms) 
09:24:20   ├─ /en/publications/index.html (+6ms) 
09:24:20   ├─ /en/research/index.html (+6ms) 
09:24:20   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+4ms) 
09:24:20   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+122ms) 
09:24:20   ├─ /en/teaching/index.html (+7ms) 
09:24:20   ├─ /en/index.html (+5ms) 
09:24:20   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
09:24:20   ├─ /ensino/2026-2-relatividade-geral/index.html (+14ms) 
09:24:20   ├─ /ensino/index.html (+3ms) 
09:24:20   ├─ /pesquisa/index.html (+4ms) 
09:24:20   ├─ /publicacoes/index.html (+4ms) 
09:24:20   ├─ /sobre/index.html (+3ms) 
09:24:20   ├─ /index.html (+2ms) 
09:24:20 ✓ Completed in 247ms.

09:24:20 [build] ✓ Completed in 837ms.
09:24:20 [build] 15 page(s) built in 1.42s
09:24:20 [build] Complete!
EXIT=0

FullName                                                                                Length LastWriteTime      
--------                                                                                ------ -------------      
S:\Projetos\academic_page\haroldo\dist\en\teaching\index.html                             9235 02/10/2026 09:24:20
S:\Projetos\academic_page\haroldo\dist\en\teaching\2025-1-mecanica-classica\index.html   10544 02/10/2026 09:24:20
S:\Projetos\academic_page\haroldo\dist\en\teaching\2026-2-relatividade-geral\index.html  24127 02/10/2026 09:24:20
```

### Passo 4 — rotas PT idênticas e pares de slug

retrato depois:

```
retrato: 15 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a7b90709-d452-447e-b671-ba0d05da6696\scratchpad\067\depois.json
EXIT=0
```
comparar antes.json depois.json --ignorar '^en/':

```
IGUAL      404.html
IGNORADA   en/about/index.html
IGNORADA   en/index.html
IGNORADA   en/publications/index.html
IGNORADA   en/research/index.html
IGNORADA   en/teaching/2025-1-mecanica-classica/index.html
IGNORADA   en/teaching/2026-2-relatividade-geral/index.html
IGNORADA   en/teaching/index.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 7
EXIT=0
```
ls dist/ensino e ls dist/en/teaching (mesmos nomes de pasta, RF-29):

```
$ ls dist/ensino
2025-1-mecanica-classica
2026-2-relatividade-geral
index.html
$ ls dist/en/teaching
2025-1-mecanica-classica
2026-2-relatividade-geral
index.html
```

### Passo 5 — HTML EN real, escopado ao `<main>`

`tr '\n' ' '` antes do `grep -o`, porque o HTML da relatividade tem quebras de linha dos blocos de código (Shiki); o `<h1>` está dentro do `<main>`. Na relatividade: `<h1 lang="pt-BR">` sem `en.nome`, data "August 10, 2026", "Lecture 1" no `sr-only`, título de aula com `lang="pt-BR"`, aviso 1 (pelo `nome`). Os `lang="pt-BR"` incluem os campos "P" (Decisão 13); o isolamento de "P" sobre o aviso está no canário duplo do passo 6.

medir.sh (escopo <main>) e trechos:

```
== dist/en/teaching/2026-2-relatividade-geral/index.html
lang="pt-BR" no main: 23
aviso no main: 1
<html lang="en": 1
title: <title>Relatividade Geral — Haroldo Lima Junior</title>
== dist/en/teaching/index.html
lang="pt-BR" no main: 4
aviso no main: 1
<html lang="en": 1
title: <title>Teaching — Haroldo Lima Junior</title>
== dist/en/teaching/2025-1-mecanica-classica/index.html
lang="pt-BR" no main: 2
aviso no main: 1
<html lang="en": 1
title: <title>Mecânica Clássica — Haroldo Lima Junior</title>
-- h1:
<h1 class="text-display-2 titulo-entrada" lang="pt-BR" data-astro-cid-b2i3gsw2>Relatividade Geral</h1>
-- data de aula EN (primeira):
August 10, 2026
-- sr-only Lecture:
<span class="sr-only" data-astro-cid-rxhnkolh>Lecture 1</span>
-- titulo de aula com lang:
<span lang="pt-BR">Variedades, tensores e a conexão de Levi-Civita</span>
```

Campos "P" por painel (mesmo `<main>`; os scripts da disciplina ficam dentro de `aulas` e não há script órfão, por isso não há aba "Course scripts"); rótulos de interface em inglês presentes:

lang por painel:

```
$ campos "P" por painel (<main> da Relatividade EN; lang="pt-BR" dentro de cada seção)
aulas: lang="pt-BR" = 12
listas: lang="pt-BR" = 2
materiais: lang="pt-BR" = 3
bibliografia: lang="pt-BR" = 2
links: lang="pt-BR" = 1
aviso (texto) no main = 1
lang="pt-BR" no main = 23
```

### Passo 6 — canário em `content/disciplinas/2025.1-mecanica-classica.md`

Acrescentado `en: { nome: 'Classical Mechanics', descricao: 'Undergraduate course.' }`, build, medição; depois `git checkout -- <arquivo>` e rebuild (blocos dos passos 3 a 5 e 7 são do build refeito). Resultado: na página EN da Mecânica o nome sai em inglês sem `lang`, o aviso é 0 e não há `lang="pt-BR"`; a pasta continua `2025-1-mecanica-classica` (nenhuma `classical-mechanics`, Decisão 3); `/ensino/` e as demais rotas PT `IGUAL`. Em `/en/teaching/` o nome da Mecânica sai em inglês sem `lang`, mas o aviso continua 1 porque a Relatividade (current, sem `en`) ainda cai no PT.

build com o canário (fim):

```
09:19:17 ✓ Completed in 221ms.

09:19:17 [build] ✓ Completed in 812ms.
09:19:17 [build] 15 page(s) built in 1.44s
09:19:17 [build] Complete!
EXIT=0
```
medição com o canário:

```
== dist/en/teaching/2025-1-mecanica-classica/index.html
lang="pt-BR" no main: 0
aviso no main: 0
<html lang="en": 1
title: <title>Classical Mechanics — Haroldo Lima Junior</title>
== dist/en/teaching/index.html
lang="pt-BR" no main: 3
aviso no main: 1
<html lang="en": 1
title: <title>Teaching — Haroldo Lima Junior</title>
-- h1 da disciplina EN:
<h1 class="text-display-2 titulo-entrada" data-astro-cid-b2i3gsw2>Classical Mechanics</h1>
-- descricao da disciplina EN:
<p class="text-corpo">Undergraduate course.</p>
-- /en/teaching/: link da disciplina anterior:
<span class="text-titulo-item decoration-1 underline-offset-[6px] group-hover:underline" data-astro-cid-ez264afk>Classical Mechanics</span>
-- /en/teaching/: ocorrencias de 'Mecânica Clássica' no main:
0
$ ls dist/en/teaching
2025-1-mecanica-classica
2026-2-relatividade-geral
index.html
-- pasta classical-mechanics existe?
ls: cannot access 'dist/en/teaching/classical-mechanics': No such file or directory
```
comparar antes.json canario.json --ignorar '^en/':

```
retrato: 15 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a7b90709-d452-447e-b671-ba0d05da6696\scratchpad\067\canario.json
IGUAL      404.html
IGNORADA   en/about/index.html
IGNORADA   en/index.html
IGNORADA   en/publications/index.html
IGNORADA   en/research/index.html
IGNORADA   en/teaching/2025-1-mecanica-classica/index.html
IGNORADA   en/teaching/2026-2-relatividade-geral/index.html
IGNORADA   en/teaching/index.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 7
EXIT=0
```
reversão: git status --short e git diff -- content/:

```
$ git status --short
 M plans/fase-4-internacionalizacao/067-en-teaching-e-disciplina.md
 M src/components/CourseResources.astro
 M src/components/LessonList.astro
 M src/components/ScriptPanel.astro
 M src/views/CourseView.astro
 M src/views/TeachingView.astro
 M tests/dist/site-gerado.test.ts
?? src/pages/en/teaching.astro
?? src/pages/en/teaching/
$ git diff -- content/ | wc -l
0
```

#### Passo 6, correção — canário duplo, isolando o campo "P"

Autorizado na emenda de 2026-10-02: `en` com todos os campos "T" exibidos em `2026.2-relatividade-geral.md` (`nome`, `descricao`, `ementa`) e em `2025.1-mecanica-classica.md`, juntos; build; medição; os dois revertidos com `git checkout --` e rebuild (os blocos dos passos 3, 4, 5, 7 e a reversão são do build refeito). Na Relatividade EN o aviso é 0 e o `<h1>` sai sem `lang`, enquanto os `lang="pt-BR"` por painel são os mesmos do passo 5 (aulas 12, listas 2, materiais 3, bibliografia 2, links 1): campo "P" presente em PT, aviso desligado. Em `/en/teaching/` o aviso é 0 e os dois nomes saem em inglês sem `lang`.

medição com o canário duplo (Relatividade e Mecânica com `en`):

```
== dist/en/teaching/2026-2-relatividade-geral/index.html
aulas: lang="pt-BR" = 12
listas: lang="pt-BR" = 2
materiais: lang="pt-BR" = 3
bibliografia: lang="pt-BR" = 2
links: lang="pt-BR" = 1
aviso (texto) no main = 0
lang="pt-BR" no main = 20
h1: <h1 class="text-display-2 titulo-entrada" data-astro-cid-b2i3gsw2>General Relativity</h1>
== dist/en/teaching/index.html
lang="pt-BR" no main: 1
aviso no main: 0
<html lang="en": 1
title: <title>Teaching — Haroldo Lima Junior</title>
<a href="/en/teaching/2026-2-relatividade-geral/" class="link-sublinhado" data-astro-cid-ez264afk>General Relativity</a>
<span class="text-titulo-item decoration-1 underline-offset-[6px] group-hover:underline" data-astro-cid-ez264afk>Classical Mechanics</span>
$ ls dist/en/teaching
2025-1-mecanica-classica
2026-2-relatividade-geral
index.html
```

comparar antes.json canario2.json --ignorar '^en/':

```
retrato: 15 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a7b90709-d452-447e-b671-ba0d05da6696\scratchpad\067\canario2.json
IGUAL      404.html
IGNORADA   en/about/index.html
IGNORADA   en/index.html
IGNORADA   en/publications/index.html
IGNORADA   en/research/index.html
IGNORADA   en/teaching/2025-1-mecanica-classica/index.html
IGNORADA   en/teaching/2026-2-relatividade-geral/index.html
IGNORADA   en/teaching/index.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 7
EXIT=0
```

build com o canário duplo (fim):

```

09:23:22 [build] ✓ Completed in 832ms.
09:23:22 [build] 15 page(s) built in 1.45s
09:23:22 [build] Complete!
EXIT=0
```

### Passo 7 — `npm run test:dist`

Sobre o `dist/` do build final.

npm run test:dist:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  30 passed (30)
   Start at  09:24:22
   Duration  443ms (transform 84ms, setup 0ms, import 173ms, tests 126ms, environment 0ms)

EXIT=0
```

### Passo 8 — portão

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
   Start at  09:20:58
   Duration  1.75s (transform 5.03s, setup 0ms, import 9.32s, tests 388ms, environment 3ms)

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

### Contagem de linhas e codificação

wc -l, file e mojibake dos arquivos tocados:

```
$ wc -l (arquivos tocados)
  176 src/views/TeachingView.astro
  149 src/views/CourseView.astro
  122 src/components/LessonList.astro
  154 src/components/CourseResources.astro
  154 src/components/ScriptPanel.astro
   24 src/pages/en/teaching.astro
   31 src/pages/en/teaching/[slug].astro
  574 tests/dist/site-gerado.test.ts
 1384 total
$ file (arquivos tocados)
src/views/TeachingView.astro:         JavaScript source, Unicode text, UTF-8 text
src/views/CourseView.astro:           JavaScript source, Unicode text, UTF-8 text
src/components/LessonList.astro:      JavaScript source, Unicode text, UTF-8 text
src/components/CourseResources.astro: JavaScript source, Unicode text, UTF-8 text
src/components/ScriptPanel.astro:     JavaScript source, Unicode text, UTF-8 text
src/pages/en/teaching.astro:          JavaScript source, Unicode text, UTF-8 text
src/pages/en/teaching/[slug].astro:   JavaScript source, Unicode text, UTF-8 text
tests/dist/site-gerado.test.ts:       JavaScript source, Unicode text, UTF-8 text
$ grep -c 'Ã\|â€\|Â' (arquivos tocados)
src/views/TeachingView.astro:0
src/views/CourseView.astro:0
src/components/LessonList.astro:0
src/components/CourseResources.astro:0
src/components/ScriptPanel.astro:0
src/pages/en/teaching.astro:0
src/pages/en/teaching/[slug].astro:0
tests/dist/site-gerado.test.ts:0
```

### BOM e cabeçalhos

Correção de documentação (cabeçalhos §10.1 dos cinco arquivos, `Atualizado em: 2026-10-02` e `Dependências` separando `src/i18n` e `src/i18n/fallback.ts`; comando do passo 5 numa linha): só comentário no frontmatter, **sem rebuild**. Recapturados: lint, format:check e o bloco de contagem de linhas e codificação.

BOM no plano (contagem de U+FEFF):

```
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0
```

### Passo 9 — Navegador (orquestrador)

Rodado pelo orquestrador em 2026-10-02, entre 10:00 e 10:16, no Vivaldi com a extensão, sobre `npx astro preview` (porta 4321). O preview servia o `dist/` do build autoritativo do triage3 (09:37:47). Há uma cópia em `scratchpad\067\dist-medido`, e a comparação por hash com o `dist/` no fim das medidas deu `diferencas=0`. Cada rota foi carregada num `<iframe>` com `box-sizing:content-box`, e o `innerWidth` conferido saiu igual à largura pedida. Legenda: `doc` é o par `[scrollWidth, clientWidth]` do documento; `conteudo` é o mesmo par para `#conteudo`.

Saída transcrita do `javascript_tool`. A ferramenta truncou a última medida da primeira rodada, então a Mecânica a 1440 px foi medida de novo, sozinha, às 10:15:32:

```
/en/teaching/                             360  inner=360  doc=[360,360]   conteudo=[320,320]   html=en
/en/teaching/                             768  inner=768  doc=[768,768]   conteudo=[707,707]   html=en
/en/teaching/                             1440 inner=1440 doc=[1440,1440] conteudo=[1328,1328] html=en
/en/teaching/2026-2-relatividade-geral/   360  inner=360  doc=[350,350]   conteudo=[310,310]   html=en
/en/teaching/2026-2-relatividade-geral/   768  inner=768  doc=[758,758]   conteudo=[696,696]   html=en
/en/teaching/2026-2-relatividade-geral/   1440 inner=1440 doc=[1440,1440] conteudo=[1328,1328] html=en
/en/teaching/2025-1-mecanica-classica/    360  inner=360  doc=[360,360]   conteudo=[320,320]   html=en
/en/teaching/2025-1-mecanica-classica/    768  inner=768  doc=[768,768]   conteudo=[707,707]   html=en
Fri Oct 02 2026 10:15:32 inner=1440 sw=[1440,1440] conteudoW=[1328,1328] html=en
```

- **Rolagem horizontal (RF-26):** os pares são iguais nas 9 medidas. A Relatividade sai com 350 e 758 porque a barra vertical do documento ocupa 10 px.
- **Aviso (F-07):** o texto "only available in Portuguese" aparece **1** vez no `<main>` das três rotas. Em `/en/teaching/` e na Relatividade ele vem do nome, da descrição e da ementa em português. Na Mecânica, vem do nome e da descrição, os dois elementos `main [lang="pt-BR"]` da página: `H1:Mecânica Clássica` e `P:Disciplina de graduação em mec…`.
- **Interface em inglês:** tirei de cada rota as subárvores `[lang="pt-BR"]`, `script`, `style`, `pre` e `code` e procurei, no texto que sobrou, os rótulos em português da interface (Aulas, Ensino, Voltar, Listas, Materiais, Bibliografia, Copiar, Copiado, Disciplinas, Atuais, Anteriores, Última, Aula). Não houve nenhuma ocorrência. O texto restante está em inglês: "Courses", "Current", "Latest lecture", "Previous", "Syllabus", "Lectures", "Problem sheets", "Additional materials", "Bibliography", "Links", "Lecture N", "August 10, 2026", "Due September 7, 2026", "Copy code", "Open file", "(opens in new tab)" e "No lectures published yet." (na Mecânica).
- **Abas, na página de topo da Relatividade a 1536 px:** antes do clique, `Lectures:true` e as outras `false`. Um clique real em "Problem sheets" levou o endereço a `#listas`. Depois veio a tecla real `ArrowRight`, com um ouvinte de `keydown` instalado antes, que registrou `["ArrowRight"]`. O resultado foi `Additional materials:true` (as outras `false`), foco em "Additional materials", só o painel `aba-materiais` visível e o endereço em `#materiais`.
- **"Copy code":** instalei um `MutationObserver` no botão antes do clique real. Ele registrou `[38037,"Copied"]` e `[40045,"Copy code"]`, ou seja, o rótulo ficou "Copied" por 2008 ms e voltou. Depois um clique num `<textarea>` injetado seguido de `ctrl+v` colou 323 caracteres, iguais ao `textContent` do `<pre>` (`equalsPre:true`, começando por `def raio_horizonte(massa, spin):`). Antes disso, um primeiro clique caiu numa coordenada errada, fora do botão, e não produziu mutação (`mut:[]`). Não conta como prova.
- **Seta de volta:** `a[aria-label="All courses"]` tem `href="/en/teaching/"`. Um clique real nela levou a `http://localhost:4321/en/teaching/`, título "Teaching — Haroldo Lima Junior", `html lang=en`.
- **Foco por teclado (Tab):** não verificado, porque a tecla Tab da extensão não move o foco nesta máquina.

### Suíte autoritativa e commits intercalados (orquestrador)

- A verificação oficial é a terceira rodada do `triage-runner`: lint, format, coverage (355 testes, 100%), `build:pipeline` (com `astro check` 0/0/0 e 15 páginas), `test:dist` (30 testes) e `audit`, todos `EXIT=0`. As capturas estão em `scratchpad\067\triage3\`, gravadas sob `S--Projetos-academic_page-haroldo`.
- A primeira rodada saiu com `audit` `EXIT=1`, por um aviso high novo no `devalue` 5.9.2, dependência do `astro`. O `914831f` subiu o `devalue` para 5.9.4 só no lock. O revisor comparou o retrato do `dist/` de depois dessa atualização com o `depois.json` do executor e achou 15 rotas IGUAL.
- O `feb7da5` (PRD v0.1.71, §10.4) entrou no meio da execução e só toca documentação.

### Não rodei

- `npm audit`: é do `triage-runner`.
- Commit e mudança de `Status:`: não são do executor.
