import { describe, expect, it } from 'vitest';
import { NAV_ITEMS, isActivePath } from '../../src/lib/navigation';
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
});

describe('NAV_ITEMS', () => {
  it('todo href termina em "/"', () => {
    for (const item of NAV_ITEMS) {
      expect(item.href.endsWith('/')).toBe(true);
    }
  });

  it('todo key existe em pt.nav', () => {
    for (const item of NAV_ITEMS) {
      expect(Object.keys(pt.nav)).toContain(item.key);
    }
  });
});
