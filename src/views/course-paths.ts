/**
 * ============================================================================
 *  Arquivo      : course-paths.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : `getStaticPaths` compartilhado da página de disciplina (RF-24):
 *                 uma rota por disciplina publicada. O slug é o mesmo nos dois
 *                 idiomas (sabatina fase 4, Decisão 3), então a rota EN
 *                 (plano 067) reusa esta função.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-30
 *  Atualizado em: 2026-09-30
 *  Versão       : 0.1.0
 *
 *  Dependências : src/lib/published.ts (filterPublished), src/lib/courses.ts
 *                 (courseSlug, buildCourseSlugs), astro:content (getCollection)
 *  Entradas     : coleção `disciplinas`, já validada pelo Zod
 *  Saídas       : lista `{ params: { slug }, props: { course } }` para o Astro
 *  Uso          : export const getStaticPaths = courseStaticPaths;
 *
 *  Notas        : só roda no build; não tem cobertura do Vitest (`src/views/`
 *                 fica fora dela) — o build e o `test:dist` a exercitam.
 * ============================================================================
 */
import { getCollection } from 'astro:content';
import { filterPublished } from '../lib/published';
import { buildCourseSlugs, courseSlug } from '../lib/courses';

/**
 * Gera um caminho por disciplina publicada, com a entrada como prop `course`.
 *
 * Sem parâmetros. Reprova o build, nomeando os dois caminhos, se duas disciplinas publicadas
 * colidirem no slug.
 */
export async function courseStaticPaths() {
  // RN-01: rascunho (`publicado: false`) não gera página.
  const courses = filterPublished(await getCollection('disciplinas'));
  // Reprova o build, nomeando os dois caminhos, se duas disciplinas publicadas colidirem no slug.
  buildCourseSlugs(courses);
  return courses.map((course) => ({
    params: { slug: courseSlug(course.filePath) },
    props: { course },
  }));
}
