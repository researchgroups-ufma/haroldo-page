# Plano 006 — `.env.example` documentado e `src/lib/config.ts`

**Status:** DONE
**RFs cobertos:** — (Fase 0, item 7 do checklist §12; §7.6, RNF-07, §10.4)
**Depende de:** plano 003
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

As quatro variáveis de ambiente do projeto passam a estar documentadas em `.env.example`, e
os valores de configuração do site (título, URL canônica, idiomas, dados institucionais)
passam a viver num único módulo tipado `src/lib/config.ts` — em vez de espalhados pelos
componentes, o que a §7.6 e a §10.4 proíbem.

## Arquivos afetados

- `.env.example` — criar
- `src/lib/config.ts` — criar
- `tests/lib/config.test.ts` — criar (garante que a configuração é coerente)
- `astro.config.mjs` — alterar (autorizado pela pendência P-2: troca de `process.env` por
  `loadEnv` do Vite, para que `PUBLIC_SITE_URL` seja lido do `.env` de fato)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Jamais** crie, edite ou commite um `.env` real. Se um `.env` já existir no disco, não o
> abra e não o cite em lugar nenhum.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático, TypeScript strict, Tailwind 4. Planos 001–005 já entregaram
repositório, scaffolding, estrutura de diretórios, lint e Vitest.

**§7.6 do PRD, transcrita (é a especificação deste plano):**

> - **Variáveis de ambiente** (documentadas em `.env.example`): `TINA_CLIENT_ID` (público),
>   `TINA_TOKEN` (token de leitura do TinaCloud), `TINA_BRANCH`, `PUBLIC_SITE_URL`.
> - `TINA_TOKEN` vive exclusivamente em variável de ambiente — no `.env` local (fora do
>   versionamento) e nas variáveis do Cloudflare Workers Builds e do GitHub Actions. Nunca em
>   arquivo commitado.
> - Valores de configuração do site (título, idiomas, rótulos de navegação, URL canônica)
>   ficam em `src/lib/config.ts` e nos dicionários de `src/i18n/` — nunca espalhados pelos
>   componentes.
> - Nenhum segredo é necessário no navegador: o site público é estático e não faz chamada
>   autenticada.

**Origem dos valores de cada variável** (o executor não precisa provisionar nada — os
valores reais saem dos planos 011 e 012, que são roteiros humanos):

| Variável | De onde vem o valor real | Vai no bundle do navegador? |
|---|---|---|
| `TINA_CLIENT_ID` | painel do TinaCloud, ao criar o projeto (plano 011) | é público, mas **não** prefixe com `PUBLIC_` — quem o injeta é o build do Tina, na fase 1 |
| `TINA_TOKEN` | TinaCloud → token de leitura (plano 011) | **NUNCA.** É segredo |
| `TINA_BRANCH` | nome da branch principal do repositório: `main` | não |
| `PUBLIC_SITE_URL` | URL do Worker, confirmada no plano 012 | sim — o prefixo `PUBLIC_` do Astro expõe ao cliente |

**Armadilha do Astro que precisa estar clara no `.env.example`:** no Astro, **apenas**
variáveis com prefixo `PUBLIC_` chegam ao navegador; todas as outras ficam restritas ao
build. Portanto **nunca** renomeie `TINA_TOKEN` para `PUBLIC_TINA_TOKEN` — isso vazaria o
segredo no HTML gerado (violaria RNF-07 e a §9).

**Valor provisório de `PUBLIC_SITE_URL`:** `https://haroldo-page.workers.dev`. Não há domínio
próprio (premissa A-07; Q-05 em aberto, bloqueia a fase 5 e **não** a fase 0). O plano 002
já usou esse mesmo default em `astro.config.mjs` — os dois devem continuar coerentes.

**Dados institucionais fechados (Apêndice C do PRD, extraídos do Lattes, Q-01 resolvida em
2026-09-01)** — use exatamente estes, e nada além:

| Campo | Valor |
|---|---|
| Nome | Haroldo Cilas Duarte Lima Junior |
| Nome em citações | LIMA JUNIOR, HAROLDO C. D. |
| Cargo | Professor Adjunto A |
| Instituição | Universidade Federal do Maranhão (UFMA), Campus São Luís |
| Unidade | Centro Tecnológico — Departamento de Física |

**Fronteira importante:** esses dados aparecem em `config.ts` apenas como **metadados do
site** (título das páginas, autor do Open Graph, JSON-LD futuro). Os mesmos dados como
**conteúdo** (biografia, formação, links do Lattes/ORCID) são da coleção `perfil`, editável
pelo professor, e entram na **fase 1** — não os duplique aqui. Regra prática: se o professor
deve poder mudar pelo painel, **não** vai em `config.ts`.

**Não coloque e-mail em `config.ts`.** A Q-07 (o e-mail exibido publicamente é
institucional?) está **em aberto** e bloqueia a fase 3. O e-mail é campo obrigatório da
coleção `perfil` (§7.3) e entra pelo painel, com a restrição de LGPD da §9 (institucional,
nunca pessoal).

**Idiomas.** Português é o idioma canônico, na raiz; inglês em `/en` (D-03, RN-09). A
configuração de i18n completa — dicionários, fallback por campo, roteamento — é **fase 4**.
Aqui, apenas a lista de locales e o locale padrão, para que `astro.config.mjs` e os
dicionários futuros bebam da mesma fonte:
`locales: ['pt', 'en'] as const`, `defaultLocale: 'pt'`.

**§10 do PRD é normativa** para `src/lib/config.ts`:
- cabeçalho de arquivo obrigatório (bloco da §10.1, o mesmo já usado em `src/lib/slug.ts`);
- TSDoc em tudo que for exportado;
- **`any` proibido**; use `as const` e tipos derivados (`export type Locale = (typeof
  siteConfig.locales)[number];`);
- código e identificadores **em inglês**; os *valores* de texto ficam em português.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Criar `.env.example` com as quatro variáveis, cada uma precedida de um comentário de uma
   linha em português dizendo o que é, de onde vem o valor e se é segredo. Incluir aviso no
   topo: "copie para `.env` e preencha; o `.env` está no `.gitignore` e nunca deve ser
   commitado (§7.6)". Deixe `TINA_CLIENT_ID` e `TINA_TOKEN` com valor vazio,
   `TINA_BRANCH=main` e `PUBLIC_SITE_URL=https://haroldo-page.workers.dev`.
   → verify: `Get-Content .env.example` mostra as 4 variáveis; `git check-ignore -v .env`
   confirma que o `.env` real seguiria ignorado.
2. Criar `src/lib/config.ts` exportando um `siteConfig` `as const` com, no mínimo:
   `siteUrl` (lendo `import.meta.env.PUBLIC_SITE_URL` com fallback para o valor provisório),
   `title`, `shortTitle`, `description`, `author` (nome + nome em citações), `institution`,
   `department`, `role`, `locales`, `defaultLocale`. Mais o tipo `Locale` derivado.
   → verify: `npx astro check` sem erro de tipo.
3. Criar `tests/lib/config.test.ts` verificando: (a) `siteUrl` é uma URL absoluta válida e
   **sem barra final** (`new URL(siteConfig.siteUrl)` não lança; não termina em `/`);
   (b) `defaultLocale` está contido em `locales`; (c) `locales` é exatamente `['pt', 'en']`;
   (d) `author.name` é `'Haroldo Cilas Duarte Lima Junior'`.
   → verify: `npm run test` verde, com os testes novos somando aos de `slug`.
4. Rodar `npm run lint`, `npm run format:check` e `npm run build`.
   → verify: os três verdes.
5. Commitar com `feat: adiciona .env.example e configuração central do site`.
   → verify: `git show --stat HEAD` lista `.env.example`, `src/lib/config.ts` e o teste —
   **e nenhum arquivo `.env`**.

## Critérios de aceitação

- [x] `.env.example` documenta `TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH`, `PUBLIC_SITE_URL`
- [x] Nenhuma variável de segredo recebeu prefixo `PUBLIC_`
- [x] Nenhum `.env` real foi criado nem commitado (`git show --stat HEAD` comprova)
- [x] `src/lib/config.ts` sem `any`, com cabeçalho §10.1 e TSDoc
- [x] `tests/lib/config.test.ts` passa com as quatro asserções descritas
- [x] `config.ts` **não** contém e-mail (Q-07 em aberto) nem dados que o professor deva
      editar pelo painel
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

Saída autoritativa do triage-runner, ciclo 2 (pós-correções), copiada de
`triage-006-ciclo2.md`. O commit (passo 5) ainda não existe neste momento — por isso os
comandos abaixo mostram o estado da árvore de trabalho pré-commit (`git status --short` /
`git diff --stat`) em vez de `git show --stat HEAD`, que só terá sentido depois que o
orquestrador commitar.

### `npm run test`

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
 Test Files  2 passed (2)
      Tests  12 passed (12)
   Start at  15:49:39
   Duration  239ms
```

### `npm run test:coverage`

```
 Test Files  2 passed (2)
      Tests  12 passed (12)
=============================== Coverage summary ===============================
Statements   : 100% ( 3/3 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 3/3 )
```

### `npm run lint`

```
> eslint .
(sem saída)
```

### `npm run format:check`

```
Checking formatting...
All matched files use Prettier code style!
```

### `npm run build`

```
[check] Getting diagnostics for Astro files...
Result (10 files):
- 0 errors
- 0 warnings
- 1 hint
[build] output: "static"
[vite] ✓ built in 495ms
1 page(s) built in 601ms
[build] Complete!
```
(1 hint = `tseslint.config` deprecated em `eslint.config.js`, pré-existente, não relacionado a este plano.)

### `git status --short` (árvore de trabalho, pré-commit)

```
 M astro.config.mjs
 M plans/006-env-example-e-config-do-site.md
?? .env.example
?? src/lib/config.ts
?? tests/lib/config.test.ts
```

### `git diff --stat` (árvore de trabalho, pré-commit)

```
 astro.config.mjs                          | 20 ++++++++++++++++----
 plans/006-env-example-e-config-do-site.md |  4 +++-
 2 files changed, 19 insertions(+), 5 deletions(-)
```

## Pendência P-2 — verificação empírica (do executor)

Verificação feita durante a implementação, antes da revisão do ciclo 1, com um `.env`
temporário contendo apenas `PUBLIC_SITE_URL=https://teste-p2.example.com` (apagado ao final de
cada rodada; confirmado com `ls -a | grep -i env` → só `.env.example` restava).

**Bug reproduzido** — `astro.config.mjs` original lia `process.env.PUBLIC_SITE_URL`
diretamente; com o `.env` presente, `npm run build` mostrou:

```
DEBUG_P2_PROCESS_ENV= undefined
```

Ou seja, o valor do `.env` era ignorado silenciosamente — o risco descrito na nota do
orquestrador é real.

**Fix validado** — trocado `process.env` por `loadEnv` do Vite (terceiro argumento `''` nesta
primeira rodada); com o mesmo `.env` presente:

```
DEBUG_P2_LOADENV= https://teste-p2.example.com
```

**Revalidação após apertar o prefixo** (correção 4 do ciclo 2, terceiro argumento trocado de
`''` para `'PUBLIC_'`); com o mesmo `.env` presente:

```
DEBUG_P2_LOADENV_PREFIXED= https://teste-p2.example.com
```

**Fallback sem `.env`** — confirmado nas duas rodadas: com nenhum `.env` no disco, `npm run
build` roda limpo (`0 errors`, build completo) e `site` cai no default
`https://haroldo-page.workers.dev`.

**Decisão tomada:** opção B da nota do orquestrador — trocar `process.env` por `loadEnv`, em
vez de apenas documentar. Justificativa: `loadEnv` é o padrão oficialmente documentado pelo
Astro para ler `.env` dentro de `astro.config.mjs` e corrige o bug de fato (em vez de só
avisar sobre ele), sem alterar o comportamento em produção — `loadEnv` não sobrescreve
variáveis já presentes em `process.env`, então o Cloudflare Workers Builds/GitHub Actions
continuam tendo prioridade.

## Falsificabilidade do teste `process.env` — verificação independente (triage-runner)

O triage-runner injetou `export const __canary = process.env.CANARY_TEST;` no fim de
`src/lib/config.ts` para provar que o teste novo (`tests/lib/config.test.ts`, describe "regra:
código sob src/ nunca lê process.env") é real, não decorativo:

```
❯ tests/lib/config.test.ts (5 tests | 1 failed) 18ms
    × nenhum arquivo .ts em src/ usa process.env fora de comentários
FAIL  tests/lib/config.test.ts > regra: código sob src/ nunca lê process.env
AssertionError: expected [ 'src\lib\config.ts' ] to deeply equal []
- Expected: []
+ Received: ["src\lib\config.ts"]
 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 11 passed (12)
EXIT 1 — falhou como esperado.
```

Após restauração (diff contra backup: IDENTICAL; `grep '__canary'`: nenhum match):

```
 Test Files  2 passed (2)
      Tests  12 passed (12)
EXIT 0 — passou, mesma contagem de 12.
```

## Pendências não bloqueantes (para planos futuros)

(a) `vite` é importado em `astro.config.mjs` (`loadEnv`) mas não está declarado em
`package.json` — hoje só existe como transitiva de `astro`/`@tailwindcss/vite`;
`package.json` estava fora do escopo deste plano.

(b) o `stripComments` do teste usa `/\/\/.*$/gm`, que também apaga o que vier depois de um
`//` dentro de uma string na mesma linha — falso negativo possível, improvável na prática
porque o Prettier mantém uma declaração por linha.

(c) o teste varre só `.ts` sob `src/`; um `process.env` dentro de `<script>` de um arquivo
`.astro` passaria batido. Não há nenhum hoje (`src/pages/index.astro` conferido), mas a regra
documentada no cabeçalho de `config.ts` é mais ampla que o teste.

---

## Nota do orquestrador — 2026-09-01 (pendência P-2, vinda da revisão do plano 002)

**Verifique empiricamente antes de documentar `PUBLIC_SITE_URL` como variável de `.env`.**

O `astro.config.mjs` criado pelo plano 002 lê `process.env.PUBLIC_SITE_URL`. O arquivo de
configuração do Astro é carregado **antes** de o `.env` ser aplicado ao processo — o caminho
suportado para ler `.env` ali é o `loadEnv` do Vite. Ou seja, há risco concreto de alguém pôr
`PUBLIC_SITE_URL` no `.env` local, buildar, e o `site` continuar no default sem nenhum aviso.

**O que fazer:** defina `PUBLIC_SITE_URL` no `.env`, rode `npm run build` e inspecione o
canonical/`site` no `dist/`. Conforme o resultado:

- se **não** for lido do `.env`: documente isso explicitamente no `.env.example`
  ("esta variável vem do ambiente real — shell, GitHub Actions, Cloudflare — não do `.env`"); **ou**
- troque `process.env` por `loadEnv` no `astro.config.mjs` (acrescente o arquivo à lista de
  "Arquivos afetados" ao fazê-lo).

Cole a evidência da verificação na seção `## Evidência` deste plano, seja qual for o resultado.

### Acréscimo — 2026-09-01 (vindo da revisão do plano 004)

**Fixe por escrito, e por teste, que código sob `src/` lê ambiente por `import.meta.env`, nunca
por `process.env`.**

O revisor do plano 004 encontrou um buraco de detecção: um `process.env` escrito em
`src/lib/*.ts` **não seria pego por ninguém** — o ESLint desliga `no-undef` em arquivos `.ts`
(via `typescript-eslint/eslint-recommended`) e o TypeScript aceita, porque `@types/node` está
instalado desde o plano 002. O erro só apareceria no navegador, em produção.

Como este plano é o dono de `src/lib/config.ts`, é aqui que a regra se estabelece. `astro.config.mjs`
segue sendo exceção legítima (roda em Node, no build) — o que reforça a pendência P-2 acima
sobre verificar de onde aquele arquivo realmente lê `PUBLIC_SITE_URL`.
