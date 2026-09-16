# Plano 038 — Texto corrido em parágrafos, contagem com dois dígitos e data pt-BR

**Status:** TODO
**RFs cobertos:** §8.3 (datas por locale), RF-21/RF-22/RF-24 (texto longo legível), §11 (formatação
de datas por locale, teste unitário)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Três funções puras e testadas que todas as páginas usam: dividir texto do professor em parágrafos,
formatar contagem com dois dígitos e formatar data ISO como `dd/mm/aaaa`.

## Arquivos afetados

- `src/lib/text.ts` — novo: `toParagraphs`, `padCount`
- `src/lib/date.ts` — novo: `formatDate`
- `tests/lib/text.test.ts` — novo
- `tests/lib/date.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. **Não** remova `src/lib/.gitkeep` (é do plano 037, que pode
> estar rodando em paralelo).

## Contexto necessário

**Decisão do fatiamento (README da fase, decisão 2): texto longo é texto simples, não Markdown.**
`bio`, `corpo`, `ementa`, `resumo` e todas as `descricao` são, em `tina/config.ts`, `type:
'string'` com `ui.component: 'textarea'` (ex.: `tina/config.ts:141-146` para `bio`,
`:539-542` para `ementa`). O professor não vê pré-visualização de Markdown. Exemplo real, uma linha
só, de `content/disciplinas/2026.2-relatividade-geral.md:8`:

```yaml
ementa: Variedades e tensores; conexão e curvatura; equações de campo de Einstein; soluções de Schwarzschild e Kerr; ondas gravitacionais no regime linear.
```

**`toParagraphs(text: string | undefined): string[]`**
- `undefined`, `''` ou só espaço → `[]` (quem chama usa isso para esconder o bloco inteiro — regra
  "campo vazio não deixa rastro", §1 da identidade).
- Normaliza `\r\n` → `\n` antes de dividir (conteúdo salvo no Windows).
- Divide em `/\n[ \t]*\n/` (uma ou mais linhas em branco, inclusive com espaços); `trim` em cada
  parte; descarta partes vazias.
- **Não** transforma quebra de linha simples: ela fica no texto e o HTML a colapsa em espaço.
- **Não** escapa nem interpreta nada — o escape é do Astro, na interpolação `{p}`. A docstring diz,
  com essas palavras, que o resultado **nunca** vai para `set:html`.

**`padCount(n: number): string`** — contagem da Home (`02 linhas de pesquisa`, §6.1 da identidade):
inteiro ≥ 0 com dois dígitos (`0` → `"00"`, `7` → `"07"`, `12` → `"12"`, `120` → `"120"`). Número
negativo ou não inteiro é impossível pelo caminho do produto (é `length` de array) — **não** trate
(`CLAUDE.md` §2).

**`formatDate(value: string): string`** — §8.3: `pt-BR` é `15/03/2026`.
- Se `value.trim()` casa com `^\d{4}-\d{2}-\d{2}$`, devolve `dd/mm/aaaa` **por manipulação de
  string**.
- Caso contrário devolve `value.trim()` sem alteração. O campo `data` é **texto livre** no schema
  (`aulaSchema.data: z.string().optional()`, `src/content.config.ts:299`; `tina/config.ts:575`,
  `type: 'string'`), então "10/08" digitado pelo professor tem de aparecer como ele digitou, e o
  build não pode falhar por isso (o schema não muda nesta fase).
- **Armadilha, e o motivo de não usar `Date`:** `new Date('2026-08-10')` é meia-noite **UTC**; em
  São Luís (UTC−3) `toLocaleDateString('pt-BR')` mostra **09/08/2026**, e o resultado depende do fuso
  da máquina de build. Nenhum `Date`, nenhum `Intl` nesta função.
- Não valida calendário (`2026-02-31` sai `31/02/2026`) — é o que o professor digitou.

**Testes (fixtures sintéticas; valores exatos):**
- `toParagraphs`: `undefined` → `[]`; `'  '` → `[]`; uma linha → 1 parágrafo; `'a\n\nb'` → `['a','b']`;
  `'a\n  \n\n b'` → `['a','b']`; `'a\r\n\r\nb'` → `['a','b']`; `'a\nb'` → `['a\nb']`; `'<b>x</b>'`
  → `['<b>x</b>']` (inalterado — o escape é do Astro). Um caso com o texto real da `ementa` acima →
  1 parágrafo.
- `padCount`: 0, 7, 12, 120.
- `formatDate`: `'2026-08-10'` → `'10/08/2026'`; `' 2026-08-10 '` → `'10/08/2026'`; `'10/08'` →
  `'10/08'`; `'2026-8-10'` → `'2026-8-10'`; `'2026-08-10T10:00'` → inalterado.
- Um teste de **determinismo de fuso**: com `process.env.TZ = 'America/Fortaleza'` definido no
  próprio teste (o teste roda em Node, não sob `src/`), `formatDate('2026-08-10')` continua
  `'10/08/2026'`. Restaure o `TZ` no `afterEach`.

**Cabeçalho §10.1** nos dois módulos (modelo: `src/lib/slug.ts`), TSDoc nas três funções, com a
referência ao PRD (`§8.3`) no comentário da regra de data.

## Passos

1. Escrever `src/lib/text.ts` e `tests/lib/text.test.ts` → verify: `npx vitest run tests/lib/text.test.ts` colado.
2. Escrever `src/lib/date.ts` e `tests/lib/date.test.ts` → verify: `npx vitest run tests/lib/date.test.ts` colado.
3. Canários: (a) troque o separador por `'\n'` em `toParagraphs` e mostre `'a\nb'` vermelho; (b) implemente `formatDate` com `new Date(value).toLocaleDateString('pt-BR')` **temporariamente** e mostre o teste de fuso vermelho; reverta os dois → verify: saídas vermelhas coladas; `git diff src/lib` final sem as mudanças temporárias.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `toParagraphs`, `padCount` e `formatDate` com os comportamentos listados, e nenhum uso de `Date`/`Intl` em `date.ts`
- [ ] Todos os casos de teste listados existem e passam
- [ ] Canários (a) e (b) mostrados vermelhos e revertidos
- [ ] Cobertura agregada ≥ 80%; `lint` e `format:check` verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc, com a docstring de `toParagraphs` proibindo `set:html`

## Evidência

Sessão de execução em 2026-09-16. Todos os comandos abaixo rodaram nesta sessão, nesta ordem:
passo 1 → passo 2 → canário (a) e reversão → canário (b) e reversão → portão.

### Passo 1 — `npx vitest run tests/lib/text.test.ts`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  19:02:16
   Duration  195ms (transform 27ms, setup 0ms, import 41ms, tests 5ms, environment 0ms)
```

### Passo 2 — `npx vitest run tests/lib/date.test.ts`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  19:02:21
   Duration  167ms (transform 24ms, setup 0ms, import 39ms, tests 4ms, environment 0ms)
```

### Passo 3 — Canário (a): separador trocado por `/\n/` em `toParagraphs`

`npx vitest run tests/lib/text.test.ts` com `.split(/\n/)` no lugar de `.split(/\n[ \t]*\n/)`:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/text.test.ts (13 tests | 1 failed) 10ms
     × não transforma quebra de linha simples 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/text.test.ts > toParagraphs > não transforma quebra de linha simples
AssertionError: expected [ 'a', 'b' ] to deeply equal [ 'a\nb' ]

- Expected
+ Received

  [
-   "a
- b",
+   "a",
+   "b",
  ]

 ❯ tests/lib/text.test.ts:30:34
     28|
     29|   it('não transforma quebra de linha simples', () => {
     30|     expect(toParagraphs('a\nb')).toEqual(['a\nb']);
       |                                  ^
     31|   });
     32|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 12 passed (13)
   Start at  19:02:28
   Duration  173ms (transform 24ms, setup 0ms, import 39ms, tests 10ms, environment 0ms)
```

Revertido em seguida (`.split(/\n[ \t]*\n/)` restaurado).

### Passo 3 — Canário (b): `formatDate` temporário com `new Date(trimmed).toLocaleDateString('pt-BR')`

`npx vitest run tests/lib/date.test.ts` com a implementação temporária:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/date.test.ts (6 tests | 3 failed) 22ms
     × formata aaaa-mm-dd como dd/mm/aaaa 19ms
     × remove espaço nas pontas antes de formatar 1ms
       × não depende do fuso da máquina de build 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/date.test.ts > formatDate > formata aaaa-mm-dd como dd/mm/aaaa
AssertionError: expected '09/08/2026' to be '10/08/2026' // Object.is equality

Expected: "10/08/2026"
Received: "09/08/2026"

 ❯ tests/lib/date.test.ts:6:38
      4| describe('formatDate', () => {
      5|   it('formata aaaa-mm-dd como dd/mm/aaaa', () => {
      6|     expect(formatDate('2026-08-10')).toBe('10/08/2026');
       |                                      ^
      7|   });
      8|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  tests/lib/date.test.ts > formatDate > remove espaço nas pontas antes de formatar
AssertionError: expected '09/08/2026' to be '10/08/2026' // Object.is equality

Expected: "10/08/2026"
Received: "09/08/2026"

 ❯ tests/lib/date.test.ts:10:40
      8|
      9|   it('remove espaço nas pontas antes de formatar', () => {
     10|     expect(formatDate(' 2026-08-10 ')).toBe('10/08/2026');
       |                                        ^
     11|   });
     12|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  tests/lib/date.test.ts > formatDate > determinismo de fuso > não depende do fuso da máquina de build
AssertionError: expected '09/08/2026' to be '10/08/2026' // Object.is equality

Expected: "10/08/2026"
Received: "09/08/2026"

 ❯ tests/lib/date.test.ts:34:40
     32|     it('não depende do fuso da máquina de build', () => {
     33|       process.env.TZ = 'America/Fortaleza';
     34|       expect(formatDate('2026-08-10')).toBe('10/08/2026');
       |                                        ^
     35|     });
     36|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 3 passed (6)
   Start at  19:02:47
   Duration  195ms (transform 23ms, setup 0ms, import 37ms, tests 22ms, environment 0ms)
```

Nota: já as duas primeiras asserções (sem troca de `TZ`) ficam vermelhas com `Date`, porque o
fuso padrão desta máquina de execução também difere de UTC; o teste de determinismo de fuso
(`America/Fortaleza`) fica vermelho junto, confirmando que a implementação temporária é sensível
ao fuso. Revertido em seguida (`formatDate` restaurado à manipulação de string, sem `Date`).

`git diff src/lib` depois da reversão: sem saída — os dois arquivos são novos (não rastreados),
então `git diff` não mostra nada independente do conteúdo. Confirmação alternativa por
`grep -n "split|new Date|Intl" src/lib/text.ts src/lib/date.ts`:

```
src/lib/text.ts:40:    .split(/\n[ \t]*\n/)
src/lib/date.ts:7: *                 sem `Date` nem `Intl`, para não depender do fuso da
src/lib/date.ts:20: *  Notas        : nenhum `Date`/`Intl` — `new Date('2026-08-10')` é meia-noite
```

Confirma que o separador voltou a `/\n[ \t]*\n/` e que não há `new Date(` no código (só menções em
comentário/TSDoc).

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


 Test Files  10 passed (10)
      Tests  167 passed (167)
   Start at  19:03:19
   Duration  1.09s (transform 2.34s, setup 0ms, import 3.92s, tests 112ms, environment 1ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    93.75 |     100 |     100 |
 src/lib           |     100 |    91.66 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 66/66 )
Branches     : 93.75% ( 15/16 )
Functions    : 100% ( 22/22 )
Lines        : 100% ( 63/63 )
================================================================================
```

(`navigation.ts` não é arquivo deste plano — cobertura pré-existente do plano 037.)

### Ciclo 1 de correção (2026-09-16)

Bloqueante do revisor: `process.env.TZ = originalTz` no `afterEach` grava a string `"undefined"`
quando `originalTz` é `undefined` (caso desta máquina e do CI), em vez de restaurar a ausência da
variável. Corrigido em `tests/lib/date.test.ts` (`if (originalTz === undefined) delete
process.env.TZ; else process.env.TZ = originalTz;`). Nenhum outro arquivo tocado.

**Prova da correção** — canário: reintroduzi temporariamente a atribuição direta (`process.env.TZ =
originalTz`) e acrescentei, temporariamente, ao fim do arquivo, `describe('canário temporário:
restauração do TZ', ...)` com `expect(process.env.TZ).toBeUndefined()`. Removidos os dois depois de
provado.

`npx vitest run tests/lib/date.test.ts` com o bug reintroduzido e o teste temporário — vermelho:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/date.test.ts (7 tests | 1 failed) 7ms
     × TZ volta a undefined depois do afterEach anterior 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/date.test.ts > canário temporário: restauração do TZ > TZ volta a undefined depois do afterEach anterior
AssertionError: expected 'undefined' to be undefined

- Expected:
undefined

+ Received:
"undefined"

 ❯ tests/lib/date.test.ts:41:28
     39| describe('canário temporário: restauração do TZ', () => {
     40|   it('TZ volta a undefined depois do afterEach anterior', () => {
     41|     expect(process.env.TZ).toBeUndefined();
       |                            ^
     42|   });
     43| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
   Start at  19:08:19
   Duration  173ms (transform 24ms, setup 0ms, import 38ms, tests 7ms, environment 0ms)
```

`npx vitest run tests/lib/date.test.ts` com a correção aplicada (mesmo teste temporário) — verde:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  19:08:28
   Duration  164ms (transform 24ms, setup 0ms, import 38ms, tests 4ms, environment 0ms)
```

Teste temporário removido em seguida. `npx vitest run tests/lib/date.test.ts` no estado final
(sem o canário):

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  19:08:36
   Duration  168ms (transform 26ms, setup 0ms, import 41ms, tests 4ms, environment 0ms)
```

**Portão, saída nova desta sessão:**

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


 Test Files  10 passed (10)
      Tests  167 passed (167)
   Start at  19:08:48
   Duration  1.12s (transform 2.34s, setup 0ms, import 4.05s, tests 115ms, environment 1ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    93.75 |     100 |     100 |
 src/lib           |     100 |    91.66 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 66/66 )
Branches     : 93.75% ( 15/16 )
Functions    : 100% ( 22/22 )
Lines        : 100% ( 63/63 )
================================================================================
```

### O que NÃO rodou

- `npm ci`, `npm audit --audit-level=high`, `npm run build:pipeline`, `npm run test:dist` — fora do
  escopo do portão deste plano (§"Verificação autoritativa" do README da fase é do orquestrador).
- Verificação no navegador — não aplicável (plano sem página/rota).
- CI do GitHub Actions e Workers Builds — nada foi commitado nem empurrado nesta sessão.
- `git add` / commit — não executado, por instrução explícita (Status permanece `TODO`).
