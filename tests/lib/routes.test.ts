import { describe, expect, it } from 'vitest';
import {
  HTML_LANG,
  alternateLinks,
  coursePath,
  counterpartPath,
  localeFromPath,
  postPath,
  routePath,
  type RouteKey,
} from '../../src/lib/routes';

const MAP: [RouteKey, string, string][] = [
  ['home', '/', '/en/'],
  ['about', '/sobre/', '/en/about/'],
  ['research', '/pesquisa/', '/en/research/'],
  ['teaching', '/ensino/', '/en/teaching/'],
  ['outreach', '/extensao/', '/en/outreach/'],
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

describe('postPath', () => {
  it('mesmo slug nos dois idiomas, como a disciplina (sabatina "Extensão", Decisão 2)', () => {
    expect(postPath('2026-09-12-oficinas', 'pt')).toBe('/extensao/2026-09-12-oficinas/');
    expect(postPath('2026-09-12-oficinas', 'en')).toBe('/en/outreach/2026-09-12-oficinas/');
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

  it('postagem de extensão: o slug passa intacto, com ou sem barra', () => {
    expect(counterpartPath('/extensao/2026-09-12-oficinas/')).toBe(
      '/en/outreach/2026-09-12-oficinas/',
    );
    expect(counterpartPath('/extensao/2026-09-12-oficinas')).toBe(
      '/en/outreach/2026-09-12-oficinas/',
    );
    expect(counterpartPath('/en/outreach/2026-09-12-oficinas/')).toBe(
      '/extensao/2026-09-12-oficinas/',
    );
  });

  it.each(['/404', '/404/', '/404.html'])('404 PT (%s) → Home EN', (path) => {
    expect(counterpartPath(path)).toBe('/en/');
  });

  it.each(['/en/404', '/en/404/', '/en/404.html'])('404 EN (%s) → Home PT', (path) => {
    expect(counterpartPath(path)).toBe('/');
  });

  it.each(['/cv/', '/en/cv/', '/ensino/a/b/', '/extensao/a/b/', '/enx/', '/sobre.html'])(
    'caminho sem par (%s) lança nomeando o caminho',
    (path) => {
      expect(() => counterpartPath(path)).toThrow(path);
    },
  );
});

describe('alternateLinks (RF-30, RN-09)', () => {
  it.each(MAP)(
    '%s: pt-BR, en e x-default (PT) a partir de qualquer dos dois idiomas',
    (_key, ptPath, enPath) => {
      const expected = [
        { hreflang: 'pt-BR', path: ptPath },
        { hreflang: 'en', path: enPath },
        { hreflang: 'x-default', path: ptPath },
      ];
      expect(alternateLinks(ptPath)).toEqual(expected);
      expect(alternateLinks(enPath)).toEqual(expected);
    },
  );

  it('disciplina: o slug passa intacto e o x-default é o caminho PT', () => {
    const expected = [
      { hreflang: 'pt-BR', path: '/ensino/2026-2-relatividade-geral/' },
      { hreflang: 'en', path: '/en/teaching/2026-2-relatividade-geral/' },
      { hreflang: 'x-default', path: '/ensino/2026-2-relatividade-geral/' },
    ];
    expect(alternateLinks('/ensino/2026-2-relatividade-geral/')).toEqual(expected);
    expect(alternateLinks('/en/teaching/2026-2-relatividade-geral/')).toEqual(expected);
  });

  it('aceita o caminho sem barra final e devolve todos com barra final', () => {
    expect(alternateLinks('/en/about')).toEqual(alternateLinks('/sobre/'));
    expect(alternateLinks('/en')).toEqual(alternateLinks('/'));
  });

  it.each(['/cv/', '/en/cv/', '/enx/'])('caminho sem par (%s) lança nomeando o caminho', (path) => {
    expect(() => alternateLinks(path)).toThrow(path);
  });
});
