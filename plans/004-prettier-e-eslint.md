# Plano 004 — Prettier e ESLint configurados para Astro + TypeScript

**Status:** TODO
**RFs cobertos:** — (Fase 0, item 9 parcial do checklist §12; §10.4 do PRD)
**Depende de:** plano 002
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O projeto passa a ter formatação e lint automatizados, com scripts npm próprios, cobrindo
`.astro`, `.ts`, `.js`, `.md` e `.css`. `npm run lint` e `npm run format:check` terminam
verdes no código existente — e o CI do plano 008 vai poder chamá-los.

## Arquivos afetados

- `package.json` — acrescentar devDependencies e os scripts `lint`, `lint:fix`, `format`,
  `format:check`
- `.prettierrc.json` — criar
- `.prettierignore` — criar
- `eslint.config.js` — criar (flat config)
- `src/pages/index.astro`, `src/styles/global.css` — apenas reformatação, se o Prettier pedir

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** rode `--fix`/`--write` sobre `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md` ou `plans/`:
> eles devem entrar no `.prettierignore`.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático + TypeScript strict + Tailwind 4, já instalados pelo plano 002.
Nenhuma dependência de lint existe ainda.

**Exigência do PRD §10.4 (normativa):**

| Item | Padrão |
|---|---|
| Estilo | Prettier **com plugin Astro**; lint com ESLint + `eslint-plugin-astro` |
| Type hints | `strict: true` no tsconfig; **`any` proibido em código de produção** |
| Constantes mágicas | proibidas — extrair para `src/lib/config.ts` ou dicionário i18n |
| Strings de interface | proibidas hardcoded em componente — sempre pelo dicionário `src/i18n/` |
| Tamanho de componentes | alvo < 150 linhas |

Traduza para regra de lint o que for traduzível: `@typescript-eslint/no-explicit-any` como
**error** (o `any` é proibido, não desencorajado). As duas últimas linhas da tabela não têm
regra pronta boa — **não invente plugin para elas**; ficam como revisão humana.

**Pacotes esperados** (instalar como devDependencies, versões exatas — o `package.json`
deste projeto não usa `^` nem `~`, ver plano 002):

- `prettier`, `prettier-plugin-astro`, `prettier-plugin-tailwindcss`
- `eslint`, `typescript-eslint`, `eslint-plugin-astro`, `astro-eslint-parser`,
  `eslint-config-prettier`

**Flat config é obrigatório** (ESLint 9 só suporta flat config). Esqueleto correto:

```js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'coverage/**', '.wrangler/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  prettier, // desliga regras estilísticas que brigam com o Prettier — sempre por último
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
```

**Armadilhas conhecidas nesta combinação:**

- `eslint-config-prettier` **tem de vir por último**, senão regras estilísticas do ESLint
  conflitam com o Prettier e o CI fica instável.
- Arquivos `.astro` só são analisados se `eslint-plugin-astro` estiver ativo com o
  `astro-eslint-parser`; o preset `flat/recommended` já faz isso — não configure o parser
  manualmente por cima.
- O `.prettierrc` precisa de um `override` declarando o parser `astro` para `*.astro`,
  senão o Prettier trata o arquivo como HTML e quebra o frontmatter:

```json
{
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "printWidth": 100,
  "singleQuote": true,
  "semi": true,
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

- `prettier-plugin-tailwindcss` **deve ser o último da lista de plugins** (exigência do
  próprio plugin), caso contrário a ordenação de classes não roda.
- Fim de linha: o `.editorconfig` e o `.gitattributes` do plano 001 fixam LF. O default
  `endOfLine: "lf"` do Prettier já é isso — **não** mude para `crlf` mesmo desenvolvendo no
  Windows, ou o CI Linux vai divergir.

**`.prettierignore` deve conter, no mínimo:** `dist/`, `.astro/`, `node_modules/`,
`coverage/`, `package-lock.json`, `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md`, `plans/`,
`.firecrawl/`. Os documentos do projeto são escritos à mão e reformatá-los polui o diff.

**Scripts npm a acrescentar** (nomes exatos — o CI do plano 008 vai chamá-los assim):

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Instalar as devDependencies listadas e fixar as versões (sem `^`/`~`), rodando
   `npm install` ao final para sincronizar o lock.
   → verify: `npm ls eslint prettier eslint-plugin-astro --depth=0` lista os três.
2. Criar `.prettierrc.json` com o conteúdo acima e `.prettierignore` com a lista acima.
   → verify: `npx prettier --check src/pages/index.astro` roda sem crash de parser.
3. Criar `eslint.config.js` com o esqueleto acima.
   → verify: `npx eslint src/pages/index.astro` roda e reporta 0 erros (ou erros reais, que
   devem ser corrigidos no passo 5).
4. Acrescentar os quatro scripts npm ao `package.json`.
   → verify: `npm run lint` e `npm run format:check` executam.
5. Rodar `npm run format` uma vez e corrigir os erros de lint remanescentes **apenas nos
   arquivos da lista de afetados**.
   → verify: `npm run lint` e `npm run format:check` ambos verdes; cole as saídas.
6. Rodar `npm run build` para garantir que a reformatação não quebrou nada.
   → verify: build verde.
7. Commitar com `chore: configura Prettier e ESLint para Astro e TypeScript`.
   → verify: `git show --stat HEAD` não lista `PRD.md` nem `briefing.md`.

## Critérios de aceitação

- [x] `npm run lint` termina com código 0 e sem warnings
- [x] `npm run format:check` termina com código 0
- [x] `npm run build` continua verde
- [x] `@typescript-eslint/no-explicit-any` está como `error` (§10.4)
- [x] `eslint-config-prettier` é o último preset do array
- [x] `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md` e `plans/` não foram reformatados
- [x] Versões das novas devDependencies são exatas em `package.json`

## Evidência

### Desvios em relação ao esqueleto do plano (documentados, não são scope creep)

1. **`@eslint/js` faltava na lista de pacotes esperados.** O esqueleto do `eslint.config.js`
   do plano importa `eslint from '@eslint/js'` e usa `eslint.configs.recommended`, mas esse
   pacote não estava listado em "Pacotes esperados" nem foi instalado transitivamente por
   nenhuma das outras dependências. Sem ele o `eslint.config.js` não carrega. Instalado como
   devDependency exata: `@eslint/js@10.0.1` (peer `eslint: ^10.0.0`, compatível com
   `eslint@10.9.1`).
2. **`astro.config.mjs` usa o global Node `process`** (`process.env.PUBLIC_SITE_URL`), que
   `eslint.configs.recommended` não reconhece por padrão (regra `no-undef`), causando 1 erro
   de lint em código pré-existente fora da lista de "Arquivos afetados" — logo, não podia ser
   editado para contornar o problema. Corrigido dentro do próprio `eslint.config.js`,
   acrescentando um bloco de `languageOptions.globals` restrito a
   `**/*.config.{js,mjs,cjs,ts}` declarando `process: 'readonly'`. Nenhuma dependência nova
   foi necessária para isso (não usei o pacote `globals`, que está disponível apenas
   transitivamente).
3. **`docs/CHANGELOG.md`**, criado pelo agente do plano 003 em paralelo, ficou sinalizado
   por `prettier --check .` durante parte da execução deste plano — não é um arquivo desta
   lista de afetados, não foi editado nem formatado por mim. O `npm run format:check` do
   repositório inteiro dependia da correção de formatação do `docs/CHANGELOG.md`, entregue
   pelo plano 003; após ela, a saída abaixo já reflete o repositório completo verde.

### `npm run lint`

```
> haroldo-page@0.1.0 lint
> eslint .

```

Sem saída adicional; código de saída 0.

### `npm run format:check`

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

Código de saída 0 no repositório inteiro.

### `npm run build`

```
> haroldo-page@0.1.0 build
> astro check && astro build

[content] Syncing content
[content] Synced content
[types] Generated 53ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
eslint.config.js:16:25 - warning ts(6387): The signature '(...configs: InfiniteDepthConfigWithExtends[]): ConfigArray' of 'tseslint.config' is deprecated.

16 export default tseslint.config(
                           ~~~~~~

Result (5 files):
- 0 errors
- 0 warnings
- 1 hint

[content] Syncing content
[content] Synced content
[types] Generated 41ms
[build] output: "static"
[build] mode: "static"
[build] directory: S:\Projetos\academic_page\haroldo\dist\
[build] Collecting build info...
[build] ✓ Completed in 58ms.
[build] Building static entrypoints...
[vite] ✓ built in 500ms
[build] ✓ Completed in 527ms.

 generating static routes 
▶ src/pages/index.astro
  └─ /index.html (+5ms)
✓ Completed in 12ms.
[build] 1 page(s) built in 609ms
[build] Complete!
```

Build verde (0 erros); o único item reportado é um `hint` do `astro check` sobre uma
assinatura depreciada do `tseslint.config` (não bloqueante, informativo do próprio
typescript-eslint sobre seu overload de API).

### `npm ls` das devDependencies de lint instaladas

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @eslint/js@10.0.1
+-- astro-eslint-parser@3.1.0
+-- eslint-config-prettier@10.1.8
+-- eslint-plugin-astro@3.1.0
+-- eslint@10.9.1
+-- prettier-plugin-astro@0.14.1
+-- prettier-plugin-tailwindcss@0.8.1
+-- prettier@3.9.6
`-- typescript-eslint@8.69.0
```

Todas as versões são exatas em `package.json` (sem `^`/`~`), e o campo `overrides.vite`
permanece `6.4.3`, confirmado com `npm ls vite`:

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tailwindcss/vite@4.3.3
| `-- vite@6.4.3 overridden
`-- astro@5.18.2
  +-- vite@6.4.3 deduped
  `-- vitefu@1.1.3
    `-- vite@6.4.3 deduped
```

### `git show --stat HEAD`

```
commit d42af3955db49d66bd1deace4615b4745d584ab4
Author: André Ferreira <and.near@hotmail.com>
Date:   Tue Sep 1 12:55:40 2026 -0300

    chore: configura Prettier e ESLint para Astro e TypeScript

    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 .prettierignore       |   10 +
 .prettierrc.json      |    7 +
 eslint.config.js      |   37 ++
 package-lock.json     | 1599 ++++++++++++++++++++++++++++++++++++++++++++++++-
 package.json          |   19 +-
 src/pages/index.astro |   16 +-
 src/styles/global.css |    2 +-
 7 files changed, 1677 insertions(+), 13 deletions(-)
```

Nenhum arquivo do plano 003 (`content/`, `public/`, `src/components/`, `src/i18n/`,
`src/layouts/`, `src/pages/en/`, `docs/`, `tests/`, `scripts/`) e nenhum documento do PRD
(`PRD.md`, `PRD_TEMPLATE.md`, `briefing.md`, `plans/`) entrou no commit — confirmado pelo
`git show --stat` acima e pelo `git status --short` verificado antes do `git add`.

### Reformatação de arquivos existentes

`npm run format` (restrito aos arquivos do escopo) reformatou:

- `src/pages/index.astro` — indentação convertida de tabs para 2 espaços (default do
  Prettier).
- `src/styles/global.css` — aspas duplas trocadas por aspas simples em
  `@import "tailwindcss";` → `@import 'tailwindcss';` (regra `singleQuote: true`).

Nenhuma mudança semântica; confirmado pelo `npm run build` verde após a reformatação.
