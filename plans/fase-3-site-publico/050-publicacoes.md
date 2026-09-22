# Plano 050 — Publicações (RF-25, RN-02, F-05)

**Status:** DONE
**RFs cobertos:** **RF-25**, RN-02 (ano decrescente; dentro do ano, regra provisória), **F-05**, RN-01,
RF-05, RF-26
**Depende de:** planos 038 (`toParagraphs`), 039 (`filterPublished`), 040 (`groupByYear`,
`isProfessorAuthor`, `doiUrl`, `arxivUrl`), 042, 043
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`/publicacoes/` lista as publicações publicadas em blocos por ano, do mais recente ao mais antigo,
cada uma com tipo, título, autores (com o nome do professor destacado), veículo, apenas os links
preenchidos e, recolhidos, resumo e palavras-chave.

## Arquivos afetados

- `src/pages/publicacoes.astro` — novo
- `src/components/PublicationItem.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Não rode build ao mesmo tempo que outro executor (README da fase).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.6 (Publicações) e §8 (título "Publicações", não
"Artigos e preprints"; sem filtros — Decisão 3 da sabatina). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`. Link externo **só** por `ExternalLink.astro`.

**RN-02 — leia a decisão 4 do README da fase.** A ordem dentro do ano é a de `compareWithinYear`
(plano 040): título alfabético, provisória, vale até existir um campo de data de cadastro (Q-RN02,
opção (c), README da fase). Esta página **não** reordena nada por conta própria — usa
`groupByYear` e nada mais. Não ordene por `destaque`.

**Composição (§6.6):**
- `const published = filterPublished(await getCollection('publicacoes'))` (`// RN-01`);
  `const groups = groupByYear(published)`.
- `BaseLayout title={pt.publications.title}`; `PageHeader eyebrow={pt.publications.eyebrow(published.length)}
  title={pt.publications.title}`.
- Um `<section aria-labelledby>` por grupo: o ano em `text-ano` na coluna esquerda (`<h2>`, a partir de
  `lg`; no topo, abaixo) e os itens à direita, separados por régua fina, régua forte abrindo o bloco.
- **Sem publicações publicadas:** a página mostra só o cabeçalho com "0 itens". (Não há texto de estado
  vazio no dicionário; não invente.)

**`PublicationItem.astro`** — props: `publication` (entrada da coleção).
- Tags: `Tag variant="solid"` com `pt.publications.featured` se `destaque`; `Tag variant="neutral"`
  com `pt.publications.type[tipo]`.
- Título: `<h3>`; com `destaque`, `text-display-2` num bloco `bg-bloco` com padding; sem, `text-titulo-item`.
- Autores: na ordem do arquivo, separados por `; `; cada nome num `<span>`: `text-tinta` quando
  `isProfessorAuthor(autor, siteConfig.author.citationName)`, senão `text-secundario`. **Não** use só
  cor para marcar (cor sozinha não é informação acessível): o nome do professor também leva
  `<strong class="font-normal">` — semântica de ênfase sem mudar o peso visual.
- `veiculo` em itálico, se houver.
- Links (**F-05**, só os preenchidos; nenhum botão vazio): `ExternalLink href={doiUrl(doi)}` com
  `pt.publications.doi`; `ExternalLink href={arxivUrl(arxiv)}` com `pt.publications.arxiv`;
  `ExternalLink href={pdf_url}` com `pt.publications.pdf`. Se nenhum dos três existe, **nenhum**
  contêiner de links é renderizado.
- `<details>` com `<summary>` `pt.publications.abstractAndKeywords`, **fechado por padrão**, só se houver
  `resumo` **ou** `palavras_chave` não vazio: `resumo` via `toParagraphs`; palavras-chave com rubrica
  `pt.publications.keywords`, separadas por ` · `. A abertura aparece em 150 ms (§7), zerada por
  `reduce`.

**Dados atuais** (comparação, não teste): 6 arquivos, 1 com `publicado: false`
(`2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`) → rubrica "5 itens"; anos
2025 (2 itens), 2024 (2), 2023 (1); o de 2025 "Sombras de buracos negros de Kerr em gravitação de
Gauss-Bonnet" tem `destaque: true`, DOI `10.0000/exemplo.2025.001` e `pdf_url`. O primeiro autor é
`LIMA JUNIOR, HAROLDO C. D.`, igual a `siteConfig.author.citationName`.

## Passos

1. Os dois arquivos → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/publicacoes/index.html`.
3. HTML → verify: cole `grep -o '<h2[^>]*>[0-9]\{4\}' dist/publicacoes/index.html` (2025, 2024, 2023 nessa ordem), `grep -o '[0-9] itens' dist/publicacoes/index.html`, `grep -c 'Notas sobre geodésicas nulas' dist/publicacoes/index.html` (0 — RN-01), `grep -o 'https://doi.org/[^"]*' dist/publicacoes/index.html` e `grep -c '<details' dist/publicacoes/index.html`.
4. Conte, **por item**, os links renderizados e confronte com os campos de cada arquivo de `content/publicacoes/` (tabela colada: arquivo × doi/arxiv/pdf presentes × links no HTML) — F-05 provado contra a fonte, não suposto.
5. Canário RN-01, sem tocar em `content/`: remova temporariamente `filterPublished`, build, cole a rubrica "6 itens" e a presença do título do rascunho; desfaça → verify: saídas coladas e versão final conferida.
6. Orquestrador — navegador em `/publicacoes/`, 360/768/1440: `[scrollWidth, clientWidth]`; ano no topo em 360; `<details>` abre por teclado (Tab + Enter) e está fechado ao carregar; links abrem em nova aba; título longo sem corte em 360.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] Blocos por ano em ordem decrescente (RF-25); itens na ordem de `groupByYear`, sem reordenação na página
- [x] Rascunho ausente e rubrica "5 itens" com o conteúdo atual (canário do passo 5)
- [x] Links DOI/arXiv/PDF só quando preenchidos, conferidos item a item contra `content/` (F-05)
- [x] Nome do professor destacado por cor **e** `<strong>`; tipo legível; "Destaque" só com `destaque`
- [x] `<details>` fechado por padrão, só quando há resumo ou palavras-chave
- [x] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência


Capturado em 2026-09-22 (ciclo 2 de correção da revisão — ciclo 1 abaixo, ciclo 2 logo a seguir).
Arquivos criados: `src/pages/publicacoes.astro` (95 linhas) e `src/components/PublicationItem.astro`
(149 linhas) — os dois abaixo do alvo de 150 linhas do §10.4 (ver bloco `wc_final4.txt` no passo
"componentes < 150 linhas", abaixo). Todo bloco é saída literal, capturada em `.txt` no scratchpad
(`Tee-Object`/`tee`) e transcrita sem edição de conteúdo; a fonte de cada bloco está no comentário
HTML imediatamente acima dele, e o script `verificar_fidelidade.py` (fim desta seção) confere cada
bloco contra o `.txt` de origem.

### Correções deste ciclo (revisão REPROVADO)

1. `src/pages/publicacoes.astro`: comentário do `<style>` corrigido — a "régua forte abrindo o
   bloco" é do **§5.5** (`docs/identidade-visual.md:168`, "a primeira linha de cada lista abre com
   régua forte"), não do §6.6; o §6.6 ficou só para "um bloco por ano, itens separados por régua".
2. Coluna do ano: `lg:grid-cols-[8rem_1fr]` → `lg:grid-cols-[auto_1fr]` — a coluna acompanha a
   largura do texto do ano (`text-ano`, ~76 px de fonte) em vez de uma largura fixa que ele invadia
   a 1024–1440 px.
3. Adicionado bloco de prova da cor do professor (`text-tinta`) e dos coautores
   (`text-secundario`), escopado ao `<main>`.
4. Adicionado bloco `wc.txt` com a saída literal de `wc -l` para o critério "componentes < 150
   linhas".
5. Reversão do canário de conteúdo: `git status --short` (completo, 3 linhas) e `git diff --
   content/` (vazio) agora são blocos literais com `<!-- fonte: ... -->`, sem seta nem anotação
   dentro do bloco.
6. `publicacoes.astro`: comentário do cabeçalho não cita mais §6.6 para o estado "0 itens" —
   agora cita "plano 050" (o §6.6 não legisla estado vazio).
7. `.item-publicacao` (antes sem regra CSS) agora carrega o `border-top: 1px solid
   var(--color-regua)`; `.item-publicacao-primeira` continua só a modificadora com a régua forte —
   mesmo padrão de `.disciplina-anterior`/`.disciplina-anterior-primeira` em `ensino.astro`.
8. Passo 3: o grep do rascunho ausente agora usa o padrão acentuado completo
   `'Notas sobre geodésicas nulas'` (igual ao passo 3 do corpo do plano), com o comando explícito
   no rótulo do bloco — não mais uma substring ASCII sem o padrão declarado.
9. Corpo do plano (RN-02, linha ~37): "provisória, pendente de ratificação" → "provisória, vale até
   existir um campo de data de cadastro (Q-RN02, opção (c), README da fase)" — pedido do
   orquestrador, texto dele.

### Ciclo 2 (medição no navegador do orquestrador, build de 15:29:35)

10. `lg:grid-cols-[auto_1fr]` (corrigido no ciclo 1) fazia cada `<section>` de ano ter a própria
    grade — a coluna do ano variava de bloco a bloco (o orquestrador mediu x=247,20/244,76/247,43
    a 1440 px e x=209,44/207,36/209,64 a 1024 px) e as réguas entre os anos não alinhavam. Trocado
    por `lg:grid-cols-[11rem_1fr]`, largura fixa e igual em todo bloco, com o comentário explicando
    o porquê de 11rem (176px: cobre um ano de 4 dígitos em `text-ano`, teto 4,75rem ≈ 76px de
    fonte, medido ~159px de largura, com folga) direto acima do `<section>` em
    `src/pages/publicacoes.astro`. Não é regra da identidade — ela não fixa essa largura, por isso
    nenhum identificador do PRD é citado no comentário.

Prova de que `11rem` chegou ao `dist/` (CSS gerado e classe no HTML, uma por bloco de ano):

<!-- fonte: grid_11rem.txt -->

```
--- CSS gerado: grep -o 'grid-template-columns:11rem' dist/_astro/*.css | wc -l (esperado >=1) ---
1
--- HTML: grep -o 'lg\:grid-cols-\[11rem_1fr\]' dist/publicacoes/index.html ---
lg:grid-cols-[11rem_1fr]
lg:grid-cols-[11rem_1fr]
lg:grid-cols-[11rem_1fr]
```

3 ocorrências no HTML — uma por `<section>` de ano (2025/2024/2023) — todas com a mesma largura
fixa, o que resolve o desalinhamento medido pelo orquestrador.

Depois das correções (as duas rodadas), todo o pipeline foi refeito do zero (`astro check`,
`build:pipeline`, os dois canários e o portão) e todo bloco abaixo descreve o estado **final** do
código e do `dist/`, depois do ciclo 2.

### Passo 1 — `npx astro check`

<!-- fonte: astro_check_r2.txt -->

```
15:31:46 [content] Syncing content
15:31:46 [content] Synced content
15:31:46 [types] Generated 710ms
15:31:46 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (57 files):
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 2 — `npm run build:pipeline` (estado final, depois dos dois canários revertidos)

<!-- fonte: build_r2_finalfinal.txt -->

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  15:34:37
   Duration  1.46s (transform 2.23s, setup 0ms, import 3.75s, tests 99ms, environment 1ms)

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
15:35:18 [content] Syncing content
15:35:19 [content] Synced content
15:35:19 [types] Generated 711ms
15:35:19 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (57 files):
- 0 errors
- 0 warnings
- 0 hints

15:35:29 [content] Syncing content
15:35:29 [content] Synced content
15:35:29 [types] Generated 620ms
15:35:29 [build] output: "static"
15:35:29 [build] mode: "static"
15:35:29 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:35:29 [build] Collecting build info...
15:35:29 [build] ✓ Completed in 667ms.
15:35:29 [build] Building static entrypoints...
15:35:30 [vite] ✓ built in 435ms
15:35:30 [vite] ✓ built in 66ms
15:35:30 [build] Rearranging server assets...

 generating static routes
15:35:30   ├─ /ensino/2025-1-mecanica-classica/index.html (+21ms)
15:35:30   ├─ /ensino/2026-2-relatividade-geral/index.html (+149ms)
15:35:30   ├─ /ensino/index.html (+7ms)
15:35:30   ├─ /pesquisa/index.html (+8ms)
15:35:30   ├─ /publicacoes/index.html (+7ms)
15:35:30   ├─ /sobre/index.html (+5ms)
15:35:30   ├─ /index.html (+5ms)
15:35:30 ✓ Completed in 244ms.

15:35:30 [build] ✓ Completed in 803ms.
15:35:30 [build] 7 page(s) built in 1.53s
15:35:30 [build] Complete!
```

<!-- fonte: ls_dist_final4.txt -->

```
dist/publicacoes/index.html
```

### Passo 3 — HTML (`grep -o ... | wc -l`, não `grep -c` — regra 15 do DESPACHO), sobre o `dist/` do passo 2

<!-- fonte: step3_final4.txt -->

```
--- h2 anos: grep -o '<h2[^>]*>[0-9]\{4\}' ---
<h2 id="ano-2025" class="text-ano" data-astro-cid-g5lvi4ac>2025
<h2 id="ano-2024" class="text-ano" data-astro-cid-g5lvi4ac>2024
<h2 id="ano-2023" class="text-ano" data-astro-cid-g5lvi4ac>2023
--- itens: grep -o '[0-9] itens' ---
5 itens
--- rascunho ausente: grep -o 'Notas sobre geodésicas nulas' | wc -l (esperado 0) ---
0
--- doi urls: grep -o 'https://doi.org/[^"]*' ---
https://doi.org/10.0000/exemplo.2025.001
https://doi.org/10.0000/exemplo.2024.001
https://doi.org/10.0000/exemplo.2023.001
--- details count: grep -o '<details' | wc -l ---
5
```

Ordem dos anos (2025, 2024, 2023), rubrica "5 itens" e o rascunho ausente (0 ocorrências do
padrão completo e acentuado `'Notas sobre geodésicas nulas'`, testado em shell com
`LC_CTYPE="C.UTF-8"` — conferido não vacuamente verdadeiro) conferem com RF-25 e RN-01. 3 URLs de
DOI batem com as 3 publicações que têm `doi` preenchido (tabela do passo 4).

### Passo 4 — Links por item, conferidos contra `content/publicacoes/` (F-05)

Script `per_item_links.py` recorta o HTML por `<h3` (cada item começa em um) e conta, dentro do
recorte, `https://doi.org/`, `https://arxiv.org/abs/` e o domínio do `pdf_url` de exemplo
(`exemplo.invalid/publicacoes/`):

<!-- fonte: per_item_links_final4.txt -->

```
titulo                                                                 doi arxiv pdf strong details
[EXEMPLO] Forças de maré próximas ao horizonte de buracos negros em ro   0     0   0      1       1
[EXEMPLO] Sombras de buracos negros de Kerr em gravitação de Gauss-Bon   1     0   1      1       1
[EXEMPLO] Desvios da hipótese de Kerr em imagens de horizonte de event   0     0   0      1       1
[EXEMPLO] Modos quasinormais de campos escalares em espaços-tempos de    1     0   1      1       1
[EXEMPLO] Perturbações lineares de buracos negros com cabelo escalar     1     0   0      1       1

TOTAL itens: 5
TOTAL strong (main): 5
TOTAL details (main): 5
```

Tabela cruzando com os campos de cada arquivo (lidos diretamente de `content/publicacoes/`):

| Arquivo | doi | arxiv | pdf_url | Links no HTML (DOI/arXiv/PDF) |
|---|---|---|---|---|
| `2025-exemplo-forcas-de-mare-proximas-ao-horizonte-de-buracos-negros-em-rotacao.md` | não | não | não | nenhum — confere (contêiner de links não é renderizado) |
| `2025-exemplo-sombras-de-buracos-negros-de-kerr-em-gravitacao-de-gauss-bonnet.md` | sim | não | sim | DOI, PDF — confere |
| `2024-exemplo-desvios-da-hipotese-de-kerr-em-imagens-de-horizonte-de-eventos.md` | não | não | não | nenhum — confere |
| `2024-exemplo-modos-quasinormais-de-campos-escalares-em-espacos-tempos-de-kerr.md` | sim | não | sim | DOI, PDF — confere |
| `2023-exemplo-perturbacoes-lineares-de-buracos-negros-com-cabelo-escalar.md` | sim | não | não | DOI — confere |

Nenhum dos 5 itens tem `arxiv` no conteúdo atual — por isso a coluna `arxiv` do script é 0 em
todas as linhas (esse ramo só é exercitado pelo canário de conteúdo abaixo, autorizado no
despacho).

Contagem geral, escopada ao `<main>`:

<!-- fonte: main_scoped_final4.txt -->

```
strong in main: 5
details in main: 5
Destaque tag count in main: 1
```

`>Destaque<` = 1, igual ao único arquivo com `destaque: true` (Sombras de Kerr).

**Prova da cor do professor e dos coautores (item obrigatório 3 da revisão)** — escopada ao
`<main>`, sobre o mesmo `dist/` do passo 2:

<!-- fonte: cor_professor_final4.txt -->

```
--- professor (cor + strong): grep -o '<span class="text-tinta"[^>]*><strong' $MAIN | wc -l (esperado 5) ---
5
--- coautores (cor secundaria): grep -o '<span class="text-secundario"' $MAIN | wc -l (esperado 3) ---
3
```

5 `<span class="text-tinta">` seguidos imediatamente de `<strong>` — um por publicação, porque o
professor (`LIMA JUNIOR, HAROLDO C. D.`) é autor nas 5. 3 `<span class="text-secundario">` — os 3
coautores do conteúdo atual: `AUTOR DE EXEMPLO, A. B.` (Sombras de Kerr), `AUTOR DE EXEMPLO, C. D.`
(Modos quasinormais) e `AUTOR DE EXEMPLO, E. F.` (Perturbações lineares), conferido em
`content/publicacoes/`. O padrão `class="text-tinta"`/`class="text-secundario"` (classe única, sem
outras) só casa com o `<span>` do autor — o `Tag.astro` neutro e o `<p>` do veículo combinam
`text-secundario` com outras classes na mesma string, então não entram na contagem.

Tipo legível e `<details>` fechado por padrão:

<!-- fonte: tipo_details_final4.txt -->

```
--- tipo labels (main) ---
>Artigo<
>Artigo<
>Preprint<
>Artigo<
>Artigo<
--- <details open (esperado 0 -- fechado por padrao) ---
0
--- <details data-astro-cid-...> (esperado 5) ---
5
```

4 "Artigo" e 1 "Preprint" batem com o `tipo` de cada um dos 5 itens publicados. Nenhum dos 5
`<details>` tem o atributo `open` — fechados por padrão.

**Componentes < 150 linhas** (medido depois da última edição de código):

<!-- fonte: wc_final4.txt -->

```
   95 src/pages/publicacoes.astro
  149 src/components/PublicationItem.astro
  244 total
```

`publicacoes.astro` subiu de 90 para 95 linhas com o comentário do ciclo 2 (explica o `11rem`).
`PublicationItem.astro` segue em 149 — nenhuma correção do ciclo 2 tocou o arquivo, então não houve
risco de estourar o alvo de 150.

### Passo 5 — Canário RN-01 (edita `src/pages/publicacoes.astro`, arquivo novo — revertido por edição, nunca `git checkout --`, regra 13 do DESPACHO)

`filterPublished` removido temporariamente:

```diff
-// RN-01: rascunhos (`publicado: false`) nunca aparecem na página pública.
-const published = filterPublished(await getCollection('publicacoes'));
+// CANÁRIO RN-01 (temporário, passo 5 do plano 050): filterPublished removido de propósito.
+const published = await getCollection('publicacoes');
```

Build (`npx astro build`) com a regra quebrada:

<!-- fonte: canario_rn01_build_r2.txt -->

```
15:33:44 [content] Syncing content
15:33:44 [content] Synced content
15:33:44 [types] Generated 632ms
15:33:44 [build] output: "static"
15:33:44 [build] mode: "static"
15:33:44 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:33:44 [build] Collecting build info...
15:33:44 [build] ✓ Completed in 682ms.
15:33:44 [build] Building static entrypoints...
15:33:45 [vite] ✓ built in 499ms
15:33:45 [vite] ✓ built in 73ms
15:33:45 [build] Rearranging server assets...

 generating static routes
15:33:45   ├─ /ensino/2025-1-mecanica-classica/index.html (+21ms)
15:33:45   ├─ /ensino/2026-2-relatividade-geral/index.html (+139ms)
15:33:45   ├─ /ensino/index.html (+7ms)
15:33:45   ├─ /pesquisa/index.html (+8ms)
15:33:45   ├─ /publicacoes/index.html (+8ms)
15:33:45   ├─ /sobre/index.html (+6ms)
15:33:45   ├─ /index.html (+5ms)
15:33:45 ✓ Completed in 233ms.

15:33:45 [build] ✓ Completed in 872ms.
15:33:45 [build] 7 page(s) built in 1.61s
15:33:45 [build] Complete!
```

<!-- fonte: canario_rn01_html_r2.txt -->

```
--- itens (canario RN-01, esperado 6): grep -o '[0-9] itens' ---
6 itens
--- titulo do rascunho: grep -o 'Notas sobre geodésicas nulas' | wc -l (esperado 1) ---
1
```

A rubrica sobe para "6 itens" e o rascunho aparece — a regra muda o resultado, provando RN-01 por
falsificação. Revertido em seguida (edição de volta ao original, não `git checkout --`, porque o
arquivo não está commitado); o arquivo final é o dos passos 1–4 acima.

### Canário de conteúdo — arXiv e item sem `<details>` (autorizado pelo orquestrador, passo extra 4b)

O conteúdo atual não exercitava dois ramos do componente: nenhuma publicação publicada sem
`resumo` (ramo "sem `<details>`") e nenhuma com `arxiv` (link arXiv nunca renderiza). Editado
temporariamente `content/publicacoes/2024-exemplo-desvios-da-hipotese-de-kerr-em-imagens-de-horizonte-de-eventos.md`
(commitado — reversão por `git checkout --`, regra pré-autorizada da fase):

```diff
 ano: 2024
 tipo: preprint
-resumo: 'Preprint fictício criado como conteúdo de exemplo para a fase 1 do site. Não corresponde a nenhum trabalho real e não tem DOI nem identificador arXiv. [CONTEÚDO DE EXEMPLO]'
+arxiv: '2401.00001'
```

(Este arquivo não tinha `palavras_chave`, então não havia nada para remover nesse campo.)

Build (`npx astro build`) com o canário:

<!-- fonte: canario_conteudo_build_r2.txt -->

```
15:34:11 [content] Syncing content
15:34:11 [content] Synced content
15:34:11 [types] Generated 748ms
15:34:11 [build] output: "static"
15:34:11 [build] mode: "static"
15:34:11 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:34:11 [build] Collecting build info...
15:34:11 [build] ✓ Completed in 800ms.
15:34:11 [build] Building static entrypoints...
15:34:12 [vite] ✓ built in 491ms
15:34:12 [vite] ✓ built in 70ms
15:34:12 [build] Rearranging server assets...

 generating static routes
15:34:12   ├─ /ensino/2025-1-mecanica-classica/index.html (+17ms)
15:34:12   ├─ /ensino/2026-2-relatividade-geral/index.html (+72ms)
15:34:12   ├─ /ensino/index.html (+7ms)
15:34:12   ├─ /pesquisa/index.html (+8ms)
15:34:12   ├─ /publicacoes/index.html (+9ms)
15:34:12   ├─ /sobre/index.html (+6ms)
15:34:12   ├─ /index.html (+5ms)
15:34:12 ✓ Completed in 171ms.

15:34:12 [build] ✓ Completed in 783ms.
15:34:12 [build] 7 page(s) built in 1.61s
15:34:12 [build] Complete!
```

Contagem escopada ao item desse título, e o total da página:

<!-- fonte: canario_conteudo_html_r2.txt -->

```
titulo: [EXEMPLO] Desvios da hipótese de Kerr em imagens de horizonte de eventos
details count (item, esperado 0): 0
arxiv href: ['https://arxiv.org/abs/2401.00001']
total itens na pagina (esperado 5): 5 itens
total <details na pagina inteira (esperado 4): 4
```

`<details` do item cai para 0, o `href` do arXiv aparece (`https://arxiv.org/abs/2401.00001`), a
contagem de itens continua em "5 itens" (RN-01 não afetada) e o total de `<details` da página cai
de 5 para 4 — exatamente o item editado.

Revertido com `git checkout -- content/publicacoes/` (arquivo commitado — seguro aqui). Saída
literal dos dois comandos de verificação, capturados em arquivo antes de qualquer edição/anotação:

<!-- fonte: git_status_r2.txt -->

```
 M plans/fase-3-site-publico/050-publicacoes.md
?? src/components/PublicationItem.astro
?? src/pages/publicacoes.astro
```

`git diff -- content/` gerou um arquivo de **0 bytes** (`git_diff_content_r2.txt`, confirmado com
`wc -c`) — sem nada para colar, porque não há diferença nenhuma. Nenhuma linha do `git status`
acima é de `content/`.

Depois de reverter, o build foi refeito (`npm run build:pipeline`, passo 2 acima) e todo bloco que
descreve o `dist/` nesta Evidência (passos 2, 3 e 4) foi recapturado sobre esse `dist/` final —
nenhum bloco descreve o `dist/` de um dos dois canários.

### Passo 6 — navegador (orquestrador)

Rodado pelo orquestrador em **2026-09-22**, no Vivaldi com a extensão Claude in Chrome, sobre o
`astro preview` do build autoritativo do ciclo 3 (`dist/publicacoes/index.html` de 15:43:07, 15489
bytes). Medição por `<iframe>` de 360, 768, 1024 e 1440 px, com `box-sizing:content-box`
(`innerWidth` conferido igual à largura pedida). O preview foi encerrado depois
(`npx astro preview stop`), e as portas 4321 e 9000 foram conferidas livres.

**Medição final, 15:44:14 (horário local), saída literal do `javascript_tool`:**

```
{"360":{"innerWidth":360,"scroll":[345,345],"anos":["2025 topo(+10.4)","2024 topo(+10.4)","2023 topo(+10.4)"],"h3Cortados":0,"detailsAbertos":"0/5","linksNovaAba":true},"768":{"innerWidth":768,"scroll":[753,753],"anos":["2025 topo(+9.6)","2024 topo(+9.6)","2023 topo(+9.6)"],"h3Cortados":0,"detailsAbertos":"0/5","linksNovaAba":true},"1024":{"innerWidth":1024,"scroll":[1009,1009],"anos":["2025 esq(folga 71.5, itens x=248.95)","2024 esq(folga 73.6, itens x=248.95)","2023 esq(folga 71.3, itens x=248.95)"],"h3Cortados":0,"detailsAbertos":"0/5","linksNovaAba":true},"1440":{"innerWidth":1440,"scroll":[1425,1425],"anos":["2025 esq(folga 48.8, itens x=264.00)","2024 esq(folga 51.2, itens x=264.00)","2023 esq(folga 48.6, itens x=264.00)"],"h3Cortados":0,"detailsAbertos":"0/5","linksNovaAba":true},"agora":"22/09/2026, 15:44:14"}
```

Como ler:
- **`scroll` é `[scrollWidth, clientWidth]` do documento, igual nas quatro larguras.** O
  `clientWidth` fica 15 px abaixo da largura do iframe porque aparece a barra de rolagem vertical
  (iframe de 900 px de altura).
- **Ano:** fica no topo em 360 e 768 (`topo(+N)` é a folga vertical até os itens). A partir de
  `lg` fica à esquerda, com folga horizontal de pelo menos 48,6 px.
- **Alinhamento:** a coluna dos itens começa no **mesmo x em todos os blocos** (248,95 a 1024 px;
  264,00 a 1440 px).
- **Títulos:** `h3Cortados: 0`, nenhum título com `scrollWidth > clientWidth`, inclusive o título
  longo em destaque a 360 px.
- **`<details>`:** os cinco carregam fechados (`0/5`).
- **Links externos:** todos com `target="_blank"` e `rel` contendo `noopener`, ou seja, abrem em
  nova aba.

**Teclado.** A tecla Tab não move o foco nesta extensão (limitação já registrada, dívida do 053).
Por isso o foco foi posto no primeiro `<summary>` por `summary.focus()`, e o **Enter foi uma tecla
real** enviada pela extensão. Antes, foram instalados ouvintes de `keydown` e `toggle`. Saída
literal, 15:44:45:

```
{"log":["keydown Enter em SUMMARY","toggle open=true"],"open":true,"focusVisible":false,"anim":"detalhes-abre 0.15s","agora":"22/09/2026, 15:44:45"}
```

- **Abertura:** `keydown Enter em SUMMARY` seguido de `toggle open=true`. O `<details>` abre pelo
  teclado, e a animação `detalhes-abre` de 150 ms está aplicada (preview sem `reduce`).
- **Foco visível:** uma captura de tela feita entre 15:44:32 e 15:44:45, logo antes do Enter, mostra o contorno de foco
  no `<summary>`. Às 15:44:25, com o foco já no elemento, o computado era `outline-style: solid` e
  `:focus-visible` verdadeiro. O `focusVisible:false` da saída acima vem depois da captura de tela,
  que tira o foco de teclado da janela. É efeito da ferramenta, não da página.
- **Tentativas perdidas:** duas tentativas de Enter antes dessa (15:44:25 e 15:44:32) não chegaram
  à página: o registro de `keydown` ficou vazio, porque a tecla foi entregue fora do documento.
  Isso também aconteceu no ciclo 1, e o mesmo procedimento abriu o `<details>` na segunda tentativa.
  Registro para o 053, que precisa de harness próprio de teclado.

**O que mudou por causa desta verificação.** No build do ciclo 1, a 1440 px, a coluna
`lg:grid-cols-[8rem_1fr]` (128 px) era estreita para o ano em `text-ano` (o texto ia de x=56 a x=215, 159 px de largura).
O ano invadia o `gap-x-8` e ficava a **0,6–3,2 px** do início dos itens, encostado na régua; a
1024 px também estourava. A primeira correção, `auto`, resolveu a folga mas desalinhou os blocos,
porque cada `<section>` é uma grade própria: itens em x=247,20 / 244,76 / 247,43 a 1440 px. A
correção final é `11rem`, e a medição acima é dela.

**Não verificado aqui:** emulação de `prefers-reduced-motion: reduce`, que a extensão não expõe
(dívida do 053).

### Passo 7 — Portão de qualidade

<!-- fonte: lint_r2.txt -->

```
> haroldo-page@0.1.0 lint
> eslint .
```

<!-- fonte: format_r2.txt -->

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

<!-- fonte: coverage_r2.txt -->

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  16 passed (16)
      Tests  263 passed (263)
   Start at  15:36:12
   Duration  2.19s (transform 6.15s, setup 0ms, import 10.24s, tests 410ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |
 src/lib           |     100 |    99.09 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 248/248 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 67/67 )
Lines        : 100% ( 224/224 )
================================================================================
```

O `navigation.ts:51` não coberto é pré-existente (nenhum arquivo deste plano); nenhum código deste
plano tem linha, branch ou função descoberta.

### O que NÃO rodou

- **Passo 6 (navegador)** — não rodado pelo executor; rodado pelo orquestrador e registrado na
  seção "Passo 6 — navegador (orquestrador)" acima, sobre o build autoritativo do ciclo 3.
- `npm ci`, `npm audit --audit-level=high`, CI do GitHub Actions e Workers Builds — não fazem
  parte do despacho do executor (verificação autoritativa é do `triage-runner`/orquestrador).

### Verificador de fidelidade

Script (`verificar_fidelidade.py`, scratchpad) que localiza cada par `<!-- fonte: arquivo.txt -->`
+ bloco de código nesta seção e compara com o `.txt` correspondente, normalizando só o BOM inicial
(`Tee-Object` do PowerShell grava UTF-8 com BOM) e o espaço em branco no fim de cada linha
(preenchimento de coluna do terminal — não muda conteúdo). Saída real, depois de todas as edições
dos dois ciclos:

```
grid_11rem.txt                  OK
astro_check_r2.txt              OK
build_r2_finalfinal.txt         OK
ls_dist_final4.txt              OK
step3_final4.txt                OK
per_item_links_final4.txt       OK
main_scoped_final4.txt          OK
cor_professor_final4.txt        OK
tipo_details_final4.txt         OK
wc_final4.txt                   OK
canario_rn01_build_r2.txt       OK
canario_rn01_html_r2.txt        OK
canario_conteudo_build_r2.txt   OK
canario_conteudo_html_r2.txt    OK
git_status_r2.txt               OK
lint_r2.txt                     OK
format_r2.txt                   OK
coverage_r2.txt                 OK
```
