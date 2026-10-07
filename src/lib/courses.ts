/**
 * ============================================================================
 *  Arquivo      : courses.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Decide a URL de cada disciplina a partir do nome do arquivo
 *                 (README da fase, decisão 3), separa disciplinas atuais de
 *                 anteriores com ordem definida (RN-03, RF-23), agrupa
 *                 scripts sob a aula correspondente (F-13, RF-37) e lista as
 *                 seções presentes, que viram as abas da disciplina (§6.5).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-17
 *  Atualizado em: 2026-09-24
 *  Versão       : 0.2.0
 *
 *  Dependências : node:path, src/lib/slug.ts (slugify)
 *  Entradas     : arrays de entradas de coleção, na forma devolvida por
 *                 `getCollection` (`{ data: {...}, filePath?: string }`),
 *                 tipadas estruturalmente — este módulo não importa
 *                 `astro:content`
 *  Saídas       : slugs (`courseSlug`, `buildCourseSlugs`), grupos
 *                 (`splitCourses`), agrupamento de scripts (`groupScriptsByLesson`), ordem e
 *                 âncora da aba Scripts (`scriptsForTab`, `scriptAnchor`) e a lista de seções
 *                 presentes (`presentSections`)
 *  Uso          : const slug = courseSlug(entry.filePath)
 *
 *  Notas        : funções puras, sem efeitos colaterais, testáveis sem a content layer do Astro
 * ============================================================================
 */

import path from 'node:path';
import { slugify } from './slug';

/**
 * Deriva o slug de URL de uma disciplina a partir do **nome do arquivo**, nunca de `entry.id`
 * nem de `semestre` + `nome` dos dados (README da fase, decisão 3).
 *
 * O Tina grava o arquivo como `${slugify(nome)}` (sabatina "Ensino modelo A", Decisão 2; até
 * 2026-10-07 era `${semestre}-${slugify(nome)}`). Aplicar `slugify` ao nome do arquivo sem a
 * extensão `.md` dá o slug (`relatividade-geral.md` → `relatividade-geral`), e um arquivo antigo
 * com ponto vira hífen (`2026.2-relatividade-geral.md` → `2026-2-relatividade-geral`), de forma estável mesmo se
 * o professor corrigir um erro de digitação no `nome` depois (RN-08: o nome do arquivo não muda
 * com a edição). `entry.id` é rejeitado porque o loader `glob()` do Astro passa cada segmento por
 * `githubSlug`, que remove o ponto (`node_modules/astro/dist/content/utils.js:272`).
 *
 * Aceita `/` e `\` como separador de caminho, sem depender do SO.
 *
 * @param filePath Caminho do arquivo de conteúdo (`entry.filePath`), opcional no tipo do Astro
 *   (`node_modules/astro/dist/content/data-store.d.ts:22`).
 * @returns O slug da URL da disciplina.
 * @throws {Error} Se `filePath` for `undefined` ou o slug resultante for vazio.
 */
export function courseSlug(filePath: string | undefined): string {
  if (filePath === undefined) {
    throw new Error(
      'courseSlug: filePath ausente — a entrada de conteúdo não trouxe o caminho do arquivo',
    );
  }
  const normalized = filePath.replace(/\\/g, '/');
  const fileName = path.posix.basename(normalized);
  const withoutExtension = fileName.replace(/\.md$/, '');
  const slug = slugify(withoutExtension);
  if (slug === '') {
    throw new Error(`courseSlug: slug vazio para o caminho "${filePath}"`);
  }
  return slug;
}

/**
 * Constrói o mapa de slug para caminho de arquivo de todas as disciplinas, para
 * `ensino/[slug].astro` (`getStaticPaths`, plano 048).
 *
 * Reprova o build com um `Error` nomeando os dois caminhos em conflito em vez de deixar uma
 * disciplina sobrescrever a página da outra silenciosamente.
 *
 * @param entries Entradas de `disciplinas`, na forma devolvida por `getCollection`.
 * @returns Mapa de slug para `filePath`.
 * @throws {Error} Se `courseSlug` lançar para alguma entrada, ou se duas entradas produzirem o
 *   mesmo slug.
 */
export function buildCourseSlugs(entries: { filePath?: string }[]): Map<string, string> {
  const bySlug = new Map<string, string>();
  for (const entry of entries) {
    const slug = courseSlug(entry.filePath);
    // courseSlug já lançou acima se `entry.filePath` fosse `undefined`.
    const filePath = entry.filePath as string;
    const existing = bySlug.get(slug);
    if (existing !== undefined) {
      throw new Error(
        `buildCourseSlugs: slug "${slug}" duplicado entre "${existing}" e "${filePath}"`,
      );
    }
    bySlug.set(slug, filePath);
  }
  return bySlug;
}

/** Entrada de `disciplinas` com os campos usados em `splitCourses` (§6.4, RN-03). */
type CourseGroupLike = { data: { status: 'atual' | 'anterior'; nome: string } };

/** Compara duas disciplinas por `nome` crescente, colação `pt-BR` (acento no lugar certo). */
function compareCourseGroup(a: CourseGroupLike, b: CourseGroupLike): number {
  return a.data.nome.localeCompare(b.data.nome, 'pt-BR');
}

/**
 * Separa disciplinas em "Em curso" e "Encerradas" para `/ensino` (RF-23, §6.4).
 *
 * // RN-03: a transição de em curso para encerrada é manual (campo `status`); nenhuma lógica de data.
 * Dentro de cada grupo, ordem alfabética pelo `nome` em português, nas duas línguas; `semestre` não
 * influi (sabatina "Ensino modelo A", Decisão 6).
 *
 * @param entries Entradas de `disciplinas`, na forma devolvida por `getCollection`.
 * @returns `{ current, previous }`, cada um novo array ordenado; não muta `entries`.
 */
export function splitCourses<T extends CourseGroupLike>(
  entries: T[],
): { current: T[]; previous: T[] } {
  return {
    current: entries.filter((entry) => entry.data.status === 'atual').sort(compareCourseGroup),
    previous: entries.filter((entry) => entry.data.status === 'anterior').sort(compareCourseGroup),
  };
}

/**
 * Agrupa scripts de uma disciplina sob a aula correspondente (F-13, RF-37, §6.5).
 *
 * `byLesson[i]` traz os scripts da aula na **posição** `i` de `lessons` — alinhado por índice, e
 * não por `numero`, porque `lessons` é exibido na ordem do professor (RN-04), não ordenado por
 * `numero`. Um script cujo `aula` casa com o `numero` de mais de uma aula (o schema não impede
 * números repetidos) vai para a **primeira** aula com esse número. Script sem `aula`, ou cujo
 * `aula` não casa com nenhuma aula, vai para `general` — o build nunca falha e nenhum script some
 * (F-13).
 *
 * // RN-04: ordem definida pelo professor, não por número nem data — `lessons` nunca é reordenado.
 *
 * @param lessons Aulas da disciplina, na ordem do professor (`data.aulas`).
 * @param scripts Scripts da disciplina, na ordem do professor (`data.scripts`).
 * @returns `{ byLesson, general }`; `byLesson.flat().length + general.length === scripts.length`,
 *   e a ordem relativa dos scripts é preservada em cada grupo.
 */
export function groupScriptsByLesson<S extends { aula?: number }>(
  lessons: { numero: number }[],
  scripts: S[],
): { byLesson: S[][]; general: S[] } {
  const byLesson: S[][] = lessons.map(() => []);
  const general: S[] = [];
  for (const script of scripts) {
    // F-13: `aula` sem correspondência não é erro — o script degrada para `general`.
    const index =
      script.aula === undefined ? -1 : lessons.findIndex((l) => l.numero === script.aula);
    if (index === -1) {
      general.push(script);
    } else {
      byLesson[index].push(script);
    }
  }
  return { byLesson, general };
}

/**
 * Âncora HTML de um script na aba Scripts, pela posição dele em `data.scripts` (1 em diante).
 * Estável enquanto o professor não reordena a lista; não depende do título, que pode repetir.
 *
 * @param index Posição do script em `data.scripts`, a partir de 0.
 * @returns O `id` do painel do script (ex.: `'script-3'`).
 */
export function scriptAnchor(index: number): string {
  return `script-${index + 1}`;
}

/**
 * Ordena os scripts para a aba Scripts da disciplina (sabatina "Ensino modelo A", Decisão 12):
 * primeiro os ligados a uma aula, na ordem das aulas do professor (RN-04), cada um com o número
 * da aula; depois os gerais — sem `aula` ou com `aula` que não casa (F-13) —, na ordem da lista.
 * O agrupamento é o de `groupScriptsByLesson`.
 *
 * @param lessons Aulas da disciplina, na ordem do professor.
 * @param scripts Scripts da disciplina, na ordem de `data.scripts`.
 * @returns `{ script, lesson, anchor }` na ordem da aba; `lesson` é o `numero` da aula, ausente nos
 *   gerais; `anchor` vem de `scriptAnchor` pela posição original.
 */
export function scriptsForTab<S extends { aula?: number }>(
  lessons: { numero: number }[],
  scripts: S[],
): { script: S; lesson?: number; anchor: string }[] {
  const { byLesson, general } = groupScriptsByLesson(lessons, scripts);
  const anchor = (script: S) => scriptAnchor(scripts.indexOf(script));
  return [
    ...byLesson.flatMap((group, i) =>
      group.map((script) => ({ script, lesson: lessons[i].numero, anchor: anchor(script) })),
    ),
    ...general.map((script) => ({ script, anchor: anchor(script) })),
  ];
}

/** União literal das chaves de `pt.course` referenciadas por `presentSections` (§6.5). */
export type SectionKey =
  'syllabus' | 'lessons' | 'courseScripts' | 'problemSets' | 'materials' | 'bibliography' | 'links';

/** Entrada de `disciplinas` com os campos usados em `presentSections` (§6.5). */
type CourseSectionsLike = {
  ementa?: string;
  aulas?: unknown[];
  scripts?: unknown[];
  listas?: unknown[];
  materiais?: unknown[];
  bibliografia?: unknown[];
  links?: unknown[];
};

/**
 * Lista as seções presentes na página de disciplina, na ordem fixa do §6.5 da identidade, para o
 * bloco "Nesta página".
 *
 * `aulas` está **sempre** presente, mesmo com `count: 0` (F-06 exige estado vazio explícito).
 * `scripts` aparece com qualquer script, ligado a uma aula ou não: todos ficam na aba Scripts, e a
 * aula só aponta para o seu (sabatina "Ensino modelo A", Decisão 12). As demais seções só aparecem
 * se não vazias.
 *
 * @param data Campos de uma entrada de `disciplinas` (`entry.data`).
 * @returns Lista ordenada de `{ id, key, count }`; `id` é o id da âncora HTML da seção, `key` a
 *   chave de `pt.course` correspondente.
 */
export function presentSections(
  data: CourseSectionsLike,
): { id: string; key: SectionKey; count: number }[] {
  const sections: { id: string; key: SectionKey; count: number }[] = [];

  if (data.ementa?.trim()) {
    sections.push({ id: 'ementa', key: 'syllabus', count: 1 });
  }

  // F-06: seção Aulas sempre presente, para o estado vazio explícito.
  sections.push({ id: 'aulas', key: 'lessons', count: data.aulas?.length ?? 0 });

  const scriptsCount = data.scripts?.length ?? 0;
  if (scriptsCount > 0) {
    sections.push({ id: 'scripts', key: 'courseScripts', count: scriptsCount });
  }

  const listasCount = data.listas?.length ?? 0;
  if (listasCount > 0) {
    sections.push({ id: 'listas', key: 'problemSets', count: listasCount });
  }

  const materiaisCount = data.materiais?.length ?? 0;
  if (materiaisCount > 0) {
    sections.push({ id: 'materiais', key: 'materials', count: materiaisCount });
  }

  const bibliografiaCount = data.bibliografia?.length ?? 0;
  if (bibliografiaCount > 0) {
    sections.push({ id: 'bibliografia', key: 'bibliography', count: bibliografiaCount });
  }

  const linksCount = data.links?.length ?? 0;
  if (linksCount > 0) {
    sections.push({ id: 'links', key: 'links', count: linksCount });
  }

  return sections;
}
