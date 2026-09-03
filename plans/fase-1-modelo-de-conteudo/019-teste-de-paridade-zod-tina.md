# Plano 019 — Teste de paridade entre os schemas Zod e Tina (D-06)

**Status:** TODO
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

- [ ] Teste de paridade escrito e passando
- [ ] Compara campos, obrigatoriedade, enums, grupo `en` e listas embutidas
- [ ] **Falsificabilidade provada** nos **dois** sentidos: campo só no Tina e campo só no Zod,
      cada um fazendo o teste falhar
- [ ] Divergências encontradas na primeira execução listadas e corrigidas
- [ ] **As duas divergências herdadas tratadas explicitamente:** o formato do valor de
      `projetos.linha_relacionada` (corrigido, com o `// NOTE:` de `tina/config.ts` removido) e o
      subcampo obrigatório de lista embutida que não bloqueia o save (decidido e justificado,
      ainda que a decisão seja aceitar e registrar)
- [ ] **Nenhum dos três falsos positivos tratado como bug:** `linhas_pesquisa` × `'linhas-pesquisa'`,
      restrições finas do Zod sem equivalente no Tina, e a assimetria esperada dentro do grupo `en`
- [ ] O teste roda no CI
- [ ] Abordagem de comparação justificada, com a limitação assumida escrita
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

<Preenchido pelo executor: abordagem escolhida e por quê, lista das divergências encontradas, as
duas execuções com canário falhando, a execução verde, e o trecho do workflow do CI.>
