# Plano 021 — ADRs das decisões da fase 1, verificação do `/admin` e fechamento da fase

**Status:** TODO
**RFs cobertos:** fase 1, itens "`/admin` funciona localmente e edita todas as coleções" e
"testes unitários da fase escritos e passando"; §7.2 ("cada decisão vira um ADR"); §12
**Depende de:** planos 015 a 020
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A fase 1 fecha: o critério de conclusão do §6.2 é demonstrado na prática, as decisões
implementadas viram ADRs, o checklist §12 vai a 9/9 e o CHANGELOG registra a fase.

## Arquivos afetados

- `docs/adr/0003-*.md` a `docs/adr/0007-*.md` — criar (ver seção 1)
- `docs/CHANGELOG.md` — seção da fase 1
- `PRD.md` — checklist §12 da fase 1, tabela de progresso, linha de versão em §0.1
- `plans/fase-1-modelo-de-conteudo/README.md` — criar, no molde do README da fase 0
- `plans/README.md` — atualizar o estado da fase 1 no índice
- `README.md` — seção do painel, se o fluxo tiver mudado desde o plano 015

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### 1. Os ADRs que a fase 1 deve

A §7.2 determina: *"Cada decisão acima deve virar um ADR curto em `docs/adr/` na fase em que for
implementada."* A fase 0 escreveu o ADR-0001 (D-01) e o ADR-0002 (overrides, hoje revertido).
A fase 1 **implementa cinco decisões** e deve um ADR para cada:

| ADR | Decisão | O que registrar |
|---|---|---|
| 0003 | **D-02** — painel por formulários, sem visual editing | O visual editing exigiria `output: 'server'`, adapter e ilhas Tina por página, contra D-01. Custo aceito: não se clica no texto para editar |
| 0004 | **D-03** — i18n por grupo `en` no mesmo arquivo | Alternativa rejeitada: pastas `pt/`/`en/` espelhadas. Motivo: editor único, sem par órfão, um formulário só |
| 0005 | **D-04** — rascunho como campo `publicado` | Editorial Workflow é pago. **Registre a consequência de 2026-09-01:** com o repositório público, `publicado: false` esconde do site, não do GitHub |
| 0006 | **D-05** — aulas, listas e materiais embutidos | Consequência aceita: aula não tem página própria; se um dia precisar, migra para coleção separada |
| 0007 | **D-07** — campo de material como URL livre | Decisão do stakeholder; o Drive vira recomendação do manual, não dependência de arquitetura |

A **D-06** (Zod × Tina com teste de paridade) também é implementada na fase 1 — decida se ela
merece ADR próprio ou se o plano 019 já é registro suficiente, e **justifique a escolha**.

Formato, seguindo o ADR-0001: Título · Status · Data absoluta · Contexto · Decisão ·
Alternativas consideradas · Consequências · Referências. Curtos, em português, uma página.

### 2. O critério de conclusão da fase, que é o item mais importante

O §6.2 define para a fase 1:

> **O professor consegue, localmente, criar e editar item de cada coleção pelo painel.**

Isso não se demonstra rodando teste. Demonstra-se **usando o painel**: subir `/admin`, criar um
item novo em cada uma das cinco coleções e editar um existente em cada, conferindo que o arquivo
no disco mudou. Cole na Evidência o que foi criado e o `git status` correspondente.

⚠️ **Não marque este item do checklist sem ter feito isso.** É o critério de aceitação da fase
inteira; um "os testes passam" não substitui.

### 3. Testes da fase

O checklist pede "testes unitários da fase escritos e passando". Some o que os planos 016, 018
e 019 produziram e confira contra a §11: a meta é **≥ 80% dos módulos de `src/lib/` e
`src/i18n/`**. Note que o `vitest.config.ts` **não tem `thresholds`** — a meta é relatada, nunca
imposta, e isso está registrado como dívida desde a fase 0. **Decida aqui se a fase 1 é o
momento de impor o threshold**, e registre a decisão de um jeito ou de outro.

### 4. Checklist §12 e nota de progresso

Os 9 itens da fase 1, cada um com o plano que o fecha: `src/content.config.ts` (016) ·
`tina/config.ts` (015+017) · campo `publicado` (016+017) · grupo `en` (018) · templates de nome
(017) · teste de paridade (019) · conteúdo placeholder (020) · `/admin` editando tudo (021) ·
testes da fase (016+018+019).

**Só marque `[x]` o item cujo plano estiver com Evidência preenchida.** A tabela "📊 Progresso
Geral" precisa passar de `0/9 ⬜` para `9/9 🟢` e o número tem de bater com as caixas.

Acrescente a linha de versão em §0.1 — **confira qual é a próxima**, porque a numeração já
passou por v0.1.6 e o plano 013 tropeçou exatamente nisso ao supor uma versão que já existia.

### 5. Dívidas a levar adiante

Confira e atualize, na seção de dívidas do README da fase 0 e no novo README da fase 1:
`.env.example:23` ainda com o subdomínio provisório; `wrangler.toml:5-6` com comentário
obsoleto; `Versão do PRD` em §0 ainda em `v0.1`; cobertura sem `thresholds`; o teste da regra
`process.env` que varre só `.ts` sob `src/` — **e a fase 1 traz muitos `.astro`**, então essa
dívida passa a morder aqui.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Conferir a Evidência dos planos 015 a 020.
   → verify: liste quais têm Evidência preenchida e quais não.
2. Escrever os ADRs 0003 a 0007; decidir e justificar o caso da D-06.
   → verify: cada ADR cita a alternativa rejeitada e a consequência aceita.
3. **Demonstrar o critério de conclusão da fase** criando e editando um item em cada uma das
   cinco coleções pelo `/admin`.
   → verify: `git status --short` e a descrição do que foi feito em cada coleção.
4. Somar os testes da fase e decidir sobre `thresholds` de cobertura.
   → verify: número de testes antes e depois da fase; decisão registrada.
5. Atualizar o checklist §12, a tabela de progresso, §0.1 e o CHANGELOG.
   → verify: contagem de `- [x]` na Fase 1 igual ao número da tabela.
6. Criar o `README.md` da fase 1 e atualizar o índice `plans/README.md`.
   → verify: o índice reflete a fase 1 como concluída.
7. Rodar a sequência de qualidade, commitar, empurrar e confirmar CI verde.
   → verify: os quatro verdes, `git show --stat HEAD` e o resultado do CI.

## Critérios de aceitação

- [ ] ADRs 0003 a 0007 escritos, curtos, em português, com data absoluta
- [ ] Caso da D-06 decidido e justificado
- [ ] **Critério de conclusão da fase demonstrado**: item criado **e** editado em cada uma das
      cinco coleções pelo `/admin`, com prova no `git status`
- [ ] Testes da fase somados e conferidos contra a meta da §11; decisão sobre `thresholds`
      registrada
- [ ] §12: os 9 itens da fase 1 marcados e a tabela em `9/9 🟢`, com as caixas batendo
- [ ] Linha de versão acrescentada em §0.1, **com o número correto** — confira o histórico
- [ ] **Cabeçalho §0 do PRD atualizado**: `Status`, `Estado da implementação` e
      `Última atualização`. O `Status` só aceita o vocabulário fechado do `PRD_TEMPLATE.md`
      (`🟡 Rascunho · 🔵 Em revisão · 🟢 Aprovado · ⚫ Arquivado`); o progresso da fase vai na
      linha `Estado da implementação`
- [ ] `docs/CHANGELOG.md` com a fase 1; nenhuma tag criada
- [ ] `README.md` da fase 1 criado; índice `plans/README.md` atualizado
- [ ] Dívidas revisadas e migradas para o README da fase 1
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] CI verde após o push
- [ ] Nenhum item do checklist marcado sem Evidência no plano de origem

## Evidência

<Preenchido pelo executor: lista dos planos 015–020 com Evidência conferida, descrição da
demonstração do critério de conclusão coleção por coleção, contagem de testes, saída dos quatro
comandos, `git show --stat HEAD` e resultado do CI.>
