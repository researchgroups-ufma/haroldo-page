import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import {
  arxivUrl,
  compareWithinYear,
  doiUrl,
  groupByYear,
  isProfessorAuthor,
} from '../../src/lib/publications';

describe('groupByYear', () => {
  it('agrupa anos distintos em ordem decrescente (RF-25)', () => {
    const entries = [
      { data: { ano: 2024, titulo: 'A' } },
      { data: { ano: 2026, titulo: 'B' } },
      { data: { ano: 2024, titulo: 'C' } },
    ];
    expect(groupByYear(entries).map((g) => g.year)).toEqual([2026, 2024]);
  });

  it('ordena os itens do mesmo ano por compareWithinYear', () => {
    const entries = [
      { data: { ano: 2025, titulo: 'Zebra' } },
      { data: { ano: 2025, titulo: 'Abelha' } },
    ];
    const [group] = groupByYear(entries);
    expect(group.items.map((e) => e.data.titulo)).toEqual(['Abelha', 'Zebra']);
  });

  it('não muta o array de entrada', () => {
    const entries = [
      { data: { ano: 2025, titulo: 'Zebra' } },
      { data: { ano: 2025, titulo: 'Abelha' } },
    ];
    const original = [...entries];
    groupByYear(entries);
    expect(entries).toEqual(original);
  });

  it('lista vazia devolve lista vazia', () => {
    expect(groupByYear([])).toEqual([]);
  });
});

describe('compareWithinYear', () => {
  it('RN-02 provisória: título alfabético pt-BR dentro do ano', () => {
    // Par que discrimina `localeCompare('pt-BR')` de comparação código a código: em pt-BR "Ó"
    // colaciona perto de "O" (antes de "z"), então "Óptica" < "Ozônio" — confirmado com
    // `node -e "console.log(['Ozônio','Óptica'].sort((a,b)=>a.localeCompare(b,'pt-BR')))"`, que
    // devolve `[ 'Óptica', 'Ozônio' ]`. Por código de caractere (`sort()` sem comparador,
    // `U+004F` < `U+00D3`), a ordem seria a inversa: `[ 'Ozônio', 'Óptica' ]` — confirmado com
    // `node -e "console.log(['Ozônio','Óptica'].sort())"`.
    const entries = [
      { data: { ano: 2025, titulo: 'Ozônio' } },
      { data: { ano: 2025, titulo: 'Óptica' } },
    ];
    expect([...entries].sort(compareWithinYear).map((e) => e.data.titulo)).toEqual([
      'Óptica',
      'Ozônio',
    ]);
  });

  it('destaque não altera a ordem (§6.6: só visual)', () => {
    // `destaque` fica dentro de `data`, como no schema (`publicacoesSchema`,
    // `src/content.config.ts:419`). O item com `destaque: true` ("Zebra") vem DEPOIS na ordem
    // alfabética; se `compareWithinYear` desse prioridade a `destaque`, "Zebra" apareceria
    // primeiro, invertendo o resultado abaixo.
    const entries = [
      { data: { ano: 2025, titulo: 'Zebra', destaque: true } },
      { data: { ano: 2025, titulo: 'Abelha' } },
    ];
    expect([...entries].sort(compareWithinYear).map((e) => e.data.titulo)).toEqual([
      'Abelha',
      'Zebra',
    ]);
  });
});

describe('isProfessorAuthor', () => {
  const citationName = 'LIMA JUNIOR, HAROLDO C. D.';

  it('casa o nome exato', () => {
    expect(isProfessorAuthor('LIMA JUNIOR, HAROLDO C. D.', citationName)).toBe(true);
  });

  it('casa com espaços extras', () => {
    expect(isProfessorAuthor('LIMA  JUNIOR,   HAROLDO C. D.', citationName)).toBe(true);
  });

  it('casa só com espaço nas pontas (trim)', () => {
    expect(isProfessorAuthor('  LIMA JUNIOR, HAROLDO C. D. ', citationName)).toBe(true);
  });

  it('casa em minúsculas', () => {
    expect(isProfessorAuthor('lima junior, haroldo c. d.', citationName)).toBe(true);
  });

  it('casa com acento diferente (JÚNIOR com acento agudo, sem normalize)', () => {
    expect(isProfessorAuthor('LIMA JÚNIOR, HAROLDO C. D.', citationName)).toBe(true);
  });

  it("não casa 'LIMA, J.' (sem casamento parcial)", () => {
    expect(isProfessorAuthor('LIMA, J.', citationName)).toBe(false);
  });

  it("não casa 'LIMA JUNIOR, HAROLDO C. D., et al.' (sem casamento parcial)", () => {
    expect(isProfessorAuthor('LIMA JUNIOR, HAROLDO C. D., et al.', citationName)).toBe(false);
  });
});

describe('doiUrl', () => {
  const expected = 'https://doi.org/10.0000/exemplo.2025.001';

  it.each([
    ['10.0000/exemplo.2025.001', expected],
    ['https://doi.org/10.0000/exemplo.2025.001', expected],
    ['http://dx.doi.org/10.0000/exemplo.2025.001', expected],
    ['https://dx.doi.org/10.0000/exemplo.2025.001', expected],
    ['doi:10.0000/exemplo.2025.001', expected],
    ['DOI:10.0000/exemplo.2025.001', expected],
    ['  10.0000/exemplo.2025.001  ', expected],
  ])('%s → %s', (input, output) => {
    expect(doiUrl(input)).toBe(output);
  });
});

describe('arxivUrl', () => {
  const expected = 'https://arxiv.org/abs/2401.01234';

  it.each([
    ['2401.01234', expected],
    ['arXiv:2401.01234', expected],
    ['https://arxiv.org/abs/2401.01234', expected],
    ['http://arxiv.org/abs/2401.01234', expected],
    ['  2401.01234  ', expected],
  ])('%s → %s', (input, output) => {
    expect(arxivUrl(input)).toBe(output);
  });
});

describe('groupByYear — invariante com conteúdo real de content/publicacoes', () => {
  // Fixtures reais, não sintéticas (decisão 6 do README da fase): a contagem exata não é
  // afirmada (mudaria com o primeiro save do professor), só a invariante.
  const publicacoesDir = join(__dirname, '../../content/publicacoes');

  it('a soma dos itens de todos os grupos é igual ao total de entradas, e os anos saem estritamente decrescentes', () => {
    const arquivos = readdirSync(publicacoesDir).filter((nome) => nome.endsWith('.md'));
    expect(arquivos.length).toBeGreaterThan(0);

    const entries = arquivos.map((nome) => {
      const { data } = matter(readFileSync(join(publicacoesDir, nome), 'utf-8'));
      return { data: { ano: data.ano as number, titulo: data.titulo as string } };
    });

    const grupos = groupByYear(entries);
    const total = grupos.reduce((soma, grupo) => soma + grupo.items.length, 0);
    expect(total).toBe(entries.length);

    for (let i = 1; i < grupos.length; i++) {
      expect(grupos[i].year).toBeLessThan(grupos[i - 1].year);
    }
  });
});
