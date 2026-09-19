/**
 * ============================================================================
 *  Arquivo      : citacoes-do-prd.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Testes de `src/lib/prd-citations.ts` (plano 054). Fixtures sintéticas para cada
 *                 função pura, e um invariante real sobre `src/**`: toda citação de identificador
 *                 (RF/RN/RNF/F/M/D/NG/A/R-NN) ou de seção (`§N`/`§N.N`) existe na fonte declarada
 *                 (`PRD.md` e/ou `docs/identidade-visual.md`).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-18
 *  Atualizado em: 2026-09-18
 *  Versão       : 0.2.0
 *
 *  Dependências : node:fs, node:path, vitest, src/lib/prd-citations.ts
 *  Entradas     : fixtures sintéticas; `PRD.md`, `docs/identidade-visual.md` e `src/**` reais
 *  Saídas       : nenhuma (arquivo de teste)
 *  Uso          : npx vitest run tests/lib/citacoes-do-prd.test.ts
 *
 *  Notas        : a camada de pertinência (pontuação por vocabulário comum) foi retirada do
 *                 escopo depois da revisão do plano 054 — ver Evidência sobre o achado de
 *                 calibração. `extractCitationContexts` continua expondo o contexto de ±1 linha
 *                 só para diagnóstico (aparece no `AssertionError` do canário de existência).
 * ============================================================================
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  extractCitationContexts,
  parseSectionClauses,
  parseTableClauses,
} from '../../src/lib/prd-citations';

describe('parseTableClauses', () => {
  it('lê linha de tabela simples', () => {
    const prd = '| RF-08 | MUST | Requisito de teste | Critério | ⬜ |';
    expect(parseTableClauses(prd).get('RF-08')).toBe(prd);
  });

  it('lê linha de tabela com ID em negrito', () => {
    const prd = '| **A-07** | Premissa de teste | Consequência |';
    expect(parseTableClauses(prd).get('A-07')).toContain('Premissa de teste');
  });

  it('lê item de lista (formato dos Não-Objetivos)', () => {
    const prd = '- **NG-04:** não haverá visual editing.';
    expect(parseTableClauses(prd).get('NG-04')).toBe(prd);
  });

  it('distingue RNF, RN e R apesar do prefixo compartilhado', () => {
    const prd = ['| RNF-01 | x |', '| RN-04 | y |', '| R-04 | z |'].join('\n');
    const clauses = parseTableClauses(prd);
    expect(clauses.get('RNF-01')).toContain('x');
    expect(clauses.get('RN-04')).toContain('y');
    expect(clauses.get('R-04')).toContain('z');
  });

  it('ignora linha que não é tabela nem item de Não-Objetivo', () => {
    expect(parseTableClauses('RF-08 solto no texto, sem marcação').size).toBe(0);
  });
});

describe('parseSectionClauses', () => {
  const doc = [
    '## 6. Rotas',
    'Texto do topo de §6.',
    '### 6.1 Home',
    'Corpo de §6.1.',
    '#### Painel administrativo',
    'Isto ainda é §6.1, por não ter numeral próprio.',
    '### 6.2 Sobre',
    'Corpo de §6.2.',
    '## 7. Movimento',
    'Corpo de §7.',
  ].join('\n');
  const clauses = parseSectionClauses(doc);

  it('mapeia heading de nível 2 (## N.) para §N', () => {
    expect(clauses.has('§6')).toBe(true);
    expect(clauses.has('§7')).toBe(true);
  });

  it('mapeia heading de nível 3 (### N.N) para §N.N', () => {
    expect(clauses.get('§6.1')).toContain('Corpo de §6.1.');
  });

  it('heading sem numeral não abre seção própria: fica no corpo da seção numerada em que está', () => {
    expect(clauses.get('§6.1')).toContain('Painel administrativo');
    expect(clauses.get('§6.1')).toContain('numeral próprio');
  });

  it('corpo de uma seção não inclui o texto de outra seção', () => {
    expect(clauses.get('§6.1')).not.toContain('Corpo de §6.2.');
    expect(clauses.get('§6')).not.toContain('Corpo de §7.');
  });

  it('§6 e §6.1 são chaves distintas', () => {
    expect(clauses.get('§6')).not.toBe(clauses.get('§6.1'));
  });
});

describe('extractCitationContexts', () => {
  it('inclui a linha anterior e a seguinte do mesmo bloco `/** */`', () => {
    const text = ['/**', ' * linha antes', ' * cita (RN-01) aqui', ' * linha depois', ' */'].join(
      '\n',
    );
    const [c] = extractCitationContexts(text);
    expect(c).toMatchObject({ id: 'RN-01', line: 3 });
    expect(c.context).toContain('linha antes');
    expect(c.context).toContain('linha depois');
  });

  it('citação na primeira linha do bloco não tem "linha anterior"', () => {
    const text = ['/** cita (F-06) na primeira linha', ' * linha depois', ' */'].join('\n');
    const [c] = extractCitationContexts(text);
    expect(c.context.split('\n')).toHaveLength(2);
  });

  it('agrupa `//` standalone consecutivos no mesmo bloco', () => {
    const text = ['// linha antes', '// cita (RN-04) aqui', '// linha depois'].join('\n');
    const [c] = extractCitationContexts(text);
    expect(c.context).toContain('linha antes');
    expect(c.context).toContain('linha depois');
  });

  it('`//` de fim de linha (trecho com código antes) não herda contexto do vizinho', () => {
    const text = ['// vizinho standalone', 'const x = 1; // cita (D-05) trecho', '// outro'].join(
      '\n',
    );
    const [c] = extractCitationContexts(text);
    expect(c.context).not.toContain('vizinho standalone');
    expect(c.context).not.toContain('outro');
  });

  it('extrai citação de comentário HTML', () => {
    const text = '<!-- reservado para RF-29 -->';
    expect(extractCitationContexts(text)[0].id).toBe('RF-29');
  });

  it('extrai §N e §N.N como citações distintas', () => {
    const ids = extractCitationContexts('/* ver §5 e §5.4 */').map((c) => c.id);
    expect(ids).toEqual(['§5', '§5.4']);
  });

  it('não confunde RNF/RN/R quando aparecem juntos', () => {
    const ids = extractCitationContexts('/* RNF-01, RN-04, R-04 */').map((c) => c.id);
    expect(ids).toEqual(['RNF-01', 'RN-04', 'R-04']);
  });

  it('duas citações na mesma linha compartilham o mesmo contexto', () => {
    const text = ['/**', ' * cita (F-06, RF-24) junto', ' */'].join('\n');
    const [c1, c2] = extractCitationContexts(text);
    expect(c1.context).toBe(c2.context);
  });

  it('texto sem comentário não produz citação, mesmo citando um ID', () => {
    const code = "const rule = 'RN-01';";
    expect(extractCitationContexts(code)).toEqual([]);
  });
});

/** Lista recursivamente os arquivos `.ts`/`.astro` de um diretório (mesma estratégia de tests/lib/config.test.ts). */
function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return entry.name.endsWith('.ts') || entry.name.endsWith('.astro') ? [fullPath] : [];
  });
}

describe('invariante real: toda citação de src/ existe na fonte declarada', () => {
  const root = join(__dirname, '../..');
  const idClauses = parseTableClauses(readFileSync(join(root, 'PRD.md'), 'utf-8'));
  const sectionsPrd = parseSectionClauses(readFileSync(join(root, 'PRD.md'), 'utf-8'));
  const sectionsIdentidade = parseSectionClauses(
    readFileSync(join(root, 'docs/identidade-visual.md'), 'utf-8'),
  );

  const files = listSourceFiles(join(root, 'src'));
  const citations = files.flatMap((file) =>
    extractCitationContexts(readFileSync(file, 'utf-8')).map((c) => ({
      ...c,
      file: file.slice(root.length),
    })),
  );

  // O número de citações varridas vai no nome do teste (visível em qualquer reporter, ao
  // contrário de console.log, que o vitest não imprime para teste que passa).
  it(`varreu ${citations.length} citações em src/ (contagem > 0)`, () => {
    expect(citations.length).toBeGreaterThan(0);
  });

  it('toda citação de identificador (RF/RN/RNF/F/M/D/NG/A/R-NN) existe no PRD', () => {
    const missing = citations
      .filter((c) => !c.id.startsWith('§'))
      .filter((c) => !idClauses.has(c.id));
    expect(missing).toEqual([]);
  });

  it('toda citação de seção (§N/§N.N) existe no PRD ou na identidade visual', () => {
    const missing = citations
      .filter((c) => c.id.startsWith('§'))
      .filter((c) => !sectionsPrd.has(c.id) && !sectionsIdentidade.has(c.id));
    expect(missing).toEqual([]);
  });
});
