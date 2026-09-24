/**
 * ============================================================================
 *  Arquivo      : research.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Ordena linhas de pesquisa e projetos (§6.3 da identidade
 *                 visual) e agrupa projetos por linha publicada, sem revelar
 *                 linha em rascunho (RN-01).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-24
 *  Versão       : 0.3.0
 *
 *  Dependências : nenhuma
 *  Entradas     : arrays de entradas de coleção, na forma devolvida por
 *                 `getCollection` (`{ data: {...} }`), tipadas estruturalmente
 *                 — este módulo não importa `astro:content`
 *  Saídas       : arrays ordenados (cópias, sem mutar a entrada) e o
 *                 agrupamento `{ byLine, others }`
 *  Uso          : const linhas = sortResearchLines(filterPublished(await getCollection('linhas-pesquisa')))
 *
 *  Notas        : funções puras, sem efeitos colaterais, testáveis sem a content layer do Astro
 * ============================================================================
 */

/** Entrada de `linhas-pesquisa` com os campos usados na ordenação (§6.3). */
type ResearchLineLike = { data: { ordem?: number; titulo: string } };

/** Entrada de `projetos` com os campos usados em ordenação e agrupamento (§6.3). */
type ProjectLike = {
  data: {
    titulo: string;
    status?: 'em andamento' | 'concluído';
    linha_relacionada?: { id: string };
  };
};

/**
 * Compara duas linhas de pesquisa por `ordem` crescente; sem `ordem` vão ao fim; empate
 * (inclusive entre as sem `ordem`) desempatado por `titulo` (`localeCompare('pt-BR')`).
 */
function compareResearchLines(a: ResearchLineLike, b: ResearchLineLike): number {
  if (a.data.ordem !== undefined && b.data.ordem !== undefined) {
    if (a.data.ordem !== b.data.ordem) return a.data.ordem - b.data.ordem;
  } else if (a.data.ordem !== undefined || b.data.ordem !== undefined) {
    return a.data.ordem !== undefined ? -1 : 1;
  }
  return a.data.titulo.localeCompare(b.data.titulo, 'pt-BR');
}

/**
 * Ordena linhas de pesquisa para `/pesquisa` (§6.3, RF-09/RF-22): `ordem` crescente, sem `ordem`
 * ao fim, empate por `titulo`.
 *
 * @param entries Linhas de pesquisa (idealmente já filtradas por `filterPublished`).
 * @returns Nova lista ordenada; não muta `entries`.
 */
export function sortResearchLines<T extends ResearchLineLike>(entries: T[]): T[] {
  // RF-09/RF-22
  return [...entries].sort(compareResearchLines);
}

/** Posição do grupo de `status` na grade de projetos (§6.3: em andamento, depois concluído, depois sem status). */
function statusGroupRank(status: 'em andamento' | 'concluído' | undefined): number {
  if (status === 'em andamento') return 0;
  if (status === 'concluído') return 1;
  return 2;
}

/**
 * Compara dois projetos pelo grupo de `status` (§6.3: em andamento, concluído, sem status) e,
 * dentro do grupo, por `titulo` (`localeCompare('pt-BR')`).
 */
function compareProjects(a: ProjectLike, b: ProjectLike): number {
  const groupDiff = statusGroupRank(a.data.status) - statusGroupRank(b.data.status);
  if (groupDiff !== 0) return groupDiff;
  return a.data.titulo.localeCompare(b.data.titulo, 'pt-BR');
}

/**
 * Ordena projetos para `/pesquisa` (§6.3: "Concluídos depois dos em andamento"): grupo `em
 * andamento`, depois `concluído`, depois sem `status`; dentro do grupo, por `titulo`.
 *
 * @param entries Projetos (idealmente já filtrados por `filterPublished`).
 * @returns Nova lista ordenada; não muta `entries`.
 */
export function sortProjects<T extends ProjectLike>(entries: T[]): T[] {
  return [...entries].sort(compareProjects);
}

/**
 * Agrupa projetos pela linha de pesquisa a que pertencem, para a página Pesquisa listar os
 * projetos dentro de cada linha.
 *
 * RN-01: projeto ligado a uma linha fora de `lineIds` (não publicada) vai para `others`, como
 * se não tivesse linha — a página nunca revela o rascunho.
 *
 * @param lineIds Ids das linhas publicadas, presentes na página.
 * @param projects Projetos já publicados e ordenados (`sortProjects`).
 * @returns `byLine` (id da linha → projetos, na ordem recebida; linha sem projeto não tem chave)
 *   e `others` (sem linha ou com linha não publicada).
 */
export function groupProjectsByLine<P extends ProjectLike>(
  lineIds: ReadonlySet<string>,
  projects: P[],
): { byLine: Map<string, P[]>; others: P[] } {
  const byLine = new Map<string, P[]>();
  const others: P[] = [];
  for (const project of projects) {
    const lineId = project.data.linha_relacionada?.id;
    if (lineId === undefined || !lineIds.has(lineId)) {
      others.push(project);
      continue;
    }
    byLine.set(lineId, [...(byLine.get(lineId) ?? []), project]);
  }
  return { byLine, others };
}
