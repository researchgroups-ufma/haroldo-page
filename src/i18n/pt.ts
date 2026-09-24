/**
 * ============================================================================
 *  Arquivo      : pt.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Dicionário único de strings de interface em português das
 *                 sete rotas da fase 3 (§10.4 do PRD: proibido texto de
 *                 interface hardcoded em componente). Os quatro grupos de
 *                 rótulo de enum (`research.status`, `course.status`,
 *                 `course.materialType`, `script.language`) e
 *                 `publications.type` são tipados a partir dos schemas Zod de
 *                 `src/content.config.ts`, para que o `astro check` reprove
 *                 se um enum mudar sem o dicionário acompanhar.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-24
 *  Versão       : 0.2.0
 *
 *  Dependências : src/content.config.ts (projetosSchema, disciplinasSchema,
 *                 publicacoesSchema — só para os tipos dos mapas de enum)
 *  Entradas     : nenhuma
 *  Saídas       : `pt` (objeto de strings e funções) e o tipo `UiStrings`
 *  Uso          : import { pt } from '../i18n/pt'; pt.nav.home
 *
 *  Notas        : só o PT existe nesta fase (Decisão 1 do fatiamento da fase
 *                 3) — nenhum `en.ts`, seletor de idioma nem fallback RN-06.
 *                 A fase 4 acrescenta `en: UiStrings`. Dados que vêm do
 *                 conteúdo (frontmatter) não entram aqui.
 * ============================================================================
 */
import type { disciplinasSchema, projetosSchema, publicacoesSchema } from '../content.config';
import type { z } from 'astro/zod';

/** Devolve `singular` quando `n === 1`, senão `plural` — inclui `n === 0`. */
function plural(n: number, singular: string, plural_: string): string {
  return n === 1 ? singular : plural_;
}

/** Rótulo de `research.status`, chaves iguais a `projetosSchema.shape.status` (§10.4). */
type ProjetoStatus = NonNullable<z.infer<typeof projetosSchema>['status']>;

/** Rótulo de `course.status`, chaves iguais a `disciplinasSchema.shape.status`. */
type DisciplinaStatus = z.infer<typeof disciplinasSchema>['status'];

/** Rótulo de `course.materialType`, chaves iguais a `materiais[].tipo` de `disciplinasSchema`. */
type MaterialTipo = NonNullable<z.infer<typeof disciplinasSchema>['materiais']>[number]['tipo'];

/** Rótulo de `script.language`, chaves iguais a `scripts[].linguagem` de `disciplinasSchema`. */
type ScriptLinguagem = NonNullable<
  z.infer<typeof disciplinasSchema>['scripts']
>[number]['linguagem'];

/** Rótulo de `publications.type`, chaves iguais a `publicacoesSchema.shape.tipo`. */
type PublicacaoTipo = z.infer<typeof publicacoesSchema>['tipo'];

/**
 * Dicionário de strings de interface em português (§10.4, §5–§6 de
 * `docs/identidade-visual.md`). Chaves em inglês, valores em português.
 * Plural e texto com valor interpolado são funções `(n) => string` /
 * `(valor) => string` — nunca concatenados no componente.
 */
export const pt = {
  site: {
    skipToContent: 'Pular para o conteúdo',
    menu: 'Menu',
    mainNavLabel: 'Navegação principal',
    opensInNewTab: '(abre em nova aba)',
    pageTitle: (page: string, site: string) => `${page} — ${site}`,
    portraitAlt: (nome: string) => `Retrato de ${nome}`,
  },
  nav: {
    home: 'Início',
    about: 'Sobre',
    research: 'Pesquisa',
    teaching: 'Ensino',
    publications: 'Publicações',
  },
  about: {
    eyebrow: 'Sobre',
    title: 'Biografia e formação',
    education: 'Formação acadêmica',
    experience: 'Atuação profissional',
    areas: 'Áreas de atuação',
    contact: 'Contato',
    links: {
      lattes: 'Currículo Lattes',
      orcid: 'ORCID',
      scholar: 'Google Scholar',
      arxiv: 'arXiv',
      researchgate: 'ResearchGate',
      github: 'GitHub',
      institucional: 'Página institucional',
      cv: 'Currículo em PDF',
    },
  },
  research: {
    title: 'Linhas e projetos',
    otherProjects: 'Outros projetos',
    status: {
      'em andamento': 'Em andamento',
      concluído: 'Concluído',
    } satisfies Record<ProjetoStatus, string>,
  },
  teaching: {
    title: 'Disciplinas',
    current: 'Atuais',
    previous: 'Anteriores',
    noCurrent: 'Nenhuma disciplina neste semestre.',
    noPrevious: 'Nenhuma disciplina anterior.',
    latestLesson: 'Última aula',
  },
  course: {
    breadcrumb: 'Ensino',
    breadcrumbLabel: 'Trilha de navegação',
    status: {
      atual: 'Atual',
      anterior: 'Anterior',
    } satisfies Record<DisciplinaStatus, string>,
    tabsLabel: 'Seções da disciplina',
    syllabus: 'Ementa',
    lessons: 'Aulas',
    courseScripts: 'Scripts da disciplina',
    problemSets: 'Listas de exercícios',
    materials: 'Materiais complementares',
    bibliography: 'Bibliografia',
    links: 'Links',
    noLessons: 'Nenhuma aula publicada ainda.',
    lessonNumber: (n: number) => `Aula ${n}`,
    access: 'Acessar',
    dueDate: (d: string) => `Entrega ${d}`,
    materialType: {
      slides: 'Slides',
      notas: 'Notas',
      complementar: 'Complementar',
    } satisfies Record<MaterialTipo, string>,
  },
  script: {
    eyebrow: (lang: string) => `Script · ${lang}`,
    language: {
      python: 'Python',
      r: 'R',
      matlab: 'MATLAB',
      bash: 'Bash',
      outro: 'Código',
    } satisfies Record<ScriptLinguagem, string>,
    copy: 'Copiar código',
    copied: 'Copiado',
    openFile: 'Abrir arquivo',
  },
  publications: {
    eyebrow: (n: number) => `${n} ${plural(n, 'item', 'itens')}`,
    title: 'Publicações',
    type: {
      artigo: 'Artigo',
      preprint: 'Preprint',
      capítulo: 'Capítulo',
      livro: 'Livro',
      anais: 'Anais',
      tese: 'Tese',
      outro: 'Outro',
    } satisfies Record<PublicacaoTipo, string>,
    doi: 'DOI',
    arxiv: 'arXiv',
    pdf: 'PDF',
  },
  notFound: {
    eyebrow: 'Erro 404',
    title: 'Página não encontrada',
    body: 'O endereço pode ter mudado de semestre. Materiais de disciplinas anteriores continuam na página de Ensino.',
    allPages: 'Todas as páginas',
  },
};

/** Tipo do dicionário `pt`, reaproveitado pelo `en` da fase 4. */
export type UiStrings = typeof pt;
