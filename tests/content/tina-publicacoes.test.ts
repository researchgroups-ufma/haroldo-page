import { describe, expect, it, vi } from 'vitest';
import { siteConfig } from '../../src/lib/config';
import { isProfessorAuthor } from '../../src/lib/publications';

// Mesmo mock de `tina-lock-coerente.test.ts`: o bundle do `tinacms` não carrega sob Vitest.
vi.mock('tinacms', () => ({
  defineConfig: (config: unknown) => config,
}));

const { default: tinaConfig } = await import('../../tina/config');

const publicacoes = (
  tinaConfig.schema.collections as unknown as {
    name: string;
    defaultItem: { publicado: boolean; autores: string[] };
  }[]
).find((c) => c.name === 'publicacoes')!;

describe('publicacoes — item novo do painel (pedido de 2026-10-07)', () => {
  it('nasce como rascunho e com um único autor: o professor', () => {
    expect(publicacoes.defaultItem.publicado).toBe(false);
    expect(publicacoes.defaultItem.autores).toHaveLength(1);
  });

  it('o nome copiado à mão no tina/config.ts é uma das formas de siteConfig.author.citationNames', () => {
    expect(siteConfig.author.citationNames).toContain(publicacoes.defaultItem.autores[0]);
    expect(
      isProfessorAuthor(publicacoes.defaultItem.autores[0], siteConfig.author.citationNames),
    ).toBe(true);
  });
});
