import { describe, expect, it } from 'vitest';
import { EXCECOES, avaliar } from '../../scripts/auditar-dependencias.mjs';

/** Relatório mínimo no formato de `npm audit --json`. */
const relatorio = (...avisos: [string, string, string][]) => ({
  vulnerabilities: Object.fromEntries(
    avisos.map(([id, severidade, pacote]) => [
      pacote,
      {
        via: [
          'pacote-intermediario',
          {
            url: `https://github.com/advisories/${id}`,
            severity: severidade,
            name: pacote,
            title: 't',
          },
        ],
      },
    ]),
  ),
});

describe('avaliar (portão do npm audit, ADR-0010)', () => {
  const excecoes = { 'GHSA-aaaa': {} };

  it('aceita o aviso high que está na lista de exceções', () => {
    const r = avaliar(relatorio(['GHSA-aaaa', 'high', 'x']), excecoes);
    expect(r.novos).toEqual([]);
    expect(r.aceitos).toEqual(['GHSA-aaaa']);
  });

  it.each(['high', 'critical'])('reprova aviso %s fora da lista', (severidade) => {
    const r = avaliar(relatorio(['GHSA-bbbb', severidade, 'y']), excecoes);
    expect(r.novos.map((n: { id: string }) => n.id)).toEqual(['GHSA-bbbb']);
  });

  it('não reprova moderate nem low (o nível do portão não muda)', () => {
    const r = avaliar(
      relatorio(['GHSA-cccc', 'moderate', 'z'], ['GHSA-dddd', 'low', 'w']),
      excecoes,
    );
    expect(r.novos).toEqual([]);
  });

  it('aponta a exceção que não aparece mais, para ser retirada', () => {
    const r = avaliar(relatorio(), excecoes);
    expect(r.obsoletas).toEqual(['GHSA-aaaa']);
  });

  it('toda exceção real tem data, pacote e motivo', () => {
    for (const excecao of Object.values(EXCECOES) as {
      desde: string;
      pacote: string;
      motivo: string;
    }[]) {
      expect(excecao.desde).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(excecao.pacote).not.toBe('');
      expect(excecao.motivo).not.toBe('');
    }
  });
});
