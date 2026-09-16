import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { filterPublished, requireSingleton } from '../../src/lib/published';

describe('filterPublished', () => {
  it('mantém a ordem de entrada, removendo os não publicados', () => {
    const entries = [
      { data: { publicado: true }, id: 'a' },
      { data: { publicado: false }, id: 'b' },
      { data: { publicado: true }, id: 'c' },
    ];
    expect(filterPublished(entries)).toEqual([
      { data: { publicado: true }, id: 'a' },
      { data: { publicado: true }, id: 'c' },
    ]);
  });

  it('lista vazia devolve lista vazia', () => {
    expect(filterPublished([])).toEqual([]);
  });
});

describe('requireSingleton', () => {
  it('devolve o único item quando há exatamente 1', () => {
    const entries = [{ id: 'perfil-unico' }];
    expect(requireSingleton(entries, 'perfil')).toEqual({ id: 'perfil-unico' });
  });

  it('lança com mensagem exata quando não há nenhum item', () => {
    expect(() => requireSingleton([], 'perfil')).toThrow(
      'Coleção `perfil`: esperado exatamente 1 item, encontrados 0',
    );
  });

  it('lança com mensagem exata quando há dois itens', () => {
    expect(() => requireSingleton([{ id: 'a' }, { id: 'b' }], 'perfil')).toThrow(
      'Coleção `perfil`: esperado exatamente 1 item, encontrados 2',
    );
  });
});

describe('filterPublished — invariante com conteúdo real de content/publicacoes (RN-01)', () => {
  // Fixtures reais, não sintéticas (decisão 6 do README da fase): a contagem exata não é
  // afirmada (mudaria com o primeiro save do professor), só a invariante RN-01.
  const publicacoesDir = join(__dirname, '../../content/publicacoes');

  it('nenhum item devolvido tem publicado !== true, e filtrados + rascunhos === total', () => {
    const arquivos = readdirSync(publicacoesDir).filter((nome) => nome.endsWith('.md'));
    expect(arquivos.length).toBeGreaterThan(0);

    const entries = arquivos.map((nome) => {
      const { data } = matter(readFileSync(join(publicacoesDir, nome), 'utf-8'));
      return { data: { publicado: data.publicado === true } };
    });

    const publicadas = filterPublished(entries);
    const rascunhos = entries.filter((entry) => !entry.data.publicado);

    expect(publicadas.every((entry) => entry.data.publicado === true)).toBe(true);
    expect(publicadas.length + rascunhos.length).toBe(entries.length);
  });
});
