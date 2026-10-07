/**
 * ============================================================================
 *  Arquivo      : en.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Dicionário único de strings de interface em inglês,
 *                 espelhando `pt.ts` chave a chave (§10.4 do PRD; sabatina
 *                 fase 4, Decisão 11: escrito pelo executor, revisado pelo
 *                 stakeholder antes do DONE). Os mapas de enum usam as mesmas
 *                 chaves em português dos schemas Zod de
 *                 `src/content.config.ts` — só o rótulo exibido muda; o valor
 *                 do conteúdo não se traduz.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-28
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.2.0
 *
 *  Dependências : src/i18n/pt.ts (só o tipo `UiStrings`)
 *  Entradas     : nenhuma
 *  Saídas       : `en` (objeto de strings e funções, tipado por `UiStrings`)
 *  Uso          : import { en } from '../i18n/en'; en.nav.home
 *
 *  Notas        : nenhuma tradução automática colada sem leitura (sabatina
 *                 fase 4, Decisão 11). `language.name` guarda o nome
 *                 acessível do idioma de destino do seletor — aqui, o
 *                 português ("Versão em português"), porque o link desta
 *                 entrada leva ao PT (sabatina fase 4, Decisão 5). Dados que
 *                 vêm do conteúdo (frontmatter) não entram aqui.
 * ============================================================================
 */
import type { UiStrings } from './pt';

/** Nomes dos meses em inglês, para `date.format` — sem `Date` nem `Intl` (ver `src/lib/date.ts`). */
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Dicionário de strings de interface em inglês, tipado por `UiStrings` para que o `astro check`
 * reprove qualquer chave faltando ou enum desalinhado do schema.
 */
export const en: UiStrings = {
  site: {
    skipToContent: 'Skip to content',
    menu: 'Menu',
    mainNavLabel: 'Main navigation',
    opensInNewTab: '(opens in new tab)',
    description:
      'Academic website of Prof. Haroldo Cilas Duarte Lima Junior, Assistant Professor of Physics at the Federal University of Maranhão (UFMA).',
    pageTitle: (page: string, site: string) => `${page} — ${site}`,
    portraitAlt: (nome: string) => `Portrait of ${nome}`,
  },
  nav: {
    home: 'Home',
    about: 'About',
    research: 'Research',
    teaching: 'Teaching',
    outreach: 'Outreach',
    publications: 'Publications',
  },
  language: {
    code: 'PT',
    name: 'Versão em português',
  },
  fallback: {
    notice: 'Some content on this page is only available in Portuguese.',
  },
  date: {
    // §8.3 do PRD: "March 15, 2026". Mês fora de 01–12 devolve aaaa-mm-dd como veio, sem inventar
    // mês (decisão 6 do fatiamento da fase 4) — o PT de hoje também não valida calendário.
    format: (year: string, month: string, day: string) => {
      const index = Number(month) - 1;
      if (!Number.isInteger(index) || index < 0 || index > 11) return `${year}-${month}-${day}`;
      return `${MONTHS[index]} ${Number(day)}, ${year}`;
    },
  },
  about: {
    title: 'Biography and education',
    education: 'Education',
    experience: 'Professional experience',
    areas: 'Research interests',
    contact: 'Contact',
    links: {
      lattes: 'Lattes CV',
      orcid: 'ORCID',
      scholar: 'Google Scholar',
      arxiv: 'arXiv',
      researchgate: 'ResearchGate',
      github: 'GitHub',
      institucional: 'Institutional page',
      cv: 'CV (PDF)',
    },
  },
  research: {
    title: 'Research areas and projects',
    otherProjects: 'Other projects',
    projects: 'Projects',
    publications: 'Publications',
    line: (numero: string) => `Line ${numero}`,
    status: {
      'em andamento': 'In progress',
      concluído: 'Completed',
    },
  },
  teaching: {
    title: 'Courses',
    current: 'Ongoing',
    previous: 'Past courses',
    empty: 'No courses yet.',
    latestLesson: 'Latest lecture',
  },
  outreach: {
    title: 'Outreach',
    empty: 'No posts yet.',
    back: 'All posts',
    photos: 'Photos',
    previousPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    photoLabel: (n: number, alt: string) => `Photo ${n}: ${alt}`,
  },
  course: {
    back: 'All courses',
    status: {
      atual: 'Ongoing',
      anterior: 'Past',
    },
    tabsLabel: 'Course sections',
    syllabus: 'Syllabus',
    lessons: 'Lectures',
    courseScripts: 'Scripts',
    lessonScript: 'Script',
    problemSets: 'Problem sheets',
    materials: 'Additional materials',
    bibliography: 'Bibliography',
    links: 'Links',
    noLessons: 'No lectures published yet.',
    lessonNumber: (n: number) => `Lecture ${n}`,
    access: 'Open',
    dueDate: (d: string) => `Due ${d}`,
    materialType: {
      slides: 'Slides',
      notas: 'Notes',
      complementar: 'Supplementary',
    },
  },
  script: {
    eyebrow: (lang: string) => `Script · ${lang}`,
    language: {
      python: 'Python',
      r: 'R',
      matlab: 'MATLAB',
      bash: 'Bash',
      outro: 'Code',
    },
    copy: 'Copy code',
    copied: 'Copied',
    openFile: 'Open file',
  },
  publications: {
    title: 'Publications',
    type: {
      artigo: 'Article',
      preprint: 'Preprint',
      capítulo: 'Chapter',
      livro: 'Book',
      anais: 'Proceedings',
      tese: 'Thesis',
      outro: 'Other',
    },
    doi: 'DOI',
    arxiv: 'arXiv',
    pdf: 'PDF',
  },
  notFound: {
    eyebrow: 'Error 404',
    title: 'Page not found',
    body: 'The address may have changed with the semester. Materials from previous courses remain on the Teaching page.',
    allPages: 'All pages',
  },
};
