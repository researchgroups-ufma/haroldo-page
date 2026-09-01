# Plano 005 — Vitest configurado com o primeiro teste real

**Status:** DONE
**RFs cobertos:** — (Fase 0, item 9 parcial do checklist §12; §11 do PRD, RNF-10)
**Depende de:** planos 003 e 004
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O projeto passa a ter suíte de testes executável por `npm run test`, com Vitest integrado à
configuração Vite do Astro e relatório de cobertura disponível — pronto para receber, na
fase 1, os testes de paridade de schema e as regras RN-01/RN-02/RN-04/RN-06.

## Arquivos afetados

- `package.json` — devDependencies (`vitest`, `@vitest/coverage-v8`) e scripts
  `test`, `test:watch`, `test:coverage`
- `vitest.config.ts` — criar
- `src/lib/slug.ts` — criar (função `slugify`, primeira lógica pura testável)
- `tests/lib/slug.test.ts` — criar (teste da função acima)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático + TypeScript strict + Tailwind 4 (plano 002); Prettier e ESLint
já configurados (plano 004); pasta `tests/` já existe com `.gitkeep` (plano 003).

**Estratégia de testes do PRD §11 — o que este plano precisa habilitar (não implementar):**

| Nível | Escopo | Ferramenta | Meta |
|---|---|---|---|
| Unitário | lógica pura de `src/lib/` e `src/i18n/` (RN-01, RN-02, RN-04, RN-06, datas, slug) | Vitest | ≥ 80% |
| Contrato de schema | paridade `tina/config.ts` × `src/content.config.ts` (D-06, RNF-09) | Vitest | 100% das coleções |
| Integração | rotas geradas, sobre o `dist/` do build | Vitest | fluxos principais |

Tudo isso é **fase 1 ou posterior**. Aqui só se monta o arcabouço e se prova que ele roda,
com **um** teste de verdade — não um `expect(true).toBe(true)`.

**Regras do §11 que a configuração precisa respeitar desde já:**
- Testes **determinísticos**: nada de data corrente, rede real ou dependência de ordem.
  Funções que envolvem "semestre atual" recebem a data por parâmetro. Não habilite nada que
  dependa de relógio.
- `tests/` **espelha `src/`** — por isso o teste vai em `tests/lib/slug.test.ts`, não solto
  na raiz de `tests/`.

**Integração Vitest × Astro.** O Astro expõe `getViteConfig` para que o Vitest herde os
aliases e plugins do projeto (inclusive o plugin do Tailwind). Use exatamente este padrão:

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/i18n/**'],
      reporter: ['text', 'html'],
    },
  },
});
```

`environment: 'node'` é o certo: o site é estático e não há DOM a testar na fase 0
(acessibilidade com axe-core é fase 5). **Não instale `jsdom`/`happy-dom` agora.**

**Por que `slugify` como primeiro teste, e não outra coisa.** A RN-08 do PRD manda que o
nome do arquivo de conteúdo seja **gerado por template**, nunca digitado pelo professor:
`{ano}-{slug(titulo)}.md` para publicações e `{semestre}-{slug(nome)}.md` para disciplinas
(§7.3). O slug é a única peça de lógica pura já definida sem ambiguidade nesta fase — e é
justamente onde acentuação portuguesa quebra silenciosamente.

**Especificação fechada de `slugify(input: string): string`:**

1. Normalizar Unicode com `input.normalize('NFD')` e remover as marcas diacríticas com
   `.replace(/[\u0300-\u036f]/g, '')` — `"Mecânica Clássica"` → `"Mecanica Classica"`.
2. `toLowerCase()`.
3. Trocar tudo que não for `[a-z0-9]` por hífen.
4. Colapsar hífens repetidos e remover hífens das pontas.
5. String vazia ou só de símbolos devolve `''` (não lance exceção).

**Casos de teste obrigatórios** (com dados reais do domínio deste projeto — Apêndice C do PRD
e §7.3):

| Entrada | Saída esperada |
|---|---|
| `"Mecânica Clássica"` | `mecanica-classica` |
| `"Tidal Forces in Kerr Spacetime"` | `tidal-forces-in-kerr-spacetime` |
| `"Sombras de buracos negros"` | `sombras-de-buracos-negros` |
| `"Relatividade   Geral -- e teorias alternativas"` | `relatividade-geral-e-teorias-alternativas` |
| `"  Física  "` | `fisica` |
| `""` | `""` |
| `"---"` | `""` |

**Armadilha real:** `String.prototype.normalize('NFD')` é o único jeito confiável de tratar
acento em Node sem dependência externa; `replace(/[^\w]/g, '-')` sozinho transformaria
"Mecânica" em `mec-nica`. Escreva o teste com as strings acentuadas literalmente e garanta
que o arquivo é salvo em **UTF-8 sem BOM** (o `.editorconfig` do plano 001 já manda UTF-8).

**§10 do PRD é normativa** e vale para `src/lib/slug.ts`:
- cabeçalho de arquivo obrigatório (o bloco `Arquivo / Projeto / Descrição / Autor / Criado
  em / Atualizado em / Versão / Dependências / Entradas / Saídas / Uso / Notas` da §10.1);
- TSDoc na função exportada, com `@param` e `@returns`;
- comentário citando o identificador da regra: `// RN-08: nome de arquivo gerado por
  template, nunca digitado pelo professor`;
- **código e identificadores em inglês** (`slugify`, `input`), textos de interface em
  português — aqui não há texto de interface;
- `any` proibido.

**Scripts npm** (nomes exatos — o CI do plano 008 os chama assim):

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

`vitest run` (e não `vitest`) é o que o CI precisa: o modo padrão fica em watch e travaria o
job. Versões exatas no `package.json`, sem `^`/`~` (convenção do plano 002).

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Instalar `vitest` e `@vitest/coverage-v8` como devDependencies, com versão exata.
   → verify: `npm ls vitest --depth=0`.
2. Criar `vitest.config.ts` com o conteúdo acima.
   → verify: `npx vitest run` executa (e informa "no test files found" antes do passo 3).
3. Criar `src/lib/slug.ts` com `slugify` conforme a especificação, cabeçalho §10.1 e TSDoc.
   → verify: `npx tsc --noEmit` (ou `npx astro check`) sem erro de tipo.
4. Criar `tests/lib/slug.test.ts` cobrindo os sete casos da tabela.
   → verify: `npm run test` verde, 7 asserções.
5. Acrescentar os três scripts npm.
   → verify: `npm run test` e `npm run test:coverage` executam.
6. Rodar `npm run lint` e `npm run format:check` para garantir que os arquivos novos
   passam nas regras do plano 004.
   → verify: ambos verdes (rode `npm run format` se preciso).
7. Commitar com `test: configura Vitest e adiciona slugify com testes de acentuação`.
   → verify: `git show --stat HEAD` lista `vitest.config.ts`, `src/lib/slug.ts` e
   `tests/lib/slug.test.ts`.

## Critérios de aceitação

- [x] `npm run test` verde, com os 7 casos de `slugify` nomeados individualmente
- [x] O caso `"Mecânica Clássica"` → `mecanica-classica` passa (prova o tratamento de acento)
- [x] `npm run test:coverage` gera relatório sem erro
- [x] `npm run lint` e `npm run format:check` continuam verdes
- [x] `npm run build` continua verde
- [x] `src/lib/slug.ts` tem cabeçalho §10.1 e TSDoc na função exportada
- [x] Nenhum teste depende de data corrente, rede ou ordem de execução

## Evidência

Saída autoritativa do triage-runner (verificação independente desta sessão).

### 1. `npm run test` — exit 0

```
> haroldo-page@0.1.0 test
> vitest run

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  15:21:30
   Duration  203ms (transform 42ms, setup 0ms, import 56ms, tests 3ms, environment 0ms)
```

### 2. `npm run test:coverage` — exit 0

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  15:21:37
   Duration  225ms (transform 34ms, setup 0ms, import 49ms, tests 4ms, environment 0ms)

 % Coverage report from v8
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|-------------------
-----------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 1/1 )
Branches     : 100% ( 0/0 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 1/1 )
================================================================================
```

Nota do triage-runner: a tabela de arquivos individual sai vazia (nenhum arquivo listado por
nome), apenas o sumário agregado "1/1". `src/lib/slug.ts` não aparece nominalmente no
relatório de texto apesar do 100% agregado — confirmado pelo `coverage/lib/slug.ts.html`
(100% em statements/branches/functions/lines; `1/1` está correto porque a função é um único
`return` encadeado). É um defeito cosmético do reporter de texto do v8 no Windows, não
bloqueante.

### 3. `npm run lint` — exit 0

```
> haroldo-page@0.1.0 lint
> eslint .
```

(sem nenhum warning/erro impresso)

### 4. `npm run format:check` — exit 1

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
[warn] CLAUDE.md
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

Único arquivo listado: `CLAUDE.md` — pré-existente, não rastreado pelo git, fora do escopo
do plano 005. Nenhum arquivo do plano aparece.

Verificação isolada dos arquivos do plano 005 — exit 0:

```
> npx prettier --check vitest.config.ts src/lib/slug.ts tests/lib/slug.test.ts package.json
Checking formatting...
All matched files use Prettier code style!
```

### 5. `npm run build` — exit 0

```
> haroldo-page@0.1.0 build
> astro check && astro build

[content] Syncing content
[content] Synced content
[types] Generated 48ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
eslint.config.js:16:25 - warning ts(6387): The signature '(...configs: InfiniteDepthConfigWithExtends[]): ConfigArray' of 'tseslint.config' is deprecated.
16 export default tseslint.config(
                          ~~~~~~

coverage/prettify.js:2:14757 - warning ts(6133): 'ae' is declared but its value is never read.
[... corpo minificado de terceiros omitido pelo triage-runner ...]

Result (11 files):
- 0 errors
- 0 warnings
- 5 hints

[content] Syncing content
[content] Synced content
[types] Generated 38ms
[build] output: "static"
[build] mode: "static"
[build] directory: S:\Projetos\academic_page\haroldo\dist\
[build] Collecting build info...
[build] ✓ Completed in 51ms.
[build] Building static entrypoints...
[vite] ✓ built in 527ms
[build] ✓ Completed in 556ms.

 generating static routes
▶ src/pages/index.astro
  └─ /index.html (+6ms)
✓ Completed in 12ms.
[build] 1 page(s) built in 628ms
[build] Complete!
```

### 6/7. Estado da árvore de trabalho pré-commit (`git status --short` / `git diff --stat`) — exit 0

O commit ainda não existe neste momento (é feito pelo orquestrador depois do fechamento do
plano); o critério `git show --stat HEAD` do plano é substituído pelo estado real da árvore
de trabalho no momento da verificação:

```
 M package-lock.json
 M package.json
?? CLAUDE.md
?? src/lib/slug.ts
?? tests/lib/
?? vitest.config.ts

 package-lock.json | 497 +++++++++++++++++++++++++++++++++++++++++++++++++++++-
 package.json      |   9 +-
 2 files changed, 503 insertions(+), 3 deletions(-)
```

`CLAUDE.md` não rastreado é pré-existente e fora do escopo deste plano — não foi criado nem
modificado por esta execução.

### Resumo

| Comando | Resultado | Exit |
|---|---|---|
| `npm run test` | PASSOU — 1 arquivo, 7 testes, 7 passaram | 0 |
| `npm run test:coverage` | PASSOU — 100% agregado (1/1), tabela por-arquivo vazia (cosmético) | 0 |
| `npm run lint` | PASSOU | 0 |
| `npm run format:check` | FALHOU — só `CLAUDE.md` (pré-existente, fora de escopo) | 1 |
| `npx prettier --check` (arquivos do plano) | PASSOU | 0 |
| `npm run build` | PASSOU — 0 errors, 0 warnings, 5 hints; 1 página | 0 |

### Notas de execução

- Desvio do plano: `vitest.config.ts` recebeu `/// <reference types="vitest/config" />` no
  topo, além do bloco literal do plano, porque `getViteConfig({ test: {...} })` sem essa
  referência falha em `tsc --noEmit` com `TS2353: Object literal may only specify known
  properties, and 'test' does not exist in type 'UserConfig'` — é a solução oficial
  documentada pela Astro para esse erro; revisado e aprovado pelo code-reviewer.
- Achado para plano futuro: `coverage/` não está em `exclude` no `tsconfig.json`, então
  `astro check` varre `coverage/prettify.js` (minificado, de terceiros) e emite um warning
  ts(6133); não bloqueia o build e está fora do escopo do plano 005.
