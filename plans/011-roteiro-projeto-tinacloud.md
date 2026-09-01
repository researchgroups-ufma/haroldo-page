# Plano 011 — Roteiro humano: projeto no TinaCloud vinculado ao repositório

**Status:** TODO
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

- [ ] Projeto criado no TinaCloud, plano **Free**, na conta do desenvolvedor
- [ ] Vinculado ao repositório **privado** `haroldo-page`, branch `main`
- [ ] GitHub App instalado **apenas** em `haroldo-page` (verificado em
      `github.com/settings/installations`)
- [ ] `TINA_CLIENT_ID` e `TINA_TOKEN` gravados **somente** no `.env` local
- [ ] `git status --short` limpo — nenhum `.env` rastreado; nenhum token em commit,
      README, `.env.example` ou mensagem de commit
- [ ] **Apenas 1 dos 2 usuários** do plano Free ocupado (o professor **não** foi convidado —
      é fase 2, e a Q-06 está aberta)
- [ ] Editorial Workflow **não** ativado (NG-07)
- [ ] TinaCMS **não** instalado no projeto (é fase 1)
- [ ] Nota registrada: se a Q-02 for respondida com "não", este provisionamento é descartável

## Evidência

<Preenchido por quem executou: nome/URL do projeto no TinaCloud, plano, repositório e branch
vinculados, captura ou descrição da tela de instalação do GitHub App mostrando o repositório
único, e a saída de `git status --short` + `git check-ignore -v .env`.
**Não cole o token em lugar nenhum.**>
