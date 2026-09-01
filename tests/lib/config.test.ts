import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/lib/config';

const srcDir = join(__dirname, '../../src');

/**
 * Lista recursivamente todos os arquivos `.ts` sob um diretório.
 */
function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return listTsFiles(fullPath);
    return entry.name.endsWith('.ts') ? [fullPath] : [];
  });
}

/**
 * Remove comentários de bloco (`/* *\/`) e de linha (`//`) de um trecho de
 * código, para que a documentação da regra (que cita `process.env` em
 * comentário) não seja confundida com uso real no código funcional.
 */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
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

describe('regra: código sob src/ nunca lê process.env', () => {
  it('nenhum arquivo .ts em src/ usa process.env fora de comentários', () => {
    const offenders = listTsFiles(srcDir)
      .filter((file) => stripComments(readFileSync(file, 'utf-8')).includes('process.env'))
      .map((file) => file.replace(srcDir, 'src'));

    expect(offenders).toEqual([]);
  });
});
