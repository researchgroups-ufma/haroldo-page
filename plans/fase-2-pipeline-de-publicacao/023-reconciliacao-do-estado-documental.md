# Plano 023 — Abertura da fase 2: reconciliação do estado documental

**Status:** DONE
**RFs cobertos:** — (não fecha item do §12; cumpre a convenção "O topo do PRD tem de refletir a
realidade" de `plans/README.md`)
**Depende de:** nenhum
**Modelo recomendado:** haiku
**Agente recomendado:** implementer
**Executável por:** **agente** — nenhum passo depende de painel de terceiro ou de decisão nova
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O `PRD.md` §0 e o `plans/README.md` deixam de mentir sobre o estado do projeto. Hoje os dois
descrevem a fase 1 como "falta a promoção administrativa do plano 021" — promoção que **já
aconteceu** no commit `7d5b7e6`, de 2026-09-10 — e o índice ainda diz que a pasta da fase 2 está
vazia de propósito e que "o plano 021 é o próximo".

Este é o primeiro plano da fase 2 e não muda uma linha de código.

## Arquivos afetados

- `PRD.md` — só o §0 (metadados) e uma linha nova no histórico §0.1, mais a tabela de progresso
  e o cabeçalho da fase 2 no §12. **[Ampliado em revisão]:** também o §16 (nota de rodapé das
  questões abertas, linha 937), porque contradizia o §0: a frase "o que falta para ela é a fase 1
  fechar" foi substituída por "a fase 1 fechou em 2026-09-10 e a fase 2 começou" — decisão do
  orquestrador em 2026-09-10, visando cumprir o objetivo declarado ("o `PRD.md` e o
  `plans/README.md` deixam de mentir sobre o estado do projeto")
- `plans/README.md` — a linha da fase 1 e a da fase 2 na tabela, o parágrafo da decisão de
  2026-09-03 e a frase "o plano 021 é o próximo" em "Convenções"

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** edite `plans/fase-1-modelo-de-conteudo/README.md` (ele já registra o
> fechamento corretamente), **não** edite `plans/fase-2-pipeline-de-publicacao/README.md` (foi
> escrito no fatiamento e é a fonte de verdade da fase), **não** marque nenhum item do checklist
> da fase 2 no §12 (nenhum foi entregue) e **não** toque em `.github/workflows/ci.yml` — a
> divergência de comentário que existe lá é do plano 024, que já edita o arquivo.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA), Astro 7 +
TinaCMS, repositório público em `researchgroups-ufma/haroldo-page`. Ambiente: Windows 11 /
PowerShell, Node 24.16.0.

**O fato que motiva este plano.** A fase 1 fechou em 2026-09-10: os oito planos (015–022) estão
`Status: DONE`, o 021 foi promovido no commit `7d5b7e6` ("docs: fase 1 concluida — 021 DONE com CI
verde sobre 26de58a") e o §12 do PRD já marca a fase 1 como **10/10 🟢 Concluída**. Só o §0 do PRD
e o `plans/README.md` ficaram para trás.

**A convenção que este plano cumpre** (`plans/README.md`, seção "O topo do PRD tem de refletir a
realidade"): ao fechar um plano, uma fase ou qualquer marco, atualize junto o `Status`, o
`Estado da implementação`, a `Última atualização`, a `Versão do PRD` e a linha correspondente do
histórico §0.1. O vocabulário do `Status` é **fechado** — `🟡 Rascunho · 🔵 Em revisão ·
🟢 Aprovado · ⚫ Arquivado` — e o progresso da implementação **não** vai nele. O `Status` continua
`🟢 Aprovado`; **não mexa nele**.

**A fase 2 tem 12 planos, 023 a 034**, fatiados em 2026-09-10 e listados em
`plans/fase-2-pipeline-de-publicacao/README.md`. Nenhum está DONE quando este plano roda — o
próprio 023 é o primeiro.

### Os textos, literais

Aplique substituição exata. Onde o texto novo não estiver transcrito abaixo, **não invente**:
pare e reporte.

**1. `PRD.md` §0, linha `Versão do PRD`.**

- De: `| **Versão do PRD** | v0.1.19 |`
- Para: `| **Versão do PRD** | v0.1.20 |`

**2. `PRD.md` §0, linha `Estado da implementação`.** O texto atual termina com
`falta só a promoção administrativa (revisão, commit, CI) do plano 021 · Fases 2–5 ⬜ não
iniciadas. Detalhe por item em §12; execução em `plans/README.md``. Substitua **o valor inteiro
da célula** por:

```
Fase 0 🟢 **concluída** (14 planos) · Fase 1 🟢 **concluída** em 2026-09-10 — os oito planos (015–022) DONE, o 021 promovido em `7d5b7e6` com CI verde sobre `26de58a` · Fase 2 🟡 **em andamento** — fatiada em 12 planos (023–034) em 2026-09-10, nenhum DONE ainda · Fases 3–5 ⬜ não iniciadas. Detalhe por item em §12; execução em `plans/README.md`
```

**3. `PRD.md` §0, linha `Última atualização`.** Já está `2026-09-10`. **Confira e não altere** se
a execução deste plano acontecer no mesmo dia; se for em outro dia, ponha a data real da execução,
em formato absoluto (`AAAA-MM-DD`).

**4. `PRD.md` §0.1, linha nova no fim da tabela de histórico**, depois da linha `v0.1.19`:

```
| v0.1.20 | 2026-09-10 | Desenvolvedor | **Fase 1 promovida a concluída no §0:** o 021 virou DONE em `7d5b7e6` (CI verde sobre `26de58a`) e o topo do documento ainda dizia que faltava a promoção administrativa — o mesmo tipo de defasagem que a v0.1.7 já tinha corrigido uma vez. **Fase 2 fatiada** em 12 planos (023–034) em `plans/fase-2-pipeline-de-publicacao/`, com o tratamento explícito das sete dívidas que a fase 1 empurrou. Nenhum item do checklist da fase 2 foi entregue ainda; a fase passa a 🟡 em andamento em §0 e na tabela de progresso do §12 |
```

**5. `PRD.md` §12, tabela "Progresso Geral", linha da fase 2.**

- De: `| Fase 2 — Pipeline de publicação | 0/8 | ⬜ Não iniciada |`
- Para: `| Fase 2 — Pipeline de publicação | 0/8 | 🟡 Em andamento |`

Nenhuma outra linha da tabela muda. **Nenhum `- [ ]` do checklist da fase 2 vira `- [x]`.**

**6. `plans/README.md`, tabela de fases, linha da fase 1.** A célula "Planos" hoje diz
`015–020 e 022 DONE; 021 com a execução e a demonstração do painel fechadas — falta a promoção
(revisão, commit, CI)`. Substitua por:

```
015–022, todos DONE — o 021 promovido em `7d5b7e6`, com CI verde sobre `26de58a`
```

**7. `plans/README.md`, tabela de fases, linha da fase 2.** Hoje:

```
| `fase-2-pipeline-de-publicacao/` | 2 — Pipeline de publicação ponta a ponta | ⬜ Não iniciada | — |
```

Substitua por:

```
| [`fase-2-pipeline-de-publicacao/`](fase-2-pipeline-de-publicacao/README.md) | 2 — Pipeline de publicação ponta a ponta | 🟡 **Em andamento** | 023–034 fatiados em 2026-09-10; nenhum DONE |
```

**8. `plans/README.md`, parágrafo "Decisão do stakeholder em 2026-09-03 — quando fatiar a fase
2".** A última frase hoje diz que nenhum plano da fase 2 existe e que a pasta fica vazia de
propósito. Substitua **a frase final** (`Consequência aceita: nenhum plano da fase 2 existe
enquanto isso, e a pasta `fase-2-pipeline-de-publicacao/` fica vazia de propósito.`) por:

```
**Cumprida em 2026-09-10:** a fase 1 fechou e a fase 2 foi fatiada em seguida, a partir da lista dos sete itens no README da fase 1 — os 12 planos estão em `fase-2-pipeline-de-publicacao/`, com o README da fase registrando onde cada uma das sete dívidas caiu.
```

O resto do parágrafo — inclusive a explicação de por que a fase 2 vem antes do site público —
fica como está.

**9. `plans/README.md`, seção "Convenções".** A frase `O plano 021 é o próximo, esteja em que
pasta estiver.` está obsoleta. Substitua por:

```
O plano 023 é o próximo, esteja em que pasta estiver.
```

**10. `PRD.md` §16, nota de rodapé abaixo da tabela de questões em aberto.** Acrescentada em
2026-09-10, na revisão, por decisão do orquestrador: a frase afirmava pendência da fase 1 e
contradizia o `Estado da implementação` do §0 que a substituição 2 acabara de corrigir. Ver
"Arquivos afetados". Substituição de **fragmento**, no meio de um parágrafo longo — o resto da
nota fica intacto.

- De: `**A fase 2 não tem mais bloqueio de stakeholder** — o que falta para ela é a fase 1 fechar.`
- Para: `**A fase 2 não tem mais bloqueio de stakeholder** — a fase 1 fechou em 2026-09-10 e a fase 2 começou.`

### O que este plano deliberadamente NÃO faz

- **Não corrige o comentário do `.github/workflows/ci.yml`.** As linhas 12–20 dizem "checkout v5 e
  setup-node v5 passaram a usar Node 24 nativo" enquanto o YAML usa `@v7` — divergência real,
  registrada no README da fase 2 e **atribuída ao plano 024**, que já abre esse arquivo para
  trocar o comando de build. Dois planos editando `ci.yml` ao mesmo tempo é conflito garantido.
- **Não marca item do §12 da fase 2.** Nada foi entregue.
- **Não altera o `Status` do PRD** (`🟢 Aprovado`). O §16 foi alterado por decisão do orquestrador
  em revisão (ver "Arquivos afetados" — a contradição entre §0 e §16 violava o objetivo do plano);
  nenhuma outra seção fora do §0, §0.1, §12 e §16 é tocada.
- **Não cria ADR.** Não há decisão arquitetural aqui.

## Passos

1. Ler o §0 e o §0.1 do `PRD.md`, a tabela de progresso do §12 e o `plans/README.md` inteiro.
   → verify: você consegue apontar, sem olhar este plano, as duas frases que hoje afirmam que a
   promoção do 021 ainda não aconteceu.
2. Aplicar as substituições 1 a 5 e a 10 no `PRD.md`.
   → verify: `git diff --stat -- PRD.md` mostra um único arquivo alterado; `git diff -- PRD.md`
   não contém nenhuma alteração fora do §0, do §0.1, da linha da fase 2 na tabela de progresso
   e da nota de rodapé do §16 (substituição 10).
3. Aplicar as substituições 6 a 9 no `plans/README.md`.
   → verify: `git diff -- plans/README.md` mostra exatamente quatro trechos alterados.
4. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check` e `npm run test:coverage` verdes, saídas
   coladas na Evidência. `npm run build` também — este plano não muda schema, então **não** deve
   haver `ERR_CLOUD_CHECK_FAILED`; se houver, é achado a reportar, não a contornar.

## Critérios de aceitação

- [x] `Versão do PRD` em `v0.1.20` e linha `v0.1.20` acrescentada ao histórico §0.1
- [x] `Estado da implementação` do §0 descreve a fase 1 como concluída em 2026-09-10 e a fase 2
      como em andamento, sem mencionar promoção pendente
- [x] `Status` do PRD **inalterado** em `🟢 Aprovado`
- [x] Tabela de progresso do §12: fase 2 em `0/8 · 🟡 Em andamento`; nenhum `- [ ]` da fase 2
      marcado
- [x] `PRD.md` §16: a nota de rodapé não afirma mais pendência da fase 1 (substituição 10) —
      `grep -n "fase 1 fechar" PRD.md` retorna apenas a linha do histórico §0.1 (`v0.1.13`,
      2026-09-03), que é registro datado e imutável
- [x] `plans/README.md`: linha da fase 1 sem "falta a promoção", linha da fase 2 apontando para o
      README da pasta, parágrafo da decisão de 2026-09-03 registrando que ela foi cumprida, e
      "o plano 023 é o próximo"
- [x] Nenhum arquivo fora de `PRD.md` e `plans/README.md` modificado — provado por
      `git status --short`
- [x] `npm run lint`, `npm run format:check` e `npm run test:coverage` verdes, saídas coladas
- [x] `npm run build` verde, com a saída lida (não só o exit code) — nenhuma linha `[ERROR]`
- [x] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

Execução autoritativa do `triage-runner` sobre o working tree final (2026-09-10, 17:51–17:52):

```
$ npm ci
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.

added 1516 packages, and audited 1517 packages in 23s

329 packages are looking for funding
  run `npm fund` for details

11 vulnerabilities (8 moderate, 3 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues, including breaking changes, run:
  npm audit fix --force

Run `npm audit` for details.

(lock NÃO reescrito: `git status --short -- package-lock.json` vazio)

$ npm run lint
> haroldo-page@0.1.0 lint
> eslint .

(exit 0, sem saída)

$ npm run format:check
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

$ npm run test:coverage
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  4 passed (4)
      Tests  107 passed (107)
   Start at  17:51:05
   Duration  1.36s (transform 1.18s, setup 0ms, import 1.76s, tests 48ms, environment 0ms)

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

$ npm run build
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

○  Tina build complete
   API url: https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main

17:52:04 [content] Syncing content
17:52:04 [content] Synced content
17:52:04 [types] Generated 1.17s
17:52:04 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

17:52:10 [content] Syncing content
17:52:10 [content] Synced content
17:52:10 [types] Generated 403ms
17:52:10 [build] output: "static"
17:52:10 [build] mode: "static"
17:52:10 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:52:10 [build] Collecting build info...
17:52:10 [build] ✓ Completed in 437ms.
17:52:10 [build] Building static entrypoints...
17:52:10 [vite] ✓ built in 252ms
17:52:10 [vite] ✓ built in 44ms
17:52:10 [build] Rearranging server assets...

 generating static routes
17:52:10   ├─ /index.html (+9ms)
17:52:10 ✓ Completed in 24ms.

17:52:10 [build] ✓ Completed in 353ms.
17:52:10 [build] 1 page(s) built in 798ms
17:52:10 [build] Complete!

(varredura explícita: nenhuma linha `[ERROR]` na saída)

$ git status --short
 M PRD.md
 M plans/README.md
?? plans/fase-2-pipeline-de-publicacao/023-reconciliacao-do-estado-documental.md
?? plans/fase-2-pipeline-de-publicacao/024-build-de-pipeline-e-o-cloud-check-do-tinacloud.md
?? plans/fase-2-pipeline-de-publicacao/025-roteiro-workers-builds-e-variaveis-no-cloudflare.md
?? plans/fase-2-pipeline-de-publicacao/026-admin-em-producao-autenticando-pelo-tinacloud.md
?? plans/fase-2-pipeline-de-publicacao/027-roteiro-usuario-editor-e-matriz-de-permissoes.md
?? plans/fase-2-pipeline-de-publicacao/028-notificacao-de-falha-de-build-ao-admin.md
?? plans/fase-2-pipeline-de-publicacao/029-ciclo-ponta-a-ponta-cronometrado-m02.md
?? plans/fase-2-pipeline-de-publicacao/030-portao-de-conteudo-no-ci.md
?? plans/fase-2-pipeline-de-publicacao/031-coerencia-do-tina-lock-no-ci.md
?? plans/fase-2-pipeline-de-publicacao/032-npm-audit-no-ci-e-politica-de-severidade.md
?? plans/fase-2-pipeline-de-publicacao/033-avisos-do-painel-para-o-manual-da-fase-5.md
?? plans/fase-2-pipeline-de-publicacao/034-documentacao-do-pipeline-e-fechamento-da-fase-2.md
?? plans/fase-2-pipeline-de-publicacao/README.md

$ git diff --stat
 PRD.md          |  9 +++++----
 plans/README.md | 12 +++++++-----
 2 files changed, 12 insertions(+), 9 deletions(-)
```

**Critério 10 — CI verde.** Fechado em 2026-09-11 pelo orquestrador, após o push. O `gh` não está
instalado nesta máquina; a consulta foi à API pública do GitHub, como manda a convenção da casa
("comando local passando não é evidência de qualidade").

```
$ curl -s "https://api.github.com/repos/researchgroups-ufma/haroldo-page/actions/runs/34593469875"
  "head_sha": "ae1bbc8abbce6262c3cdfe20dcf966e899dc7590",
  "status": "completed",
  "conclusion": "success",
  "updated_at": "2026-09-11T11:21:10Z",

$ curl -s ".../actions/runs/34593469875/jobs"
      "conclusion": "success",
      "name": "qualidade",
          "name": "Set up job",                        "conclusion": "success",
          "name": "Run actions/checkout@v7",           "conclusion": "success",
          "name": "Run actions/setup-node@v7",         "conclusion": "success",
          "name": "Run npm ci",                        "conclusion": "success",
          "name": "Run npm run lint",                  "conclusion": "success",
          "name": "Run npm run format:check",          "conclusion": "success",
          "name": "Run npm run test:coverage",         "conclusion": "success",
          "name": "Run npm run build",                 "conclusion": "success",
          "name": "Post Run actions/setup-node@v7",    "conclusion": "success",
          "name": "Post Run actions/checkout@v7",      "conclusion": "success",
          "name": "Complete job",                      "conclusion": "success",
```

Run: https://github.com/researchgroups-ufma/haroldo-page/actions/runs/34593469875

Note-se que o `npm run build` passou **no CI**, não só localmente — a classe de defeito que deixou
o CI vermelho por 14 commits na fase 1 (falta de `TINA_CLIENT_ID`/`TINA_TOKEN` no workflow, que o
`.env` local escondia) não se repetiu.

**Reexecução da suíte na sessão da promoção (2026-09-11, 08:16–08:17), sobre o mesmo working tree:**

```
$ npm run lint
> haroldo-page@0.1.0 lint
> eslint .

(exit 0, sem saída)

$ npm run format:check
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

$ npm run test:coverage
 Test Files  4 passed (4)
      Tests  107 passed (107)
   Start at  08:16:53
   Duration  1.44s (transform 1.30s, setup 0ms, import 1.93s, tests 52ms, environment 0ms)

Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )

$ npm run build
08:17:37 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

08:17:43 [build] 1 page(s) built in 806ms
08:17:43 [build] Complete!
(exit 0; varredura explícita: nenhuma linha `[ERROR]`; o build não sujou o working tree)
```

**Commits:** `1f62500` (artefatos do fatiamento, 024–034 e README da fase) e `ae1bbc8` (este plano
e a sua execução).
