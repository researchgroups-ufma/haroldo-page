/**
 * ============================================================================
 *  Arquivo      : site-gerado.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Teste de integração sobre o `dist/` recém-gerado (§11 do PRD, nível
 *                 "Integração": rotas geradas, nenhum rascunho publicado), RN-01 (rascunho nunca
 *                 aparece no HTML), RNF-02 (JS < 50 KB gzip por rota, zero framework de UI), RF-10
 *                 (disciplina não publicada não gera página), RF-27 (existência de `dist/404.html` e `dist/en/404.html`),
 *                 RF-29 (um seletor de idioma por página, para o par da rota),
 *                 RF-30 e RN-09 (canonical e `hreflang` com `x-default` no PT; as 404 sem eles),
 *                 RF-30 (sitemap bilíngue: mesmas rotas do `dist/`, sem 404, com os pares do `<head>`)
 *                 e §8.3 (um `<h1>` por página, `lang` por árvore: pt-BR; en sob `dist/en/`). Lê arquivos de `dist/`, não sobe
 *                 servidor. Roda separado da suíte padrão (`vitest.dist.config.ts`, plano 052,
 *                 README da fase 3, decisão 9) porque depende de `npm run build:pipeline` já ter
 *                 rodado.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-23
 *  Atualizado em: 2026-10-02
 *  Versão       : 0.4.0
 *
 *  Dependências : vitest, gray-matter, node:fs, node:path, node:zlib, src/lib/courses.ts,
 *                 src/i18n, src/lib/routes.ts
 *  Entradas     : os arquivos reais de `dist/` (gerado por `npm run build:pipeline`) e de
 *                 `content/{linhas-pesquisa,projetos,disciplinas,publicacoes}/`
 *  Saídas       : nenhuma — só asserções; a tabela rota → bytes gzip vai para `console.log`
 *  Uso          : npm run test:dist  (depois de `npm run build:pipeline`)
 *
 *  Notas        : todas as asserções são invariantes (existência, ausência, limite) — nenhuma
 *                 contagem exata de conteúdo (README da fase 3, decisão 6): uma alteração do
 *                 professor no `content/` não pode deixar este teste vermelho.
 *
 *                 v0.2.0 (revisão do ciclo 1): unificada a travessia de `<script>` em
 *                 `routeScriptFiles`, usada pelas asserções 6 e 7 — antes cada uma reimplementava a
 *                 recursão, com chave de deduplicação em dois formatos (`\` do `path.join` do
 *                 Windows × `/` do `path.posix`), o que contava o mesmo módulo duas vezes quando
 *                 alcançado por `<script src>` e por import. A chave passou a ser `resolve()` nos
 *                 dois casos. `src`/import que não resolve para arquivo existente agora lança, em
 *                 vez de contar `0` em silêncio.
 * ============================================================================
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import matter from 'gray-matter';
import { beforeAll, describe, expect, it } from 'vitest';
import { courseSlug } from '../../src/lib/courses';
import { strings } from '../../src/i18n';
import { HTML_LANG, counterpartPath, localeFromPath } from '../../src/lib/routes';
import { siteConfig } from '../../src/lib/config';

const repoRoot = join(__dirname, '../..');
const distDir = join(repoRoot, 'dist');
const contentDir = join(repoRoot, 'content');

beforeAll(() => {
  if (!existsSync(distDir)) {
    throw new Error(
      'tests/dist: dist/ não existe — rode `npm run build:pipeline` antes de `npm run test:dist`',
    );
  }
});

/** Lista recursivamente os arquivos sob `dir` cujo nome termina em algum de `extensions`. */
function listFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath, extensions);
    return extensions.some((ext) => entry.name.endsWith(ext)) ? [fullPath] : [];
  });
}

/** `true` se `absolutePath` estiver sob `dist/admin/` — o painel do Tina, fora do site público. */
function isAdminFile(absolutePath: string): boolean {
  return absolutePath.replace(/\\/g, '/').includes('/dist/admin/');
}

/** Todo `.html` de `dist/` fora de `dist/admin/`. */
function listSiteHtmlFiles(): string[] {
  return listFiles(distDir, ['.html']).filter((file) => !isAdminFile(file));
}

/**
 * Escapa `& < > ' "` exatamente como `html-escaper` (dependência de `astro/dist/runtime/server/
 * escape.js`, usada pela interpolação `{expr}` do Astro) — confirmado lendo
 * `node_modules/html-escaper/index.js`: `'` → `&#39;`, `"` → `&quot;`.
 */
function escapeLikeAstro(input: string): string {
  const table: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  };
  return input.replace(/[&<>'"]/g, (char) => table[char]);
}

/** Idioma da árvore a que o `.html` pertence (RF-28: `dist/en/**` é inglês; o resto, português). */
function fileLocale(htmlAbsolutePath: string) {
  return localeFromPath(htmlAbsolutePath.replace(distDir, '').replace(/\\/g, '/'));
}

/** Lista recursivamente os `.md` sob um diretório de coleção de `content/`. */
function listMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(fullPath);
    return entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

describe('rotas fixas existem (§11)', () => {
  it('dist/index.html, dist/sobre, dist/pesquisa, dist/ensino, dist/publicacoes, dist/404.html e dist/en/404.html existem', () => {
    const rotasFixas = [
      'index.html',
      'sobre/index.html',
      'pesquisa/index.html',
      'ensino/index.html',
      'publicacoes/index.html',
      '404.html',
      'en/index.html',
      'en/about/index.html',
      'en/research/index.html',
      'en/publications/index.html',
      'en/teaching/index.html',
      'en/404.html',
    ];
    for (const rota of rotasFixas) {
      expect(existsSync(join(distDir, rota)), `esperava dist/${rota}`).toBe(true);
    }
  });
});

describe('disciplina publicada gera página; rascunho não gera página (§11, RF-06, RF-10)', () => {
  const disciplinasFiles = listMarkdownFiles(join(contentDir, 'disciplinas'));
  const publicadas = disciplinasFiles.filter((file) => matter.read(file).data.publicado === true);
  // courseSlug só usa o nome-base do caminho (`path.posix.basename`), então o caminho absoluto
  // do sistema de arquivos serve tal como o `entry.filePath` relativo que o Astro passaria.
  const slugsEsperados = new Set(publicadas.map((file) => courseSlug(file)));

  it('toda disciplina publicada tem dist/ensino/<courseSlug>/index.html', () => {
    for (const slug of slugsEsperados) {
      expect(
        existsSync(join(distDir, 'ensino', slug, 'index.html')),
        `esperava dist/ensino/${slug}/index.html`,
      ).toBe(true);
    }
  });

  // RF-29, sabatina fase 4, Decisão 3: a disciplina EN usa o mesmo slug da rota PT.
  it('toda disciplina publicada tem dist/en/teaching/<courseSlug>/index.html (mesmo slug)', () => {
    for (const slug of slugsEsperados) {
      expect(
        existsSync(join(distDir, 'en', 'teaching', slug, 'index.html')),
        `esperava dist/en/teaching/${slug}/index.html`,
      ).toBe(true);
    }
  });

  it('nenhuma pasta em dist/en/teaching/ sem disciplina publicada correspondente', () => {
    const pastas = readdirSync(join(distDir, 'en', 'teaching'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    for (const pasta of pastas) {
      expect(slugsEsperados.has(pasta), `dist/en/teaching/${pasta}/ sem disciplina publicada`).toBe(
        true,
      );
    }
  });

  it('nenhuma pasta em dist/ensino/ sem disciplina publicada correspondente (rascunho não gera página)', () => {
    const ensinoDir = join(distDir, 'ensino');
    const pastas = readdirSync(ensinoDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    for (const pasta of pastas) {
      expect(slugsEsperados.has(pasta), `dist/ensino/${pasta}/ não corresponde a nenhuma disciplina publicada`).toBe(
        true,
      );
    }
  });
});

describe('rascunho nunca aparece em HTML algum (RN-01)', () => {
  it('a varredura inclui as rotas de dist/en/ (o rascunho também some em /en/)', () => {
    const rotas = listSiteHtmlFiles().map(routeLabel);
    expect(rotas).toContain('/en/research/index.html');
    expect(rotas).toContain('/en/publications/index.html');
  });

  const colecoes: { pasta: string; campoTitulo: 'titulo' | 'nome' }[] = [
    { pasta: 'linhas-pesquisa', campoTitulo: 'titulo' },
    { pasta: 'projetos', campoTitulo: 'titulo' },
    { pasta: 'disciplinas', campoTitulo: 'nome' },
    { pasta: 'publicacoes', campoTitulo: 'titulo' },
    { pasta: 'extensao', campoTitulo: 'titulo' },
  ];

  const rascunhos: { arquivo: string; titulo: string }[] = colecoes.flatMap(({ pasta, campoTitulo }) =>
    listMarkdownFiles(join(contentDir, pasta))
      .map((file) => ({ file, data: matter.read(file).data }))
      .filter(({ data }) => data.publicado === false)
      .map(({ file, data }) => ({ arquivo: file, titulo: String(data[campoTitulo]) })),
  );

  const htmlFiles = listSiteHtmlFiles();
  const htmlContents = htmlFiles.map((file) => readFileSync(file, 'utf-8'));

  it(
    rascunhos.length > 0
      ? `título de cada um dos ${rascunhos.length} rascunho(s) de content/ não aparece em nenhum .html de dist/ (cru nem escapado)`
      : 'passa trivialmente — nenhum arquivo com publicado: false em content/ hoje; não é prova de que a RN-01 está implementada',
    () => {
      for (const { arquivo, titulo } of rascunhos) {
        const escapado = escapeLikeAstro(titulo);
        htmlFiles.forEach((file, index) => {
          const conteudo = htmlContents[index];
          const apareceCru = conteudo.includes(titulo);
          const apareceEscapado = conteudo.includes(escapado);
          expect(
            apareceCru || apareceEscapado,
            `título do rascunho "${titulo}" (${arquivo}) aparece em ${file}`,
          ).toBe(false);
        });
      }
    },
  );
});

describe('um <h1> por página e `lang` por árvore (pt-BR; en sob dist/en/) (§8.3)', () => {
  const htmlFiles = listSiteHtmlFiles();

  it('todo .html de dist/ (fora de admin/) tem exatamente um <h1>', () => {
    for (const file of htmlFiles) {
      const conteudo = readFileSync(file, 'utf-8');
      const h1Count = (conteudo.match(/<h1[\s>]/g) ?? []).length;
      expect(h1Count, `${file} tem ${h1Count} <h1>, esperado 1`).toBe(1);
    }
  });

  it('todo .html de dist/ (fora de admin/) declara o <html lang> da sua árvore (pt-BR; en sob dist/en/)', () => {
    for (const file of htmlFiles) {
      const conteudo = readFileSync(file, 'utf-8');
      const esperado = HTML_LANG[fileLocale(file)];
      expect(conteudo, `${file} não declara <html lang="${esperado}">`).toContain(
        `<html lang="${esperado}">`,
      );
    }
  });
});

describe('aviso de idioma (F-07, RF-28)', () => {
  /** Quantas vezes o aviso do dicionário en aparece no `<main>` do arquivo. */
  const noticeCount = (rota: string, notice: string) => {
    const html = readFileSync(join(distDir, rota), 'utf-8');
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    return main.split(notice).length - 1;
  };
  const notice = strings('en').fallback.notice;

  // Pedido de 2026-10-07: a Home EN sai do aviso, como a Sobre; o `lang` continua.
  it('em /en/ o aviso aparece exatamente 0 vezes no <main>', () => {
    expect(noticeCount('en/index.html', notice)).toBe(0);
  });

  // Sabatina fase 4, Decisão 16: o aviso quebrava a Sobre EN a 1366x650; o `lang` continua.
  it('em /en/about/ o aviso aparece exatamente 0 vezes no <main> (Decisão 16)', () => {
    expect(noticeCount('en/about/index.html', notice)).toBe(0);
  });

  // F-07, RF-28: a Pesquisa EN mostra o aviso quando campo "T" caiu no PT (no máximo uma vez, sem
  // contar o conteúdo exato); Publicações EN não exibe campo "T" nem "P" (Decisões 13 e 15).
  it('em /en/research/ o aviso aparece no máximo uma vez no <main>', () => {
    expect(noticeCount('en/research/index.html', notice)).toBeLessThanOrEqual(1);
  });

  // Ensino e Disciplina EN: só `nome`/`descricao`/`ementa` ligam o aviso (Decisão 13: campos "P" não).
  it('em /en/teaching/ e em cada disciplina EN o aviso aparece no máximo uma vez no <main>', () => {
    expect(noticeCount('en/teaching/index.html', notice)).toBeLessThanOrEqual(1);
    const dir = join(distDir, 'en', 'teaching');
    for (const entry of readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      expect(
        noticeCount(`en/teaching/${entry.name}/index.html`, notice),
        entry.name,
      ).toBeLessThanOrEqual(1);
    }
  });

  it('em /en/publications/ não há aviso nem lang="pt-BR" no <main>', () => {
    const html = readFileSync(join(distDir, 'en/publications/index.html'), 'utf-8');
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    expect(noticeCount('en/publications/index.html', notice)).toBe(0);
    expect(main.includes('lang="pt-BR"')).toBe(false);
  });

  it('nenhuma rota fora de dist/en/ traz o aviso', () => {
    for (const file of listSiteHtmlFiles().filter((f) => fileLocale(f) === 'pt')) {
      expect(readFileSync(file, 'utf-8').includes(notice), `${file} traz o aviso`).toBe(false);
    }
  });
});

describe('nenhuma fonte de terceiro (RNF-02)', () => {
  it('nenhum .html ou .css de dist/ (fora de admin/) referencia fonts.googleapis.com ou fonts.gstatic.com', () => {
    const arquivos = listFiles(distDir, ['.html', '.css']).filter((file) => !isAdminFile(file));
    for (const file of arquivos) {
      const conteudo = readFileSync(file, 'utf-8');
      expect(conteudo.includes('fonts.googleapis.com'), `${file} referencia fonts.googleapis.com`).toBe(
        false,
      );
      expect(conteudo.includes('fonts.gstatic.com'), `${file} referencia fonts.gstatic.com`).toBe(false);
    }
  });
});

/** Rótulo de rota (caminho relativo a `dist/`, com `/`) para mensagens de asserção e a tabela. */
function routeLabel(htmlAbsolutePath: string): string {
  return htmlAbsolutePath.replace(distDir, '').replace(/\\/g, '/');
}

// Import estático relativo (`import ... from "./x.js"` / `import"./x.js"`). Só specifiers `./` ou
// `../` são seguidos — hoje o Vite só emite import relativo entre chunks de `dist/_astro/`; um
// specifier absoluto (pacote npm) não é um arquivo de `dist/` para resolver. Imports **dentro** de
// `<script>` inline (sem `src`) também não são seguidos: o Astro nunca emite `import` num inline do
// site público (confirmado no `dist/` real — só chamadas diretas, sem `import`), e um professor não
// edita JavaScript.
const STATIC_IMPORT_REGEX = /(?:from|import)\s*["']([^"']+\.js)["']/g;

/**
 * Resolve, recursivamente e sem contar duas vezes, os arquivos JS **externos** referenciados por
 * uma rota (`<script src="/_astro/....js">`, mais o que cada um importa estaticamente) e separa o
 * conteúdo de cada `<script>` inline — a função única de que as asserções 6 (peso) e 7 (zero
 * framework) partem, para não reimplementar a travessia duas vezes.
 *
 * A chave de deduplicação é `resolve()` de `node:path` (sempre separador nativo do SO) nos dois
 * casos — `<script src>` e specifier de import —, para o mesmo arquivo alcançado pelos dois
 * caminhos não ser contado duas vezes por causa de uma chave em `\` e outra em `/`.
 *
 * @param routeHtmlPath Caminho do `.html` da rota, só para nomear o problema na mensagem de erro.
 * @param htmlContent Conteúdo do `.html` da rota.
 * @returns `{ externos, inlines }`: caminhos absolutos únicos dos arquivos JS externos (na ordem
 *   de descoberta) e o texto de cada `<script>` inline não vazio.
 * @throws {Error} se um `src` de `<script>` ou um specifier de import estático não resolver para um
 *   arquivo existente em `dist/` — nomeia a rota e o caminho resolvido, em vez de contar `0` em
 *   silêncio.
 */
function routeScriptFiles(
  routeHtmlPath: string,
  htmlContent: string,
): { externos: string[]; inlines: string[] } {
  const visited = new Set<string>();
  const externos: string[] = [];

  function collect(absolutePath: string): void {
    const key = resolve(absolutePath);
    if (visited.has(key)) return;
    visited.add(key);
    if (!existsSync(key)) {
      throw new Error(
        `${routeLabel(routeHtmlPath)}: script referenciado não existe em dist/ — caminho resolvido "${key}"`,
      );
    }
    externos.push(key);
    const source = readFileSync(key, 'utf-8');
    const dir = dirname(key);
    for (const match of source.matchAll(STATIC_IMPORT_REGEX)) {
      const specifier = match[1];
      if (!specifier.startsWith('.')) continue; // só relativos — ver comentário de STATIC_IMPORT_REGEX
      collect(resolve(dir, specifier));
    }
  }

  const inlines: string[] = [];
  const scriptTagRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  for (const match of htmlContent.matchAll(scriptTagRegex)) {
    const attrs = match[1];
    const inlineBody = match[2];
    const srcMatch = attrs.match(/\bsrc="([^"]+\.js)"/);
    if (srcMatch) {
      collect(resolve(distDir, srcMatch[1].replace(/^\//, '')));
    } else if (inlineBody.trim() !== '') {
      inlines.push(inlineBody);
    }
  }

  return { externos, inlines };
}

describe('JS < 50 KB gzip por rota e zero framework de UI (RNF-02)', () => {
  const LIMITE_BYTES = 50 * 1024;
  const htmlFiles = listSiteHtmlFiles();

  it('cada rota tem menos de 50 KB de JavaScript comprimido (script externo + módulos importados + inline)', () => {
    const tabela: { rota: string; bytes: number }[] = [];
    for (const file of htmlFiles) {
      const conteudo = readFileSync(file, 'utf-8');
      const { externos, inlines } = routeScriptFiles(file, conteudo);
      let bytes = 0;
      for (const externo of externos) bytes += gzipSync(readFileSync(externo)).length;
      for (const inline of inlines) bytes += gzipSync(inline).length;
      tabela.push({ rota: routeLabel(file), bytes });
    }
    console.log('Rota → bytes gzip de JS:');
    for (const { rota, bytes } of tabela) {
      console.log(`  ${rota} → ${bytes} bytes`);
    }
    for (const { rota, bytes } of tabela) {
      expect(bytes, `rota ${rota} tem ${bytes} bytes gzip de JS, limite ${LIMITE_BYTES}`).toBeLessThan(
        LIMITE_BYTES,
      );
    }
  });

  it('nenhum JS referenciado pelas rotas do site contém "react-dom" ou "__REACT_DEVTOOLS" (o React do painel fica em dist/admin/)', () => {
    for (const file of htmlFiles) {
      const conteudo = readFileSync(file, 'utf-8');
      const { externos, inlines } = routeScriptFiles(file, conteudo);
      const bodies = [...externos.map((externo) => readFileSync(externo, 'utf-8')), ...inlines];
      for (const body of bodies) {
        expect(body.includes('react-dom'), `${routeLabel(file)} referencia react-dom`).toBe(false);
        expect(
          body.includes('__REACT_DEVTOOLS'),
          `${routeLabel(file)} referencia __REACT_DEVTOOLS`,
        ).toBe(false);
      }
    }
  });
});

describe('View Transitions: nomes únicos por página', () => {
  const htmlFiles = listSiteHtmlFiles();

  it('cada .html tem no máximo um vt-nome e um vt-menu, e ao menos um vt-nome', () => {
    for (const file of htmlFiles) {
      const conteudo = readFileSync(file, 'utf-8');
      for (const nome of ['vt-nome', 'vt-menu']) {
        const count = (conteudo.match(new RegExp(`class="[^"]*\\b${nome}\\b`, 'g')) ?? []).length;
        expect(count, `${file}: ${count} ${nome}`).toBeLessThanOrEqual(1);
      }
      expect(conteudo.includes('vt-nome'), `${file} sem vt-nome`).toBe(true);
    }
  });
});

describe('seletor de idioma (RF-29)', () => {
  /** Rota servida por um `.html` de `dist/`: `index.html` vira `/x/`; `404.html` fica como está. */
  const routeOf = (file: string) =>
    '/' +
    file
      .replace(distDir, '')
      .replace(/\\/g, '/')
      .replace(/^\//, '')
      .replace(/(^|\/)index\.html$/, '$1');

  it('toda página tem um único link com hreflang, para o par da rota, com o texto do idioma de destino', () => {
    for (const file of listSiteHtmlFiles()) {
      const html = readFileSync(file, 'utf-8');
      const route = routeOf(file);
      const lang = localeFromPath(route);
      const target = lang === 'pt' ? 'en' : 'pt';
      const links = [...html.matchAll(/<a\s[^>]*\bhreflang="[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(
        (m) => m[0],
      );
      expect(links.length, `${route}: ${links.length} links com hreflang`).toBe(1);
      const link = links[0];
      expect(link, `${route}: href`).toContain(`href="${counterpartPath(route)}"`);
      expect(link, `${route}: hreflang`).toContain(`hreflang="${HTML_LANG[target]}"`);
      expect(link, `${route}: lang`).toContain(` lang="${HTML_LANG[target]}"`);
      expect(link, `${route}: texto visível`).toContain(`>${strings(lang).language.code}</span>`);
      expect(link, `${route}: nome acessível`).toContain(strings(lang).language.name);
      expect(link, `${route}: sem vt-*`).not.toMatch(/\bvt-/);
    }
  });

  it('/ensino/ leva a /en/teaching/ e a disciplina troca só o prefixo e o segmento', () => {
    const href = (rota: string) =>
      readFileSync(join(distDir, rota, 'index.html'), 'utf-8').match(
        /<a\s[^>]*\bhreflang="[^"]*"[^>]*>/,
      )?.[0];
    expect(href('ensino')).toContain('href="/en/teaching/"');
    expect(href('en/teaching')).toContain('href="/ensino/"');
    const slug = readdirSync(join(distDir, 'ensino'), { withFileTypes: true }).find((e) =>
      e.isDirectory(),
    )?.name as string;
    expect(href(`ensino/${slug}`)).toContain(`href="/en/teaching/${slug}/"`);
    expect(href(`en/teaching/${slug}`)).toContain(`href="/ensino/${slug}/"`);
  });
});

describe('canonical e hreflang (RF-30, RN-09)', () => {
  const is404 = (route: string) => route === '/404.html' || route === '/en/404.html';
  /** Rota servida por um `.html`: `x/index.html` vira `/x/`; `404.html` fica como está. */
  const routeOf = (file: string) =>
    '/' +
    file
      .replace(distDir, '')
      .replace(/\\/g, '/')
      .replace(/^\//, '')
      .replace(/(^|\/)index\.html$/, '$1');
  const read = (route: string) =>
    readFileSync(join(distDir, route.replace(/^\//, ''), 'index.html'), 'utf-8');
  const canonicals = (html: string) => [...html.matchAll(/<link rel="canonical" href="([^"]*)"\s*\/?>/g)];
  const alternates = (html: string) =>
    [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"\s*\/?>/g)].map(
      (m) => ({ hreflang: m[1], href: m[2] }),
    );
  const origin = new URL(siteConfig.siteUrl).origin;
  const pages = listSiteHtmlFiles()
    .map((file) => ({ file, route: routeOf(file) }))
    .filter(({ route }) => !is404(route));

  it('a origem do canonical da Home é a de `siteConfig.siteUrl`', () => {
    expect(new URL(canonicals(read('/'))[0][1]).origin).toBe(origin);
  });

  it('toda página (fora as 404) tem um canonical, igual à URL da própria rota', () => {
    for (const { file, route } of pages) {
      const found = canonicals(readFileSync(file, 'utf-8'));
      expect(found.length, `${route}: ${found.length} canonicals`).toBe(1);
      expect(found[0][1], `${route}: canonical`).toBe(`${origin}${route}`);
    }
  });

  it('toda página tem os alternates pt-BR, en e x-default, absolutos, com x-default = pt-BR', () => {
    for (const { file, route } of pages) {
      const found = alternates(readFileSync(file, 'utf-8'));
      expect(
        found.map((a) => a.hreflang),
        `${route}: hreflang`,
      ).toEqual(['pt-BR', 'en', 'x-default']);
      const [pt, en, xDefault] = found;
      expect(pt.href, `${route}: pt-BR`).toBe(
        `${origin}${localeFromPath(route) === 'pt' ? route : counterpartPath(route)}`,
      );
      expect(en.href, `${route}: en`).toBe(
        `${origin}${localeFromPath(route) === 'en' ? route : counterpartPath(route)}`,
      );
      expect(xDefault.href, `${route}: x-default`).toBe(pt.href);
    }
  });

  it('reciprocidade: a página apontada pelo alternate en existe e aponta de volta no pt-BR', () => {
    for (const { file, route } of pages) {
      const enHref = alternates(readFileSync(file, 'utf-8'))[1].href;
      const enRoute = enHref.slice(origin.length);
      expect(existsSync(join(distDir, enRoute, 'index.html')), `${route}: ${enRoute} não existe`).toBe(
        true,
      );
      const back = alternates(read(enRoute));
      const ptHref = back.find((a) => a.hreflang === 'pt-BR')?.href;
      const own = alternates(readFileSync(file, 'utf-8'))[0].href;
      expect(ptHref, `${enRoute} não aponta de volta para o pt-BR de ${route}`).toBe(own);
    }
  });

  it.each(['404.html', 'en/404.html'])('dist/%s não tem canonical nem alternate', (rota) => {
    const html = readFileSync(join(distDir, rota), 'utf-8');
    expect(canonicals(html).length).toBe(0);
    expect(alternates(html).length).toBe(0);
    expect(html.includes('rel="canonical"') || html.includes('rel="alternate"')).toBe(false);
  });
});

describe('sitemap bilíngue (RF-30, RN-01)', () => {
  const origin = new URL(siteConfig.siteUrl).origin;
  /** Rota servida por um `.html`: `x/index.html` vira `/x/`; `404.html` fica como está. */
  const routeOf = (file: string) =>
    '/' +
    file
      .replace(distDir, '')
      .replace(/\\/g, '/')
      .replace(/^\//, '')
      .replace(/(^|\/)index\.html$/, '$1');
  const sitemap = readFileSync(join(distDir, 'sitemap-0.xml'), 'utf-8');
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: m[1].match(/<loc>([^<]*)<\/loc>/)?.[1] as string,
    links: [...m[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]*)" href="([^"]*)"\s*\/>/g)].map(
      (l) => ({ hreflang: l[1], href: l[2] }),
    ),
  }));
  // O conjunto esperado vem das rotas `.html` do `dist/`, não do próprio sitemap.
  const expected = listSiteHtmlFiles()
    .map(routeOf)
    .filter((route) => route !== '/404.html' && route !== '/en/404.html')
    .map((route) => `${origin}${route}`);

  it('o sitemap-index.xml aponta para o sitemap-0.xml', () => {
    const index = readFileSync(join(distDir, 'sitemap-index.xml'), 'utf-8');
    expect(index).toContain(`<loc>${origin}/sitemap-0.xml</loc>`);
  });

  it('o conjunto de <loc> é exatamente o das rotas .html de dist/ (fora de admin/ e das 404)', () => {
    expect(expected.length).toBeGreaterThan(0);
    expect(entries.map((e) => e.loc).sort()).toEqual([...expected].sort());
  });

  it('nenhum <loc> com /404 nem /admin, e nenhum duplicado', () => {
    const locs = entries.map((e) => e.loc);
    for (const loc of locs) {
      expect(loc, loc).not.toMatch(/\/404|\/admin/);
    }
    expect(new Set(locs).size).toBe(locs.length);
  });

  // RN-01: rascunho não gera página, então a rota nunca entra no sitemap.
  it('todo <loc> de disciplina tem o slug de uma disciplina publicada (nenhum rascunho)', () => {
    const publicadas = new Set(
      listMarkdownFiles(join(contentDir, 'disciplinas'))
        .filter((file) => matter.read(file).data.publicado === true)
        .map((file) => courseSlug(file)),
    );
    const courseLocs = entries
      .map((e) => e.loc)
      .filter((loc) => /\/(ensino|en\/teaching)\/[^/]+\/$/.test(loc));
    expect(courseLocs.length, 'nenhum <loc> de disciplina conferido').toBeGreaterThan(0);
    for (const loc of courseLocs) {
      const slug = loc.split('/').at(-2) as string;
      expect(publicadas.has(slug), `${loc}: slug fora das disciplinas publicadas`).toBe(true);
    }
  });

  it('todo <loc> traz os alternates pt-BR, en e x-default, iguais aos do <head> da mesma página', () => {
    const alternates = (html: string) =>
      [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"\s*\/?>/g)].map(
        (m) => ({ hreflang: m[1], href: m[2] }),
      );
    for (const { loc, links } of entries) {
      const route = loc.slice(origin.length);
      const head = alternates(readFileSync(join(distDir, route, 'index.html'), 'utf-8'));
      expect(head.length, `${route}: head sem alternates`).toBe(3);
      expect(links, `${route}: alternates do sitemap × do <head>`).toEqual(head);
    }
  });

  it('os pares são recíprocos: o par aponta para um <loc> que aponta de volta', () => {
    const byLoc = new Map(entries.map((e) => [e.loc, e.links]));
    for (const { loc, links } of entries) {
      for (const link of links.filter((l) => l.hreflang !== 'x-default')) {
        expect(byLoc.has(link.href), `${loc}: ${link.href} não está no sitemap`).toBe(true);
        expect(byLoc.get(link.href), `${link.href} não aponta de volta`).toEqual(links);
      }
    }
  });
});

describe('desempenho e metadados', () => {
  const htmlFiles = listSiteHtmlFiles();

  it.each(['publicacoes', 'en/publications'])('HTML de /%s/ não carrega o ScrollTrigger de saída (GSAP sob demanda)', (rota) => {
    const html = readFileSync(join(distDir, rota, 'index.html'), 'utf-8');
    const pending = [...html.matchAll(/<script[^>]+src="\/([^"]+)"/g)].map((m) => m[1]);
    const seen = new Set<string>();
    // Segue os imports estáticos: um chunk importado estaticamente também baixa de saída.
    // O `import()` dinâmico não entra. `scrollerProxy` identifica o código da biblioteca — o
    // nome "ScrollTrigger" sozinho aparece no script da página, no caminho do import().
    while (pending.length > 0) {
      const file = pending.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      const code = readFileSync(join(distDir, file), 'utf-8');
      expect(code.includes('scrollerProxy'), `${file} traz o ScrollTrigger`).toBe(false);
      for (const m of code.matchAll(/(?:from|import)\s*["'`]\.\/([^"'`]+)["'`]/g)) {
        pending.push(`${dirname(file)}/${m[1]}`);
      }
    }
    expect(seen.size, `nenhum script lido em /${rota}/`).toBeGreaterThan(0);
  });

  it('dist/favicon.svg existe e toda página o declara', () => {
    expect(existsSync(join(distDir, 'favicon.svg'))).toBe(true);
    for (const file of htmlFiles) {
      expect(readFileSync(file, 'utf-8'), file).toContain('href="/favicon.svg"');
    }
  });
});

describe('navegação principal sem "Início"', () => {
  const htmlFiles = listSiteHtmlFiles();

  it('em toda página, o <nav> principal não tem link para "/" — a volta à Home é o nome', () => {
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const label = strings(fileLocale(file)).site.mainNavLabel;
      const nav = html.match(new RegExp(`<nav aria-label="${label}"[\\s\\S]*?</nav>`))?.[0];
      expect(nav, `${file} sem navegação principal`).toBeDefined();
      expect(nav?.includes('href="/"'), `${file}: menu com "Início"`).toBe(false);
      expect(nav?.includes('href="/en/"'), `${file}: menu com "Início"`).toBe(false);
    }
  });
});

describe('página de disciplina: seta de volta no lugar da trilha', () => {
  // PT: dist/ensino/<slug>/ -> /ensino/; EN (RF-28): dist/en/teaching/<slug>/ -> /en/teaching/.
  const arvores = [
    { dir: join(distDir, 'ensino'), locale: 'pt', href: '/ensino/' },
    { dir: join(distDir, 'en', 'teaching'), locale: 'en', href: '/en/teaching/' },
  ] as const;

  for (const { dir, locale, href } of arvores) {
    const rotulo = strings(locale).course.back;
    it(`${locale}: sem "Trilha de navegação"; um link "${rotulo}" para ${href} antes do <h1>`, () => {
      const pages = readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(dir, entry.name, 'index.html'));
      expect(pages.length).toBeGreaterThan(0);
      for (const file of pages) {
        const html = readFileSync(file, 'utf-8');
        expect(html.includes('Trilha de navegação'), `${file} ainda tem a trilha`).toBe(false);
        const backTag = html.match(
          new RegExp(`<a [^>]*aria-label="${rotulo}"[^>]*>`),
        )?.[0];
        expect(backTag, `${file} sem a seta de volta`).toBeDefined();
        expect(backTag, file).toContain(`href="${href}"`);
        expect(html.indexOf(backTag as string), `${file}: a seta vem antes do <h1>`).toBeLessThan(
          html.indexOf('<h1'),
        );
      }
    });
  }
});

describe('contato da Home igual ao da Sobre', () => {
  /** Links do parágrafo de contato (o que tem o `mailto:`), na ordem em que aparecem. */
  const contactHrefs = (rota: string) => {
    const html = readFileSync(join(distDir, rota, 'index.html'), 'utf-8');
    const bloco = html.match(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?mailto:[\s\S]*?<\/p>/)?.[0] ?? '';
    return [...bloco.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  };

  it('mesmos links, na mesma sequência, começando pelo e-mail', () => {
    const sobre = contactHrefs('sobre');
    expect(sobre.length).toBeGreaterThan(1);
    expect(sobre[0]).toMatch(/^mailto:/);
    expect(contactHrefs('')).toEqual(sobre);
  });

  it('o mesmo vale em inglês (/en/ e /en/about/)', () => {
    const about = contactHrefs('en/about');
    expect(about.length).toBeGreaterThan(1);
    expect(about[0]).toMatch(/^mailto:/);
    expect(contactHrefs('en')).toEqual(about);
  });
});

describe('cabeçalho de página fora da área que rola', () => {
  it('nas páginas internas, o <h1> vem antes do #conteudo (que rola), não dentro dele', () => {
    for (const file of listSiteHtmlFiles()) {
      const html = readFileSync(file, 'utf-8');
      const scroller = html.indexOf('id="conteudo"');
      expect(scroller, `${file} sem #conteudo`).toBeGreaterThan(-1);
      // a Home (PT e EN) não tem cabeçalho de página
      if (file === join(distDir, 'index.html') || file === join(distDir, 'en', 'index.html')) continue;
      expect(html.indexOf('<h1'), `${file}: <h1> dentro da área que rola`).toBeLessThan(scroller);
    }
  });
});

describe('sublinhado que segue o cursor (link-traco) no menu e no contato', () => {
  /** Tags <a> de um trecho de HTML. */
  const anchors = (trecho: string) => trecho.match(/<a [^>]*>[\s\S]*?<\/a>/g) ?? [];

  it('todo link do menu principal usa link-traco', () => {
    for (const file of listSiteHtmlFiles()) {
      const html = readFileSync(file, 'utf-8');
      const label = strings(fileLocale(file)).site.mainNavLabel;
      const nav = html.match(new RegExp(`<nav aria-label="${label}"[\\s\\S]*?</nav>`))?.[0] ?? '';
      const links = anchors(nav);
      expect(links.length, file).toBeGreaterThan(0);
      for (const link of links) expect(link, file).toContain('link-traco');
    }
  });

  it('todo link do contato (Home e Sobre) usa link-traco', () => {
    for (const rota of ['', 'sobre', 'en', 'en/about']) {
      const html = readFileSync(join(distDir, rota, 'index.html'), 'utf-8');
      const bloco = html.match(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?mailto:[\s\S]*?<\/p>/)?.[0] ?? '';
      const links = anchors(bloco);
      expect(links.length, rota).toBeGreaterThan(1);
      for (const link of links) expect(link, rota).toContain('link-traco');
    }
  });
});
