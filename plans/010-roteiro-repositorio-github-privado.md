# Plano 010 — Roteiro humano: repositório privado no GitHub e push inicial

**Status:** TODO
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

- [ ] Repositório `haroldo-page` existe no GitHub e está marcado **Private**
- [ ] `git remote -v` aponta para ele e `git push` funciona sem erro
- [ ] Branch padrão é `main`
- [ ] `git ls-files` não contém `.env`, `lattes.pdf` nem qualquer arquivo de `.firecrawl/`
- [ ] **Verificação objetiva final:** a execução do workflow "CI" na aba Actions está
      **verde**, e a URL dessa execução está registrada na Evidência
- [ ] O professor **não** foi adicionado como colaborador
- [ ] Workers Builds **não** foi conectado (é fase 2)

## Evidência

<Preenchido por quem executou: URL do repositório, saída de `git remote -v` e
`git status -sb`, URL e resultado da execução do workflow CI, e a lista de arquivos
versionados (`git ls-files | Measure-Object -Line`) confirmando ausência de segredos.>
