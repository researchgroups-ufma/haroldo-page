# Plano 046 — Pesquisa: linhas e projetos (RF-22, RF-13)

**Status:** TODO
**RFs cobertos:** **RF-22**, RF-13, RF-09 (ordem), RN-01, F-08, RF-26
**Depende de:** planos 038 (`toParagraphs`, `padCount`), 039 (`filterPublished`, `sortResearchLines`,
`sortProjects`, `countActiveProjectsByLine`, `relatedLineAnchor`), 042, 043
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`/pesquisa/` lista as linhas de pesquisa publicadas na ordem definida pelo professor, cada uma com
resumo, texto completo e imagem quando houver, e abaixo os projetos publicados com status, período,
financiador, colaboradores e link para a linha relacionada.

## Arquivos afetados

- `src/pages/pesquisa.astro` — novo
- `src/components/ProjectCard.astro` — novo (mantém a página < 150 linhas, §10.4)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Outros planos da onda 3 podem estar editando `src/pages/*` e
> criando componentes em paralelo; não rode build ao mesmo tempo que outro executor (README da fase).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.3 (Pesquisa), §5.4 (Tag: "Em andamento" forte com
marcador; "Concluído" neutra tracejada), §5.5 (linha de lista) e §8 (o botão "Texto completo" sai —
Decisão 3 da sabatina: `corpo` é exibido inline, sem rota própria). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**Dados** (conteúdo atual, para comparar):
- `content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md` — `ordem: 1`;
  `sombras-de-buracos-negros.md` — `ordem: 2`. Nenhuma tem `corpo` nem `imagem`.
- `content/projetos/sombras-de-buracos-negros-em-gravitacao-modificada.md` — `status: em andamento`,
  `linha_relacionada: content/linhas-pesquisa/sombras-de-buracos-negros.md` (vira `{ collection,
  id: 'sombras-de-buracos-negros' }` depois do Zod);
  `forcas-de-mare-em-espacos-tempos-de-kerr.md` — `status: concluído`, `periodo: {inicio: '2023.1',
  fim: '2025.2'}`, `financiador: Sem financiamento externo`, sem linha.

**Composição (§6.3):**
- `const lines = sortResearchLines(filterPublished(await getCollection('linhas-pesquisa')))` e
  `const projects = sortProjects(filterPublished(await getCollection('projetos')))` (`// RN-01`).
- `PageHeader eyebrow={pt.research.summary(lines.length, projects.length)} title={pt.research.title}`
  (rubrica com as contagens derivadas: "2 linhas · 2 projetos"). `BaseLayout title={pt.nav.research}`.
- **Uma linha de grade por linha de pesquisa**, `<section id={entry.id}>` (âncora; `entry.id` aqui
  **é** adequado — ids de `linhas-pesquisa` vêm de `{slug(titulo)}.md`, sem ponto, e é o mesmo id que
  `linha_relacionada` carrega): numeral da **posição** na lista ordenada (`padCount(i + 1)`,
  `text-numeral`, `aria-hidden`) · `<h2 class="text-display-2">` `titulo` e, se
  `countActiveProjectsByLine(projects).get(entry.id)` > 0, `Tag variant="strong" dot` com
  `pt.research.activeProjects(n)` (some se zero) · `resumo` e `corpo` por `toParagraphs` · `imagem`
  (se houver) com `alt={titulo}`, `loading="lazy"`. Sem `imagem`, a coluna não reserva espaço (F-08).
  Régua forte abrindo a lista, fina entre linhas.
- **Projetos:** rubrica `<h2>` `pt.research.projects`; grade `grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]`
  de `ProjectCard`. **Sem projetos publicados, a seção inteira some** (§6.3).
- `const publishedLineIds = new Set(lines.map((l) => l.id))`, passado a `relatedLineAnchor` — link
  para linha não publicada **não** é gerado (`// RN-01`).

**`ProjectCard.astro`** — props: `project` (entrada da coleção `projetos`), `lineHref?: string`,
`lineTitle?: string`. Conteúdo, cada item só se houver dado:
- tag de `status` (`em andamento` → `Tag variant="strong" dot`; `concluído` → `Tag variant="neutral"
  dashed`; texto `pt.research.status[status]`); sem `status`, sem tag;
- `titulo` (`<h3 class="text-titulo-item">`);
- entre réguas: `periodo.inicio`–`periodo.fim` (só `inicio` quando não há `fim`, com traço `–` só se
  houver `fim`) e `financiador` — valores como gravados, **sem** `formatDate` (são semestres, não
  datas);
- `descricao` por `toParagraphs`;
- `colaboradores` (rubrica `pt.research.collaborators`, nomes separados por `, `);
- link interno `<a href={lineHref}>` com `pt.research.relatedLine` e o título da linha, só com
  `lineHref`.

**Valores esperados com o conteúdo atual:** rubrica "2 linhas · 2 projetos"; `01` Relatividade
Geral…, `02` Sombras de buracos negros com tag "1 projeto em andamento"; projetos: primeiro o "em
andamento" com link `#sombras-de-buracos-negros`, depois o "concluído" com "2023.1–2025.2".

## Passos

1. `ProjectCard.astro` e `pesquisa.astro` → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/pesquisa/index.html`.
3. HTML → verify: cole `grep -o 'id="[a-z0-9-]*"' dist/pesquisa/index.html`, `grep -o 'href="#[^"]*"' dist/pesquisa/index.html`, `grep -o 'projetos\? em andamento' dist/pesquisa/index.html` e `grep -c '<h1' dist/pesquisa/index.html`.
4. Canário RN-01 da âncora, sem tocar em `content/`: passe temporariamente `new Set()` a `relatedLineAnchor`, build, cole `grep -c 'href="#sombras' dist/pesquisa/index.html` = `0`; desfaça e mostre a versão final → verify: saídas coladas.
5. Orquestrador — "Verificação no navegador" do README em `/pesquisa/`, 360/768/1440: `[scrollWidth, clientWidth]`; cards de projeto empilhando em 360; clique no link da linha relacionada rola até a âncora; Tab com foco visível.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Linhas publicadas na ordem de `ordem`, com numeral de posição, âncora `id`, resumo e (se houver) corpo e imagem (RF-22)
- [ ] Tag "N projetos em andamento" só quando N > 0
- [ ] Projetos publicados, em andamento antes de concluídos, com status, período, financiador, descrição e colaboradores quando houver (RF-13)
- [ ] Link para linha relacionada só para linha publicada (canário do passo 4)
- [ ] Seção Projetos some sem projetos publicados; sem `imagem`, nenhum espaço reservado
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–4, 6) e pelo orquestrador (5). Declare o que NÃO rodou.>
