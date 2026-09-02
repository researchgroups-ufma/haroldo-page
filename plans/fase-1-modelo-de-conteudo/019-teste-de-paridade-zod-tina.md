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
- [ ] O teste roda no CI
- [ ] Abordagem de comparação justificada, com a limitação assumida escrita
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

<Preenchido pelo executor: abordagem escolhida e por quê, lista das divergências encontradas, as
duas execuções com canário falhando, a execução verde, e o trecho do workflow do CI.>
