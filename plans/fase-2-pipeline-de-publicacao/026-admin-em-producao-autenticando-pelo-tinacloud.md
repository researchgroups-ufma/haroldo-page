# Plano 026 — `/admin` publicado e autenticando pelo TinaCloud em produção

**Status:** TODO
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

- [ ] `/admin` acessível em produção; as três formas de URL testadas com a resposta colada
- [ ] Sem sessão, o painel mostra login e nada mais (**RF-02**)
- [ ] Login da conta ADMIN pelo TinaCloud **funciona em produção** (**RF-01**)
- [ ] Menu com as cinco coleções em vocabulário acadêmico, sem termo de versionamento (**RF-03**),
      transcrito na Evidência
- [ ] Um item de cada coleção aberto com o conteúdo real carregado — cinco pares campo/valor
      colados
- [ ] Uma edição salva pelo painel, com **commit na `main`** (SHA, autor, mensagem) e o
      frontmatter gravado colado
- [ ] O commit do painel disparou build no Workers Builds e gerou versão nova — SHA e id da versão
      colados
- [ ] Nenhuma configuração alterada durante a verificação; qualquer necessidade de alteração foi
      **reportada**, não executada
- [ ] Nenhum arquivo além do item editado em `content/` foi modificado — `git status --short`
      colado
- [ ] §12 do PRD (item 3 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao promover
      `Status: DONE`
- [ ] CI do GitHub Actions com `conclusion: success` no commit do painel

## Evidência

<Preenchida por quem executar. Prova de painel de terceiro é exercitar a interface e registrar o
que ela mostrou. A tela não é prova do que foi gravado — o arquivo é.>
