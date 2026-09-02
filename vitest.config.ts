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
      include: ['src/lib/**/*.ts', 'src/i18n/**/*.ts'],
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
