# Plano 063 — Views: Pesquisa e Ensino

**Status:** TODO
**RFs cobertos:** sabatina fase 4, Decisão 6; §10.4; RF-22, RF-13, RF-23 sem mudança de comportamento; menor adiado do polimento (linha de projeto duplicada)
**Depende de:** planos 055, 056, 058, 059
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 6)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O corpo de `pesquisa.astro` e `ensino.astro` vira `ResearchView` e `TeachingView`; a linha de projeto,
hoje escrita duas vezes em `pesquisa.astro`, vira o componente `ProjectItem.astro`; os links para as
disciplinas saem de `coursePath`. O HTML das rotas PT não muda.

## Arquivos afetados

- `src/views/ResearchView.astro`, `src/views/TeachingView.astro` — novos
- `src/components/ProjectItem.astro` — novo
- `src/pages/pesquisa.astro`, `src/pages/ensino.astro` — viram páginas finas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. Sem rota EN e sem `localize` aqui (066, 067).

## Contexto necessário

**Padrão de view e de página fina:** o do plano 062 (leia `plans/fase-4-internacionalizacao/062-views-home-sobre-e-404.md`,
seção "Contexto necessário") — `lang: Locale` obrigatória, `const t = strings(lang)`, página fina com
cabeçalho §10.1 e `<XView lang="pt" />`.

**`pesquisa.astro` (163 linhas):** o `<li class="projeto-linha py-3">…</li>` aparece duas vezes,
idêntico (linhas 89–106 dentro das linhas de pesquisa e 123–140 em "Outros projetos"), junto com a
função `projectMeta` (46–52). Extraia para `ProjectItem.astro` com prop `project`
(`CollectionEntry<'projetos'>`), levando `projectMeta` para dentro dele e trocando `pt.research.status`
por `t.research.status` (idioma pelo caminho, decisão de fatiamento 2 do README da fase). **O `<li>`
fica no componente**, com a mesma classe `projeto-linha` — a régua é do `<style>` da view
(`.projeto-linha { border-top… }`, 159–161). Cuidado: estilo escopado de componente não alcança
elemento de outro componente; a regra `.projeto-linha` tem de ir para o `ProjectItem` (ou virar
`:global` na view). Confirme a régua no navegador (passo 6), porque o comparador **remove** `<style>`
e não vê essa diferença.

**`ensino.astro` (138 linhas):** os dois `href={\`/ensino/${courseSlug(course.filePath)}/\`}` (69 e 107)
→ `coursePath(courseSlug(course.filePath), lang)` (056). `formatDate(latest.data, 'pt')` (059) →
`formatDate(latest.data, lang)`. `pt.teaching.*` → `t.teaching.*`. `buildCourseSlugs(disciplinas)`
fica (reprova slug duplicado no build).

**Tamanho:** views e `ProjectItem` < 150 linhas.

**Prova:** comparador (055) todo `IGUAL`, mais o navegador para as réguas.

**Regras de código:** README da fase 4. Os comentários `// RN-01`, `// RN-03`, `// RN-04` existentes vão
junto com o código que eles explicam.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `ProjectItem.astro`, as duas views e as duas páginas finas → verify: `npx astro check` colado; `wc -l` dos cinco arquivos colado.
3. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0.
4. Sem `pt` direto nem `/ensino/` escrito à mão → verify: `grep -n "i18n/pt'\|/ensino/" src/views/ResearchView.astro src/views/TeachingView.astro src/components/ProjectItem.astro` colado (esperado: vazio).
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados.
6. **Orquestrador — navegador:** `/pesquisa/` e `/ensino/` a 360/768/1440 — `[scrollWidth, clientWidth]`; régua fina acima de **cada** projeto (dentro da linha e em "Outros projetos", se houver) e régua forte no topo de cada linha de pesquisa; link de disciplina atual e anterior levando à página certa.

## Critérios de aceitação

- [ ] `ResearchView`, `TeachingView` e `ProjectItem` criados; a linha de projeto existe uma vez só
- [ ] Links de disciplina por `coursePath`; nenhum `pt` direto
- [ ] Views, componente e páginas abaixo de 150 linhas (contagem colada)
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [ ] Réguas de projeto e de linha conferidas no navegador (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 6 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
