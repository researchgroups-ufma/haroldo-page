# Plano 025 — Roteiro humano: Workers Builds ligado ao repositório e variáveis no Cloudflare

**Status:** TODO
**RFs cobertos:** RF-11; fase 2, **itens 1 e 2** do §12 (a metade do Cloudflare); RNF-04, RNF-14,
A-03, R-06, R-12
**Depende de:** plano **024** (o comando `build:pipeline` precisa existir e estar em `main` antes
de ser digitado no painel da Cloudflare)
**Modelo recomendado:** — (execução humana; um agente sonnet pode assistir na leitura de logs)
**Agente recomendado:** nenhum
**Executável por:** **orquestrador** — exige login no painel da Cloudflare (conta do
desenvolvedor, `and.near@hotmail.com`) e autorização do GitHub App da Cloudflare na organização
`researchgroups-ufma`. **Não depende do professor.**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

> ⚠️ **Plano de provisionamento.** Envolve conta de terceiro (Cloudflare) e autorização OAuth no
> navegador. Um agente **não** executa este plano sozinho. Todo passo marcado 🧑 é humano.

## Objetivo

Um push na `main` do repositório `researchgroups-ufma/haroldo-page` dispara sozinho um build no
Cloudflare Workers Builds, que roda `npm run build:pipeline` com as credenciais do TinaCloud e
publica o resultado no Worker `haroldo-page`. O deploy deixa de ser manual.

Isso fecha os **itens 1 e 2** do checklist da fase 2 — o item 2 só na metade do Cloudflare; a
metade do GitHub foi antecipada em 2026-09-04 (`82fb4de`).

## Arquivos afetados

- **Nenhum arquivo do projeto é modificado por este plano.**
- Se o painel exigir alguma alteração em `wrangler.toml` (por exemplo, `html_handling` ou
  `build`), **não a faça aqui**: registre o que o painel pediu e por quê, e leve como achado para
  o plano 026 ou para um plano novo.

> `git status --short` tem de terminar limpo. Um roteiro humano que altera arquivo virou plano de
> código sem revisão.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). Astro 7
com `output: 'static'` (D-01: sem `main` no `wrangler.toml`, sem adapter, sem SSR). Build em
`dist/`. Repositório **público** em `researchgroups-ufma/haroldo-page`, branch `main`.

**Estado do provisionamento, verificado em 2026-09-10:**

| Item | Estado | Origem |
|---|---|---|
| Worker `haroldo-page` | criado e publicado **manualmente** | plano 012, versão `85adc91c`, <https://haroldo-page.and-near.workers.dev> |
| `wrangler.toml` | versionado, `[assets] directory = "./dist"`, `not_found_handling = "404-page"`, **sem `main`** | plano 007 |
| Projeto TinaCloud | criado e vinculado ao repositório na `main`; GitHub App restrito a esse repositório | plano 011 |
| Secrets do GitHub Actions | `TINA_CLIENT_ID` e `TINA_TOKEN` criados | `82fb4de`, 2026-09-04 |
| Variáveis no Cloudflare | **não existem** | este plano |
| Workers Builds | **não conectado** | este plano |

**Cotas já verificadas** (Q-03, 2026-09-01; A-03 confirmada) — confira contra o que o painel
mostrar hoje e **reporte se divergir**, porque §7.4, A-03, R-06 e R-12 dependem desses números:
**3.000 minutos de build/mês**, **1 build simultâneo**, teto de **20 min por build**
(<https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/>).

### O que configurar, campo a campo

| Campo do painel | Valor | Por quê |
|---|---|---|
| Repositório | `researchgroups-ufma/haroldo-page` | fonte de verdade do conteúdo (§7.1) |
| Branch de produção | `main` | RN/D: é a branch que o TinaCloud indexa e onde o painel commita |
| Build command | `npm run build:pipeline` | **plano 024 e ADR-0009** — determinístico, sem cloud check, com o portão de conteúdo à frente |
| Deploy command | `npx wrangler deploy` | o `wrangler.toml` versionado já diz o resto |
| Diretório raiz | raiz do repositório | o projeto não é monorepo |
| Versão do Node | a major do `.nvmrc` (24) | RNF-12 |
| `TINA_CLIENT_ID` | valor do projeto no TinaCloud | sem ele o `tinacms build` aborta com `Client not configured properly` |
| `TINA_TOKEN` | **como segredo, nunca como variável em texto** | §7.6, RNF-07 |
| `PUBLIC_SITE_URL` | `https://haroldo-page.and-near.workers.dev` | ver a nota abaixo |

**Sobre `PUBLIC_SITE_URL`:** `astro.config.mjs` lê a variável por `loadEnv` do Vite e cai em
`'https://haroldo-page.and-near.workers.dev'` quando ela não existe — o valor de fallback é hoje
**igual** ao valor real. Defina-a mesmo assim no painel: o que estiver em produção deve estar
declarado, não depender de um default que a fase 5 vai mudar quando houver domínio próprio (A-07,
Q-05).

**Sobre `TINA_BRANCH`:** o `ci.yml` registra que ela não é necessária, porque `tina/config.ts` já
cai em `'main'` por padrão. Não a crie. Se o build falhar por causa dela, isso é achado — registre
o erro literal antes de acrescentá-la.

### O que este plano NÃO faz

- ⛔ **Não verifica o `/admin` em produção.** É o plano 026, e ele tem critério próprio.
- ⛔ **Não convida o professor nem cria o usuário EDITOR.** É o plano 027.
- ⛔ **Não configura notificação de falha de build.** É o plano 028 — inclusive a demonstração de
  que a falha mantém a versão anterior no ar (F-02, RNF-04).
- ⛔ **Não cronometra o ciclo (M-02).** É o plano 029.
- ⛔ **Não configura domínio próprio, DNS nem certificado** (Q-05 aberta, fase 5).
- ⛔ **Não instala `@astrojs/cloudflare` nem acrescenta `adapter` ao `astro.config.mjs`** (D-01).

### Duas propriedades do desenho que o executor precisa entender antes de clicar

1. **O GitHub Actions não é portão do deploy.** Os dois pipelines disparam no mesmo push e correm
   em paralelo; a Cloudflare não espera o `conclusion` do CI. O que protege o site de conteúdo
   inválido **não** é o CI: é o próprio `npm run build:pipeline` do build de deploy, que roda
   `vitest run tests/content` antes de qualquer coisa e aborta o deploy se o conteúdo não validar.
   Isso é deliberado (ADR-0009); registre na Evidência que você entendeu assim, porque é o que
   sustenta F-02 e RNF-04.
2. **O Worker já existe.** O Workers Builds se conecta ao Worker `haroldo-page` publicado
   manualmente no plano 012 — não crie um segundo Worker. Se o painel só oferecer "criar novo",
   pare e reporte antes de criar: dois Workers com o mesmo conteúdo e URLs diferentes é confusão
   que sobra para a fase 5.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. 🤖/🧑 Garantir que a `main` local está sincronizada e que o commit do plano 024 (com o script
   `build:pipeline`) **já está em `main` no GitHub**.
   → verify: `git status --short` limpo; `git log --oneline -1` colado; `npm run build:pipeline`
   verde localmente, com a saída **lida**.
2. 🧑 No painel da Cloudflare, em *Workers & Pages → `haroldo-page`*, conectar o repositório
   `researchgroups-ufma/haroldo-page` (Workers Builds), autorizando o GitHub App da Cloudflare
   com acesso **restrito a esse repositório**.
   → verify: descreva na Evidência o que a tela de autorização pediu e a que escopo ficou
   restrita a instalação. O repositório está numa **organização**, não numa conta pessoal — pode
   exigir aprovação de owner da `researchgroups-ufma`; se exigir, registre.
3. 🧑 Preencher a configuração de build com os valores da tabela do "Contexto necessário".
   → verify: cole (ou transcreva literalmente) o que o painel mostra em cada campo depois de
   salvar, inclusive a versão de Node que ele diz que vai usar.
4. 🧑 Criar as variáveis de build: `TINA_CLIENT_ID` e `PUBLIC_SITE_URL` como variáveis normais e
   `TINA_TOKEN` **como segredo** (o painel deve passar a exibi-lo mascarado).
   → verify: capture a listagem das variáveis mostrando `TINA_TOKEN` mascarado. **Nunca cole o
   valor do token na Evidência** — nem parcialmente. O repositório é público.
5. 🧑 Disparar o primeiro build automático com um push real e trivial na `main` (por exemplo, o
   commit deste próprio plano, ou um ajuste de uma linha em documentação). **Não** use o botão
   "retry/rebuild" para esta primeira prova: o item do §12 é *build automático no push*.
   → verify: o build aparece sozinho na lista, com o SHA do commit empurrado. Cole: SHA, status
   final, **duração** e o trecho do log que mostra `npm run build:pipeline` e o `Complete!` do
   Astro.
6. 🧑 Confirmar que o deploy chegou ao Worker.
   → verify: a URL <https://haroldo-page.and-near.workers.dev> responde 200 e o painel mostra uma
   **versão nova**, posterior à `85adc91c` do plano 012, associada ao SHA do passo 5. Cole o id da
   versão e o horário. Confirme também que uma rota inexistente ainda responde 404
   (`not_found_handling` preservado).
7. 🧑 Registrar os números que o PRD depende: duração do build (R-06 — "medir a duração real do
   build na fase 2"), minutos consumidos da cota e custo no painel de faturamento (RNF-14, M-06).
   → verify: os três valores colados, com o que o painel mostrou.
8. 🧑 Conferir que o Worker continua servindo **apenas assets estáticos**, sem código de runtime
   (D-01), depois de o build automático ter publicado.
   → verify: descreva o que o painel mostra sobre o Worker.
9. 🤖/🧑 Confirmar que nenhum arquivo do projeto mudou.
   → verify: `git status --short` limpo, colado.

## Critérios de aceitação

- [ ] Workers Builds conectado a `researchgroups-ufma/haroldo-page`, branch de produção `main`,
      com a autorização do GitHub App descrita na Evidência
- [ ] Build command `npm run build:pipeline` e deploy command `npx wrangler deploy` configurados,
      transcritos literalmente do painel
- [ ] `TINA_CLIENT_ID` e `PUBLIC_SITE_URL` como variáveis; `TINA_TOKEN` **como segredo, mascarado
      no painel**; nenhum valor de token na Evidência
- [ ] **Um push na `main` disparou um build sem intervenção**, com SHA, status, duração e trecho
      de log colados — não um rebuild manual
- [ ] Versão nova publicada no Worker, associada ao SHA do push; URL respondendo 200 e rota
      inexistente respondendo 404
- [ ] Versão de Node usada pelo build registrada e conferida contra o major do `.nvmrc`
- [ ] Duração do build, minutos consumidos e custo (US$ 0,00) registrados — R-06, RNF-14, M-06
- [ ] Cotas do painel conferidas contra os valores de Q-03 (3.000 min/mês, 1 build simultâneo,
      teto de 20 min); divergência, se houver, **reportada**
- [ ] Worker continua sem código de runtime (D-01)
- [ ] `git status --short` limpo — nenhum arquivo do projeto modificado
- [ ] §12 do PRD (itens 1 e 2 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao
      promover `Status: DONE`

## Evidência

> **Em preenchimento.** Execução iniciada em 2026-09-11. Os passos de painel são relatados por
> quem os executou (o desenvolvedor, no navegador); os passos de linha de comando trazem a saída
> literal da máquina. A origem de cada bloco está dita explicitamente — painel e terminal não se
> misturam sob o mesmo rótulo.

### Passo 1 — `main` sincronizada e `build:pipeline` verde (terminal, 2026-09-11 09:29)

```
local : 2557532
origin: 2557532
(git status --short vazio)
```

```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build

 Test Files  2 passed (2)
      Tests  93 passed (93)
   Start at  09:29:41
   Duration  913ms (transform 945ms, setup 0ms, import 1.51s, tests 33ms, environment 0ms)

Starting Tina build
... (caixa "Tina build complete" — API url, GraphQL Client, Typescript Types, Static HTML file;
    idêntica à colada na Evidência do plano 024, elidida aqui) ...
09:30:08 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

09:30:13 [build] 1 page(s) built in 758ms
09:30:13 [build] Complete!
BUILD_EXIT:0
```

Saída lida por inteiro: nenhuma linha `[ERROR]` no corpo.

### Achado do passo 4 — variável de build ≠ variável de runtime

O painel **recusa** criar variáveis em *Settings → Variables & Secrets* para este Worker, com a
mensagem (relatada pelo desenvolvedor, vista no painel):

```
Variables cannot be added to a Worker that only has static assets.
```

**Isso não é defeito: é a D-01 sendo cumprida pela plataforma.** O `wrangler.toml` não tem `main`,
o Worker não executa código por requisição, e sem código não há onde injetar variável de runtime.

As três variáveis deste plano são de **build**, e ficam em *Settings → Build → Build variables and
secrets*. A documentação da Cloudflare separa as duas coisas explicitamente: *"Build variables
will not be accessible at runtime. If you would like to configure runtime variables you can do so
in Settings > Variables & Secrets"*
(<https://developers.cloudflare.com/workers/ci-cd/builds/configuration/>). É o que este projeto
precisa — `TINA_CLIENT_ID` e `TINA_TOKEN` são consumidos pelo `tinacms build`, e
`PUBLIC_SITE_URL` pelo `astro build`; nenhuma delas tem uso em runtime num site estático.

Criadas em *Build variables and secrets* (relatado pelo desenvolvedor): `TINA_CLIENT_ID` e
`PUBLIC_SITE_URL` como variáveis, `TINA_TOKEN` como segredo.

**Para quem repetir o roteiro:** a porta errada é a primeira que o painel oferece. A documentação
consultada não trata explicitamente do caso "Worker só com assets", então a confirmação de que a
seção de build aceita as variáveis veio de exercitar a interface, não de ler documentação.

### Achado do passo 2 — o app da Cloudflare existia na organizacao, mas nao alcancava este repositorio

Depois de configurados os campos de build e as tres variaveis, o painel passou a exibir (visto
pelo desenvolvedor):

```
This project is disconnected from your Git account. This may cause deployments to fail.
```

O sintoma nao aponta para a causa. Consulta ao GitHub pelo `gh` (saida literal do terminal,
2026-09-11):

```
conta autenticada: abbadrava
organizacao researchgroups-ufma: {"role":"admin","state":"active"}
repositorio haroldo-page: {"admin":true,"push":true,"private":false}

instalacoes de GitHub App na organizacao:
  {"app":"netlify","created":"2026-06-01T19:36:05.000-03:00","repos":"selected"}
  {"app":"cloudflare-workers-and-pages","created":"2026-06-02T22:44:14.000-03:00","repos":"selected"}
  {"app":"levi-keystatic","created":"2026-06-05T23:47:42.000-03:00","repos":"selected"}
  {"app":"tinacloud-app","created":"2026-06-06T22:50:43.000-03:00","repos":"selected"}

installation id: 137610061   selection: selected
```

**Causa:** o app `cloudflare-workers-and-pages` ja estava instalado na organizacao desde
**2026-06-02**, com escopo `selected` — tres meses antes de este repositorio existir (criado no
plano 010, em 2026-09-01). O `haroldo-page` nunca foi acrescentado a lista de repositorios da
instalacao, entao a Cloudflare nao o enxergava. Nao foi possivel enumerar os repositorios da
instalacao pelo `gh` (HTTP 403, falta o escopo `read:user` no token), entao a atribuicao de causa
se apoia na data da instalacao e no desaparecimento do sintoma apos a correcao — nao numa
listagem direta.

**O que a fase 1 previa e nao se materializou:** o plano avisava que o repositorio esta numa
organizacao e que a conexao poderia exigir aprovacao de owner da `researchgroups-ufma`. Nao
exigiu terceiro: a conta do desenvolvedor (`abbadrava`) e `role: admin` da organizacao e resolveu
sozinha.

**Correcao aplicada** (relatada pelo desenvolvedor): `haroldo-page` acrescentado a
*Repository access* da instalacao 137610061, mantendo o escopo `selected` — o padrao do plano 011
para o TinaCloud, nao "All repositories". Em seguida, repositorio reconectado no painel da
Cloudflare; o aviso desapareceu e **os campos de build e as tres variaveis sobreviveram a
reconexao**, sem precisar refazer.

**Para quem repetir o roteiro:** numa organizacao que ja usou Cloudflare em outro projeto, o app
existe e o painel mostra "disconnected" sem dizer que o problema e escopo de instalacao. O
comando que revela e
`gh api /orgs/<org>/installations`, comparando a data de instalacao com a data de criacao do
repositorio.

### Passos 3, 5 a 9

<Pendentes de preenchimento. O push de `954215c` ocorreu com o vinculo quebrado e nao serve como
prova do passo 5; nao foi confirmado se chegou a gerar build algum no painel. A prova do build
automatico vem do push seguinte.>
