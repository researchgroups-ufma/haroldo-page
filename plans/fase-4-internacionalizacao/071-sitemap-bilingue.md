# Plano 071 — Sitemap bilíngue com `@astrojs/sitemap` (RF-30, Decisão 10)

**Status:** TODO
**RFs cobertos:** **RF-30** (sitemap bilíngue, nenhum rascunho), RF-10, RN-01; §7.2 (dependência nova); sabatina fase 4, Decisões 10 e 14; §12 fase 4, item 7 (fecha, com o 070)
**Depende de:** plano 070 (`alternateLinks`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera `sitemap-index.xml` e o sitemap com **todas** as rotas públicas dos dois idiomas, cada uma
com os pares `alternate`, **sem** as duas 404, **sem** rascunho e sem o `/admin`. A dependência nova
está fixada em versão exata e o `npm audit` do CI segue verde. O `robots.txt` **não muda**.

## Arquivos afetados

- `package.json`, `package-lock.json` — `@astrojs/sitemap` em versão exata
- `astro.config.mjs` — a integração
- `tests/dist/site-gerado.test.ts` — asserções sobre o sitemap

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`public/robots.txt` e `public/_headers` não mudam** (Decisão 10: o robots continua
> `Disallow` até a Q-05, fase 5).

## Contexto necessário

**Decisão 10** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): `@astrojs/sitemap`, com a opção
`i18n` (`pt-BR` na raiz, `en` em `/en`) para os pares `alternate`, e filtro que tira as duas 404. O
`robots.txt` continua `Disallow` até a Q-05; só então aponta o `sitemap-index.xml` (o comentário atual
de `public/robots.txt:6` já prevê). Rascunho não gera página, então fica fora sem lógica extra (RN-01,
RF-10). Custo aceito: dependência sujeita ao `npm audit` do CI (plano 032, ADR-0010: reprova em
`high`/`critical`).

**Versão:** escolha a versão mais recente de `@astrojs/sitemap` cujo `peerDependencies` aceite
`astro@7.2.10` (`package.json` fixa versões exatas, sem `^`): cole `npm view @astrojs/sitemap version
peerDependencies` e instale com `npm install --save-exact @astrojs/sitemap@<versão>`. Confira o churn
do lockfile (`git diff --stat package-lock.json`): pacotes além da integração e das dependências dela
são sinal de alerta (lição da fase 0) — reporte antes de seguir.

**`astro.config.mjs`** (51 linhas; `site` já definido, linha 46 — a integração exige). Filtro das
duas 404: pelo `pathname` de `new URL(page)`, casando `/404/` e `/en/404/` com ou sem barra.

**Decisão 14 — os pares com segmentos traduzidos** (Q-F4-2, respondida em 2026-09-24). Espera-se (não verificado no fatiamento) que a opção
`i18n` pareie URLs pelo caminho **sem** o prefixo de idioma, o que só casaria `/` com `/en/`. Por isso
o plano **mede antes de escolher**:
- **Ramo A** (a Decisão 10 ao pé da letra): configure `i18n: { defaultLocale: 'pt', locales: { pt:
  'pt-BR', en: 'en' } }`, gere o sitemap e confira os `xhtml:link` de `/sobre/` e
  `/ensino/2026-2-relatividade-geral/`. Se eles pareiam com `/en/about/` e
  `/en/teaching/2026-2-relatividade-geral/`, fique no ramo A.
- **Ramo B**, se não parearem: tire a opção `i18n` e preencha `item.links` na opção `serialize` da
  mesma integração a partir de `alternateLinks(new URL(item.url).pathname)` (070), com a origem do
  próprio `item.url`, no formato `{ url, lang }` que a integração espera (cole o tipo de
  `node_modules/@astrojs/sitemap` que define `links`). **Autorizado pela Decisão 14 sem nova
  consulta; não reabre a Decisão 10** (mesma integração, mesmo filtro, mesmas páginas).
  Registre na Evidência o sitemap do ramo A que motivou a troca.

**`astro.config.mjs` importando TypeScript:** o ramo B importa `./src/lib/routes.ts`. `routes.ts` só
tem `import type` (056, 070). Se o carregamento da configuração recusar o import `.ts`, pare e reporte
— não duplique o mapa de rotas no `.mjs`.

**Testes de `dist`** (o sitemap sai em `dist/`, então as asserções vão para `tests/dist/`): o conjunto
de `<loc>` é **igual** ao conjunto de rotas `.html` de `dist/` fora de `admin/` e das duas 404
(convertidas para URL absoluta com barra final); nenhum `<loc>` com `/404` nem `/admin`; nenhuma
disciplina rascunho (invariante, como o teste "rascunho não gera página"); todo `<loc>` com os
alternates `pt-BR` e `en` recíprocos, iguais aos `<link rel="alternate">` do `<head>` da mesma página
(070). Sem contagem exata de conteúdo (README da fase 3, decisão 6).

**Regras de código:** README da fase 4. Comentário no `astro.config.mjs` com **RF-30** e o motivo do
filtro; atualize o cabeçalho §10.1 (Dependências, Notas).

## Passos

1. Versão e instalação → verify: `npm view …` colado; `git diff package.json` e `git diff --stat package-lock.json` colados.
2. Ramo A → verify: `npm run build:pipeline` colado; `ls dist/sitemap*` e o trecho do sitemap com os `xhtml:link` de `/sobre/` e da disciplina colados; decisão de ramo registrada.
3. (Se ramo B) `serialize` com `alternateLinks` → verify: build e o mesmo trecho colados, agora com os pares traduzidos.
4. Testes de `dist` → verify: `npm run test:dist` colado.
5. Canário: tire temporariamente o filtro das 404 → o teste reprova com `/404/` no sitemap; desfaça → verify: saídas coladas.
6. `npm audit --audit-level=high` → verify: saída e `$LASTEXITCODE` (0) colados.
7. Portão → verify: `npm ci` (sem reescrever o lock), `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; `git diff --stat -- public/` vazio.

## Critérios de aceitação

- [ ] `@astrojs/sitemap` em versão exata, `peerDependencies` compatível colado, churn do lock conferido
- [ ] Sitemap com exatamente as rotas públicas dos dois idiomas; sem 404, sem `/admin`, sem rascunho (teste)
- [ ] Todo `<loc>` com os pares `pt-BR`/`en` recíprocos e iguais aos do `<head>`; ramo (A ou B) registrado com a evidência que o decidiu
- [ ] Canário do passo 5 vermelho
- [ ] `npm audit --audit-level=high` exit 0
- [ ] `robots.txt` e `_headers` intocados
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
