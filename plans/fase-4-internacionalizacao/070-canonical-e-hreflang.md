# Plano 070 — `canonical` e `hreflang` com `x-default` (RF-30)

**Status:** TODO
**RFs cobertos:** **RF-30** (canonical, `hreflang`), RN-09; sabatina fase 4, Decisões 6 e 10; §12 fase 4, item 7 (com o 071)
**Depende de:** planos 066, 067, 068 (todas as rotas EN existem)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Todo `<head>` (exceto as duas 404) traz `<link rel="canonical">` para a própria URL e três
`<link rel="alternate" hreflang>` — `pt-BR`, `en` e `x-default` apontando para a versão PT —, todos
absolutos e recíprocos entre o par PT/EN.

## Arquivos afetados

- `src/lib/routes.ts` — `alternateLinks(pathname)`
- `tests/lib/routes.test.ts` — acompanha
- `src/layouts/BaseLayout.astro` — canonical e alternates no `<head>`; prop `notFound?`
- `src/views/NotFoundView.astro` — passa `notFound` ao `BaseLayout`
- `tests/dist/site-gerado.test.ts` — canonical e alternates por rota

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Não** mexa em `robots.txt` nem em `public/_headers` (fase 5, Q-05).

## Contexto necessário

**Decisão 10** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): "O `hreflang` do `<head>` inclui
`x-default` apontando para a versão PT (RN-09, idioma canônico)." **Decisão 6:** o mapa de rotas é a
fonte do `hreflang`. **Decisão de fatiamento 9** (README da fase): as 404 não têm canonical nem
`hreflang`.

**`alternateLinks(pathname: string): { hreflang: string; path: string }[]`** em `src/lib/routes.ts`
(056): para uma rota PT ou EN, devolve `[{ hreflang: 'pt-BR', path: <PT> }, { hreflang: 'en', path:
<EN> }, { hreflang: 'x-default', path: <PT> }]`, com caminhos normalizados com barra final, usando
`localeFromPath`/`counterpartPath` e `HTML_LANG`. Rota sem par lança (herda de `counterpartPath`). Só
caminho, sem origem: `routes.ts` **não** pode importar valor de `src/lib/config.ts` (o 071 importa
`routes.ts` a partir do `astro.config.mjs`; armadilha 3 do README da fase). Testes cobrindo Home,
rota fixa, disciplina e os dois idiomas.

**`BaseLayout.astro`:** URL absoluta = `new URL(path, siteConfig.siteUrl).href` (`siteConfig.siteUrl`
vem de `PUBLIC_SITE_URL` ou do default `https://haroldo-page.and-near.workers.dev`,
`src/lib/config.ts:31-40`). O canonical usa o caminho da própria página normalizado com barra final —
o mesmo formato dos links internos (auto-trailing-slash do Worker). Prop nova `notFound?: boolean`
(ausente = `false`): com `true`, nenhum canonical nem alternate. Atualize a nota do cabeçalho
("canonical, Open Graph e `hreflang` ficam para as fases 4 e 5" → só o Open Graph fica para a fase 5).

**Testes de `dist`:** para todo `.html` fora de `admin/` e das duas 404: exatamente um canonical, igual
à URL da própria rota; exatamente três alternates com `hreflang` `pt-BR`, `en`, `x-default`; o
alternate `pt-BR` e o `x-default` iguais; **reciprocidade** — a página apontada pelo alternate `en`
existe em `dist/` e aponta de volta para esta no seu alternate `pt-BR`. Nas duas 404: zero canonical,
zero alternate. A origem esperada no teste sai do mesmo default (`siteConfig.siteUrl` — o teste roda
em Node sem `PUBLIC_SITE_URL`; se o CI definir a variável, compare pela **origem lida do canonical da
Home**, não por literal).

**Regras de código:** README da fase 4. Cite **RF-30** e **RN-09** (x-default no PT).

## Passos

1. `alternateLinks` e testes → verify: `npm test -- --reporter=verbose tests/lib/routes.test.ts` colado.
2. `BaseLayout` e `NotFoundView` → verify: `npx astro check` colado.
3. Build → verify: `npm run build:pipeline` colado; `grep -o '<link rel="\(canonical\|alternate\)"[^>]*>' dist/sobre/index.html dist/en/teaching/2026-2-relatividade-geral/index.html dist/404.html dist/en/404.html` colado.
4. Testes de `dist` → verify: `npm run test:dist` colado.
5. Canário: troque temporariamente o `x-default` para o caminho EN → o teste de `dist` reprova; desfaça → verify: saídas coladas.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `alternateLinks` testado nas rotas fixas, na disciplina e nos dois idiomas
- [ ] Toda página (fora as 404) com um canonical para si e os três alternates absolutos, recíprocos, `x-default` = PT
- [ ] As duas 404 sem canonical e sem alternate
- [ ] `robots.txt` e `_headers` intocados (`git diff --stat` colado)
- [ ] Canário do passo 5 vermelho
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
