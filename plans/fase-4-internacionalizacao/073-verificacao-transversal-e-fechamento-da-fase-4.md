# Plano 073 — Verificação transversal e fechamento da fase 4

**Status:** DONE
**RFs cobertos:** **M-07** (inspeção manual), critério de conclusão da fase 4 no §6.2 ("M-07 atingida; fallback verificado item a item"), RF-26, RF-28, RF-29; §12 fase 4, item 8
**Depende de:** **todos os planos 055–072 em `DONE`** (Q-F4-1 e Q-F4-2 já respondidas: Decisões 13 e 14)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **orquestrador** (navegador, passos 1–5) + **agente** (documentos, passos 6–8)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Fica demonstrado, sobre a `main` atualizada, o critério de conclusão da fase: todas as rotas EN nas
três larguras sem rolagem horizontal, **nenhuma** string de interface em português nelas (inspeção
manual, além do teste do 072), e o **fallback verificado item a item** — cada item de conteúdo, na sua
rota EN, sai em inglês ou em português marcado conforme o seu grupo `en`. O §12 da fase 4 chega a 9/9.

## Arquivos afetados

- `plans/fase-4-internacionalizacao/README.md` — estado, "Onde cada item do §12 fecha", seção nova "O que a fase 4 empurra adiante, e as dívidas que ela criou"
- `plans/README.md` — linha da fase 4 e "Última atualização"
- `PRD.md` — §0, §0.1, §6.2 se preciso, §7.2 (versão do `@astrojs/sitemap`), §7.5 (`src/views/`, se o 062 não registrou), §12 (item 8 e a contagem)
- `plans/DESPACHO.md` — a seção "Regras de código da fase 3" passa a apontar para o README da fase vigente

> O executor (passos 6–8) não toca em `src/`, `tests/` nem `content/`. Se a verificação dos passos 1–5
> achar defeito, ele vira correção **em plano próprio** antes deste fechar.

## Contexto necessário

**Critério da fase** (§6.2): "M-07 atingida; fallback verificado item a item." **M-07** (§3.3): "Rotas
`/en` sem string de interface em português — 0 ocorrências — Inspeção manual de todas as rotas EN +
teste sobre o `dist/`… (Decisão 12)". O teste é do 072; **a inspeção manual é deste plano** e não é
substituída pelo teste (o teste não vê texto hardcoded que não coincide com valor de dicionário).

**Procedimento de navegador:** seção "Verificação no navegador" do README da fase (Vivaldi, aba
visível, iframe a 360/768/1440, Tab não move o foco nesta máquina). Rotas EN: `/en/`, `/en/about/`,
`/en/research/`, `/en/teaching/`, `/en/teaching/2026-2-relatividade-geral/`,
`/en/teaching/2025-1-mecanica-classica/`, `/en/publications/` (no `astro preview`) e
`/en/rota-inexistente` (no `wrangler dev`) — **8 rotas × 3 larguras = 24 linhas**.

**Inspeção M-07 (passo 3):** em cada rota EN, a 1440, ler o texto visível e os nomes acessíveis
(árvore de acessibilidade da extensão) e listar **todo** trecho em português que **não** esteja dentro
de elemento `lang="pt-BR"` (um script no console que percorre os nós de texto fora de
`[lang="pt-BR"]` ajuda, mas a leitura é o método — transcreva os dois). Esperado: nenhum. Qualquer
ocorrência reprova e vira plano de correção.

**Fallback item a item (passo 4):** tabela com uma linha por item de conteúdo **publicado** (perfil e
seus itens de `formacao`/`atuacao`/`areas`; cada linha de pesquisa; cada projeto; cada disciplina;
cada publicação) × campo traduzível exibido: valor do `en` no arquivo (vazio/preenchido), o que a rota
EN mostrou, e o `lang` do elemento. Gerada por script a partir de `content/` e do `dist/`, **conferida
por amostra no navegador** (ao menos a linha de pesquisa com `en.titulo`, uma disciplina e o perfil).
Campos "P" entram na tabela numa seção à parte: `lang="pt-BR"` em `/en` e **nenhum** efeito sobre o
aviso (Decisão 13).

**Seletor em todas as rotas (passo 5):** de cada rota PT, o seletor leva à EN correspondente e volta
(ida e volta nas 8 rotas); a transição entre páginas não aborta.

**§0 do PRD:** vocabulário fechado do `Status` (`plans/README.md`, "Promoção de plano e o topo do
PRD"); o progresso vai na linha "Estado da implementação". A tabela "Progresso Geral" do §12
passa a "Fase 4 — 9/9 — 🟢 Concluída".

**"O que a fase 4 empurra adiante"** (no README da fase, padrão do README da fase 3): no mínimo — o
`robots.txt` apontando o `sitemap-index.xml` e a retirada do `X-Robots-Tag: noindex` (fase 5, Q-05);
Open Graph (fase 5, RF-30); o manual do professor explicando o grupo "Versão em inglês" dentro de cada
item (fase 5, §10.5); e toda dívida nova que os planos 055–072 registraram, cada uma com "fecha
quando".

## Passos

1. Orquestrador: `npm ci`, `npm run build:pipeline`, `npm run test:dist` sobre a `main` atualizada → verify: saídas com o SHA (`git rev-parse HEAD`).
2. Orquestrador: tabela 8 rotas EN × 3 larguras, `[scrollWidth, clientWidth]` e elemento cortado → verify: tabela com data e horário; qualquer desigualdade reprova.
3. Orquestrador: inspeção M-07, rota a rota → verify: transcrição por rota (texto em português fora de `lang="pt-BR"`: nenhum).
4. Orquestrador + script: tabela do fallback item a item e as amostras no navegador → verify: tabela colada e as amostras transcritas.
5. Orquestrador: seletor ida e volta nas 8 rotas → verify: transcrição.
6. Agente: README da fase e `plans/README.md` → verify: `git diff --stat` colado.
7. Agente: PRD §0, §0.1, §7.2, §7.5, §12 → verify: `grep -n "Fase 4" PRD.md` colado mostrando `9/9` e `🟢 Concluída`, e o §0 sem contradição.
8. Agente: `plans/DESPACHO.md` → verify: `git diff plans/DESPACHO.md` colado.
9. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run build:pipeline`, `npm run test:dist` colados; **orquestrador**: CI `success` e Workers Builds `success` no commit de fechamento, com ids.

## Critérios de aceitação

- [x] 8 rotas EN × 3 larguras sem rolagem horizontal nem elemento cortado (RF-26)
- [x] Inspeção M-07: zero texto de interface em português fora de `lang="pt-BR"` nas 8 rotas EN
- [x] Fallback verificado item a item, com a tabela e as amostras no navegador
- [x] Seletor ida e volta nas 8 rotas (RF-29)
- [x] README da fase com o estado final e o que a fase empurra adiante, cada item com "fecha quando"
- [x] §12 da fase 4 em 9/9; §0, §0.1, §7.2 e §7.5 atualizados; `plans/README.md` com a fase 4 concluída
- [x] Portão local completo, CI e Workers Builds verdes no commit de fechamento, com saída colada

## Evidência

Executado em 2026-10-02. Passos 1–5 são do orquestrador (navegador, Vivaldi); os passos 6–9 foram feitos
pelo executor. Cada bloco abaixo é o conteúdo literal do arquivo citado em "Fonte", inserido por script:
BOM tirado na leitura (`utf-8-sig`) e fim de linha CRLF normalizado para LF. Nos três `p1-*.txt` foram
**removidas as sequências ANSI** (`ESC[...m`) por expressão regular; nada mais foi alterado neles. Os
demais `.txt` estão colados como estão.

### Passos 1–5 (orquestrador)

Evidência dos passos 1–5, produzida pelo orquestrador e inserida pelo executor a seu pedido. O executor
**não rodou** esses passos.

#### Passo 1 — SHA, data e `npm ci`

Fonte: `p1-ci.txt`

```text
fc7c2ec4461e88e1e2c825d31d8201670d2da8c6
Fri Oct  2 15:33:22     2026
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.

added 1519 packages, and audited 1520 packages in 39s

328 packages are looking for funding
  run `npm fund` for details

9 vulnerabilities (1 low, 8 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
```

#### Passo 1 — `npm run build:pipeline`

Fonte: `p1-build.txt`

```text
fc7c2ec4461e88e1e2c825d31d8201670d2da8c6
Fri Oct  2 15:34:07     2026

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  15:34:29
   Duration  2.04s (transform 2.14s, setup 0ms, import 4.18s, tests 73ms, environment 0ms)

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
15:35:52 [vite] [optimizer] bundling dependencies...
15:35:52 [content] Syncing content
15:35:52 [content] Synced content
15:35:52 [types] Generated 1.94s
15:35:52 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

15:36:04 [content] Syncing content
15:36:04 [content] Synced content
15:36:04 [types] Generated 573ms
15:36:04 [build] output: "static"
15:36:04 [build] mode: "static"
15:36:04 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:36:04 [build] Collecting build info...
15:36:04 [build] ✓ Completed in 618ms.
15:36:04 [build] Building static entrypoints...
15:36:05 [vite] ✓ built in 622ms
15:36:05 [vite] ✓ built in 157ms
15:36:05 [build] Rearranging server assets...

 generating static routes 
15:36:05   ├─ /404.html (+20ms) 
15:36:05   ├─ /en/404/index.html (+5ms) 
15:36:05   ├─ /en/about/index.html (+10ms) 
15:36:05   ├─ /en/publications/index.html (+7ms) 
15:36:05   ├─ /en/research/index.html (+8ms) 
15:36:05   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
15:36:05   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+133ms) 
15:36:05   ├─ /en/teaching/index.html (+10ms) 
15:36:05   ├─ /en/index.html (+7ms) 
15:36:05   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
15:36:05   ├─ /ensino/2026-2-relatividade-geral/index.html (+19ms) 
15:36:05   ├─ /ensino/index.html (+5ms) 
15:36:06   ├─ /pesquisa/index.html (+4ms) 
15:36:06   ├─ /publicacoes/index.html (+3ms) 
15:36:06   ├─ /sobre/index.html (+4ms) 
15:36:06   ├─ /index.html (+3ms) 
15:36:06 ✓ Completed in 300ms.

15:36:06 [build] ✓ Completed in 1.15s.
15:36:06 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
15:36:06 [build] 16 page(s) built in 1.82s
15:36:06 [build] Complete!
EXIT=0
```

#### Passo 1 — `npm run test:dist`

Fonte: `p1-testdist.txt`

```text
fc7c2ec4461e88e1e2c825d31d8201670d2da8c6
Fri Oct  2 15:36:06     2026

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  54 passed (54)
   Start at  15:36:07
   Duration  537ms (transform 174ms, setup 0ms, import 290ms, tests 361ms, environment 0ms)

EXIT=0
```

#### Passo 2 — 8 rotas EN × 3 larguras

Fonte: `p2-larguras.txt`

```text
Passo 2 — 8 rotas EN × 3 larguras. Vivaldi (extensão Claude in Chrome), `<iframe>` com box-sizing:content-box, innerWidth conferido igual à largura em todas as linhas.
Medido em Fri Oct 02 2026 15:37:41 GMT-0300 sobre `npx astro preview` (http://localhost:4321) do dist/ gerado no passo 1 (HEAD fc7c2ec4461e88e1e2c825d31d8201670d2da8c6).
Colunas: rota | largura | [scrollWidth, clientWidth] do documento | igualdade | elementos com caixa fora da viewport sem ancestral que recorte.
clientWidth < largura nas páginas com rolagem vertical no iframe de 900 px de altura = barra de rolagem vertical (10 px); o critério é scrollWidth = clientWidth.

/en/ 360 [350, 350]= cut:1(skip)
/en/ 768 [758, 758]= cut:1(skip)
/en/ 1440 [1440, 1440]= cut:1(skip)
/en/about/ 360 [350, 350]= cut:1(skip)
/en/about/ 768 [758, 758]= cut:1(skip)
/en/about/ 1440 [1440, 1440]= cut:1(skip)
/en/research/ 360 [350, 350]= cut:1(skip)
/en/research/ 768 [758, 758]= cut:1(skip)
/en/research/ 1440 [1440, 1440]= cut:1(skip)
/en/teaching/ 360 [360, 360]= cut:1(skip)
/en/teaching/ 768 [768, 768]= cut:1(skip)
/en/teaching/ 1440 [1440, 1440]= cut:1(skip)
RG 360 [350, 350]= cut:1(skip)
RG 768 [758, 758]= cut:1(skip)
RG 1440 [1440, 1440]= cut:1(skip)
MC 360 [360, 360]= cut:1(skip)
MC 768 [768, 768]= cut:1(skip)
MC 1440 [1440, 1440]= cut:1(skip)
/en/publications/ 360 [350, 350]= cut:1(skip)
/en/publications/ 768 [758, 758]= cut:1(skip)
/en/publications/ 1440 [1440, 1440]= cut:1(skip)

RG = /en/teaching/2026-2-relatividade-geral/ ; MC = /en/teaching/2025-1-mecanica-classica/
#conteudo [scrollWidth, clientWidth]: remedido às 15:41:39 no `wrangler dev` (mesmo dist/), 8 rotas × 3 larguras — igual nas 24
(saída do script: "15:41:39 24 " = 24 medidas, nenhuma desigual). Exemplos da 1ª medição em /en/: 310/310, 696/696, 1328/1328.
"(skip)" foi impresso pelo script de resumo, que trocou a descrição literal do elemento achado, `a.focus:bg-papel[-1,0]`
  (tag, 1ª classe e [left,right]), por "(skip)"; nas 21 linhas do preview a descrição era essa mesma, e na 404 o script testou
  `className.includes('sr-only')`. Esse elemento é o link "Skip…" (sr-only), conferido por inteiro a 360 em /en/ —
  `<a href="#conteudo" class="... sr-only focus:not-sr-only ...">` com position absolute, 1px × 1px, clip-path inset(50%).
  Escondido por construção até receber foco; não é elemento cortado.

/en/rota-inexistente — no `npx wrangler dev` (http://localhost:8787), Fri Oct 02 2026 15:40:54 GMT-0300, HTTP 404:
/en/rota-inexistente 360 innerWidth 360 [360, 360]= cut:1(skip) lang=en
/en/rota-inexistente 768 innerWidth 768 [768, 768]= cut:1(skip) lang=en
/en/rota-inexistente 1440 innerWidth 1440 [1440, 1440]= cut:1(skip) lang=en

Total: 24/24 linhas com scrollWidth = clientWidth e nenhum elemento cortado.
```

#### Passo 3 — inspeção M-07

Fonte: `p3-m07.txt`

```text
Passo 3 — Inspeção M-07, 2026-10-02 ~15:38–15:40 (UTC−3), Vivaldi, `astro preview` do dist/ de fc7c2ec.
Método (os dois, como o plano pede):
 (1) script no console: em iframe de 1440 px, TreeWalker sobre os nós de texto do <body>, fora de script/style/template,
     separando os que estão dentro de `[lang="pt-BR"]` (contados, não listados) dos que estão fora (listados, sem repetição),
     mais os atributos aria-label, alt, title e placeholder; e o <title> do documento;
 (2) leitura: o texto abaixo foi lido trecho a trecho por mim, e a árvore de acessibilidade (read_page, interativos) de
     cada rota na janela de topo (viewport 1536). Limite conhecido da ferramenta: ela dá "(unnamed)" a link cujo texto está
     dentro de <span> (memória do projeto, plano 069) — por isso o seletor e alguns links aparecem sem nome; o texto deles
     está na lista (1).

Texto fora de lang="pt-BR" (separador ¦), por rota:

/en/  — <title> "Prof. Haroldo C. D. Lima Junior"; nós dentro de pt-BR: 20
  Skip to content ¦ Haroldo Lima ¦ About ¦ Research ¦ Teaching ¦ Publications ¦ Some content on this page is only available in
  Portuguese. ¦ Contact ¦ haroldo.lima@ufma.br ¦ Lattes CV ¦ ↗ ¦ (opens in new tab) ¦ ORCID ¦ Education ¦ 2023–2024 · ¦ — ¦
  2023 · ¦ 2019–2023 · ¦ 2018–2019 · ¦ 2014–2018 · ¦ Research interests
  atributos: aria-label=Main navigation ¦ alt=Portrait of Haroldo Lima
  árvore: links About, Research, Teaching, Publications, (seletor, href "/"), haroldo.lima@ufma.br, Lattes CV, ORCID

/en/about/  — <title> "About — Haroldo Lima Junior"; nós dentro de pt-BR: 21
  Skip to content ¦ Haroldo Lima ¦ Menu ¦ About ¦ › ¦ Research ¦ Teaching ¦ Publications ¦ Biography and education ¦ Contact ¦
  haroldo.lima@ufma.br ¦ Lattes CV ¦ ↗ ¦ (opens in new tab) ¦ ORCID ¦ Education ¦ 2023–2024 ¦ — ¦ 2023 ¦ 2019–2023 ¦
  2018–2019 ¦ 2014–2018 ¦ Professional experience
  atributos: aria-label=Main navigation ¦ alt=Portrait of Haroldo Lima
  árvore: Haroldo Lima, (seletor → /sobre/), About, Research, Teaching, Publications, haroldo.lima@ufma.br, Lattes CV, ORCID

/en/research/  — <title> "Research — Haroldo Lima Junior"; nós dentro de pt-BR: 11
  (cabeçalho igual ao de /en/about/) ¦ Research areas and projects ¦ Some content on this page is only available in Portuguese. ¦
  General relativity and alternative theories of gravity ¦ 2025.1– · In progress ¦ Other projects ¦ 2023.1–2025.2 · Completed
  atributos: aria-label=Main navigation
  árvore: Haroldo Lima, (seletor → /pesquisa/), About, Research, Teaching, Publications

/en/teaching/  — <title> "Teaching — Haroldo Lima Junior"; nós dentro de pt-BR: 6
  (cabeçalho) ¦ Courses ¦ Some content on this page is only available in Portuguese. ¦ Current ¦ FIS0000 · 2026.2 ¦
  Latest lecture · ¦ 5. ¦ ↗ ¦ (opens in new tab) ¦ · September 14, 2026 ¦ Previous ¦ 2025.1
  atributos: aria-label=Main navigation
  árvore: Haroldo Lima, (seletor → /ensino/), About, Research, Teaching, Publications, "Relatividade Geral", "5.", (link Mecânica)

/en/teaching/2026-2-relatividade-geral/  — <title> "Relatividade Geral — Haroldo Lima Junior"; nós dentro de pt-BR: 25
  (cabeçalho) ¦ FIS0000 · 2026.2 · Current ¦ Syllabus ¦ Some content on this page is only available in Portuguese. ¦ Lectures ¦
  Problem sheets ¦ Additional materials ¦ Bibliography ¦ Links ¦ 01 · ¦ Lecture 1 ¦ August 10, 2026 ¦ ↗ ¦ (opens in new tab) ¦
  02 · ¦ Lecture 2 ¦ August 17, 2026 ¦ 03 · ¦ Lecture 3 ¦ August 24, 2026 ¦ 04 · ¦ Lecture 4 ¦ August 31, 2026 ¦
  Script · Python ¦ Copy code ¦ Open file ¦ [tokens do código Python: def raio_horizonte(massa, spin): """Retorna r+ para
  Kerr, com G = c = 1.""" … raise ValueError('spin excede o limite extremo') … print(f"M={m}: r+ = {r:.4f}
  'unidades geometricas'")] ¦ 05 · ¦ Lecture 5 ¦ September 14, 2026 ¦ Due September 7, 2026 ¦ Slides ¦ Notes ¦ Open
  atributos: aria-label=Main navigation ¦ aria-label=All courses ¦ aria-label=Course sections
  árvore: …, abas "Lectures", "Problem sheets", "Additional materials", "Bibliography", "Links"

/en/teaching/2025-1-mecanica-classica/  — <title> "Mecânica Clássica — Haroldo Lima Junior"; nós dentro de pt-BR: 4
  (cabeçalho) ¦ 2025.1 · Previous ¦ Some content on this page is only available in Portuguese. ¦ Lectures ¦
  No lectures published yet.
  atributos: aria-label=Main navigation ¦ aria-label=All courses ¦ aria-label=Course sections

/en/publications/  — <title> "Publications — Haroldo Lima Junior"; nós dentro de pt-BR: 2
  (cabeçalho) ¦ 2025 ¦ [EXEMPLO] Forças de maré próximas ao horizonte de buracos negros em rotação ¦ LIMA JUNIOR, HAROLDO C. D. ¦
  Classical and Quantum Gravity ¦ [EXEMPLO] Sombras de buracos negros de Kerr em gravitação de Gauss-Bonnet ¦
  , AUTOR DE EXEMPLO, A. B. ¦ Physical Review D ¦ DOI ¦ ↗ ¦ (opens in new tab) ¦ PDF ¦ 2024 ¦ [EXEMPLO] Desvios da hipótese de
  Kerr em imagens de horizonte de eventos ¦ [EXEMPLO] Modos quasinormais de campos escalares em espaços-tempos de Kerr ¦
  , AUTOR DE EXEMPLO, C. D. ¦ 2023 ¦ [EXEMPLO] Perturbações lineares de buracos negros com cabelo escalar ¦
  AUTOR DE EXEMPLO, E. F., ¦ Journal of Cosmology and Astroparticle Physics
  atributos: aria-label=Main navigation

Resultado: texto de INTERFACE em português fora de lang="pt-BR": NENHUM nas 7 rotas acima.
Português que aparece fora de lang="pt-BR" e é CONTEÚDO, previsto pela tabela F/P/T do README da fase:
 - `scripts[].codigo` (código Python da aula 4 de RG): tipo F, "sem lang, sem aviso";
 - `publicacoes.titulo` ([EXEMPLO] …): tipo F pela Decisão 13, "sem lang, sem aviso";
 - <title> das duas disciplinas ("Relatividade Geral", "Mecânica Clássica"): `disciplinas.nome`, tipo T em fallback;
   o elemento <title> não carrega lang próprio. A página exibe o aviso ("Some content on this page is only available in
   Portuguese."), e no corpo o nome sai dentro de lang="pt-BR" (o link "Relatividade Geral" em /en/teaching/ não aparece na
   lista (1), logo está numa subárvore pt-BR). Observação, não reprovação: não é string de interface.
/en/rota-inexistente  — no `npx wrangler dev` (http://localhost:8787), Fri Oct 02 2026 15:40:54 GMT-0300; resposta HTTP 404 com
  corpo de SHA-256 ccfa11ff…7d60, igual ao de dist/en/404.html. <title> "Page not found — Haroldo Lima Junior"; nós dentro de pt-BR: 2
  Skip to content ¦ Haroldo Lima ¦ Menu ¦ About ¦ › ¦ Research ¦ Teaching ¦ Publications ¦ Page not found ¦ Error 404 ¦
  The address may have changed with the semester. Materials from previous courses remain on the Teaching page. ¦ All pages ¦ Home
  atributos: aria-label=Main navigation
  seletor: href "/" com texto "PT (Versão em português)" — os 2 nós pt-BR da página.
Resultado na 404: nenhum texto de interface em português fora de lang="pt-BR".
Total: 8/8 rotas EN, zero texto de interface em português fora de lang="pt-BR".
```

#### Passo 4 — fallback item a item e amostras no navegador

Fonte: `p4-fallback-evidencia.txt`

```text
Passo 4 — Fallback item a item. Tabela gerada por script (scratchpad/p073/fallback.py, versão do ciclo 2: inclui a "Última aula" de Ensino) a partir de content/ e de dist/en/** (dist/ do passo 1, HEAD fc7c2ec), 2026-10-02 ~15:42 (UTC−3).
Método: para cada item publicado e cada campo exibido, procura os 60 primeiros caracteres do valor `en` (se houver) e do valor PT no texto do <body> (sem script/style/head) da rota EN, e registra o `lang` herdado no ponto do casamento. Campo não achado na rota EN é conferido na rota PT correspondente: ausente nas duas = o campo não é exibido nessa página. Tipos pela tabela T/F/P do README da fase (T = traduzível com fallback; P = sem campo em inglês, marca lang, sem aviso).

| Item | Campo | Tipo | `en` no arquivo | Rota EN | O que a rota mostrou (lang do elemento) |
|---|---|---|---|---|---|
| perfil | cargo | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil | departamento | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil | instituicao | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil | resumo_home | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil | bio | T | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[0] | grau | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[0] | curso | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[0] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[1] | grau | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[1] | curso | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[1] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[2] | grau | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[2] | curso | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[2] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[3] | grau | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[3] | curso | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[3] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[4] | grau | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[4] | curso | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.formacao[4] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.areas[0] | nome | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.areas[1] | nome | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.areas[2] | nome | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil.areas[3] | nome | T | vazio | /en/ | PT (lang=pt-BR) |
| perfil | cargo | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil | departamento | T | vazio | /en/about/ | não exibido nesta página (nem na rota PT /sobre/) |
| perfil | instituicao | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil | resumo_home | T | vazio | /en/about/ | não exibido nesta página (nem na rota PT /sobre/) |
| perfil | bio | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[0] | grau | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[0] | curso | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[0] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[1] | grau | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[1] | curso | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[1] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[2] | grau | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[2] | curso | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[2] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[3] | grau | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[3] | curso | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[3] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[4] | grau | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[4] | curso | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[4] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.atuacao[0] | cargo | T | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.atuacao[0] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.atuacao[0] | periodo | P | vazio | /en/about/ | PT (lang=pt-BR) |
| linha relatividade-geral-e-teorias-alternativas-de-gravitacao | titulo | T | preenchido | /en/research/ | EN (lang=en) |
| linha relatividade-geral-e-teorias-alternativas-de-gravitacao | resumo | T | vazio | /en/research/ | PT (lang=pt-BR) |
| linha relatividade-geral-e-teorias-alternativas-de-gravitacao | corpo | T | vazio | /en/research/ | PT (lang=pt-BR) |
| linha sombras-de-buracos-negros | titulo | T | vazio | /en/research/ | PT (lang=pt-BR) |
| linha sombras-de-buracos-negros | resumo | T | vazio | /en/research/ | PT (lang=pt-BR) |
| linha sombras-de-buracos-negros | corpo | T | vazio | /en/research/ | campo vazio no arquivo — nada a exibir |
| projeto forcas-de-mare-em-espacos-tempos-de-kerr | titulo | T | vazio | /en/research/ | PT (lang=pt-BR) |
| projeto forcas-de-mare-em-espacos-tempos-de-kerr | descricao | T | vazio | /en/research/ | PT (lang=pt-BR) |
| projeto forcas-de-mare-em-espacos-tempos-de-kerr | financiador | P | vazio | /en/research/ | PT (lang=pt-BR) |
| projeto sombras-de-buracos-negros-em-gravitacao-modificada | titulo | T | vazio | /en/research/ | PT (lang=pt-BR) |
| projeto sombras-de-buracos-negros-em-gravitacao-modificada | descricao | T | vazio | /en/research/ | PT (lang=pt-BR) |
| projeto sombras-de-buracos-negros-em-gravitacao-modificada | financiador | P | vazio | /en/research/ | campo vazio no arquivo — nada a exibir |
| disciplina 2025-1-mecanica-classica | nome | T | vazio | /en/teaching/ | PT (lang=pt-BR) |
| disciplina 2025-1-mecanica-classica | descricao | T | vazio | /en/teaching/ | não exibido nesta página (nem na rota PT /ensino/) |
| disciplina 2025-1-mecanica-classica | nome | T | vazio | /en/teaching/2025-1-mecanica-classica/ | PT (lang=pt-BR) |
| disciplina 2025-1-mecanica-classica | descricao | T | vazio | /en/teaching/2025-1-mecanica-classica/ | PT (lang=pt-BR) |
| disciplina 2025-1-mecanica-classica | ementa | T | vazio | /en/teaching/2025-1-mecanica-classica/ | campo vazio no arquivo — nada a exibir |
| disciplina 2026-2-relatividade-geral | nome | T | vazio | /en/teaching/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | descricao | T | vazio | /en/teaching/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[4].titulo (Última aula) | P | vazio | /en/teaching/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | nome | T | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | descricao | T | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | ementa | T | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[0].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[1].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[1].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[2].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[2].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[3].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[3].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[4].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[4].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | listas[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | listas[1].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[0].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[1].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[1].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | campo vazio no arquivo — nada a exibir |
| disciplina 2026-2-relatividade-geral | bibliografia[0].referencia | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | bibliografia[1].referencia | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | links[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | scripts[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | scripts[0].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |

Aviso F-07 por rota:
/en/: aviso presente
/en/about/: aviso ausente
/en/research/: aviso presente
/en/teaching/: aviso presente
/en/teaching/2025-1-mecanica-classica/: aviso presente
/en/teaching/2026-2-relatividade-geral/: aviso presente
/en/publications/: aviso ausente

Leitura da tabela (91 linhas de item × campo × rota; 1 + 77 + 9 + 4 = 91):
- 1 campo com `en` preenchido em todo o conteúdo publicado (linha de pesquisa RG, `en.titulo`): mostrado em inglês, lang=en (herdado do <html>).
- 77 linhas mostram o PT com lang=pt-BR: todo T sem `en` e todo P exibido. Nenhum texto em PT sem marca.
- 9 linhas "não exibido nesta página (nem na rota PT)": a Home mostra resumo_home (não bio) e não mostra instituição da formação (5);
  a Sobre não mostra departamento nem resumo_home como campo; Ensino só mostra a descrição da disciplina atual. Mesma página no PT.
- 4 linhas "campo vazio no arquivo".
- 0 linhas "AUSENTE NO EN, PRESENTE NO PT".
- Publicações: nenhuma linha na tabela — o único campo T (`resumo`) não é exibido (Decisão 15) e `titulo`/`veiculo` são F
  (Decisão 13), fora do fallback; as 5 publicadas aparecem em /en/publications/ no passo 3.
- Aviso F-07: presente nas rotas com T em fallback (/en/, /en/research/, /en/teaching/ e as duas disciplinas); ausente na
  /en/about/ (Decisão 16) e em /en/publications/ (só campos F exibidos; `resumo`, o único T, não é exibido — Decisão 15).
- Campos P (seção à parte do plano, listada abaixo): formacao/atuacao instituição, atuacao periodo, financiador, a "Última aula" em
  /en/teaching/ (README da fase, linha de `aulas[].titulo`), e na RG aulas, listas, materiais,
  bibliografia, links e scripts — todos com lang=pt-BR. Efeito sobre o aviso: na /en/about/ só há P e T, e o aviso está ausente
  pela Decisão 16; nas demais rotas o aviso é disparado pelos T em fallback. A prova isolada "P não liga o aviso" é o canário duplo
  do passo 6 do plano 067 (critério marcado na linha 91 daquele plano); com o conteúdo atual não existe rota com P e sem T em
  fallback, então não foi refeita aqui.


Campos P, seção à parte (as mesmas linhas da tabela acima filtradas por tipo P; 36 linhas) — todas com lang=pt-BR ou campo vazio/não exibido:
| perfil.formacao[0] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[1] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[2] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[3] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[4] | instituicao | P | vazio | /en/ | não exibido nesta página (nem na rota PT /) |
| perfil.formacao[0] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[1] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[2] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[3] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.formacao[4] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.atuacao[0] | instituicao | P | vazio | /en/about/ | PT (lang=pt-BR) |
| perfil.atuacao[0] | periodo | P | vazio | /en/about/ | PT (lang=pt-BR) |
| projeto forcas-de-mare-em-espacos-tempos-de-kerr | financiador | P | vazio | /en/research/ | PT (lang=pt-BR) |
| projeto sombras-de-buracos-negros-em-gravitacao-modificada | financiador | P | vazio | /en/research/ | campo vazio no arquivo — nada a exibir |
| disciplina 2026-2-relatividade-geral | aulas[4].titulo (Última aula) | P | vazio | /en/teaching/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[0].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[1].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[1].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[2].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[2].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[3].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[3].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[4].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | aulas[4].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | listas[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | listas[1].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[0].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[1].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | materiais[1].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | campo vazio no arquivo — nada a exibir |
| disciplina 2026-2-relatividade-geral | bibliografia[0].referencia | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | bibliografia[1].referencia | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | links[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | scripts[0].titulo | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |
| disciplina 2026-2-relatividade-geral | scripts[0].descricao | P | vazio | /en/teaching/2026-2-relatividade-geral/ | PT (lang=pt-BR) |

Amostras no navegador (Vivaldi, `npx wrangler dev` http://localhost:8787, mesmo dist/), nó de texto → `lang` mais próximo:
15:43:33 /en/research/
<p> "Some content on this page is only available in Portuguese." → lang mais próximo: en (<html>)
<h2> "General relativity and alternative theories of gravity" → lang mais próximo: en (<html>)
<p> "Estudo de soluções da relatividade geral e de teorias alternativas de " → lang mais próximo: pt-BR (<p>)
<h2> "Sombras de buracos negros" → lang mais próximo: pt-BR (<h2>)
<h3> "Sombras de buracos negros em gravitação modificada" → lang mais próximo: pt-BR (<h3>)
<h3> "Forças de maré em espaços-tempos de Kerr" → lang mais próximo: pt-BR (<h3>)

15:43:46 /en/teaching/2026-2-relatividade-geral/
<h1> "Relatividade Geral" → pt-BR (<h1>)
<p> "Curso de pós-graduação em relatividade geral, da geometria d" → pt-BR (<p>)
<p> "Variedades e tensores; conexão e curvatura; equações de camp" → pt-BR (<p>)
<p> "Some content on this page is only available in Portuguese." → en (<html>)
<span> "Variedades, tensores e a conexão de Levi-Civita" → pt-BR (<span>)
<h4> "Raio do horizonte de Kerr" → pt-BR (<h4>)
<span> "Lista 1 — Geometria diferencial e tensores" → pt-BR (<span>)
<span> "Slides — Módulo 1: geometria diferencial" → pt-BR (<span>)
<span> "WALD, R. M. General Relativity. Chicago: University of Chica" → pt-BR (<span>)
<span> "Simulador de órbitas em Schwarzschild" → pt-BR (<span>)

15:43:49 /en/about/
<h1> "Biography and education" → en (<html>)
<p> "Professor Adjunto A no Departamento de Física do Centro Tecn" → pt-BR (<div>)
<span> "Formação complementar" → pt-BR (<span>)
<span> "Quantum Field Theory" → pt-BR (<span>)
<p> "ICTP — Trieste, Itália" → pt-BR (<p>)
<span> "Física" → pt-BR (<span>)
<span> "Física" → pt-BR (<span>)
<span> "Física" → pt-BR (<span>)
<span> "Física" → pt-BR (<span>)
<h2> "Professional experience" → en (<html>)
<span> "atual" → pt-BR (<span>)
<span> "Professor Adjunto A" → pt-BR (<span>)

As três amostras batem com as linhas correspondentes da tabela.
Observação (não reprova): `formacao[0].curso` = "Quantum Field Theory" já está em inglês no arquivo, mas sem `en.curso` cai no
fallback e sai marcado lang=pt-BR — o custo registrado na Decisão 4(b) ("um título escrito em inglês seria marcado pt-BR").
Some se o professor preencher `en.curso`.
```

#### Passo 5 — seletor, ida e volta

Fonte: `p5-seletor.txt`

```text
Passo 5 — Seletor ida e volta (RF-29). 2026-10-02, 16:20–16:24 (UTC−3), Vivaldi com a aba à frente (visibilityState "visible",
confirmado em cada leitura), `npx wrangler dev` http://localhost:8787 (dist/ de fc7c2ec), janela 1536×698, dpr 1.25.
Método: em cada página, ouvinte `pageswap` que grava em sessionStorage se o evento trouxe `viewTransition` (prova de que a
transição entre documentos foi iniciada; a conclusão no documento novo não é vista pelo `pageswap`); clique real (extensão, left_click) no centro do único `a[hreflang]` visível, nas
coordenadas lidas da página; leitura de `location.pathname`, `<html lang>` e do log depois de 1,5 s.

Saídas literais do javascript_tool, rota a rota (ida = clique em "EN (English version)"; volta = clique em "PT (Versão em português)"):

/  →
{"t":"16:20:33","at":"/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:20:42","at":"/en/","lang":"en","vis":"visible","log":["/ [pageswap com viewTransition]"],"seletores":1,"href":"/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:20:53","at":"/","lang":"pt-BR","log":["/ [pageswap com viewTransition]","/en/ [pageswap com viewTransition]"]}

/sobre/  →
{"t":"16:20:54","at":"/sobre/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/about/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:21:09","at":"/en/about/","lang":"en","vis":"visible","log":["/sobre/ [pageswap com viewTransition]"],"seletores":1,"href":"/sobre/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:21:11","at":"/sobre/","lang":"pt-BR","log":["/sobre/ [pageswap com viewTransition]","/en/about/ [pageswap com viewTransition]"]}

/pesquisa/  →
{"t":"16:21:11","at":"/pesquisa/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/research/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:21:31","at":"/en/research/","lang":"en","vis":"visible","log":["/pesquisa/ [pageswap com viewTransition]"],"seletores":1,"href":"/pesquisa/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:21:32","at":"/pesquisa/","lang":"pt-BR","log":["/pesquisa/ [pageswap com viewTransition]","/en/research/ [pageswap com viewTransition]"]}

/ensino/  →  (rodada válida; ver a nota sobre a primeira tentativa abaixo)
{"t":"16:22:59","at":"/ensino/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/teaching/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:23:01","at":"/en/teaching/","lang":"en","vis":"visible","log":["/ensino/ [pageswap com viewTransition]"],"seletores":1,"href":"/ensino/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:23:03","at":"/ensino/","lang":"pt-BR","log":["/ensino/ [pageswap com viewTransition]","/en/teaching/ [pageswap com viewTransition]"]}

/ensino/2026-2-relatividade-geral/  →
{"t":"16:23:26","at":"/ensino/2026-2-relatividade-geral/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/teaching/2026-2-relatividade-geral/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:23:28","at":"/en/teaching/2026-2-relatividade-geral/","lang":"en","vis":"visible","log":["/ensino/2026-2-relatividade-geral/ [pageswap com viewTransition]"],"seletores":1,"href":"/ensino/2026-2-relatividade-geral/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:23:30","at":"/ensino/2026-2-relatividade-geral/","lang":"pt-BR","log":["/ensino/2026-2-relatividade-geral/ [pageswap com viewTransition]","/en/teaching/2026-2-relatividade-geral/ [pageswap com viewTransition]"]}

/ensino/2025-1-mecanica-classica/  →
{"t":"16:23:32","at":"/ensino/2025-1-mecanica-classica/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/teaching/2025-1-mecanica-classica/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:23:34","at":"/en/teaching/2025-1-mecanica-classica/","lang":"en","vis":"visible","log":["/ensino/2025-1-mecanica-classica/ [pageswap com viewTransition]"],"seletores":1,"href":"/ensino/2025-1-mecanica-classica/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:23:36","at":"/ensino/2025-1-mecanica-classica/","lang":"pt-BR","log":["/ensino/2025-1-mecanica-classica/ [pageswap com viewTransition]","/en/teaching/2025-1-mecanica-classica/ [pageswap com viewTransition]"]}

/publicacoes/  →
{"t":"16:23:52","at":"/publicacoes/","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/publications/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:23:54","at":"/en/publications/","lang":"en","vis":"visible","log":["/publicacoes/ [pageswap com viewTransition]"],"seletores":1,"href":"/publicacoes/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:23:56","at":"/publicacoes/","lang":"pt-BR","log":["/publicacoes/ [pageswap com viewTransition]","/en/publications/ [pageswap com viewTransition]"]}

/rota-inexistente (404 PT; pela decisão de fatiamento 8 a 404 pareia com a Home do outro idioma)  →
{"t":"16:23:58","at":"/rota-inexistente","title":"Página não encontrada — Haroldo Lima Junior","lang":"pt-BR","vis":"visible","log":[],"seletores":1,"href":"/en/","txt":"EN (English version)","xy":[1366,72]}
{"t":"16:24:15","at":"/en/","lang":"en","vis":"visible","log":["/rota-inexistente [pageswap com viewTransition]"],"seletores":1,"href":"/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:24:17","at":"/","lang":"pt-BR","log":["/rota-inexistente [pageswap com viewTransition]","/en/ [pageswap com viewTransition]"]}

/en/rota-inexistente (404 EN, a 8ª rota EN do plano) → Home PT:
{"t":"16:24:19","at":"/en/rota-inexistente","title":"Page not found — Haroldo Lima Junior","lang":"en","vis":"visible","log":[],"seletores":1,"href":"/","txt":"PT (Versão em português)","xy":[1367,72]}
{"t":"16:24:20","at":"/","lang":"pt-BR","log":["/en/rota-inexistente [pageswap com viewTransition]"]}

Resultado: nas 8 rotas, o seletor leva à rota correspondente do outro idioma e volta (as 404 vão à Home do outro idioma, como no
mapa); 17/17 transições iniciadas (`pageswap` com `viewTransition`); a conclusão no documento novo NÃO foi medida (ver abaixo).

Nota sobre a primeira tentativa em /ensino/ (16:21:33–16:22:26), registrada e não aproveitada:
- O primeiro clique em (1366,72) não navegou. Para isolar a causa, instalei ouvintes de pointerdown/click antes de clicar de novo
  logo após uma navegação: {"clk":["pointerdown HTML 1366,72","click HTML prevented(captura)=false","click bolha prevented=false"]}
  — o clique chegou à página, mas com alvo <html>, não o link.
- Amostragem de elementFromPoint(1366,72) a cada 100 ms logo após `navigate` para /ensino/:
    432ms HTML anims=23 ::view-transition-group(nome)…|::view-transition-group(cartao)…|::view-transition-group(conteudo)…
    746ms SPAN anims=0
  Medido: transição ativa (23 animações ::view-transition-*) aos 432 ms e encerrada aos 746 ms do relógio do documento novo;
  enquanto ela roda, elementFromPoint no seletor devolve <html>, e o clique da repetição caiu no <html>. Deduzido (o instante do
  primeiro clique não foi medido): o primeiro clique caiu nessa mesma janela. Pseudo-elementos ::view-transition por cima do
  documento durante a transição são o comportamento padrão da API, não defeito do site. Daí em diante esperei 1,5 s depois de
  cada `navigate`.
- Nessa primeira tentativa, o ouvinte `pageswap` ficou instalado duas vezes na mesma página, e por isso o log mostrou entradas
  duplicadas; a rodada válida acima, com um só ouvinte, é a que conta.

Tentativa de medir a conclusão (ciclo 2 da revisão, 2026-10-02 ~16:47, `astro preview` sobre o mesmo dist/, aba à frente):
clique real no seletor de /sobre/ e, logo em seguida, amostragem de document.getAnimations() com pseudoElement ::view-transition*
a cada 50 ms no documento novo. Saída literal (primeiras linhas):
476ms /en/about/ vtAnims=0
529ms /en/about/ vtAnims=0
579ms /en/about/ vtAnims=0
Inconclusiva: a primeira amostra possível já chega aos 476 ms, depois do fim provável de uma transição de 350 ms
(src/styles/global.css), e 0 animações não distingue transição concluída de transição pulada. Fica registrado: iniciada 17/17,
conclusão não medida. (Uma tentativa anterior com a aba em segundo plano — visibilityState "hidden" — não navegou e foi descartada.)
```

### Passo 6 — README da fase e `plans/README.md`

Edições: `plans/fase-4-internacionalizacao/README.md` (Última atualização; linha M-07 de "Onde cada item do
§12 fecha"; a frase que apontava para a seção "Regras de código da fase 3" do `DESPACHO.md`; seção nova
"O que a fase 4 empurra adiante, e as dívidas que ela criou", com as observações do 073) e
`plans/README.md` (Última atualização; célula da fase 4). A tabela "Estado" do README da fase não foi
mexida: a linha do 073 continua `TODO` até a promoção, que é do orquestrador. O `git diff --stat` abaixo
cobre só os quatro arquivos de documentação, por caminho: o plano 073 muda depois, ao receber esta
Evidência.

Fonte: `diffstat.txt` (`git diff --stat -- PRD.md plans/README.md plans/DESPACHO.md plans/fase-4-internacionalizacao/README.md`)

```text
 PRD.md                                     | 11 +++--
 plans/DESPACHO.md                          | 10 ++--
 plans/README.md                            |  4 +-
 plans/fase-4-internacionalizacao/README.md | 78 ++++++++++++++++++++++++++++--
 4 files changed, 89 insertions(+), 14 deletions(-)
```

Fim de linha preservado, contado com Python (`bytes.count`): `PRD.md` e o README da fase 4 são CRLF; `plans/README.md`
e `plans/DESPACHO.md` são LF na cópia de trabalho (a instrução do despacho dizia CRLF para os quatro; o
que vale é o que o arquivo tem, e nenhum ficou misto).

Fonte: `eol.txt`

```text
PRD.md CRLF=1032 LF=1032
plans/README.md CRLF=0 LF=166
plans/DESPACHO.md CRLF=0 LF=194
plans/fase-4-internacionalizacao/README.md CRLF=461 LF=461
```

### Passo 7 — PRD

Versão `v0.1.71` → `v0.1.72`, com uma linha no §0.1 de 134 caracteres. O `Status` do documento não mudou.
§0 "Estado da implementação": fase 4 em 🟢 9/9, concluída em 2026-10-02, próximo passo a fase 5; o hash do
commit de trabalho não existe ainda, então a linha diz "plano **073**" sem hash (o orquestrador completa na
promoção). §12: tabela "Progresso Geral" em 9/9 🟢 Concluída e o item M-07 marcado `[x]`. §7.2: a linha do
`@astrojs/sitemap` passa de "fixar na fase 4" a "3.7.4 (fixada na fase 4, plano 071)", e o `package.json`
fixa `3.7.4`. §7.5: já tinha `views/` (v0.1.66, plano 062): **conferido, não precisou mexer**.

Fonte: `prd-fase4.txt` (`grep -n "Fase 4" PRD.md`; a linha 17 é a do §0)

```text
17:| **Estado da implementação** | Fase 0 🟢 10/10, concluída em 2026-09-01 · Fase 1 🟢 10/10, em 2026-09-10 · Fase 2 🟢 5/5, em 2026-09-12 · Fase 3 🟢 12/12, em 2026-09-23 · **Fase 4 🟢 9/9, concluída em 2026-10-02 (plano 073) — próximo: fase 5** · Fase 5 ⬜ 0/17. Detalhe por item no §12; execução em `plans/README.md`; histórico em `docs/historico-de-implementacao.md` |
139:| M-07 | Rotas `/en` sem string de interface em português | N/A | 0 ocorrências | Inspeção manual de todas as rotas EN + teste sobre o `dist/` que reprova valor do dicionário `pt` no HTML de `/en/**` fora de elemento `lang="pt-BR"` (sabatina fase 4, Decisão 12) | Fase 4 |
772:| Fase 4 — Internacionalização | 9/9 | 🟢 Concluída |
824:### Fase 4 — Internacionalização
```

Fonte: `prd-status.txt` (`grep -n "\*\*Status\*\*" PRD.md`)

```text
16:| **Status** | 🟢 Aprovado |
```

Fonte: `prd-views.txt` (`grep -n "views/" PRD.md`, sem a linha 52 do §0.1; é o §7.5)

```text
526:│   ├── views/              # corpo de cada página (`HomeView.astro` etc.), com prop `lang` obrigatória (sabatina fase 4, Decisão 6)
```

Fonte: `prd-sitemap.txt` (`grep -n "astrojs/sitemap" PRD.md`, sem a linha 224 do RF-30)

```text
56:| v0.1.72 | 2026-10-02 | Desenvolvedor | Fecha a fase 4 (plano 073): M-07 verificada, §7.2 fixa `@astrojs/sitemap` 3.7.4, §12 em 9/9 |
389:| Sitemap | `@astrojs/sitemap` | 3.7.4 (fixada na fase 4, plano 071) | Integração oficial; lista só as páginas geradas (rascunho fica fora sem lógica extra) e emite os pares `alternate` de idioma (sabatina fase 
```

Fonte: `pkg-sitemap.txt` (`grep -n '"@astrojs/sitemap"' package.json`)

```text
24:    "@astrojs/sitemap": "3.7.4",
```

### Passo 8 — `plans/DESPACHO.md`

A seção "Regras de código da fase 3" passa a apontar para o README da fase em curso. O título mantém a
referência antiga entre parênteses, porque o plano 049 (fechado) cita a seção por esse nome. No ciclo 2, a
frase "strings de interface só em `src/i18n/pt.ts`" do resumo passou a "`src/i18n/` (`pt.ts` e `en.ts`)", como
no README da fase 4.

Fonte: `despacho-diff.txt` (`git diff plans/DESPACHO.md`)

```text
diff --git a/plans/DESPACHO.md b/plans/DESPACHO.md
index 1b2aeb6..a3e9ea3 100644
--- a/plans/DESPACHO.md
+++ b/plans/DESPACHO.md
@@ -94,15 +94,17 @@ Nenhum agente herda o contexto do orquestrador; todos leem arquivo barato.
     fidelidade faz o mesmo ao comparar. Ao final, `grep -o $'\xEF\xBB\xBF' <plano> | wc -l` tem de
     dar `0`; cole essa saída na Evidência.
 
-### Regras de código da fase 3
+### Regras de código da fase vigente (antes, "da fase 3")
 
-Estão em `plans/fase-3-site-publico/README.md`, seção "Regras de código que todo plano desta fase
-herda". Leia-a também. Em resumo: cabeçalho §10.1 do PRD em todo arquivo novo; TSDoc com o
+Estão no README da fase em curso, seção "Regras de código que todo plano desta fase herda": hoje,
+`plans/fase-4-internacionalizacao/README.md`. As da fase 3, de que o resumo abaixo partiu, ficam em
+`plans/fase-3-site-publico/README.md`. Leia a da fase vigente. Em resumo: cabeçalho §10.1 do PRD em todo arquivo novo; TSDoc com o
 comportamento de prop ausente; comentário com o identificador do PRD em toda regra de negócio —
 **citando a cláusula que de fato descreve a regra** (a exigência está no **§10.3**,
 "Comentários no Código", não no §10.4 — defeito já reincidente aqui, quatro vezes); identificadores em
 inglês; sem `any`, `process.env` sob `src/`, `set:html` ou requisição a terceiro; strings de
-interface só em `src/i18n/pt.ts`; links internos com barra final; **componentes** < 150 linhas
+interface só em `src/i18n/` (`pt.ts` e `en.ts`; regra vigente no README da fase 4, seção "Regras de
+código que todo plano desta fase herda"); links internos com barra final; **componentes** < 150 linhas
 (é o que o §10.4 legisla, e como "Alvo", não invariante — arquivo de teste não entra:
 `tests/lib/courses.test.ts` tem 256 linhas e `tests/content/schemas.test.ts` 503, os dois aprovados).
 **Desde 2026-10-02 (PRD v0.1.71), passar de 150 é aceito sem extração:** não pare para perguntar;
```

### Passo 9 — portão local

`lint`, `format:check`, `test:coverage`, `build:pipeline` e `test:dist`, nesta ordem, cada um capturado em
arquivo com `EXIT=` dentro da captura, depois das edições dos quatro documentos. Os documentos estão no
`.prettierignore`, então `format:check` não os vê; ele roda por completude.

#### `npm run lint`

Fonte: `lint.txt`

```text

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

#### `npm run format:check`

Fonte: `format.txt`

```text

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

#### `npm run test:coverage`

Fonte: `coverage.txt`

```text

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  365 passed (365)
   Start at  16:33:11
   Duration  2.27s (transform 6.90s, setup 0ms, import 12.27s, tests 416ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 299/299 )
Branches     : 100% ( 152/152 )
Functions    : 100% ( 80/80 )
Lines        : 100% ( 267/267 )
================================================================================
EXIT=0
```

#### `npm run build:pipeline`

Fonte: `build.txt` (a listagem `Get-ChildItem` no fim do bloco traz três arquivos: eu pedi também `dist\en\404\index.html`, que não existe, porque o gancho do 068 grava `dist/en/404.html`; a mensagem de erro do `Get-ChildItem` saiu em stderr, fora da captura)

```text

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  16:33:21
   Duration  1.27s (transform 1.96s, setup 0ms, import 3.27s, tests 85ms, environment 1ms)

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
16:34:00 [content] Syncing content
16:34:00 [content] Synced content
16:34:00 [types] Generated 578ms
16:34:00 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

16:34:09 [content] Syncing content
16:34:09 [content] Synced content
16:34:09 [types] Generated 520ms
16:34:09 [build] output: "static"
16:34:09 [build] mode: "static"
16:34:09 [build] directory: S:\Projetos\academic_page\haroldo\dist\
16:34:09 [build] Collecting build info...
16:34:09 [build] ✓ Completed in 563ms.
16:34:09 [build] Building static entrypoints...
16:34:10 [vite] ✓ built in 426ms
16:34:10 [vite] ✓ built in 103ms
16:34:10 [build] Rearranging server assets...

 generating static routes 
16:34:10   ├─ /404.html (+13ms) 
16:34:10   ├─ /en/404/index.html (+5ms) 
16:34:10   ├─ /en/about/index.html (+8ms) 
16:34:10   ├─ /en/publications/index.html (+7ms) 
16:34:10   ├─ /en/research/index.html (+6ms) 
16:34:10   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
16:34:10   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+92ms) 
16:34:10   ├─ /en/teaching/index.html (+10ms) 
16:34:10   ├─ /en/index.html (+11ms) 
16:34:10   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
16:34:10   ├─ /ensino/2026-2-relatividade-geral/index.html (+30ms) 
16:34:10   ├─ /ensino/index.html (+5ms) 
16:34:10   ├─ /pesquisa/index.html (+3ms) 
16:34:10   ├─ /publicacoes/index.html (+5ms) 
16:34:10   ├─ /sobre/index.html (+3ms) 
16:34:10   ├─ /index.html (+3ms) 
16:34:10 ✓ Completed in 251ms.

16:34:10 [build] ✓ Completed in 848ms.
16:34:10 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
16:34:10 [build] 16 page(s) built in 1.48s
16:34:10 [build] Complete!
EXIT=0

FullName                                                 Length LastWriteTime      
--------                                                 ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html          6883 02/10/2026 16:34:10
S:\Projetos\academic_page\haroldo\dist\en\index.html       7393 02/10/2026 16:34:10
S:\Projetos\academic_page\haroldo\dist\sitemap-index.xml    204 02/10/2026 16:34:10
```

#### `npm run test:dist`

Fonte: `test-dist.txt`

```text

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  54 passed (54)
   Start at  16:34:12
   Duration  583ms (transform 187ms, setup 0ms, import 313ms, tests 398ms, environment 0ms)

EXIT=0
```

### Ciclo 2 da revisão

Blocos dos passos 2, 4 e 5 reinseridos a partir dos `.txt` atualizados do orquestrador. Blocos recapturados
por terem os arquivos mudado: `diffstat.txt`, `despacho-diff.txt`, `eol.txt` e `format.txt`
(`format:check`, exit 0, sobre a árvore com as edições do ciclo). No README da fase 4: a citação do item do
manual (PRD §6.1, item 8; pedido específico no plano 073, linhas 65-66) e o "Fecha quando" de "Demais
dívidas da fase 3". `lint`, `test:coverage`, `build:pipeline` e `test:dist` não foram refeitos: o ciclo só
mudou documentos, e o `dist/` e o código são os mesmos.

### Passo 9 — CI e Workers Builds no commit de fechamento (orquestrador)

Commit de trabalho `ead6056` empurrado para `main`; check-runs lidos pela API do GitHub com o SHA completo:

```
$ gh api repos/researchgroups-ufma/haroldo-page/commits/ead60567431d61da24581a70093a34154279237c/check-runs --jq '.check_runs[] | ...'
Workers Builds: haroldo-page | id 111005500642 | completed | success | 2026-10-02T19:57:18Z
qualidade | id 111004956913 | completed | success | 2026-10-02T19:57:14Z

Version ID (Workers Builds, output.summary):
Version ID: e4bce998-5f1c-407e-9e25-acac84168af3
```

Verificação autoritativa do `triage-runner` no ciclo 2 (depois da última edição; arquivos em
`scratchpad/triage073b/`), linhas `EXIT=` dos seis `.txt`:

```
audit.txt:EXIT=0
build.txt:EXIT=0
coverage.txt:EXIT=0
format.txt:EXIT=0
lint.txt:EXIT=0
test-dist.txt:EXIT=0
```

O `dist/` desse build é idêntico, por SHA-256 (16/16 HTML) e por `diff -rq` (129 arquivos, conferido pela revisão), ao
medido no navegador nos passos 2–5. Revisão: REPROVADO no ciclo 1 (seis pontos, quatro deles na evidência do
orquestrador), APROVADO no ciclo 2.

### O que NÃO rodei

- Os passos 1–5 inteiros (são do orquestrador; os blocos acima são dele, sem edição minha além de BOM, CRLF e ANSI).
- **CI do GitHub Actions e Workers Builds** no commit de fechamento: não rodei e não podia, porque não havia
  commit nem push. Rodados pelo orquestrador depois do push — ver "Passo 9 — CI e Workers Builds" acima.
- `npm audit --audit-level=high`: não está na lista do passo 9 e não rodei.
- `node scripts/verificar-promocao.mjs`: não rodei, é do orquestrador na promoção; ele reprova pelo critério
  em branco do portão, o que é esperado.
- Foco por teclado nas rotas EN: não verificado (a tecla Tab da extensão não move o foco nesta máquina);
  está registrado como dívida no README da fase.
