/**
 * ============================================================================
 *  Arquivo      : tina-disciplinas.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Testes do `ui.beforeSubmit` da coleção `disciplinas` (`tina/config.ts`):
 *                 descarta o item vazio em silêncio, tira a chave de link em branco
 *                 (RF-24) e recusa, com alerta e `throw`, o item pela metade e o link que
 *                 não é endereço (F-09, Aviso 2). Molde: `tina-extensao.test.ts`.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-11-21
 *  Atualizado em: 2026-11-21
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, tina/config.ts (com `tinacms` mockado)
 *  Entradas     : `values` sintéticos e um `cms` falso que registra os alertas
 *  Saídas       : nenhuma — só asserções
 *  Uso          : `npm test -- tests/content/tina-disciplinas.test.ts`
 * ============================================================================
 */
import { describe, expect, it, vi } from 'vitest';

// Mesmo mock de `tina-lock-coerente.test.ts`: o bundle do `tinacms` não carrega sob Vitest.
vi.mock('tinacms', () => ({
  defineConfig: (config: unknown) => config,
}));

const { default: tinaConfig } = await import('../../tina/config');

type BeforeSubmit = (arg: {
  values: Record<string, unknown>;
  cms: { alerts: { error: (message: string) => void } };
}) => Promise<Record<string, unknown>>;

const disciplinas = (
  tinaConfig.schema.collections as unknown as { name: string; ui: { beforeSubmit: BeforeSubmit } }[]
).find((c) => c.name === 'disciplinas')!;

/** Chama o `beforeSubmit` da coleção com um `cms` falso que registra os alertas. */
function submit(extra: Record<string, unknown>) {
  const alerts: string[] = [];
  const cms = { alerts: { error: (message: string) => alerts.push(message) } };
  const result = disciplinas.ui.beforeSubmit({ values: { nome: 'D', ...extra }, cms });
  return { result, alerts };
}

describe('disciplinas — beforeSubmit do painel (F-09, Aviso 2, plano 086)', () => {
  const aula = { numero: 1, titulo: 'Introdução', url: 'https://x.test/a' };

  it('descarta em silêncio o item vazio (o "+" clicado à toa) e mantém os completos', async () => {
    const { result, alerts } = submit({ aulas: [aula, {}, { titulo: '', url: ' ' }] });
    await expect(result).resolves.toMatchObject({ nome: 'D', aulas: [aula] });
    expect(alerts).toEqual([]);
  });

  it('aula sem link salva, sem a chave `url`', async () => {
    const { result, alerts } = submit({ aulas: [{ numero: 2, titulo: 'Sem link', url: ' ' }] });
    const saved = (await result) as { aulas: Record<string, unknown>[] };
    expect(saved.aulas).toStrictEqual([{ numero: 2, titulo: 'Sem link' }]);
    expect('url' in saved.aulas[0]).toBe(false);
    expect(alerts).toEqual([]);
  });

  it('item pela metade recusa o salvamento e avisa o professor', async () => {
    const { result, alerts } = submit({ aulas: [aula, { titulo: 'Sem número' }] });
    await expect(result).rejects.toThrow('Não salvo: Aulas, item 2: falta Número.');
    expect(alerts).toEqual(['Não salvo: Aulas, item 2: falta Número.']);
  });

  it('link que não é endereço recusa o salvamento e avisa o professor', async () => {
    const { result, alerts } = submit({ aulas: [{ ...aula, url: 'AAAA' }] });
    await expect(result).rejects.toThrow('não é um endereço');
    expect(alerts).toEqual([
      'Não salvo: Aulas, item 1: o link "AAAA" não é um endereço — comece com https://.',
    ]);
  });

  it('junta os problemas de várias listas numa só mensagem', async () => {
    const { result, alerts } = submit({
      aulas: [{ titulo: 'A' }],
      links: [{ titulo: 'L' }],
    });
    await expect(result).rejects.toThrow();
    expect(alerts).toEqual([
      'Não salvo: Aulas, item 1: falta Número. Links externos, item 1: falta Link.',
    ]);
  });

  it('disciplina sem listas salva como está', async () => {
    const { result, alerts } = submit({});
    await expect(result).resolves.toEqual({ nome: 'D' });
    expect(alerts).toEqual([]);
  });
});
