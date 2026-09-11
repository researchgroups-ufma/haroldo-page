# Plano 030 — Portão de conteúdo: todo arquivo de `content/` validado, com referência resolvida

**Status:** DONE
**RFs cobertos:** **F-09**, RNF-09, R-01, R-02, D-06; §11 ("Validação de conteúdo: todo arquivo em
`content/` passa pelo Zod — bloqueia merge"); **dívida 5** e **dívida 7(a)/(c)** da fase 1
**Depende de:** plano **024** (o `build:pipeline` já chama `vitest run tests/content`; este plano
põe o portão dentro dessa pasta e ele passa a valer no deploy sem alterar o script). **Conflita em
`package.json` com o 024** — serialize.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Conteúdo inválido em `content/` **reprova** — no CI e no build de deploy —, com mensagem que
nomeia o arquivo e o campo, como F-09 exige. Hoje não reprova: o `astro check` imprime
`[ERROR] [content]` e ainda assim encerra com `0 errors` e **exit 0**, e a única coisa que impediu
uma referência inválida de entrar no commit que fechou a fase 1 foi **um humano ler a saída**.

## Arquivos afetados

- `tests/content/conteudo-valido.test.ts` — **novo**: valida os arquivos reais de `content/`
  contra os schemas Zod e resolve as referências
- `tests/content/paridade-schema.test.ts` — **acréscimo**: comparação do `path` da coleção no Tina
  contra a pasta que o `glob()` do Zod lê (dívida 7a) e reprodução da prova de falsificabilidade
  contra o artefato final (dívida 7c)
- `package.json` / `package-lock.json` — `gray-matter` declarado como devDependency

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** edite `content/**` (fora dos canários temporários do passo 5, revertidos no
> mesmo passo), **não** edite `src/content.config.ts` nem `tina/config.ts` — se o portão novo
> apontar defeito real em algum arquivo de conteúdo ou em algum schema, isso é **achado a
> reportar**, e a correção é plano próprio.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 + TinaCMS. `src/content.config.ts` é o portão de validação
(Zod 4 via `astro/zod`); `tina/config.ts` é a interface de entrada. Windows 11 / PowerShell, Node
24.16.0, Vitest 4.1.11. Suíte atual: **107 testes, 4 arquivos, cobertura 100%**, `thresholds` de
80% impostos em `vitest.config.ts`.

**Conteúdo real hoje — 13 arquivos** criados pelo painel no plano 020:

```
content/perfil/index.md
content/linhas-pesquisa/*.md          (2)
content/projetos/*.md                 (2)
content/disciplinas/*.md              (2)
content/publicacoes/*.md              (6)
```

### A dívida que este plano fecha, com o artefato que a materializou

Em 2026-09-10, durante a demonstração do critério da fase 1 (plano 021), **editar apenas a
`descricao`** de `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md` pelo painel fez o
Tina acrescentar `linha_relacionada: ''` a um arquivo que o plano 020 tinha criado **sem** esse
campo. O Astro rejeita:

```
Invalid content reference: ... references "" in collection "linhas-pesquisa", but that entry does not exist
```

…e mesmo assim o `npm run build` daquela tentativa **encerrou com exit 0**. A linha foi removida à
mão antes da verificação autoritativa. **Sem essa leitura humana, o commit que fecha a fase 1 teria
ido com `lint`, `format`, `test` e `build` verdes e uma referência inválida no repositório.**

Note o contraste que o plano 020 registrou: `codigo` vazio numa disciplina é **omitido** do
frontmatter; o problema é específico do tipo `reference`.

### O que o teste tem de fazer — e uma armadilha que ele não pode cair

1. **Descobrir os arquivos**, não listá-los à mão: varra as pastas de coleção. Precedente de
   varredura de arquivos em teste neste projeto: `tests/lib/config.test.ts`, que usa
   `readdirSync`/`readFileSync` do `node:fs` para varrer `src/` — siga esse estilo.
2. **Ler o frontmatter com `gray-matter`** — o **mesmo** parser que o painel usa para gravar. Ler
   com outro parser testaria outra coisa.
3. **Validar contra os schemas exportados** de `src/content.config.ts`: `perfilSchema`,
   `linhasPesquisaSchema`, `projetosSchema`, `disciplinasSchema`, `publicacoesSchema` — os cinco
   já são exportados e já são importados assim por `tests/content/paridade-schema.test.ts`.
4. **⚠️ `safeParse` NÃO cobre a referência inválida.** `projetos.linha_relacionada` passa por
   `normalizeLinhaRelacionadaId` e por `reference()`, que apenas **transforma** o valor em
   `{ id, collection }` — quem verifica se a entrada existe é a content layer do Astro, em tempo de
   build, não o Zod. `linha_relacionada: ''` faz `safeParse` **passar**. Portanto o teste precisa
   de uma asserção **explícita** de existência: para cada projeto com `linha_relacionada`
   presente, o id normalizado tem de corresponder a um arquivo existente em
   `content/linhas-pesquisa/`, e string vazia é rejeitada com mensagem própria. **Este é o coração
   do plano** — um teste que só chame `safeParse` fecha o plano sem fechar a dívida.
5. **Mensagem no formato de F-09.** O PRD dá o gabarito: `content/publicacoes/x.md → campo 'ano':
   esperado número entre 1900 e 2100`. Toda falha deste teste tem de conter **o caminho do arquivo
   relativo à raiz** e **o caminho do campo**. Isso não é estética: o plano 028 vai demonstrar essa
   mensagem chegando ao ADMIN por notificação de build, e é ela que decide se F-09 está satisfeito.
   Agregue as falhas numa lista e compare com `[]`, como `paridade-schema.test.ts` já faz — uma
   asserção que morre no primeiro erro esconde os demais.

### `gray-matter` — declarar, não herdar por acidente

`gray-matter@4.0.3` **já está na árvore** (transitiva do TinaCMS). Este projeto já pagou o preço de
depender de transitiva: o `vite` era importado por `astro.config.mjs` sem estar declarado e
funcionava "por acidente do hoisting" (resolvido em 2026-09-03). Declare-o em `devDependencies`
**na versão exata que já está instalada**, para não mexer na árvore:

- confira antes com `npm ls gray-matter`;
- declare `"gray-matter": "4.0.3"` (versão exata, como as demais do projeto);
- depois de `npm install`, **confira o churn do lockfile**: nenhuma versão fixada de outro pacote
  pode mudar. Precedente da lição 10 da fase 0 — 5677 linhas de diff no lock que não mudavam
  versão nenhuma. Verifique, não suponha.

Se o `npm ls` mostrar mais de uma versão de `gray-matter` na árvore, **pare e reporte**.

### Dívida 7(a) — o `path` do Tina nunca foi comparado com a pasta do Zod

A revisão do plano 019 registrou: o teste de paridade compara o `name` da coleção, mas **nunca o
`path` do Tina contra a pasta que o `glob()` do Zod lê**. Trocar `path: 'content/linhas-pesquisa'`
por outra pasta passaria despercebido — divergência silenciosa da mesma família que a D-06
combate, e agora com uma consequência concreta: o painel gravaria numa pasta que o portão de
conteúdo deste plano nem varre.

Os dois lados, hoje:

| Coleção | `path` em `tina/config.ts` | `base:` do `glob()` em `src/content.config.ts` |
|---|---|---|
| `perfil` | `content/perfil` | `./content/perfil` (pattern `index.md`) |
| `linhas_pesquisa` | `content/linhas-pesquisa` | `./content/linhas-pesquisa` |
| `projetos` | `content/projetos` | `./content/projetos` |
| `disciplinas` | `content/disciplinas` | `./content/disciplinas` |
| `publicacoes` | `content/publicacoes` | `./content/publicacoes` |

**Como comparar, já que o `base:` não é introspectável em runtime:** `glob()` devolve um objeto
`Loader` que guarda o `base` em closure — `defineCollection` não o expõe. Extraia o valor **do
texto-fonte** de `src/content.config.ts` (o arquivo é lido com `readFileSync` e o `base:` casado
por regex), que é exatamente o que `tests/lib/config.test.ts` já faz para varrer `process.env`.
Normalize o `./` inicial antes de comparar. Se a extração por regex não achar as cinco coleções,
**falhe o teste** — extração silenciosamente vazia é rede de proteção falsa (foi a crítica que a
revisão do plano 015 fez à cobertura).

### Dívida 7(c) — a prova de falsificabilidade contra o artefato final

A prova de falsificabilidade do teste de paridade foi produzida com **11 testes**; o 12º foi
acrescentado depois e a prova nunca foi refeita contra o artefato final. Este plano acrescenta
mais testes ao mesmo arquivo — então **reproduza a prova do `compareFields` contra a suíte final**
(canário aninhado dentro de `aulas[]` ou dentro do grupo `en`, mostrando a falha e o retorno ao
verde). Custa dois comandos e fecha a dívida.

### Dívida 7(b) — deliberadamente NÃO resolvida aqui

A detecção de enum do lado Tina vem **depois** do ramo `campo.list` em `classifyTina`
(`tests/content/paridade-schema.test.ts:222-238`): um campo futuro com `list: true` **e**
`options: [...]` teria os valores de enum não comparados. **Não existe campo assim hoje**, e
mudá-lo agora seria alteração sem teste possível contra o schema real — o oposto do que este
projeto exige. Fica registrado como guarda para a **fase 3**, que é onde campo novo nasce. **Não
mexa em `classifyTina`.**

### Padrões da casa

- **Cabeçalho obrigatório de arquivo** (§10.1) e docstring em toda função nova (§10.2). Siga o
  cabeçalho de `tests/content/paridade-schema.test.ts`, que é o mais completo do projeto.
- **Teste novo tem de ser provado falsificável** (lição 9 da fase 0). Aqui são **três** canários
  distintos — ver passo 5.
- **Fixtures reais** (§11): o teste usa os arquivos verdadeiros de `content/`, não frontmatter
  sintético. Consequência aceita e que o cabeçalho do arquivo tem de registrar: a suíte passa a
  depender do conteúdo do repositório — é o ponto.
- **`git add` por caminho explícito.** `Status:` fica em `TODO`. Evidência é saída literal colada.
- Este plano **não muda schema**, então `npm run build` deve fechar verde sem depender de push.

## Passos

1. Ler `src/content.config.ts` (os cinco `defineCollection`, o `normalizeLinhaRelacionadaId` e sua
   docstring), `tests/content/paridade-schema.test.ts` inteiro e `tests/lib/config.test.ts` (o
   estilo de varredura de arquivos).
   → verify: você consegue explicar por que `safeParse` aceita `linha_relacionada: ''`.
2. Declarar `gray-matter` em `devDependencies` na versão exata já instalada.
   → verify: `npm ls gray-matter` colado (uma única instância); diff do `package-lock.json`
   conferido — nenhuma versão fixada de outro pacote alterada; `npm ci` não reescreve o lock.
3. Escrever `tests/content/conteudo-valido.test.ts`: varredura das cinco pastas, leitura com
   `gray-matter`, `safeParse` contra o schema correspondente e **verificação explícita de
   existência de `projetos.linha_relacionada`**, com mensagens no formato de F-09 agregadas numa
   lista.
   → verify: `npx vitest run tests/content/conteudo-valido.test.ts` verde sobre os 13 arquivos
   reais; cole a saída **e** o número de arquivos varridos (o teste deve afirmar que varreu > 0 em
   cada coleção — varredura vazia que "passa" é rede falsa).
4. Acrescentar a `tests/content/paridade-schema.test.ts` a comparação `path` (Tina) × `base:`
   (Zod), extraindo o `base:` do texto-fonte.
   → verify: `npx vitest run tests/content/paridade-schema.test.ts` verde, com as cinco coleções
   comparadas; cole a saída.
5. **Provar falsificabilidade — três canários, um de cada vez, cada um revertido antes do
   seguinte:**
   a. `linha_relacionada: ''` em `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`
      — reproduz o artefato real de 2026-09-10;
   b. um campo obrigatório removido de um arquivo de `content/publicacoes/` (ex.: `ano`);
   c. `path` de uma coleção alterado só em `tina/config.ts`.
   → verify: para cada um, a saída da falha **com a mensagem que nomeia arquivo e campo**, seguida
   do verde após a reversão. Ao final, `git status --short` limpo e
   `git diff -- content tina/config.ts` **vazio**, colados.
6. Reproduzir a prova de falsificabilidade do `compareFields` contra o artefato final (dívida 7c):
   canário aninhado dentro de `aulas[]` ou do grupo `en`.
   → verify: falha e verde colados, com o total de testes do arquivo declarado nas duas execuções.
7. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` (cobertura ≥ 80%,
   com o total de testes novo) e `npm run build` verdes, saídas coladas; a do `build` **lida**.
8. Confirmar que o portão vale no deploy sem tocar no script: `npm run build:pipeline` roda
   `vitest run tests/content`, que agora inclui o portão novo.
   → verify: cole o trecho da saída de `npm run build:pipeline` mostrando o arquivo novo entre os
   testes executados.

## Critérios de aceitação

- [x] `tests/content/conteudo-valido.test.ts` valida os **13 arquivos reais** de `content/` contra
      os cinco schemas Zod, descobrindo os arquivos por varredura
- [x] O teste **falha** com `linha_relacionada: ''` — a asserção de existência é explícita, não
      delegada ao `safeParse`
- [x] Toda mensagem de falha nomeia **o arquivo** (caminho relativo à raiz) **e o campo**,
      conforme F-09 e §8.2
- [x] O teste afirma que varreu ao menos um arquivo por coleção — varredura vazia reprova
- [x] `paridade-schema.test.ts` compara o `path` de cada coleção do Tina com o `base:` do `glob()`
      do Zod (dívida 7a), com extração que falha se não encontrar as cinco
- [x] **Três canários de falsificabilidade** colados, com falha e verde, e `git diff` provando que
      nenhum sobrou
- [x] Prova de falsificabilidade do `compareFields` reproduzida contra o artefato final
      (dívida 7c), com o total de testes declarado
- [x] `classifyTina` **não modificada** — a dívida 7(b) fica registrada para a fase 3, não
      resolvida às cegas
- [x] `gray-matter` declarado em `devDependencies` na versão exata; `npm ls gray-matter` com
      instância única; lockfile sem mudança de versão fixada de outro pacote
- [x] `content/**`, `src/content.config.ts` e `tina/config.ts` **inalterados** no estado final
- [x] Cabeçalho §10.1 e docstrings §10.2 no arquivo novo
- [x] `npm run lint`, `npm run format:check`, `npm run test:coverage` (≥ 80%) e `npm run build`
      verdes, com a saída do build lida
- [x] `npm run build:pipeline` executando o portão novo, com o trecho colado
- [x] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

> Executado pelo `implementer` em 2026-09-11. `Status` deliberadamente mantido em `TODO` — a
> promoção é do orquestrador, depois de verificação independente e revisão. Nenhum commit foi
> feito nesta sessão.

### Passo 1 — leitura

Lidos por completo: `src/content.config.ts`, `tests/content/paridade-schema.test.ts` e
`tests/lib/config.test.ts`.

**Por que `safeParse` aceita `linha_relacionada: ''`:** em `src/content.config.ts`,
`linha_relacionada` é `z.preprocess(normalizeLinhaRelacionadaId, reference('linhas-pesquisa')).optional()`.
`normalizeLinhaRelacionadaId('')` devolve `''` inalterada (é uma string, o `.replace()` não acha o
prefixo `content/linhas-pesquisa/` nem o sufixo `.md`, então a string vazia passa intacta). O
`reference()` do Astro (`astro/dist/content/runtime.js`, `createReference`) é uma `union` de 4
alternativas — número, string, `{id, collection}` e `{slug, collection}` — e uma string vazia casa
sintaticamente com a alternativa "string": o Zod só confirma que o valor tem o **formato** aceito
por uma referência, sem consultar o sistema de arquivos. Quem resolve a referência de fato — e
rejeitaria `''` — é a content layer do Astro (`getEntry()`), em tempo de build, fora do alcance do
`safeParse`. Por isso o teste novo verifica a existência do id normalizado explicitamente, contra o
conjunto de arquivos de `content/linhas-pesquisa/` obtido pela própria varredura.

### Passo 2 — `gray-matter` em `devDependencies`

`npm ls gray-matter` antes do `npm install` (uma única instância, transitiva):

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- @tinacms/cli@2.6.1
  `-- @tinacms/graphql@2.4.10
    `-- gray-matter@4.0.3
```

Após declarar `"gray-matter": "4.0.3"` em `devDependencies` e rodar `npm install`:

```
up to date, audited 1517 packages in 13s
329 packages are looking for funding
  run `npm fund` for details
11 vulnerabilities (8 moderate, 3 high)
```

`npm ls gray-matter` depois (instância única, deduped):

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tinacms/cli@2.6.1
| `-- @tinacms/graphql@2.4.10
|   `-- gray-matter@4.0.3 deduped
`-- gray-matter@4.0.3
```

Churn do lockfile (`git diff --stat -- package-lock.json` / `git diff -- package-lock.json`), uma
única linha, sem nenhuma versão fixada de outro pacote alterada:

```
 package-lock.json | 1 +
 1 file changed, 1 insertion(+)

+        "gray-matter": "4.0.3",
```

`npm ci` (reinstala a árvore inteira a partir do lock) não reescreveu o lockfile — MD5 de
`package-lock.json` idêntico antes e depois (`ba2c92d240995637c55965e1d01a08ca`), e
`git diff --stat -- package-lock.json` seguiu mostrando a mesma única linha depois do `npm ci`.

### Passo 3 — `tests/content/conteudo-valido.test.ts`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  19:18:04
   Duration  1.68s (transform 557ms, setup 0ms, import 1.23s, tests 20ms, environment 0ms)
```

Arquivos varridos por coleção (script avulso reproduzindo a mesma função `listMarkdownFiles` do
teste, contra `content/`):

```
perfil 1
linhas-pesquisa 2
projetos 2
disciplinas 2
publicacoes 6
```

Soma 13 — os 13 arquivos reais de `content/` (nenhum `.gitkeep` entrou, por não terminar em
`.md`).

### Passo 4 — `paridade-schema.test.ts`, dívida 7(a)

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  19:19:08
   Duration  818ms (transform 451ms, setup 0ms, import 686ms, tests 12ms, environment 0ms)
```

As cinco coleções comparadas (`describe('dívida 7(a): path do Tina × base: do glob() do Zod, por
coleção')`): 1 teste de extração + 5 testes de comparação `path` × `base:`, um por coleção
(`perfil`, `linhas-pesquisa`, `projetos`, `disciplinas`, `publicacoes`) — os 6 testes novos, mais os
12 já existentes, somam os 18 acima.

### Passo 5 — três canários de falsificabilidade

**(a) `linha_relacionada: ''` em `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`**
— reproduz o artefato real de 2026-09-10. Falha:

```
 ❯ tests/content/conteudo-valido.test.ts (2 tests | 1 failed) 22ms
     × todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 19ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md → campo 'linha_relacionada': referência vazia — remova o campo ou selecione uma linha de pesquisa existente",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
```

Revertido (`linha_relacionada: ''` removida). Verde:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  19:19:45
   Duration  834ms (transform 437ms, setup 0ms, import 692ms, tests 18ms, environment 0ms)
```

**(b) `ano` removido de `content/publicacoes/2024-exemplo-modos-quasinormais-de-campos-escalares-em-espacos-tempos-de-kerr.md`.** Falha:

```
 ❯ tests/content/conteudo-valido.test.ts (2 tests | 1 failed) 21ms
     × todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 19ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "content/publicacoes/2024-exemplo-modos-quasinormais-de-campos-escalares-em-espacos-tempos-de-kerr.md → campo 'ano': Invalid input: expected number, received undefined",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
```

Revertido (`ano: 2024` restaurado). Verde:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  19:20:12
   Duration  833ms (transform 434ms, setup 0ms, import 692ms, tests 19ms, environment 0ms)
```

**(c) `path` de `linhas_pesquisa` alterado só em `tina/config.ts`** (`content/linhas-pesquisa` →
`content/linhas-pesquisa-canario`). Falha:

```
 ❯ tests/content/paridade-schema.test.ts (18 tests | 1 failed) 14ms
     × coleção linhas-pesquisa: path do Tina bate com a pasta que o glob() do Zod lê 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção linhas-pesquisa: path do Tina bate com a pasta que o glob() do Zod lê
AssertionError: expected 'content/linhas-pesquisa-canario' to be 'content/linhas-pesquisa' // Object.is equality

Expected: "content/linhas-pesquisa"
Received: "content/linhas-pesquisa-canario"

 Test Files  1 failed (1)
      Tests  1 failed | 17 passed (18)
```

Revertido (`path: 'content/linhas-pesquisa'` restaurado). Verde:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  19:20:36
   Duration  852ms (transform 468ms, setup 0ms, import 713ms, tests 12ms, environment 0ms)
```

Ao final dos três canários, estado limpo:

```
$ git status --short content tina/config.ts
$ git diff -- content tina/config.ts
```

(ambos sem saída — nenhum arquivo pendente, nenhuma diferença).

### Passo 6 — dívida 7(c): prova de falsificabilidade do `compareFields` contra o artefato final

Canário aninhado dentro de `disciplinas.aulas[]`: `numero` alterado de `type: 'number'` para
`type: 'string'` só em `tina/config.ts`. Falha (18 testes no arquivo, 1 falhou):

```
 ❯ tests/content/paridade-schema.test.ts (18 tests | 1 failed) 15ms
     × coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "disciplinas.aulas[].numero: tipo diverge — Zod=\"number\", Tina=\"string\"",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 17 passed (18)
```

Revertido (`numero` de volta a `type: 'number'`). Verde (18 testes no arquivo, todos passando):

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  19:21:11
   Duration  834ms (transform 453ms, setup 0ms, import 693ms, tests 11ms, environment 0ms)
```

`git diff -- content tina/config.ts` vazio depois da reversão.

### Passo 7 — sequência de qualidade local

`npm run lint` (sem saída = sucesso, ESLint não imprime nada quando não há violação):

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


 Test Files  5 passed (5)
      Tests  115 passed (115)
   Start at  19:21:43
   Duration  985ms (transform 1.43s, setup 0ms, import 2.41s, tests 77ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )
================================================================================
```

115 = 107 (baseline da fase 1) + 2 (`conteudo-valido.test.ts`) + 6 (dívida 7a em
`paridade-schema.test.ts`). Cobertura segue 100%, acima do limiar de 80% imposto no
`vitest.config.ts` — os arquivos novos ficam fora do escopo medido (`coverage.include` só cobre
`src/lib/**`, `src/i18n/**` e `src/content.config.ts`), então não alteram o percentual.

`npm run build` (saída lida — `astro check`: **0 errors, 0 warnings, 0 hints**):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build
...
○  Tina build complete
...
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (18 files):
- 0 errors
- 0 warnings
- 0 hints
...
[build] output: "static"
[build] mode: "static"
[build] 1 page(s) built in 820ms
[build] Complete!
```

### Passo 8 — `npm run build:pipeline` executando o portão novo

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  3 passed (3)
      Tests  101 passed (101)
   Start at  19:23:04
   Duration  873ms (transform 1.29s, setup 0ms, import 2.15s, tests 53ms, environment 0ms)

Starting Tina build
...
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (18 files):
- 0 errors
- 0 warnings
- 0 hints
...
[build] Complete!
```

Trecho com o arquivo novo entre os testes executados (`npx vitest run tests/content
--reporter=verbose`, mesmo escopo do `build:pipeline`):

```
 ✓ tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > varreu ao menos um arquivo por coleção — varredura vazia não pode "passar" como válida 2ms
 ✓ tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 18ms
 ...
 Test Files  3 passed (3)
      Tests  101 passed (101)
```

### Estado final do working tree

```
$ git status --short
 M package-lock.json
 M package.json
 M tests/content/paridade-schema.test.ts
?? tests/content/conteudo-valido.test.ts
```

`content/**`, `src/content.config.ts` e `tina/config.ts` não aparecem — inalterados, conforme
escopo do plano. `classifyTina` não foi tocada (dívida 7b permanece registrada para a fase 3).

### Verificação independente — `triage-runner` (orquestrador, 2026-09-11)

Execução autoritativa do ciclo, despachada pelo orquestrador. **Não** é a saída do executor: os
cinco comandos foram rodados de novo, por outro agente, que não escreveu uma linha de código.

```
npm run lint           exit 0   eslint . — sem nenhum problema reportado
npm run format:check   exit 0   All matched files use Prettier code style!
npm run test:coverage  exit 0   Test Files  5 passed (5)
                                     Tests  115 passed (115)
                                Statements 100% (32/32)   Branches 100% (4/4)
                                Functions  100% (2/2)     Lines    100% (31/31)
npm run build          exit 0   astro check: Result (18 files): 0 errors / 0 warnings / 0 hints
npm run build:pipeline exit 0   vitest run tests/content:
                                Test Files  3 passed (3)
                                     Tests  101 passed (101)
                                astro check: 0 errors / 0 warnings / 0 hints
```

**A saída do `npm run build` foi lida por inteiro**, não só o exit code — é a exigência que este
projeto aprendeu a duras penas, porque o `astro check` já imprimiu `[ERROR] [content]` no corpo
**e ainda assim** encerrou com `0 errors` e exit 0. Nesta execução não há nenhuma linha `[ERROR]`
nem `[WARN]` no corpo: corpo e contagem concordam.

**Dois achados do `triage-runner`, resolvidos pelo orquestrador — nenhum é defeito deste plano:**

1. *A tabela de cobertura por arquivo vem vazia e mede só 32 statements.* **Deliberado e
   documentado:** `vitest.config.ts:15` restringe o `include` a `src/lib/**`, `src/i18n/**` e
   `src/content.config.ts`, conforme a §11 do PRD, com o comentário explicando que `src/lib/**`
   cru casava até `.gitkeep` e inflava o denominador. Pré-existente — a baseline de 107 testes
   relatava 100% do mesmo jeito.
2. *`NativeCommandError` do PowerShell em torno do `node.exe` no `npm run build`.* É o PowerShell
   5.1 embrulhando stderr de executável nativo em `ErrorRecord`; exit 0, e não aparece no
   `build:pipeline`. Ruído de ambiente conhecido, registrado no `CLAUDE.md` da casa.

**Correção de um número, para não se propagar:** o `triage-runner` reportou a quebra por arquivo
do `build:pipeline` como `paridade-schema 19` / `schemas 80`. **Está trocada.** O revisor apontou,
e o orquestrador conferiu rodando os três arquivos isoladamente:

```
tests/content/paridade-schema.test.ts    Tests  18 passed (18)
tests/content/schemas.test.ts            Tests  81 passed (81)
tests/content/conteudo-valido.test.ts    Tests   2 passed  (2)
```

18 + 81 + 2 = **101**, que é o total autoritativo. A soma sempre esteve certa; a quebra, não.

### Revisão de código — APROVADO (orquestrador, 2026-09-11)

O revisor **reproduziu em vez de aceitar**, que é a exigência desta casa depois de uma revisão
que aprovou quatro defeitos por acreditar na alegação. O que ele reproduziu por conta própria:

- **O canário (a) do passo 5**, com a mensagem saindo **literalmente igual** à colada acima;
- **dois canários que o plano não previa**: `linha_relacionada: content/linhas-pesquisa/nao-existe.md`,
  que exercita o **outro** ramo da asserção de existência (referência pendente, não vazia) e de
  quebra prova que a normalização de prefixo e sufixo funciona; e `linha_relacionada:` nulo, que
  cai no `safeParse`. **O ramo de referência pendente não tinha canário no plano** — passou a ter;
- **os totais por arquivo**, rodando cada um isoladamente (foi assim que a troca 19/80 apareceu);
- `npm ls gray-matter` (instância única, `4.0.3 deduped`) e o `git diff --numstat` do lockfile
  (1 linha inserida, 0 removidas, e o único `+` é `"gray-matter": "4.0.3",`);
- a formatação do arquivo novo, com `npx prettier ... | diff -`, devolvendo idêntico.

Ele confirmou também que o `git status --short` final é igual ao inicial e que
`git diff -- content tina/config.ts` está vazio — os canários dele não deixaram resíduo.

**Duas ressalvas que o revisor levantou e descartou, registradas porque são insumo futuro:**

1. **Valor não-textual em `linha_relacionada` escapa do portão.** Verificado empiricamente: com
   `linha_relacionada: 42` o teste **passa**, porque o `typeof bruto === 'string'` pula em
   silêncio. Descartada porque o campo é `reference` no Tina, que só grava string — o valor é
   inalcançável pelo caminho do produto, e o §2 do `CLAUDE.md` proíbe tratar cenário impossível.
   **Fica registrado para o plano 034.**
2. **Imprecisão de atribuição no cabeçalho do arquivo novo:** ele diz "Fecha a dívida 5 e a dívida
   7(c)", mas a 7(c) foi fechada em `paridade-schema.test.ts`, não nele. A 7(c) **foi** fechada
   por este plano; a imprecisão é de qual arquivo a fecha. Corrigir de passagem no próximo toque.

### Achado — a normalização de `linha_relacionada` está duplicada

`normalizeLinhaRelacionadaId` (`src/content.config.ts:247`) é `const` e **não é exportada**. Por
isso o teste novo re-implementa à mão as duas regexes:

```
src/content.config.ts:248-249   valor.replace(/^content\/linhas-pesquisa\//, '').replace(/\.md$/, '')
conteudo-valido.test.ts         bruto.replace(/^content\/linhas-pesquisa\//, '').replace(/\.md$/, '')
```

São idênticas hoje. É uma duplicação que pode divergir em silêncio — **a mesma família de defeito
que a D-06 combate**, e que este plano fecha em outro lugar (a dívida 7a, o `path` do Tina contra
o `base:` do Zod). Se alguém mudar a normalização real, o portão segue verde validando pela regra
velha.

**Não é defeito do executor e não era fechável aqui:** o plano proíbe editar
`src/content.config.ts`, e sem exportar a função não há como importá-la. O revisor considerou a
alternativa de inverter o mapeamento — o teste montar o conjunto de formas brutas aceitáveis a
partir dos arquivos varridos — e concluiu que só muda a duplicação de lugar.

**Correção é plano próprio, de dois passos:** exportar `normalizeLinhaRelacionadaId` e importá-la
no teste.

### Passo 9 (do orquestrador) — CI e build de deploy sobre o commit empurrado

Commit do trabalho: **`4343e42`**, empurrado para `main` junto com `5bbd1d1` e `8c540c4`.

**Os dois pipelines do ADR-0009, verdes no mesmo push** (`gh api repos/.../commits/4343e42/check-runs`):

```
Workers Builds: haroldo-page | app=cloudflare-workers-and-pages | completed/success
  .../builds/4b0d544e-427e-4052-99f5-914369627c57
qualidade | app=github-actions | completed/success
  https://github.com/researchgroups-ufma/haroldo-page/actions/runs/34654789999/job/103444709638
```

**Números do CI**, do log do run `34654789999`:

```
Run npm run test:coverage    Test Files  5 passed (5)
Run npm run test:coverage         Tests  115 passed (115)
Run npm run test:coverage    All files  |  100 |  100 |  100 |  100 |
Run npm run build:pipeline   Test Files  3 passed (3)
Run npm run build:pipeline        Tests  101 passed (101)
Run npm run build:pipeline   - 0 errors
Run npm run build:pipeline   1 page(s) built in 712ms
```

**E a prova que de fato importa — o portão rodando dentro do build que publica**, do log do build
`4b0d544e` na Cloudflare:

```
2026-09-11T22:38:11.369Z  Executing user build command: npm run build:pipeline
2026-09-11T22:38:16.338Z   ✓ tests/content/conteudo-valido.test.ts (2 tests) 27ms
2026-09-11T22:38:16.353Z   Test Files  3 passed (3)
2026-09-11T22:38:16.353Z        Tests  101 passed (101)
2026-09-11T22:39:31.428Z  - 0 errors
2026-09-11T22:39:34.563Z  22:39:34 [build] 1 page(s) built in 1.66s
2026-09-11T22:39:34.771Z  Executing user deploy command: npx wrangler deploy
2026-09-11T22:39:39.121Z  ✨ Success! Uploaded 2 files (100 already uploaded) (0.60 sec)
2026-09-11T22:39:40.684Z  Current Version ID: 6b5cec66-8d4e-403c-9a33-4c726d56532e
2026-09-11T22:39:40.948Z  ✨ Success! Build completed.
```

O arquivo novo aparece **nominalmente** no log do build de deploy. Não é inferência a partir do
número de testes: é o `conteudo-valido.test.ts` listado pelo Vitest dentro do runner da
Cloudflare, antes do `wrangler deploy`. **O portão vale no deploy**, que era o objetivo do plano,
e a versão `6b5cec66` sucede a `4b948808` do plano 026.
