/**
 * Configuração flat do ESLint (formato exigido pelo ESLint 9+) para o projeto haroldo-page.
 *
 * Combina as regras recomendadas do ESLint core, typescript-eslint e eslint-plugin-astro
 * (que cobre arquivos `.astro` via astro-eslint-parser). `eslint-config-prettier` vem por
 * último para desligar regras estilísticas que conflitariam com o Prettier.
 *
 * `@typescript-eslint/no-explicit-any` é forçado como `error`: o PRD (§10.4) proíbe `any`
 * em código de produção, não apenas desencoraja.
 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'coverage/**', '.wrangler/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  prettier, // desliga regras estilísticas que brigam com o Prettier — sempre por último
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Arquivos de configuração (ex.: astro.config.mjs) rodam em Node.js e usam
    // globais como `process`, que `eslint.configs.recommended` não conhece por padrão.
    files: ['**/*.config.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
);
