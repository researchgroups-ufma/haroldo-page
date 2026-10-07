/**
 * ============================================================================
 *  Arquivo      : i18n.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Testes de internacionalização sobre o `dist/` recém-gerado: toda rota PT tem
 *                 par EN e vice-versa; toda rota do mapa existe no `dist/` (dívida (e) da fase
 *                 3); M-07 (nenhum valor do dicionário `pt` no HTML de `/en/**` fora de
 *                 `lang="pt-BR"`) e o simétrico, que cumpre o §10.4 (nenhum valor do dicionário
 *                 `en` nas rotas PT fora de `lang="en"`). Sabatina fase 4, Decisão 12 e decisão
 *                 de fatiamento 12 (README da fase 4).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-02
 *  Atualizado em: 2026-10-02
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, node:fs, node:path, src/lib/routes.ts, src/i18n,
 *                 tests/i18n/excecoes-m07.ts, tests/dist/html-texto.ts
 *  Entradas     : os arquivos reais de `dist/` (gerado por `npm run build:pipeline`)
 *  Saídas       : nenhuma — só asserções
 *  Uso          : npm run test:dist  (depois de `npm run build:pipeline`)
 *
 *  Notas        : LIMITE (§10.4): o teste só pega texto de interface hardcoded que coincide com
 *                 um valor de dicionário — texto solto que não coincide com nenhum fica para a
 *                 inspeção manual do plano 073. Comprimento mínimo 4 caracteres; casamento
 *                 sensível a maiúsculas e com fronteira de palavra Unicode. Valores que são
 *                 função entram pelos trechos fixos (avaliação com sentinela); `date.format`
 *                 não tem trecho fixo de 4+ caracteres e fica de fora, nos dois idiomas. As
 *                 exceções (valores iguais nos dois idiomas) vêm só de
 *                 `tests/i18n/excecoes-m07.ts`. Conteúdo do professor sem `lang` que repita um
 *                 valor do dicionário reprova com rota, chave e trecho: a saída é decisão do
 *                 orquestrador, não uma exceção acrescentada aqui.
 * ============================================================================
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { en } from '../../src/i18n/en';
import { pt } from '../../src/i18n/pt';
import {
  HTML_LANG,
  counterpartPath,
  localeFromPath,
  routePath,
  type RouteKey,
} from '../../src/lib/routes';
import { M07_EXCEPTIONS } from '../i18n/excecoes-m07';
import { extractVisible, type HtmlPiece } from './html-texto';

const distDir = join(__dirname, '../..', 'dist');

/** Mínimo de caracteres (após `trim`) de um valor de dicionário para entrar na comparação. */
const MIN_LENGTH = 4;

/** Marcador passado como argumento às funções do dicionário para isolar o texto fixo. */
const SENTINEL = '\u0001';

/** Todas as chaves de rota; o tipo reprova o `astro check` se `RouteKey` ganhar ou perder uma. */
const ROUTE_KEYS: Record<RouteKey, true> = {
  home: true,
  about: true,
  research: true,
  teaching: true,
  outreach: true,
  publications: true,
};

beforeAll(() => {
  if (!existsSync(distDir)) {
    throw new Error(
      'tests/dist: dist/ não existe — rode `npm run build:pipeline` antes de `npm run test:dist`',
    );
  }
});

/** Lista recursivamente os `.html` sob `dir`, fora de `admin/` (o painel do Tina). */
function listSiteHtml(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'admin' && dir === distDir ? [] : listSiteHtml(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

/** Rota (`/en/about/`, `/404.html`) de um `.html` de `dist/`. */
function routeOf(file: string): string {
  const rel = '/' + relative(distDir, file).replace(/\\/g, '/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

/** Caminho do `.html` em `dist/` que serve a rota. */
function fileOf(route: string): string {
  return route.endsWith('/') ? join(distDir, route, 'index.html') : join(distDir, route);
}

describe('extrator de texto do HTML (tests/dist/html-texto.ts)', () => {
  it('pula a subárvore do lang pedido, com aninhamento', () => {
    const html = '<div lang="pt-BR"><p>Olá <b>mundo</b></p></div><p>fica</p>';
    const pieces = extractVisible(html, 'pt-BR', '/x/');
    expect(pieces.map((p) => p.value)).toEqual(['fica']);
  });

  it('trata elemento vazio sem empilhar e traz atributos comparáveis, não os ignorados', () => {
    const html = '<p>antes<br>depois<img alt="Retrato &amp; foto" src="/a.png" class="c"></p>';
    const pieces = extractVisible(html, 'pt-BR', '/x/');
    expect(pieces.map((p) => `${p.kind}:${p.value}`)).toEqual([
      'text:antes',
      'text:depois',
      'attr:Retrato & foto',
    ]);
  });

  it('lang aninhado: sai só a subárvore do lang pedido, e o <html> nunca é pulado', () => {
    const html =
      '<html lang="pt-BR"><body><p>a</p><section lang="en"><p>b</p><span lang="pt-BR">c</span>' +
      '</section><p>d</p></body></html>';
    expect(extractVisible(html, 'en', '/x/').map((p) => p.value)).toEqual(['a', 'd']);
    expect(extractVisible(html, 'pt-BR', '/x/').map((p) => p.value)).toEqual(['a', 'b', 'd']);
  });

  it('descarta <script> e <style> inteiros e decodifica entidades do Astro', () => {
    const html =
      '<head><script>var x = "Sobre";</script><style>.a{content:"Sobre"}</style></head>' +
      '<p>Tom &#39;n&#39; &quot;Jerry&quot; &lt;3</p>';
    expect(extractVisible(html, 'pt-BR', '/x/').map((p) => p.value)).toEqual([
      `Tom 'n' "Jerry" <3`,
    ]);
  });

  it('lança erro nomeando a rota quando a pilha não fecha', () => {
    expect(() => extractVisible('<div><p>x</div>', 'pt-BR', '/rota/')).toThrow('/rota/');
    expect(() => extractVisible('<div>x', 'pt-BR', '/rota/')).toThrow('/rota/');
  });
});

describe('par EN/PT de toda rota (§11, RF-29)', () => {
  const files = listSiteHtml(distDir);

  /** Rotas de uma árvore cujo par (pelo mapa) não existe em `dist/`. */
  function semPar(locale: 'pt' | 'en'): { checked: number; missing: string[] } {
    const routes = files.map(routeOf).filter((r) => localeFromPath(r) === locale);
    const missing = routes.filter((r) => !existsSync(fileOf(counterpartPath(r))));
    return { checked: routes.length, missing };
  }

  it('toda rota PT (inclusive a 404) aponta, pelo mapa, para um .html EN que existe', () => {
    const { checked, missing } = semPar('pt');
    expect(checked).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it('toda rota EN (inclusive a 404) aponta, pelo mapa, para um .html PT que existe', () => {
    const { checked, missing } = semPar('en');
    expect(checked).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});

describe('mapa de rotas × dist/ (dívida (e) da fase 3)', () => {
  it('routePath(chave, idioma) existe em dist/ para toda chave e todo idioma', () => {
    const keys = Object.keys(ROUTE_KEYS) as RouteKey[];
    const missing: string[] = [];
    let checked = 0;
    for (const key of keys) {
      for (const locale of ['pt', 'en'] as const) {
        checked++;
        const route = routePath(key, locale);
        if (!existsSync(fileOf(route))) missing.push(`${key}/${locale}: ${route}`);
      }
    }
    expect(checked).toBe(keys.length * 2);
    expect(missing).toEqual([]);
  });
});

/** Valor de dicionário que entra na comparação: caminho de chave e trecho fixo. */
interface Fragment {
  path: string;
  text: string;
  pattern: RegExp;
}

/**
 * Percorre o dicionário e devolve os trechos fixos de 4+ caracteres, fora de `M07_EXCEPTIONS`.
 * Função é avaliada com a sentinela em todo argumento e partida nela.
 */
function collectFragments(node: unknown, path: string[] = []): Fragment[] {
  const key = path.join('.');
  if (M07_EXCEPTIONS.includes(key)) return [];
  let texts: string[] = [];
  if (typeof node === 'string') texts = [node];
  else if (typeof node === 'function') {
    const fn = node as (...args: string[]) => string;
    texts = fn(...Array<string>(fn.length).fill(SENTINEL)).split(SENTINEL);
  } else if (node !== null && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => collectFragments(v, [...path, k]));
  }
  return texts
    .map((text) => text.trim())
    .filter((text) => text.length >= MIN_LENGTH)
    .map((text) => ({
      path: key,
      text,
      pattern: new RegExp(
        '(?<![\\p{L}\\p{N}])' + text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}])',
        'u',
      ),
    }));
}

/**
 * Varre as rotas de uma árvore atrás de valores do dicionário de OUTRO idioma, fora das
 * subárvores com o `lang` desse outro idioma.
 */
function leaks(locale: 'pt' | 'en', foreign: unknown, foreignLang: string) {
  const fragments = collectFragments(foreign);
  const routes = listSiteHtml(distDir)
    .map((file) => ({ file, route: routeOf(file) }))
    .filter(({ route }) => localeFromPath(route) === locale);
  const found: string[] = [];
  let compared = 0;
  for (const { file, route } of routes) {
    const pieces: HtmlPiece[] = extractVisible(readFileSync(file, 'utf8'), foreignLang, route);
    expect(pieces.length, `${route}: nenhum trecho extraído`).toBeGreaterThan(0);
    for (const piece of pieces) {
      for (const fragment of fragments) {
        compared++;
        if (fragment.pattern.test(piece.value)) {
          found.push(`${route} | ${fragment.path} | "${fragment.text}" em ${piece.where}: "${piece.value}"`);
        }
      }
    }
  }
  return { routes: routes.length, fragments: fragments.length, compared, found };
}

describe('M-07: nenhum valor do dicionário pt em /en/** fora de lang="pt-BR"', () => {
  it('reprova nomeando rota, chave e trecho', () => {
    const result = leaks('en', pt, HTML_LANG.pt);
    expect(result.routes).toBeGreaterThan(0);
    expect(result.fragments).toBeGreaterThan(0);
    expect(result.compared).toBeGreaterThan(0);
    expect(result.found).toEqual([]);
  });
});

describe('§10.4: nenhum valor do dicionário en nas rotas PT fora de lang="en"', () => {
  it('reprova nomeando rota, chave e trecho', () => {
    const result = leaks('pt', en, HTML_LANG.en);
    expect(result.routes).toBeGreaterThan(0);
    expect(result.fragments).toBeGreaterThan(0);
    expect(result.compared).toBeGreaterThan(0);
    expect(result.found).toEqual([]);
  });
});
