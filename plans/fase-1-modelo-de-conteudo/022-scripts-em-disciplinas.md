# Plano 022 — Lista `scripts[]` em disciplinas: schema Zod + Tina e paridade

**Status:** TODO
**RFs cobertos:** RF-37 (MUST); fase 1, item "Lista `scripts[]` em `disciplinas`"; RN-05 (exceção
de código-fonte), RF-03, D-05, D-06, F-13
**Depende de:** planos 016, 017, 018, 019 e **020** — todos DONE (`020` em `aa9a7cf`, 2026-09-04).
Este plano executa **depois do 020 e antes do 021**
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A coleção `disciplinas` passa a ter a lista embutida `scripts[]` — código-fonte colado no próprio
conteúdo — declarada nos dois lados do modelo (Zod e Tina), em paridade verificada pelo teste do
plano 019, e com o código Python indentado sobrevivendo intacto ao ciclo de gravação do painel.

**Só o schema.** A renderização (destaque de sintaxe com Shiki, botão de copiar, agrupamento por
aula) é da **fase 3** e **não entra neste plano** — separação decidida na Decisão 6 da sabatina.

## Arquivos afetados

- `src/content.config.ts` — novo `scriptSchema` e o campo `scripts` em `disciplinasSchema`
- `tina/config.ts` — a mesma lista, como campo `object`/`list: true` na coleção `disciplinas`
- `tests/content/schemas.test.ts` — casos de `scripts[]` no `describe('coleção disciplinas', ...)`
- `tests/content/paridade-schema.test.ts` — **só se** a prova de falsificabilidade exigir; a
  máquina do teste já itera as coleções sozinha (ver "Contexto necessário")

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** edite o `PRD.md` (a emenda do RF-37 já está lá, v0.1.15), **não** edite
> `content/**` (é escopo do 020 e da verificação de painel do orquestrador) e **não** rode
> `tinacms dev`.

> **Guarda de escopo dentro de `src/content.config.ts`.** Existe ali uma divergência de
> documentação **já registrada e deliberadamente adiada**: a docstring de
> `normalizeLinhaRelacionadaId` (linhas 239–241) chama a referência inválida de "falha silenciosa
> que só apareceria na fase 3", e o plano 020 provou que o `astro check` a reporta em voz alta
> hoje — o silencioso é o *exit code*. **A correção é do plano 021, não deste.** Não a conserte de
> passagem: toda linha alterada por este plano tem de rastrear até `scripts[]`.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA), Astro 7 +
TinaCMS. `src/content.config.ts` é o portão de validação (Zod); `tina/config.ts` é a interface de
entrada (painel). Os dois descrevem o mesmo conteúdo, e a divergência entre eles é o defeito que a
D-06 combate.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0. Astro 7.2.10, Zod 4.5.4 importado de
`astro/zod`, TinaCMS 3.12.1.

### De onde vem este plano

Sabatina de 2026-09-04, em
`S:\Projetos\academic_page\haroldo\docs\sabatinas\CHANGELOG_sabatina_scripts-python.md` — **leia
as Decisões 1 a 11 antes de começar**. O stakeholder quer publicar scripts em Python junto dos
materiais da disciplina, exibidos com destaque de sintaxe. Isso contradizia a RN-05 ("todo
material didático é referenciado por URL externa; o site não hospeda o arquivo"), que ganhou
exceção explícita para código-fonte (Decisão 7, já emendada no PRD).

### Forma final do schema — transcrita da sabatina, não reinterpretar

```
disciplinas.scripts[]        (lista embutida, D-05 — como aulas[], listas[], materiais[])
  titulo      string    obrigatório
  descricao   string    opcional
  linguagem   enum      python | r | matlab | bash | outro   (padrão: python)
  codigo      string    obrigatório      textarea no painel
  aula        number    opcional         número da aula correspondente
  url         string    opcional         URL do arquivo original, se houver
```

Fora do grupo `en` (Decisão 5). Sem limite de tamanho (Decisão 8). Sem integridade referencial em
`aula`, com degradação definida (Decisões 9 e 10).

### Como "padrão: python" se traduz nos dois lados — e por que não é `.default()` no Zod

Use **`linguagem` obrigatório dos dois lados**, com o valor inicial vindo do item novo do painel:

- Zod: `linguagem: z.enum(['python', 'r', 'matlab', 'bash', 'outro'])` — sem `.default()`.
- Tina: `type: 'string'`, `required: true`, `options: [...]`, mais
  `ui: { defaultItem: { linguagem: 'python' }, itemProps: ... }` no campo `scripts`.

Motivo: o teste de paridade deriva "obrigatório" do lado Zod de `!schema.safeParse(undefined).success`
(`tests/content/paridade-schema.test.ts`, `classifyZod`). Um `.default('python')` faz
`safeParse(undefined)` **passar**, o campo vira opcional só do lado Zod e a paridade reprova com
`disciplinas.scripts[].linguagem: obrigatoriedade diverge`. A combinação acima é a mesma já usada
para `publicado` (obrigatório dos dois lados + `defaultItem`) e é a leitura da sabatina que
preserva "padrão do item novo" sem afrouxar o portão.

`ui.defaultItem` **no campo** (não na coleção) é tipado nesta versão: a revisão do plano 019
verificou em `node_modules/@tinacms/schema-tools/dist/types/index.d.ts:331-348` que o `ui` de um
`ObjectField` com `fields:` é `Template['ui']`, que declara `itemProps`/`defaultItem`/`previewSrc`.
Se ainda assim o TypeScript recusar, **pare e reporte** — não invente contorno.

### O que este plano deliberadamente NÃO faz

- **Não valida integridade referencial de `aula`** (Decisões 9, 10 e 11). Campo numérico simples,
  opcional, digitado pelo professor, **sem `reference`** — o Tina não oferece referência entre
  listas embutidas do mesmo documento. `aula: 7` numa disciplina de cinco aulas **não** é erro de
  schema, e não deve virar um. A degradação (o script cai num grupo geral da disciplina) é da
  fase 3, cenário **F-13** do PRD. Não escreva validação cruzada, nem `superRefine`, nem
  componente React de seleção de aula.
- **Não impõe limite de tamanho ao `codigo`** (Decisão 8). Um `.max()` no Zod produziria o modo de
  falha que F-09 e RNF-09 mandam evitar: o painel deixa salvar (o 019 provou que o Tina não impõe
  validação customizada aqui) e o erro só apareceria no build, ilegível para o professor. A
  orientação vive no `description` do campo.
- **Não valida exclusividade entre `codigo` e `url`** (Decisão 2). Os dois convivem: `codigo` é
  obrigatório, `url` aponta o arquivo original. O 019 já provou, contra os tipos de
  `@tinacms/schema-tools`, que não existe `validate` tipado para campo `object` com `fields:` — a
  regra não seria imposta no painel e viraria promessa não cumprida.
- **Não põe restrição fina em `aula`** — nada de `.int()`, `.min()` ou `.positive()`. A sabatina e
  a §7.3 dizem apenas "número da aula correspondente"; um valor esquisito degrada pela F-13, não
  quebra o build.
- **Não toca no grupo `en`** (Decisão 5). O `en` de `disciplinas` continua exatamente com `nome`,
  `descricao` e `ementa`, como o plano 018 fechou — igual às outras quatro listas embutidas
  (`aulas[]`, `listas[]`, `materiais[]`, `bibliografia[]`), todas fora do `en`. `codigo` nunca
  traduz: é dado factual (RN-07). O `disciplinasEnSchema` é `.strict()`, então um `scripts` colado
  dentro de `en` é **rejeitado** — e isso é o comportamento desejado, não um defeito a contornar.
- **Não renderiza nada.** Sem Shiki, sem botão de copiar, sem `.astro`, sem CSS.

### O teste de paridade do 019 vai reprovar no meio do caminho — é ele funcionando

`tests/content/paridade-schema.test.ts` compara, por introspecção, campos, obrigatoriedade, enums,
grupo `en` e listas embutidas entre `src/content.config.ts` e `tina/config.ts`. Ele **itera as
coleções sozinho** (`for (const tinaCollection of tinaCollections)`) e compara o conjunto de chaves
(`compareObjects`), então `scripts[]` entra na comparação **sem nenhuma alteração na máquina do
teste**.

Consequência prática: assim que um lado ganhar `scripts[]` e o outro não, o teste
`coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas` falha com
`disciplinas.scripts: existe só no Tina` (ou `só no Zod`). **Isso é o teste fazendo o trabalho
dele.** Os dois lados mudam juntos, e a suíte só fecha com os dois. Não "conserte" o teste, não
adicione exceção, não comente asserção.

Dois detalhes do normalizador que importam aqui:

- **Enum: o conjunto é comparado, a ordem não.** Os dois lados passam por `.sort()` antes da
  comparação (`classifyZod` faz `Object.keys(def.entries).sort()`; `classifyTina` faz
  `[...campo.options].sort()`). Portanto os cinco valores precisam ser **exatamente os mesmos**
  dos dois lados — um `outros` de um lado e `outro` do outro reprova —, mas a ordem em que você os
  escreve é livre. Escreva na ordem da sabatina mesmo assim, por legibilidade.
- **A detecção de enum do lado Tina vem depois do ramo `campo.list`** (buraco latente registrado
  pela revisão do 019). Isso não afeta `linguagem`, que é campo escalar **dentro** de um objeto de
  lista, não um campo com `list: true` **e** `options`. Não crie um campo assim.

### Onde encaixar, nos dois arquivos

- **`src/content.config.ts`:** declare `scriptSchema` junto dos irmãos (`bibliografiaSchema`,
  `aulaSchema`, `listaSchema`, `materialSchema`, `linkDisciplinaSchema`, linhas 283–322) e
  acrescente `scripts: z.array(scriptSchema).optional()` em `disciplinasSchema` depois de `links`.
  Siga o padrão dos irmãos: `url: z.url().optional()` (URL livre, D-07) e docstring no schema novo.
- **`tina/config.ts`:** insira o campo `scripts` na coleção `disciplinas` **depois de `links` e
  antes de `en`**. O grupo `en` é sempre o **último** campo da coleção no Tina — mantenha assim.
  `codigo` usa `ui: { component: 'textarea' }`, como `ementa` e as `descricao` já usam.

### Textos de ajuda — RF-03 exige, não é enfeite

O RF-03 pede vocabulário acadêmico e ajuda em todo campo não óbvio; o `description` do `codigo` é
onde a Decisão 8 mora. Use (pode polir o português, não pode ficar sem):

- `codigo` — "Cole aqui o código-fonte. Ele é exibido na página da disciplina com destaque de
  sintaxe e botão de copiar. Para scripts longos, prefira publicar o arquivo e informar apenas o
  link abaixo."
- `linguagem` — "Define como o código é colorido na página."
- `aula` — "Número da aula correspondente, se houver. Deixe em branco para um script geral da
  disciplina."
- `url` — "Link opcional para o arquivo original (Drive, GitHub, repositório institucional)."
- `itemProps` do item: rótulo pelo `titulo`, com `'Novo script'` como reserva — igual ao que
  `aulas`, `listas`, `materiais` e `links` já fazem.

### ⚠️ O que o 020 descobriu depois que este plano foi escrito — leia antes de abrir o painel

Este plano nasceu em `edfc822`, no mesmo dia da sabatina e **antes** de o plano 020 exercitar o
`/admin`. As duas armadilhas abaixo foram descobertas depois e **atingem em cheio a verificação
de painel da seção seguinte**. Quem for ao painel sem elas produz prova falsa.

**1. O formulário do Tina descarta em silêncio alteração em campo que já tinha valor.** Ao voltar
de um subpainel de grupo `object` — e **item de lista embutida é subpainel** —, o formulário
re-inicializa a partir do documento carregado: campo que já tinha valor perde a alteração (a tela
mostra o valor novo, o arquivo grava o antigo), enquanto campo que estava vazio sobrevive.
Reproduzido duas vezes com A/B de uma variável no plano 020.

**Por que isto morde exatamente aqui:** `ui.defaultItem: { linguagem: 'python' }` **conta como
valor inicial**. `linguagem` é, neste plano, o que o interruptor `publicado` foi no 020 — o campo
com maior chance de gravar diferente do que a tela mostra. E a verificação de painel deste plano
é a prova do **R-13**: conferir só o bloco de `codigo` e não notar que `linguagem` reverteu
aprovaria o plano com a prova pela metade.

**Contorno, obrigatório:** conferir o `.md` gravado **campo a campo**, não só o bloco de código; e
alterar `linguagem` **por último**, depois de sair de qualquer subpainel.

**2. Ler a saída, não o exit code.** O `astro check` imprime `[ERROR] [content]` e ainda assim
encerra com `0 errors` e exit 0 — descoberto no 020 com uma referência inválida. Este plano grava
conteúdo novo pelo painel, então a linha `npm run build` da verificação autoritativa **não é
suficiente por si só**: leia o texto da saída.

**3. Dois detalhes operacionais do 020**, para não perder tempo com eles de novo:

- A content layer guarda cache de quando as pastas de coleção estavam vazias. Verificação de
  conteúdo em dev server que já estava no ar exige `astro dev --force`.
- O processo do `tinacms dev` **sobrevive ao encerramento da tarefa** e depois trava o
  `npm run build` com `Datalayer server is busy`. Matar o processo Node, não só a tarefa.

**4. Consequência a registrar, não a consertar:** `scripts[]` traz `titulo` e `codigo`
obrigatórios, e o painel **deixa salvar item de lista embutida com subcampo obrigatório vazio**
(dívida herdada do 019, decidida como "aceitar e registrar"). São **mais duas instâncias** do
mesmo problema, e elas aumentam o que a fase 2 (mensagem de erro de build, F-09/R-01) e o manual
da fase 5 têm de cobrir. Registre na Evidência; **não** invente validação para contornar.

### ⚠️ O risco técnico que decide se este plano fecha

Código Python indentado dentro de YAML depende de o `js-yaml` usado pelo Tina serializar `codigo`
como **block scalar** (`|`) e reler o arquivo sem alterar espaçamento. **Em Python, indentação é
sintaxe** — se o valor for escapado como string de linha única, o script gravado deixa de ser o
script salvo, e ninguém percebe até um aluno rodar o arquivo.

**Isto não se aprova lendo `node_modules`.** É a lição que este projeto já pagou caro: uma revisão
aprovou uma correção que não funcionava porque a prova foi leitura de código de terceiro em vez de
exercício da interface. Comportamento de biblioteca de terceiro **no caminho de escrita** se prova
salvando pelo painel e lendo o arquivo gravado.

**Quem exercita o painel é o orquestrador, não o executor.** O executor não roda `tinacms dev` nem
abre o `/admin`. O que o executor faz: deixa o schema pronto e escreve na Evidência que a
verificação de painel está pendente. O que o orquestrador faz, antes de promover `Status: DONE`:

1. Abre o `/admin`, edita uma das duas disciplinas criadas pelo plano 020 e acrescenta um script
   cujo `codigo` tenha, obrigatoriamente, **bloco indentado, linha em branco no meio e aspas** —
   por exemplo um `def`/`for` com corpo indentado, uma linha vazia separando duas partes, e uma
   string com aspas simples e duplas.
2. Salva pelo painel, tendo mexido em `linguagem` **por último** (armadilha 1 da seção anterior).
3. Abre o `.md` gravado e **cola o conteúdo literal do frontmatter na Evidência** — não a
   descrição, o texto.
4. Confere que a indentação e a linha em branco sobreviveram byte a byte, **e que os outros cinco
   campos do item gravaram o que a tela mostrava** — `linguagem` em especial. Confere que
   `npm run build` continua verde com esse arquivo em `content/`, **lendo a saída** e não só o
   exit code.

O script de teste é **conteúdo inventado num repositório público, atribuído a uma pessoa real**.
Pela decisão do stakeholder de 2026-09-04, título não carrega marca de placeholder — a marca de
exemplo vai na `descricao`, como o plano 020 fez. Mesmo tratamento aqui.

Se a indentação não sobreviver, **este plano não fecha**: é achado a reportar, e a solução (ex.:
mudar o formato do campo) é decisão nova, não conserto silencioso.

**É por isso que o 022 depende do 020**: sem as disciplinas placeholder no `content/`, não há
documento para abrir no painel e o risco fica sem prova.

### Ordem de execução — a numeração não é a ordem

O 022 roda **depois do 020** e **antes do 021** (que fecha a fase). A numeração do projeto é
**global e contínua**, não é ordem de execução; precedente registrado: o plano 014 rodou depois de
a fase 0 fechar e mesmo assim mora na pasta da fase 0.

### `tina/tina-lock.json` é versionado e precisa ser regenerado

Este plano **muda o schema do Tina**, então `tina/tina-lock.json` fica desatualizado. Detalhe
operacional descoberto no plano 018: **só `tinacms dev` regenera o lock** —
`tinacms build --skip-cloud-checks` **não** reescreve. O executor **não** roda `tinacms dev` (é
servidor de longa duração); quem regenera e commita o lock é o **orquestrador**, junto da
verificação de painel acima.

### Ordem de fechamento com o TinaCloud — planeje o bloqueio, não o esconda

`npm run build` começa por `tinacms build`, que compara o schema local com o que o TinaCloud
indexou em `main`. Enquanto o commit não subir, ele para em `ERR_CLOUD_CHECK_FAILED`
(`Reason: [NON_BREAKING - TYPE_ADDED] ...`) e nem chega ao `astro check`. **Não é defeito do
plano**, e **não** se contorna com `--skip-cloud-checks` no comando oficial — o contorno serve só
como diagnóstico separado, para provar que a falha é só do cloud-check. Sequência que funciona
(precedente nos planos 017 e 018):

```
revisão APROVADO → commit → push → TinaCloud reindexa → npm run build verde → Status: DONE
```

O critério do `npm run build` fica **desmarcado até o push**, com o bloqueio registrado na
Evidência — **nunca reescrito para caber no resultado**.

### O CI agora é verificação real

Durante a fase 1 inteira o CI esteve vermelho por 14 commits seguidos, por falta das credenciais do
TinaCloud; resolvido em 2026-09-04 (`82fb4de`). Desde então a verificação autoritativa da fase
inclui o `conclusion` do run do commit empurrado, além dos comandos locais:

```
npm ci                →  não reescreve o lock
npm run lint          →  exit 0
npm run format:check  →  All matched files use Prettier code style!
npm run test:coverage →  testes verdes E cobertura ≥ 80% (threshold imposto)
npm run build         →  0 errors, 0 warnings, 0 hints; Complete!
CI do GitHub Actions  →  conclusion "success" no commit empurrado
```

"Os comandos locais passam" **não** é o mesmo que "o CI passa", e só o segundo é evidência.

### Cobertura

`vitest.config.ts` tem `thresholds` em 80%, cobrindo `src/lib/**`, `src/i18n/**` e
`src/content.config.ts`. Código novo em `content.config.ts` sem teste **quebra o CI**. O
`scriptSchema` é declaração, não função — mas os testes do passo 3 existem para que a paridade e as
regras da sabatina fiquem verificáveis, não para satisfazer o medidor.

## Passos

1. Ler a sabatina inteira (`docs/sabatinas/CHANGELOG_sabatina_scripts-python.md`), o RF-37 e a
   linha `scripts[]` da §7.3 do PRD, e os cinco schemas irmãos em `src/content.config.ts`
   (linhas 283–322).
   → verify: você consegue dizer, sem olhar, quais campos são obrigatórios e por que `aula` não
   tem validação cruzada.
2. Declarar `scriptSchema` em `src/content.config.ts`, com docstring, e acrescentar
   `scripts: z.array(scriptSchema).optional()` a `disciplinasSchema`, depois de `links`.
   → verify: `npx vitest run tests/content/paridade-schema.test.ts -t "coleção disciplinas"` falha
   com `disciplinas.scripts: existe só no Zod` — **cole essa saída na Evidência**; é a prova de
   que o teste do 019 enxerga o campo novo.
3. Escrever os casos de `scripts[]` em `tests/content/schemas.test.ts`, dentro de
   `describe('coleção disciplinas', ...)`, seguindo o estilo do arquivo (`const valido` + spread).
   Cobrir, no mínimo: item mínimo válido (`titulo`, `linguagem`, `codigo`); rejeição sem `codigo`;
   rejeição sem `titulo`; rejeição de `linguagem` fora do enum; aceitação dos cinco valores do
   enum; `descricao`, `aula` e `url` ausentes; `aula` presente **sem** correspondência com
   `aulas[]` sendo **aceita** (F-13, Decisões 9 e 10); `url` inválida rejeitada; `codigo` com
   quebras de linha e indentação preservado literalmente pelo `safeParse`; e `en: { scripts: [...] }`
   **rejeitado** pelo `.strict()` do grupo `en` (Decisão 5).
   → verify: `npx vitest run tests/content/schemas.test.ts` — todos os novos passam.
4. Declarar o mesmo campo em `tina/config.ts`, na coleção `disciplinas`, entre `links` e `en`, com
   `list: true`, `ui.defaultItem`, `ui.itemProps` e os `description` da seção de textos de ajuda.
   → verify: `npx vitest run tests/content/paridade-schema.test.ts` volta a passar, com a coleção
   `disciplinas` verde — cole a saída.
5. Provar que a paridade é falsificável **para este campo**: remova temporariamente um subcampo de
   `scripts[]` só do lado do Tina, rode o teste, mostre a falha
   (`disciplinas.scripts[].<campo>: existe só no Zod`), devolva o subcampo e mostre o verde.
   → verify: as duas execuções coladas na Evidência, mais `git diff --stat` provando que nada
   sobrou do canário.
6. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check` e `npm run test:coverage` verdes, com as saídas
   coladas. `npm run build` deve reprovar com `ERR_CLOUD_CHECK_FAILED` até o push — cole a saída e
   **deixe o critério desmarcado**, com o bloqueio registrado.

## Critérios de aceitação

- [x] `scriptSchema` declarado em `src/content.config.ts`, com docstring, e `scripts` opcional em
      `disciplinasSchema`
- [x] Os seis campos exatamente como a sabatina fechou — `titulo` e `codigo` obrigatórios;
      `descricao`, `aula` e `url` opcionais; `linguagem` enum `python | r | matlab | bash | outro`
- [x] Campo `scripts` em `tina/config.ts`, na coleção `disciplinas`, **entre `links` e `en`**, com
      `codigo` em `textarea` e `linguagem` com as cinco `options`
- [x] `python` como valor do item novo via `ui.defaultItem`, com `linguagem` **obrigatório dos dois
      lados** — não `.default()` no Zod
- [x] Teste de paridade do 019 **verde**, com `scripts[]` comparado — sem alterar a máquina do
      teste
- [x] **Falsificabilidade provada para `scripts[]`**: subcampo removido só de um lado faz o teste
      falhar; devolvido, ele passa. As duas saídas coladas
- [x] Testes de `scripts[]` em `tests/content/schemas.test.ts`, incluindo o caso de `aula` órfã
      **aceita** (F-13) e o de `en: { scripts: [...] }` **rejeitado** (Decisão 5)
- [x] Nenhuma validação cruzada de `aula`, nenhum limite de tamanho de `codigo`, nenhuma
      exclusividade entre `codigo` e `url`
- [x] Grupo `en` de `disciplinas` inalterado — continua com `nome`, `descricao` e `ementa`
- [x] Nada de renderização: sem Shiki, sem botão de copiar, sem arquivo `.astro` (fase 3)
- [x] `PRD.md` e `content/**` não modificados pelo executor
- [x] `npm run lint`, `npm run format:check` e `npm run test:coverage` verdes, com cobertura ≥ 80%
- [ ] **Verificação no painel (orquestrador):** script salvo pelo `/admin` com **bloco indentado,
      linha em branco no meio e aspas**; o `.md` gravado aberto e o **frontmatter literal colado na
      Evidência**; indentação e linha em branco preservadas byte a byte
- [ ] **Os seis campos do item gravado conferidos um a um** contra o que a tela mostrava, com
      `linguagem` nomeado explicitamente na Evidência — armadilha do descarte silencioso (020)
- [x] Docstring de `normalizeLinhaRelacionadaId` (`src/content.config.ts:239-241`) **não
      modificada** por este plano — a correção é do 021
- [ ] **`tina/tina-lock.json` regenerado** pelo orquestrador com `tinacms dev` e commitado, com a
      diferença de tipos GraphQL descrita na Evidência
- [ ] `npm run build` verde — **desmarcado até o push**; `ERR_CLOUD_CHECK_FAILED` antes disso é
      esperado e fica registrado, não reescrito
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado
- [ ] §12 do PRD (item `scripts[]` da fase 1) e o README da fase 1 atualizados pelo orquestrador ao
      promover `Status: DONE`

## Evidência

### Passo 2 — falha intencional do teste de paridade (campo novo só no Zod)

```
$ npx vitest run tests/content/paridade-schema.test.ts -t "coleção disciplinas"

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/paridade-schema.test.ts (12 tests | 1 failed | 11 skipped) 8ms
     × coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 7ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "disciplinas.scripts: existe só no Zod",
+ ]

 ❯ tests/content/paridade-schema.test.ts:341:21

 Test Files  1 failed (1)
      Tests  1 failed | 11 skipped (12)
```

### Passo 3 — `tests/content/schemas.test.ts` com os novos casos de `scripts[]`

```
$ npx vitest run tests/content/schemas.test.ts

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  1 passed (1)
      Tests  81 passed (81)
   Start at  09:10:28
   Duration  773ms (transform 410ms, setup 0ms, import 630ms, tests 22ms, environment 0ms)
```

### Passo 4 — paridade volta a passar com `scripts` também no Tina

```
$ npx vitest run tests/content/paridade-schema.test.ts

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  09:10:49
   Duration  813ms (transform 445ms, setup 0ms, import 684ms, tests 9ms, environment 0ms)
```

### Passo 5 — prova de falsificabilidade (canário: `url` removido só do lado Tina)

Execução 1 — com `url` removido de `scripts[]` em `tina/config.ts`, a paridade falha:

```
$ npx vitest run tests/content/paridade-schema.test.ts -t "coleção disciplinas"

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/paridade-schema.test.ts (12 tests | 1 failed | 11 skipped) 8ms
     × coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 7ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "disciplinas.scripts[].url: existe só no Zod",
+ ]

 Test Files  1 failed (1)
      Tests  1 failed | 11 skipped (12)
```

Execução 2 — `url` devolvido ao Tina, a paridade volta a passar:

```
$ npx vitest run tests/content/paridade-schema.test.ts -t "coleção disciplinas"

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  1 passed (1)
      Tests  1 passed | 11 skipped (12)
   Start at  09:11:20
   Duration  793ms (transform 438ms, setup 0ms, import 668ms, tests 5ms, environment 0ms)
```

`git diff --stat` provando que nada do canário sobrou (o diff contra o HEAD mostra só a adição líquida
do campo `scripts`, sem duplicação nem resíduo da remoção temporária de `url`), colado **na árvore
final**, já depois do `prettier --write` do passo 6:

```
$ git diff --stat -- tina/config.ts
 tina/config.ts | 52 ++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 52 insertions(+)
```

A 52ª inserção (em relação às 51 linhas do estado antes do `prettier --write`) é a quebra de linha que
o Prettier introduziu na `description` do campo `url` de `scripts[]` — ver nota no passo 6 — e não
resíduo do canário: o `grep` abaixo já confirma que há só um `url` e um `linguagem` no diff.

Confirmação de que o `url` restaurado é único (sem duplicata) no diff final:

```
$ git diff -- tina/config.ts | grep -n "url\|linguagem"
6:               { type: 'string', name: 'url', label: 'Link', required: true },
17:+              defaultItem: { linguagem: 'python' },
30:+                name: 'linguagem',
54:+                name: 'url',
```

### Passo 6 — sequência de qualidade local

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .
```

(exit 0, sem saída adicional)

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

(Nota: a primeira execução do `format:check` reprovou com `[warn] tina/config.ts` — uma linha de
`description` longa, gerada pela indentação do bloco `scripts` inserido entre `links` e `en`. Corrigida
com `npx prettier --write tina/config.ts`; a reexecução acima, colada, é a que fechou verde.)

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  4 passed (4)
      Tests  107 passed (107)
   Start at  09:12:08
   Duration  1.35s (transform 1.60s, setup 0ms, import 2.41s, tests 52ms, environment 0ms)

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

(Linha de base da sessão: 93 testes, 31/31 statements. Depois deste plano: 107 testes — 14 casos novos
de `scripts[]` em `schemas.test.ts` — e 32/32 statements, 4/4 branches, 2/2 funções, 31/31 linhas, todos
em 100%. O denominador de statements subiu de 31 para 32 porque `scriptSchema` é uma declaração nova;
nenhuma linha ficou descoberta.)

`npm run build` — bloqueado por `ERR_CLOUD_CHECK_FAILED`, como o plano previu (o commit ainda não subiu;
o TinaCloud em `main` ainda não reindexou o schema local com `scripts[]`). Critério correspondente
**deixado desmarcado**, bloqueio registrado, não reescrito:

```
$ npm run build

> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null

Additional info:

	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Local GraphQL version: 2.4.10 / Remote GraphQL version: 2.4.10
	Last indexed at: Fri, 04 Sep 2026 13:32:36 GMT
	Reason: [NON_BREAKING - TYPE_ADDED] Type 'DisciplinasScripts' was added

Error: The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null

Additional info:

	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Local GraphQL version: 2.4.10 / Remote GraphQL version: 2.4.10
	Last indexed at: Fri, 04 Sep 2026 13:32:36 GMT
	Reason: [NON_BREAKING - TYPE_ADDED] Type 'DisciplinasScripts' was added

    at BuildCommand.execute (file:///S:/Projetos/academic_page/haroldo/node_modules/@tinacms/cli/dist/index.js:4037:29)
    at async BuildCommand.validateAndExecute (S:\Projetos\academic_page\haroldo\node_modules\clipanion\lib\advanced\Command.js:73:26)
    at async Cli.run (S:\Projetos\academic_page\haroldo\node_modules\clipanion\lib\advanced\Cli.js:223:24)
    at async Cli.runExit (S:\Projetos\academic_page\haroldo\node_modules\clipanion\lib\advanced\Cli.js:232:28) {
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
}
```

### Dívida herdada do plano 019, duas instâncias novas (registro exigido pelo plano, linhas 205-209)

`scripts[].titulo` e `scripts[].codigo` são obrigatórios nos dois lados (Zod e Tina), mas o painel
TinaCMS deixa salvar um item de `scripts[]` com um ou ambos vazios — o Tina não bloqueia subcampo
obrigatório vazio dentro de uma lista embutida na submissão do formulário. É a mesma dívida que o
plano 019 já havia encontrado (decidida como "aceitar e registrar", sem `validate` tipado disponível
para campo `object` com `fields:` — ver README da fase 1) e que o plano 017 registrou pela primeira
vez com `aulas[]`. `scripts[].titulo` e `scripts[].codigo` são, portanto, **mais duas instâncias** do
mesmo problema, não um problema novo. Por decisão explícita deste plano, não foi contornada por
validação de propósito (`superRefine`, `validate` customizado ou equivalente) — o item continua
salvando com o subcampo vazio, e o erro só aparece no build do Astro, exatamente como as instâncias
anteriores. Isso aumenta o que a fase 2 (mensagem de erro de build legível para o professor, F-09/R-01)
e o manual do professor da fase 5 têm de cobrir.

### Pendências explícitas do orquestrador (não executadas nesta sessão)

- **Verificação de painel** — `tinacms dev`, salvar pelo `/admin` um script com bloco indentado,
  linha em branco no meio e aspas, alterando `linguagem` por último; colar o frontmatter literal
  gravado; conferir os seis campos do item um a um, com `linguagem` nomeado explicitamente.
- **`tina/tina-lock.json`** — regeneração via `tinacms dev` e commit, com a diferença de tipos
  GraphQL (no mínimo `DisciplinasScripts`, visto no `ERR_CLOUD_CHECK_FAILED` acima) descrita na
  Evidência.
- **`npm run build` verde pós-push** — depende do commit subir e o TinaCloud reindexar `main`.
- **`conclusion` do CI do GitHub Actions** no commit empurrado.
- **§12 do PRD e README da fase 1** — atualização ao promover `Status: DONE`.

Nenhum destes cinco itens foi executado nesta sessão — são, por desenho deste plano, trabalho do
orquestrador, não do executor.

---

## Evidência do orquestrador — verificação no painel (R-13)

Executada em 2026-09-10, depois de a revisão de código voltar APROVADO.

### Como o painel foi subido — descoberta operacional nova

`npm run dev` (`tinacms dev -c "astro dev"`) **não serve para isto no Astro 7**: sem TTY, o
`astro dev` daemoniza (`Dev server running at http://localhost:4321 (pid 16204)` / `Stop: astro dev
stop`), o processo em primeiro plano encerra imediatamente, e o `tinacms dev` morre junto
(`child process exited with code 0`). O resultado é traiçoeiro: a porta 4321 responde `200` e o
`/admin` abre, mas o servidor do Tina em 4001 está morto e o painel exibe **"Failed loading TinaCMS
assets"** — em modo dev o `public/admin/index.html` carrega o próprio código de
`http://localhost:4001/admin/src/main.tsx`. Quem interpretar essa tela como erro de configuração vai
depurar o lugar errado.

O que funciona: subir os dois separadamente.

```
npx astro dev --background --force     →  Dev server running at http://localhost:4321 (pid 6244)
npx tinacms dev                        →  API url: http://localhost:4001/graphql
```

O `--force` é a armadilha do cache da content layer registrada pelo plano 020. Ao terminar:
`npx astro dev stop` **e** matar os processos `node` do `tinacms` — o do plano 022 deixou dois
(PIDs 2160 e 12816).

### O item salvo pelo `/admin`

Disciplina `content/disciplinas/2026.2-relatividade-geral.md`, criada pelo plano 020. O campo
**Scripts** aparece entre "Links externos" e "Versão em inglês (opcional)", como o plano exigia; o
item novo nasceu rotulado **"Novo script"** (`ui.itemProps` com a reserva) e com **`Linguagem`
já em `python`** (`ui.defaultItem`). `Título` exibiu `Required`. Os `description` do RF-03
apareceram nos quatro campos.

O seletor `Linguagem` ofereceu exatamente os cinco valores do enum, lidos da árvore de
acessibilidade do painel: `python` (selecionado), `r`, `matlab`, `bash`, `outro`.

**`linguagem` foi alterada por último e de propósito duas vezes — `python` → `bash` → `python` —
para que ela fosse um campo *genuinamente modificado*, e não apenas o valor inicial do
`ui.defaultItem`.** Sem isso, "gravou `python`" não distinguiria preservação de coincidência, e a
armadilha do descarte silencioso do plano 020 passaria sem teste justamente no campo que o plano
aponta como a vítima mais provável.

### Frontmatter literal gravado

```yaml
scripts:
  - titulo: Raio do horizonte de Kerr
    descricao: '[EXEMPLO] Script de demonstração usado para verificar o plano 022 — conteúdo inventado, substituir por material real.'
    linguagem: python
    codigo: |-
      def raio_horizonte(massa, spin):
          """Retorna r+ para Kerr, com G = c = 1."""
          if abs(spin) > massa:
              raise ValueError('spin excede o limite extremo')
          return massa + (massa**2 - spin**2) ** 0.5

      for m in [1.0, 2.5]:
          r = raio_horizonte(m, 0.9 * m)
          print(f"M={m}: r+ = {r:.4f} 'unidades geometricas'")
    aula: 4
    url: 'https://exemplo.invalid/rg-2026-2/script-horizonte-kerr.py'
```

**O `js-yaml` do painel escolheu o block scalar `|-`.** É a condição de que o R-13 dependia.

### Prova byte a byte do `codigo`

Script de verificação relendo o arquivo com o mesmo `gray-matter` que o painel usa para gravar, e
comparando com a string literal digitada no formulário:

```
--- os seis campos do item gravado ---
titulo: "Raio do horizonte de Kerr"
descricao: "[EXEMPLO] Script de demonstração usado para verificar o plano 022 — conteúdo inventado, substituir por material real."
linguagem: "python"
codigo: <323 chars>
aula: 4
url: "https://exemplo.invalid/rg-2026-2/script-horizonte-kerr.py"

--- codigo: byte a byte ---
esperado (bytes): 323
lido     (bytes): 323
IDENTICO: true
linha em branco preservada: true
indentacao por linha (esperado -> lido): [0,4,4,8,4,0,0,4,4] -> [0,4,4,8,4,0,0,4,4]
aspas duplas presentes: true
aspas simples presentes: true
```

**R-13 não se materializou.** O código indentado sobrevive ao ciclo de gravação do painel: mesmo
número de bytes, string idêntica, indentação preservada linha a linha (inclusive os 8 espaços do
`raise` aninhado), linha em branco no meio preservada, e as aspas simples e duplas intactas.

### Os seis campos conferidos um a um contra o que a tela mostrava

| Campo | Tela | Arquivo | Confere |
|---|---|---|---|
| `titulo` | Raio do horizonte de Kerr | idem | ✅ |
| `descricao` | `[EXEMPLO] Script de demonstração…` | idem | ✅ |
| **`linguagem`** | **python** (após `python` → `bash` → `python`) | **python** | ✅ |
| `codigo` | bloco de 9 linhas com indentação | 323 bytes idênticos | ✅ |
| `aula` | 4 | 4 | ✅ |
| `url` | `https://exemplo.invalid/…-kerr.py` | idem | ✅ |

**A armadilha do descarte silencioso do plano 020 não se manifestou neste caminho.** Registro do
que foi de fato exercitado, para não superestimar a prova: o save foi feito **de dentro do
subpainel do item**, sem voltar ao formulário-pai entre a última alteração e o `Save`. O modo de
falha que o 020 descreve é a re-inicialização **ao voltar** de um subpainel — este caminho não o
atravessa. O contorno do plano ("alterar `linguagem` por último") portanto **continua valendo**, e a
lição operacional para a fase 3 e para o manual da fase 5 é mais estreita e mais útil do que
"o problema sumiu": **salvar sem sair do subpainel evita a armadilha.**

### `astro check` — lendo a saída, não o exit code

```
09:34:16 [content] Syncing content
09:34:16 [content] Content config changed
09:34:16 [content] Clearing content store
09:34:16 [content] Synced content
09:34:16 [types] Generated 577ms
09:34:16 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

CHECK_EXIT=0
```

Conferido conforme a armadilha 2 do plano 020: **nenhuma linha `[ERROR] [content]` no corpo da
saída**, não apenas exit 0. O `scripts[]` gravado pelo painel valida contra o Zod.

### `tina/tina-lock.json` regenerado

Regenerado pelo `tinacms dev` (o `tinacms build --skip-cloud-checks` não reescreve — detalhe do
plano 018, confirmado de novo). Diferença contra o `HEAD`, por nome:

```
=== ACRESCENTADOS ===
"name":"aula"
"name":"linguagem"
"name":"scripts"
=== REMOVIDOS ===
(nenhum)
=== contagem ===
head: 61  working tree: 64
```

Tipos GraphQL novos, com as ocorrências no arquivo:

```
      2 DisciplinasScripts
      2 DisciplinasScriptsFilter
      2 DisciplinasScriptsMutation
```

Três tipos acrescentados, **zero removidos** — coerente com o `Reason: [NON_BREAKING - TYPE_ADDED]
Type 'DisciplinasScripts' was added` do cloud-check. O lock passou de 117.676 para 123.004 bytes.

### Sequência local depois do save pelo painel

```
> haroldo-page@0.1.0 lint
> eslint .
LINT_EXIT=0

> haroldo-page@0.1.0 format:check
> prettier --check .
Checking formatting...
All matched files use Prettier code style!
FMT_EXIT=0

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 Test Files  4 passed (4)
      Tests  107 passed (107)
   Start at  09:35:06
   Duration  987ms (transform 1.06s, setup 0ms, import 1.67s, tests 48ms, environment 0ms)

Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )
COV_EXIT=0
```

O `.md` gravado pelo painel passa no `prettier --check` sem reformatação — o painel não produz
frontmatter que a verificação de formato reprove.
