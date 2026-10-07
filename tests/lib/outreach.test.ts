import { describe, expect, it } from 'vitest';
import { sortPosts, toCalendarDate } from '../../src/lib/outreach';

const post = (data: string, titulo: string) => ({ data: { data, titulo } });

describe('toCalendarDate', () => {
  it('o instante que o seletor grava para 12/09 em São Luís vira 2026-09-12', () => {
    expect(toCalendarDate('2026-09-12T03:00:00.000Z')).toBe('2026-09-12');
  });

  it('usa o fuso de São Luís, não o UTC: 01:00 UTC ainda é o dia anterior', () => {
    expect(toCalendarDate('2026-09-13T01:00:00.000Z')).toBe('2026-09-12');
  });

  it('limite aceito: meia-noite escolhida num fuso a leste de UTC (23:00 UTC da véspera) vira a véspera', () => {
    expect(toCalendarDate('2026-09-11T23:00:00.000Z')).toBe('2026-09-11');
  });

  it.each(['2026-09-12', '12/09/2026', '', 'xT'])(
    'valor que não é instante ISO passa intacto (%j)',
    (value) => {
      expect(toCalendarDate(value)).toBe(value);
    },
  );

  it('aceita o Date que o YAML produz do instante gravado sem aspas pelo Tina', () => {
    expect(toCalendarDate(new Date('2026-09-15T03:00:00.000Z'))).toBe('2026-09-15');
  });

  it('valor que não é texto nem Date passa intacto', () => {
    expect(toCalendarDate(undefined)).toBeUndefined();
  });
});

describe('sortPosts', () => {
  it('da mais recente para a mais antiga', () => {
    const sorted = sortPosts([
      post('2026-07-30', 'b'),
      post('2026-09-12', 'a'),
      post('2025-12-01', 'c'),
    ]);
    expect(sorted.map((p) => p.data.data)).toEqual(['2026-09-12', '2026-07-30', '2025-12-01']);
  });

  it('no mesmo dia, ordem alfabética do título em pt-BR', () => {
    const sorted = sortPosts([post('2026-09-12', 'Óptica'), post('2026-09-12', 'Astronomia')]);
    expect(sorted.map((p) => p.data.titulo)).toEqual(['Astronomia', 'Óptica']);
  });

  it('não muta a entrada', () => {
    const input = [post('2025-01-01', 'a'), post('2026-01-01', 'b')];
    sortPosts(input);
    expect(input.map((p) => p.data.data)).toEqual(['2025-01-01', '2026-01-01']);
  });
});
