import { afterEach, describe, expect, it } from 'vitest';
import { formatDate } from '../../src/lib/date';

describe('formatDate', () => {
  it('formata aaaa-mm-dd como dd/mm/aaaa em pt', () => {
    expect(formatDate('2026-08-10', 'pt')).toBe('10/08/2026');
  });

  it('remove espaço nas pontas antes de formatar', () => {
    expect(formatDate(' 2026-08-10 ', 'pt')).toBe('10/08/2026');
  });

  it('devolve texto livre sem alteração', () => {
    expect(formatDate('10/08', 'pt')).toBe('10/08');
  });

  it('não formata ano ou mês com um dígito', () => {
    expect(formatDate('2026-8-10', 'pt')).toBe('2026-8-10');
  });

  it('não formata data com hora', () => {
    expect(formatDate('2026-08-10T10:00', 'pt')).toBe('2026-08-10T10:00');
  });

  describe('determinismo de fuso', () => {
    const originalTz = process.env.TZ;

    afterEach(() => {
      // process.env converte para string toda atribuição: `= undefined` gravaria
      // a string "undefined" em vez de restaurar a ausência da variável.
      if (originalTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTz;
      }
    });

    it('não depende do fuso da máquina de build', () => {
      process.env.TZ = 'America/Fortaleza';
      expect(formatDate('2026-08-10', 'pt')).toBe('10/08/2026');
    });
  });

  describe('locale en (§8.3 do PRD; decisão 6 do fatiamento da fase 4)', () => {
    it('formata aaaa-mm-dd como "Month D, aaaa"', () => {
      expect(formatDate('2026-08-10', 'en')).toBe('August 10, 2026');
    });

    it('não acrescenta zero à esquerda no dia', () => {
      expect(formatDate('2026-03-05', 'en')).toBe('March 5, 2026');
    });

    it('devolve texto livre sem alteração', () => {
      expect(formatDate('10/08', 'en')).toBe('10/08');
    });

    it('mês fora de 01–12 devolve o valor como digitado, sem inventar mês', () => {
      expect(formatDate('2026-13-05', 'en')).toBe('2026-13-05');
    });
  });
});
