/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
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
