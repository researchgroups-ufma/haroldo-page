/**
 * ============================================================================
 *  Arquivo      : vitest.dist.config.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Config Vitest separada para `tests/dist/**` (plano 052, §11): lê o `dist/`
 *                 recém-gerado por `npm run build:pipeline`. Fica fora de `vitest.config.ts`
 *                 porque o CI roda `npm run test:coverage` antes do build — incluir estes testes
 *                 na suíte padrão os faria falhar por `dist/` ainda não existir.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-23
 *  Atualizado em: 2026-09-23
 *  Versão       : 0.1.0
 *
 *  Dependências : astro/config, vitest
 *  Entradas     : nenhuma (config)
 *  Saídas       : nenhuma (config)
 *  Uso          : npm run test:dist  (script `vitest run -c vitest.dist.config.ts`)
 *
 *  Notas        : sem `coverage` — não conta para o threshold de 80% do §11, que é medido só
 *                 sobre `src/lib/**` e `src/i18n/**` por `vitest.config.ts`.
 * ============================================================================
 */
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/dist/**/*.test.ts'],
    environment: 'node',
  },
});
