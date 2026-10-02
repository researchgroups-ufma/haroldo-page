# Plano 072 — Testes i18n sobre o `dist/`: par EN de toda rota PT e M-07 (Decisão 12)

**Status:** TODO
**RFs cobertos:** **M-07**, §10.4 (nenhuma string de interface hardcoded), §11 (integração: "toda rota PT tem par EN"; "nenhum valor do dicionário `pt` no HTML de `/en/**` fora de `lang="pt-BR"`"); sabatina fase 4, Decisão 12; dívida (e) da fase 3; §12 fase 4, item 3
**Depende de:** planos 069 (seletor, cujo texto entra na conta), 070
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`npm run test:dist` reprova se: uma rota PT não tiver par EN (ou vice-versa); uma rota do mapa não
existir no `dist/`; um valor do dicionário `pt` aparecer no HTML de `/en/**` fora de elemento
`lang="pt-BR"`; ou um valor do dicionário `en` aparecer nas rotas PT fora de elemento `lang="en"`.

## Arquivos afetados

- `tests/dist/i18n.test.ts` — novo
- `tests/dist/html-texto.ts` — novo (extração de texto e atributos, removendo subárvores por `lang`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Nenhuma dependência nova** (sem parser de HTML do npm). Se o extrator não for viável
> sem dependência, pare e reporte.

## Contexto necessário

**Decisão 12** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): teste no `test:dist` que reprova
se qualquer valor do dicionário `pt` aparecer no HTML de `/en/**` **fora** de elementos
`lang="pt-BR"`, mais a inspeção manual (073). "O fatiamento define o comprimento mínimo das strings
comparadas e as exceções para valores iguais nos dois idiomas, cada uma listada no teste." Pega o
texto PT escrito direto num componente e o `en.ts` com valor copiado.

**Parâmetros fixados** (decisão de fatiamento 12 do README da fase):
- **O que se compara:** nós de texto e valores de atributo, **exceto** os atributos `href`, `src`,
  `srcset`, `class`, `id`, `style`, `lang`, `hreflang`, `rel`, `type`, `for`, `role`, `tabindex` e
  `data-astro-*`. Blocos `<script>` e `<style>` saem inteiros. Entidades HTML decodificadas antes da
  comparação (`&amp;`, `&#39;`, `&quot;`, `&lt;`, `&gt;` — o Astro escapa com `html-escaper`, ver
  `escapeLikeAstro` em `tests/dist/site-gerado.test.ts:80-89`).
- **Subárvores removidas:** em `/en/**`, todo elemento com `lang="pt-BR"` (e o que estiver dentro);
  nas rotas PT, todo elemento com `lang="en"` — **exceto o `<html>`**.
- **Comprimento mínimo:** 4 caracteres (depois de `trim`).
- **Casamento:** sensível a maiúsculas, com fronteira de palavra Unicode —
  `new RegExp('(?<![\\p{L}\\p{N}])' + escapado + '(?![\\p{L}\\p{N}])', 'u')`.
- **Funções do dicionário** (`pageTitle`, `portraitAlt`, `lessonNumber`, `dueDate`, `script.eyebrow`,
  `date.format`): avalie com um marcador sentinela e use os trechos fixos (ex.: `pt.course.lessonNumber`
  → `"Aula "` → aparado `"Aula"`), aplicando o mesmo mínimo de 4. `date.format` do PT não tem trecho
  fixo de 4+ caracteres — fica de fora, registrado.
- **Exceções:** `tests/i18n/excecoes-m07.ts` (057), reusado — nenhuma lista nova aqui.

**Extrator (`tests/dist/html-texto.ts`):** tokenizador mínimo sobre o HTML minificado (tags por regex,
pilha de elementos, lista dos elementos vazios do HTML — `area base br col embed hr img input link
meta source track wbr`), que devolve os textos e os atributos comparáveis, pulando as subárvores com o
`lang` pedido. O HTML do Astro é bem-formado; se um caso real quebrar a pilha, lance erro com a rota,
não engula. Teste o extrator dentro de `tests/dist/i18n.test.ts` com duas ou três strings pequenas
(aninhamento, elemento vazio, `lang` aninhado).

**Os testes:**
1. **Par EN/PT:** para cada `.html` de `dist/` fora de `admin/`, `counterpartPath(rota)` (056) aponta
   para um `.html` que existe; e toda rota EN tem par PT. As 404 pareiam com a Home do outro idioma
   (decisão de fatiamento 8) — trate-as pelo mapa, não por exceção solta.
2. **Mapa × `dist/` (dívida (e) da fase 3):** para cada `RouteKey` e cada idioma,
   `routePath(key, lang)` existe em `dist/`.
3. **M-07:** `pt` em `/en/**` fora de `lang="pt-BR"` → reprova nomeando rota, chave e trecho.
4. **Simétrico (§10.4):** `en` nas rotas PT fora de `lang="en"` → reprova. É o que pega texto de
   interface **em inglês** escrito direto num componente das rotas PT.

**Falso positivo possível, e o que fazer:** conteúdo do professor que **não** leva `lang` (os campos
"F" da tabela do README da fase — inclusive título e veículo de publicação, pela exceção da Decisão
13; os "P" levam `lang="pt-BR"` e saem da varredura) pode conter, por coincidência, uma palavra igual
a um valor do dicionário (ex.: um título de publicação começando por "Notas"). Se o teste reprovar por isso com o conteúdo real, **pare e reporte** com a rota e o trecho —
não acrescente exceção nem suba o mínimo para fazer passar; a saída é decisão do orquestrador.

**Por que isso fecha o item "Nenhuma string de interface hardcoded (§10.4)" do §12:** texto de
interface hardcoded em PT aparece em `/en` (teste 3), e em inglês aparece nas rotas PT (teste 4). O
limite — texto hardcoded que não coincide com nenhum valor de dicionário — fica para a inspeção manual
do 073; registre isso no cabeçalho do teste.

**Regras de código:** README da fase 4. Cabeçalho §10.1 nos dois arquivos, citando **M-07** e §10.4.

## Passos

1. Extrator e seus testes → verify: `npm run build:pipeline`; `npm run test:dist -- --reporter=verbose` colado (os testes do extrator verdes).
2. Os quatro testes → verify: `npm run test:dist -- --reporter=verbose` colado, com a lista de testes.
3. Canários, cada um revertido (arquivos commitados: `git checkout -- <arquivo>`), com rebuild quando mexer em `src/`: (a) `en.nav.about = 'Sobre'` em `src/i18n/en.ts` → teste 3 reprova (e o `en.test.ts` do 057 também); (b) texto `Publicações` escrito à mão num `<p>` do `PublicationsView` → teste 3 reprova em `/en/publications/`; (c) texto `Teaching` escrito à mão no `TeachingView` → teste 4 reprova em `/ensino/`; (d) apagar `dist/en/about/index.html` → teste 1 reprova → verify: as quatro saídas vermelhas, as reversões (`git status --short` limpo em `src/`) e o verde final colados.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] Toda rota PT tem par EN e vice-versa; toda rota do mapa existe no `dist/`
- [x] M-07 (valor `pt` em `/en/**` fora de `lang="pt-BR"`) e o simétrico (valor `en` nas rotas PT fora de `lang="en"`) com os parâmetros do Contexto
- [x] Exceções só de `tests/i18n/excecoes-m07.ts`; mínimo de 4 caracteres; fronteira de palavra
- [x] Extrator sem dependência nova, testado
- [x] Os quatro canários do passo 3 vermelhos, revertidos, e a suíte verde no fim
- [x] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

### Passo 1 — `build:pipeline` com os arquivos novos presentes (antes dos canários; o `test:dist` do passo 1 e do passo 2 é o bloco final, abaixo)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:08:10
   Duration  1.22s (transform 1.92s, setup 0ms, import 3.17s, tests 75ms, environment 0ms)

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
14:08:46 [content] Syncing content
14:08:46 [content] Synced content
14:08:46 [types] Generated 565ms
14:08:46 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

14:08:57 [content] Syncing content
14:08:57 [content] Synced content
14:08:57 [types] Generated 530ms
14:08:57 [build] output: "static"
14:08:57 [build] mode: "static"
14:08:57 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:08:57 [build] Collecting build info...
14:08:57 [build] ✓ Completed in 574ms.
14:08:57 [build] Building static entrypoints...
14:08:57 [vite] ✓ built in 438ms
14:08:57 [vite] ✓ built in 99ms
14:08:57 [build] Rearranging server assets...

 generating static routes 
14:08:57   ├─ /404.html (+14ms) 
14:08:57   ├─ /en/404/index.html (+6ms) 
14:08:57   ├─ /en/about/index.html (+8ms) 
14:08:57   ├─ /en/publications/index.html (+7ms) 
14:08:57   ├─ /en/research/index.html (+8ms) 
14:08:57   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+4ms) 
14:08:57   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+101ms) 
14:08:58   ├─ /en/teaching/index.html (+10ms) 
14:08:58   ├─ /en/index.html (+8ms) 
14:08:58   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:08:58   ├─ /ensino/2026-2-relatividade-geral/index.html (+30ms) 
14:08:58   ├─ /ensino/index.html (+5ms) 
14:08:58   ├─ /pesquisa/index.html (+4ms) 
14:08:58   ├─ /publicacoes/index.html (+4ms) 
14:08:58   ├─ /sobre/index.html (+4ms) 
14:08:58   ├─ /index.html (+3ms) 
14:08:58 ✓ Completed in 264ms.

14:08:58 [build] ✓ Completed in 839ms.
14:08:58 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
14:08:58 [build] 16 page(s) built in 1.45s
14:08:58 [build] Complete!
EXIT=0
```

### Passo 3 (a) — `en.nav.about = 'Sobre'` em `src/i18n/en.ts`: build

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:09:13
   Duration  1.26s (transform 1.92s, setup 0ms, import 3.24s, tests 81ms, environment 0ms)

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
14:09:50 [content] Syncing content
14:09:50 [content] Synced content
14:09:50 [types] Generated 530ms
14:09:50 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

14:10:01 [content] Syncing content
14:10:01 [content] Synced content
14:10:01 [types] Generated 525ms
14:10:01 [build] output: "static"
14:10:01 [build] mode: "static"
14:10:01 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:10:01 [build] Collecting build info...
14:10:01 [build] ✓ Completed in 570ms.
14:10:01 [build] Building static entrypoints...
14:10:01 [vite] ✓ built in 422ms
14:10:01 [vite] ✓ built in 98ms
14:10:01 [build] Rearranging server assets...

 generating static routes 
14:10:01   ├─ /404.html (+13ms) 
14:10:01   ├─ /en/404/index.html (+4ms) 
14:10:01   ├─ /en/about/index.html (+8ms) 
14:10:01   ├─ /en/publications/index.html (+6ms) 
14:10:01   ├─ /en/research/index.html (+6ms) 
14:10:01   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
14:10:01   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+101ms) 
14:10:02   ├─ /en/teaching/index.html (+7ms) 
14:10:02   ├─ /en/index.html (+6ms) 
14:10:02   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
14:10:02   ├─ /ensino/2026-2-relatividade-geral/index.html (+18ms) 
14:10:02   ├─ /ensino/index.html (+4ms) 
14:10:02   ├─ /pesquisa/index.html (+4ms) 
14:10:02   ├─ /publicacoes/index.html (+3ms) 
14:10:02   ├─ /sobre/index.html (+4ms) 
14:10:02   ├─ /index.html (+3ms) 
14:10:02 ✓ Completed in 234ms.

14:10:02 [build] ✓ Completed in 822ms.
14:10:02 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
14:10:02 [build] 16 page(s) built in 1.46s
14:10:02 [build] Complete!
EXIT=0
```

### Passo 3 (a) — `test:dist` (testes 3 e 4 vermelhos)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > pula a subárvore do lang pedido, com aninhamento 2ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > trata elemento vazio sem empilhar e traz atributos comparáveis, não os ignorados 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lang aninhado: sai só a subárvore do lang pedido, e o <html> nunca é pulado 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > descarta <script> e <style> inteiros e decodifica entidades do Astro 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lança erro nomeando a rota quando a pilha não fecha 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota PT (inclusive a 404) aponta, pelo mapa, para um .html EN que existe 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota EN (inclusive a 404) aponta, pelo mapa, para um .html PT que existe 1ms
 ✓ tests/dist/i18n.test.ts > mapa de rotas × dist/ (dívida (e) da fase 3) > routePath(chave, idioma) existe em dist/ para toda chave e todo idioma 0ms
 × tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando rota, chave e trecho 85ms
   → expected [ …(10) ] to deeply equal []
 × tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova nomeando rota, chave e trecho 74ms
   → expected [ …(10) ] to deeply equal []
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando 
rota, chave e trecho
AssertionError: expected [ …(10) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "/en/404.html | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/404.html | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/about/ | nav.about | \"Sobre\" em title: \"Sobre — Haroldo Lima Junior\"",
+   "/en/about/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/ | nav.about | \"Sobre\" em a: \"Sobre\"",
+   "/en/publications/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/research/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/teaching/2025-1-mecanica-classica/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/teaching/2026-2-relatividade-geral/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/en/teaching/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+ ]

 ❯ tests/dist/i18n.test.ts:241:26
    239|     expect(result.fragments).toBeGreaterThan(0);
    240|     expect(result.compared).toBeGreaterThan(0);
    241|     expect(result.found).toEqual([]);
       |                          ^
    242|   });
    243| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova 
nomeando rota, chave e trecho
AssertionError: expected [ …(10) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "/404.html | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/404.html | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/ensino/2025-1-mecanica-classica/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/ensino/2026-2-relatividade-geral/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/ensino/ | nav.about | \"Sobre\" em span: \"Sobre\"",
+   "/ | nav.about | \"Sobre\" em a: \"Sobre\"",
+   "/pesquisa/ | nav.about | \"Sobre\" em span: \"Sobre\"",
```

### Passo 3 (a) — `tests/i18n/en.test.ts` (vermelho)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/i18n/en.test.ts (12 tests | 1 failed) 12ms
     × todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts 4ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/i18n/en.test.ts > en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12) > todo par pt/en difere, 
exceto as chaves de tests/i18n/excecoes-m07.ts
AssertionError: expected [ 'nav.about: "Sobre"' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "nav.about: \"Sobre\"",
+ ]

 ❯ tests/i18n/en.test.ts:139:20
    137|       if (ptValue === enValue) iguais.push(`${path}: "${ptValue}"`);
    138|     });
    139|     expect(iguais).toEqual([]);
       |                    ^
    140|   });
    141| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
   Start at  14:10:06
   Duration  1.06s (transform 599ms, setup 0ms, import 906ms, tests 12ms, environment 0ms)

EXIT=1
```

### Passo 3 (b) — texto `Publicações` num `<p>` do `PublicationsView`: build

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:10:18
   Duration  1.20s (transform 1.91s, setup 0ms, import 3.14s, tests 72ms, environment 0ms)

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
14:10:54 [content] Syncing content
14:10:55 [content] Synced content
14:10:55 [types] Generated 569ms
14:10:55 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

14:11:05 [content] Syncing content
14:11:05 [content] Synced content
14:11:05 [types] Generated 554ms
14:11:05 [build] output: "static"
14:11:05 [build] mode: "static"
14:11:05 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:11:05 [build] Collecting build info...
14:11:05 [build] ✓ Completed in 599ms.
14:11:05 [build] Building static entrypoints...
14:11:06 [vite] ✓ built in 419ms
14:11:06 [vite] ✓ built in 96ms
14:11:06 [build] Rearranging server assets...

 generating static routes 
14:11:06   ├─ /404.html (+15ms) 
14:11:06   ├─ /en/404/index.html (+4ms) 
14:11:06   ├─ /en/about/index.html (+11ms) 
14:11:06   ├─ /en/publications/index.html (+8ms) 
14:11:06   ├─ /en/research/index.html (+9ms) 
14:11:06   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+4ms) 
14:11:06   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+167ms) 
14:11:06   ├─ /en/teaching/index.html (+9ms) 
14:11:06   ├─ /en/index.html (+7ms) 
14:11:06   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:11:06   ├─ /ensino/2026-2-relatividade-geral/index.html (+16ms) 
14:11:06   ├─ /ensino/index.html (+6ms) 
14:11:06   ├─ /pesquisa/index.html (+4ms) 
14:11:06   ├─ /publicacoes/index.html (+5ms) 
14:11:06   ├─ /sobre/index.html (+3ms) 
14:11:06   ├─ /index.html (+4ms) 
14:11:06 ✓ Completed in 319ms.

14:11:06 [build] ✓ Completed in 904ms.
14:11:06 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
14:11:06 [build] 16 page(s) built in 1.55s
14:11:06 [build] Complete!
EXIT=0
```

### Passo 3 (b) — `test:dist` (teste 3 vermelho em `/en/publications/`)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > pula a subárvore do lang pedido, com aninhamento 2ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > trata elemento vazio sem empilhar e traz atributos comparáveis, não os ignorados 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lang aninhado: sai só a subárvore do lang pedido, e o <html> nunca é pulado 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > descarta <script> e <style> inteiros e decodifica entidades do Astro 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lança erro nomeando a rota quando a pilha não fecha 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota PT (inclusive a 404) aponta, pelo mapa, para um .html EN que existe 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota EN (inclusive a 404) aponta, pelo mapa, para um .html PT que existe 1ms
 ✓ tests/dist/i18n.test.ts > mapa de rotas × dist/ (dívida (e) da fase 3) > routePath(chave, idioma) existe em dist/ para toda chave e todo idioma 0ms
 × tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando rota, chave e trecho 80ms
   → expected [ …(2) ] to deeply equal []
 ✓ tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova nomeando rota, chave e trecho 67ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando 
rota, chave e trecho
AssertionError: expected [ …(2) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "/en/publications/ | nav.publications | \"Publicações\" em p: \"Publicações\"",
+   "/en/publications/ | publications.title | \"Publicações\" em p: \"Publicações\"",
+ ]

 ❯ tests/dist/i18n.test.ts:241:26
    239|     expect(result.fragments).toBeGreaterThan(0);
    240|     expect(result.compared).toBeGreaterThan(0);
    241|     expect(result.found).toEqual([]);
       |                          ^
    242|   });
    243| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 9 passed (10)
   Start at  14:11:08
   Duration  401ms (transform 64ms, setup 0ms, import 95ms, tests 157ms, environment 0ms)

EXIT=1
```

### Passo 3 (c) — texto `Teaching` num `<p>` do `TeachingView`: build

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:11:17
   Duration  1.20s (transform 1.92s, setup 0ms, import 3.15s, tests 72ms, environment 0ms)

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
14:11:54 [content] Syncing content
14:11:54 [content] Synced content
14:11:54 [types] Generated 602ms
14:11:54 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

14:12:05 [content] Syncing content
14:12:05 [content] Synced content
14:12:05 [types] Generated 579ms
14:12:05 [build] output: "static"
14:12:05 [build] mode: "static"
14:12:05 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:12:05 [build] Collecting build info...
14:12:05 [build] ✓ Completed in 629ms.
14:12:05 [build] Building static entrypoints...
14:12:05 [vite] ✓ built in 469ms
14:12:05 [vite] ✓ built in 101ms
14:12:05 [build] Rearranging server assets...

 generating static routes 
14:12:05   ├─ /404.html (+18ms) 
14:12:05   ├─ /en/404/index.html (+6ms) 
14:12:05   ├─ /en/about/index.html (+10ms) 
14:12:05   ├─ /en/publications/index.html (+9ms) 
14:12:05   ├─ /en/research/index.html (+7ms) 
14:12:05   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+3ms) 
14:12:05   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+151ms) 
14:12:05   ├─ /en/teaching/index.html (+7ms) 
14:12:05   ├─ /en/index.html (+7ms) 
14:12:05   ├─ /ensino/2025-1-mecanica-classica/index.html (+2ms) 
14:12:05   ├─ /ensino/2026-2-relatividade-geral/index.html (+17ms) 
14:12:06   ├─ /ensino/index.html (+3ms) 
14:12:06   ├─ /pesquisa/index.html (+4ms) 
14:12:06   ├─ /publicacoes/index.html (+5ms) 
14:12:06   ├─ /sobre/index.html (+7ms) 
14:12:06   ├─ /index.html (+3ms) 
14:12:06 ✓ Completed in 306ms.

14:12:06 [build] ✓ Completed in 972ms.
14:12:06 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
14:12:06 [build] 16 page(s) built in 1.65s
14:12:06 [build] Complete!
EXIT=0
```

### Passo 3 (c) — `test:dist` (teste 4 vermelho em `/ensino/`)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > pula a subárvore do lang pedido, com aninhamento 2ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > trata elemento vazio sem empilhar e traz atributos comparáveis, não os ignorados 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lang aninhado: sai só a subárvore do lang pedido, e o <html> nunca é pulado 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > descarta <script> e <style> inteiros e decodifica entidades do Astro 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lança erro nomeando a rota quando a pilha não fecha 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota PT (inclusive a 404) aponta, pelo mapa, para um .html EN que existe 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota EN (inclusive a 404) aponta, pelo mapa, para um .html PT que existe 1ms
 ✓ tests/dist/i18n.test.ts > mapa de rotas × dist/ (dívida (e) da fase 3) > routePath(chave, idioma) existe em dist/ para toda chave e todo idioma 1ms
 ✓ tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando rota, chave e trecho 71ms
 × tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova nomeando rota, chave e trecho 70ms
   → expected [ Array(1) ] to deeply equal []
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova 
nomeando rota, chave e trecho
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "/ensino/ | nav.teaching | \"Teaching\" em p: \"Teaching\"",
+ ]

 ❯ tests/dist/i18n.test.ts:251:26
    249|     expect(result.fragments).toBeGreaterThan(0);
    250|     expect(result.compared).toBeGreaterThan(0);
    251|     expect(result.found).toEqual([]);
       |                          ^
    252|   });
    253| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 9 passed (10)
   Start at  14:12:07
   Duration  413ms (transform 65ms, setup 0ms, import 94ms, tests 148ms, environment 0ms)

EXIT=1
```

### Passo 3 (d) — build limpo antes de apagar o arquivo

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:12:17
   Duration  1.22s (transform 1.91s, setup 0ms, import 3.22s, tests 73ms, environment 0ms)

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
14:12:53 [content] Syncing content
14:12:53 [content] Synced content
14:12:53 [types] Generated 533ms
14:12:53 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

14:13:04 [content] Syncing content
14:13:04 [content] Synced content
14:13:04 [types] Generated 571ms
14:13:04 [build] output: "static"
14:13:04 [build] mode: "static"
14:13:04 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:13:04 [build] Collecting build info...
14:13:04 [build] ✓ Completed in 616ms.
14:13:04 [build] Building static entrypoints...
14:13:04 [vite] ✓ built in 449ms
14:13:04 [vite] ✓ built in 106ms
14:13:04 [build] Rearranging server assets...

 generating static routes 
14:13:05   ├─ /404.html (+17ms) 
14:13:05   ├─ /en/404/index.html (+5ms) 
14:13:05   ├─ /en/about/index.html (+10ms) 
14:13:05   ├─ /en/publications/index.html (+7ms) 
14:13:05   ├─ /en/research/index.html (+8ms) 
14:13:05   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+4ms) 
14:13:05   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+115ms) 
14:13:05   ├─ /en/teaching/index.html (+9ms) 
14:13:05   ├─ /en/index.html (+6ms) 
14:13:05   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:13:05   ├─ /ensino/2026-2-relatividade-geral/index.html (+18ms) 
14:13:05   ├─ /ensino/index.html (+4ms) 
14:13:05   ├─ /pesquisa/index.html (+4ms) 
14:13:05   ├─ /publicacoes/index.html (+4ms) 
14:13:05   ├─ /sobre/index.html (+4ms) 
14:13:05   ├─ /index.html (+3ms) 
14:13:05 ✓ Completed in 271ms.

14:13:05 [build] ✓ Completed in 905ms.
14:13:05 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
14:13:05 [build] 16 page(s) built in 1.57s
14:13:05 [build] Complete!
EXIT=0
```

### Passo 3 (d) — `dist/en/about/index.html` apagado: `test:dist` (testes 1 e 2 vermelhos)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > pula a subárvore do lang pedido, com aninhamento 2ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > trata elemento vazio sem empilhar e traz atributos comparáveis, não os ignorados 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lang aninhado: sai só a subárvore do lang pedido, e o <html> nunca é pulado 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > descarta <script> e <style> inteiros e decodifica entidades do Astro 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lança erro nomeando a rota quando a pilha não fecha 1ms
 × tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota PT (inclusive a 404) aponta, pelo mapa, para um .html EN que existe 6ms
   → expected [ '/sobre/' ] to deeply equal []
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota EN (inclusive a 404) aponta, pelo mapa, para um .html PT que existe 1ms
 × tests/dist/i18n.test.ts > mapa de rotas × dist/ (dívida (e) da fase 3) > routePath(chave, idioma) existe em dist/ para toda chave e todo idioma 1ms
   → expected [ 'about/en: /en/about/' ] to deeply equal []
 ✓ tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando rota, chave e trecho 68ms
 ✓ tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova nomeando rota, chave e trecho 71ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota PT (inclusive a 404) aponta, pelo 
mapa, para um .html EN que existe
AssertionError: expected [ '/sobre/' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "/sobre/",
+ ]

 ❯ tests/dist/i18n.test.ts:147:21
    145|     const { checked, missing } = semPar('pt');
    146|     expect(checked).toBeGreaterThan(0);
    147|     expect(missing).toEqual([]);
       |                     ^
    148|   });
    149|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/dist/i18n.test.ts > mapa de rotas × dist/ (dívida (e) da fase 3) > routePath(chave, idioma) existe em 
dist/ para toda chave e todo idioma
AssertionError: expected [ 'about/en: /en/about/' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "about/en: /en/about/",
+ ]

 ❯ tests/dist/i18n.test.ts:170:21
    168|     }
    169|     expect(checked).toBe(keys.length * 2);
    170|     expect(missing).toEqual([]);
       |                     ^
    171|   });
    172| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 8 passed (10)
   Start at  14:13:07
   Duration  410ms (transform 76ms, setup 0ms, import 105ms, tests 153ms, environment 0ms)

EXIT=1
```

### Reversões — `git status --short` e `git diff --stat -- src` depois dos quatro canários e antes do build final (sem saída do `git diff` = `src/` limpo)

```
?? tests/dist/html-texto.ts
?? tests/dist/i18n.test.ts
--- git diff --stat -- src
```

### Passo 4 — `npm run lint`

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 4 — `npm run format:check`

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 4 — `npm run test:coverage`

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  365 passed (365)
   Start at  14:13:23
   Duration  1.95s (transform 5.76s, setup 0ms, import 10.34s, tests 393ms, environment 4ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 299/299 )
Branches     : 100% ( 152/152 )
Functions    : 100% ( 80/80 )
Lines        : 100% ( 267/267 )
================================================================================
EXIT=0
```

### Final — build limpo depois de todos os canários (`build:pipeline`, com carimbos)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:13:27
   Duration  1.20s (transform 1.87s, setup 0ms, import 3.13s, tests 71ms, environment 1ms)

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
14:14:03 [content] Syncing content
14:14:03 [content] Synced content
14:14:03 [types] Generated 534ms
14:14:03 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (95 files): 
- 0 errors
- 0 warnings
- 0 hints

14:14:14 [content] Syncing content
14:14:14 [content] Synced content
14:14:14 [types] Generated 595ms
14:14:14 [build] output: "static"
14:14:14 [build] mode: "static"
14:14:14 [build] directory: S:\Projetos\academic_page\haroldo\dist\
14:14:14 [build] Collecting build info...
14:14:14 [build] ✓ Completed in 643ms.
14:14:14 [build] Building static entrypoints...
14:14:15 [vite] ✓ built in 459ms
14:14:15 [vite] ✓ built in 99ms
14:14:15 [build] Rearranging server assets...

 generating static routes 
14:14:15   ├─ /404.html (+16ms) 
14:14:15   ├─ /en/404/index.html (+7ms) 
14:14:15   ├─ /en/about/index.html (+11ms) 
14:14:15   ├─ /en/publications/index.html (+8ms) 
14:14:15   ├─ /en/research/index.html (+7ms) 
14:14:15   ├─ /en/teaching/2025-1-mecanica-classica/index.html (+6ms) 
14:14:15   ├─ /en/teaching/2026-2-relatividade-geral/index.html (+129ms) 
14:14:15   ├─ /en/teaching/index.html (+10ms) 
14:14:15   ├─ /en/index.html (+9ms) 
14:14:15   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
14:14:15   ├─ /ensino/2026-2-relatividade-geral/index.html (+22ms) 
14:14:15   ├─ /ensino/index.html (+4ms) 
14:14:15   ├─ /pesquisa/index.html (+4ms) 
14:14:15   ├─ /publicacoes/index.html (+4ms) 
14:14:15   ├─ /sobre/index.html (+4ms) 
14:14:15   ├─ /index.html (+3ms) 
14:14:15 ✓ Completed in 292ms.

14:14:15 [build] ✓ Completed in 890ms.
14:14:15 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
14:14:15 [build] 16 page(s) built in 1.59s
14:14:15 [build] Complete!
EXIT=0

FullName                                                   Length LastWriteTime      
--------                                                   ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html            6883 02/10/2026 14:14:15
S:\Projetos\academic_page\haroldo\dist\en\about\index.html  11498 02/10/2026 14:14:15
S:\Projetos\academic_page\haroldo\dist\en\404.html           9566 02/10/2026 14:14:15
S:\Projetos\academic_page\haroldo\dist\sitemap-index.xml      204 02/10/2026 14:14:15
```

### Final — `npm run test:dist -- --reporter=verbose` (passos 1 e 2: extrator, os quatro testes e a suíte antiga, tudo verde)

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts --reporter=verbose


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

stdout | tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)
Rota → bytes gzip de JS:
  /404.html → 1412 bytes
  /en/404.html → 1412 bytes
  /en/about/index.html → 1412 bytes
  /en/index.html → 1153 bytes
  /en/publications/index.html → 2876 bytes
  /en/research/index.html → 1412 bytes
  /en/teaching/2025-1-mecanica-classica/index.html → 1975 bytes
  /en/teaching/2026-2-relatividade-geral/index.html → 2322 bytes
  /en/teaching/index.html → 1412 bytes
  /ensino/2025-1-mecanica-classica/index.html → 1975 bytes
  /ensino/2026-2-relatividade-geral/index.html → 2322 bytes
  /ensino/index.html → 1412 bytes
  /index.html → 1153 bytes
  /pesquisa/index.html → 1412 bytes
  /publicacoes/index.html → 2876 bytes
  /sobre/index.html → 1412 bytes

 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > pula a subárvore do lang pedido, com aninhamento 2ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > trata elemento vazio sem empilhar e traz atributos comparáveis, não os ignorados 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lang aninhado: sai só a subárvore do lang pedido, e o <html> nunca é pulado 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > descarta <script> e <style> inteiros e decodifica entidades do Astro 0ms
 ✓ tests/dist/i18n.test.ts > extrator de texto do HTML (tests/dist/html-texto.ts) > lança erro nomeando a rota quando a pilha não fecha 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota PT (inclusive a 404) aponta, pelo mapa, para um .html EN que existe 1ms
 ✓ tests/dist/i18n.test.ts > par EN/PT de toda rota (§11, RF-29) > toda rota EN (inclusive a 404) aponta, pelo mapa, para um .html PT que existe 1ms
 ✓ tests/dist/i18n.test.ts > mapa de rotas × dist/ (dívida (e) da fase 3) > routePath(chave, idioma) existe em dist/ para toda chave e todo idioma 1ms
 ✓ tests/dist/i18n.test.ts > M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR" > reprova nomeando rota, chave e trecho 80ms
 ✓ tests/dist/i18n.test.ts > §10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en" > reprova nomeando rota, chave e trecho 70ms
 ✓ tests/dist/site-gerado.test.ts > rotas fixas existem (§11) > dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes, dist/404.html e dist/en/404.html existem 2ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/ensino/<courseSlug>/index.html 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > toda disciplina publicada tem dist/en/teaching/<courseSlug>/index.html (mesmo slug) 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/en/teaching/ sem disciplina publicada correspondente 0ms
 ✓ tests/dist/site-gerado.test.ts > disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10) > nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página) 0ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > a varredura inclui as rotas de dist/en/ (o rascunho também some em /en/) 2ms
 ✓ tests/dist/site-gerado.test.ts > rascunho nunca aparece em HTML algum (RN-01) > título de cada um dos 1 rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado) 1ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e `lang` por árvore (pt-BR; en sob dist/en/) (§8.3) > todo .html de dist/ (fora de admin/) tem exatamente um <h1> 11ms
 ✓ tests/dist/site-gerado.test.ts > um <h1> por página e `lang` por árvore (pt-BR; en sob dist/en/) (§8.3) > todo .html de dist/ (fora de admin/) declara o <html lang> da sua árvore (pt-BR; en sob dist/en/) 9ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/ o aviso aparece no máximo uma vez no <main> 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/about/ o aviso aparece exatamente 0 vezes no <main> (Decisão 16) 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/research/ o aviso aparece no máximo uma vez no <main> 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/teaching/ e em cada disciplina EN o aviso aparece no máximo uma vez no <main> 2ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > em /en/publications/ não há aviso nem lang="pt-BR" no <main> 1ms
 ✓ tests/dist/site-gerado.test.ts > aviso de idioma (F-07, RF-28) > nenhuma rota fora de dist/en/ traz o aviso 6ms
 ✓ tests/dist/site-gerado.test.ts > nenhuma fonte de terceiro (RNF-02) > nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com 13ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline) 14ms
 ✓ tests/dist/site-gerado.test.ts > JS < 50 KB gzip por rota e zero framework de UI (RNF-02) > nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/) 10ms
 ✓ tests/dist/site-gerado.test.ts > View Transitions: nomes únicos por página > cada .html tem no máximo um vt-nome e um vt-menu, e ao menos um vt-nome 9ms
 ✓ tests/dist/site-gerado.test.ts > seletor de idioma (RF-29) > toda página tem um único link com hreflang, para o par da rota, com o texto do idioma de destino 12ms
 ✓ tests/dist/site-gerado.test.ts > seletor de idioma (RF-29) > /ensino/ leva a /en/teaching/ e a disciplina troca só o prefixo e o segmento 3ms
 ✓ tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > a origem do canonical da Home é a de `siteConfig.siteUrl` 1ms
 ✓ tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > toda página (fora as 404) tem um canonical, igual à URL da própria rota 7ms
 ✓ tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > toda página tem os alternates pt-BR, en e x-default, absolutos, com x-default = pt-BR 9ms
 ✓ tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > reciprocidade: a página apontada pelo alternate en existe e aponta de volta no pt-BR 21ms
 ✓ tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > dist/404.html não tem canonical nem alternate 1ms
 ✓ tests/dist/site-gerado.test.ts > canonical e hreflang (RF-30, RN-09) > dist/en/404.html não tem canonical nem alternate 1ms
 ✓ tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > o sitemap-index.xml aponta para o sitemap-0.xml 1ms
 ✓ tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > o conjunto de <loc> é exatamente o das rotas .html de dist/ (fora de admin/ e das 404) 0ms
 ✓ tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > nenhum <loc> com /404 nem /admin, e nenhum duplicado 0ms
 ✓ tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > todo <loc> de disciplina tem o slug de uma disciplina publicada (nenhum rascunho) 1ms
 ✓ tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > todo <loc> traz os alternates pt-BR, en e x-default, iguais aos do <head> da mesma página 8ms
 ✓ tests/dist/site-gerado.test.ts > sitemap bilíngue (RF-30, RN-01) > os pares são recíprocos: o par aponta para um <loc> que aponta de volta 1ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > HTML de /publicacoes/ não carrega o ScrollTrigger de saída (GSAP sob demanda) 1ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > HTML de /en/publications/ não carrega o ScrollTrigger de saída (GSAP sob demanda) 1ms
 ✓ tests/dist/site-gerado.test.ts > desempenho e metadados > dist/favicon.svg existe e toda página o declara 9ms
 ✓ tests/dist/site-gerado.test.ts > navegação principal sem "Início" > em toda página, o <nav> principal não tem link para "/" — a volta à Home é o nome 10ms
 ✓ tests/dist/site-gerado.test.ts > página de disciplina: seta de volta no lugar da trilha > pt: sem "Trilha de navegação"; um link "Voltar para Ensino" para /ensino/ antes do <h1> 2ms
 ✓ tests/dist/site-gerado.test.ts > página de disciplina: seta de volta no lugar da trilha > en: sem "Trilha de navegação"; um link "All courses" para /en/teaching/ antes do <h1> 1ms
 ✓ tests/dist/site-gerado.test.ts > contato da Home igual ao da Sobre > mesmos links, na mesma sequência, começando pelo e-mail 1ms
 ✓ tests/dist/site-gerado.test.ts > contato da Home igual ao da Sobre > o mesmo vale em inglês (/en/ e /en/about/) 1ms
 ✓ tests/dist/site-gerado.test.ts > cabeçalho de página fora da área que rola > nas páginas internas, o <h1> vem antes do #conteudo (que rola), não dentro dele 10ms
 ✓ tests/dist/site-gerado.test.ts > sublinhado que segue o cursor (link-traco) no menu e no contato > todo link do menu principal usa link-traco 10ms
 ✓ tests/dist/site-gerado.test.ts > sublinhado que segue o cursor (link-traco) no menu e no contato > todo link do contato (Home e Sobre) usa link-traco 3ms

 Test Files  2 passed (2)
      Tests  54 passed (54)
   Start at  14:14:17
   Duration  525ms (transform 155ms, setup 0ms, import 281ms, tests 362ms, environment 0ms)

EXIT=0
```

### Contagem de linhas dos arquivos novos

`tests/dist/i18n.test.ts`: 253 linhas; `tests/dist/html-texto.ts`: 136 linhas (`wc -l`). Arquivos de teste, fora do alvo de 150 do §10.4.

### O que NÃO foi rodado

`npm audit`, o CI do GitHub e o `scripts/verificar-promocao.mjs` (do orquestrador); nenhum passo de navegador (o plano não tem). Sem commit; `Status:` fica `TODO`.

### Sem BOM no plano

```
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0
```
