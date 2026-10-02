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

- [x] Um único seletor por página, com `href` = `counterpartPath(rota)`, `hreflang` e `lang` do destino, texto `EN`/`PT` e nome acessível por extenso
- [x] `/ensino/` → `/en/teaching/` e `/ensino/<slug>/` → `/en/teaching/<slug>/` (teste e navegador)
- [x] Visível a 360 px fora do menu recolhível (orquestrador)
- [x] Sem classe `vt-*`; testes de `dist` verdes, com o canário do passo 5 vermelho
- [x] `docs/identidade-visual.md` §5.1 e §6.1 descrevem o seletor
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

Executada em 2026-10-02 pelo executor. Os blocos abaixo são saídas literais de arquivos capturados; o `Status` fica `TODO` e nada foi commitado.

### Decisões e desvios

- **Ordem a partir de `lg`: nome · navegação · seletor** (seletor no canto direito, como na Home). Motivo: é a mesma posição nas duas estruturas (a Home põe o seletor depois da navegação), então o seletor não muda de lugar na troca de página; o custo é que a ordem de Tab (nome, seletor, navegação, no DOM) difere da visual a partir de `lg`. No momento da execução eu não tinha medida de navegador para a quebra de linha a 1024 e 1440 px; essa medida é do orquestrador. Registrada no §5.1 de `docs/identidade-visual.md`; o orquestrador mediu depois que a 1024 e 1440 px o seletor fica na linha da navegação.
- Abaixo de `lg` o seletor e o botão "Menu" ficam num `<div>` (`flex items-center gap-2`) entre o nome e a navegação, fora de `#menu-caixa`; no `SiteHeader` o comentário reservado (`<!-- fase 4: seletor de idioma (RF-29) -->`) foi substituído. Na Home o seletor entra num `<div>` com o `<nav>` (`vt-menu`), fora do `<nav>`; as classes de grade (`lg:col-span-6 lg:col-start-7 lg:pt-3`) passaram do `<nav>` para esse `<div>`.
- O alvo de toque do seletor é `min-h-11 px-2` abaixo de `lg` (`lg:min-h-0 lg:px-0`), no `LanguageLink`, que não tem props; na Home, abaixo de `lg`, o `<div>` usa `items-center` para alinhar com o `<nav>`. Alinhamento vertical com os itens da Home no celular: não medido.
- `docs/identidade-visual.md` não tem campo `Atualizado em` (só "Criado em" / "Revisado em 2026-09-24" no texto); não alterei esse cabeçalho. Os arquivos de código tocados levam `Atualizado em: 2026-10-02`.
- Localização por conteúdo (as linhas do plano envelheceram): o comentário reservado estava em `SiteHeader.astro` (linha 46 antes da edição); os testes citados são "cada .html tem no máximo um vt-nome e um vt-menu" e "navegação principal sem \"Início\"" em `tests/dist/site-gerado.test.ts`, ambos verdes.
- `counterpartPath` na 404: o teste monta a rota a partir do arquivo (`dist/404.html` → `/404.html`, `dist/en/404.html` → `/en/404.html`, `x/index.html` → `/x/`); `counterpartPath` aceita `404.html` (ramo `rest === '404' || rest === '404.html'`) e devolve a Home do outro idioma.

### Linhas dos arquivos (contagem; passar de 150 é aceito, PRD v0.1.71)

```
   47 src/components/LanguageLink.astro
  153 src/components/SiteHeader.astro
  155 src/views/HomeView.astro
  621 tests/dist/site-gerado.test.ts
  976 total
```

### Passo 1 — `npx astro check` (estado final)

Capturado depois da última edição de código.

```
11:12:06 [content] Syncing content
11:12:06 [content] Synced content
11:12:06 [types] Generated 509ms
11:12:06 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (93 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 4, vermelho antes do build — `npm run test:dist` com o teste novo sobre o `dist/` ainda sem seletor

Saída literal da rodada vermelha (arquivo `red.txt`).

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (32 tests | 2 failed) 67ms
     × toda página tem um único link com hreflang, para o par da rota, com o texto do idioma de destino 8ms
     × /ensino/ leva a /en/teaching/ e a disciplina troca só o prefixo e o segmento 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > seletor de idioma (RF-29) > toda página tem um único link com hreflang, para o par da rota, com o texto do idioma de destino
AssertionError: /404.html: 0 links com hreflang: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ tests/dist/site-gerado.test.ts:459:76
    457|         (m) => m[0],
    458|       );
    459|       expect(links.length, `${route}: ${links.length} links com hrefla…
       |                                                                            ^
    460|       const link = links[0];
    461|       expect(link, `${route}: href`).toContain(`href="${counterpartPat…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/dist/site-gerado.test.ts > seletor de idioma (RF-29) > /ensino/ leva a /en/teaching/ e a disciplina troca só o prefixo e o segmento
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ tests/dist/site-gerado.test.ts:475:28
    473|         /<a\s[^>]*\bhreflang="[^"]*"[^>]*>/,
    474|       )?.[0];
    475|     expect(href('ensino')).toContain('href="/en/teaching/"');
       |                            ^
    476|     expect(href('en/teaching')).toContain('href="/ensino/"');
    477|     const slug = readdirSync(join(distDir, 'ensino'), { withFileTypes:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 30 passed (32)
   Start at  10:54:32
   Duration  377ms (transform 82ms, setup 0ms, import 160ms, tests 67ms, environment 0ms)
```

### Passo 2 — `npm run build:pipeline` (estado final, depois de desfeito o canário)

Inclui a listagem de `dist/index.html`, `dist/en/index.html`, `dist/404.html` e `dist/en/404.html`.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  11:12:15
   Duration  1.15s (transform 1.84s, setup 0ms, import 3.00s, tests 80ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
11:12:44 [content] Syncing content
11:12:44 [content] Synced content
11:12:44 [types] Generated 503ms
11:12:44 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (93 files): 
- 0 errors
- 0 warnings
- 0 hints

11:12:53 [content] Syncing content
11:12:53 [content] Synced content
11:12:53 [types] Generated 555ms
11:12:53 [build] output: "static"
11:12:53 [build] mode: "static"
11:12:53 [build] directory: S:\Projetos\academic_page\haroldo\dist\
11:12:53 [build] Collecting build info...
11:12:53 [build] ✓ Completed in 599ms.
11:12:53 [build] Building static entrypoints...
11:12:54 [vite] ✓ built in 414ms
11:12:54 [vite] ✓ built in 101ms
11:12:54 [build] Rearranging server assets...

 generating static routes 
11:12:54   ├─ /404.html (+13ms) 
11:12:54   ├─ /en/404/index.html (+3ms) 
11:12:54   ├─ /en/about/index.html (+9ms) 
11:12:54   ├─ /en/publications/index.html (+6ms) 
11:12:54   ├─ /en/research/index.html (+6ms) 
11:12:54   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
11:12:54   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+88ms) 
11:12:54   ├─ /en/teaching/index.html (+6ms) 
11:12:54   ├─ /en/index.html (+5ms) 
11:12:54   ├─ /ensino/2025-1-mecanica-classica/index.html (+2ms) 
11:12:54   ├─ /ensino/2026-2-relatividade-geral/index.html (+14ms) 
11:12:54   ├─ /ensino/index.html (+4ms) 
11:12:54   ├─ /pesquisa/index.html (+3ms) 
11:12:54   ├─ /publicacoes/index.html (+3ms) 
11:12:54   ├─ /sobre/index.html (+3ms) 
11:12:54   ├─ /index.html (+2ms) 
11:12:54 ✓ Completed in 216ms.

11:12:54 [build] ✓ Completed in 805ms.
11:12:54 [build] 16 page(s) built in 1.47s
11:12:54 [build] Complete!
EXIT=0

FullName                                             Length LastWriteTime      
--------                                             ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html      6540 02/10/2026 11:12:54
S:\Projetos\academic_page\haroldo\dist\en\index.html   7047 02/10/2026 11:12:54
S:\Projetos\academic_page\haroldo\dist\404.html        9540 02/10/2026 11:12:54
S:\Projetos\academic_page\haroldo\dist\en\404.html     9566 02/10/2026 11:12:54
```

### Passo 3 — destinos do seletor em cada `.html` de `dist/` (fora de `admin/`)

Gerado por `destinos.mjs` sobre o `dist/` final: rota, `href`, `hreflang`, texto visível e quantidade de links com `hreflang`.

```
rota -> href do seletor | hreflang | texto visivel
/404.html -> /en/ | en | EN [1 link]
/en/404.html -> / | pt-BR | PT [1 link]
/en/about/ -> /sobre/ | pt-BR | PT [1 link]
/en/ -> / | pt-BR | PT [1 link]
/en/publications/ -> /publicacoes/ | pt-BR | PT [1 link]
/en/research/ -> /pesquisa/ | pt-BR | PT [1 link]
/en/teaching/2025-1-mecanica-classica/ -> /ensino/2025-1-mecanica-classica/ | pt-BR | PT [1 link]
/en/teaching/2026-2-relatividade-geral/ -> /ensino/2026-2-relatividade-geral/ | pt-BR | PT [1 link]
/en/teaching/ -> /ensino/ | pt-BR | PT [1 link]
/ensino/2025-1-mecanica-classica/ -> /en/teaching/2025-1-mecanica-classica/ | en | EN [1 link]
/ensino/2026-2-relatividade-geral/ -> /en/teaching/2026-2-relatividade-geral/ | en | EN [1 link]
/ensino/ -> /en/teaching/ | en | EN [1 link]
/ -> /en/ | en | EN [1 link]
/pesquisa/ -> /en/research/ | en | EN [1 link]
/publicacoes/ -> /en/publications/ | en | EN [1 link]
/sobre/ -> /en/about/ | en | EN [1 link]
```

### Passo 4 — `npm run test:dist` (estado final)

Verde sobre o `dist/` do build final acima.

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  32 passed (32)
   Start at  11:12:56
   Duration  431ms (transform 87ms, setup 0ms, import 164ms, tests 137ms, environment 0ms)

EXIT=0
```

### Passo 5 — canário: `counterpartPath(...)` trocado por `routePath('home', target)` em `LanguageLink.astro`, build refeito, `npm run test:dist`

O teste de destino reprova nomeando `/ensino/` (`expected ... to contain 'href="/en/teaching/"'`) e `/en/about/`. O canário foi desfeito editando o arquivo de volta (`counterpartPath` e o import originais), e o build e o `test:dist` finais acima foram refeitos depois.

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (32 tests | 2 failed) 150ms
     × toda página tem um único link com hreflang, para o par da rota, com o texto do idioma de destino 10ms
     × /ensino/ leva a /en/teaching/ e a disciplina troca só o prefixo e o segmento 2ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > seletor de idioma (RF-29) > toda página tem um único link com hreflang, para o 
par da rota, com o texto do idioma de destino
AssertionError: /en/about/: href: expected '<a href="/" hreflang="pt-BR" lang="pt…' to contain 'href="/sobre/"'

Expected: "href="/sobre/""
Received: "<a href="/" hreflang="pt-BR" lang="pt-BR" class="text-nav inline-flex min-h-11 items-center px-2 lg:min-h-0 
lg:px-0"><span class="link-traco">PT</span><span class="sr-only"> (Versão em português)</span></a>"

 ❯ tests/dist/site-gerado.test.ts:461:38
    459|       expect(links.length, `${route}: ${links.length} links com hrefla…
    460|       const link = links[0];
    461|       expect(link, `${route}: href`).toContain(`href="${counterpartPat…
       |                                      ^
    462|       expect(link, `${route}: hreflang`).toContain(`hreflang="${HTML_L…
    463|       expect(link, `${route}: lang`).toContain(` lang="${HTML_LANG[tar…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/dist/site-gerado.test.ts > seletor de idioma (RF-29) > /ensino/ leva a /en/teaching/ e a disciplina troca 
só o prefixo e o segmento
AssertionError: expected '<a href="/en/" hreflang="en" lang="en…' to contain 'href="/en/teaching/"'

Expected: "href="/en/teaching/""
Received: "<a href="/en/" hreflang="en" lang="en" class="text-nav inline-flex min-h-11 items-center px-2 lg:min-h-0 
lg:px-0">"

 ❯ tests/dist/site-gerado.test.ts:475:28
    473|         /<a\s[^>]*\bhreflang="[^"]*"[^>]*>/,
    474|       )?.[0];
    475|     expect(href('ensino')).toContain('href="/en/teaching/"');
       |                            ^
    476|     expect(href('en/teaching')).toContain('href="/ensino/"');
    477|     const slug = readdirSync(join(distDir, 'ensino'), { withFileTypes:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 30 passed (32)
   Start at  10:56:42
   Duration  464ms (transform 82ms, setup 0ms, import 169ms, tests 150ms, environment 0ms)

EXIT=1
```

### Passo 6 — `npm run lint`



```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 6 — `npm run format:check`



```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 6 — `npm run test:coverage`



```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  11:12:01
   Duration  1.83s (transform 5.25s, setup 0ms, import 9.67s, tests 365ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 295/295 )
Branches     : 100% ( 148/148 )
Functions    : 100% ( 79/79 )
Lines        : 100% ( 263/263 )
================================================================================
EXIT=0
```

### Arquivos tocados: `file`

Nenhum com "with BOM".

```
src/components/LanguageLink.astro: JavaScript source, Unicode text, UTF-8 text
src/components/SiteHeader.astro:   JavaScript source, Unicode text, UTF-8 text
src/views/HomeView.astro:          JavaScript source, Unicode text, UTF-8 text
tests/dist/site-gerado.test.ts:    JavaScript source, Unicode text, UTF-8 text
docs/identidade-visual.md:         Unicode text, UTF-8 text
```

### Arquivos tocados: busca de mojibake (`grep -c` dos três padrões de dupla codificação)



```
src/components/LanguageLink.astro:0
src/components/SiteHeader.astro:0
src/views/HomeView.astro:0
tests/dist/site-gerado.test.ts:0
docs/identidade-visual.md:0
plans/fase-4-internacionalizacao/069-seletor-de-idioma.md:0
```

### Correção do ciclo de revisão (comentário publicado; §5.1 e §6.1)

O comentário do seletor no `SiteHeader.astro` virou comentário de expressão `{/* */}`; o §5.1 e o §6.1 de `docs/identidade-visual.md` foram ajustados. Blocos recapturados abaixo e acima: `astro check`, build, destinos, `test:dist`, `lint`, `format:check`, `test:coverage`, linhas, `file`, mojibake. O canário do passo 5 não foi refeito.

```
ocorrencias de RF-29 em dist/**/*.html (fora de admin/): 0
IGUAL     32368d75e3fd4aed 32368d75e3fd4aed 404.html
IGUAL     8199ce6bb235cc24 8199ce6bb235cc24 en/404.html
IGUAL     7db38b6a4c16b576 7db38b6a4c16b576 en/about/index.html
IGUAL     5fff2a6cae8f472c 5fff2a6cae8f472c en/index.html
IGUAL     8948e2970ef1785f 8948e2970ef1785f en/publications/index.html
IGUAL     41e543b8d445b156 41e543b8d445b156 en/research/index.html
IGUAL     982d9b27d899c45c 982d9b27d899c45c en/teaching/2025-1-mecanica-classica/index.html
IGUAL     53950d3eba0615f1 53950d3eba0615f1 en/teaching/2026-2-relatividade-geral/index.html
IGUAL     676a7d5978477bb6 676a7d5978477bb6 en/teaching/index.html
IGUAL     7ad503a5e0c84368 7ad503a5e0c84368 ensino/2025-1-mecanica-classica/index.html
IGUAL     ff60e8519f316f46 ff60e8519f316f46 ensino/2026-2-relatividade-geral/index.html
IGUAL     a3dd67a60359c5b8 a3dd67a60359c5b8 ensino/index.html
IGUAL     51ba2ae1afe18900 51ba2ae1afe18900 index.html
IGUAL     74bef98d2dd33221 74bef98d2dd33221 pesquisa/index.html
IGUAL     1907d9a85c8512b3 1907d9a85c8512b3 publicacoes/index.html
IGUAL     000feadd278a24e3 000feadd278a24e3 sobre/index.html
16/16 iguais
```

### BOM e mojibake no plano

```
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0
$ grep -c de mojibake no plano
0
```

### Não rodado

- **Passo 7 (navegador) e o critério "Visível a 360 px fora do menu recolhível": não rodei**, são do orquestrador. Ficam por medir: `[scrollWidth, clientWidth]` a 360/768/1440 (cabeçalho interno e Home, PT e EN), quebra de linha a 1024 e 1440 com a ordem escolhida, alinhamento do seletor na Home abaixo de `lg`, transição de página PT↔EN, nome acessível na árvore de acessibilidade e a 404 no `wrangler dev`.
- O critério "`/ensino/` → `/en/teaching/`..." tem a prova de `dist/` (teste e tabela acima), mas a parte "navegador" não foi rodada; por isso a caixa fica vazia.
- Não rodei `npm ci`, `npm audit`, CI nem `node scripts/verificar-promocao.mjs`. Nenhum servidor foi iniciado.

### Passo 7 — Navegador (orquestrador)

Rodado pelo orquestrador em 2026-10-02, das 10:58 às 11:10, no Vivaldi com a extensão, sobre `npx astro preview` (porta 4321). O preview servia o `dist/` do build final do executor. Há uma cópia em `scratchpad/069/dist-medido`, e os SHA-256 dos HTML estão em `dist-medido.sha`. Foi medido **antes** da suíte autoritativa, porque o resultado podia mudar o código. A cópia permite conferir, por hash, que o `dist/` da suíte é o mesmo que foi medido. Cada rota foi carregada num `<iframe>` com `box-sizing:content-box`, e o `innerWidth` conferido saiu igual à largura pedida. Legenda: `[scrollWidth, clientWidth]` do documento; `selTop` e `nomeTop` são o `top` do seletor e do nome do site.

Saída transcrita do `javascript_tool`:

```
Fri Oct 02 2026 11:01:37
/ensino/ | 360:[360,360] in=360 selTop=36 nomeTop=42 | 768:[768,768] in=768 selTop=36 nomeTop=39 | 1024:[1024,1024] in=1024 selTop=64 nomeTop=52 | 1440:[1440,1440] in=1440 selTop=64 nomeTop=52
/en/teaching/2026-2-relatividade-geral/ | 360:[350,350] in=360 selTop=80 nomeTop=36 | 768:[758,758] in=768 selTop=36 nomeTop=39 | 1024:[1024,1024] in=1024 selTop=64 nomeTop=52 | 1440:[1440,1440] in=1440 selTop=64 nomeTop=52
/ | 360:[350,350] in=360 selTop=94 nomeTop=37 | 768:[768,768] in=768 selTop=107 nomeTop=37 | 1024:[1024,1024] in=1024 selTop=64 nomeTop=53 | 1440:[1440,1440] in=1440 selTop=64 nomeTop=53
/en/ | 360:[350,350] in=360 selTop=94 nomeTop=37 | 768:[758,758] in=768 selTop=107 nomeTop=37 | 1024:[1024,1024] in=1024 selTop=64 nomeTop=53 | 1440:[1440,1440] in=1440 selTop=64 nomeTop=53
```

Cabeçalho de página interna, com `iframe` alto (sem barra vertical) e a 350 px úteis:

```
/ensino/ 360 cw=360 header=[20..340] nome=[40..204]@42 sel=[226..261]@36 menu=[269..320]@36
/en/teaching/ 360 cw=360 header=[20..340] nome=[40..204]@42 sel=[227..261]@36 menu=[269..320]@36
/ensino/ 350 cw=350 header=[20..330] nome=[40..203]@36 sel=[40..75]@80 menu=[83..134]@80
/sobre/ 360 cw=360 header=[20..340] nome=[40..204]@42 sel=[226..261]@36 menu=[269..320]@36
```

- **Rolagem horizontal (RF-26):** os pares são iguais em todas as medidas. Onde aparece 350 ou 758, a diferença é a barra vertical do documento (10 px).
- **Visível a 360 px fora do menu recolhível:** o seletor está visível em todas as larguras e fica fora de `#menu-caixa` (`inMenu=false`, medido nas 6 rotas a 360/768/1024/1440).
  - Com 360 px úteis, nas páginas internas, ele fica na linha do nome, entre o nome e o botão "Menu" (`sel=[226..261]@36`, `menu=[269..320]@36`). A folga é de 22 px entre o nome e o seletor.
  - **Abaixo de cerca de 354 px úteis**, por exemplo a 360 px com barra vertical clássica (350 úteis), o par "seletor + Menu" desce inteiro para uma segunda linha sob o nome, alinhado à esquerda (`sel=[40..75]@80`, `menu=[83..134]@80`). Não há estouro.
  - Telefones usam barra de rolagem sobreposta, que não ocupa largura, então a 360 px reais o caso é o da linha única. **Observação para o stakeholder, não defeito do plano:** antes do 069, o "Menu" cabia na linha do nome também a 350.
- **Ordem a partir de `lg` (nome · navegação · seletor), escolhida pelo executor:** a 1024 e a 1440, o seletor fica na mesma linha da navegação (`selTop=64` dentro da faixa da `nav`, top 52 e altura 36). Nas páginas internas e na Home, PT e EN, a linha não quebra.
- **Home abaixo de `lg`:** o seletor fica à direita da navegação, na mesma faixa (`selTop=94` a 360 e `107` a 768). A navegação já ocupava duas linhas a 360 antes do 069 ("Publicações" desce).
- **Destinos, por clique real na página de topo (1536 px):**
  - `/ensino/` → EN → `/en/teaching/` (`lang=en`). Literal, como pede o RF-29.
  - `/ensino/2026-2-relatividade-geral/` → EN → `/en/teaching/2026-2-relatividade-geral/` (`lang=en`).
  - `/en/about/` → PT → `/sobre/` (`lang=pt-BR`).
  - `/404.html` → EN → `/en/` (`lang=en`, título "Prof. Haroldo C. D. Lima Junior").
- **Transição PT → EN (aba visível):** um ouvinte de `pageswap` foi instalado antes do clique de `/ensino/` e gravou `{"vt":true,"from":"/ensino/","to":"http://localhost:4321/en/teaching/"}`. A troca de documento começou com uma View Transition, e a navegação chegou ao destino. Não medi o fim da transição no documento novo: o ouvinte de `finished` fica no documento antigo, que é descarregado.
- **Nome acessível: não lido na árvore. Limitação da ferramenta, provada por sonda.**
  - O `read_page` e o `find` da extensão marcam como `(unnamed)` todo link cujo texto está dentro de um `<span>`. Isso vale inclusive para um `<a href="#x4"><span>About</span>…</a>` injetado como controle. Um `<a href="#x1">PT</a>` com texto direto sai com o nome `"PT"`.
  - O `element.computedName` não existe neste Chromium.
  - O que foi medido é o HTML do seletor da Home EN: `<a href="/" hreflang="pt-BR" lang="pt-BR" class="…"><span class="link-traco">PT</span><span class="sr-only"> (Versão em português)</span></a>`, sem `aria-hidden` nem `inert` no caminho, com `textContent` igual a "PT (Versão em português)".
  - Pela regra de nome por conteúdo (accname), sem `aria-label`, o nome é esse texto. Isto é **dedução**, não leitura da árvore.
- **Foco por teclado (Tab):** não verificado, porque a tecla Tab da extensão não move o foco nesta máquina. A ordem de Tab difere da visual a partir de `lg` (nome, seletor, navegação no DOM), o que o executor declarou.
- **A 404 foi medida no `astro preview`**, abrindo `/404.html` diretamente, e não no `wrangler dev`. A prova de que o Worker serve esse arquivo em `/<inexistente>` é do plano 068.
- **Validade depois da correção do ciclo de revisão:** a correção tirou o comentário `<!-- RF-29: … -->` do `SiteHeader`, e o `dist/` foi reconstruído duas vezes (pelo executor e pelo triage2). Para cada um dos 16 `.html` fora de `admin/`, o orquestrador e o revisor, de forma independente, removeram em memória esse comentário da cópia `dist-medido` e compararam o resultado com o `dist/` novo. Os dois deram **16/16 iguais**. As medidas acima valem para o `dist/` final.

### Suíte autoritativa (orquestrador)

A verificação oficial é a segunda rodada do `triage-runner`: lint, format, coverage (355 testes, 100%), `build:pipeline` (`astro check` 0/0/0, 16 páginas), `test:dist` (32 testes) e `audit`, todos `EXIT=0`. As capturas estão em `scratchpad/069/triage2/`.
