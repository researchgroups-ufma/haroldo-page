// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import sitemap from '@astrojs/sitemap';
import { existsSync, renameSync, rmdirSync } from 'node:fs';
import { URL, fileURLToPath } from 'node:url';
import { alternateLinks } from './src/lib/routes.ts';

// astro.config.mjs roda em Node antes de o Astro/Vite aplicar `.env` ao
// processo — `process.env.PUBLIC_SITE_URL` ficaria sempre `undefined` quando
// a variável só existe no `.env` local (verificado empiricamente na revisão
// da pendência P-2 do plano 006). `loadEnv` lê os arquivos `.env*` na raiz do
// projeto sem sobrescrever variáveis já definidas no ambiente real (CI,
// Cloudflare Workers Builds), que continuam tendo prioridade. Prefixo
// `'PUBLIC_'` limita a leitura a essas variáveis — não carrega `TINA_TOKEN`
// nem as demais, que este arquivo não usa.
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? '', process.cwd(), 'PUBLIC_');

// RF-27 (sabatina fase 4, Decisão 9 e decisão de fatiamento 14): o Astro só grava
// `/404` como `404.html` (`STATUS_CODE_PAGES` em `core/output-filename.js` e
// `core/build/common.js` contém apenas `/404` e `/500`); `/en/404` sai como
// `en/404/index.html`. O Worker (`not_found_handling = "404-page"`) procura
// `404.html` subindo a árvore, então o arquivo é movido para `en/404.html` depois
// do build. Tática estática, sem código no Worker (D-01); não muda `build.format`.
/** @type {import('astro').AstroIntegration} */
const english404FileName = {
  name: 'english-404-file-name',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const outDir = fileURLToPath(dir);
      const folder = `${outDir}en/404`;
      const generated = `${folder}/index.html`;
      if (!existsSync(generated)) return;
      renameSync(generated, `${outDir}en/404.html`);
      rmdirSync(folder);
    },
  },
};

// RF-30 (sabatina fase 4, Decisão 10): o sitemap lista toda rota pública dos dois idiomas, sem as
// duas 404. A 404 é servida em qualquer caminho inexistente e não é página indexável; o filtro
// casa o `pathname` que a integração vê (`/404/` e `/en/404/`, com ou sem barra final).
// Rascunho (RN-01) não gera página, então fica fora sem lógica extra.
/** @param {string} page URL absoluta de uma página gerada. */
function isIndexablePage(page) {
  return !/^\/(en\/)?404\/?$/.test(new URL(page).pathname);
}

// RF-30, RN-09 e sabatina fase 4, Decisão 14: a opção `i18n` da integração pareia URLs pelo
// caminho sem o prefixo de idioma e só casa `/` com `/en/` (medido no plano 071); com os
// segmentos traduzidos (`/sobre/` ↔ `/en/about/`) os pares saem do mapa de rotas de
// `src/lib/routes.ts`, a mesma fonte do `<head>`. Os três pares são os do `<head>` (pt-BR, en e
// `x-default`), com a origem da própria URL do item.
/** @param {import('@astrojs/sitemap').SitemapItem} item */
function withAlternateLinks(item) {
  const { origin, pathname } = new URL(item.url);
  item.links = alternateLinks(pathname).map(({ hreflang, path }) => ({
    lang: hreflang,
    url: `${origin}${path}`,
  }));
  return item;
}

/**
 * ============================================================================
 *  Arquivo      : astro.config.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Configuração do Astro em modo estático (D-01), sem adapter
 *                 e sem SSR, com o plugin Vite do Tailwind 4 (RNF-02, RNF-12)
 *                 e o plugin de dev do TinaCMS que resolve `/admin` sem sufixo
 *                 durante `astro dev`, a integração inline que grava a
 *                 404 em inglês como `dist/en/404.html` (RF-27, plano 068) e o
 *                 sitemap bilíngue (RF-30, plano 071).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-01
 *  Atualizado em: 2026-10-02
 *  Versão       : 0.4.0
 *
 *  Dependências : astro, @tailwindcss/vite, @tinacms/astro (tinaAdminDevRedirect), vite (loadEnv),
 *                 @astrojs/sitemap, src/lib/routes.ts (`alternateLinks`), node:fs, node:url
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
 *                 editing (D-02). `src/lib/routes.ts` só pode ter `import type`
 *                 (puxar valor de `config.ts` leria `import.meta.env` aqui). O
 *                 `robots.txt` não muda: segue `Disallow` até a Q-05 (Decisão 10).
 * ============================================================================
 */
export default defineConfig({
  output: 'static',
  site: PUBLIC_SITE_URL ?? 'https://haroldo-page.and-near.workers.dev',
  integrations: [
    english404FileName,
    sitemap({
      filter: isIndexablePage,
      serialize: withAlternateLinks,
    }),
  ],
  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
  },
});
