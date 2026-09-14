# Plano 036 — Tokens de cor, escala tipográfica e Archivo auto-hospedada

**Status:** TODO
**RFs cobertos:** RNF-01, RNF-03, RNF-15, RF-32 (base do movimento); pré-requisito do item
"Identidade visual aplicada" do §12 da fase 3
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`src/styles/global.css` passa a conter todo o sistema visual que não é componente: os seis tokens de
cor, as três famílias, a escala tipográfica fluida, a margem lateral, o foco visível e as regras de
movimento com `prefers-reduced-motion`. A Archivo (pesos 200 e 300, só latin) é servida pelo próprio
site via `@fontsource/archivo`, sem nenhuma requisição a terceiro.

## Arquivos afetados

- `package.json` — `@fontsource/archivo` em `dependencies`, **versão exata** (sem `^`)
- `package-lock.json` — consequência do install
- `src/styles/global.css` — reescrito (hoje só `@import 'tailwindcss';`)
- `plans/fase-3-site-publico/.gitkeep` — **removido** com `git rm` (a pasta já tem conteúdo)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Projeto.** `haroldo-page`: Astro 7.2.10 estático (D-01), Tailwind 4.3.3 via `@tailwindcss/vite`
(`astro.config.mjs`), TinaCMS. Nenhuma página real existe ainda; `src/pages/index.astro` é
placeholder e **não** é tocado aqui.

**Fonte da especificação:** `docs/identidade-visual.md`, seções **2 (Cor)**, **3 (Tipografia)**,
**4 (Grade e espaçamento)** e **7 (Movimento)**. Leia as quatro inteiras. `ref/` não existe para
você — não procure.

**Como os tokens viram CSS (decisão deste plano).** Tailwind 4 gera utilitários a partir de
variáveis em `@theme`, e exige o prefixo do namespace. O nome do token da identidade vira sufixo:

| Identidade | Variável em `@theme` | Utilitários gerados (exemplo) |
|---|---|---|
| `--papel` `#EFEDEA` | `--color-papel` | `bg-papel`, `text-papel` |
| `--bloco` `#F7F6F4` | `--color-bloco` | `bg-bloco` |
| `--tinta` `#111112` | `--color-tinta` | `text-tinta`, `border-tinta` |
| `--secundario` `#5A5754` | `--color-secundario` | `text-secundario` |
| `--regua` `#D6D3CF` | `--color-regua` | `border-regua` |
| `--tracejado` `#9A9691` | `--color-tracejado` | `border-tracejado` (só borda) |
| cinza de comentário `#6E6A66` | `--color-comentario` | usado pelo tema Shiki do plano 049 |
| texto | `--font-texto`: `"Helvetica Neue", Helvetica, Arial, sans-serif` | `font-texto` |
| display | `--font-display`: `"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif` | `font-display` |
| código | `--font-codigo`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | `font-codigo` |
| breakpoints | `--breakpoint-sm: 40rem`, `--breakpoint-lg: 64rem` (e remova os demais com `--breakpoint-*: initial` antes) | `sm:`, `lg:` |

**Escala tipográfica** — um `@utility` por token da tabela "Escala" do §3 da identidade, com
`font-size`, `line-height`, `letter-spacing`, `font-family` e `font-weight` exatamente como na
tabela: `text-display-1`, `text-display-2`, `text-numeral`, `text-numeral-sm`, `text-ano`,
`text-titulo-item`, `text-corpo`, `text-pequeno`, `text-rotulo` (este com `text-transform:
uppercase` e `0.14em`). Os `clamp(...)` são copiados literalmente da tabela. Mais dois utilitários:
`px-margem` (`padding-inline: clamp(1.25rem, 4vw, 3.5rem)`) e `max-w-medida` (`max-width: 38rem`).

**Base (em `@layer base`):** `html` com `background: var(--color-papel)`, `color:
var(--color-tinta)`, `font-family: var(--font-texto)`, `font-size: 100%` (corpo 16 px);
`:focus-visible { outline: 2px solid var(--color-tinta); outline-offset: 3px; }`; `.sr-only` já
existe no Tailwind — não recrie.

**Movimento (§7 da identidade).** Duas classes que o plano 043 aplica no cabeçalho de página:

- `.regua-entrada` — régua forte que se desenha: `transform-origin: left`, animação de
  `scaleX(0)` → `scaleX(1)` em 500 ms.
- `.titulo-entrada` — `<h1>` que sobe 8 px e aparece: `translateY(8px)`/`opacity: 0` → estado final
  em 400 ms, atraso de 100 ms.

**Regra que não se negocia:** os `@keyframes` e o estado inicial oculto ficam **dentro** de
`@media (prefers-reduced-motion: no-preference) { ... }`. Fora dela, as classes não fazem nada — se
o CSS falhar ou o usuário pedir movimento reduzido, o texto está visível no estado final. Acrescente
também `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:
0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
} }`. A transição de hover de 120 ms é dos componentes, não daqui.

**Fonte.** `npm install --save-exact @fontsource/archivo`. Depois do install, **confira** que
existem `node_modules/@fontsource/archivo/latin-200.css` e `latin-300.css` (convenção do
Fontsource v5) e importe **só esses dois** no topo de `global.css`, depois de `@import
'tailwindcss';`. O Fontsource já declara `font-display: swap`; confira no CSS importado e cite a
linha. **Não** importe `index.css` (traz todos os subsets e o peso 400).

**Armadilhas.**
- `ref/` está no `.gitignore` e o Prettier 3 respeita o `.gitignore`: **não** mexa em
  `.prettierignore`.
- Churn de lockfile: o install deve acrescentar um pacote. Se o diff do `package-lock.json` mudar
  versão de outro pacote, pare e reporte (lição da fase 0, plano 007).
- `prettier-plugin-tailwindcss` está instalado; rode `npm run format` só sobre `src/styles/global.css`
  (`npx prettier --write src/styles/global.css`), não sobre o repositório.

## Passos

1. `git rm plans/fase-3-site-publico/.gitkeep` → verify: `git status --short plans/fase-3-site-publico` colado mostrando `D  plans/fase-3-site-publico/.gitkeep`.
2. Instalar `@fontsource/archivo` com versão exata → verify: `grep -n "fontsource" package.json` colado sem `^`; `git diff --stat package-lock.json` colado; `ls node_modules/@fontsource/archivo/latin-200.css node_modules/@fontsource/archivo/latin-300.css` colado.
3. Reescrever `src/styles/global.css` com imports, `@theme`, `@utility`, `@layer base` e movimento, com um comentário de topo apontando `docs/identidade-visual.md` §2–§4 e §7 → verify: `npx prettier --check src/styles/global.css` colado.
4. Build → verify: `npm run build:pipeline` com a saída do `astro check` e do `astro build` colada; em seguida `ls dist/_astro/*.woff2` colado (arquivos `archivo-latin-200-normal-*.woff2` e `-300-`) e `grep -rl "fonts.googleapis\|fonts.gstatic" dist/ --include=*.css --include=*.html` colado **vazio**.
5. Canário do utilitário (antes, `git status --short src/pages/index.astro` tem de sair vazio — senão o `checkout` do fim apagaria trabalho alheio; nesse caso pule e declare): `grep -o "text-display-1" dist/_astro/*.css` só aparece se alguma página usar a classe — como nenhuma usa ainda, prove que o utilitário compila adicionando **temporariamente** `class="text-display-1 bg-papel"` ao `<h1>` de `src/pages/index.astro`, rode `npx astro build`, cole `grep -o "clamp(2.625rem[^;]*" dist/_astro/*.css`, e **reverta** com `git checkout -- src/pages/index.astro` → verify: `git status --short src/pages` colado limpo.
6. Portão completo → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `@fontsource/archivo` em `dependencies` com versão exata; nenhum outro pacote mudou de versão no lock
- [ ] `global.css` importa apenas `latin-200.css` e `latin-300.css` do Fontsource
- [ ] Os seis tokens de cor, o cinza de comentário, as três famílias e os nove utilitários da escala existem com os valores literais do §2/§3 da identidade
- [ ] Breakpoints `sm` = 40rem e `lg` = 64rem, sem os defaults do Tailwind
- [ ] Keyframes e estado inicial oculto só dentro de `prefers-reduced-motion: no-preference`; bloco `reduce` zera animações e transições
- [ ] `dist/` contém os `.woff2` da Archivo 200/300 e nenhuma referência a `fonts.googleapis`/`fonts.gstatic`
- [ ] Canário do passo 5 mostrou o `clamp` compilado e foi revertido
- [ ] `lint`, `format:check`, `test:coverage` e `build:pipeline` verdes, com saída colada
- [ ] `.gitkeep` da pasta da fase removido

## Evidência

<Preenchido pelo executor ao concluir. Declare também o que NÃO rodou.>
