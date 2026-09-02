# Plano 011 — Roteiro humano: projeto no TinaCloud vinculado ao repositório

**Status:** DONE
**RFs cobertos:** — (Fase 0, item 4 do checklist §12; base de RF-01, RF-02, RF-11)
**Depende de:** plano 010
**Modelo recomendado:** — (execução humana; um agente sonnet pode assistir na verificação final)
**Agente recomendado:** nenhum — **este plano é executado por uma pessoa, no navegador**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

> ⚠️ **Plano de provisionamento.** Envolve conta de terceiro (TinaCloud + autorização do
> GitHub App) e exige login. Um agente **não** executa este plano sozinho. Todo passo
> marcado 🧑 é humano.

## Objetivo

Existe um projeto no TinaCloud (plano Free) da conta do desenvolvedor, vinculado ao
repositório privado `haroldo-page` na branch `main`, com `clientId` e token de leitura em
mãos e gravados no `.env` local — os dois valores que a fase 1 vai consumir para subir o
painel `/admin`.

## Arquivos afetados

- `.env` **local, não versionado** — preencher `TINA_CLIENT_ID` e `TINA_TOKEN`
- Nenhum arquivo versionado é modificado.

> ⛔ **`TINA_TOKEN` nunca entra em arquivo commitado** (§7.6, RNF-07). Não o cole no
> `.env.example`, no README, em comentário de código, em mensagem de commit ou em issue.
> Se ele vazar em algum commit, o token tem de ser revogado e gerado de novo — não basta
> apagar o arquivo.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático; o conteúdo mora em arquivos Markdown no repositório e o professor
o edita por formulários no painel do TinaCMS.

**O que o TinaCloud é, na arquitetura (§7.1):** ele autentica o editor e recebe as gravações
do painel, **commitando direto no GitHub**. O site público **não** depende dele em runtime —
se o TinaCloud cair, só a edição para (F-03). Por isso, provisionar o TinaCloud não afeta o
build nem o deploy desta fase.

**Decisões já fechadas — não há o que escolher:**

| Item | Valor | Origem |
|---|---|---|
| Plano | **Free** | §7.2 e §7.4: 2 usuários, 2 papéis, assets ≤ 100 MB, sem Editorial Workflow |
| Dono da conta | desenvolvedor (`and.near@hotmail.com`) | §4.2 |
| Repositório vinculado | `haroldo-page` (privado) | plano 010 |
| Branch | `main` | §7.6, variável `TINA_BRANCH` |
| Editorial Workflow | **não usar** | NG-07 e D-04: indisponível no Free; substituído pelo campo `publicado` |
| Visual editing | **não usar** | D-02: exigiria `output: 'server'`, contra D-01 |

**O que este plano NÃO faz** (e é fácil fazer por engano, porque o painel do TinaCloud
oferece tudo junto):

- ⛔ **Não convide o professor como usuário EDITOR.** Isso é da **fase 2** (checklist:
  "Usuário EDITOR do professor criado"). Além disso, a **Q-06 está em aberto** — o e-mail do
  professor ainda não foi definido. Convidar agora com um e-mail errado consome uma das
  **duas** vagas do plano Free (A-01, R-04).
- ⛔ **Não instale o TinaCMS no projeto** (`npm install tinacms @tinacms/cli
  @tinacms/astro`) nem crie `tina/config.ts`: isso é da **fase 1**.
- ⛔ **Não configure variáveis no Cloudflare nem no GitHub Actions**: fase 2.
- ⛔ **Não ative Editorial Workflow** nem qualquer recurso pago.

**Questão em aberto relacionada, que NÃO bloqueia este plano:** a **Q-02** — "o professor
aceita um painel cuja interface estrutural está em inglês (premissa A-08)?" — bloqueia a
**fase 2**, porque a resposta negativa levaria à migração para o Decap CMS (R-03). Criar o
projeto no TinaCloud agora é reversível e barato: se a Q-02 for respondida com "não", o
projeto é simplesmente abandonado, sem custo. **Registre isso ao concluir**, para que a fase
2 não trate o provisionamento como decisão consolidada.

**Escopo do GitHub App.** Ao vincular o repositório, o TinaCloud instala um GitHub App que
pede acesso de escrita. Conceda o acesso **apenas ao repositório `haroldo-page`** — nunca
"All repositories". É esse App que faz os commits de conteúdo em nome do professor (§7.4,
RNF-16).

**Onde ficam os valores no painel do TinaCloud:** o `clientId` aparece na página *Overview*
do projeto; o token de leitura é gerado em *Tokens* (rótulo costuma ser "Read Only Token" /
"Content Token"). Copie ambos assim que aparecerem — o token normalmente só é exibido uma vez.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. 🧑 Entrar em `https://app.tina.io` com a conta do desenvolvedor (GitHub login é o caminho
   mais direto) e confirmar que a organização/conta está no plano **Free**.
   → verify: o painel abre e o plano exibido é Free.
2. 🧑 Criar um novo projeto apontando para o repositório **privado** `haroldo-page`,
   autorizando o GitHub App **somente** nesse repositório.
   → verify: em `https://github.com/settings/installations`, a instalação do TinaCloud lista
   `haroldo-page` e **apenas** ele.
3. 🧑 Definir a branch do projeto como `main`.
   → verify: a configuração do projeto no TinaCloud exibe `main`.
4. 🧑 Copiar o `clientId` da página *Overview*.
   → verify: valor não vazio, copiado.
5. 🧑 Gerar um **token de leitura** em *Tokens* e copiá-lo imediatamente.
   → verify: token copiado; a interface confirma a criação.
6. 🧑 Criar o `.env` local a partir do `.env.example` (`Copy-Item .env.example .env`) e
   preencher `TINA_CLIENT_ID`, `TINA_TOKEN` e `TINA_BRANCH=main`. **Não** commitar.
   → verify: `git status --short` **não** lista `.env`; `git check-ignore -v .env` mostra a
   regra que o ignora.
7. 🧑 Conferir que nenhuma vaga de usuário foi gasta: a lista de usuários do projeto deve
   ter **apenas** o desenvolvedor (ADMIN).
   → verify: 1 de 2 usuários ocupados.
8. 🧑 Registrar na Evidência: nome do projeto no TinaCloud, plano, repositório vinculado,
   branch, e a nota de reversibilidade ligada à Q-02.

## Critérios de aceitação

- [x] Projeto criado no TinaCloud, plano **Free**, na conta do desenvolvedor
- [x] Vinculado ao repositório **privado** `haroldo-page`, branch `main`
- [x] GitHub App instalado **apenas** em `haroldo-page` (verificado em
      `github.com/settings/installations`)
- [x] `TINA_CLIENT_ID` e `TINA_TOKEN` gravados **somente** no `.env` local
- [x] `git status --short` limpo — nenhum `.env` rastreado; nenhum token em commit,
      README, `.env.example` ou mensagem de commit
- [x] **Apenas 1 dos 2 usuários** do plano Free ocupado (o professor **não** foi convidado —
      é fase 2, e a Q-06 está aberta)
- [x] Editorial Workflow **não** ativado (NG-07)
- [x] TinaCMS **não** instalado no projeto (é fase 1)
- [x] Nota registrada: se a Q-02 for respondida com "não", este provisionamento é descartável

## Evidência

Executado por: usuário (passos de navegador), em 2026-09-01.
Verificação automática das credenciais: sessão de orquestração, 2026-09-01.

### Projeto e vínculo

O painel do TinaCloud, com o projeto criado e o `clientId` emitido, exibe:

```
Project setup did not complete. No Tina config was found on main of researchgroups-ufma/haroldo-page.

Checked tina/meta.json, tina/config.*, tina/schema.*, .tina/config.*, and .tina/schema.*.

Commit your Tina config to main and push again. Indexing will start automatically.
```

Essa mensagem é a evidência do vínculo: o TinaCloud nomeia o repositório
(`researchgroups-ufma/haroldo-page`, o privado criado no plano 010) e a branch (`main`) que
foi procurar. O estado "setup did not complete" **é o esperado nesta fase** — o plano proíbe
instalar o TinaCMS (⛔ "isso é fase 1"), e sem `tina/config.ts` commitado não há schema para
indexar.

### Credenciais no `.env` local

`clientId` (público): `8be98053-68c3-4262-b7bd-dd1286e1c7ad`.
Token: gravado apenas no `.env`, **não reproduzido aqui** (§7.6, RNF-07).

```
$ awk -F= '/^TINA_/ {print $1 " -> " length($2) " chars"}' .env
TINA_CLIENT_ID -> 36 chars
TINA_TOKEN -> 40 chars
TINA_BRANCH -> 4 chars
```

### Validação das credenciais contra a API do TinaCloud

Sem instalar nada, por POST em `https://content.tinajs.io/1.5/content/<clientId>/github/<branch>`
com o token no header `X-API-KEY`. Quatro chamadas, três delas canários de falsificabilidade:

```
real cid + real token + main    : {"message":"Branch 'main' not found"} [http 404]
cid FALSO + real token + main   : {"message":"missing or invalid auth credentials"} [http 401]
real cid + token FALSO + main   : {"message":"missing or invalid auth credentials"} [http 401]
real cid + real token + branch X: {"message":"Branch 'branch-que-nao-existe-xyz' not found"} [http 404]
```

Adulterar qualquer um dos dois valores derruba para 401; o par real passa da autenticação e
chega à busca de branch. Logo, `TINA_CLIENT_ID` e `TINA_TOKEN` são válidos e resolvem para um
projeto TinaCloud existente. O 404 da primeira linha é ausência de índice, não vínculo errado
— a mensagem do painel, acima, é o que separa as duas hipóteses.

Antes de o token ser gravado, a mesma chamada devolvia `{"message":"No authorization header
set"} [http 401]`, que rejeita antes de olhar o `clientId` e por isso não discrimina nada.

### Segredos fora do versionamento

```
$ git status --short
(vazio)

$ git check-ignore -v .env
.gitignore:12:.env	.env

$ git log --all --diff-filter=A --name-only --pretty=format: | grep -x ".env"
(vazio — nunca commitado)

$ git grep -nIE "TINA_(CLIENT_ID|TOKEN)[[:space:]]*=[[:space:]]*[^[:space:]]" $(git rev-list --all)
(vazio, descontado o .env.example — nenhum valor preenchido em nenhum commit)
```

### TinaCMS não instalado (é fase 1)

```
$ grep -nE "tinacms|@tinacms" package.json
nenhum pacote tina declarado
$ ls -d tina 2>/dev/null || echo "sem tina/"
sem tina/
$ ls -d src/pages/admin public/admin 2>/dev/null || echo "sem rota /admin"
sem rota /admin
```

### Confirmações de painel (reportadas pelo usuário)

- `github.com/settings/installations`: a instalação do TinaCloud lista **apenas**
  `haroldo-page` — não "All repositories".
- Usuários do projeto: **1 de 2** ocupados, só o desenvolvedor (ADMIN). O professor **não**
  foi convidado — é fase 2, e a Q-06 (e-mail do professor) segue aberta.
- Editorial Workflow **não** ativado (NG-07).
- Plano da conta: **Free** (§7.2, RNF-14) — 2 usuários, 2 papéis, sem Editorial Workflow.

### Nota de reversibilidade — Q-02

A **Q-02** ("o professor aceita um painel cuja interface estrutural está em inglês?") continua
**aberta** e bloqueia a fase 2. Se for respondida com "não", a migração para o Decap CMS (R-03)
descarta este provisionamento sem custo: nenhum arquivo versionado depende do TinaCloud, e o
`.env` é local. **A fase 2 não deve tratar este plano como decisão consolidada.**

### Pendência herdada pela fase 1

A indexação do TinaCloud está parada em "setup did not complete" e **só destrava quando a fase
1 commitar `tina/config.ts` na `main`** — o próprio painel diz que a indexação começa sozinha
no push. Não há ação a tomar na fase 0.

### O que NÃO foi verificado

- Escopo exato das permissões concedidas ao GitHub App (leitura/escrita por recurso). Foi
  confirmado o alcance por repositório, não a lista de permissões.
