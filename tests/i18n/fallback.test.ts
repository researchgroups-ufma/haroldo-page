import { describe, expect, it } from 'vitest';
import { hasFallback, localize, localizeOptional, portugueseOnly } from '../../src/i18n/fallback';
import { HTML_LANG } from '../../src/lib/routes';

/** RN-06 e RN-09: fallback por campo para o português; F-07: sinal do aviso único. */
describe('localize', () => {
  it('em rota PT devolve o português, sem lang, ignorando o inglês', () => {
    expect(localize('Olá', 'Hello', 'pt')).toEqual({ text: 'Olá', fellBack: false });
    expect(localize('Olá', undefined, 'pt')).toEqual({ text: 'Olá', fellBack: false });
  });

  it('em rota EN com inglês preenchido devolve o inglês, sem lang', () => {
    expect(localize('Olá', 'Hello', 'en')).toEqual({ text: 'Hello', fellBack: false });
  });

  it('em rota EN devolve o inglês como está, sem trim', () => {
    expect(localize('Olá', ' Hello ', 'en').text).toBe(' Hello ');
  });

  it('em rota EN com inglês ausente cai no português com lang e fellBack', () => {
    expect(localize('Olá', undefined, 'en')).toEqual({
      text: 'Olá',
      lang: 'pt-BR',
      fellBack: true,
    });
  });

  it('em rota EN com inglês vazio cai no português', () => {
    expect(localize('Olá', '', 'en')).toEqual({ text: 'Olá', lang: 'pt-BR', fellBack: true });
  });

  it('em rota EN com inglês só de espaço cai no português', () => {
    expect(localize('Olá', '   ', 'en')).toEqual({ text: 'Olá', lang: 'pt-BR', fellBack: true });
  });

  it('o lang vem de HTML_LANG.pt', () => {
    expect(localize('Olá', undefined, 'en').lang).toBe(HTML_LANG.pt);
  });
});

describe('localizeOptional', () => {
  it.each([
    [undefined, undefined],
    ['', ''],
    ['   ', '  '],
    [undefined, ''],
  ])('campo vazio (%j, %j) não deixa rastro em nenhum idioma', (ptValue, enValue) => {
    expect(localizeOptional(ptValue, enValue, 'pt')).toBeUndefined();
    expect(localizeOptional(ptValue, enValue, 'en')).toBeUndefined();
  });

  it('português vazio e inglês preenchido mostra o inglês em rota EN', () => {
    expect(localizeOptional(undefined, 'Hello', 'en')).toEqual({ text: 'Hello', fellBack: false });
    expect(localizeOptional('', 'Hello', 'en')).toEqual({ text: 'Hello', fellBack: false });
  });

  it('português vazio e inglês preenchido não mostra nada em rota PT', () => {
    expect(localizeOptional(undefined, 'Hello', 'pt')).toBeUndefined();
  });

  it('português preenchido comporta-se como localize', () => {
    expect(localizeOptional('Olá', 'Hello', 'en')).toEqual(localize('Olá', 'Hello', 'en'));
    expect(localizeOptional('Olá', undefined, 'en')).toEqual(localize('Olá', undefined, 'en'));
    expect(localizeOptional('Olá', 'Hello', 'pt')).toEqual(localize('Olá', 'Hello', 'pt'));
  });
});

describe('portugueseOnly', () => {
  it('em rota PT devolve o texto sem lang', () => {
    expect(portugueseOnly('Instituto', 'pt')).toEqual({ text: 'Instituto', fellBack: false });
  });

  it('em rota EN marca lang pt-BR sem ligar o aviso (Decisão 13)', () => {
    expect(portugueseOnly('Instituto', 'en')).toEqual({
      text: 'Instituto',
      lang: 'pt-BR',
      fellBack: false,
    });
  });
});

describe('hasFallback', () => {
  it('é true se algum item definido caiu no português', () => {
    expect(hasFallback([localize('a', 'b', 'en'), undefined, localize('c', undefined, 'en')])).toBe(
      true,
    );
  });

  it('é false quando nada caiu, com lista vazia ou só itens indefinidos', () => {
    expect(hasFallback([localize('a', 'b', 'en'), localize('a', undefined, 'pt')])).toBe(false);
    expect(hasFallback([])).toBe(false);
    expect(hasFallback([undefined])).toBe(false);
  });

  it('campo "P" em rota EN nunca liga o aviso (Decisão 13)', () => {
    expect(hasFallback([portugueseOnly('x', 'en')])).toBe(false);
  });
});
