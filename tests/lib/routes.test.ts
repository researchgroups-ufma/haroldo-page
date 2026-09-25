import { describe, expect, it } from 'vitest';
import {
  HTML_LANG,
  coursePath,
  counterpartPath,
  localeFromPath,
  routePath,
  type RouteKey,
} from '../../src/lib/routes';

const MAP: [RouteKey, string, string][] = [
  ['home', '/', '/en/'],
  ['about', '/sobre/', '/en/about/'],
  ['research', '/pesquisa/', '/en/research/'],
  ['teaching', '/ensino/', '/en/teaching/'],
  ['publications', '/publicacoes/', '/en/publications/'],
];

describe('HTML_LANG', () => {
  it('pt → "pt-BR", en → "en"', () => {
    expect(HTML_LANG).toEqual({ pt: 'pt-BR', en: 'en' });
  });
});

describe('routePath', () => {
  it.each(MAP)('%s → %s (pt) e %s (en)', (key, ptPath, enPath) => {
    expect(routePath(key, 'pt')).toBe(ptPath);
    expect(routePath(key, 'en')).toBe(enPath);
  });
});

describe('coursePath', () => {
  it('mesmo slug nos dois idiomas (sabatina fase 4, Decisão 3)', () => {
    expect(coursePath('2026-2-relatividade-geral', 'pt')).toBe(
      '/ensino/2026-2-relatividade-geral/',
    );
    expect(coursePath('2026-2-relatividade-geral', 'en')).toBe(
      '/en/teaching/2026-2-relatividade-geral/',
    );
  });
});

describe('localeFromPath', () => {
  it.each(['/en', '/en/', '/en/about/', '/en/teaching/2026-2-relatividade-geral/'])(
    '%s → en',
    (path) => {
      expect(localeFromPath(path)).toBe('en');
    },
  );

  it.each(['/', '/sobre', '/enx/', '/ensino/', '/ensino/2026-2-relatividade-geral/'])(
    '%s → pt (prefixo só conta como segmento inteiro)',
    (path) => {
      expect(localeFromPath(path)).toBe('pt');
    },
  );
});

describe('counterpartPath', () => {
  it.each(MAP)('%s: %s ↔ %s', (_key, ptPath, enPath) => {
    expect(counterpartPath(ptPath)).toBe(enPath);
    expect(counterpartPath(enPath)).toBe(ptPath);
  });

  it.each([
    ['/sobre', '/en/about/'],
    ['/en/about', '/sobre/'],
    ['/en', '/'],
    ['/ensino', '/en/teaching/'],
  ])('sem barra final: %s → %s', (from, to) => {
    expect(counterpartPath(from)).toBe(to);
  });

  it('disciplina: o slug passa intacto, com ou sem barra', () => {
    expect(counterpartPath('/ensino/2026-2-relatividade-geral/')).toBe(
      '/en/teaching/2026-2-relatividade-geral/',
    );
    expect(counterpartPath('/ensino/2026-2-relatividade-geral')).toBe(
      '/en/teaching/2026-2-relatividade-geral/',
    );
    expect(counterpartPath('/en/teaching/2025-1-mecanica-classica/')).toBe(
      '/ensino/2025-1-mecanica-classica/',
    );
  });

  it.each(['/404', '/404/', '/404.html'])('404 PT (%s) → Home EN', (path) => {
    expect(counterpartPath(path)).toBe('/en/');
  });

  it.each(['/en/404', '/en/404/', '/en/404.html'])('404 EN (%s) → Home PT', (path) => {
    expect(counterpartPath(path)).toBe('/');
  });

  it.each(['/cv/', '/en/cv/', '/ensino/a/b/', '/enx/', '/sobre.html'])(
    'caminho sem par (%s) lança nomeando o caminho',
    (path) => {
      expect(() => counterpartPath(path)).toThrow(path);
    },
  );
});
