/**
 * ============================================================================
 *  Arquivo      : navigation.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Lista de rotas da navegação principal (§5.1 da identidade
 *                 visual) e a regra de "página ativa", isoladas do
 *                 componente de cabeçalho.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-25
 *  Versão       : 0.2.0
 *
 *  Dependências : src/lib/routes.ts (caminhos por idioma), src/lib/config.ts
 *                 (tipo `Locale`)
 *  Entradas     : `href`/`pathname` — caminhos de URL do site
 *  Saídas       : `navItems` (lista de rota por idioma) e `isActivePath` (booleano)
 *  Uso          : navItems('pt').map((item) => ({ ...item, active: isActivePath(item.href, Astro.url.pathname) }))
 *
 *  Notas        : todo `href` termina em `/` — o `wrangler.toml` não declara
 *                 `html_handling` e o default `auto-trailing-slash` responde
 *                 307 sem a barra (achado do plano 026).
 * ============================================================================
 */
import type { Locale } from './config';
import { localeFromPath, routePath, type RouteKey } from './routes';

/** Ordem de exibição da navegação principal (§5.1). */
const NAV_ORDER: readonly RouteKey[] = ['home', 'about', 'research', 'teaching', 'publications'];

/**
 * Rotas da navegação principal num idioma, na ordem de exibição (§5.1). `key` é a
 * chave do dicionário (`t.nav`) com o rótulo da rota; `href` sai do mapa de rotas.
 *
 * @param locale Idioma da navegação.
 * @returns Itens `{ key, href }`, todo `href` com barra final.
 */
export function navItems(locale: Locale): { key: RouteKey; href: string }[] {
  return NAV_ORDER.map((key) => ({ key, href: routePath(key, locale) }));
}

/**
 * Determina se um item de navegação está ativo para o caminho atual.
 *
 * Normaliza `href` e `pathname` para terminar em `/` antes de comparar. A
 * Home de qualquer idioma (`'/'`, `'/en/'`) só fica ativa em igualdade exata —
 * `'/en/'` é prefixo de toda rota EN; os demais
 * itens ficam ativos quando `pathname` **começa** com o `href` — assim
 * `/ensino/` marca "Ensino" como ativo também em `/ensino/[slug]/` (§5.1),
 * sem que `/ensinox/` acione `/ensino/` por coincidência de prefixo.
 *
 * @param href Caminho do item de navegação (ex.: `/ensino/`).
 * @param pathname Caminho atual da requisição (`Astro.url.pathname`).
 * @returns `true` se o item corresponde ao caminho atual.
 */
export function isActivePath(href: string, pathname: string): boolean {
  const normalizedHref = href.endsWith('/') ? href : `${href}/`;
  const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (normalizedHref === routePath('home', localeFromPath(normalizedHref))) {
    return normalizedPathname === normalizedHref;
  }

  return normalizedPathname.startsWith(normalizedHref);
}
