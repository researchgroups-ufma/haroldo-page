# Plano 059 — Componentes de conteúdo e data por idioma

**Status:** TODO
**RFs cobertos:** §8.3 (data no formato do locale da rota), §10.4; menor adiado do polimento (`hover:underline` sem o afastamento único)
**Depende de:** planos 055 (comparador), 056 (`localeFromPath`), 057 (`strings`, `date.format`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 6)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Os componentes de conteúdo usam o dicionário do idioma do caminho, e `formatDate` formata a data
pelo locale (`10/08/2026` em PT; `August 10, 2026` em EN). As páginas PT continuam **idênticas**,
com uma única diferença deliberada e listada: o sublinhado de hover dos títulos de aula, lista,
material e link ganha o afastamento de 6 px do resto do site.

## Arquivos afetados

- `src/lib/date.ts` — `formatDate(value, lang)`
- `tests/lib/date.test.ts` — acompanha
- `src/components/ExternalLink.astro`
- `src/components/LessonList.astro` — dicionário, `formatDate(…, lang)` e a classe de hover
- `src/components/ScriptPanel.astro`
- `src/components/CourseResources.astro` — dicionário, `formatDate(…, lang)` e a classe de hover
- `src/components/PublicationItem.astro`
- `src/pages/ensino.astro` — só a chamada `formatDate(latest.data)` → `formatDate(latest.data, 'pt')`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite.

## Contexto necessário

**Padrão** (decisão de fatiamento 2 do README da fase): em cada componente,
`const lang = localeFromPath(Astro.url.pathname); const t = strings(lang);` e troca de `pt.` por
`t.`. Usos atuais de `pt` (grep de 2026-09-24): `ExternalLink.astro:39` (`site.opensInNewTab`),
`LessonList.astro:71` (`course.lessonNumber`), `ScriptPanel.astro:58,69,70,73,78`
(`script.eyebrow`, `script.language`, `copy`, `copied`, `openFile`), `CourseResources.astro:52,61,72,76,93,100,111`,
`PublicationItem.astro:47-49` (`publications.doi`/`arxiv`/`pdf`).

**`src/lib/date.ts`** (45 linhas): `formatDate(value)` casa `^(\d{4})-(\d{2})-(\d{2})$` sobre
`value.trim()` e devolve `dd/mm/aaaa`; fora do padrão, devolve `value.trim()`. Nova assinatura:
`formatDate(value: string, lang: Locale): string` — casou o padrão, delega a
`strings(lang).date.format(year, month, day)` (057); não casou, devolve `value.trim()` como hoje. Sem
`Date` nem `Intl` (a nota do cabeçalho explica o fuso). Callers conferidos por grep:
`LessonList.astro:72`, `CourseResources.astro:61`, `src/pages/ensino.astro:83`.
`tests/lib/date.test.ts`: os casos PT existentes passam a chamar com `'pt'`; acrescente EN
(`'2026-08-10'` → `'August 10, 2026'`, `'2026-03-05'` → `'March 5, 2026'`, texto livre intacto, mês
`13` conforme o `en.date.format` do 057).

**Hover (menor adiado do polimento, `plans/README.md` "Para a fase 4", item 5):** a identidade
(`docs/identidade-visual.md` §5.3) diz "Hover: sublinhado de 1 px deslocado 6 px no título"; o resto
do site usa `decoration-1 underline-offset-[6px]` com o `hover:underline` (ex.:
`src/pages/ensino.astro:114`, `src/pages/404.astro:49`). Em `LessonList.astro:75` e
`CourseResources.astro:56,78,115` falta o afastamento. Acrescente `decoration-1 underline-offset-[6px]`
a essas quatro classes — e **só** a elas (o link "Acessar" da bibliografia usa `underline` fixo, não
hover; não mexa).

**Prova em duas etapas**, para a diferença deliberada não se misturar com a refatoração:
1. só a troca de dicionário e de `formatDate` → comparador **todo `IGUAL`**;
2. depois a classe de hover → comparador `DIFERENTE` **apenas** nas rotas `ensino/<slug>/index.html`,
   e o contexto impresso mostrando só a classe nova.

**Regras de código:** README da fase 4.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `date.ts` e o teste → verify: `npm test -- --reporter=verbose tests/lib/date.test.ts` colado.
3. Troca de dicionário nos cinco componentes e a chamada em `ensino.astro` → verify: `npx astro check` colado.
4. Etapa 1 → verify: `npm run build:pipeline`; `retrato <scratch>\meio.json`; `comparar antes.json meio.json` colado — toda rota `IGUAL`, exit 0.
5. Classe de hover nos quatro links → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar meio.json depois.json` colado — `DIFERENTE` só nas páginas de disciplina, com o contexto mostrando `decoration-1 underline-offset-[6px]`; demais `IGUAL`.
6. **Orquestrador — navegador** (README da fase): `/ensino/2026-2-relatividade-geral/` a 1440: hover num título de aula e num material mostra o sublinhado afastado como o de `/ensino/`; data da aula em `dd/mm/aaaa`; `[scrollWidth, clientWidth]` a 360/768/1440.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados.

## Critérios de aceitação

- [ ] Nenhum dos cinco componentes importa `pt` direto
- [ ] `formatDate(value, lang)` com testes PT e EN; nenhum `Date`/`Intl`
- [ ] Etapa 1 do comparador toda `IGUAL`; etapa 2 `DIFERENTE` só nas páginas de disciplina e só pela classe de hover
- [ ] Hover com o afastamento de 6 px observado no navegador (passo 6, orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 6 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
