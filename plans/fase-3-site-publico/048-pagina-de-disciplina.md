# Plano 048 — Página de disciplina (RF-24, F-06, RN-04)

**Status:** TODO
**RFs cobertos:** **RF-24**, RF-07, RF-08, RN-04, F-06, RN-01, §8.3 (data pt-BR, links externos),
RF-26. Scripts (RF-37) ficam para o plano 049
**Depende de:** planos 038 (`toParagraphs`, `formatDate`, `padCount`), 039 (`filterPublished`),
041 (`courseSlug`, `buildCourseSlugs`, `presentSections`, `groupScriptsByLesson`), 042, 043
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Cada disciplina publicada tem página em `/ensino/<slug>/` com ementa, aulas na ordem do professor,
listas, materiais, bibliografia e links; aula sem cadastro mostra estado vazio explícito. Os pontos
onde os scripts entram (sob cada aula e no grupo geral) ficam prontos para o plano 049, sem
renderizar script ainda.

## Arquivos afetados

- `src/pages/ensino/[slug].astro` — novo
- `src/components/LessonList.astro` — novo (aulas; mantém a página < 150 linhas)
- `src/components/CourseResources.astro` — novo (listas, materiais, bibliografia, links)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. O plano 047 cria `src/pages/ensino.astro` em paralelo — não o
> edite. Não rode build ao mesmo tempo que outro executor (README da fase).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.5 (Disciplina), §5.5 (linha de lista e link
externo), §8 ("PDF ↗" vira "Abrir ↗": URL agnóstica ao hospedeiro, D-07). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`. Link externo **só** por `ExternalLink.astro`.

**Rotas (`getStaticPaths`).**

```ts
export async function getStaticPaths() {
  const courses = filterPublished(await getCollection('disciplinas')); // RN-01
  buildCourseSlugs(courses); // lança em slug duplicado: o build reprova nomeando os dois arquivos
  return courses.map((course) => ({ params: { slug: courseSlug(course.filePath) }, props: { course } }));
}
```

Slug: README da fase, decisão 3.
Rascunho **não gera página** (RF-10). URL esperada com o conteúdo atual:
`/ensino/2026-2-relatividade-geral/` e `/ensino/2025-1-mecanica-classica/`.

**Composição (§6.5), na ordem:**
1. `BaseLayout title={course.data.nome}`. Trilha antes do cabeçalho: `<nav aria-label="breadcrumb">`
   com `aria-label={pt.course.breadcrumbLabel}`, link `/ensino/` (`pt.course.breadcrumb`) ` / ` e
   `codigo` (ou `nome` sem código).
2. `PageHeader eyebrow={pt.course.breadcrumb} title={nome}` com `aside`: tags `codigo` (`strong`, se
   houver), `semestre` (`neutral`) e `pt.course.status[status]` (`neutral`); `descricao`
   (`toParagraphs`); e "Nesta página" (`pt.course.onThisPage`) — lista de âncoras de
   `presentSections(data, general.length)` com rótulo `pt.course[key]` e a contagem.
3. **Ementa** (`<section id="ementa">`, `<h2>` `pt.course.syllabus`) — só se houver; parágrafos.
4. **Aulas** (`<section id="aulas">`, **sempre**): `LessonList`. Sem aulas: `pt.course.noLessons`
   em caixa tracejada (**F-06**).
5. **Scripts da disciplina** — **não** renderizado neste plano. Calcule `const { general } =
   groupScriptsByLesson(data.aulas ?? [], data.scripts ?? [])` no frontmatter (só `general`: variável
   sem uso reprova o `lint`) (o `general.length`
   já alimenta `presentSections`) e deixe um único comentário de frontmatter
   `// plano 049: <section id="scripts"> com ScriptPanel para cada script de general, e byLesson no LessonList`.
   Com o conteúdo atual `general` é vazio, então "Nesta página" não lista a seção.
6. `CourseResources` com listas, materiais, bibliografia e links (cada seção só se `length > 0`).

**`LessonList.astro`** — props: `lessons: Aula[]` (o plano 049 acrescenta `byLesson`). Para cada aula, **na ordem do array** (`// RN-04: ordem do professor, não por
número nem data`): numeral `text-numeral-sm` com `numero` (valor bruto, **não** `padCount` — é o
número que o professor deu), com `<span class="sr-only">{pt.course.lessonNumber(numero)}</span>` ·
`titulo` (`text-titulo-item`) · `descricao` (`toParagraphs`) · `data` via `formatDate` (só se houver)
· `ExternalLink href={url}` com `pt.course.open`. Cada aula é um `<li>` de uma `<ol>` sem marcador
visível (a posição é sequência). Nada de script aqui.

**`CourseResources.astro`** — props: `data` da disciplina. Seções (`<section id>` e `<h2>`):
- `listas` (`pt.course.problemSets`): `titulo` · `pt.course.dueDate(formatDate(data_entrega))` se
  houver · `ExternalLink` `pt.course.open`.
- `materiais` (`pt.course.materials`): células com rubrica `pt.course.materialType[tipo]` · `titulo` ·
  `descricao` · `ExternalLink` `pt.course.open`.
- `bibliografia` (`pt.course.bibliography`): `<ol>` (é lista ordenada no §6.5) com `referencia` e,
  se `url`, `ExternalLink` `pt.course.access`.
- `links` (`pt.course.links`): `ExternalLink` com `titulo`, estilo de tag neutra.

**Dados atuais** (`content/disciplinas/2026.2-relatividade-geral.md`, comparação): 5 aulas numeradas
1–5 com datas `2026-08-10`… → `10/08/2026`…; 2 listas, a primeira com entrega `07/09/2026`, a
segunda sem; 2 materiais (`slides`, `notas`); 2 referências (1 com URL); 1 link; 1 script com
`aula: 4` → vai para `byLesson[3]`, logo **não** há seção "Scripts da disciplina". Mecânica Clássica:
sem aulas → "Nenhuma aula publicada ainda."; sem ementa; sem nenhuma outra seção.

RF-24, literal: "Dada uma disciplina com 3 aulas e 2 listas, quando o visitante abre a página, então
vê as 5 entradas com título, data (quando houver) e link que abre o arquivo no Drive em nova aba".

## Passos

1. Os três arquivos → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/ensino/*/index.html` colado (duas páginas).
3. HTML de Relatividade Geral → verify: cole `grep -o '10/08/2026\|07/09/2026' dist/ensino/2026-2-relatividade-geral/index.html`, `grep -c 'target="_blank"' ...` (5 aulas + 2 listas + 2 materiais + 1 referência + 1 link = 11), `grep -o 'id="[a-z]*"' ...` e `grep -c 'Scripts da disciplina' ...` (0).
4. HTML de Mecânica Clássica → verify: `grep -o 'Nenhuma aula publicada ainda.' dist/ensino/2025-1-mecanica-classica/index.html` e `grep -c '<section' ...` (1).
5. Canário RN-04, sem tocar em `content/`: em `LessonList`, ordene temporariamente `lessons` por `numero` decrescente, build, cole a ordem dos numerais (5…1); desfaça e cole a ordem final (1…5) → verify: saídas coladas.
6. Canário de slug duplicado: rode `npx vitest run tests/lib/courses.test.ts` e cole o teste de duplicado verde (a checagem é testada no 041; aqui só se confirma que a página chama `buildCourseSlugs` — cole `grep -n buildCourseSlugs src/pages/ensino/[slug].astro`).
7. Orquestrador — "Verificação no navegador" do README nas duas páginas, 360/768/1440: `[scrollWidth, clientWidth]`; âncoras de "Nesta página" levam às seções; links abrem em nova aba; "Ensino" com `aria-current`; fluxo D do §8.1 do PRD (Home → Ensino → disciplina → lista) contado em toques/cliques e transcrito.
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] Uma página por disciplina publicada, em `/ensino/<slug>/`; rascunho não gera página
- [x] Aulas na ordem do arquivo (canário do passo 5), com número, título, descrição, data `dd/mm/aaaa` e "Abrir ↗" em nova aba (RF-24)
- [x] Disciplina sem aulas mostra "Nenhuma aula publicada ainda." (F-06); demais seções vazias somem
- [x] Listas com "Entrega dd/mm/aaaa" quando houver; materiais com tipo legível; bibliografia ordenada; links
- [x] "Nesta página" lista só as seções presentes, com contagem
- [x] `groupScriptsByLesson` calculado no frontmatter e nenhum script renderizado (fica para o 049)
- [x] `[scrollWidth, clientWidth]` iguais em 360/768/1440 nas duas páginas, transcritos com data e horário — feito pelo orquestrador em 2026-09-18, 19:19:55–19:21:25 (seção 7 da Evidência)
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

Correção obrigatória aplicada aos passos 3 e 4: o plano mandava `grep -c 'target="_blank"' ...` e `grep -c '<section' ...` para **contar ocorrências**. Isso está errado sobre `dist/**/index.html` minificado em uma única linha — `grep -c` conta *linhas casadas*, só pode devolver `0` ou `1` (armadilha documentada no README da fase, achada no plano 045). Toda contagem abaixo usa `grep -o '<padrão>' <arquivo> | wc -l` em vez de `grep -c`.


### Ciclo 2 — correções pedidas pela revisão

**Obrigatório 1 (identificador de PRD errado).** `src/components/CourseResources.astro` citava `(F-08)` para a regra "seção some se vazia"; `F-08` é *"Imagem ausente"* (`PRD.md:297`), não essa regra. Corrigido para `(§6.5 da identidade: "Toda seção exceto Aulas some quando vazia")`. `src/pages/ensino/[slug].astro:133` mantém `F-06` sem alteração — é o identificador certo para o estado vazio de Aulas.

**grep -n F-08 nos três arquivos (vazio esperado)** (`grep-f08-check.txt`, colado do scratchpad):

```
EXIT_GREP:1
```


**Obrigatório 2 (canário de rascunho, autorizado pelo orquestrador, tocando `content/` fora da lista de "Arquivos afetados").**

1. `content/disciplinas/2025.1-mecanica-classica.md`: `publicado: true` → `publicado: false`.
2. Build — deve sair só a página de Relatividade Geral, e `dist/ensino/2025-1-mecanica-classica/` deve deixar de existir:

**build com a disciplina como rascunho** (`canario-draft-build.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:26:36
   Duration  1.14s (transform 1.78s, setup 0ms, import 2.95s, tests 78ms, environment 0ms)

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
[2m19:27:05[22m [34m[content][39m Syncing content
[2m19:27:05[22m [34m[content][39m Synced content
[2m19:27:05[22m [34m[types][39m Generated [2m562ms[22m
[2m19:27:05[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (49 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:27:12[22m [34m[content][39m Syncing content
[2m19:27:12[22m [34m[content][39m Synced content
[2m19:27:12[22m [34m[types][39m Generated [2m572ms[22m
[2m19:27:12[22m [34m[build][39m output: [34m"static"[39m
[2m19:27:12[22m [34m[build][39m mode: [34m"static"[39m
[2m19:27:12[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:27:12[22m [34m[build][39m Collecting build info...
[2m19:27:12[22m [34m[build][39m [32m✓ Completed in 614ms.[39m
[2m19:27:12[22m [34m[build][39m Building static entrypoints...
[2m19:27:13[22m [34m[vite][39m [32m✓ built in 377ms[39m
[2m19:27:13[22m [34m[vite][39m [32m✓ built in 66ms[39m
[2m19:27:13[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:27:13[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+14ms)[22m 
[2m19:27:13[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m19:27:13[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+5ms)[22m 
[2m19:27:13[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m19:27:13[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m19:27:13[22m [32m✓ Completed in 55ms.
[39m
[2m19:27:13[22m [34m[build][39m [32m✓ Completed in 570ms.[39m
[2m19:27:13[22m [34m[build][39m 5 page(s) built in [1m1.24s[22m
[2m19:27:13[22m [34m[build][39m [1mComplete![22m
---DIST LISTING (canario: rascunho)---
total 16
drwxr-xr-x 1 andne 197609    0 Sep 18 19:27 .
drwxr-xr-x 1 andne 197609    0 Sep 18 19:27 ..
drwxr-xr-x 1 andne 197609    0 Sep 18 19:27 2026-2-relatividade-geral
-rw-r--r-- 1 andne 197609 8301 Sep 18 19:27 index.html
---Test-Path mecanica-classica---
NAO EXISTE
EXIT:0
```


3. Revertido com `git checkout -- content/disciplinas/2025.1-mecanica-classica.md` (autorizado pelo orquestrador; o arquivo está commitado, ao contrário dos três arquivos novos deste plano). Prova da reversão — `content/` não aparece em `git status --short`, e `git diff -- content/` vazio:

**prova da reversão** (`canario-revert-proof.txt`, colado do scratchpad):

```
=== git status --short ===
 M plans/fase-3-site-publico/048-pagina-de-disciplina.md
 A src/components/CourseResources.astro
 A src/components/LessonList.astro
 A src/pages/ensino/[slug].astro
=== git diff -- content/ ===
(fim, vazio esperado)
```


4. Build final de novo, com as duas disciplinas de volta — é o mesmo build citado no "Passo 2" abaixo (`build-final2.txt`), e os passos 3 e 4 abaixo já estão recapturados sobre ele.


### Passo 1 — `npx astro check`

**astro check (recapturado após a correção do F-08)** (`astro-check2.txt`, colado do scratchpad):

```
[2m19:29:38[22m [34m[content][39m Syncing content
[2m19:29:38[22m [34m[content][39m Synced content
[2m19:29:38[22m [34m[types][39m Generated [2m490ms[22m
[2m19:29:38[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (49 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT:0
```


### Passo 2 — `npm run build:pipeline` e listagem de `dist/ensino/*/index.html`

Build inicial do ciclo 1 (antes do canário do passo 5):

**build:pipeline (ciclo 1, inicial)** (`build1.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:07:32
   Duration  1.14s (transform 1.81s, setup 0ms, import 2.99s, tests 66ms, environment 0ms)

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
[2m19:08:02[22m [34m[content][39m Syncing content
[2m19:08:02[22m [34m[content][39m Synced content
[2m19:08:02[22m [34m[types][39m Generated [2m537ms[22m
[2m19:08:02[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (49 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:08:09[22m [34m[content][39m Syncing content
[2m19:08:09[22m [34m[content][39m Synced content
[2m19:08:09[22m [34m[types][39m Generated [2m501ms[22m
[2m19:08:09[22m [34m[build][39m output: [34m"static"[39m
[2m19:08:09[22m [34m[build][39m mode: [34m"static"[39m
[2m19:08:09[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:08:09[22m [34m[build][39m Collecting build info...
[2m19:08:09[22m [34m[build][39m [32m✓ Completed in 542ms.[39m
[2m19:08:09[22m [34m[build][39m Building static entrypoints...
[2m19:08:09[22m [34m[vite][39m [32m✓ built in 375ms[39m
[2m19:08:09[22m [34m[vite][39m [32m✓ built in 61ms[39m
[2m19:08:09[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:08:10[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+10ms)[22m 
[2m19:08:10[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+4ms)[22m 
[2m19:08:10[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m19:08:10[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+4ms)[22m 
[2m19:08:10[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m19:08:10[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m19:08:10[22m [32m✓ Completed in 51ms.
[39m
[2m19:08:10[22m [34m[build][39m [32m✓ Completed in 554ms.[39m
[2m19:08:10[22m [34m[build][39m 6 page(s) built in [1m1.11s[22m
[2m19:08:10[22m [34m[build][39m [1mComplete![22m
---DIST LISTING---
-rw-r--r-- 1 andne 197609  8110 Sep 18 19:08 dist/ensino/2025-1-mecanica-classica/index.html
-rw-r--r-- 1 andne 197609 17349 Sep 18 19:08 dist/ensino/2026-2-relatividade-geral/index.html
EXIT:0
```


Build final do ciclo 1, depois de desfazer o canário RN-04 do passo 5:

**build:pipeline (ciclo 1, final)** (`build-final.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:10:43
   Duration  1.14s (transform 1.79s, setup 0ms, import 2.96s, tests 65ms, environment 0ms)

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
[2m19:11:11[22m [34m[content][39m Syncing content
[2m19:11:11[22m [34m[content][39m Synced content
[2m19:11:11[22m [34m[types][39m Generated [2m553ms[22m
[2m19:11:11[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (49 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:11:19[22m [34m[content][39m Syncing content
[2m19:11:19[22m [34m[content][39m Synced content
[2m19:11:19[22m [34m[types][39m Generated [2m482ms[22m
[2m19:11:19[22m [34m[build][39m output: [34m"static"[39m
[2m19:11:19[22m [34m[build][39m mode: [34m"static"[39m
[2m19:11:19[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:11:19[22m [34m[build][39m Collecting build info...
[2m19:11:19[22m [34m[build][39m [32m✓ Completed in 522ms.[39m
[2m19:11:19[22m [34m[build][39m Building static entrypoints...
[2m19:11:19[22m [34m[vite][39m [32m✓ built in 345ms[39m
[2m19:11:19[22m [34m[vite][39m [32m✓ built in 59ms[39m
[2m19:11:19[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:11:19[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+10ms)[22m 
[2m19:11:19[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+4ms)[22m 
[2m19:11:19[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m19:11:19[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+4ms)[22m 
[2m19:11:19[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+5ms)[22m 
[2m19:11:19[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m19:11:19[22m [32m✓ Completed in 57ms.
[39m
[2m19:11:19[22m [34m[build][39m [32m✓ Completed in 530ms.[39m
[2m19:11:19[22m [34m[build][39m 6 page(s) built in [1m1.07s[22m
[2m19:11:19[22m [34m[build][39m [1mComplete![22m
---DIST LISTING---
-rw-r--r-- 1 andne 197609  8110 Sep 18 19:11 dist/ensino/2025-1-mecanica-classica/index.html
-rw-r--r-- 1 andne 197609 17349 Sep 18 19:11 dist/ensino/2026-2-relatividade-geral/index.html
Fri Sep 18 19:11:19     2026
EXIT:0
```


Build final do ciclo 2, depois de desfazer o canário de rascunho (Obrigatório 2 acima) — este é o build que sustenta os passos 3 e 4 recapturados a seguir:

**build:pipeline (ciclo 2, final)** (`build-final2.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:28:01
   Duration  1.17s (transform 1.82s, setup 0ms, import 3.08s, tests 70ms, environment 0ms)

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
[2m19:28:29[22m [34m[content][39m Syncing content
[2m19:28:29[22m [34m[content][39m Synced content
[2m19:28:29[22m [34m[types][39m Generated [2m540ms[22m
[2m19:28:29[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (49 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:28:36[22m [34m[content][39m Syncing content
[2m19:28:37[22m [34m[content][39m Synced content
[2m19:28:37[22m [34m[types][39m Generated [2m499ms[22m
[2m19:28:37[22m [34m[build][39m output: [34m"static"[39m
[2m19:28:37[22m [34m[build][39m mode: [34m"static"[39m
[2m19:28:37[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:28:37[22m [34m[build][39m Collecting build info...
[2m19:28:37[22m [34m[build][39m [32m✓ Completed in 543ms.[39m
[2m19:28:37[22m [34m[build][39m Building static entrypoints...
[2m19:28:37[22m [34m[vite][39m [32m✓ built in 333ms[39m
[2m19:28:37[22m [34m[vite][39m [32m✓ built in 63ms[39m
[2m19:28:37[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:28:37[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+12ms)[22m 
[2m19:28:37[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+4ms)[22m 
[2m19:28:37[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m19:28:37[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+6ms)[22m 
[2m19:28:37[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m19:28:37[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m19:28:37[22m [32m✓ Completed in 57ms.
[39m
[2m19:28:37[22m [34m[build][39m [32m✓ Completed in 509ms.[39m
[2m19:28:37[22m [34m[build][39m 6 page(s) built in [1m1.07s[22m
[2m19:28:37[22m [34m[build][39m [1mComplete![22m
---DIST LISTING---
-rw-r--r-- 1 andne 197609  8110 Sep 18 19:28 dist/ensino/2025-1-mecanica-classica/index.html
-rw-r--r-- 1 andne 197609 17349 Sep 18 19:28 dist/ensino/2026-2-relatividade-geral/index.html
Fri Sep 18 19:28:37     2026
EXIT:0
```


Com as duas disciplinas publicadas, `dist/ensino/` sempre gera exatamente duas páginas: `dist/ensino/2025-1-mecanica-classica/index.html` e `dist/ensino/2026-2-relatividade-geral/index.html`. Com a disciplina marcada como rascunho (canário acima), gera **uma só**, e o diretório da disciplina em rascunho deixa de existir — prova de RF-10/RN-01 feita de verdade, não só por leitura do código.


### Passo 3 — HTML de Relatividade Geral (sobre o build final do ciclo 2)

**passo 3, build final do ciclo 2** (`step3-final2.txt`, colado do scratchpad):

```
=== grep -o dates ===
10/08/2026
07/09/2026
=== grep -o target=_blank | wc -l ===
13
=== grep -o id="[a-z]*" ===
id="conteudo"
id="ementa"
id="aulas"
id="listas"
id="materiais"
id="bibliografia"
id="links"
=== grep -o 'Scripts da disciplina' | wc -l ===
0
```


**Divergência encontrada e reportada, não contornada:** `target="_blank"` deu **13**, não 11. Diagnóstico (não é o comando oficial do passo, só a investigação da causa): `grep -o 'target="_blank"'` dentro de `<main>…</main>` dá **11** (bate com a conta do plano: 5 aulas + 2 listas + 2 materiais + 1 referência com URL + 1 link), e **2** ocorrências ficam fora de `<main>`, no `SiteFooter.astro` (`src/components/SiteFooter.astro:69-77`), que renderiza um `target="_blank"` por link preenchido de `perfil.links` — o perfil atual tem `lattes` e `orcid` preenchidos, em **toda** rota do site, não só na página de disciplina. `SiteFooter.astro` está fora da lista de arquivos afetados deste plano; não editei o arquivo nem escopei o grep para forçar o número 11. Isto é o mesmo padrão de contaminação de cabeçalho/rodapé já registrado no README da fase para o canário de rótulo órfão ("Armadilha de canário achada no 045"), agora incidindo sobre a contagem de `target="_blank"` do passo 3. O critério de aceitação RF-24 (11 entradas com link) está atendido pelo conteúdo da própria página (11 dentro de `<main>`); os 13 do documento inteiro incluem chrome do site comum a toda rota.


### Passo 4 — HTML de Mecânica Clássica (sobre o build final do ciclo 2)

**passo 4, build final do ciclo 2** (`step4-final2.txt`, colado do scratchpad):

```
=== grep -o 'Nenhuma aula publicada ainda.' ===
Nenhuma aula publicada ainda.
=== grep -o '<section' | wc -l ===
1
```


### Passo 5 — Canário RN-04 (ordem do professor, não por número)

`LessonList.astro` foi editado temporariamente para ordenar `lessons` por `numero` decrescente (`const CANARIO_lessons = [...lessons].sort((a, b) => b.numero - a.numero)`), sem tocar em `content/`. Build com o canário e ordem extraída de `dist/ensino/2026-2-relatividade-geral/index.html`:

**build com canário (ordem decrescente)** (`canario-desc-build.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:09:39
   Duration  1.15s (transform 1.80s, setup 0ms, import 2.96s, tests 68ms, environment 0ms)

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
[2m19:10:08[22m [34m[content][39m Syncing content
[2m19:10:08[22m [34m[content][39m Synced content
[2m19:10:08[22m [34m[types][39m Generated [2m483ms[22m
[2m19:10:08[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (49 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:10:15[22m [34m[content][39m Syncing content
[2m19:10:15[22m [34m[content][39m Synced content
[2m19:10:15[22m [34m[types][39m Generated [2m476ms[22m
[2m19:10:15[22m [34m[build][39m output: [34m"static"[39m
[2m19:10:15[22m [34m[build][39m mode: [34m"static"[39m
[2m19:10:15[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:10:15[22m [34m[build][39m Collecting build info...
[2m19:10:15[22m [34m[build][39m [32m✓ Completed in 515ms.[39m
[2m19:10:15[22m [34m[build][39m Building static entrypoints...
[2m19:10:15[22m [34m[vite][39m [32m✓ built in 335ms[39m
[2m19:10:15[22m [34m[vite][39m [32m✓ built in 59ms[39m
[2m19:10:15[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:10:16[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+12ms)[22m 
[2m19:10:16[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+4ms)[22m 
[2m19:10:16[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m19:10:16[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+4ms)[22m 
[2m19:10:16[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m19:10:16[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m19:10:16[22m [32m✓ Completed in 55ms.
[39m
[2m19:10:16[22m [34m[build][39m [32m✓ Completed in 539ms.[39m
[2m19:10:16[22m [34m[build][39m 6 page(s) built in [1m1.11s[22m
[2m19:10:16[22m [34m[build][39m [1mComplete![22m
EXIT:0
```

**ordem extraída — decrescente (5…1)** (`canario-desc-order.txt`, colado do scratchpad):

```
Aula 5
Aula 4
Aula 3
Aula 2
Aula 1
```


O canário foi desfeito **editando o arquivo de volta** (não `git checkout --`, porque `LessonList.astro` é novo e não commitado — o comando o apagaria inteiro). Depois de desfazer, recapturei a ordem sobre o build do ciclo 1:

**ordem extraída — revertido, ciclo 1 (1…5)** (`canario-final-order.txt`, colado do scratchpad):

```
Aula 1
Aula 2
Aula 3
Aula 4
Aula 5
```


### Passo 6 — Canário de slug duplicado

O teste de duplicado já existe e é testado no 041; aqui só confirmo que a página nova chama `buildCourseSlugs`. Nenhuma mudança do ciclo 2 afeta este arquivo — bloco mantido do ciclo 1.

**vitest run tests/lib/courses.test.ts** (`step6-vitest.txt`, colado do scratchpad):

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  25 passed (25)
   Start at  19:11:49
   Duration  236ms (transform 46ms, setup 0ms, import 89ms, tests 18ms, environment 0ms)

EXIT:0
```

**grep -n buildCourseSlugs src/pages/ensino/[slug].astro** (`step6-grep.txt`, colado do scratchpad):

```
22: *                 buildCourseSlugs, groupScriptsByLesson, presentSections),
45:  buildCourseSlugs,
55:  buildCourseSlugs(courses);
```


### 7. Verificação no navegador (orquestrador)

Feita pelo **orquestrador**, não pelo executor. Vivaldi (Chromium) com a extensão Claude in Chrome,
sobre `npx astro preview` (`http://localhost:4321`) servindo o `dist/` do build autoritativo das
19:16:52. **2026-09-18, 19:19:55–19:21:25 (GMT-0300)**, transcrita da saída de `javascript_tool`.

Técnica: a janela fica maximizada e o `resize_window` da extensão não muda o viewport nesta
máquina, então cada rota foi carregada em `<iframe>` de 360, 768 e 1440 px no documento de topo —
as media queries seguem a largura do iframe (mesma técnica dos planos 042–047).

**`[scrollWidth, clientWidth]` de `document.documentElement`, nas duas páginas:**

| Rota | 360 px | 768 px | 1440 px |
|---|---|---|---|
| `/ensino/2026-2-relatividade-geral/` | `[345, 345]` | `[753, 753]` | `[1425, 1425]` |
| `/ensino/2025-1-mecanica-classica/` | `[345, 345]` | `[753, 753]` | `[1440, 1440]` |

Iguais em todos os seis casos — **sem rolagem horizontal (RF-26)**. A diferença de 15 px para a
largura do iframe é a barra de rolagem vertical; Mecânica Clássica a 1440 px devolve `[1440, 1440]`
porque a página é curta e não tem barra.

**Elemento cortado:** nenhum, nas três larguras das duas rotas (conferido por captura de tela).

**Estrutura das duas páginas** (lida do DOM renderizado):

| | Relatividade Geral | Mecânica Clássica |
|---|---|---|
| Trilha | `Ensino / FIS0000` | `Ensino / Mecânica Clássica` |
| Link da trilha | `/ensino/` | `/ensino/` |
| `<h1>` | Relatividade Geral | Mecânica Clássica |
| `section[id]` | `ementa, aulas, listas, materiais, bibliografia, links` | `aulas` |
| `<h2>` das seções | Ementa · Aulas · Listas de exercícios · Materiais complementares · Bibliografia · Links | Aulas |
| "Nenhuma aula publicada ainda." | ausente | **presente** |
| "Scripts da disciplina" | **ausente** (fica para o 049) | ausente |

A trilha confirma o `codigo ?? nome` do plano nos dois caminhos: **com** código em Relatividade
Geral (`FIS0000`), **com o nome** em Mecânica Clássica, que não tem código.

**Estado vazio (F-06), medido por CSSOM** na caixa de Mecânica Clássica: `border-top-style: dashed`,
`border-top-color: rgb(154, 150, 145)` — que é `#9a9691`, exatamente o token `--color-tracejado` do
§2 da identidade.

**"Nesta página" — as seis âncoras existem e o alvo de cada uma existe no documento:**
`Ementa (1)` → `#ementa` · `Aulas (5)` → `#aulas` · `Listas de exercícios (2)` → `#listas` ·
`Materiais complementares (2)` → `#materiais` · `Bibliografia (2)` → `#bibliografia` ·
`Links (1)` → `#links`. As contagens batem com o conteúdo, e **não há entrada para "Scripts da
disciplina"** — o `general` de `groupScriptsByLesson` é vazio hoje (o único script tem `aula: 4`).

**As âncoras navegam de verdade, não apenas existem.** Clique real em `#aulas` a partir do topo:
`scrollY` 0 → 710 e o topo da seção em **0** no viewport. Clique em `#bibliografia`: `scrollY` 0 →
1871 com a seção a 378 px do topo — **não é defeito**: 1871 é a rolagem máxima da página
(`scrollHeight - clientHeight`), então o navegador rolou até o fim e a seção parou onde cabia.

**Aulas na ordem do professor (RN-04), lidas do HTML final:** numerais `1, 2, 3, 4, 5`, rótulos de
leitor de tela `Aula 1`…`Aula 5`, e as datas em `dd/mm/aaaa` —
`10/08/2026`, `17/08/2026`, `24/08/2026`, `31/08/2026`, `14/09/2026`.

**Links externos.** `main a[target="_blank"]` = **11** em Relatividade Geral; na página inteira =
**13**. As 2 de diferença são do rodapé (`perfil.links`: Lattes e ORCID), presente em toda rota —
reproduz exatamente o diagnóstico que o executor deu no passo 3. **Todos** os `target="_blank"` da
página trazem `rel` com `noopener` (medido: `every(...)` = `true`).

**`aria-current`:** `header a[aria-current]` devolve exatamente um elemento — `"Ensino" = page` —
nas duas páginas de disciplina.

**Fluxo D do §8.1 do PRD** ("Aluno busca a lista de exercícios (celular)"; meta: **quatro toques**
da home ao arquivo), medido a **360 px com cliques reais**, partindo de `/`:

| Toque | Ação | Resultado |
|---|---|---|
| 1 | célula-caminho "Ensino" na Home | `/ensino/` |
| 2 | célula da disciplina atual | `/ensino/2026-2-relatividade-geral/` |
| 3 | "Listas de exercícios (2)" em "Nesta página" | `#listas`, seção a **0 px** do topo do viewport |
| 4 | "Abrir ↗" da primeira lista | `href="https://exemplo.invalid/rg-2026-2/lista-01"`, `target="_blank"`, `rel="noopener noreferrer"` |

**Quatro toques — a meta do §8.1 é cumprida.** O toque 4 não foi clicado de fato (abriria aba
externa para um domínio de exemplo); o que foi verificado é o destino do link, seu `target` e seu
`rel`.

**Foco visível — NÃO observado por teclado.** A tecla Tab enviada pela extensão não move o foco
nesta máquina (limitação registrada no README da fase desde o plano 042). Continua sendo dívida a
fechar no plano 053.


### Passo 8 — Portão de qualidade (recapturado após a correção do F-08)

**npm run lint** (`lint2.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT:0
```

**npm run format:check** (`format-check2.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT:0
```

**npm run test:coverage** (`test-coverage2.txt`, colado do scratchpad):

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  19:29:05
   Duration  1.49s (transform 3.57s, setup 0ms, import 6.02s, tests 232ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    98.88 |     100 |     100 |                   
 src/lib           |     100 |    98.83 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 179/179 )
Branches     : 98.88% ( 89/90 )
Functions    : 100% ( 53/53 )
Lines        : 100% ( 162/162 )
================================================================================
EXIT:0
```


### O que NÃO rodei

- Passo 7 (verificação no navegador) — **não rodado por mim, executor**; foi feito pelo
  **orquestrador** em 2026-09-18, 19:19:55–19:21:25, e está na seção 7 acima. A navegação por
  **Tab** continua não observada (a extensão não move o foco nesta máquina) e segue como dívida
  da fase, a fechar no plano 053.
- `npm ci`, `npm audit --audit-level=high` e o CI do GitHub Actions (verificação autoritativa da fase, não deste despacho).
- Não commitei nada; `Status:` permanece `TODO`.

