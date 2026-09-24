# Polimento do site público — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o site consistente de ponta a ponta (fundação visual única), trazer Pesquisa e 404 para a linguagem nova, adicionar transições entre páginas e fechar os achados de acessibilidade, desempenho, metadados e limpeza.

**Architecture:** Astro 7 estático + Tailwind 4. Tokens e peças compartilhadas nascem em `src/styles/global.css` e `src/components/PageHeader.astro`; as páginas migram para eles; Pesquisa ganha um helper puro testado (`groupProjectsByLine`); as transições são View Transitions entre documentos, só CSS + um script inline de 3 linhas; o GSAP passa a ser importado sob demanda.

**Tech Stack:** Astro 7.2, Tailwind 4.3 (`@utility`, `@theme`), Vitest 4, GSAP 3.15 (ScrollTrigger), TinaCMS (só leitura aqui).

**Spec:** `docs/superpowers/specs/2026-09-23-polimento-design.md`

## Global Constraints

- Branch `design`. Commits `tipo: resumo` em pt-BR, sem acentos no assunto (padrão do histórico), **sem trailer** `Co-Authored-By`/`Claude-Session` (convenção do projeto).
- Nenhum texto de interface hardcoded: todo texto novo entra em `src/i18n/pt.ts`.
- Comentários citando identificadores do PRD (`RF-`, `RN-`, `F-`, `§N`) só se o identificador existir — `tests/lib/citacoes-do-prd.test.ts` reprova citação inexistente.
- Docstring em todo módulo e função pública nova; cabeçalho `/** ===… */` dos `.astro`/`.ts` alterados atualizado (Descrição, Atualizado em `2026-09-23`, Versão +0.1, Dependências).
- Melhoria progressiva: sem JS o conteúdo inteiro continua acessível.
- Breakpoints existentes: só `sm` (40rem) e `lg` (64rem). Não usar `md`/`xl`.
- Comando de build: `npm run build:pipeline` (roda testes de conteúdo, `tinacms build`, `astro check`, `astro build`). Nunca dois builds em paralelo. Pare o preview antes (`npx astro preview stop`).
- Fora do escopo: fonte mono, modo escuro, Lenis, Open Graph/canonical, `astro:assets`.

## Review Focus

1. **Dois elementos com o mesmo `view-transition-name` na mesma página** — o navegador aborta a transição em silêncio. Esperado: no máximo um `vt-nome` e um `vt-menu` por HTML. Teste: Task 5, Step 1.
2. **Projeto ligado a uma linha não publicada** — não pode sumir nem revelar o rascunho. Esperado: cai em "Outros projetos". Teste: Task 2, Step 1.
3. **Linha de pesquisa sem projetos** — não pode deixar lista vazia nem régua órfã. Esperado: `byLine` sem a chave, página não renderiza `<ol>`. Teste: Task 2, Step 1.
4. **Tab em Publicações com anos fechados** — foco não pode cair em link invisível. Esperado: corpos fechados `inert`. Verificação no navegador: Task 6, Step 6.
5. **Celular / movimento reduzido baixando GSAP** — esperado: nenhum script referenciado pelo HTML de `/publicacoes/` contém o ScrollTrigger. Teste: Task 7, Step 1.

---

### Task 1: Fundação visual — tokens, `PageHeader` compacto, hover único

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/PageHeader.astro` (reescrita)
- Modify: `src/pages/ensino.astro`, `src/pages/ensino/[slug].astro`, `src/pages/publicacoes.astro`, `src/pages/pesquisa.astro` (só a chamada do `PageHeader`), `src/pages/404.astro` (só a chamada), `src/pages/sobre.astro`
- Modify: `src/components/SiteHeader.astro`, `src/pages/index.astro`, `src/components/CourseResources.astro`

**Interfaces:**
- Produces: CSS var `--coluna-rotulo` (11rem); utilitários `text-nav`, `link-sublinhado`; `PageHeader` com props `{ title: string; meta?: string }` e slot opcional `aside` (sem `eyebrow`).

- [ ] **Step 1: Tokens e utilitários em `global.css`.** Dentro de `@layer base { … }`, antes de `html {`, acrescentar:

```css
  :root {
    /* Coluna de metadados à esquerda (período, código, número) — uma largura só no site. */
    --coluna-rotulo: 11rem;
  }
```

Depois de `@utility text-rotulo { … }`, acrescentar:

```css
@utility text-nav {
  font-size: 0.875rem;
  line-height: 1.2;
  letter-spacing: 0;
  font-family: var(--font-texto);
  font-weight: 400;
}

/* Hover único de navegação e de linha de lista: sublinha com o mesmo afastamento do item ativo. */
@utility link-sublinhado {
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  &:hover {
    text-decoration-line: underline;
  }
}
```

Remover os blocos `@utility text-ano { … }` e `@utility text-numeral-sm { … }` (sem uso — conferir antes com `rg "text-ano|text-numeral-sm" src`; esperado: só `global.css`).

- [ ] **Step 2: Reescrever `src/components/PageHeader.astro`** (manter o cabeçalho de comentário, atualizando Descrição/Entradas/Versão 0.3.0):

```astro
---
export interface Props {
  /** Título `<h1>` da página (`text-display-2`). */
  title: string;
  /** Linha pequena de identificação abaixo do título (ex.: "FIS0000 · 2026.2 · Atual"). Ausente = nada. */
  meta?: string;
}

const { title, meta } = Astro.props;
// Sem slot `aside`, o título ocupa a largura inteira — sem grade nem coluna vazia.
const hasAside = Astro.slots.has('aside');
---

{/* `shrink-0`: dentro do <main> flex que rola, o cabeçalho não pode ser encolhido. */}
<div class="px-margem shrink-0 pt-6 lg:pt-8">
  <div class:list={['grid gap-x-8 gap-y-4 pb-6', hasAside && 'lg:grid-cols-12 lg:items-end']}>
    <div class:list={[hasAside && 'lg:col-span-7']}>
      <h1 class="text-display-2 titulo-entrada">{title}</h1>
      {meta && <p class="text-pequeno text-secundario mt-2">{meta}</p>}
    </div>
    {
      hasAside && (
        <div class="lg:col-span-5">
          <slot name="aside" />
        </div>
      )
    }
  </div>
  <div aria-hidden="true" class="regua-entrada bg-tinta h-px"></div>
</div>
```

- [ ] **Step 3: Atualizar as chamadas.**
  - `ensino.astro`: `<PageHeader title={pt.teaching.title} />`; trocar as duas ocorrências de `lg:grid-cols-[11rem_1fr]` por `lg:grid-cols-[var(--coluna-rotulo)_1fr]` e `lg:grid-cols-[11rem_1fr_auto]` por `lg:grid-cols-[var(--coluna-rotulo)_1fr_auto]`; trocar `hover:underline` e `group-hover:underline` por `link-sublinhado` / `group-hover:underline underline-offset-[6px] decoration-1`.
  - `ensino/[slug].astro`: `<PageHeader title={data.nome} meta={meta}>` (mantém o slot `aside`); remover `px-margem mx-auto max-w-[90rem]` redundantes se houver.
  - `publicacoes.astro`: `<PageHeader title={pt.publications.title} />`; `lg:grid-cols-[11rem_1fr]` → `lg:grid-cols-[var(--coluna-rotulo)_1fr]`; `lg:pl-[11rem]` → `lg:pl-[var(--coluna-rotulo)]`.
  - `pesquisa.astro`: `<PageHeader title={pt.research.title} />` (o resto da página muda na Task 2).
  - `404.astro`: `<PageHeader title={pt.notFound.title} meta={pt.notFound.eyebrow} />`.
  - `CourseResources.astro`: `sm:grid-cols-[7rem_1fr]` → `sm:grid-cols-[var(--coluna-rotulo)_1fr]`.
  - `LessonList.astro`: **não muda** a coluna de 3rem (é o número da aula dentro do painel, não coluna de metadados da página).

- [ ] **Step 4: Sobre com `PageHeader`.** Em `sobre.astro`: inserir `<PageHeader title={pt.about.title} />` como primeiro filho do `<BaseLayout>`; remover o `<h1 …>{pt.about.title}</h1>` da coluna esquerda; no contêiner de grade trocar `pt-6 … lg:pt-8` por `pt-6`; na timeline trocar `grid-cols-[6.5rem_1fr]` por `grid-cols-[var(--coluna-rotulo)_1fr]`; importar `PageHeader`.

- [ ] **Step 5: Navegação.** `SiteHeader.astro`: nos três `text-[0.9375rem]` trocar por `text-nav`; no link da lista acrescentar `link-sublinhado` (o ativo mantém `underline decoration-1 underline-offset-[6px]`). `index.astro`: na nav da Home trocar `text-pequeno` do `<ul>` por `text-nav` e `hover:underline` por `link-sublinhado`.

- [ ] **Step 6: Build e suíte.**

Run: `npx astro preview stop; npx prettier --write src; npm test; npm run lint; npm run build:pipeline; npm run test:dist`
Expected: testes 269 passam; lint 0; build "8 page(s) built"; `test:dist` 9 passam. Colar as linhas de resumo.

- [ ] **Step 7: Verificação no navegador (Vivaldi).** `npx astro preview --port 4329`. Por iframe, em `/`, `/sobre/`, `/ensino/`, `/ensino/2026-2-relatividade-geral/`, `/publicacoes/`, `/pesquisa/`, `/404.html` a 1440×800, 1366×650 e 360×700: `scrollWidth === clientWidth`; Home e Sobre com `main.scrollHeight === main.clientHeight` a 1440×800 e 1366×650. Conferir: todo `<h1>` com `font-size` ≈ 46px a 1440 e sem rubrica acima. **Se a Sobre ganhar rolagem vertical a 1366×650, pare e reporte** (a coluna de 11rem nas timelines é decisão do spec; não improvise outra largura).

- [ ] **Step 8: Commit.**

```bash
git add -A src
git commit -m "refactor: fundacao visual unica (coluna-rotulo, PageHeader compacto, text-nav, hover)"
```

---

### Task 2: `groupProjectsByLine` (TDD)

**Files:**
- Modify: `src/lib/research.ts`
- Test: `tests/lib/research.test.ts`

**Interfaces:**
- Produces: `groupProjectsByLine<P extends ProjectLike>(lineIds: ReadonlySet<string>, projects: P[]): { byLine: Map<string, P[]>; others: P[] }` — preserva a ordem de `projects`.

- [ ] **Step 1: Teste que falha.** Acrescentar `groupProjectsByLine` ao import e, no fim do arquivo:

```ts
describe('groupProjectsByLine', () => {
  const project = (titulo: string, linha?: string) => ({
    data: { titulo, linha_relacionada: linha ? { id: linha } : undefined },
  });

  it('agrupa por linha publicada, preservando a ordem recebida', () => {
    const projects = [project('B', 'l1'), project('A', 'l1'), project('C', 'l2')];
    const { byLine, others } = groupProjectsByLine(new Set(['l1', 'l2']), projects);
    expect(byLine.get('l1')?.map((p) => p.data.titulo)).toEqual(['B', 'A']);
    expect(byLine.get('l2')?.map((p) => p.data.titulo)).toEqual(['C']);
    expect(others).toEqual([]);
  });

  it('projeto sem linha vai para others', () => {
    const { byLine, others } = groupProjectsByLine(new Set(['l1']), [project('Solto')]);
    expect(byLine.size).toBe(0);
    expect(others.map((p) => p.data.titulo)).toEqual(['Solto']);
  });

  it('RN-01: projeto ligado a linha não publicada vai para others, sem criar a chave', () => {
    const { byLine, others } = groupProjectsByLine(new Set(['l1']), [project('X', 'rascunho')]);
    expect(byLine.has('rascunho')).toBe(false);
    expect(others.map((p) => p.data.titulo)).toEqual(['X']);
  });

  it('linha sem projetos não aparece no mapa', () => {
    const { byLine } = groupProjectsByLine(new Set(['l1', 'l2']), [project('A', 'l1')]);
    expect(byLine.has('l2')).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar.**

Run: `npx vitest run tests/lib/research.test.ts`
Expected: FAIL — `groupProjectsByLine is not a function` (ou erro de import).

- [ ] **Step 3: Implementação mínima** em `src/lib/research.ts`, depois de `sortProjects`:

```ts
/**
 * Agrupa projetos pela linha de pesquisa a que pertencem, para a página Pesquisa listar os
 * projetos dentro de cada linha.
 *
 * // RN-01: projeto ligado a uma linha fora de `lineIds` (não publicada) vai para `others`, como
 * se não tivesse linha — a página nunca revela o rascunho.
 *
 * @param lineIds Ids das linhas publicadas, presentes na página.
 * @param projects Projetos já publicados e ordenados (`sortProjects`).
 * @returns `byLine` (id da linha → projetos, na ordem recebida; linha sem projeto não tem chave)
 *   e `others` (sem linha ou com linha não publicada).
 */
export function groupProjectsByLine<P extends ProjectLike>(
  lineIds: ReadonlySet<string>,
  projects: P[],
): { byLine: Map<string, P[]>; others: P[] } {
  const byLine = new Map<string, P[]>();
  const others: P[] = [];
  for (const project of projects) {
    const lineId = project.data.linha_relacionada?.id;
    if (lineId === undefined || !lineIds.has(lineId)) {
      others.push(project);
      continue;
    }
    byLine.set(lineId, [...(byLine.get(lineId) ?? []), project]);
  }
  return { byLine, others };
}
```

- [ ] **Step 4: Rodar e ver passar.**

Run: `npx vitest run tests/lib/research.test.ts`
Expected: PASS (todos os blocos, inclusive os 4 novos).

- [ ] **Step 5: Canário.** Trocar temporariamente `!lineIds.has(lineId)` por `false` e rodar de novo: o teste "RN-01…" tem de falhar. Desfazer e rodar de novo (PASS).

- [ ] **Step 6: Commit.**

```bash
git add src/lib/research.ts tests/lib/research.test.ts
git commit -m "feat: groupProjectsByLine agrupa projetos por linha publicada (RN-01)"
```

---

### Task 3: Página Pesquisa na linguagem nova

**Files:**
- Modify: `src/pages/pesquisa.astro` (reescrita do corpo)
- Modify: `src/i18n/pt.ts` (nova chave `research.otherProjects`)
- Modify: `src/styles/global.css` (remover `text-numeral` se ficar sem uso)
- Delete: `src/components/ProjectCard.astro`, `src/components/Tag.astro`

**Interfaces:**
- Consumes: `groupProjectsByLine` (Task 2), `sortResearchLines`, `sortProjects`, `PageHeader` (Task 1), `--coluna-rotulo`.

- [ ] **Step 1: Texto novo.** Em `pt.research`, acrescentar `otherProjects: 'Outros projetos',`.

- [ ] **Step 2: Reescrever o corpo de `pesquisa.astro`** (atualizar o cabeçalho de comentário: Descrição "linhas de pesquisa com os projetos de cada uma logo abaixo, e 'Outros projetos' no fim", Versão 0.3.0, Dependências sem Tag/ProjectCard e com `groupProjectsByLine`). Frontmatter após o comentário:

```astro
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PageHeader from '../components/PageHeader.astro';
import { pt } from '../i18n/pt';
import { padCount, toParagraphs } from '../lib/text';
import { filterPublished } from '../lib/published';
import { groupProjectsByLine, sortProjects, sortResearchLines } from '../lib/research';

// RN-01: só linhas e projetos publicados entram na página.
const lines = sortResearchLines(filterPublished(await getCollection('linhas-pesquisa')));
const projects = sortProjects(filterPublished(await getCollection('projetos')));
const { byLine, others } = groupProjectsByLine(new Set(lines.map((line) => line.id)), projects);

/** Período do projeto: "inicio–fim", ou "inicio–" em aberto. */
const period = (p: (typeof projects)[number]) =>
  p.data.periodo ? `${p.data.periodo.inicio}–${p.data.periodo.fim ?? ''}` : undefined;
---
```

Template:

```astro
<BaseLayout title={pt.nav.research}>
  <PageHeader title={pt.research.title} />

  <div class="px-margem pb-10">
    {
      lines.map((line, index) => {
        const paragraphs = [...toParagraphs(line.data.resumo), ...toParagraphs(line.data.corpo)];
        const lineProjects = byLine.get(line.id) ?? [];
        return (
          <section id={line.id} aria-labelledby={`${line.id}-titulo`} class="linha-pesquisa py-8">
            <div class="grid gap-x-8 gap-y-2 lg:grid-cols-[var(--coluna-rotulo)_1fr]">
              <span aria-hidden="true" class="text-pequeno text-secundario lg:pt-3">
                {padCount(index + 1)}
              </span>
              <div>
                <h2 id={`${line.id}-titulo`} class="text-display-2">
                  {line.data.titulo}
                </h2>
                {paragraphs.map((paragraph, i) => (
                  <p class:list={['text-corpo max-w-medida mt-3', i === 0 && 'text-secundario']}>
                    {paragraph}
                  </p>
                ))}
                {line.data.imagem && (
                  <img
                    src={line.data.imagem}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    class="mt-4 w-full max-w-md object-cover grayscale"
                  />
                )}
              </div>
            </div>
            {lineProjects.length > 0 && (
              <ol class="mt-6">
                {lineProjects.map((project) => (
                  <li class="projeto-linha grid gap-x-8 gap-y-1 py-3 lg:grid-cols-[var(--coluna-rotulo)_1fr]">
                  <p class="text-pequeno text-secundario">
                    {period(project)}
                    {project.data.status && (
                      <span class="block">{pt.research.status[project.data.status]}</span>
                    )}
                  </p>
                  <div>
                    <h3 class="text-titulo-item">{project.data.titulo}</h3>
                    <p class="text-pequeno text-secundario max-w-medida mt-1">
                      {project.data.descricao}
                    </p>
                    {(project.data.financiador || project.data.colaboradores?.length) && (
                      <p class="text-pequeno text-secundario mt-1">
                        {[project.data.financiador, project.data.colaboradores?.join(', ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </li>
                ))}
              </ol>
            )}
          </section>
        );
      })
    }

    {
      others.length > 0 && (
        <section aria-labelledby="outros-projetos" class="linha-pesquisa py-8">
          <h2 id="outros-projetos" class="text-rotulo text-secundario">
            {pt.research.otherProjects}
          </h2>
          <ol class="mt-4">
            {others.map((project) => (
              <li class="projeto-linha grid gap-x-8 gap-y-1 py-3 lg:grid-cols-[var(--coluna-rotulo)_1fr]">
                  <p class="text-pequeno text-secundario">
                    {period(project)}
                    {project.data.status && (
                      <span class="block">{pt.research.status[project.data.status]}</span>
                    )}
                  </p>
                  <div>
                    <h3 class="text-titulo-item">{project.data.titulo}</h3>
                    <p class="text-pequeno text-secundario max-w-medida mt-1">
                      {project.data.descricao}
                    </p>
                    {(project.data.financiador || project.data.colaboradores?.length) && (
                      <p class="text-pequeno text-secundario mt-1">
                        {[project.data.financiador, project.data.colaboradores?.join(', ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </li>
            ))}
          </ol>
        </section>
      )
    }
  </div>
</BaseLayout>
```

O `<li>` do projeto é o mesmo nos dois lugares (dentro da linha e em "Outros projetos"); a repetição é deliberada — extrair componente para dois usos idênticos no mesmo arquivo não compensa aqui.

Estilo no fim do arquivo:

```astro
<style>
  /* Blocos de linha com régua forte; projetos com régua fina — padrão de lista do site. */
  .linha-pesquisa {
    border-top: 1px solid var(--color-tinta);
  }
  .projeto-linha {
    border-top: 1px solid var(--color-regua);
  }
</style>
```

Nota: a imagem da linha passa a `alt=""` porque o título da linha já está no `<h2>` logo acima (a imagem é ilustrativa); se o stakeholder quiser descrição, é campo novo no CMS — fora do escopo.

- [ ] **Step 3: Remover componentes órfãos.** Conferir `rg "ProjectCard|Tag\.astro|from './Tag'|from '../components/Tag'" src` → nenhuma ocorrência além dos próprios arquivos. Então `git rm src/components/ProjectCard.astro src/components/Tag.astro`. Depois, `rg "text-numeral" src` — se só restar a definição em `global.css`, remover o bloco `@utility text-numeral { … }`.

- [ ] **Step 4: Build e suíte.**

Run: `npx astro preview stop; npx prettier --write src; npm test; npm run lint; npm run build:pipeline; npm run test:dist`
Expected: tudo passa (o `countActiveProjectsByLine`/`relatedLineAnchor` ainda existem e seguem testados; saem na Task 8).

- [ ] **Step 5: Navegador.** `/pesquisa/` a 1440×800 e 360×700: sem rolagem horizontal; "Sombras de buracos negros em gravitação modificada" aparece **dentro** da linha "Sombras de buracos negros"; "Forças de maré em espaços-tempos de Kerr" (sem `linha_relacionada`) aparece em "Outros projetos"; nenhum contorno tracejado; a âncora `/pesquisa/#sombras-de-buracos-negros` leva a linha ao topo do cartão (clique real).

- [ ] **Step 6: Commit.**

```bash
git add -A src
git commit -m "feat: pesquisa com projetos dentro de cada linha e outros projetos no fim"
```

---

### Task 4: Página 404 na linguagem nova

**Files:**
- Modify: `src/pages/404.astro`
- Delete: `src/components/PillButton.astro`

- [ ] **Step 1: Reescrever o corpo** (cabeçalho de comentário: Descrição sem a pílula, Versão +0.1, Dependências sem PillButton):

```astro
<BaseLayout title={pt.notFound.title}>
  <PageHeader title={pt.notFound.title} meta={pt.notFound.eyebrow} />

  <div class="px-margem pt-6 pb-16">
    <p class="text-corpo max-w-medida">{pt.notFound.body}</p>

    <h2 class="text-rotulo text-secundario mt-10">{pt.notFound.allPages}</h2>
    <ul class="mt-4">
      {
        // RF-27: as cinco rotas de NAV_ITEMS, sem CV; "Início" é a primeira.
        NAV_ITEMS.map((item) => (
          <li class="pagina-linha">
            <a href={item.href} class="group flex items-center justify-between py-3">
              <span class="text-titulo-item group-hover:underline decoration-1 underline-offset-[6px]">
                {pt.nav[item.key]}
              </span>
              <span aria-hidden="true" class="text-secundario">
                ›
              </span>
            </a>
          </li>
        ))
      }
    </ul>
  </div>
</BaseLayout>

<style>
  .pagina-linha {
    border-top: 1px solid var(--color-regua);
  }
  .pagina-linha:first-child {
    border-top-color: var(--color-tinta);
  }
</style>
```

Remover o import de `PillButton`. `pt.notFound.backHome` fica sem uso → sai na Task 8.

- [ ] **Step 2: Remover `PillButton`.** `rg "PillButton" src` → só o próprio arquivo. `git rm src/components/PillButton.astro`.

- [ ] **Step 3: Build e suíte** (mesmo comando da Task 3, Step 4). Expected: tudo passa; `dist/404.html` existe.

- [ ] **Step 4: Navegador.** `/rota-inexistente` no `astro preview` (ou `/404.html`): título "Página não encontrada", "Erro 404" abaixo, lista com régua; hover sublinha o nome.

- [ ] **Step 5: Commit.**

```bash
git add -A src
git commit -m "feat: 404 na linguagem nova, sem botao pilula"
```

---

### Task 5: Transições entre páginas (View Transitions)

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/SiteHeader.astro`, `src/pages/index.astro`
- Test: `tests/dist/site-gerado.test.ts`

**Interfaces:**
- Produces: classes globais `vt-cartao`, `vt-conteudo`, `vt-nome`, `vt-menu`; atributo `html[data-vt]` quando a página chegou por transição.

- [ ] **Step 1: Teste de artefato que falha.** Em `tests/dist/site-gerado.test.ts`, acrescentar um `describe` (`distDir` e `listSiteHtmlFiles()` já existem no arquivo):

```ts
describe('View Transitions: nomes únicos por página', () => {
  const htmlFiles = listSiteHtmlFiles();

  it('cada .html tem no máximo um vt-nome e um vt-menu, e ao menos um vt-nome', () => {
    for (const file of htmlFiles) {
      const conteudo = readFileSync(file, 'utf-8');
      for (const nome of ['vt-nome', 'vt-menu']) {
        const count = (conteudo.match(new RegExp(`class="[^"]*\\b${nome}\\b`, 'g')) ?? []).length;
        expect(count, `${file}: ${count} ${nome}`).toBeLessThanOrEqual(1);
      }
      expect(conteudo.includes('vt-nome'), `${file} sem vt-nome`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Build + rodar e ver falhar.**

Run: `npx astro preview stop; npm run build:pipeline; npm run test:dist`
Expected: FAIL — "sem vt-nome".

- [ ] **Step 3: CSS.** No fim de `global.css`:

```css
/* Transições entre páginas (View Transitions entre documentos, só CSS). O cartão fica parado, o
   nome e o menu migram entre a Home e o cabeçalho, e o conteúdo troca com um fade curto.
   Navegador sem suporte navega normalmente. */
@view-transition {
  navigation: auto;
}

.vt-cartao {
  view-transition-name: cartao;
}
.vt-conteudo {
  view-transition-name: conteudo;
}
.vt-nome {
  view-transition-name: nome;
}
.vt-menu {
  view-transition-name: menu;
}

::view-transition-group(nome) {
  animation-duration: 350ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
::view-transition-old(conteudo) {
  animation: vt-sai 120ms ease-out both;
}
::view-transition-new(conteudo) {
  animation: vt-entra 220ms ease-out both;
}

@keyframes vt-sai {
  to {
    opacity: 0;
  }
}
@keyframes vt-entra {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

/* Chegou por transição: a animação de entrada do título/régua não repete o movimento. */
html[data-vt] .titulo-entrada,
html[data-vt] .regua-entrada {
  animation: none;
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- [ ] **Step 4: Marcações.**
  - `BaseLayout.astro`: no cartão (`div.bg-bloco…`) acrescentar `vt-cartao`; no `<main id="conteudo">` acrescentar `vt-conteudo`. No `<head>`, depois do `<meta name="description">`:

```astro
<script is:inline>
  // Página revelada por View Transition: desliga a animação de entrada (ver global.css).
  addEventListener('pagereveal', (e) => {
    if (e.viewTransition) document.documentElement.dataset.vt = '';
  });
</script>
```

  - `SiteHeader.astro`: no `<a href="/" …>` do nome acrescentar `vt-nome`; no `<nav>` acrescentar `vt-menu`.
  - `index.astro`: no `<h1 id="home-nome">` acrescentar `vt-nome`; no `<nav>` acrescentar `vt-menu`.

- [ ] **Step 5: Build + teste passa.**

Run: `npx prettier --write src; npm test; npm run lint; npm run build:pipeline; npm run test:dist`
Expected: tudo passa, inclusive o bloco novo.

- [ ] **Step 6: Navegador (Vivaldi — suporta cross-document VT).** Navegar clicando: Home → Sobre → Ensino → Relatividade Geral → Publicações → Início. Observar: nome animando entre grande e pequeno; conteúdo trocando; cartão parado. Depois de chegar a Publicações por transição, rolar: a sanfona abre/fecha. Na disciplina, trocar abas por clique. Barra de rolagem ativa ao rolar. Conferir `document.documentElement.dataset.vt` = `""` após navegação e ausente após F5.

- [ ] **Step 7: Commit.**

```bash
git add -A src tests
git commit -m "feat: transicoes entre paginas com View Transitions (nome, menu e conteudo)"
```

---

### Task 6: Acessibilidade

**Files:**
- Modify: `src/pages/publicacoes.astro`, `src/layouts/BaseLayout.astro`, `src/components/ScriptPanel.astro`, `src/components/LessonList.astro`, `src/components/ScrollBar.astro`, `src/pages/index.astro`, `src/pages/sobre.astro`, `src/i18n/pt.ts`
- Test: `tests/i18n/pt.test.ts`

- [ ] **Step 1: Reproduzir antes de corrigir.** Com o preview no ar (build da Task 5), em `/publicacoes/` a 1440×800: `document.querySelectorAll('.pub-ano-corpo a')` dos anos fechados — rodar `[...document.querySelectorAll('.pub-ano-corpo')].map(b => [b.offsetHeight, b.inert])` e registrar (esperado hoje: alturas 0 com `inert` falso). Em qualquer página: `document.getElementById('conteudo').tabIndex` (esperado hoje: `-1`? registrar o valor real — se já for `-1`, o item 2 do spec vira "sem mudança" e isso é anotado no commit).

- [ ] **Step 2: Teste do texto novo (falha).** Em `tests/i18n/pt.test.ts`:

```ts
describe('pt.site.portraitAlt', () => {
  it('monta o texto alternativo do retrato', () => {
    expect(pt.site.portraitAlt('Haroldo Lima')).toBe('Retrato de Haroldo Lima');
  });
});
```

Run: `npx vitest run tests/i18n/pt.test.ts` → FAIL (`portraitAlt is not a function`).

- [ ] **Step 3: Implementar.** Em `pt.site`: `portraitAlt: (nome: string) => \`Retrato de ${nome}\`,`. Rodar o teste → PASS. Em `index.astro` e `sobre.astro`: `alt={pt.site.portraitAlt(siteConfig.displayName)}` (importar `siteConfig` na Sobre).

- [ ] **Step 4: Demais correções.**
  - `publicacoes.astro`, dentro do callback do `matchMedia` (antes de `ScrollTrigger.create`): função `syncInert = () => bodies.forEach((body) => (body.inert = body.offsetHeight < 1));` e, no `ScrollTrigger.create({...})`, acrescentar `onUpdate: syncInert, onRefresh: syncInert,`; chamar `syncInert()` logo após criar; no `return () => {…}` acrescentar `bodies.forEach((body) => (body.inert = false));`.
  - `publicacoes.astro`, template: tirar o `<span>` de contagem de dentro do `<h2>` — o `<h2>` fica só com o link do ano; envolver `<h2>` + `<span>` num `<div class="flex items-baseline justify-between gap-4 py-4 lg:grid lg:grid-cols-[var(--coluna-rotulo)_1fr]">` (as classes de layout saem do `<h2>`). Conferir que o script continua achando o cabeçalho: ele usa `section.querySelector('h2')` para medir a altura — trocar para `section.firstElementChild as HTMLElement`.
  - `BaseLayout.astro`: `<main id="conteudo" tabindex="-1" class="… outline-none">` (se o Step 1 mostrou que já era -1, não mudar).
  - `ScriptPanel.astro`: prop `headingLevel?: 3 | 4` (docstring: "Nível do título do script; 4 quando o painel está dentro de uma aula (que já é `h3`). Padrão 3."); `const Heading = headingLevel === 4 ? 'h4' : 'h3';` e `<Heading class="text-titulo-item mt-2">{script.titulo}</Heading>`. `LessonList.astro`: `<ScriptPanel script={script} headingLevel={4} />`.
  - `ScrollBar.astro`, clique no trilho: `behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'`. (O clique no ano em Publicações já só existe sob `no-preference` — sem mudança.)

- [ ] **Step 5: Build e suíte** (comando da Task 5, Step 5). Expected: tudo passa.

- [ ] **Step 6: Navegador.** `/publicacoes/` a 1440×800, topo da página: pressionar Tab a partir do cabeçalho e registrar `document.activeElement` a cada passo até sair da lista — nenhum foco em link dentro de `.pub-ano-corpo` com `offsetHeight < 1`. Skip link: focar "Pular para o conteúdo", Enter, depois PageDown → `main.scrollTop` aumenta. Se a extensão não mover o foco por Tab (limitação conhecida nesta máquina), usar `element.focus()` + `KeyboardEvent` sintético e **declarar** no commit que foi sintético.

- [ ] **Step 7: Commit.**

```bash
git add -A src tests
git commit -m "fix: acessibilidade (anos fechados inert, skip link, niveis de titulo, alt do retrato, movimento reduzido)"
```

---

### Task 7: Desempenho e metadados

**Files:**
- Modify: `src/pages/publicacoes.astro` (import dinâmico), `src/pages/index.astro`, `src/pages/sobre.astro`, `src/layouts/BaseLayout.astro`, `public/_headers`
- Create: `public/favicon.svg`
- Test: `tests/dist/site-gerado.test.ts`

- [ ] **Step 1: Testes de artefato que falham.** Em `tests/dist/site-gerado.test.ts`:

```ts
describe('desempenho e metadados', () => {
  const htmlFiles = listSiteHtmlFiles();

  it('HTML de /publicacoes/ não referencia script com o ScrollTrigger (GSAP sob demanda)', () => {
    const html = readFileSync(join(distDir, 'publicacoes', 'index.html'), 'utf-8');
    const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    for (const src of srcs) {
      const code = readFileSync(join(distDir, src), 'utf-8');
      expect(code.includes('ScrollTrigger'), `${src} carrega o ScrollTrigger`).toBe(false);
    }
  });

  it('dist/favicon.svg existe e toda página o declara', () => {
    expect(existsSync(join(distDir, 'favicon.svg'))).toBe(true);
    for (const file of htmlFiles) {
      expect(readFileSync(file, 'utf-8'), file).toContain('href="/favicon.svg"');
    }
  });
});
```

Run: `npx astro preview stop; npm run build:pipeline; npm run test:dist` → FAIL nos dois.

- [ ] **Step 2: GSAP sob demanda.** Em `publicacoes.astro`, trocar os imports estáticos por:

```ts
/** Condição em que a sanfona roda — fora dela o GSAP nem é baixado. */
const QUERY = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)';
const media = window.matchMedia(QUERY);
let started = false;

async function startAccordion() {
  if (started) return;
  started = true;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  // … corpo atual (headers/bodies/lists/links, available/openHeight/overflow e
  //   gsap.matchMedia().add(QUERY, () => { … })) movido para dentro desta função, sem outra mudança.
}
```

e, no lugar do antigo `if (scroller && wrapper && sections.length > 1) { … }`:

```ts
if (scroller && wrapper && sections.length > 1) {
  if (media.matches) void startAccordion();
  media.addEventListener('change', () => {
    if (media.matches) void startAccordion();
  });
}
```

- [ ] **Step 3: Foto.** `index.astro` e `sobre.astro`: `<img … width="960" height="1280">`; na Home também `fetchpriority="high"`.

- [ ] **Step 4: Preload da fonte, favicon e theme-color** em `BaseLayout.astro`:

```astro
import archivo300 from '@fontsource/archivo/files/archivo-latin-300-normal.woff2?url';
```

No `<head>`:

```astro
<link rel="preload" href={archivo300} as="font" type="font/woff2" crossorigin />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta name="theme-color" content="#efedea" />
```

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#efedea"/><text x="16" y="21" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="13" letter-spacing="-0.4" fill="#111112">HL</text></svg>
```

- [ ] **Step 5: Cache.** Em `public/_headers`, acrescentar ao fim (mantendo o bloco `/*` existente):

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

- [ ] **Step 6: Build + testes passam.**

Run: `npx prettier --write src; npm test; npm run lint; npm run build:pipeline; npm run test:dist`
Expected: tudo passa. Conferir também: `grep -o 'archivo-latin-300-normal[^")]*woff2' dist/_astro/*.css` e o `href` do preload em `dist/index.html` apontam **o mesmo arquivo** (se divergirem, o preload baixa duas vezes — reportar).

- [ ] **Step 7: Navegador.** 360×700 em `/publicacoes/` (DevTools/`performance.getEntriesByType('resource')` num iframe): nenhum recurso com "gsap"/"ScrollTrigger". 1440×800: sanfona funciona (GSAP carregado sob demanda). Nenhuma requisição `/favicon.ico` com 404.

- [ ] **Step 8: Commit.**

```bash
git add -A src public tests
git commit -m "perf: gsap sob demanda, preload da fonte, cache imutavel, favicon e dimensoes da foto"
```

---

### Task 8: Limpeza de órfãos

**Files:**
- Modify: `src/i18n/pt.ts`, `tests/i18n/pt.test.ts`, `src/lib/courses.ts`, `tests/lib/courses.test.ts`, `src/lib/research.ts`, `tests/lib/research.test.ts`

- [ ] **Step 1: Inventário por busca** (não por memória). Para cada chave abaixo, rodar `rg "<chave>" src` e listar só as que têm **zero** usos fora de `pt.ts`:
  `pt.home` (bloco inteiro), `research.eyebrow`, `research.summary`, `research.activeProjects`, `research.projects`, `research.collaborators`, `research.relatedLine`, `teaching.eyebrow`, `teaching.lessons`, `teaching.problemSets`, `teaching.scripts`, `teaching.open`, `course.onThisPage`, `course.open`, `course.breadcrumb` (confere — é usado), `publications.featured`, `publications.abstractAndKeywords`, `publications.keywords`, `about.academicProfiles`, `notFound.backHome`.
  Funções: `countCourseItems`, `countActiveProjectsByLine`, `relatedLineAnchor` — `rg "<nome>" src` fora do próprio módulo.

- [ ] **Step 2: Remover** as chaves e funções com zero uso, e os blocos de teste que existiam só para elas (`describe('pt.home — …')`, os `it` de `summary`/`activeProjects`/`lessons`/`problemSets`/`scripts`, `describe('countCourseItems')`, `describe('countActiveProjectsByLine')`, `describe('relatedLineAnchor')`), ajustando os imports dos testes. Se algum tipo auxiliar (`ProjectLike` etc.) ficar sem uso, remover também.

- [ ] **Step 3: Exceção `pt.publications.type`.** Não remover. Parar e perguntar ao stakeholder: "O tipo (Artigo/Preprint/…) deixou de aparecer em Publicações. Voltamos a mostrá-lo (ex.: na linha de autores) ou removemos o texto e o teste de paridade com o schema?" Aplicar a resposta.

- [ ] **Step 4: Suíte, lint, build, dist.**

Run: `npx prettier --write src tests; npm test; npm run lint; npm run build:pipeline; npm run test:dist`
Expected: tudo passa; o total de testes cai pelo número de testes removidos (registrar antes/depois).

- [ ] **Step 5: Commit.**

```bash
git add -A src tests
git commit -m "chore: remove textos, funcoes e testes orfaos apos o polimento"
```

---

### Task 9: Verificação final e registro

- [ ] **Step 1: Suíte completa.** `npm run test:coverage` e `npm run test:dist` — colar o resumo (testes, cobertura).
- [ ] **Step 2: Varredura no navegador.** As 8 rotas × 1440×800, 1366×650, 360×700: sem rolagem horizontal; Home e Sobre sem rolagem vertical a partir de `lg`; uma navegação completa por transição (Task 5, Step 6) repetida sobre o build final.
- [ ] **Step 3: Registro.** Acrescentar ao fim do spec uma seção "Resultado (2026-09-23)" com: commits de cada task, números da suíte, o que ficou pendente (PRD RF-20/21/23/24/25 e §7.3; `docs/identidade-visual.md` §5/§6; Open Graph/canonical na fase 5; `astro:assets`). Commit: `docs: resultado do polimento`.
