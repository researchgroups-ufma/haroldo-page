/**
 * ============================================================================
 *  Arquivo      : slug.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Gera slugs URL-safe a partir de títulos e nomes em português,
 *                 tratando acentuação e espaçamento antes do template de nome
 *                 de arquivo de conteúdo.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-01
 *  Atualizado em: 2026-09-01
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : string livre (título de publicação, nome de disciplina)
 *  Saídas       : string em minúsculas, apenas `[a-z0-9-]`, sem hífens nas pontas
 *  Uso          : const nomeArquivo = `${ano}-${slugify(titulo)}.md`
 *
 *  Notas        : string vazia ou só de símbolos devolve `''`, nunca lança exceção
 * ============================================================================
 */

// RN-08: nome de arquivo gerado por template, nunca digitado pelo professor
/**
 * Converte uma string livre em um slug URL-safe.
 *
 * Normaliza acentuação Unicode (NFD), remove marcas diacríticas, minusculiza
 * e troca sequências de caracteres fora de `[a-z0-9]` por um único hífen,
 * removendo hífens nas pontas.
 *
 * @param input Texto de entrada (título, nome), com acentuação livre.
 * @returns O slug resultante, ou `''` se a entrada for vazia ou só de símbolos.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
