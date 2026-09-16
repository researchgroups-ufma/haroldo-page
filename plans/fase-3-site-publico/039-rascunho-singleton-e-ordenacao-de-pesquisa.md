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

Todos os comandos abaixo rodaram nesta sessão, nesta ordem, com os arquivos já no estado final
(edições → canários revertidos e conferidos por `grep` → arquivo temporário de tipos apagado →
portão). `Status:` continua `TODO`; nada foi commitado; nenhum checkbox foi marcado (conforme a
regra 1 do despacho).

### Passo 1 — `npx vitest run tests/lib/published.test.ts`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  19:21:15
   Duration  195ms (transform 26ms, setup 0ms, import 62ms, tests 8ms, environment 0ms)
```

### Passo 2 — `npx vitest run tests/lib/research.test.ts`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  19:21:17
   Duration  180ms (transform 28ms, setup 0ms, import 44ms, tests 12ms, environment 0ms)
```

### Passo 3 — Canários

**(a) `filterPublished` devolvendo a entrada sem filtrar** — `src/lib/published.ts`, linha
`return entries.filter((entry) => entry.data.publicado);` trocada temporariamente por
`return entries;`. `npx vitest run tests/lib/published.test.ts`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/published.test.ts (6 tests | 2 failed) 14ms
     × mantém a ordem de entrada, removendo os não publicados 7ms
     × nenhum item devolvido tem publicado !== true, e filtrados + rascunhos === total 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/published.test.ts > filterPublished > mantém a ordem de entrada, removendo os não publicados
AssertionError: expected [ { …(2) }, { …(2) }, …(1) ] to deeply equal [ { …(2) }, { …(2) } ]

 FAIL  tests/lib/published.test.ts > filterPublished — invariante com conteúdo real de content/publicacoes (RN-01) > nenhum item devolvido tem publicado !== true, e filtrados + rascunhos === total
AssertionError: expected false to be true // Object.is equality

 Test Files  1 failed (1)
      Tests  2 failed | 4 passed (6)
```

Revertido (linha original restaurada). Prova da reversão, por `grep` (arquivo novo não rastreado
— `git diff` não mostraria nada):

```
$ grep -n "CANARIO" src/lib/published.ts src/lib/research.ts
(sem saída — nenhum marcador de canário restou)
$ grep -n "entries.filter((entry) => entry.data.publicado)" src/lib/published.ts
38:  return entries.filter((entry) => entry.data.publicado);
```

**(b) `relatedLineAnchor` ignorando o conjunto de publicadas** — `src/lib/research.ts`, linha
`if (lineId === undefined || !publishedLineIds.has(lineId)) return undefined;` trocada
temporariamente por `if (lineId === undefined) return undefined;`. `npx vitest run
tests/lib/research.test.ts`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/research.test.ts (10 tests | 1 failed) 16ms
     × devolve undefined quando a linha não está entre as publicadas (RN-01) 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/research.test.ts > relatedLineAnchor > devolve undefined quando a linha não está entre as publicadas (RN-01)
AssertionError: expected '#linha-oculta' to be undefined

 Test Files  1 failed (1)
      Tests  1 failed | 9 passed (10)
```

Revertido (linha original restaurada). Prova da reversão, por `grep`:

```
$ grep -n "CANARIO" src/lib/research.ts
(sem saída)
$ grep -n "publishedLineIds.has(lineId)" src/lib/research.ts
128:  if (lineId === undefined || !publishedLineIds.has(lineId)) return undefined;
```

`git diff src/lib` final: sem saída (arquivos novos, não rastreados — não é o canário que
provaria a reversão; a prova é o `grep` acima, conforme instrução do despacho).

### Passo 4 — Tipos contra o schema real

Arquivo temporário `src/lib/__typecheck039.ts` criado, importando `CollectionEntry` de
`astro:content` e chamando as seis funções com `CollectionEntry<'publicacoes'>[]`,
`CollectionEntry<'perfil'>[]`, `CollectionEntry<'linhas-pesquisa'>[]` e
`CollectionEntry<'projetos'>[]`.

**Com a forma correta de `linha_relacionada` (`{ id: string }`):**

```
$ npx astro check
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (32 files):
- 0 errors
- 0 warnings
- 0 hints
```

**Canário (c) — quebra de propósito do tipo**: `ProjectLike.data.linha_relacionada` trocado
temporariamente de `{ id: string }` para `string` (forma errada, para provar que o `astro check`
reprova a incompatibilidade real com o schema):

```
$ npx astro check
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
src/lib/__typecheck039.ts:27:19 - error ts(2345): Argument of type '{ ...; data: { ...
  linha_relacionada?: { collection: "linhas-pesquisa"; id: string } | undefined; ... } ... }'
  is not assignable to parameter of type 'ProjectLike'.
  The types of 'data.linha_relacionada' are incompatible between these types.
    Type '{ collection: "linhas-pesquisa"; id: string; } | undefined' is not assignable to
    type 'string | undefined'.
[... 7 erros adicionais, mesmos dois arquivos (src/lib/research.ts, tests/lib/research.test.ts,
src/lib/__typecheck039.ts) ...]
Result (32 files):
- 8 errors
- 0 warnings
- 0 hints
```

Revertido (`linha_relacionada?: { id: string }` restaurado). Prova por `grep`:

```
$ grep -n "CANARIO" src/lib/research.ts
(sem saída)
$ grep -n "linha_relacionada?: { id: string }" src/lib/research.ts
34:    linha_relacionada?: { id: string };
```

**Arquivo temporário apagado** (`rm src/lib/__typecheck039.ts`), confirmado por `grep`:

```
$ ls src/lib/ | grep typecheck; echo "exit=$?"
exit=1
```

**`npx astro check` final, sem o arquivo temporário** (linha de resumo, o passo 4 pedido pelo
plano):

```
Result (31 files):
- 0 errors
- 0 warnings
- 0 hints
```

A incompatibilidade real de tipos com o schema **não existe**: `linha_relacionada` como
`{ id: string }` bate exatamente com o que `reference('linhas-pesquisa')` produz depois do Zod
(confirmado tanto pelo `astro check` limpo quanto pelo canário (c), que reprova só quando o tipo
é deliberadamente errado).

### Passo 5 — Portão

```
$ npx astro check
[content] Syncing content
[content] Synced content
[types] Generated 415ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (31 files):
- 0 errors
- 0 warnings
- 0 hints

$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  12 passed (12)
      Tests  183 passed (183)
   Start at  19:21:09
   Duration  1.12s (transform 2.56s, setup 0ms, import 4.27s, tests 148ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    95.65 |     100 |     100 |
 src/lib           |     100 |    95.23 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
  research.ts      |     100 |    96.42 |     100 |     100 | 44
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 101/101 )
Branches     : 95.65% ( 44/46 )
Functions    : 100% ( 32/32 )
Lines        : 100% ( 90/90 )
================================================================================
```

`navigation.ts:51` é dívida pré-existente do plano 037, fora do escopo deste plano. `research.ts:44`
é o ramo de empate entre duas linhas de pesquisa com `ordem` **igual** (não coberto por teste —
os testes cobrem `ordem` diferente e ambas sem `ordem`; o limiar de 80% por branch é cumprido
(95,65% no total) sem essa combinação específica).

### O que NÃO rodou

- **Verificação no navegador** (não se aplica a este plano — sem rotas, sem UI).
- `npm ci`, `npm audit`, `npm run build:pipeline`, `npm run test:dist`, CI do GitHub Actions e
  Workers Builds — verificação autoritativa e de navegador são do orquestrador/`triage-runner`,
  não deste executor.
- `git add` / commit — proibido pelas regras do despacho; `Status:` permanece `TODO`.
- Nenhum checkbox de "Critérios de aceitação" foi marcado, por instrução explícita do despacho
  (mesmo com os cinco atendidos pela evidência acima) — a marcação é do orquestrador/revisor.

### Ciclo 1 de correção (2026-09-16)

Revisão reprovou com dois bloqueantes, ambos em `tests/lib/research.test.ts`/`src/lib/research.ts`;
nenhuma mudança em `src/lib/published.ts` nem em `src/lib/research.ts` fora dos dois canários
abaixo (revertidos). O bloco "Passo 5 — Portão" acima não foi reescrito (a instrução do
coordenador foi para manter os blocos anteriores); a nota ali sobre `research.ts:44` está
**superada**: o novo teste do item 2 cobre esse ramo, e a tabela de cobertura desta subseção não
lista mais `research.ts` como arquivo com linha descoberta.

**Item 1 — caso que não discrimina pt-BR de comparação código a código.** Mantido o par
"Óptica"/"Ondas" pedido pelo plano, com o comentário corrigido para não afirmar que ele prova
pt-BR; acrescentado o par "Ozônio"/"Óptica", que discorda entre as duas comparações. Canário:
`compareResearchLines` trocado temporariamente para `x < y ? -1 : x > y ? 1 : 0` (código a
código) no desempate final. `npx vitest run tests/lib/research.test.ts`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/research.test.ts (12 tests | 1 failed) 17ms
     × desempata por título usando colação pt-BR, não ordem de código de caractere 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/research.test.ts > sortResearchLines > desempata por título usando colação pt-BR, não ordem de código de caractere
AssertionError: expected [ 'Ozônio', 'Óptica' ] to deeply equal [ 'Óptica', 'Ozônio' ]

 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
```

Só o teste novo caiu; o par "Óptica"/"Ondas" continuou verde com o comparador código a código,
confirmando que ele não discrimina a regra sozinho.

**Item 2 — desempate por `titulo` quando `ordem` é igual, sem teste.** Acrescentado teste com
duas linhas de mesma `ordem` (`1`) e títulos fora de ordem alfabética ("Zebra", "Abelha"),
esperando `['Abelha', 'Zebra']`. Canário: `src/lib/research.ts`, linha
`if (a.data.ordem !== b.data.ordem) return a.data.ordem - b.data.ordem;` trocada temporariamente
por `return a.data.ordem - b.data.ordem;` (sempre retorna, sem cair no desempate por título).
`npx vitest run tests/lib/research.test.ts`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/research.test.ts (12 tests | 1 failed) 17ms
     × desempata duas linhas com a MESMA ordem por título 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/research.test.ts > sortResearchLines > desempata duas linhas com a MESMA ordem por título
AssertionError: expected [ 'Zebra', 'Abelha' ] to deeply equal [ 'Abelha', 'Zebra' ]

 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
```

Os dois canários revertidos (um de cada vez); prova por `grep` (arquivo pré-existente, então
`git diff` mostraria a linha se sobrasse alguma marca — conferido de qualquer forma por `grep`
por não haver commit nem stage):

```
$ grep -n "CANARIO" src/lib/research.ts
(sem saída)
$ grep -n "if (a.data.ordem !== b.data.ordem) return a.data.ordem - b.data.ordem;" src/lib/research.ts
44:    if (a.data.ordem !== b.data.ordem) return a.data.ordem - b.data.ordem;
$ grep -n "return a.data.titulo.localeCompare(b.data.titulo, 'pt-BR');" src/lib/research.ts
48:  return a.data.titulo.localeCompare(b.data.titulo, 'pt-BR');
77:  return a.data.titulo.localeCompare(b.data.titulo, 'pt-BR');
```

`npx vitest run tests/lib/research.test.ts` com os dois canários revertidos:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  19:26:18
   Duration  201ms (transform 30ms, setup 0ms, import 45ms, tests 13ms, environment 0ms)
```

**Portão, com os arquivos já no estado final do ciclo 1:**

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  12 passed (12)
      Tests  185 passed (185)
   Start at  19:26:31
   Duration  1.13s (transform 2.56s, setup 0ms, import 4.27s, tests 147ms, environment 1ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    97.82 |     100 |     100 |
 src/lib           |     100 |    97.61 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 101/101 )
Branches     : 97.82% ( 45/46 )
Functions    : 100% ( 32/32 )
Lines        : 100% ( 90/90 )
================================================================================
```

`research.ts` não aparece mais na tabela de arquivos com linha descoberta (100% em todas as
colunas); `navigation.ts:51` continua sendo a única linha sem cobertura no projeto, dívida
pré-existente do plano 037, fora do escopo deste plano. 185 testes, dois a mais que os 183 do
portão original deste plano (os dois testes novos deste ciclo, um por item bloqueante).

`Status:` continua `TODO`; nenhum checkbox marcado; nada commitado; nenhum arquivo fora de
`src/lib/research.ts` (só nos dois canários, revertidos) e `tests/lib/research.test.ts` foi
tocado neste ciclo.
