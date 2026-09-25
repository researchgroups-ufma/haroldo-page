# Plano 056 — Mapa de rotas PT↔EN, idioma pelo caminho e navegação por idioma

**Status:** TODO
**RFs cobertos:** base de RF-29 e RF-30 (`hreflang`); RN-09; sabatina fase 4, Decisões 3 e 6; dívida (e) da fase 3
**Depende de:** plano 055 (comparador)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um módulo único, `src/lib/routes.ts`, sabe o caminho de cada rota nos dois idiomas, o idioma de um
caminho e o par de um caminho no outro idioma. A navegação passa a ser gerada por idioma. As páginas
PT continuam **idênticas**.

## Arquivos afetados

- `src/lib/routes.ts` — novo
- `tests/lib/routes.test.ts` — novo
- `src/lib/navigation.ts` — `NAV_ITEMS` vira `navItems(locale)`; `isActivePath` generalizado para a Home EN
- `tests/lib/navigation.test.ts` — acompanha
- `src/components/SiteHeader.astro`, `src/pages/index.astro`, `src/pages/404.astro` — só trocam `NAV_ITEMS` por `navItems('pt')`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite.

## Contexto necessário

**Decisões da sabatina** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): **Decisão 3** — a
disciplina usa em `/en` o **mesmo slug PT** (`/ensino/<slug>/` ↔ `/en/teaching/<slug>/`); não há
slug de `en.nome` nem redirecionamento (as Decisões 1 e 2 estão substituídas). **Decisão 6** — o
mapa de segmentos PT↔EN fica **num único módulo em `src/lib/`**, usado pelo menu, pelo seletor e pelo
`hreflang`. RF-29 fixa `/ensino` → `/en/teaching`.

**Mapa (fixado):**

| Chave | PT | EN |
|---|---|---|
| `home` | `/` | `/en/` |
| `about` | `/sobre/` | `/en/about/` |
| `research` | `/pesquisa/` | `/en/research/` |
| `teaching` | `/ensino/` | `/en/teaching/` |
| `publications` | `/publicacoes/` | `/en/publications/` |
| disciplina | `/ensino/<slug>/` | `/en/teaching/<slug>/` |

**API de `src/lib/routes.ts` (fixada):**

```ts
import type { Locale } from './config'; // SÓ `import type` — ver armadilha 3 do README da fase
export const HTML_LANG = { pt: 'pt-BR', en: 'en' } as const satisfies Record<Locale, string>;
export type RouteKey = 'home' | 'about' | 'research' | 'teaching' | 'publications';
export function routePath(key: RouteKey, locale: Locale): string;
export function coursePath(slug: string, locale: Locale): string;
export function localeFromPath(pathname: string): Locale;   // '/en' e '/en/…' → 'en'; resto → 'pt'
export function counterpartPath(pathname: string): string;  // par no outro idioma
```

Regras de `localeFromPath`: `'/en'`, `'/en/'`, `'/en/about/'` → `'en'`; `'/'`, `'/sobre'`, `'/enx/'`,
`'/ensino/'` → `'pt'` (prefixo só conta como segmento inteiro).

Regras de `counterpartPath`, aceitando caminho com ou sem barra final (o `Astro.url.pathname` do
build pode vir das duas formas) e devolvendo **sempre com barra final**: as cinco rotas fixas e a
disciplina trocam pelo mapa (o slug passa intacto); `'/404'`, `'/404/'` e `'/404.html'` → `'/en/'`, e
`'/en/404'` (mesmas variantes) → `'/'` (decisão 8 do README da fase: a 404 não tem "mesma página");
qualquer outro caminho **lança** `Error` nomeando o caminho — rota nova sem par reprova o build em vez
de gerar link quebrado.

**`src/lib/navigation.ts`:** hoje exporta `NAV_ITEMS` (lista PT `as const satisfies …`) e
`isActivePath(href, pathname)`. Troque `NAV_ITEMS` por `navItems(locale: Locale)`, que devolve
`{ key, href }[]` na mesma ordem (home, about, research, teaching, publications), com `href` de
`routePath`. **Armadilha:** `isActivePath` trata `'/'` como caso especial (só ativo em `'/'` exato);
todo outro `href` é ativo por prefixo. `'/en/'` é prefixo de toda rota EN — generalize: **o `href` da
Home de qualquer idioma** só é ativo em igualdade exata. Mantenha os seis testes existentes de
`tests/lib/navigation.test.ts` passando e acrescente: `'/en/'` inativo em `'/en/about/'`, ativo em
`'/en/'` e `'/en'`; `'/en/teaching/'` ativo em `'/en/teaching/2026-2-relatividade-geral/'`.

**Callers de `NAV_ITEMS`** (conferidos por grep em 2026-09-24): `src/components/SiteHeader.astro:27,30`,
`src/pages/index.astro:35,47`, `src/pages/404.astro:33,46`. Troque por `navItems('pt')` e nada mais —
as views dos planos 062–064 passam a usar o idioma da rota.

**Cobertura:** `vitest.config.ts` inclui `src/lib/**/*.ts` com thresholds; mire 100% de linhas e
ramos em `routes.ts` (a fase 3 fechou em 100%).

**Regras de código:** README da fase 4, seção "Regras de código que todo plano desta fase herda".
Cite **RN-09** onde o PT é o idioma sem prefixo e **RF-29** no par de rotas.

## Passos

1. Retrato "antes": `npm run build:pipeline` e `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. Escrever `src/lib/routes.ts` e `tests/lib/routes.test.ts` (todas as linhas das duas tabelas acima, as variantes de barra e o `throw`) → verify: `npm test -- --reporter=verbose tests/lib/routes.test.ts` colado.
3. `navItems` e `isActivePath` generalizado, com os testes novos → verify: `npm test -- --reporter=verbose tests/lib/navigation.test.ts` colado.
4. Trocar os três callers → verify: `npx astro check` colado.
5. Retrato "depois" e comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — **toda rota `IGUAL`**, exit 0.
6. Canário do `throw`: um teste que chama `counterpartPath('/cv/')` e espera erro já está no passo 2; mostre-o vermelho trocando temporariamente o `throw` por `return '/'` e desfaça → verify: saída vermelha e verde coladas.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados (linhas de `routes.ts` e `navigation.ts` na tabela de cobertura).

## Critérios de aceitação

- [ ] `routePath`, `coursePath`, `localeFromPath`, `counterpartPath` e `HTML_LANG` com a API e as regras do Contexto, testados linha a linha das tabelas
- [ ] `counterpartPath` lança para caminho sem par (canário do passo 6)
- [ ] `navItems(locale)` substitui `NAV_ITEMS`; `'/en/'` não fica ativo nas rotas EN internas
- [ ] `routes.ts` sem import de valor (só `import type`)
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL` (passo 5)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
