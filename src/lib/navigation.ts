/**
 * ============================================================================
 *  Arquivo      : navigation.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Lista de rotas da navegação principal (§5.1 da identidade
 *                 visual) e a regra de "página ativa", isoladas do
 *                 componente de cabeçalho.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-16
 *  Versão       : 0.1.0
 *
 *  Dependências : src/i18n/pt.ts (tipo `UiStrings`, só para tipar `key`)
 *  Entradas     : `href`/`pathname` — caminhos de URL do site
 *  Saídas       : `NAV_ITEMS` (lista de rota) e `isActivePath` (booleano)
 *  Uso          : NAV_ITEMS.map((item) => ({ ...item, active: isActivePath(item.href, Astro.url.pathname) }))
 *
 *  Notas        : todo `href` termina em `/` — o `wrangler.toml` não declara
 *                 `html_handling` e o default `auto-trailing-slash` responde
 *                 307 sem a barra (achado do plano 026).
 * ============================================================================
 */
import type { UiStrings } from '../i18n/pt';

/**
 * Rotas da navegação principal, na ordem de exibição (§5.1). `key` é a chave
 * de `pt.nav` correspondente ao rótulo da rota.
 */
export const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/sobre/', key: 'about' },
  { href: '/pesquisa/', key: 'research' },
  { href: '/ensino/', key: 'teaching' },
  { href: '/publicacoes/', key: 'publications' },
] as const satisfies readonly { href: string; key: keyof UiStrings['nav'] }[];

/**
 * Determina se um item de navegação está ativo para o caminho atual.
 *
 * Normaliza `href` e `pathname` para terminar em `/` antes de comparar. A
 * home (`'/'`) só fica ativa quando `pathname` é exatamente `/`; os demais
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

  if (normalizedHref === '/') {
    return normalizedPathname === '/';
  }

  return normalizedPathname.startsWith(normalizedHref);
}
