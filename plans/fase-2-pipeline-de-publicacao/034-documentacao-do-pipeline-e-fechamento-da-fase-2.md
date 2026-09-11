# Plano 034 — Documentação do pipeline no README e fechamento da fase 2

**Status:** TODO
**RFs cobertos:** §10.5 (README de manutenção); fase 2, **item 8** do §12; fechamento do checklist
da fase (8/8) e do §0 do PRD
**Depende de:** **todos os demais planos da fase 2 (023–033) em `DONE`.** Um README que descreve um
pipeline que ainda não fechou é a mesma dívida que o plano 023 veio corrigir.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente** para a redação — todos os números que ele precisa já estarão colados
nas Evidências dos planos 025 a 029. **Dois passos são do orquestrador:** conferir que os onze
planos anteriores estão `DONE` e promover o `Status:` deste.
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Quem chegar ao projeto sem contexto consegue, lendo o `README.md`, entender o caminho completo de
uma edição do professor até o site publicado — e o que fazer quando ele quebra. O checklist da
fase 2 fecha em 8/8, o §0 do PRD volta a refletir a realidade, e o que a fase 2 **não** resolveu
fica escrito com destino nomeado (fase 3, fase 5 ou dívida aberta).

## Arquivos afetados

- `README.md` — a seção "Deploy" (hoje descreve deploy **manual** e diz que o automático "só é
  ligado na fase 2") e uma seção nova de pipeline
- `PRD.md` — §0 (`Estado da implementação`, `Versão do PRD`, `Última atualização`), §0.1 (linha
  nova) e §12 (checklist da fase 2 e a tabela de progresso)
- `plans/README.md` — a linha da fase 2 na tabela
- `plans/fase-2-pipeline-de-publicacao/README.md` — tabela de estado, o que a fase deixou aberto e
  o que ela empurra para as fases 3 e 5

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** altere o `Status` do PRD (`🟢 Aprovado`) e **não** marque item de checklist de outra
> fase. **Não** promova `Status:` de plano nenhum — nem o deste.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). Astro 7
estático (D-01) + TinaCMS, deploy no Cloudflare Workers, conteúdo em `content/` versionado no
GitHub.

**Onde estão os números.** Não reproduza de cabeça e não estime: cada valor vem colado de uma
Evidência de plano desta fase.

| O que documentar | Onde está |
|---|---|
| Comando de build dos pipelines e por que sem cloud check | plano 024 + `docs/adr/0009-build-de-pipeline-sem-cloud-check.md` |
| Configuração do Workers Builds, variáveis e duração do primeiro build | Evidência do plano 025 |
| `/admin` em produção: URLs que funcionam, como se autentica | Evidência do plano 026 |
| Papéis, vagas do plano gratuito e o que o EDITOR não pode | Evidência do plano 027 |
| Notificação de falha, comportamento F-02/RNF-04 e a mensagem de erro real | Evidência do plano 028 |
| M-02: os 10 ΔT, mediana, e o que **não** foi provado | Evidência do plano 029 |
| Portão de conteúdo e o que ele reprova | plano 030 |
| Verificação do `tina-lock.json` | plano 031 |
| Política de `npm audit` | plano 032 + `docs/adr/0010-npm-audit-no-ci-e-severidade.md` |
| Avisos do painel para a fase 5 | `docs/avisos-do-painel-para-o-manual.md` (plano 033) |

### O que a seção nova do README tem de responder

Escreva para quem **não** acompanhou a fase. Cinco perguntas, nesta ordem:

1. **O que acontece quando o professor clica em Salvar?** A cadeia inteira: painel → TinaCloud →
   commit na `main` → Workers Builds → `npm run build:pipeline` → `wrangler deploy` → versão nova
   no Worker. Com o tempo típico medido no plano 029, não com "poucos minutos".
2. **Quem roda o quê.** GitHub Actions (portão de qualidade) e Workers Builds (deploy) disparam no
   mesmo push e **correm em paralelo** — o CI **não** é portão do deploy. O que protege o site de
   conteúdo inválido é o próprio `build:pipeline`, que roda `vitest run tests/content` antes de
   tudo. Isso é deliberado (ADR-0009) e precisa estar dito, porque contraria a expectativa normal.
3. **Onde vive cada variável de ambiente:** `.env` local, secrets do GitHub Actions, variáveis do
   Workers Builds — e o que é segredo (`TINA_TOKEN`) e o que não é. Ver §7.6.
4. **O que acontece quando o build falha** — F-02/RNF-04, com o comportamento medido no plano 028:
   site no ar com a versão anterior, ADMIN notificado, conteúdo preservado no repositório para
   correção. E **como diagnosticar**: onde está o log, o que a mensagem nomeia.
5. **O que fazer para mudar o schema**, agora que o pipeline não roda cloud check: a ordem
   `revisão → commit → push → TinaCloud reindexa → npm run build (local, com cloud check) verde` e
   a regeneração do `tina/tina-lock.json` por `tinacms dev` — com a nota de que o plano 031 fez
   disso um teste.

**A seção "Deploy" atual fica falsa** assim que o plano 025 fecha: ela diz "hoje o deploy é
**manual**" e "o deploy automático … só é ligado na fase 2". Reescreva-a; mantenha `npm run deploy`
documentado como **caminho manual de emergência**, com a diferença registrada (ele usa
`npm run build`, com cloud check — decisão do ADR-0009).

### O fechamento da fase — o que precisa estar escrito, e o que não pode ser inventado

**Checklist §12 da fase 2, os oito itens.** Marque `- [x]` apenas os que tiverem Evidência, e
anexe a cada um o plano e o artefato que o fecha, no estilo das fases 0 e 1 (que citam plano e
commit em cada linha). **Item sem Evidência fica desmarcado** — critério de aceitação não se
reescreve para caber no resultado (lição 5 da fase 0).

**O item 7 exige cuidado redobrado.** O texto do checklist diz "Ciclo ponta a ponta cronometrado:
edição do EDITOR **visível no site** (M-02)". A fase 2 **não tem página que renderize conteúdo** —
o site público é a fase 3. O que o plano 029 mede é a cadeia até a publicação da versão nova. Ao
marcar o item, **escreva a ressalva na própria linha**: o que foi medido, o que não foi, e que
M-02 é remedida na fase 5 (o PRD já agenda as duas medições em §3.3). Marcar o item sem essa
ressalva seria transformar uma limitação declarada em afirmação falsa.

**§0 do PRD:** `Versão do PRD` para `v0.1.21`, `Estado da implementação` com a fase 2 concluída na
data real, `Última atualização` na data real e linha nova em §0.1. `Status` **não muda**.

**Tabela de progresso do §12:** fase 2 para `8/8 · 🟢 Concluída` (ou o número real, se algum item
tiver ficado aberto — e nesse caso a fase **não** é declarada concluída).

**README da fase 2:** tabela de estado com os doze planos, seus commits e o agente; a seção "o que
a fase 2 empurra para as fases seguintes", montada a partir do que os planos registraram — no
mesmo espírito com que o plano 021 montou a lista das sete dívidas para esta fase. Registre em
especial:

- o que ficou para a **fase 3**: a renderização que torna M-02 verificável de ponta a ponta; a
  dívida 7(b) do teste de paridade (enum depois do ramo `campo.list`), que só ganha teste quando
  existir campo com `list: true` **e** `options`;
- o que ficou para a **fase 5**: `docs/avisos-do-painel-para-o-manual.md` como insumo obrigatório
  do manual; a remedição de M-02; o teste de restauração de conteúdo excluído (§9);
- **dívidas novas que a própria fase 2 criou**, se houver. Se não houver nenhuma, diga isso
  explicitamente — "nenhuma" é uma afirmação, e o leitor precisa saber que ela foi feita de
  propósito, não por esquecimento.

### O que este plano NÃO faz

- ⛔ **Não escreve o manual do professor** (fase 5).
- ⛔ **Não constrói página** nem antecipa fase 3.
- ⛔ **Não conserta nada que os planos anteriores tenham deixado aberto.** Achado aberto vira
  linha no README da fase, com destino — não conserto de passagem no plano de fechamento.
- ⛔ **Não cria ADR novo**, a menos que a fase tenha tomado uma decisão arquitetural que não esteja
  nos ADRs 0009 e 0010. Se tiver, ele é o **0011** e o plano para e reporta antes de escrever, para
  que a decisão passe pelo caminho certo.

### Padrões da casa

- Datas absolutas. Português. `git add` por caminho explícito. `Status:` fica em `TODO`.
- **Nada se declara pronto por relato:** toda linha marcada no §12 aponta para a Evidência que a
  sustenta.
- A verificação autoritativa inclui o `conclusion` do run do GitHub Actions sobre o commit
  empurrado.

## Passos

1. 🧑 **(orquestrador)** Conferir que os planos 023 a 033 estão todos `Status: DONE`, com Evidência
   preenchida.
   → verify: a lista dos onze, com o `Status:` de cada um, colada. Qualquer um em `TODO` **para
   este plano** — o fechamento não antecede o que fecha.
2. Ler as Evidências dos planos 024 a 033 e extrair a tabela de números do "Contexto necessário".
   → verify: uma tabela na Evidência com cada número e o plano de origem. Número sem origem não
   entra no README.
3. Reescrever a seção "Deploy" do `README.md` e escrever a seção nova do pipeline, respondendo às
   cinco perguntas.
   → verify: releia o `README.md` **inteiro** e liste as afirmações que a fase 2 tornou falsas —
   inclusive fora das seções tocadas. Corrija as que estiverem no escopo deste plano; **reporte** as
   que não estiverem.
4. Marcar o checklist da fase 2 no §12 do PRD, item a item, com plano e artefato; e a ressalva do
   item 7.
   → verify: cada `- [x]` com a origem citada; itens sem Evidência desmarcados e o motivo escrito.
5. Atualizar o §0 e o §0.1 do PRD e a linha da fase 2 em `plans/README.md`.
   → verify: `git diff -- PRD.md plans/README.md` sem alteração fora do previsto; `Status`
   inalterado em `🟢 Aprovado`.
6. Atualizar `plans/fase-2-pipeline-de-publicacao/README.md`: tabela de estado com commits, e a
   seção do que a fase empurra para as fases 3 e 5, mais as dívidas novas (ou a afirmação de que
   não há).
   → verify: os doze planos na tabela, cada um com commit; a seção de repasse escrita.
7. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build`
   verdes, saídas coladas; a do `build` **lida**, não só o exit code.

## Critérios de aceitação

- [ ] Planos 023–033 conferidos em `DONE` antes de qualquer escrita
- [ ] `README.md` com a seção de pipeline respondendo às cinco perguntas, com **números vindos das
      Evidências**, não estimados
- [ ] Seção "Deploy" reescrita: automático como caminho normal, `npm run deploy` como emergência,
      com a diferença de comando registrada
- [ ] Distinção CI × deploy escrita explicitamente (o CI **não** é portão do deploy)
- [ ] §12 do PRD com os oito itens da fase 2 marcados **só onde há Evidência**, cada um citando
      plano e artefato
- [ ] **Ressalva do item 7 escrita na própria linha**: o que M-02 mediu, o que não foi verificável
      nesta fase (renderização) e a remedição na fase 5
- [ ] Tabela de progresso do §12 com o número real da fase 2; `🟢 Concluída` **apenas** se 8/8
- [ ] §0 do PRD em `v0.1.21`, com `Estado da implementação` e `Última atualização` reais; `Status`
      inalterado
- [ ] Linha nova em §0.1
- [ ] `plans/README.md` com a linha da fase 2 atualizada
- [ ] README da fase 2 com a tabela dos doze planos (commit e agente) e a seção de repasse para as
      fases 3 e 5, incluindo a dívida 7(b) e os avisos do plano 033
- [ ] Dívidas novas criadas pela fase 2 listadas — ou a afirmação explícita de que não há
- [ ] Nenhum ADR novo escrito sem que a decisão correspondente tenha sido reportada antes
- [ ] Afirmações do `README.md` que a fase 2 tornou falsas: corrigidas (se no escopo) ou
      **reportadas** (se fora)
- [ ] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

<Preenchida pelo executor. A tabela "número → plano de origem" do passo 2 é parte obrigatória da
Evidência: é o que distingue documentação verificada de documentação plausível.>
