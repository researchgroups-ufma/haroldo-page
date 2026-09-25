# Plano 055 — Ferramenta de comparação do `dist/` normalizado

**Status:** TODO
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
  trocar **só o hash** de 8 caracteres dos nomes em `/_astro/` por `*` (`/_astro/nome.HASH.ext` →
  `/_astro/nome.*.ext`). Nada além disso — **o comparador não pode esconder mudança de texto, de
  ordem, de atributo, de `<script>` ou de asset que não seja uma dessas quatro**.
- **Emenda de 2026-09-25 (revisão final da branch `fase-4-inline`):** a versão original removia os
  blocos `<script>` e trocava o nome `/_astro/…` inteiro. A revisão reproduziu as duas regressões
  que isso esconde: um `<script>` perdido numa extração de view (as abas da disciplina somem e o
  comparador dá `IGUAL`) e a troca de um asset (`archivo-latin-300-normal` → outra fonte, `IGUAL`).
  Os scripts ficam no retrato; dois builds seguidos do mesmo código os produzem idênticos (provado
  no 056).
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
   `DIFERENTE`, exit 1 → verify: as seis saídas coladas.
4. Rode o comparador duas vezes seguidas sobre o mesmo build e compare os dois `.json` byte a byte
   (`Get-FileHash`) → verify: hashes iguais (retrato determinístico).

## Critérios de aceitação

- [x] `retrato` grava uma entrada por `.html` de `dist/` fora de `dist/admin/`, com a rota relativa e `/`
- [x] A normalização mexe exatamente nas quatro coisas do Contexto, e nada mais (canário (c) `IGUAL`; canários (a), (e) e (f) `DIFERENTE`)
- [x] `comparar` sai 0 só com todas as rotas não ignoradas `IGUAL`; `SÓ ANTES`/`SÓ DEPOIS`/`DIFERENTE` saem 1
- [x] `--ignorar` funciona (canário (d))
- [x] Retrato determinístico (passo 4)
- [x] Cabeçalho §10.1 e JSDoc; `lint` e `format:check` verdes, com saída colada

## Evidência

Executado em 2026-09-25, inline (`superpowers:executing-plans`), na branch `fase-4-inline`. Build de
base: `npm run build:pipeline` → `8 page(s) built`, `Complete!`, exit 0.

Os canários dos passos 2–4 rodaram num harness (fora do repositório; retratos no scratchpad), que
checa código de saída e padrão de cada um. Visto falhar antes do script existir (9 falhas,
`MODULE_NOT_FOUND`) e passar depois:

```
OK    retrato a.json
OK    passo 2: a×b tudo IGUAL
OK    rotas relativas com /, sem admin/
OK    canário (a) DIFERENTE com a letra
OK    canário (b) SÓ ANTES
OK    canário (c) IGUAL apesar de cid/hash css/hash asset
OK    canário (e) script apagado → DIFERENTE
OK    canário (f) asset trocado → DIFERENTE
OK    canário (d) IGNORADA
OK    passo 4: retrato determinístico
OK    dist ausente falha
falhas: 0
```

Na correção da revisão final, os canários (e) e (f) foram escritos antes da mudança no
`normalizar` e vistos vermelhos (`FALHA canário (e) … (exit 0, esperado 1 …)` e o mesmo para (f)).

**Passo 1** — `npm run lint` (exit 0, sem problemas) e `npm run format:check`:

```
Checking formatting...
All matched files use Prettier code style!
```

**Passo 2** — `retrato a.json`, `retrato b.json` sem rebuild, `comparar a.json b.json` (exit 0):

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

**Passo 3** — (a) uma letra de "Formação" trocada na Sobre (exit 1):

```
IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
DIFERENTE  sobre/index.html
           primeira divergência no caractere 4731
           antes : …-4 lg:col-span-6"><section aria-labelledby="sobre-formacao"><h2 id="sobre-formacao" class="text-rotulo text-secundario">Formação acadêmica</h2><ol class="text-pequeno mt-2 space-y-1"><li class="grid grid-cols-[6.5rem_1fr] gap-x-4 sm:grid-co…
           depois: …-4 lg:col-span-6"><section aria-labelledby="sobre-formacao"><h2 id="sobre-formacao" class="text-rotulo text-secundario">Xormação acadêmica</h2><ol class="text-pequeno mt-2 space-y-1"><li class="grid grid-cols-[6.5rem_1fr] gap-x-4 sm:grid-co…
resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
```

(b) chave `404.html` apagada (exit 1): `SÓ ANTES   404.html`, resumo
`resumo: IGUAL 7 · DIFERENTE 0 · SÓ ANTES 1 · SÓ DEPOIS 0 · IGNORADA 0`.

(c) cópia do `dist/` com, no HTML cru de `sobre/index.html`, o sufixo de um `data-astro-cid-*`, o hash
de um `/_astro/*.css` e o hash do `/_astro/archivo-latin-300-normal.*.woff2` trocados (o harness
confere que as três trocas entraram no arquivo); `retrato --dist <cópia>` comparado com `a.json`
(exit 0): `resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0`.

(e) último `<script>` inline de `ensino/2026-2-relatividade-geral/index.html` apagado (exit 1):
`resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0`.

(f) `archivo-latin-300-normal` trocado por `archivo-latin-900-italic` na Sobre (exit 1):
`resumo: IGUAL 7 · DIFERENTE 1 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0`.

(d) `--ignorar '^sobre/'` sobre o canário (a) (exit 0): `IGNORADA   sobre/index.html`, resumo
`resumo: IGUAL 7 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 1`.

**Passo 4** — dois retratos seguidos do mesmo build, SHA-256 iguais:
`10f4d3a8b5ac01ed115ca587d61ed92a8e9a73213e5a541587e488d86f54d76e` nos dois.

Extra: `retrato --dist <pasta inexistente>` sai 1 com
`erro: a pasta do build não existe: … (rode npm run build:pipeline)`.
