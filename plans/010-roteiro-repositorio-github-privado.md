# Plano 010 — Roteiro humano: repositório privado no GitHub e push inicial

**Status:** DONE
**RFs cobertos:** — (Fase 0, item 1 do checklist §12; RNF-16, M-08)
**Depende de:** plano 009
**Modelo recomendado:** — (execução humana; um agente sonnet pode assistir nos passos 1 e 6)
**Agente recomendado:** nenhum — **este plano é executado por uma pessoa, no navegador**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

> ⚠️ **Plano de provisionamento.** Envolve conta de terceiro (GitHub) e exige login. Um
> agente **não** executa este plano sozinho: ele pode, no máximo, preparar comandos e
> verificar o resultado. Todo passo marcado 🧑 é humano.

## Objetivo

O repositório local passa a ter um espelho remoto **privado** no GitHub, com a `main` como
branch padrão, e o workflow de CI do plano 008 executa pela primeira vez. É a partir daí
que o conteúdo passa a ter backup e histórico recuperável (§9, M-08) e que o TinaCloud
(plano 011) e o Workers Builds (fase 2) têm a que se conectar.

## Arquivos afetados

- Nenhum arquivo do projeto é modificado. Apenas configuração de remote Git e estado no
  GitHub.

> Se algum passo parecer exigir alteração de arquivo do projeto, **pare e reporte** — não é
> deste plano.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Repositório local já existe (plano 001), com `main` como branch e commits dos
planos 001–009.

**Decisões já fechadas pelo PRD — não há o que escolher aqui:**

| Item | Valor | Origem |
|---|---|---|
| Nome do repositório | `haroldo-page` | codinome do projeto, §0 do PRD; mesmo nome do Worker (plano 007) |
| Visibilidade | **privado** | checklist §12 da fase 0: "Repositório GitHub criado (**privado**)"; §7.4: "Gratuito para repositório privado" |
| Dono da conta | o **desenvolvedor** (`and.near@hotmail.com`) | §4.1 persona 2 e §4.2: "dono das contas GitHub, Cloudflare e TinaCloud (decisão do stakeholder)" |
| Branch padrão | `main` | §7.6 (`TINA_BRANCH`), §7.1, RF-11 |
| Acesso do professor | **nenhum** | matriz §9: "Acessar o repositório GitHub — ADMIN ✔ / EDITOR ✘". O professor edita pelo painel do Tina, jamais pelo GitHub |

**Por que privado, se o site é público:** o repositório contém o `PRD.md` com dados
extraídos do Lattes (endereço institucional, telefone) e, futuramente, rascunhos com
`publicado: false` que não devem circular (RN-01, D-04). O site publicado é o `dist/`
servido pela Cloudflare, não o repositório.

**Não faça nada além do escopo.** Em especial, **não** conecte o Cloudflare Workers Builds
ao repositório: isso é da **fase 2** (§6.2). E **não** convide o professor como colaborador
— ele nunca terá acesso ao repositório (matriz §9).

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.
Se o GitHub CLI (`gh`) estiver instalado e autenticado, os passos 2 e 3 podem ser feitos por
comando; caso contrário, pelo navegador. Verifique com `gh auth status`.

## Passos

1. 🤖/🧑 Conferir que o repositório local está limpo e completo antes de publicar:
   `git status --short` (vazio) e `git log --oneline` (commits dos planos 001–009).
   → verify: nenhuma alteração pendente; nenhum `.env` ou `lattes.pdf` rastreado
   (`git ls-files | Select-String "\.env$|lattes\.pdf"` não retorna nada).
2. 🧑 Criar o repositório **privado** `haroldo-page` na conta do desenvolvedor:
   - com `gh`: `gh repo create haroldo-page --private --source . --remote origin`
   - ou pelo navegador em `https://github.com/new`: nome `haroldo-page`, visibilidade
     **Private**, **sem** README, **sem** `.gitignore`, **sem** licença (o repositório local
     já tem tudo; inicializar do lado do GitHub cria um commit órfão e força merge).
   → verify: a página do repositório abre e exibe o selo **Private**.
3. 🧑 Se o repositório foi criado pelo navegador, adicionar o remote:
   `git remote add origin https://github.com/<usuario>/haroldo-page.git`
   → verify: `git remote -v` lista `origin` para fetch e push.
4. 🧑 Publicar a branch: `git push -u origin main`.
   → verify: `git status -sb` mostra `## main...origin/main` sem divergência.
5. 🧑 No GitHub, em *Settings → General*, confirmar que a branch padrão é `main`.
   → verify: a aba *Code* mostra `main` como branch exibida por padrão.
6. 🧑 Abrir a aba **Actions** do repositório e conferir a primeira execução do workflow
   "CI" (criado no plano 008), disparada pelo push do passo 4.
   → verify: o job **conclui verde**, com os cinco steps (`npm ci`, `lint`, `format:check`,
   `test`, `build`) bem-sucedidos. Salve a URL da execução.
7. 🧑 Se o CI falhar, **não** afrouxe o workflow. Diagnostique pela mensagem:
   - erro de `format:check` que passa localmente ⇒ CRLF vs LF (ver plano 004/001);
   - `npm ci` falhando ⇒ `package-lock.json` dessincronizado (rode `npm install` local,
     commite o lock, faça push de novo);
   - versão de Node ⇒ divergência entre `.nvmrc` e o que o job resolveu.
   → verify: nova execução verde.

## Critérios de aceitação

- [x] Repositório `haroldo-page` existe no GitHub e está marcado **Private**
- [x] `git remote -v` aponta para ele e `git push` funciona sem erro
- [x] Branch padrão é `main`
- [x] `git ls-files` não contém `.env`, `lattes.pdf` nem qualquer arquivo de `.firecrawl/`
- [x] **Verificação objetiva final:** a execução do workflow "CI" na aba Actions está
      **verde**, e a URL dessa execução está registrada na Evidência
- [x] O professor **não** foi adicionado como colaborador
- [x] Workers Builds **não** foi conectado (é fase 2)

## Evidência

Executado em 2026-09-01. Os passos automatizáveis (1, 3, 4) foram feitos pelo agente
orquestrador; a criação do repositório (passo 2) e a conferência da aba Actions (passo 6)
foram feitas pelo usuário, dono da organização.

**Repositório:** <https://github.com/researchgroups-ufma/haroldo-page>

Divergência registrada em relação ao plano: o plano previa o repositório na conta pessoal
do desenvolvedor (§4.2 do PRD). O usuário optou pela organização `researchgroups-ufma`, que
lhe pertence, e reafirmou a escolha depois de alertado sobre o dado pessoal do `PRD.md` e
sobre a matriz da §9 (professor sem acesso ao repositório). Decisão do stakeholder.

### Passo 1 — auditoria local antes de publicar

```
$ git ls-files | grep -iE '(^|/)\.env$|lattes\.pdf|^\.firecrawl/|^\.wrangler/|^dist/|^coverage/|^node_modules/'
(nenhum resultado)

$ git ls-files | wc -l
57

$ grep -nE '^(TINA_CLIENT_ID|TINA_TOKEN)=.+' .env.example
(nenhum resultado — os dois estão vazios)

$ git grep -nIE '(ghp_|github_pat_|gho_|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)'
(nenhum resultado)
```

`.env.example` é o único arquivo `.env` versionado, como manda a §7.6.

### Visibilidade — prova de que o repositório é privado

Sem `gh` CLI na máquina, a confirmação foi feita por contraste entre acesso autenticado e
anônimo:

```
$ git ls-remote origin          # autenticado
git exit=0   (repositório existe e responde)

$ curl -s -o /dev/null -w "%{http_code}" https://github.com/researchgroups-ufma/haroldo-page
404

$ curl -s -o /dev/null -w "%{http_code}" https://api.github.com/repos/researchgroups-ufma/haroldo-page
404
```

Existe para quem tem credencial, 404 para quem não tem: **Private** confirmado.

### Passos 3 e 4 — remote e push

```
$ git remote -v
origin	https://github.com/researchgroups-ufma/haroldo-page.git (fetch)
origin	https://github.com/researchgroups-ufma/haroldo-page.git (push)

$ git push -u origin main
To https://github.com/researchgroups-ufma/haroldo-page.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.

$ git status -sb
## main...origin/main
```

Sem divergência entre local e remoto.

### Passo 5 — branch padrão

```
$ git ls-remote --symref origin HEAD
ref: refs/heads/main	HEAD
9dc42c7a9ed9c8310fe19f354666ddf2a7344057	HEAD
```

### Conteúdo efetivamente publicado (verificado no remoto, não só no local)

```
$ git ls-tree -r origin/main --name-only | wc -l
57
$ git rev-list --count origin/main
22
$ git ls-tree origin/main .github/workflows/
100644 blob de6c17b61cfe3b69560cd3fe2fba8fa8fb038124	.github/workflows/ci.yml
$ git ls-tree -r origin/main --name-only | grep -iE '(^|/)\.env$|lattes\.pdf|^\.firecrawl/'
(nenhum resultado)
```

### Passo 6 — primeira execução do workflow CI

Conferida pelo usuário na aba Actions, em 2026-09-01, e reportada assim:

```
Triggered via push 2 minutes ago
@abbadravaabbadrava pushed 9dc42c7 main
Status:         Success
Total duration: 48s
Artifacts:      –
```

Aba: <https://github.com/researchgroups-ufma/haroldo-page/actions>

O commit `9dc42c7` é o `HEAD` da `main`, ou seja, o workflow validou a árvore inteira —
`npm ci`, `lint`, `format:check`, `test` e `build` — em Linux, com o Node resolvido a
partir do `.nvmrc`. O passo 7 (diagnóstico de falha) não foi necessário.

**Procedência desta evidência:** ao contrário do restante deste plano, o resultado do CI
não foi capturado por comando desta sessão — não há `gh` CLI na máquina e o agente não
acessou as credenciais do usuário para consultar a API. É observação direta do usuário na
interface do GitHub, que é a fonte autoritativa do fato. Registrado como relato atribuído,
não como saída de comando.

### Fora de escopo, confirmado

- O professor **não** foi adicionado como colaborador.
- O Cloudflare Workers Builds **não** foi conectado (é fase 2, §6.2).
