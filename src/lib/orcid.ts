/**
 * ============================================================================
 *  Arquivo      : orcid.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Funções puras da sincronização das publicações com o ORCID
 *                 (RF-17): leitura das respostas do ORCID e da Crossref, autores,
 *                 escolha dos trabalhos novos e montagem do frontmatter.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-09
 *  Atualizado em: 2026-10-09
 *  Versão       : 0.1.0
 *
 *  Dependências : src/lib/slug.ts
 *  Entradas     : JSON de pub.orcid.org/v3.0/<id>/works e de api.crossref.org/works/<doi>
 *  Saídas       : entradas prontas para content/publicacoes/ e a mensagem de commit
 *  Uso          : scripts/sync-orcid.ts (rede e disco ficam lá)
 *
 *  Notas        : decisões em docs/sabatinas/CHANGELOG_sabatina_sync-orcid.md.
 *                 Importa `./slug.ts` com extensão porque o Node roda o script sem
 *                 bundler; não pode importar `config.ts`, que lê `import.meta.env`.
 * ============================================================================
 */
import { slugify } from './slug.ts';

/** Grafia gravada para o professor: a primeira de `siteConfig.author.citationNames` (teste de paridade). */
export const PROFESSOR_CITATION_NAME = 'LIMA JUNIOR, HAROLDO C. D.';

/** Valores de `tipo` aceitos pelo schema de `publicacoes`. */
export type PublicationType =
  'artigo' | 'preprint' | 'capítulo' | 'livro' | 'anais' | 'tese' | 'outro';

/** Um trabalho do ORCID, com o DOI já normalizado (`null` quando não há). */
export interface OrcidWork {
  doi: string | null;
  title: string;
  year: number | null;
  journal: string | null;
  type: string;
}

/** Trabalho com DOI garantido, o único que a Crossref sabe completar. */
export type WorkWithDoi = OrcidWork & { doi: string };

/** Autor como a Crossref o devolve. */
export interface CrossrefAuthor {
  given?: string;
  family?: string;
  name?: string;
  ORCID?: string;
}

/** O que o sync usa de um registro da Crossref. */
export interface CrossrefWork {
  title: string | null;
  authors: CrossrefAuthor[];
  journal: string | null;
  year: number | null;
}

/** Frontmatter gravado, na ordem dos campos do painel. */
export interface PublicationData {
  publicado: true;
  titulo: string;
  autores: string[];
  ano: number;
  veiculo?: string;
  tipo: PublicationType;
  doi: string;
}

/** Arquivo a criar em `content/publicacoes/`. */
export interface PublicationEntry {
  fileName: string;
  data: PublicationData;
}

interface OrcidGroup {
  'external-ids'?: {
    'external-id'?: { 'external-id-type': string; 'external-id-value': string }[];
  } | null;
  'work-summary': {
    title?: { title?: { value?: string } | null } | null;
    type: string;
    'publication-date'?: { year?: { value?: string } | null } | null;
    'journal-title'?: { value?: string } | null;
  }[];
}

interface CrossrefMessage {
  title?: string[];
  author?: CrossrefAuthor[];
  'container-title'?: string[];
  issued?: { 'date-parts'?: (number | null)[][] };
}

/**
 * Reduz qualquer forma de DOI (puro, `doi:`, URL do doi.org) à forma canônica em minúsculas.
 *
 * @param raw DOI como aparece no ORCID ou no conteúdo do site.
 * @returns `10.xxxx/...` em minúsculas, ou `null` se não for um DOI.
 */
export function normalizeDoi(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const doi = raw
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim()
    .toLowerCase();
  return doi.startsWith('10.') ? doi : null;
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

// Tira a marcação JATS da Crossref (<i>, <sub>) e junta qualquer espaço, inclusive o fino
// (U+2009) que ela põe entre iniciais: o site mostra texto puro. Só conta como marcação o `<`
// seguido de nome de tag: "0 < a < 1 and b > 2" é título de física, não tag.
function cleanText(raw: string): string {
  return raw
    .replace(/<\/?[A-Za-z][\w:-]*[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lê a resposta de `pub.orcid.org/v3.0/<id>/works`: um trabalho por grupo, com o resumo preferido.
 *
 * @param body JSON da API pública do ORCID.
 * @returns Os trabalhos, com `doi: null` quando o grupo não tem DOI.
 */
export function parseOrcidWorks(body: { group: OrcidGroup[] }): OrcidWork[] {
  return body.group.map((group) => {
    const summary = group['work-summary'][0];
    const doi = group['external-ids']?.['external-id']?.find(
      (id) => id['external-id-type'] === 'doi',
    );
    const year = summary['publication-date']?.year?.value;
    return {
      doi: normalizeDoi(doi?.['external-id-value']),
      title: cleanText(summary.title?.title?.value ?? ''),
      year: year ? Number(year) : null,
      journal: summary['journal-title']?.value ?? null,
      type: summary.type,
    };
  });
}

/**
 * Lê o `message` de `api.crossref.org/works/<doi>`.
 *
 * @param message Registro da Crossref.
 * @returns Título e veículo limpos, autores crus e o ano de `issued`.
 */
export function parseCrossref(message: CrossrefMessage): CrossrefWork {
  const title = message.title?.[0];
  const journal = message['container-title']?.[0];
  return {
    title: title ? cleanText(title) : null,
    authors: message.author ?? [],
    journal: journal ? cleanText(journal) : null,
    year: message.issued?.['date-parts']?.[0]?.[0] ?? null,
  };
}

// Sem acento, minúsculas, só letras separadas por espaço: "Haroldo C.D. Lima" → "haroldo c d lima".
function nameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

/**
 * Diz se o autor da Crossref é o professor: pelo ORCID quando o registro o traz; sem ORCID, pelo
 * nome "Haroldo … Lima", porque a Crossref divide o nome dele de quatro jeitos diferentes.
 *
 * @param author Autor da Crossref.
 * @param orcid ORCID iD do professor (`0000-0002-3702-7683`).
 * @returns `true` se for o professor.
 */
export function isProfessor(author: CrossrefAuthor, orcid: string): boolean {
  if (author.ORCID) return author.ORCID.endsWith(orcid);
  return /^haroldo\b.*\blima\b/.test(nameKey(`${author.given ?? ''} ${author.family ?? ''}`));
}

/**
 * Um autor como a Crossref o divide: `Sobrenome, Prenome` (Decisão 4).
 *
 * @param author Autor da Crossref.
 * @returns `family, given`; só `family` sem prenome; `name` na autoria institucional.
 */
export function formatAuthor(author: CrossrefAuthor): string {
  const family = cleanText(author.family ?? '');
  const given = cleanText(author.given ?? '');
  if (!family) return cleanText(author.name ?? '');
  return given ? `${family}, ${given}` : family;
}

/**
 * A lista de autores na ordem da Crossref, com o professor na grafia que o site destaca.
 *
 * @param authors Autores da Crossref.
 * @param orcid ORCID iD do professor.
 * @returns Os autores formatados, sem entradas vazias.
 */
export function formatAuthors(authors: CrossrefAuthor[], orcid: string): string[] {
  return authors
    .map((author) => (isProfessor(author, orcid) ? PROFESSOR_CITATION_NAME : formatAuthor(author)))
    .filter(Boolean);
}

const TYPES: Record<string, PublicationType> = {
  'journal-article': 'artigo',
  preprint: 'preprint',
  'book-chapter': 'capítulo',
  book: 'livro',
  'conference-paper': 'anais',
  'dissertation-thesis': 'tese',
};

/**
 * Tipo do ORCID → `tipo` do schema.
 *
 * @param orcidType Valor de `type` no ORCID.
 * @returns O tipo correspondente, ou `outro`.
 */
export function mapType(orcidType: string): PublicationType {
  return TYPES[orcidType] ?? 'outro';
}

/**
 * Separa os trabalhos do ORCID em novos (a importar), sem DOI (ignorados, Decisão 5) e já
 * cadastrados no site sem constar como vistos (passam a constar, para não voltar se apagados).
 *
 * @param works Trabalhos do ORCID.
 * @param seen DOIs de `data/orcid-vistos.json`.
 * @param onSite DOIs de `content/publicacoes/`, normalizados.
 * @returns Os três grupos; um DOI repetido no ORCID entra uma vez.
 */
export function selectNew(
  works: OrcidWork[],
  seen: ReadonlySet<string>,
  onSite: ReadonlySet<string>,
): { novos: WorkWithDoi[]; semDoi: OrcidWork[]; jaNoSite: string[] } {
  const novos: WorkWithDoi[] = [];
  const semDoi: OrcidWork[] = [];
  const jaNoSite: string[] = [];
  const handled = new Set(seen);
  for (const work of works) {
    if (!work.doi) {
      semDoi.push(work);
      continue;
    }
    if (handled.has(work.doi)) continue;
    handled.add(work.doi);
    if (onSite.has(work.doi)) jaNoSite.push(work.doi);
    else novos.push({ ...work, doi: work.doi });
  }
  return { novos, semDoi, jaNoSite };
}

/**
 * Monta o arquivo de uma publicação nova: título, ano e tipo do ORCID (o título vem limpo), autores
 * e veículo da Crossref, cada um caindo para a outra fonte na falta.
 *
 * @param work Trabalho do ORCID, com DOI.
 * @param crossref Registro da Crossref do mesmo DOI.
 * @param orcid ORCID iD do professor.
 * @returns A entrada, ou `null` se faltar título, autor ou ano (o schema os exige).
 */
export function buildPublication(
  work: WorkWithDoi,
  crossref: CrossrefWork,
  orcid: string,
): PublicationEntry | null {
  const titulo = work.title || crossref.title;
  const autores = formatAuthors(crossref.authors, orcid);
  const ano = work.year ?? crossref.year;
  if (!titulo || autores.length === 0 || !ano) return null;
  const veiculo = crossref.journal ?? work.journal;
  return {
    fileName: `${ano}-${slugify(titulo)}.md`,
    data: {
      publicado: true,
      titulo,
      autores,
      ano,
      ...(veiculo ? { veiculo } : {}),
      tipo: mapType(work.type),
      doi: work.doi,
    },
  };
}

/**
 * Aviso de log para um DOI que a Crossref não tem (404). Ele vira visto nos dois casos, mas a
 * mensagem diz se o DOI não existe (corrigir no ORCID resolve) ou se é de outra agência, como os
 * preprints do arXiv e o Zenodo na DataCite (cadastro pelo painel).
 *
 * @param doi DOI normalizado.
 * @param title Título do ORCID, para achar o trabalho no log.
 * @param agency Rótulo da agência dona do DOI (`/works/{doi}/agency`), ou `null` se nenhuma o conhece.
 * @returns A linha de aviso.
 */
export function unknownDoiWarning(doi: string, title: string, agency: string | null): string {
  return agency
    ? `DOI registrado na ${agency}, não na Crossref; marcado como visto, cadastre pelo painel: ${doi} (${title})`
    : `DOI desconhecido na Crossref, marcado como visto: ${doi} (${title})`;
}

/**
 * Mensagem do commit do workflow: `docs:` quando há publicação nova, `chore:` quando só houve DOI
 * marcado como visto (404 da Crossref ou DOI já cadastrado à mão).
 *
 * @param added Publicações gravadas nesta execução.
 * @param markedSeen DOIs que viraram vistos sem gerar arquivo.
 * @returns A mensagem, terminada em quebra de linha.
 */
export function commitMessage(added: PublicationEntry[], markedSeen: string[]): string {
  const seenList = markedSeen.map((doi) => `- ${doi}`).join('\n');
  if (added.length === 0) return `chore: DOIs do ORCID marcados como vistos\n\n${seenList}\n`;
  const addedList = added.map(({ data }) => `- ${data.ano} — ${data.titulo}`).join('\n');
  const seenBlock = markedSeen.length ? `\n\nMarcados como vistos sem importar:\n${seenList}` : '';
  return `docs: publicações novas do ORCID\n\n${addedList}${seenBlock}\n`;
}
