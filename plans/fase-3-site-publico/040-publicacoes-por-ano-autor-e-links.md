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

Status permanece `TODO` e nenhum checkbox foi marcado, conforme regra do despacho — esta seção
documenta o que foi executado nesta sessão para revisão independente.

### Passo 1 — `npx astro check`

```
[19:36:21] [content] Syncing content
[19:36:21] [content] Synced content
[19:36:21] [types] Generated 416ms
[19:36:21] [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (33 files):
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 2 — `npx vitest run tests/lib/publications.test.ts`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  19:36:30
   Duration  207ms (transform 31ms, setup 0ms, import 69ms, tests 17ms, environment 0ms)
```

### Passo 3 — Canários

**Canário (a)** — `groupByYear`: troquei `(a, b) => b - a` por `(a, b) => a - b` (ordem ascendente
em vez de decrescente):

```
 FAIL  tests/lib/publications.test.ts > groupByYear > agrupa anos distintos em ordem decrescente (RF-25)
AssertionError: expected [ 2024, 2026 ] to deeply equal [ 2026, 2024 ]

- Expected
+ Received

  [
-   2026,
    2024,
+   2026,
  ]

 ❯ tests/lib/publications.test.ts:20:53

 FAIL  tests/lib/publications.test.ts > groupByYear — invariante com conteúdo real de content/publicacoes > a soma dos itens de todos os grupos é igual ao total de entradas, e os anos saem estritamente decrescentes
AssertionError: expected 2024 to be less than 2023
 ❯ tests/lib/publications.test.ts:144:30

 Test Files  1 failed (1)
      Tests  2 failed | 19 passed (21)
```

Revertido de volta a `(a, b) => b - a`.

**Canário (b)** — `isProfessorAuthor`: troquei `normalizeAuthorName(author) === normalizeAuthorName(citationName)`
por `normalizeAuthorName(author).includes(normalizeAuthorName(citationName))`:

```
 FAIL  tests/lib/publications.test.ts > isProfessorAuthor > não casa 'LIMA JUNIOR, HAROLDO C. D., et al.' (sem casamento parcial)
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/lib/publications.test.ts:94:83

 Test Files  1 failed (1)
      Tests  1 failed | 20 passed (21)
```

Revertido de volta a `===`.

**Prova da reversão.** `src/lib/publications.ts` é arquivo novo, não rastreado — `git diff` não
mostra nada para ele (confirmado: `git status --short` lista `?? src/lib/publications.ts`). A prova
é por `grep`, depois da reversão de ambos os canários. Refeito no arquivo final (a linha do `===`
mudou de número entre este passo e o ciclo 1 de correção, por causa da correção do escape em
`normalizeAuthorName` — a função ganhou linhas com a formatação multi-linha, não por mudança de
lógica):

```
$ grep -n "b - a\|a - b\|includes(normalizeAuthorName\|=== normalizeAuthorName" src/lib/publications.ts
61:  const years = [...new Set(entries.map((entry) => entry.data.ano))].sort((a, b) => b - a);
95:  return normalizeAuthorName(author) === normalizeAuthorName(citationName);
```

Linha 61 com `b - a` (decrescente) e linha 95 com `===` (igualdade exata) — os dois canários estão
revertidos.

### Passo 4 — Portão

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


 Test Files  13 passed (13)
      Tests  206 passed (206)
   Start at  19:36:44
   Duration  1.17s (transform 2.82s, setup 0ms, import 4.71s, tests 177ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |       98 |     100 |     100 |
 src/lib           |     100 |    97.82 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 124/124 )
Branches     : 98% ( 49/50 )
Functions    : 100% ( 42/42 )
Lines        : 100% ( 110/110 )
================================================================================
```

`src/lib/publications.ts` está em 100% de statements/branches/functions/lines (a linha "All files"
soma todo `src/lib`; a única lacuna de branch do relatório é `navigation.ts:51`, arquivo do plano
037, fora do escopo deste plano). Threshold do projeto (≥ 80%) superado.

### O que NÃO rodou

- Verificação no navegador (não se aplica — este plano não toca `.astro`/UI).
- `npm ci`, `npm audit`, `npm run build:pipeline`, `npm run test:dist`, CI do GitHub Actions e
  Workers Builds — verificação autoritativa é do orquestrador/`triage-runner`, não desta sessão.
- Nenhum `git add` ou commit foi feito.


### Nota corrigida em 2026-09-16, ciclo 1 (substitui as duas versões anteriores desta nota)

As duas versões anteriores desta nota ("Achado a registrar" e a primeira "Nota corrigida")
afirmavam como fato uma origem para o caractere combinante literal sem prova em bytes do arquivo
original, e a segunda se contradizia sobre o que o Prettier fez com a linha. Reescrita em duas partes, separando o que tem prova do que não tem.

**Fato.** Bytes finais da linha do regex em `src/lib/publications.ts:77`, obtidos agora com `od -c`:

```
$ sed -n '77p' src/lib/publications.ts | od -c
0000000                   .   r   e   p   l   a   c   e   (   /   [   \
0000020   u   0   3   0   0   -   \   u   0   3   6   f   ]   /   g   ,
0000040       '   '   )  \n
0000045
```

Backslash literal antes de cada bloco de dígitos hex (`u0300`, `u036f`) — escape ASCII, não
caractere combinante. Contagem de caracteres combinantes (`U+0300`–`U+036F`) nos dois arquivos do
plano, no arquivo inteiro:

```
$ LC_ALL=en_US.UTF-8 grep -cP '[\x{0300}-\x{036f}]' src/lib/publications.ts tests/lib/publications.test.ts
src/lib/publications.ts:0
tests/lib/publications.test.ts:0
```

Zero ocorrências nos dois arquivos. E o Prettier, rodado agora sobre o arquivo já corrigido:

```
$ npx prettier --write src/lib/publications.ts
src/lib/publications.ts 98ms (unchanged)
```

**Hipótese, sem prova.** A origem do caractere combinante literal que apareceu durante a escrita do
arquivo, relatada nas duas versões anteriores desta nota, nunca teve prova em bytes do arquivo
*original* — só leitura de tela e um teste isolado que reproduzia o mesmo tipo de defeito que
deveria estar testando, não uma comparação de bytes de antes/depois. A atribuição ao Prettier feita
nas versões anteriores está retirada: não há evidência de que o caractere tenha chegado ao arquivo
por ação do Prettier, nem de qualquer outra causa específica. O que os fatos acima sustentam é só o
estado atual: o arquivo usa o escape ASCII correto, e o Prettier o preserva.

### Correção antes da revisão (2026-09-16)

**Passo 1 — nenhum caractere combinante no arquivo inteiro, nos dois arquivos do plano:**

```
$ LC_ALL=en_US.UTF-8 grep -nP '[\x{0300}-\x{036f}]' src/lib/publications.ts tests/lib/publications.test.ts; echo "exit=$?"
exit=1
```

(Sem `LC_ALL=en_US.UTF-8` o `grep` desta máquina recusa `\x{}` com "character value ... too large" —
`exit=2` — por isso o locale explícito; confirmado com uma sonda em `café` antes de aplicar ao
arquivo real.)

**Passo 2 — `npx prettier --write` preserva o escape (arquivo já corrigido):**

```
$ npx prettier --write src/lib/publications.ts
src/lib/publications.ts 98ms (unchanged)

$ grep -n "u0300" src/lib/publications.ts
77:    .replace(/[\u0300-\u036f]/g, '')
```

"(unchanged)" e o grep mostram só o estado atual: o Prettier preserva o escape no arquivo atual. Nada
disso diz qual era o conteúdo do arquivo antes desta correção (ver a nota **Fato** / **Hipótese, sem
prova**, acima).

**Passo 3 — suíte completa sobre o arquivo corrigido:**

`npx vitest run tests/lib/publications.test.ts`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  19:42:12
   Duration  202ms (transform 29ms, setup 0ms, import 64ms, tests 16ms, environment 0ms)
```

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


 Test Files  13 passed (13)
      Tests  206 passed (206)
   Start at  19:42:23
   Duration  1.10s (transform 2.53s, setup 0ms, import 4.31s, tests 166ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |       98 |     100 |     100 |
 src/lib           |     100 |    97.82 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 124/124 )
Branches     : 98% ( 49/50 )
Functions    : 100% ( 42/42 )
Lines        : 100% ( 110/110 )
================================================================================
```

Mesmo resultado de antes (206/206, 100% statements/lines/functions, a única lacuna de branch
continua em `navigation.ts:51`, plano 037, fora do escopo deste plano) — a correção do escape não
mudou comportamento algum, só a legibilidade do código-fonte.

### Ciclo 1 de correção da revisão (2026-09-16)

Cinco bloqueantes do revisor, todos em `tests/lib/publications.test.ts`; `src/lib/publications.ts`
não muda (fora dos canários, revertidos). Itens 1-4 abaixo: teste novo, canario vermelho, reversao,
com a saida literal e completa do vitest para cada canario. Item 5 (nota da Evidencia) ja esta
corrigido nas secoes acima.

**Item 1 — `isProfessorAuthor` sem nenhuma entrada acentuada.** Acrescentado
`'LIMA JÚNIOR, HAROLDO C. D.'` → `true` (acento agudo, diferente do `citationName` sem acento).
Canário: removidas as linhas `.normalize('NFD')` e a linha seguinte de `replace` (faixa de
diacríticos) de `normalizeAuthorName`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/publications.test.ts (26 tests | 1 failed) 19ms
     × casa com acento diferente (JÚNIOR com acento agudo, sem normalize) 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/publications.test.ts > isProfessorAuthor > casa com acento diferente (JÚNIOR com acento agudo, sem normalize)
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/lib/publications.test.ts:101:75
     99|
    100|   it('casa com acento diferente (JÚNIOR com acento agudo, sem normaliz…
    101|     expect(isProfessorAuthor('LIMA JÚNIOR, HAROLDO C. D.', citationNam…
       |                                                                           ^
    102|   });
    103|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  19:49:45
   Duration  205ms (transform 30ms, setup 0ms, import 66ms, tests 19ms, environment 0ms)
```

Revertido (as duas linhas voltaram).

**Item 2 — `isProfessorAuthor` sem caso próprio para `trim`.** Acrescentado
`'  LIMA JUNIOR, HAROLDO C. D. '` (espaço só nas pontas, sem espaço duplicado no meio) → `true`.
Canário: removida a chamada `.trim()` de `normalizeAuthorName`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/publications.test.ts (26 tests | 1 failed) 20ms
     × casa só com espaço nas pontas (trim) 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/publications.test.ts > isProfessorAuthor > casa só com espaço nas pontas (trim)
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/lib/publications.test.ts:93:78
     91|
     92|   it('casa só com espaço nas pontas (trim)', () => {
     93|     expect(isProfessorAuthor('  LIMA JUNIOR, HAROLDO C. D. ', citation…
       |                                                                              ^
     94|   });
     95|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  19:50:03
   Duration  210ms (transform 29ms, setup 0ms, import 65ms, tests 20ms, environment 0ms)
```

Revertido (a chamada `.trim()` voltou).

**Item 3 — `doiUrl`/`arxivUrl` sem cobrir o prefixo `http://arxiv.org/abs/` nem os dois `trim`
iniciais.** Acrescentados: `arxivUrl('http://arxiv.org/abs/2401.01234')`, um DOI com espaços em
volta (`'  10.0000/exemplo.2025.001  '`) e um arXiv com espaços em volta (`'  2401.01234  '`). Três
canários, um por ramo.

Canário 3a — removido `'http://arxiv.org/abs/'` de `ARXIV_PREFIXES`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/publications.test.ts (26 tests | 1 failed) 19ms
     × http://arxiv.org/abs/2401.01234 → https://arxiv.org/abs/2401.01234 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/publications.test.ts > arxivUrl > http://arxiv.org/abs/2401.01234 → https://arxiv.org/abs/2401.01234
AssertionError: expected 'https://arxiv.org/abs/http://arxiv.or…' to be 'https://arxiv.org/abs/2401.01234' // Object.is equality

Expected: "https://arxiv.org/abs/2401.01234"
Received: "https://arxiv.org/abs/http://arxiv.org/abs/2401.01234"

 ❯ tests/lib/publications.test.ts:139:29
    137|     ['  2401.01234  ', expected],
    138|   ])('%s → %s', (input, output) => {
    139|     expect(arxivUrl(input)).toBe(output);
       |                             ^
    140|   });
    141| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  19:50:24
   Duration  213ms (transform 37ms, setup 0ms, import 73ms, tests 19ms, environment 0ms)
```

Revertido (`ARXIV_PREFIXES` voltou a ter os três prefixos).

Canário 3b — removido o `.trim()` inicial de `doiUrl` (`let value = doi;` em vez de
`let value = doi.trim();`):

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/publications.test.ts (26 tests | 1 failed) 20ms
     ×   10.0000/exemplo.2025.001   → https://doi.org/10.0000/exemplo.2025.001 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/publications.test.ts > doiUrl >   10.0000/exemplo.2025.001   → https://doi.org/10.0000/exemplo.2025.001
AssertionError: expected 'https://doi.org/  10.0000/exemplo.202…' to be 'https://doi.org/10.0000/exemplo.2025.…' // Object.is equality

Expected: "https://doi.org/10.0000/exemplo.2025.001"
Received: "https://doi.org/  10.0000/exemplo.2025.001  "

 ❯ tests/lib/publications.test.ts:125:27
    123|     ['  10.0000/exemplo.2025.001  ', expected],
    124|   ])('%s → %s', (input, output) => {
    125|     expect(doiUrl(input)).toBe(output);
       |                           ^
    126|   });
    127| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  19:50:46
   Duration  208ms (transform 29ms, setup 0ms, import 67ms, tests 20ms, environment 0ms)
```

Revertido (`let value = doi.trim();` voltou).

Canário 3c — removido o `.trim()` inicial de `arxivUrl` (`let value = id;` em vez de
`let value = id.trim();`):

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/publications.test.ts (26 tests | 1 failed) 20ms
     ×   2401.01234   → https://arxiv.org/abs/2401.01234 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/publications.test.ts > arxivUrl >   2401.01234   → https://arxiv.org/abs/2401.01234
AssertionError: expected 'https://arxiv.org/abs/  2401.01234  ' to be 'https://arxiv.org/abs/2401.01234' // Object.is equality

Expected: "https://arxiv.org/abs/2401.01234"
Received: "https://arxiv.org/abs/  2401.01234  "

 ❯ tests/lib/publications.test.ts:139:29
    137|     ['  2401.01234  ', expected],
    138|   ])('%s → %s', (input, output) => {
    139|     expect(arxivUrl(input)).toBe(output);
       |                             ^
    140|   });
    141| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  19:51:02
   Duration  210ms (transform 31ms, setup 0ms, import 68ms, tests 20ms, environment 0ms)
```

Revertido (`let value = id.trim();` voltou).

**Item 4 — fixture de "destaque não altera a ordem" com `destaque` fora de `data`.** Corrigida para
`{ data: { ano: 2025, titulo: 'Zebra', destaque: true } }` e `{ data: { ano: 2025, titulo: 'Abelha' } }`
(a outra entrada sem `destaque`), com o título destacado ("Zebra") vindo depois na ordem alfabética.
Canário: `compareWithinYear` reescrito para priorizar `destaque` antes do `titulo`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/publications.test.ts (26 tests | 1 failed) 21ms
     × destaque não altera a ordem (§6.6: só visual) 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/publications.test.ts > compareWithinYear > destaque não altera a ordem (§6.6: só visual)
AssertionError: expected [ 'Zebra', 'Abelha' ] to deeply equal [ 'Abelha', 'Zebra' ]

- Expected
+ Received

  [
-   "Abelha",
    "Zebra",
+   "Abelha",
  ]

 ❯ tests/lib/publications.test.ts:74:76
     72|       { data: { ano: 2025, titulo: 'Abelha' } },
     73|     ];
     74|     expect([...entries].sort(compareWithinYear).map((e) => e.data.titu…
       |                                                                            ^
     75|       'Abelha',
     76|       'Zebra',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  19:51:28
   Duration  220ms (transform 31ms, setup 0ms, import 69ms, tests 21ms, environment 0ms)
```

Revertido (`compareWithinYear` voltou a comparar só por `titulo`).

**Confirmação de que `src/lib/publications.ts` está de volta ao estado aprovado**, depois dos seis
canários acima (1, 2, 3a, 3b, 3c, 4) revertidos: comparado byte a byte com a cópia feita antes do
primeiro canário deste ciclo —

```
$ diff publications.ts.bak src/lib/publications.ts && echo "IDENTICAL"
IDENTICAL
```

**Suíte completa, depois de todos os canários revertidos:**

```
$ npx vitest run tests/lib/publications.test.ts

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  26 passed (26)
   Start at  19:51:40
   Duration  199ms (transform 30ms, setup 0ms, import 67ms, tests 16ms, environment 0ms)
```

**Atenção à ferramenta de escrita (o mesmo mecanismo que decodifica escapes Unicode nos parâmetros,
relatado no ciclo anterior).** Depois de escrever os testes com `Ú`, e depois de todos os canários
revertidos:

```
$ grep -c "JÚNIOR" tests/lib/publications.test.ts
2

$ grep -n "u0300" src/lib/publications.ts
77:    .replace(/[\u0300-\u036f]/g, '')

$ sed -n '77p' src/lib/publications.ts | od -c
0000000                   .   r   e   p   l   a   c   e   (   /   [   \
0000020   u   0   3   0   0   -   \   u   0   3   6   f   ]   /   g   ,
0000040       '   '   )  \n
0000045
```

`JÚNIOR` presente 2 vezes (nome do teste + valor asserido), sem corrupção; o regex de
`normalizeAuthorName` continua em escape ASCII (backslash, `u`, `0`, `3`, `0`, `0` — não caractere
combinante), depois de seis ciclos de canário/reversão nesta sessão.

**Portão:**

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


 Test Files  13 passed (13)
      Tests  211 passed (211)
   Start at  19:51:56
   Duration  1.23s (transform 2.90s, setup 0ms, import 4.82s, tests 179ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |       98 |     100 |     100 |
 src/lib           |     100 |    97.82 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 124/124 )
Branches     : 98% ( 49/50 )
Functions    : 100% ( 42/42 )
Lines        : 100% ( 110/110 )
================================================================================
```

211 testes (206 do ciclo anterior + 5 novos deste ciclo), 100% statements/lines/functions em
`src/lib`, `publications.ts` incluído; a única lacuna de branch continua em `navigation.ts:51`
(plano 037, fora do escopo). Nenhuma mudança de comportamento em `src/lib/publications.ts` — só
testes novos e a correção de fixture do item 4.
