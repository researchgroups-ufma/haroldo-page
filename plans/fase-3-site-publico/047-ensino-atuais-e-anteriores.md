# Plano 047 — Ensino: atuais e anteriores (RF-23)

**Status:** TODO
**RFs cobertos:** **RF-23**, RN-03, RN-01, RF-06 (disciplina aparece na listagem), RF-26
**Depende de:** planos 038 (`toParagraphs`), 039 (`filterPublished`), 041 (`splitCourses`, `countCourseItems`,
`buildCourseSlugs`, `courseSlug`), 042, 043
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`/ensino/` mostra dois grupos sempre rotulados — "Atuais" antes de "Anteriores" —, cada disciplina
publicada com link para a própria página, e estado vazio explícito quando um grupo não tem disciplina.

## Arquivos afetados

- `src/pages/ensino.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. **O plano 048 cria `src/pages/ensino/[slug].astro` em paralelo**
> — não o crie nem edite. Não rode build ao mesmo tempo que outro executor (README da fase).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.4 (Ensino), §8 (sem numeral nas disciplinas atuais)
e §1. `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**Rota.** `src/pages/ensino.astro` gera `/ensino/` e convive com `src/pages/ensino/[slug].astro`
(plano 048) — é o layout do §7.5 do PRD. Link de cada disciplina: `` `/ensino/${courseSlug(entry.filePath)}/` ``
(barra final — README da fase, decisão 7). Chame também `buildCourseSlugs(entries)` uma vez sobre
as publicadas: se houver slug duplicado, o build reprova aqui do mesmo jeito que no 048.

**Dados atuais** (comparação): `content/disciplinas/2026.2-relatividade-geral.md` — `status: atual`,
`codigo: FIS0000`, 5 aulas, 2 listas, 1 script; `content/disciplinas/2025.1-mecanica-classica.md` —
`status: anterior`, sem `codigo`, sem aulas.

**Composição (§6.4):**
- `const { current, previous } = splitCourses(filterPublished(await getCollection('disciplinas')))`
  (`// RN-01`, `// RN-03: transição manual, sem lógica de data`).
- `BaseLayout title={pt.nav.teaching}`; `PageHeader eyebrow={pt.teaching.eyebrow} title={pt.teaching.title}`.
- **Grupo "Atuais"** (`<h2>` `pt.teaching.current`) **sempre renderizado**: células de 2 colunas a
  partir de `sm`, cada uma um `<a>` inteiro: `codigo` (se houver) e `semestre` em `text-pequeno
  text-secundario` · `nome` em `<h3 class="text-display-2">` · `descricao` (primeiro parágrafo via
  `toParagraphs`, se houver) · rodapé com as contagens **não nulas** de `countCourseItems`
  (`pt.teaching.lessons(n)`, `problemSets(n)`, `scripts(n)`, separadas por ` · `) e
  `pt.teaching.open` com `›`. **Sem numeral** (disciplinas atuais não são sequência — §8). Hover
  `bg-bloco`.
- Grupo vazio → caixa com borda tracejada (`border border-dashed border-tracejado`) e texto
  `pt.teaching.noCurrent` em `text-secundario` (o texto é quem informa; a borda é redundante, §2).
- **Grupo "Anteriores"** (`<h2>` `pt.teaching.previous`) **sempre renderizado**: linhas de lista
  (§5.5), cada uma um `<a>`: `codigo` · `nome` · `descricao` · `semestre` `›`; abaixo de `sm`
  empilham. Vazio → mesma caixa tracejada com `pt.teaching.noPrevious`.
- Os dois `<h2>` existem sempre — o RF-23 pede "dois grupos rotulados, atuais primeiro".

**Valores esperados:** Atuais com 1 célula "Relatividade Geral", "FIS0000 · 2026.2", rodapé "5 aulas ·
2 listas · 1 script", link `/ensino/2026-2-relatividade-geral/`; Anteriores com "Mecânica Clássica"
e link `/ensino/2025-1-mecanica-classica/`.

## Passos

1. `src/pages/ensino.astro` → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/ensino/index.html`.
3. HTML → verify: cole `grep -o 'href="/ensino/[^"]*"' dist/ensino/index.html`, `grep -o '<h2[^>]*>[^<]*' dist/ensino/index.html` (Atuais antes de Anteriores) e `grep -o '[0-9] aulas\? · [^<]*' dist/ensino/index.html`.
4. Canário do estado vazio, sem tocar em `content/`: force temporariamente `current = []`, build, cole `grep -o 'Nenhuma disciplina neste semestre.' dist/ensino/index.html` e a presença do `<h2>` "Atuais"; desfaça e mostre a versão final → verify: saídas coladas.
5. Orquestrador — "Verificação no navegador" do README em `/ensino/`, 360/768/1440: `[scrollWidth, clientWidth]`; células inteiras clicáveis; Tab com foco visível; "Ensino" com `aria-current`.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Dois grupos rotulados, "Atuais" primeiro, sempre presentes (RF-23)
- [ ] Links com o slug do plano 041 e barra final
- [ ] Contagens só não nulas; nenhum numeral nas atuais
- [ ] Estado vazio tracejado com texto, provado pelo canário do passo 4
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–4, 6) e pelo orquestrador (5). Declare o que NÃO rodou.>
