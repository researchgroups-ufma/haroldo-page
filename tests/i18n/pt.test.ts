import { describe, expect, it } from 'vitest';
import { pt } from '../../src/i18n/pt';
import { disciplinasSchema, projetosSchema, publicacoesSchema } from '../../src/content.config';

/**
 * Percorre `obj` recursivamente e devolve todas as strings folha, ignorando
 * funções (plural/interpolação) — usado para provar que nenhuma string de
 * interface ficou vazia.
 */
function collectLeafStrings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj];
  if (typeof obj === 'function') return [];
  if (obj !== null && typeof obj === 'object') {
    return Object.values(obj).flatMap(collectLeafStrings);
  }
  return [];
}

describe('pt.site', () => {
  it('pageTitle interpola página e site', () => {
    expect(pt.site.pageTitle('Sobre', 'Haroldo Lima Junior')).toBe('Sobre — Haroldo Lima Junior');
  });
});

describe('pt.home — funções de plural', () => {
  it('countResearchLines com 0, 1 e 2', () => {
    expect(pt.home.countResearchLines(0)).toBe('linhas de pesquisa');
    expect(pt.home.countResearchLines(1)).toBe('linha de pesquisa');
    expect(pt.home.countResearchLines(2)).toBe('linhas de pesquisa');
  });

  it('countCurrentCourses com 0, 1 e 2', () => {
    expect(pt.home.countCurrentCourses(0)).toBe('disciplinas neste semestre');
    expect(pt.home.countCurrentCourses(1)).toBe('disciplina neste semestre');
    expect(pt.home.countCurrentCourses(2)).toBe('disciplinas neste semestre');
  });

  it('countPublications com 0, 1 e 2', () => {
    expect(pt.home.countPublications(0)).toBe('publicações');
    expect(pt.home.countPublications(1)).toBe('publicação');
    expect(pt.home.countPublications(2)).toBe('publicações');
  });
});

describe('pt.research', () => {
  it('summary(1, 2) monta "1 linha · 2 projetos"', () => {
    expect(pt.research.summary(1, 2)).toBe('1 linha · 2 projetos');
  });

  it('summary pluraliza cada parte independentemente', () => {
    expect(pt.research.summary(0, 0)).toBe('0 linhas · 0 projetos');
    expect(pt.research.summary(2, 1)).toBe('2 linhas · 1 projeto');
  });

  it('activeProjects com 0, 1 e 2', () => {
    expect(pt.research.activeProjects(0)).toBe('0 projetos em andamento');
    expect(pt.research.activeProjects(1)).toBe('1 projeto em andamento');
    expect(pt.research.activeProjects(2)).toBe('2 projetos em andamento');
  });
});

describe('pt.teaching — funções de plural', () => {
  it('lessons com 0, 1 e 2', () => {
    expect(pt.teaching.lessons(0)).toBe('0 aulas');
    expect(pt.teaching.lessons(1)).toBe('1 aula');
    expect(pt.teaching.lessons(2)).toBe('2 aulas');
  });

  it('problemSets com 0, 1 e 2', () => {
    expect(pt.teaching.problemSets(0)).toBe('0 listas');
    expect(pt.teaching.problemSets(1)).toBe('1 lista');
    expect(pt.teaching.problemSets(2)).toBe('2 listas');
  });

  it('scripts com 0, 1 e 2', () => {
    expect(pt.teaching.scripts(0)).toBe('0 scripts');
    expect(pt.teaching.scripts(1)).toBe('1 script');
    expect(pt.teaching.scripts(2)).toBe('2 scripts');
  });
});

describe('pt.course', () => {
  it('lessonNumber devolve "Aula N"', () => {
    expect(pt.course.lessonNumber(3)).toBe('Aula 3');
  });

  it('dueDate interpola a data', () => {
    expect(pt.course.dueDate('10/08/2026')).toBe('Entrega 10/08/2026');
  });
});

describe('pt.script', () => {
  it('eyebrow interpola a linguagem', () => {
    expect(pt.script.eyebrow('Python')).toBe('Script · Python');
  });
});

describe('pt.publications — função de plural', () => {
  it('eyebrow com 0, 1 e 2', () => {
    expect(pt.publications.eyebrow(0)).toBe('0 itens');
    expect(pt.publications.eyebrow(1)).toBe('1 item');
    expect(pt.publications.eyebrow(2)).toBe('2 itens');
  });
});

describe('pt — nenhuma string folha vazia', () => {
  it('percorre o dicionário inteiro sem achar string vazia', () => {
    const leaves = collectLeafStrings(pt);
    expect(leaves.length).toBeGreaterThan(0);
    for (const leaf of leaves) {
      expect(leaf).not.toBe('');
    }
  });
});

describe('pt — mapas de enum alinhados aos schemas Zod', () => {
  it('research.status igual, na ordem, a projetosSchema.shape.status', () => {
    const options = projetosSchema.shape.status.unwrap().options;
    expect(Object.keys(pt.research.status)).toEqual(options);
  });

  it('course.status igual, na ordem, a disciplinasSchema.shape.status', () => {
    const options = disciplinasSchema.shape.status.options;
    expect(Object.keys(pt.course.status)).toEqual(options);
  });

  it('course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo', () => {
    const options = disciplinasSchema.shape.materiais.unwrap().element.shape.tipo.options;
    expect(Object.keys(pt.course.materialType)).toEqual(options);
  });

  it('script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem', () => {
    const options = disciplinasSchema.shape.scripts.unwrap().element.shape.linguagem.options;
    expect(Object.keys(pt.script.language)).toEqual(options);
  });

  it('publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options', () => {
    const options = publicacoesSchema.shape.tipo.options;
    expect(Object.keys(pt.publications.type)).toEqual(options);
  });
});
