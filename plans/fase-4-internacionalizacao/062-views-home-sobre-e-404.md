# Plano 062 — Views: Home, Sobre e 404

**Status:** TODO
**RFs cobertos:** sabatina fase 4, Decisão 6 (página fina + view); §10.4 (componentes < 150 linhas); RF-20, RF-21, RF-27 sem mudança de comportamento
**Depende de:** planos 055 (comparador), 056 (`routePath`, `navItems`), 058 e 059 (dicionário por caminho), 060 (`areas[].nome`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 6)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O corpo de `index.astro`, `sobre.astro` e `404.astro` vira `HomeView`, `AboutView` e `NotFoundView`
em `src/views/`, cada uma recebendo `lang`; as três páginas ficam finas. O HTML das rotas PT não muda.

## Arquivos afetados

- `src/views/HomeView.astro`, `src/views/AboutView.astro`, `src/views/NotFoundView.astro` — novos
- `src/pages/index.astro`, `src/pages/sobre.astro`, `src/pages/404.astro` — viram páginas finas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Nenhuma rota EN é criada aqui** (065, 068), e **nenhum fallback** (`localize`) entra
> nas views ainda — a view só troca `pt` por `strings(lang)` e `href` fixo por `routePath`.

## Contexto necessário

**Decisão 6** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): "o corpo de cada página vira um
componente de view que recebe `lang`; cada rota tem dois arquivos finos em `src/pages/` e
`src/pages/en/` … que só chamam a view." Decisões de fatiamento 2 e 3 do README da fase: a view
recebe `lang` como **prop obrigatória** (`lang: Locale`), usa `const t = strings(lang)` e
`navItems(lang)`/`routePath(…, lang)`; views em `src/views/` com sufixo `View.astro`.

**Página fina (modelo):**

```astro
---
/** cabeçalho §10.1 completo (obrigatório também na página fina) */
import AboutView from '../views/AboutView.astro';
---

<AboutView lang="pt" />
```

A view pode chamar `getCollection` no próprio frontmatter (é componente Astro; a página não precisa
passar dados). `Astro.url` dentro da view é o da página.

**O que muda em cada view, além do `lang`:**
- `HomeView` (hoje `index.astro`, 145 linhas): `NAV_ITEMS`/`navItems('pt')` → `navItems(lang)`
  filtrado por **chave** (`key !== 'home'`), não por `href !== '/'`; `pt.` → `t.`; o resto igual.
  `areas` já é `{ nome }` desde o 060.
- `AboutView` (hoje `sobre.astro`, 143): `pt.` → `t.`; `BaseLayout title={t.nav.about}` (o 057 já
  trocou).
- `NotFoundView` (hoje `404.astro`, 71): `navItems(lang)` com os cinco itens ("Início" primeiro,
  RF-27); `pt.` → `t.`.

O cabeçalho §10.1 de cada view herda a descrição da página de origem (rota, RF, notas) e diz "view de
`/` e `/en/`" etc. As notas sobre F-08 dos cabeçalhos atuais de `index.astro` e `sobre.astro` citam
uma regra que o §5.4 do PRD chama de "Imagem ausente" — mantenha a citação só onde ela se refere a
imagem ausente (`foto`), como hoje; não crie citação nova de F-08.

**Tamanho:** cada view < 150 linhas (§10.4, alvo). `sobre.astro` tem 143 hoje e a view acrescenta
pouco; se passar de 150, pare e reporte o que ocupa as linhas.

**Prova:** comparador (055) todo `IGUAL`. **A 404 é `dist/404.html`** — confirme que continua saindo
com esse nome (o `dist/404/index.html` quebraria o Worker, plano 051).

**Registro para o orquestrador, na promoção:** o §7.5 do PRD ganha `src/views/` (Decisão 6, impacto no
§7.5).

**Regras de código:** README da fase 4.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. As três views e as três páginas finas → verify: `npx astro check` colado; `wc -l src/views/*.astro src/pages/index.astro src/pages/sobre.astro src/pages/404.astro` colado.
3. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0; `ls dist/404.html` colado.
4. Nenhum `pt` direto nem `href` interno fixo nas views → verify: `grep -n "i18n/pt'\|href=\"/" src/views/HomeView.astro src/views/AboutView.astro src/views/NotFoundView.astro` colado (esperado: vazio).
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados.
6. **Orquestrador — navegador** (README da fase): `/`, `/sobre/` e `/rota-inexistente` (no `npx wrangler dev`) a 360/768/1440 — `[scrollWidth, clientWidth]`, a transição de página entre Home e Sobre (vt-nome/vt-menu), Home e Sobre sem rolagem vertical a 1440×800.

## Critérios de aceitação

- [ ] `HomeView`, `AboutView` e `NotFoundView` com `lang: Locale` obrigatória; páginas finas só chamam a view
- [ ] Nenhuma view importa `pt` direto nem tem `href` interno fixo
- [ ] Views e páginas abaixo de 150 linhas (contagem colada)
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL`; `dist/404.html` presente
- [ ] Navegador: sem rolagem horizontal nas três larguras e transição entre páginas funcionando (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 6 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
