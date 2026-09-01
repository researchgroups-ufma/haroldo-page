# Plano 007 — `wrangler.toml` para Cloudflare Workers Static Assets

**Status:** DONE
**RFs cobertos:** RF-27 (parcial: `not_found_handling`); Fase 0, item 5 parcial do checklist §12
**Depende de:** plano 002
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O projeto passa a ter a configuração de hospedagem versionada: um `wrangler.toml` que serve
o `dist/` como **assets estáticos puros**, sem Worker de runtime, mais o script npm de
deploy. É o artefato que o plano 012 (roteiro humano) usa para publicar o site pela
primeira vez.

## Arquivos afetados

- `wrangler.toml` — criar
- `package.json` — devDependency `wrangler` e script `deploy`
- `.gitignore` — acrescentar `.wrangler/`, se o plano 001 não tiver incluído
- `public/_headers` — criar; `X-Robots-Tag: noindex` provisório enquanto o site vive em
  `*.workers.dev` (nota do orquestrador, pendência da revisão do plano 003). A fase 5
  (RF-30) remove este arquivo junto com a reativação da linha `Sitemap` no `robots.txt`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** instale `@astrojs/cloudflare` e **não** altere `astro.config.mjs`.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 com `output: 'static'`, build em `dist/` (plano 002).

**D-01 do PRD é normativa e este plano é onde ela se materializa na infraestrutura:**

> Astro estático (`output: 'static'`), **sem adapter e sem SSR**. Alternativa rejeitada:
> Astro em modo servidor no Workers. Motivo: assets estáticos são ilimitados no plano
> gratuito e não executam código por requisição; SSR só se justificaria pelo visual editing
> (D-02, também rejeitado).

E a §7.1 reforça: *"Nenhuma rota pública executa código em requisição. O site é servido como
assets estáticos; o Worker não roda por página. Isso mantém as requisições fora da cota de
100 mil/dia do plano gratuito e elimina uma classe inteira de falhas em produção."*

**Consequência prática:** o `wrangler.toml` **não tem a chave `main`**. Um Worker de assets
estáticos sem `main` é um modo suportado do Workers Static Assets — nenhum script roda por
requisição. Se algum exemplo da internet mostrar `main = "src/index.js"` com
`[assets] binding = ...`, esse é o modo *Worker + assets*, que é **exatamente o que D-01
rejeita**. Não copie.

**Conteúdo alvo do `wrangler.toml`:**

```toml
# Configuração do Cloudflare Workers — Static Assets.
# D-01 do PRD: site 100% estático, sem `main`, sem adapter, sem SSR.
# Nenhum código executa por requisição (§7.1).

name = "haroldo-page"
compatibility_date = "2026-09-01"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

Justificativa de cada chave (registre como comentário no arquivo):

| Chave | Valor | Por quê |
|---|---|---|
| `name` | `haroldo-page` | codinome do projeto (§0 do PRD); define o subdomínio `haroldo-page.workers.dev`, já usado como `PUBLIC_SITE_URL` provisório nos planos 002 e 006 |
| `compatibility_date` | `2026-09-01` | data de criação do projeto; congela o comportamento da plataforma |
| `[assets].directory` | `./dist` | saída padrão do `astro build` |
| `[assets].not_found_handling` | `404-page` | serve `/404.html` com status 404 — é o que faz **RF-27** funcionar num site estático. O default (`none`) devolveria um 404 sem corpo, sem navegação de volta |

A página 404 em si é entregue na fase 3; aqui apenas se configura o comportamento.

**Versão do Wrangler.** Instale `wrangler` v4 (a mais recente da linha 4) como
devDependency, com **versão exata** (o `package.json` deste projeto não usa `^`/`~`, ver
plano 002). Static Assets sem `main` só existe a partir do Wrangler 3.78; a linha 4 é a
suportada hoje.

**Script npm a acrescentar:**

```json
"deploy": "npm run build && wrangler deploy"
```

**O `wrangler deploy` de verdade exige login interativo no navegador — isso é do plano 012,
NÃO deste plano.** Aqui a verificação é offline:

- `npx wrangler deploy --dry-run` valida a configuração sem publicar e, na maioria dos
  casos, sem exigir autenticação.
- Se mesmo assim ele pedir login, **não faça login**: dê como verificação alternativa
  `npx wrangler --version` (confirma a instalação) mais a inspeção manual do TOML contra a
  tabela acima, e **registre na Evidência** que o `--dry-run` exigiu autenticação.

**`.wrangler/`** é o diretório de estado local do Wrangler e não pode ser versionado. O
plano 001 deveria tê-lo posto no `.gitignore`; confirme com `git check-ignore -v .wrangler`
e acrescente a linha se faltar.

**Fora do escopo deste plano** (não faça, mesmo que pareça natural):
- criar conta ou Worker na Cloudflare → plano 012;
- conectar o Workers Builds ao repositório GitHub → **fase 2** do PRD, não fase 0;
- configurar variáveis de ambiente no painel da Cloudflare → fase 2;
- configurar domínio próprio → Q-05 em aberto, fase 5.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Instalar `wrangler` (linha 4) como devDependency, com versão exata.
   → verify: `npx wrangler --version` imprime `4.x`.
2. Criar `wrangler.toml` com o conteúdo acima, incluindo os comentários de justificativa.
   → verify: o arquivo **não** contém a chave `main` nem qualquer menção a adapter.
3. Acrescentar o script `deploy` ao `package.json`.
   → verify: `npm run` lista `deploy`.
4. Confirmar que `.wrangler/` está ignorado; acrescentar ao `.gitignore` se faltar.
   → verify: `git check-ignore -v .wrangler` retorna a regra que o ignora.
5. Rodar `npm run build` e depois `npx wrangler deploy --dry-run`.
   → verify: o dry-run reporta o diretório de assets `./dist` e nenhum erro de configuração;
   se pedir autenticação, aplique a verificação alternativa descrita no contexto e registre.
6. Rodar `npm run lint` e `npm run format:check` (o `.prettierignore` pode precisar ignorar
   `wrangler.toml`; TOML não é formatado pelo Prettier por padrão, então normalmente nada muda).
   → verify: ambos verdes.
7. Commitar com `chore: configura Cloudflare Workers Static Assets (wrangler.toml)`.
   → verify: `git show --stat HEAD` lista `wrangler.toml` e `package.json`.

## Critérios de aceitação

- [x] `wrangler.toml` existe, com `[assets].directory = "./dist"` e
      `not_found_handling = "404-page"`
- [x] `wrangler.toml` **não** declara `main` (D-01: nenhum código roda por requisição)
- [x] `@astrojs/cloudflare` continua ausente do `package.json`
- [x] `npx wrangler deploy --dry-run` sem erro de configuração (ou justificativa registrada)
- [x] `.wrangler/` ignorado pelo Git
- [x] `npm run build`, `npm run lint` e `npm run test` continuam verdes

## Evidência

Saídas reais copiadas do arquivo de triagem autoritativa (verificação independente do
`triage-runner`, nesta sessão). O `wrangler deploy --dry-run` **não exigiu autenticação** —
rodou inteiramente offline, ao contrário do cenário de contingência previsto no plano
(passo 5 / nota da seção "Contexto necessário"), então a verificação alternativa
(`wrangler --version` + inspeção manual) não precisou ser usada.

### `npx wrangler --version` — exit 0

```
4.128.0
```

### `npx wrangler deploy --dry-run` — exit 0, SEM prompt de login

```
 ⛅️ wrangler 4.128.0
────────────────────
✨ Read 7 files from the assets directory S:\Projetos\academic_page\haroldo\dist
Total Upload: 0.31 KiB / gzip: 0.22 KiB
No bindings found.
--dry-run: exiting now.
```

### `npm run test` — exit 0

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
 Test Files  2 passed (2)
      Tests  12 passed (12)
   Start at  15:59:43
   Duration  270ms
```

### `npm run lint` — exit 0

```
> eslint .
(sem saída)
```

### `npm run format:check` — exit 0

```
Checking formatting...
All matched files use Prettier code style!
```

### `npm run build` — exit 0

```
astro check: 0 errors, 0 warnings, 1 hint (depreciação em eslint.config.js:16,
pré-existente, não relacionado). astro build: 1 page built em 735ms, saída em dist/.
```

### Estado da árvore de trabalho — pré-commit

O passo 7 do plano pede `git show --stat HEAD`, mas o commit ainda não existe (é do
orquestrador, fora do escopo deste executor). O que segue é o estado da working tree no
momento da verificação:

`git status --short`:

```
 M package-lock.json
 M package.json
 M plans/007-wrangler-toml-workers-static-assets.md
?? public/_headers
?? wrangler.toml
```

`git diff --stat`:

```
 package-lock.json                                | 5677 ++++++++++++++--------
 package.json                                     |    6 +-
 plans/007-...md                                  |    3 +
 3 files changed, 3588 insertions(+), 2098 deletions(-)
```

### Verificações estruturais (sustentam D-01)

- `grep '^main\|^ *main *=' wrangler.toml` → nenhum match (exit 1). Confirma a ausência da
  chave `main` exigida por D-01.
- `grep 'astrojs/cloudflare' package.json` → nenhum match (exit 1). Adapter proibido
  ausente.
- `.wrangler/` ignorado pelo Git: `git check-ignore -v .wrangler/foo` → exit 0,
  `.gitignore:26:.wrangler/	.wrangler/foo`.
- `ls dist/_headers && cat dist/_headers` → arquivo presente, conteúdo idêntico a
  `public/_headers`. O build copia o `_headers` corretamente para `dist/`.

### Verificação do lockfile (feita pelo orquestrador)

O churn de 5677 linhas em `package-lock.json` é só a árvore de dependências própria do
wrangler (workerd, esbuild, miniflare e afins) — nenhuma versão fixada mudou: `astro`
5.18.2, `typescript` 5.9.3, `tailwindcss` 4.3.3, `vite` 6.4.3, `vitest` 4.1.11, todas
idênticas antes/depois; `overrides.vite = 6.4.3` foi preservado. Benigno.

### Lacuna empurrada corretamente para o plano 012

O header `X-Robots-Tag: noindex` de `public/_headers` só pode ser confirmado numa resposta
HTTP real (`curl -I`), o que exige um deploy publicado — isso pertence ao plano 012 (primeiro
deploy). Aqui a única verificação possível — o arquivo ser copiado para `dist/_headers` no
build — foi feita e está registrada acima.

---

## Nota do orquestrador — 2026-09-01 (pendência vinda da revisão do plano 003)

**Acrescente `public/_headers` com `X-Robots-Tag: noindex` enquanto o site viver em `*.workers.dev`.**

O plano 003 entregou um `robots.txt` com `Disallow: /` para desencorajar indexação do domínio
provisório (A-07, Q-05 em aberto). Mas `Disallow` bloqueia **rastreamento**, não garante
**não indexação**: uma URL descoberta por link externo pode ser indexada mesmo assim. A garantia
de fato é o header `X-Robots-Tag: noindex`, que em Workers Static Assets se declara em
`public/_headers`.

Acrescente o arquivo à lista de "Arquivos afetados" deste plano, com comentário explicando que
é provisório e que a **fase 5 (RF-30) é quem remove** — junto com a reativação da linha do
`Sitemap` no `robots.txt`. A verificação empírica (`curl -I` conferindo o header na resposta)
pertence ao plano 012, que faz o primeiro deploy.
