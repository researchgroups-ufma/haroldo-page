import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/lib/config';
import { isProfessorAuthor } from '../../src/lib/publications';
import {
  PROFESSOR_CITATION_NAME,
  buildPublication,
  commitMessage,
  formatAuthor,
  formatAuthors,
  isProfessor,
  mapType,
  normalizeDoi,
  parseCrossref,
  parseOrcidWorks,
  selectNew,
  unknownDoiWarning,
  type CrossrefAuthor,
  type OrcidWork,
} from '../../src/lib/orcid';

const ORCID = '0000-0002-3702-7683';
const THIN = '\u2009'; // a Crossref separa iniciais com espaço fino

describe('PROFESSOR_CITATION_NAME', () => {
  it('é a primeira grafia de citationNames e o site a destaca', () => {
    expect(PROFESSOR_CITATION_NAME).toBe(siteConfig.author.citationNames[0]);
    expect(isProfessorAuthor(PROFESSOR_CITATION_NAME, siteConfig.author.citationNames)).toBe(true);
  });
});

describe('normalizeDoi', () => {
  it.each([
    ['10.1103/PHYSREVD.108.084029', '10.1103/physrevd.108.084029'],
    ['https://doi.org/10.1103/physrevd.108.084029', '10.1103/physrevd.108.084029'],
    ['http://dx.doi.org/10.1119/10.0001572', '10.1119/10.0001572'],
    ['doi: 10.1119/10.0001572 ', '10.1119/10.0001572'],
  ])('%s → %s', (raw, doi) => {
    expect(normalizeDoi(raw)).toBe(doi);
  });

  it('devolve null para vazio ou o que não é DOI', () => {
    expect(normalizeDoi(undefined)).toBeNull();
    expect(normalizeDoi('')).toBeNull();
    expect(normalizeDoi('PPRN:89261396')).toBeNull();
  });
});

describe('parseOrcidWorks', () => {
  // Recorte real de pub.orcid.org/v3.0/0000-0002-3702-7683/works (2026-10-09).
  const body = {
    group: [
      {
        'external-ids': {
          'external-id': [
            { 'external-id-type': 'doi', 'external-id-value': '10.1103/PHYSREVD.108.084029' },
          ],
        },
        'work-summary': [
          {
            title: { title: { value: 'Electrically charged regular black holes' } },
            type: 'journal-article',
            'publication-date': { year: { value: '2023' } },
            'journal-title': { value: 'Physical Review D' },
          },
        ],
      },
      {
        'external-ids': {
          'external-id': [{ 'external-id-type': 'wosuid', 'external-id-value': 'PPRN:68526702' }],
        },
        'work-summary': [
          {
            title: { title: { value: 'Electrically charged regular black holes' } },
            type: 'journal-article',
            'publication-date': null,
            'journal-title': { value: 'ArXiv' },
          },
        ],
      },
    ],
  };

  it('lê DOI normalizado, título, ano, veículo e tipo; sem DOI vira doi null', () => {
    expect(parseOrcidWorks(body)).toEqual([
      {
        doi: '10.1103/physrevd.108.084029',
        title: 'Electrically charged regular black holes',
        year: 2023,
        journal: 'Physical Review D',
        type: 'journal-article',
      },
      {
        doi: null,
        title: 'Electrically charged regular black holes',
        year: null,
        journal: 'ArXiv',
        type: 'journal-article',
      },
    ]);
  });
});

describe('parseCrossref', () => {
  it('limpa marcação do título e do veículo e lê o ano de issued', () => {
    expect(
      parseCrossref({
        title: ['Inspirals &amp; <i>bosonic</i>\n dark matter stars'],
        author: [{ given: 'Vitor', family: 'Cardoso' }],
        'container-title': ['Physical Review D'],
        issued: { 'date-parts': [[2026, 9, 8]] },
      }),
    ).toEqual({
      title: 'Inspirals & bosonic dark matter stars',
      authors: [{ given: 'Vitor', family: 'Cardoso' }],
      journal: 'Physical Review D',
      year: 2026,
    });
  });

  it('campos ausentes viram null ou lista vazia', () => {
    expect(parseCrossref({})).toEqual({
      title: null,
      authors: [],
      journal: null,
      year: null,
    });
  });
});

describe('isProfessor', () => {
  it('reconhece pelo ORCID, qualquer que seja o nome', () => {
    expect(
      isProfessor(
        { given: `Haroldo C.${THIN}D.`, family: 'Lima', ORCID: `https://orcid.org/${ORCID}` },
        ORCID,
      ),
    ).toBe(true);
  });

  it('autor com outro ORCID não é o professor', () => {
    expect(
      isProfessor(
        { given: 'Haroldo', family: 'Lima', ORCID: 'https://orcid.org/0000-0001-9251-4938' },
        ORCID,
      ),
    ).toBe(false);
  });

  // As quatro divisões que a Crossref usa para ele nos DOIs sem ORCID (levantamento de 2026-10-09).
  it.each<CrossrefAuthor>([
    { given: `Haroldo C.${THIN}D. Lima`, family: 'Junior' },
    { given: 'Haroldo C. D.', family: 'Lima Junior' },
    { given: 'Haroldo C.D. Lima', family: 'Junior' },
    { given: 'Haroldo C. D.', family: 'Lima' },
  ])('reconhece pelo nome sem ORCID: %o', (author) => {
    expect(isProfessor(author, ORCID)).toBe(true);
  });

  it('não confunde outro Lima sem ORCID', () => {
    expect(isProfessor({ given: 'Caio', family: 'Lima' }, ORCID)).toBe(false);
  });
});

describe('formatAuthor', () => {
  it('Sobrenome, Prenome como a Crossref divide, com espaço fino virando espaço', () => {
    expect(formatAuthor({ given: `Caio F.${THIN}B.`, family: 'Macedo' })).toBe(
      'Macedo, Caio F. B.',
    );
  });

  it('sem prenome, só o sobrenome; autoria institucional, o name', () => {
    expect(formatAuthor({ family: 'Cardoso' })).toBe('Cardoso');
    expect(formatAuthor({ name: 'EHT Collaboration' })).toBe('EHT Collaboration');
  });
});

describe('formatAuthors', () => {
  it('mantém a ordem e troca o professor pela grafia de citação', () => {
    expect(
      formatAuthors(
        [
          { given: `Caio F.${THIN}B.`, family: 'Macedo' },
          { given: `Haroldo C.${THIN}D.`, family: 'Lima', ORCID: `https://orcid.org/${ORCID}` },
          { given: 'Vitor', family: 'Cardoso' },
        ],
        ORCID,
      ),
    ).toEqual(['Macedo, Caio F. B.', 'LIMA JUNIOR, HAROLDO C. D.', 'Cardoso, Vitor']);
  });

  it('descarta autor sem nome algum', () => {
    expect(formatAuthors([{}, { family: 'Cardoso' }], ORCID)).toEqual(['Cardoso']);
  });
});

describe('mapType', () => {
  it.each([
    ['journal-article', 'artigo'],
    ['preprint', 'preprint'],
    ['book-chapter', 'capítulo'],
    ['book', 'livro'],
    ['conference-paper', 'anais'],
    ['dissertation-thesis', 'tese'],
    ['lecture-speech', 'outro'],
  ])('%s → %s', (orcidType, tipo) => {
    expect(mapType(orcidType)).toBe(tipo);
  });
});

describe('selectNew', () => {
  const work = (doi: string | null, title = 't'): OrcidWork => ({
    doi,
    title,
    year: 2024,
    journal: null,
    type: 'journal-article',
  });

  it('separa novos, sem DOI e já cadastrados no site; DOI repetido entra uma vez', () => {
    const result = selectNew(
      [work('10.1/a'), work(null, 'preprint'), work('10.1/b'), work('10.1/a'), work('10.1/c')],
      new Set(['10.1/c']),
      new Set(['10.1/b']),
    );
    expect(result.novos.map((w) => w.doi)).toEqual(['10.1/a']);
    expect(result.semDoi.map((w) => w.title)).toEqual(['preprint']);
    expect(result.jaNoSite).toEqual(['10.1/b']);
  });

  it('DOI no site e já visto não é relatado de novo', () => {
    expect(selectNew([work('10.1/b')], new Set(['10.1/b']), new Set(['10.1/b'])).jaNoSite).toEqual(
      [],
    );
  });
});

describe('buildPublication', () => {
  const work = {
    doi: '10.1103/physrevd.108.084029',
    title: 'Electrically charged regular black holes: a study',
    year: 2023,
    journal: 'ORCID Journal',
    type: 'journal-article',
  };
  const crossref = {
    title: 'Título da Crossref',
    authors: [
      { given: 'Haroldo C. D. Lima', family: 'Junior' },
      { given: 'Vitor', family: 'Cardoso' },
    ],
    journal: 'Physical Review D',
    year: 2024,
  };

  it('título e ano do ORCID, veículo da Crossref, nome do arquivo pelo slug do painel', () => {
    expect(buildPublication(work, crossref, ORCID)).toEqual({
      fileName: '2023-electrically-charged-regular-black-holes-a-study.md',
      data: {
        publicado: true,
        titulo: 'Electrically charged regular black holes: a study',
        autores: ['LIMA JUNIOR, HAROLDO C. D.', 'Cardoso, Vitor'],
        ano: 2023,
        veiculo: 'Physical Review D',
        tipo: 'artigo',
        doi: '10.1103/physrevd.108.084029',
      },
    });
  });

  it('cai para a Crossref quando o ORCID não tem título, ano ou veículo; sem veículo, sem a chave', () => {
    const entry = buildPublication(
      { ...work, title: '', year: null, journal: null },
      { ...crossref, journal: null },
      ORCID,
    );
    expect(entry?.data.titulo).toBe('Título da Crossref');
    expect(entry?.data.ano).toBe(2024);
    expect(entry?.data).not.toHaveProperty('veiculo');
  });

  it('veículo do ORCID quando a Crossref não tem', () => {
    expect(buildPublication(work, { ...crossref, journal: null }, ORCID)?.data.veiculo).toBe(
      'ORCID Journal',
    );
  });

  it('sem autores, sem título ou sem ano devolve null', () => {
    expect(buildPublication(work, { ...crossref, authors: [] }, ORCID)).toBeNull();
    expect(
      buildPublication({ ...work, title: '' }, { ...crossref, title: null }, ORCID),
    ).toBeNull();
    expect(
      buildPublication({ ...work, year: null }, { ...crossref, year: null }, ORCID),
    ).toBeNull();
  });
});

describe('commitMessage', () => {
  const entry = {
    fileName: 'x.md',
    data: {
      publicado: true as const,
      titulo: 'Spectral lines of dirty wormholes',
      autores: ['a'],
      ano: 2024,
      tipo: 'artigo' as const,
      doi: '10.1/x',
    },
  };

  it('com publicação nova: docs, uma linha por publicação', () => {
    expect(commitMessage([entry], [])).toBe(
      'docs: publicações novas do ORCID\n\n- 2024 — Spectral lines of dirty wormholes\n',
    );
  });

  it('com publicação nova e DOI só marcado: lista os dois', () => {
    expect(commitMessage([entry], ['10.1142/so21827182041014x'])).toBe(
      'docs: publicações novas do ORCID\n\n- 2024 — Spectral lines of dirty wormholes\n\n' +
        'Marcados como vistos sem importar:\n- 10.1142/so21827182041014x\n',
    );
  });

  it('só DOI marcado como visto: chore', () => {
    expect(commitMessage([], ['10.1142/so21827182041014x'])).toBe(
      'chore: DOIs do ORCID marcados como vistos\n\n- 10.1142/so21827182041014x\n',
    );
  });
});

describe('títulos com desigualdade (revisão final, achado 2)', () => {
  const comTitulo = (value: string) =>
    parseOrcidWorks({
      group: [{ 'work-summary': [{ title: { title: { value } }, type: 'journal-article' }] }],
    })[0].title;

  it('"<" e ">" soltos não são marcação e ficam no título', () => {
    expect(comTitulo('Bounds for 0 < a < 1 and b > 2')).toBe('Bounds for 0 < a < 1 and b > 2');
  });

  it('marcação de verdade sai, inclusive com prefixo de namespace', () => {
    expect(comTitulo('Ce<sub>2</sub>(MoO<sub>4</sub>) and <mml:math>x</mml:math>')).toBe(
      'Ce2(MoO4) and x',
    );
  });
});

describe('unknownDoiWarning (revisão final, achado 1)', () => {
  it('DOI que nenhuma agência conhece: desconhecido', () => {
    expect(unknownDoiWarning('10.1142/so21827182041014x', 'Tidal forces', null)).toBe(
      'DOI desconhecido na Crossref, marcado como visto: 10.1142/so21827182041014x (Tidal forces)',
    );
  });

  it('DOI de outra agência (arXiv/DataCite): diz qual e pede o cadastro pelo painel', () => {
    expect(unknownDoiWarning('10.48550/arxiv.2101.00001', 'Um preprint', 'DataCite')).toBe(
      'DOI registrado na DataCite, não na Crossref; marcado como visto, cadastre pelo painel: ' +
        '10.48550/arxiv.2101.00001 (Um preprint)',
    );
  });
});
