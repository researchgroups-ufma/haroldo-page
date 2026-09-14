# Plano 041 — Disciplinas: slug da URL, atuais × anteriores, contagens e scripts por aula (F-13)

**Status:** TODO
**RFs cobertos:** RF-23, RF-24, RF-37, F-13, RN-03, RN-04; §11 (ordenação de aulas, geração de slug)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`src/lib/courses.ts` decide a URL de cada disciplina (e reprova slug duplicado), separa atuais de
anteriores com ordem definida, conta aulas/listas/scripts, agrupa scripts sob as aulas (F-13) e
lista as seções presentes para o "Nesta página".

## Arquivos afetados

- `src/lib/courses.ts` — novo: `courseSlug`, `buildCourseSlugs`, `splitCourses`, `countCourseItems`,
  `groupScriptsByLesson`, `presentSections`
- `tests/lib/courses.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. **Não** remova `src/lib/.gitkeep` (plano 037).

## Contexto necessário

**Schema** (`disciplinasSchema`, `src/content.config.ts:364-379`): `nome`, `codigo?`, `semestre`
(string livre, ex. `'2026.2'`), `status: 'atual' | 'anterior'`, `aulas?: {numero, titulo, data?,
descricao?, url}[]`, `listas?`, `materiais?`, `bibliografia?`, `links?`, `scripts?: {titulo,
descricao?, linguagem, codigo, aula?: number, url?}[]`, `ementa?`, `publicado`. Sem funções de
`astro:content` aqui; tipos estruturais ou `z.infer<typeof disciplinasSchema>` (importar de
`src/content.config.ts` em teste funciona — ver `tests/content/schemas.test.ts`).

### Slug da URL (README da fase, decisão 3 — leia inteira)

O Tina grava o arquivo como `` `${semestre}-${slugify(nome)}` `` (`tina/config.ts:488-489`) — o
**semestre não passa por `slugify`**, por isso o ponto: `content/disciplinas/2026.2-relatividade-geral.md`.

- **Não use `entry.id`.** O loader `glob()` aplica `githubSlug` a cada segmento
  (`node_modules/astro/dist/content/utils.js:272`), que remove o ponto: o id vira
  `20262-relatividade-geral`. Registre na Evidência o `id` real observado no build (passo 4).
- **Não use `semestre` + `nome` dos dados:** corrigir o nome mudaria a URL guardada pelos alunos; o
  nome do arquivo nasce na criação (RN-08).
- **Regra:** `courseSlug(filePath: string | undefined): string` = `slugify` (de `src/lib/slug.ts`)
  aplicado ao **nome do arquivo sem a extensão `.md`**. `2026.2-relatividade-geral.md` →
  `2026-2-relatividade-geral`. Aceite separador `/` e `\` (use `path.posix.basename` depois de
  trocar `\` por `/`, ou equivalente sem depender do SO). `filePath` `undefined` (é opcional no tipo:
  `node_modules/astro/dist/content/data-store.d.ts:22`) ou slug vazio → lança `Error` nomeando o
  problema.
- **`buildCourseSlugs(entries: { filePath?: string }[]): Map<string, string>`** (slug → filePath) —
  lança `Error` se dois arquivos derem o mesmo slug, com a mensagem nomeando **os dois caminhos**
  (ex.: `2026.2-x.md` e `2026-2-x.md`). A página `ensino/[slug].astro` (plano 048) chama isto em
  `getStaticPaths`, então slug duplicado **reprova o build** em vez de uma página sobrescrever a outra.

### Atuais × anteriores (RN-03, RF-23; §6.4 da identidade)

**`splitCourses<T extends { data: { status: 'atual' | 'anterior'; semestre: string; nome: string }
}>(entries: T[]): { current: T[]; previous: T[] }`** — separa por `status` (a transição é manual,
RN-03; **nenhuma** lógica de data). Nos dois grupos: `semestre` decrescente com
`b.localeCompare(a, 'pt-BR', { numeric: true })`, empate por `nome` crescente `pt-BR`. A identidade
só fixa a ordem das anteriores; a das atuais é decisão deste plano (mesma regra, para as duas
listas se comportarem igual). Entrada não mutada.

### Contagens (§6.4)

**`countCourseItems(data): { lessons: number; problemSets: number; scripts: number }`** — `length`
de `aulas`, `listas` e `scripts`, com ausente = 0. A página mostra só as não nulas.

### Scripts por aula (F-13, RF-37; §6.5 da identidade)

**`groupScriptsByLesson<S extends { aula?: number }>(lessons: { numero: number }[], scripts: S[]):
{ byLesson: S[][]; general: S[] }`**
- `byLesson[i]` são os scripts da aula na **posição** `i` de `lessons` — alinhado por índice, não
  por número, porque as aulas são exibidas na ordem do professor (RN-04) e não por `numero`.
- Script cujo `aula` casa com o `numero` de uma aula vai para a **primeira** aula com esse número
  (o schema permite números repetidos; documente a escolha na docstring).
- Script sem `aula`, ou com `aula` que não casa com nenhuma → `general` (F-13: o build não falha e
  nenhum script some).
- Ordem relativa dos scripts preservada em cada grupo (ordem do professor).
- Invariante: `byLesson.flat().length + general.length === scripts.length`.

Exemplo real (`content/disciplinas/2026.2-relatividade-geral.md:56-71`): um script com `aula: 4`,
e existe aula `numero: 4` na posição 3 → `byLesson[3]` tem o script, `general` vazio.

**Nunca** reordene `lessons` — `// RN-04: ordem definida pelo professor, não por número nem data`.

### Seções presentes (§6.5, "Nesta página")

**`presentSections(data, generalScriptsCount: number): { id: string; key: SectionKey; count: number }[]`**
na ordem fixa das seções do §6.5 da identidade:

1. `ementa` — só se `ementa?.trim()` não vazio, com `count: 1` (não dependa do plano 038);
2. `aulas` — **sempre** presente, mesmo com `count: 0` (F-06 exige estado vazio explícito);
3. `scripts` — só se `generalScriptsCount > 0` (scripts ligados a aula aparecem dentro de Aulas);
4. `listas`, 5. `materiais`, 6. `bibliografia`, 7. `links` — cada um só se `length > 0`. `key` é a chave de
`pt.course` correspondente (`syllabus`, `lessons`, `courseScripts`, `problemSets`, `materials`,
`bibliography`, `links`), tipada como união literal local — **não** importe `src/i18n/pt.ts` (plano
037 pode estar rodando em paralelo). `id` é o id da âncora HTML: `ementa`, `aulas`, `scripts`,
`listas`, `materiais`, `bibliografia`, `links`.

### Testes (fixtures sintéticas para valores exatos)

- `courseSlug`: `content/disciplinas/2026.2-relatividade-geral.md` → `2026-2-relatividade-geral`;
  com `\`; `undefined` → lança; `'.md'` → lança.
- `buildCourseSlugs`: dois caminhos distintos → mapa com 2; `2026.2-x.md` e `2026-2-x.md` → lança
  com os dois caminhos na mensagem.
- `splitCourses`: `2025.1`, `2026.2`, `2025.2` → `2026.2, 2025.2, 2025.1`; `2026.10` vs `2026.9`
  (numérico: `2026.10` primeiro); empate por nome.
- `countCourseItems`: tudo ausente → zeros.
- `groupScriptsByLesson`: aula casando; aula inexistente → general; sem aula → general; número de
  aula repetido → primeira; invariante de total; ordem preservada.
- `presentSections`: disciplina só com obrigatórios → `[aulas(0)]`; completa → ordem fixa.
- **Com conteúdo real** (invariante): para cada `content/disciplinas/*.md` lido com `gray-matter`,
  `courseSlug` não lança e `buildCourseSlugs` sobre todos não lança.

**Cabeçalho §10.1** e TSDoc em todas as funções exportadas.

## Passos

1. Escrever `src/lib/courses.ts` → verify: `npx astro check` com linha de resumo colada.
2. Escrever `tests/lib/courses.test.ts` → verify: `npx vitest run tests/lib/courses.test.ts` colado.
3. Canários: (a) `courseSlug` usando só `githubSlug`-like (remova o `slugify`, apague o ponto com `replace('.', '')`) → caso `2026.2` vermelho; (b) `groupScriptsByLesson` descartando órfãos → invariante vermelho; (c) `buildCourseSlugs` sem checagem de duplicado → vermelho; reverta → verify: saídas coladas; `git diff src/lib/courses.ts` sem mudanças temporárias.
4. Observar o id real do Astro: `npx astro build` e, **sem criar arquivo**, cole a linha de `.astro/data-store.json` que contém `relatividade-geral` (`grep -o '"id":"[^"]*relatividade-geral[^"]*"' .astro/data-store.json`; se o arquivo tiver outro nome, liste `.astro/` e cole) → verify: valor colado; se **não** for `20262-relatividade-geral`, registre a divergência (a decisão do slug continua valendo).
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Seis funções exportadas com as regras acima; `lessons` nunca reordenado
- [ ] Slug `2026-2-relatividade-geral` para o arquivo real; duplicado lança nomeando os dois caminhos
- [ ] Nenhum script some em `groupScriptsByLesson` (invariante testado)
- [ ] Canários (a), (b) e (c) mostrados vermelhos e revertidos
- [ ] Id real do Astro registrado na Evidência
- [ ] `astro check`, `lint`, `format:check`, `test:coverage` (≥ 80%) verdes, com saída colada
- [ ] Cabeçalho §10.1, TSDoc e comentários `// RN-04`, `// F-13`

## Evidência

<Preenchido pelo executor ao concluir. Declare também o que NÃO rodou.>
