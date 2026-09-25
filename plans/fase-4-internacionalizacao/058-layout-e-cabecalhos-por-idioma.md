# Plano 058 — Layout e cabeçalhos escolhem o dicionário pelo caminho

**Status:** TODO
**RFs cobertos:** §8.3 (`lang` no elemento raiz de cada árvore de idioma), §10.4, M-07 (meta description fora do dicionário)
**Depende de:** planos 056 (`localeFromPath`, `routePath`, `HTML_LANG`, `navItems`), 057 (`strings`, `site.description`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`BaseLayout`, `SiteHeader` e `PageHeader` deixam de importar `pt` e passam a usar o dicionário do
idioma do caminho: `<html lang>`, `<title>`, meta description, "Pular para o conteúdo", menu, rótulo
da navegação e o link do nome para a Home do idioma. O `PageHeader` aceita `lang` no título e na
linha de meta (para o conteúdo em fallback das rotas EN). As páginas PT continuam **idênticas**.

## Arquivos afetados

- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/components/PageHeader.astro` — props opcionais `titleLang` e `metaLang`
- `src/lib/config.ts` — sai `description` do `siteConfig` (a meta description passa a vir de `t.site.description`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. O seletor de idioma **não** entra aqui (069): o comentário
> `<!-- fase 4: seletor de idioma (RF-29) -->` do `SiteHeader` fica onde está.

## Contexto necessário

**Decisão de fatiamento 2** (README da fase): os componentes compartilhados derivam o idioma de
`localeFromPath(Astro.url.pathname)` (056) — não recebem prop. Padrão em cada um:

```astro
import { strings } from '../i18n';
import { localeFromPath } from '../lib/routes';
const lang = localeFromPath(Astro.url.pathname);
const t = strings(lang);
```

**`BaseLayout.astro`** (123 linhas; ler inteiro): hoje `<html lang="pt-BR">` fixo (linha 57),
`pt.site.pageTitle` (54), `pt.site.skipToContent` (78) e `description = siteConfig.description` (50).
Troque por `HTML_LANG[lang]`, `t.site.pageTitle`, `t.site.skipToContent` e `description =
t.site.description`. Atualize a docstring da prop `description` ("Ausente: usa `t.site.description`").
A nota do cabeçalho "canonical, Open Graph e `hreflang` ficam para as fases 4 e 5" continua verdade
até o 070 — não mexa nela.

**`SiteHeader.astro`** (142 linhas): `pt.site.menu`, `pt.site.mainNavLabel`, `pt.nav[item.key]`, o
`navItems('pt')` que o 056 deixou, e o `href="/"` do nome (linha 38) → `routePath('home', lang)`. O
filtro "sem Início" deve passar a ser por **chave** (`item.key !== 'home'`), não por `href !== '/'`,
porque o `href` da Home EN é `/en/`.

**`PageHeader.astro`** (100 linhas): acrescente `titleLang?: string` e `metaLang?: string`, aplicados
como `lang={…}` no `<h1>` e no `<p>` de meta; ausentes = sem atributo (Astro não renderiza atributo
`undefined` — confirme no `dist/`). Docstring com o comportamento de prop ausente (§10.2). O uso vem
no 067 (nome da disciplina em fallback).

**`config.ts`:** remova `description` do `siteConfig` e ajuste a docstring/cabeçalho. Conferido por
grep em 2026-09-24: nenhum teste lê `siteConfig.description` (`tests/lib/config.test.ts` testa
`locales`, `defaultLocale`, `author`).

**Por que isso importa para a M-07:** `siteConfig.description` é texto em português fora do
dicionário; em `/en` ele sairia na meta description sem que o teste da Decisão 12 (que compara
valores do dicionário `pt`) visse.

**Regras de código:** README da fase 4. Atualize "Atualizado em", "Versão" e "Dependências" nos
cabeçalhos dos quatro arquivos.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. Editar os quatro arquivos → verify: `npx astro check` colado.
3. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0. Cole também `grep -o '<html lang="[^"]*"' dist/index.html dist/sobre/index.html dist/404.html` e `grep -o '<meta name="description" content="[^"]*"' dist/index.html`.
4. Canário de idioma pelo caminho: crie **temporariamente** `src/pages/en/sonda.astro` que só renderiza `<BaseLayout title="x"><PageHeader slot="cabecalho" title="x" titleLang="pt-BR" /></BaseLayout>`; build; cole de `dist/en/sonda/index.html`: `<html lang="en"`, o `<title>` com o formato de `en.site.pageTitle`, a meta description de `en.site.description`, "Skip…" do `en`, o rótulo `aria-label` da navegação do `en`, `href="/en/"` no nome e `lang="pt-BR"` no `<h1>`. **Apague o arquivo** (é novo e não commitado: apagar, não `git checkout`), rebuild, e cole `ls dist/en` mostrando que `sonda` sumiu → verify: saídas coladas.
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; `npm run test:dist` colado (as rotas PT seguem com `lang="pt-BR"`).

## Critérios de aceitação

- [ ] Nenhum dos quatro arquivos importa `pt` direto; o idioma vem de `localeFromPath`
- [ ] `siteConfig.description` removido; meta description sai de `t.site.description`
- [ ] Nome no cabeçalho aponta para `routePath('home', lang)`; filtro do menu por chave
- [ ] `PageHeader` com `titleLang`/`metaLang` opcionais, sem atributo quando ausentes
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [ ] Canário do passo 4: página sob `/en/` sai com `lang="en"` e textos do `en`; arquivo temporário apagado
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
