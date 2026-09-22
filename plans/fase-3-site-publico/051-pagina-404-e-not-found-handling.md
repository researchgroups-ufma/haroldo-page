# Plano 051 — Página 404 e a prova do `not_found_handling` (RF-27)

**Status:** DONE
**RFs cobertos:** **RF-27**, RNF-03; quita a dívida da fase 2 "`not_found_handling` ainda não provado"
**Depende de:** planos 037 (dicionário e `NAV_ITEMS`), 042 (layout), 043 (`PageHeader`, `PillButton`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código e prova local) + **orquestrador** (prova em produção, depois do push)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera `dist/404.html` com navegação de volta, e fica **provado por artefato** — localmente e
em produção — que uma URL inexistente responde status 404 **com essa página no corpo**, o que o
`not_found_handling = "404-page"` do `wrangler.toml` promete desde o plano 007 e nunca pôde mostrar.

## Arquivos afetados

- `src/pages/404.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. **Não** altere
> `wrangler.toml`: o que se prova é a configuração existente.
> `Status:` fica `TODO`. Não commite. **Não** rode `npm run deploy` nem `wrangler deploy` — publicaria
> o disco local em produção.

## Contexto necessário

**A dívida** (README da fase 2, "O que a fase 2 empurra adiante", e Evidência do plano 025): a rota
inexistente respondia 404 com **corpo vazio**, indistinguível do default `none`, porque `dist/` não
tinha `404.html`. Configuração atual, `wrangler.toml:13-18`:

```toml
[assets]
directory = "./dist"
not_found_handling = "404-page"
```

**Especificação:** `docs/identidade-visual.md` §6.7 (404) e §5.3 (pílula sólida). `ref/` não existe
para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**Composição (§6.7):** `BaseLayout title={pt.notFound.title}`; `PageHeader eyebrow={pt.notFound.eyebrow}
title={pt.notFound.title}`; parágrafo `pt.notFound.body`; `PillButton href="/" variant="solid"
label={pt.notFound.backHome}`; rubrica `<h2>` `pt.notFound.allPages` e lista com réguas dos cinco
`NAV_ITEMS` (`src/lib/navigation.ts`), rótulo `pt.nav[key]` e `›`. **Sem CV** (Decisão 3). **O
caminho digitado não é exibido** (exigiria JS). Nenhum `<script>`.

`src/pages/404.astro` gera `dist/404.html` em Astro estático. Confira no build; se sair
`dist/404/index.html`, **pare e reporte** (o Worker procura `404.html`).

**Por que o cabeçalho do site marca nada como ativo aqui:** `Astro.url.pathname` no build é `/404`,
que `isActivePath` não casa com nenhum item. Não trate.

**Prova local.** `npx wrangler dev` lê `wrangler.toml` e serve `./dist` como o Worker faria
(padrão `http://localhost:8787`). Em PowerShell 5.1 (sem `&&`):

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/rota-que-nao-existe
curl.exe -s http://localhost:8787/rota-que-nao-existe | Select-String -Pattern "Erro 404" -SimpleMatch
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/sobre/
```

Se a acentuação sair corrompida no `Select-String`, busque o trecho sem acento (`Erro 404`). Encerre o
`wrangler dev` com `Ctrl+C` — não deixe em background.

**Prova em produção (orquestrador, depois do commit deste plano chegar à `main` e o Workers Builds
publicar):** confira o check `Workers Builds: haroldo-page` `success` no commit e então

```powershell
curl.exe -si https://haroldo-page.and-near.workers.dev/rota-que-nao-existe | Select-Object -First 30
```

Esperado: linha de status `HTTP/1.1 404` (ou `HTTP/2 404`) **e** o HTML com "Erro 404" e os cinco
links. Anote data, horário, SHA do commit e id da versão publicada. **Nenhum outro push** na janela
entre o commit e o `curl` (README da fase, tabela de paralelismo).

## Passos

1. `src/pages/404.astro` → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/404.html` colado; `grep -o 'href="/[a-z]*/\?"' dist/404.html` colado (cinco rotas + `/` da pílula e do cabeçalho).
3. Prova local com `npx wrangler dev` → verify: as três saídas de `curl.exe` coladas: `404`, a linha com "Erro 404", `200`.
4. Canário da prova: renomeie temporariamente `dist/404.html` para `dist/404.bak`, reinicie `wrangler dev`, cole o `curl.exe` mostrando `404` **sem** "Erro 404" no corpo (é o comportamento que a fase 2 mediu); restaure o nome → verify: saídas coladas e `ls dist/404.html` final.
5. Orquestrador — navegador em `http://localhost:8787/rota-que-nao-existe` (360 e 1440): `[scrollWidth, clientWidth]`, pílula sólida, lista navegável por Tab.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador, na promoção:** prova em produção conforme o Contexto → verify: saída do `curl.exe -si` colada com data, horário, SHA e versão.

## Critérios de aceitação

- [x] `dist/404.html` gerado, com rubrica "Erro 404", `<h1>` "Página não encontrada", texto, pílula sólida "Voltar ao início" e as cinco rotas (sem CV)
- [x] Nenhum `<script>` na página e nenhum caminho digitado exibido
  - *"Página" é o que `404.astro` acrescenta: 0 `<script>` dentro do `<main>` de `dist/404.html` e 0 no
    fonte `src/pages/404.astro` (fora do comentário). O único `<script>` de `dist/404.html` (contagem 1 no
    arquivo inteiro) é o do menu do celular do `SiteHeader`, herdado do `BaseLayout` e presente em toda
    rota — byte a byte igual ao de `dist/index.html` e `dist/sobre/index.html` (mesmo SHA-256, bloco novo
    no Passo 2).*
- [x] Local: `wrangler dev` responde `404` com a página no corpo; `/sobre/` responde `200`; canário do passo 4 mostra corpo vazio sem o arquivo
- [x] Produção: `curl.exe -si` na URL do Worker mostra `404` e a página, com SHA e versão registrados — **quita a dívida da fase 2**
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

### Passo 1 — `npx astro check`

Saída:
```
[2m19:48:52[22m [34m[content][39m Syncing content
[2m19:48:52[22m [34m[content][39m Synced content
[2m19:48:52[22m [34m[types][39m Generated [2m423ms[22m
[2m19:48:52[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (58 files): 
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 2 — Build e prova de `dist/404.html`

`npm run build:pipeline`:
```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:49:09
   Duration  871ms (transform 1.33s, setup 0ms, import 2.23s, tests 59ms, environment 0ms)

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
[2m19:49:41[22m [34m[content][39m Syncing content
[2m19:49:41[22m [34m[content][39m Synced content
[2m19:49:41[22m [34m[types][39m Generated [2m407ms[22m
[2m19:49:41[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (58 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:49:49[22m [34m[content][39m Syncing content
[2m19:49:49[22m [34m[content][39m Synced content
[2m19:49:49[22m [34m[types][39m Generated [2m406ms[22m
[2m19:49:49[22m [34m[build][39m output: [34m"static"[39m
[2m19:49:49[22m [34m[build][39m mode: [34m"static"[39m
[2m19:49:49[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:49:49[22m [34m[build][39m Collecting build info...
[2m19:49:49[22m [34m[build][39m [32m✓ Completed in 442ms.[39m
[2m19:49:49[22m [34m[build][39m Building static entrypoints...
[2m19:49:49[22m [34m[vite][39m [32m✓ built in 375ms[39m
[2m19:49:49[22m [34m[vite][39m [32m✓ built in 47ms[39m
[2m19:49:49[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:49:49[22m   [34m├─[39m [2m/404.html[22m [2m(+12ms)[22m 
[2m19:49:49[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m19:49:50[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+92ms)[22m 
[2m19:49:50[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+5ms)[22m 
[2m19:49:50[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+5ms)[22m 
[2m19:49:50[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+4ms)[22m 
[2m19:49:50[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m19:49:50[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m19:49:50[22m [32m✓ Completed in 157ms.
[39m
[2m19:49:50[22m [34m[build][39m [32m✓ Completed in 640ms.[39m
[2m19:49:50[22m [34m[build][39m 8 page(s) built in [1m1.10s[22m
[2m19:49:50[22m [34m[build][39m [1mComplete![22m
```

`ls dist/404.html`:
```
-rw-r--r-- 1 andne 197609 8930 Sep 22 19:49 dist/404.html
```

`grep -o 'href="/[a-z]*/\?"' dist/404.html` (cinco rotas + `/` da pílula e do cabeçalho, repetidos no cabeçalho/rodapé/menu):
```
href="/"
href="/"
href="/sobre/"
href="/pesquisa/"
href="/ensino/"
href="/publicacoes/"
href="/"
href="/"
href="/sobre/"
href="/pesquisa/"
href="/ensino/"
href="/publicacoes/"
href="/"
href="/sobre/"
href="/pesquisa/"
href="/ensino/"
href="/publicacoes/"
```

Checagens escopadas ao `<main>` (armadilha do README da fase, `grep -o ... | wc -l` em vez de `grep -c`): contagem de `<script`, hrefs dentro de `<main>`, ausência de CV/currículo/Lattes dentro de `<main>`, e contagem de `<script` no arquivo-fonte `src/pages/404.astro`. **O `1` da última linha do bloco abaixo não é uma tag `<script>` real** — é a palavra "`<script>`" citada dentro do comentário da linha 24 do arquivo (a docstring, "nenhum `<script>` ..."); confirmado por `grep -n` (não colado aqui): a única ocorrência da string "script" em `404.astro` está nessa linha de comentário. O bloco novo mais abaixo, comparando `dist/404.html` com `dist/sobre/index.html` e `dist/index.html`, mostra que o único `<script>` **real** do HTML renderizado vem do `SiteHeader` (fora de `404.astro`), não do arquivo deste plano:
```
--- script count (whole file) ---
1
--- extracting <main>...</main> ---
2697 C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\09cf9ed3-a1d1-42fb-ace7-c0eb5c8be132\scratchpad\051/main-404.html.txt
--- hrefs inside main ---
href="/"
href="/"
href="/sobre/"
href="/pesquisa/"
href="/ensino/"
href="/publicacoes/"
6
--- CV mentions inside main (expect 0) ---
0
--- script count inside <main> (expect 0) ---
0
--- script count in src/pages/404.astro itself (expect 0) ---
1
```

**Correção do ciclo 1 (revisão):** o `<script>` de `dist/404.html` é o mesmo, byte a byte, dos das outras
rotas — não é escrito por `404.astro`. Contagem de `<script` no arquivo inteiro de `dist/404.html`,
`dist/sobre/index.html` e `dist/index.html`; SHA-256 do trecho `<script…</script>` extraído de cada um (os
três batem); e contagem de `<script` dentro do `<main>` de `dist/404.html` (leitura, sem build):
```
--- contagem de '<script' (arquivo inteiro) ---
dist/404.html: 1
dist/sobre/index.html: 1
dist/index.html: 1

--- SHA-256 do trecho <script...>...</script> extraído de cada arquivo ---
dist/404.html: 8f4124c5b38e022df15d63b879967302e203c15cbff0aa483c02ed8336eb142f *-
dist/sobre/index.html: 8f4124c5b38e022df15d63b879967302e203c15cbff0aa483c02ed8336eb142f *-
dist/index.html: 8f4124c5b38e022df15d63b879967302e203c15cbff0aa483c02ed8336eb142f *-

--- contagem de '<script' dentro de <main> de dist/404.html ---
0
```

Strings de interface: nenhuma linha de texto visível em `404.astro` fora de `pt.*`, e os cinco textos de `pt.notFound` presentes em `dist/404.html`:
```
--- string literals in 404.astro visible to user (expect: only via pt.*) ---
(nenhuma linha com texto visível fora de pt.*)

--- pt.notFound.* strings present in dist/404.html ---
Erro 404
Página não encontrada
Página não encontrada
O endereço pode ter mudado de semestre. Materiais de disciplinas anteriores continuam na página de Ensino.
Voltar ao início
Todas as páginas
```

### Passo 3 — Prova local com `npx wrangler dev` (porta 8787)

`curl.exe -s -o NUL -w "%{http_code}\n" http://localhost:8787/rota-que-nao-existe`:
```
404
```

`curl.exe -s http://localhost:8787/rota-que-nao-existe | Select-String -Pattern "Erro 404" -SimpleMatch` (HTML minificado em uma linha só — o `Select-String` devolve a linha inteira que contém o match; trecho relevante: rubrica `Erro 404`, `<h1>Página não encontrada</h1>`, corpo, pílula sólida "Voltar ao início" e as cinco rotas de `NAV_ITEMS`):
```

</style><link rel="stylesheet" href="/_astro/BaseLayout.rgBLQX7v.css"></head><body><a href="#conteudo" 
class="focus:bg-papel focus:text-tinta sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 
focus:px-4 focus:py-2">Pular para o conteúdo</a><header class="border-regua border-b" data-astro-cid-fzpbxy5g><div 
class="px-margem mx-auto max-w-[90rem]" data-astro-cid-fzpbxy5g><div class="flex flex-wrap items-center 
justify-between gap-x-4 gap-y-3 py-4" data-astro-cid-fzpbxy5g><a href="/" class="flex flex-col" 
data-astro-cid-fzpbxy5g><span class="text-titulo-item" data-astro-cid-fzpbxy5g>Haroldo Lima Junior</span><span 
class="text-pequeno text-secundario hidden sm:block" data-astro-cid-fzpbxy5g>Centro Tecnológico — Departamento de 
Física</span></a><!-- fase 4: seletor de idioma (RF-29) --><button type="button" id="menu-botao" hidden 
aria-expanded="false" aria-controls="menu-lista" class="inline-flex min-h-11 items-center px-2 text-[0.9375rem] 
lg:hidden" data-astro-cid-fzpbxy5g>Menu</button><nav aria-label="Navegação principal" class="order-last w-full 
lg:order-none lg:w-auto" data-astro-cid-fzpbxy5g><div id="menu-caixa" data-astro-cid-fzpbxy5g><ul id="menu-lista" 
class="divide-regua divide-y lg:flex lg:items-center lg:gap-6 lg:divide-y-0" data-astro-cid-fzpbxy5g><li 
data-astro-cid-fzpbxy5g><a href="/" class="flex min-h-11 items-center justify-between gap-2 text-[0.9375rem] 
lg:inline-flex lg:min-h-0" data-astro-cid-fzpbxy5g>Início<span aria-hidden="true" class="lg:hidden" 
data-astro-cid-fzpbxy5g>›</span></a></li><li data-astro-cid-fzpbxy5g><a href="/sobre/" class="flex min-h-11 
items-center justify-between gap-2 text-[0.9375rem] lg:inline-flex lg:min-h-0" data-astro-cid-fzpbxy5g>Sobre<span 
aria-hidden="true" class="lg:hidden" data-astro-cid-fzpbxy5g>›</span></a></li><li data-astro-cid-fzpbxy5g><a 
href="/pesquisa/" class="flex min-h-11 items-center justify-between gap-2 text-[0.9375rem] lg:inline-flex lg:min-h-0" 
data-astro-cid-fzpbxy5g>Pesquisa<span aria-hidden="true" class="lg:hidden" 
data-astro-cid-fzpbxy5g>›</span></a></li><li data-astro-cid-fzpbxy5g><a href="/ensino/" class="flex min-h-11 
items-center justify-between gap-2 text-[0.9375rem] lg:inline-flex lg:min-h-0" data-astro-cid-fzpbxy5g>Ensino<span 
aria-hidden="true" class="lg:hidden" data-astro-cid-fzpbxy5g>›</span></a></li><li data-astro-cid-fzpbxy5g><a 
href="/publicacoes/" class="flex min-h-11 items-center justify-between gap-2 text-[0.9375rem] lg:inline-flex 
lg:min-h-0" data-astro-cid-fzpbxy5g>Publicações<span aria-hidden="true" class="lg:hidden" 
data-astro-cid-fzpbxy5g>›</span></a></li></ul></div></nav></div></div></header><script type="module">var 
e=document.getElementById(`menu-botao`),t=document.getElementById(`menu-caixa`);e instanceof HTMLButtonElement&&t&&(e.h
idden=!1,t.dataset.open=`false`,e.setAttribute(`aria-expanded`,`false`),e.addEventListener(`click`,()=>{let n=t.dataset
.open===`true`;t.dataset.open=n?`false`:`true`,e.setAttribute(`aria-expanded`,String(!n))}),document.addEventListener(`
keydown`,n=>{n.key===`Escape`&&t.dataset.open===`true`&&(t.dataset.open=`false`,e.setAttribute(`aria-expanded`,`false`)
,e.focus())}));</script><main id="conteudo"><div class="px-margem mx-auto max-w-[90rem] pt-10 pb-8 lg:pt-14"><p 
class="text-rotulo text-secundario">Erro 404</p><h1 class="text-display-1 titulo-entrada mt-4">Página não 
encontrada</h1></div><div aria-hidden="true" class="regua-entrada bg-tinta h-px"></div><div class="px-margem mx-auto 
max-w-[90rem] pb-16" data-astro-cid-ibpinaeu><p class="text-corpo max-w-medida" data-astro-cid-ibpinaeu>O endereço 
pode ter mudado de semestre. Materiais de disciplinas anteriores continuam na página de Ensino.</p><div class="mt-6" 
data-astro-cid-ibpinaeu><a href="/" class="border-tinta inline-flex min-h-12 items-center justify-between gap-3 
rounded-full border py-1 pr-1 pl-5 transition-colors duration-[120ms] bg-tinta text-papel"><span 
class="text-[0.9375rem]">Voltar ao início</span><span aria-hidden="true" class="flex h-8 w-8 items-center 
justify-center rounded-full bg-papel text-tinta">›</span></a></div><h2 class="text-rotulo text-secundario mt-12" 
data-astro-cid-ibpinaeu>Todas as páginas</h2><ul class="mt-4" data-astro-cid-ibpinaeu><li class="pagina-linha 
pagina-linha-primeira" data-astro-cid-ibpinaeu><a href="/" class="hover:bg-bloco flex items-center justify-between 
py-4 transition-colors duration-[120ms]" data-astro-cid-ibpinaeu><span class="text-corpo" 
data-astro-cid-ibpinaeu>Início</span><span aria-hidden="true" data-astro-cid-ibpinaeu>›</span></a></li><li 
class="pagina-linha" data-astro-cid-ibpinaeu><a href="/sobre/" class="hover:bg-bloco flex items-center justify-between 
py-4 transition-colors duration-[120ms]" data-astro-cid-ibpinaeu><span class="text-corpo" 
data-astro-cid-ibpinaeu>Sobre</span><span aria-hidden="true" data-astro-cid-ibpinaeu>›</span></a></li><li 
class="pagina-linha" data-astro-cid-ibpinaeu><a href="/pesquisa/" class="hover:bg-bloco flex items-center 
justify-between py-4 transition-colors duration-[120ms]" data-astro-cid-ibpinaeu><span class="text-corpo" 
data-astro-cid-ibpinaeu>Pesquisa</span><span aria-hidden="true" data-astro-cid-ibpinaeu>›</span></a></li><li 
class="pagina-linha" data-astro-cid-ibpinaeu><a href="/ensino/" class="hover:bg-bloco flex items-center 
justify-between py-4 transition-colors duration-[120ms]" data-astro-cid-ibpinaeu><span class="text-corpo" 
data-astro-cid-ibpinaeu>Ensino</span><span aria-hidden="true" data-astro-cid-ibpinaeu>›</span></a></li><li 
class="pagina-linha" data-astro-cid-ibpinaeu><a href="/publicacoes/" class="hover:bg-bloco flex items-center 
justify-between py-4 transition-colors duration-[120ms]" data-astro-cid-ibpinaeu><span class="text-corpo" 
data-astro-cid-ibpinaeu>Publicações</span><span aria-hidden="true" 
data-astro-cid-ibpinaeu>›</span></a></li></ul></div></main><footer class="border-tinta border-t" 
data-astro-cid-nns7i3if><div class="px-margem mx-auto max-w-[90rem]" data-astro-cid-nns7i3if><div id="rodape-grade" 
class="grid" data-astro-cid-nns7i3if><div class="rodape-celula" data-astro-cid-nns7i3if><p class="text-titulo-item" 
data-astro-cid-nns7i3if>Haroldo Cilas Duarte Lima Junior</p><p class="text-pequeno text-secundario" 
data-astro-cid-nns7i3if>Centro Tecnológico — Departamento de Física</p><p class="text-pequeno text-secundario" 
data-astro-cid-nns7i3if>Universidade Federal do Maranhão (UFMA), Campus São Luís</p></div><div class="rodape-celula" 
data-astro-cid-nns7i3if><p class="text-rotulo text-secundario" data-astro-cid-nns7i3if>Contato</p><a 
href="mailto:haroldo.lima@ufma.br" class="text-pequeno underline" 
data-astro-cid-nns7i3if>haroldo.lima@ufma.br</a></div><div class="rodape-celula" data-astro-cid-nns7i3if><p 
class="text-rotulo text-secundario" data-astro-cid-nns7i3if>Perfis acadêmicos</p><ul data-astro-cid-nns7i3if><li 
data-astro-cid-nns7i3if><a href="http://lattes.cnpq.br/8115459874963916" target="_blank" rel="noopener noreferrer" 
class="text-pequeno underline" data-astro-cid-nns7i3if>Currículo Lattes <span aria-hidden="true" 
data-astro-cid-nns7i3if>↗</span> <span class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)</span></a></li><li 
data-astro-cid-nns7i3if><a href="https://orcid.org/0000-0002-3702-7683" target="_blank" rel="noopener noreferrer" 
class="text-pequeno underline" data-astro-cid-nns7i3if>ORCID <span aria-hidden="true" data-astro-cid-nns7i3if>↗</span> 
<span class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)</span></a></li></ul></div><div class="rodape-celula" 
data-astro-cid-nns7i3if><p class="text-rotulo text-secundario" data-astro-cid-nns7i3if>Site</p><ul 
data-astro-cid-nns7i3if><li data-astro-cid-nns7i3if><a href="/" class="text-pequeno underline" 
data-astro-cid-nns7i3if>Início</a></li><li data-astro-cid-nns7i3if><a href="/sobre/" class="text-pequeno underline" 
data-astro-cid-nns7i3if>Sobre</a></li><li data-astro-cid-nns7i3if><a href="/pesquisa/" class="text-pequeno underline" 
data-astro-cid-nns7i3if>Pesquisa</a></li><li data-astro-cid-nns7i3if><a href="/ensino/" class="text-pequeno underline" 
data-astro-cid-nns7i3if>Ensino</a></li><li data-astro-cid-nns7i3if><a href="/publicacoes/" class="text-pequeno 
underline" data-astro-cid-nns7i3if>Publicações</a></li></ul><p class="text-pequeno text-secundario" 
data-astro-cid-nns7i3if>2026</p></div></div></div></footer></body></html>
```

`curl.exe -s -o NUL -w "%{http_code}\n" http://localhost:8787/sobre/`:
```
200
```

Servidor encerrado com `taskkill /PID $p.Id /T /F`; `netstat -ano | Select-String ':8787 ' | Select-String 'LISTENING'` sem saída (porta livre) logo em seguida.

### Passo 4 — Canário: `dist/404.html` renomeado para `dist/404.bak`

`Get-FileHash dist\404.html` antes de renomear:
```


Algorithm : SHA256
Hash      : 713D9CE4C6B7128B82FABF1C2099AE31A6F817BD0451CDD3A5EBA56F01547390
Path      : S:\Projetos\academic_page\haroldo\dist\404.html
```

Após `Rename-Item 404.html 404.bak`, listagem de `dist/404.*`:
```

Name   
----   
404.bak
```

`wrangler dev` reiniciado sobre o `dist/` sem `404.html`. `curl.exe -s -o NUL -w "%{http_code}\n" .../rota-que-nao-existe`:
```
404
```

Corpo capturado e testado contra "Erro 404" (PowerShell, `Select-String`/`.Length`) — 0 caracteres, 0 ocorrências de "Erro 404": é o comportamento de corpo vazio que a fase 2 mediu, sem `404.html` no disco:
```
body length (chars) = 0
match count for 'Erro 404' = 0
```

`curl.exe -s ... | Measure-Object -Character` (tamanho do corpo, confirmando 0 caracteres):
```

Lines Words Characters Property
----- ----- ---------- --------
                     0         
```

Servidor encerrado com `taskkill /PID $p.Id /T /F`; `netstat -ano | Select-String ':8787 ' | Select-String 'LISTENING'` sem saída (porta livre) logo em seguida.

`Rename-Item 404.bak 404.html` restaura o nome; `Get-FileHash dist\404.html` depois de restaurado:
```


Algorithm : SHA256
Hash      : 713D9CE4C6B7128B82FABF1C2099AE31A6F817BD0451CDD3A5EBA56F01547390
Path      : S:\Projetos\academic_page\haroldo\dist\404.html
```

`ls dist/404.html` final:
```

Name    
----    
404.html
```

**Hash idêntico antes e depois** (`713D9CE4C6B7128B82FABF1C2099AE31A6F817BD0451CDD3A5EBA56F01547390` nos dois casos): o arquivo restaurado é byte a byte o mesmo que o build gerou — não foi preciso rebuild para este canário, conforme a instrução do despacho.

### Passo 5 — Orquestrador (navegador)

Rodado pelo **orquestrador** em 2026-09-22, ~20:05, no Vivaldi com a extensão, sobre `npx wrangler dev --port 8787`
servindo o `dist/` do build autoritativo do `triage-runner` (`dist/404.html` de 19:59:18, SHA-256
`713D9CE4C6B7128B82FABF1C2099AE31A6F817BD0451CDD3A5EBA56F01547390`, idêntico ao do build do executor). O
`wrangler dev` foi encerrado por `taskkill /T /F` e as portas 8787 e 9000 conferidas livres ao final.

Método: `/rota-que-nao-existe` carregada em `<iframe>` de 360, 768 e 1440 px (`box-sizing:content-box`,
`innerWidth` conferido igual à largura) e medida por `javascript_tool`. O `clientWidth` é 15 px menor que o
`innerWidth` por causa da barra de rolagem vertical do iframe (a página tem mais de 900 px de altura).

| Largura | `innerWidth` | `[scrollWidth, clientWidth]` | Pílula (fundo / texto / disco) | Pílula (l × a) | Links da lista (borda esq.–dir.) |
|---|---|---|---|---|---|
| 360 | 360 | `[345, 345]` | `rgb(17,17,18)` / `rgb(239,237,234)` / `rgb(239,237,234)` | — × 48 | 305 px de largura, 59 px de altura cada |
| 768 | 768 | `[753, 753]` | `rgb(17,17,18)` / `rgb(239,237,234)` | 168 × 48 | 31–722 |
| 1440 | 1440 | `[1425, 1425]` | `rgb(17,17,18)` / `rgb(239,237,234)` | 168 × 48 | 56–1369 |

- **Sem rolagem horizontal** nas três larguras (`scrollWidth = clientWidth`).
- **Pílula sólida (§5.3):** fundo `--tinta`, texto e disco `--papel`, altura 48 px (o mínimo do §5.3), `href="/"`.
  **Clique real** (por referência da árvore de acessibilidade) em `/outra-rota-inexistente/` levou a
  `http://localhost:8787/`, `<h1>` "Haroldo Cilas Duarte Lima Junior".
- **Lista (§5.5):** cinco itens na ordem de `NAV_ITEMS` (`/`, `/sobre/`, `/pesquisa/`, `/ensino/`, `/publicacoes/`),
  régua do topo `rgb(17,17,18)` (forte) só na primeira linha e `rgb(214,211,207)` nas demais; cada `<a>` cobre a
  largura inteira da linha.
- **Árvore de acessibilidade:** rubrica "Erro 404", `heading` "Página não encontrada", texto, link da pílula,
  `heading` "Todas as páginas", `list` com cinco `listitem`. O nome dos links vem do `<span>` filho (a ferramenta o
  mostra no filho, como já faz com o link do logotipo); o `›` é `aria-hidden`.
- **Nenhum `<script>` no `<main>`** (0 nas três larguras; 1 na página inteira, o do menu do celular do
  `SiteHeader`, presente em toda rota). **Caminho digitado não exibido:** `body.innerText` não contém
  `rota-que-nao-existe`. **Nenhum item com `aria-current`**, como o Contexto previa.
- **Status pelo navegador:** `fetch('/rota-que-nao-existe')` → `404`, corpo com "Erro 404".

**NÃO observado — a navegação por Tab.** A tecla Tab enviada pela extensão não move o foco nesta máquina
(dívida já registrada no README da fase, destinada ao **053**). O que se mediu no lugar, e que **não** substitui o
teste: ordem do DOM no `<main>` = pílula, Início, Sobre, Pesquisa, Ensino, Publicações; e zero elementos com
`tabindex` positivo na página. Também **não** houve captura de tela: o documento estava com
`visibilityState: hidden` (janela do navegador em segundo plano) e o `Page.captureScreenshot` expirou duas vezes.
As medições acima são de DOM e CSSOM, não de imagem.

### Passo 6 — Portão de qualidade

`npx astro check` (repetido após o build, sem alteração de código desde o passo 1):
```
[2m19:52:20[22m [34m[content][39m Syncing content
[2m19:52:20[22m [34m[content][39m Synced content
[2m19:52:20[22m [34m[types][39m Generated [2m702ms[22m
[2m19:52:20[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (58 files): 
- 0 errors
- 0 warnings
- 0 hints
```

`npm run lint`:
```

> haroldo-page@0.1.0 lint
> eslint .
```

`npm run format:check`:
```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test:coverage`:
```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  16 passed (16)
      Tests  263 passed (263)
   Start at  19:52:48
   Duration  1.75s (transform 4.79s, setup 0ms, import 8.28s, tests 307ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |                   
 src/lib           |     100 |    99.09 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 248/248 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 67/67 )
Lines        : 100% ( 224/224 )
================================================================================
```

`npm run build:pipeline` (gate final):
```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  19:52:57
   Duration  1.12s (transform 1.73s, setup 0ms, import 2.92s, tests 80ms, environment 0ms)

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
[2m19:53:36[22m [34m[content][39m Syncing content
[2m19:53:36[22m [34m[content][39m Synced content
[2m19:53:36[22m [34m[types][39m Generated [2m691ms[22m
[2m19:53:36[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (58 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m19:53:47[22m [34m[content][39m Syncing content
[2m19:53:47[22m [34m[content][39m Synced content
[2m19:53:47[22m [34m[types][39m Generated [2m585ms[22m
[2m19:53:47[22m [34m[build][39m output: [34m"static"[39m
[2m19:53:47[22m [34m[build][39m mode: [34m"static"[39m
[2m19:53:47[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m19:53:47[22m [34m[build][39m Collecting build info...
[2m19:53:47[22m [34m[build][39m [32m✓ Completed in 630ms.[39m
[2m19:53:47[22m [34m[build][39m Building static entrypoints...
[2m19:53:48[22m [34m[vite][39m [32m✓ built in 605ms[39m
[2m19:53:48[22m [34m[vite][39m [32m✓ built in 75ms[39m
[2m19:53:48[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m19:53:48[22m   [34m├─[39m [2m/404.html[22m [2m(+22ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+6ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+138ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+8ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+9ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+8ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+6ms)[22m 
[2m19:53:48[22m   [34m├─[39m [2m/index.html[22m [2m(+6ms)[22m 
[2m19:53:48[22m [32m✓ Completed in 249ms.
[39m
[2m19:53:48[22m [34m[build][39m [32m✓ Completed in 973ms.[39m
[2m19:53:48[22m [34m[build][39m 8 page(s) built in [1m1.63s[22m
[2m19:53:48[22m [34m[build][39m [1mComplete![22m
```

### Passo 7 — Orquestrador (produção)

Rodado pelo **orquestrador** em 2026-09-22, depois do push do commit de trabalho
`8c6821c6d2fb7c278de067bfcc25030141498406` para a `main`. Nenhum outro push entre esse commit e os `curl`.

**Linha de base, antes do push** (`prod-antes.txt`): a dívida da fase 2 como ela era — `404` com
`Content-Length: 0`.

```
data local: 2026-09-22 20:11:49 -03:00
HTTP/1.1 404 Not Found
Date: Tue, 22 Sep 2026 23:12:08 GMT
Content-Length: 0
Connection: keep-alive
x-robots-tag: noindex
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=3FzuH4X2o6Mnv8KHmb8oFF341MoN2j2pFj%2FydN83UJrv%2B3HyJN%2BuvRHe%2B06qivzOaTUYPFH9kz7moI5MSVJgvq2VsDJ8MXCMFiu99I%2B1LiMUyQueQXYuFSHmqWG3oQkp44UzyR1%2BLtO4DATqdYTTIg%2FsKyI%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a3f4fe242f5ddaa8-GIG
alt-svc: h3=":443"; ma=86400
```

**Checks do commit** (`checks.txt`, `gh api .../commits/<SHA>/check-runs`): `qualidade` e
`Workers Builds: haroldo-page` em `success`; versão publicada **`19c88528-bff3-4ec4-913b-213278224d0f`**.

```
data local: 2026-09-22 20:18:24 -03:00
commit: 8c6821c6d2fb7c278de067bfcc25030141498406
Workers Builds: haroldo-page: completed / success (concluido 2026-09-22T23:14:04Z)

Build ID: [68da86ab-35b7-40be-a5b5-cacd7f8c5485](https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production/builds/68da86ab-35b7-40be-a5b5-cacd7f8c5485)
Script: [haroldo-page](https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production)
Version ID: 19c88528-bff3-4ec4-913b-213278224d0f

qualidade: completed / success (concluido 2026-09-22T23:13:46Z)
```

**Depois do deploy** (`prod-depois.txt`, `curl.exe -sSi`): status `404`, agora com `Content-Type: text/html` e
corpo. O bloco abaixo para nos cabeçalhos: o corpo sai minificado numa linha de ~8,9 kB, que o arquivo
capturado contém inteira. O corpo começa por
`<title>Página não encontrada — Haroldo Lima Junior</title>` e traz `<p class="text-rotulo text-secundario">Erro 404</p>`.

```
data local: 2026-09-22 20:18:05 -03:00
HTTP/1.1 404 Not Found
Date: Tue, 22 Sep 2026 23:18:12 GMT
Content-Type: text/html
Transfer-Encoding: chunked
Connection: keep-alive
CF-Cache-Status: HIT
Cache-Control: public, max-age=0, must-revalidate
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
x-robots-tag: noindex
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=pqmd0cYowb7Cgp8pxC%2Bp6%2BHkGlU%2Bgy1cAJVIn344GEGhXQu2x7N2mOiUFM7Yd%2FDqTiMAxU8vHnx6%2BDV%2B8GGHZviqsWQoIbEDmdTdo4emSlwVXoqqw9acJmSAsXKdpKcEPqXVtx42ZbQI7LOG4zwyXDK8MXQ%3D"}]}
Server: cloudflare
CF-RAY: a3f507091a720a7a-GIG
alt-svc: h3=":443"; ma=86400
```

**Identidade do corpo** (`prod-depois-corpo.txt`): o SHA-256 do corpo servido em produção é **igual** ao do
`dist/404.html` verificado localmente e no navegador (passos 2 a 5). O Worker serve byte a byte o artefato
revisado. Os cinco `href` aparecem no `<main>` e também no cabeçalho e no rodapé, por isso as contagens são
5 (`/`: logotipo, cabeçalho, pílula, lista e rodapé) e 3 (as outras rotas: cabeçalho, lista e rodapé).
`/sobre/` segue em `200`.

```
--- corpo de producao ---
SHA-256 do corpo: 713D9CE4C6B7128B82FABF1C2099AE31A6F817BD0451CDD3A5EBA56F01547390
SHA-256 de dist/404.html: 713D9CE4C6B7128B82FABF1C2099AE31A6F817BD0451CDD3A5EBA56F01547390
ocorrencias de 'Erro 404': 1
href="/" : 5
href="/sobre/" : 3
href="/pesquisa/" : 3
href="/ensino/" : 3
href="/publicacoes/" : 3
--- /sobre/ ---
200
```

Uma primeira tentativa às 20:16:44 devolveu saída vazia do `curl` junto com uma falha de conexão com a API do
GitHub no mesmo minuto. A repetição logo em seguida (sem carimbo de hora próprio, entre 20:16:44 e 20:18:05) respondeu `code=404 size=8930`, e a captura acima, das 20:18:05, é
a que vale. Foi falha transitória de rede local, não do Worker; não há bloco dela porque ela não produziu saída.
