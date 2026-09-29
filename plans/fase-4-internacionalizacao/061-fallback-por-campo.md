# Plano 061 — Fallback por campo (RN-06)

**Status:** TODO
**RFs cobertos:** **RN-06**, RN-09, F-07 (sinal para o aviso), RF-28; §8.3 (`lang` correto); sabatina fase 4, Decisões 4 e 13; §12 fase 4, item 4
**Depende de:** plano 056 (`HTML_LANG`, tipo `Locale`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe `src/i18n/fallback.ts`, função pura e testada que resolve um campo traduzível para o idioma
da rota: devolve o texto a exibir, o `lang` que o elemento tem de levar quando o texto caiu no
português, e se houve queda — o sinal que as views usam para decidir o aviso único da página.

## Arquivos afetados

- `src/i18n/fallback.ts` — novo
- `tests/i18n/fallback.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. Nenhuma view usa o módulo ainda — isso é dos planos 065–067.

## Contexto necessário

**RN-06:** "Se um campo do grupo 'Versão em inglês' estiver vazio, a rota `/en` exibe o valor em
português correspondente." **Decisão 4** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): todo
elemento cujo texto caiu no PT recebe `lang="pt-BR"`, e a página mostra **um** aviso se qualquer texto
caiu. O §10.2 do PRD já traz o esboço da docstring desta função ("Resolve um campo traduzível com
fallback para o português…").

**API (fixada no fatiamento):**

```ts
export interface LocalizedText {
  /** Texto a exibir. */
  text: string;
  /** `'pt-BR'` quando o texto exibido numa rota EN é o português; ausente caso contrário. */
  lang?: 'pt-BR';
  /** `true` quando a rota é EN e o texto exibido é o português. */
  fellBack: boolean;
}
export function localize(ptValue: string, enValue: string | undefined, lang: Locale): LocalizedText;
export function localizeOptional(
  ptValue: string | undefined, enValue: string | undefined, lang: Locale,
): LocalizedText | undefined;
export function portugueseOnly(ptValue: string, lang: Locale): LocalizedText;
export function hasFallback(values: readonly (LocalizedText | undefined)[]): boolean;
```

Regras:

| Chamada | Resultado |
|---|---|
| `localize(pt, qualquer, 'pt')` | `{ text: pt, fellBack: false }` (sem `lang`) |
| `localize(pt, en, 'en')`, `en` com texto | `{ text: en, fellBack: false }` |
| `localize(pt, undefined \| '' \| '   ', 'en')` | `{ text: pt, lang: 'pt-BR', fellBack: true }` |
| `localizeOptional(undefined \| '', undefined \| '', lang)` | `undefined` (campo vazio não deixa rastro, RF-21) |
| `localizeOptional(pt vazio, en com texto, 'en')` | `{ text: en, fellBack: false }` — decisão de fatiamento 10 |
| `localizeOptional(pt vazio, en com texto, 'pt')` | `undefined` |
| `localizeOptional(pt com texto, en, lang)` | igual a `localize` |
| `portugueseOnly(pt, 'pt')` | `{ text: pt, fellBack: false }` (sem `lang`) |
| `portugueseOnly(pt, 'en')` | `{ text: pt, lang: 'pt-BR', fellBack: false }` — marca o idioma, **não** liga o aviso (Decisão 13) |
| `hasFallback([...])` | `true` se algum item definido tiver `fellBack` |
| `hasFallback([portugueseOnly(x, 'en')])` | `false` — campo "P" nunca liga o aviso (Decisão 13) |

"Vazio" é `undefined` ou `trim() === ''`. O `text` devolvido é o valor **como está** (sem `trim`) —
quem divide em parágrafos é `toParagraphs` (`src/lib/text.ts`), que já apara. O valor `'pt-BR'` sai
de `HTML_LANG.pt` (056), não de literal solto.

**Texto em português sem campo em inglês** (tipo "P" da tabela do README da fase) — **Decisão 13**
(sabatina fase 4, 2026-09-24, "`lang` sim, aviso não"): em `/en` ele recebe `lang="pt-BR"`, mas
**não** dispara o aviso da página, que fica restrito ao fallback de campo traduzível (RN-06). Por isso
existe `portugueseOnly`: mesmo `lang` do fallback, `fellBack: false`. **Não** use
`localize(texto, undefined, lang)` para campo "P" — ele devolve `fellBack: true` e ligaria o aviso.
Campos factuais (tipo "F", inclusive `publicacoes.titulo`/`veiculo` pela exceção da Decisão 13) não
passam por nenhuma das funções.

**Cobertura:** `src/i18n/**` está no `include` do `vitest.config.ts`; mire 100% de linhas e ramos.

**Regras de código:** README da fase 4. Cite **RN-06** no fallback, **RN-09** no PT canônico e
**F-07** no `fellBack` (sinal do aviso). Não cite F-08.

## Passos

1. `src/i18n/fallback.ts` e `tests/i18n/fallback.test.ts`, com uma linha de teste por linha da tabela das Regras → verify: `npm test -- --reporter=verbose tests/i18n/fallback.test.ts` colado.
2. Canários: (a) faça `localize` tratar `'   '` como preenchido (troque o `trim()` por comparação crua) → o teste do espaço reprova; (b) faça `portugueseOnly` devolver `fellBack: true` → o teste de `hasFallback` com campo "P" reprova; desfaça cada um → verify: saídas vermelhas e verde coladas.
3. Portão → verify: `npx astro check`, `npm run lint`, `npm run format:check`, `npm run test:coverage` colados (linha de `fallback.ts` na tabela de cobertura).

## Critérios de aceitação

- [x] `localize`, `localizeOptional`, `portugueseOnly` e `hasFallback` com a API e as regras do Contexto, uma asserção por linha da tabela
- [x] `portugueseOnly` em `/en` marca `lang="pt-BR"` e **não** faz `hasFallback` devolver `true` (Decisão 13)
- [x] Espaço em branco no `en` conta como vazio, e campo "P" não liga o aviso (canários do passo 2)
- [x] `lang` vem de `HTML_LANG`; nenhuma view alterada
- [x] Cobertura de `fallback.ts` em 100% de linhas e ramos
- [x] `astro check`, `lint`, `format:check`, `test:coverage` verdes, com saída colada

## Evidência


### Passo 1 -- `npm test -- --reporter=verbose tests/i18n/fallback.test.ts`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n/fallback.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/fallback.test.ts > localize > em rota PT devolve o português, sem lang, ignorando o inglês 2ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês preenchido devolve o inglês, sem lang 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN devolve o inglês como está, sem trim 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês ausente cai no português com lang e fellBack 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês vazio cai no português 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês só de espaço cai no português 0ms
 ✓ tests/i18n/fallback.test.ts > localize > o lang vem de HTML_LANG.pt 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio (undefined, undefined) não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio ("", "") não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio ("   ", "  ") não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio (undefined, "") não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > português vazio e inglês preenchido mostra o inglês em rota EN 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > português vazio e inglês preenchido não mostra nada em rota PT 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > português preenchido comporta-se como localize 0ms
 ✓ tests/i18n/fallback.test.ts > portugueseOnly > em rota PT devolve o texto sem lang 0ms
 ✓ tests/i18n/fallback.test.ts > portugueseOnly > em rota EN marca lang pt-BR sem ligar o aviso (Decisão 13) 0ms
 ✓ tests/i18n/fallback.test.ts > hasFallback > é true se algum item definido caiu no português 0ms
 ✓ tests/i18n/fallback.test.ts > hasFallback > é false quando nada caiu, com lista vazia ou só itens indefinidos 0ms
 ✓ tests/i18n/fallback.test.ts > hasFallback > campo "P" em rota EN nunca liga o aviso (Decisão 13) 0ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  13:22:05
   Duration  854ms (transform 71ms, setup 0ms, import 109ms, tests 7ms, environment 0ms)

EXIT=0
```

### Passo 2a -- canario: `hasText` sem `trim()` (vermelho)

```
﻿
> haroldo-page@0.1.0 test
> vitest run tests/i18n/fallback.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/i18n/fallback.test.ts (19 tests | 2 failed) 14ms
     × em rota EN com inglês só de espaço cai no português 7ms
     × campo vazio ("   ", "  ") não deixa rastro em nenhum idioma 1ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/i18n/fallback.test.ts > localize > em rota EN com inglês só de espaço cai no português
AssertionError: expected { text: '   ', fellBack: false } to deeply equal { text: 'Olá', lang: 'pt-BR', …(1) }

- Expected
+ Received

  {
-   "fellBack": true,
-   "lang": "pt-BR",
-   "text": "Olá",
+   "fellBack": false,
+   "text": "   ",
  }

 ❯ tests/i18n/fallback.test.ts:33:42
     31|
     32|   it('em rota EN com inglês só de espaço cai no português', () => {
     33|     expect(localize('Olá', '   ', 'en')).toEqual({ text: 'Olá', lang: …
       |                                          ^
     34|   });
     35|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/i18n/fallback.test.ts > localizeOptional > campo vazio ("   ", "  ") não deixa rastro em nenhum idioma
AssertionError: expected { text: '   ', fellBack: false } to be undefined

- Expected:
undefined

+ Received:
{
  "fellBack": false,
  "text": "   ",
}

 ❯ tests/i18n/fallback.test.ts:48:54
     46|     [undefined, ''],
     47|   ])('campo vazio (%j, %j) não deixa rastro em nenhum idioma', (ptValu…
     48|     expect(localizeOptional(ptValue, enValue, 'pt')).toBeUndefined();
       |                                                      ^
     49|     expect(localizeOptional(ptValue, enValue, 'en')).toBeUndefined();
     50|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 17 passed (19)
   Start at  13:22:15
   Duration  250ms (transform 53ms, setup 0ms, import 80ms, tests 14ms, environment 0ms)

EXIT=1
```

### Passo 2b -- canario: `portugueseOnly` com `fellBack: true` (vermelho)

```
﻿
> haroldo-page@0.1.0 test
> vitest run tests/i18n/fallback.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/i18n/fallback.test.ts (19 tests | 2 failed) 23ms
     × em rota EN marca lang pt-BR sem ligar o aviso (Decisão 13) 11ms
     × campo "P" em rota EN nunca liga o aviso (Decisão 13) 1ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/i18n/fallback.test.ts > portugueseOnly > em rota EN marca lang pt-BR sem ligar o aviso (Decisão 13)
AssertionError: expected { text: 'Instituto', …(2) } to deeply equal { text: 'Instituto', …(2) }

- Expected
+ Received

  {
-   "fellBack": false,
+   "fellBack": true,
    "lang": "pt-BR",
    "text": "Instituto",
  }

 ❯ tests/i18n/fallback.test.ts:74:47
     72|
     73|   it('em rota EN marca lang pt-BR sem ligar o aviso (Decisão 13)', () …
     74|     expect(portugueseOnly('Instituto', 'en')).toEqual({
       |                                               ^
     75|       text: 'Instituto',
     76|       lang: 'pt-BR',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/i18n/fallback.test.ts > hasFallback > campo "P" em rota EN nunca liga o aviso (Decisão 13)
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/i18n/fallback.test.ts:96:54
     94|
     95|   it('campo "P" em rota EN nunca liga o aviso (Decisão 13)', () => {
     96|     expect(hasFallback([portugueseOnly('x', 'en')])).toBe(false);
       |                                                      ^
     97|   });
     98| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 17 passed (19)
   Start at  13:22:17
   Duration  311ms (transform 61ms, setup 0ms, import 98ms, tests 23ms, environment 0ms)

EXIT=1
```

### Passo 2 -- canarios desfeitos (verde)

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/i18n/fallback.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/i18n/fallback.test.ts > localize > em rota PT devolve o português, sem lang, ignorando o inglês 2ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês preenchido devolve o inglês, sem lang 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN devolve o inglês como está, sem trim 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês ausente cai no português com lang e fellBack 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês vazio cai no português 0ms
 ✓ tests/i18n/fallback.test.ts > localize > em rota EN com inglês só de espaço cai no português 0ms
 ✓ tests/i18n/fallback.test.ts > localize > o lang vem de HTML_LANG.pt 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio (undefined, undefined) não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio ("", "") não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio ("   ", "  ") não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > campo vazio (undefined, "") não deixa rastro em nenhum idioma 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > português vazio e inglês preenchido mostra o inglês em rota EN 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > português vazio e inglês preenchido não mostra nada em rota PT 0ms
 ✓ tests/i18n/fallback.test.ts > localizeOptional > português preenchido comporta-se como localize 0ms
 ✓ tests/i18n/fallback.test.ts > portugueseOnly > em rota PT devolve o texto sem lang 0ms
 ✓ tests/i18n/fallback.test.ts > portugueseOnly > em rota EN marca lang pt-BR sem ligar o aviso (Decisão 13) 0ms
 ✓ tests/i18n/fallback.test.ts > hasFallback > é true se algum item definido caiu no português 0ms
 ✓ tests/i18n/fallback.test.ts > hasFallback > é false quando nada caiu, com lista vazia ou só itens indefinidos 0ms
 ✓ tests/i18n/fallback.test.ts > hasFallback > campo "P" em rota EN nunca liga o aviso (Decisão 13) 0ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  13:22:19
   Duration  267ms (transform 63ms, setup 0ms, import 90ms, tests 6ms, environment 0ms)

EXIT=0
```

### Passo 3 -- `npx astro check`

```
﻿13:22:37 [content] Syncing content
13:22:37 [content] Synced content
13:22:37 [types] Generated 855ms
13:22:37 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (69 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 3 -- `npm run lint`

```
﻿
> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 3 -- `npm run format:check`

```
﻿
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 3 -- `npm run test:coverage`

```
﻿
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  13:23:14
   Duration  2.24s (transform 5.75s, setup 0ms, import 14.76s, tests 403ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 295/295 )
Branches     : 100% ( 148/148 )
Functions    : 100% ( 79/79 )
Lines        : 100% ( 263/263 )
================================================================================
EXIT=0
```

### Notas e o que nao foi rodado

- Implementacao e testes foram escritos juntos; o passo 1 nao teve execucao vermelha previa. A falsificacao esta nos canarios do passo 2 (arquivo novo, desfeitos editando de volta).
- A tabela de cobertura do vitest omite arquivos a 100%; `fallback.ts` esta em `src/i18n/**` (include) e o resumo global marca 100% em statements, branches, functions e lines.
- Nao rodados (do triage-runner): `build:pipeline`, `test:dist`, `npm audit`. Nenhuma view alterada; nada commitado; `Status:` segue `TODO`.
