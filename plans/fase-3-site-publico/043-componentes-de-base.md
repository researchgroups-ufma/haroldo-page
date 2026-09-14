# Plano 043 — Componentes de base: cabeçalho de página, pílula, tag e link externo

**Status:** TODO
**RFs cobertos:** item "Identidade visual aplicada" do §12 (com o 036); RF-32 (movimento de
entrada), RNF-15, §8.3 (links externos identificados)
**Depende de:** planos 036 (tokens e classes de movimento), 037 (dicionário)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Quatro componentes reutilizados por todas as rotas, exatamente como a identidade os descreve: o
cabeçalho de página (rubrica + `<h1>` + régua forte, com o único movimento orquestrado do site), o
botão pílula, a tag e o link externo acessível.

## Arquivos afetados

- `src/components/PageHeader.astro` — novo
- `src/components/PillButton.astro` — novo
- `src/components/Tag.astro` — novo
- `src/components/ExternalLink.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. O plano 042 pode estar rodando em paralelo
> (`src/layouts/BaseLayout.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `src/pages/index.astro`,
> e o `git rm` de `src/components/.gitkeep`): não edite esses arquivos.

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §5.3 (Botão pílula), §5.4 (Tag), §5.5 (Linha de
lista — a parte do link externo), §4 (réguas, raio) e §7 (Movimento). Leia inteiras. `ref/` não
existe para você.

**Regras herdadas:** seção "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**`PageHeader.astro`** — props: `eyebrow: string` (rubrica, `text-rotulo text-secundario`),
`title: string` (`<h1 class="text-display-1 titulo-entrada">`), slot nomeado `aside` opcional (coluna
direita a partir de `lg`, grade `7 / 5` colunas; abaixo empilha). Abaixo, a régua forte: um
elemento `<div aria-hidden="true" class="regua-entrada h-px bg-tinta">` de ponta a ponta. As classes
`regua-entrada` e `titulo-entrada` vêm do `global.css` (plano 036) e **só animam dentro de
`prefers-reduced-motion: no-preference`** — não acrescente animação aqui. Sem slot `aside`, o `<h1>`
ocupa a largura e não sobra coluna vazia.

**`PillButton.astro`** (§5.3) — props: `href: string`, `label: string`, `variant?: 'outline' |
'solid'` (default `outline`). É um `<a>`, não `<button>` (navega). Altura ≥ 48 px, borda 1 px
`--tinta`, `rounded-full`, texto à esquerda, disco de 32 px à direita com `›` (`aria-hidden`).
`outline`: fundo transparente, disco `bg-tinta text-papel`; hover `bg-bloco`. `solid`: fundo
`bg-tinta text-papel`, disco `bg-papel text-tinta` — **só** a 404 usa (§5.3). Transição de fundo
120 ms (§7).

**`Tag.astro`** (§5.4) — props: `variant: 'strong' | 'neutral' | 'solid'`, `dot?: boolean`,
`dashed?: boolean`; conteúdo por slot. `text-rotulo` com `padding: 0.4rem 0.7rem`. `strong`: borda
`--tinta`; `neutral`: borda `--regua`, texto `--secundario`; `solid`: fundo `--tinta`, texto
`--papel`. `dot`: marcador circular de 6 px `bg-tinta` antes do texto (`aria-hidden`). `dashed`:
borda tracejada `border-tracejado` — **nunca** carrega informação sozinha (2,52:1, §2 da identidade);
o texto da tag é quem diz. Mapa de uso, para a docstring: "Em andamento" = `strong` + `dot`;
"Concluído" = `neutral` + `dashed`; "Destaque" = `solid`. **Exceção de caixa:** as áreas de atuação
em Sobre são tags neutras em **caixa normal** (§6.2) — prop `normalCase?: boolean`, que troca
`text-rotulo` por `text-pequeno`.

**`ExternalLink.astro`** (§5.5, §8.3) — props: `href: string`, `class?: string`; conteúdo por slot.
Renderiza `<a href target="_blank" rel="noopener noreferrer">`, o slot, ` ↗` com `aria-hidden="true"`
e `<span class="sr-only">{pt.site.opensInNewTab}</span>`. Todo link externo das rotas (planos 044–050) usa este
componente. O rodapé do 042 foi escrito antes dele e fica com o link inline, com as mesmas regras —
não o altere aqui.

**Nenhum JS** neste plano.

**Onde ver os componentes antes de haver página:** não crie página de demonstração. A verificação
visual acontece quando as rotas os usarem; aqui a verificação é de HTML gerado com um **uso
temporário** em `src/pages/index.astro`, revertido ao final (passo 3). Como o 042 edita esse arquivo e a
reversão é `git checkout`, **este passo só roda com o trabalho do 042 já commitado** — senão o
`checkout` apagaria o trabalho do outro plano. Confira com `git status --short src/pages/index.astro`
(tem de sair vazio antes de começar); se não estiver, pule o passo 3 e declare-o como não rodado.

## Passos

1. Escrever os quatro componentes → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` com saída do `astro check` e `astro build` colada.
3. Uso temporário: acrescente em `src/pages/index.astro` um `PageHeader` com `aside`, uma `PillButton` de cada variante, as três `Tag` (com `dot` e `dashed`) e um `ExternalLink`; `npx astro build`; cole `grep -o 'target="_blank" rel="noopener noreferrer"' dist/index.html`, `grep -o 'class="sr-only">[^<]*' dist/index.html` e `grep -c 'regua-entrada' dist/index.html` → verify: saídas coladas; o orquestrador abre `npx astro preview` em 360 e 1440, confere réguas, disco da pílula, tags e a animação da régua (e, com *Emulate prefers-reduced-motion: reduce*, a ausência dela), e transcreve. Reverta com `git checkout -- src/pages/index.astro` → verify: `git status --short src/pages` colado, vazio.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Quatro componentes com as props e variantes listadas, texto de interface só via `src/i18n/pt.ts`
- [ ] `PageHeader` usa `regua-entrada`/`titulo-entrada` e não declara animação própria
- [ ] Link externo sempre com `target="_blank"`, `rel="noopener noreferrer"`, `↗` oculto do leitor de tela e texto "(abre em nova aba)"
- [ ] Observado no navegador: régua se desenha e `<h1>` sobe com movimento; com `reduce`, nada anima e tudo está visível (ou o passo 3 declarado não rodado, com motivo)
- [ ] Uso temporário revertido
- [ ] `astro check`, `lint`, `format:check`, `test:coverage` e `build:pipeline` verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc de props, incluindo comportamento com prop ausente

## Evidência

<Preenchido pelo executor e, no passo 3, pelo orquestrador. Declare o que NÃO rodou.>
