/**
 * ============================================================================
 *  Arquivo      : publications.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Agrupa e ordena publicações por ano para a página pública.
 *                 Isola a regra RN-02 do PRD do componente que a renderiza,
 *                 identifica o professor entre os autores (§6.6 da identidade)
 *                 e monta os URLs de DOI e arXiv.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-16
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : arrays de entradas de coleção, na forma devolvida por
 *                 `getCollection` (`{ data: {...} }`), tipadas estruturalmente
 *                 — este módulo não importa `astro:content`
 *  Saídas       : grupos por ano decrescente (`groupByYear`), booleano
 *                 (`isProfessorAuthor`) e URLs (`doiUrl`, `arxivUrl`)
 *  Uso          : const grupos = groupByYear(filterPublished(await getCollection('publicacoes')))
 *
 *  Notas        : funções puras, sem efeitos colaterais, testáveis sem a content layer do Astro
 * ============================================================================
 */

/** Entrada de `publicacoes` com os campos usados no agrupamento por ano. */
type PublicationLike = { data: { ano: number; titulo: string } };

// RN-02 (parcial): o schema não tem data de cadastro. Regra provisória que vale até existir um campo de
// data de cadastro (Q-RN02, opção (c), decidida pelo stakeholder em 2026-09-14 — README da fase).
/**
 * Compara duas publicações do mesmo ano por `titulo`, ordem alfabética `pt-BR` crescente.
 *
 * Único lugar onde a metade pendente da RN-02 ("ordem de cadastro invertida") é implementada — o
 * schema não tem campo de data de cadastro nesta fase. `destaque` não entra na comparação: é só
 * visual (§6.6 da identidade), não afeta ordem.
 *
 * @param a Publicação à esquerda da comparação.
 * @param b Publicação à direita da comparação.
 * @returns Negativo se `a` vem antes de `b`, positivo se depois, zero em empate.
 */
export function compareWithinYear<T extends PublicationLike>(a: T, b: T): number {
  return a.data.titulo.localeCompare(b.data.titulo, 'pt-BR');
}

/**
 * Agrupa publicações por ano, em ordem decrescente, ordenando os itens de cada grupo por
 * `compareWithinYear`.
 *
 * Recebe entradas **já filtradas** por RN-01 (rascunhos removidos) — este módulo não filtra por
 * `publicado`.
 *
 * @param entries Publicações já publicadas, na forma devolvida por `getCollection`.
 * @returns Nova lista de grupos `{ year, items }`, anos distintos em ordem decrescente (RF-25);
 *   não muta `entries`.
 */
export function groupByYear<T extends PublicationLike>(
  entries: T[],
): { year: number; items: T[] }[] {
  // RF-25: anos distintos em ordem decrescente.
  const years = [...new Set(entries.map((entry) => entry.data.ano))].sort((a, b) => b - a);
  return years.map((year) => ({
    year,
    items: entries.filter((entry) => entry.data.ano === year).sort(compareWithinYear),
  }));
}

/**
 * Normaliza um nome de autor para comparação: `trim`, espaços múltiplos colapsados em um,
 * diacríticos removidos (`normalize('NFD')`) e minúsculas.
 */
function normalizeAuthorName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Decide se um autor da lista de `autores` é o professor, para destacá-lo em `--tinta` (§6.6 da
 * identidade visual).
 *
 * Normaliza os dois lados (espaços, acentos, caixa) antes de comparar, mas exige igualdade exata
 * depois disso — **sem** casamento parcial. Um `includes` casaria `'LIMA, J.'` de outro autor, ou
 * uma entrada com `', et al.'` colado, com o nome do professor; essa normalização deliberada evita
 * os dois casos sem abrir mão da precisão.
 *
 * @param author Nome do autor, como aparece em `autores` no conteúdo.
 * @param citationName Nome de citação do professor (`siteConfig.author.citationName`).
 * @returns `true` se, normalizados, os dois nomes forem idênticos.
 */
export function isProfessorAuthor(author: string, citationName: string): boolean {
  return normalizeAuthorName(author) === normalizeAuthorName(citationName);
}

/** Prefixos aceitos em `doi`, removidos (sem diferenciar maiúsculas) antes de montar o URL. */
const DOI_PREFIXES = [
  'https://doi.org/',
  'http://dx.doi.org/',
  'https://dx.doi.org/',
  'doi:',
] as const;

/**
 * Monta o URL de DOI a partir do campo livre `doi` do conteúdo.
 *
 * O campo é `z.string().optional()`: o professor pode colar o DOI puro ou qualquer uma das formas
 * já prefixadas com URL. Remove o prefixo reconhecido (sem diferenciar maiúsculas) e o `trim`
 * antes de montar `https://doi.org/<doi>`.
 *
 * @param doi Valor de `doi` no conteúdo, com ou sem prefixo de URL.
 * @returns URL completo `https://doi.org/<doi>`.
 */
export function doiUrl(doi: string): string {
  let value = doi.trim();
  for (const prefix of DOI_PREFIXES) {
    if (value.toLowerCase().startsWith(prefix)) {
      value = value.slice(prefix.length).trim();
      break;
    }
  }
  return `https://doi.org/${value}`;
}

/** Prefixos aceitos em `arxiv`, removidos (sem diferenciar maiúsculas) antes de montar o URL. */
const ARXIV_PREFIXES = ['arxiv:', 'https://arxiv.org/abs/', 'http://arxiv.org/abs/'] as const;

/**
 * Monta o URL do arXiv a partir do campo livre `arxiv` do conteúdo.
 *
 * Remove o prefixo reconhecido (sem diferenciar maiúsculas) e o `trim` antes de montar
 * `https://arxiv.org/abs/<id>`.
 *
 * @param id Valor de `arxiv` no conteúdo (id puro, com `arXiv:` ou com URL completo).
 * @returns URL completo `https://arxiv.org/abs/<id>`.
 */
export function arxivUrl(id: string): string {
  let value = id.trim();
  for (const prefix of ARXIV_PREFIXES) {
    if (value.toLowerCase().startsWith(prefix)) {
      value = value.slice(prefix.length).trim();
      break;
    }
  }
  return `https://arxiv.org/abs/${value}`;
}
