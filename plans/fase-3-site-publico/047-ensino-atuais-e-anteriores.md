# Plano 047 — Ensino: atuais e anteriores (RF-23)

**Status:** DONE
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

- [x] Dois grupos rotulados, "Atuais" primeiro, sempre presentes (RF-23)
- [x] Links com o slug do plano 041 e barra final
- [x] Contagens só não nulas; nenhum numeral nas atuais
- [x] Estado vazio tracejado com texto, provado pelo canário do passo 4
- [x] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–4, 6) e pelo orquestrador (5). Declare o que NÃO rodou.>

### 1. `npx astro check`

Rodado sobre o arquivo final (antes de qualquer build) — mesmo código dos blocos abaixo.

```
17:31:21 [content] Syncing content
17:31:21 [content] Synced content
17:31:21 [types] Generated 630ms
17:31:21 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (46 files): 
- 0 errors
- 0 warnings
- 0 hints
```

### 2. `npm run build:pipeline` (build final) + timestamp do `dist/`

Este é o **build final**, depois de desfazer o canário do passo 4 (ver detalhe no passo 4). O
`Get-ChildItem` do carimbo de tempo está encadeado no mesmo comando/`Tee-Object` do build (linha
final do bloco). Os blocos do passo 3 abaixo foram recapturados sobre este mesmo `dist/`.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  17:40:49
   Duration  1.15s (transform 1.81s, setup 0ms, import 2.97s, tests 85ms, environment 0ms)

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
17:41:18 [content] Syncing content
17:41:18 [content] Synced content
17:41:18 [types] Generated 557ms
17:41:18 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (46 files): 
- 0 errors
- 0 warnings
- 0 hints

17:41:25 [content] Syncing content
17:41:25 [content] Synced content
17:41:25 [types] Generated 484ms
17:41:25 [build] output: "static"
17:41:25 [build] mode: "static"
17:41:25 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:41:25 [build] Collecting build info...
17:41:25 [build] ✓ Completed in 523ms.
17:41:25 [build] Building static entrypoints...
17:41:25 [vite] ✓ built in 363ms
17:41:25 [vite] ✓ built in 58ms
17:41:25 [build] Rearranging server assets...

 generating static routes 
17:41:25   ├─ /ensino/index.html (+24ms) 
17:41:25   ├─ /pesquisa/index.html (+7ms) 
17:41:25   ├─ /sobre/index.html (+5ms) 
17:41:25   ├─ /index.html (+3ms) 
17:41:25 ✓ Completed in 50ms.

17:41:25 [build] ✓ Completed in 544ms.
17:41:25 [build] 4 page(s) built in 1.09s
17:41:25 [build] Complete!

FullName                                                 LastWriteTime      
--------                                                 -------------      
S:\Projetos\academic_page\haroldo\dist\ensino\index.html 18/09/2026 17:41:25
```

### 3. Checagens no HTML (sobre o `dist/` do build final acima)

```
--- href /ensino/... ---
href="/ensino/"
href="/ensino/2026-2-relatividade-geral/"
href="/ensino/2025-1-mecanica-classica/"
href="/ensino/"
--- h2 headings ---
<h2 class="text-rotulo text-secundario" data-astro-cid-lkjmipwf>Atuais
<h2 class="text-rotulo text-secundario" data-astro-cid-lkjmipwf>Anteriores
--- counts footer ---
5 aulas · 2 listas · 1 script
```

Nota: `href="/ensino/"` aparece duas vezes por causa da navegação (cabeçalho e rodapé) apontando
para a própria rota — não é um link de disciplina; os dois links de disciplina
(`/ensino/2026-2-relatividade-geral/` e `/ensino/2025-1-mecanica-classica/`) estão presentes e
batem com os "Valores esperados" do plano.

### 4. Canário do estado vazio (`current = []`)

Sequência real: (a) editei `src/pages/ensino.astro` para forçar `current = []` (bloco identificado
com o comentário `CANÁRIO passo 4`); (b) rebuild, com o `Get-ChildItem` do carimbo de tempo
encadeado no mesmo `Tee-Object` (bloco abaixo); (c) capturei a saída do estado vazio; (d) desfiz o
canário **editando o arquivo de volta** (não usei `git checkout --`, conforme instruído); (e)
rebuild final (bloco do passo 2, que sustenta os blocos do passo 3).

Build com o canário aplicado:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  17:39:04
   Duration  1.93s (transform 1.73s, setup 0ms, import 3.55s, tests 76ms, environment 0ms)

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
17:40:18 [content] Syncing content
17:40:18 [content] Synced content
17:40:18 [types] Generated 560ms
17:40:18 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (46 files): 
- 0 errors
- 0 warnings
- 0 hints

17:40:25 [content] Syncing content
17:40:25 [content] Synced content
17:40:25 [types] Generated 492ms
17:40:25 [build] output: "static"
17:40:25 [build] mode: "static"
17:40:25 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:40:25 [build] Collecting build info...
17:40:25 [build] ✓ Completed in 531ms.
17:40:25 [build] Building static entrypoints...
17:40:26 [vite] ✓ built in 405ms
17:40:26 [vite] ✓ built in 60ms
17:40:26 [build] Rearranging server assets...

 generating static routes 
17:40:26   ├─ /ensino/index.html (+21ms) 
17:40:26   ├─ /pesquisa/index.html (+8ms) 
17:40:26   ├─ /sobre/index.html (+4ms) 
17:40:26   ├─ /index.html (+5ms) 
17:40:26 ✓ Completed in 51ms.

17:40:26 [build] ✓ Completed in 584ms.
17:40:26 [build] 4 page(s) built in 1.18s
17:40:26 [build] Complete!

FullName                                                 LastWriteTime      
--------                                                 -------------      
S:\Projetos\academic_page\haroldo\dist\ensino\index.html 18/09/2026 17:40:26
```

Saída do estado vazio sobre esse `dist/` (regra do README da fase: nunca `grep -c` em HTML
minificado — usei `grep -o ... | wc -l`):

```
--- noCurrent text (grep -o | wc -l) ---
1
--- noCurrent text (grep -o) ---
Nenhuma disciplina neste semestre.
--- h2 headings still present ---
<h2 class="text-rotulo text-secundario" data-astro-cid-lkjmipwf>Atuais
<h2 class="text-rotulo text-secundario" data-astro-cid-lkjmipwf>Anteriores
```

O `<h2>` "Atuais" continua presente mesmo com `current` vazio, e o texto
`pt.teaching.noCurrent` aparece exatamente 1 vez — confirma o estado vazio tracejado sem fazer o
grupo desaparecer.

### 5. Verificação no navegador (orquestrador)

Feita pelo **orquestrador**, não pelo executor. Vivaldi (Chromium) com a extensão Claude in Chrome,
sobre `npx astro preview` (`http://localhost:4321`) servindo o `dist/` gerado às 17:46:12.
**2026-09-18, 17:51:31 (GMT-0300)**, transcrita da saída de `javascript_tool`.

Técnica: a janela fica maximizada e o `resize_window` da extensão não muda o viewport nesta
máquina, então `/ensino/` foi carregada em `<iframe>` de 360, 768 e 1440 px no documento de topo —
as media queries seguem a largura do iframe (mesma técnica dos planos 042–046).

**`[scrollWidth, clientWidth]` de `document.documentElement` dentro do iframe:**

| Largura do iframe | scrollWidth | clientWidth | iguais |
|---|---|---|---|
| 360 px | 345 | 345 | sim |
| 768 px | 753 | 753 | sim |
| 1440 px | 1425 | 1425 | sim |

Os 15 px de diferença para a largura do iframe são a barra de rolagem vertical (a página é mais
alta que os 900 px do iframe). **Sem rolagem horizontal em nenhuma das três larguras (RF-26).**

**Elemento cortado:** nenhum, nas três larguras (conferido por captura de tela em cada uma).

**Ordem e presença dos grupos** (`main h2`, nas três larguras): `["Atuais", "Anteriores"]` — os dois
sempre presentes, "Atuais" primeiro (RF-23).

**Células e linhas inteiras clicáveis.** `elementFromPoint` em 5 pontos de cada alvo (os 4 cantos
com 4 px de recuo e o centro); `A` = o ponto atinge o próprio `<a>` ou um descendente dele:

| Largura | célula "Atuais" (caixa) | pontos | linha "Anteriores" (caixa) | pontos |
|---|---|---|---|---|
| 360 px | 305 × 292 | A A A A A | 305 × 180 | A A A A A |
| 768 px | 346 × 288 | A A A A A | 691 × 170 | A A A A A |
| 1440 px | 656 × 270 | A A A A A | 1313 × 106 | A A A A A |

**`aria-current`:** `header a[aria-current]` devolve exatamente um elemento nas três larguras —
`"Ensino" = page`.

**Links:** `/ensino/2026-2-relatividade-geral/` (atual) e `/ensino/2025-1-mecanica-classica/`
(anterior), os dois com barra final.

**Rodapé de contagens da célula "Atuais":** `5 aulas · 2 listas · 1 script`, nas três larguras.

**Foco visível — NÃO observado por teclado.** A tecla Tab enviada pela extensão não move o foco
nesta máquina (limitação registrada no README da fase desde o plano 042). O que foi observado:
`a.disciplina-atual.focus()` por script move `document.activeElement` para o elemento, mas
**não** casa `:focus-visible` (comportamento correto do navegador: `:focus-visible` é para foco de
teclado), então o contorno não aparece por essa via. A regra existe no CSS entregue
(`/_astro/text.C7yvNpYB.css`, 19 031 bytes):
`:focus-visible{outline:2px solid var(--color-tinta);outline-offset:3px}`. **Isto não substitui o
teste de teclado**, que continua sendo dívida da fase, a fechar no plano 053.

### 6. Portão de qualidade

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

`npm run test:coverage`:

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  17:42:13
   Duration  1.53s (transform 3.79s, setup 0ms, import 6.25s, tests 287ms, environment 2ms)

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

### O que NÃO foi rodado por mim (executor)

- **Passo 5 — verificação no navegador** (360/768/1440 px, `astro preview`, Tab, `aria-current`):
  não rodei **eu** (executor) — o README da fase proíbe o executor de deixar `astro preview`
  em background ou rodar builds concorrentes com outro executor. Já não está pendente: o
  **orquestrador** fez essa verificação em 2026-09-18, 17:51:31 (seção 5 da Evidência acima).
- `npm ci`, `npm audit --audit-level=high` e o CI do GitHub Actions (seção "Verificação
  autoritativa" do README da fase): não fazem parte dos passos deste plano; não rodei.

### 7. Verificação autoritativa independente (`triage-runner`)

Execução **independente** da minha (executor), feita pelo `triage-runner` em **2026-09-18,
17:45–17:46**. Os cinco comandos abaixo são os da seção "Verificação autoritativa" do README da
fase; este é o run que vale como verificação independente do plano — a minha, na seção 6 acima,
continua registrada só como feedback de execução.

`npm run lint` (exit 0):

```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check` (exit 0):

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test:coverage` (exit 0):

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  17:45:25
   Duration  1.64s (transform 3.91s, setup 0ms, import 6.51s, tests 297ms, environment 2ms)

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

`npm run build:pipeline` (exit 0, com o carimbo de tempo do `dist/` encadeado no mesmo comando):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  17:45:35
   Duration  1.14s (transform 1.78s, setup 0ms, import 2.97s, tests 88ms, environment 0ms)

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
17:46:04 [content] Syncing content
17:46:04 [content] Synced content
17:46:04 [types] Generated 483ms
17:46:04 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (46 files): 
- 0 errors
- 0 warnings
- 0 hints

17:46:11 [content] Syncing content
17:46:11 [content] Synced content
17:46:11 [types] Generated 498ms
17:46:11 [build] output: "static"
17:46:11 [build] mode: "static"
17:46:11 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:46:11 [build] Collecting build info...
17:46:11 [build] ✓ Completed in 541ms.
17:46:11 [build] Building static entrypoints...
17:46:11 [vite] ✓ built in 325ms
17:46:11 [vite] ✓ built in 56ms
17:46:11 [build] Rearranging server assets...

 generating static routes 
17:46:11   ├─ /ensino/index.html (+20ms) 
17:46:12   ├─ /pesquisa/index.html (+6ms) 
17:46:12   ├─ /sobre/index.html (+6ms) 
17:46:12   ├─ /index.html (+4ms) 
17:46:12 ✓ Completed in 47ms.

17:46:12 [build] ✓ Completed in 466ms.
17:46:12 [build] 4 page(s) built in 1.06s
17:46:12 [build] Complete!

FullName                                                 Length LastWriteTime      
--------                                                 ------ -------------      
S:\Projetos\academic_page\haroldo\dist\ensino\index.html   9009 18/09/2026 17:46:12
S:\Projetos\academic_page\haroldo\dist\index.html          9894 18/09/2026 17:46:12
```

`npm audit --audit-level=high` (exit 0 — as vulnerabilidades moderadas listadas são a dívida
nomeada em `qs`/`body-parser`/`express`/`react-router` do README da fase, sem plano; `--audit-
level=high` só falha em `high`/`critical`, e não há nenhuma):

```
# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

8 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

### 8. CI e Workers Builds sobre o commit empurrado

Commit de trabalho `4d90d924397de6cbcdfd1bad173822c29c9509c3` (`4d90d92`), empurrado para a `main` em 2026-09-18. O README da fase é explícito: **"os comandos locais passam" não é o mesmo que "o CI passa"** — só o `conclusion` do run é evidência de DONE.

```
$ gh api repos/researchgroups-ufma/haroldo-page/commits/4d90d924397de6cbcdfd1bad173822c29c9509c3/check-runs --jq ".check_runs[] | \"\(.name) | \(.status) | \(.conclusion)\""
Workers Builds: haroldo-page | completed | success
qualidade | completed | success

$ gh run list --commit 4d90d924397de6cbcdfd1bad173822c29c9509c3 --json databaseId,name,conclusion,status
35394287388 | CI | completed | success
```

Os dois `success`: o CI (`qualidade`, run 35394287388) e o build de deploy da Cloudflare (`Workers Builds: haroldo-page`), que publica o site.
