/**
 * ============================================================================
 *  Arquivo      : pt.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Dicionário único de strings de interface em português das
 *                 rotas do site (§10.4 do PRD: proibido texto de interface
 *                 hardcoded em componente). Os quatro grupos de rótulo de
 *                 enum (`research.status`, `course.status`,
 *                 `course.materialType`, `script.language`) e
 *                 `publications.type` são tipados a partir dos schemas Zod de
 *                 `src/content.config.ts`, para que o `astro check` reprove
 *                 se um enum mudar sem o dicionário acompanhar.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.4.0
 *
 *  Dependências : src/content.config.ts (projetosSchema, disciplinasSchema,
 *                 publicacoesSchema — só para os tipos dos mapas de enum)
 *  Entradas     : nenhuma
 *  Saídas       : `pt` (objeto de strings e funções) e o tipo `UiStrings`
 *  Uso          : import { pt } from '../i18n/pt'; pt.nav.home
 *
 *  Notas        : a fase 4 acrescentou `src/i18n/en.ts` e `src/i18n/index.ts`
 *                 (`strings(lang)`), com o texto do `en.ts` revisado pelo
 *                 stakeholder (sabatina fase 4, Decisão 11); as chaves novas
 *                 vêm da decisão 4 do fatiamento da fase 4. `about.eyebrow`
 *                 saiu (dívida (d) da fase 3): o `<title>` das rotas fixas
 *                 usa `nav[chave]`. Dados que vêm do conteúdo (frontmatter)
 *                 não entram aqui.
 * ============================================================================
 */
import type { disciplinasSchema, projetosSchema, publicacoesSchema } from '../content.config';
import type { z } from 'astro/zod';

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
    // decisão 4 do fatiamento da fase 4: mesmo valor de `siteConfig.description`
    // (`src/lib/config.ts`), texto em português fora do dicionário até o 058 remover o campo do
    // `siteConfig`.
    description:
      'Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA.',
    pageTitle: (page: string, site: string) => `${page} — ${site}`,
    portraitAlt: (nome: string) => `Retrato de ${nome}`,
  },
  nav: {
    home: 'Início',
    about: 'Sobre',
    research: 'Pesquisa',
    teaching: 'Ensino',
    outreach: 'Extensão',
    publications: 'Publicações',
  },
  // sabatina fase 4, Decisão 5: o link do seletor mostra o idioma de destino — nas páginas PT, o
  // destino é o inglês.
  language: {
    code: 'EN',
    name: 'English version',
  },
  // F-07 / sabatina fase 4, Decisão 4: aviso único por página quando algum texto caiu no PT.
  fallback: {
    notice: 'Parte do conteúdo desta página só está disponível em português.',
  },
  // §8.3 do PRD: data no formato do locale da rota; sem `Date`/`Intl` (ver `src/lib/date.ts`).
  date: {
    format: (year: string, month: string, day: string) => `${day}/${month}/${year}`,
  },
  about: {
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
  // Sabatina "Extensão" (2026-10-07): índice e página da postagem.
  outreach: {
    title: 'Extensão',
    empty: 'Nenhuma postagem publicada ainda.',
    back: 'Voltar para Extensão',
    photos: 'Fotos',
    previousPhoto: 'Foto anterior',
    nextPhoto: 'Próxima foto',
    photoLabel: (n: number, alt: string) => `Foto ${n}: ${alt}`,
  },
  course: {
    back: 'Voltar para Ensino',
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
