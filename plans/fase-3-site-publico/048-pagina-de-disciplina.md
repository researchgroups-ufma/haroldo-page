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

- [ ] Uma página por disciplina publicada, em `/ensino/<slug>/`; rascunho não gera página
- [ ] Aulas na ordem do arquivo (canário do passo 5), com número, título, descrição, data `dd/mm/aaaa` e "Abrir ↗" em nova aba (RF-24)
- [ ] Disciplina sem aulas mostra "Nenhuma aula publicada ainda." (F-06); demais seções vazias somem
- [ ] Listas com "Entrega dd/mm/aaaa" quando houver; materiais com tipo legível; bibliografia ordenada; links
- [ ] "Nesta página" lista só as seções presentes, com contagem
- [ ] `groupScriptsByLesson` calculado no frontmatter e nenhum script renderizado (fica para o 049)
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440 nas duas páginas, transcritos com data e horário
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–6, 8) e pelo orquestrador (7). Declare o que NÃO rodou.>
