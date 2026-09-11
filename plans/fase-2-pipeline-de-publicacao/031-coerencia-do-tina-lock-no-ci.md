# Plano 031 — `tina/tina-lock.json` desatualizado passa a reprovar no CI

**Status:** DONE
**RFs cobertos:** RNF-09, R-02, D-06 (mesma família); **dívida 2** da fase 1
**Depende de:** nenhum plano de código. Pode rodar **em paralelo** com **030** e **033** — escopos
disjuntos, e este não toca `package.json`. **Não** rode em paralelo com 024, 032 ou 034: os quatro
editam `README.md`, em seções diferentes, e agentes simultâneos compartilham o mesmo working tree.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um `tina/tina-lock.json` desatualizado em relação a `tina/config.ts` **reprova a suíte** — em vez
de seguir para `main` em silêncio e só aparecer como "No Tina config was found on main" no painel
do TinaCloud, dias depois, para quem não fez a mudança.

## Arquivos afetados

- `tests/content/tina-lock-coerente.test.ts` — **novo**
- `README.md` — a seção "Painel de edição" ganha uma frase dizendo que agora existe verificação
  automática do lock (o texto atual descreve o passo manual e continua correto; só a garantia
  muda)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Nunca rode `tinacms dev`** (servidor de longa duração) e **não regenere o lock**: se o teste
> novo reprovar contra o lock que está em `main`, isso é **achado a reportar** — significa que o
> lock versionado já está desatualizado, e a regeneração é do orquestrador, não deste plano.
> Também **não** edite `tina/config.ts`, `package.json` nem `.github/workflows/ci.yml`.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 + TinaCMS 3.12.1 / `@tinacms/cli` 2.6.1. Windows 11 /
PowerShell, Node 24.16.0, Vitest 4.1.11.

**A dívida, em uma frase:** `tina/tina-lock.json` é **versionado** — é o único artefato do Tina que
fica no repositório, porque o TinaCloud precisa dele em `main` para indexar a branch — e ele é
regenerado **apenas por `tinacms dev`**. `tinacms build --skip-cloud-checks` **não** o reescreve
(descoberto no plano 018, reconfirmado no 022). Ou seja: quem mudar o schema tem de subir o dev
server uma vez e commitar o lock, e **nada verifica se ele fez isso**.

O README já documenta o passo manual (seção "Painel de edição"): *"quem mudar o schema em
`tina/config.ts` precisa subir `npx tinacms dev` uma vez … e commitar o `tina/tina-lock.json`
atualizado junto com a mudança de schema."* Documentação não é portão — este plano vira o portão.

**Por que isso é da fase 2 e não ficou na 1:** a partir do plano 025 o `main` publica sozinho. Um
lock defasado não quebra o build nem o site (o site não depende do TinaCloud em runtime, §7.1,
F-03) — **quebra o `/admin`**, que é a ferramenta do professor. É exatamente a classe de falha
silenciosa que passa por todo o portão de qualidade, como a dívida 4.

### Como a verificação é possível sem rodar o `tinacms dev`

O lock é um JSON de linha única com, entre outras coisas, `schema.collections` — a **mesma árvore
declarativa** que `tina/config.ts` exporta — e uma seção `graphql`. Portanto:

- **Lado config:** importe `tina/config.ts` como o teste de paridade já faz. Ele importa `tinacms`,
  cujo bundle não carrega sob Vitest (interop CJS/ESM de `color-string`), então **copie o mesmo
  `vi.mock`** que `tests/content/paridade-schema.test.ts:78-82` usa:

  ```ts
  vi.mock('tinacms', () => ({ defineConfig: (config: unknown) => config }));
  const { default: tinaConfig } = await import('../../tina/config');
  ```

  O `defineConfig` real só valida e devolve o objeto; o mock preserva esse comportamento.

- **Lado lock:** `JSON.parse(readFileSync('tina/tina-lock.json', 'utf-8'))` e caminhe por
  `schema.collections`.

- **Compare o que é declarativo e serializável**, recursivamente: `name`, `path`, `format`,
  `type`, `required`, `list`, `options` e a árvore de `fields`. Monte, dos dois lados, o conjunto
  de caminhos qualificados (`disciplinas.scripts[].linguagem`, e assim por diante) e compare
  conjuntos, como `compareObjects` do teste de paridade já faz.

**⚠️ O que NÃO comparar:** tudo que é função ou apresentação — `ui`, `itemProps`, `defaultItem`,
`description`, `label`. Função não sobrevive à serialização JSON e a comparação daria falso
positivo permanente. Se você precisar ignorar campo por campo, a lista de chaves ignoradas fica
**explícita e comentada** no arquivo, não escondida num `try/catch`.

**Se a estrutura do lock não for a esperada** — se `schema.collections` não existir ou não bater
com a forma acima —, **pare e reporte** com o recorte real do JSON. Não invente um caminho
alternativo, e não caia em contagem de ocorrências de `"name":"x"` como aproximação: isso
detectaria adição de campo, mas não renomeação nem mudança de `required`, e daria uma sensação de
proteção que não existe.

**Referência do que uma mudança de schema produz no lock**, medida no plano 022 (Evidência do
orquestrador): acrescentar `scripts[]` a `disciplinas` acrescentou os nomes `scripts`, `linguagem`
e `aula`, três tipos GraphQL (`DisciplinasScripts`, `DisciplinasScriptsFilter`,
`DisciplinasScriptsMutation`), removeu zero, e o arquivo passou de 117.676 para 123.004 bytes.

### O que este plano NÃO faz

- ⛔ **Não regenera o lock**, não roda `tinacms dev`, não muda schema.
- ⛔ **Não acrescenta passo ao `ci.yml`.** O teste roda no `npm run test:coverage` que o CI já
  executa, e no `vitest run tests/content` que o `build:pipeline` (plano 024) já executa. Nenhum
  arquivo de workflow precisa mudar — confirme isso na Evidência em vez de presumir.
- ⛔ **Não tenta validar a seção `graphql`** do lock contra o SDL. Comparar a árvore declarativa
  basta para detectar lock defasado, e o SDL é derivado dela.
- ⛔ **Não mexe em `tests/content/paridade-schema.test.ts`** — o plano 030 está nele.

### Padrões da casa

- Cabeçalho §10.1 e docstrings §10.2. Use `tests/content/paridade-schema.test.ts` como modelo,
  inclusive na seção "Notas" do cabeçalho, onde a limitação assumida tem de ficar escrita: o teste
  compara a **forma declarativa**, não a validade do GraphQL gerado.
- **Teste novo tem de ser provado falsificável** — nos **dois sentidos** (campo só no config,
  campo só no lock).
- `git add` por caminho explícito; `Status:` fica em `TODO`; Evidência é saída literal colada.
- Este plano **não muda schema**, então `npm run build` fecha verde sem depender de push. Se
  aparecer `ERR_CLOUD_CHECK_FAILED`, é achado.

## Passos

1. Ler `tests/content/paridade-schema.test.ts` (o `vi.mock`, `compareObjects` e o cabeçalho), a
   seção "Painel de edição" do `README.md` e o recorte de `schema.collections` do
   `tina/tina-lock.json`.
   → verify: descreva na Evidência a estrutura real encontrada no lock — nome dos campos do
   primeiro nível de uma coleção —, colada do arquivo.
2. Escrever `tests/content/tina-lock-coerente.test.ts`: conjunto de caminhos qualificados dos dois
   lados, comparação de conjuntos e, para os caminhos em comum, comparação de `type`, `required`,
   `list` e `options`. Lista de chaves ignoradas explícita e comentada.
   → verify: `npx vitest run tests/content/tina-lock-coerente.test.ts` verde contra o lock em
   `main`; cole a saída **e** o número de caminhos comparados (se for zero ou suspeito de baixo,
   o teste tem de falhar por si — varredura vazia que passa é rede falsa).
3. Provar falsificabilidade nos dois sentidos, um canário de cada vez, revertido antes do
   seguinte:
   a. campo novo só em `tina/config.ts` → o teste falha nomeando o caminho ausente no lock;
   b. um campo removido do config, presente no lock → o teste falha no sentido oposto.
   → verify: as quatro execuções coladas (falha e verde de cada); ao final,
   `git diff -- tina/config.ts tina/tina-lock.json` **vazio**, colado.
4. Acrescentar ao `README.md`, na seção "Painel de edição", a frase de que a coerência do lock
   agora é verificada pela suíte, nomeando o arquivo de teste. **Não** reescreva o parágrafo do
   passo manual — ele continua sendo o procedimento correto.
   → verify: releia a seção inteira e confirme que nenhuma afirmação ficou falsa.
5. Confirmar que o teste roda nos dois lugares sem alterar workflow ou script.
   → verify: cole o trecho de `npm run test:coverage` e o de `npm run build:pipeline` mostrando o
   arquivo novo entre os testes executados.
6. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` (≥ 80%, com o total
   de testes novo) e `npm run build` verdes, saídas coladas; a do `build` **lida**.

## Critérios de aceitação

- [x] `tests/content/tina-lock-coerente.test.ts` compara a árvore declarativa de `tina/config.ts`
      com `schema.collections` de `tina/tina-lock.json`, por caminhos qualificados
- [x] `type`, `required`, `list` e `options` comparados nos caminhos em comum
- [x] Chaves ignoradas (`ui`, `label`, `description`, funções) **listadas explicitamente e
      comentadas** no arquivo
- [x] Número de caminhos comparados registrado; varredura vazia reprova
- [x] **Falsificabilidade provada nos dois sentidos**, com as quatro saídas coladas e `git diff`
      vazio ao final
- [x] O teste roda no `npm run test:coverage` (CI) **e** no `vitest run tests/content` do
      `build:pipeline`, sem alteração de workflow ou de script — comprovado por trecho de saída
- [x] `tina/config.ts`, `tina/tina-lock.json`, `package.json` e `.github/workflows/ci.yml`
      **inalterados**
- [x] `README.md` com a frase nova na seção "Painel de edição", sem invalidar o procedimento
      manual descrito ali
- [x] Cabeçalho §10.1 e docstrings §10.2, com a limitação assumida escrita nas "Notas"
- [x] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes,
      com a saída do build lida
- [x] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

Preenchida pelo executor em 2026-09-11. `Status:` deliberadamente deixado em `TODO` e nenhum
checkbox de "Critérios de aceitação" foi marcado — promoção é do orquestrador, depois da
verificação independente. O último critério ("CI do GitHub Actions com `conclusion: success`")
não foi verificado por este executor: nada foi empurrado para `origin` nesta sessão.

### Passo 1 — estrutura real do lock

Recorte real de `tina/tina-lock.json` (via leitura + `json.load`, chaves de topo e de uma
coleção qualquer):

```
top keys: ['schema', 'lookup', 'graphql']
schema keys: ['version', 'meta', 'collections', 'config']
num collections: 5
collection names: ['perfil', 'linhas_pesquisa', 'projetos', 'disciplinas', 'publicacoes']
first collection top-level keys: ['name', 'label', 'path', 'format', 'fields', 'namespace']
{
  "name": "perfil",
  "label": "Perfil",
  "path": "content/perfil",
  "format": "md",
  "namespace": [
    "perfil"
  ]
}
num fields in first collection: 13
first field keys sample: ['type', 'name', 'label', 'required', 'namespace', 'searchable', 'uid']
{
  "type": "string",
  "name": "nome",
  "label": "Nome",
  "required": true,
  "namespace": [
    "perfil",
    "nome"
  ],
  "searchable": true,
  "uid": false
}
```

Campo-objeto com `list: true` traz `fields` (array de filhos), igual ao formato de
`tina/config.ts`; campo `reference` traz `collections` (alvo) em vez de `fields`. Confirmado nos
recortes de `disciplinas.scripts` (lista de objeto) e `projetos.linha_relacionada` (referência)
lidos durante a implementação — estrutura compatível com a esperada pelo plano, sem surpresas
que exigissem parar e reportar.

### Passo 2 — teste novo, verde contra o lock em `main`

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > as cinco coleções existem nos dois lados, com os mesmos nomes 2ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção perfil: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção linhas_pesquisa: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção projetos: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção disciplinas: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção publicacoes: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list e options 1ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:01:21
   Duration  201ms (transform 53ms, setup 0ms, import 76ms, tests 4ms, environment 0ms)
```

**Número de caminhos comparados (`caminhosComuns`): 109.** Obtido rodando a mesma suíte com um
`console.log(caminhosComuns)` temporário inserido só para esta medição e removido antes de
qualquer commit (não sobra no arquivo final):

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose --no-coverage
...
DEBUG caminhosComuns 109
```

O lock em `main` **não estava defasado** — o teste passou de primeira contra o artefato
existente. Não houve achado a reportar neste passo.

### Passo 3 — falsificabilidade nos dois sentidos

**3a. Campo novo só em `tina/config.ts`** — inserido `canarioTeste031` (string, sem `required`)
em `perfil.fields`, logo após `nome`:

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 ✓ ... (6 testes de nomes/path/format continuam verdes)
 × tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list e options 6ms
   → expected [ Array(1) ] to deeply equal []

AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "perfil.canarioTeste031: existe só no config",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
```

Revertido (`Edit` removendo o bloco inserido). Verde de novo:

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:02:41
```

**3b. Campo removido de `tina/config.ts`, presente no lock** — removido o bloco do campo `cargo`
de `perfil.fields` (existe no lock):

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 ✓ ... (6 testes de nomes/path/format continuam verdes)
 × tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list e options 5ms
   → expected [ 'perfil.cargo: existe só no lock' ] to deeply equal []

AssertionError: expected [ 'perfil.cargo: existe só no lock' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "perfil.cargo: existe só no lock",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
```

Revertido (bloco de `cargo` recolocado na posição original). Verde de novo:

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:03:04
```

Estado final, `git diff` vazio nos dois arquivos:

```
$ git diff -- tina/config.ts tina/tina-lock.json | cat
$ git status --porcelain -- tina/config.ts tina/tina-lock.json
$
```

(as duas saídas vieram vazias — sem diferença, sem entradas no status.)

### Passo 4 — README.md

Frase acrescentada ao final do parágrafo do `tina/tina-lock.json` (seção "Painel de edição"),
sem reescrever o procedimento manual:

> A coerência entre os dois arquivos é verificada automaticamente por
> `tests/content/tina-lock-coerente.test.ts`, que reprova a suíte se o lock ficar defasado.

Reli a seção inteira ("Painel de edição") do início ao fim depois da edição: nenhuma afirmação
ficou falsa — o procedimento manual (`npx tinacms dev` uma vez, commitar o lock) continua sendo
o jeito de gerar o lock; a frase nova só acrescenta que agora existe verificação automática de
que ele foi feito corretamente.

### Passo 5 — o teste roda nos dois lugares sem tocar workflow/script

`package.json` (não alterado — só lido):

```
"build:pipeline": "vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build",
...
"test:coverage": "vitest run --coverage",
```

`vitest run tests/content` (o que `build:pipeline` executa) já pega o arquivo novo:

```
$ npx vitest run tests/content --reporter=verbose
 ✓ tests/content/tina-lock-coerente.test.ts > ... > as cinco coleções existem nos dois lados, com os mesmos nomes 2ms
 ✓ tests/content/tina-lock-coerente.test.ts > ... > coleção perfil: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > ... > coleção linhas_pesquisa: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > ... > coleção projetos: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > ... > coleção disciplinas: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > ... > coleção publicacoes: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > ... > árvore de campos declarativos bate por caminho qualificado — type, required, list e options 1ms
 Test Files  4 passed (4)
      Tests  108 passed (108)
   Duration  900ms (transform 1.44s, setup 0ms, import 2.31s, tests 59ms, environment 0ms)
```

`npm run test:coverage` (o que o CI executa) também pega o arquivo novo — ver saída completa no
Passo 6. Nenhum arquivo de `.github/workflows/ci.yml` ou `package.json` foi tocado (`git diff`
vazio para os dois, verificado no Passo 3).

### Passo 6 — sequência de qualidade local

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

(sem saída — sem erros)
```

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  20:03:36
   Duration  1.04s (transform 1.57s, setup 0ms, import 2.69s, tests 86ms, environment 1ms)

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

Suíte antes deste plano: 115 testes, 5 arquivos. Depois: **122 testes, 6 arquivos** (+7 testes,
+1 arquivo — bate com `tina-lock-coerente.test.ts`). Cobertura seguiu em 100%.

```
$ npm run build

> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build
...
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html
│
20:04:23 [content] Syncing content
20:04:23 [content] Synced content
20:04:23 [types] Generated 421ms
20:04:23 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (19 files):
- 0 errors
- 0 warnings
- 0 hints

20:04:28 [content] Syncing content
20:04:28 [content] Synced content
20:04:28 [types] Generated 415ms
20:04:28 [build] output: "static"
20:04:28 [build] mode: "static"
20:04:28 [build] directory: S:\Projetos\academic_page\haroldo\dist\
20:04:28 [build] Collecting build info...
20:04:28 [build] ✓ Completed in 449ms.
20:04:28 [build] Building static entrypoints...
[vite] ✓ built in 183ms
[vite] ✓ built in 44ms
20:04:28 [build] Rearranging server assets...

generating static routes
20:04:28   ├─ /index.html (+8ms)
20:04:28 ✓ Completed in 18ms.
20:04:28 [build] ✓ Completed in 273ms.
20:04:28 [build] 1 page(s) built in 730ms
20:04:28 [build] Complete!
```

Build lido de ponta a ponta: sem `ERR_CLOUD_CHECK_FAILED`, `astro check` com 0 erros/0
avisos/0 hints, `astro build` completou 1 página em 730ms. Consistente com o plano não mudar
schema.

### Estado final do working tree

```
$ git status --porcelain
 M README.md
?? tests/content/tina-lock-coerente.test.ts
```

Só os dois arquivos previstos em "Arquivos afetados" foram tocados.

## Correção pós-revisão (REPROVADO → dois defeitos, ambos reproduzidos pelo revisor)

Aplicadas em 2026-09-11, mesma sessão, sem tocar em nada fora de
`tests/content/tina-lock-coerente.test.ts`. `Status:` continua `TODO`; nenhum checkbox foi
marcado; nada foi commitado.

**Defeito 1 — `collections` (alvo de `type: 'reference'`) fora da assinatura comparada.**
Corrigido: `FieldSignature`/`extractSignature`/`compareSignatures` passaram a incluir
`collections`, comparado **na ordem declarada** (mesma forma de `options`), com mensagem
`<caminho>: collections divergem — config=[...], lock=[...]`. As Notas do cabeçalho foram
atualizadas: a linha que dizia "`collections` ... não avaliado" virou um parágrafo descrevendo
que agora é comparado, com a referência ao achado da revisão.

**Defeito 2 — `options` comparado como conjunto (`.sort()`), sem registro da fraqueza.**
Corrigido: removido o `.sort()` de `extractSignature`; `options` (e o novo `collections`) agora
comparam a ordem declarada. Comentário acrescentado na própria definição de `FieldSignature`
explicando por que a ordem importa (é a ordem do select no painel) e citando o achado da
revisão — não fica mais escondido.

Depois das duas correções, o teste seguiu **verde contra o lock em `main`** (nenhuma das duas
correções quebrou nada inesperado):

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > as cinco coleções existem nos dois lados, com os mesmos nomes 1ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção perfil: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção linhas_pesquisa: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção projetos: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção disciplinas: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção publicacoes: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list, options e collections 1ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:17:43
   Duration  191ms (transform 49ms, setup 0ms, import 69ms, tests 4ms, environment 0ms)
```

**Número de caminhos comparados: continua 109** (as duas correções acrescentam atributos a
caminhos que já existiam — `projetos.linha_relacionada` e `disciplinas.status` já contavam no
total — não criam caminho novo). Medido com o mesmo `console.log` temporário do Passo 2,
removido antes de qualquer commit:

```
DEBUG caminhosComuns 109
```

### Canário novo 1 (defeito 1) — alvo da referência trocado

`tina/config.ts:451`, `linha_relacionada.collections`: `['linhas_pesquisa']` →
`['publicacoes']`. Lock intocado.

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 ✓ ... (6 testes de nomes/path/format continuam verdes)
 × tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list, options e collections 5ms
   → expected [ Array(1) ] to deeply equal []

AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "projetos.linha_relacionada: collections divergem — config=[publicacoes], lock=[linhas_pesquisa]",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
```

Revertido (`collections: ['linhas_pesquisa']` restaurado). Verde de novo:

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:18:27
```

### Canário novo 2 (defeito 2) — `options` reordenado, sem mudar valores

`tina/config.ts:526`, `disciplinas.status.options`: `['atual', 'anterior']` →
`['anterior', 'atual']`. Mesmos dois valores, ordem trocada.

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 ✓ ... (6 testes de nomes/path/format continuam verdes)
 × tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list, options e collections 5ms
   → expected [ Array(1) ] to deeply equal []

AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "disciplinas.status: options divergem — config=[anterior|atual], lock=[atual|anterior]",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
```

Revertido (`options: ['atual', 'anterior']` restaurado). Verde de novo:

```
$ npx vitest run tests/content/tina-lock-coerente.test.ts --reporter=verbose

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:18:52
```

Estado final, `git diff` e `git status --porcelain` vazios para os dois arquivos protegidos:

```
$ git diff -- tina/config.ts tina/tina-lock.json | cat
$ git status --porcelain -- tina/config.ts tina/tina-lock.json
$
```

### Sequência de qualidade local, depois das correções

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

(sem saída — sem erros)
```

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  20:19:10
   Duration  934ms (transform 1.44s, setup 0ms, import 2.44s, tests 78ms, environment 0ms)

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

**Total de testes do arquivo: continua 7** (nenhum `it` novo — as duas correções ampliam a
mesma asserção já existente, não pedem casos novos). **Total da suíte: continua 122 testes, 6
arquivos**, cobertura 100% — idêntico ao número reportado antes da correção.

### Frase do README revisitada

A frase acrescentada no Passo 4 — "A coerência entre os dois arquivos é verificada
automaticamente por `tests/content/tina-lock-coerente.test.ts`, que reprova a suíte se o lock
ficar defasado." — foi conferida de novo depois das duas correções e **continua verdadeira como
está**: com `collections` comparado e `options` comparado em ordem, as duas classes de
defasagem que escapavam antes agora reprovam. Não foi reescrita.

### O que não quebrou

Nenhuma das duas correções quebrou um teste existente ou baixou a cobertura: `lint`,
`format:check`, `test:coverage` (122/122) e a comparação contra o lock em `main` seguiram
verdes sem qualquer ajuste adicional — como o orquestrador antecipou, o lock já guardava
`collections` e `options` na mesma ordem e nos mesmos valores do config.

### Não verificado nesta sessão

- **CI do GitHub Actions com `conclusion: success`**: nada foi empurrado para `origin` — este
  critério depende de push, que não é deste executor.

### Verificação independente — `triage-runner`, ciclo 2 (orquestrador, 2026-09-11)

Execução autoritativa **depois** da correção de revisão — retestar depois, nunca antes. Cinco
comandos, todos **exit code 0**:

```
npm run lint           exit 0   eslint . — sem output
npm run format:check   exit 0   All matched files use Prettier code style!
npm run test:coverage  exit 0   Test Files  6 passed (6)
                                     Tests  122 passed (122)
                                Statements 100% (32/32)   Branches 100% (4/4)
                                Functions  100% (2/2)     Lines    100% (31/31)
npm run build          exit 0   astro check: Result (19 files): 0 errors / 0 warnings / 0 hints
npm run build:pipeline exit 0   vitest run tests/content:
                                Test Files  4 passed (4)
                                     Tests  108 passed (108)
```

**A saída do `npm run build` foi lida por inteiro**, com `grep` explícito: **zero** ocorrências de
`[ERROR]`, de `[WARN]` e de `ERR_CLOUD_CHECK_FAILED`. Exit 0 não basta neste projeto — o
`astro check` já imprimiu `[ERROR] [content]` no corpo e mesmo assim encerrou com `0 errors`.

**Quebra por arquivo em `tests/content`**, contada programaticamente sobre `--reporter=verbose`
(agrupando as linhas de resultado por caminho de arquivo, não por leitura visual):

```
tina-lock-coerente.test.ts     7
paridade-schema.test.ts       18
conteudo-valido.test.ts        2
schemas.test.ts               81
                           -----
                             108
```

A contagem do arquivo deste plano **não mudou** com a correção (7 antes e depois) — o esperado,
já que as correções ampliam os atributos comparados em caminhos que já existiam, sem criar teste
novo. Suíte: **115 → 122** testes, de 5 para 6 arquivos.

**Nota sobre a tabela de cobertura vazia**, para ninguém reinvestigar: o reporter `text` usa
`skipFull` por padrão e **omite da tabela todo arquivo a 100%**; somado ao `include` restrito do
`vitest.config.ts:15` (`src/lib/**`, `src/i18n/**`, `src/content.config.ts`, deliberado pela §11),
a tabela vazia é a saída esperada de um plano que só acrescenta teste.

### Revisão de código — dois ciclos

**Ciclo 1: REPROVADO**, com dois defeitos, ambos **reproduzidos** pelo revisor em vez de alegados.
Nenhum dos dois era desvio do executor: o plano listou os atributos a comparar (`type`,
`required`, `list`, `options`) e ele seguiu à risca, documentando as exclusões. Eram **limites do
plano**. A decisão do orquestrador foi fechá-los aqui em vez de empurrar para o 034 — um portão
com furo conhecido na função central dele é pior do que um portão que demora mais um ciclo.

**Defeito 1 — `collections` ficava fora da assinatura comparada.** O alvo de um campo
`type: 'reference'` podia divergir do lock sem reprovar. Reprodução que provou, com o lock
intocado:

```
$ # tina/config.ts:451  collections: ['linhas_pesquisa'] -> ['publicacoes']
$ npx vitest run tests/content/tina-lock-coerente.test.ts
 Test Files  1 passed (1)
      Tests  7 passed (7)
```

Passava verde. É a única classe de defasagem estrutural que o teste existe para pegar e não
pegava, e caía justamente em `projetos.linha_relacionada` — o campo que o `/admin` usa para
resolver referência, e o mesmo que o plano 030 teve de tratar à parte.

**Defeito 2 — `options` era comparado sem ordem.** Um `.sort()` normalizava os dois lados antes de
comparar, então só o **conjunto** de valores era verificado: alterar um valor falhava, mas
**reordenar passava**. A ordem de `options` é a ordem do select que o professor vê no painel, e o
lock a preserva. Pior que o furo: o enfraquecimento não estava comentado na linha nem nas Notas —
quem lesse o arquivo não tinha como saber que a comparação era mais fraca do que parecia. Este
defeito **ninguém tinha pedido para procurar**; apareceu porque o revisor exercitou o caso.

**Ciclo 2: APROVADO.** O revisor reproduziu os dois canários que antes passavam e confirmou que
agora falham:

```
"projetos.linha_relacionada: collections divergem — config=[publicacoes], lock=[linhas_pesquisa]"
 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
```

```
"disciplinas.status: options divergem — config=[anterior|atual], lock=[atual|anterior]"
 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
```

O segundo é o que mais importa: **mesmos valores, só reordenados**.

E confirmou que a correção não enfraqueceu o que já funcionava, com mais dois canários:

```
"perfil.cargo: required diverge — config=opcional, lock=obrigatório"
"perfil.canarioRevisao031: existe só no config"
```

O canário de `required` importa por um motivo que vale registrar: a Evidência do executor provava
os dois sentidos de **conjunto** — caminho a mais e caminho a menos —, que uma aproximação por
contagem de ocorrências também passaria. A comparação de **atributo** nos caminhos em comum não
tinha prova nenhuma até o revisor produzir uma.

Ele conferiu ainda, de forma independente, que o lock tem **109** caminhos (script próprio em
`node`, sem tocar no arquivo), que restou `.sort()` apenas nas linhas 233-234 — a comparação do
**conjunto de nomes de coleção**, onde ordem não é significativa, e que é legítima —, e que o
cabeçalho não ficou contraditório: as Notas agora dizem que `collections` **é comparado**, e a
lista de chaves ignoradas cobre só as que de fato são.

**Duas ressalvas que o revisor levantou e descartou:** `options` em forma de objeto
(`{value,label}`) cairia em `[object Object]` na serialização — mas as cinco declarações reais são
arrays de string, e tratar forma inexistente é o error handling especulativo que o §2 do
`CLAUDE.md` proíbe; e divergência apenas de `label`/`description` não reprova — exclusão explícita
do próprio plano, que não produz a falha que a frase do README descreve.

### Passo 7 (do orquestrador) — CI e build de deploy sobre o commit empurrado

Commit do trabalho: **`1de5d1d`**.

**Os dois pipelines do ADR-0009, verdes no mesmo push:**

```
Workers Builds: haroldo-page | completed/success
  .../builds/b6da5235-67ab-46c5-ad9d-bf05581e5a29
qualidade | completed/success
  https://github.com/researchgroups-ufma/haroldo-page/actions/runs/34658265557/job/103455225156
```

**Números do CI**, do log do run `34658265557`:

```
Run npm run test:coverage    Test Files  6 passed (6)
Run npm run test:coverage         Tests  122 passed (122)
Run npm run test:coverage    All files  |  100 |  100 |  100 |  100 |
Run npm run build:pipeline   Test Files  4 passed (4)
Run npm run build:pipeline        Tests  108 passed (108)
```

**O portão rodando dentro do build que publica**, do log do build `b6da5235` na Cloudflare:

```
2026-09-11T23:31:01.494Z  Executing user build command: npm run build:pipeline
2026-09-11T23:31:06.871Z   ✓ tests/content/tina-lock-coerente.test.ts (7 tests) 9ms
2026-09-11T23:31:07.669Z   Test Files  4 passed (4)
2026-09-11T23:31:07.673Z        Tests  108 passed (108)
2026-09-11T23:32:29.750Z  Executing user deploy command: npx wrangler deploy
2026-09-11T23:32:35.946Z  Current Version ID: 043f69f3-3a60-44c2-b610-b0576602792c
2026-09-11T23:32:36.210Z  ✨ Success! Build completed.
```

O arquivo aparece **nominalmente**, com os 7 testes, antes do `wrangler deploy` — não é inferência
a partir do total. Versão `043f69f3` publicada, sucedendo a `6b5cec66` do plano 030.

**Nenhuma alteração de workflow ou de script foi necessária**, e isso está comprovado e não
presumido: `package.json` e `.github/workflows/ci.yml` têm diff vazio, e mesmo assim o teste novo
roda nos dois lugares — porque o `vitest.config.ts` já casa `tests/**/*.test.ts` e o arquivo nasceu
dentro de `tests/content/`.

### O lock em `main` já estava coerente

O teste passou de primeira contra o lock versionado, **sem achado**. Os 123.004 bytes conferem com
o que o plano 022 mediu depois de acrescentar `scripts[]`, então ninguém mexeu em schema sem
regenerar desde então. O portão nasce verde, que é o estado certo para um portão nascer — se
tivesse nascido vermelho, a regeneração seria decisão do orquestrador, e o plano proíbe
explicitamente o executor de regenerar o lock por conta própria.
