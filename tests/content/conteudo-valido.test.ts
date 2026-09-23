/**
 * ============================================================================
 *  Arquivo      : conteudo-valido.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Portão de conteúdo (§11 do PRD, "Validação de conteúdo: todo arquivo em
 *                 `content/` passa pelo Zod — bloqueia merge"). Varre os arquivos reais das
 *                 cinco pastas de `content/`, lê o frontmatter com `gray-matter` — o mesmo
 *                 parser que o painel TinaCMS usa para gravar — e valida cada um contra o
 *                 schema Zod correspondente de `src/content.config.ts`. Fecha a dívida 5 da
 *                 fase 1 (a dívida 7(c) fecha em `paridade-schema.test.ts`): até este plano,
 *                 `npm run build` podia encerrar com
 *                 `exit 0` mesmo com uma referência inválida em `content/` (`astro check`
 *                 reporta `[ERROR] [content]`, mas não falha o processo) — ver Contexto do
 *                 plano 030.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-11
 *  Atualizado em: 2026-09-11
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, gray-matter, node:fs, node:path, src/content.config.ts
 *  Entradas     : os arquivos reais de `content/perfil/`, `content/linhas-pesquisa/`,
 *                 `content/projetos/`, `content/disciplinas/` e `content/publicacoes/`
 *  Saídas       : nenhuma — só asserções
 *  Uso          : `npm run test` / `npm run test:coverage` / `npm run build:pipeline`
 *
 *  Notas        : **Fixtures reais (§11):** este teste usa o conteúdo verdadeiro do
 *                 repositório, não frontmatter sintético — a suíte passa a depender do
 *                 conteúdo de `content/`, e é exatamente esse acoplamento que faz dele um
 *                 portão de verdade em vez de uma simulação.
 *
 *                 **`safeParse` não verifica se uma referência existe.**
 *                 `projetos.linha_relacionada` passa por `normalizeLinhaRelacionadaId` e por
 *                 `reference('linhas-pesquisa')` (`src/content.config.ts`): o `preprocess`
 *                 normaliza o formato do id e o `reference()` só o transforma na forma
 *                 `{ id, collection }` — nenhum dos dois consulta o sistema de arquivos. Quem
 *                 verifica se a entrada referenciada existe é a content layer do Astro, em
 *                 tempo de build (`getEntry()`). Por isso `linha_relacionada: ''` passa pelo
 *                 `safeParse` sem erro, e este teste faz a verificação de existência à parte,
 *                 direto no valor bruto do frontmatter — não no resultado do `safeParse`.
 * ============================================================================
 */
import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import {
  perfilSchema,
  linhasPesquisaSchema,
  projetosSchema,
  disciplinasSchema,
  publicacoesSchema,
} from '../../src/content.config';

const contentDir = join(__dirname, '../../content');
const repoRoot = join(__dirname, '../..');

/** Recorte mínimo do retorno de `.safeParse()` usado por este teste. */
interface ResultadoSafeParse {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}

/** Recorte mínimo de um schema Zod usado por este teste — só o método consumido. */
interface SchemaValidavel {
  safeParse(dado: unknown): ResultadoSafeParse;
}

/** Uma coleção de conteúdo: a pasta sob `content/` e o schema Zod que a valida. */
interface Colecao {
  pasta: string;
  schema: SchemaValidavel;
}

const COLECOES: Colecao[] = [
  { pasta: 'perfil', schema: perfilSchema },
  { pasta: 'linhas-pesquisa', schema: linhasPesquisaSchema },
  { pasta: 'projetos', schema: projetosSchema },
  { pasta: 'disciplinas', schema: disciplinasSchema },
  { pasta: 'publicacoes', schema: publicacoesSchema },
];

/**
 * Lista recursivamente os arquivos `.md` sob um diretório de coleção de conteúdo.
 *
 * Espelha o padrão `**\/*.md` que os `glob()` loaders de `src/content.config.ts` usam
 * (estilo de varredura de `tests/lib/config.test.ts`): mesmo que hoje nenhuma coleção tenha
 * subpastas, a varredura não presume estrutura plana.
 */
function listMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminhoCompleto = join(dir, entrada.name);
    if (entrada.isDirectory()) return listMarkdownFiles(caminhoCompleto);
    return entrada.name.endsWith('.md') ? [caminhoCompleto] : [];
  });
}

/** Formata uma falha no padrão de F-09/§8.2: caminho do arquivo relativo à raiz + campo. */
function formatarErro(caminhoRelativo: string, campo: string, mensagem: string): string {
  return `${caminhoRelativo} → campo '${campo}': ${mensagem}`;
}

describe('conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5)', () => {
  it('varreu ao menos um arquivo por coleção — varredura vazia não pode "passar" como válida', () => {
    for (const { pasta } of COLECOES) {
      const arquivos = listMarkdownFiles(join(contentDir, pasta));
      expect(arquivos.length, `nenhum arquivo encontrado em content/${pasta}`).toBeGreaterThan(0);
    }
  });

  it('todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida', () => {
    const erros: string[] = [];

    // Ids conhecidos de `linhas-pesquisa` (nome do arquivo sem extensão) — é contra este
    // conjunto que a referência de `projetos.linha_relacionada` é verificada, explicitamente,
    // porque o `safeParse` não faz essa verificação (ver Notas do cabeçalho deste arquivo).
    const linhasPesquisaIds = new Set(
      listMarkdownFiles(join(contentDir, 'linhas-pesquisa')).map((caminho) =>
        basename(caminho, extname(caminho)),
      ),
    );

    for (const { pasta, schema } of COLECOES) {
      for (const arquivoAbsoluto of listMarkdownFiles(join(contentDir, pasta))) {
        const caminhoRelativo = relative(repoRoot, arquivoAbsoluto).replace(/\\/g, '/');
        const { data } = matter(readFileSync(arquivoAbsoluto, 'utf-8'));
        const frontmatter: Record<string, unknown> = data;

        const resultado = schema.safeParse(frontmatter);
        if (!resultado.success) {
          for (const issue of resultado.error?.issues ?? []) {
            const campo = issue.path.length > 0 ? issue.path.join('.') : '(raiz)';
            erros.push(formatarErro(caminhoRelativo, campo, issue.message));
          }
        }

        if (pasta === 'projetos' && Object.prototype.hasOwnProperty.call(frontmatter, 'linha_relacionada')) {
          const bruto = frontmatter.linha_relacionada;
          if (typeof bruto === 'string') {
            const idNormalizado = bruto.replace(/^content\/linhas-pesquisa\//, '').replace(/\.md$/, '');
            if (idNormalizado === '') {
              erros.push(
                formatarErro(
                  caminhoRelativo,
                  'linha_relacionada',
                  'referência vazia — remova o campo ou selecione uma linha de pesquisa existente',
                ),
              );
            } else if (!linhasPesquisaIds.has(idNormalizado)) {
              erros.push(
                formatarErro(
                  caminhoRelativo,
                  'linha_relacionada',
                  `referência '${idNormalizado}' não corresponde a nenhum arquivo em content/linhas-pesquisa/`,
                ),
              );
            }
          }
        }
      }
    }

    expect(erros).toEqual([]);
  });
});
