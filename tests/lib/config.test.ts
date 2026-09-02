import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteConfig } from '../../src/lib/config';

const srcDir = join(__dirname, '../../src');

/** Extensões varridas pela regra do `process.env`. */
const SCANNED_EXTENSIONS = ['.ts', '.astro'];

/**
 * Lista recursivamente os arquivos de código sob um diretório.
 *
 * Cobre `.ts` **e** `.astro`: um `process.env` no frontmatter ou dentro de um
 * `<script>` de componente Astro quebraria em produção exatamente como num
 * `.ts`, e antes desta varredura passava batido.
 */
function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return SCANNED_EXTENSIONS.some((ext) => entry.name.endsWith(ext)) ? [fullPath] : [];
  });
}

/**
 * Remove comentários de um trecho de código, para que a documentação da regra
 * (que cita `process.env` em comentário) não seja confundida com uso real.
 *
 * Cobre bloco (`/* *\/`), linha (`//`) e comentário HTML (`<!-- -->`), este
 * último por causa do template dos arquivos `.astro`.
 *
 * O comentário de linha exige início de linha ou espaço antes das barras: sem
 * isso, o `//` de uma URL como `https://exemplo` truncaria o resto da linha e
 * esconderia uma violação escrita depois dela.
 */
function stripComments(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

describe('siteConfig', () => {
  it('tem siteUrl como URL absoluta válida, sem barra final', () => {
    expect(() => new URL(siteConfig.siteUrl)).not.toThrow();
    expect(siteConfig.siteUrl.endsWith('/')).toBe(false);
  });

  it('tem defaultLocale contido em locales', () => {
    expect(siteConfig.locales).toContain(siteConfig.defaultLocale);
  });

  it('tem locales exatamente pt e en', () => {
    expect(siteConfig.locales).toEqual(['pt', 'en']);
  });

  it('tem author.name igual a Haroldo Cilas Duarte Lima Junior', () => {
    expect(siteConfig.author.name).toBe('Haroldo Cilas Duarte Lima Junior');
  });
});

describe('siteUrl: sobrescrita por PUBLIC_SITE_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  /**
   * Recarrega `config.ts` do zero para que ele releia `import.meta.env` — o
   * valor é lido uma única vez, no carregamento do módulo.
   */
  async function loadConfig() {
    vi.resetModules();
    return (await import('../../src/lib/config')).siteConfig;
  }

  it('usa PUBLIC_SITE_URL quando a variável está definida', async () => {
    vi.stubEnv('PUBLIC_SITE_URL', 'https://exemplo.test');
    expect((await loadConfig()).siteUrl).toBe('https://exemplo.test');
  });

  it('cai no default quando PUBLIC_SITE_URL não está definida', async () => {
    vi.stubEnv('PUBLIC_SITE_URL', undefined);
    expect((await loadConfig()).siteUrl).toBe('https://haroldo-page.and-near.workers.dev');
  });
});

describe('regra: código sob src/ nunca lê process.env', () => {
  it('nenhum arquivo .ts ou .astro em src/ usa process.env fora de comentários', () => {
    const offenders = listSourceFiles(srcDir)
      .filter((file) => stripComments(readFileSync(file, 'utf-8')).includes('process.env'))
      .map((file) => file.replace(srcDir, 'src'));

    expect(offenders).toEqual([]);
  });
});
