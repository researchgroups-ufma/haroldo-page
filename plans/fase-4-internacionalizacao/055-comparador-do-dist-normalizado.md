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
- Normalização, nesta ordem: remover blocos `<script …>…</script>`; remover blocos
  `<style …>…</style>`; remover tags `<link rel="stylesheet" …>`; remover atributos
  `data-astro-cid-[a-z0-9]+` (com ou sem `="…"`); trocar todo `/_astro/<qualquer coisa até aspas,
  espaço ou parêntese>` por `/_astro/*`. Nada além disso — **o comparador não pode esconder mudança
  de texto, de ordem ou de atributo que não seja uma dessas cinco**.
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
   de um `/_astro/*.css` e o conteúdo de um `<script>`, e rodar `retrato --dist <cópia>` → comparado
   com `a.json`, `IGUAL`; (d) `--ignorar '^sobre/'` com o
   canário (a) → `IGNORADA`, exit 0 → verify: as quatro saídas coladas.
4. Rode o comparador duas vezes seguidas sobre o mesmo build e compare os dois `.json` byte a byte
   (`Get-FileHash`) → verify: hashes iguais (retrato determinístico).

## Critérios de aceitação

- [ ] `retrato` grava uma entrada por `.html` de `dist/` fora de `dist/admin/`, com a rota relativa e `/`
- [ ] A normalização remove exatamente as cinco coisas do Contexto, e nada mais (canário (c) `IGUAL`, canário (a) `DIFERENTE`)
- [ ] `comparar` sai 0 só com todas as rotas não ignoradas `IGUAL`; `SÓ ANTES`/`SÓ DEPOIS`/`DIFERENTE` saem 1
- [ ] `--ignorar` funciona (canário (d))
- [ ] Retrato determinístico (passo 4)
- [ ] Cabeçalho §10.1 e JSDoc; `lint` e `format:check` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
