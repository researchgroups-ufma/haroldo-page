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

const extensao = (
  tinaConfig.schema.collections as unknown as { name: string; ui: { beforeSubmit: BeforeSubmit } }[]
).find((c) => c.name === 'extensao')!;

/** Chama o `beforeSubmit` da coleção com um `cms` falso que registra os alertas. */
async function submit(fotos: unknown) {
  const alerts: string[] = [];
  const cms = { alerts: { error: (message: string) => alerts.push(message) } };
  const result = extensao.ui.beforeSubmit({ values: { titulo: 'T', fotos }, cms });
  return { result, alerts };
}

describe('extensao — beforeSubmit do painel (fotos medidas no /admin em 2026-10-07)', () => {
  const completa = { imagem: '/uploads/a.jpg', alt: 'Estudantes na bancada' };

  it('descarta em silêncio a foto vazia (o "+" clicado à toa) e mantém as completas', async () => {
    const { result, alerts } = await submit([completa, {}, { imagem: '', alt: '' }]);
    await expect(result).resolves.toMatchObject({ titulo: 'T', fotos: [completa] });
    expect(alerts).toEqual([]);
  });

  it.each([
    ['só imagem', { imagem: '/uploads/a.jpg' }],
    ['só descrição', { alt: 'Estudantes na bancada' }],
  ])('foto pela metade (%s) recusa o salvamento e avisa o professor', async (_caso, foto) => {
    const { result, alerts } = await submit([completa, foto]);
    await expect(result).rejects.toThrow('cada foto precisa de uma imagem e de uma descrição');
    expect(alerts).toEqual(['Não salvo: cada foto precisa de uma imagem e de uma descrição.']);
  });

  it('postagem sem fotos salva com a lista vazia', async () => {
    const { result } = await submit(undefined);
    await expect(result).resolves.toMatchObject({ fotos: [] });
  });
});
