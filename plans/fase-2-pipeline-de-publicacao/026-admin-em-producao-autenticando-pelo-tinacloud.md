# Plano 026 — `/admin` publicado e autenticando pelo TinaCloud em produção

**Status:** DONE
**RFs cobertos:** RF-01, RF-02, RF-03; fase 2, **item 3** do §12; F-03
**Depende de:** plano **025** (o `/admin` só existe em produção depois de um build automático ter
publicado o `public/admin/` gerado pelo `tinacms build`)
**Modelo recomendado:** — (execução humana no navegador; um agente sonnet pode assistir nos
`curl`)
**Agente recomendado:** nenhum
**Executável por:** **orquestrador** — exige sessão autenticada no TinaCloud com a conta ADMIN do
desenvolvedor e uso do navegador. **Não depende do professor** (isso é o plano 027).
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

<https://haroldo-page.and-near.workers.dev/admin> abre o painel do TinaCMS em produção, exige
login do TinaCloud, autentica a conta ADMIN e edita conteúdo real — com o commit chegando à
`main` e o build automático do plano 025 disparando em seguida.

Este é o passo mais arriscado da fase: é onde a combinação TinaCloud + assets estáticos +
`workers.dev` costuma quebrar, e é onde se descobre se a decisão do ADR-0009 (pipeline sem cloud
check) deixou algum buraco.

## Arquivos afetados

- **Nenhum arquivo de código.**
- `content/**` — **um** item existente é editado pelo painel, deliberadamente, como prova. O
  arquivo alterado é evidência; não o reverta antes de registrar o conteúdo literal gravado.

> Não altere `wrangler.toml`, `tina/config.ts`, `astro.config.mjs` nem `package.json`. Se a
> verificação exigir mudança de configuração (por exemplo, `html_handling` para o `/admin` sem
> barra final, ou a URL do site nas configurações do projeto no TinaCloud), **pare e reporte**: a
> mudança vira plano próprio, com revisão. É exatamente aqui que este projeto já aprovou uma
> correção que não funcionava.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 estático + TinaCMS 3.12.1, servido pelo Cloudflare Workers
(Static Assets) em <https://haroldo-page.and-near.workers.dev>. Repositório público
`researchgroups-ufma/haroldo-page`, branch `main`. Cinco coleções em `content/`: `perfil`
(singleton), `linhas-pesquisa`, `projetos`, `disciplinas`, `publicacoes` — 13 arquivos placeholder
criados pelo painel no plano 020.

**Como o `/admin` chega a produção.** `tinacms build` (primeira etapa de `npm run build:pipeline`)
gera `public/admin/`; `astro build` copia `public/` para `dist/`; o Workers Builds publica
`dist/`. `public/admin/` e `tina/__generated__/` são **gitignorados** — só existem depois do
build. `tina/tina-lock.json` é a exceção versionada, e é o que o TinaCloud precisa ver em `main`
para indexar a branch.

**Em produção o painel não é o de desenvolvimento.** Localmente, `public/admin/index.html` carrega
o próprio código de `http://localhost:4001/admin/src/main.tsx` (por isso "Failed loading TinaCMS
assets" quando o `tinacms dev` está morto — armadilha do plano 022). Em produção não há servidor
local: os assets vêm do próprio `dist/` e a API é a do TinaCloud. **A tela de erro, se houver,
será outra** — não transporte o diagnóstico do 022 para cá.

### Onde isto costuma quebrar — verifique cada um, não presuma

1. **`/admin` sem barra final.** O Cloudflare Workers Static Assets resolve `/admin` para
   `/admin/index.html` conforme o `html_handling`, que o `wrangler.toml` **não declara** (fica no
   default). Teste as três formas: `/admin`, `/admin/` e `/admin/index.html`. Se alguma responder
   404, é achado — registre qual, com o `curl.exe -sI` colado, e **não conserte aqui**.
2. **`TINA_CLIENT_ID` embutido no bundle.** O client id é injetado em tempo de build. Se o
   Workers Builds não tiver a variável (plano 025), o painel abre e falha ao autenticar. Um
   painel que abre não prova que a variável existe — o login prova.
3. **URL do site no projeto do TinaCloud.** O TinaCloud costuma exigir que a origem do site esteja
   declarada nas configurações do projeto para aceitar o retorno do OAuth. Se o login redirecionar
   para erro, é o primeiro lugar a olhar — **registre o que a tela mostrou** antes de mexer em
   qualquer configuração, e pare se a correção exigir mudança de configuração persistente.
4. **Indexação da branch.** Se o TinaCloud mostrar "No Tina config was found on main", o
   `tina/tina-lock.json` em `main` está desatualizado ou ausente. Nenhum plano da fase 2 muda
   schema, então isso não deve acontecer — se acontecer, é achado grave, porque significa que o
   ADR-0009 removeu o único aviso automático que existia (é a consequência que o próprio ADR
   registra).

### O que este plano NÃO faz

- ⛔ **Não cria nem convida o usuário EDITOR** (plano 027) e **não** verifica a matriz da §9.
- ⛔ **Não cronometra nada** (M-02 é o plano 029). Aqui o objetivo é *funcionar*, não *ser rápido*.
- ⛔ **Não configura notificação de falha** (plano 028).
- ⛔ **Não constrói página nenhuma.** O site público é a fase 3 — e é por isso que a prova de que
  a edição "chegou" é o **commit na `main` + a versão nova publicada no Worker**, não uma página
  mostrando o texto novo. Ver a seção correspondente no README da fase 2.

### Armadilhas do painel que valem também em produção (herdadas da fase 1)

- **O formulário descarta em silêncio alteração em campo que já tinha valor** ao voltar de um
  subpainel de grupo `object` — duas manifestações observadas (planos 020 e 021). **A tela não é
  prova; o arquivo é.** Contorno mais confiável, do plano 022: **salvar sem sair do subpainel**.
- **O painel deixa salvar item de lista embutida com subcampo obrigatório vazio** (`aulas[]`,
  `listas[]`, `materiais[]`, `bibliografia[]`, `scripts[].titulo`, `scripts[].codigo`,
  `publicacoes.autores[]`). Não é o objeto deste plano — mas se você criar item aqui, não caia
  nela por acidente.
- **Projeto sem linha de pesquisa grava `linha_relacionada: ''`**, que é referência inválida. Se
  for editar um projeto, **confira o arquivo gravado** e registre se o campo apareceu.

**Ambiente.** Windows 11 / PowerShell. Conta ADMIN: desenvolvedor (`and.near@hotmail.com`).

## Passos

1. 🧑 Conferir que o último build automático (plano 025) publicou e que o `dist/` em produção
   contém o painel: `curl.exe -sI https://haroldo-page.and-near.workers.dev/admin/index.html`.
   → verify: 200 colado, com `content-type: text/html`.
2. 🧑 Testar as três formas de URL do painel (`/admin`, `/admin/`, `/admin/index.html`) com
   `curl.exe -sI`.
   → verify: as três respostas coladas. Divergência é achado, não conserto.
3. 🧑 Abrir <https://haroldo-page.and-near.workers.dev/admin> em uma **janela anônima, sem
   sessão** (RF-02).
   → verify: aparece a tela de login do TinaCloud e **nenhuma** operação de edição fica
   disponível. Descreva a tela.
4. 🧑 Fazer login com a conta ADMIN.
   → verify: o painel abre com as cinco coleções no menu, em vocabulário acadêmico e em português
   — "Perfil", "Linhas de pesquisa", "Projetos", "Disciplinas", "Publicações" —, sem nenhuma
   menção a arquivo, pasta, commit ou branch (RF-03). Liste o que o menu mostrou.
5. 🧑 Abrir um item existente de cada uma das cinco coleções, **sem salvar**, e conferir que os
   campos vêm preenchidos com o conteúdo real do repositório.
   → verify: para cada coleção, um campo e o valor que apareceu, colados. Isso prova que o painel
   em produção está lendo a `main` indexada, não um estado vazio.
6. 🧑 Editar **um** item — sugestão: a `descricao` de uma linha de pesquisa, que é campo de texto
   simples fora de subpainel — pondo um marcador rastreável e datado (ex.: sufixo
   `[verificação 026 — 2026-09-DD]`) e salvar.
   → verify: (a) o painel confirma o salvamento; (b) o commit aparece na `main` do GitHub, com
   autor atribuível (RNF-16, §9 "Logs e auditoria") — cole SHA, autor e mensagem; (c) o arquivo em
   `content/` no GitHub mostra o texto novo — cole o frontmatter literal.
7. 🧑 Acompanhar o efeito no pipeline: o commit do painel dispara build no Workers Builds.
   → verify: SHA batendo com o do passo 6, status final e id da versão publicada, colados. **Sem
   cronometrar** — o tempo é o plano 029.
8. 🧑 Confirmar que o `git pull` local traz o commit do painel e que o repositório continua
   consistente.
   → verify: `git log --oneline -3` e `git status --short` colados.

## Critérios de aceitação

- [x] `/admin` acessível em produção; as três formas de URL testadas com a resposta colada
- [x] Sem sessão, o painel mostra login e nada mais (**RF-02**)
- [x] Login da conta ADMIN pelo TinaCloud **funciona em produção** (**RF-01**)
- [x] Menu com as cinco coleções em vocabulário acadêmico, sem termo de versionamento (**RF-03**),
      transcrito na Evidência
- [x] Um item de cada coleção aberto com o conteúdo real carregado — cinco pares campo/valor
      colados
- [x] Uma edição salva pelo painel, com **commit na `main`** (SHA, autor, mensagem) e o
      frontmatter gravado colado
- [x] O commit do painel disparou build no Workers Builds e gerou versão nova — SHA e id da versão
      colados
- [x] Nenhuma configuração alterada durante a verificação; qualquer necessidade de alteração foi
      **reportada**, não executada
- [x] Nenhum arquivo além do item editado em `content/` foi modificado — `git status --short`
      colado
- [x] §12 do PRD (item 3 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao promover
      `Status: DONE`
- [x] CI do GitHub Actions com `conclusion: success` no commit do painel

## Evidência

> Executado pelo **orquestrador** em 2026-09-11, no navegador e no terminal. Os blocos de
> terminal trazem a saída literal da máquina; os de painel dizem o que a tela mostrou. As duas
> origens não se misturam sob o mesmo rótulo. O login do TinaCloud foi feito **pelo
> desenvolvedor** (o agente não digita credencial); o resto da interação com o painel foi do
> agente, no Chrome do desenvolvedor.

### Passo 1 — o painel chegou a produção pelo build automático (terminal)

`curl.exe -sI https://haroldo-page.and-near.workers.dev/admin/index.html`:

```
HTTP/1.1 307 Temporary Redirect
Date: Fri, 11 Sep 2026 21:18:01 GMT
Location: /admin/
x-robots-tag: noindex
Server: cloudflare
CF-RAY: a399b3d8ffbfa45a-GRU
```

**Não é o 200 que o passo previa.** O 200 está um salto adiante, em `/admin/` — ver o achado do
passo 2. Seguindo o redirecionamento (`curl.exe -sIL`):

```
HTTP/1.1 307 Temporary Redirect
Location: /admin/
HTTP/1.1 200 OK
Content-Type: text/html
```

### Passo 2 — as três formas de URL, e o achado

```
===== /admin =====
HTTP/1.1 307 Temporary Redirect
Location: /admin/

===== /admin/ =====
HTTP/1.1 200 OK
Content-Type: text/html
CF-Cache-Status: HIT
Cache-Control: public, max-age=0, must-revalidate

===== /admin/index.html =====
HTTP/1.1 307 Temporary Redirect
Location: /admin/
```

**Achado, não consertado (o plano proíbe consertar aqui).** Nenhuma das três responde 404 — o
critério de aceitação está cumprido —, mas só `/admin/` responde 200 direto. `/admin` e
`/admin/index.html` respondem **307** para `/admin/`. A causa é o `html_handling` que o
`wrangler.toml` não declara: o default do Workers Static Assets é `auto-trailing-slash`, que
normaliza as duas variantes para a forma com barra. O navegador segue o redirecionamento e o
painel abre; o custo é um salto extra. **Nada foi alterado** — mudar `html_handling` seria
alteração de configuração, e o plano manda parar e reportar.

### O painel em produção é o de produção, não o de desenvolvimento (terminal)

O HTML servido por `/admin/` carrega os assets do próprio `dist/`, não de `localhost:4001`:

```html
<script type="module" crossorigin src="/admin/assets/index-BdX7D4Lf.js"></script>
<link rel="stylesheet" crossorigin href="/admin/assets/index-BL0kiTsf.css">
```

A armadilha do plano 022 ("Failed loading TinaCMS assets" por `tinacms dev` morto) **não se
aplica aqui**, como o plano previa. O `handleLoadError` continua no HTML, mas é o fallback de
2 segundos do próprio Tina, e não foi disparado.

**`TINA_CLIENT_ID` está embutido no bundle** (verificação de terminal, sobre o
`index-BdX7D4Lf.js` baixado — 6.460.726 bytes):

```
client id do .env presente no bundle: SIM
branch 'main' embutida: SIM
```

Isto prova que o Workers Builds tinha a variável de build do plano 025. **Não prova que o login
funciona** — quem prova isso é o passo 4.

### Passo 3 — sem sessão, o painel mostra login e nada mais (RF-02)

**Ressalva de método, dita por inteiro:** não foi janela anônima. Foi uma janela normal do Chrome
num perfil **sem sessão do TinaCloud**, o que o estado do armazenamento confirma abaixo. O efeito
verificado é o mesmo — nenhuma credencial preexistente —, mas o plano pedia anônima e é honesto
registrar a diferença em vez de alegar o que não foi feito.

O que a tela mostrou: modal centralizado, sobre o painel escurecido, com o título **"Let's get you
editing with TinaCMS!"**, a ilustração da lhama e um único botão **"Log in"**. Ao fundo, apenas o
texto "TinaCMS form fields will appear here."

Árvore de acessibilidade da página (todos os elementos interativos existentes, sem filtro):

```
button "Log in"
button "Open navigation menu"
button "Hide editing panel"
link "Visual Editing Docs" href="https://tina.io/docs/r/visual-editing-setup"
```

**Quatro controles, nenhum de edição**: não há coleção, item, campo, botão de salvar nem menu de
conteúdo. Estado do armazenamento na mesma página:

```json
{
  "url": "https://haroldo-page.and-near.workers.dev/admin/",
  "chavesLocalStorage": ["tina.sidebarState"],
  "chavesSession": [],
  "temCookie": "x-branch=main",
  "textoVisivel": "Let's get you editing with TinaCMS! | Log in | TinaCMS form fields | will appear here. | Visual Editing Docs"
}
```

`tina.sidebarState` é preferência de interface e `x-branch=main` é a branch alvo; **nenhum token
de autenticação**. RF-02 cumprido.

### Passo 4 — login da conta ADMIN em produção (RF-01)

Ao clicar em "Log in", o painel abre o fluxo do TinaCloud em janela pop-up separada. As chamadas
de rede da página, antes do login, já mostravam o painel falando com o TinaCloud com o client id
de produção:

```
https://identity.tinajs.io/v2/apps/8be98053-68c3-4262-b7bd-dd1286e1c7ad/billing/state
https://identity.tinajs.io/v2/auth/config
```

O id do app (`...dd1286e1c7ad`) bate com o `TINA_CLIENT_ID` do projeto.

**O login foi feito pelo desenvolvedor**, com a conta ADMIN (`and.near@hotmail.com`),
**autenticando pelo GitHub**. Depois dele o painel carregou o dashboard: título **"Welcome to
Tina!"** e o texto "This is your dashboard for editing or creating content. Select a collection on
the left to begin."

**RF-01 cumprido em produção** — e com isso a variável de build do plano 025 fica provada pelo
login, não só pela presença no bundle.

**Menu lateral, transcrito na íntegra** (RF-03):

```
COLLECTIONS
  Perfil
  Linhas de pesquisa
  Projetos
  Disciplinas
  Publicações
SITE
  Media Manager
CLOUD
  Project Config
  User Management
  Support
  Event Log
  Log Out

TinaCMS v3.12.1
v3.13.0 published 5 days ago
```

As cinco coleções aparecem em vocabulário acadêmico e em português, exatamente como o RF-03 exige,
**sem nenhuma menção a arquivo, pasta, commit ou branch**. Os demais itens são o mobiliário fixo do
TinaCMS, em inglês — o que a Q-02 já aceitou em 2026-09-01.

#### Achado — o vocabulário de arquivo aparece um clique adiante

O critério do RF-03 é sobre **o menu** ("quando o professor olha o menu"), e o menu passa. Mas a
tela de listagem de uma coleção, um clique adiante, mostra:

```
Filename | Extension | Template
index      .md         perfil
content/perfil/index.md
[ Add Folder ]  [ Add File ]
```

Isso é mobiliário fixo do TinaCMS, não rótulo nosso: não sai de `tina/config.ts`. **Não viola o
RF-03 como está escrito**, mas é exatamente o tipo de coisa que o manual do professor (fase 5)
tem de antecipar. **Registrado como insumo do plano 033**, sem alteração de configuração.

#### Achado menor — trilha de navegação truncada no ponto

Em `disciplinas`, o arquivo `2026.2-relatividade-geral.md` aparece na trilha como
**"Disciplinas / 2026"**: o painel corta o nome no primeiro ponto, tratando-o como extensão. O
formulário abre o item certo e grava certo (ver passo 5); o defeito é só de exibição da trilha.
Também insumo do plano 033.

#### Aviso do painel, transcrito para a fase 5

```
Changes to TinaCloud Authentication
TinaCloud is switching to a new, faster, and more reliable authentication system in October.
If you are using TinaCMS version 3.11 or below, you won't be able to log in until you upgrade.
Upgrade to 3.12 or above now to avoid any issues.
Your version: 3.12.1 - Targets: >0.0.0
```

**Não exige ação:** o projeto está em 3.12.1, acima do corte 3.11. Fica registrado porque é uma
mudança anunciada do provedor que pode quebrar login — risco R-03 — e porque o painel também
sinaliza que a 3.13.0 saiu há 5 dias.

### Passo 5 — um item de cada coleção, aberto sem salvar

Todos abertos com o conteúdo real do repositório, o que prova que o painel em produção lê a `main`
indexada e não um estado vazio. Um par campo/valor por coleção, como a tela mostrou:

| Coleção | Item aberto | Campo | Valor que apareceu na tela |
|---|---|---|---|
| Perfil | `index` | **Nome** | `Haroldo Cilas Duarte Lima Junior` |
| Linhas de pesquisa | `sombras-de-buracos-negros` | **Título** | `Sombras de buracos negros` |
| Projetos | `sombras-de-buracos-negros-em-gravitacao-modificada` | **Título** | `Sombras de buracos negros em gravitação modificada` |
| Disciplinas | `2026.2-relatividade-geral` | **Nome** | `Relatividade Geral` |
| Publicações | `2025-exemplo-sombras-...-gauss-bonnet` | **Título** | `[EXEMPLO] Sombras de buracos negros de Kerr em gravitação de Gauss-Bonnet` |

Conferência do par do Perfil contra o arquivo do repositório (terminal), que bate campo a campo:

```
nome: Haroldo Cilas Duarte Lima Junior
cargo: Professor Adjunto A
instituicao: 'Universidade Federal do Maranhão (UFMA), Campus São Luís'
departamento: Centro Tecnológico — Departamento de Física
```

O painel mostrava, nos mesmos campos: `Haroldo Cilas Duarte Lima Junior`, `Professor Adjunto A`,
`Universidade Federal do Maranhão (UFMA), Campus São Luís`,
`Centro Tecnológico — Departamento de Física`.

Nenhum dos cinco foi salvo. As armadilhas de subpainel `object` herdadas da fase 1 não foram
tocadas: nenhum grupo "Versão em inglês (opcional)" foi aberto.

### Passo 6 — uma edição salva pelo painel

**Desvio do plano, deliberado e menor.** O plano sugeria editar a `descricao` de uma linha de
pesquisa. **Esse campo não existe** em `linhas_pesquisa` — os campos são `publicado`, `titulo`,
`ordem`, `resumo`, `corpo`, `imagem` e o grupo `en`. O campo que atende à intenção do plano
(texto simples, fora de subpainel) é o **`resumo`**, rotulado "Resumo", e foi o editado.

Marcador acrescentado ao fim do campo, digitado pelo teclado no formulário real (não por script):
` [verificação 026 — 2026-09-11]`. Salvo com o botão **Save**, sem entrar em nenhum subpainel —
o contorno que o plano 022 recomenda.

**(a) O painel confirmou:** apareceu o aviso verde **"Document updated!"**, o botão Save voltou a
ficar desabilitado e o indicador de estado do formulário voltou de vermelho a verde.

**(b) O commit chegou à `main`** (terminal, `git log` sobre `origin/main`):

```
SHA:      7ab84da49437c2b7280b7fcbf038efd996e7b24c
Autor:    André F. <160500693+abbadrava@users.noreply.github.com>
Data:     Fri Sep 11 18:25:28 2026 -0300
Mensagem: TinaCMS content update
```

A mensagem completa do commit, lida pela API da Cloudflare no registro do build, traz ainda a
atribuição do TinaCloud à conta ADMIN:

```
TinaCMS content update

Co-authored-by: André F. <and.near@hotmail.com>
```

**RNF-16 / §9 "Logs e auditoria" cumpridos:** a edição é atribuível a uma pessoa identificada, nos
dois lados — o autor do commit é a conta GitHub do ADMIN e o co-autor é o e-mail da conta
TinaCloud.

**(c) O arquivo gravado** (terminal,
`git show 7ab84da:content/linhas-pesquisa/sombras-de-buracos-negros.md`):

```yaml
---
publicado: true
titulo: Sombras de buracos negros
ordem: 2
resumo: 'Modelagem da sombra projetada por buracos negros e comparação com as imagens obtidas por interferometria de longa base. Editado pelo plano 021 para demonstrar o critério de conclusão da fase 1. [CONTEÚDO DE EXEMPLO] [verificação 026 — 2026-09-11]'
---
```

O texto digitado foi gravado **literalmente**, travessão `—` inclusive. O diff é de uma linha:

```
 content/linhas-pesquisa/sombras-de-buracos-negros.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Nenhuma das armadilhas da fase 1 se manifestou:** o campo já tinha valor e a alteração **não**
foi descartada — porque não houve ida e volta a subpainel, que é a condição que as duas
manifestações conhecidas exigem.

### Passo 7 — o commit do painel disparou o pipeline

**Vínculo commit <-> build pelo lado do GitHub** (`gh api repos/.../commits/7ab84da.../check-runs`),
com os **dois** pipelines do ADR-0009 no mesmo push:

```
Workers Builds: haroldo-page | app=cloudflare-workers-and-pages | completed/success
  https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production/builds/8aa9d0db-bd43-4272-91a0-bbbea19777d0
qualidade | app=github-actions | completed/success
  https://github.com/researchgroups-ufma/haroldo-page/actions/runs/34649311276/job/103427481901
```

**Vínculo confirmado pelo lado da Cloudflare** (API, registro do build `8aa9d0db`):

```json
{
  "status": "stopped",
  "build_outcome": "success",
  "commit": "7ab84da49437c2b7280b7fcbf038efd996e7b24c",
  "branch": "main",
  "autor": "André F.",
  "iniciado":  "2026-09-11T21:25:30.552Z",
  "terminado": "2026-09-11T21:28:01.072Z"
}
```

O build começou **2 segundos** depois do commit, sem intervenção humana.

**Versão nova publicada** (API da Cloudflare, `workers/scripts/haroldo-page/versions` e
`/deployments`):

```json
{
  "versao_criada": { "id": "4b948808-576f-40b9-a84e-9612bcaf096c",
                     "criada": "2026-09-11T21:27:57.798279Z",
                     "origem": "wrangler", "autor": "and.near@hotmail.com" },
  "deploy_atual":  { "id": "7c12de97-3923-4ed3-845e-6ea8867a507c",
                     "criado": "2026-09-11T21:27:58.120189Z",
                     "versoes": [ { "version_id": "4b948808-576f-40b9-a84e-9612bcaf096c",
                                    "pct": 100 } ] }
}
```

A versão `4b948808` **sucede a `1132cea1` do plano 025** e está servindo 100% do tráfego. O elo
final da cadeia da fase 2 está fechado por artefato:

```
save no /admin  ->  commit 7ab84da na main  ->  build 8aa9d0db (success)  ->  versao 4b948808 (100%)
```

**Sem cronometragem** — a medição de M-02 é o plano 029. Os horários acima ficam registrados
porque são propriedade dos artefatos, não medição conduzida.

**Produção depois do redeploy** (terminal):

```
/                    status=200 bytes=331 tempo=0.249028s
/admin/              status=200 bytes=2290 tempo=0.242454s
/nao-existe-mesmo    status=404 bytes=0 tempo=0.224027s
```

### Verificação independente — CI do GitHub Actions sobre o commit do painel

Este plano não altera código, então não há suíte a rodar por conta da mudança; a execução
autoritativa é a do **CI sobre o próprio commit do painel** (`run 34649311276`,
`conclusion: success`), que é também um critério de aceitação. Passos e números, do log do run:

```
JOB: qualidade — success
   4. Run npm ci — success
   5. Run npm run lint — success
   6. Run npm run format:check — success
   7. Run npm run test:coverage — success
   8. Run npm run build:pipeline — success
```

```
Run npm run test:coverage    Test Files  4 passed (4)
Run npm run test:coverage         Tests  107 passed (107)
Run npm run test:coverage    All files  |  100 |  100 |  100 |  100 |
Run npm run build:pipeline   Test Files  2 passed (2)
Run npm run build:pipeline        Tests  93 passed (93)
Run npm run build:pipeline   - 0 errors
Run npm run build:pipeline   21:26:58 [build] 1 page(s) built in 887ms
```

O portão de conteúdo (93 testes de `tests/content`) rodou **nos dois** pipelines sobre o conteúdo
que o painel acabou de gravar — no CI e dentro do build de deploy da Cloudflare. É o ADR-0009
funcionando sobre uma edição real de painel, não sobre um push de desenvolvedor.

### Passo 8 — o repositório local, consistente

```
$ git pull --ff-only origin main
Updating 18cdf91..7ab84da
Fast-forward
 content/linhas-pesquisa/sombras-de-buracos-negros.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git log --oneline -3
7ab84da TinaCMS content update
18cdf91 docs: adendo ao 025 — D-01 confirmada pela API, nao por relato de tela
25396cf docs: 025 DONE — o deploy deixa de ser manual, e a fase 2 sai do 0/8

$ git status --short
(vazio)
```

Avanço rápido limpo, **um** arquivo alterado, árvore de trabalho limpa.

### Nenhuma configuração foi alterada

`wrangler.toml`, `tina/config.ts`, `astro.config.mjs`, `package.json` e as configurações do projeto
no TinaCloud e na Cloudflare estão **como estavam antes deste plano**. Os dois achados que
poderiam pedir mudança — o `html_handling` do passo 2 e o vocabulário de arquivo na listagem —
foram **reportados, não executados**, como o plano manda. O único byte alterado no repositório foi
a linha `resumo` do item editado, que é a prova pedida pelo passo 6.

### O que este plano não provou

O texto novo **não aparece em página nenhuma**, porque não existe página que renderize conteúdo
até a fase 3 — limitação declarada no README da fase 2, não um atalho. O que está provado é a
cadeia até a versão publicada no Worker.
