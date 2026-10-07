import { describe, expect, it } from 'vitest';
import { pt } from '../../src/i18n/pt';
import { en } from '../../src/i18n/en';
import { strings } from '../../src/i18n/index';
import { disciplinasSchema, projetosSchema, publicacoesSchema } from '../../src/content.config';
import { M07_EXCEPTIONS } from './excecoes-m07';

/**
 * Percorre `obj` recursivamente e devolve todas as strings folha, ignorando funções — usado para
 * provar que nenhuma string de interface ficou vazia (mesmo padrão de `tests/i18n/pt.test.ts`).
 */
function collectLeafStrings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj];
  if (typeof obj === 'function') return [];
  if (obj !== null && typeof obj === 'object') {
    return Object.values(obj).flatMap(collectLeafStrings);
  }
  return [];
}

/**
 * Argumentos de amostra por caminho de função do `UiStrings`, usados no teste de valor copiado
 * (sabatina fase 4, Decisão 12). **O mesmo argumento vale para `pt` e para `en`**: só assim uma
 * função `en` copiada por engano da `pt` (fixo intacto, sem tradução) produz o mesmo resultado da
 * `pt` e é pega pelo teste — amostras diferentes por idioma mascarariam a cópia (`course.dueDate`
 * copiado de `pt` passaria despercebido com amostras diferentes, porque o argumento já traria a
 * diferença).
 */
const FUNCTION_SAMPLES: Record<string, unknown[]> = {
  'site.pageTitle': ['Sobre', 'Haroldo Lima Junior'],
  'site.portraitAlt': ['Haroldo Lima'],
  'course.lessonNumber': [3],
  'course.dueDate': ['15/08/2026'],
  'script.eyebrow': ['Python'],
  'outreach.photoLabel': [2, 'Lentes de água'],
  'research.line': ['01'],
  'date.format': ['2026', '03', '15'],
};

/**
 * Percorre `pt` e `en` lado a lado e chama `onPair` com o caminho de chave (notação de ponto) e o
 * valor avaliado de cada idioma — folha string direto, folha função pelos argumentos de amostra de
 * `FUNCTION_SAMPLES`.
 */
function walkPairs(
  ptNode: unknown,
  enNode: unknown,
  path: string[],
  onPair: (path: string, ptValue: string, enValue: string) => void,
): void {
  if (typeof ptNode === 'string') {
    onPair(path.join('.'), ptNode, enNode as string);
    return;
  }
  if (typeof ptNode === 'function') {
    const key = path.join('.');
    const sample = FUNCTION_SAMPLES[key];
    if (!sample) throw new Error(`sem argumento de amostra para a função "${key}"`);
    const ptFn = ptNode as (...args: unknown[]) => string;
    const enFn = enNode as (...args: unknown[]) => string;
    onPair(key, ptFn(...sample), enFn(...sample));
    return;
  }
  if (ptNode !== null && typeof ptNode === 'object') {
    for (const key of Object.keys(ptNode)) {
      walkPairs(
        (ptNode as Record<string, unknown>)[key],
        (enNode as Record<string, unknown>)[key],
        [...path, key],
        onPair,
      );
    }
  }
}

describe('en — nenhuma string folha vazia', () => {
  it('percorre o dicionário inteiro sem achar string vazia', () => {
    const leaves = collectLeafStrings(en);
    expect(leaves.length).toBeGreaterThan(0);
    for (const leaf of leaves) {
      expect(leaf).not.toBe('');
    }
  });
});

describe('en — mapas de enum alinhados aos schemas Zod', () => {
  it('research.status igual, na ordem, a projetosSchema.shape.status', () => {
    const options = projetosSchema.shape.status.unwrap().options;
    expect(Object.keys(en.research.status)).toEqual(options);
  });

  it('course.status igual, na ordem, a disciplinasSchema.shape.status', () => {
    const options = disciplinasSchema.shape.status.options;
    expect(Object.keys(en.course.status)).toEqual(options);
  });

  it('course.materialType igual, na ordem, a disciplinasSchema.materiais[].tipo', () => {
    const options = disciplinasSchema.shape.materiais.unwrap().element.shape.tipo.options;
    expect(Object.keys(en.course.materialType)).toEqual(options);
  });

  it('script.language igual, na ordem, a disciplinasSchema.scripts[].linguagem', () => {
    const options = disciplinasSchema.shape.scripts.unwrap().element.shape.linguagem.options;
    expect(Object.keys(en.script.language)).toEqual(options);
  });

  it('publications.type igual, na ordem, a publicacoesSchema.shape.tipo.options', () => {
    const options = publicacoesSchema.shape.tipo.options;
    expect(Object.keys(en.publications.type)).toEqual(options);
  });
});

describe('strings(lang)', () => {
  it("strings('pt') devolve o mesmo objeto que pt", () => {
    expect(strings('pt')).toBe(pt);
  });

  it("strings('en') devolve o mesmo objeto que en", () => {
    expect(strings('en')).toBe(en);
  });
});

describe('en.date.format', () => {
  it("produz \"March 15, 2026\" para ('2026','03','15') (§8.3)", () => {
    expect(en.date.format('2026', '03', '15')).toBe('March 15, 2026');
  });

  it('devolve aaaa-mm-dd para mês fora de 01–12, sem inventar mês (decisão 6 do fatiamento da fase 4)', () => {
    expect(en.date.format('2026', '13', '15')).toBe('2026-13-15');
    expect(en.date.format('2026', '00', '15')).toBe('2026-00-15');
  });
});

describe('en — nenhum valor copiado do pt (sabatina fase 4, Decisão 12)', () => {
  it('todo par pt/en difere, exceto as chaves de tests/i18n/excecoes-m07.ts', () => {
    const iguais: string[] = [];
    walkPairs(pt, en, [], (path, ptValue, enValue) => {
      if (M07_EXCEPTIONS.includes(path)) return;
      if (ptValue === enValue) iguais.push(`${path}: "${ptValue}"`);
    });
    expect(iguais).toEqual([]);
  });
});

/**
 * Resolve o caminho de chave (notação de ponto) num dicionário `UiStrings`: folha string direto,
 * folha função avaliada com a amostra de `FUNCTION_SAMPLES`. Lança quando o caminho não existe —
 * uma entrada obsoleta de `excecoes-m07.ts` (chave renomeada ou removida) tem de reprovar o teste,
 * não passar em silêncio.
 */
function resolveValue(dict: unknown, path: string): string {
  const parts = path.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    if (node === null || typeof node !== 'object' || !(part in (node as Record<string, unknown>))) {
      throw new Error(`caminho "${path}" não existe no dicionário`);
    }
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node === 'function') {
    const sample = FUNCTION_SAMPLES[path];
    if (!sample) throw new Error(`sem argumento de amostra para a função "${path}"`);
    return (node as (...args: unknown[]) => string)(...sample);
  }
  if (typeof node !== 'string') {
    throw new Error(`caminho "${path}" não aponta para string nem função`);
  }
  return node;
}

describe('excecoes-m07 — lista coerente com os dicionários (reusada pelo plano 072)', () => {
  it('todo caminho de M07_EXCEPTIONS existe nos dois dicionários e tem pt === en', () => {
    for (const path of M07_EXCEPTIONS) {
      const ptValue = resolveValue(pt, path);
      const enValue = resolveValue(en, path);
      expect(enValue, `${path}: pt="${ptValue}" en="${enValue}"`).toBe(ptValue);
    }
  });
});
