# Plano 032 — `npm audit` no CI, com política de severidade e a exceção do TinaCMS registrada

**Status:** TODO
**RFs cobertos:** RNF-07, RNF-08; **dívida 6** da fase 1
**Depende de:** plano **024** — os dois editam `.github/workflows/ci.yml` **e** `README.md`.
**Serialize.** O 030, o 031 e o 033 já estão DONE; resta o **034**, que também edita `README.md` —
não rode os dois em paralelo.
**Emendado em 2026-09-12** pelo stakeholder: ganha o passo 1 (subir o `wrangler`). Ver
"A emenda de 2026-09-12".
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O CI passa a **olhar** para as vulnerabilidades das dependências, com política escrita: reprova em
`high`/`critical`, relata `moderate`/`low`. As moderadas sem correção nossa disponível ficam
registradas em ADR próprio, com alcance medido e gatilho de revisão, em vez de viverem só num README
de fase.

**E o portão nasce verde**, como o do 031 — porque o passo 1 remove as três `high` que existem hoje
antes de o portão ser ligado. Ligar um portão que já nasce vermelho é o modo de falha que este
projeto pagou com 14 commits de CI vermelho que ninguém olhou.

## Arquivos afetados

- `package.json` e `package-lock.json` — **só** a subida do `wrangler` de `4.128.0` para `4.131.1`
  (passo 1). Nada mais.
- `.github/workflows/ci.yml` — passo novo de `npm audit`
- `docs/adr/0010-npm-audit-no-ci-e-severidade.md` — **novo**
- `README.md` — a última linha da seção "Troubleshooting" afirma hoje que `npm audit` está em
  **zero vulnerabilidades**; é falso desde 2026-09-03

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** acrescente `overrides` ao `package.json` (o projeto removeu todos
> deliberadamente no plano 014, e o README manda não recriá-los sem motivo escrito), **não** troque
> a versão do `tinacms` nem do `@tinacms/cli`, e **não** rode `npm audit fix` — a única mudança de
> dependência autorizada é a do passo 1, feita nominalmente.

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
- **Alcance:** o painel `/admin`, que é React, autenticado, usado por uma pessoa. **O site público
  não carrega React** (D-01, medido no plano 015) — a superfície exposta a visitante é zero.
- **O CI não roda `npm audit` hoje.**
- **2026-09-12, medido pelo orquestrador: o número não é mais 8.** São **11 vulnerabilidades
  (8 `moderate`, 3 `high`)** — as três `high` chegaram depois e são de outra cadeia. Ver a emenda
  abaixo, que é a razão de este plano ter ganhado um passo 1.

### A emenda de 2026-09-12 — por que o plano ganhou um passo 1

O plano foi escrito supondo que a árvore só tinha moderadas sem correção. **Isso deixou de ser
verdade.** Medição do orquestrador em 2026-09-12, com `npm audit --json`:

```
miniflare  high  via sharp                fixAvailable: wrangler@4.131.1  isSemVerMajor: FALSE
sharp      high  libheif (GHSA-rgj7-...)  fixAvailable: wrangler@4.131.1  isSemVerMajor: FALSE
wrangler   high  dev=True                 faixa vulnerável: 4.16.0 - 4.130.0
```

Instalado: `wrangler@4.128.0`, **`devDependency`, versão exata**. Última publicada: **4.131.1**.

Três fatos que decidem o caso:

1. **A faixa vulnerável termina em `4.130.0`.** `4.131.1` sai dela por definição, não por promessa.
2. **Não é `major`.** 4.128 → 4.131, mesmo major, e é a última publicada — não estamos nos
   adiantando a nada.
3. **É `devDependency`.** Não entra no Worker: o site serve assets estáticos (D-01, confirmado pela
   plataforma com `has_modules: false` no plano 025).

**Com isso, a política que este plano já tinha escrita — reprova em `high`/`critical` — passa a
nascer verde, sem exceção e sem afrouxamento.** As duas alternativas que o stakeholder considerou
foram **rejeitadas**, e o ADR-0010 tem de registrar por quê:

- **Reprovar só em `critical`** afrouxaria o portão **permanentemente** para contornar um problema
  com correção trivial e não-major. Compraria cegueira a `high` para sempre.
- **Exceção nomeada e datada** criaria dívida de manutenção (ADR + gatilho + alguém lembrar) para
  algo que não precisa de exceção. Exceção se reserva ao que não tem saída — e aqui tem.

### Achado da mesma medição: as 8 moderadas não são todas irreparáveis

O README da fase 2 e o contexto acima dizem que não há correção nossa para as 8. **Medido, são 5,
não 8:**

| Pacote | `fixAvailable` | Leitura |
|---|---|---|
| `tinacms`, `react-router`, `react-router-dom`, `@tinacms/app`, `@tinacms/cli` | `tinacms@1.5.5` / `@tinacms/cli@0.61.23`, `isSemVerMajor: true` | **Não é correção — é downgrade**: estamos em 3.12.1 e 2.6.1. O npm reporta assim quando não existe versão mais nova corrigida |
| `body-parser`, `express`, `qs` | **`true`** | Corrigíveis sem major |

**Este plano NÃO as corrige, de propósito.** Elas são `moderate`, e a política só reprova em
`high` — então não afetam o portão. Mexer nelas exigiria `npm audit fix`, cujo churn de lockfile
esta fase manda desconfiar (restrição aprendida nos planos 002/004/005/007 da fase 0), e seria
escopo especulativo num plano que já mexe em dependência. **O ADR-0010 registra o achado como
pendência nomeada e datada**, com o número real: o ADR documenta **5** moderadas sem saída, não 8,
e **3** corrigíveis adiadas com motivo escrito.

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
   reprovar. Confirme esse comportamento na prática (passo 4) em vez de acreditar na documentação;
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

- ⛔ **Não corrige, não contorna e não silencia** as moderadas — nem as 5 sem saída, nem as 3 que
  têm correção disponível (ver o achado acima; elas viram pendência nomeada no ADR).
- ⛔ **Não roda `npm audit fix`.** A única mudança de dependência é a do passo 1, nominal.
- ⛔ **Não sobe nenhuma outra dependência** além do `wrangler`.
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

1. **Medir o estado real ANTES de tocar em qualquer coisa**: `npm audit`, a contagem por severidade
   via `npm audit --json`, `npm ls react-router` e `npm ls wrangler miniflare`.
   → verify: as quatro saídas coladas, com a contagem por severidade e a cadeia do `wrangler`
   visíveis. **Este é o retrato "antes" e ele não pode ser reconstruído depois** — se você pular,
   o ADR não tem de onde tirar os números.
2. **Subir o `wrangler` de `4.128.0` para `4.131.1`** — a emenda de 2026-09-12. A versão é **exata**
   no `package.json` (sem `^`), então edite o número e rode `npm install` para atualizar o lock.
   → verify, e são quatro coisas, todas coladas:
   - `npm audit` depois da subida: as **3 `high` sumiram** e sobram só as moderadas. Se sobrar
     qualquer `high`, **pare e reporte** — a premissa do plano caiu.
   - `git diff -- package.json` mostrando **uma linha** alterada: a do `wrangler`.
   - O churn do `package-lock.json` medido: `git diff --stat -- package-lock.json`. **Desconfie de
     churn grande** — é a restrição que a fase 0 aprendeu nos planos 002/004/005/007. Se o diff
     tocar pacotes fora da cadeia `wrangler → miniflare → sharp`, reporte antes de seguir.
   - `npm ls wrangler miniflare` confirmando a árvore nova.
3. **Verificar que o `wrangler` novo ainda funciona**, já que ele está no caminho do deploy
   (`npm run deploy` = `npm run build && wrangler deploy`).
   → verify: `npx wrangler --version` e `npx wrangler deploy --dry-run` (ou `--outdir` num
   diretório temporário), saída colada. **NÃO faça deploy de verdade** — o deploy é do Workers
   Builds, e um `wrangler deploy` manual daqui atropelaria o pipeline.
4. Verificar o comportamento de `npm audit --audit-level=high` na árvore **já corrigida**: exit
   code e se as moderadas continuam listadas.
   → verify: cole a saída e o exit code (`$LASTEXITCODE` no PowerShell). Este é o ponto em que a
   decisão do "Contexto necessário" se confirma ou se corrige.
5. Provar que o passo é **falsificável**: force uma condição em que ele deveria falhar — por
   exemplo `npm audit --audit-level=moderate`, que continua reprovando pelas moderadas mesmo depois
   do passo 2.
   → verify: saída e exit code diferente de zero, colados. Sem isso, "o passo passa" não significa
   nada (lição 9 da fase 0). **Note que o passo 2 não destrói a falsificabilidade** — justamente
   porque as moderadas ficam.
6. Acrescentar o passo ao `ci.yml`, entre `npm ci` e `npm run lint`, com comentário curto que diga
   **por que** o nível é `high` e aponte para o ADR-0010.
   → verify: `git diff -- .github/workflows/ci.yml` mostrando apenas o passo novo e seu comentário
   — nada mais (o comando de build e o comentário das actions são do plano 024).
7. Escrever `docs/adr/0010-npm-audit-no-ci-e-severidade.md`: contexto (a chegada do TinaCMS, as
   moderadas e a chegada das três `high` do `sharp`/libheif), decisão (os três pontos **mais** a
   subida do `wrangler` como parte da mesma decisão), alternativas rejeitadas (reprovar em
   `moderate`; **reprovar só em `critical`**; **exceção nomeada e datada para o advisory do
   `sharp`**; `continue-on-error`; `overrides`; não auditar), consequências (o que se faz quando
   aparecer uma `high`) e gatilho de revisão.
   → verify: o ADR cita os números medidos nos passos 1 e 2 — **os dois retratos, antes e depois** —
   e cada advisory pelo identificador. Registra também a **pendência nomeada**: `body-parser`,
   `express` e `qs` têm correção disponível e ficaram de fora deste plano de propósito, com o
   motivo escrito.
8. Corrigir a afirmação de `npm audit` zero no `README.md`.
   → verify: releia a seção "Troubleshooting" inteira; nenhuma afirmação falsa sobra. O número que
   entrar ali tem de ser o **depois** do passo 2, não o antes.
9. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build`
   verdes, saídas coladas; a do `build` **lida**. O `npm ci` do CI vai reinstalar a partir do lock
   novo — se o lock estiver incoerente, é aqui que aparece.

## Critérios de aceitação

- [ ] Estado real do `npm audit` medido e colado **antes** de qualquer mudança, com contagem por
      severidade, `npm ls react-router` e `npm ls wrangler miniflare`
- [ ] `wrangler` subido de `4.128.0` para `4.131.1`, com `git diff -- package.json` mostrando
      **uma única linha** alterada
- [ ] `npm audit` depois da subida **sem nenhuma `high`**, saída colada
- [ ] Churn do `package-lock.json` medido (`git diff --stat`) e **contido à cadeia
      `wrangler → miniflare → sharp`**; qualquer pacote fora dela reportado
- [ ] `npx wrangler --version` e um `deploy --dry-run` verdes, saídas coladas — **sem deploy real**
- [ ] Passo `npm audit --audit-level=high` no `ci.yml`, entre `npm ci` e `npm run lint`, **sem**
      `continue-on-error`
- [ ] Comportamento da bandeira verificado na prática: exit code colado e confirmação de que as
      moderadas continuam **listadas** no log
- [ ] **Falsificabilidade provada** (`--audit-level=moderate` reprovando hoje), com exit code
      colado
- [ ] `docs/adr/0010-npm-audit-no-ci-e-severidade.md` escrito, com os **dois retratos** do audit
      (antes e depois do passo 2), as alternativas rejeitadas — inclusive **reprovar só em
      `critical`** e **exceção datada para o advisory do `sharp`** —, consequências e **gatilho de
      revisão**
- [ ] `README.md` sem a afirmação de "zero vulnerabilidades", com o estado real e o ponteiro para
      o ADR
- [ ] Nenhum `override` criado; **nenhuma** versão de dependência alterada além do `wrangler`;
      `npm audit fix` **não** executado — `git diff -- package.json` mostrando só a linha do
      `wrangler`
- [ ] As moderadas **não** corrigidas, e o ADR registrando o número real: **5** sem saída (o "fix"
      do npm é `major` para trás) e **3** corrigíveis adiadas com motivo escrito
- [ ] O comando de build do `ci.yml` **inalterado** por este plano
- [ ] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado, **com o passo novo
      visível no log** — cole o trecho

## Evidência

<Preenchida pelo executor, na execução — não depois da revisão. O passo de auditoria só vale se
tiver sido provado capaz de reprovar: cole o exit code das duas execuções. E cole os **dois
retratos** do `npm audit`, antes e depois da subida do `wrangler` — o "antes" não pode ser
reconstruído depois que o lock mudar.>
