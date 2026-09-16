import { describe, expect, it } from 'vitest';
import {
  countActiveProjectsByLine,
  relatedLineAnchor,
  sortProjects,
  sortResearchLines,
} from '../../src/lib/research';

describe('sortResearchLines', () => {
  it('ordena por ordem crescente, sem ordem ao fim', () => {
    const entries = [
      { data: { ordem: 3, titulo: 'Terceira' } },
      { data: { titulo: 'Sem ordem' } },
      { data: { ordem: 1, titulo: 'Primeira' } },
    ];
    expect(sortResearchLines(entries).map((e) => e.data.titulo)).toEqual([
      'Primeira',
      'Terceira',
      'Sem ordem',
    ]);
  });

  it('desempata duas linhas sem ordem por título com acento', () => {
    // `'Óptica'.localeCompare('Ondas', 'pt-BR')` devolve `[ 'Ondas', 'Óptica' ]` — confirmado com
    // `node -e "console.log(['Óptica','Ondas'].sort((a,b)=>a.localeCompare(b,'pt-BR')))"`. Este
    // par por si só **não discrimina** `localeCompare('pt-BR')` de uma comparação código a
    // código (`sort()` sem comparador dá o mesmo resultado — conferido com
    // `node -e "console.log(['Óptica','Ondas'].sort())"`); o caso que discrimina é o próximo.
    const entries = [{ data: { titulo: 'Óptica' } }, { data: { titulo: 'Ondas' } }];
    expect(sortResearchLines(entries).map((e) => e.data.titulo)).toEqual(['Ondas', 'Óptica']);
  });

  it('desempata por título usando colação pt-BR, não ordem de código de caractere', () => {
    // Par que discrimina `localeCompare('pt-BR')` de comparação código a código: em pt-BR "Ó"
    // colaciona perto de "O" (antes de "z"), então "Óptica" < "Ozônio" — confirmado com
    // `node -e "console.log(['Ozônio','Óptica'].sort((a,b)=>a.localeCompare(b,'pt-BR')))"`, que
    // devolve `[ 'Óptica', 'Ozônio' ]`. Por código de caractere (`sort()` sem comparador,
    // `U+004F` < `U+00D3`), a ordem seria a inversa: `[ 'Ozônio', 'Óptica' ]` — confirmado com
    // `node -e "console.log(['Ozônio','Óptica'].sort())"`.
    const entries = [{ data: { titulo: 'Ozônio' } }, { data: { titulo: 'Óptica' } }];
    expect(sortResearchLines(entries).map((e) => e.data.titulo)).toEqual(['Óptica', 'Ozônio']);
  });

  it('desempata duas linhas com a MESMA ordem por título', () => {
    const entries = [
      { data: { ordem: 1, titulo: 'Zebra' } },
      { data: { ordem: 1, titulo: 'Abelha' } },
    ];
    expect(sortResearchLines(entries).map((e) => e.data.titulo)).toEqual(['Abelha', 'Zebra']);
  });

  it('não muta o array de entrada', () => {
    const entries = [{ data: { ordem: 2, titulo: 'B' } }, { data: { ordem: 1, titulo: 'A' } }];
    const original = [...entries];
    sortResearchLines(entries);
    expect(entries).toEqual(original);
  });
});

describe('sortProjects', () => {
  it('agrupa em andamento, depois concluído, depois sem status; título dentro do grupo', () => {
    const entries = [
      { data: { titulo: 'Zeta', status: undefined } },
      { data: { titulo: 'Concluído B', status: 'concluído' as const } },
      { data: { titulo: 'Em andamento B', status: 'em andamento' as const } },
      { data: { titulo: 'Concluído A', status: 'concluído' as const } },
      { data: { titulo: 'Em andamento A', status: 'em andamento' as const } },
      { data: { titulo: 'Alfa', status: undefined } },
    ];
    expect(sortProjects(entries).map((e) => e.data.titulo)).toEqual([
      'Em andamento A',
      'Em andamento B',
      'Concluído A',
      'Concluído B',
      'Alfa',
      'Zeta',
    ]);
  });

  it('não muta o array de entrada', () => {
    const entries = [
      { data: { titulo: 'B', status: 'concluído' as const } },
      { data: { titulo: 'A', status: 'em andamento' as const } },
    ];
    const original = [...entries];
    sortProjects(entries);
    expect(entries).toEqual(original);
  });
});

describe('countActiveProjectsByLine', () => {
  it('conta só os projetos em andamento, ignorando concluídos e sem linha', () => {
    const projects = [
      {
        data: {
          titulo: 'A',
          status: 'em andamento' as const,
          linha_relacionada: { id: 'linha-1' },
        },
      },
      {
        data: {
          titulo: 'B',
          status: 'em andamento' as const,
          linha_relacionada: { id: 'linha-1' },
        },
      },
      { data: { titulo: 'C', status: 'concluído' as const, linha_relacionada: { id: 'linha-1' } } },
      {
        data: {
          titulo: 'D',
          status: 'em andamento' as const,
          linha_relacionada: { id: 'linha-2' },
        },
      },
      { data: { titulo: 'E', status: 'em andamento' as const } },
    ];
    expect(countActiveProjectsByLine(projects)).toEqual(
      new Map([
        ['linha-1', 2],
        ['linha-2', 1],
      ]),
    );
  });

  it('lista vazia devolve mapa vazio', () => {
    expect(countActiveProjectsByLine([])).toEqual(new Map());
  });
});

describe('relatedLineAnchor', () => {
  it('devolve undefined quando o projeto não tem linha_relacionada', () => {
    const project = { data: { titulo: 'Sem linha' } };
    expect(relatedLineAnchor(project, new Set(['linha-1']))).toBeUndefined();
  });

  it('devolve a âncora quando a linha está publicada', () => {
    const project = { data: { titulo: 'Com linha', linha_relacionada: { id: 'linha-1' } } };
    expect(relatedLineAnchor(project, new Set(['linha-1']))).toBe('#linha-1');
  });

  it('devolve undefined quando a linha não está entre as publicadas (RN-01)', () => {
    const project = {
      data: { titulo: 'Linha rascunho', linha_relacionada: { id: 'linha-oculta' } },
    };
    expect(relatedLineAnchor(project, new Set(['linha-1']))).toBeUndefined();
  });
});
