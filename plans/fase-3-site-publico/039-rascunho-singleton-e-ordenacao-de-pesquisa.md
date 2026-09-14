# Plano 039 — Filtro de rascunho (RN-01), singleton e ordenação de pesquisa

**Status:** TODO
**RFs cobertos:** RN-01, RF-10, RF-22, RF-13, RF-20 (contagem de linhas); §11 (filtro de rascunhos)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Funções puras e testadas para: esconder rascunhos (RN-01), exigir o singleton do perfil, ordenar
linhas de pesquisa e projetos, contar projetos em andamento por linha e decidir se um projeto pode
linkar a linha relacionada.

## Arquivos afetados

- `src/lib/published.ts` — novo: `filterPublished`, `requireSingleton`
- `src/lib/research.ts` — novo: `sortResearchLines`, `sortProjects`, `countActiveProjectsByLine`,
  `relatedLineAnchor`
- `tests/lib/published.test.ts` — novo
- `tests/lib/research.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. **Não** remova `src/lib/.gitkeep` (plano 037).

## Contexto necessário

**Por que funções puras e sem `astro:content`.** As páginas chamam `getCollection(...)` e passam o
resultado para estas funções. Aqui dentro não se importa `astro:content` — só tipos estruturais —,
para o Vitest testar sem a content layer. A cobertura mede `src/lib/**/*.ts` (`vitest.config.ts:15`).

**Forma de uma entrada devolvida por `getCollection`:** `{ id: string; data: {...}; filePath?:
string; ... }`. Tipos mínimos a usar (estruturais, genéricos):

```ts
type Publishable = { data: { publicado: boolean } };
```

**`filterPublished<T extends Publishable>(entries: T[]): T[]`** — `// RN-01`. Mantém a ordem de
entrada. Existe conteúdo real com `publicado: false`:
`content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md:2`.

**`requireSingleton<T>(entries: T[], collection: string): T`** — o `perfil` é singleton
(`content/perfil/index.md`, `glob({ pattern: 'index.md' })` em `src/content.config.ts:182`).
Com `length !== 1`, lança `Error` com a mensagem ``Coleção `${collection}`: esperado exatamente 1
item, encontrados ${n}`` (formato de F-09: nomeia o que está errado). **Por que não `getEntry('perfil',
'index')`:** o id é derivado por `githubSlug` e depende de detalhe interno do loader
(`node_modules/astro/dist/content/utils.js:272`); contar a coleção não depende.

**Linhas de pesquisa** (`linhasPesquisaSchema`, `src/content.config.ts:201-209`): `titulo`
obrigatório, `ordem?: number`. Placeholder real: `relatividade-geral-e-teorias-alternativas-de-gravitacao.md`
com `ordem: 1` e `sombras-de-buracos-negros.md` com `ordem: 2`.

**`sortResearchLines<T extends { data: { ordem?: number; titulo: string } }>(entries: T[]): T[]`** —
`// RF-09/RF-22`: `ordem` crescente; sem `ordem` vão ao fim; empate (inclusive entre os sem ordem)
por `titulo` com `a.localeCompare(b, 'pt-BR')`. Não muta o array de entrada (devolve cópia). Regra
do §6.3 da identidade.

**Projetos** (`projetosSchema`, `src/content.config.ts:259-277`): `status?: 'em andamento' |
'concluído'` (opcional!), `linha_relacionada` opcional. **Depois do `reference()`, o valor em
`entry.data.linha_relacionada` é um objeto `{ collection: 'linhas-pesquisa'; id: string }`, não
string.** Placeholder real: `sombras-de-buracos-negros-em-gravitacao-modificada.md` com `status: em
andamento` e `linha_relacionada: content/linhas-pesquisa/sombras-de-buracos-negros.md` (o Zod
normaliza para id `sombras-de-buracos-negros`); `forcas-de-mare-em-espacos-tempos-de-kerr.md` com
`status: concluído`, sem linha.

Tipo mínimo:

```ts
type ProjectLike = {
  data: { titulo: string; status?: 'em andamento' | 'concluído'; linha_relacionada?: { id: string } };
};
```

**`sortProjects<T extends ProjectLike>(entries: T[]): T[]`** — §6.3 da identidade ("Concluídos
depois dos em andamento"): grupo `em andamento`, depois `concluído`, depois sem `status`; dentro do
grupo, `titulo` por `localeCompare('pt-BR')`. Cópia, não mutação.

**`countActiveProjectsByLine(projects: ProjectLike[]): Map<string, number>`** — conta, por
`linha_relacionada.id`, os projetos com `status === 'em andamento'`. Projetos sem linha não entram.
Recebe projetos **já filtrados** por `filterPublished` (a docstring diz isso). A página usa o valor
para a tag "N projetos em andamento", que **some se zero** (§6.3).

**`relatedLineAnchor(project: ProjectLike, publishedLineIds: ReadonlySet<string>): string |
undefined`** — devolve `#<id>` se o projeto tem `linha_relacionada` **e** o id está entre as linhas
publicadas; senão `undefined`. **Por quê:** um projeto pode apontar para linha com `publicado:
false`; linkar a âncora dela seria link para algo que não está na página, e revelaria a existência
do rascunho (RN-01). Comente com `// RN-01`.

**Testes (fixtures sintéticas para valores exatos; conteúdo real só para invariante).**
- `published.test.ts`: filtra mantendo ordem; lista vazia → vazia; `requireSingleton` com 0, 1 e
  2 itens (mensagem exata nos casos de erro).
- `published.test.ts`, **invariante com conteúdo real**: leia `content/publicacoes/*.md` com
  `gray-matter` (já é `devDependency`; ver como `tests/content/conteudo-valido.test.ts` lê) e
  afirme que nenhum item devolvido por `filterPublished` tem `publicado !== true` e que
  `filtrados + rascunhos === total`. **Não** afirme contagens exatas do conteúdo real: o primeiro
  save do professor quebraria o CI (README da fase, decisão 6).
- `research.test.ts`: ordem com `[3, undefined, 1]` → `1, 3, sem`; dois sem ordem ordenados por
  título com acento (`"Óptica"` vs `"Ondas"` — confira o resultado do `localeCompare` e escreva o
  esperado a partir do que ele devolve, justificando no teste); entrada não mutada; `sortProjects`
  com os três grupos; `countActiveProjectsByLine` ignorando concluídos e sem linha;
  `relatedLineAnchor` nos três casos (sem linha, linha publicada, linha não publicada).

**Cabeçalho §10.1** e TSDoc em todas as funções exportadas.

## Passos

1. `src/lib/published.ts` + teste → verify: `npx vitest run tests/lib/published.test.ts` colado.
2. `src/lib/research.ts` + teste → verify: `npx vitest run tests/lib/research.test.ts` colado.
3. Canários: (a) `filterPublished` devolvendo a entrada sem filtrar → invariante vermelho; (b) `relatedLineAnchor` ignorando o conjunto de publicadas → teste vermelho; reverta → verify: saídas vermelhas coladas; `git diff src/lib` final limpo das mudanças temporárias.
4. Tipos contra o schema real: `npx astro check` → verify: linha de resumo colada.
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] As seis funções exportadas existem com as assinaturas e regras acima, sem importar `astro:content`
- [ ] `relatedLineAnchor` não produz âncora para linha não publicada
- [ ] Invariante com `content/publicacoes` real passa sem afirmar contagem exata
- [ ] Canários (a) e (b) mostrados vermelhos e revertidos
- [ ] `astro check`, `lint`, `format:check` e `test:coverage` (≥ 80%) verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc; comentários `// RN-01` nas regras de rascunho

## Evidência

<Preenchido pelo executor ao concluir. Declare também o que NÃO rodou.>
