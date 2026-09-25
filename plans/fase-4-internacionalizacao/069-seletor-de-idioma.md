# Plano 069 — Seletor de idioma (RF-29)

**Status:** TODO
**RFs cobertos:** **RF-29**, RF-26, §8.3 (troca explícita, sem detecção automática), RNF-15; sabatina fase 4, Decisões 3 e 5; §12 fase 4, item 6
**Depende de:** planos 066, 067, 068 (todas as rotas EN existem — o seletor nunca aponta para página inexistente)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 7)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Toda página tem **um** link para a mesma página no outro idioma — "EN" nas páginas PT, "PT" nas EN —,
visível também no celular, fora do menu recolhível. Em `/ensino/` ele leva a `/en/teaching/`; em
`/ensino/<slug>/`, a `/en/teaching/<slug>/`.

## Arquivos afetados

- `src/components/LanguageLink.astro` — novo
- `src/components/SiteHeader.astro` — o link no lugar do comentário reservado
- `src/views/HomeView.astro` — o link na linha da navegação da Home
- `tests/dist/site-gerado.test.ts` — um seletor por página, destino certo
- `docs/identidade-visual.md` — §5.1 (seletor no cabeçalho) e §6.1 (seletor na Home)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite.

## Contexto necessário

**Decisão 5** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): **link único** com o idioma de
destino ("EN" nas páginas PT, "PT" nas EN); leva `hreflang` e `lang` do **destino** e um nome
acessível por extenso vindo do dicionário ("English version" / "Versão em português"); fica visível
também no celular, fora do menu recolhível; aponta para a mesma página no outro idioma. **Decisão 3:**
a disciplina troca só o prefixo e o segmento fixo (`ensino` ↔ `teaching`), o slug é o mesmo.

**`LanguageLink.astro`:** sem props; idioma pelo caminho (decisão de fatiamento 2):

```astro
const lang = localeFromPath(Astro.url.pathname);
const target = lang === 'pt' ? 'en' : 'pt';
const t = strings(lang);            // language.code/name do dicionário DA PÁGINA descrevem o destino (057)
const href = counterpartPath(Astro.url.pathname);
```

Marcação: `<a href={href} hreflang={HTML_LANG[target]} lang={HTML_LANG[target]} class="…">{t.language.code}<span class="sr-only"> ({t.language.name})</span></a>`
— o nome acessível contém o texto visível (WCAG 2.5.3, "label in name") e o nome por extenso. Estilo:
`text-nav`, alvo de toque ≥ 44 px abaixo de `lg` (`inline-flex min-h-11 items-center px-2`, como o
botão "Menu", `SiteHeader.astro:48`), e o sublinhado que segue o cursor (`link-traco`, §7 da
identidade). **Sem classe `vt-*`** (no máximo um `vt-nome`/`vt-menu` por página — o teste de `dist`
reprova). A 404: `counterpartPath('/404')` → `/en/` e `'/en/404'` → `/` (decisão de fatiamento 8).

**Lugar (decisão de fatiamento 8):**
- `SiteHeader.astro`: substitui o comentário `<!-- fase 4: seletor de idioma (RF-29) -->` (linha 40),
  entre o nome e o botão "Menu", **fora** de `#menu-caixa` — a 360 px o link aparece na linha do nome,
  sem abrir o menu. A ordem visual a partir de `lg` é nome · navegação · seletor, ou nome · seletor ·
  navegação — escolha a que não quebre a linha a 1024 e 1440 e registre no §5.1.
- `HomeView.astro`: a Home não usa o `SiteHeader` (`BaseLayout bare`); o link entra na **mesma linha**
  da navegação (`<nav class="vt-menu …">`, que era `index.astro:59-71` antes do 062), depois dela, com
  o mesmo estilo dos itens — mas **fora do elemento `<nav>`**, como no `SiteHeader`. Motivo: o teste
  "navegação principal sem Início" (`tests/dist/site-gerado.test.ts:376-387`) reprova qualquer
  `href="/"` dentro do `<nav>` principal, e na Home EN o seletor aponta justamente para `/`. O seletor
  não é item de navegação do site; é troca de idioma.

**Testes de `dist`:** em todo `.html` (fora de `admin/`), exatamente **um** `<a` com `hreflang`, com
`href` igual a `counterpartPath(rota)` (use a função de `src/lib/routes.ts` no teste), `hreflang`/`lang`
do outro idioma, e o texto visível de `strings(lang).language.code`. O teste de vt-nome/vt-menu (330–343)
segue verde.

**`docs/identidade-visual.md`:** §5.1 troca "Fase 4: o lugar do seletor… está marcado por um comentário"
pela descrição do seletor (texto, estilo, posição nas larguras, comportamento na 404); §6.1 ganha o
seletor na Home. `format:check` cobre `docs/`.

**Regras de código:** README da fase 4. Cite **RF-29**.

## Passos

1. `LanguageLink.astro`, uso no `SiteHeader` e na `HomeView` → verify: `npx astro check` colado.
2. Build → verify: `npm run build:pipeline` colado.
3. Destinos → verify: para cada `.html` de `dist/` (fora de `admin/`), a rota e o `href` do seletor, numa tabela gerada por script, colada (esperado: `/`↔`/en/`, `/ensino/`→`/en/teaching/`, `/ensino/2026-2-relatividade-geral/`→`/en/teaching/2026-2-relatividade-geral/`, `/404`→`/en/`, …).
4. Testes de `dist` → verify: `npm run test:dist` colado.
5. Canário: troque temporariamente, no `LanguageLink`, `counterpartPath(...)` por `routePath('home', target)` → o teste de destino reprova nomeando `/ensino/`; desfaça → verify: saídas coladas.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador — navegador:** em `/ensino/`, clicar em EN leva a `/en/teaching/` (RF-29, literal); em `/ensino/2026-2-relatividade-geral/`, a `/en/teaching/2026-2-relatividade-geral/`; em `/en/about/`, PT leva a `/sobre/`; na 404, à Home do outro idioma. A 360 px o seletor aparece **sem abrir o menu**; `[scrollWidth, clientWidth]` a 360/768/1440 no cabeçalho de uma página interna e na Home (PT e EN); a transição de página entre PT e EN não aborta (aba visível); nome acessível do link lido na árvore de acessibilidade.

## Critérios de aceitação

- [ ] Um único seletor por página, com `href` = `counterpartPath(rota)`, `hreflang` e `lang` do destino, texto `EN`/`PT` e nome acessível por extenso
- [ ] `/ensino/` → `/en/teaching/` e `/ensino/<slug>/` → `/en/teaching/<slug>/` (teste e navegador)
- [ ] Visível a 360 px fora do menu recolhível (orquestrador)
- [ ] Sem classe `vt-*`; testes de `dist` verdes, com o canário do passo 5 vermelho
- [ ] `docs/identidade-visual.md` §5.1 e §6.1 descrevem o seletor
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 7 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
