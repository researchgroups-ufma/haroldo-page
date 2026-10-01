# Plano 065 — `/en/` e `/en/about/`, com o aviso de idioma (F-07)

**Status:** DONE
**RFs cobertos:** **RF-28**, RF-14, RN-06, RN-09, **F-07**, RF-20, RF-21, RF-26, §8.3; sabatina fase 4, Decisões 4, 6, 7 e 13; sabatina fase 4, Decisão 16; §12 fase 4, item 1
**Depende de:** planos 057 (**DONE**, com a revisão do stakeholder), 061 (fallback), 062 (views)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 9)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existem `/en/` e `/en/about/`, com a interface em inglês e o conteúdo do perfil resolvido campo a
campo: traduzido onde há `en`, em português com `lang="pt-BR"` onde não há, e **um** aviso discreto na
página quando algo caiu no português. É a primeira árvore `/en` servida. As rotas PT não mudam.

## Arquivos afetados

- `src/pages/en/index.astro`, `src/pages/en/about.astro` — novos (páginas finas)
- `src/pages/en/.gitkeep` — removido (a pasta passa a ter arquivo)
- `src/views/HomeView.astro`, `src/views/AboutView.astro` — `localize` nos campos e o aviso
- `src/components/FallbackNotice.astro` — novo (o aviso)
- `src/components/LangText.astro` — novo (texto em linha que leva `lang` só quando caiu no PT)
- `tests/dist/site-gerado.test.ts` — rotas EN, `lang` por árvore, rótulo da navegação por idioma, aviso
- `docs/identidade-visual.md` — seção do aviso e nota das rotas `/en`

> **Emenda de 2026-10-01 (ciclo 1):** (1) componentes novos, autorizados para levar as views abaixo de
> 150 linhas (§10.4): `src/components/ProfileLists.astro` (listas de formação e áreas da Home) e
> `src/components/TimelineSection.astro` (bloco de timeline da Sobre). (2) Decisão 16 (sabatina fase 4,
> 2026-10-01): a Sobre EN **não mostra o aviso**; o `lang="pt-BR"` continua; a Home EN mantém o aviso.
> `FallbackNotice` e o `hasFallback` saem da `AboutView`. (3) O canário (d) do passo 6 perde o objeto
> (não há aviso na Sobre para ligar) e **sai do plano**; o (c) continua e prova o `lang="pt-BR"` dos
> campos "P", com o aviso em 0 por construção.

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Canário em `content/` autorizado só em `content/perfil/index.md`** (passo 6),
> revertido por `git checkout -- content/perfil/index.md`.

## Contexto necessário

**Decisão 4** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): **um aviso por página**, não badge
por item; se qualquer texto de conteúdo exibido numa rota `/en` caiu no português, a página mostra um
único aviso discreto, texto do dicionário `en` (`t.fallback.notice`, 057); e **todo elemento cujo texto
caiu no PT recebe `lang="pt-BR"`**. **Decisão 13** (Q-F4-1, 2026-09-24, "`lang` sim, aviso não"): texto
em português **sem** campo em inglês (tipo "P") também recebe `lang="pt-BR"` em `/en`, mas **não** liga o
aviso — o aviso é só do fallback de campo "T". **Decisão 7:** a tradução de `formacao[i]`, `atuacao[i]` e
`areas[i]` vive em `item.en` (060). Tabela "Classificação dos campos exibidos em `/en`" do README da
fase: a coluna **Tipo** diz qual função cada campo usa — "T" por `localize`/`localizeOptional`, "P"
por `portugueseOnly`, "F" por nenhuma (061).

**Campos desta rota:**
- Home: `cargo`, `instituicao`, `resumo_home` → `localize(pt, perfil.en?.x, lang)`; `departamento` →
  `localizeOptional`; `formacao[i]`: `grau`/`curso` com `item.en?.grau`/`item.en?.curso`, `ano`
  factual; `areas[i].nome` com `item.en?.nome`.
- Sobre: `bio` (`localize` e depois `toParagraphs` do `text`); timeline de formação (título `grau —
  curso` como na Home; `place` = `portugueseOnly(instituicao, lang)`); atuação (`cargo` com
  `item.en?.cargo`; `instituicao` e `periodo` por `portugueseOnly`).
- Campo "P" passa por `portugueseOnly(texto, lang)` (061), **nunca** por `localize(texto, undefined,
  lang)` — este devolve `fellBack: true` e ligaria o aviso. Os `LocalizedText` de campo "P" podem entrar
  no `hasFallback([...])` sem efeito, mas não precisam.

**Como o `lang` chega ao HTML, sem mudar as páginas PT:** em elemento de bloco, `lang={x.lang}` no
próprio elemento (`<p lang={cargo.lang}>`) — em PT `x.lang` é `undefined` e o Astro não renderiza o
atributo. Texto **em linha** que divide elemento com outro texto (ex.: `{ano} · {grau} — {curso}`) usa
`LangText.astro`: prop `value: LocalizedText`; renderiza só o texto quando `value.lang` é ausente e
`<span lang={value.lang}>{value.text}</span>` quando não é — assim o HTML PT fica idêntico (o
comparador prova). Parágrafos da `bio`: o `lang` vai no contêiner dos parágrafos.

**Aviso (`FallbackNotice.astro`):** prop `show: boolean`; renderiza `<p class="text-pequeno
text-secundario">{t.fallback.notice}</p>` (idioma pelo caminho) **só** quando `show` e o idioma do
caminho é `en`; caso contrário, nada. A view calcula `show = hasFallback([...todos os LocalizedText
exibidos])` (061). **Lugar (decisão de fatiamento 7):** nas páginas internas, primeiro filho do
conteúdo (slot padrão do `BaseLayout`, logo abaixo da régua do cabeçalho), com o mesmo recuo
(`px-margem`) e `pt-4`; na Home, primeira linha sob a régua (`regua-entrada`), na largura toda da
grade. **Home e Sobre não podem ganhar rolagem vertical a 1440×800 nem a 1366×650** (§4 da
identidade): se o aviso quebrar isso, pare e reporte — não mude layout para caber.

**Páginas finas:** `src/pages/en/index.astro` → `<HomeView lang="en" />`; `src/pages/en/about.astro` →
`<AboutView lang="en" />`. Cabeçalho §10.1 completo.

**`tests/dist/site-gerado.test.ts` (461 linhas) — o que quebra com a primeira rota EN e tem de mudar
aqui:**
- 184–201: afirma `<html lang="pt-BR">` em **todo** `.html` → passa a exigir `HTML_LANG[localeFromPath(rota)]`
  (`lang="en"` sob `dist/en/`).
- 376–387 e 441–449: procuram `<nav aria-label="Navegação principal"` → o rótulo vem de
  `strings(localeFromPath(rota)).site.mainNavLabel`.
- 425–435: pula só `dist/index.html` como Home → pular também `dist/en/index.html`.
- 100–114 (rotas fixas): acrescentar `en/index.html` e `en/about/index.html`.
- 409–423 (contato da Home igual ao da Sobre): acrescentar o par EN.
- Novo: em `dist/en/index.html` e `dist/en/about/index.html`, o texto de `en.fallback.notice` aparece
  **no máximo uma vez** dentro do `<main>` (`grep -o`-equivalente), e em nenhuma rota PT.
A lógica de rota → idioma usa `localeFromPath` de `src/lib/routes.ts` (o teste já importa de `src/lib`).

**`docs/identidade-visual.md`:** acrescente em §5 uma subseção "Aviso de idioma (F-07)" (o quê, onde,
estilo, quando aparece, que o `lang="pt-BR"` do elemento é independente do aviso), e no começo do §6
um parágrafo "Rotas em inglês": `/en/…` repetem o layout da rota PT; texto de interface do `en.ts`;
conteúdo campo a campo com fallback; data como "March 15, 2026". `docs/` está no `format:check`.

**Regras de código:** README da fase 4. Cite **F-07** no aviso, **RN-06** no fallback, **RF-28** na
rota EN.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `LangText.astro`, `FallbackNotice.astro` e o `localize` nas duas views → verify: `npx astro check` colado.
3. Páginas finas EN; remover `src/pages/en/.gitkeep` → verify: `npm run build:pipeline` colado, com `/en/index.html` e `/en/about/index.html` na lista de rotas geradas.
4. PT idêntico → verify: `retrato <scratch>\depois.json`; `comparar antes.json depois.json --ignorar '^en/'` colado — toda rota PT `IGUAL`, as EN `SÓ DEPOIS`/`IGNORADA`, exit 0.
5. HTML EN com o conteúdo real → verify: cole, escopado ao `<main>` de cada uma (`grep -o … | wc -l`): contagem de `lang="pt-BR"`, contagem do texto do aviso (esperado 1 nas duas), `<html lang="en"`, e o `<title>`.
6. Canários **em `content/perfil/index.md`** (autorizado): (a) **Home toda traduzida** — preencha `en.cargo`, `en.instituicao`, `en.departamento`, `en.resumo_home`, `en` de todos os itens de `formacao` e de `areas` → build → no `<main>` de `dist/en/index.html`: zero `lang="pt-BR"` e zero aviso; (b) **tradução parcial** — só `formacao[0].en.grau` → o grau sai em inglês sem `lang`, o curso do mesmo item sai com `lang="pt-BR"` e o aviso aparece uma vez; (c) **Sobre com todo campo "T" traduzido** — além do (a), preencha `en.bio` e `en.cargo` de todos os itens de `atuacao` → build → no `<main>` de `dist/en/about/index.html`: **zero** aviso e contagem de `lang="pt-BR"` igual ao número de campos "P" exibidos (instituições de formação e atuação, e `periodo`) — prova de que campo "P" marca o idioma sem ligar o aviso (Decisão 13); (d) com o conteúdo do (c) ainda aplicado, troque **temporariamente** o `portugueseOnly` da `instituicao` da formação por `localize(instituicao, undefined, lang)` na `AboutView` → build → o aviso aparece (1) — desfaça a troca; reverter com `git checkout -- content/perfil/index.md`; rebuild → verify: saídas de (a) a (d), `git status --short` sem `content/` e `git diff -- content/` vazio colados.
7. `tests/dist/site-gerado.test.ts` atualizado → verify: `npm run test:dist` colado (depois do rebuild do passo 6).
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
9. **Orquestrador — navegador:** `/en/` e `/en/about/` a 360/768/1440 — `[scrollWidth, clientWidth]`; a 1440×800 e 1366×650, `[scrollHeight, clientHeight]` do documento iguais (sem rolagem vertical); aviso visível uma vez, abaixo da régua; `document.querySelectorAll('main [lang="pt-BR"]').length` transcrito; transição entre `/en/` e `/en/about/`; interface toda em inglês (listar qualquer texto em português **fora** de elemento `lang="pt-BR"` — esperado nenhum).

## Critérios de aceitação

- [x] `/en/` e `/en/about/` gerados com `<html lang="en">` e interface do `en.ts`
- [x] Campo traduzido sai em inglês sem `lang`; campo sem tradução sai em português com `lang="pt-BR"` (conteúdo real e canário (b))
- [x] Aviso aparece uma vez na Home EN quando algo caiu no PT, **não aparece** com a Home toda traduzida (canário (a)) e **nunca aparece na Sobre EN** (Decisão 16)
- [x] Campos "P" (instituições e `periodo`) com `lang="pt-BR"` em `/en` e **sem** ligar o aviso (Decisão 13; canário (c))
- [x] Rotas PT idênticas (comparador com `--ignorar '^en/'`)
- [x] `tests/dist/site-gerado.test.ts` com `lang` por árvore, rótulo de navegação por idioma, Home EN, rotas EN e o aviso (Home EN no máximo 1; Sobre EN exatamente 0, Decisão 16)
- [x] `docs/identidade-visual.md` descreve o aviso (com a exceção da Sobre EN) e as rotas `/en`
- [x] Navegador: sem rolagem horizontal; Home e Sobre sem rolagem vertical nas duas alturas; aviso único (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

### Correções do ciclo 1 (2026-10-01)

Aviso removido da `AboutView` (Decisão 16); extraídos `src/components/ProfileLists.astro` e `src/components/TimelineSection.astro`; cabeçalhos de `HomeView`, `AboutView` e `tests/dist/site-gerado.test.ts` atualizados; teste da Sobre EN passa a exigir 0 avisos; §5.6 da identidade com a exceção; canário (d) removido do plano. Os blocos de build dos canários (a)–(c) tiveram os códigos de escape ANSI removidos antes da inserção; nenhum outro caractere foi alterado e a captura bruta não foi guardada. Blocos recapturados abaixo: passos 2 a 8 (o retrato "antes" do passo 1 não foi regerado).

### Passo 1 — retrato "antes" (PT, antes de qualquer edição de `src/`, execução original)

Fim do `npm run build:pipeline` (últimas 14 linhas do `.txt`; as rotas são as 8 de antes) e `node scripts/comparar-dist.mjs retrato antes.json`. Não regerado no ciclo 1.

build "antes" (fim):

```
11:50:59   ├─ /404.html (+20ms) 
11:50:59   ├─ /ensino/2025-1-mecanica-classica/index.html (+7ms) 
11:50:59   ├─ /ensino/2026-2-relatividade-geral/index.html (+138ms) 
11:50:59   ├─ /ensino/index.html (+8ms) 
11:50:59   ├─ /pesquisa/index.html (+10ms) 
11:50:59   ├─ /publicacoes/index.html (+10ms) 
11:50:59   ├─ /sobre/index.html (+8ms) 
11:50:59   ├─ /index.html (+4ms) 
11:50:59 ✓ Completed in 257ms.

11:50:59 [build] ✓ Completed in 1.34s.
11:50:59 [build] 8 page(s) built in 2.11s
11:50:59 [build] Complete!
EXIT=0
```

retrato antes:

```
retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a575f299-6965-4a5e-bba7-bd2e7a5217af\scratchpad\antes.json
EXIT=0
```

### Passo 2 — `astro check` (estado final do código)

Rodado depois da última edição de `src/`.

npx astro check:

```
12:24:15 [content] Syncing content
12:24:16 [content] Synced content
12:24:16 [types] Generated 583ms
12:24:16 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (87 files): 
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

### Passo 3 — build com as páginas finas EN (build final, depois da última edição)

`npm run build:pipeline` completo, seguido da listagem de carimbos. `/en/index.html` e `/en/about/index.html` estão na lista de rotas geradas; `src/pages/en/.gitkeep` foi removido.

npm run build:pipeline:

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  12:24:24
   Duration  1.25s (transform 1.97s, setup 0ms, import 3.24s, tests 84ms, environment 0ms)

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
12:24:56 [content] Syncing content
12:24:56 [content] Synced content
12:24:56 [types] Generated 615ms
12:24:56 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (87 files): 
- 0 errors
- 0 warnings
- 0 hints

12:25:05 [content] Syncing content
12:25:05 [content] Synced content
12:25:05 [types] Generated 540ms
12:25:05 [build] output: "static"
12:25:05 [build] mode: "static"
12:25:05 [build] directory: S:\Projetos\academic_page\haroldo\dist\
12:25:05 [build] Collecting build info...
12:25:05 [build] ✓ Completed in 588ms.
12:25:05 [build] Building static entrypoints...
12:25:06 [vite] ✓ built in 417ms
12:25:06 [vite] ✓ built in 102ms
12:25:06 [build] Rearranging server assets...

 generating static routes 
12:25:06   ├─ /404.html (+12ms) 
12:25:06   ├─ /en/about/index.html (+7ms) 
12:25:06   ├─ /en/index.html (+5ms) 
12:25:06   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
12:25:06   ├─ /ensino/2026-2-relatividade-geral/index.html (+94ms) 
12:25:06   ├─ /ensino/index.html (+6ms) 
12:25:06   ├─ /pesquisa/index.html (+6ms) 
12:25:06   ├─ /publicacoes/index.html (+5ms) 
12:25:06   ├─ /sobre/index.html (+4ms) 
12:25:06   ├─ /index.html (+3ms) 
12:25:06 ✓ Completed in 182ms.

12:25:06 [build] ✓ Completed in 794ms.
12:25:06 [build] 10 page(s) built in 1.44s
12:25:06 [build] Complete!
EXIT=0

FullName                                                   Length LastWriteTime      
--------                                                   ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html            6266 01/10/2026 12:25:06
S:\Projetos\academic_page\haroldo\dist\en\index.html         6764 01/10/2026 12:25:06
S:\Projetos\academic_page\haroldo\dist\en\about\index.html  10848 01/10/2026 12:25:06
```

### Passo 4 — rotas PT idênticas

`retrato depois.json` e `comparar antes.json depois.json --ignorar '^en/'` (o `antes.json` é o do passo 1), sobre o `dist/` do build final.

retrato depois:

```
retrato: 10 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\a575f299-6965-4a5e-bba7-bd2e7a5217af\scratchpad\depois.json
EXIT=0
```

comparar:

```
IGUAL      404.html
IGNORADA   en/about/index.html
IGNORADA   en/index.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 2
EXIT=0
```

### Passo 5 — HTML EN com o conteúdo real (build final)

Contagens sobre o `<main>` de cada rota (`grep -o '<main.*</main>' | grep -o <padrão> | wc -l`); `<html lang="en"` e `<title>` sobre o arquivo todo. Home EN: aviso 1. Sobre EN: aviso 0 por construção (sabatina fase 4, Decisão 16), com `lang="pt-BR"` mantido. O `<title>` da Home EN é o `siteConfig.title` (texto fixo, fora do dicionário), igual ao da Home PT; fora do escopo deste plano.

medir.sh dist/en/index.html dist/en/about/index.html:

```
== dist/en/index.html
lang="pt-BR" no main: 18
aviso no main: 1
<html lang="en": 1
title: <title>Prof. Haroldo C. D. Lima Junior</title>
== dist/en/about/index.html
lang="pt-BR" no main: 19
aviso no main: 0
<html lang="en": 1
title: <title>About — Haroldo Lima Junior</title>
```

### Passo 6(a) — Home toda traduzida

Canário aplicado em `content/perfil/index.md`, build, e medição de `dist/en/index.html`: zero `lang="pt-BR"` e zero aviso.

build (a):

```
12:22:37 [build] ✓ Completed in 846ms.
12:22:37 [build] 10 page(s) built in 1.44s
12:22:37 [build] Complete!
EXIT=0
```

medição (a):

```
== dist/en/index.html
lang="pt-BR" no main: 0
aviso no main: 0
<html lang="en": 1
title: <title>Prof. Haroldo C. D. Lima Junior</title>
```

### Passo 6(b) — tradução parcial (só `formacao[0].en.grau`)

O canário acrescenta só `en.grau` ao item 0 da formação; a medição mostra o grau em inglês sem `lang`, o curso do mesmo item com `lang="pt-BR"` e o aviso uma vez.

build (b):

```
12:23:21 [build] ✓ Completed in 770ms.
12:23:21 [build] 10 page(s) built in 1.42s
12:23:21 [build] Complete!
EXIT=0
```

medição (b):

```
== dist/en/index.html
lang="pt-BR" no main: 17
aviso no main: 1
<html lang="en": 1
title: <title>Prof. Haroldo C. D. Lima Junior</title>
-- item formacao[0] no main:
<li>2023–2024 · EN-grau-parcial — <span lang="pt-BR">Quantum Field Theory</span></li><li>2023 · <sp
```

### Passo 6(c) — Sobre com todo campo "T" traduzido

Medição de `dist/en/about/index.html`: `lang="pt-BR"` = 7 (5 instituições de formação, 1 instituição de atuação e 1 `periodo`, os campos "P" do conteúdo real, Decisão 13). O aviso dá 0 por construção: a Sobre EN não o mostra (Decisão 16), então este canário prova o `lang` dos campos "P", não a ausência de aviso por falta de fallback. O canário (d) saiu do plano (emenda do ciclo 1).

build (c):

```
12:24:04 [build] ✓ Completed in 783ms.
12:24:04 [build] 10 page(s) built in 1.40s
12:24:04 [build] Complete!
EXIT=0
```

medição (c):

```
== dist/en/about/index.html
lang="pt-BR" no main: 7
aviso no main: 0
<html lang="en": 1
title: <title>About — Haroldo Lima Junior</title>
```

### Passo 6 — reversão e estado final

Depois de `git checkout -- content/perfil/index.md`, o build final do passo 3 foi refeito (os blocos dos passos 2, 3, 4, 5 e 7 são dele). Contagens de linhas das views e dos componentes.

git status, diff de content/, contagens:

```
$ git status --short
 M docs/identidade-visual.md
 M plans/fase-4-internacionalizacao/065-en-home-e-about-com-aviso.md
 D src/pages/en/.gitkeep
 M src/views/AboutView.astro
 M src/views/HomeView.astro
 M tests/dist/site-gerado.test.ts
?? src/components/FallbackNotice.astro
?? src/components/LangText.astro
?? src/components/ProfileLists.astro
?? src/components/TimelineSection.astro
?? src/pages/en/about.astro
?? src/pages/en/index.astro
$ git diff -- content/ | wc -l
0
$ grep -c "FallbackNotice\|hasFallback" src/views/AboutView.astro
0
$ wc -l src/views/HomeView.astro src/views/AboutView.astro src/components/*.astro (novos)
  147 src/views/HomeView.astro
  144 src/views/AboutView.astro
   32 src/components/LangText.astro
   41 src/components/FallbackNotice.astro
   65 src/components/ProfileLists.astro
   67 src/components/TimelineSection.astro
  496 total
```

### Passo 7 — `npm run test:dist`

Sobre o `dist/` do build final do passo 3.

npm run test:dist:

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  12:25:16
   Duration  396ms (transform 87ms, setup 0ms, import 166ms, tests 89ms, environment 0ms)

EXIT=0
```

### Passo 8 — portão

`npm run lint`, `npm run format:check`, `npm run test:coverage`.

lint:

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

format:check:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

test:coverage:

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  12:25:25
   Duration  1.89s (transform 5.68s, setup 0ms, import 10.02s, tests 392ms, environment 3ms)

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

### Passo 9 — Navegador (orquestrador)

Rodado pelo orquestrador em 2026-10-01, das 12:29 às 12:31, no Vivaldi com a extensão, sobre `npx astro preview` (porta 4321) servindo o `dist/` do build autoritativo do ciclo 1 (12:28:31). Cópia do `dist/` medido em `scratchpad\dist065c1`. Cada rota carregada num `<iframe>` com `box-sizing:content-box` e `innerWidth` conferido igual à largura. `conteudo` é `[scrollHeight, clientHeight]` de `#conteudo`, que a partir de `lg` rola por dentro: a altura do documento sai igual por construção e não prova nada sozinha. `barra` é o `display` de `#barra-rolagem`. `ptBR` é `main [lang="pt-BR"]`. `aviso` é o texto de `en.fallback.notice` no documento/no `<main>`.

Saída transcrita do `javascript_tool`:

```
Thu Oct 01 2026 12:29:57
/en/ 360x800 inner=360 sw=[350,350] sh=[1188,800] conteudo=[1156,1156] barra=none ptBR=18 aviso=1/1 top=409 html=en
/en/ 768x1024 inner=768 sw=[768,768] sh=[1024,1024] conteudo=[863,863] barra=none ptBR=18 aviso=1/1 top=439 html=en
/en/ 1440x800 inner=1440 sw=[1440,1440] sh=[800,800] conteudo=[752,752] barra=none ptBR=18 aviso=1/1 top=517 html=en
/en/ 1366x650 inner=1366 sw=[1366,1366] sh=[650,650] conteudo=[602,602] barra=none ptBR=18 aviso=1/1 top=367 html=en
/en/about/ 360x800 inner=360 sw=[350,350] sh=[1526,800] conteudo=[1297,1297] barra=none ptBR=19 aviso=0/0 html=en
/en/about/ 768x1024 inner=768 sw=[768,768] sh=[1024,1024] conteudo=[774,774] barra=none ptBR=19 aviso=0/0 html=en
/en/about/ 1440x800 inner=1440 sw=[1440,1440] sh=[800,800] conteudo=[562,562] barra=none ptBR=19 aviso=0/0 html=en
/en/about/ 1366x650 inner=1366 sw=[1366,1366] sh=[650,650] conteudo=[413,413] barra=none ptBR=19 aviso=0/0 html=en
```

A ferramenta truncou a saída depois dessas linhas (rotas PT de controle). O que não aparece aí não está registrado.

- **Rolagem horizontal (RF-26):** `scrollWidth` = `clientWidth` nas três larguras, nas duas rotas. A 360 os dois valem 350 porque a barra vertical do documento ocupa 10 px; não há transbordo.
- **Sem rolagem vertical a 1440×800 e 1366×650 (§4 da identidade):** documento e `#conteudo` iguais nas duas rotas, e `#barra-rolagem` oculta.
- **Ciclo 0, antes da Decisão 16:** com o aviso, `/en/about/` a 1366×650 media `#conteudo` 430/413, com `#barra-rolagem` em `flex`. Removendo o `<p>` do aviso no iframe, voltava a 413/413. Esse transbordo levou à Decisão 16 (`ad8d51c`).
- **Aviso:** aparece uma vez em `/en/`, como primeira linha sob a régua e na largura toda (captura de tela a 1495 px). Não aparece em `/en/about/` (Decisão 16).
- **Interface em inglês:** retirei de cada rota as subárvores `[lang="pt-BR"]`, os `<script>` e os `<style>`. Os textos e os `aria-label`/`alt`/`title` que sobram são, em `/en/`: "Skip to content, Haroldo Lima, About, Research, Teaching, Publications, Some content on this page is only available in Portuguese., Contact, haroldo.lima@ufma.br, Lattes CV, ↗, (opens in new tab), ORCID, Education, os anos, ·, —, Research interests; Main navigation; Portrait of Haroldo Lima". Em `/en/about/` é o mesmo conjunto, mais "Menu", "›" e "Biography and education", "Professional experience", e sem o aviso. Nenhum texto em português fora de `lang="pt-BR"`.
- **Transição `/en/` → `/en/about/`:** clique real em "About", com a aba visível e um ouvinte de `pageswap` instalado antes. Registro: `[{"from":"/en/","vt":true,"to":"http://localhost:4321/en/about/"}]`, título final "About — Haroldo Lima Junior".
  - Numa tentativa anterior, a aba terminou em `/en/research/` (404, esperado até o 066), com o mesmo registro de uma única troca para `/en/about/`. A causa não foi determinada; suspeito de um clique entregue duas vezes pela extensão.
  - Numa tentativa feita no ciclo 0, com a aba em segundo plano, o registro deu `vt:false`. É o caso conhecido do Chromium, que pula a View Transition em aba oculta.
- **Foco por teclado:** não verificado. A tecla Tab da extensão não move o foco nesta máquina.

### Não rodei

- `npm audit`: não pedido neste plano; é do `triage-runner`.
- Commit e mudança de `Status:`: não são do executor.

### Fidelidade e BOM

Saída do verificador (rodado depois da última edição do plano, sobre os blocos acima) e conferências:

```
$ verificador de fidelidade
OK        build-antes-fim.txt - build "antes" (fim)
OK        retrato-antes.txt - retrato antes
OK        check.txt - npx astro check
OK        build.txt - npm run build:pipeline
OK        retrato-depois.txt - retrato depois
OK        comparar.txt - comparar
OK        passo5.txt - medir.sh dist/en/index.html dist/en/about/index.html
OK        build-a.txt - build (a)
OK        canario-a.txt - medição (a)
OK        build-b.txt - build (b)
OK        canario-b.txt - medição (b)
OK        build-c.txt - build (c)
OK        canario-c.txt - medição (c)
OK        revert.txt - git status, diff de content/, contagens
OK        test-dist.txt - npm run test:dist
OK        lint.txt - lint
OK        format.txt - format:check
OK        coverage.txt - test:coverage
OK        navegador065.md - seção do navegador (bytes, sem BOM/normalização)
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0
$ grep -c '^- \[ \]' <plano>
0
$ file (arquivos tocados)
src/views/HomeView.astro: JavaScript source, Unicode text, UTF-8 text
src/views/AboutView.astro: JavaScript source, Unicode text, UTF-8 text
src/components/LangText.astro: JavaScript source, Unicode text, UTF-8 text
src/components/FallbackNotice.astro: JavaScript source, Unicode text, UTF-8 text
src/components/ProfileLists.astro: JavaScript source, Unicode text, UTF-8 text
src/components/TimelineSection.astro: JavaScript source, Unicode text, UTF-8 text
src/pages/en/index.astro: JavaScript source, Unicode text, UTF-8 text
src/pages/en/about.astro: JavaScript source, Unicode text, UTF-8 text
tests/dist/site-gerado.test.ts: JavaScript source, Unicode text, UTF-8 text
docs/identidade-visual.md: Unicode text, UTF-8 text
$ grep -c 'Ã\|â€\|Â' (arquivos tocados)
src/views/HomeView.astro:0
src/views/AboutView.astro:0
src/components/LangText.astro:0
src/components/FallbackNotice.astro:0
src/components/ProfileLists.astro:0
src/components/TimelineSection.astro:0
src/pages/en/index.astro:0
src/pages/en/about.astro:0
tests/dist/site-gerado.test.ts:0
docs/identidade-visual.md:0
```
