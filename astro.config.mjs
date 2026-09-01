// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * ============================================================================
 *  Arquivo      : astro.config.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Configuração do Astro em modo estático (D-01), sem adapter
 *                 e sem SSR, com o plugin Vite do Tailwind 4 (RNF-02, RNF-12).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-01
 *  Atualizado em: 2026-09-01
 *  Versão       : 0.1.0
 *
 *  Dependências : astro, @tailwindcss/vite
 *  Entradas     : variável de ambiente PUBLIC_SITE_URL (opcional)
 *  Saídas       : configuração consumida pelo CLI do Astro (`astro build`/`astro dev`)
 *  Uso          : lido automaticamente pelo Astro na raiz do projeto
 *
 *  Notas        : `site` usa o subdomínio padrão do Worker (A-07) até a fase 5
 *                 confirmar domínio próprio (Q-05). Nunca adicionar `adapter`
 *                 aqui — o site é 100% estático (D-01).
 * ============================================================================
 */
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL ?? 'https://haroldo-page.workers.dev',
  vite: {
    plugins: [tailwindcss()],
  },
});
