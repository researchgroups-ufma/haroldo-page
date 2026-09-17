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

Status permanece `TODO` e nenhum checkbox foi marcado, conforme regra do despacho — esta seção documenta os três ciclos desta sessão: execução original (ciclo 1), primeira correção depois do REPROVADO (ciclo 2) e esta segunda correção (ciclo 3). Nada commitado nos três ciclos.

### Ciclo 1 — revisão REPROVADO (resumo)

1. Testes de erro de `courseSlug` (`undefined`, `'.md'`) aceitavam qualquer exceção — corrigido conferindo a mensagem do `Error` por regex.
2. `current` de `splitCourses` nunca era verificado — corrigido com dois testes novos.
3. Blocos de canário sem o comando exato — refeitos com o comando explícito acima de cada saída.

### Ciclo 2 — revisão REPROVADO (resumo)

As três correções do ciclo 1 foram confirmadas por mutação. Dois problemas novos, ambos corrigidos nesta seção (ciclo 3):

1. **Evidência reescrita à mão** — o bloco do `npx astro build` e o `grep` de contexto do id estavam digitados como string dentro de `scratchpad/build_evidence.py`, e divergiam do arquivo capturado de fato (horário trocado, caracteres `✓`/`├─` removidos). Corrigido: esta versão da Evidência é montada por um script que só faz `open(arquivo).read()` — nenhuma saída de comando é digitada. O script e o manifesto usados estão em `scratchpad/build_evidence2.py` e `scratchpad/verify_evidence.py` (fora do repositório, na pasta de scratch da sessão).
2. **Ordenação de `current` sem teste que a exercitasse** — remover `.sort(compareCourseGroup)` de `current` continuava verde, porque a fixture do teste de status mistos já trazia as disciplinas atuais na ordem certa. Corrigido: a fixture agora tem a atual mais antiga ANTES da mais recente na entrada, então só o `.sort()` reordena para o resultado esperado; canário (f) novo comprova.

### Passo 1 — `npx astro check`

```
13:21:54 [content] Syncing content
13:21:54 [content] Synced content
13:21:54 [types] Generated 394ms
13:21:54 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (35 files): 
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 2 — `npx vitest run tests/lib/courses.test.ts` (25 testes)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  25 passed (25)
   Start at  13:22:00
   Duration  226ms (transform 44ms, setup 0ms, import 85ms, tests 19ms, environment 0ms)
```

### Passo 3 — Canários

**Canário (a)** — comando `npx vitest run tests/lib/courses.test.ts`, com `slugify(withoutExtension)` trocado por `withoutExtension.replace('.', '')` em `courseSlug` (simula `githubSlug`, que remove o ponto em vez de gerar hífen). Vermelho:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/courses.test.ts (25 tests | 4 failed) 23ms
     × deriva o slug do nome do arquivo real, preservando o ponto do semestre como hífen 5ms
     × aceita separador de caminho \ (Windows) 0ms
     × constrói o mapa de slug para filePath para caminhos distintos 1ms
     × lança nomeando os dois caminhos quando dois arquivos geram o mesmo slug 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/courses.test.ts > courseSlug > deriva o slug do nome do arquivo real, preservando o ponto do semestre como hífen
AssertionError: expected '20262-relatividade-geral' to be '2026-2-relatividade-geral' // Object.is equality

Expected: "2026-2-relatividade-geral"
Received: "20262-relatividade-geral"

 ❯ tests/lib/courses.test.ts:16:76
     14| describe('courseSlug', () => {
     15|   it('deriva o slug do nome do arquivo real, preservando o ponto do se…
     16|     expect(courseSlug('content/disciplinas/2026.2-relatividade-geral.m…
       |                                                                            ^
     17|       '2026-2-relatividade-geral',
     18|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  tests/lib/courses.test.ts > courseSlug > aceita separador de caminho \ (Windows)
AssertionError: expected '20262-relatividade-geral' to be '2026-2-relatividade-geral' // Object.is equality

Expected: "2026-2-relatividade-geral"
Received: "20262-relatividade-geral"

 ❯ tests/lib/courses.test.ts:22:78
     20|
     21|   it('aceita separador de caminho \\ (Windows)', () => {
     22|     expect(courseSlug('content\\disciplinas\\2026.2-relatividade-geral…
       |                                                                              ^
     23|       '2026-2-relatividade-geral',
     24|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/lib/courses.test.ts > buildCourseSlugs > constrói o mapa de slug para filePath para caminhos distintos
AssertionError: expected undefined to be 'content/disciplinas/2026.2-relativida…' // Object.is equality

- Expected:
"content/disciplinas/2026.2-relatividade-geral.md"

+ Received:
undefined

 ❯ tests/lib/courses.test.ts:43:50
     41|     ]);
     42|     expect(map.size).toBe(2);
     43|     expect(map.get('2026-2-relatividade-geral')).toBe(
       |                                                  ^
     44|       'content/disciplinas/2026.2-relatividade-geral.md',
     45|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/lib/courses.test.ts > buildCourseSlugs > lança nomeando os dois caminhos quando dois arquivos geram o mesmo slug
AssertionError: expected [Function] to throw an error

- Expected:
null

+ Received:
undefined

 ❯ tests/lib/courses.test.ts:54:80
     52|     const pathA = 'content/disciplinas/2026.2-x.md';
     53|     const pathB = 'content/disciplinas/2026-2-x.md';
     54|     expect(() => buildCourseSlugs([{ filePath: pathA }, { filePath: pa…
       |                                                                                ^
     55|       /2026\.2-x\.md.*2026-2-x\.md|2026-2-x\.md.*2026\.2-x\.md/,
     56|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 21 passed (25)
   Start at  13:20:08
   Duration  239ms (transform 51ms, setup 0ms, import 91ms, tests 23ms, environment 0ms)
```

Revertido de volta a `slugify(withoutExtension)`.

**Canário (b)** — comando `npx vitest run tests/lib/courses.test.ts`, com o `else` de `groupScriptsByLesson` removido (`if (index !== -1) { byLesson[index].push(script); }`, sem o `general.push(script)` do ramo `-1`). Vermelho:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/courses.test.ts (25 tests | 4 failed) 24ms
     × script com aula inexistente vai para general (F-13) 5ms
     × script sem aula vai para general 1ms
     × invariante: byLesson.flat().length + general.length === scripts.length 1ms
     × preserva a ordem relativa dos scripts em cada grupo 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/courses.test.ts > groupScriptsByLesson > script com aula inexistente vai para general (F-13)
AssertionError: expected [] to deeply equal [ { id: 'orfao', aula: 99 } ]

- Expected
+ Received

- [
-   {
-     "aula": 99,
-     "id": "orfao",
-   },
- ]
+ []

 ❯ tests/lib/courses.test.ts:145:21
    143|     const { byLesson, general } = groupScriptsByLesson(lessons, script…
    144|     expect(byLesson).toEqual([[], []]);
    145|     expect(general).toEqual([{ id: 'orfao', aula: 99 }]);
       |                     ^
    146|   });
    147|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  tests/lib/courses.test.ts > groupScriptsByLesson > script sem aula vai para general
AssertionError: expected [] to deeply equal [ { id: 'sem-aula' } ]

- Expected
+ Received

- [
-   {
-     "id": "sem-aula",
-   },
- ]
+ []

 ❯ tests/lib/courses.test.ts:153:21
    151|     const { byLesson, general } = groupScriptsByLesson(lessons, script…
    152|     expect(byLesson).toEqual([[]]);
    153|     expect(general).toEqual([{ id: 'sem-aula' }]);
       |                     ^
    154|   });
    155|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/lib/courses.test.ts > groupScriptsByLesson > invariante: byLesson.flat().length + general.length === scripts.length
AssertionError: expected 3 to be 5 // Object.is equality

- Expected
+ Received

- 5
+ 3

 ❯ tests/lib/courses.test.ts:174:53
    172|     ];
    173|     const { byLesson, general } = groupScriptsByLesson(lessons, script…
    174|     expect(byLesson.flat().length + general.length).toBe(scripts.lengt…
       |                                                     ^
    175|   });
    176|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/lib/courses.test.ts > groupScriptsByLesson > preserva a ordem relativa dos scripts em cada grupo
AssertionError: expected [] to deeply equal [ 'geral-1', 'geral-2' ]

- Expected
+ Received

- [
-   "geral-1",
-   "geral-2",
- ]
+ []

 ❯ tests/lib/courses.test.ts:187:38
    185|     const { byLesson, general } = groupScriptsByLesson(lessons, script…
    186|     expect(byLesson[0].map((s) => s.id)).toEqual(['aula-1', 'aula-2']);
    187|     expect(general.map((s) => s.id)).toEqual(['geral-1', 'geral-2']);
       |                                      ^
    188|   });
    189|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 21 passed (25)
   Start at  13:20:25
   Duration  241ms (transform 54ms, setup 0ms, import 94ms, tests 24ms, environment 0ms)
```

Revertido de volta ao `if (index === -1) { general.push(script); } else { byLesson[index].push(script); }`.

**Canário (c)** — comando `npx vitest run tests/lib/courses.test.ts`, com a checagem `if (existing !== undefined) throw ...` removida de `buildCourseSlugs` (o segundo arquivo sobrescreve o slug do primeiro em silêncio). Vermelho:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/courses.test.ts (25 tests | 1 failed) 21ms
     × lança nomeando os dois caminhos quando dois arquivos geram o mesmo slug 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/courses.test.ts > buildCourseSlugs > lança nomeando os dois caminhos quando dois arquivos geram o mesmo slug
AssertionError: expected [Function] to throw an error

- Expected:
null

+ Received:
undefined

 ❯ tests/lib/courses.test.ts:54:80
     52|     const pathA = 'content/disciplinas/2026.2-x.md';
     53|     const pathB = 'content/disciplinas/2026-2-x.md';
     54|     expect(() => buildCourseSlugs([{ filePath: pathA }, { filePath: pa…
       |                                                                                ^
     55|       /2026\.2-x\.md.*2026-2-x\.md|2026-2-x\.md.*2026\.2-x\.md/,
     56|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 24 passed (25)
   Start at  13:20:42
   Duration  235ms (transform 51ms, setup 0ms, import 90ms, tests 21ms, environment 0ms)
```

Revertido de volta à checagem de duplicado com `throw`.

**Canário (d)** — comando `npx vitest run tests/lib/courses.test.ts`, com a guarda `if (filePath === undefined)` trocada por `if (false)` em `courseSlug` — sem a guarda, `filePath.replace(...)` lança `TypeError: Cannot read properties of undefined (reading 'replace')`, que não casa com a regex `/courseSlug: filePath ausente/` do teste. Vermelho:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/courses.test.ts (25 tests | 1 failed) 21ms
     × lança com a mensagem "filePath ausente" se filePath for undefined 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/courses.test.ts > courseSlug > lança com a mensagem "filePath ausente" se filePath for undefined
AssertionError: expected [Function] to throw error matching /courseSlug: filePath ausente/ but got 'Cannot read properties of undefined (…'

- Expected:
/courseSlug: filePath ausente/

+ Received:
"Cannot read properties of undefined (reading 'replace')"

 ❯ tests/lib/courses.test.ts:28:41
     26|
     27|   it('lança com a mensagem "filePath ausente" se filePath for undefine…
     28|     expect(() => courseSlug(undefined)).toThrow(/courseSlug: filePath …
       |                                         ^
     29|   });
     30|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 24 passed (25)
   Start at  13:20:59
   Duration  234ms (transform 52ms, setup 0ms, import 93ms, tests 21ms, environment 0ms)
```

Revertido de volta a `if (filePath === undefined)`.

**Canário (e)** — comando `npx vitest run tests/lib/courses.test.ts`, com `current` de `splitCourses` hardcoded para `[]`. Vermelho:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/courses.test.ts (25 tests | 1 failed) 23ms
     × separa status mistos, com toEqual exato em current e em previous 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/courses.test.ts > splitCourses > separa status mistos, com toEqual exato em current e em previous
AssertionError: expected [] to deeply equal [ { data: { …(3) } }, …(1) ]

- Expected
+ Received

- [
-   {
-     "data": {
-       "nome": "Relatividade Geral",
-       "semestre": "2026.2",
-       "status": "atual",
-     },
-   },
-   {
-     "data": {
-       "nome": "Mecânica Quântica",
-       "semestre": "2026.1",
-       "status": "atual",
-     },
-   },
- ]
+ []

 ❯ tests/lib/courses.test.ts:86:21
     84|     const entries = [anteriorAntigo, atualAntigo, anteriorRecente, atu…
     85|     const { current, previous } = splitCourses(entries);
     86|     expect(current).toEqual([atualRecente, atualAntigo]);
       |                     ^
     87|     expect(previous).toEqual([anteriorRecente, anteriorAntigo]);
     88|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 24 passed (25)
   Start at  13:21:16
   Duration  237ms (transform 53ms, setup 0ms, import 95ms, tests 23ms, environment 0ms)
```

Revertido de volta ao `filter` + `sort` original.

**Canário (f)** (novo, pedido do revisor no ciclo 2) — comando `npx vitest run tests/lib/courses.test.ts`, com `current` de `splitCourses` sem `.sort(compareCourseGroup)` (só o `filter`). A fixture do teste de status mistos tem a disciplina atual mais antiga (`atualAntigo`, `2026.1`) ANTES da mais recente (`atualRecente`, `2026.2`) na entrada, então sem `.sort()` o resultado sai na ordem de entrada — errado. Vermelho:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/lib/courses.test.ts (25 tests | 1 failed) 23ms
     × separa status mistos, com toEqual exato em current e em previous 6ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/courses.test.ts > splitCourses > separa status mistos, com toEqual exato em current e em previous
AssertionError: expected [ { data: { …(3) } }, …(1) ] to deeply equal [ { data: { …(3) } }, …(1) ]

- Expected
+ Received

  [
    {
      "data": {
-       "nome": "Relatividade Geral",
-       "semestre": "2026.2",
+       "nome": "Mecânica Quântica",
+       "semestre": "2026.1",
        "status": "atual",
      },
    },
    {
      "data": {
-       "nome": "Mecânica Quântica",
-       "semestre": "2026.1",
+       "nome": "Relatividade Geral",
+       "semestre": "2026.2",
        "status": "atual",
      },
    },
  ]

 ❯ tests/lib/courses.test.ts:86:21
     84|     const entries = [anteriorAntigo, atualAntigo, anteriorRecente, atu…
     85|     const { current, previous } = splitCourses(entries);
     86|     expect(current).toEqual([atualRecente, atualAntigo]);
       |                     ^
     87|     expect(previous).toEqual([anteriorRecente, anteriorAntigo]);
     88|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 24 passed (25)
   Start at  13:21:29
   Duration  241ms (transform 51ms, setup 0ms, import 93ms, tests 23ms, environment 0ms)
```

Revertido de volta ao `.sort(compareCourseGroup)` em `current`.

**Prova da reversão dos seis canários** — comando `npx vitest run tests/lib/courses.test.ts` depois de revertido o canário (f) (o último aplicado), verde:

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  25 passed (25)
   Start at  13:21:44
   Duration  224ms (transform 50ms, setup 0ms, import 90ms, tests 18ms, environment 0ms)
```

O arquivo é novo/untracked (sem base para `git diff`); `git status --short` confirma que só os três arquivos deste plano mudaram, nada residual de canário:

```
 M plans/fase-3-site-publico/041-disciplinas-slug-grupos-contagens-e-scripts.md
?? src/lib/courses.ts
?? tests/lib/courses.test.ts
```

### Passo 4 — Id real do Astro (`npx astro build` + `.astro/data-store.json`)

Saída do build, rodado nesta sessão (ciclo 3), capturada em arquivo:

```
13:22:23 [content] Syncing content
13:22:23 [content] Synced content
13:22:23 [types] Generated 400ms
13:22:23 [build] output: "static"
13:22:23 [build] mode: "static"
13:22:23 [build] directory: S:\Projetos\academic_page\haroldo\dist\
13:22:23 [build] Collecting build info...
13:22:23 [build] ✓ Completed in 436ms.
13:22:23 [build] Building static entrypoints...
13:22:23 [vite] ✓ built in 231ms
13:22:23 [vite] ✓ built in 43ms
13:22:23 [build] Rearranging server assets...

 generating static routes 
13:22:23   ├─ /index.html (+8ms) 
13:22:23 ✓ Completed in 17ms.

13:22:23 [build] ✓ Completed in 365ms.
13:22:23 [build] 1 page(s) built in 857ms
13:22:23 [build] Complete!
```

`grep -o '"id":"[^"]*relatividade-geral[^"]*"' .astro/data-store.json` (capturado em arquivo, com o código de saída):

```
exit=1
```

Não casou nada — o `data-store.json` do Astro 7 é serializado no formato `devalue` (array indexado), não como JSON `{"id": "..."}` plano. Localizei com `grep -o '.\{60\}relatividade-geral.\{60\}' .astro/data-store.json` (também capturado em arquivo):

```
0,"nome":6,"semestre":7,"status":8,"descricao":9},[],"20262-relatividade-geral",{"id":21,"data":23,"filePath":96,"digest":97,"rendered":98
026-2/script-horizonte-kerr.py","content/disciplinas/2026.2-relatividade-geral.md","aa908d1bf87562b5",{"html":14,"metadata":99},{"headings
:56,"url":95},[],"linhas-pesquisa",["Map",126,127,144,145],"relatividade-geral-e-teorias-alternativas-de-gravitacao",{"id":126,"data":128,
d alternative theories of gravity","content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md","fc7db77647a431c1"
```

**Id real observado: `20262-relatividade-geral`** — a string aparece associada ao objeto de entrada cujo `filePath` (mesma linha, mais à frente) é `"content/disciplinas/2026.2-relatividade-geral.md"`. Confirma a previsão do plano (o loader `glob()` aplica `githubSlug`, que remove o ponto) — **nenhuma divergência**.

### Passo 5 — Portão de qualidade

`npm run lint`:

```

> haroldo-page@0.1.0 lint
> eslint .

exit=0
```

`npm run test:coverage`:

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  13:22:04
   Duration  1.12s (transform 2.77s, setup 0ms, import 4.62s, tests 203ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    98.88 |     100 |     100 |                   
 src/lib           |     100 |    98.83 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 179/179 )
Branches     : 98.88% ( 89/90 )
Functions    : 100% ( 53/53 )
Lines        : 100% ( 162/162 )
================================================================================
exit=0
```

`npm run format:check` — rodado por último, depois de preencher esta seção de Evidência, sobre o repositório inteiro (plano incluído), capturado em arquivo:

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### Verificação de literalidade dos blocos

Script `scratchpad/verify_evidence.py` (fora do repositório, pasta de scratch da sessão) lê o manifesto gravado por `scratchpad/build_evidence2.py` — pares `(âncora de texto, arquivo de origem)` — localiza cada âncora neste `.md`, extrai o bloco cercado por ``` ` ``` que vem logo depois e compara com `open(arquivo_de_origem).read()`, byte a byte (depois de normalizar só quebras de linha finais). Saída, rodada depois da inserção do bloco de `format:check` acima, lida do arquivo `scratchpad/ciclo4/verify_output.txt` (também gerado por redirecionamento de comando, nunca digitado):

```
OK         | ancora='### Passo 1 — `npx astro check`' arquivo=astro_check
OK         | ancora='### Passo 2 — `npx vitest run tests/lib/courses.test.ts` (25 testes)' arquivo=vitest_final
OK         | ancora='**Canário (a)**' arquivo=a_red
OK         | ancora='**Canário (b)**' arquivo=b_red
OK         | ancora='**Canário (c)**' arquivo=c_red
OK         | ancora='**Canário (d)**' arquivo=d_red
OK         | ancora='**Canário (e)**' arquivo=e_red
OK         | ancora='**Canário (f)**' arquivo=f_red
OK         | ancora='**Prova da reversão dos seis canários**' arquivo=f_revertido_verde
OK         | ancora='`git status --short` confirma' arquivo=git_status
OK         | ancora='### Passo 4 — Id real do Astro' arquivo=astro_build
OK         | ancora='`grep -o \'"id":"[^"]*relatividade-geral' arquivo=id_grep
OK         | ancora='Localizei com' arquivo=id_context
OK         | ancora='`npm run lint`:' arquivo=lint
OK         | ancora='`npm run test:coverage`:' arquivo=coverage

RESULTADO GERAL: TODOS OS BLOCOS IDENTICOS AO ARQUIVO (OK)
```

Os 15 blocos de saída de comando da Evidência (excluindo o próprio bloco de `format:check`, que não tinha como entrar no manifesto antes de existir) batem byte a byte com o arquivo que os gerou.


### O que NÃO rodou

- **Verificação no navegador** (largura 360/768/1440, Tab, `scrollWidth`/`clientWidth`): não se aplica a este plano — `src/lib/courses.ts` é lógica pura sem página nem componente; a verificação visual é dos planos 047/048/049, que consomem estas funções.
- `npm ci`, `npm audit --audit-level=high`, `npm run build:pipeline` completo e o CI do GitHub Actions: não rodados nesta sessão — ficam para a verificação independente do orquestrador (README da fase, "Verificação autoritativa").
- `git add` / commit: não feito — `Status:` continua `TODO`, promoção é do orquestrador.
