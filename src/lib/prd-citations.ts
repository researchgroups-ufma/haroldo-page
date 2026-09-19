/**
 * ============================================================================
 *  Arquivo      : prd-citations.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Lógica do teste de citações do PRD (plano 054, §10.3: toda regra de negócio
 *                 implementada referencia o identificador do PRD). Camada de existência: todo
 *                 identificador ou seção citado em `src/**` existe na fonte declarada (`PRD.md`
 *                 e/ou `docs/identidade-visual.md`). A camada de pertinência (vocabulário comum
 *                 entre comentário e cláusula) foi retirada do escopo — ver Evidência do plano 054.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-18
 *  Atualizado em: 2026-09-18
 *  Versão       : 0.2.0
 *
 *  Dependências : nenhuma (apenas texto em memória; quem lê os arquivos é o teste)
 *  Entradas     : texto de `PRD.md`, `docs/identidade-visual.md` e de arquivos de `src/**`
 *  Saídas       : mapas de cláusula por ID (`parseTableClauses`, `parseSectionClauses`) e citações
 *                 com contexto (`extractCitationContexts`)
 *  Uso          : const clauses = parseTableClauses(prdText); ...
 *
 *  Notas        : funções puras, sem leitura de arquivo — quem lê é o teste.
 * ============================================================================
 */

/** Prefixos citáveis, do mais específico ao menos, para o `\b` não confundir um prefixo composto (ex.: RNF, RN) com o prefixo de uma letra dentro dele (R). */
const ID_PREFIXES = ['RNF', 'RF', 'RN', 'NG', 'F', 'M', 'D', 'A', 'R'] as const;
const ID_PATTERN = new RegExp(`\\b(${ID_PREFIXES.join('|')})-(\\d+)\\b`, 'g');
const SECTION_PATTERN = /§(\d+)(\.\d+)?/g;

/**
 * Mapeia cada ID do PRD (RF/RN/RNF/F/M/D/NG/A/R-NN) para a linha onde está definido: linha de
 * tabela (`| ID | ... |`) ou item de lista (`- **ID:** ...`, formato dos Não-Objetivos, NG-NN).
 */
export function parseTableClauses(prdText: string): Map<string, string> {
  const idGroup = `(?:${ID_PREFIXES.join('|')})-\\d+`;
  const rowRe = new RegExp(`^\\|\\s*\\*{0,2}(${idGroup})\\*{0,2}\\s*\\|`);
  const bulletRe = new RegExp(`^-\\s*\\*\\*(${idGroup}):?\\*\\*`);
  const clauses = new Map<string, string>();
  for (const line of prdText.split('\n')) {
    const match = rowRe.exec(line) ?? bulletRe.exec(line);
    if (match) clauses.set(match[1], line);
  }
  return clauses;
}

/**
 * Mapeia `§N`/`§N.N` (heading `## N.`/`### N.N`) para o corpo da seção, do heading até o próximo
 * de nível igual ou mais raso. Heading sem numeral não abre seção própria: fica no corpo da mãe.
 */
export function parseSectionClauses(docText: string): Map<string, string> {
  const lines = docText.split('\n');
  const headings: { id: string; level: 2 | 3; start: number }[] = [];
  lines.forEach((line, i) => {
    const h3 = /^###\s+(\d+)\.(\d+)(?:\s|$)/.exec(line);
    const h2 = /^##\s+(\d+)\.(?:\s|$)/.exec(line);
    if (h3) headings.push({ id: `§${h3[1]}.${h3[2]}`, level: 3, start: i });
    else if (h2) headings.push({ id: `§${h2[1]}`, level: 2, start: i });
  });
  const clauses = new Map<string, string>();
  headings.forEach((heading, index) => {
    const next = headings.slice(index + 1).find((later) => later.level <= heading.level);
    clauses.set(heading.id, lines.slice(heading.start, next?.start ?? lines.length).join('\n'));
  });
  return clauses;
}

/** Um comentário (`/* *\/`/`<!-- -->`/`//`): linhas (0-based) e texto de cada uma. */
type CommentBlock = { lines: number[]; texts: string[] };
/** Agrupa o texto de um arquivo em blocos de comentário. */
function extractCommentBlocks(text: string): CommentBlock[] {
  const lines = text.split('\n');
  const covered = new Array(lines.length).fill(false);
  const blocks: CommentBlock[] = [];

  for (const match of text.matchAll(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g)) {
    const start = text.slice(0, match.index).split('\n').length - 1;
    const block: CommentBlock = { lines: [], texts: [] };
    match[0].split('\n').forEach((lineText, offset) => {
      block.lines.push(start + offset);
      block.texts.push(lineText);
      covered[start + offset] = true;
    });
    blocks.push(block);
  }

  let current: CommentBlock | null = null;
  lines.forEach((lineText, i) => {
    const match = covered[i] ? null : /(^|\s)(\/\/.*)$/.exec(lineText);
    if (!match) {
      current = null;
      return;
    }
    if (current && /^\s*\/\//.test(lineText)) {
      current.lines.push(i);
      current.texts.push(match[2]);
      return;
    }
    current = { lines: [i], texts: [match[2]] };
    blocks.push(current);
    if (!/^\s*\/\//.test(lineText)) current = null;
  });

  return blocks;
}

/**
 * Uma citação encontrada num arquivo: id, linha (1-based) e o texto de contexto ao redor —
 * usado para diagnóstico (ex.: no `AssertionError` do canário, mostra o comentário inteiro a
 * quem for corrigir), não para pontuação.
 */
export type CitationContext = { id: string; line: number; context: string };

/**
 * Extrai toda citação em comentários do arquivo, com o contexto de diagnóstico: a linha da
 * citação mais a anterior e a seguinte, só quando do mesmo bloco de comentário.
 */
export function extractCitationContexts(text: string): CitationContext[] {
  const results: CitationContext[] = [];
  for (const block of extractCommentBlocks(text)) {
    block.texts.forEach((lineText, idx) => {
      const ids = [
        ...[...lineText.matchAll(ID_PATTERN)].map((m) => `${m[1]}-${m[2]}`),
        ...[...lineText.matchAll(SECTION_PATTERN)].map((m) => `§${m[1]}${m[2] ?? ''}`),
      ];
      if (ids.length === 0) return;
      const context = [block.texts[idx - 1], lineText, block.texts[idx + 1]]
        .filter((t): t is string => t !== undefined)
        .join('\n');
      for (const id of ids) results.push({ id, line: block.lines[idx] + 1, context });
    });
  }
  return results;
}
