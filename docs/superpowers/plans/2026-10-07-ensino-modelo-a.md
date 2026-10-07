# Plano — Página Ensino no modelo A, com disciplinas perenes

**Data:** 2026-10-07 · **Branch:** `design` · **Origem:** sabatina
[`CHANGELOG_sabatina_ensino-modelo-a.md`](../../sabatinas/CHANGELOG_sabatina_ensino-modelo-a.md)
(10 decisões, PRD v0.1.77, RF-23, RF-24, RN-03) · **Protótipo:** `src/pages/prototipo-ensino/a.astro`
(sem commit; é apagado na tarefa 7).

Trabalho fora do fluxo de planos numerados, como o da Pesquisa modelo C: não fecha item do §12 (as
rotas `/ensino` e `/ensino/<slug>` já existem), troca o desenho da listagem, o significado do
semestre e o nome dos arquivos de disciplina.

## Resultado esperado

- `/ensino/` e `/en/teaching/`: "Em curso" em cartões (imagem ou bloco `tinta` com o código, código,
  nome, descrição, "Última aula" com link e data, uma marca por aula); depois "Encerradas" numa lista
  em que a linha inverte para `tinta` no hover e a descrição entra no lugar do código. Cada
  disciplina num grupo só, ordem alfabética pelo nome PT. Grupo vazio some; sem nenhuma disciplina
  publicada, uma frase só. Nenhum semestre na página (Decisões 1, 3–7, 9, 10).
- Página da disciplina: meta "código · Em curso/Encerrada", sem semestre; datas de aula e de entrega
  só com `status: atual` (Decisão 8).
- `semestre` opcional no Zod e no painel, com a descrição "não aparece no site"; `imagem` opcional
  nova; nome do arquivo `{slug(nome)}.md`; opções de `status` com rótulos "Em curso"/"Encerrada"
  no painel, valores gravados intactos (Decisões 1, 2, 5, 7).
- URLs novas dos exemplos: `/ensino/relatividade-geral/` e `/ensino/mecanica-classica/`.

## Escolhas padrão do orquestrador (sujeitas a veto, não perguntadas)

- Ordem na rota EN pelo nome PT. Bloco sem imagem mostra o código, ou a inicial do nome.
- EN (vocabulário do Tong, a revisar pelo stakeholder): grupos "Ongoing" / "Past courses"; status
  "Ongoing" / "Past"; vazio "No courses published yet.".
- O cartão não é um link único: o nome é o link (com área de clique estendida ao cartão) e "Última
  aula" continua link externo para a aula, por cima dela — link dentro de link é HTML inválido.

## Tarefas

### 1. Schema e painel

- `src/content.config.ts`: `semestre: z.string().optional()`; `imagem: z.string().optional()`.
- `tina/config.ts`, coleção `disciplinas`: `semestre` sem `required`, descrição "Anotação sua; não
  aparece no site."; `status` com `options: [{ value: 'atual', label: 'Em curso' }, { value:
  'anterior', label: 'Encerrada' }]` e descrição nova; campo `image` `imagem` depois de `descricao`;
  `filename.slugify` = `slugify(nome)`, descrição "Gerado a partir do nome".
- `tina/tina-lock.json`: regenerar com `npx tinacms dev`.
- Testes: `tests/content/schemas.test.ts` aceita disciplina sem `semestre` e com `imagem`.

**Verificação:** `npm test` verde, incluindo paridade Zod × Tina e `tina-lock-coerente`.

### 2. Conteúdo de exemplo

- `git mv content/disciplinas/2026.2-relatividade-geral.md content/disciplinas/relatividade-geral.md`
  e `2025.1-mecanica-classica.md` → `mecanica-classica.md`.
- Tirar "oferecida em 2025.1" da descrição de Mecânica Clássica; `imagem` de exemplo em Relatividade
  Geral (`/uploads/extensao-exemplo-1.jpg`).

### 3. Ordem alfabética (TDD)

- `tests/lib/courses.test.ts`: os casos de `splitCourses` passam a exigir ordem por `nome` `pt-BR`
  (acentos: "Óptica" entre "Mecânica" e "Relatividade"), sem olhar `semestre`. Escritos antes.
- `src/lib/courses.ts`: `splitCourses` ordena por `nome`; o tipo deixa de exigir `semestre`.

**Verificação:** os testes novos falham antes e passam depois.

### 4. Textos de interface

- `pt.ts`/`en.ts`: `teaching.current` "Em curso"/"Ongoing", `teaching.previous`
  "Encerradas"/"Past courses", `teaching.empty` "Nenhuma disciplina publicada ainda."/"No courses
  published yet."; saem `noCurrent` e `noPrevious`; `course.status` "Em curso"/"Encerrada" e
  "Ongoing"/"Past". Ajustar os testes de dicionário que exigirem.

### 5. `TeachingView` no modelo A

- Reescrever `src/views/TeachingView.astro` a partir do protótipo A, com os dados da coleção (RN-01,
  fallback RN-06 e aviso F-07 de hoje, título de aula com `LangText`/`portugueseOnly`).
- Abaixo de `sm`, a lista mostra o código numa linha pequena sob o nome (a coluna da direita não
  existe ali).

**Verificação:** `astro check` sem erro; `npm run test:dist` verde.

### 6. Página da disciplina

- `CourseView.astro`: meta sem semestre; `showDates = status === 'atual'` repassado a `LessonList` e
  `CourseResources`, que só mostram `data`/`data_entrega` quando verdadeiro.

### 7. Limpeza e documentação

- Apagar `src/pages/prototipo-ensino/` e a linha TEMPORÁRIO de `src/lib/routes.ts`.
- `docs/identidade-visual.md` §6.4 e §6.5 descrevem o modelo A e as datas condicionais.
- Comentários que citam `{semestre}-{nome}` como regra viva (`tina/config.ts`, `courses.ts`)
  atualizados; `docs/historico-de-implementacao.md` ganha a entrada; PRD §0 "Estado da
  implementação".

## Verificação final

- `npx astro check`, `npm run build`, `npm test`, `npm run test:dist`, `npm run lint`, `npx prettier
  --check` nos arquivos alterados: saída colada.
- No Vivaldi, `/ensino/`, `/en/teaching/` e as duas disciplinas a 1440 e 360 px: cartões, hover da
  lista, link da última aula, datas presentes na em curso e ausentes na encerrada, grupo vazio
  (trocando o status de um exemplo localmente, sem gravar).
- No `/admin`: rótulos "Em curso"/"Encerrada", campo Imagem, semestre opcional, nome de arquivo
  gerado só do nome.
- Commit só quando o stakeholder pedir.

## Execução (2026-10-07)

Executado inline pelo orquestrador, sem commit. Todas as tarefas feitas; desvios:

- **Testes de paridade estendidos.** `paridade-schema` e `tina-lock-coerente` não liam opção do
  Tina no formato `{ value, label }`. O primeiro passou a comparar só o `value` com o Zod; o segundo
  compara `valor=rótulo`, para trocar só o rótulo sem regenerar o lock também reprovar.
- **Cartão abaixo de `sm` empilhado** (imagem 16:9 em cima): a 360 px, "Relatividade" passava da
  borda do cartão em duas colunas. Medido no Vivaldi: título termina em 277 px, cartão em 310.
- **`npm run build` reprova na checagem de nuvem do Tina** ("Field 'imagem' was added"): o schema
  remoto só muda quando a mudança chega à `main`. O CI usa `build:pipeline`
  (`--skip-cloud-checks`), que passa. Esperado, como em todo campo novo.
- **Não feito:** entrada em `docs/historico-de-implementacao.md` — o redesenho da Pesquisa modelo
  C também não a tem; fica a critério do stakeholder. A linha "Estado da implementação" do §0 do PRD
  foi atualizada.

**Evidência (saída da última rodada):** `eslint .` sem saída de erro; `prettier --check .` "All
matched files use Prettier code style!"; `vitest run --coverage` 24 arquivos, 416 testes, 100% em
statements/branches/functions/lines; `build:pipeline` `astro check` 0 errors 0 warnings e build
Complete; `test:dist` 2 arquivos, 54 testes.

**No Vivaldi:** `/ensino/` e `/en/teaching/` a 1440 px (cartão, hover que inverte a linha com a
descrição, clique no cartão leva a `/ensino/relatividade-geral/` e "Última aula" abre o link externo
em nova aba); 360 px por iframe; disciplina em curso com datas ("10/08/2026", "Entrega 07/09/2026")
e, trocando o status localmente para `anterior`, sem nenhuma data e sem o grupo "Em curso"; sem
imagem, bloco com "FIS0000"; sem disciplina publicada, só "Nenhuma disciplina publicada ainda.".
Todas as trocas locais desfeitas. **No `/admin`:** opções "Em curso" (`atual`) e "Encerrada"
(`anterior`), campo Imagem, Semestre sem "Required"; salvar "Óptica Teste" gerou
`content/disciplinas/optica-teste.md` sem semestre, aceito pelo Zod (145 testes de conteúdo), e o
arquivo foi apagado.

## Emenda — remoção de `codigo` (2026-10-07, Decisão 11)

A pedido do stakeholder, `codigo` saiu do Zod, do painel (`tina-lock.json` regenerado) e do
exemplo `relatividade-geral.md`. Cartão sem a linha do código; bloco sem imagem com a inicial do
nome em `display-1`; "Encerradas" sem nada à direita em repouso, com a descrição entrando no hover;
cabeçalho da disciplina só com "Em curso"/"Encerrada". `scripts[].codigo` (código-fonte) intacto.

**Evidência:** `eslint .` sem erro; `prettier --check .` limpo; `vitest run --coverage` 24
arquivos, 416 testes, 100%; `build:pipeline` 0 errors, 0 warnings, Complete; `test:dist` 54
testes. No Vivaldi a 1440 px: cartão sem código, hover da lista com a descrição à direita,
cabeçalho "Em curso"; sem imagem (troca local desfeita), o bloco mostra "R".

## Emenda — aba Scripts (2026-10-07, Decisão 12)

Todos os scripts na aba "Scripts", os de aula primeiro, com "Aula N"; a aula mostra o atalho
"Script · título →" para `#script-N`. `presentSections(data)` lê `scripts` (TDD: 4 testes novos
falharam antes); `scriptsForTab` e `scriptAnchor` novos em `src/lib/courses.ts`; `course-tabs.ts`
escolhe a aba pelo `#id` de um elemento dentro do painel e rola até ele; `ScriptPanel` sem
`headingLevel`, com `id` e `lesson`; `course.courseScripts` = "Scripts" e `course.lessonScript`
novos na lista M-07 (iguais em PT e EN). De quebra, o `course` sem uso na lista "Encerradas" (hint
do `astro check`, sobra da Decisão 11) saiu.

**Evidência:** `eslint .` sem erro; `prettier --check .` limpo; `vitest run --coverage` 24
arquivos, 419 testes, 100%; `build:pipeline` 0 errors, 0 warnings, 0 hints, Complete; `test:dist`
54 testes. No Vivaldi: clique no atalho da aula 4 → aba Scripts selecionada, `#script-1`, painel
visível a 69 px do topo da área que rola; URL aberta direto com `#script-1` → aba Scripts; rota EN
com as abas "Lectures" e "Scripts".
