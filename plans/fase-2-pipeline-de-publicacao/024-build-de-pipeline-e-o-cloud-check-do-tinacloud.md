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

- [ ] `build:pipeline` no `package.json` exatamente como especificado, com `vitest run tests/content`
      à frente e `--skip-cloud-checks` no `tinacms build`
- [ ] `build`, `dev`, `start`, `deploy`, `test*`, `lint*` e `format*` **inalterados**
- [ ] Artefato de `npm run build:pipeline` **idêntico** ao de `npm run build` em `dist/`,
      `public/admin/` e `tina/__generated__/`, provado por hash, com a comparação colada
- [ ] Canário A/B colado: `npm run build` reprovando com `ERR_CLOUD_CHECK_FAILED` e
      `npm run build:pipeline` passando a etapa do Tina com o mesmo schema local
- [ ] `git diff` provando que nada do canário sobrou em `tina/config.ts` nem em
      `src/content.config.ts`
- [ ] `ci.yml` chamando `npm run build:pipeline`, com o bloco `env:` dos dois secrets preservado
- [ ] Comentário do `ci.yml` sem nenhuma menção a `v5`; a justificativa do `cache: 'npm'` e a nota
      sobre `pull_request_target`/`workflow_run` preservadas
- [ ] `docs/adr/0009-build-de-pipeline-sem-cloud-check.md` escrito, com alternativas rejeitadas e
      **gatilho de revisão**
- [ ] `README.md` com o comando novo na tabela e a sequência do CI corrigida; nenhuma afirmação
      falsa remanescente nas duas seções tocadas
- [ ] `npm run lint`, `npm run format:check` e `npm run test:coverage` verdes, cobertura ≥ 80%
- [ ] `npm run build` verde, com a saída lida — nenhuma linha `[ERROR]` no corpo
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado, **executando o passo
      novo** — cole o trecho do log do run que mostra `npm run build:pipeline`
- [ ] `wrangler.toml` e `content/**` não modificados

## Evidência

<Preenchida pelo executor. A verificação autoritativa inclui o `conclusion` do run do GitHub
Actions sobre o commit empurrado, além dos comandos locais.>
