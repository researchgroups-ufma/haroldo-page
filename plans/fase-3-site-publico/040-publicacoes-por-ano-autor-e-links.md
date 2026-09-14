# Plano 040 — Publicações agrupadas por ano (RN-02), autor destacado e links DOI/arXiv

**Status:** TODO
**RFs cobertos:** RF-25, RN-02 (com regra provisória dentro do ano), F-05; §11 (agrupamento e
ordenação de publicações)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`src/lib/publications.ts` agrupa publicações por ano decrescente com uma regra determinística
dentro do ano, identifica o nome do professor na lista de autores e monta os URLs de DOI e arXiv —
tudo testado.

## Arquivos afetados

- `src/lib/publications.ts` — novo: `groupByYear`, `compareWithinYear`, `isProfessorAuthor`,
  `doiUrl`, `arxivUrl`
- `tests/lib/publications.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. **Não** remova `src/lib/.gitkeep` (plano 037).

## Contexto necessário

**Schema** (`publicacoesSchema`, `src/content.config.ts:407-421`): `titulo`, `autores: string[]`
(≥ 1), `ano: number` inteiro 1900–2100, `doi?`, `arxiv?`, `pdf_url?`, `destaque?`, `publicado`.
Exemplo real (`content/publicacoes/2025-exemplo-sombras-de-buracos-negros-de-kerr-em-gravitacao-de-gauss-bonnet.md`):

```yaml
titulo: '[EXEMPLO] Sombras de buracos negros de Kerr em gravitação de Gauss-Bonnet'
autores:
  - 'LIMA JUNIOR, HAROLDO C. D.'
  - 'AUTOR DE EXEMPLO, A. B.'
ano: 2025
doi: 10.0000/exemplo.2025.001
destaque: true
```

**RN-02 e a regra provisória (README da fase, decisão 4 — leia a seção inteira).** A RN-02 manda
"ano decrescente; dentro do mesmo ano, ordem de cadastro invertida". O schema não tem data de
cadastro, o schema não muda nesta fase, e o histórico do Git não serve (checkout raso no CI; build
não determinístico). **Regra implementada:** dentro do ano, `titulo` com
`a.localeCompare(b, 'pt-BR')`, crescente. Ela vive **só** em `compareWithinYear(a, b)`, exportada,
com o comentário:

```ts
// RN-02 (parcial): o schema não tem data de cadastro. Regra provisória que vale até existir um campo de
// data de cadastro (Q-RN02, opção (c), decidida pelo stakeholder em 2026-09-14 — README da fase).
```

`destaque` **não** muda a ordem — é só visual (§6.6 da identidade).

**`groupByYear<T extends { data: { ano: number; titulo: string } }>(entries: T[]): { year: number;
items: T[] }[]`** — anos distintos em ordem decrescente (RF-25); itens ordenados por
`compareWithinYear`. Não muta a entrada. Recebe entradas **já filtradas** por RN-01 (docstring).

**`isProfessorAuthor(author: string, citationName: string): boolean`** — §6.6 da identidade: o nome
do professor em `--tinta`, casado por `siteConfig.author.citationName` (`src/lib/config.ts:47`,
`'LIMA JUNIOR, HAROLDO C. D.'`). Normaliza os dois lados antes de comparar: `trim`, espaços
múltiplos → um, `normalize('NFD')` sem diacríticos, minúsculas. Igualdade exata depois disso —
**sem** casamento parcial (evita destacar "LIMA, J." de outro autor). Esta normalização é
deliberada e documentada na docstring.

**`doiUrl(doi: string): string`** — `https://doi.org/` + DOI. Aceita e remove, antes de montar,
os prefixos `https://doi.org/`, `http://dx.doi.org/`, `https://dx.doi.org/` e `doi:` (sem
diferenciar maiúsculas), e faz `trim`. O campo é string livre (`doi: z.string().optional()`), então
o professor pode colar qualquer uma das formas.

**`arxivUrl(id: string): string`** — `https://arxiv.org/abs/` + id. Remove `arXiv:` (sem
diferenciar maiúsculas), `https://arxiv.org/abs/` e `http://arxiv.org/abs/`, e faz `trim`.

**F-05** (links só quando preenchidos) é decisão da página (plano 050), não daqui — estas funções
só são chamadas com valor presente.

**Testes (fixtures sintéticas):**
- `groupByYear`: entradas de 2024, 2026, 2024 → `[2026, 2024]`; dois títulos no mesmo ano em ordem
  invertida saem ordenados; entrada não mutada; lista vazia → `[]`.
- `compareWithinYear`: teste nomeado **"RN-02 provisória: título alfabético pt-BR dentro do ano"**,
  para a regra ser achável quando o stakeholder responder.
- `isProfessorAuthor`: exato; com espaços extras; em minúsculas; `'LIMA, J.'` → `false`; `'LIMA
  JUNIOR, HAROLDO C. D., et al.'` → `false`.
- `doiUrl` com as quatro formas de entrada → mesmo URL; `arxivUrl` com `2401.01234`, `arXiv:2401.01234`
  e o URL completo → mesmo URL.
- **Invariante com conteúdo real** (lendo `content/publicacoes/*.md` com `gray-matter`): a soma dos
  `items` de todos os grupos é igual ao número de entradas passadas, e os anos saem estritamente
  decrescentes. Sem contagem exata (README da fase, decisão 6).

**Cabeçalho §10.1** e TSDoc em todas as funções exportadas. O exemplo de cabeçalho do §10.1 do PRD
fala justamente de um `publications.ts` — use-o como modelo, com os campos reais.

## Passos

1. Escrever `src/lib/publications.ts` → verify: `npx astro check` com a linha de resumo colada.
2. Escrever `tests/lib/publications.test.ts` → verify: `npx vitest run tests/lib/publications.test.ts` colado.
3. Canários: (a) anos em ordem crescente → vermelho; (b) `isProfessorAuthor` com `includes` em vez de igualdade → caso `'LIMA JUNIOR, HAROLDO C. D., et al.'` vermelho; reverta → verify: saídas vermelhas coladas; `git diff src/lib/publications.ts` sem as mudanças temporárias.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `groupByYear` com anos decrescentes e `compareWithinYear` como único lugar da regra dentro do ano, com o comentário de RN-02 provisória
- [ ] `isProfessorAuthor`, `doiUrl` e `arxivUrl` com os casos listados
- [ ] Teste "RN-02 provisória: título alfabético pt-BR dentro do ano" existe e passa
- [ ] Invariante com conteúdo real passa sem contagem exata
- [ ] Canários (a) e (b) mostrados vermelhos e revertidos
- [ ] `astro check`, `lint`, `format:check` e `test:coverage` (≥ 80%) verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc

## Evidência

<Preenchido pelo executor ao concluir. Declare também o que NÃO rodou.>
