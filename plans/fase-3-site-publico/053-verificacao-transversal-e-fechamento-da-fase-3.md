# Plano 053 — Verificação transversal 360/768/1440 e fechamento da fase 3

**Status:** TODO
**RFs cobertos:** **RF-26**, **RF-32**, RNF-15 (teclado e foco), critério de conclusão da fase 3 no
§6.2; itens 2, 11 e 12 do §12 da fase 3; fechamento do checklist (12/12) e do §0 do PRD
**Depende de:** **todos os planos 036–052 em `DONE`** (a Q-RN02 foi respondida em 2026-09-14 — opção (c); ver README da
fase, "Questão para o stakeholder")
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **orquestrador** (verificação no navegador, passos 1–4) + **agente** (documentos,
passos 5–8)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Com todas as rotas prontas, uma única passada no navegador, com o mesmo build, prova o critério da
fase — as sete rotas navegáveis com o conteúdo placeholder, sem rolagem horizontal de 360 a 1440 px,
com movimento que respeita `prefers-reduced-motion` e navegação completa por teclado. Os documentos
passam a dizer que a fase 3 está concluída, e o que ela não resolveu fica com destino nomeado.

## Arquivos afetados

- `PRD.md` — §0 (`Estado da implementação`, `Versão do PRD`, `Última atualização`), §0.1 (linha
  nova), §12 (itens da fase 3 e a tabela de progresso) e, **se** a Q-RN02 mudar a regra, a RN-02 do §5.3
- `plans/README.md` — linha da fase 3
- `plans/fase-3-site-publico/README.md` — tabela de estado, dívidas que a fase cria e empurra
- `tests/content/paridade-schema.test.ts` — **só** as linhas 77–81 do cabeçalho (dívida 7(b))
- `tests/content/conteudo-valido.test.ts` — **só** a frase do cabeçalho que atribui a dívida 7(c) a
  este arquivo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** altere o `Status` do PRD (`🟢 Aprovado`). **Não** promova `Status:` de plano nenhum.
> **Não** altere lógica de teste — só comentário de cabeçalho. Não commite.

## Contexto necessário

**Critério da fase** (§6.2): "Todas as rotas navegáveis com o conteúdo placeholder, responsivas de
360 px a 1440 px." Cada plano de rota já mediu a sua página; este plano mede **todas juntas, sobre o
mesmo build**, porque correções posteriores (ex.: 049 mexeu na disciplina depois do 048) invalidam
medições antigas.

**Procedimento:** seção "Verificação no navegador" de `plans/fase-3-site-publico/README.md`. Rotas:
`/`, `/sobre/`, `/pesquisa/`, `/ensino/`, `/ensino/2026-2-relatividade-geral/`,
`/ensino/2025-1-mecanica-classica/`, `/publicacoes/` e uma inexistente (via `npx wrangler dev`, porque
o `astro preview` não aplica o `not_found_handling`).

**Tabela a preencher (passo 2)** — uma linha por rota × largura (8 rotas × 3 larguras = 24 linhas):

| Rota | Largura | scrollWidth | clientWidth | Cortado? | Observação |
|---|---|---|---|---|---|

**Movimento (RF-32; §7 da identidade):** em `/sobre/` e `/publicacoes/`, com DevTools *Rendering →
Emulate CSS media feature prefers-reduced-motion*:
- `no-preference`: a régua do cabeçalho se desenha e o `<h1>` sobe ao carregar; transcreva.
- `reduce`: nada anima; `<h1>` e régua já no estado final; `<details>` e menu abrem sem transição.
- Em `no-preference` com *Network → Disable cache* e o CSS bloqueado (*Network request blocking* do
  arquivo `/_astro/*.css`): o texto continua visível (§7: "Nenhuma animação começa com o conteúdo
  invisível sem CSS").

**Teclado (RNF-15):** em cada rota, só com Tab/Shift+Tab/Enter/Esc: "Pular para o conteúdo" é o
primeiro foco e leva ao `<main>`; todo link e botão recebe foco visível; menu do celular (360 px) abre
e fecha; botão copiar funciona; `<details>` abre.

**Q-RN02 — respondida em 2026-09-14, opção (c).** O stakeholder manteve a RN-02 como está ("ordem
de cadastro invertida") e decidiu que ela será cumprida por um **campo de data de cadastro** criado
numa fase que possa mudar o schema. Até lá vale a regra provisória do 040 (título alfabético pt-BR
dentro do ano). O que este plano escreve: a RN-02 do §5.3 ganha a nota "parcial — dentro do ano, a
ordem é alfabética por título até existir campo de data de cadastro (Q-RN02, 2026-09-14)", e a
pendência entra na lista de dívidas do README da fase com "fecha quando: um plano de schema criar
o campo de data de cadastro e `compareWithinYear` passar a usá-lo".

**Dívida 7(b)** (`tests/content/paridade-schema.test.ts:77-81`), texto atual: "…Fica como guarda para a
fase 3, quando campo novo nascer." A fase 3 não criou campo (schema congelado, Decisão 2 da sabatina
de identidade visual). Troque a última frase por: "Continua aberta depois da fase 3, que não mudou
schema. Fecha quando existir campo com `list: true` e `options`." Mais nada no arquivo.

**Imprecisão do cabeçalho de `conteudo-valido.test.ts`** (README da fase 2, "Dívidas novas"): o
cabeçalho diz que o arquivo fecha a dívida 5 **e** a 7(c); a 7(c) foi fechada em
`paridade-schema.test.ts`. Corrija só essa atribuição.

**§0 do PRD** — vocabulário e regras em `plans/README.md`, seção "O topo do PRD tem de refletir a
realidade". A linha da fase 3 em `Estado da implementação` passa a 🟢 concluída com a data, os planos
036–053 e o número da suíte medido (não estimado). Versão: próxima de `v0.1.34` na sequência que
estiver no §0.1 no momento — confira, não suponha.

**README da fase — seção nova "O que a fase 3 empurra adiante, e as dívidas que ela criou"**, no
padrão do README da fase 2: para a fase 4 (rotas `/en`, `en.ts` com o tipo `UiStrings`, seletor no
espaço reservado do cabeçalho, `lang` por árvore); para a fase 5 (imagens sem dimensões e sem
otimização — `foto`/`imagem` renderizadas com `<img>` cru; canonical/OG/favicon; axe e Lighthouse; a
remoção do `noindex`); dívidas sem fase (7(b); Q-RN02 se ficou na opção (c); qualquer achado dos planos
036–052 registrado nas Evidências — **leia as Evidências**, não o resumo delas). Cada item com "fecha
quando".

## Passos

1. Orquestrador: `npm ci`, `npm run build:pipeline`, `npm run test:dist` sobre a `main` atualizada → verify: saídas coladas com o SHA (`git rev-parse HEAD`).
2. Orquestrador: `npx astro preview` e `npx wrangler dev` (um de cada vez), tabela das 24 linhas preenchida → verify: tabela com data e horário; qualquer `scrollWidth ≠ clientWidth` **reprova** e vira correção em plano próprio antes de seguir.
3. Orquestrador: movimento nas três condições → verify: transcrição.
4. Orquestrador: teclado em todas as rotas → verify: transcrição por rota.
5. Agente: comentários dos dois testes → verify: `git diff tests/content` colado, só linhas de comentário; `npm run test:coverage` colado (mesma contagem de testes de antes).
6. Agente: README da fase e `plans/README.md` → verify: `git diff --stat` colado.
7. Agente: PRD §0, §0.1, §12 (marcar itens 2, 11 e 12 com a referência a este plano; os demais já marcados nas promoções) e nota de RN-02 parcial conforme a Q-RN02 (opção c) → verify: `grep -n "Fase 3" PRD.md` colado mostrando `12/12` e `🟢 Concluída`, e o §0 sem contradição ("não iniciada" e "concluída" na mesma célula foi motivo de reprovação no 034).
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run build:pipeline`, `npm run test:dist` colados; **orquestrador**: CI `conclusion: success` e Workers Builds `success` no commit de fechamento, com ids.

## Critérios de aceitação

- [x] Tabela 8 rotas × 3 larguras com `scrollWidth = clientWidth` em todas as 24 linhas e nenhum elemento cortado (RF-26)
- [x] Movimento observado em `no-preference`, ausente em `reduce`, e texto visível com CSS bloqueado (RF-32) (`reduce` e teclado: verificação manual do stakeholder, 2026-09-23 — ver Passos 1–4)
- [x] Navegação completa por teclado registrada rota a rota (RNF-15) (`reduce` e teclado: verificação manual do stakeholder, 2026-09-23 — ver Passos 1–4)
- [x] 404 servido pelo `wrangler dev` com a página no corpo, dentro da mesma passada
- [x] RN-02 do §5.3 com a nota de "parcial" da Q-RN02 (opção c) e a pendência na lista de dívidas com "fecha quando"
- [x] Comentários de 7(b) e 7(c) corrigidos, sem mudança de lógica (mesma contagem de testes)
- [x] §12 da fase 3 em 12/12, §0 e §0.1 atualizados; `plans/README.md` com a fase 3 concluída
- [x] README da fase com o que ela empurra adiante e as dívidas criadas, cada uma com "fecha quando"
- [ ] Portão local completo, CI e Workers Builds verdes no commit de fechamento, com saída colada

## Evidência

### Passos 1–4 — orquestrador (build, navegador, movimento, teclado)

Executados pelo orquestrador em 2026-09-23, entre 14:17 e 14:26 (horário de Brasília), sobre a `main` em
`c1ca1c186d08be02038868894af19a3e76e43288`, **antes** de o executor tocar qualquer arquivo. As edições deste
plano são só de documentação e de comentário de teste, então não mudam o `dist/` medido aqui.

**Passo 1.** Saídas capturadas em `scratchpad\053\`: `passo1-npm-ci.txt` (SHA acima, `npm ci exit=0`, árvore
limpa antes e depois — o lock não foi reescrito), `passo1-build.txt` (`vitest run tests/content` com 4 arquivos
e 108 testes; `astro check` com `0 errors`; 8 páginas; `Complete!`; `build exit=0`; `dist/index.html` e
`dist/404.html` às 14:23:36) e `passo1-test-dist.txt` (9 de 9, `test:dist exit=0`, com a mesma tabela de JS
do 052).

**Passo 2 — RF-26, 8 rotas × 3 larguras.** Sete rotas servidas pelo `npx astro preview` e a rota inexistente
pelo `npx wrangler dev --port 8787`, porque o `astro preview` não aplica o `not_found_handling`. O navegador
é o Vivaldi com a extensão. Cada rota foi carregada num `<iframe>` de 360, 768 e 1440 px com
`box-sizing: content-box`, e o `innerWidth` de dentro foi conferido. Em cada caso foram lidos
`documentElement.scrollWidth` e `clientWidth` e contados os elementos com borda direita além de `clientWidth`.
O `clientWidth` fica 15 px abaixo da largura porque inclui a barra de rolagem vertical do iframe: a página é
mais alta que os 900 px dele.

| Rota | Largura | scrollWidth | clientWidth | Cortado? | Observação |
|---|---|---|---|---|---|
| `/` | 360 | 345 | 345 | não | — |
| `/` | 768 | 753 | 753 | não | — |
| `/` | 1440 | 1440 | 1440 | não | página cabe em 900 px de altura, sem barra |
| `/sobre/` | 360 | 345 | 345 | não | — |
| `/sobre/` | 768 | 753 | 753 | não | — |
| `/sobre/` | 1440 | 1425 | 1425 | não | — |
| `/pesquisa/` | 360 | 345 | 345 | não | — |
| `/pesquisa/` | 768 | 753 | 753 | não | — |
| `/pesquisa/` | 1440 | 1425 | 1425 | não | — |
| `/ensino/` | 360 | 345 | 345 | não | — |
| `/ensino/` | 768 | 753 | 753 | não | — |
| `/ensino/` | 1440 | 1425 | 1425 | não | — |
| `/ensino/2026-2-relatividade-geral/` | 360 | 345 | 345 | não | o código do painel de script passa da largura **dentro** do `<pre>` (`overflow-x: auto`, `scrollWidth` 431 > `clientWidth` 255, `tabindex="0"`): rola no painel, não na página |
| `/ensino/2026-2-relatividade-geral/` | 768 | 753 | 753 | não | — |
| `/ensino/2026-2-relatividade-geral/` | 1440 | 1425 | 1425 | não | — |
| `/ensino/2025-1-mecanica-classica/` | 360 | 345 | 345 | não | — |
| `/ensino/2025-1-mecanica-classica/` | 768 | 753 | 753 | não | — |
| `/ensino/2025-1-mecanica-classica/` | 1440 | 1440 | 1440 | não | página cabe em 900 px de altura, sem barra |
| `/publicacoes/` | 360 | 345 | 345 | não | — |
| `/publicacoes/` | 768 | 753 | 753 | não | — |
| `/publicacoes/` | 1440 | 1425 | 1425 | não | — |
| `/rota-que-nao-existe/` (wrangler dev) | 360 | 345 | 345 | não | `<h1>` "Página não encontrada" |
| `/rota-que-nao-existe/` (wrangler dev) | 768 | 753 | 753 | não | idem |
| `/rota-que-nao-existe/` (wrangler dev) | 1440 | 1425 | 1425 | não | idem |

`scrollWidth = clientWidth` nas 24 linhas. As medições foram às 14:24:35 (preview, sete rotas) e às 14:25:50
(wrangler dev, 404). O único elemento além da largura em toda a passada é o código do painel de script, a
360 px, dentro de um contêiner com rolagem própria e alcançável por teclado.

**404 no `wrangler dev`** (`passo2-wrangler-404.txt`, 14:25:31): `HTTP/1.1 404 Not Found`, uma ocorrência de
"Erro 404" no corpo, e o SHA-256 do corpo servido é igual ao de `dist/404.html`
(`e17406a0ce682eff48076a384e5baff38ec921847226ceb841547e3aa19ba6e7`).

**Passo 3 — RF-32, movimento.** Observado pelo orquestrador às 14:25:02, em `/sobre/` e `/publicacoes/` a 1440 px:
- **`no-preference`** (`matchMedia('(prefers-reduced-motion: reduce)').matches === false` nesta máquina):
  `document.getAnimations()` logo após a carga devolve duas animações em cada rota, `titulo-entrada` no `<h1>`
  e `regua-entrada` na régua do cabeçalho. O `<h1>` sobe e a régua se desenha.
- **Sem CSS:** o HTML de cada rota, buscado por `fetch`, teve os `<link rel="stylesheet">` e os `<style>`
  removidos antes de ser carregado num `<iframe srcdoc>`, com `document.styleSheets.length === 0`. O `<h1>`
  aparece com `opacity 1`, `visibility visible`, `transform none` e 38 px de altura, e no `<main>` nenhum
  elemento com texto tem `opacity 0` ou `visibility hidden`. É o §7 da identidade: nenhuma animação começa
  com o conteúdo invisível sem CSS. Método equivalente, não idêntico, ao bloqueio do arquivo no DevTools
  que o plano descreve: o efeito é o mesmo documento sem folha de estilo nenhuma.
- **`reduce`:** a extensão nesta máquina não expõe a emulação. **Verificado à mão pelo stakeholder** e
  declarado ao orquestrador em 2026-09-23: nada anima, e o `<h1>` e a régua já aparecem no estado final.
  **Não foi observado pelo orquestrador.**

**Passo 4 — RNF-15, teclado.** A tecla Tab enviada pela extensão não move o foco nesta máquina (dívida
acumulada do 042 ao 052). **A navegação por teclado em todas as rotas foi verificada à mão pelo stakeholder
e declarada correta ao orquestrador em 2026-09-23.** Isso inclui "Pular para o conteúdo" como primeiro foco,
o foco visível, o menu do celular, o botão copiar e os `<details>`. **Não há transcrição rota a rota feita pelo
orquestrador**; o registro é a declaração do stakeholder, com essa data.

Encerramento: `npx astro preview stop` (pid 16512) e `Stop-Process` no `workerd` (pid 16864) que segurava a
porta 8787. Depois disso as portas 4321, 8787 e 9000 ficaram sem processo escutando.

### Passo 5 — comentários de 7(b) e 7(c), `git diff` e `test:coverage`

`git diff -- tests/content/paridade-schema.test.ts tests/content/conteudo-valido.test.ts`:

```diff
diff --git a/tests/content/conteudo-valido.test.ts b/tests/content/conteudo-valido.test.ts
index 1d2b1de..6206398 100644
--- a/tests/content/conteudo-valido.test.ts
+++ b/tests/content/conteudo-valido.test.ts
@@ -6,8 +6,9 @@
  *                 `content/` passa pelo Zod — bloqueia merge"). Varre os arquivos reais das
  *                 cinco pastas de `content/`, lê o frontmatter com `gray-matter` — o mesmo
  *                 parser que o painel TinaCMS usa para gravar — e valida cada um contra o
- *                 schema Zod correspondente de `src/content.config.ts`. Fecha a dívida 5 e a
- *                 dívida 7(c) da fase 1: até este plano, `npm run build` podia encerrar com
+ *                 schema Zod correspondente de `src/content.config.ts`. Fecha a dívida 5 da
+ *                 fase 1 (a dívida 7(c) fecha em `paridade-schema.test.ts`): até este plano,
+ *                 `npm run build` podia encerrar com
  *                 `exit 0` mesmo com uma referência inválida em `content/` (`astro check`
  *                 reporta `[ERROR] [content]`, mas não falha o processo) — ver Contexto do
  *                 plano 030.
diff --git a/tests/content/paridade-schema.test.ts b/tests/content/paridade-schema.test.ts
index e4fd3e3..36e09bc 100644
--- a/tests/content/paridade-schema.test.ts
+++ b/tests/content/paridade-schema.test.ts
@@ -77,8 +77,9 @@
  *                 Dívida 7(b) — detecção de enum do lado Tina depois do ramo `campo.list` em
  *                 `classifyTina` (abaixo) — permanece deliberadamente não resolvida: não existe
  *                 campo com `list: true` **e** `options: [...]` hoje, e mudar `classifyTina` sem
- *                 um campo real para testar contra seria alteração não verificável. Fica como
- *                 guarda para a fase 3, quando campo novo nascer.
+ *                 um campo real para testar contra seria alteração não verificável. Continua
+ *                 aberta depois da fase 3, que não mudou schema. Fecha quando existir campo com
+ *                 `list: true` e `options`.
  * ============================================================================
  */
 import { readFileSync } from 'node:fs';
```

`npm run test:coverage` (depois da edição dos comentários — só cabeçalho, sem mudança de lógica;
mesma contagem de arquivos e testes de antes desta edição):

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  16 passed (16)
      Tests  263 passed (263)
   Start at  14:28:25
   Duration  1.66s (transform 4.55s, setup 0ms, import 8.18s, tests 291ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |                   
 src/lib           |     100 |    99.09 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 248/248 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 67/67 )
Lines        : 100% ( 224/224 )
================================================================================
```

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check`:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### Passo 6 — README da fase e `plans/README.md`

`git diff --stat -- plans/fase-3-site-publico/README.md plans/README.md`:

```
 plans/README.md                     |  9 +++-
 plans/fase-3-site-publico/README.md | 96 ++++++++++++++++++++++++++++++++++---
 2 files changed, 97 insertions(+), 8 deletions(-)
```

**Captura do ciclo 1 — ver Ciclo 2.** Os blocos abaixo (`grep`/`sed` sobre `PRD.md`) foram
capturados no ciclo 1; o Ciclo 2 alterou o texto que eles mostram (ver "Ciclo 2 — correções da
revisão", seções 3 e "Observações da revisão"). Mantidos aqui como registro histórico da captura
original, não como o estado atual do `PRD.md`.

### Passo 7 — PRD §0, §0.1, §12 e RN-02

`grep -n "Fase 3 — Site público (PT)" PRD.md` (tabela de progresso, §12):

```
794:| Fase 3 — Site público (PT) | 12/12 | 🟢 Concluída |
```

`sed -n '17p' PRD.md` (linha "Estado da implementação", §0 — sem contradição "não
iniciada"/"concluída" na mesma célula; capturada por número de linha porque é uma única linha
muito longa e a busca por emoji no `grep` corrompeu a codificação do terminal na primeira
tentativa, corrigida aqui):

```
17:| **Estado da implementação** | Fase 0 🟢 **concluída** (14 planos) · Fase 1 🟢 **concluída** em 2026-09-10 — os oito planos (015–022) DONE, o 021 promovido em `7d5b7e6` com CI verde sobre `26de58a` · Fase 2 🟢 **concluída** em 2026-09-12 — fatiada em 12 planos (023–034) em 2026-09-10; 023, 024, 025 e **026** DONE — desde `ab0d1f8` (2026-09-11) um push na `main` publica sozinho no Worker, sem intervencao, e desde o commit `7ab84da` (2026-09-11) está provado que **o painel em produção é quem origina esse push**: login do ADMIN pelo TinaCloud, edição salva no `/admin`, build automático e versão nova publicada; o checklist da fase vai a **3/5**; o **030** e o **031** também estão DONE e **não** fecham item do §12 (como o 023) — o que eles entregam são os dois portões que faltavam: arquivo inválido em `content/` e `tina/tina-lock.json` defasado passam a reprovar no CI **e no build de deploy**, suíte em 122 testes. Em **2026-09-12** o escopo foi recortado por decisão do stakeholder (sabatina `recorte-sem-professor`): **tudo que exige uma sessão com o professor passa para a fase 5** — os planos **027** e **029** e os três itens de §12 correspondentes —, e o critério de conclusão da fase 2 no §6.2 passa a ser o ciclo do **ADMIN**, já demonstrado pelo 026. O **033** fechou em **2026-09-12** (`0c2bd02`), consolidando em `docs/avisos-do-painel-para-o-manual.md` o que o painel deixa o professor fazer de errado — sem fechar item do §12, como o 023, o 030 e o 031. O **032** fechou em **2026-09-12** (`b992282`): o CI passa a auditar dependências, reprovando em `high`/`critical` e relatando `moderate`, com o portão **nascendo verde** — o `wrangler` subiu de `4.128.0` para `4.131.1` e as três `high` deixaram de existir. O **028** fechou em **2026-09-12** (`5528ad6`), levando o checklist da fase a **4/5**: como a Cloudflare não notifica falha do Workers Builds, um vigia agendado no GitHub Actions lê o resultado do build de deploy e reprova quando ele falha, gerando e-mail ao ADMIN (ADR-0011). O experimento com a `main` quebrada de propósito provou build falho nomeando arquivo e campo, site no ar na versão anterior e e-mail em menos de 1 min, com uma pendência nomeada: o caminho agendado ainda não foi observado rodando. O **034** fechou a fase em **5/5** (🟢 concluída): `README.md` ganhou a seção "Pipeline de publicação" (as cinco perguntas, com números medidos dos planos 025/026/028) e a seção "Deploy" foi reescrita — automático como caminho normal, `npm run deploy` como emergência. Execução completa; promovido a DONE em `ef7f258`, com CI e Workers Builds verdes. A revisão de integração do fechamento da fase reprovou com dois bloqueantes, corrigidos pelo **035** (`f7c31d3`): o `npm run deploy` de emergência passa a rodar o portão de conteúdo, e o vigia passa a reprovar build travado há mais de 60 min · Fase 3 🟢 **concluída** em 2026-09-23 — desbloqueada em 2026-09-14 (Q-04 respondida, visual em `docs/identidade-visual.md`), fatiada em 18 planos (036–053); **036 DONE** em 2026-09-16 (`fb117b6`, tokens, escala tipográfica e Archivo auto-hospedada) e **037 DONE** em 2026-09-16 (`23d1aa0`, dicionário de interface `src/i18n/pt.ts` e navegação) e **038 DONE** em 2026-09-16 (`1d0d3a5`, parágrafos, contagem e data pt-BR) e **039 DONE** em 2026-09-16 (`5705e73`, filtro de rascunho, singleton e ordenação de pesquisa) e **040 DONE** em 2026-09-16 (`6bf5aa4`, publicações por ano, autor destacado e links DOI/arXiv) e **041 DONE** em 2026-09-17 (`a2e28b7`, slug de disciplina, atuais × anteriores, contagens e scripts por aula), sem fechar item do §12 (pré-requisitos, como o 023); o **042 DONE** em 2026-09-17 (`db96df3`) é o primeiro com página visível — layout base, cabeçalho com menu do celular e rodapé — e **fecha o item "Layout base, cabeçalho, rodapé e navegação"** do §12 da fase 3; o **043 DONE** em 2026-09-17 (`dfdc0a3`) entrega os quatro componentes de base reusados por todas as rotas — `PageHeader` (rubrica, `<h1>` e a régua forte com o único movimento orquestrado do site), `PillButton`, `Tag` e `ExternalLink` — e **fecha, com o 036, o item "Identidade visual aplicada"**, que o **053** confere rota a rota (nenhuma rota os usa ainda). O **044 DONE** em 2026-09-17 (`4e48ce5`) entrega a **primeira rota de conteúdo real**: a Home mostra nome, cargo, departamento, instituição e a síntese `resumo_home`, mais três células-caminho com a contagem de itens **publicados** (02 linhas, 01 disciplina atual, 05 publicações) — e **fecha o item "Home (RF-20)"** do §12. A RN-01 foi provada por falsificação: sem `filterPublished` a contagem de publicações vai a 06, trazendo o rascunho para o site. Duas dívidas nomeadas para o 053, as duas por limitação da extensão do Chrome nesta máquina: a emulação de `prefers-reduced-motion: reduce` pelo DevTools e a navegação por Tab. O **045 DONE** em 2026-09-18 (`369637a`) entrega a **segunda rota de conteúdo real**, a Sobre: biografia em parágrafos, 5 linhas de formação **na ordem do professor** (sem reordenação), 4 áreas como tags neutras em caixa normal, contato e os perfis acadêmicos preenchidos — hoje Lattes e ORCID —, com **cada bloco sem dado sumindo junto com a rubrica** (RF-21): sem `foto` e sem `cv_url`, a página tem zero `<img>`, nenhum "Currículo em PDF" e exatamente quatro `<h2>`. **Fecha o item "Sobre (RF-21)" do §12.** Duas lições de instrumento, não de código, saíram daqui e valem para os planos 046–051: o `dist/**/index.html` é minificado em **uma linha**, então `grep -c` só pode devolver 0 ou 1 e não conta ocorrências (`grep -o ... | wc -l` deu 3 onde o `grep -c` deu 1); e o canário de rótulo órfão sobre a **página inteira** é inatingível por construção, porque o `BaseLayout.astro:53` busca o perfil por conta própria e o rodapé renderiza "Perfis acadêmicos" em toda rota — o teste correto escopa ao `<main>`, onde o resultado é 0. O **046 DONE** em 2026-09-18 (`97e006d`) entrega **Pesquisa**: as linhas publicadas na ordem de `ordem`, cada uma com numeral de posição `aria-hidden`, `id` de âncora, `resumo` e `corpo` em parágrafos, e a tag "N projetos em andamento" derivada dos projetos (no singular quando N=1, ausente quando zero); abaixo, os projetos publicados em `ProjectCard.astro` — **primeiro componente extraído de uma rota**, o que levou as duas páginas a **134 e 94 linhas**, as primeiras da onda abaixo do "alvo < 150" do §10.4. **Fecha o item "Pesquisa (RF-22)" do §12.** A RN-01 age em dois pontos e os dois foram provados **por falsificação**: `filterPublished` nas duas coleções, e `relatedLineAnchor` com o conjunto de linhas publicadas — com `new Set()` vazio a âncora `#sombras-de-buracos-negros` desaparece do HTML. Um terceiro canário, exigido na orquestração porque o critério estava provado só por leitura de código, mostrou a seção "Projetos" **sumindo inteira** com zero projetos publicados (zero `<article>`, e a rubrica virando "2 linhas · 0 projetos", prova colateral de que o canário estava ativo). Verificação no navegador a 360, 768 e 1440 px sem rolagem horizontal, com os cards empilhando a 360 e o **clique real na âncora** levando a seção alvo ao topo do viewport — a âncora navega, não apenas existe no HTML. A **revisão reprovou o ciclo 1** com dois defeitos textuais (comentário citando §6.3 para uma regra que está no §5.5; e a Evidência afirmando "nenhuma divergência de conteúdo" quando uma linha de pesquisa tem `corpo`, deixando esse elemento do critério sem prova), corrigidos e reaprovados no ciclo 2 com a suíte rodada de novo sobre os bytes corrigidos. Registrado ainda um incidente de **colisão de builds** causado pela orquestração — dois `build:pipeline` simultâneos no mesmo working tree, que o README da fase proíbe, com o segundo falhando em `Tina Dev server is already in use ... port 9000`; nenhum artefato foi contaminado (a falha morre no passo do Tina, antes do `astro build`) e a sequência está na Evidência. A grade de projetos usa `auto-fill` e deixa ~57% da largura vazia a 1440 px com dois cards: é o que o §6.3 da identidade prescreve literalmente, conferido na fonte — trocar por `auto-fit` é emenda de especificação, decisão do dono do produto. O **047 DONE** em 2026-09-18 (`4d90d92`) entrega **Ensino**: os dois grupos do RF-23 — "Atuais" antes de "Anteriores" — **sempre rotulados**, cada disciplina publicada com link para a própria página pelo slug do 041 e barra final, contagens derivadas no rodapé da célula ("5 aulas · 2 listas · 1 script") e **sem numeral** nas atuais (§8), porque disciplina atual não é sequência. **Fecha o item "Ensino (RF-23)" do §12.** A RN-03 fica explícita no código: a transição de atual para anterior é o campo `status`, sem lógica de data alguma. O estado vazio foi provado **por falsificação** — com `current = []` a caixa tracejada "Nenhuma disciplina neste semestre." aparece 1× e o `<h2>` "Atuais" **continua na página**, que é exatamente o que o RF-23 exige e o que sumiria numa implementação ingênua. Verificação no navegador a 360, 768 e 1440 px sem rolagem horizontal, com `elementFromPoint` nos quatro cantos e no centro de cada célula e de cada linha provando que o `<a>` cobre o alvo inteiro nos seis casos, e `aria-current="page"` em "Ensino". A revisão aprovou sem item obrigatório, com seis observações endereçadas ao 053, das quais duas valem registro: o ramo `noPrevious` **não** teve canário (o passo 4 do plano pedia um só, e o critério foi escrito no singular), e `codigo` ausente deixa a primeira coluna da linha anterior vazia — conferido no navegador a 1440 px, onde "Mecânica Clássica" começa em x=168 em vez de x=56. Não é defeito: é tabela de quatro colunas com célula vazia, que alinha os nomes quando houver vários registros; o §6.4 não legisla o caso. O **048 DONE** em 2026-09-18 (`5eaf30e`) entrega a **página de disciplina**, primeira rota **dinâmica** da fase: `getStaticPaths` gera uma página por disciplina publicada — trilha, cabeçalho com as tags `codigo`/`semestre`/status e o índice "Nesta página" montado por `presentSections`, ementa, aulas **na ordem do professor** (RN-04), listas com "Entrega dd/mm/aaaa", materiais, bibliografia ordenada e links, extraídos em `LessonList.astro` e `CourseResources.astro` para os três arquivos ficarem abaixo do alvo do §10.4 (146, 88 e 148 linhas). Scripts ficam para o 049: só o `general` de `groupScriptsByLesson` é calculado, e nenhuma seção "Scripts da disciplina" aparece. **Fecha o item "Página de disciplina (RF-24)" do §12.** Foi o **primeiro plano da fase a exigir dois ciclos de revisão**, e os dois obrigatórios do ciclo 1 valem registro. O primeiro era textual — o cabeçalho citava **F-08** para a regra "seção vazia some", quando o F-08 do §14 é *imagem ausente* e a regra está no §6.5 da identidade: **terceira ocorrência da mesma classe de defeito na fase**, depois do 043 e do 046. O segundo era de prova: o critério "rascunho não gera página" estava marcado por **leitura** do `filterPublished`, e o caminho negativo não existia no conteúdo. A orquestração **autorizou um canário que toca `content/`** — fora da lista de "Arquivos afetados", por isso vedado ao executor sozinho: com `publicado: false` em Mecânica Clássica o build saiu com **uma** página de disciplina e o diretório da outra deixou de existir; revertido por `git checkout --` (seguro porque o arquivo **está** commitado, ao contrário dos três fontes novos) e rebuildado com as duas de volta. Verificação no navegador nas duas rotas a 360/768/1440 px sem rolagem horizontal, com as seis âncoras de "Nesta página" navegando de verdade (clique real levando a seção ao topo), a trilha confirmando `codigo ?? nome` nos dois caminhos, o estado vazio com `--color-tracejado` medido por CSSOM, e o **fluxo D do §8.1 fechando em exatamente quatro toques**, que é a meta do PRD. Registrada ainda uma falha **da orquestração**, não do executor: a seção da verificação no navegador foi escrita mas nunca inserida no plano, e o despacho da revisão afirmou que ela estava lá — o revisor abriu o arquivo, não acreditou na afirmação, e reprovou o ciclo 2 por isso. Duas dívidas novas no README da fase: a tag-link de `CourseResources.astro` duplicando a composição visual de `Tag.astro`, e o risco (lido no script, não observado) de o gerador de Evidência apagar seções do orquestrador. O **054 DONE** em 2026-09-18 (`23a003d`) **não fecha item do §12** — é portão de qualidade, como o 023 e o 052 — e nasceu de um defeito reincidente: comentário citando o identificador errado do PRD (043, 046 e 048, um ciclo de revisão cada). Entrega a camada de **existência**, com `prd-citations.ts` e 22 testes: as **236** citações de `src/**` são conferidas contra `PRD.md` e `docs/identidade-visual.md`, e um canário com `§99.9` prova que o teste reprova nomeando arquivo e linha. A camada de **pertinência** foi **refutada por medição** e deliberadamente não entregue: 32 das 236 citações legítimas pontuam zero em sobreposição de vocabulário — `src/lib/published.ts:37` é um `// RN-01` **sozinho**, sem nenhuma palavra —, empatando com a citação errada conhecida, de modo que nenhum limiar escalar separa os dois lados. O plano registra a refutação como resultado negativo, não como critério afrouxado, e a revisão validou essa distinção. **Dois achados de fonte, não de código:** o arquivo criado para caçar citação trocada nasceu com uma (citava §10.4, "Convenções Gerais", para a regra que está no **§10.3**, "Comentários no Código") — quarta ocorrência da série; e **F-08 é ambíguo na própria documentação**, "Imagem ausente" no `PRD.md:298` e "Campo vazio não deixa rastro" no `docs/identidade-visual.md:32`, ambiguidade que está na origem do defeito apontado no 048 e cuja emenda é decisão do dono do produto, tocando os dois documentos. Três ciclos de revisão, e **as reprovações do segundo e do terceiro foram todas de texto do orquestrador**, não do executor. O **049 DONE** em 2026-09-21 (`1a028ce`) entrega o **painel de script**: destaque de sintaxe gerado **no build** pelo `<Code>` do Astro, num tema Shiki próprio de três tons de cinza (`#111112`, `#5A5754`, `#6E6A66`) e sem dependência nova; botão "Copiar código" como melhoria progressiva — oculto sem JS, copia o código exato e anuncia "Copiado" por `aria-live` durante 2 s —; e cada script sob a aula correspondente, com os órfãos na seção "Scripts da disciplina" (F-13). **Fecha o item "Scripts da disciplina…" (RF-37, F-13) do §12.** O F-13 foi provado por canário com `aula: 99` em `content/`. No navegador, a 360 px quem rola é o bloco de código, não a página, e colar de verdade devolveu os 323 caracteres com a indentação intacta. Dois ciclos de revisão; o ciclo 1 reprovou pela região `aria-live` que nunca era limpa, pelo preflight do Tailwind vencendo a fonte de código no `<pre>`/`<code>` e por um fallback que só servia ao canário. O **050 DONE** em 2026-09-22 (`5b97655`) entrega a página **Publicações**: blocos por ano em ordem decrescente, sem reordenação na página, o professor destacado por cor e `<strong>`, links DOI/arXiv/PDF só quando preenchidos (F-05) e resumo e palavras-chave recolhidos em `<details>`. **Fecha o item "Publicações agrupadas por ano (RF-25)" do §12.** A medição no navegador corrigiu a coluna do ano duas vezes: `8rem` estourava e `auto` desalinhava os blocos; ficou `11rem`. O **051 DONE** em 2026-09-22 (`8c6821c`) entrega a **página 404** e quita a dívida da fase 2 "`not_found_handling` ainda não provado": `src/pages/404.astro` gera `dist/404.html` com rubrica "Erro 404", pílula sólida "Voltar ao início" e as cinco rotas, sem CV e sem `<script>` próprio. A prova é por artefato nos três ambientes: no `wrangler dev` local, a rota inexistente responde `404` com a página, e o canário sem o arquivo volta ao corpo vazio; em produção, a linha de base antes do push era `404` com `Content-Length: 0`, e depois da versão `19c88528` do Worker o corpo servido tem o **mesmo SHA-256** do `dist/404.html` revisado. **Fecha o item "Página 404 (RF-27)" do §12** (10/12). Dois ciclos de revisão: o 1º reprovou só por documentação, porque o critério "nenhum `<script>`" não explicava o script do menu do celular, herdado do cabeçalho e idêntico em toda rota. O **052 DONE** em 2026-09-23 (`9af755e`) põe um teste Vitest sobre o `dist/` gerado — `tests/dist/site-gerado.test.ts`, com config própria e script `test:dist`, rodando no CI depois do `build:pipeline`: rotas fixas e `404.html`, uma página por disciplina publicada e nenhuma pasta sem disciplina, nenhum título de rascunho em HTML algum (RN-01), um `<h1>` e `lang="pt-BR"` por página, nenhuma fonte de terceiro, JS abaixo de 50 KB gzip por rota (hoje de 259 a 606 bytes) e nenhum `react-dom` (RNF-02). Cada asserção foi provada vermelha por canário sobre o `dist/`. O `.gitignore` passou de `dist/` a `/dist/`, porque o padrão sem âncora ignorava também `tests/dist/`. Três ciclos de revisão: o 1º pegou a deduplicação de módulos com chaves em dois formatos de caminho no Windows (contagem dupla) e um `src` inexistente valendo 0 em silêncio; o 2º, só contas escritas na Evidência. **Não fecha item do §12 sozinho** — é pré-requisito do item de testes, que fecha no 053. O **053** fecha a fase em **2026-09-23** e leva o checklist a **12/12**: sobre o mesmo build (SHA `c1ca1c1`), as 8 rotas × 3 larguras (360/768/1440 px) deram `scrollWidth = clientWidth` nas 24 linhas, sem elemento cortado (RF-26) — a única observação é o código do painel de script, a 360 px, rolando dentro do próprio `<pre>` (`overflow-x: auto`), não na página; o 404 do `wrangler dev` bateu SHA-256 com `dist/404.html`. O movimento (RF-32) foi observado pelo orquestrador em `no-preference` (duas animações, `<h1>` e régua) e com o CSS bloqueado (texto visível, nada em `opacity: 0`); o estado `reduce` e a navegação completa por teclado (RNF-15) — dívidas dos planos 042–051 — foram **verificados à mão pelo stakeholder em 2026-09-23** e declarados ao orquestrador, não observados por ele. A RN-02 do §5.3 ganhou a nota de "parcial" da Q-RN02 (opção c). Os comentários das dívidas 7(b) e 7(c) foram corrigidos sem mudar lógica de teste (mesma suíte). **Suíte medida neste plano:** `npm run test:coverage` — 263 testes em 16 arquivos, cobertura 100% linhas/statements/funções, 99,12% branches; mais `npm run test:dist` — 9 testes em 1 arquivo sobre o `dist/` recém-gerado; total **272 testes em 17 arquivos**. A faixa de células sem `padding-right` uniformizado com o rodapé foi **redirecionada** (decisão do stakeholder) para um plano próprio de extração, junto da mesma faixa duplicada em três cópias — o 053 não toca `src/`. Ver "O que a fase 3 empurra adiante, e as dívidas que ela criou" no README da fase para o destino de cada pendência (F-08 com duas definições, `pt.home.noneYet`, páginas acima de 150 linhas, Tailwind varrendo `plans/`/`docs/`, grade `auto-fill`, `pt.research.eyebrow` sem uso, tag-link de `CourseResources.astro`, ausência de teste de pertinência de F-08, Q-RN02, e o achado — não explicado — de o Workers Builds não ter disparado para o commit docs-only `db719f4` do 052). · Fases 4–5 ⬜ não iniciadas. Detalhe por item em §12; execução em `plans/README.md` |
```

Versão do PRD: `v0.1.52` → `v0.1.53` (conferida no §0 antes de editar, não suposta). RN-02 do §5.3
ganhou a nota de "parcial" da Q-RN02 (opção c). §0.1 ganhou a linha `v0.1.53` com o resumo deste
plano. §12: os dois itens restantes da fase 3 (RF-26 e RF-32/RNF-15) marcados `[x]`, tabela de
progresso em `12/12`, `🟢 Concluída`.

### Passo 8 — Portão local

`npm run lint` e `npm run format:check`: colados acima (passo 5), depois da edição dos dois
arquivos de teste — nenhuma edição de código posterior os invalida.

`npm run test:coverage`: colado acima (passo 5) — **263 testes em 16 arquivos**, cobertura 100%
statements/lines/funções, 99,12% branches.

`npm run build:pipeline` (rodado no ciclo 1, depois das edições de documentação daquele ciclo, para
o `dist/` descrito nesta Evidência vir do estado final do working tree naquele momento; **não**
rodado de novo no ciclo 2, por instrução do orquestrador — o `dist/` do triage, 2026-09-23 14:38, é
o que vale). **Medido:** `sha256sum dist/404.html`, sobre o `dist/` presente no working tree agora
(o do triage), devolve `e17406a0ce682eff48076a384e5baff38ec921847226ceb841547e3aa19ba6e7` — o mesmo
SHA-256 do 404 servido pelo `wrangler dev` no Passo 2 — e as edições dos dois ciclos (`PRD.md`,
`plans/README.md`, `plans/fase-3-site-publico/README.md`, dois cabeçalhos de teste, o próprio
plano) não tocam `src/` nem `content/`. **Inferido, não reconferido campo a campo:** que o restante
do HTML de saída também é idêntico ao do Passo 1 do orquestrador — inferência do escopo do diff, não
de comparação byte a byte de cada página dos dois `dist/`):

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  14:33:01
   Duration  1.15s (transform 1.81s, setup 0ms, import 2.99s, tests 67ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m14:33:30[22m [34m[content][39m Syncing content
[2m14:33:30[22m [34m[content][39m Synced content
[2m14:33:30[22m [34m[types][39m Generated [2m563ms[22m
[2m14:33:30[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (60 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m14:33:38[22m [34m[content][39m Syncing content
[2m14:33:38[22m [34m[content][39m Synced content
[2m14:33:38[22m [34m[types][39m Generated [2m509ms[22m
[2m14:33:38[22m [34m[build][39m output: [34m"static"[39m
[2m14:33:38[22m [34m[build][39m mode: [34m"static"[39m
[2m14:33:38[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m14:33:38[22m [34m[build][39m Collecting build info...
[2m14:33:38[22m [34m[build][39m [32m✓ Completed in 549ms.[39m
[2m14:33:38[22m [34m[build][39m Building static entrypoints...
[2m14:33:38[22m [34m[vite][39m [32m✓ built in 432ms[39m
[2m14:33:38[22m [34m[vite][39m [32m✓ built in 69ms[39m
[2m14:33:38[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m14:33:38[22m   [34m├─[39m [2m/404.html[22m [2m(+17ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+5ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+97ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+8ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+8ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+7ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+21ms)[22m 
[2m14:33:38[22m   [34m├─[39m [2m/index.html[22m [2m(+4ms)[22m 
[2m14:33:38[22m [32m✓ Completed in 203ms.
[39m
[2m14:33:38[22m [34m[build][39m [32m✓ Completed in 764ms.[39m
[2m14:33:38[22m [34m[build][39m 8 page(s) built in [1m1.34s[22m
[2m14:33:38[22m [34m[build][39m [1mComplete![22m
```

`npm run test:dist -- --reporter=verbose` (sobre o `dist/` recém-gerado acima):

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 259 bytes
  /ensino/2025-1-mecanica-classica/index.html → 259 bytes
  /ensino/2026-2-relatividade-geral/index.html → 606 bytes
  /ensino/index.html → 259 bytes
  /index.html → 259 bytes
  /pesquisa/index.html → 259 bytes
  /publicacoes/index.html → 259 bytes
  /sobre/index.html → 259 bytes

 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes e dist/404.html existem 1ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 0ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 4ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e lang="pt-BR" (§8.3) > todo .html de dist/ (fora de admin/) declara <html lang="pt-BR"> 4ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 5ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 6ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 5ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  14:33:46
   Duration  287ms (transform 60ms, setup 0ms, import 120ms, tests 29ms, environment 0ms)
```

**Suíte medida neste plano (não estimada):** `test:coverage` → 263 testes, 16 arquivos;
`test:dist` → 9 testes, 1 arquivo. **Total: 272 testes em 17 arquivos.** `tests/content` (108
testes) está incluído nos 263 do `test:coverage`.

**O que este passo NÃO rodou:** a parte remota do portão — CI do GitHub Actions e Workers Builds no
commit de fechamento — é do orquestrador, depois da promoção. Não há commit desta sessão, então não
há SHA de fechamento para consultar ainda.


## Ciclo 2 — correções da revisão (7 obrigatórios)

A revisão reprovou o ciclo 1 com 7 obrigatórios. Corrigido só dentro de "Arquivos afetados"
(`PRD.md`, `plans/README.md`, `plans/fase-3-site-publico/README.md`, o próprio plano). **Não rodei
`build`/`build:pipeline`** — o `dist/` do triage (2026-09-23 14:38) é o que foi lido para o item 3.

### 1 — Mojibake no bloco do Passo 5

O `git diff tests/content` original foi capturado via `subprocess` do Python chamado por `bash -c`,
que corrompeu a codificação (cp1252 em vez de UTF-8). Regerado com `git diff` direto no Bash,
redirecionado a arquivo (`diff-tests-utf8.txt`), e o bloco `` ```diff ``` `` do Passo 5 foi
substituído por script a partir desse arquivo.

O grep que a revisão usou para achar mojibake (o padrão com as duas sequências corrompidas) casava
**15** vezes antes da correção. Depois, casa só **1** vez: a linha do Passo 8 que declara o que não
foi rodado remotamente, com o acento correto da negativa em maiúsculas. Nenhuma outra ocorrência de
codificação corrompida sobra no arquivo.

### 2 — `plans/README.md:17-21` quebrado em várias linhas físicas

A linha da tabela da fase 3 tinha sido quebrada em 5 linhas físicas no meio de uma célula,
invalidando a tabela Markdown. Rejuntada numa linha só.

`awk 'NR>=12 && NR<=24' plans/README.md` (toda linha de tabela começa com `|`; as linhas 20-24 são
o parágrafo de prosa que segue a tabela, não linhas de tabela):

```
12: | Pas
13: |---|
14: | [`f
15: | [`f
16: | [`f
17: | [`f
18: | `fa
19: | [`f
20: 
21: A ord
22: prop
23: layou
24: intei
```

### 3 — Item 2 do §12 ("Identidade visual aplicada"), opção (a)

Conferência **só por leitura do `dist/` atual** (build do triage, 2026-09-23 14:38 — não rodei
`build:pipeline`), nas 8 rotas (7 páginas + `404.html`), com `grep -o ... | wc -l` (nunca `grep
-c`, pela lição do 045). Assinatura real do `PageHeader.astro` conferida na fonte antes de contar:
`<h1 class="text-display-1 titulo-entrada ...">` e `<div aria-hidden="true" class="regua-entrada
bg-tinta h-px">`. A Home (`index.astro`) **não importa `PageHeader`** — replica manualmente as
mesmas classes (`titulo-entrada` no `<h1>`, `regua-entrada` na régua), registrado em vez de forçado.

| Rota | `<h1>` | `titulo-entrada` | `regua-entrada` | CSS auto-hospedado em /_astro/ | fonts.googleapis |
|---|---|---|---|---|---|
| / | 1 | 1 | 1 | 1 | 0 |
| /sobre/ | 1 | 1 | 1 | 1 | 0 |
| /pesquisa/ | 1 | 1 | 1 | 1 | 0 |
| /ensino/ | 1 | 1 | 1 | 1 | 0 |
| /ensino/2026-2-relatividade-geral/ | 1 | 1 | 1 | 1 | 0 |
| /ensino/2025-1-mecanica-classica/ | 1 | 1 | 1 | 1 | 0 |
| /publicacoes/ | 1 | 1 | 1 | 1 | 0 |
| 404 | 1 | 1 | 1 | 1 | 0 |

8/8 rotas: exatamente um `<h1>`, a assinatura do `PageHeader` presente (`titulo-entrada` e
`regua-entrada`, via componente ou via a mesma marcação replicada na Home), uma folha de estilo
auto-hospedada em `/_astro/*.css`, zero `fonts.googleapis`. §12 item 2 marcado com o resultado
(`PRD.md`), e a frase "nenhuma rota usa os componentes ainda" tirada dos três lugares apontados
(`PRD.md`, duas ocorrências, e `plans/README.md`), virando nota histórica ("quando o 043 fechou, em
2026-09-17").

### 4 — F-08: âncora estável e contagem atual

A seção real não é §14 ("Dependências e Premissas") — conferido no PRD: `grep -n "^## 14" PRD.md` →
`925:## 14. Dependências e Premissas`. A definição de F-08 está no **§5.4** ("Casos de Borda e
Cenários de Falha (Fallbacks)"), linha da tabela `F-08`. A citação antiga `PRD.md:298` **estava
certa** no commit `23a003d` — `git show 23a003d:PRD.md | sed -n '298p'` mostra a linha da tabela
`F-08` — e ficou desatualizada porque o §0.1 do PRD ganhou linhas depois desse commit, deslocando
F-08 para baixo (hoje `grep -n "^| F-08\|^| F-04" PRD.md` dá F-04 em 300 e F-08 em 304). Por isso a
âncora estável passou a ser "§5.4, linha F-08", não um número de linha (ver "Ciclo 3", ao final,
para a refutação da versão anterior deste trecho).

`grep -rn "F-08" src` (2026-09-23):

```
src/components/ProjectCard.astro:10: *                 (F-08). Extraído de src/pages/pesquisa.astro para manter a
src/pages/index.astro:11: *                 uma quarta célula com o retrato em p&b (F-08).
src/pages/index.astro:87:// F-08: sem foto a faixa vira três colunas — sem espaço reservado, sem ícone.
src/pages/sobre.astro:10: *                 os campos preenchidos, sem rótulo órfão (F-08).
src/pages/sobre.astro:180:     de recomposição do SiteFooter.astro, sem espaço reservado (F-08). Célula sem borda externa,
```

5 ocorrências, incluindo `src/pages/index.astro:87`, como a revisão apontou.

### 5 — Páginas acima de 150 linhas: são quatro, não três

`wc -l` das quatro (2026-09-23):

```
  181 src/pages/index.astro
  217 src/pages/sobre.astro
  163 src/pages/ensino/[slug].astro
  155 src/pages/ensino.astro
  716 total
```

`ensino.astro` com 155 linhas (desde o 047) estava faltando na seção nova e na linha da tabela de
dívidas herdadas (~174). Corrigidas as duas, com o "fecha quando" ajustado para "as quatro rotas".

### 6 — Grade `auto-fill` sem destino no README da fase

Acrescentada à seção nova "O que a fase 3 empurra adiante...", citando a Evidência do 046 (~425-430):
o código está certo (`auto-fill` é o que o §6.3 de `docs/identidade-visual.md` prescreve
literalmente), e falta o dono do produto confirmar essa leitura ou emendar o §6.3 para `auto-fit`.

### 7 — Workers Builds no `db719f4`: hipótese refutada

`gh api .../commits/<sha>/check-runs` para os dois commits docs-only consecutivos:

```
commit db719f4aed9cd2c8820636d9f6acb32c0dbf068d (docs-only, 052 DONE):
{"conclusion":"success","name":"qualidade","status":"completed"}

commit c1ca1c186d08be02038868894af19a3e76e43288 (docs-only, README cita test:dist):
{"conclusion":"success","name":"Workers Builds: haroldo-page","status":"completed"}
{"conclusion":"success","name":"qualidade","status":"completed"}
```

`c1ca1c1` (só `README.md`) **disparou** o Workers Builds com `success`; `db719f4` (só `PRD.md` +
3 arquivos de `plans/`) **não** disparou. A hipótese de filtro por caminho (docs-only não dispara)
está **refutada** pelo próprio `c1ca1c1`. Reescrito o item: fato observado, hipótese refutada,
causa desconhecida, "fecha quando: a causa for identificada ou o fenômeno se repetir e for
investigado".

### Observações da revisão

- **"com o CSS bloqueado" → "sem CSS"** no §0 e no §0.1 do PRD (as duas ocorrências que eu tinha
  escrito, fora do texto do critério 2 do plano, que não foi tocado) — corrigido, porque o método
  real do Passo 3 foi remover as folhas de estilo do documento (`document.styleSheets.length ===
  0`), não bloquear a requisição de rede no DevTools (que o plano descreve, mas a Evidência já
  registrava como "método equivalente, não idêntico").
- **Faixa "042 ao 052"** — o §0 dizia "dívidas dos planos 042–051"; corrigido para "042 ao 052",
  consistente com o resto do texto (a dívida foi acumulada até o 052 inclusive, já que o 052 não
  mexeu em UI mas também não a fechou).
- **Dívida do 047 (`noPrevious` sem canário)** — conferida na Evidência do 047 (reproduzida também
  no §0 do PRD, entrada de v0.1.46: "o ramo `noPrevious` não teve canário") e acrescentada à seção
  nova do README da fase, com "fecha quando".
- **"o HTML gerado é idêntico ao passo 1" era dedução** — a frase do Passo 8 foi reescrita para
  separar o que foi medido (o SHA-256 do 404 bate com o do Passo 2) do que é inferido (nenhuma
  edição deste plano toca `src/`/`content/`, então o HTML deveria ser o mesmo — não recontado
  campo a campo).
- **LF**: o plano estava em CRLF no ciclo 1 (445 CRs, segundo a revisão do ciclo 2). `grep -c $'\r'` não é instrumento válido nesta máquina — devolve `0` mesmo com CRLF, no Git Bash desta máquina. O instrumento válido é `tr -cd '\r' < <plano> | wc -c`, que tem de dar `0`; ver "Ciclo 3", ao final, para a medição atual.
- **Qualificadores "promoção do 053 pendente"**: não tocados — ficam para a promoção, que é do
  orquestrador.

### `git diff --stat` do ciclo 2

```
 PRD.md                              |  17 ++---
 plans/README.md                     |   5 +-
 plans/fase-3-site-publico/README.md | 123 +++++++++++++++++++++++++++++++++---
 3 files changed, 127 insertions(+), 18 deletions(-)
```

### Portão local, de novo (sem rodar build)

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check`:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test:coverage` (mesmos 263 testes de antes; nenhuma edição deste ciclo tocou `src/` ou
`tests/`):

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  16 passed (16)
      Tests  263 passed (263)
   Start at  14:52:43
   Duration  1.71s (transform 4.62s, setup 0ms, import 8.09s, tests 287ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |                   
 src/lib           |     100 |    99.09 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 248/248 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 67/67 )
Lines        : 100% ( 224/224 )
================================================================================
```


## Ciclo 3 — correções da revisão (2 obrigatórios)

A revisão reprovou o ciclo 2 com 2 obrigatórios, os dois sobre texto escrito nos ciclos
anteriores (nenhum sobre código, build ou teste). Corrigido só dentro de "Arquivos afetados"
(o próprio plano e `plans/fase-3-site-publico/README.md`). **Não rodei** lint, format, testes,
build nem qualquer comando que escreva em `dist/` — o ciclo 3 é só edição de texto em dois
arquivos de plano/documentação (`plans/` está no `.prettierignore`).

### 1 — Afirmação falsa sobre `PRD.md:298` e F-08

O README da fase (seção "O que a fase 3 empurra adiante...") e a seção 4 deste plano
("F-08: âncora estável e contagem atual") afirmavam que a citação `PRD.md:298` "já estava
errada, era a linha do F-04". **Isso era falso.** Conferido:

`git show 23a003d:PRD.md | sed -n '298p' | cut -c1-80`:

```
| F-08 | Imagem ausente (perfil sem foto, notícia sem imagem) | Layout degrada 
```

`grep -n "^| F-08\|^| F-04" PRD.md | cut -c1-80` (estado atual):

```
300:| F-04 | Link do Google Drive quebrado ou sem permissão pública | O site c
304:| F-08 | Imagem ausente (perfil sem foto, notícia sem imagem) | Layout degr
```

No commit `23a003d` (quando o 054 fechou e escreveu a citação original), a linha 298 do
`PRD.md` **era** a linha da tabela `F-08` — a citação estava certa. Ela ficou desatualizada
depois, porque o §0.1 do PRD ganhou linhas (cada `v0.1.NN` novo é uma linha na tabela de
versões, que fica **acima** do §5.4 no arquivo), empurrando F-08 para baixo — hoje em 304,
com F-04 em 300. A âncora estável correta sempre foi "§5.4, linha F-08" (referência por
seção, não por número de linha), não a acusação de que a citação nunca esteve certa.

**A afirmação "a PRD.md:298 nunca foi a F-08", repassada pelo orquestrador no despacho do
ciclo 2, foi refutada por `git show 23a003d:PRD.md`** (comando e saída acima). O ciclo 2
aceitou essa alegação sem conferir a fonte histórica — a mesma classe de falha que a
memória do projeto ("revisão reproduz, não aceita") existe para evitar.

Os dois trechos foram reescritos: README da fase (bullet de "F-08 tem duas definições") e
a seção 4 deste plano.

### 2 — Nota de LF falsa, com byte CR literal dentro do próprio texto

O bullet "LF" das "Observações da revisão" (Ciclo 2) continha **um byte CR (0x0D) literal**
dentro do trecho `` `grep -c $'<CR>'` `` — visível só com `cat -A` (`^M`), e era o **único**
CR do arquivo inteiro (confirmado abaixo). A afirmação também era falsa: no ciclo 1 o plano
**estava** em CRLF (445 CRs, segundo a própria revisão do ciclo 2 que pediu a conversão), e
`grep -c $'\r'` **não detecta CR** no Git Bash desta máquina — devolve `0` mesmo sobre um
arquivo em CRLF, então nunca foi instrumento válido para essa checagem.

O bullet foi reescrito sem o byte CR (o `\r` agora aparece como os dois caracteres barra
invertida e "r", nunca como byte), registrando: o plano estava em CRLF no ciclo 1,
`grep -c $'\r'` não é instrumento válido nesta máquina, e o instrumento válido é
`tr -cd '\r' < <plano> | wc -c`, que tem de dar `0`.

### Observações da revisão (feitas também)

- **README da fase, dívida "Emulação de `prefers-reduced-motion`" (~linha 171):** "o texto
  visível com o CSS bloqueado" trocado por "o texto visível sem CSS" — o método real do
  Passo 3 foi remover as folhas de estilo do documento, não bloquear a requisição de rede
  no DevTools (mesma correção que o Ciclo 2 já tinha aplicado ao PRD §0 e §0.1; esta
  ocorrência no README da fase tinha ficado de fora).
- **Antes do bloco "### Passo 7 — PRD §0, §0.1, §12 e RN-02":** acrescentada a nota
  "Captura do ciclo 1 — ver Ciclo 2", porque os blocos `grep`/`sed` daquele passo mostram o
  `PRD.md` como estava no ciclo 1, antes das correções de texto do Ciclo 2 ("com o CSS
  bloqueado" → "sem CSS", entre outras) — mantidos como registro histórico da captura,
  não como o estado atual do `PRD.md`.

### Conferência de CR e `git diff --stat` (antes desta seção ser escrita)

`tr -cd '\r' < plans/fase-3-site-publico/053-verificacao-transversal-e-fechamento-da-fase-3.md | wc -c`:

```
0
```

`tr -cd '\r' < plans/fase-3-site-publico/README.md | wc -c`:

```
0
```

`git diff --stat` (antes de inserir esta seção — a inserção da própria seção Ciclo 3 ainda
vai acrescentar linhas ao diff do plano, medidas de novo logo abaixo):

```
 PRD.md                                             |  17 +-
 plans/README.md                                    |   5 +-
 ...rificacao-transversal-e-fechamento-da-fase-3.md | 573 ++++++++++++++++++++-
 plans/fase-3-site-publico/README.md                | 127 ++++-
 tests/content/conteudo-valido.test.ts              |   5 +-
 tests/content/paridade-schema.test.ts              |   5 +-
 6 files changed, 701 insertions(+), 31 deletions(-)
```


### Conferência de CR, de novo, depois de escrita a seção acima

A própria escrita desta seção Ciclo 3 não introduz CR (texto gerado por script em UTF-8 com
`newline='\n'`). Confirmado depois de escrita:

`tr -cd '\r' < plans/fase-3-site-publico/053-verificacao-transversal-e-fechamento-da-fase-3.md | wc -c`:

```
0
```

`tr -cd '\r' < plans/fase-3-site-publico/README.md | wc -c`:

```
0
```

Ambos continuam `0` — o valor **não mudou**, confirmando que a própria inserção não
reintroduziu CR. `git diff --stat`, de novo (este **muda**, e é esperado: a seção Ciclo 3 em
si acrescentou linhas ao plano desde a captura anterior; o que não muda é a contagem de CR):

```
 PRD.md                                             |  17 +-
 plans/README.md                                    |   5 +-
 ...rificacao-transversal-e-fechamento-da-fase-3.md | 671 ++++++++++++++++++++-
 plans/fase-3-site-publico/README.md                | 127 +++-
 tests/content/conteudo-valido.test.ts              |   5 +-
 tests/content/paridade-schema.test.ts              |   5 +-
 6 files changed, 799 insertions(+), 31 deletions(-)
```

