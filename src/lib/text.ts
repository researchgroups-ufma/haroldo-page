/**
 * ============================================================================
 *  Arquivo      : text.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Divide texto corrido digitado pelo professor em parágrafos,
 *                 e formata números com dois dígitos, sem interpretar
 *                 Markdown nem HTML.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-16
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : texto livre (campos `textarea` do Tina: bio, corpo, ementa,
 *                 resumo, descricao) e inteiros não negativos (número da aula)
 *  Saídas       : array de parágrafos (string[]) e string com dois dígitos
 *  Uso          : const paragrafos = toParagraphs(perfil.bio)
 *
 *  Notas        : texto simples, não Markdown (decisão 2 do README da fase 3)
 * ============================================================================
 */

/**
 * Divide texto corrido em parágrafos, separados por uma ou mais linhas em
 * branco (inclusive linhas só com espaços).
 *
 * Não transforma quebra de linha simples: ela permanece no parágrafo e o
 * HTML a colapsa em espaço. Não escapa nem interpreta nada — Markdown e HTML
 * ficam literais. O resultado **nunca** deve ser passado para `set:html`;
 * a interpolação `{p}` do Astro faz o escape.
 *
 * @param text Texto livre digitado no `textarea` do Tina, ou `undefined`.
 * @returns Lista de parágrafos com espaço nas pontas removido; `[]` se o
 *   texto for `undefined`, vazio ou só espaço.
 */
export function toParagraphs(text: string | undefined): string[] {
  if (text === undefined) return [];
  const normalized = text.replace(/\r\n/g, '\n');
  return normalized
    .split(/\n[ \t]*\n/)
    .map((part) => part.trim())
    .filter((part) => part !== '');
}

/**
 * Formata um inteiro não negativo com dois dígitos — hoje, o número da aula na linha
 * `01 · 10/08/2026` da página de disciplina (§6.5 da identidade visual).
 *
 * @param n Inteiro não negativo (o `numero` da aula).
 * @returns `n` como string com pelo menos dois dígitos.
 */
export function padCount(n: number): string {
  return String(n).padStart(2, '0');
}
