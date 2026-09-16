# Plano 037 — Dicionário de interface em PT e mapa de navegação

**Status:** TODO
**RFs cobertos:** §10.4 (strings de interface fora dos componentes), §7.6; pré-requisito de M-07
(fase 4) e do item "Layout base, cabeçalho, rodapé e navegação" do §12 da fase 3
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Todo texto de interface das sete rotas da fase 3 existe num único módulo tipado,
`src/i18n/pt.ts`, e a lista de rotas da navegação com a regra de "página ativa" existe em
`src/lib/navigation.ts`, ambos testados. Nenhuma página da fase precisa escrever texto de
interface no próprio componente.

## Arquivos afetados

- `src/i18n/pt.ts` — novo: objeto `pt` e tipo `UiStrings`
- `src/lib/navigation.ts` — novo: `NAV_ITEMS` e `isActivePath`
- `tests/i18n/pt.test.ts` — novo
- `tests/lib/navigation.test.ts` — novo
- `src/i18n/.gitkeep`, `src/lib/.gitkeep` — **removidos** com `git rm` (as pastas passam a ter arquivo)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Por que agora e não na fase 4** (decisão do fatiamento, README da fase, decisão 1): o §10.4 do
PRD proíbe string de interface hardcoded em componente. A fase 3 **só** cria o PT. **Não** crie
`en.ts`, função de seleção por locale, nem fallback RN-06 — seria abstração sem uso nesta fase
(`CLAUDE.md` §2). A fase 4 acrescentará `en: UiStrings`.

**Forma.** `export const pt = { ... } as const satisfies ...` não é necessário; use:

```ts
export const pt = { /* ... */ };
export type UiStrings = typeof pt;
```

Chaves em **inglês** (§10.4: código em inglês), valores em **português**. Plurais são funções
`(n: number) => string` — `1 aula` / `2 aulas` / `0 aulas`. Textos com valor interpolado também
são funções (ex.: `dueDate: (d: string) => \`Entrega ${d}\``).

**Conteúdo do dicionário — lista fechada.** Derivada de `docs/identidade-visual.md` §5 e §6. Os
valores entre aspas são literais; não reescreva.

- `site`: `skipToContent` "Pular para o conteúdo"; `menu` "Menu"; `mainNavLabel` "Navegação
  principal"; `opensInNewTab` "(abre em nova aba)"; `pageTitle: (page: string, site: string) =>
  \`${page} — ${site}\``
- `nav`: `home` "Início", `about` "Sobre", `research` "Pesquisa", `teaching` "Ensino",
  `publications` "Publicações"
- `footer`: `contact` "Contato", `academicProfiles` "Perfis acadêmicos", `site` "Site"
- `home`: `countResearchLines(n)` "linha de pesquisa"/"linhas de pesquisa"; `countCurrentCourses(n)`
  "disciplina neste semestre"/"disciplinas neste semestre"; `countPublications(n)`
  "publicação"/"publicações"; `noneYet` "nenhuma publicada ainda"; `seeResearch` "Ver pesquisa"
  (as funções devolvem **só o rótulo**, sem o número — o numeral é renderizado à parte)
- `about`: `eyebrow` "Sobre"; `title` "Biografia e formação"; `education` "Formação acadêmica";
  `areas` "Áreas de atuação"; `contact` "Contato"; `academicProfiles` "Perfis acadêmicos";
  `links`: `lattes` "Currículo Lattes", `orcid` "ORCID", `scholar` "Google Scholar", `arxiv`
  "arXiv", `researchgate` "ResearchGate", `github` "GitHub", `institucional` "Página
  institucional", `cv` "Currículo em PDF"
- `research`: `eyebrow` "Pesquisa"; `title` "Linhas e projetos"; `summary(lines, projects)` →
  "2 linhas · 2 projetos" (com plural de cada parte: "1 linha", "1 projeto"); `activeProjects(n)`
  "1 projeto em andamento"/"N projetos em andamento"; `projects` "Projetos"; `collaborators`
  "Colaboradores"; `relatedLine` "Linha relacionada"; `status`: `'em andamento'` "Em andamento",
  `'concluído'` "Concluído"
- `teaching`: `eyebrow` "Ensino"; `title` "Disciplinas"; `current` "Atuais"; `previous`
  "Anteriores"; `noCurrent` "Nenhuma disciplina neste semestre."; `noPrevious` "Nenhuma disciplina
  anterior."; `lessons(n)` "1 aula"/"N aulas"; `problemSets(n)` "1 lista"/"N listas"; `scripts(n)`
  "1 script"/"N scripts"; `open` "Abrir"
- `course`: `breadcrumb` "Ensino"; `breadcrumbLabel` "Trilha de navegação"; `status`: `atual` "Atual", `anterior` "Anterior"; `onThisPage`
  "Nesta página"; `syllabus` "Ementa"; `lessons` "Aulas"; `courseScripts` "Scripts da
  disciplina"; `problemSets` "Listas de exercícios"; `materials` "Materiais complementares";
  `bibliography` "Bibliografia"; `links` "Links"; `noLessons` "Nenhuma aula publicada ainda.";
  `lessonNumber(n)` "Aula N" (texto para leitor de tela junto do numeral); `open` "Abrir";
  `access` "Acessar"; `dueDate(d)` "Entrega {d}"; `materialType`: `slides` "Slides", `notas`
  "Notas", `complementar` "Complementar"
- `script`: `eyebrow(lang)` "Script · {lang}"; `language`: `python` "Python", `r` "R", `matlab`
  "MATLAB", `bash` "Bash", `outro` "Código"; `copy` "Copiar código"; `copied` "Copiado";
  `openFile` "Abrir arquivo"
- `publications`: `eyebrow(n)` "1 item"/"N itens"; `title` "Publicações"; `featured` "Destaque";
  `type`: `artigo` "Artigo", `preprint` "Preprint", `capítulo` "Capítulo", `livro` "Livro",
  `anais` "Anais", `tese` "Tese", `outro` "Outro"; `doi` "DOI"; `arxiv` "arXiv"; `pdf` "PDF";
  `abstractAndKeywords` "Resumo e palavras-chave"; `keywords` "Palavras-chave"
- `notFound`: `eyebrow` "Erro 404"; `title` "Página não encontrada"; `body` "O endereço pode ter
  mudado de semestre. Materiais de disciplinas anteriores continuam na página de Ensino.";
  `backHome` "Voltar ao início"; `allPages` "Todas as páginas"

As chaves de `research.status`, `course.status`, `course.materialType`, `script.language` e
`publications.type` são **exatamente** os valores dos enums de `src/content.config.ts` (inclusive
`'em andamento'`, `'concluído'`, `'capítulo'` com acento e espaço). Tipar essas quatro com
`Record<z.infer<...>['campo'], string>` a partir dos schemas exportados (`projetosSchema`,
`disciplinasSchema`, `publicacoesSchema`) faz o `astro check` reprovar se o enum mudar — faça assim.
Importar `src/content.config.ts` em teste funciona (ver `tests/content/schemas.test.ts`).

**Navegação.** `src/lib/navigation.ts`:

```ts
export const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/sobre/', key: 'about' },
  { href: '/pesquisa/', key: 'research' },
  { href: '/ensino/', key: 'teaching' },
  { href: '/publicacoes/', key: 'publications' },
] as const;
```

`key` é chave de `pt.nav` (tipado como `keyof UiStrings['nav']`). **Barra final nos `href`**: o
Worker não declara `html_handling` e o default `auto-trailing-slash` responde 307 a `/sobre`
(achado do plano 026).

`isActivePath(href: string, pathname: string): boolean` — normaliza os dois lados para terminar em
`/`; `'/'` só é ativo com `pathname` exatamente `/`; os demais são ativos quando `pathname` começa
com o `href` (assim `/ensino/2026-2-relatividade-geral/` ativa "Ensino", §5.1 da identidade).
`/ensinox/` **não** ativa `/ensino/`.

**Testes.** Fixtures sintéticas. Obrigatórios:
- `pt.test.ts`: cada função de plural com 0, 1 e 2; `research.summary(1, 2)` === "1 linha · 2
  projetos"; nenhuma string folha vazia (percorra o objeto recursivamente, ignorando funções); as
  chaves de `publications.type` iguais, na ordem, a `publicacoesSchema.shape.tipo.options` (o
  mesmo para os outros três enums).
- `navigation.test.ts`: `/` ativo só em `/`; `/sobre/` ativo em `/sobre` e `/sobre/`; `/ensino/`
  ativo em `/ensino/2026-2-relatividade-geral/`; `/ensino/` inativo em `/ensinox/`; todo `href`
  termina em `/`; todo `key` existe em `pt.nav`.

**Cabeçalho §10.1** em `pt.ts` e `navigation.ts` (modelo em `src/lib/slug.ts`). TSDoc em
`isActivePath` e no objeto `pt`.

## Passos

1. `git rm src/i18n/.gitkeep src/lib/.gitkeep` → verify: `git status --short src` colado.
2. Escrever `src/i18n/pt.ts` com a lista fechada acima → verify: `npx astro check` com a linha de resumo (`0 errors, 0 warnings, 0 hints`) colada.
3. Escrever `src/lib/navigation.ts` → verify: idem.
4. Escrever os dois testes → verify: `npx vitest run tests/i18n tests/lib/navigation.test.ts` colado.
5. Canários: (a) troque "Aulas" por "" em `course.lessons` e mostre o teste de string vazia vermelho; (b) inverta a condição de `'/'` em `isActivePath` e mostre o teste vermelho; reverta os dois → verify: saídas vermelhas coladas e `git diff --stat` final sem essas mudanças.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` (com o agregado `Coverage summary`) colados.

## Critérios de aceitação

- [ ] `src/i18n/pt.ts` contém exatamente as chaves listadas, com os valores literais
- [ ] Os quatro mapas de enum são tipados a partir dos schemas Zod

> **Nota 2026-09-16 (revisão do 037):** o plano se contradiz — o "Contexto necessário" nomeia **cinco**
> chaves que são "exatamente os valores dos enums" (`research.status`, `course.status`,
> `course.materialType`, `script.language`, `publications.type`), mas diz "essas quatro", "os outros
> três" e "os quatro mapas". Provável resíduo de `course.status` acrescentado depois da contagem. O
> executor tipou e testou os cinco; o revisor julgou o critério satisfeito, porque tipar só quatro
> violaria a lista nomeada. O texto do critério não foi alterado.

- [ ] `NAV_ITEMS` com cinco itens, `href` com barra final; `isActivePath` cobre os seis casos listados
- [ ] `tests/i18n/pt.test.ts` e `tests/lib/navigation.test.ts` passam; canários (a) e (b) mostrados vermelhos e revertidos
- [ ] Nenhum `en`, seletor ou função de locale criado
- [ ] Cobertura agregada ≥ 80% e `lint`/`format:check` verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc nos dois módulos

## Evidência

Executado em 2026-09-16. Ordem real: edições dos quatro arquivos novos → `git rm` dos dois
`.gitkeep` → `astro check` → `vitest run` dos dois testes novos → canário (a) → reversão → canário
(b) → reversão → confirmação da reversão (`grep`, já que os arquivos são novos e não aparecem em
`git diff`) → portão (`lint`, `format:check`, `test:coverage`).

### Passo 1 — `git rm` dos `.gitkeep`

```
$ git rm src/i18n/.gitkeep src/lib/.gitkeep && git status --short src
rm 'src/i18n/.gitkeep'
rm 'src/lib/.gitkeep'
D  src/i18n/.gitkeep
D  src/lib/.gitkeep
?? src/i18n/
?? src/lib/navigation.ts
```

### Passos 2 e 3 — `astro check` (após `src/i18n/pt.ts` e `src/lib/navigation.ts`, estado final)

```
$ npx astro check
[content] Syncing content
[content] Synced content
[types] Generated 421ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (23 files):
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 4 — testes novos

```
$ npx vitest run tests/i18n tests/lib/navigation.test.ts

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  26 passed (26)
   Start at  18:40:17
   Duration  823ms (transform 482ms, setup 0ms, import 737ms, tests 11ms, environment 0ms)
```

### Passo 5 — canários

**(a) `course.lessons: 'Aulas'` → `course.lessons: ''`** (`src/i18n/pt.ts`), vermelho:

```
$ npx vitest run tests/i18n

 ❯ tests/i18n/pt.test.ts (20 tests | 1 failed) 8ms
     × percorre o dicionário inteiro sem achar string vazia 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/i18n/pt.test.ts > pt — nenhuma string folha vazia > percorre o dicionário inteiro sem achar string vazia
AssertionError: expected '' not to be '' // Object.is equality
 ❯ tests/i18n/pt.test.ts:111:24
    109|     expect(leaves.length).toBeGreaterThan(0);
    110|     for (const leaf of leaves) {
    111|       expect(leaf).not.toBe('');
       |                        ^
    112|     }
    113|   });

 Test Files  1 failed (1)
      Tests  1 failed | 19 passed (20)
```

Revertido. Confirmação (arquivo é novo, sem histórico em `git diff`; confirmado por `grep`):

```
$ grep -n "lessons: 'Aulas'," src/i18n/pt.ts
140:    lessons: 'Aulas',
```

**(b) inversão de `normalizedPathname === '/'` para `normalizedPathname !== '/'`** em `isActivePath`
(`src/lib/navigation.ts`), vermelho:

```
$ npx vitest run tests/lib/navigation.test.ts

 ❯ tests/lib/navigation.test.ts (6 tests | 1 failed) 8ms
     × "/" ativo só em "/" 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/navigation.test.ts > isActivePath > "/" ativo só em "/"
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/lib/navigation.test.ts:7:36
      5| describe('isActivePath', () => {
      6|   it('"/" ativo só em "/"', () => {
      7|     expect(isActivePath('/', '/')).toBe(true);
       |                                    ^
      8|     expect(isActivePath('/', '/sobre/')).toBe(false);
      9|   });

 Test Files  1 failed (1)
      Tests  1 failed | 5 passed (6)
```

Revertido. Confirmação:

```
$ grep -n "normalizedPathname === '/';" src/lib/navigation.ts
55:    return normalizedPathname === '/';
```

Suíte completa, depois das duas reversões, verde de novo:

```
$ npx vitest run tests/i18n tests/lib/navigation.test.ts

 Test Files  2 passed (2)
      Tests  26 passed (26)
```

### Passo 6 — portão

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .
```

(sem saída adicional — `exit 0`)

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

(a primeira execução, antes de `prettier --write src/i18n/pt.ts`, reprovou por formatação — corrigida
e reconferida; ver "Divergências" abaixo)

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  8 passed (8)
      Tests  148 passed (148)
   Start at  18:41:28
   Duration  1.09s (transform 2.04s, setup 0ms, import 3.64s, tests 100ms, environment 1ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    91.66 |     100 |     100 |
 src/lib           |     100 |     87.5 |     100 |     100 |
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 53/53 )
Branches     : 91.66% ( 11/12 )
Functions    : 100% ( 17/17 )
Lines        : 100% ( 52/52 )
================================================================================
```

A branch não coberta (linha 51 de `navigation.ts`) é o ramo `href` já terminado em `/` no
ternário de `isActivePath` — todo `href` de `NAV_ITEMS` e todo `href` passado nos testes já tem a
barra final; o ramo alternativo (`href` sem barra) nunca é exercitado. Cobertura agregada ≥ 80% em
todas as quatro métricas, acima do threshold imposto por `vitest.config.ts`.

### O que NÃO rodou

- Verificação no navegador (não se aplica a este plano — nenhum componente `.astro` novo).
- `npm ci`, `npm audit`, `npm run build:pipeline`, `npm run test:dist`, CI do GitHub Actions,
  Workers Builds — verificação autoritativa, é do orquestrador/triage-runner, não desta sessão.
- `git commit` — não commitado, por instrução; `Status:` permanece `TODO`.

### Divergências e pontos ambíguos encontrados

1. **Contagem "quatro" vs. cinco mapas de enum.** O "Contexto necessário" diz "As chaves de
   `research.status`, `course.status`, `course.materialType`, `script.language` e
   `publications.type` são exatamente os valores dos enums" (cinco itens), mas a frase seguinte diz
   "Tipar **essas quatro**..."; o critério de aceitação repete "**Os quatro** mapas de enum são
   tipados"; e a seção de testes fala em `publications.type` "e o mesmo para **os outros três**
   enums" (quatro no total). As três formulações concordam entre si em "quatro", mas a primeira
   frase lista cinco chaves distintas. Não há como excluir uma das cinco sem contradizer a frase
   normativa "**são exatamente** os valores dos enums" (que é, junto da lista de valores literais,
   parte da lista fechada que a Regra 3 do despacho proíbe reescrever). Resolvido tipando e testando
   **as cinco**: `research.status` (via `projetosSchema`), `course.status` e `course.materialType` e
   `script.language` (as três via `disciplinasSchema`, a última duas por indireção nos itens de
   `materiais[]`/`scripts[]`) e `publications.type` (via `publicacoesSchema`) — o que ainda bate com
   "a partir dos schemas exportados (`projetosSchema`, `disciplinasSchema`, `publicacoesSchema`)",
   citados como exatamente três. Interpreto "quatro" como resíduo de uma versão anterior do plano
   que não foi atualizado quando a quinta chave (`script.language` ou `course.materialType`) foi
   acrescentada à lista — nenhuma leitura razoável justifica tipar/testar só quatro das cinco chaves
   listadas como "exatamente os valores dos enums". Reportado para o orquestrador decidir se o
   número na prosa do plano deve ser corrigido para "cinco" na promoção.
2. **Formatação de `src/i18n/pt.ts`:** a primeira passada de `format:check` reprovou (quebra de
   linha do Prettier em `summary`, `type: {...} satisfies Record<...>` etc. diferente da que eu
   havia escrito). Corrigido com `npx prettier --write src/i18n/pt.ts` — sem alteração de lógica,
   `astro check` e a suíte inteira reconferidos depois, ambos verdes.
