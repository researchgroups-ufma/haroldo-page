# Plano 003 — Estrutura de diretórios conforme §7.5 do PRD

**Status:** TODO
**RFs cobertos:** — (Fase 0, item 3 do checklist §12)
**Depende de:** plano 002
**Modelo recomendado:** haiku
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A árvore de diretórios do projeto passa a espelhar exatamente a §7.5 do PRD, com os
diretórios ainda vazios preservados no Git por `.gitkeep`, de modo que os planos das fases
1 a 5 encontrem o lugar certo para cada arquivo sem precisar inventar caminho.

## Arquivos afetados

- `content/perfil/.gitkeep`, `content/linhas-pesquisa/.gitkeep`, `content/projetos/.gitkeep`,
  `content/disciplinas/.gitkeep`, `content/publicacoes/.gitkeep` — criar
- `public/uploads/.gitkeep`, `public/robots.txt` — criar
- `src/components/.gitkeep`, `src/layouts/.gitkeep`, `src/pages/en/.gitkeep`,
  `src/i18n/.gitkeep`, `src/lib/.gitkeep` — criar
- `tests/.gitkeep` — criar
- `docs/adr/.gitkeep`, `docs/CHANGELOG.md` — criar
- `scripts/.gitkeep` — criar

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** crie `src/content.config.ts`, `tina/config.ts`, `wrangler.toml`, `.env.example`
> nem `README.md` — cada um tem plano próprio. **Não** apague nem edite `PRD.md`,
> `PRD_TEMPLATE.md`, `briefing.md`, `plans/`, `src/pages/index.astro`, `src/styles/global.css`.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático. Os planos 001 e 002 já criaram o repositório Git, o
`package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro` e
`src/styles/global.css`. Este plano só **cria diretórios**; nenhuma lógica.

**Árvore alvo (§7.5 do PRD, transcrita).** Itens marcados ⏳ são de outros planos/fases e
**não devem ser criados aqui**:

```text
haroldo/
├── README.md               ⏳ plano 009
├── PRD.md                  já existe
├── briefing.md             já existe
├── astro.config.mjs        já existe (plano 002)
├── tina/config.ts          ⏳ fase 1
├── wrangler.toml           ⏳ plano 007
├── package.json            já existe (plano 002)
├── tsconfig.json           já existe (plano 002)
├── .nvmrc                  já existe (plano 001)
├── .env.example            ⏳ plano 006
├── .github/workflows/      ⏳ plano 008
├── content/                ← CRIAR: perfil, linhas-pesquisa, projetos, disciplinas, publicacoes
├── public/
│   ├── uploads/            ← CRIAR (imagens enviadas pelo painel)
│   ├── favicon.svg         ⏳ fase 5 (RF-30) — não criar
│   └── robots.txt          ← CRIAR (versão provisória, ver abaixo)
├── src/
│   ├── content.config.ts   ⏳ fase 1
│   ├── components/         ← CRIAR
│   ├── layouts/            ← CRIAR
│   ├── pages/              já existe; ← CRIAR apenas `pages/en/`
│   ├── i18n/               ← CRIAR
│   ├── lib/                ← CRIAR
│   └── styles/             já existe
├── tests/                  ← CRIAR (espelha src/, Vitest — plano 005 põe o primeiro teste)
├── docs/
│   ├── adr/                ← CRIAR
│   ├── CHANGELOG.md        ← CRIAR (esqueleto Keep a Changelog)
│   └── manual-do-professor.md  ⏳ fase 5
└── scripts/                ← CRIAR
```

**`content/` fica na raiz do repositório, não em `src/content/`.** Isso é intencional: a
§7.5 chama `content/` de "domínio do PROFESSOR" (é a única pasta, junto de `public/uploads/`,
que o TinaCMS escreve). Na fase 1 o Astro vai apontar para ela com um `glob` loader
(`base: './content'`) em `src/content.config.ts`. **Não** mova nada para `src/content/`.

**Por que `.gitkeep`:** o Git não versiona diretório vazio. Sem os `.gitkeep`, a estrutura
some no clone e o critério de conclusão da fase 0 ("`npm run build` verde em máquina limpa
a partir do README") deixa de ser reproduzível. Cada `.gitkeep` é um arquivo vazio.

**`public/robots.txt` provisório.** O SEO completo é fase 5 (RF-30), mas o arquivo faz parte
da §7.5. Crie a versão mínima abaixo — a linha do `Sitemap` usa o subdomínio provisório do
Worker (não há domínio próprio ainda; premissa A-07, Q-05 em aberto e **não bloqueia a fase 0**):

```
User-agent: *
Allow: /

Sitemap: https://haroldo-page.workers.dev/sitemap-index.xml
```

**`docs/CHANGELOG.md` — esqueleto Keep a Changelog** (§10.5), em português:

```markdown
# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado
- Fase 0: repositório, projeto Astro 5 estático, TypeScript e Tailwind 4.
```

**Idioma (§10.4):** nomes de diretório de conteúdo em português (`linhas-pesquisa`,
`publicacoes`, `disciplinas`) — assim como os campos de frontmatter, para casar com o
vocabulário do painel do professor. Diretórios de código (`components`, `layouts`, `lib`)
em inglês. **Não "corrija" essa mistura: ela é a convenção do PRD.**

**Atenção à grafia exata**, sem acento e com hífen onde indicado: `linhas-pesquisa`,
`publicacoes` (sem cedilha/acento), `projetos`, `disciplinas`, `perfil`. A fase 1 gera nomes
de arquivo por template dentro dessas pastas (RN-08).

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.
`New-Item -ItemType Directory -Force` e `New-Item -ItemType File` resolvem.

## Passos

1. Criar as cinco pastas de `content/` com um `.gitkeep` vazio em cada.
   → verify: `Get-ChildItem content -Recurse -Force` lista 5 pastas e 5 `.gitkeep`.
2. Criar `public/uploads/.gitkeep` e `public/robots.txt` com o conteúdo acima.
   → verify: `Get-Content public/robots.txt` mostra as três linhas.
3. Criar `src/components/`, `src/layouts/`, `src/pages/en/`, `src/i18n/`, `src/lib/`, cada
   uma com `.gitkeep`.
   → verify: `Get-ChildItem src -Recurse -Directory` lista as cinco, mais `pages` e `styles`.
4. Criar `tests/.gitkeep`, `scripts/.gitkeep`, `docs/adr/.gitkeep`.
   → verify: as três pastas existem.
5. Criar `docs/CHANGELOG.md` com o esqueleto acima.
   → verify: arquivo existe e começa com `# Changelog`.
6. Rodar `npm run build` para confirmar que nada quebrou.
   → verify: build verde; cole a saída na Evidência.
7. Commitar com `chore: cria estrutura de diretórios conforme §7.5 do PRD`.
   → verify: `git show --stat HEAD` lista todos os `.gitkeep`, `robots.txt` e `CHANGELOG.md`.

## Critérios de aceitação

- [x] Toda pasta da §7.5 marcada "← CRIAR" existe e é rastreada pelo Git
- [x] Nenhuma pasta marcada ⏳ foi criada
- [x] `content/` está na raiz do repositório, **não** dentro de `src/`
- [x] `npm run build` continua verde
- [x] `PRD.md`, `briefing.md` e os arquivos dos planos 001/002 inalterados

## Evidência

### git ls-files (arquivos criados)

```
content/disciplinas/.gitkeep
content/linhas-pesquisa/.gitkeep
content/perfil/.gitkeep
content/projetos/.gitkeep
content/publicacoes/.gitkeep
docs/CHANGELOG.md
docs/adr/.gitkeep
public/robots.txt
public/uploads/.gitkeep
scripts/.gitkeep
src/components/.gitkeep
src/i18n/.gitkeep
src/layouts/.gitkeep
src/lib/.gitkeep
src/pages/en/.gitkeep
tests/.gitkeep
```

### Árvore de diretórios

```
haroldo/
├── content/
│   ├── disciplinas/.gitkeep
│   ├── linhas-pesquisa/.gitkeep
│   ├── perfil/.gitkeep
│   ├── projetos/.gitkeep
│   └── publicacoes/.gitkeep
├── public/
│   ├── robots.txt
│   └── uploads/.gitkeep
├── src/
│   ├── components/.gitkeep
│   ├── i18n/.gitkeep
│   ├── layouts/.gitkeep
│   ├── lib/.gitkeep
│   ├── pages/
│   │   ├── en/.gitkeep
│   │   └── index.astro (já existe)
│   ├── styles/ (já existe)
│   └── env.d.ts (já existe)
├── docs/
│   ├── adr/.gitkeep
│   └── CHANGELOG.md
├── tests/.gitkeep
├── scripts/.gitkeep
└── [arquivos dos planos 001/002 — inalterados]
```

### git show --stat HEAD

```
commit caeee458b42a05e5056627aca5b6d26b71e1b9dd
Author: André Ferreira <and.near@hotmail.com>
Date:   Tue Sep 1 12:52:14 2026 -0300

    chore: cria estrutura de diretórios conforme §7.5 do PRD
    
    - content/: perfil, linhas-pesquisa, projetos, disciplinas, publicacoes
    - public/uploads/: para uploads do painel
    - public/robots.txt: versão provisória para subdomínio workers.dev
    - src/components/, src/layouts/, src/i18n/, src/lib/: estrutura de código
    - src/pages/en/: rotas em inglês
    - tests/: suíte Vitest
    - scripts/: utilitários
    - docs/adr/: Architecture Decision Records
    - docs/CHANGELOG.md: esqueleto Keep a Changelog (português)
    
    Todos os diretórios rastreados pelo Git via .gitkeep.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01NY5BpzMocrirtxZ4rjPP3Y

 content/disciplinas/.gitkeep     |  0
 content/linhas-pesquisa/.gitkeep |  0
 content/perfil/.gitkeep          |  0
 content/projetos/.gitkeep        |  0
 content/publicacoes/.gitkeep     |  0
 docs/CHANGELOG.md                | 10 ++++++++++
 docs/adr/.gitkeep                |  0
 public/robots.txt                |  4 ++++
 public/uploads/.gitkeep          |  0
 scripts/.gitkeep                 |  0
 src/components/.gitkeep          |  0
 src/i18n/.gitkeep                |  0
 src/layouts/.gitkeep             |  0
 src/lib/.gitkeep                 |  0
 src/pages/en/.gitkeep            |  0
 tests/.gitkeep                   |  0
 16 files changed, 14 insertions(+)
```

### npm run build (verde)

```
> haroldo-page@0.1.0 build
> astro check && astro build

12:52:40 [vite] Re-optimizing dependencies because lockfile has changed
12:52:40 [content] Syncing content
12:52:40 [content] Synced content
12:52:40 [types] Generated 224ms
12:52:40 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (4 files): 
- 0 errors
- 0 warnings
- 0 hints

12:52:44 [content] Syncing content
12:52:44 [content] Synced content
12:52:44 [types] Generated 44ms
12:52:44 [build] output: "static"
12:52:44 [build] mode: "static"
12:52:44 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:52:44 [build] Collecting build info...
12:52:44 [build] ✓ Completed in 56ms.
12:52:44 [build] Building static entrypoints...
12:52:45 [vite] ✓ built in 568ms
12:52:45 [build] ✓ Completed in 604ms.

 generating static routes 
12:52:45 ▶ src/pages/index.astro
12:52:45   └─ /index.html (+6ms) 
12:52:45 ✓ Completed in 11ms.

12:52:45 [build] 1 page(s) built in 681ms
12:52:45 [build] Complete!
```

### Correção pós-revisão

**Item 1:** `public/robots.txt` desencoraja indexação do domínio provisório

Novo conteúdo (Disallow em vez de Allow, Sitemap comentado):

```
# Provisório: enquanto o site vive no subdomínio *.workers.dev (A-07, Q-05 em aberto),
# a indexação é desencorajada. A fase 5 (RF-30) publica o robots definitivo com o sitemap.
User-agent: *
Disallow: /

# Sitemap: https://haroldo-page.workers.dev/sitemap-index.xml  (fase 5, RF-30)
```

**Item 2:** Formatação do CHANGELOG.md corrigida

Prettier --check: ✓ All matched files use Prettier code style!

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

**Item 3:** Status revertido para TODO (conforme instrução — promoção é pós-revisão)
