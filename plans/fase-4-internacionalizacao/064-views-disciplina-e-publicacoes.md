# Plano 064 — Views: Disciplina e Publicações

**Status:** TODO
**RFs cobertos:** sabatina fase 4, Decisões 3 e 6; §10.4; RF-24, RF-37, F-06, F-13, RF-25, RN-02 sem mudança de comportamento
**Depende de:** planos 055, 056, 058, 059
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 7)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O corpo de `ensino/[slug].astro` e de `publicacoes.astro` vira `CourseView` e `PublicationsView`; as
abas da disciplina (marcação, script e estilo) viram `CourseTabs.astro`; o script da sanfona de
Publicações sai para um módulo; o `getStaticPaths` da disciplina vira uma função reusável pela rota EN
(067). As páginas ficam finas, as views abaixo de 150 linhas, e o HTML das rotas PT não muda.

## Arquivos afetados

- `src/views/CourseView.astro`, `src/views/PublicationsView.astro` — novos
- `src/views/course-paths.ts` — novo (`courseStaticPaths()`)
- `src/components/CourseTabs.astro` — novo
- `src/scripts/publications-accordion.ts` — novo (o `<script>` da sanfona, sem mudança de lógica)
- `src/pages/ensino/[slug].astro`, `src/pages/publicacoes.astro` — viram páginas finas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. Sem rota EN e sem `localize` aqui (066, 067).

## Contexto necessário

**Padrão de view e de página fina:** o do plano 062 (`plans/fase-4-internacionalizacao/062-views-home-sobre-e-404.md`,
"Contexto necessário").

**Disciplina (`src/pages/ensino/[slug].astro`, 261 linhas):**
- `getStaticPaths` (54–63) → `src/views/course-paths.ts`, `export async function courseStaticPaths()`
  com o mesmo corpo (`filterPublished`, `buildCourseSlugs`, `params: { slug: courseSlug(...) }`,
  `props: { course }`). **Decisão 3** da sabatina: o slug é o mesmo nos dois idiomas, então a rota EN
  (067) reusa a mesma função. A página fina: `export const getStaticPaths = courseStaticPaths;` (ou
  `export async function getStaticPaths() { return courseStaticPaths(); }` — use a forma que o
  `astro check` aceitar) e `<CourseView lang="pt" course={Astro.props.course} />`. `src/views/` **não**
  está na cobertura do Vitest (`vitest.config.ts` inclui `src/lib/**` e `src/i18n/**`); a função é
  coberta pelo build e pelo `test:dist`.
- `CourseTabs.astro` recebe `tabs` (`{ id, key }[]` de `presentSections`, já sem `syllabus`) e
  renderiza o `#curso-abas` (107–131), o `<style>` das abas (161–205, inclusive os `:global([data-abas]
  …)`) e o `<script>` (207–260), sem mudança de lógica. Rótulos por `t.course[tab.key]`, `aria-label`
  por `t.course.tabsLabel`.
- `CourseView`: o restante (cabeçalho com `back`, painéis, `CourseResources`), com
  `back={{ href: routePath('teaching', lang), label: t.course.back }}` no lugar do `'/ensino/'` fixo
  (91) e `t.course.status[data.status]` na meta. O `tests/dist/site-gerado.test.ts` (389–407) exige o
  link "Voltar para Ensino" com `href="/ensino/"` antes do `<h1>` — continua valendo.

**Publicações (`src/pages/publicacoes.astro`, 208 linhas):** o `<script>` (98–207) vai para
`src/scripts/publications-accordion.ts`, importado por `<script>import '../scripts/publications-accordion';</script>`
na view (padrão de script processado do Astro). **O GSAP continua por `import()` dinâmico** — o teste
`tests/dist/site-gerado.test.ts:348-366` reprova se o ScrollTrigger for carregado de saída; ele tem de
seguir verde. `PublicationsView`: `BaseLayout title={t.nav.publications}` (o 057 já fez a troca) e
`<h1>` `t.publications.title`.

**Tamanho:** cada view, `CourseTabs` e o módulo < 150 linhas.

**Prova:** o comparador remove `<style>` mas **mantém** os `<script>` inline e compara o script
externo pelo conteúdo, não pelo nome do chunk (055, emendado em 2026-09-25) — mover o script da
sanfona para a view não muda o retrato se o conteúdo for o mesmo. Ele prova marcação e scripts; **o
navegador prova o comportamento das abas e da sanfona** (passo 7). As duas provas são necessárias.
**Limite do comparador (revisão do 055):** ele lê o conteúdo do script externo só um nível abaixo —
os chunks que ele importa (gsap, ScrollTrigger) entram só pelo nome. Se a extração fizer o Vite
separar a lógica da sanfona num chunk compartilhado, essa lógica sai do retrato: confira no `dist/`
que o chunk de entrada de `publicacoes/` continua contendo a lógica, e diga isso na Evidência.

**Regras de código:** README da fase 4. Os comentários de RF-37/F-13/F-06/RN-04/RN-02 vão com o código
que explicam. O módulo `.ts` em `src/scripts/` leva cabeçalho §10.1 e TSDoc na função exportada, se
houver; a lógica é a atual, só mudada de arquivo.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `course-paths.ts`, `CourseTabs.astro`, `CourseView.astro` e a página fina da disciplina → verify: `npx astro check` colado.
3. `publications-accordion.ts`, `PublicationsView.astro` e a página fina → verify: `npx astro check` colado; `wc -l` dos sete arquivos colado.
4. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0.
5. `npm run test:dist` → verify: saída colada, incluindo o teste do ScrollTrigger e o da seta de volta.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador — navegador:** `/ensino/2026-2-relatividade-geral/` (abas: clique, setas ←/→, `#listas` na URL escolhe a aba; sem JS, seções empilhadas) e `/publicacoes/` a 1440 sem movimento reduzido (sanfona: rolar fecha o ano e abre o seguinte; clique no ano) e a 360 (anos todos abertos); `[scrollWidth, clientWidth]` a 360/768/1440 nas duas.

## Critérios de aceitação

- [ ] `CourseView`, `PublicationsView`, `CourseTabs`, `course-paths.ts` e `publications-accordion.ts` criados; páginas finas
- [ ] Voltar para Ensino por `routePath`; nenhum `pt` direto nas views e no componente
- [ ] Todos os arquivos novos e as páginas abaixo de 150 linhas (contagem colada)
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [ ] `test:dist` verde, inclusive "GSAP sob demanda" e "seta de volta"
- [ ] Abas e sanfona funcionando como antes no navegador (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 7 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
