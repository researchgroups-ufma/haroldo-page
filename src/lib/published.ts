/**
 * ============================================================================
 *  Arquivo      : published.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Filtra entradas de coleções de listagem por publicação
 *                 (RN-01) e exige exatamente um item em coleções singleton
 *                 (`perfil`).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-16
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : arrays de entradas de coleção, na forma devolvida por
 *                 `getCollection` (`{ data: {...} }`), tipadas estruturalmente
 *                 — este módulo não importa `astro:content`
 *  Saídas       : arrays filtrados (`filterPublished`) e item único de
 *                 singleton (`requireSingleton`)
 *  Uso          : const publicadas = filterPublished(await getCollection('projetos'))
 *
 *  Notas        : funções puras, sem efeitos colaterais, testáveis sem a content layer do Astro
 * ============================================================================
 */

/** Entrada de coleção com o campo `publicado`, comum às quatro coleções de listagem (RN-01). */
type Publishable = { data: { publicado: boolean } };

/**
 * Filtra entradas de uma coleção de listagem, mantendo apenas as publicadas.
 *
 * // RN-01: rascunhos (`publicado: false`) nunca aparecem no site público.
 *
 * @param entries Entradas da coleção, na forma devolvida por `getCollection`.
 * @returns Novo array com apenas as entradas com `data.publicado === true`, na mesma ordem de entrada.
 */
export function filterPublished<T extends Publishable>(entries: T[]): T[] {
  // RN-01
  return entries.filter((entry) => entry.data.publicado);
}

/**
 * Exige que uma coleção singleton (`perfil`) tenha exatamente um item.
 *
 * Conta a coleção em vez de buscar por id fixo (`getEntry('perfil', 'index')`): o id é derivado
 * internamente pelo loader `glob()` do Astro e contar não depende desse detalhe.
 *
 * @param entries Entradas da coleção singleton (espera-se exatamente uma).
 * @param collection Nome da coleção, para nomear o problema na mensagem de erro (F-09).
 * @returns O único item da coleção.
 * @throws {Error} Se `entries.length !== 1`, nomeando a coleção e a contagem encontrada.
 */
export function requireSingleton<T>(entries: T[], collection: string): T {
  if (entries.length !== 1) {
    throw new Error(
      `Coleção \`${collection}\`: esperado exatamente 1 item, encontrados ${entries.length}`,
    );
  }
  return entries[0];
}
