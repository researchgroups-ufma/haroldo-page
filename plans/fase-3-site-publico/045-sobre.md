# Plano 045 — Sobre (RF-21)

**Status:** DONE
**RFs cobertos:** **RF-21**, F-08, RF-26
**Depende de:** planos 038 (`toParagraphs`), 039 (`requireSingleton`), 042 (layout), 043 (componentes)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`/sobre/` mostra biografia em parágrafos, formação, áreas de atuação, contato, perfis acadêmicos
(incluindo o currículo em PDF) e a foto — **apenas os campos preenchidos**, sem rótulo órfão.

## Arquivos afetados

- `src/pages/sobre.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Outros planos da onda 3 podem estar editando `src/pages/*` em
> paralelo; não rode build ao mesmo tempo que outro executor (README da fase).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.2 (Sobre), §5.4 (tag neutra em caixa normal), §5.5
(link externo) e §1 regra 2 ("campo vazio não deixa rastro"). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`. Link externo **só** por `ExternalLink.astro` (plano 043).

**Critério do RF-21, literal:** "vê todos os campos preenchidos **e apenas eles** — campos vazios não
deixam rótulo órfão na página".

**Dados** (`perfilSchema`, `src/content.config.ts:163-179`; real em `content/perfil/index.md`):
`bio` (obrigatório; hoje um parágrafo), `formacao?: {grau, curso, instituicao, ano}[]` (hoje 5 itens,
**do mais recente ao mais antigo**, ordem do professor — não reordene), `areas?: string[]` (4),
`email` (obrigatório), `links?: {lattes?, orcid?, scholar?, arxiv?, researchgate?, github?,
institucional?}` (hoje só `lattes` e `orcid`), `cv_url?` (ausente), `foto?` (ausente).

**Composição (§6.2):**
- `BaseLayout title={pt.about.eyebrow}`; `PageHeader eyebrow={pt.about.eyebrow} title={pt.about.title}`
  com slot `aside` = `bio` via `toParagraphs`, cada parágrafo `<p class="text-corpo max-w-medida">{p}</p>`.
- **Formação** (rubrica `pt.about.education`, `<h2>`): linhas de grade de 3 colunas — `ano` ·
  `grau — curso` · `instituicao` —, régua fina entre linhas e forte na primeira (§5.5); abaixo de
  `sm`, cada linha empilha. Lista semântica (`<ol>` não: a ordem não é sequência numerada; use `<ul>`
  com `role` padrão).
- **Faixa de quatro células**, régua fina entre elas, empilhando abaixo de `sm`:
  1. áreas (`pt.about.areas`): uma `Tag variant="neutral" normalCase` por item;
  2. contato (`pt.about.contact`): `email` como `mailto:`, sublinhado;
  3. perfis acadêmicos (`pt.about.academicProfiles`): um `ExternalLink` por chave de `links`
     preenchida, **na ordem** `lattes, orcid, scholar, arxiv, researchgate, github, institucional`,
     rótulo `pt.about.links[chave]`, e depois `cv_url` com `pt.about.links.cv`;
  4. foto: `<img src={foto} alt={nome} loading="lazy" decoding="async">` em p&b (`grayscale`).
- **Cada bloco sem dado some inteiro, com a rubrica** (RF-21): `formacao` vazia/ausente → sem seção;
  `areas` vazia → sem célula; nenhum link e sem `cv_url` → sem célula; sem `foto` → sem célula. A
  grade se recompõe (use `auto-fit` ou só renderize as células presentes com colunas derivadas do
  número delas) — nenhum espaço reservado (F-08).
- Um `<h1>` só (o do `PageHeader`); rubricas de bloco são `<h2 class="text-rotulo">`.

**Valores esperados com o conteúdo atual** (comparação, não teste): bio em 1 parágrafo; 5 linhas de
formação na ordem do arquivo; 4 tags; e-mail `haroldo.lima@ufma.br`; perfis "Currículo Lattes" e
"ORCID" apenas; nenhuma célula de foto; nenhum "Currículo em PDF".

## Passos

1. Escrever `src/pages/sobre.astro` → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/sobre/index.html` colado.
3. HTML → verify: cole `grep -c '<h1' dist/sobre/index.html` (1), `grep -o 'Currículo Lattes\|ORCID\|Google Scholar\|Currículo em PDF' dist/sobre/index.html` (só os dois primeiros), `grep -c '<img' dist/sobre/index.html` (0).
4. Canário de "rótulo órfão", sem tocar em `content/`: substitua temporariamente no componente os `links` por `{}` e `areas` por `[]`, `npx astro build`, cole `grep -c 'Perfis acadêmicos\|Áreas de atuação' dist/sobre/index.html` (esperado `0`); desfaça e cole `git diff src/pages/sobre.astro` (se o arquivo ainda não está commitado, `git status --short` mostrando `??` e a conferência visual de que a versão final não tem os valores temporários) → verify: saídas coladas.
5. Orquestrador — "Verificação no navegador" do README da fase em `/sobre/`, 360/768/1440: `[scrollWidth, clientWidth]`; formação empilhada em 360; e-mail e perfis clicáveis; perfis abrem em nova aba; Tab com foco visível; "Sobre" com `aria-current` no cabeçalho.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] Bio em parágrafos, formação na ordem do arquivo, áreas como tags neutras em caixa normal, e-mail, perfis preenchidos e (se houver) `cv_url` e foto
- [x] Bloco sem dado some com a rubrica — provado pelo canário do passo 4 (dentro de `<main>`; ver divergência do comando de página inteira registrada na Evidência)
- [x] Um único `<h1>`; nenhum `<img>` e nenhum "Currículo em PDF" com o conteúdo atual
- [x] Links externos só via `ExternalLink`
- [x] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário — feito pelo orquestrador no passo 5 (360: 345/345, 768: 753/753, 1440: 1425/1425, em 2026-09-18 09:53 UTC−3)
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

### Passo 1 — `npx astro check`

```
[2m09:36:43[22m [34m[content][39m Syncing content
[2m09:36:43[22m [34m[content][39m Synced content
[2m09:36:43[22m [34m[types][39m Generated [2m576ms[22m
[2m09:36:43[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (43 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### Passo 2 — `npm run build:pipeline`

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  09:36:57
   Duration  1.87s (transform 1.53s, setup 0ms, import 3.40s, tests 67ms, environment 0ms)

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
[2m09:37:54[22m [34m[content][39m Syncing content
[2m09:37:54[22m [34m[content][39m Synced content
[2m09:37:54[22m [34m[types][39m Generated [2m537ms[22m
[2m09:37:54[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (43 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m09:38:02[22m [34m[content][39m Syncing content
[2m09:38:02[22m [34m[content][39m Synced content
[2m09:38:02[22m [34m[types][39m Generated [2m530ms[22m
[2m09:38:02[22m [34m[build][39m output: [34m"static"[39m
[2m09:38:02[22m [34m[build][39m mode: [34m"static"[39m
[2m09:38:02[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m09:38:02[22m [34m[build][39m Collecting build info...
[2m09:38:02[22m [34m[build][39m [32m✓ Completed in 571ms.[39m
[2m09:38:02[22m [34m[build][39m Building static entrypoints...
[2m09:38:02[22m [34m[vite][39m [32m✓ built in 426ms[39m
[2m09:38:02[22m [34m[vite][39m [32m✓ built in 63ms[39m
[2m09:38:02[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m09:38:02[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+23ms)[22m 
[2m09:38:02[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m09:38:02[22m [32m✓ Completed in 43ms.
[39m
[2m09:38:02[22m [34m[build][39m [32m✓ Completed in 599ms.[39m
[2m09:38:02[22m [34m[build][39m 2 page(s) built in [1m1.19s[22m
[2m09:38:02[22m [34m[build][39m [1mComplete![22m
```

`ls dist/sobre/index.html`

```
dist/sobre/index.html
```

### Passo 3 — HTML

`grep -c '<h1' dist/sobre/index.html` (esperado 1)

```
1
```

`grep -o 'Currículo Lattes\|ORCID\|Google Scholar\|Currículo em PDF' dist/sobre/index.html` (esperado só os dois primeiros)

```
Currículo Lattes
ORCID
Currículo Lattes
ORCID
```

`grep -c '<img' dist/sobre/index.html` (esperado 0)

```
0
```


**Verificação suplementar dos "Valores esperados com o conteúdo atual" (não pedida como comando pelo passo 3, acrescentada para lastrear o critério de aceitação 1):**

`grep -o 'formacao-linha ' dist/sobre/index.html | wc -l` (esperado 5, uma por item de `formacao`):

```
5
```

`grep -o` das 4 `areas[]` do conteúdo real, em `dist/sobre/index.html` (esperado as 4 na ordem do arquivo):

```
Teoria da Relatividade Geral e teorias alternativas de gravitação
Perturbações lineares em espaços-tempos curvos
Forças de maré
Sombras de buracos negros
```

`grep -n 'target="_blank"' src/pages/sobre.astro` (esperado nenhuma ocorrência — todo link externo passa por `ExternalLink.astro`, que aplica `target="_blank"` internamente):

```
(sem saída)
exit:1
```

### Passo 4 — Canário ("rótulo órfão")

Substituídos temporariamente em `src/pages/sobre.astro`: `const areas = perfil.areas ?? [];` → `const areas = []; // CANARIO-TEMP`, e a leitura de `perfil.links` no laço de `profileLinks` → `const linksCanario: typeof perfil.links = {}; // CANARIO-TEMP`. `npx astro build`:

```
[2m09:38:38[22m [34m[content][39m Syncing content
[2m09:38:38[22m [34m[content][39m Synced content
[2m09:38:38[22m [34m[types][39m Generated [2m528ms[22m
[2m09:38:38[22m [34m[build][39m output: [34m"static"[39m
[2m09:38:38[22m [34m[build][39m mode: [34m"static"[39m
[2m09:38:38[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m09:38:38[22m [34m[build][39m Collecting build info...
[2m09:38:38[22m [34m[build][39m [32m✓ Completed in 568ms.[39m
[2m09:38:38[22m [34m[build][39m Building static entrypoints...
[2m09:38:39[22m [34m[vite][39m [32m✓ built in 331ms[39m
[2m09:38:39[22m [34m[vite][39m [32m✓ built in 60ms[39m
[2m09:38:39[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m09:38:39[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+16ms)[22m 
[2m09:38:39[22m   [34m├─[39m [2m/index.html[22m [2m(+5ms)[22m 
[2m09:38:39[22m [32m✓ Completed in 32ms.
[39m
[2m09:38:39[22m [34m[build][39m [32m✓ Completed in 491ms.[39m
[2m09:38:39[22m [34m[build][39m 2 page(s) built in [1m1.08s[22m
[2m09:38:39[22m [34m[build][39m [1mComplete![22m
EXIT:0
```

`grep -c 'Perfis acadêmicos\|Áreas de atuação' dist/sobre/index.html` — comando literal do passo 4 do plano, sobre a página inteira:

```
1
```

**Divergência entre o plano e a realidade do código (reportada, não corrigida — fora do escopo):** o resultado é `1`, não o `0` que o passo 4 esperava. Não é um rótulo órfão em `sobre.astro`: é o `<footer>` (`SiteFooter.astro`), renderizado pelo `BaseLayout` com sua própria chamada a `getCollection('perfil')`, independente das variáveis locais `areas`/`links` que o canário zerou dentro de `sobre.astro`. O rodapé continuou lendo o conteúdo real (`links: {lattes, orcid}`) e mostrando "Perfis acadêmicos" corretamente — não é defeito, é o rodapé fazendo o que sempre faz, fora da lista "Arquivos afetados" deste plano. Isolando o `<main>` (escopo de `sobre.astro`) do mesmo `dist/sobre/index.html`:

```
sed -n 's/.*\(<main.*<\/main>\).*/\1/p' dist/sobre/index.html | grep -c 'Perfis acadêmicos\|Áreas de atuação'
```

resultado:

```
0
```

Dentro de `<main>`, a contagem é `0`, como o plano espera: das quatro células, só "Contato" permanece (email é obrigatório no schema); "Áreas de atuação" e o `<h2>` "Perfis acadêmicos" de `sobre.astro` não aparecem — RF-21 provado para o escopo deste plano.

Canário desfeito à mão (não com `git checkout`/`git restore` — o arquivo é novo, não commitado, e os dois comandos o apagariam por inteiro). `git status --short`:

```
?? src/pages/sobre.astro
```

`grep -n CANARIO src/pages/sobre.astro` (confirma que nenhum valor temporário ficou) — sem ocorrência, `grep` sai com código 1:

```
(sem saída)
exit:1
```

### Passo 5 — Verificação no navegador (orquestrador)

Feita em **2026-09-18, das 09:51 às 09:53 (UTC−3, Horário Padrão de Brasília)**, sobre o `dist/`
gerado pelo `build:pipeline` da suíte autoritativa (`09:50:50`), servido por `npx astro preview` em
`http://localhost:4321/sobre/`.

**Método.** A janela do Chrome desta máquina fica maximizada e o `resize_window` da extensão não muda
o viewport. Como nos planos 042–044, as três larguras foram obtidas carregando `/sobre/` dentro de
`<iframe>` de 360, 768 e 1440 px (`display: block`, sem `flex` — um teste intermediário com
`display: flex` encolheu os iframes para 300/407/764 px e foi descartado; as medições abaixo foram
reconfirmadas depois de voltar a `block`). As media queries seguem a largura do iframe e o
`javascript_tool` lê o documento de dentro.

`[scrollWidth, clientWidth]` de `document.documentElement`, carimbo
`Fri Sep 18 2026 09:53:22 GMT-0300 (Horário Padrão de Brasília)`:

```
{"carimbo":"Fri Sep 18 2026 09:53:22 GMT-0300 (Horário Padrão de Brasília)","conf":{"360":{"larguraIframe":360,"scrollWidth":345,"clientWidth":345},"768":{"larguraIframe":768,"scrollWidth":753,"clientWidth":753},"1440":{"larguraIframe":1440,"scrollWidth":1425,"clientWidth":1425}}}
```

| Largura | `scrollWidth` | `clientWidth` | Iguais? |
|---|---|---|---|
| 360 | 345 | 345 | ✅ |
| 768 | 753 | 753 | ✅ |
| 1440 | 1425 | 1425 | ✅ |

Os 15 px entre a largura do iframe e o `clientWidth` são a barra de rolagem vertical. **Nenhuma
rolagem horizontal em nenhuma das três larguras (RF-26).**

**Formação empilhada em 360.** `grid-template-columns` computado da linha de formação, e altura da
primeira linha, por largura:

```
360:  gridFormacao "304.8px"                        alturaLinha1 137px   nLinhasFormacao 5
768:  gridFormacao "128px 265.688px 265.688px"      alturaLinha1  79px   nLinhasFormacao 5
1440: gridFormacao "128px 576.4px 576.4px"          alturaLinha1  52px   nLinhasFormacao 5
```

Uma coluna a 360 (empilhado), três colunas a partir de 768. Confirmado também por captura de tela:
a 360, `ano`, `grau — curso` e `instituicao` aparecem em linhas próprias, com régua fina entre as
entradas e régua forte no topo da primeira.

**Faixa de células — recomposição sem espaço reservado (F-08).** Só três células existem (áreas,
contato, perfis); não há célula de foto. `x` e largura de cada uma, por largura de tela:

```
360:  grade "304.8px"                          células [20,305] [20,305] [20,305]
768:  grade "345.688px 345.688px"              células [31,346] [376,346] [31,691]
1440: grade "437.6px 437.6px 437.6px"          células [56,438] [494,438] [931,438]
```

A 768 a terceira célula (ímpar, última) estica pela linha inteira — `[31, 691]` —, que é o padrão do
`SiteFooter.astro` e o que a revisão do plano 044 apontou faltar na faixa da Home. Confirmado por
captura de tela.

**Conteúdo renderizado** (documento de 1440):

```
h1                 1  — "Biografia e formação"
h2                 ["Formação acadêmica", "Áreas de atuação", "Contato", "Perfis acadêmicos"]
paragrafosBio      1
imgsEmMain         0
mailto             [["mailto:haroldo.lima@ufma.br", "underline"]]
perfisMain         [["Currículo Lattes↗ (abre em nova aba)", "http://lattes.cnpq.br/8115459874963916", "_blank", "noopener noreferrer"],
                    ["ORCID↗ (abre em nova aba)",           "https://orcid.org/0000-0002-3702-7683",  "_blank", "noopener noreferrer"]]
ariaCurrent        [["Haroldo Lima JuniorCentro Tecnológico — Departamento de Física", null],
                    ["Início›", null], ["Sobre›", "page"], ["Pesquisa›", null],
                    ["Ensino›", null], ["Publicações›", null]]
formacaoOrdem      2023–2024 · 2023 · 2019–2023 · 2018–2019 · 2014–2018   (ordem do arquivo, não reordenada)
```

Quatro `<h2>` e nada mais: **nenhuma rubrica órfã de foto nem de currículo em PDF**. `aria-current="page"`
está em "Sobre" e em nenhum outro item do cabeçalho.

**E-mail e perfis clicáveis.** `elementFromPoint` no centro de cada link, depois de `scrollIntoView`
(sem a rolagem, a 360 e 768 os links caem fora do viewport de 900 px do iframe e o método devolve
`nada` — foi o que aconteceu na primeira tentativa, descartada):

```
{"360":[{"texto":"haroldo.lima@ufma.br","alvoNoPonto":"o proprio link"},{"texto":"Currículo Lattes↗ (a","alvoNoPonto":"o proprio link"},{"texto":"ORCID↗ (abre em nova","alvoNoPonto":"o proprio link"}],"768":[{"texto":"haroldo.lima@ufma.br","alvoNoPonto":"o proprio link"},{"texto":"Currículo Lattes↗ (a","alvoNoPonto":"o proprio link"},{"texto":"ORCID↗ (abre em nova","alvoNoPonto":"o proprio link"}],"1440":[{"texto":"haroldo.lima@ufma.br","alvoNoPonto":"o proprio link"},{"texto":"Currículo Lattes↗ (a","alvoNoPonto":"o proprio link"},{"texto":"ORCID↗ (abre em nova","alvoNoPonto":"o proprio link"}]}
```

Os três links são o alvo de acerto no próprio ponto, nas três larguras — nenhum coberto por outro
elemento. Os dois perfis abrem em nova aba (`target="_blank"`, `rel="noopener noreferrer"`), com o
aviso textual oculto "(abre em nova aba)". O `mailto:` não foi clicado de propósito: abriria o
cliente de e-mail da máquina.

**Foco visível — NÃO observado como o teclado o produz.** É a dívida já registrada no README da fase
para os planos 042, 043 e 044, e ela se repete aqui: **a tecla Tab enviada pela extensão do Chrome
não move o foco nesta máquina.** O que foi verificado, e só isso:

- `.focus()` programático move o foco (`ehOFocado: true` nos três links), mas **não** ativa
  `:focus-visible` (`focusVisible: false`, `outline: none`) — comportamento correto do Chrome, que
  reserva `:focus-visible` a foco de origem de teclado. **Não é prova de anel de foco ausente, e
  tampouco prova de anel presente.**
- A regra global existe no CSS entregue, lida por CSSOM do documento servido:

```
[
 ":focus-visible { outline: 2px solid var(--color-tinta); outline-offset: 3px; }"
]
```

A navegação por Tab desta rota **fica para o plano 053**, junto com a mesma pendência dos planos 042,
043 e 044.

### Passo 6 — Portão

`npm run lint`

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT:0
```

`npm run format:check` (rodado de novo após a última edição deste `.md`, ver nota do README da fase)

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT:0
```

`npm run test:coverage`

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  09:40:10
   Duration  1.57s (transform 3.93s, setup 0ms, import 6.55s, tests 257ms, environment 2ms)

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

### CI e Workers Builds sobre o commit empurrado

Commit de trabalho `369637a085ceed85a71608df18db093bf3107f73` (`369637a`), empurrado para a `main`
em 2026-09-18. Comando local verde não é evidência de DONE neste projeto — o CI já ficou vermelho
14 commits seguidos sem ninguém ver. Saída de
`gh api repos/researchgroups-ufma/haroldo-page/commits/<SHA-completo>/check-runs`:

```
Workers Builds: haroldo-page: completed / success
qualidade: completed / success
```

E `gh run list --commit <SHA-completo>`:

```
run 35348534672 — CI: completed/success
```

O SHA usado é o **completo**: o hash curto devolve `[]` em silêncio neste repositório. O Workers
Builds não é um run do Actions e por isso só aparece na consulta de *check-runs*.

### O que NÃO rodou

Passo 5 (verificação no navegador: `[scrollWidth, clientWidth]` a 360/768/1440, empilhamento da formação em 360, e-mail e perfis clicáveis abrindo em nova aba, foco visível por Tab, `aria-current` no cabeçalho) é do **orquestrador** — este executor não tem navegador nesta sessão, e deixou o critério correspondente em suspenso.

> **Nota do orquestrador (2026-09-18):** o passo 5 foi executado logo depois, e está registrado acima; o critério de `[scrollWidth, clientWidth]` está marcado. O único item que continua **não observado** é o foco por tecla Tab — dívida dos planos 042, 043 e 044, que fecha no 053.

### Verificador de fidelidade da Evidência

```
OK         01-astro-check.txt
OK         02-build-pipeline.txt
OK         02b-ls-dist-sobre.txt
OK         03a-h1-count.txt
OK         03b-perfis.txt
OK         03c-img-count.txt
OK         09a-formacao-count.txt
OK         09b-areas.txt
OK         09c-no-raw-blank.txt
OK         04a-canario-build.txt
OK         04b-canario-grep.txt
OK         04c-main-only-count.txt
OK         04d-git-status.txt
OK         04e-exit.txt
OK         06a-lint.txt
OK         06b-format-check-final.txt
OK         06c-test-coverage.txt
```

### Verificação autoritativa independente (orquestrador — `triage-runner`, 2026-09-18 09:49–09:51)

Execução independente da suíte, **depois** de o executor terminar todas as edições de
`src/pages/sobre.astro`. É a evidência oficial do plano; a saída do executor no passo 6 é o
feedback dele, não a verificação.

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
   Start at  09:49:11
   Duration  2.27s (transform 4.17s, setup 0ms, import 9.83s, tests 292ms, environment 2ms)

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
   Start at  09:49:20
   Duration  1.20s (transform 1.91s, setup 0ms, import 3.15s, tests 81ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                            │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
09:50:41 [content] Syncing content
09:50:41 [content] Synced content
09:50:41 [types] Generated 546ms
09:50:41 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (43 files): 
- 0 errors
- 0 warnings
- 0 hints

09:50:49 [content] Syncing content
09:50:49 [content] Synced content
09:50:49 [types] Generated 542ms
09:50:49 [build] output: "static"
09:50:49 [build] mode: "static"
09:50:49 [build] directory: S:\Projetos\academic_page\haroldo\dist\
09:50:49 [build] Collecting build info...
09:50:49 [build] ✓ Completed in 583ms.
09:50:49 [build] Building static entrypoints...
09:50:49 [vite] ✓ built in 422ms
09:50:49 [vite] ✓ built in 68ms
09:50:50 [build] Rearranging server assets...

 generating static routes 
09:50:50   ├─ /sobre/index.html (+20ms) 
09:50:50   ├─ /index.html (+3ms) 
09:50:50 ✓ Completed in 34ms.

09:50:50 [build] Completed in 590ms.
09:50:50 [build] 2 page(s) built in 1.23s
09:50:50 [build] Complete!
```
exit 0. `astro check` com `0 errors, 0 warnings, 0 hints` e **nenhuma linha `[ERROR]`** na saída.

**Veredito da verificação independente: os quatro comandos VERDES.**

### Divergência entre o plano e a realidade, conferida pelo orquestrador

O passo 4 manda comparar `grep -c 'Perfis acadêmicos\|Áreas de atuação' dist/sobre/index.html`
contra `0` **na página inteira**. Esse `0` é inatingível por construção, e não por defeito do
código: o `BaseLayout.astro:53` faz a própria chamada a `getCollection('perfil')` e passa o
resultado como prop ao `SiteHeader` e ao `SiteFooter`; o rodapé renderiza
`pt.footer.academicProfiles`, que é literalmente `'Perfis acadêmicos'` (`src/i18n/pt.ts:78`), em
**toda** rota, a partir de dados que o canário dentro de `sobre.astro` não alcança. O executor
reportou a divergência em vez de contorná-la, e provou o critério no escopo certo — `<main>`, onde
o resultado é `0`. Conferido pelo orquestrador contra os três arquivos citados, não aceito por
relato. **Agravante levantado pela revisão e reproduzido pelo orquestrador:** `dist/sobre/index.html` tem
**uma única linha** (HTML minificado), e `grep -c` conta *linhas*, não ocorrências. Logo o comando do
passo 4 só pode devolver `0` ou `1` em qualquer cenário — inclusive com rótulo órfão de verdade.
Medido em 2026-09-18 sobre o `dist/` autoritativo:

```
linhas do HTML: 1
grep -c (linhas):   1
grep -o | wc -l:    3
```

As 3 ocorrências são "Áreas de atuação" e "Perfis acadêmicos" no `<main>` mais "Perfis acadêmicos" no
rodapé. O `1` do passo 4 nunca foi uma contagem.

**Consequência para os próximos planos de rota (046–051):** o canário de rótulo órfão deve escopar o
`grep` a `<main>` **e** usar `grep -o ... | wc -l`, nunca `grep -c`, em HTML minificado de uma linha.
