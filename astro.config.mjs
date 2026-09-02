// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// astro.config.mjs roda em Node antes de o Astro/Vite aplicar `.env` ao
// processo — `process.env.PUBLIC_SITE_URL` ficaria sempre `undefined` quando
// a variável só existe no `.env` local (verificado empiricamente na revisão
// da pendência P-2 do plano 006). `loadEnv` lê os arquivos `.env*` na raiz do
// projeto sem sobrescrever variáveis já definidas no ambiente real (CI,
// Cloudflare Workers Builds), que continuam tendo prioridade. Prefixo
// `'PUBLIC_'` limita a leitura a essas variáveis — não carrega `TINA_TOKEN`
// nem as demais, que este arquivo não usa.
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? '', process.cwd(), 'PUBLIC_');

/**
 * ============================================================================
 *  Arquivo      : astro.config.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Configuração do Astro em modo estático (D-01), sem adapter
 *                 e sem SSR, com o plugin Vite do Tailwind 4 (RNF-02, RNF-12)
 *                 e o plugin de dev do TinaCMS que resolve `/admin` sem sufixo
 *                 durante `astro dev`.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-01
 *  Atualizado em: 2026-09-02
 *  Versão       : 0.2.0
 *
 *  Dependências : astro, @tailwindcss/vite, @tinacms/astro (tinaAdminDevRedirect), vite (loadEnv)
 *  Entradas     : variável de ambiente PUBLIC_SITE_URL (opcional), lida via
 *                 `loadEnv` do `.env`/ambiente real — ver nota acima
 *  Saídas       : configuração consumida pelo CLI do Astro (`astro build`/`astro dev`)
 *  Uso          : lido automaticamente pelo Astro na raiz do projeto
 *
 *  Notas        : `site` usa o subdomínio padrão do Worker (A-07) até a fase 5
 *                 confirmar domínio próprio (Q-05). Nunca adicionar `adapter`
 *                 aqui — o site é 100% estático (D-01). `tinaAdminDevRedirect`
 *                 só age em dev (`apply: 'serve'`); o build de produção serve
 *                 `public/admin/index.html` diretamente — sem SSR, sem visual
 *                 editing (D-02).
 * ============================================================================
 */
export default defineConfig({
  output: 'static',
  site: PUBLIC_SITE_URL ?? 'https://haroldo-page.and-near.workers.dev',
  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
  },
});
