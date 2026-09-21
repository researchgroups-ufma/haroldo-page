import { describe, expect, it } from 'vitest';
import { monochromeTheme, shikiLanguage } from '../../src/lib/code-theme';
import { disciplinasSchema } from '../../src/content.config';

/** As três cores de primeiro plano permitidas pelo tema monocromático (§2, §5.6). */
const ALLOWED_FOREGROUNDS = new Set(['#111112', '#5A5754', '#6E6A66']);

describe('monochromeTheme', () => {
  it('toda cor de tokenColors[*].settings.foreground pertence às três cores permitidas', () => {
    const tokenColors = monochromeTheme.tokenColors ?? [];
    expect(tokenColors.length).toBeGreaterThan(0);
    for (const rule of tokenColors) {
      const foreground = rule.settings?.foreground;
      expect(foreground).toBeDefined();
      expect(ALLOWED_FOREGROUNDS.has((foreground as string).toUpperCase())).toBe(true);
    }
  });

  it("colors['editor.foreground'] pertence às três cores permitidas", () => {
    const foreground = monochromeTheme.colors?.['editor.foreground'];
    expect(foreground).toBeDefined();
    expect(ALLOWED_FOREGROUNDS.has((foreground as string).toUpperCase())).toBe(true);
  });

  it('nenhum fontStyle além de vazio/ausente — monocromático é tom, não peso', () => {
    const tokenColors = monochromeTheme.tokenColors ?? [];
    for (const rule of tokenColors) {
      const fontStyle = rule.settings?.fontStyle;
      expect(fontStyle === undefined || fontStyle === '').toBe(true);
    }
  });
});

describe('shikiLanguage', () => {
  it('traduz os cinco valores do enum linguagem', () => {
    expect(shikiLanguage('python')).toBe('python');
    expect(shikiLanguage('r')).toBe('r');
    expect(shikiLanguage('matlab')).toBe('matlab');
    expect(shikiLanguage('bash')).toBe('bash');
    expect(shikiLanguage('outro')).toBe('plaintext');
  });

  it('os cinco valores testados são exatamente as opções do enum linguagem do schema', () => {
    const options = disciplinasSchema.shape.scripts.unwrap().element.shape.linguagem.options;
    expect(options).toEqual(['python', 'r', 'matlab', 'bash', 'outro']);
  });
});
