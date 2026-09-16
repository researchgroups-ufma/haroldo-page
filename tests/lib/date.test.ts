import { afterEach, describe, expect, it } from 'vitest';
import { formatDate } from '../../src/lib/date';

describe('formatDate', () => {
  it('formata aaaa-mm-dd como dd/mm/aaaa', () => {
    expect(formatDate('2026-08-10')).toBe('10/08/2026');
  });

  it('remove espaço nas pontas antes de formatar', () => {
    expect(formatDate(' 2026-08-10 ')).toBe('10/08/2026');
  });

  it('devolve texto livre sem alteração', () => {
    expect(formatDate('10/08')).toBe('10/08');
  });

  it('não formata ano ou mês com um dígito', () => {
    expect(formatDate('2026-8-10')).toBe('2026-8-10');
  });

  it('não formata data com hora', () => {
    expect(formatDate('2026-08-10T10:00')).toBe('2026-08-10T10:00');
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
      expect(formatDate('2026-08-10')).toBe('10/08/2026');
    });
  });
});
