/**
 * ============================================================================
 *  Arquivo      : html-texto.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Extrator mínimo de texto visível e de valores de atributo de um HTML
 *                 minificado do `dist/`, para o teste de M-07 (rotas `/en` sem string de
 *                 interface em português) e do simétrico (§10.4: nenhuma string de interface
 *                 hardcoded), plano 072. Pula as subárvores de um `lang` pedido, os blocos
 *                 `<script>` e `<style>` e os atributos que não são texto de interface.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-02
 *  Atualizado em: 2026-10-02
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma (sem parser de HTML do npm, plano 072)
 *  Entradas     : HTML do `dist/`, `lang` a pular, rota (só para nomear o erro)
 *  Saídas       : lista de trechos `{ kind, where, value }`, com entidades decodificadas e
 *                 espaços colapsados
 *  Uso          : extractVisible(html, 'pt-BR', '/en/about/')
 *
 *  Notas        : o HTML do Astro é bem-formado; tag fechada sem a abertura correspondente, ou
 *                 aberta e nunca fechada, lança erro nomeando a rota em vez de seguir com a
 *                 pilha corrompida. O `<html>` nunca é pulado: a rota PT tem `lang="pt-BR"` nele
 *                 e a EN, `lang="en"`.
 * ============================================================================
 */

/** Trecho comparável: texto de um nó (`where` = tag pai) ou valor de atributo (`where` = `tag[nome]`). */
export interface HtmlPiece {
  kind: 'text' | 'attr';
  where: string;
  value: string;
}

/** Elementos sem fechamento no HTML. */
const VOID_TAGS = new Set(
  'area base br col embed hr img input link meta source track wbr'.split(' '),
);

/** Atributos que não carregam texto de interface (decisão de fatiamento 12 da fase 4). */
const IGNORED_ATTRS = new Set(
  'href src srcset class id style lang hreflang rel type for role tabindex'.split(' '),
);

const TOKEN =
  /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][^\s>]*)\s*>|<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const ATTRIBUTE = /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

/** Decodifica as entidades que o Astro emite (`html-escaper`) e as numéricas. */
function decodeEntities(input: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return input.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));/g, (whole, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return named[name] ?? whole;
  });
}

/** Colapsa espaços e aplica `trim`; o HTML minificado deixa quebras e recuos dentro dos nós. */
function normalize(input: string): string {
  return decodeEntities(input).replace(/\s+/g, ' ').trim();
}

/**
 * Extrai os trechos comparáveis de um HTML, fora das subárvores com `lang="<skipLang>"`.
 *
 * @param html HTML completo de uma rota do `dist/`.
 * @param skipLang Valor de `lang` cujas subárvores saem (ex.: `'pt-BR'` nas rotas EN).
 * @param route Rota, só para nomear o erro.
 * @returns Texto de nós e valores de atributo (exceto `href`, `src`, `srcset`, `class`, `id`,
 *   `style`, `lang`, `hreflang`, `rel`, `type`, `for`, `role`, `tabindex` e `data-astro-*`),
 *   sem vazios.
 * @throws Error nomeando a rota quando a pilha de elementos não fecha.
 */
export function extractVisible(html: string, skipLang: string, route: string): HtmlPiece[] {
  const pieces: HtmlPiece[] = [];
  const stack: { tag: string; skip: boolean }[] = [];
  let skipping = 0;
  let last = 0;
  TOKEN.lastIndex = 0;

  const addText = (end: number) => {
    const value = normalize(html.slice(last, end));
    const parent = stack.length ? stack[stack.length - 1].tag : '(raiz)';
    if (!skipping && value) pieces.push({ kind: 'text', where: parent, value });
  };

  for (let match = TOKEN.exec(html); match; match = TOKEN.exec(html)) {
    addText(match.index);
    last = TOKEN.lastIndex;
    const [token, closing, opening, rawAttrs = ''] = match;
    if (token.startsWith('<!')) continue;

    if (closing) {
      const tag = closing.toLowerCase();
      if (VOID_TAGS.has(tag)) continue;
      const top = stack.pop();
      if (!top || top.tag !== tag) {
        throw new Error(`${route}: </${tag}> sem abertura correspondente (topo: ${top?.tag})`);
      }
      if (top.skip) skipping--;
      continue;
    }

    const tag = opening.toLowerCase();
    const attrs: [string, string][] = [];
    for (const a of rawAttrs.matchAll(ATTRIBUTE)) {
      attrs.push([a[1].toLowerCase(), a[2] ?? a[3] ?? a[4] ?? '']);
    }
    const skip = tag !== 'html' && attrs.some(([n, v]) => n === 'lang' && v === skipLang);

    if (!skipping && !skip) {
      for (const [name, value] of attrs) {
        if (IGNORED_ATTRS.has(name) || name.startsWith('data-astro-')) continue;
        const text = normalize(value);
        if (text) pieces.push({ kind: 'attr', where: `${tag}[${name}]`, value: text });
      }
    }

    if (tag === 'script' || tag === 'style') {
      // Bloco inteiro fora da comparação: o conteúdo é código, não texto de interface.
      const close = html.toLowerCase().indexOf(`</${tag}`, last);
      if (close === -1) throw new Error(`${route}: <${tag}> sem fechamento`);
      TOKEN.lastIndex = html.indexOf('>', close) + 1;
      last = TOKEN.lastIndex;
      continue;
    }

    if (VOID_TAGS.has(tag) || rawAttrs.trimEnd().endsWith('/')) continue;
    stack.push({ tag, skip });
    if (skip) skipping++;
  }
  addText(html.length);
  if (stack.length) throw new Error(`${route}: <${stack[stack.length - 1].tag}> nunca fechado`);
  return pieces;
}
