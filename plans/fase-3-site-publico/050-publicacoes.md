# Plano 050 — Publicações (RF-25, RN-02, F-05)

**Status:** TODO
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
(plano 040): título alfabético, **provisória, pendente de ratificação**. Esta página **não**
reordena nada por conta própria — usa `groupByYear` e nada mais. Não ordene por `destaque`.

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

- [ ] Blocos por ano em ordem decrescente (RF-25); itens na ordem de `groupByYear`, sem reordenação na página
- [ ] Rascunho ausente e rubrica "5 itens" com o conteúdo atual (canário do passo 5)
- [ ] Links DOI/arXiv/PDF só quando preenchidos, conferidos item a item contra `content/` (F-05)
- [ ] Nome do professor destacado por cor **e** `<strong>`; tipo legível; "Destaque" só com `destaque`
- [ ] `<details>` fechado por padrão, só quando há resumo ou palavras-chave
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`; componentes < 150 linhas
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–5, 7) e pelo orquestrador (6). Declare o que NÃO rodou.>
