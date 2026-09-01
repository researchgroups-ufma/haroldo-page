# Plano 002 — Scaffolding Astro 5 estático + TypeScript strict + Tailwind 4

**Status:** TODO
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

- [ ] `npm run build` termina com sucesso e gera `dist/index.html`
- [ ] `npx astro check` sem erros de tipo
- [ ] `astro.config.mjs` declara `output: 'static'` e **não** declara `adapter` (D-01)
- [ ] `@astrojs/cloudflare` e `@astrojs/tailwind` ausentes do `package.json`
- [ ] Todas as versões em `package.json` são exatas (sem `^`/`~`)
- [ ] `package-lock.json` commitado
- [ ] `src/pages/index.astro` tem o cabeçalho obrigatório da §10.1
- [ ] `PRD.md`, `briefing.md`, `.gitignore` e `.nvmrc` inalterados

## Evidência

<Preenchido pelo executor: saída de `npm run build`, de `npx astro check`, versões
instaladas (`npm ls astro tailwindcss @tailwindcss/vite --depth=0`) e `git show --stat HEAD`.>
