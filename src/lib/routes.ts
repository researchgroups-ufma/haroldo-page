/**
 * ============================================================================
 *  Arquivo      : routes.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Mapa único das rotas do site nos dois idiomas: caminho de
 *                 cada rota por idioma, idioma de um caminho e o par de um
 *                 caminho no outro idioma. Fonte do menu, do seletor de
 *                 idioma e do `hreflang` (sabatina fase 4, Decisão 6).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-25
 *  Atualizado em: 2026-09-25
 *  Versão       : 0.1.0
 *
 *  Dependências : src/lib/config.ts (só o tipo `Locale`)
 *  Entradas     : chave de rota, slug de disciplina, `pathname`
 *  Saídas       : caminhos com barra final; `Locale`; `HTML_LANG`
 *  Uso          : routePath('teaching', 'en') → '/en/teaching/'
 *
 *  Notas        : só `import type` — o `astro.config.mjs` passa a importar
 *                 este módulo no plano 071, e import de valor puxaria código
 *                 do site para a configuração. Todo caminho devolvido termina
 *                 em `/` (o `auto-trailing-slash` do Worker responde 307 sem
 *                 ela, achado do plano 026).
 * ============================================================================
 */
import type { Locale } from './config';

/** Valor do atributo `lang` do HTML por idioma do site. */
export const HTML_LANG = { pt: 'pt-BR', en: 'en' } as const satisfies Record<Locale, string>;

/** Rotas fixas do site, as mesmas nos dois idiomas. */
export type RouteKey = 'home' | 'about' | 'research' | 'teaching' | 'publications';

/** Segmento de cada rota fixa por idioma, sem prefixo de idioma nem barras (`''` é a Home). */
const SEGMENTS: Record<RouteKey, Record<Locale, string>> = {
  home: { pt: '', en: '' },
  about: { pt: 'sobre', en: 'about' },
  research: { pt: 'pesquisa', en: 'research' },
  // RF-29: `/ensino` ↔ `/en/teaching`.
  teaching: { pt: 'ensino', en: 'teaching' },
  publications: { pt: 'publicacoes', en: 'publications' },
};

/**
 * Prefixo de idioma do caminho. RN-09: o português é o idioma canônico e fica na raiz, sem
 * prefixo; o inglês fica sob `/en`.
 */
function prefix(locale: Locale): string {
  return locale === 'en' ? '/en' : '';
}

/**
 * Caminho de uma rota fixa num idioma.
 *
 * @param key Rota.
 * @param locale Idioma.
 * @returns Caminho com barra final (ex.: `'/sobre/'`, `'/en/about/'`, `'/'`).
 */
export function routePath(key: RouteKey, locale: Locale): string {
  const segment = SEGMENTS[key][locale];
  return `${prefix(locale)}/${segment ? `${segment}/` : ''}`;
}

/**
 * Caminho da página de uma disciplina num idioma. RF-29 e sabatina fase 4, Decisão 3: o slug é
 * o mesmo nos dois idiomas; só o segmento da seção muda.
 *
 * @param slug Slug da disciplina.
 * @param locale Idioma.
 * @returns Caminho com barra final (ex.: `'/en/teaching/2026-2-relatividade-geral/'`).
 */
export function coursePath(slug: string, locale: Locale): string {
  return `${routePath('teaching', locale)}${slug}/`;
}

/**
 * Idioma de um caminho: `'en'` quando o primeiro segmento é exatamente `en` (`'/en'`,
 * `'/en/…'`); `'pt'` em todo o resto (RN-09) — `'/enx/'` e `'/ensino/'` são português.
 *
 * @param pathname Caminho da URL.
 * @returns Idioma do caminho.
 */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt';
}

/**
 * Par de um caminho no outro idioma (RF-29), aceitando o caminho com ou sem barra final. As
 * rotas fixas e a disciplina trocam pelo mapa, com o slug intacto; a 404 de um idioma pareia com
 * a Home do outro, porque não há "mesma página" a oferecer.
 *
 * @param pathname Caminho da URL.
 * @returns Caminho do par, com barra final.
 * @throws Error nomeando o caminho quando ele não tem par — rota nova fora do mapa reprova o
 *   build em vez de gerar link quebrado.
 */
export function counterpartPath(pathname: string): string {
  const from = localeFromPath(pathname);
  const to: Locale = from === 'en' ? 'pt' : 'en';
  const rest = pathname.slice(prefix(from).length).replace(/^\/|\/$/g, '');

  // RF-27: a 404 sai como `404.html` na raiz de cada árvore; só ela aceita a extensão.
  if (rest === '404' || rest === '404.html') return routePath('home', to);

  for (const key of Object.keys(SEGMENTS) as RouteKey[]) {
    if (SEGMENTS[key][from] === rest) return routePath(key, to);
  }

  const [section, slug, ...extra] = rest.split('/');
  if (section === SEGMENTS.teaching[from] && slug && extra.length === 0) {
    return coursePath(slug, to);
  }

  throw new Error(`counterpartPath: caminho sem par no outro idioma: ${pathname}`);
}
