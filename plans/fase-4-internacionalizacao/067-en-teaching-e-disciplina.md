# Plano 067 — `/en/teaching/` e `/en/teaching/<slug>/`

**Status:** TODO
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

- [ ] `/en/teaching/` e uma `/en/teaching/<slug>/` por disciplina publicada, com o **mesmo slug** da rota PT (Decisão 3)
- [ ] Nome/descrição/ementa em inglês quando há `en`, em português com `lang="pt-BR"` quando não; `<h1>` com `lang` pelo `titleLang`
- [ ] Datas no formato EN; estados vazios, ordem das aulas e scripts órfãos iguais ao PT
- [ ] Campos "P" (aulas, listas, materiais, bibliografia, links, scripts) com `lang="pt-BR"` em `/en`, sem ligar o aviso (Decisão 13); aviso uma vez quando campo "T" caiu no PT, e nenhum com todo "T" traduzido (canário do passo 6)
- [ ] Traduzir `en.nome` não muda o slug (canário do passo 6)
- [ ] Rotas PT idênticas (comparador com `--ignorar '^en/'`)
- [ ] `test:dist` cobre o par de toda disciplina publicada e a seta de volta EN
- [ ] Navegador: sem rolagem horizontal; abas e "copiar" funcionando em inglês (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 9 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
