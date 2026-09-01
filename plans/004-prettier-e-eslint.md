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

- [ ] `npm run lint` termina com código 0 e sem warnings
- [ ] `npm run format:check` termina com código 0
- [ ] `npm run build` continua verde
- [ ] `@typescript-eslint/no-explicit-any` está como `error` (§10.4)
- [ ] `eslint-config-prettier` é o último preset do array
- [ ] `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md` e `plans/` não foram reformatados
- [ ] Versões das novas devDependencies são exatas em `package.json`

## Evidência

<Preenchido pelo executor: saídas de `npm run lint`, `npm run format:check`, `npm run build`
e `git show --stat HEAD`.>
