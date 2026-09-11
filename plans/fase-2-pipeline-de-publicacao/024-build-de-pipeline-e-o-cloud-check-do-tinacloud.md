# Plano 024 — Comando de build dos pipelines e o acoplamento com o cloud check do TinaCloud

**Status:** TODO
**RFs cobertos:** RF-11 (publicação sem intervenção do desenvolvedor), RNF-04, RNF-12; fase 2,
itens 1 e 2 do §12 (pré-requisito de ambos); **dívida 1** da fase 1
**Depende de:** plano 023 (não por arquivo — por ordem: o 023 abre a fase e é trivial)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe um comando de build determinístico para os **dois pipelines automáticos** — GitHub Actions
e Cloudflare Workers Builds — que não depende de o TinaCloud já ter reindexado a branch `main`
no instante em que o build começa. O GitHub Actions passa a rodá-lo, e o Workers Builds é
configurado com ele no plano 025. A decisão fica registrada em **ADR-0009**.

Sem este plano, o item 1 da fase 2 (build automático no push) é ligado sobre um comando que pode
falhar **sem haver defeito**, e a primeira coisa que o professor veria do pipeline novo seria um
deploy vermelho aleatório.

## Arquivos afetados

- `package.json` — script novo `build:pipeline`; `build`, `dev`, `deploy` e os demais **inalterados**
- `.github/workflows/ci.yml` — o passo de build passa a chamar `npm run build:pipeline`; e o
  comentário das linhas 12–20, que hoje diverge do próprio YAML, é corrigido
- `docs/adr/0009-build-de-pipeline-sem-cloud-check.md` — **novo**
- `README.md` — a linha do comando novo na tabela de "Comandos" e a sequência descrita em
  "Qualidade"

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** edite `tina/config.ts` nem `src/content.config.ts` fora do canário
> temporário do passo 5 (que é revertido no mesmo passo); **não** edite `wrangler.toml` (o
> plano 025 é quem configura o Workers Builds); **não** edite a seção "Deploy" do `README.md`
> (é do plano 034); **não** acrescente passo de `npm audit` ao `ci.yml` (é do plano 032).

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA), Astro 7
estático (D-01, sem adapter, sem SSR) + TinaCMS 3.12.1 / `@tinacms/cli` 2.6.1. Repositório
público `researchgroups-ufma/haroldo-page`. Windows 11 / PowerShell, Node 24.16.0.

**Estado dos scripts hoje** (`package.json`):

```json
"dev": "tinacms dev -c \"astro dev\"",
"start": "astro dev",
"build": "tinacms build && astro check && astro build",
"deploy": "npm run build && wrangler deploy",
"test": "vitest run",
"test:coverage": "vitest run --coverage"
```

**Estado do CI hoje** (`.github/workflows/ci.yml`): um job `qualidade` em `push`/`pull_request`
na `main`, com `npm ci` → `lint` → `format:check` → `test:coverage` → `build`, este último
recebendo `TINA_CLIENT_ID` e `TINA_TOKEN` dos secrets (commit `82fb4de`, 2026-09-04).

### O problema, em uma frase

`tinacms build` compara o schema local com o que o TinaCloud indexou em `main` e aborta com
`ERR_CLOUD_CHECK_FAILED` enquanto os dois não baterem. **Isso é útil na máquina do
desenvolvedor** — é o aviso de "você mudou o schema e ainda não empurrou". **Num pipeline
automático não é**: lá o commit já está em `main` por construção, e o que resta do cloud check é
uma corrida contra a reindexação assíncrona do TinaCloud. Um push que altere schema pode disparar
o build antes de o TinaCloud reindexar e reprovar sem haver defeito nenhum.

Saída literal do modo de falha, colada da Evidência do plano 022 (2026-09-10):

```
Starting Tina build

The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes
to GitHub to update your remote GraphQL schema. null
	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Last indexed at: Fri, 04 Sep 2026 13:32:36 GMT
	Reason: [NON_BREAKING - TYPE_ADDED] Type 'DisciplinasScripts' was added
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
```

Nos planos 017, 018 e 022 esse bloqueio foi absorvido por um humano, que empurrava o commit,
esperava a reindexação e repetia o build. **No Workers Builds não há humano nessa posição**, e
esta é a dívida 1 que a fase 1 empurrou para cá.

### A decisão — já tomada, não reabra sem evidência nova

**Os dois pipelines automáticos rodam `tinacms build --skip-cloud-checks`; o comando local
`npm run build` continua com o cloud check.** Concretamente:

```json
"build:pipeline": "vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build"
```

Quatro pontos, e cada um tem razão própria:

1. **`--skip-cloud-checks` só no pipeline.** No pipeline o commit já está em `main`; o que o
   cloud check acrescenta ali é exclusivamente a corrida com a reindexação. Na máquina do
   desenvolvedor ele acrescenta informação real, e por isso **`npm run build` não muda** — ele
   segue sendo o portão pré-push obrigatório de todo plano que mexa em schema, na ordem de
   fechamento que os planos 017, 018 e 022 já usaram (revisão → commit → push → TinaCloud
   reindexa → `npm run build` verde → `Status: DONE`).
2. **O mesmo comando no GitHub Actions e no Workers Builds.** Se o CI rodasse `npm run build` e o
   deploy rodasse outra coisa, o verde do CI deixaria de dizer alguma coisa sobre o deploy — a
   armadilha que custou 14 commits vermelhos a esta fase 1. Um comando só, nos dois.
3. **`vitest run tests/content` na frente.** É o que torna o build do deploy capaz de recusar
   conteúdo inválido salvo pelo painel. Existe motivo medido: o `astro check` imprime
   `[ERROR] [content]` e **ainda assim encerra com `0 errors` e exit 0` (plano 020, materializado
   de novo no 021) — o exit code do build não protege contra referência de conteúdo inválida.
   `tests/content/` hoje tem `schemas.test.ts` e `paridade-schema.test.ts`; o plano 030 acrescenta
   ali o portão de conteúdo, e ele passa a valer no deploy **sem nenhuma alteração neste script**.
   Roda em ~1 s e é determinístico (nenhum teste da pasta depende de rede, data ou ordem).
4. **`npm run deploy` (deploy manual) fica como está**, chamando `npm run build` com cloud check.
   É o caminho de emergência, executado por um humano numa máquina onde o que está no disco pode
   não estar em `main` — ali o comando mais estrito é o certo.

**O que esta decisão custa, e que o ADR tem de registrar:** os pipelines deixam de ter um sinal
automático de "o TinaCloud indexou o schema de `main`". Esse sinal passa a ser dado onde ele é
real — no `/admin` **em produção** (plano 026, que abre o painel e edita por ele) e no
`npm run build` local antes de empurrar mudança de schema. Um TinaCloud que pare de indexar
quebra o `/admin`, não o site: o site público não depende do TinaCloud em runtime (§7.1, F-03).

**Se a verificação do passo 4 mostrar que `--skip-cloud-checks` altera o artefato gerado**
(`dist/`, `public/admin/` ou `tina/__generated__/`), **pare e reporte**. A decisão acima pressupõe
que a bandeira pula uma *validação*, não uma *geração* — se isso for falso, a decisão volta para
sabatina, não se conserta aqui. Precedente que obriga esse cuidado: neste projeto uma revisão já
aprovou uma correção que não funcionava porque a prova foi leitura de `node_modules` em vez de
exercício real.

### A divergência de comentário do `ci.yml` — código é a verdade

As linhas 12–20 do workflow explicam a subida das actions assim: *"checkout v5 e setup-node v5
passaram a usar Node 24 nativo"*. O YAML logo abaixo usa `actions/checkout@v7` e
`actions/setup-node@v7`, e o próprio comentário, três linhas depois, fala em *"o bloqueio de fork
PR do checkout v7"*. O comentário ficou de uma versão intermediária da redação. Pelo `CLAUDE.md`
do projeto, **o código é a verdade e a divergência é reportada, não escondida**: corrija a frase
para v7, preservando o resto do comentário (a justificativa do `cache: 'npm'` explícito e a nota
sobre `pull_request_target`/`workflow_run` continuam corretas e valiosas).

Frase de substituição sugerida (pode polir, não pode continuar dizendo v5):

```
# essas actions para o Node 24 e anotava um warning de depreciacao a cada
# execucao. checkout v7 e setup-node v7 tem como alvo o Node 24 nativo.
```

### Padrões da casa que este plano precisa obedecer

- **ADR:** ADRs 0001–0008 existem em `docs/adr/`. Este é o **0009**, o primeiro da fase 2. Siga a
  estrutura dos existentes (leia `docs/adr/0008-paridade-zod-tina-como-rede-de-protecao.md` antes
  de escrever) e inclua **gatilho de revisão**: a decisão se revisita se o TinaCMS passar a
  oferecer verificação de indexação não-bloqueante, ou se o `/admin` em produção quebrar por
  schema não indexado.
- **Cabeçalho de arquivo e docstrings:** §10.1 e §10.2 do PRD são normativas. Este plano não cria
  módulo TypeScript novo, mas o ADR tem cabeçalho conforme os irmãos.
- **`git add` por caminho explícito.** Nunca `git add -A` nem `git add .`.
- **`Status:` fica em `TODO`.** Quem promove para `DONE` é o orquestrador, depois da verificação
  independente **e** da revisão aprovada.
- **Evidência é saída literal, colada**, da execução desta sessão. Nada de saída de um comando
  rotulada como de outro.
- Este plano **não muda schema**, então `npm run build` deve fechar verde **sem** depender de
  push. Se aparecer `ERR_CLOUD_CHECK_FAILED`, é achado a reportar — significa que o schema em
  `main` divergiu por outro caminho.

## Passos

1. Ler `package.json`, `.github/workflows/ci.yml` (inteiro, comentários inclusive), a seção
   "Comandos" e a seção "Qualidade" do `README.md`, e dois ADRs existentes para pegar a forma.
   → verify: você consegue dizer qual passo do `ci.yml` recebe os secrets e por que eles estão no
   passo e não no job.
2. Registrar a linha de base: rodar `npm run build` e guardar (a) a saída literal e (b) a listagem
   com hash de `dist/`, `public/admin/` e `tina/__generated__/`. No PowerShell:
   `Get-ChildItem -Recurse -File dist, public/admin, tina/__generated__ | Get-FileHash -Algorithm MD5 | Sort-Object Path`.
   → verify: build verde, sem nenhuma linha `[ERROR]` no corpo da saída (leia o texto, não só o
   exit code — armadilha do plano 020). Listagem salva.
3. Acrescentar o script `build:pipeline` ao `package.json`, exatamente como transcrito no
   "Contexto necessário", sem alterar nenhum outro script.
   → verify: `git diff -- package.json` mostra uma única linha acrescentada.
4. Rodar `npm run build:pipeline` e comparar o artefato com a linha de base do passo 2.
   → verify: mesma lista de arquivos e **mesmos hashes** nas três pastas; cole a comparação
   (diferença vazia). Se houver diferença, **pare e reporte** — ver o aviso do "Contexto
   necessário".
5. Provar que a diferença entre os dois comandos é exatamente o cloud check, com canário A/B:
   acrescente um campo opcional canário **aos dois lados** do schema (`tina/config.ts` e
   `src/content.config.ts`, ex.: `canario_024` string opcional em `linhas-pesquisa`) — os dois,
   para que a paridade continue verde e o canário isole só o cloud check. Rode os dois comandos.
   → verify: `npm run build` reprova com `ERR_CLOUD_CHECK_FAILED` /
   `Reason: [NON_BREAKING - TYPE_ADDED] ...` (o commit do canário não subiu), e
   `npm run build:pipeline` **passa** a etapa do Tina. Cole as duas saídas. Em seguida remova o
   canário dos dois arquivos e prove que nada sobrou: `git diff -- tina/config.ts src/content.config.ts`
   **vazio**, colado.
6. Trocar o passo de build do `ci.yml` para `npm run build:pipeline`, mantendo o bloco `env:` com
   os dois secrets (o `tinacms build` continua precisando deles — `--skip-cloud-checks` **não**
   contorna a falta de credencial: a falha por credencial é anterior ao cloud check, na construção
   do cliente, conforme apurado em 2026-09-04). Corrigir, no mesmo arquivo, a frase v5 → v7 do
   comentário e acrescentar ao comentário do passo de build a razão de o comando ser o
   `build:pipeline`, apontando para o ADR-0009.
   → verify: `git diff -- .github/workflows/ci.yml` mostra só essas alterações; nenhuma menção a
   v5 sobra (`grep -n "v5" .github/workflows/ci.yml` sem resultado).
7. Escrever `docs/adr/0009-build-de-pipeline-sem-cloud-check.md`, com: contexto (o acoplamento e a
   corrida), decisão (os quatro pontos), alternativas rejeitadas (manter o cloud check no pipeline
   e reexecutar o job; mover o deploy para o GitHub Actions), consequências (inclusive a perda do
   sinal automático de indexação e onde ele passa a ser dado) e gatilho de revisão.
   → verify: o ADR cita a saída real do `ERR_CLOUD_CHECK_FAILED` e as evidências dos passos 4 e 5,
   sem duplicá-las por extenso.
8. Atualizar o `README.md`: linha nova na tabela de "Comandos" descrevendo `npm run build:pipeline`
   e o que ele tem a mais e a menos que `npm run build`; e a sequência da seção "Qualidade", que
   hoje afirma que o CI roda `npm ci → lint → format:check → test → build`.
   → verify: nenhuma afirmação do README fica falsa depois da mudança — releia as duas seções
   inteiras, não só as linhas alteradas.
9. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build`
   verdes, saídas coladas; a do `build` **lida**, não só o exit code.

## Critérios de aceitação

- [x] `build:pipeline` no `package.json` exatamente como especificado, com `vitest run tests/content`
      à frente e `--skip-cloud-checks` no `tinacms build`
- [x] `build`, `dev`, `start`, `deploy`, `test*`, `lint*` e `format*` **inalterados**
- [x] Artefato de `npm run build:pipeline` **idêntico** ao de `npm run build` em `dist/`,
      `public/admin/` e `tina/__generated__/`, provado por hash, com a comparação colada
- [x] Canário A/B colado: `npm run build` reprovando com `ERR_CLOUD_CHECK_FAILED` e
      `npm run build:pipeline` passando a etapa do Tina com o mesmo schema local
- [x] `git diff` provando que nada do canário sobrou em `tina/config.ts` nem em
      `src/content.config.ts`
- [x] `ci.yml` chamando `npm run build:pipeline`, com o bloco `env:` dos dois secrets preservado
- [x] Comentário do `ci.yml` sem nenhuma menção a `v5`; a justificativa do `cache: 'npm'` e a nota
      sobre `pull_request_target`/`workflow_run` preservadas
- [x] `docs/adr/0009-build-de-pipeline-sem-cloud-check.md` escrito, com alternativas rejeitadas e
      **gatilho de revisão**
- [x] `README.md` com o comando novo na tabela e a sequência do CI corrigida; nenhuma afirmação
      falsa remanescente nas duas seções tocadas
- [x] `npm run lint`, `npm run format:check` e `npm run test:coverage` verdes, cobertura ≥ 80%
- [x] `npm run build` verde, com a saída lida — nenhuma linha `[ERROR]` no corpo
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado, **executando o passo
      novo** — cole o trecho do log do run que mostra `npm run build:pipeline`
      (**em branco deliberadamente**: o executor não empurra nem commita; verificação do
      orquestrador após o push)
- [x] `wrangler.toml` e `content/**` não modificados

## Evidência

Execução em 2026-09-11, árvore limpa sobre o commit `4ffaab2`, Node `v24.16.0`.

### Passo 1 — leitura

O passo de build (`- run: npm run build:pipeline` após a mudança deste plano) recebe os secrets
`TINA_CLIENT_ID`/`TINA_TOKEN` no seu próprio `env:`, e não no `env:` do job, porque nenhum dos
outros passos (`npm ci`, `lint`, `format:check`, `test:coverage`) fala com o TinaCloud — só
`tinacms build` (invocado dentro de `build:pipeline`) precisa das credenciais para construir o
cliente GraphQL.

### Passo 2 — linha de base (`npm run build`)

Saída literal (sem nenhuma linha `[ERROR]` no corpo; `astro check` fecha com `0 errors`):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

Checking indexing process in TinaCloud...

│
○  Tina build complete ─────────────────────────────────────────────────────
│
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html
│
├─────────────────────────────────────────────────────────────────────────
08:36:28 [content] Syncing content
08:36:28 [content] Synced content
08:36:28 [types] Generated 506ms
08:36:28 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

08:36:34 [content] Syncing content
08:36:34 [content] Synced content
08:36:34 [types] Generated 418ms
08:36:34 [build] output: "static"
08:36:34 [build] mode: "static"
08:36:34 [build] directory: S:\Projetos\academic_page\haroldo\dist\
08:36:34 [build] Collecting build info...
08:36:34 [build] ✓ Completed in 454ms.
08:36:34 [build] Building static entrypoints...
08:36:34 [vite] ✓ built in 228ms
08:36:34 [vite] ✓ built in 48ms
08:36:34 [build] Rearranging server assets...

 generating static routes
08:36:34   ├─ /index.html (+13ms)
08:36:34 ✓ Completed in 24ms.

08:36:34 [build] ✓ Completed in 332ms.
08:36:34 [build] 1 page(s) built in 795ms
08:36:34 [build] Complete!
```

Listagem com hash: `Get-ChildItem -Recurse -File dist, public/admin, tina/__generated__ |
Get-FileHash -Algorithm MD5 | Sort-Object Path` — **212 arquivos** hasheados, exportados para CSV
como linha de base (`baseline-hashes.csv`).

### Passo 3 — script novo

```
diff --git a/package.json b/package.json
index 3e1b688..e1a5857 100644
--- a/package.json
+++ b/package.json
@@ -7,6 +7,7 @@
     "dev": "tinacms dev -c \"astro dev\"",
     "start": "astro dev",
     "build": "tinacms build && astro check && astro build",
+    "build:pipeline": "vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build",
     "preview": "astro preview",
     "astro": "astro",
     "lint": "eslint .",
```

Uma única linha acrescentada — `build`, `dev`, `start`, `deploy`, `test*`, `lint*`, `format*`
inalterados.

### Passo 4 — comparação de artefato

`npm run build:pipeline` sobre o mesmo schema (sem canário):

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  2 passed (2)
      Tests  93 passed (93)
   Start at  08:37:05
   Duration  1.29s (transform 916ms, setup 0ms, import 1.45s, tests 32ms, environment 0ms)

Starting Tina build
... (caixa 🦙 Tina Config / 🤖 Auto-generated files, igual à do passo 2, elidida aqui) ...
○  Tina build complete ─────────────────────────────────────────────────────
08:37:33 [content] Syncing content
08:37:33 [content] Synced content
08:37:33 [types] Generated 423ms
08:37:33 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

08:37:38 [content] Syncing content
08:37:38 [content] Synced content
08:37:38 [types] Generated 415ms
08:37:38 [build] output: "static"
08:37:38 [build] mode: "static"
08:37:38 [build] directory: S:\Projetos\academic_page\haroldo\dist\
08:37:38 [build] Collecting build info...
08:37:38 [build] ✓ Completed in 448ms.
08:37:38 [build] Building static entrypoints...
08:37:38 [vite] ✓ built in 173ms
08:37:38 [vite] ✓ built in 42ms
08:37:38 [build] Rearranging server assets...

 generating static routes
08:37:38   ├─ /index.html (+9ms)
08:37:38 ✓ Completed in 19ms.

08:37:38 [build] ✓ Completed in 262ms.
08:37:38 [build] 1 page(s) built in 719ms
08:37:38 [build] Complete!
```

Comparação (`Compare-Object` entre as 212 linhas de `baseline-hashes.csv` e as 212 de
`pipeline-hashes.csv`, por `Path`+`Hash`):

```
Path                                                           Hash                             SideIndicator
----                                                           ----                             -------------
S:\Projetos\academic_page\haroldo\tina\__generated__\client.ts 304CCEB769B96E4049CA9B1E13F70E70 =>
S:\Projetos\academic_page\haroldo\tina\__generated__\client.ts BC953B5F9D92D9ED111F0BD7F1097BD8 <=

Contagem baseline: 212 / pipeline: 212
```

**Uma única diferença, num único arquivo:** `tina/__generated__/client.ts`. As outras 211 entradas
das três pastas são hash-idênticas.

Na primeira passagem por este plano eu tentei provar por controle que essa diferença não era
causada pela flag, mas o par de execuções que citei se sobrepunha no tempo com o
`npm run build:pipeline` colado acima — não provava o que eu disse que provava. A revisão do
ciclo 1 pegou isso (item 1) e pediu a refeitura, sem sobreposição de execuções e com o `client.ts`
redigido (o arquivo carrega o token do TinaCloud em texto claro). **A refeitura, completa, está na
seção "Correções do ciclo 1 de revisão", ao fim desta Evidência** — ela confirma a conclusão (a
diferença não é causada pela flag), mas agora com prova que não colide com nenhuma outra execução
documentada neste arquivo.

### Passo 5 — canário A/B

Campo `canario_024` (string opcional) acrescentado a `tina/config.ts` (coleção `linhas_pesquisa`)
e a `linhasPesquisaSchema` em `src/content.config.ts`.

`npm run build` com o canário (reprova):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null

Additional info:

	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Local GraphQL version: 2.4.10 / Remote GraphQL version: 2.4.10
	Last indexed at: Thu, 10 Sep 2026 13:46:09 GMT
	Reason: [NON_BREAKING - FIELD_ADDED] Field 'canario_024' was added to object type 'Linhas_pesquisa'


Error: The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null
...
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
}
```

`npm run build:pipeline` com o mesmo canário (passa a etapa do Tina):

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  2 passed (2)
      Tests  93 passed (93)
   Start at  08:40:10
   Duration  814ms (transform 847ms, setup 0ms, import 1.34s, tests 32ms, environment 0ms)

Starting Tina build
... (caixa 🦙 Tina Config / 🤖 Auto-generated files, igual à do passo 2, elidida aqui) ...
○  Tina build complete ─────────────────────────────────────────────────────
08:40:39 [content] Syncing content
08:40:39 [content] Content config changed
08:40:39 [content] Clearing content store
08:40:39 [content] Synced content
08:40:39 [types] Generated 471ms
08:40:39 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

08:40:44 [content] Syncing content
08:40:44 [content] Synced content
08:40:44 [types] Generated 407ms
08:40:44 [build] output: "static"
08:40:44 [build] mode: "static"
08:40:44 [build] directory: S:\Projetos\academic_page\haroldo\dist\
08:40:44 [build] Collecting build info...
08:40:44 [build] ✓ Completed in 443ms.
08:40:44 [build] Building static entrypoints...
08:40:44 [vite] ✓ built in 184ms
08:40:44 [vite] ✓ built in 48ms
08:40:44 [build] Rearranging server assets...

 generating static routes
08:40:44   ├─ /index.html (+9ms)
08:40:44 ✓ Completed in 20ms.

08:40:44 [build] ✓ Completed in 281ms.
08:40:44 [build] 1 page(s) built in 731ms
08:40:44 [build] Complete!
```

Canário revertido dos dois arquivos, `git diff` vazio:

```
$ git diff -- tina/config.ts src/content.config.ts
(sem saída)
```

### Passo 6 — `ci.yml`

Versão final, após a correção do item 4 do ciclo 1 de revisão (a razão registrada tinha de valer
para os dois gatilhos do workflow, `push` e `pull_request` — `npm run build` teria falhado de
forma determinística em PR, não por corrida, e o texto anterior só cobria o caso `push`):

```
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index de6b96b..351334f 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -12,10 +12,10 @@ jobs:
     steps:
       # v4 tem como alvo o Node 20, aposentado nos runners: o GitHub ja forcava
       # essas actions para o Node 24 e anotava um warning de depreciacao a cada
-      # execucao. checkout v5 e setup-node v5 passaram a usar Node 24 nativo.
-      # Nenhuma breaking change destas majors nos atinge: o auto-cache
-      # introduzido no setup-node v5 depende do campo `packageManager` em
-      # `package.json`, que este projeto nao tem, e o `cache: 'npm'` abaixo
+      # execucao. checkout v7 e setup-node v7 tem como alvo o Node 24 nativo.
+      # Nenhuma breaking change destas majors nos atinge: o auto-cache do
+      # setup-node depende do campo `packageManager` em `package.json`, que
+      # este projeto nao tem, e o `cache: 'npm'` abaixo
       # continua explicito; o bloqueio de fork PR do checkout v7 vale para
       # `pull_request_target`/`workflow_run`, gatilhos que este workflow nao usa.
       - uses: actions/checkout@v7
@@ -29,14 +29,23 @@ jobs:
       # test:coverage em vez de test: roda os mesmos testes e ainda impoe o
       # threshold de 80% da §11 do PRD, que ate 2026-09-01 era so relatado
       - run: npm run test:coverage
-      # `npm run build` comeca por `tinacms build`, que precisa de credenciais do
-      # TinaCloud: sem elas aborta com "Client not configured properly. Missing
-      # clientId, token" — e era por isso que o CI estava vermelho desde o plano
-      # 015. As variaveis ficam neste passo, e nao no job, porque nenhum dos
-      # outros precisa delas. `TINA_BRANCH` nao entra: `tina/config.ts` ja cai
-      # em 'main' por padrao. `PUBLIC_SITE_URL` tambem nao: `astro.config.mjs`
-      # tem fallback e o build nao depende dela.
-      - run: npm run build
+      # `build:pipeline` roda `tinacms build --skip-cloud-checks` em vez de `npm run build`: o
+      # cloud check do TinaCloud compara o schema local com o que foi indexado em `main`, e este
+      # workflow dispara nos dois gatilhos do topo do arquivo. Em `push` (sempre para `main`), o
+      # commit ja esta em `main` por construcao e o que resta do cloud check e uma corrida contra
+      # a reindexacao assincrona. Em `pull_request`, o schema do branch da PR nunca foi indexado
+      # (so `main` e indexado) e o cloud check falharia de forma deterministica, nao por corrida.
+      # Em nenhum dos dois casos o cloud check e sinal de defeito do pipeline. Decisao e
+      # alternativas rejeitadas em ADR-0009.
+      #
+      # `tinacms build` comeca por precisar de credenciais do TinaCloud: sem elas aborta com
+      # "Client not configured properly. Missing clientId, token" — e era por isso que o CI
+      # estava vermelho desde o plano 015. `--skip-cloud-checks` nao contorna essa exigencia,
+      # so a comparacao de schema. As variaveis ficam neste passo, e nao no job, porque
+      # nenhum dos outros precisa delas. `TINA_BRANCH` nao entra: `tina/config.ts` ja cai em
+      # 'main' por padrao. `PUBLIC_SITE_URL` tambem nao: `astro.config.mjs` tem fallback e o
+      # build nao depende dela.
+      - run: npm run build:pipeline
         env:
           TINA_CLIENT_ID: ${{ secrets.TINA_CLIENT_ID }}
           TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
```

`grep -n "v5" .github/workflows/ci.yml` — sem resultado (exit 1, nenhuma linha).

### Passo 7 — ADR-0009

`docs/adr/0009-build-de-pipeline-sem-cloud-check.md` (novo), com contexto (saída real do
`ERR_CLOUD_CHECK_FAILED`, e a distinção `push`/`pull_request` do item 4 abaixo), decisão (os
quatro pontos), alternativas rejeitadas (manter cloud check com reexecução; mover o deploy para o
GitHub Actions), consequências (perda do sinal automático de indexação, achado do `client.ts` não
atribuível à flag, dependência de credenciais preservada) e gatilho de revisão (verificação não
bloqueante do TinaCMS; `/admin` quebrando em produção).

Duas correções do ciclo 1 de revisão, no próprio ADR:

- **Item 6.** O ponto 2 da Decisão citava `docs/adr/0002-pin-do-vite-via-overrides.md` como fonte
  dos "14 commits vermelhos" — errado, o ADR-0002 trata do pin do Vite, não de credenciais do
  TinaCloud (`grep` por "14 commits", "vermelho", "secrets", "TINA_CLIENT_ID" no ADR-0002: zero
  ocorrências). Trocado pela fonte real: README ("Variáveis de ambiente") e
  `plans/fase-1-modelo-de-conteudo/022-scripts-em-disciplinas.md` (seção "O CI agora é verificação
  real"), com o commit `82fb4de`.
- **Item 7.** O cabeçalho dizia "implementada no plano 024, primeiro plano da fase" — errado, o
  primeiro plano da fase 2 é o 023 (já `DONE`, ver o cabeçalho deste próprio plano 024: "o 023
  abre a fase e é trivial"). Corrigido para "primeiro ADR da fase".

### Passo 8 — `README.md`

Nova linha `npm run build:pipeline` na tabela de "Comandos" e sequência do CI corrigida em
"Qualidade" (`npm ci → lint → format:check → test:coverage → build:pipeline`, com a razão da
troca apontando para o ADR-0009). Reformatação de tabela pelo Prettier (realinhamento de colunas
por causa da linha mais longa) incluída no mesmo diff — sem mudança de conteúdo além do
pretendido.

Duas correções do ciclo 1 de revisão, no `README.md`:

- **Item 4.** A frase da seção "Qualidade" dizia que a troca era porque "o commit já está em
  `main` por construção" — verdadeiro só para `push`; em `pull_request`, o `ci.yml` também
  dispara (linhas 3–7 do workflow) e ali o schema do branch nunca foi indexado. Reescrita para
  cobrir os dois gatilhos.
- **Item 5.** A linha `.github/workflows/    # CI: lint, format:check, test, build` na seção
  "Estrutura de pastas" ficou falsa por causa deste plano (o CI passou a rodar `test:coverage` e
  `build:pipeline`, não `test` e `build`). Fora do escopo textual original do plano ("a linha do
  comando novo na tabela de 'Comandos' e a sequência descrita em 'Qualidade'"), mas é sujeira
  desta própria mudança — corrigida para
  `.github/workflows/    # CI: lint, format:check, test:coverage, build:pipeline`.

Diff completo:

```
diff --git a/README.md b/README.md
index 30c0920..8255f54 100644
--- a/README.md
+++ b/README.md
@@ -78,21 +78,22 @@ deixou o CI vermelho por 14 commits antes de os secrets serem configurados. `npm
 
 ## Comandos
 
-| Comando                 | O que faz                                                                                                                                                                 |
-| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
-| `npm run dev`           | `tinacms dev -c "astro dev"` — sobe o servidor do Tina e encadeia o `astro dev`. **Não serve para rodar o painel no Astro 7** (ver [Painel de edição](#painel-de-edição)) |
-| `npm run start`         | `astro dev` puro, sem o servidor do Tina — só o site, sem `/admin` funcional                                                                                              |
-| `npm run build`         | `tinacms build` (regenera o schema derivado do Tina) seguido de `astro check` (checagem de tipos) e `astro build`; gera `dist/`                                           |
-| `npm run preview`       | Serve localmente o conteúdo já buildado em `dist/`                                                                                                                        |
-| `npm run astro`         | Passthrough para a CLI do Astro (`npm run astro -- <comando>`, ex.: `npm run astro -- add`)                                                                               |
-| `npm run lint`          | ESLint sobre todo o projeto                                                                                                                                               |
-| `npm run lint:fix`      | ESLint com correção automática                                                                                                                                            |
-| `npm run format`        | Formata todo o projeto com Prettier                                                                                                                                       |
-| `npm run format:check`  | Verifica formatação sem alterar arquivos (usado no CI)                                                                                                                    |
-| `npm run test`          | Roda a suíte de testes (Vitest) uma vez                                                                                                                                   |
-| `npm run test:watch`    | Roda a suíte em modo watch                                                                                                                                                |
-| `npm run test:coverage` | Roda a suíte com relatório de cobertura                                                                                                                                   |
-| `npm run deploy`        | `npm run build` seguido de `wrangler deploy` (deploy manual)                                                                                                              |
+| Comando                  | O que faz                                                                                                                                                                                                                                                                                                                                                                                   |
+| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| `npm run dev`            | `tinacms dev -c "astro dev"` — sobe o servidor do Tina e encadeia o `astro dev`. **Não serve para rodar o painel no Astro 7** (ver [Painel de edição](#painel-de-edição))                                                                                                                                                                                                                   |
+| `npm run start`          | `astro dev` puro, sem o servidor do Tina — só o site, sem `/admin` funcional                                                                                                                                                                                                                                                                                                                |
+| `npm run build`          | `tinacms build` (regenera o schema derivado do Tina) seguido de `astro check` (checagem de tipos) e `astro build`; gera `dist/`                                                                                                                                                                                                                                                             |
+| `npm run build:pipeline` | Usado pelos pipelines automáticos (GitHub Actions e, a partir do plano 025, Cloudflare Workers Builds). Tem a mais `vitest run tests/content` antes do build, e a menos o cloud check do TinaCloud (`tinacms build --skip-cloud-checks` em vez de `tinacms build`) — ver `docs/adr/0009-build-de-pipeline-sem-cloud-check.md`. **Não substitui** `npm run build` como portão pré-push local |
+| `npm run preview`        | Serve localmente o conteúdo já buildado em `dist/`                                                                                                                                                                                                                                                                                                                                          |
+| `npm run astro`          | Passthrough para a CLI do Astro (`npm run astro -- <comando>`, ex.: `npm run astro -- add`)                                                                                                                                                                                                                                                                                                 |
+| `npm run lint`           | ESLint sobre todo o projeto                                                                                                                                                                                                                                                                                                                                                                 |
+| `npm run lint:fix`       | ESLint com correção automática                                                                                                                                                                                                                                                                                                                                                              |
+| `npm run format`         | Formata todo o projeto com Prettier                                                                                                                                                                                                                                                                                                                                                         |
+| `npm run format:check`   | Verifica formatação sem alterar arquivos (usado no CI)                                                                                                                                                                                                                                                                                                                                      |
+| `npm run test`           | Roda a suíte de testes (Vitest) uma vez                                                                                                                                                                                                                                                                                                                                                     |
+| `npm run test:watch`     | Roda a suíte em modo watch                                                                                                                                                                                                                                                                                                                                                                  |
+| `npm run test:coverage`  | Roda a suíte com relatório de cobertura                                                                                                                                                                                                                                                                                                                                                     |
+| `npm run deploy`         | `npm run build` seguido de `wrangler deploy` (deploy manual)                                                                                                                                                                                                                                                                                                                                |
 
 ## Estrutura de pastas
 
@@ -105,7 +106,7 @@ haroldo-page/
 ├── package.json
 ├── .nvmrc
 ├── .env.example
-├── .github/workflows/    # CI: lint, format:check, test, build
+├── .github/workflows/    # CI: lint, format:check, test:coverage, build:pipeline
 ├── content/              # ← domínio do PROFESSOR (via painel, quando existir)
 │   ├── perfil/
 │   ├── linhas-pesquisa/
@@ -203,8 +204,13 @@ npm run test
 npm run build
 ```
 
-O CI (`.github/workflows/ci.yml`) roda exatamente essa sequência (`npm ci` → `lint` →
-`format:check` → `test` → `build`) em todo push e pull request para `main`. Suíte verde é
+O CI (`.github/workflows/ci.yml`) roda `npm ci` → `lint` → `format:check` → `test:coverage` →
+`build:pipeline` em todo push e pull request para `main` — o último passo troca `npm run build`
+por `npm run build:pipeline` porque o cloud check do TinaCloud não é sinal de defeito do pipeline
+em nenhum dos dois gatilhos: em push para `main` o commit já está lá por construção e o que
+resta é uma corrida contra a reindexação assíncrona, e em pull request o schema do branch nunca
+foi indexado (só `main` é indexado), então o cloud check falharia de forma determinística (ver
+`docs/adr/0009-build-de-pipeline-sem-cloud-check.md`). Suíte verde é
 pré-requisito de merge (§11 do PRD, RNF-10).
 
 ## Troubleshooting
```

### Passo 9 — sequência de qualidade

`npm run lint`:

```
> haroldo-page@0.1.0 lint
> eslint .
```

(sem erros)

`npm run format:check`:

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

 Test Files  4 passed (4)
      Tests  107 passed (107)
   Start at  08:43:56
   Duration  927ms (transform 1.00s, setup 0ms, import 1.60s, tests 49ms, environment 0ms)

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

`npm run build` (final, sem canário, lido linha a linha — nenhum `[ERROR]` no corpo):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build
... (caixa 🦙 Tina Config / 🤖 Auto-generated files, igual à do passo 2, elidida aqui) ...
○  Tina build complete ─────────────────────────────────────────────────────
08:44:32 [content] Syncing content
08:44:32 [content] Content config changed
08:44:32 [content] Clearing content store
08:44:32 [content] Synced content
08:44:32 [types] Generated 477ms
08:44:32 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

08:44:37 [content] Syncing content
08:44:37 [content] Synced content
08:44:37 [types] Generated 417ms
08:44:37 [build] output: "static"
08:44:37 [build] mode: "static"
08:44:37 [build] directory: S:\Projetos\academic_page\haroldo\dist\
08:44:37 [build] Collecting build info...
08:44:37 [build] ✓ Completed in 450ms.
08:44:37 [build] Building static entrypoints...
08:44:38 [vite] ✓ built in 193ms
08:44:38 [vite] ✓ built in 42ms
08:44:38 [build] Rearranging server assets...

 generating static routes
08:44:38   ├─ /index.html (+9ms)
08:44:38 ✓ Completed in 19ms.

08:44:38 [build] ✓ Completed in 284ms.
08:44:38 [build] 1 page(s) built in 742ms
08:44:38 [build] Complete!
```

### Correções do ciclo 1 de revisão (2026-09-11, mesma árvore, após a linha de base acima)

**Item 1 — refeitura do experimento de controle, sem sobreposição de execuções.** O par de
execuções citado na primeira passagem colidia no tempo com o `npm run build:pipeline` colado no
passo 4 — não provava nada sobre causalidade. Refeito do zero: duas execuções de `npm run build`
(sem a flag), em sequência, nada mais rodando entre elas, cada uma com hash e `cacheDir`
capturados imediatamente depois. **O `token` do `client.ts` foi redigido em todo trecho colado
abaixo — o arquivo carrega o token do TinaCloud em texto claro, e este documento é versionado num
repositório público.**

RUN A — início `09:00:21`, fim `09:00:59` (saída do `npm run build`, últimas linhas):

```
=== RUN A: npm run build (sem flag) ===
[build] ✓ Completed in 20ms.
[build] ✓ Completed in 279ms.
[build] 1 page(s) built in 749ms
[build] Complete!
```

Capturado às `09:01:02`, imediatamente após o fim da RUN A — nenhuma outra execução de
`tinacms build` rodou entre o fim da RUN A e esta captura:

```
--- MD5 client.ts (RUN A) ---
1245b863f578e1aa2a95ab0260a236a9 *tina/__generated__/client.ts
--- cacheDir (token redigido) RUN A ---
import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'S:/Projetos/academic_page/haroldo/tina/__generated__/.cache/1789128026459', url: 'https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main', token: '<REDACTED>', queries,  });
export default client;
```

RUN B — início `09:01:10` (depois da captura da RUN A), fim `09:01:44`:

```
=== RUN B: npm run build (sem flag) ===
[build] ✓ Completed in 19ms.
[build] ✓ Completed in 275ms.
[build] 1 page(s) built in 756ms
[build] Complete!
```

Capturado às `09:01:47`, imediatamente após o fim da RUN B:

```
--- MD5 client.ts (RUN B) ---
9eced434d603d5bd4166f524347a3803 *tina/__generated__/client.ts
--- cacheDir (token redigido) RUN B ---
import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'S:/Projetos/academic_page/haroldo/tina/__generated__/.cache/1789128073835', url: 'https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main', token: '<REDACTED>', queries,  });
export default client;
```

Linha do tempo sem colisão: RUN A `09:00:21→09:00:59`, captura A `09:01:02`, RUN B
`09:01:10→09:01:44`, captura B `09:01:47`. Cada uma isolada, nenhuma se sobrepõe a outra execução
colada neste documento (a mais próxima, o `npm run build:pipeline` do passo 4, correu às
`08:37:05–08:37:38`, mais de vinte minutos antes).

**Resultado: hash e `cacheDir` divergem entre RUN A e RUN B — duas execuções de `npm run build`,
sem a flag, nada mais entre elas.** Isso confirma a conclusão original: a divergência de
`client.ts` acontece entre quaisquer duas invocações de `tinacms build`, com ou sem
`--skip-cloud-checks` — não é causada pela flag. **O item 1 confirmou a conclusão sobre o
`client.ts`, mas a primeira tentativa de prová-la estava errada** (par de execuções sobrepostas) e
foi substituída por esta.

**Item 2 — prova textual de que só o `cacheDir` diverge.** Repeti a comparação de artefato do
passo 4 (baseline sem flag vs. `build:pipeline`), desta vez guardando o `client.ts` de cada lado
com o token redigido:

```
--- client.ts (baseline, sem flag, token redigido) ---
import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'S:/Projetos/academic_page/haroldo/tina/__generated__/.cache/1789128121059', url: 'https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main', token: '<REDACTED>', queries,  });
export default client;

--- client.ts (build:pipeline, com --skip-cloud-checks, token redigido) ---
import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'S:/Projetos/academic_page/haroldo/tina/__generated__/.cache/1789128176522', url: 'https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main', token: '<REDACTED>', queries,  });
export default client;
```

`diff` entre os dois arquivos **depois de normalizar só o trecho `.cache/<epoch>` para o literal
`.cache/<EPOCH>`** nos dois lados (`sed -E "s/\.cache\/[0-9]+/.cache\/<EPOCH>/"`):

```
IDENTICO apos normalizar o epoch do cacheDir
```

`diff` não imprimiu nenhuma linha — os dois arquivos são idênticos caractere a caractere fora do
epoch do `cacheDir`. Nenhum outro campo (`url`, `queries`, formatação) diverge.

Comparação de hash das 212 entradas de `dist/`, `public/admin/` e `tina/__generated__/` repetida
para este mesmo par (baseline fresco vs. `build:pipeline` fresco):

```
Path                                                           Hash                             SideIndicator
----                                                           ----                             -------------
S:\Projetos\academic_page\haroldo\tina\__generated__\client.ts D6563CC9EC40A51E0EA808683E51CA8F =>
S:\Projetos\academic_page\haroldo\tina\__generated__\client.ts 7D4AF859AAEDD02BEA90A993356B4D1B <=

Contagem baseline: 212 / pipeline: 212
```

Mesmo padrão do passo 4: uma única diferença, no mesmo arquivo, no mesmo campo — agora com prova
de que é só o `cacheDir` (item 2) e de que essa variação existe entre quaisquer duas invocações de
`tinacms build`, independente da flag (item 1).

**Item 3.** O texto do terceiro critério de aceitação foi restaurado exatamente como estava no
plano original — a investigação do `client.ts` fica só aqui na Evidência, não no enunciado do
critério.

**Itens 4, 6 e 7** — ver o texto atualizado nos passos 6, 7 e 8 acima (razão do cloud check
reescrita para cobrir `push` e `pull_request` em `ci.yml`, `README.md` e no ADR; referência ao
ADR-0002 trocada pela fonte real; cabeçalho do ADR corrigido).

**Item 5** — ver passo 8 acima (linha da "Estrutura de pastas" corrigida).

**Item 8** — as três saídas de `npm run build`/`npm run build:pipeline` que tinham a caixa
`🦙 Tina Config` suprimida sem marca (passos 4, 5 e o `npm run build` final do passo 9) agora têm
a elisão marcada explicitamente com `... (caixa ... elidida aqui) ...`; o conteúdo da caixa é
idêntico ao colado por extenso no passo 2 (mesma URL de API, mesmos três arquivos gerados).

### `git status` final (antes de qualquer `git add`)

```
 M .github/workflows/ci.yml
 M README.md
 M package.json
 M plans/fase-2-pipeline-de-publicacao/024-build-de-pipeline-e-o-cloud-check-do-tinacloud.md
?? docs/adr/0009-build-de-pipeline-sem-cloud-check.md
```

Cinco linhas: os quatro arquivos da seção "Arquivos afetados" mais o próprio plano, que aparece
modificado por estar recebendo esta Evidência e os checkboxes. `tina/config.ts` e
`src/content.config.ts` sem diferença (canário revertido — ver passo 5). `wrangler.toml` e
`content/**` não tocados.

### Em branco, deliberadamente

O critério "CI do GitHub Actions com `conclusion: success`... executando o passo novo" fica em
branco: o executor não commita nem empurra (regra do dispatch). Verificação a cargo do
orquestrador após o push.
