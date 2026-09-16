import { describe, expect, it } from 'vitest';
import { padCount, toParagraphs } from '../../src/lib/text';

describe('toParagraphs', () => {
  it('devolve array vazio para undefined', () => {
    expect(toParagraphs(undefined)).toEqual([]);
  });

  it('devolve array vazio para string só de espaço', () => {
    expect(toParagraphs('  ')).toEqual([]);
  });

  it('devolve um parágrafo para uma linha só', () => {
    expect(toParagraphs('uma linha')).toEqual(['uma linha']);
  });

  it('divide em duas linhas em branco simples', () => {
    expect(toParagraphs('a\n\nb')).toEqual(['a', 'b']);
  });

  it('divide em linha em branco com espaços e linha extra', () => {
    expect(toParagraphs('a\n  \n\n b')).toEqual(['a', 'b']);
  });

  it('normaliza \\r\\n antes de dividir', () => {
    expect(toParagraphs('a\r\n\r\nb')).toEqual(['a', 'b']);
  });

  it('não transforma quebra de linha simples', () => {
    expect(toParagraphs('a\nb')).toEqual(['a\nb']);
  });

  it('não escapa nem interpreta HTML', () => {
    expect(toParagraphs('<b>x</b>')).toEqual(['<b>x</b>']);
  });

  it('texto real de ementa vira um único parágrafo', () => {
    const ementa =
      'Variedades e tensores; conexão e curvatura; equações de campo de Einstein; soluções de Schwarzschild e Kerr; ondas gravitacionais no regime linear.';
    expect(toParagraphs(ementa)).toEqual([ementa]);
  });
});

describe('padCount', () => {
  it('formata 0 com dois dígitos', () => {
    expect(padCount(0)).toBe('00');
  });

  it('formata 7 com dois dígitos', () => {
    expect(padCount(7)).toBe('07');
  });

  it('formata 12 com dois dígitos', () => {
    expect(padCount(12)).toBe('12');
  });

  it('não trunca 120 (três dígitos)', () => {
    expect(padCount(120)).toBe('120');
  });
});
