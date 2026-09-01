# Plano 001 — Repositório Git local, `.gitignore`, `.nvmrc` e configuração de editor

**Status:** DONE
**RFs cobertos:** — (Fase 0, itens 1 e 2 parciais do checklist §12; RNF-12, RNF-16)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O diretório do projeto passa a ser um repositório Git local (branch `main`) com um primeiro
commit contendo apenas os documentos já existentes, um `.gitignore` que protege segredos e
artefatos de build, e a versão do Node fixada em `.nvmrc` — a base sobre a qual todos os
demais planos da fase 0 constroem.

## Arquivos afetados

- `.gitignore` — criar
- `.nvmrc` — criar (versão major do Node fixada)
- `.editorconfig` — criar
- `.gitattributes` — criar (normalização de fim de linha; o projeto é desenvolvido no Windows)
- (repositório Git em si — `git init`, primeiro commit)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Nunca** apague, mova ou edite `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md`, `lattes.pdf`
> ou `.firecrawl/lattes.txt`.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(Departamento de Física, UFMA). Astro 5 estático + TypeScript + Tailwind 4 + TinaCMS,
hospedado em Cloudflare Workers Static Assets. Nada disso existe ainda: **este é o primeiro
plano do projeto**. O diretório hoje contém apenas documentos.

**Estado atual do diretório** (`S:\Projetos\academic_page\haroldo`), verificado em 2026-09-01:

```
PRD.md              PRD_TEMPLATE.md     briefing.md
lattes.pdf          .firecrawl\lattes.txt
plans\              (este diretório de planos)
```

Não há `.git`, não há `package.json`, não há `node_modules`.

**Ambiente.** Windows 11, shell PowerShell (Git Bash também disponível). Caminhos com `S:\`.
O projeto é Node/TypeScript — nenhum passo usa Python.

**Branch principal = `main`.** O PRD fala em "branch principal" em §7.1, RF-11 e §7.6
(`TINA_BRANCH`). Use `git init -b main` — não aceite o default `master`.

**Versão do Node — regra determinística (não é decisão em aberto).** O PRD (§7.2, RNF-12)
manda "LTS ativa, fixada em `.nvmrc`". Aplique esta regra, nesta ordem:

1. Rode `node -v`.
2. Se o major for **22** ou **24** (as duas linhas LTS suportadas por Astro 5 e pelo
   Cloudflare Workers Builds), grave esse major no `.nvmrc`.
3. Se o major for qualquer outro (ímpar/não-LTS, ou < 22), grave `22` e **reporte no
   campo Evidência** que o Node local diverge do fixado — quem for rodar o projeto precisa
   instalar a versão do `.nvmrc`.

O `.nvmrc` contém **apenas o número major**, uma linha, sem `v` (ex.: `22`). Esse mesmo
valor será reutilizado pelo CI (`node-version-file: .nvmrc`, plano 008) e pela configuração
do Workers Builds (fase 2) — por isso ele precisa estar certo agora.

**O que o `.gitignore` deve cobrir** (exigência explícita do briefing de fatiamento e da §7.6):

| Padrão | Por quê |
|---|---|
| `node_modules/` | dependências, regeneráveis por `npm ci` |
| `dist/` | saída do `astro build` |
| `.astro/` | cache e tipos gerados do Astro |
| `.env`, `.env.*` (exceto `.env.example`) | **`TINA_TOKEN` vive aqui — nunca commitar (§7.6, RNF-07)** |
| `.firecrawl/` | extração bruta do Lattes, insumo local |
| `lattes.pdf` | ver nota abaixo |
| `.wrangler/` | estado local do Wrangler (planos 007/012) |
| `.DS_Store`, `Thumbs.db` | lixo de sistema operacional |
| `coverage/` | relatório do Vitest (plano 005) |

**Decisão tomada no fatiamento, com justificativa:** `lattes.pdf` **entra no `.gitignore`**.
É um documento pessoal bruto contendo endereço residencial-institucional e telefone; o
Apêndice C do PRD já extraiu dele tudo o que o projeto precisa. O arquivo permanece no
disco, apenas não é versionado. Se o stakeholder quiser versioná-lo, basta remover a linha —
registre isso como comentário no `.gitignore`.

**`package-lock.json` NÃO pode ser ignorado.** O CI (plano 008) usa `npm ci`, que falha sem
o lockfile. Se algum template de `.gitignore` o incluir, remova.

**Estilo do `.gitignore`.** O projeto irmão `S:\Projetos\academic_page\grav\.gitignore` usa
comentários em português explicando cada bloco. Siga o mesmo padrão — a §10 do PRD manda
conteúdo e documentação em português.

**Conventional Commits (§10.4) são obrigatórios** em todo commit de código deste projeto:
`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.

**Fim de linha.** Como o desenvolvimento é no Windows e o build roda em Linux (Workers
Builds / GitHub Actions), o `.gitattributes` deve conter no mínimo `* text=auto eol=lf`
para evitar que arquivos cheguem ao CI com CRLF.

## Passos

1. Criar `.gitignore` na raiz do projeto com os padrões da tabela acima, agrupados em
   blocos comentados em português.
   → verify: o arquivo existe e contém as linhas `node_modules/`, `dist/`, `.astro/`,
   `.env`, `.firecrawl/`, `lattes.pdf`; e **não** contém `package-lock.json`.
2. Rodar `node -v`, aplicar a regra determinística acima e criar `.nvmrc` com o major
   escolhido (uma linha, sem `v`, com quebra de linha final).
   → verify: `Get-Content .nvmrc` imprime só o número; anote a saída de `node -v` na Evidência.
3. Criar `.editorconfig` com: `root = true`, `charset = utf-8`, `end_of_line = lf`,
   `insert_final_newline = true`, `indent_style = space`, `indent_size = 2`, e
   `trim_trailing_whitespace = true` (exceto `*.md`).
   → verify: arquivo criado e legível.
4. Criar `.gitattributes` com `* text=auto eol=lf` e marcação binária para `*.pdf` e imagens.
   → verify: arquivo criado.
5. Rodar `git init -b main` na raiz do projeto.
   → verify: `git branch --show-current` imprime `main`.
6. Rodar `git status` e conferir que `lattes.pdf` e `.firecrawl/` **não** aparecem como
   arquivos não rastreados.
   → verify: cole a saída de `git status --short` na Evidência.
7. Fazer o primeiro commit incluindo `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md`, `plans/`,
   `.gitignore`, `.nvmrc`, `.editorconfig`, `.gitattributes`, com a mensagem
   `chore: inicializa repositório com documentos do projeto e configuração base`.
   → verify: `git log --oneline` mostra um commit; `git show --stat HEAD` lista os arquivos
   esperados e nenhum PDF.

## Critérios de aceitação

- [x] `git branch --show-current` retorna `main`
- [x] `git status --short` limpo (nenhum arquivo não rastreado inesperado)
- [x] `git check-ignore -v lattes.pdf .firecrawl/lattes.txt` confirma que ambos estão ignorados
- [x] `.nvmrc` contém um major LTS (22 ou 24), coerente com a regra do plano
- [x] `package-lock.json` **não** está no `.gitignore`
- [x] Primeiro commit criado com mensagem em Conventional Commits

## Evidência

Executado em 2026-09-01, Windows 11, PowerShell/Git Bash.

**Regra determinística do Node:** `node -v` retornou `v24.16.0` — major **24**, uma das
duas linhas LTS aceitas (22 ou 24). Gravado `24` no `.nvmrc`. Sem divergência a reportar.

```
$ node -v
v24.16.0

$ git branch --show-current
main

$ git status --short
(saída vazia — working tree limpo)

$ git show --stat HEAD
commit 78759a96f6c8de79e3da07fd078ecf8080e1e08f
Author: André Ferreira <and.near@hotmail.com>
Date:   Tue Sep 1 12:30:34 2026 -0300

    chore: inicializa repositório com documentos do projeto e configuração base

 .editorconfig                                      |  15 +
 .gitattributes                                     |  14 +
 .gitignore                                         |  33 +
 .nvmrc                                             |   1 +
 PRD.md                                             | 992 +++++++++++++++++++++
 PRD_TEMPLATE.md                                    | 485 ++++++++++
 briefing.md                                        | 706 +++++++++++++++
 plans/001-repositorio-git-local-e-gitignore.md     | 139 +++
 plans/002-scaffolding-astro-typescript-tailwind.md | 174 ++++
 plans/003-estrutura-de-diretorios.md               | 152 ++++
 plans/004-prettier-e-eslint.md                     | 153 ++++
 plans/005-vitest.md                                | 161 ++++
 plans/006-env-example-e-config-do-site.md          | 141 +++
 plans/007-wrangler-toml-workers-static-assets.md   | 139 +++
 plans/008-ci-github-actions.md                     | 146 +++
 plans/009-readme-inicial.md                        | 141 +++
 plans/010-roteiro-repositorio-github-privado.md    | 104 +++
 plans/011-roteiro-projeto-tinacloud.md             | 129 +++
 plans/012-roteiro-cloudflare-worker-e-primeiro-deploy.md | 146 +++
 plans/013-adr-changelog-e-fechamento-da-fase-0.md  | 199 +++++
 20 files changed, 4170 insertions(+)

$ git check-ignore -v lattes.pdf .firecrawl/lattes.txt
.gitignore:23:lattes.pdf	lattes.pdf
.gitignore:17:.firecrawl/	.firecrawl/lattes.txt
```
