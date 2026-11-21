/**
 * ============================================================================
 *  Arquivo      : course-items.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Testes de `blankToUndefined` e `prepareCourseItems`
 *                 (`src/lib/course-items.ts`): item vazio descartado, item pela metade
 *                 e link que não é endereço recusados (F-09), link opcional em branco
 *                 sem a chave (RF-07, RF-24), e paridade do veredito de endereço com
 *                 `z.url()` do schema da aula.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-11-21
 *  Atualizado em: 2026-11-21
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, src/lib/course-items.ts, src/content.config.ts (só aqui)
 *  Entradas     : objetos sintéticos
 *  Saídas       : nenhuma — só asserções
 *  Uso          : `npm test -- tests/lib/course-items.test.ts`
 * ============================================================================
 */
import { describe, expect, it } from 'vitest';
import { blankToUndefined, prepareCourseItems } from '../../src/lib/course-items';
import { disciplinasSchema } from '../../src/content.config';

const URL_OK = 'https://x.test/a';

/** Veredito do Zod (o portão do build) sobre a `url` de uma aula dentro de uma disciplina. */
function zodAceita(url: string): boolean {
  return disciplinasSchema.safeParse({
    nome: 'D',
    status: 'atual',
    publicado: true,
    aulas: [{ numero: 1, titulo: 'T', url }],
  }).success;
}

describe('blankToUndefined (RF-24)', () => {
  it.each(['', ' ', '  ', '\t\n'])('texto só de espaço (%j) vira undefined', (v) => {
    expect(blankToUndefined(v)).toBeUndefined();
  });

  it('devolve o valor intacto nos outros casos', () => {
    expect(blankToUndefined(URL_OK)).toBe(URL_OK);
    expect(blankToUndefined('AAAA')).toBe('AAAA');
    expect(blankToUndefined(0)).toBe(0);
    expect(blankToUndefined(undefined)).toBeUndefined();
  });
});

describe('prepareCourseItems — item vazio sai em silêncio (F-09)', () => {
  const vazios: [string, Record<string, unknown>][] = [
    ['aulas', {}],
    ['listas', { titulo: '', url: ' ' }],
    ['bibliografia', { referencia: '  ' }],
    ['materiais', { titulo: '', tipo: null, url: undefined }],
    ['links', { titulo: '', url: '' }],
    ['scripts', { linguagem: 'python' }], // `defaultItem` já preenche a linguagem
    ['aulas', { numero: Number.NaN }],
  ];

  it.each(vazios)('%s: %j é descartado sem problema', (lista, item) => {
    const { values, problems } = prepareCourseItems({ [lista]: [item] });
    expect(values[lista]).toEqual([]);
    expect(problems).toEqual([]);
  });

  it('mantém os itens completos e só tira os vazios', () => {
    const aula = { numero: 1, titulo: 'Introdução', url: URL_OK };
    const { values, problems } = prepareCourseItems({
      nome: 'X',
      aulas: [aula, {}, { ...aula, numero: 2 }],
    });
    expect(values).toEqual({ nome: 'X', aulas: [aula, { ...aula, numero: 2 }] });
    expect(problems).toEqual([]);
  });

  it('número zero conta como preenchido', () => {
    const { values, problems } = prepareCourseItems({ aulas: [{ numero: 0, titulo: 'Zero' }] });
    expect(values.aulas).toEqual([{ numero: 0, titulo: 'Zero' }]);
    expect(problems).toEqual([]);
  });
});

describe('prepareCourseItems — item pela metade recusa com a mensagem exata (F-09)', () => {
  const metades: [string, Record<string, unknown>, string][] = [
    ['aulas', { titulo: 'Sem número' }, 'Aulas, item 1: falta Número.'],
    ['aulas', { url: URL_OK }, 'Aulas, item 1: falta Número, Título.'],
    ['listas', { url: URL_OK }, 'Listas de exercícios, item 1: falta Título.'],
    ['bibliografia', { url: URL_OK }, 'Bibliografia, item 1: falta Referência.'],
    ['scripts', { titulo: 'S', linguagem: 'python' }, 'Scripts, item 1: falta Código.'],
    ['scripts', { codigo: 'x', linguagem: 'python' }, 'Scripts, item 1: falta Título.'],
    ['materiais', { titulo: 'M', tipo: 'slides' }, 'Materiais complementares, item 1: falta Link.'],
    ['materiais', { url: URL_OK }, 'Materiais complementares, item 1: falta Título, Tipo.'],
    ['links', { titulo: 'L' }, 'Links externos, item 1: falta Link.'],
    ['links', { url: URL_OK }, 'Links externos, item 1: falta Título.'],
  ];

  it.each(metades)('%s: %j', (lista, item, mensagem) => {
    const { problems } = prepareCourseItems({ [lista]: [item] });
    expect(problems).toEqual([mensagem]);
  });

  it('a posição conta os itens vazios que saíram, a partir de 1', () => {
    const { problems } = prepareCourseItems({
      aulas: [{ numero: 1, titulo: 'A' }, {}, { titulo: 'Sem número' }],
    });
    expect(problems).toEqual(['Aulas, item 3: falta Número.']);
  });
});

describe('prepareCourseItems — link', () => {
  it.each(['aulas', 'listas', 'bibliografia'])(
    '%s: link opcional em branco perde a chave (RF-24)',
    (lista) => {
      const base =
        lista === 'aulas'
          ? { numero: 1, titulo: 'T' }
          : lista === 'listas'
            ? { titulo: 'T' }
            : { referencia: 'R' };
      for (const url of ['', ' ', '  ']) {
        const { values, problems } = prepareCourseItems({ [lista]: [{ ...base, url }] });
        expect(values[lista]).toStrictEqual([base]);
        expect('url' in (values[lista] as object[])[0]).toBe(false);
        expect(problems).toEqual([]);
      }
    },
  );

  it('scripts: link opcional em branco perde a chave', () => {
    const script = { titulo: 'S', linguagem: 'python', codigo: 'x = 1' };
    const { values, problems } = prepareCourseItems({ scripts: [{ ...script, url: ' ' }] });
    expect(values.scripts).toStrictEqual([script]);
    expect('url' in (values.scripts as object[])[0]).toBe(false);
    expect(problems).toEqual([]);
  });

  it('link que não é endereço recusa com a mensagem exata, nas seis listas', () => {
    const itens: [string, Record<string, unknown>, string][] = [
      ['aulas', { numero: 1, titulo: 'T' }, 'Aulas'],
      ['listas', { titulo: 'T' }, 'Listas de exercícios'],
      ['bibliografia', { referencia: 'R' }, 'Bibliografia'],
      ['scripts', { titulo: 'S', linguagem: 'python', codigo: 'x' }, 'Scripts'],
      ['materiais', { titulo: 'M', tipo: 'slides' }, 'Materiais complementares'],
      ['links', { titulo: 'L' }, 'Links externos'],
    ];
    for (const [lista, base, rotulo] of itens) {
      const { problems } = prepareCourseItems({ [lista]: [{ ...base, url: 'AAAA' }] });
      expect(problems).toEqual([
        `${rotulo}, item 1: o link "AAAA" não é um endereço — comece com https://.`,
      ]);
    }
  });

  it('link obrigatório em branco em material e link externo não perde a chave e recusa', () => {
    const { values, problems } = prepareCourseItems({
      links: [{ titulo: 'L', url: ' ' }],
    });
    expect(problems).toEqual(['Links externos, item 1: falta Link.']);
    expect(values.links).toEqual([{ titulo: 'L', url: ' ' }]);
  });
});

describe('prepareCourseItems — entrada atípica', () => {
  it('lista ausente não quebra nem ganha chave', () => {
    const { values, problems } = prepareCourseItems({ nome: 'X' });
    expect(values).toEqual({ nome: 'X' });
    expect(problems).toEqual([]);
  });

  it('lista que não é array e item nulo não quebram', () => {
    const { values, problems } = prepareCourseItems({ aulas: 'x', listas: [null] });
    expect(values.aulas).toBe('x');
    expect(values.listas).toEqual([]);
    expect(problems).toEqual([]);
  });

  it('não muda o objeto de entrada', () => {
    const entrada = { aulas: [{ numero: 1, titulo: 'A', url: ' ' }, {}] };
    const copia = structuredClone(entrada);
    prepareCourseItems(entrada);
    expect(entrada).toEqual(copia);
  });
});

describe('paridade do veredito de endereço com z.url() (decisão do plano 086)', () => {
  const amostras = ['AAAA', 'https://x.test/a', 'http://x', 'ftp://h/a', 'x y', 'https://'];

  it.each(amostras)('%j: prepareCourseItems e o schema da aula concordam', (url) => {
    const { problems } = prepareCourseItems({ aulas: [{ numero: 1, titulo: 'T', url }] });
    const zod = zodAceita(url);
    expect(problems.length === 0).toBe(zod);
  });

  it('a tabela tem os dois veredictos (não é vazia nem unânime)', () => {
    const vereditos = amostras.map((url) => zodAceita(url));
    expect(vereditos).toContain(true);
    expect(vereditos).toContain(false);
  });
});
