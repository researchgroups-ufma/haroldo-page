# Plano 032 — `npm audit` no CI, com política de severidade e a exceção do TinaCMS registrada

**Status:** DONE
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

- [x] Estado real do `npm audit` medido e colado **antes** de qualquer mudança, com contagem por
      severidade, `npm ls react-router` e `npm ls wrangler miniflare`
- [x] `wrangler` subido de `4.128.0` para `4.131.1`, com `git diff -- package.json` mostrando
      **uma única linha** alterada
- [x] `npm audit` depois da subida **sem nenhuma `high`**, saída colada
- [x] Churn do `package-lock.json` medido (`git diff --stat`) e **contido à cadeia
      `wrangler → miniflare → sharp`**; qualquer pacote fora dela reportado
- [x] `npx wrangler --version` e um `deploy --dry-run` verdes, saídas coladas — **sem deploy real**
- [x] Passo `npm audit --audit-level=high` no `ci.yml`, entre `npm ci` e `npm run lint`, **sem**
      `continue-on-error`
- [x] Comportamento da bandeira verificado na prática: exit code colado e confirmação de que as
      moderadas continuam **listadas** no log
- [x] **Falsificabilidade provada** (`--audit-level=moderate` reprovando hoje), com exit code
      colado
- [x] `docs/adr/0010-npm-audit-no-ci-e-severidade.md` escrito, com os **dois retratos** do audit
      (antes e depois do passo 2), as alternativas rejeitadas — inclusive **reprovar só em
      `critical`** e **exceção datada para o advisory do `sharp`** —, consequências e **gatilho de
      revisão**
- [x] `README.md` sem a afirmação de "zero vulnerabilidades", com o estado real e o ponteiro para
      o ADR
- [x] Nenhum `override` criado; **nenhuma** versão de dependência alterada além do `wrangler`;
      `npm audit fix` **não** executado — `git diff -- package.json` mostrando só a linha do
      `wrangler`
- [x] As moderadas **não** corrigidas, e o ADR registrando o número real: **5** sem saída (o "fix"
      do npm é `major` para trás) e **3** corrigíveis adiadas com motivo escrito
- [x] O comando de build do `ci.yml` **inalterado** por este plano
- [x] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [x] CI do GitHub Actions com `conclusion: success` no commit empurrado, **com o passo novo
      visível no log** — cole o trecho

      **Não verificado nesta sessão.** Nada foi commitado nem empurrado — por instrução de
      despacho, quem verifica o CI é o `triage-runner`, depois da revisão. Caixa fica vazia de
      propósito.

## Evidência

Sessão executada em 2026-09-12, Windows 11 / PowerShell 5.1 (comandos npm/wrangler) e Git Bash
(comandos `git`). Node conforme `.nvmrc`. `HEAD` no início = `fed445b`.

### Passo 1 — retrato "ANTES" (antes de qualquer mudança)

`npm audit`:

```
# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

sharp  <0.35.4
Severity: high
sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 - https://github.com/advisories/GHSA-rgj7-g3m4-5g8c
fix available via `npm audit fix --force`
Will install wrangler@4.131.1, which is outside the stated dependency range
node_modules/miniflare/node_modules/sharp
  miniflare  <=0.0.0-fec45ed61 || 4.20250508.3 - 5.20260908.0-alpha
  Depends on vulnerable versions of sharp
  node_modules/miniflare
    wrangler  <=0.0.0-7ae5dd357 || 4.16.0 - 4.130.0
    Depends on vulnerable versions of miniflare
    node_modules/wrangler

11 vulnerabilities (8 moderate, 3 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

`npm audit --json` (metadata.vulnerabilities):

```
info     : 0
low      : 0
moderate : 8
high     : 3
critical : 0
total    : 11
```

`npm ls react-router`:

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- tinacms@3.12.1
  `-- react-router-dom@6.30.6
    `-- react-router@6.30.6
```

`npm ls wrangler miniflare`:

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- wrangler@4.128.0
  `-- miniflare@5.20260831.0-alpha
```

### Passo 2 — subida do `wrangler` 4.128.0 → 4.131.1

`git diff -- package.json`:

```diff
diff --git a/package.json b/package.json
index c999918..4a35713 100644
--- a/package.json
+++ b/package.json
@@ -44,6 +44,6 @@
     "typescript-eslint": "8.69.0",
     "vite": "8.2.2",
     "vitest": "4.1.11",
-    "wrangler": "4.128.0"
+    "wrangler": "4.131.1"
   }
 }
```

Uma única linha alterada — confirmado.

`npm install` (atualiza o lock):

```
removed 2 packages, changed 4 packages, and audited 1515 packages in 12s

327 packages are looking for funding
  run `npm fund` for details

8 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

`npm audit` depois da subida — retrato "DEPOIS" (as três `high` sumiram):

```
# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

8 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

Nenhuma `high` restante — a premissa do plano se confirmou.

`git diff --stat -- package-lock.json`:

```
 package-lock.json | 682 +++---------------------------------------------------
 1 file changed, 36 insertions(+), 646 deletions(-)
```

Pacotes tocados (extraídos das linhas `node_modules/...` adicionadas/removidas no diff):
apenas `node_modules/miniflare/node_modules/sharp` e seus binários de plataforma
(`@img/sharp-*`), todos sob `node_modules/miniflare/node_modules/`, mais as próprias entradas
`node_modules/wrangler` (versão) e `node_modules/miniflare` (versão). Nenhum pacote fora da
cadeia `wrangler → miniflare → sharp`.

`npm ls wrangler miniflare` (árvore nova):

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- wrangler@4.131.1
  `-- miniflare@5.20260911.0-alpha
```

### Passo 3 — `wrangler` novo, sem deploy real

`npx wrangler --version`:

```
4.131.1
```

`npx wrangler deploy --dry-run`:

```
 ⛅️ wrangler 4.131.1
────────────────────
✨ Read 107 files from the assets directory S:\Projetos\academic_page\haroldo\dist
Total Upload: 0.31 KiB / gzip: 0.22 KiB
No bindings found.
--dry-run: exiting now.
```

Nenhum deploy real ocorreu ("--dry-run: exiting now.").

### Passo 4 — comportamento de `npm audit --audit-level=high` na árvore corrigida

```
# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

8 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
EXIT CODE: 0
```

As 8 moderadas continuam **listadas** integralmente no log; a bandeira só afeta o exit code
(0, porque nenhuma `high` restou).

### Passo 5 — falsificabilidade (`--audit-level=moderate`)

```
[mesma listagem das 8 moderadas acima]
EXIT CODE: 1
```

Confirma que o passo é capaz de reprovar: `--audit-level=high` → exit 0; `--audit-level=moderate`,
na mesma árvore → exit 1, pelas 8 moderadas. Os dois exit codes lado a lado: **high = 0**,
**moderate = 1**.

### Passo 6 — `ci.yml`

`git diff -- .github/workflows/ci.yml`:

```diff
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index 351334f..c430019 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -24,6 +24,9 @@ jobs:
           node-version-file: '.nvmrc'
           cache: 'npm'
       - run: npm ci
+      # Reprova em high/critical, nao em moderate: as moderadas de hoje nao tem correcao nossa
+      # disponivel (ADR-0010) e reprovar por elas deixaria o portao vermelho permanentemente.
+      - run: npm audit --audit-level=high
       - run: npm run lint
       - run: npm run format:check
       # test:coverage em vez de test: roda os mesmos testes e ainda impoe o
```

Apenas o passo novo e seu comentário — comando de build inalterado.

### Passo 7 — ADR-0010

Escrito em `docs/adr/0010-npm-audit-no-ci-e-severidade.md`, com os dois retratos (antes: 11
vulnerabilidades / 8 moderate, 3 high; depois: 8 moderate, 0 high), os **cinco** identificadores
de advisory — GHSA-wrjc-x8rr-h8h6 e GHSA-337j-9hxr-rhxg (via `react-router-dom`),
GHSA-x5fp-wj9c-mxmx e GHSA-4mjr-xmp4-gh2g (via `@tinacms/cli → altair-express-middleware → qs`),
GHSA-rgj7-g3m4-5g8c (`sharp`/`libheif`) —, confirmados por `grep -o "GHSA-[a-z0-9-]*"
docs/adr/0010-npm-audit-no-ci-e-severidade.md | sort -u` batendo exatamente com esta lista (ver
"Correções pós-revisão (ciclo 1)" abaixo), as alternativas rejeitadas (moderate, **só
`critical`**, **exceção datada para o `sharp`**, `continue-on-error`, `overrides`, não auditar),
a pendência nomeada (5 sem saída via `tinacms`, 3 — `body-parser`/`express`/`qs` — corrigíveis
adiadas) e o gatilho de revisão.

### Passo 8 — README.md

`git diff -- README.md` (estado final, depois da correção 3 do ciclo 1):

```diff
diff --git a/README.md b/README.md
index c7ab1b6..ff487f4 100644
--- a/README.md
+++ b/README.md
@@ -238,6 +238,12 @@ não existem mais. O arquivo de schemas é `src/content.config.ts`.
 
 **O `package.json` não tem `overrides` — e não deve voltar a ter sem motivo escrito.** Houve
 três (`vite`, `sharp`, `esbuild`), removidos no upgrade do Astro: o 7 exige `vite ^8.0.13` e
-já pede nativamente as versões corrigidas de `sharp` e `esbuild`. `npm audit` está em **zero
-vulnerabilidades**. A história completa, com o que motivou cada pin e por que cada um caiu,
-está em `docs/adr/0002-pin-do-vite-via-overrides.md`.
+já pede nativamente as versões corrigidas de `sharp` e `esbuild`. A história completa, com o
+que motivou cada pin e por que cada um caiu, está em
+`docs/adr/0002-pin-do-vite-via-overrides.md`. `npm audit` **não** está em zero vulnerabilidades:
+são **8 moderadas**, de duas origens por trás do TinaCMS — 5 via
+`tinacms@3.12.1 → react-router-dom → react-router` e 3 via
+`@tinacms/cli@2.6.1 → altair-express-middleware → express`/`body-parser → qs` —, alcançando só
+o painel `/admin` (React, autenticado, uma pessoa) — o site público não carrega React (D-01).
+O CI reprova a partir de `high`/`critical`; a política, os números medidos e as
+alternativas rejeitadas estão em `docs/adr/0010-npm-audit-no-ci-e-severidade.md`.
```

Número inserido é o **depois** do passo 2 (8 moderadas), como exigido. As duas origens (5 via
`react-router-dom`, 3 via `altair-express-middleware`) estão descritas separadamente, não
fundidas.

### Passo 9 — sequência de qualidade local

`npm run lint`:

```
> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check` (depois de `npx prettier --write docs/adr/0010-npm-audit-no-ci-e-severidade.md`
— a formatação da tabela markdown do ADR novo):

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


 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  13:11:53
   Duration  1.08s (transform 1.80s, setup 0ms, import 2.85s, tests 92ms, environment 0ms)

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

`npm run build` (lida — com o cloud check do TinaCloud, credenciais do `.env` presentes):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

○  Tina build complete ───────────────────────────────────────────────────────────────────────
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html
├────────────────────────────────────────────────────────────────────────────────────────────
13:13:16 [content] Syncing content
13:13:16 [content] Synced content
13:13:16 [types] Generated 462ms
13:13:16 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (19 files):
- 0 errors
- 0 warnings
- 0 hints

13:13:22 [content] Syncing content
13:13:22 [content] Synced content
13:13:22 [types] Generated 443ms
13:13:22 [build] output: "static"
13:13:22 [build] mode: "static"
13:13:22 [build] directory: S:\Projetos\academic_page\haroldo\dist\
13:13:22 [build] Collecting build info...
13:13:22 [build] ✓ Completed in 484ms.
13:13:22 [build] Building static entrypoints...
13:13:23 [vite] ✓ built in 281ms
13:13:23 [vite] ✓ built in 45ms
13:13:23 [build] Rearranging server assets...

 generating static routes
13:13:23   ├─ /index.html (+10ms)
13:13:23 ✓ Completed in 21ms.

13:13:23 [build] ✓ Completed in 375ms.
13:13:23 [build] 1 page(s) built in 868ms
13:13:23 [build] Complete!
EXIT CODE: 0
```

### Correções pós-revisão (ciclo 1)

A revisão do ciclo 1 reprovou com três defeitos, todos em `docs/adr/0010-...md` e/ou
`README.md` — nada no `ci.yml`, no `package.json` nem no `package-lock.json`, que não foram
tocados neste ciclo.

1. **Mecanismo real da correção do `sharp`.** O ADR dava a entender que o `sharp` saiu do
   projeto. Não saiu: `astro@7.2.10` (produção) já trazia `sharp@0.35.4` no nível superior antes
   deste plano (`git show HEAD:package-lock.json` confirma) — a cópia vulnerável era a
   **aninhada** sob `miniflare` (`sharp@0.35.2`). A subida do `wrangler` fez o `miniflare` novo
   **deduplicar** na cópia segura já existente, em vez de instalar a sua própria. Confirmado com
   `npm ls sharp`:
   ```
   +-- astro@7.2.10
   | `-- sharp@0.35.4
   `-- wrangler@4.131.1
     `-- miniflare@5.20260911.0-alpha
       `-- sharp@0.35.4 deduped
   ```
   e com `git diff -- package-lock.json | grep -B1 -A5
   '"node_modules/miniflare/node_modules/sharp"'`, mostrando a entrada `0.35.2` **removida**
   (linhas `-`), não alterada. O ADR foi corrigido: a razão de o `sharp` não entrar no Worker
   publicado não é `devDependency` (ele é produção, via `astro`) — é ser usado só em tempo de
   build (otimização de imagem do Astro), num site estático sem runtime de Node no Worker
   (D-01, `has_modules: false`, plano 025). Esse ponto do "devDependency" continua válido, mas
   só para o `wrangler` em si, não para o `sharp`.
2. **Advisories incompletos.** O ADR citava só 2 identificadores; a Evidência do passo 7
   afirmava 5. Corrigido citando os 5 no ADR — 2 via `react-router-dom`
   (GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg) e 2 via `@tinacms/cli → altair-express-middleware`
   (GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g), mais o já presente GHSA-rgj7-g3m4-5g8c do
   `sharp`. Reconferido com `grep -o "GHSA-[a-z0-9-]*"
   docs/adr/0010-npm-audit-no-ci-e-severidade.md | sort -u`:
   ```
   GHSA-337j-9hxr-rhxg
   GHSA-4mjr-xmp4-gh2g
   GHSA-rgj7-g3m4-5g8c
   GHSA-wrjc-x8rr-h8h6
   GHSA-x5fp-wj9c-mxmx
   ```
   5 identificadores, batendo com a lista do passo 7 acima.
3. **README fundia as duas origens das 8 moderadas.** O texto dizia que as 8 vinham todas de
   `react-router`. Só 5 vêm dali; as outras 3 (`qs`, `body-parser`, `express`) vêm de
   `@tinacms/cli@2.6.1 → altair-express-middleware`, confirmado por `npm ls qs`:
   ```
   `-- @tinacms/cli@2.6.1
     +-- altair-express-middleware@7.3.6
     | `-- express@4.22.2
     |   `-- qs@6.15.3 deduped
     `-- body-parser@1.20.6
       `-- qs@6.15.3
   ```
   Corrigido no README descrevendo as duas cadeias separadamente (ver Passo 8 acima).

`npm run format:check` depois das correções — rodado sozinho, por instrução do coordenador, sem
a suíte inteira:

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

(Precisou de um `npx prettier --write docs/adr/0010-npm-audit-no-ci-e-severidade.md` antes,
para o reflow de parágrafo do conteúdo novo — mesmo padrão do ciclo anterior, nenhuma mudança de
conteúdo além do reflow.)

### `git status --short` ao final (depois do ciclo 1 de correções)

```
 M .github/workflows/ci.yml
 M README.md
 M package-lock.json
 M package.json
 M plans/fase-2-pipeline-de-publicacao/032-npm-audit-no-ci-e-politica-de-severidade.md
?? docs/adr/0010-npm-audit-no-ci-e-severidade.md
```

`ci.yml`, `package.json` e `package-lock.json` **inalterados** desde o fechamento do primeiro
ciclo — só `README.md`, o ADR novo e este próprio plano (Evidência) mudaram no ciclo 1. Nada
commitado, nada empurrado.

### O que NÃO foi rodado / não pôde ser verificado

- **CI do GitHub Actions** — nada foi commitado nem empurrado nesta sessão (regra de despacho).
  A caixa correspondente no critério de aceitação fica vazia. Quem verifica o CI é o
  `triage-runner`, depois da revisão.
- Nenhuma verificação foi pulada por bloqueio externo: as credenciais do TinaCloud (`.env`)
  estavam presentes e o `npm run build` completou com o cloud check.
- No ciclo 1 de correção, só `npm run format:check` foi rodado, por instrução explícita do
  coordenador ("Não rode a suíte inteira — eu redisparo a verificação autoritativa"). `lint`,
  `test:coverage` e `build` **não** foram re-executados neste ciclo; não há motivo para esperar
  que mudem, já que nenhuma correção tocou código-fonte, testes ou schema — mas a re-execução
  fica para o `triage-runner`, por instrução.

### Premissa do plano — confirmada pela medição

Nenhuma `high` sobrou depois da subida do `wrangler`. A premissa da emenda de 2026-09-12 se
confirmou: o portão nasce verde.

### Revisão de código e CI — preenchido pelo orquestrador na promoção

**Revisão APROVADA no ciclo 2.** Reprovada no ciclo 1 com **três defeitos, todos de documentação
e nenhum alcançável por teste**: (1) o ADR não descrevia o mecanismo real da correção — deixava a
impressão de que o `sharp` saíra do projeto, quando ele permanece via `astro`, produção, e o que
mudou foi o `miniflare` passar a deduplicar na cópia segura; (2) o ADR citava **2** advisories
enquanto a Evidência **afirmava** citar **5** — a mesma família de defeito que reprovou o plano 033
nesta sessão; (3) o `README.md` atribuía as 8 moderadas a uma cadeia única, quando são **duas**
(5 via `react-router-dom`, 3 via `@tinacms/cli → altair-express-middleware`) — e essa afirmação
falsa entrou **no mesmo parágrafo** que corrigia a afirmação falsa antiga. Os três corrigidos e
reproduzidos pelo revisor no ciclo 2.

**Commit do trabalho:** `b992282`, empurrado em 2026-09-12 (`7bd1e62..b992282`). Os dois pipelines
verdes:

```
gh api repos/researchgroups-ufma/haroldo-page/commits/b992282/check-runs

Workers Builds: haroldo-page :: success
  https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production/builds/61821ab4-e645-4a49-993a-e8b22d9c600b
qualidade                    :: success
  https://github.com/researchgroups-ufma/haroldo-page/actions/runs/34705501376
```

**O passo novo no log do CI, que é o que o critério exige** — trecho literal de
`gh run view 34705501376 --log`, filtrado por `audit`:

```
qualidade  Run npm ci                        added 1515 packages, and audited 1516 packages in 34s
qualidade  Run npm audit --audit-level=high  ##[group]Run npm audit --audit-level=high
qualidade  Run npm audit --audit-level=high  shell: /usr/bin/bash -e {0}
qualidade  Run npm audit --audit-level=high  # npm audit report
qualidade  Run npm audit --audit-level=high  qs  2.2.5 - 6.15.3
qualidade  Run npm audit --audit-level=high  Severity: moderate
qualidade  Run npm audit --audit-level=high  qs array-limit bypass ... GHSA-x5fp-wj9c-mxmx
qualidade  Run npm audit --audit-level=high  qs: Denial of Service ... GHSA-4mjr-xmp4-gh2g
qualidade  Run npm audit --audit-level=high    body-parser  1.20.5 - 1.20.6
qualidade  Run npm audit --audit-level=high    express  4.22.2
```

**Confirma na prática o ponto 2 da decisão:** o passo roda **entre `npm ci` e o `lint`**, as
moderadas continuam **listadas** no log com seus identificadores, e o job passa assim mesmo — a
informação não some, só deixa de reprovar. Era isto que o plano mandava verificar exercitando em
vez de acreditar na documentação.
