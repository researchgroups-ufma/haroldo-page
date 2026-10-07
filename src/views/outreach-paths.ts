/**
 * ============================================================================
 *  Arquivo      : outreach-paths.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : `getStaticPaths` compartilhado pelas páginas de postagem de
 *                 extensão em PT (`/extensao/[slug]`) e EN (`/en/outreach/[slug]`).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-07
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.1.0
 *
 *  Dependências : astro:content (getCollection), src/lib/published.ts,
 *                 src/lib/courses.ts (buildCourseSlugs, courseSlug)
 *  Entradas     : coleção `extensao`
 *  Saídas       : `{ params: { slug }, props: { post } }[]`
 *  Uso          : export const getStaticPaths = postStaticPaths;
 *
 *  Notas        : o slug sai do nome do arquivo pela mesma regra da disciplina;
 *                 `buildCourseSlugs` só olha `filePath`, por isso serve aqui também.
 * ============================================================================
 */
import { getCollection } from 'astro:content';
import { filterPublished } from '../lib/published';
import { buildCourseSlugs, courseSlug } from '../lib/courses';

/**
 * Uma página por postagem publicada, com o mesmo slug nos dois idiomas.
 *
 * @returns Os caminhos estáticos das postagens publicadas (RN-01: rascunho não gera página).
 * @throws {Error} Se duas postagens publicadas gerarem o mesmo slug (herdado de `buildCourseSlugs`).
 */
export async function postStaticPaths() {
  const posts = filterPublished(await getCollection('extensao'));
  buildCourseSlugs(posts);
  return posts.map((post) => ({
    params: { slug: courseSlug(post.filePath) },
    props: { post },
  }));
}
