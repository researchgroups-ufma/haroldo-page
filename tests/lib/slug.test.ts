import { describe, expect, it } from 'vitest';
import { slugify } from '../../src/lib/slug';

describe('slugify', () => {
  it('remove acentuação e minusculiza', () => {
    expect(slugify('Mecânica Clássica')).toBe('mecanica-classica');
  });

  it('mantém texto em inglês sem acento inalterado, em minúsculas', () => {
    expect(slugify('Tidal Forces in Kerr Spacetime')).toBe('tidal-forces-in-kerr-spacetime');
  });

  it('remove acentos de vogais com til e minusculiza', () => {
    expect(slugify('Sombras de buracos negros')).toBe('sombras-de-buracos-negros');
  });

  it('colapsa espaços e hífens repetidos em um único hífen', () => {
    expect(slugify('Relatividade   Geral -- e teorias alternativas')).toBe(
      'relatividade-geral-e-teorias-alternativas',
    );
  });

  it('remove espaços nas pontas e acento único', () => {
    expect(slugify('  Física  ')).toBe('fisica');
  });

  it('devolve string vazia para entrada vazia', () => {
    expect(slugify('')).toBe('');
  });

  it('devolve string vazia para entrada só de símbolos', () => {
    expect(slugify('---')).toBe('');
  });
});
