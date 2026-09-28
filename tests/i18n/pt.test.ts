import { describe, expect, it } from 'vitest';
import { pt } from '../../src/i18n/pt';
import { disciplinasSchema, projetosSchema, publicacoesSchema } from '../../src/content.config';
import { siteConfig } from '../../src/lib/config';

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

describe('pt.site.portraitAlt', () => {
  it('monta o texto alternativo do retrato', () => {
    expect(pt.site.portraitAlt('Haroldo Lima')).toBe('Retrato de Haroldo Lima');
  });
});

describe('pt — chaves novas da fase 4 (decisão 4 do fatiamento da fase 4)', () => {
  it('site.description é, byte a byte, o valor de siteConfig.description', () => {
    expect(pt.site.description).toBe(siteConfig.description);
  });

  it('language.code e language.name apontam para o idioma de destino (EN)', () => {
    expect(pt.language.code).toBe('EN');
    expect(pt.language.name).toBe('English version');
  });

  it('fallback.notice tem o texto do aviso de idioma (F-07)', () => {
    expect(pt.fallback.notice).toBe(
      'Parte do conteúdo desta página só está disponível em português.',
    );
  });

  it('date.format monta dd/mm/aaaa sem validar o mês (§8.3; decisão 6 do fatiamento da fase 4)', () => {
    expect(pt.date.format('2026', '03', '15')).toBe('15/03/2026');
    expect(pt.date.format('2026', '13', '15')).toBe('15/13/2026');
  });

  it('about.eyebrow saiu do dicionário (dívida (d) da fase 3)', () => {
    expect('eyebrow' in pt.about).toBe(false);
  });
});
