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
  `sombras-de-buracos-negros.md` — `ordem: 2`. **Correção de 2026-09-18 (revisão do 046):** o plano
  dizia "Nenhuma tem `corpo` nem `imagem`" — falso;
  `relatividade-geral-e-teorias-alternativas-de-gravitacao.md:6` **tem** `corpo` ("A linha investiga
  soluções de buraco negro em relatividade geral..."). Nenhuma das duas tem `imagem`;
  `sombras-de-buracos-negros.md` não tem `corpo`.
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

- [x] Linhas publicadas na ordem de `ordem`, com numeral de posição, âncora `id`, resumo e (se houver) corpo e imagem (RF-22)
- [x] Tag "N projetos em andamento" só quando N > 0
- [x] Projetos publicados, em andamento antes de concluídos, com status, período, financiador, descrição e colaboradores quando houver (RF-13)
- [x] Link para linha relacionada só para linha publicada (canário do passo 4)
- [x] Seção Projetos some sem projetos publicados; sem `imagem`, nenhum espaço reservado
- [x] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário — feito pelo orquestrador no passo 5 (360: 345/345, 768: 753/753, 1440: 1425/1425, em 2026-09-18 14:16 UTC−3)
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

### Passo 1 — `npx astro check`
```
[2m13:55:46[22m [34m[content][39m Syncing content
[2m13:55:46[22m [34m[content][39m Synced content
[2m13:55:46[22m [34m[types][39m Generated [2m523ms[22m
[2m13:55:46[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (45 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### Passo 2 — `npm run build:pipeline` e `ls dist/pesquisa/index.html`
```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:55:58
   Duration  1.20s (transform 1.85s, setup 0ms, import 3.11s, tests 82ms, environment 0ms)

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
[2m13:56:29[22m [34m[content][39m Syncing content
[2m13:56:29[22m [34m[content][39m Synced content
[2m13:56:29[22m [34m[types][39m Generated [2m575ms[22m
[2m13:56:29[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (45 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:56:37[22m [34m[content][39m Syncing content
[2m13:56:37[22m [34m[content][39m Synced content
[2m13:56:37[22m [34m[types][39m Generated [2m528ms[22m
[2m13:56:37[22m [34m[build][39m output: [34m"static"[39m
[2m13:56:37[22m [34m[build][39m mode: [34m"static"[39m
[2m13:56:37[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:56:37[22m [34m[build][39m Collecting build info...
[2m13:56:37[22m [34m[build][39m [32m✓ Completed in 571ms.[39m
[2m13:56:37[22m [34m[build][39m Building static entrypoints...
[2m13:56:37[22m [34m[vite][39m [32m✓ built in 351ms[39m
[2m13:56:37[22m [34m[vite][39m [32m✓ built in 60ms[39m
[2m13:56:37[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:56:37[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+21ms)[22m 
[2m13:56:37[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m13:56:37[22m   [34m├─[39m [2m/index.html[22m [2m(+4ms)[22m 
[2m13:56:37[22m [32m✓ Completed in 40ms.
[39m
[2m13:56:37[22m [34m[build][39m [32m✓ Completed in 520ms.[39m
[2m13:56:37[22m [34m[build][39m 3 page(s) built in [1m1.11s[22m
[2m13:56:37[22m [34m[build][39m [1mComplete![22m
```
```
-rw-r--r-- 1 andne 197609 10494 Sep 18 13:56 dist/pesquisa/index.html
```

### Passo 3 — HTML de `dist/pesquisa/index.html`

`grep -o 'id="[a-z0-9-]*"' dist/pesquisa/index.html`
```
id="menu-botao"
id="menu-caixa"
id="menu-lista"
id="conteudo"
id="relatividade-geral-e-teorias-alternativas-de-gravitacao"
id="sombras-de-buracos-negros"
id="rodape-grade"
```

`grep -o 'href="#[^"]*"' dist/pesquisa/index.html`
```
href="#conteudo"
href="#sombras-de-buracos-negros"
```

`grep -o 'projetos\? em andamento' dist/pesquisa/index.html`
```
projeto em andamento
```

`grep -c '<h1' dist/pesquisa/index.html` (citado pelo plano — ver divergência abaixo)
```
1
```

`grep -o '<h1' dist/pesquisa/index.html | wc -l` (método correto, armadilha do README da fase)
```
1
```

Comparação com o conteúdo atual (rubrica, numerais, período) — não é critério, é conferência:
```
== rubrica (contagens derivadas) ==
2 linhas · 2 projetos
== numerais de posição ==
class="text-numeral" data-astro-cid-qmoi4cri>01</span>
class="text-numeral" data-astro-cid-qmoi4cri>02</span>
== periodo com traço ==
2023.1–2025.2
```

### Passo 4 — Canário RN-01 da âncora

Edição temporária em `src/pages/pesquisa.astro:113`: `relatedLineAnchor(project, publishedLineIds)` → `relatedLineAnchor(project, new Set())`. Build com o canário aplicado:
```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:57:02
   Duration  1.19s (transform 1.86s, setup 0ms, import 3.06s, tests 74ms, environment 0ms)

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
[2m13:57:32[22m [34m[content][39m Syncing content
[2m13:57:32[22m [34m[content][39m Synced content
[2m13:57:32[22m [34m[types][39m Generated [2m539ms[22m
[2m13:57:32[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
[96msrc/pages/pesquisa.astro[0m:[93m54[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'publishedLineIds' is declared but its value is never read.

[7m54[0m const publishedLineIds = new Set(lines.map((line) => line.id));
[7m  [0m [93m      ~~~~~~~~~~~~~~~~[0m

Result (45 files): 
- 0 errors
- 0 warnings
- 1 hint

[2m13:57:40[22m [34m[content][39m Syncing content
[2m13:57:40[22m [34m[content][39m Synced content
[2m13:57:40[22m [34m[types][39m Generated [2m560ms[22m
[2m13:57:40[22m [34m[build][39m output: [34m"static"[39m
[2m13:57:40[22m [34m[build][39m mode: [34m"static"[39m
[2m13:57:40[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:57:40[22m [34m[build][39m Collecting build info...
[2m13:57:40[22m [34m[build][39m [32m✓ Completed in 603ms.[39m
[2m13:57:40[22m [34m[build][39m Building static entrypoints...
[2m13:57:41[22m [34m[vite][39m [32m✓ built in 360ms[39m
[2m13:57:41[22m [34m[vite][39m [32m✓ built in 63ms[39m
[2m13:57:41[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:57:41[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+21ms)[22m 
[2m13:57:41[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+8ms)[22m 
[2m13:57:41[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m13:57:41[22m [32m✓ Completed in 48ms.
[39m
[2m13:57:41[22m [34m[build][39m [32m✓ Completed in 559ms.[39m
[2m13:57:41[22m [34m[build][39m 3 page(s) built in [1m1.22s[22m
[2m13:57:41[22m [34m[build][39m [1mComplete![22m
```

`grep -c 'href="#sombras' dist/pesquisa/index.html` com o canário (esperado `0`):
```
0
exit=1
```

`grep -o 'href="#sombras' dist/pesquisa/index.html | wc -l` com o canário (esperado `0`):
```
0
```

Reversão à mão (não `git checkout`/`git restore` — apagariam os dois arquivos novos e não commitados):
```
== git status --short (arquivos novos, sem git checkout/restore) ==
?? src/components/ProjectCard.astro
?? src/pages/pesquisa.astro
== confirma ausência do new Set() temporário ==
(nenhuma ocorrência de new Set() -- canário revertido)
== linha final de relatedLineAnchor ==
113:            const lineHref = relatedLineAnchor(project, publishedLineIds);
```

Build final, com o canário revertido:
```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  13:58:02
   Duration  1.18s (transform 1.89s, setup 0ms, import 3.11s, tests 76ms, environment 0ms)

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
[2m13:58:33[22m [34m[content][39m Syncing content
[2m13:58:33[22m [34m[content][39m Synced content
[2m13:58:33[22m [34m[types][39m Generated [2m526ms[22m
[2m13:58:33[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (45 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:58:40[22m [34m[content][39m Syncing content
[2m13:58:40[22m [34m[content][39m Synced content
[2m13:58:40[22m [34m[types][39m Generated [2m575ms[22m
[2m13:58:40[22m [34m[build][39m output: [34m"static"[39m
[2m13:58:40[22m [34m[build][39m mode: [34m"static"[39m
[2m13:58:40[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:58:40[22m [34m[build][39m Collecting build info...
[2m13:58:40[22m [34m[build][39m [32m✓ Completed in 619ms.[39m
[2m13:58:40[22m [34m[build][39m Building static entrypoints...
[2m13:58:41[22m [34m[vite][39m [32m✓ built in 345ms[39m
[2m13:58:41[22m [34m[vite][39m [32m✓ built in 58ms[39m
[2m13:58:41[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:58:41[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+22ms)[22m 
[2m13:58:41[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+5ms)[22m 
[2m13:58:41[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m13:58:41[22m [32m✓ Completed in 45ms.
[39m
[2m13:58:41[22m [34m[build][39m [32m✓ Completed in 502ms.[39m
[2m13:58:41[22m [34m[build][39m 3 page(s) built in [1m1.14s[22m
[2m13:58:41[22m [34m[build][39m [1mComplete![22m
```

`grep -o 'href="#sombras[^"]*"' dist/pesquisa/index.html` — âncora de volta:
```
href="#sombras-de-buracos-negros"
```

### Passo 5 — Verificação no navegador (orquestrador)

Feita em **2026-09-18, 14:16 (UTC−3, Horário Padrão de Brasília)**, sobre o `dist/` gerado às
**14:15:38** (ver "Nota sobre os builds", abaixo), servido por `npx astro preview` em
`http://localhost:4321/pesquisa/`.

**Método.** Como nos planos 042–045: a janela do Chrome desta máquina fica maximizada e o
`resize_window` da extensão não muda o viewport, então `/pesquisa/` foi carregada dentro de
`<iframe>` de 360, 768 e 1440 px (`display: block`), e o `javascript_tool` lê o documento de dentro.

`[scrollWidth, clientWidth]` de `document.documentElement`:

```
{"carimbo":"Fri Sep 18 2026 14:16:32 GMT-0300 (Horário Padrão de Brasília)","out":{"360":{"larguraIframe":360,"scrollWidth":345,"clientWidth":345},"768":{"larguraIframe":768,"scrollWidth":753,"clientWidth":753},"1440":{"larguraIframe":1440,"scrollWidth":1425,"clientWidth":1425}}}
```

| Largura | `scrollWidth` | `clientWidth` | Iguais? |
| --- | --- | --- | --- |
| 360 | 345 | 345 | ✅ |
| 768 | 753 | 753 | ✅ |
| 1440 | 1425 | 1425 | ✅ |

Os 15 px de diferença para a largura do iframe são a barra de rolagem vertical. **Nenhuma rolagem
horizontal nas três larguras (RF-26).**

**Cards de projeto empilhando a 360, e a grade das linhas de pesquisa:**

```
360:  nCards 2   gradeCards "304.8px"                            cards [20,305] [20,305]    gradeLinhaPesquisa "304.8px"
768:  nCards 2   gradeCards "333.688px 333.688px"                cards [31,334] [388,334]   gradeLinhaPesquisa "112px 547.375px"
1440: nCards 2   gradeCards "310.2px 310.2px 310.2px 310.2px"    cards [56,310] [390,310]   gradeLinhaPesquisa "112px 1168.8px"
```

A 360 os dois cards ficam **um por linha** (uma coluna de 304,8 px, mesmo `x`), e a linha de
pesquisa também empilha (numeral acima do texto). A 768 e 1440 a linha de pesquisa vira duas
colunas, `112px` para o numeral.

**Sobre as quatro colunas a 1440 com apenas dois cards:** é o comportamento de `auto-fill`, que cria
trilhas vazias, e é **o que a especificação manda literalmente** — o §6.3 de
`docs/identidade-visual.md` escreve `repeat(auto-fill, minmax(17rem, 1fr))`. Conferido na fonte
única, não inferido. Consequência visual: a 1440 os dois cards ocupam ~43% da largura e o restante
fica vazio. Não é desvio do plano nem da identidade; fica **registrado** caso o dono do produto
queira `auto-fit` (que esticaria os cards) numa emenda da especificação.

**Estrutura renderizada** (documento de 1440):

```
h1                 1  — "Linhas e projetos"
rubrica            "2 linhas · 2 projetos"
h2 (main)          ["Relatividade geral e teorias alternativas de gravitação", "Sombras de buracos negros", "Projetos"]
h3 (main)          ["Sombras de buracos negros em gravitação modificada", "Forças de maré em espaços-tempos de Kerr"]
numerais           [["01","true"], ["02","true"]]        (aria-hidden, como o plano pede)
secIds             ["relatividade-geral-e-teorias-alternativas-de-gravitacao", "sombras-de-buracos-negros"]
imgsEmMain         0                                     (nenhuma linha tem `imagem` — F-08)
tags               ["1 projeto em andamento", "Em andamento", "Concluído"]
periodoFinanciador ["2025.1", "2023.1–2025.2", "Sem financiamento externo"]
linkLinha          [["Linha relacionada: Sombras de buracos negros", "#sombras-de-buracos-negros"]]
colaboradores      [false, false]                        (nenhum projeto tem o campo — bloco não renderiza)
```

A tag "1 projeto em andamento" sai no **singular** e só na linha 02. O primeiro projeto tem
`periodo.inicio` sem `fim` e aparece como **"2025.1", sem traço** — o caso que o plano descreve
("traço `–` só se houver `fim`") exercitado com conteúdo real. Um `<h1>` só.

**Clique na âncora da linha relacionada.** Rolagem até o fim da página, clique real no link do card
e leitura do estado antes e depois:

```
{"antes":{"scrollY":731,"hash":"","topoAlvo":-135},"depois":{"scrollY":596,"hash":"#sombras-de-buracos-negros","topoAlvo":0},"alvoVisivel":true}
```

O `hash` passa a `#sombras-de-buracos-negros` e o topo da `<section>` alvo vai a `0` — a seção
encosta no topo do viewport. **A âncora funciona de verdade, não só existe no HTML.**

**Links são alvo de acerto nas três larguras** (`elementFromPoint` no centro, após `scrollIntoView`):

```
{"360":[{"texto":"Linha relacionada: Sombras d","alvoNoPonto":"o proprio link"}],"768":[{"texto":"Linha relacionada: Sombras d","alvoNoPonto":"o proprio link"}],"1440":[{"texto":"Linha relacionada: Sombras d","alvoNoPonto":"o proprio link"}]}
```

**Foco visível — NÃO observado como o teclado o produz.** Mesma dívida dos planos 042, 043, 044 e
045: **a tecla Tab enviada pela extensão do Chrome não move o foco nesta máquina.** O que foi
verificado, e só isso — a regra global está no CSS entregue, lida por CSSOM do documento servido:

```
[
 ":focus-visible { outline: 2px solid var(--color-tinta); outline-offset: 3px; }"
]
```

A navegação por Tab desta rota **fica para o plano 053**, agora acumulada em cinco planos.

### Nota sobre os builds — colisão causada pelo orquestrador

Registro por honestidade de evidência, porque muda a leitura dos carimbos de hora acima.

O README desta fase proíbe dois builds simultâneos no mesmo working tree ("se sobrescrevem e
produzem evidência falsa"). **O orquestrador violou essa regra:** disparou `npm run build:pipeline`
às **14:13:52** enquanto o `triage-runner` ainda executava o dele (iniciado 14:13:42). O build do
orquestrador falhou com

```
Error: Tina Dev server is already in use. Datalayer server is busy on port 9000
```

que é exatamente a armadilha registrada na memória do projeto — o datalayer do Tina segurando a
porta. **Nenhum código estava errado**; foi contenção de recurso entre dois processos.

Sequência real, para quem for auditar:

| Horário | Quem | Resultado |
| --- | --- | --- |
| 14:13:52 | orquestrador | `build:pipeline` **falhou** (porta 9000), `dist/` **não** tocado |
| 14:14:27 | `triage-runner` | `build:pipeline` **verde**, `dist/` gravado |
| 14:15:38 | orquestrador | `build:pipeline` **verde**, serializado, `dist/` regravado |

Depois da falha, a porta 9000 e os processos `node` foram conferidos e estavam livres antes do build
de 14:15:38. O `dist/` verificado no navegador é o de **14:15:38**, e os três HTML têm esse mesmo
carimbo:

```
-rw-r--r-- 1 andne 197609  9894 2026-09-18 14:15:38 dist/index.html
-rw-r--r-- 1 andne 197609 10494 2026-09-18 14:15:38 dist/pesquisa/index.html
-rw-r--r-- 1 andne 197609 12202 2026-09-18 14:15:38 dist/sobre/index.html
```

`dist/pesquisa/index.html` tem **10494 bytes nos dois builds** (o do `triage-runner` e o do
orquestrador) — saída determinística, o que confirma que os dois produziram o mesmo artefato.
Invariantes conferidos no `dist/` de 14:15:38, com `grep -o ... | wc -l`:

```
article:   2   (esperado 2)
h1:        1   (esperado 1)
rubrica:   1   (esperado 1)
ancora:    1   (esperado 1)
tag andam: 1 projeto em andamento
```

### Passo 6 — Portão de qualidade

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

Repetido depois da última edição deste `.md` (acréscimo da nota sobre a seção Projetos acima —
Prettier formata Markdown):
```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test:coverage`:
```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  13:58:57
   Duration  1.61s (transform 3.75s, setup 0ms, import 6.35s, tests 274ms, environment 2ms)

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
```

### Canário adicional — seção Projetos some sem projeto publicado (pedido do orquestrador)

A leitura de código (`{projects.length > 0 && (...)}`) não é prova de comportamento neste
projeto — mesma exigência de falsificação da RN-01 no 044 e do rótulo órfão no 045. Canário:
edição temporária em `src/pages/pesquisa.astro:50`, trocando
`const projects = sortProjects(...)` por `let projects = sortProjects(...); projects = [];`.

`npx astro build` com o canário aplicado:
```
[2m14:04:32[22m [34m[content][39m Syncing content
[2m14:04:32[22m [34m[content][39m Synced content
[2m14:04:32[22m [34m[types][39m Generated [2m537ms[22m
[2m14:04:32[22m [34m[build][39m output: [34m"static"[39m
[2m14:04:32[22m [34m[build][39m mode: [34m"static"[39m
[2m14:04:32[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m14:04:32[22m [34m[build][39m Collecting build info...
[2m14:04:32[22m [34m[build][39m [32m✓ Completed in 577ms.[39m
[2m14:04:32[22m [34m[build][39m Building static entrypoints...
[2m14:04:32[22m [34m[vite][39m [32m✓ built in 346ms[39m
[2m14:04:32[22m [34m[vite][39m [32m✓ built in 62ms[39m
[2m14:04:32[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m14:04:32[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+20ms)[22m 
[2m14:04:32[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+5ms)[22m 
[2m14:04:32[22m   [34m├─[39m [2m/index.html[22m [2m(+4ms)[22m 
[2m14:04:32[22m [32m✓ Completed in 41ms.
[39m
[2m14:04:32[22m [34m[build][39m [32m✓ Completed in 524ms.[39m
[2m14:04:32[22m [34m[build][39m 3 page(s) built in [1m1.16s[22m
[2m14:04:32[22m [34m[build][39m [1mComplete![22m
```

`grep -o 'Projetos' dist/pesquisa/index.html | wc -l` (esperado `0` — nem o rótulo da seção
aparece; conferido que não há ocorrência em nenhuma parte da página, então não foi preciso
escopar ao `<main>`):
```
0
```

`grep -o '<article' dist/pesquisa/index.html | wc -l` (raiz de `ProjectCard`, esperado `0`):
```
0
```

`grep -o 'projeto-card' dist/pesquisa/index.html | wc -l` (classe do card, esperado `0`):
```
0
```

Rubrica do `PageHeader` nesse estado — prova colateral de que o canário estava ativo (esperado
"2 linhas · 0 projetos"):
```
2 linhas · 0 projetos
```

Reversão à mão (não `git checkout`/`git restore` — apagariam os dois arquivos novos e não
commitados):
```
== git status --short (arquivos novos, sem git checkout/restore) ==
?? src/components/ProjectCard.astro
?? src/pages/pesquisa.astro
== confirma ausência do valor temporário 'projects = []' ==
(nenhuma ocorrência -- canário revertido)
== confirma ausência de 'let projects' ==
(nenhuma ocorrência -- canário revertido)
== linha final de declaração de projects ==
50:const projects = sortProjects(filterPublished(await getCollection('projetos')));
```

`npx astro build` depois da reversão:
```
[2m14:04:56[22m [34m[content][39m Syncing content
[2m14:04:56[22m [34m[content][39m Synced content
[2m14:04:56[22m [34m[types][39m Generated [2m520ms[22m
[2m14:04:56[22m [34m[build][39m output: [34m"static"[39m
[2m14:04:56[22m [34m[build][39m mode: [34m"static"[39m
[2m14:04:56[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m14:04:56[22m [34m[build][39m Collecting build info...
[2m14:04:56[22m [34m[build][39m [32m✓ Completed in 561ms.[39m
[2m14:04:56[22m [34m[build][39m Building static entrypoints...
[2m14:04:56[22m [34m[vite][39m [32m✓ built in 345ms[39m
[2m14:04:56[22m [34m[vite][39m [32m✓ built in 60ms[39m
[2m14:04:56[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m14:04:56[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+24ms)[22m 
[2m14:04:56[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+6ms)[22m 
[2m14:04:56[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m14:04:56[22m [32m✓ Completed in 49ms.
[39m
[2m14:04:56[22m [34m[build][39m [32m✓ Completed in 497ms.[39m
[2m14:04:56[22m [34m[build][39m 3 page(s) built in [1m1.08s[22m
[2m14:04:56[22m [34m[build][39m [1mComplete![22m
```

Cards e rubrica de volta, `dist/` restaurado ao estado real (não fica descrevendo o canário):
```
== <article> (cards de volta) ==
2
== rubrica de volta ==
2 linhas · 2 projetos
== 'Projetos' de volta ==
1
== href da linha relacionada, ainda intacto ==
href="#sombras-de-buracos-negros"
```

### Verificação autoritativa independente — ciclo 2 (`triage-runner`, 2026-09-18 14:35–14:36)

Esta é a execução que valida o **deliverable entregue**, isto é, os bytes já corrigidos depois da
reprovação da revisão (ver "Correção pós-revisão"). Houve uma execução autoritativa anterior, às
14:09–14:14, também verde nos quatro comandos, mas ela descreve os bytes **anteriores** à correção
e por isso foi substituída aqui — a Evidência registra o run que validou o que se entrega, não todo
run que já existiu.

```
> haroldo-page@0.1.0 lint
> eslint .

```
exit 0, sem erros.

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```
exit 0.

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  14:35:20
   Duration  1.59s (transform 3.86s, setup 0ms, import 6.62s, tests 281ms, environment 3ms)

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
```
exit 0. A branch descoberta (`navigation.ts:51`) é pré-existente, anterior a este plano.

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  14:35:28
   Duration  1.12s (transform 1.74s, setup 0ms, import 2.91s, tests 75ms, environment 0ms)

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
14:36:01 [content] Syncing content
14:36:01 [content] Synced content
14:36:01 [types] Generated 539ms
14:36:01 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (45 files): 
- 0 errors
- 0 warnings
- 0 hints

14:36:09 [content] Syncing content
14:36:09 [content] Synced content
14:36:09 [types] Generated 481ms
14:36:09 [build] output: "static"
14:36:09 [build] mode: "static"
14:36:09 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:36:09 [build] Collecting build info...
14:36:09 [build] ✓ Completed in 520ms.
14:36:09 [build] Building static entrypoints...
14:36:10 [vite] ✓ built in 363ms
14:36:10 [vite] ✓ built in 61ms
14:36:10 [build] Rearranging server assets...

 generating static routes 
14:36:10   ├─ /pesquisa/index.html (+23ms) 
14:36:10   ├─ /sobre/index.html (+6ms) 
14:36:10   ├─ /index.html (+4ms) 
14:36:10 ✓ Completed in 47ms.

14:36:10 [build] ✓ Completed in 544ms.
14:36:10 [build] 3 page(s) built in 1.12s
14:36:10 [build] Complete!
```
exit 0. `astro check` com `0 errors, 0 warnings, 0 hints` em 45 arquivos e **nenhuma linha
`[ERROR]`**. Carimbos do `dist/`, lidos no mesmo comando encadeado do build — batem com o
`Complete!` das 14:36:10:

```
Name       Directory                                       Length LastWriteTime      
----       ---------                                       ------ -------------      
index.html S:\Projetos\academic_page\haroldo\dist            9894 18/09/2026 14:36:10
index.html S:\Projetos\academic_page\haroldo\dist\sobre     12202 18/09/2026 14:36:10
index.html S:\Projetos\academic_page\haroldo\dist\pesquisa  10494 18/09/2026 14:36:10
```

**Veredito da verificação independente: os quatro comandos VERDES.**

### Correções da revisão — ciclo 1

A revisão de código **reprovou o ciclo 1** com dois defeitos, os dois **textuais** — nenhum de
comportamento. Registro do que era e do que passou a ser, para o histórico não depender do relatório
de revisão:

1. **Citação de seção errada.** `src/pages/pesquisa.astro:126`, comentário do `<style>`, citava
   `§6.3` para a regra da régua ("régua forte abrindo a lista, fina entre linhas"). Essa regra está
   no **§5.5** de `docs/identidade-visual.md` ("Grade com régua no topo; a primeira linha de cada
   lista abre com régua forte"); o §6.3 só menciona régua no bloco de período/financiador do card.
   Passou a citar o §5.5 como origem e o §6.3 como lugar de aplicação, no padrão de
   `src/pages/sobre.astro:171`. Mesma classe de defeito que reprovou o plano 043 no ciclo 1.
2. **Afirmação falsa na Evidência, e critério sem prova.** A Evidência concluía "Nenhuma divergência
   de conteúdo a reportar", mas a seção "Dados" deste plano afirma que nenhuma linha de pesquisa tem
   `corpo` e
   `content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md:6` **tem**.
   Por causa disso o elemento "(se houver) `corpo`" do critério 1 estava sem nenhuma linha de
   evidência. A frase saiu, a divergência foi registrada nomeando o arquivo, e entrou a contagem de
   parágrafos por seção.

Depois das correções, a suíte autoritativa foi rodada **de novo** sobre os bytes corrigidos (ciclo
2, acima) e a revisão **aprovou**.

### A correção pós-revisão não alterou o artefato renderizado

Verificação do orquestrador, porque a correção tocou `src/pages/pesquisa.astro` **depois** da
verificação no navegador do passo 5 — em tese isso invalidaria as medições das três larguras.

A correção foi um **comentário dentro do bloco `<style>`**, que o minificador de CSS remove. As
consequências observáveis:

```
-rw-r--r-- 1 andne 197609 10494 14:36:10 dist/pesquisa/index.html
data-astro-cid-qmoi4cri
article=2 h1=1 ancora=1
relatividade-geral-e-teorias-alternativas-de-gravitacao -> 2
sombras-de-buracos-negros -> 1
```

O **hash de escopo do Astro continua `data-astro-cid-qmoi4cri`** e o HTML tem os **mesmos 10494
bytes** de antes da correção — o mesmo número medido no build de 14:15:38, sobre o qual a
verificação no navegador foi feita. Os invariantes (2 `<article>`, 1 `<h1>`, âncora presente,
2 e 1 parágrafos por seção) são idênticos.

**Portanto as medições do passo 5 continuam descrevendo os bytes entregues**, e não foi preciso
refazer a verificação no navegador. Se o hash ou o tamanho tivessem mudado, ela teria de ser
refeita.

### Divergências e observações

- **Armadilha do `grep -c` sobre HTML minificado (README da fase, achado do plano 045):** o passo 3 do
  plano pede só `grep -c '<h1'`. Segui a instrução do despacho e rodei também
  `grep -o '<h1' dist/pesquisa/index.html | wc -l`. Os dois deram `1` — página com exatamente um
  `<h1>` (o do `PageHeader`), confirmado pelo método que discrimina ocorrência de linha.
- **Conteúdo real bateu com a comparação do plano:** rubrica "2 linhas · 2 projetos"; `01` Relatividade
  geral…, `02` Sombras de buracos negros com tag "1 projeto em andamento" (singular, `pt.plural`
  resolveu corretamente); projeto "em andamento" (Sombras de buracos negros em gravitação modificada)
  antes do "concluído" (Forças de maré em espaços-tempos de Kerr, "2023.1–2025.2"); link
  `#sombras-de-buracos-negros` presente.
- **Correção (revisão do 046): "Nenhuma divergência de conteúdo a reportar" era falso.** A seção
  "Dados" deste plano (linha 38, antes da correção acima) afirmava que nenhuma linha de pesquisa
  tem `corpo` — mas
  `content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md:6` **tem**
  `corpo` ("A linha investiga soluções de buraco negro em relatividade geral e em teorias
  alternativas de gravitação..."). O documento errado era o próprio plano; corrigido acima na seção
  "Dados". Ver a contagem de parágrafos por seção logo abaixo, que prova o `corpo` renderizado.
- **`npx wc -l` não é comando do portão** — incluí apenas para conferir que os dois arquivos ficaram
  abaixo de 150 linhas (§10.4): `src/pages/pesquisa.astro` = 134 linhas; `src/components/ProjectCard.astro`
  = 94 linhas.
- **Passo 5 (navegador) não rodou nesta sessão** — não tenho navegador. Critério correspondente
  ("`[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário") fica em
  suspenso para o orquestrador.
- **"Seção Projetos some sem projetos publicados" — corrigido de leitura de código para canário
  por falsificação**, a pedido do orquestrador (as duas entradas de `content/projetos/` estão
  `publicado: true`, então o caminho de zero projetos publicados nunca aparece com conteúdo real).
  Ver "Canário adicional — seção Projetos some sem projeto publicado" acima: `projects` forçado a
  `[]`, `grep`s deram `0` para `Projetos`/`<article>`/`projeto-card` e a rubrica confirmou "2 linhas
  · 0 projetos"; revertido à mão e `dist/` reconstruído ao estado real.


### Verificador de fidelidade da Evidência

Script (`verify_evidence.py`, scratchpad) compara cada bloco colado acima (incluindo o canário adicional da seção Projetos, pedido do orquestrador) com o arquivo de captura correspondente e imprime `OK`/`DIFERENTE`. Rodado depois da inserção de todos os blocos acima:
```
Blocos encontrados na Evidência: 27
Arquivos de captura esperados:   27

Bloco  1 <- 01-astro-check.txt                            : OK
Bloco  2 <- 02-build-pipeline.txt                         : OK
Bloco  3 <- 03-ls-dist.txt                                : OK
Bloco  4 <- 04-grep-ids.txt                               : OK
Bloco  5 <- 05-grep-hrefs.txt                             : OK
Bloco  6 <- 06-grep-em-andamento.txt                      : OK
Bloco  7 <- 07-grep-c-h1.txt                              : OK
Bloco  8 <- 08-grep-o-h1-wcl.txt                          : OK
Bloco  9 <- 09-conteudo-esperado.txt                      : OK
Bloco 10 <- 10-build-pipeline-canario.txt                 : OK
Bloco 11 <- 11-grep-c-canario.txt                         : OK
Bloco 12 <- 12-grep-o-wcl-canario.txt                     : OK
Bloco 13 <- 13-canario-revertido.txt                      : OK
Bloco 14 <- 14-build-pipeline-final.txt                   : OK
Bloco 15 <- 15-grep-href-final.txt                        : OK
Bloco 16 <- 16-lint.txt                                   : OK
Bloco 17 <- 17-format-check.txt                           : OK
Bloco 18 <- 19-format-check-apos-ultima-edicao-md.txt     : OK
Bloco 19 <- 18-test-coverage.txt                          : OK
Bloco 20 <- 21-astro-build-canario-projetos.txt           : OK
Bloco 21 <- 22-grep-projetos-wcl.txt                      : OK
Bloco 22 <- 23-grep-article-wcl.txt                       : OK
Bloco 23 <- 24-grep-projeto-card-wcl.txt                  : OK
Bloco 24 <- 25-grep-rubrica-canario.txt                   : OK
Bloco 25 <- 26-canario-projetos-revertido.txt             : OK
Bloco 26 <- 27-astro-build-final.txt                      : OK
Bloco 27 <- 28-grep-projetos-restaurados.txt              : OK

RESULTADO GERAL: OK
```
