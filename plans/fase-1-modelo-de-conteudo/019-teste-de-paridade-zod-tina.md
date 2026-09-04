# Plano 019 — Teste de paridade entre os schemas Zod e Tina (D-06)

**Status:** DONE
**RFs cobertos:** fase 1, item "Teste de paridade de schema passando"; D-06; F-09; RNF-09
**Depende de:** planos 016, 017 e 018
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um teste automatizado falha quando `src/content.config.ts` e `tina/config.ts` divergem — campo
que existe num e não no outro, obrigatoriedade diferente, enum com valores diferentes.

## Arquivos afetados

- `tests/content/paridade-schema.test.ts` — criar
- `src/content.config.ts` e `tina/config.ts` — **apenas** para corrigir divergências que o teste
  revelar
- `vitest.config.ts` — se a cobertura precisar alcançar os novos arquivos

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### Por que este teste existe — leia antes de decidir como implementá-lo

A **D-06** do PRD:

> Zod (Astro) é o portão de validação; Tina é a interface de entrada; paridade garantida por
> teste. Alternativa rejeitada: confiar apenas no schema do Tina. Motivo: **dois schemas
> descrevem o mesmo conteúdo; divergência silenciosa produz build quebrado que o professor não
> sabe diagnosticar** (F-09, RNF-09).

O cenário concreto que se quer evitar: alguém acrescenta um campo ao Tina e esquece o Zod. O
professor preenche esse campo, salva, o commit dispara o build — e o build falha com um erro de
validação Zod que ele não tem como interpretar nem corrigir. O site para de atualizar e ele não
sabe por quê.

**Portanto o teste tem de rodar no CI**, não só na máquina de quem desenvolve. Ele é a rede de
proteção do professor, não conveniência do desenvolvedor.

### O que comparar

No mínimo, por coleção:

- **conjunto de campos** — nenhum campo existe só de um lado
- **obrigatoriedade** — o que é obrigatório no Zod é obrigatório no Tina, e vice-versa
- **valores de enum** — `tipo` de publicação, `status` de disciplina, `tipo` de material
- **estrutura do grupo `en`** — mesmos campos traduzíveis dos dois lados (plano 018)
- **listas embutidas** de disciplina — `aulas`, `listas`, `materiais`, `bibliografia`, `links`
  com os mesmos subcampos (D-05)

### O problema difícil, que é onde este plano pode dar errado

Os dois schemas são objetos JavaScript de formatos diferentes: um é Zod, outro é a estrutura de
configuração do Tina. Comparar exige **extrair uma representação normalizada de cada um**.

Duas abordagens, e a escolha precisa ser justificada na Evidência:

1. **Introspecção** — percorrer o schema Zod e a árvore de campos do Tina, normalizando ambos
   para algo como `{campo: {obrigatorio, tipo, valores?}}`. Preciso, mas acoplado a internos do
   Zod 4, que mudaram em relação ao Zod 3.
2. **Declaração única** — derivar os dois schemas de uma descrição comum em TypeScript. Elimina
   a divergência por construção, mas é reescrita dos planos 016 e 017 e sai do escopo da fase.

⚠️ **Um teste que sempre passa é pior que teste nenhum**, porque dá falsa segurança. A lição 9
da fase 0 se aplica com força total aqui: **prove a falsificabilidade**. Acrescente um campo só
ao Tina, rode o teste, mostre que ele falha; remova; rode de novo, mostre que passa. Depois o
mesmo no sentido inverso. Sem essas execuções coladas na Evidência, o plano não fecha.

### Divergências herdadas

Os planos 016, 017 e 018 foram escritos para transcrever a §7.3 **independentemente**, de modo
que este teste compare duas leituras da mesma fonte. É esperado que ele **encontre divergências
reais** na primeira execução. Corrija-as aqui — este é o plano que tem autoridade para tocar os
dois arquivos — e **liste cada uma na Evidência**, porque elas são a prova de que o teste serve.

#### As duas divergências reais que os planos 017 e 018 já acharam — e que continuam abertas

Nenhuma das duas é pega por comparação de nome/tipo/obrigatoriedade. Elas são o motivo de este
plano existir, e o teste que não as detectar não está pronto.

**1. Formato do valor de `projetos.linha_relacionada` (campo `reference`).** O Tina grava como
valor o id completo do documento — caminho com pasta e extensão; o `glob()` loader do Astro
gera id sem pasta e sem extensão:

- **Tina grava:** `"content/linhas-pesquisa/minha-linha.md"`
- **Astro/Zod espera:** `"minha-linha"`

Fontes: `node_modules/@tinacms/graphql/dist/index.js:4931` (`id: fullPath`) e
`node_modules/astro/dist/content/runtime.js:508-534`. O `reference()` do Astro **não valida
existência** — aceita a string sintaticamente e `getEntry()` devolve `undefined` em runtime.
Confirmado no painel: um projeto salvo apontando para uma linha de pesquisa gravou o caminho
completo. **Falha silenciosa** — não aparece em `npm run build` nem em `npm run test`, e vai
morder na fase 3. Existe um `// NOTE:` junto ao campo em `tina/config.ts`; remova-o ao corrigir.

**Consequência para o teste:** ele precisa de asserção sobre o **formato do valor** de campo
`reference`, não só sobre a forma do schema.

**2. Subcampo obrigatório de lista embutida não bloqueia o save do documento pai.** Uma `aula`
adicionada sem `numero`, `titulo` nem `url` — os três `required: true` no objeto `aulas[]` —
foi salva pelo painel como `aulas: [ {} ]`. O Zod rejeita esse frontmatter (nenhum dos três é
opcional): o professor levaria um build quebrado sem saber diagnosticar (F-09, RNF-09). É o
risco R-01 do PRD acontecendo em miniatura.

Não há mudança de schema do lado do Tina que resolva isso sem validação customizada. **Decida
aqui** o que fazer — validação customizada no Tina, afrouxamento do Zod, ou aceitar e registrar
— e justifique. Se a decisão for aceitar, ela precisa entrar como consequência conhecida para a
fase 2 (mensagem de erro de build) e para o manual do professor na fase 5.

#### Três armadilhas de falso positivo — o teste ingênuo reprova sem haver bug

**1. Identificador interno da coleção.** O Tina exige `name` alfanumérico/underscore, então a
coleção é `name: 'linhas_pesquisa'`; a chave do Zod em `collections` é `'linhas-pesquisa'`, com
hífen, que também é o nome da pasta. **A pasta em disco é a mesma dos dois lados** — só o
identificador GraphQL interno diverge. Comparar por igualdade de string reprova aqui sem haver
defeito; normalize antes de comparar.

**2. Restrições finas do Zod que o Tina não replica — intencional, é o próprio D-06.** O Zod é
o portão; o Tina é a interface de entrada. Não têm equivalente no Tina, de propósito:
`publicacoes.ano` (faixa 1900–2100), `publicacoes.autores` (mínimo 1 item), `perfil.email`
(`z.email()`) e **todos** os campos `z.url()` (`links.*`, `cv_url`, `pdf_url`, `aulas[].url`,
`listas[].url`, `materiais[].url`, `links[].url` de disciplinas). O Tina não tem tipo nativo de
URL nem validação de faixa numérica sem função customizada. **Não trate como lacuna de
paridade.**

**3. O grupo `en` (plano 018) tem forma própria.** Nos dois lados ele é opcional, e **cada campo
dentro dele também**; no Zod cada grupo é `.strict()` (seis ao todo, contando o
`formacaoEnSchema` aninhado), e no Tina nenhum subcampo de `en` é `required`. Um teste que exija
simetria de `required` entre os lados precisa saber que dentro de `en` a resposta correta é
"nenhum obrigatório dos dois lados". O `en` é sempre o **último** campo da coleção no Tina.
Campos por coleção: `perfil` (cargo, instituicao, departamento, bio, resumo_home,
formacao[{grau, curso}], areas[]) · `linhas-pesquisa` (titulo, resumo, corpo) · `projetos`
(titulo, descricao) · `disciplinas` (nome, descricao, ementa) · `publicacoes` (**só** resumo).

### Fatos de ambiente que este plano precisa saber

- **Zod é o 4.5.4**, importado de `astro/zod`. Os internos mudaram em relação ao Zod 3 — se a
  abordagem for introspecção, é aqui que ela pode quebrar num upgrade, e essa é a limitação a
  declarar na Evidência.
- **O CI já roda o teste.** `.github/workflows/ci.yml` executa `npm run lint`,
  `npm run format:check`, `npm run test:coverage` e `npm run build`. O item de aceitação "o teste
  roda no CI" se comprova colando essas linhas — não é preciso alterar o workflow, só confirmar.
- **A cobertura reprova**: `vitest.config.ts` tem `thresholds` em 80% e cobre
  `src/lib/**`, `src/i18n/**` e `src/content.config.ts`.
- **Se este plano mudar o schema** (e ele tem autoridade para isso), duas consequências herdadas
  valem: `tina/tina-lock.json` precisa ser regenerado — e **só `tinacms dev` o regenera,
  `tinacms build --skip-cloud-checks` não** —, e `npm run build` vai reprovar com
  `ERR_CLOUD_CHECK_FAILED` até o commit subir. A ordem de fechamento é revisão → commit → push →
  build verde → `Status: DONE`. O executor não faz commit nem push; quem fecha nessa ordem é o
  orquestrador.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Escolher a abordagem de comparação e justificar.
   → verify: justificativa na Evidência, com a limitação assumida.
2. Escrever o teste de paridade.
   → verify: `npm run test` executa o novo teste.
3. Corrigir as divergências que ele apontar, nos dois arquivos.
   → verify: cada divergência listada na Evidência, com o lado que estava errado.
4. **Provar a falsificabilidade** com campo canário só no Tina, depois só no Zod.
   → verify: cole as duas execuções falhando e a execução verde depois da remoção.
5. Confirmar que o teste roda no CI.
   → verify: o workflow executa `npm run test`; cole o trecho relevante.

## Critérios de aceitação

- [x] Teste de paridade escrito e passando
- [x] Compara campos, obrigatoriedade, enums, grupo `en` e listas embutidas
- [x] **Falsificabilidade provada** nos **dois** sentidos: campo só no Tina e campo só no Zod,
      cada um fazendo o teste falhar
- [x] Divergências encontradas na primeira execução listadas e corrigidas
- [x] **As duas divergências herdadas tratadas explicitamente:** o formato do valor de
      `projetos.linha_relacionada` (corrigido, com o `// NOTE:` de `tina/config.ts` removido) e o
      subcampo obrigatório de lista embutida que não bloqueia o save (decidido e justificado,
      ainda que a decisão seja aceitar e registrar)
- [x] **Nenhum dos três falsos positivos tratado como bug:** `linhas_pesquisa` × `'linhas-pesquisa'`,
      restrições finas do Zod sem equivalente no Tina, e a assimetria esperada dentro do grupo `en`
- [x] O teste roda no CI
- [x] Abordagem de comparação justificada, com a limitação assumida escrita
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

### 1. Abordagem de comparação — introspecção

Escolhida **introspecção** (não declaração única — fora do escopo da fase, como o próprio plano
diz). `tests/content/paridade-schema.test.ts` normaliza cada schema para uma forma comparável
(`NormField = {required, kind, enumValues?, children?, item?}`) e percorre as duas árvores em
paralelo com `compareFields`/`compareObjects`.

- **Lado Zod:** `classifyZod` lê `._zod.def` — introspecção de internos do Zod 4 (via
  `astro/zod`, confirmado `zod@4.5.4` por `node -pe "require('./node_modules/zod/package.json').version"`),
  **não é API pública documentada**. **Limitação assumida, escrita no cabeçalho do arquivo:** um
  upgrade de versão do Zod pode mudar esse formato interno (`type`, `innerType`, `shape`,
  `element`, `entries`, `in`/`out` de `pipe`) e quebrar este teste — não o schema em si. Validado
  experimentalmente antes de escrever o normalizador (probes descartados, não commitados):
  `z.object({...}).safeParse` e `._zod.def` para `string`/`number`/`boolean`/`array`/`object`/
  `enum`/`optional`/`.strict()`; e a assinatura de `reference()` do Astro (`z.union` de 4
  alternativas — número, string, `{id,collection}`, `{slug,collection}` — envolta em `pipe` de
  transform), inclusive por trás do `z.preprocess` usado para corrigir a divergência #1.
- **Lado Tina:** `classifyTina` percorre `tinaCollection.fields` (recorte próprio,
  `TinaFieldLike`, não os tipos completos de `@tinacms/schema-tools` — decisão deliberada para
  não acoplar o normalizador à união discriminada real do Tina, que tem variações irrelevantes
  aqui, ex.: `Option = string | {value,label}`).
- **Import de `tina/config.ts` em Vitest:** importar o módulo real falha —
  `import { defineConfig } from 'tinacms'` carrega o bundle completo do Tina (React,
  color-picker etc.), e um dos pacotes transitivos (`color-string`) não expõe export nomeado
  `get` em ESM, quebrando com `SyntaxError: Named export 'get' not found` sob Vite/Vitest. Não é
  um problema do schema — é interop CJS/ESM de uma dependência de UI que o painel nunca deveria
  rodar em teste headless. Contorno: `vi.mock('tinacms', () => ({ defineConfig: (config) =>
  config }))`. Verificado no código-fonte (`node_modules/tinacms/dist/index.js:76009-76016`) que
  o `defineConfig` real (`defineStaticConfig`) só chama `validateSchema(...)` e devolve o
  `config` inalterado — o mock preserva esse comportamento de passagem para um schema que já
  validou com sucesso via `tinacms dev`/`tinacms build` nos planos 017 e 018.

### 2. Divergências encontradas e corrigidas

A comparação estrutural (campos/obrigatoriedade/enum/grupo `en`/listas embutidas) **não
encontrou nenhuma divergência nova** nas cinco coleções — os planos 016–018 já convergiram nisso
(ver README da fase 1). As duas divergências reais que os planos 017/018 já tinham identificado
continuam sendo, por natureza, **invisíveis à comparação estrutural** (é por isso que o plano
pede tratamento explícito, não detecção automática):

- **Divergência #1 — formato do valor de `projetos.linha_relacionada` — CORRIGIDA no lado Zod.**
  `src/content.config.ts` ganhou `normalizeLinhaRelacionadaId` (função pura, documentada), que
  tira o prefixo `content/linhas-pesquisa/` e a extensão `.md` de uma string antes de passar por
  `reference('linhas-pesquisa')`, via `z.preprocess(normalizeLinhaRelacionadaId,
  reference('linhas-pesquisa')).optional()`. Valores não-string (formas `{id,collection}` /
  `{slug,collection}` do próprio `reference()`) passam intactos. Confirmado que a correção é do
  lado certo (Zod, não Tina) — comprova-se por teste unitário com a string literal que o Tina
  grava, sem precisar exercitar o painel (ver §4). O `// NOTE:` de `tina/config.ts` foi
  **removido** e substituído por um comentário curto apontando onde a reconciliação passou a ser
  feita (`src/content.config.ts`, `normalizeLinhaRelacionadaId`).
- **Divergência #2 — subcampo obrigatório de lista embutida não bloqueia o save — ACEITA E
  REGISTRADA, nenhuma mudança de schema.** Verificado nos tipos de `@tinacms/schema-tools@` (via
  `tinacms@3.12.1`, `node_modules/@tinacms/schema-tools/dist/types/index.d.ts`) que **não existe
  `ui.validate` tipado, de forma limpa, para o formato de coleção usado aqui**: as cinco
  coleções declaram `aulas`/`listas`/`materiais`/`bibliografia`/`links` como `ObjectField` com
  `type: 'object', fields: [...]` (não `templates:`); para essa variante, o próprio tipo
  (`index.d.ts:331-348`) tipa `ui` como `Template['ui']`
  (`itemProps`/`defaultItem`/`previewSrc` — `index.d.ts:354-387`), **sem `validate`**. O
  `validate` documentado em `index.d.ts:116-129` só existe em `UIField<Type,List>`, usado pelos
  campos escalares (`StringField`, `NumberField`, `BooleanField`...), não pelo `ObjectField` com
  `fields:`. Reforça a decisão: `numero`/`titulo`/`url` de `aulas[]` já são `required: true` no
  Tina hoje, e mesmo assim o orquestrador conseguiu salvar `aulas: [ {} ]` no plano 017 — ou
  seja, o próprio `required: true` embutido já não bloqueia o save nesta versão do Tina para
  campo de lista de objeto; um `validate` customizado por subcampo escalar não tem razão para se
  comportar diferente, e confirmar isso exigiria exercitar o painel, que este plano não roda.
  **Decisão: aceitar e registrar**, nenhuma mudança em `tina/config.ts` ou
  `src/content.config.ts` para esta divergência. **Consequência conhecida:**
  - *Fase 2:* se um item de lista embutida for salvo com subcampo obrigatório vazio, o build
    falha no portão Zod com uma mensagem nomeando arquivo e campo (comportamento já coberto por
    F-09/RNF-09 e pelos testes existentes de `disciplinasSchema` em `tests/content/schemas.test.ts`)
    — o professor vê um erro de build, não um erro no painel no momento do save.
  - *Fase 5 (manual do professor):* precisa instruir explicitamente que, ao adicionar item a uma
    lista embutida (aulas, listas de exercícios, materiais, bibliografia, links, formação
    acadêmica, links acadêmicos), os campos marcados obrigatórios devem ser preenchidos antes de
    sair do formulário — o painel não impede salvar com eles vazios, e o site só vai acusar o
    problema no build seguinte.

### 3. Três falsos positivos — confirmados como não-bug, com teste dedicado

`describe('três falsos positivos que um teste ingênuo reprovaria sem haver divergência real', ...)`
em `tests/content/paridade-schema.test.ts`:
- `linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) via
  `normalizeCollectionName` antes de qualquer comparação.
- Restrições finas do Zod sem equivalente no Tina (faixa 1900–2100 de `ano`, mínimo de 1 item em
  `autores`, `z.email()`, `z.url()`) não aparecem no normalizador — `classifyZod` não modela
  `checks` (`.min()`/`.max()`/`.int()`), só o tipo-núcleo — e por isso não reprovam a paridade de
  `publicacoes`.
- Grupo `en`: teste dedicado confirma que nenhum subcampo é `required` nos dois lados (usando
  `disciplinas.en` como amostra).

### 4. Falsificabilidade provada nos dois sentidos

**Canário só no Tina** (`tina/config.ts`, campo `canario_teste_019` acrescentado a `disciplinas`,
sem equivalente no Zod) — `npx vitest run tests/content/paridade-schema.test.ts -t "coleção disciplinas" --reporter=verbose`:

```
 × tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 7ms
   → expected [ Array(1) ] to deeply equal []

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "disciplinas.canario_teste_019: existe só no Tina",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 10 skipped (11)
```

Canário removido do Tina; **canário só no Zod** (`src/content.config.ts`,
`canarioTeste019: z.string().optional()` acrescentado a `disciplinasSchema`, sem equivalente no
Tina) — mesmo comando:

```
 × tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 7ms
   → expected [ Array(1) ] to deeply equal []

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "disciplinas.canarioTeste019: existe só no Zod",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 10 skipped (11)
```

Canário removido do Zod (`git diff --stat -- src/content.config.ts tina/config.ts` confirmado
sem sobra). Execução limpa depois da remoção dos dois:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > as cinco coleções existem dos dois lados, com o mesmo mapeamento de nome 2ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção perfil: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 2ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção linhas-pesquisa: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção projetos: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 1ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção publicacoes: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera 1ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > continua aceitando o id já normalizado, sem pasta nem extensão 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > `linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) — só o identificador interno diverge 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > restrições finas do Zod sem equivalente no Tina (faixa de `ano`, mínimo de `autores`, `z.email()`, `z.url()`) não reprovam a paridade — é o próprio D-06 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > grupo `en`: nenhum subcampo é obrigatório dos dois lados — não é assimetria de paridade (RN-09) 0ms

 Test Files  1 passed (1)
      Tests  11 passed (11)
```

Também comprovado à parte, revertendo só `src/content.config.ts` com `git stash push` (antes de
escrever a correção definitiva): o teste de formato de `linha_relacionada` falhava com o schema
anterior —

```
 × tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera 7ms
   → expected { …(2) } to deeply equal { id: 'minha-linha', …(1) }

AssertionError: expected { …(2) } to deeply equal { id: 'minha-linha', …(1) }

- Expected
+ Received

  {
    "collection": "linhas-pesquisa",
-   "id": "minha-linha",
+   "id": "content/linhas-pesquisa/minha-linha.md",
  }

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed | 9 skipped (11)
```

### 5. O teste roda no CI

`.github/workflows/ci.yml`:

```yaml
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      # test:coverage em vez de test: roda os mesmos testes e ainda impoe o
      # threshold de 80% da §11 do PRD, que ate 2026-09-01 era so relatado
      - run: npm run test:coverage
      - run: npm run build
```

`npm run test:coverage` roda `vitest run --coverage`, que inclui `tests/**/*.test.ts`
(`vitest.config.ts`, `include: ['tests/**/*.test.ts']`) — cobre
`tests/content/paridade-schema.test.ts` sem precisar alterar o workflow.

### 6. Execução final, com todos os arquivos no estado corrigido (sem canários)

`npm run lint`:
```
> haroldo-page@0.1.0 lint
> eslint .

```
(saída vazia, exit 0)

`npm run format:check` (precisou de `npx prettier --write src/content.config.ts` uma vez, por
causa da quebra de linha do `z.preprocess(...)` — só reformatação, sem mudança semântica):
```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test`:
```
> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  93 passed (93)
```

`npm run test:coverage`:
```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  4 passed (4)
      Tests  93 passed (93)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 31/31 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 30/30 )
================================================================================
```
(93º teste, além dos 10 novos de paridade, é o terceiro caso de `linha_relacionada` — valor
não-string passando intacto por `normalizeLinhaRelacionadaId` — acrescentado para cobrir o ramo
`typeof valor !== 'string'`, que ficava sem cobertura e derrubava o `branches` de 100% para 75%,
abaixo do threshold de 80%.)

`npm run build`:
```
Starting Tina build
...
│  Tina build complete
...
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

...
[build] output: "static"
[build] mode: "static"
[build] Building static entrypoints...
[vite] ✓ built in 315ms
[vite] ✓ built in 46ms
[build] Rearranging server assets...

generating static routes
  ├─ /index.html (+9ms)
[build] ✓ Completed in 21ms.
[build] ✓ Completed in 414ms.
[build] 1 page(s) built in 856ms
[build] Complete!
```

**Sem `ERR_CLOUD_CHECK_FAILED`, ao contrário do que os planos 017/018 registraram e do que este
plano antecipava.** Motivo: `tina/config.ts` só teve um comentário alterado (`// NOTE:` removido
e substituído — ver §2) — **nenhum campo, tipo ou obrigatoriedade da coleção `projetos` mudou do
lado do Tina**, só do lado do Zod (`src/content.config.ts`). `git status` confirma que
`tina/tina-lock.json` **não** aparece como modificado — sem mudança estrutural no schema do
Tina, não há novo tipo GraphQL para o TinaCloud reconciliar, e a checagem de nuvem do
`tinacms build` não tem o que comparar contra `main` que já não bata. Portanto, diferente do
padrão dos planos 017/018 (revisão → commit → push → TinaCloud reindexa → build verde), aqui o
`npm run build` já fechou verde nesta sessão, sem depender de push prévio. Ainda assim, quem
promove `Status: DONE` e marca os critérios é o orquestrador, depois da revisão.

### 7. O que ficou pendente de verificação no painel — não rodado por este executor

- **Não rodei `tinacms dev`** (proibido pelo despacho). `tina/tina-lock.json` não precisou de
  regeneração desta vez (ver §6) — mas isso é uma constatação, não uma verificação no painel.
- **Não verifiquei no painel** se a normalização de `linha_relacionada`
  (`normalizeLinhaRelacionadaId`) funciona fim-a-fim quando o professor de fato seleciona uma
  linha de pesquisa no campo de referência do Tina e salva — a prova aqui é só a string literal
  que o Tina é documentado gravar (`content/linhas-pesquisa/<slug>.md`), testada por
  `.safeParse()`. Quem fecha essa ponta é o orquestrador, exercitando o `/admin`.
  - Consistente com a lição "verificar no painel, não no código": a leitura de
    `node_modules/@tinacms/schema-tools` provou que `ui.validate` tipado **não existe** para
    `ObjectField` com `fields:` (fato de tipos, verificável sem exercitar UI) — não provou nada
    sobre *comportamento* de UI, que continua não verificado.
- **Não verifiquei no painel** que salvar um item de `aulas`/`listas`/`materiais`/
  `bibliografia`/`links` com subcampo obrigatório vazio continua não bloqueado (o fato já estava
  registrado como achado do plano 017 pelo orquestrador; este plano só decidiu o que fazer com
  ele — aceitar e registrar — sem tentar mudança de schema).
- **Não rodei `npm ci`** — não houve necessidade de instalar/atualizar dependências;
  `package.json`/`package-lock.json` não foram tocados.
- **Não commitei nem fiz push** — por despacho, isso é o orquestrador.

### 8. Fechamento — orquestrador

Ciclo do `/executar-plano`: execução → verificação independente → revisão **REPROVADO** →
correção → **nova** verificação independente → revisão **APROVADO**.

**Revisão, ciclo 1 — REPROVADO.** Dois defeitos, ambos de documentação em código de produção, na
docstring de `normalizeLinhaRelacionadaId` (`src/content.config.ts`): a linha 234 citava
`planos 017/019` como origem da divergência, quando o 019 é o plano que a corrige e a origem é
017/018; e a linha 241 dizia `é provável por teste unitário` onde o sentido é `comprovável` —
em pt-BR "provável" é *likely*, não *provable*, e a frase perdia justamente o motivo da decisão.
Corrigidos pelo executor, sem tocar em lógica, teste ou `tina/config.ts`.

**Verificação independente, segunda execução** (`triage-runner`, depois da correção) — saída
autoritativa deste plano:

```
> haroldo-page@0.1.0 lint
> eslint .

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  4 passed (4)
      Tests  93 passed (93)
   Start at  22:58:28
   Duration  936ms (transform 1.03s, setup 0ms, import 1.63s, tests 46ms, environment 0ms)

=============================== Coverage summary ===============================
Statements   : 100% ( 31/31 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 30/30 )
================================================================================

> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

[build] Complete!
```

Os quatro comandos com exit code 0. **Sem `ERR_CLOUD_CHECK_FAILED`** — ver §6: o schema do Tina
não mudou, só um comentário, então não houve o bloqueio que os planos 017 e 018 enfrentaram nem
lock a regenerar.

**Revisão, ciclo 2 — APROVADO.** O revisor reconferiu contra a fonte, não contra a alegação:
`git diff HEAD` mostra que as duas trocas de palavra são as únicas diferenças em relação ao diff
já revisado, com os dois hunks de código idênticos; `tina/config.ts` no mesmo blob `9019f6b`; e
`tests/content/paridade-schema.test.ts` no mesmo md5 `1784a567377e63b5c6d12f939bf58c34` que ele
leu linha a linha.

**Três dúvidas que o orquestrador levantou e a revisão fechou contra a fonte** — ficam
registradas porque são o tipo de defeito que uma revisão por leitura de alegação deixaria passar:

1. **A recursão de `compareFields` pula ramo em silêncio?** Não. Os guardas
   `zod.item && tina.item` e `zod.children && tina.children` existem por estreitamento de tipo,
   não como defesa: nem `classifyZod` (linhas 184, 190) nem `classifyTina` (linhas 223–231) têm
   caminho que produza `array` sem `item` ou `object` sem `children` — no pior caso `children` é
   `{}`, não `undefined`. Um canário **aninhado** falharia: em `aulas[]` produz
   `disciplinas.aulas[].<campo>: existe só no Tina`; dentro do grupo `en` produz
   `disciplinas.en.<campo>: existe só no Tina`. O único caminho de não comparação é
   `mapScalarKind`/`classifyZod` **lançando** para tipo não modelado — falha ruidosa.
2. **O `.optional()` externo anula o `preprocess`?** Não, e é o comportamento desejado:
   `ZodOptional` curto-circuita em `undefined` sem executar o `preprocess`.
3. **Os 100% de cobertura são ocos?** Não. A aritmética entre planos prova que
   `normalizeLinhaRelacionadaId` está sendo medida: 016 → 21 stmts / 2 branches / 1 função;
   018 → 27 / 2 / 1; 019 → 31 / **4** / **2**. `src/lib/config.ts` não tem função e
   `src/lib/slug.ts` tem exatamente uma (`slugify`), então a segunda função e as duas branches
   novas só podem vir desta correção e do seu `if (typeof valor !== 'string')`. A tabela por
   arquivo vazia é defeito de reporter registrado desde o plano 015, anterior a este plano.

**Três buracos latentes que a revisão encontrou e que este plano não fecha** — não são defeito
do executor (o plano não os pediu), e viram insumo para o 021 e para as fases seguintes:

- O teste compara o `name` da coleção (normalizado) mas **nunca o `path` do Tina contra a pasta
  que o `glob()` do Zod lê**. Trocar `path: 'content/linhas-pesquisa'` passaria despercebido —
  divergência silenciosa da mesma família que o D-06 combate.
- Em `paridade-schema.test.ts:235`, a detecção de enum do lado Tina vem **depois** do ramo
  `campo.list`. Um campo futuro com `list: true` **e** `options: [...]` seria normalizado como
  array de `string` e os valores de enum não seriam comparados. Não existe campo assim hoje.
- A prova de falsificabilidade foi produzida quando o arquivo tinha 11 testes; o 12º
  (`typeof valor !== 'string'`, acrescentado por cobertura) não toca em `compareFields`, então a
  prova continua válida — mas as saídas coladas não são contra o artefato final.

**O que continua sem verificação no painel, por decisão do orquestrador.** A premissa da
correção — que o Tina grava `content/linhas-pesquisa/<slug>.md` — **já foi verificada no painel
pelo orquestrador no plano 017**, não é leitura de `node_modules`. O que falta é a ponta
`getEntry()` resolvendo de fato depois da normalização, e ela **não é verificável hoje**: as
quatro pastas de coleção estão vazias (`[WARN] [glob-loader] No files found matching "**/*.md"`).
Exercitá-la exige criar conteúdo, que é escopo do plano 020. Transferido para lá como item
explícito, em vez de declarado verificado aqui.

Commit: `6a42330`.
