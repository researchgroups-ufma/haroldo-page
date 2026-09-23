import { getViteConfig } from 'astro/config';
import { configDefaults } from 'vitest/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // `tests/dist/**` lê o `dist/` gerado pelo build (plano 052) e roda à parte, por
    // `vitest.dist.config.ts` (`npm run test:dist`). O CI chama `npm run test:coverage` antes de
    // `npm run build:pipeline` (`.github/workflows/ci.yml`), então incluir esses testes aqui os
    // faria falhar por `dist/` ainda não existir.
    exclude: [...configDefaults.exclude, 'tests/dist/**'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Só arquivos de código: `src/lib/**` cru também casava os `.gitkeep`,
      // que entravam no relatório como 100% e inflavam o denominador.
      // `src/content.config.ts` entrou no plano 016: antes dele o arquivo não
      // existia e a cobertura relatava 100% de 3 statements sem medir nada —
      // rede de proteção falsa por omissão (apontado na revisão do plano 015).
      include: ['src/lib/**/*.ts', 'src/i18n/**/*.ts', 'src/content.config.ts'],
      reporter: ['text', 'html'],
      // §11 do PRD: ≥ 80% dos módulos de `src/lib/` e `src/i18n/`. Até aqui a
      // meta era relatada e nunca imposta; com `thresholds` o `test:coverage`
      // falha se a cobertura cair abaixo dela.
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
