# Plano 052 — Testes de integração sobre o `dist/` e peso de JS (§11, RN-01, RNF-02)

**Status:** TODO
**RFs cobertos:** §11 (nível "Integração": rotas geradas, nenhum rascunho publicado), **RN-01**,
**RNF-02**, RF-10, RF-27 (existência de `404.html`), §8.3 (um `<h1>`, `lang`)
**Depende de:** planos 041 (`courseSlug`) e **044–051** (todas as rotas prontas)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um teste Vitest lê o `dist/` recém-gerado e reprova se faltar rota, se um rascunho aparecer em
qualquer HTML, se uma página tiver mais ou menos de um `<h1>`, se houver requisição a fonte de
terceiro, ou se o JavaScript de alguma rota passar de 50 KB comprimido. Ele roda no CI depois do
`build:pipeline`.

## Arquivos afetados

- `tests/dist/site-gerado.test.ts` — novo
- `vitest.dist.config.ts` — novo: config só para `tests/dist/`
- `vitest.config.ts` — `exclude` de `tests/dist/**` na suíte padrão
- `package.json` — script `test:dist`
- `.github/workflows/ci.yml` — passo `npm run test:dist` depois de `npm run build:pipeline`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** altere o `build:pipeline` (README da fase, decisão 9; ADR-0009).
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Por que config separada.** `vitest.config.ts:6` inclui `tests/**/*.test.ts` e o CI roda
`npm run test:coverage` **antes** do build (`.github/workflows/ci.yml:34` e `:51`). Um teste sobre
`dist/` na suíte padrão falharia no CI por `dist/` não existir. Então:
- `vitest.config.ts`: acrescente `exclude: [...configDefaults.exclude, 'tests/dist/**']`
  (`import { configDefaults } from 'vitest/config'`), com comentário do porquê. **Não** mexa em
  `coverage` nem `thresholds`.
- `vitest.dist.config.ts`: `getViteConfig` como o outro (`astro/config`), `test.include:
  ['tests/dist/**/*.test.ts']`, `environment: 'node'`, sem `coverage`. O `eslint.config.js:48` já dá
  `process` global para `**/*.config.{js,mjs,cjs,ts}` — o nome casa.
- `package.json`: `"test:dist": "vitest run -c vitest.dist.config.ts"`.
- `ci.yml`: novo passo **após** `- run: npm run build:pipeline` (e o `env` dele), com comentário de
  uma linha explicando que depende do `dist/` gerado no passo anterior. **Não** use
  `continue-on-error`.

**O teste lê arquivos, não sobe servidor.** `node:fs`, `node:path`, `node:zlib`, `gray-matter` (já é
`devDependency`; ver como `tests/content/conteudo-valido.test.ts` o usa). Sem dependência nova. Se
`dist/` não existir, o `beforeAll` falha com mensagem "rode `npm run build:pipeline` antes de
`npm run test:dist`".

**Asserções (cada uma um `it` nomeado):**

1. **Rotas fixas existem:** `dist/index.html`, `dist/sobre/index.html`, `dist/pesquisa/index.html`,
   `dist/ensino/index.html`, `dist/publicacoes/index.html`, `dist/404.html`.
2. **Cada disciplina publicada gera página (§11, RF-06):** para cada `content/disciplinas/*.md` com
   `publicado: true`, existe `dist/ensino/<courseSlug(caminho)>/index.html` (`courseSlug` de
   `src/lib/courses.ts`). E o inverso: nenhuma pasta em `dist/ensino/` sem disciplina publicada
   correspondente (**rascunho não gera página**, RF-10).
3. **Nenhum rascunho aparece em HTML algum (RN-01):** para cada arquivo de `content/{linhas-pesquisa,
   projetos,disciplinas,publicacoes}/*.md` com `publicado: false`, o título (`titulo`, ou `nome` em
   disciplinas) **não** aparece em nenhum `.html` de `dist/` — compare contra o título com escape HTML
   (`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`; confira no HTML gerado
   qual escape o Astro usa para aspas e ajuste, registrando) **e** contra o texto cru. Hoje há um:
   `content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`,
   título `[EXEMPLO] Notas sobre geodésicas nulas em métricas estacionárias`. Se um dia não houver
   nenhum rascunho, o teste passa trivialmente — **escreva isso no nome do `it`** para ninguém ler o
   verde como prova.
4. **Um `<h1>` por página e `lang="pt-BR"`** em todo `.html` de `dist/` exceto `dist/admin/**` (o
   painel do Tina, copiado de `public/admin/`, não é do site).
5. **Nenhuma fonte de terceiro:** nenhum `.html` ou `.css` de `dist/` (fora de `admin/`) contém
   `fonts.googleapis.com` nem `fonts.gstatic.com`.
6. **RNF-02 — JS < 50 KB comprimido por rota:** para cada `.html` fora de `admin/`, some o tamanho
   `gzipSync` de (a) cada `<script ... src="/_astro/....js">` referenciado, lido de `dist/`, **mais**
   os módulos que ele importa estaticamente (`import ... from "./x.js"` / `import"./x.js"` no início
   do arquivo — resolva recursivamente, sem contar duas vezes), e (b) o conteúdo de cada `<script>`
   inline. Asserção `< 50 * 1024`. A mensagem de falha nomeia a rota e o total. **Imprima** (com
   `console.log`) a tabela rota → bytes gzip, para a Evidência.
7. **Zero framework de UI (RNF-02):** nenhum JS referenciado pelas rotas do site contém as strings
   `react-dom` ou `__REACT_DEVTOOLS` (o React do painel mora em `dist/admin/`, fora do escopo).

**Conteúdo real e o save do professor.** Todas as asserções são **invariantes** (existência,
ausência, limite) — nenhuma contagem exata de conteúdo (README da fase, decisão 6).

**Falsificabilidade — obrigatória, uma por asserção que muda comportamento.** Cada canário altera
`dist/` (ou uma cópia) **ou** o teste, nunca `content/` nem `src/`, e é revertido com novo build.

## Passos

1. Configs e script (`vitest.config.ts`, `vitest.dist.config.ts`, `package.json`) → verify: `npm run test:coverage` colado mostrando que a contagem de arquivos de teste **não** inclui `tests/dist` (e cobertura ≥ 80%).
2. `tests/dist/site-gerado.test.ts` → verify: `npm run build:pipeline` e depois `npm run test:dist` colados, com a tabela de JS por rota.
3. Canários sobre `dist/` (rebuild ao final): (a) apague `dist/404.html` → asserção 1 vermelha; (b) acrescente o título do rascunho num comentário em `dist/sobre/index.html` → asserção 3 vermelha; (c) duplique o `<h1>` em `dist/pesquisa/index.html` → asserção 4 vermelha; (d) acrescente `<link href="https://fonts.googleapis.com/css2">` em `dist/index.html` → asserção 5 vermelha; (e) acrescente em `dist/index.html` um `<script>` inline de 60 KB de texto aleatório não compressível (gere com `crypto.randomBytes(60000).toString('base64')`) → asserção 6 vermelha; (f) crie `dist/ensino/pasta-fantasma/index.html` → asserção 2 vermelha → verify: as seis saídas vermelhas coladas; `npm run build:pipeline` + `npm run test:dist` finais verdes colados.
4. `ci.yml` → verify: `git diff .github/workflows/ci.yml` colado (gerado por comando, depois da última edição).
5. Portão → verify: `npm run lint`, `npm run format:check` colados.
6. **Orquestrador, na promoção:** o run do CI do commit mostra o passo `npm run test:dist` verde **nominalmente** no log (`gh run view <id> --log | Select-String "test:dist"`) → verify: saída colada com o id do run e `conclusion: success`.

## Critérios de aceitação

- [ ] `npm run test:coverage` não roda `tests/dist`; `npm run test:dist` roda só ele
- [ ] As sete asserções existem, com nomes que dizem o que provam (inclusive o caso trivial da asserção 3)
- [ ] Os seis canários do passo 3 mostrados vermelhos e o estado final verde
- [ ] Tabela de JS gzip por rota colada, todas < 50 KB
- [ ] Passo novo no CI depois do `build:pipeline`, sem `continue-on-error`; `build:pipeline` inalterado
- [ ] CI do commit com `test:dist` visível no log e `conclusion: success`
- [ ] `lint` e `format:check` verdes, com saída colada; cabeçalho §10.1 e TSDoc nos arquivos novos

## Evidência

<Preenchido pelo executor (1–5) e pelo orquestrador (6). Declare o que NÃO rodou.>
