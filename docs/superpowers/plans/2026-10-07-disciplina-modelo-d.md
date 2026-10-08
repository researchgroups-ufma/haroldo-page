# Plano — Página de disciplina no modelo D

**Data:** 2026-10-07 · **Branch:** `main` · **Origem:** sabatina
[`CHANGELOG_sabatina_disciplina-modelo-d.md`](../../sabatinas/CHANGELOG_sabatina_disciplina-modelo-d.md)
(3 decisões, PRD v0.1.78, RF-24) · **Protótipo:** `src/pages/ensino/prototipo-d.astro` (sem commit;
é apagado na tarefa 6, com os protótipos A, B e C e a pasta `_prototipo/`).

Trabalho fora do fluxo de planos numerados, como os da Pesquisa modelo C e do Ensino modelo A: não
fecha item do §12 (a rota `/ensino/<slug>` já existe), troca o desenho da página de disciplina. Sem
mudança de schema, de painel nem de textos de interface.

## Resultado esperado

- `/ensino/<slug>/` e `/en/teaching/<slug>/`: `PageHeader` só com a seta de volta, o nome e o status.
  Abaixo, a capa: imagem (ou o bloco `tinta` com a inicial), descrição, ementa e os botões "Última
  aula" (só em curso, Decisão 2) e "Listas de exercícios" (só com lista).
- Faixa de abas presa ao topo, com sublinhado que desliza e esmaecimento à direita quando há abas
  fora da tela. A troca de aba no meio da leitura põe o painel logo abaixo da faixa. Alvo de `#id`
  (atalho do script) para abaixo da faixa, não sob ela (Decisão 1).
- Aulas em cartões: número no quadrado, título ↗, descrição, data (só em curso), atalho do script. Em
  curso, a última aula cadastrada fica destacada, com o selo "Última aula" (Decisão 2).
- Listas, materiais e links em cartões, numa grade de dois a partir de `sm`, com o título inteiro
  (Decisão 3). A bibliografia continua numa lista numerada.
- Sem JS: seções empilhadas com os títulos, sem faixa (RNF-02). Aviso F-07 uma vez só.

## Tarefas

### 1. Capa — `src/components/CourseCover.astro` (novo)

- Props: `nome` e `imagem` (para o bloco sem imagem), `descricao` e `ementa` (`Localized` de
  `localizeOptional`, para o `lang` de cada parágrafo), `latest` (aula ou `undefined`) e
  `hasProblemSets`.
- Marcação e estilo da capa do protótipo (classes `botao`, `botao-cheio` e `botao-traco` escopadas
  com `:global` só onde passam para `ExternalLink`). Título da aula no botão com `LangText` e
  `portugueseOnly` (Decisão 13 da fase 4).
- `CourseView.astro`: o `PageHeader` perde o slot `aside`; a capa entra logo depois do
  `FallbackNotice`. `latest = showDates ? aulas.at(-1) : undefined`.

### 2. Abas — `CourseTabs.astro` e `src/scripts/course-tabs.ts`

- `CourseTabs` envolve o `tablist` numa `div.faixa` e leva o `span.indicador`. Estilo do protótipo:
  faixa `sticky` com fundo `bloco` quando `[data-abas]`, régua por `box-shadow` interno, sublinhado de
  2 px, esmaecimento `.corta`.
- `course-tabs.ts` (o `data-abas` continua no pai do `tablist`, agora a faixa) ganha: posição do
  sublinhado e rolagem horizontal até a aba escolhida; esmaecimento ligado ao `scroll` da faixa;
  reposição do painel sob a faixa só em clique e teclado (não no `#id`, que rola até o próprio alvo).
- Os seletores `[data-abas] .curso-painel` e `[data-abas] .painel-titulo` viram `[data-abas] ~
  .paineis …`, e os painéis ficam num `div.paineis` na view, com `min-height: 100svh` e
  `scroll-margin-top` no painel e em todo `[id]` dentro dele.

### 3. Cartões — `src/styles/global.css`

- `.cartao` (fundo `papel`, borda que aparece no hover/foco) e `.cartao-link::after` (clique
  estendido ao cartão) vão para o CSS global, ao lado do `.link-traco`, porque `LessonList` e
  `CourseResources` os usam. Entrada em cascata ao trocar de aba. A regra global de movimento reduzido
  já zera as transições.

### 4. Aulas — `LessonList.astro`

- Cartão por aula, com o quadrado do número (`aria-hidden`, e "Aula N" para leitor de tela, como
  hoje). Prop nova `highlightLatest: boolean`: quando verdadeira, a última aula ganha a classe
  `ultima` e o selo `teaching.latestLesson`. A view passa `showDates`.

### 5. Recursos — `CourseResources.astro`

- Listas, materiais e links em `ul.grid sm:grid-cols-2` de `.cartao`, com o título como
  `.cartao-link`. Entrega e tipo de material como hoje. A bibliografia fica igual.

### 6. Limpeza e documentação

- Apagar `src/pages/ensino/prototipo-{a,b,c,d}.astro` e `src/pages/ensino/_prototipo/`.
- `docs/identidade-visual.md` §6.5 descreve o modelo D. Cabeçalhos dos arquivos tocados atualizados
  (versão, data, descrição). PRD §0 "Estado da implementação" ao fim.

## Verificação final

- `npx astro check`, `npm run build:pipeline`, `npx vitest run --coverage`, `npm run test:dist`,
  `npm run lint`, `npx prettier --check .`: saída colada.
- No Vivaldi, `/ensino/relatividade-geral/` e `/en/teaching/relatividade-geral/` a 1440 px e a 360 px
  (iframe): capa, botões, faixa fixa, troca de aba no meio das aulas, atalho do script, botão das
  listas, esmaecimento no celular, sem rolagem horizontal. Disciplina encerrada (troca local do
  `status`, desfeita depois): sem botão "Última aula", sem destaque, sem datas. Sem imagem (troca
  local): bloco com a inicial.
- Commit só quando o stakeholder pedir.

## Execução (2026-10-07)

Executado inline pelo orquestrador, na `main`, sem commit. Todas as tarefas feitas; desvios:

- **Lógica das abas dentro do `select()`** de `course-tabs.ts`, e não num `MutationObserver` como no
  protótipo: o observador também disparava quando o `#id` de um script abria a aba, e a página
  voltaria ao topo do painel em vez de rolar até o script. A reposição sob a faixa fica só nos
  handlers de clique e de teclado.
- **Rótulo "Última aula" sem quebra.** A 360 px, o rótulo do botão quebrava em duas linhas ao lado
  do título. Com `whitespace-nowrap`, só o título da aula quebra (rótulo com 21 px de altura).
- O cabeçalho de `LessonList` deixou de citar `src/pages/ensino/[slug].astro` como dono do estado
  vazio; quem cuida dele é o `CourseView` desde o plano 064.
- Contagem de linhas (limite de 150 aceito, PRD v0.1.71): `CourseCover` 159, `CourseTabs` 163,
  `LessonList` 161, `CourseView` 158, `CourseResources` 138, `course-tabs.ts` 137.

**Evidência (saída da última rodada):** `eslint .` sem saída de erro; `prettier --check .` "All
matched files use Prettier code style!"; `vitest run --coverage` 24 arquivos, 419 testes, 100% em
statements (337/337), branches (175/175), functions (97/97) e lines (299/299); `build:pipeline` 6
arquivos e 145 testes de conteúdo, `astro check` 0 errors, 0 warnings, 0 hints, build Complete;
`test:dist` 2 arquivos, 54 testes; nenhuma rota de protótipo em `dist/ensino/`.

**No Vivaldi**, `/ensino/relatividade-geral/` a 1495 px:
- Capa com imagem e os dois botões. A faixa fica presa ao topo da área que rola (0 px).
- Sublinhado de 35 px na aba "Aulas", que tem 47 px com o padding.
- Só a última aula destacada, com o selo.
- Clique em Links com a página rolada a 1400 px: o painel começa a 332 px e a faixa termina a 300.
- Atalho "Script" da aula: aba Scripts selecionada, `#script-1` a 332 px.
- Botão "Listas de exercícios": abre a aba.
- Clique numa aba com a página no topo: a rolagem continua em 0.

Disciplina encerrada e sem imagem (troca local no exemplo, desfeita; `git diff content/` vazio):
"Encerrada", sem botão "Última aula", sem destaque, sem selo, sem datas, e bloco com "R".

`/en/teaching/relatividade-geral/`: abas "Lectures", "Problem sheets" etc., botão e selo "Latest
lecture".

360 px por iframe:
- Sem rolagem horizontal (350 em 360). Faixa `sticky`, esmaecida.
- Clique em Links: a aba entra na faixa (253 a 309, faixa até 310).

Sem JS (`dist/` servido e iframe com `sandbox="allow-same-origin"`): `tablist` oculto, sem
`data-abas`, as 6 seções visíveis com os títulos, faixa `static`, cartões com opacidade 1.

**Não verificado:** setas do teclado entre as abas. A extensão não move o foco de forma confiável
nesta máquina; a lógica de teclado não mudou além da chamada a `keepUnderStrip`.
