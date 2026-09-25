# Plano 055 — Ferramenta de comparação do `dist/` normalizado

**Status:** DONE
**RFs cobertos:** nenhum diretamente — é a prova de "sem mudança de comportamento" que os planos 056–067 usam (sabatina fase 4, Decisão 6)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe `scripts/comparar-dist.mjs`, que tira um **retrato** do HTML normalizado de cada rota do
`dist/` e **compara** dois retratos, dizendo rota a rota se ficou igual e, quando não, onde diverge.
Os planos seguintes provam com ele que refatoração não mudou as páginas em português.

## Arquivos afetados

- `scripts/comparar-dist.mjs` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Os retratos (`.json`) vão para o scratchpad, **nunca** para o
> repositório.

## Contexto necessário

**Por que existe.** A Decisão 6 da sabatina manda extrair o corpo das páginas para componentes de
view "sem mudança de comportamento", e o orquestrador exige isso provado por artefato, não por
leitura. Comparar o HTML cru não serve: quando marcação e `<style>` mudam de arquivo, o Astro muda
por construção (a) o sufixo dos atributos de escopo `data-astro-cid-xxxxxxxx` e (b) os nomes com hash
em `/_astro/*.js|css`. Exemplo real de `dist/404.html` (Evidência do plano 051):
`<p class="text-corpo max-w-medida" data-astro-cid-ibpinaeu>…</p>` e
`<link rel="stylesheet" href="/_astro/BaseLayout.rgBLQX7v.css">`.

**Interface (fixada no fatiamento):**

```
node scripts/comparar-dist.mjs retrato <saida.json> [--dist <pasta>]
node scripts/comparar-dist.mjs comparar <antes.json> <depois.json> [--ignorar '<regex de rota>']
```

- `retrato`: percorre `dist/` (ou a pasta de `--dist`, usada pelos canários) recursivamente, **fora de `dist/admin/`** (painel do Tina), lê cada
  `.html` e grava `{ "<rota>": "<html normalizado>" }`, com a rota relativa a `dist/` e separador `/`
  (`index.html`, `sobre/index.html`, `404.html`, `en/about/index.html`…). Falha com mensagem se
  `dist/` não existir.
- Normalização, nesta ordem: remover blocos `<style …>…</style>`; remover tags
  `<link rel="stylesheet" …>`; remover atributos `data-astro-cid-[a-z0-9]+` (com ou sem `="…"`);
  trocar o `src="/_astro/….js"` de um `<script>` pelo **conteúdo** do `.js` (com o hash dos imports
  relativos `./x.HASH.js` trocado por `*`; arquivo ausente vira um marcador); no que sobra de
  `/_astro/` (fontes, imagens), trocar **só o hash** de 8 caracteres por `*`
  (`/_astro/nome.HASH.ext` → `/_astro/nome.*.ext`). Nada além disso — **o comparador não pode
  esconder mudança de texto, de ordem, de atributo, de `<script>` ou de asset que não seja uma
  dessas cinco**.
- **Emenda de 2026-09-25 (revisão final da branch `fase-4-inline`):** a versão original removia os
  blocos `<script>` e trocava o nome `/_astro/…` inteiro. A revisão reproduziu as duas regressões
  que isso esconde: um `<script>` perdido numa extração de view (as abas da disciplina somem e o
  comparador dá `IGUAL`) e a troca de um asset (`archivo-latin-300-normal` → outra fonte, `IGUAL`).
  Os scripts ficam no retrato; dois builds seguidos do mesmo código os produzem idênticos (provado
  no 056).
- **Segunda emenda, 2026-09-25 (revisão `code-reviewer` do 055):** com só o hash trocado, o script
  **externo** (`/_astro/publicacoes.astro_…js`, a sanfona) ficava de fora do retrato — mudança no
  corpo dele dava `IGUAL` — e, como o nome do chunk segue o módulo `.astro` que o importa, movê-lo
  para `PublicationsView` (064) daria `DIFERENTE` sem mudança de comportamento. Por isso o script
  externo entra pelo conteúdo, e não pelo nome. Os chunks que ele importa (gsap, ScrollTrigger) não
  entram: um nível só.
- `comparar`: para cada rota da união dos dois retratos imprime uma linha `IGUAL`, `DIFERENTE`,
  `SÓ ANTES` ou `SÓ DEPOIS`. Para `DIFERENTE`, imprime o deslocamento do primeiro caractere
  diferente e 120 caracteres de contexto de cada lado. `--ignorar` recebe uma regex aplicada à rota
  (ex.: `'^en/'`, para os planos que criam rotas EN e precisam provar que as PT não mudaram); rotas
  ignoradas aparecem como `IGNORADA`. **Código de saída:** 0 se toda rota não ignorada for `IGUAL`; 1
  caso contrário. Última linha: um resumo com a contagem de cada estado.

**Padrão de arquivo `.mjs` deste projeto:** `scripts/verificar-promocao.mjs` — cabeçalho §10.1 do PRD,
JSDoc nas funções, e `process`/`console` importados de `node:process`/`node:console`, porque o
`eslint.config.js` só concede globais de Node a `**/*.config.*` (comentário nas linhas 31–33 daquele
arquivo). Siga o mesmo padrão; nenhuma dependência nova (só `node:fs`, `node:path`).

**Não é código do site:** não entra em `src/`, no `build:pipeline` nem na cobertura. A prova de que
funciona é o canário do passo 3.

**Armadilhas:** o `dist/` sai minificado numa linha só (README da fase 3); a normalização é sobre a
string inteira, não por linha. Um build por vez no working tree (DESPACHO, item 18).

## Passos

1. Escrever `scripts/comparar-dist.mjs` → verify: `npm run lint` e `npm run format:check` colados.
2. `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\a.json`; o mesmo para
   `<scratch>\b.json` sem rebuild; `comparar a.json b.json` → verify: saída colada — toda rota `IGUAL`,
   exit 0 (`echo $LASTEXITCODE`).
3. Canários, cada um sobre uma **cópia** de `a.json` feita no scratchpad (nunca editando `dist/`):
   (a) trocar uma letra de texto visível da rota `sobre/index.html` → `DIFERENTE` com o contexto
   mostrando a letra, exit 1; (b) apagar a chave `404.html` → `SÓ ANTES`, exit 1; (c) copiar `dist/` para
   o scratchpad, trocar ali, no HTML **cru** de uma rota, só o sufixo de um `data-astro-cid-*`, o hash
   de um `/_astro/*.css` e o hash de um asset `/_astro/*.woff2`, e rodar `retrato --dist <cópia>` →
   comparado com `a.json`, `IGUAL`; (d) `--ignorar '^sobre/'` com o
   canário (a) → `IGNORADA`, exit 0; (e) numa cópia do `dist/`, apagar um `<script>` inline da
   disciplina → `DIFERENTE`, exit 1; (f) numa cópia, trocar o nome-base de um asset `/_astro/` →
   `DIFERENTE`, exit 1; (g) numa cópia, alterar o corpo do script externo de `publicacoes/` (com hash
   novo no nome, como o Vite faria) → `DIFERENTE`, exit 1; (h) numa cópia, trocar só o nome-base
   desse script, conteúdo idêntico → `IGUAL`, exit 0 → verify: as oito saídas coladas.
4. Rode o comparador duas vezes seguidas sobre o mesmo build e compare os dois `.json` byte a byte
   (`Get-FileHash`) → verify: hashes iguais (retrato determinístico).

## Critérios de aceitação

- [x] `retrato` grava uma entrada por `.html` de `dist/` fora de `dist/admin/`, com a rota relativa e `/`
- [x] A normalização mexe exatamente nas cinco coisas do Contexto, e nada mais (canários (c) e (h) `IGUAL`; canários (a), (e), (f) e (g) `DIFERENTE`)
- [x] `comparar` sai 0 só com todas as rotas não ignoradas `IGUAL`; `SÓ ANTES`/`SÓ DEPOIS`/`DIFERENTE` saem 1
- [x] `--ignorar` funciona (canário (d))
- [x] Retrato determinístico (passo 4)
- [x] Cabeçalho §10.1 e JSDoc; `lint` e `format:check` verdes, com saída colada

## Evidência

Executado em 2026-09-25, inline (`superpowers:executing-plans`), branch `fase-4-inline`. Código final:
`9cb54f1` (trabalho em `0ebf8ed`; correções da revisão final da skill em `efe15c8` e da revisão
`code-reviewer` em `9cb54f1`). `dist/` de entrada: build do `HEAD` às 15:13 (bloco "Build" da
Evidência do 056, exit 0). Todos os blocos abaixo são o conteúdo integral do arquivo indicado,
capturado com `NO_COLOR=1` e inserido por script; o verificador de fidelidade está no relatório.

Os canários rodam num harness fora do repositório (`scratchpad/055h/canarios.sh`), que grava a saída
crua de cada comando em `run/<nome>.out` e o código de saída em `run/<nome>.exit`. Antes da correção
de `9cb54f1`, os canários novos (g) e (h) foram vistos vermelhos:

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/red.log -->

```
OK    retrato-a
OK    passo2
OK    canario-a
OK    canario-b
OK    canario-c
OK    canario-d
OK    canario-e
OK    canario-f
FALHA canario-g (exit 0, esperado 1; padrão 'DIFERENTE  publicacoes/index.html')
FALHA canario-h (exit 1, esperado 0; padrão 'IGUAL 8')
OK    passo4
OK    dist-ausente
falhas: 2
```

Com o código final:

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/green.log -->

```
OK    retrato-a
OK    passo2
OK    canario-a
OK    canario-b
OK    canario-c
OK    canario-d
OK    canario-e
OK    canario-f
OK    canario-g
OK    canario-h
OK    passo4
OK    dist-ausente
falhas: 0
```

### Passo 1

`npm run lint` (exit 0) e `npm run format:check` (exit 0), no `HEAD`:

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo7-lint.txt -->

```

> haroldo-page@0.1.0 lint
> eslint .
```

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ev056/passo7-format.txt -->

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### Passo 2

`retrato a.json` (exit 0), `retrato b.json` sem rebuild, `comparar a.json b.json` (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/retrato-a.out -->

```
retrato: 8 rota(s) de dist em C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/a.json
```

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/passo2.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

### Passo 3

(a) uma letra de "Formação" trocada na Sobre (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-a.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
DIFERENTE  sobre/index.html
           primeira divergência no caractere 5532
           antes : …-4 lg:col-span-6"><section aria-labelledby="sobre-formacao"><h2 id="sobre-formacao" class="text-rotulo text-secundario">Formação acadêmica</h2><ol class="text-pequeno mt-2 space-y-1"><li class="grid grid-cols-[6.5rem_1fr] gap-x-4 sm:grid-co…
           depois: …-4 lg:col-span-6"><section aria-labelledby="sobre-formacao"><h2 id="sobre-formacao" class="text-rotulo text-secundario">Xormação acadêmica</h2><ol class="text-pequeno mt-2 space-y-1"><li class="grid grid-cols-[6.5rem_1fr] gap-x-4 sm:grid-co…
resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

(b) chave `404.html` apagada (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-b.out -->

```
SÓ ANTES   404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 7 · DIFERENTE 0 · SÓ ANTES 1 · SÓ DEPOIS 0 · IGNORADA 0
```

(c) cópia do `dist/` com o sufixo de um `data-astro-cid-*`, o hash de um `/_astro/*.css` e o hash do
`archivo-latin-300-normal.*.woff2` trocados no HTML cru da Sobre (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-c.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

(d) `--ignorar '^sobre/'` sobre o canário (a) (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-d.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGNORADA   sobre/index.html
resumo: IGUAL 7 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 1
```

(e) último `<script>` inline da disciplina apagado (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-e.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
DIFERENTE  ensino/2026-2-relatividade-geral/index.html
           primeira divergência no caractere 18340
           antes : …yle.setProperty(`--origem`,`${a}%`)};e.addEventListener(`pointerenter`,n),e.addEventListener(`pointerleave`,n)}</script><script type="module">var e=document.getElementById(`curso-abas`),t=e?[...e.querySelectorAll(`[role="tab"]`)]:[];if(e&&t…
           depois: …yle.setProperty(`--origem`,`${a}%`)};e.addEventListener(`pointerenter`,n),e.addEventListener(`pointerleave`,n)}</script>…
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

(f) `archivo-latin-300-normal` trocado por `archivo-latin-900-italic` na Sobre (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-f.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
DIFERENTE  sobre/index.html
           primeira divergência no caractere 368
           antes : …te Lima Junior, Professor Adjunto A do Departamento de Física da UFMA."><link rel="preload" href="/_astro/archivo-latin-300-normal.*.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><m…
           depois: …te Lima Junior, Professor Adjunto A do Departamento de Física da UFMA."><link rel="preload" href="/_astro/archivo-latin-900-italic.*.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><m…
resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

(g) corpo do script externo de Publicações alterado, com hash novo no nome (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-g.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
DIFERENTE  publicacoes/index.html
           primeira divergência no caractere 12190
           antes : …,l.forEach(e=>e.inert=!1)}})}a&&o&&s.length>1&&(l.matches&&d(a,o),l.addEventListener(`change`,()=>{l.matches&&d(a,o)}));"></script>…
           depois: …,l.forEach(e=>e.inert=!1)}})}a&&o&&s.length>1&&(l.matches&&d(a,o),l.addEventListener(`change`,()=>{l.matches&&d(a,o)}));;console.log(1)"></script>…
IGUAL      sobre/index.html
resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

(h) mesmo script, conteúdo idêntico, nome-base trocado para `PublicationsView.astro_…` (exit 0):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/canario-h.out -->

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

### Passo 4

dois retratos seguidos do mesmo build (`sha256sum`):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/passo4.out -->

```
9fd339c8abe36c4428c5ffdfa125f1c3f0624d065725c4826ab1d2bfd3c5c6d2 *C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/d1.json
9fd339c8abe36c4428c5ffdfa125f1c3f0624d065725c4826ab1d2bfd3c5c6d2 *C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/d2.json
```

Extra: `retrato --dist <pasta inexistente>` (exit 1):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/dist-ausente.out -->

```
erro: a pasta do build não existe: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/055h/run/nao-existe (rode npm run build:pipeline)
```

### CI

push de `48b9a4f` (fast-forward da `main` com a branch `fase-4-inline`, 2026-09-25); check-runs
do commit (`gh api …/commits/48b9a4f…/check-runs`):

<!-- fonte: C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/e7ee2ab5-85c3-4108-bc49-0c99bb3eef72/scratchpad/ci-48b9a4f.txt -->

```
Workers Builds: haroldo-page  status=completed  conclusion=success  completed_at=2026-09-25T18:46:11Z
qualidade  status=completed  conclusion=success  completed_at=2026-09-25T18:46:03Z
```

Portões da casa: `triage-runner` VERDE (ciclo 2, build às 15:23 de `ac4b820`) e `code-reviewer`
APROVADO (ciclo 2).
