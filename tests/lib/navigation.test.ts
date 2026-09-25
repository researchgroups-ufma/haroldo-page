import { describe, expect, it } from 'vitest';
import { isActivePath, navItems } from '../../src/lib/navigation';
import { pt } from '../../src/i18n/pt';

describe('isActivePath', () => {
  it('"/" ativo só em "/"', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/', '/sobre/')).toBe(false);
  });

  it('"/sobre/" ativo em "/sobre" e "/sobre/"', () => {
    expect(isActivePath('/sobre/', '/sobre')).toBe(true);
    expect(isActivePath('/sobre/', '/sobre/')).toBe(true);
  });

  it('"/ensino/" ativo em "/ensino/2026-2-relatividade-geral/"', () => {
    expect(isActivePath('/ensino/', '/ensino/2026-2-relatividade-geral/')).toBe(true);
  });

  it('"/ensino/" inativo em "/ensinox/"', () => {
    expect(isActivePath('/ensino/', '/ensinox/')).toBe(false);
  });

  it('"/ensino" (sem barra) ativo em "/ensino/algo/"', () => {
    expect(isActivePath('/ensino', '/ensino/algo/')).toBe(true);
  });

  it('"/ensino" (sem barra) inativo em "/ensinox/" (sem falso positivo de prefixo)', () => {
    expect(isActivePath('/ensino', '/ensinox/')).toBe(false);
  });

  it('"/en/" (Home EN) inativo em "/en/about/"', () => {
    expect(isActivePath('/en/', '/en/about/')).toBe(false);
  });

  it('"/en/" ativo em "/en/" e "/en"', () => {
    expect(isActivePath('/en/', '/en/')).toBe(true);
    expect(isActivePath('/en/', '/en')).toBe(true);
  });

  it('"/en/teaching/" ativo em "/en/teaching/2026-2-relatividade-geral/"', () => {
    expect(isActivePath('/en/teaching/', '/en/teaching/2026-2-relatividade-geral/')).toBe(true);
  });
});

describe('navItems', () => {
  it('pt: as cinco rotas na ordem do menu, com os caminhos PT', () => {
    expect(navItems('pt')).toEqual([
      { key: 'home', href: '/' },
      { key: 'about', href: '/sobre/' },
      { key: 'research', href: '/pesquisa/' },
      { key: 'teaching', href: '/ensino/' },
      { key: 'publications', href: '/publicacoes/' },
    ]);
  });

  it('en: mesma ordem, com os caminhos EN', () => {
    expect(navItems('en').map((item) => item.href)).toEqual([
      '/en/',
      '/en/about/',
      '/en/research/',
      '/en/teaching/',
      '/en/publications/',
    ]);
  });

  it.each(['pt', 'en'] as const)('%s: todo href termina em "/"', (locale) => {
    for (const item of navItems(locale)) {
      expect(item.href.endsWith('/')).toBe(true);
    }
  });

  it('todo key existe em pt.nav', () => {
    for (const item of navItems('pt')) {
      expect(Object.keys(pt.nav)).toContain(item.key);
    }
  });
});
