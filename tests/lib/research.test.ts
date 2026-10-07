import { describe, expect, it } from 'vitest';
import {
  groupProjectsByLine,
  groupPublicationsByLine,
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

describe('groupProjectsByLine', () => {
  const project = (titulo: string, linha?: string) => ({
    data: { titulo, linha_relacionada: linha ? { id: linha } : undefined },
  });

  it('agrupa por linha publicada, preservando a ordem recebida', () => {
    const projects = [project('B', 'l1'), project('A', 'l1'), project('C', 'l2')];
    const { byLine, others } = groupProjectsByLine(new Set(['l1', 'l2']), projects);
    expect(byLine.get('l1')?.map((p) => p.data.titulo)).toEqual(['B', 'A']);
    expect(byLine.get('l2')?.map((p) => p.data.titulo)).toEqual(['C']);
    expect(others).toEqual([]);
  });

  it('projeto sem linha vai para others', () => {
    const { byLine, others } = groupProjectsByLine(new Set(['l1']), [project('Solto')]);
    expect(byLine.size).toBe(0);
    expect(others.map((p) => p.data.titulo)).toEqual(['Solto']);
  });

  it('RN-01: projeto ligado a linha não publicada vai para others, sem criar a chave', () => {
    const { byLine, others } = groupProjectsByLine(new Set(['l1']), [project('X', 'rascunho')]);
    expect(byLine.has('rascunho')).toBe(false);
    expect(others.map((p) => p.data.titulo)).toEqual(['X']);
  });

  it('linha sem projetos não aparece no mapa', () => {
    const { byLine } = groupProjectsByLine(new Set(['l1', 'l2']), [project('A', 'l1')]);
    expect(byLine.has('l2')).toBe(false);
  });
});

// Sabatina "Pesquisa modelo C", Decisões 4 a 6: só as publicações ligadas à linha, mais recente primeiro.
describe('groupPublicationsByLine', () => {
  const pub = (titulo: string, ano: number, linha?: string) => ({
    data: { titulo, ano, linha_relacionada: linha ? { id: linha } : undefined },
  });

  it('agrupa por linha, do ano mais recente ao mais antigo, empate por título', () => {
    const pubs = [
      pub('B', 2023, 'l1'),
      pub('Óptica', 2025, 'l1'),
      pub('Ondas', 2025, 'l1'),
      pub('C', 2024, 'l2'),
    ];
    const byLine = groupPublicationsByLine(new Set(['l1', 'l2']), pubs);
    expect(byLine.get('l1')?.map((p) => p.data.titulo)).toEqual(['Ondas', 'Óptica', 'B']);
    expect(byLine.get('l2')?.map((p) => p.data.titulo)).toEqual(['C']);
  });

  it('publicação sem linha, ou com linha fora da página, não entra', () => {
    const byLine = groupPublicationsByLine(new Set(['l1']), [
      pub('Solta', 2024),
      pub('X', 2024, 'rascunho'),
    ]);
    expect(byLine.size).toBe(0);
  });

  it('linha sem publicação não tem chave (Decisão 6: a seção some)', () => {
    const byLine = groupPublicationsByLine(new Set(['l1', 'l2']), [pub('A', 2024, 'l1')]);
    expect(byLine.has('l2')).toBe(false);
  });

  it('não muta a lista recebida', () => {
    const pubs = [pub('A', 2020, 'l1'), pub('B', 2024, 'l1')];
    const original = [...pubs];
    groupPublicationsByLine(new Set(['l1']), pubs);
    expect(pubs).toEqual(original);
  });
});
