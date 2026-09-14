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
- [ ] `NAV_ITEMS` com cinco itens, `href` com barra final; `isActivePath` cobre os seis casos listados
- [ ] `tests/i18n/pt.test.ts` e `tests/lib/navigation.test.ts` passam; canários (a) e (b) mostrados vermelhos e revertidos
- [ ] Nenhum `en`, seletor ou função de locale criado
- [ ] Cobertura agregada ≥ 80% e `lint`/`format:check` verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc nos dois módulos

## Evidência

<Preenchido pelo executor ao concluir. Declare também o que NÃO rodou.>
