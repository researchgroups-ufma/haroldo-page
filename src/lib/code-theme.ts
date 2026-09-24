/**
 * ============================================================================
 *  Arquivo      : code-theme.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Tema Shiki monocromático do painel de script (§5.4 da
 *                 identidade visual, RF-37) — só três cores de primeiro
 *                 plano, sem negrito/itálico — e a tradução de `linguagem`
 *                 (schema `scripts[]`) para o identificador de linguagem do
 *                 Shiki.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-21
 *  Atualizado em: 2026-09-21
 *  Versão       : 0.1.0
 *
 *  Dependências : shiki (tipo `ThemeRegistration`, só `import type` — o
 *                 pacote já vem com o Astro, não é dependência direta deste
 *                 projeto), src/content.config.ts (tipo `disciplinasSchema`,
 *                 só para o enum de `linguagem`), astro/zod (tipo `z`)
 *  Entradas     : nenhuma (tema) / um valor de `linguagem` (`shikiLanguage`)
 *  Saídas       : `monochromeTheme` (objeto de tema Shiki) e `shikiLanguage`
 *                 (string aceita por `lang` do `<Code>` de `astro:components`)
 *  Uso          : import { monochromeTheme, shikiLanguage } from '../lib/code-theme'
 *
 *  Notas        : destaque gerado no build pelo Shiki embutido no Astro —
 *                 nenhuma dependência nova (README da fase 3, decisão 5).
 * ============================================================================
 */
import type { ThemeRegistration } from 'shiki';
import type { disciplinasSchema } from '../content.config';
import type { z } from 'astro/zod';

/** Linguagem de script, chaves iguais a `scripts[].linguagem` de `disciplinasSchema`. */
type ScriptLanguage = NonNullable<
  z.infer<typeof disciplinasSchema>['scripts']
>[number]['linguagem'];

/**
 * Tema Shiki monocromático do painel de script (§5.4, §2 da identidade visual).
 *
 * Só três cores de primeiro plano, calculadas por contraste na identidade (§2): `#111112`
 * (`--tinta`, 17,47:1 sobre `--bloco`) para o texto padrão; `#5A5754` (`--secundario`, 6,65:1)
 * para palavra-chave; `#6E6A66` (cinza de comentário, 4,96:1) para comentário e string — todas
 * acima de 4,5:1 (RNF-15). Sem `fontStyle`: monocromático é diferença de tom, não de peso.
 *
 * `colors['editor.background']`/`['editor.foreground']` fixam o `bg`/`fg` padrão que o Shiki deriva
 * do tema (`normalizeTheme`, `@shikijs/primitive`): `fg` também vira o `settings[0]` sem `scope`,
 * aplicado a todo token sem `tokenColors` correspondente; os dois saem como `background-color`/
 * `color` inline no `<pre>` gerado pelo `<Code>` — conferido no `dist/` (`background-color:#F7F6F4`).
 */
export const monochromeTheme: ThemeRegistration = {
  name: 'monochrome',
  type: 'light',
  colors: {
    'editor.background': '#F7F6F4',
    'editor.foreground': '#111112',
  },
  tokenColors: [
    {
      scope: ['keyword', 'storage', 'keyword.control', 'storage.type'],
      settings: { foreground: '#5A5754' },
    },
    {
      scope: [
        'comment',
        'string',
        'punctuation.definition.comment',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#6E6A66' },
    },
  ],
};

/**
 * Traduz `linguagem` (`scripts[].linguagem` do schema) para o identificador de linguagem aceito
 * pela prop `lang` do `<Code>` de `astro:components` (bundle de linguagens do Shiki).
 *
 * `outro` vira `'plaintext'`: sem gramática própria, o Shiki ainda assim gera o `<pre><code>`
 * com o tema aplicado — só sem destaque de sintaxe.
 *
 * @param linguagem Um dos valores de `scriptSchema.linguagem` (`src/content.config.ts`).
 * @returns O identificador de linguagem do Shiki, tipado como subconjunto de `CodeLanguage` (prop
 *   `lang` de `astro:components`'s `<Code>`) para o `astro check` aceitar a chamada direta.
 */
export function shikiLanguage(
  linguagem: ScriptLanguage,
): 'python' | 'r' | 'matlab' | 'bash' | 'plaintext' {
  const map: Record<ScriptLanguage, 'python' | 'r' | 'matlab' | 'bash' | 'plaintext'> = {
    python: 'python',
    r: 'r',
    matlab: 'matlab',
    bash: 'bash',
    outro: 'plaintext',
  };
  return map[linguagem];
}
