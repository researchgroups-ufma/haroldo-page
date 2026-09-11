# Plano 032 — `npm audit` no CI, com política de severidade e a exceção do TinaCMS registrada

**Status:** TODO
**RFs cobertos:** RNF-07, RNF-08; **dívida 6** da fase 1
**Depende de:** plano **024** — os dois editam `.github/workflows/ci.yml` **e** `README.md`.
**Serialize.** Também não rode em paralelo com 031 nem 034, pelo mesmo motivo (`README.md`). Pode
rodar em paralelo com **030** e **033**.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O CI passa a **olhar** para as vulnerabilidades das dependências, com política escrita: reprova em
`high`/`critical`, relata `moderate`/`low`. As 8 moderadas conhecidas — sem correção nossa
disponível — ficam registradas em ADR próprio, com alcance medido e gatilho de revisão, em vez de
viverem só num README de fase.

## Arquivos afetados

- `.github/workflows/ci.yml` — passo novo de `npm audit`
- `docs/adr/0010-npm-audit-no-ci-e-severidade.md` — **novo**
- `README.md` — a última linha da seção "Troubleshooting" afirma hoje que `npm audit` está em
  **zero vulnerabilidades**; é falso desde 2026-09-03

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** tente "corrigir" as vulnerabilidades — não há correção nossa disponível
> (ver abaixo). **Não** rode `npm audit fix`, **não** acrescente `overrides` ao `package.json`
> (o projeto removeu todos deliberadamente no plano 014, e o README manda não recriá-los sem
> motivo escrito) e **não** troque a versão do `tinacms`.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 estático + TinaCMS 3.12.1. Windows 11 / PowerShell, Node
24.16.0. CI em `.github/workflows/ci.yml`, job único `qualidade`: `npm ci` → `lint` →
`format:check` → `test:coverage` → `build:pipeline` (este último passa a ser o comando depois do
plano 024).

**O estado medido, e como ele chegou aqui:**

- Fim da fase 0 (2026-09-01, plano 014): **0 vulnerabilidades**, depois do upgrade Astro 5 → 7 e
  da remoção de **todos** os `overrides`.
- 2026-09-03, já na fase 1 (plano 015 trouxe o TinaCMS): **8 vulnerabilidades moderadas**, todas
  de `react-router@6.30.6`, cuja **única** origem é `tinacms@3.12.1 → react-router-dom`
  (confirmado por `npm ls react-router`).
- Advisory: [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) — open
  redirect via barra invertida em `<Link>`/`useNavigate`.
- **Não há correção nossa.** Sai quando o TinaCMS subir a dependência.
- **Alcance:** o painel `/admin`, que é React, autenticado, usado por uma pessoa. **O site público
  não carrega React** (D-01, medido no plano 015) — a superfície exposta a visitante é zero.
- **O CI não roda `npm audit` hoje.**

### A decisão — já tomada, não reabra sem evidência nova

**O CI ganha um passo `npm audit --audit-level=high`.**

Três pontos, cada um com razão:

1. **Reprova em `high`/`critical`, não em `moderate`.** Reprovar em `moderate` deixaria o CI
   **vermelho permanentemente**, por uma vulnerabilidade que não temos como corrigir e que não
   alcança visitante nenhum. Este projeto já viveu o custo disso: o CI ficou vermelho por **14
   commits seguidos** e ninguém olhou, porque um sinal que está sempre vermelho deixa de ser
   sinal. Um portão que se espera que falhe treina as pessoas a ignorá-lo.
2. **As moderadas continuam visíveis.** `npm audit --audit-level=high` **imprime** todas as
   vulnerabilidades e só falha a partir de `high` — a informação não some do log, só deixa de
   reprovar. Confirme esse comportamento na prática (passo 3) em vez de acreditar na documentação;
   se a bandeira também suprimir a listagem, use a forma que preserve a listagem e registre a
   diferença.
3. **Não `continue-on-error`.** Um passo que nunca falha é decoração. Se aparecer uma `high`, o CI
   vermelho é o comportamento desejado — e o ADR precisa dizer o que se faz então: avaliar
   alcance, e (a) atualizar a dependência, (b) registrar exceção **datada** com justificativa
   escrita no ADR, ou (c) trocar a dependência. Nunca "afrouxar o nível para passar".

**Onde o passo entra:** depois de `npm ci` e antes do `lint` — falha barata primeiro. Ele não
precisa de segredo nenhum.

**Gatilho de revisão do ADR-0010:** quando o TinaCMS subir `react-router-dom`, ou quando surgir
`high` na árvore. Registre também que a decisão de reprovar só em `high` **muda** se o site
público passar a carregar React — o que hoje é impossível por D-01 e seria uma decisão
arquitetural própria.

### A afirmação falsa que este plano corrige

`README.md`, fim da seção "Troubleshooting": *"`npm audit` está em **zero vulnerabilidades**"*.
Verdadeiro quando escrito (plano 014, fase 0), falso desde 2026-09-03. Corrija dizendo o estado
real, a origem, o alcance e a ausência de correção nossa — e aponte para o ADR-0010 em vez de
repetir a história ali. Pelo `CLAUDE.md` do projeto, **doc e código divergem ⇒ o código é a
verdade, e a divergência é reportada, não escondida**.

### O que este plano NÃO faz

- ⛔ **Não corrige, não contorna e não silencia** as 8 moderadas.
- ⛔ **Não recria `overrides`** no `package.json` (plano 014 os removeu; o README manda não voltar
  sem motivo escrito, e o histórico está em `docs/adr/0002-pin-do-vite-via-overrides.md`).
- ⛔ **Não mexe no comando de build do CI** — é do plano 024.
- ⛔ **Não declara dependência nova** — é do plano 030.
- ⛔ **Não adota `npm audit` no `build:pipeline`.** Auditoria é assunto do portão de qualidade, não
  do deploy: um advisory publicado às 3 da manhã não pode impedir o professor de publicar uma aula.
  Registre essa distinção no ADR.

### Padrões da casa

- ADR na forma dos irmãos (`docs/adr/0001`…`0009`), com alternativas rejeitadas e **gatilho de
  revisão**.
- `git add` por caminho explícito; `Status:` fica em `TODO`; Evidência é saída literal colada.
- Este plano não muda schema — `npm run build` fecha verde sem depender de push.

## Passos

1. Medir o estado real **antes de decidir qualquer coisa**: `npm audit`, `npm audit --json | ...`
   (contagem por severidade) e `npm ls react-router`.
   → verify: as três saídas coladas. Se o número não for mais 8 moderadas, **registre o número
   real** e siga — a política não muda, os números do ADR sim.
2. Verificar o comportamento de `npm audit --audit-level=high` na árvore atual: exit code e se as
   moderadas continuam listadas.
   → verify: cole a saída e o exit code (`$LASTEXITCODE` no PowerShell). Este é o ponto em que a
   decisão do "Contexto necessário" se confirma ou se corrige.
3. Provar que o passo é **falsificável**: force uma condição em que ele deveria falhar — por
   exemplo `npm audit --audit-level=moderate`, que hoje reprova pelas 8 moderadas.
   → verify: saída e exit code diferente de zero, colados. Sem isso, "o passo passa" não significa
   nada (lição 9 da fase 0).
4. Acrescentar o passo ao `ci.yml`, entre `npm ci` e `npm run lint`, com comentário curto que diga
   **por que** o nível é `high` e aponte para o ADR-0010.
   → verify: `git diff -- .github/workflows/ci.yml` mostrando apenas o passo novo e seu comentário
   — nada mais (o comando de build e o comentário das actions são do plano 024).
5. Escrever `docs/adr/0010-npm-audit-no-ci-e-severidade.md`: contexto (a chegada do TinaCMS e as 8
   moderadas), decisão (os três pontos), alternativas rejeitadas (reprovar em `moderate`;
   `continue-on-error`; `overrides`; não auditar), consequências (o que se faz quando aparecer uma
   `high`) e gatilho de revisão.
   → verify: o ADR cita os números medidos no passo 1 e o advisory pelo identificador.
6. Corrigir a afirmação de `npm audit` zero no `README.md`.
   → verify: releia a seção "Troubleshooting" inteira; nenhuma afirmação falsa sobra.
7. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build`
   verdes, saídas coladas; a do `build` **lida**.

## Critérios de aceitação

- [ ] Estado real do `npm audit` medido e colado **antes** da mudança, com contagem por severidade
      e `npm ls react-router`
- [ ] Passo `npm audit --audit-level=high` no `ci.yml`, entre `npm ci` e `npm run lint`, **sem**
      `continue-on-error`
- [ ] Comportamento da bandeira verificado na prática: exit code colado e confirmação de que as
      moderadas continuam **listadas** no log
- [ ] **Falsificabilidade provada** (`--audit-level=moderate` reprovando hoje), com exit code
      colado
- [ ] `docs/adr/0010-npm-audit-no-ci-e-severidade.md` escrito, com alternativas rejeitadas,
      consequências e **gatilho de revisão**
- [ ] `README.md` sem a afirmação de "zero vulnerabilidades", com o estado real e o ponteiro para
      o ADR
- [ ] Nenhuma vulnerabilidade "corrigida", nenhum `override`, nenhuma versão de dependência
      alterada — `git diff -- package.json package-lock.json` **vazio**
- [ ] O comando de build do `ci.yml` **inalterado** por este plano
- [ ] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado, **com o passo novo
      visível no log** — cole o trecho

## Evidência

<Preenchida pelo executor. O passo de auditoria só vale se tiver sido provado capaz de reprovar —
cole o exit code das duas execuções.>
