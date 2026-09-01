# Plano 002 — Scaffolding Astro 5 estático + TypeScript strict + Tailwind 4

**Status:** DONE
**RFs cobertos:** — (Fase 0, item 2 do checklist §12; D-01, RNF-02, RNF-12)
**Depende de:** plano 001
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O projeto passa a ter um app Astro 5 funcional, em modo **estático**, com TypeScript em
modo `strict` e Tailwind 4 ativo, com todas as versões de dependência fixadas de forma
exata. `npm run build` gera `dist/` com uma página placeholder estilizada por Tailwind.

## Arquivos afetados

- `package.json` — criar (dependências com versão exata, scripts `dev`/`build`/`preview`)
- `package-lock.json` — gerado pelo npm; **deve ser commitado**
- `astro.config.mjs` — criar (`output: 'static'`, `site`, plugin Vite do Tailwind)
- `tsconfig.json` — criar (`extends: astro/tsconfigs/strict`)
- `src/pages/index.astro` — página placeholder mínima
- `src/styles/global.css` — `@import "tailwindcss";`
- `src/env.d.ts` — referência de tipos do Astro (se o scaffold não gerar)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Nunca** apague, mova ou edite `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md`, `lattes.pdf`,
> `.firecrawl/`, `plans/` ou os arquivos criados pelo plano 001.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(Departamento de Física, UFMA). Site de publicação, não aplicação: HTML estático, sem
framework de UI no navegador.

**Stack fixada pelo PRD §7.2 — não substitua nenhuma peça:**

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Astro | 5.x (fixar exata agora) |
| Linguagem | TypeScript | 5.x, `strict: true` |
| Estilos | Tailwind CSS | 4.x |

**D-01 é normativa e inegociável:** `output: 'static'`, **sem adapter e sem SSR**.
**Não instale `@astrojs/cloudflare`.** O PRD (Apêndice A) registra explicitamente que esse
adapter existe e **não é usado**. Motivo: assets estáticos são ilimitados no plano gratuito
da Cloudflare e não executam código por requisição (§7.1, RNF-03). Se algum tutorial mandar
adicionar adapter, ignore.

**D-02:** sem visual editing do TinaCMS (ele exigiria `output: 'server'`). Nada de ilhas
Tina por página. O painel do Tina entra na fase 1 — **este plano não instala TinaCMS**.

**Tailwind 4 com Astro 5 não usa integração `@astrojs/tailwind` e não tem
`tailwind.config.js`.** O caminho correto, em Astro ≥ 5.2, é o plugin Vite:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL ?? 'https://haroldo-page.workers.dev',
  vite: { plugins: [tailwindcss()] },
});
```

e `src/styles/global.css` contendo apenas:

```css
@import "tailwindcss";
```

importado no `.astro` (`import '../styles/global.css';` no frontmatter). Se `npx astro add
tailwind` fizer exatamente isso, tudo bem usá-lo; se ele tentar instalar
`@astrojs/tailwind` (caminho da v3), **não use** e configure à mão.

**Valor de `site`.** Ainda não há domínio próprio (premissa A-07; Q-05 em aberto, bloqueia
só a fase 5). Use o subdomínio `https://haroldo-page.workers.dev` como default, sobrescrito
por `PUBLIC_SITE_URL`. O plano 012 confirma a URL real do Worker e o plano 006 documenta a
variável. `site` é obrigatório para canonical/sitemap depois (RF-30) — não deixe ausente.

**Scaffolding não interativo.** O wizard `npm create astro@latest` é interativo e o
diretório **não está vazio** (contém `PRD.md`, `plans/`, `.git`). Duas opções aceitáveis:

- `npm create astro@latest . -- --template minimal --install --no-git --typescript strict --skip-houston`
  (o `--no-git` é essencial: o repositório já existe e foi criado pelo plano 001), **ou**
- montar `package.json` à mão e rodar `npm install astro@<versão> typescript @tailwindcss/vite tailwindcss`.

Se o scaffold criar `README.md`, `.gitignore` ou `public/favicon.svg`, **restaure/preserve os
arquivos do plano 001** — o `.gitignore` do plano 001 vence, e o `README.md` é entregue pelo
plano 009 (apague um README de template se ele aparecer, ou reporte).

**"Versões fixadas" (checklist §12 da fase 0) significa versão exata**, sem `^` nem `~`, em
todas as entradas de `dependencies` e `devDependencies` do `package.json`. Depois de editar
os ranges, rode `npm install` de novo para sincronizar o `package-lock.json`.

**§10 do PRD é normativa.** Todo arquivo `.ts` e `.astro` começa com o cabeçalho abaixo
(adapte o comentário para `---` do frontmatter Astro quando for `.astro`):

```ts
/**
 * ============================================================================
 *  Arquivo      : index.astro
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : <uma ou duas linhas>
 *  Autor        : Desenvolvedor
 *  Criado em    : AAAA-MM-DD
 *  Atualizado em: AAAA-MM-DD
 *  Versão       : 0.1.0
 *
 *  Dependências : <...>
 *  Entradas     : <...>
 *  Saídas       : <...>
 *  Uso          : <...>
 *
 *  Notas        : <...>
 * ============================================================================
 */
```

Regras adicionais da §10.4: **código e identificadores em inglês; textos visíveis em
português**; `any` proibido; sem string de interface hardcoded em componente definitivo
(a página deste plano é placeholder temporário — deixe um `// TODO(fase 3):` explícito).

**Ambiente.** Windows 11 / PowerShell. Rode os comandos npm no PowerShell a partir de
`S:\Projetos\academic_page\haroldo`.

## Passos

1. Fazer o scaffolding do Astro no diretório atual, sem inicializar Git, com template
   mínimo e TypeScript strict.
   → verify: `package.json`, `astro.config.mjs`, `tsconfig.json` e `src/pages/index.astro`
   existem; `git status` mostra `.gitignore` e `.nvmrc` do plano 001 intactos.
2. Instalar Tailwind 4 (`tailwindcss` + `@tailwindcss/vite`) e ligar o plugin no
   `astro.config.mjs`; criar `src/styles/global.css` com `@import "tailwindcss";`.
   → verify: não existe `tailwind.config.js` nem dependência `@astrojs/tailwind`
   (`npm ls @astrojs/tailwind` não deve encontrar nada).
3. Ajustar `astro.config.mjs` para `output: 'static'` e `site` conforme o snippet acima.
   → verify: `Select-String -Path astro.config.mjs -Pattern "output|site|tailwindcss"` mostra
   as três linhas; nenhuma menção a `adapter`.
4. Garantir `tsconfig.json` com `"extends": "astro/tsconfigs/strict"`.
   → verify: `npx astro check` roda sem erro de tipo (avisos de conteúdo ainda inexistente
   são aceitáveis; erros de tipo, não).
5. Substituir `src/pages/index.astro` por uma página placeholder com o cabeçalho da §10,
   `lang="pt-BR"` no `<html>`, um `<h1>` com o nome do professor e uma ou duas classes
   Tailwind visíveis (ex.: `text-3xl font-semibold`), importando `global.css`.
   → verify: `npm run dev` sobe e a página renderiza estilizada em `http://localhost:4321`.
6. Fixar todas as versões em `package.json` (remover `^`/`~`) e rodar `npm install` para
   sincronizar o lock.
   → verify: `Select-String -Path package.json -Pattern "[\^~]"` não retorna nada dentro dos
   blocos de dependências.
7. Rodar `npm run build`.
   → verify: `dist/index.html` existe e contém o `<h1>`; cole a saída do build na Evidência.
8. Commitar com `chore: inicializa projeto Astro 5 estático com TypeScript e Tailwind 4`,
   **incluindo `package-lock.json`**.
   → verify: `git show --stat HEAD` lista `package-lock.json`.

## Critérios de aceitação

- [x] `npm run build` termina com sucesso e gera `dist/index.html`
- [x] `npx astro check` sem erros de tipo
- [x] `astro.config.mjs` declara `output: 'static'` e **não** declara `adapter` (D-01)
- [x] `@astrojs/cloudflare` e `@astrojs/tailwind` ausentes do `package.json`
- [x] Todas as versões em `package.json` são exatas (sem `^`/`~`)
- [x] `package-lock.json` commitado
- [x] `src/pages/index.astro` tem o cabeçalho obrigatório da §10.1
- [x] `PRD.md`, `briefing.md`, `.gitignore` e `.nvmrc` inalterados

## Evidência

### Divergência registrada em relação ao plano

O scaffold `npm create astro@latest . -- --template minimal --install --no-git
--typescript strict --skip-houston` **não funcionou de forma não interativa**: como o
diretório não está vazio (`PRD.md`, `plans/`, `.git` etc.), o wizard do `create-astro`
ignora os flags de destino e pergunta interativamente "Where should we create your new
project?" (sugerindo um diretório novo, ex. `./stale-spiral78`). Sem stdin disponível no
ambiente de execução, o comando trava. Conforme a opção B prevista no próprio plano
("montar `package.json` à mão e rodar `npm install astro@<versão> typescript
@tailwindcss/vite tailwindcss`"), abandonei o wizard e configurei os arquivos manualmente:
`package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`,
`src/styles/global.css`, `src/env.d.ts`. Nenhum arquivo de scaffold indesejado
(`README.md`, `.gitignore` de template, `public/favicon.svg`) chegou a ser criado, então
não houve necessidade de restaurar nada do plano 001.

Duas dependências adicionais, não listadas em "Arquivos afetados" mas necessárias para os
critérios de aceitação, foram adicionadas a `package.json` (versões exatas):

- `@astrojs/check@0.9.10` (`devDependencies`) — exigida pelo próprio `astro check`
  (chamado pelo script `build`); sem ela, `astro check`/`npm run build` também caem num
  prompt interativo pedindo para instalá-la.
- `@types/node@24.13.3` (`devDependencies`) — sem ela, `astro.config.mjs` falhava em
  `astro check` com `ts(2580): Cannot find name 'process'` na linha `process.env.PUBLIC_SITE_URL`
  (snippet exigido pelo próprio plano). Versão alinhada ao Node 24 do `.nvmrc`.

Também foi necessário um campo `"overrides": { "vite": "6.4.3" }` em `package.json`:
instalando `astro@5.18.2` e `@tailwindcss/vite@4.3.3` (ambos as versões `5.x`/`4.x` mais
recentes disponíveis, conforme pedido) o npm resolvia dois `vite` diferentes na árvore —
`vite@8.2.2` hoisted na raiz (satisfazendo o range amplo do `@tailwindcss/vite`) e
`vite@6.4.3` aninhado dentro de `astro` (que exige `^6.4.1`) — e o tipo `Plugin<any>` de
um não era atribuível ao do outro, quebrando `astro check` (`ts(2322)`). O override fixa
um único `vite@6.4.3` (compatível com o range `^5.2.0 || ^6 || ^7 || ^8` do
`@tailwindcss/vite`) em toda a árvore, sem contornar nem enfraquecer a checagem de tipos.

Nenhuma outra divergência: `output: 'static'` sem `adapter`, plugin Vite do Tailwind (não
a integração `@astrojs/tailwind`), sem `tailwind.config.js`, sem TinaCMS.

### `npm run build`

```
> haroldo-page@0.1.0 build
> astro check && astro build

12:38:42 [vite] Re-optimizing dependencies because vite config has changed
12:38:42 [content] Syncing content
12:38:42 [content] Synced content
12:38:42 [types] Generated 141ms
12:38:42 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (4 files):
- 0 errors
- 0 warnings
- 0 hints

12:38:46 [content] Syncing content
12:38:46 [content] Synced content
12:38:46 [types] Generated 37ms
12:38:46 [build] output: "static"
12:38:46 [build] mode: "static"
12:38:46 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:38:46 [build] Collecting build info...
12:38:46 [build] ✓ Completed in 47ms.
12:38:46 [build] Building static entrypoints...
12:38:46 [vite] ✓ built in 497ms
12:38:46 [build] ✓ Completed in 526ms.

 generating static routes
12:38:46 ▶ src/pages/index.astro
12:38:46   └─ /index.html (+5ms)
12:38:46 ✓ Completed in 12ms.

12:38:46 [build] 1 page(s) built in 594ms
12:38:46 [build] Complete!
```

`dist/index.html` gerado contém:
`<h1 class="text-3xl font-semibold">Prof. Haroldo C. D. Lima Junior</h1>` — confirmado por
leitura direta do arquivo.

### `npx astro check`

```
12:38:53 [content] Syncing content
12:38:53 [content] Synced content
12:38:53 [types] Generated 49ms
12:38:53 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (4 files):
- 0 errors
- 0 warnings
- 0 hints
```

### `npm ls astro tailwindcss @tailwindcss/vite --depth=0`

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tailwindcss/vite@4.3.3
+-- astro@5.18.2
`-- tailwindcss@4.3.3
```

TypeScript instalado: `typescript@5.9.3` (confirmado via
`npm ls astro typescript tailwindcss @tailwindcss/vite --depth=0`).

### Verificação adicional — pacotes proibidos ausentes

```
> npm ls @astrojs/tailwind
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- (empty)

> npm ls @astrojs/cloudflare
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- (empty)

> Test-Path tailwind.config.js
False
```

### `npm run dev` (verificação não bloqueante do passo 5)

Servidor subido em background, checado com `curl http://localhost:4321/` e derrubado em
seguida (processo na porta 4321 finalizado, porta confirmada livre). Resposta HTML
recebida continha `<h1 class="text-3xl font-semibold">Prof. Haroldo C. D. Lima Junior</h1>`
e o CSS do Tailwind (`tailwindcss v4.3.3`) injetado inline pelo Vite dev server — a
renderização estilizada foi confirmada sem deixar o servidor em execução.

### `git show --stat HEAD`

```
commit 35edfeacd04e690022378692d9f563b0edd3ac1c
Author: André Ferreira <and.near@hotmail.com>
Date:   Tue Sep 1 12:38:28 2026 -0300

    chore: inicializa projeto Astro 5 estático com TypeScript e Tailwind 4

 astro.config.mjs      |   32 +
 package-lock.json     | 7095 +++++++++++++++++++++++++++++++++++++++++++++++++
 package.json          |   26 +
 src/env.d.ts          |    1 +
 src/pages/index.astro |   38 +
 src/styles/global.css |    1 +
 tsconfig.json         |    5 +
 7 files changed, 7198 insertions(+)
```

`plans/001-repositorio-git-local-e-gitignore.md` foi deixado **fora** deste commit
(modificação pendente pré-existente, não tocada por este plano).

---

## Correção pós-revisão (code-reviewer, item único)

**Item apontado:** `src/env.d.ts` continha apenas a diretiva
`/// <reference types="astro/client" />`, sem o cabeçalho obrigatório da §10.1 do PRD.
Corrigido: cabeçalho completo (12 campos) inserido **acima** da diretiva triple-slash —
única posição válida em TypeScript, já que a diretiva só é reconhecida quando precedida
apenas por comentários.

**Confirmação empírica de que a diretiva continua em efeito** (cache `.astro/` e `dist/`
apagados antes, para forçar regeneração):

### `npx astro check` (pós-correção)

```
12:45:35 [content] Syncing content
12:45:36 [content] Synced content
12:45:36 [types] Generated 55ms
12:45:36 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (4 files):
- 0 errors
- 0 warnings
- 0 hints
```

### `npm run build` (pós-correção)

```
> haroldo-page@0.1.0 build
> astro check && astro build

12:45:40 [content] Syncing content
12:45:40 [content] Synced content
12:45:40 [types] Generated 47ms
12:45:40 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (4 files):
- 0 errors
- 0 warnings
- 0 hints

12:45:43 [content] Syncing content
12:45:43 [content] Synced content
12:45:43 [types] Generated 43ms
12:45:43 [build] output: "static"
12:45:43 [build] mode: "static"
12:45:43 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:45:43 [build] Collecting build info...
12:45:43 [build] ✓ Completed in 62ms.
12:45:43 [build] Building static entrypoints...
12:45:44 [vite] ✓ built in 609ms
12:45:44 [build] ✓ Completed in 648ms.

 generating static routes
12:45:44 ▶ src/pages/index.astro
12:45:44   └─ /index.html (+6ms)
12:45:44 ✓ Completed in 12ms.

12:45:44 [build] 1 page(s) built in 733ms
12:45:44 [build] Complete!
```

0 erros em ambos, cache regenerado do zero — a diretiva `/// <reference types="astro/client" />`
segue efetiva com o cabeçalho acima dela.
