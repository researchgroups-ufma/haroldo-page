# Plano — Sincronização das publicações com o ORCID

> **Para agentes executores:** sub-skill obrigatória: `superpowers:subagent-driven-development` ou
> `superpowers:executing-plans`, tarefa por tarefa. Os passos usam caixas (`- [ ]`) para
> acompanhamento.

**Data:** 2026-10-09 · **Branch:** `main` · **Origem:** sabatina
[`CHANGELOG_sabatina_sync-orcid.md`](../../sabatinas/CHANGELOG_sabatina_sync-orcid.md) (9 decisões e
as "Escolhas técnicas sem pergunta", PRD v0.1.79, RF-17, commit `b294837`) · **Referência:** o sync do
repositório irmão `S:\Projetos\academic_page\lafim` (`scripts/orcid-lib.ts`, `scripts/sync-orcid.ts`,
`.github/workflows/orcid.yml`).

**Objetivo:** um workflow semanal cadastra em `content/publicacoes/` os trabalhos do ORCID do
professor que o site ainda não viu, com autores e veículo pela Crossref, e publica o site.

**Arquitetura:** funções puras (parse do ORCID e da Crossref, autores, seleção dos novos, montagem da
entrada) em `src/lib/orcid.ts`, cobertas pelo limiar de 80% do `test:coverage`. Rede e disco ficam num
script fino, `scripts/sync-orcid.ts`, que o Node 24 roda direto (remoção de tipos nativa). O workflow
`.github/workflows/orcid.yml` agenda, valida (testes e build) e só então faz commit e push. Fora de
fase, como a Extensão: não fecha item do §12.

**Stack:** Node 24 (`.nvmrc`), TypeScript, `gray-matter` (já é devDependency), Vitest, GitHub
Actions. APIs públicas: `pub.orcid.org/v3.0` e `api.crossref.org`.

## Restrições globais

- Commits em pt-BR, `tipo: resumo`, **sem trailer** de coautoria (memória
  `commits-sem-coautoria-claude`).
- Arquivo novo: cabeçalho no padrão de `src/lib/slug.ts`; docstring em toda função exportada.
- `src/lib/orcid.ts` importa com extensão `.ts` (`./slug.ts`): o Node roda o script sem bundler, e o
  `allowImportingTsExtensions` já vem de `astro/tsconfigs/base.json`. **Não** importe
  `src/lib/config.ts` (lê `import.meta.env`, que não existe no Node).
- Grafia do professor: `LIMA JUNIOR, HAROLDO C. D.`, a primeira de `siteConfig.author.citationNames`
  (`src/lib/config.ts:51`), copiada numa constante com teste de paridade, como o `defaultItem` do Tina.
- Campos gravados, nesta ordem: `publicado: true`, `titulo`, `autores`, `ano`, `veiculo` (se houver),
  `tipo`, `doi` (puro, minúsculo). Nada de `resumo`, `arxiv`, `destaque`, `linha_relacionada`, `en`.
- Arquivo `content/publicacoes/{ano}-{slugify(titulo)}.md`, com o `slugify` de `src/lib/slug.ts`
  (o mesmo do painel).
- Nunca altera nem apaga arquivo existente.
- **Push na `main` publica o site:** peça confirmação ao usuário antes de cada push e antes de
  disparar o workflow.
- Evidência é saída colada desta sessão; DONE exige `qualidade: success` e
  `Workers Builds: haroldo-page: success` no commit (memória `ci-verde-e-evidencia-nao-comando-local`).

## Foco de revisão

1. **Professor sem ORCID na Crossref.** Em 10 dos 23 DOIs o autor não traz `ORCID`, e a divisão
   varia: `given "Haroldo C. D. Lima"`, `family "Junior"`, ou `given "Haroldo C. D."`,
   `family "Lima"`. Ele tem de sair `LIMA JUNIOR, HAROLDO C. D.` em todos. Teste na Tarefa 1.
2. **Mesmo DOI em caixas diferentes.** O ORCID manda `10.1103/PHYSREVD.108.084029` e o site pode ter
   `https://doi.org/10.1103/physrevd.108.084029`: é o mesmo trabalho e não pode ser reimportado. Teste
   na Tarefa 1.
3. **Título com `:` ou aspas tipográficas.** Exemplos reais: "Good tachyons, bad bradyons: Role
   reversal…" e "Comment on “The equivalence principle…”". O YAML gravado tem de passar no Zod. A
   prova é a Tarefa 2, passo 4, com `tests/content`.
4. **Falha transitória da Crossref** (rede ou 5xx). O DOI **não** vira visto e entra na próxima
   execução; só o 404 vira visto. Na Tarefa 2 isso é conferido na leitura do código, porque o script
   não tem teste unitário.
5. **A execução só marca vistos.** Por exemplo: um 404, ou um DOI cadastrado à mão. O `vistos` muda
   sem publicação nova, e o workflow ainda tem de commitar, senão o aviso volta toda semana. Teste
   na Tarefa 1 (`commitMessage`), verificação na Tarefa 2.

## Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/orcid.ts` (novo) | Funções puras: DOI, parse ORCID/Crossref, autores, seleção, entrada, mensagem de commit |
| `tests/lib/orcid.test.ts` (novo) | Testes sem rede, com registros reais da Crossref |
| `scripts/sync-orcid.ts` (novo) | Rede, leitura de `content/`, escrita dos `.md` e de `data/orcid-vistos.json`, saídas do Actions |
| `data/orcid-vistos.json` (gerado) | DOIs já vistos; criado pela primeira execução do workflow |
| `.github/workflows/orcid.yml` (novo) | Agenda, valida e publica |
| `package.json` | Script `sync-orcid` |
| `.prettierignore` | `data/orcid-vistos.json`, cujo formato é do script |
| `content/publicacoes/*exemplo*` | Apagados na Tarefa 4 (Decisão 7) |
| `README.md`, `PRD.md` | Documentação e estado (Tarefa 5) |

---

### Tarefa 1: funções puras — `src/lib/orcid.ts`

**Arquivos:**
- Criar: `src/lib/orcid.ts`
- Teste: `tests/lib/orcid.test.ts`

**Interfaces (produz):**
- `PROFESSOR_CITATION_NAME: string`
- `type PublicationType = 'artigo' | 'preprint' | 'capítulo' | 'livro' | 'anais' | 'tese' | 'outro'`
- `interface OrcidWork { doi: string | null; title: string; year: number | null; journal: string | null; type: string }`
- `type WorkWithDoi = OrcidWork & { doi: string }`
- `interface CrossrefAuthor { given?: string; family?: string; name?: string; ORCID?: string }`
- `interface CrossrefWork { title: string | null; authors: CrossrefAuthor[]; journal: string | null; year: number | null }`
- `interface PublicationData { publicado: true; titulo: string; autores: string[]; ano: number; veiculo?: string; tipo: PublicationType; doi: string }`
- `interface PublicationEntry { fileName: string; data: PublicationData }`
- `normalizeDoi(raw: string | null | undefined): string | null`
- `parseOrcidWorks(body: { group: OrcidGroup[] }): OrcidWork[]`
- `parseCrossref(message: CrossrefMessage): CrossrefWork`
- `isProfessor(author: CrossrefAuthor, orcid: string): boolean`
- `formatAuthor(author: CrossrefAuthor): string`
- `formatAuthors(authors: CrossrefAuthor[], orcid: string): string[]`
- `mapType(orcidType: string): PublicationType`
- `selectNew(works: OrcidWork[], seen: ReadonlySet<string>, onSite: ReadonlySet<string>): { novos: WorkWithDoi[]; semDoi: OrcidWork[]; jaNoSite: string[] }`
- `buildPublication(work: WorkWithDoi, crossref: CrossrefWork, orcid: string): PublicationEntry | null`
- `commitMessage(added: PublicationEntry[], markedSeen: string[]): string`

- [ ] **Passo 1: escrever o teste que falha** — `tests/lib/orcid.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/lib/config';
import { isProfessorAuthor } from '../../src/lib/publications';
import {
  PROFESSOR_CITATION_NAME,
  buildPublication,
  commitMessage,
  formatAuthor,
  formatAuthors,
  isProfessor,
  mapType,
  normalizeDoi,
  parseCrossref,
  parseOrcidWorks,
  selectNew,
  type CrossrefAuthor,
  type OrcidWork,
} from '../../src/lib/orcid';

const ORCID = '0000-0002-3702-7683';
const THIN = '\u2009'; // a Crossref separa iniciais com espaço fino

describe('PROFESSOR_CITATION_NAME', () => {
  it('é a primeira grafia de citationNames e o site a destaca', () => {
    expect(PROFESSOR_CITATION_NAME).toBe(siteConfig.author.citationNames[0]);
    expect(isProfessorAuthor(PROFESSOR_CITATION_NAME, siteConfig.author.citationNames)).toBe(true);
  });
});

describe('normalizeDoi', () => {
  it.each([
    ['10.1103/PHYSREVD.108.084029', '10.1103/physrevd.108.084029'],
    ['https://doi.org/10.1103/physrevd.108.084029', '10.1103/physrevd.108.084029'],
    ['http://dx.doi.org/10.1119/10.0001572', '10.1119/10.0001572'],
    ['doi: 10.1119/10.0001572 ', '10.1119/10.0001572'],
  ])('%s → %s', (raw, doi) => {
    expect(normalizeDoi(raw)).toBe(doi);
  });

  it('devolve null para vazio ou o que não é DOI', () => {
    expect(normalizeDoi(undefined)).toBeNull();
    expect(normalizeDoi('')).toBeNull();
    expect(normalizeDoi('PPRN:89261396')).toBeNull();
  });
});

describe('parseOrcidWorks', () => {
  // Recorte real de pub.orcid.org/v3.0/0000-0002-3702-7683/works (2026-10-09).
  const body = {
    group: [
      {
        'external-ids': {
          'external-id': [
            { 'external-id-type': 'doi', 'external-id-value': '10.1103/PHYSREVD.108.084029' },
          ],
        },
        'work-summary': [
          {
            title: { title: { value: 'Electrically charged regular black holes' } },
            type: 'journal-article',
            'publication-date': { year: { value: '2023' } },
            'journal-title': { value: 'Physical Review D' },
          },
        ],
      },
      {
        'external-ids': {
          'external-id': [{ 'external-id-type': 'wosuid', 'external-id-value': 'PPRN:68526702' }],
        },
        'work-summary': [
          {
            title: { title: { value: 'Electrically charged regular black holes' } },
            type: 'journal-article',
            'publication-date': null,
            'journal-title': { value: 'ArXiv' },
          },
        ],
      },
    ],
  };

  it('lê DOI normalizado, título, ano, veículo e tipo; sem DOI vira doi null', () => {
    expect(parseOrcidWorks(body)).toEqual([
      {
        doi: '10.1103/physrevd.108.084029',
        title: 'Electrically charged regular black holes',
        year: 2023,
        journal: 'Physical Review D',
        type: 'journal-article',
      },
      {
        doi: null,
        title: 'Electrically charged regular black holes',
        year: null,
        journal: 'ArXiv',
        type: 'journal-article',
      },
    ]);
  });
});

describe('parseCrossref', () => {
  it('limpa marcação do título e do veículo e lê o ano de issued', () => {
    expect(
      parseCrossref({
        title: ['Inspirals &amp; <i>bosonic</i>\n dark matter stars'],
        author: [{ given: 'Vitor', family: 'Cardoso' }],
        'container-title': ['Physical Review D'],
        issued: { 'date-parts': [[2026, 9, 8]] },
      }),
    ).toEqual({
      title: 'Inspirals & bosonic dark matter stars',
      authors: [{ given: 'Vitor', family: 'Cardoso' }],
      journal: 'Physical Review D',
      year: 2026,
    });
  });

  it('campos ausentes viram null ou lista vazia', () => {
    expect(parseCrossref({})).toEqual({
      title: null,
      authors: [],
      journal: null,
      year: null,
    });
  });
});

describe('isProfessor', () => {
  it('reconhece pelo ORCID, qualquer que seja o nome', () => {
    expect(
      isProfessor({ given: `Haroldo C.${THIN}D.`, family: 'Lima', ORCID: `https://orcid.org/${ORCID}` }, ORCID),
    ).toBe(true);
  });

  it('autor com outro ORCID não é o professor', () => {
    expect(
      isProfessor({ given: 'Haroldo', family: 'Lima', ORCID: 'https://orcid.org/0000-0001-9251-4938' }, ORCID),
    ).toBe(false);
  });

  // As quatro divisões que a Crossref usa para ele nos DOIs sem ORCID (levantamento de 2026-10-09).
  it.each<CrossrefAuthor>([
    { given: `Haroldo C.${THIN}D. Lima`, family: 'Junior' },
    { given: 'Haroldo C. D.', family: 'Lima Junior' },
    { given: 'Haroldo C.D. Lima', family: 'Junior' },
    { given: 'Haroldo C. D.', family: 'Lima' },
  ])('reconhece pelo nome sem ORCID: %o', (author) => {
    expect(isProfessor(author, ORCID)).toBe(true);
  });

  it('não confunde outro Lima sem ORCID', () => {
    expect(isProfessor({ given: 'Caio', family: 'Lima' }, ORCID)).toBe(false);
  });
});

describe('formatAuthor', () => {
  it('Sobrenome, Prenome como a Crossref divide, com espaço fino virando espaço', () => {
    expect(formatAuthor({ given: `Caio F.${THIN}B.`, family: 'Macedo' })).toBe('Macedo, Caio F. B.');
  });

  it('sem prenome, só o sobrenome; autoria institucional, o name', () => {
    expect(formatAuthor({ family: 'Cardoso' })).toBe('Cardoso');
    expect(formatAuthor({ name: 'EHT Collaboration' })).toBe('EHT Collaboration');
  });
});

describe('formatAuthors', () => {
  it('mantém a ordem e troca o professor pela grafia de citação', () => {
    expect(
      formatAuthors(
        [
          { given: `Caio F.${THIN}B.`, family: 'Macedo' },
          { given: `Haroldo C.${THIN}D.`, family: 'Lima', ORCID: `https://orcid.org/${ORCID}` },
          { given: 'Vitor', family: 'Cardoso' },
        ],
        ORCID,
      ),
    ).toEqual(['Macedo, Caio F. B.', 'LIMA JUNIOR, HAROLDO C. D.', 'Cardoso, Vitor']);
  });

  it('descarta autor sem nome algum', () => {
    expect(formatAuthors([{}, { family: 'Cardoso' }], ORCID)).toEqual(['Cardoso']);
  });
});

describe('mapType', () => {
  it.each([
    ['journal-article', 'artigo'],
    ['preprint', 'preprint'],
    ['book-chapter', 'capítulo'],
    ['book', 'livro'],
    ['conference-paper', 'anais'],
    ['dissertation-thesis', 'tese'],
    ['lecture-speech', 'outro'],
  ])('%s → %s', (orcidType, tipo) => {
    expect(mapType(orcidType)).toBe(tipo);
  });
});

describe('selectNew', () => {
  const work = (doi: string | null, title = 't'): OrcidWork => ({
    doi,
    title,
    year: 2024,
    journal: null,
    type: 'journal-article',
  });

  it('separa novos, sem DOI e já cadastrados no site; DOI repetido entra uma vez', () => {
    const result = selectNew(
      [work('10.1/a'), work(null, 'preprint'), work('10.1/b'), work('10.1/a'), work('10.1/c')],
      new Set(['10.1/c']),
      new Set(['10.1/b']),
    );
    expect(result.novos.map((w) => w.doi)).toEqual(['10.1/a']);
    expect(result.semDoi.map((w) => w.title)).toEqual(['preprint']);
    expect(result.jaNoSite).toEqual(['10.1/b']);
  });

  it('DOI no site e já visto não é relatado de novo', () => {
    expect(selectNew([work('10.1/b')], new Set(['10.1/b']), new Set(['10.1/b'])).jaNoSite).toEqual([]);
  });
});

describe('buildPublication', () => {
  const work = {
    doi: '10.1103/physrevd.108.084029',
    title: 'Electrically charged regular black holes: a study',
    year: 2023,
    journal: 'ORCID Journal',
    type: 'journal-article',
  };
  const crossref = {
    title: 'Título da Crossref',
    authors: [{ given: 'Haroldo C. D. Lima', family: 'Junior' }, { given: 'Vitor', family: 'Cardoso' }],
    journal: 'Physical Review D',
    year: 2024,
  };

  it('título e ano do ORCID, veículo da Crossref, nome do arquivo pelo slug do painel', () => {
    expect(buildPublication(work, crossref, ORCID)).toEqual({
      fileName: '2023-electrically-charged-regular-black-holes-a-study.md',
      data: {
        publicado: true,
        titulo: 'Electrically charged regular black holes: a study',
        autores: ['LIMA JUNIOR, HAROLDO C. D.', 'Cardoso, Vitor'],
        ano: 2023,
        veiculo: 'Physical Review D',
        tipo: 'artigo',
        doi: '10.1103/physrevd.108.084029',
      },
    });
  });

  it('cai para a Crossref quando o ORCID não tem título, ano ou veículo; sem veículo, sem a chave', () => {
    const entry = buildPublication(
      { ...work, title: '', year: null, journal: null },
      { ...crossref, journal: null },
      ORCID,
    );
    expect(entry?.data.titulo).toBe('Título da Crossref');
    expect(entry?.data.ano).toBe(2024);
    expect(entry?.data).not.toHaveProperty('veiculo');
  });

  it('veículo do ORCID quando a Crossref não tem', () => {
    expect(buildPublication(work, { ...crossref, journal: null }, ORCID)?.data.veiculo).toBe('ORCID Journal');
  });

  it('sem autores, sem título ou sem ano devolve null', () => {
    expect(buildPublication(work, { ...crossref, authors: [] }, ORCID)).toBeNull();
    expect(buildPublication({ ...work, title: '' }, { ...crossref, title: null }, ORCID)).toBeNull();
    expect(buildPublication({ ...work, year: null }, { ...crossref, year: null }, ORCID)).toBeNull();
  });
});

describe('commitMessage', () => {
  const entry = {
    fileName: 'x.md',
    data: {
      publicado: true as const,
      titulo: 'Spectral lines of dirty wormholes',
      autores: ['a'],
      ano: 2024,
      tipo: 'artigo' as const,
      doi: '10.1/x',
    },
  };

  it('com publicação nova: docs, uma linha por publicação', () => {
    expect(commitMessage([entry], [])).toBe(
      'docs: publicações novas do ORCID\n\n- 2024 — Spectral lines of dirty wormholes\n',
    );
  });

  it('com publicação nova e DOI só marcado: lista os dois', () => {
    expect(commitMessage([entry], ['10.1142/so21827182041014x'])).toBe(
      'docs: publicações novas do ORCID\n\n- 2024 — Spectral lines of dirty wormholes\n\n' +
        'Marcados como vistos sem importar:\n- 10.1142/so21827182041014x\n',
    );
  });

  it('só DOI marcado como visto: chore', () => {
    expect(commitMessage([], ['10.1142/so21827182041014x'])).toBe(
      'chore: DOIs do ORCID marcados como vistos\n\n- 10.1142/so21827182041014x\n',
    );
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rode: `npx vitest run tests/lib/orcid.test.ts`
Esperado: FAIL, `Failed to resolve import "../../src/lib/orcid"`.

- [ ] **Passo 3: implementar o mínimo** — `src/lib/orcid.ts`

```ts
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
export type PublicationType = 'artigo' | 'preprint' | 'capítulo' | 'livro' | 'anais' | 'tese' | 'outro';

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
// (U+2009) que ela põe entre iniciais: o site mostra texto puro.
function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '')
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
```

- [ ] **Passo 4: rodar e ver passar**

Rode: `npx vitest run tests/lib/orcid.test.ts`
Esperado: todos PASS. Depois `npm run test:coverage` (a suíte inteira, com o limiar): PASS, e a linha
de `orcid.ts` no relatório ≥ 80% em todas as colunas. Depois `npm run lint` e `npm run format:check`.
Se o Prettier reclamar, rode `npx prettier --write src/lib/orcid.ts tests/lib/orcid.test.ts` e
confira o diff.

- [ ] **Passo 5: commit**

```bash
git add src/lib/orcid.ts tests/lib/orcid.test.ts
git commit -m "feat: funções da sincronização das publicações com o ORCID"
```

---

### Tarefa 2: o script — `scripts/sync-orcid.ts`

**Arquivos:**
- Criar: `scripts/sync-orcid.ts`
- Modificar: `package.json` (bloco `scripts`), `.prettierignore` (fim do arquivo)

**Interfaces:**
- Consome: tudo o que a Tarefa 1 exporta, menos `formatAuthor`, `formatAuthors`, `isProfessor` e `mapType`.
- Produz: `npm run sync-orcid`. Variáveis lidas: `CROSSREF_MAILTO` (opcional), `ORCID_COMMIT_MSG`
  (caminho da mensagem de commit, opcional) e `GITHUB_OUTPUT` (o Actions a define). Saídas:
  `mudou=1|0` e `novos=<n>`.

- [ ] **Passo 1: escrever o script**

```ts
/**
 * ============================================================================
 *  Arquivo      : sync-orcid.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Cadastra em content/publicacoes/ os trabalhos do ORCID do
 *                 professor que o site ainda não viu (RF-17), com autores e
 *                 veículo pela Crossref.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-09
 *  Atualizado em: 2026-10-09
 *  Versão       : 0.1.0
 *
 *  Dependências : gray-matter, src/lib/orcid.ts; rede (ORCID e Crossref)
 *  Entradas     : links.orcid de content/perfil/index.md; content/publicacoes/;
 *                 data/orcid-vistos.json; CROSSREF_MAILTO (opcional)
 *  Saídas       : .md novos em content/publicacoes/; data/orcid-vistos.json;
 *                 `mudou` e `novos` em GITHUB_OUTPUT; mensagem de commit em
 *                 ORCID_COMMIT_MSG
 *  Uso          : npm run sync-orcid (semanal pelo .github/workflows/orcid.yml)
 *
 *  Notas        : só acrescenta, nunca altera nem apaga arquivo. "Visto" é
 *                 permanente: publicação apagada no painel não volta. DOI que a
 *                 Crossref não conhece (404) vira visto com aviso; falha de rede
 *                 ou 5xx deixa o DOI para a próxima execução. Decisões em
 *                 docs/sabatinas/CHANGELOG_sabatina_sync-orcid.md.
 * ============================================================================
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import console from 'node:console';
import process from 'node:process';
import matter from 'gray-matter';
import {
  buildPublication,
  commitMessage,
  normalizeDoi,
  parseCrossref,
  parseOrcidWorks,
  selectNew,
  type CrossrefWork,
  type PublicationEntry,
} from '../src/lib/orcid.ts';

const PUBLICACOES = 'content/publicacoes';
const PERFIL = 'content/perfil/index.md';
const VISTOS = 'data/orcid-vistos.json';
const USER_AGENT = 'haroldo-page (https://github.com/researchgroups-ufma/haroldo-page)';

type CrossrefResult =
  | { status: 'ok'; work: CrossrefWork }
  | { status: 'ausente' }
  | { status: 'falha'; motivo: string };

/** ORCID iD do professor, lido do perfil para que trocar no painel troque a fonte. */
function orcidDoPerfil(): string {
  const link = String(matter(readFileSync(PERFIL, 'utf-8')).data.links?.orcid ?? '');
  const id = /\d{4}-\d{4}-\d{4}-\d{3}[\dX]/.exec(link)?.[0];
  if (!id) throw new Error(`links.orcid ausente ou inválido em ${PERFIL}: "${link}"`);
  return id;
}

/** DOIs normalizados de todas as publicações do site, publicadas ou não. */
function doisNoSite(): Set<string> {
  const dois = new Set<string>();
  for (const nome of readdirSync(PUBLICACOES).filter((n) => n.endsWith('.md'))) {
    const doi = normalizeDoi(matter(readFileSync(join(PUBLICACOES, nome), 'utf-8')).data.doi);
    if (doi) dois.add(doi);
  }
  return dois;
}

function lerVistos(): Set<string> {
  return existsSync(VISTOS) ? new Set(JSON.parse(readFileSync(VISTOS, 'utf-8')) as string[]) : new Set();
}

function gravarVistos(vistos: Set<string>): void {
  mkdirSync(dirname(VISTOS), { recursive: true });
  writeFileSync(VISTOS, `${JSON.stringify([...vistos].sort(), null, 2)}\n`);
}

async function buscarOrcid(orcid: string) {
  const res = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`ORCID respondeu HTTP ${res.status}`);
  return parseOrcidWorks(await res.json());
}

async function buscarCrossref(doi: string, mailto: string): Promise<CrossrefResult> {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': mailto ? `${USER_AGENT} mailto:${mailto}` : USER_AGENT },
    });
    if (res.status === 404) return { status: 'ausente' };
    if (!res.ok) return { status: 'falha', motivo: `HTTP ${res.status}` };
    return { status: 'ok', work: parseCrossref((await res.json()).message) };
  } catch (erro) {
    return { status: 'falha', motivo: String(erro) };
  }
}

function saida(chave: string, valor: string | number): void {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${chave}=${valor}\n`);
}

async function main(): Promise<void> {
  const orcid = orcidDoPerfil();
  const works = await buscarOrcid(orcid);
  console.log(`ORCID ${orcid}: ${works.length} trabalhos`);

  const vistos = lerVistos();
  const { novos, semDoi, jaNoSite } = selectNew(works, vistos, doisNoSite());
  for (const work of semDoi) console.warn(`  sem DOI, ignorado: ${work.title}`);

  // Viram vistos sem gerar arquivo: o que já estava no site e o que a Crossref não conhece.
  const soMarcados = [...jaNoSite];
  const adicionadas: PublicationEntry[] = [];
  for (const work of novos) {
    const crossref = await buscarCrossref(work.doi, process.env.CROSSREF_MAILTO ?? '');
    if (crossref.status === 'falha') {
      console.warn(`  Crossref falhou para ${work.doi} (${crossref.motivo}); fica para a próxima execução`);
      continue;
    }
    if (crossref.status === 'ausente') {
      console.warn(`  DOI desconhecido na Crossref, marcado como visto: ${work.doi} (${work.title})`);
      soMarcados.push(work.doi);
      continue;
    }
    const entry = buildPublication(work, crossref.work, orcid);
    if (!entry) {
      console.warn(`  sem título, autor ou ano; revisar à mão: ${work.doi}`);
      continue;
    }
    const arquivo = join(PUBLICACOES, entry.fileName);
    if (existsSync(arquivo)) {
      console.warn(`  ${arquivo} já existe com outro DOI; revisar à mão: ${work.doi}`);
      continue;
    }
    writeFileSync(arquivo, matter.stringify('', entry.data));
    adicionadas.push(entry);
    console.log(`  + ${arquivo}`);
  }

  for (const doi of [...soMarcados, ...adicionadas.map((e) => e.data.doi)]) vistos.add(doi);
  const mudou = adicionadas.length > 0 || soMarcados.length > 0;
  if (mudou) gravarVistos(vistos);
  saida('mudou', mudou ? 1 : 0);
  saida('novos', adicionadas.length);
  console.log(`${adicionadas.length} publicação(ões) nova(s); ${soMarcados.length} DOI(s) só marcado(s) como visto(s).`);

  if (mudou && process.env.ORCID_COMMIT_MSG) {
    writeFileSync(process.env.ORCID_COMMIT_MSG, commitMessage(adicionadas, soMarcados));
  }
}

main().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
```

`package.json`, no bloco `scripts`, depois de `"deploy"` (com a vírgula na linha de `deploy`):

```json
    "sync-orcid": "node scripts/sync-orcid.ts"
```

`.prettierignore`, no fim:

```
# Lista de DOIs gravada pelo scripts/sync-orcid.ts (RF-17), num formato que é dele, não do
# Prettier: sem esta linha, o commit do workflow do ORCID deixaria o format:check vermelho.
data/orcid-vistos.json
```

- [ ] **Passo 2: conferir o Foco de revisão 4 e 5 na leitura**

Leia o laço: `falha` dá `continue` antes de `soMarcados.push` (o DOI não vira visto); `ausente` vira
visto; `mudou` é verdadeiro também quando só `soMarcados` cresceu. Anote o resultado na Evidência.

- [ ] **Passo 3: rodar localmente (ensaio da primeira execução)**

Rode no Git Bash: `ORCID_COMMIT_MSG="$TEMP/orcid-msg.txt" npm run sync-orcid 2>&1 | tee "$TEMP/sync-orcid.txt"`
Esperado: `ORCID 0000-0002-3702-7683: 28 trabalhos`, 4 avisos `sem DOI`, 1 aviso
`DOI desconhecido … 10.1142/so21827182041014x`, 23 linhas `+ content/publicacoes/…` e
`23 publicação(ões) nova(s); 1 DOI(s) só marcado(s)`. Os números são os de 2026-10-09. Se o ORCID
tiver mudado, anote a diferença em vez de forçar. `data/orcid-vistos.json` deve ter 24 DOIs, e a
mensagem em `$TEMP/orcid-msg.txt` deve começar por `docs: publicações novas do ORCID`.

- [ ] **Passo 4: validar o que foi gravado**

- `npx vitest run tests/content`: os 23 arquivos passam no Zod. Isso cobre o Foco 3: abra também o
  `.md` de "Good tachyons, bad bradyons: …" e confira as aspas do YAML.
- `grep -L "LIMA JUNIOR, HAROLDO C. D." content/publicacoes/20*.md | grep -v exemplo`: saída vazia,
  porque o professor está em todos (Foco 1).
- Rode `npm run sync-orcid` de novo: `0 publicação(ões) nova(s); 0 DOI(s) só marcado(s)`, sem
  `mudou=1`. Isso prova que a segunda execução não reimporta.
- `npm run build`, depois `npm run preview`. Abra no **Vivaldi** `/publicacoes/` e `/en/publications/`:
  os anos de 2020 a 2026 aparecem, o professor em destaque e o link do DOI em cada item. Anote o
  que viu.

- [ ] **Passo 5: desfazer o ensaio**

Os arquivos do ensaio **não** entram no commit. Quem faz a primeira execução de verdade é o
workflow, na Tarefa 3. Rode `git status --short`, que deve listar só os 23 `.md` novos, `data/`,
`package.json`, `.prettierignore` e o script. Depois:

```bash
git clean -n content/publicacoes data   # conferir a lista: só os 23 .md e data/orcid-vistos.json
git clean -f content/publicacoes data
```

Derrube o `npm run preview`.

- [ ] **Passo 6: lint, formato, tipos e commit**

Rode `npm run lint`, `npm run format:check` e `npx astro check`: todos limpos.

```bash
git add scripts/sync-orcid.ts package.json .prettierignore
git commit -m "feat: script de sincronização das publicações com o ORCID"
```

---

### Tarefa 3: o workflow, e a primeira execução de verdade

**Arquivos:**
- Criar: `.github/workflows/orcid.yml`

- [ ] **Passo 1: escrever o workflow**

```yaml
name: ORCID

# Cadastra no site as publicacoes novas do ORCID do professor, toda semana (RF-17). O trabalho
# esta em scripts/sync-orcid.ts; aqui so agenda, valida e publica. Decisoes em
# docs/sabatinas/CHANGELOG_sabatina_sync-orcid.md.
#
# Push feito com o GITHUB_TOKEN nao dispara outros workflows (o GitHub evita recursao), entao o
# ci.yml nao roda depois deste push. Por isso testes e build acontecem aqui, ANTES do push: se
# falharem, nada e publicado e o GitHub manda e-mail de falha a quem alterou o cron por ultimo.
# O Workers Builds publica a partir do push, como num salvamento do painel.
on:
  schedule:
    - cron: '0 11 * * 1' # segunda-feira, 08:00 em Sao Luis (UTC-3)
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: orcid
  cancel-in-progress: false

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - name: Busca publicacoes novas
        id: sync
        run: npm run sync-orcid
        env:
          CROSSREF_MAILTO: haroldo.lima@ufma.br
          ORCID_COMMIT_MSG: ${{ runner.temp }}/orcid-commit.txt
      - name: Testes e build antes de publicar
        if: steps.sync.outputs.mudou == '1'
        run: |
          npm run test:coverage
          npm run build:pipeline
          npm run test:dist
        env:
          TINA_CLIENT_ID: ${{ secrets.TINA_CLIENT_ID }}
          TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
      # Assina com o noreply do desenvolvedor, como no lafim: o historico fica so com o perfil dele.
      - name: Commit e push
        if: steps.sync.outputs.mudou == '1'
        run: |
          git config user.name "André Ferreira"
          git config user.email "160500693+abbadrava@users.noreply.github.com"
          git add content/publicacoes data/orcid-vistos.json
          git commit -F "$RUNNER_TEMP/orcid-commit.txt"
          git push
```

- [ ] **Passo 2: formato e commit**

Rode `npm run format:check`. Depois:

```bash
git add .github/workflows/orcid.yml
git commit -m "feat: workflow semanal de sincronização com o ORCID"
```

- [ ] **Passo 3: push (pedir confirmação antes)**

`git push`. Depois espere o CI (`gh run watch`) e confira os check-runs com o **SHA completo**:
`gh api repos/researchgroups-ufma/haroldo-page/commits/<SHA>/check-runs --jq '.check_runs[] | "\(.name): \(.status) / \(.conclusion)"'`.
Esperado: `qualidade: completed / success` e `Workers Builds: haroldo-page: completed / success`.

- [ ] **Passo 4: disparar a primeira execução (pedir confirmação antes)**

`gh workflow run orcid.yml`, depois `gh run list --workflow orcid.yml --limit 1` e `gh run watch <id>`.
Esperado: run `success`, e o log do passo "Busca publicacoes novas" igual ao do ensaio da Tarefa 2.
`git pull` traz o commit do workflow: `docs: publicações novas do ORCID`, autor André Ferreira
(noreply), 23 `.md` e `data/orcid-vistos.json`, sem trailer.

- [ ] **Passo 5: conferir a publicação**

- Check-runs do commit do workflow: `Workers Builds: haroldo-page: success`. Não há `qualidade`,
  porque o push do `GITHUB_TOKEN` não dispara o CI, e isso é esperado: os testes rodaram no próprio
  workflow.
- `curl -s https://haroldo-page.and-near.workers.dev/publicacoes/ | grep -c "doi.org/10."`: pelo
  menos 23.

---

### Tarefa 4: apagar as publicações de exemplo (Decisão 7)

Vem depois da Tarefa 3 de propósito. `tests/lib/publications.test.ts` e
`tests/lib/published.test.ts` exigem `content/publicacoes/` não vazio. Se os exemplos saíssem antes
da carga, o CI e os testes do próprio workflow ficariam vermelhos.

**Arquivos:**
- Apagar: os 6 `content/publicacoes/20*-exemplo-*.md`

- [ ] **Passo 1: conferir quem depende deles**

`grep -rn "exemplo-notas\|exemplo-perturbacoes\|exemplo-desvios\|exemplo-modos\|exemplo-forcas\|exemplo-sombras-de-buracos-negros-de-kerr" src tests docs/identidade-visual.md`:
esperado vazio, como no levantamento da sabatina. Se aparecer algo, pare e relate.

- [ ] **Passo 2: apagar e rodar a suíte**

```bash
git rm content/publicacoes/20*-exemplo-*.md
npm run test:coverage && npm run build && npm run test:dist
```

Esperado: tudo verde. O teste de rascunho de `tests/dist/site-gerado.test.ts` pode passar pelo ramo
"passa trivialmente" se não restar rascunho em `content/`. Anote qual mensagem saiu.

- [ ] **Passo 3: ver no Vivaldi** (`npm run preview`)

`/pesquisa/` e `/en/research/`: as duas linhas que tinham publicação de exemplo ligada
(`linha_relacionada`) ficam sem a lista, sem deixar título ou espaço vazio (F-08 "campo vazio não deixa
rastro"). `/` e `/en/`: a célula de publicações mostra as reais. Anote. Se sobrar rastro vazio, pare e
relate, porque isso seria um defeito de view e está fora deste plano.

- [ ] **Passo 4: commit e push (pedir confirmação antes do push)**

```bash
git commit -m "chore: remove as publicações de exemplo, substituídas pelas do ORCID"
git push
```

Check-runs do SHA completo: `qualidade: success` e `Workers Builds: haroldo-page: success`.

---

### Tarefa 5: documentação e estado

**Arquivos:**
- Modificar: `README.md` (seção "Pipeline de publicação", subseção nova no fim), `PRD.md` (linha
  "Estado da implementação" e "Última atualização"), este plano (Evidência)

- [ ] **Passo 1: README** — subseção `### Publicações do ORCID` com:
  - o que o workflow faz, quando roda e como rodar à mão (aba Actions → ORCID → Run workflow, ou
    `gh workflow run orcid.yml`);
  - regras: só acrescenta; `data/orcid-vistos.json` impede a volta do que foi apagado; para
    reimportar, tire o DOI desse arquivo; sem DOI não entra; DOI que a Crossref não conhece vira
    visto com aviso no log, e corrigir o DOI no ORCID resolve;
  - autores como a Crossref grava, o professor reconhecido pelo ORCID ou pelo nome;
  - falha do workflow manda e-mail; o log fica no passo "Busca publicacoes novas".

- [ ] **Passo 2: PRD** — no "Estado da implementação", trocar
  `**Sync do ORCID (RF-17) decidido em sabatina em 2026-10-09, sem plano**` por
  `**Sync do ORCID (RF-17) implementado fora de fase em 2026-10-09 (`<hash da Tarefa 3>`)**`;
  "Última atualização" fica em 2026-10-09. A versão **não** sobe (convenção da promoção). Rode
  `npx prettier --check PRD.md README.md`.

- [ ] **Passo 3: Evidência** — no fim deste arquivo, uma seção `## Evidência` com as saídas coladas:
  testes da Tarefa 1, ensaio da Tarefa 2, o run do workflow (id e trecho do log), os check-runs dos
  dois pushes, o `curl` de produção e o que se viu no Vivaldi.

- [ ] **Passo 4: commit e push (pedir confirmação antes do push)**

```bash
git add README.md PRD.md docs/superpowers/plans/2026-10-09-sync-orcid.md
git commit -m "docs: sync do ORCID no README, estado do PRD e evidência do plano"
git push
```

Check-runs verdes. Depois, atualizar a memória `haroldo-page-estado-atual`, substituindo o bloco de
estado.

## Evidência

Execução inline em 2026-10-09, na `main`. Saídas desta sessão.

**Tarefa 1** (`6bbc4ef`). RED: `Error: Cannot find module '../../src/lib/orcid'`. GREEN:

```
 Test Files  25 passed (25)
      Tests  455 passed (455)
All files          |     100 |    99.15 |     100 |     100 |
  orcid.ts         |     100 |    96.72 |     100 |     100 | 146,148
```

`npm run lint` limpo, `format:check` limpo, `astro check`: `0 errors, 0 warnings, 0 hints`.

**Tarefa 2** (`ffbe5ae`). Ensaio local:

```
ORCID 0000-0002-3702-7683: 28 trabalhos
  sem DOI, ignorado: (4 registros)
  + content/publicacoes/… (23 arquivos)
  DOI desconhecido na Crossref, marcado como visto: 10.1142/so21827182041014x (Tidal forces in the charged Hayward black hole spacetime)
23 publicação(ões) nova(s); 1 DOI(s) só marcado(s) como visto(s).
mudou=1 / novos=23 ; data/orcid-vistos.json com 24 DOIs
```

- `tests/content`: 145/145.
- Professor presente nos 23 arquivos (`grep -L` vazio).
- Segunda execução: `0 publicação(ões) nova(s); 0 DOI(s) só marcado(s)`, `mudou=0`.
- `npm run build` verde.
- No Vivaldi, `/publicacoes/` e `/en/publications/` mostram 28 itens (23 reais e 5 exemplos),
  anos de 2026 a 2020, e o professor em `<strong>` nos 28.
- Desvio registrado: `lineWidth: -1` no `matter.stringify`. Sem ele, o ensaio dobrava títulos
  longos em `>-`.

**Tarefa 3** (`3928fd2`).

- CI 37957476554 `success`. Check-runs: `qualidade: completed / success` e
  `Workers Builds: haroldo-page: completed / success`.
- Workflow ORCID 37957835889 `success`, com o log igual ao do ensaio.
- O primeiro `gh workflow run` devolveu HTTP 500, mas criou o run. O run duplicado (37957875705)
  foi cancelado antes de começar.
- Commit do workflow: `fd85f47`, `docs: publicações novas do ORCID`, autor
  `André Ferreira <160500693+abbadrava@users.noreply.github.com>`, 24 arquivos, sem trailer.
  `Workers Builds: haroldo-page: completed / success`.
- Produção, `/publicacoes/`: 26 DOIs únicos (23 reais e 3 de exemplo).

**Tarefa 4** (`628db82`).

- `test:coverage`: 455/455. `build` verde. `test:dist`: 54/54. A varredura RN-01 roda com o
  rascunho real de `content/extensao/`.
- No Vivaldi, `/pesquisa/`, `/en/research/`, `/` e `/en/`: nenhum `[EXEMPLO]` de publicação e
  nenhuma lista vazia.

**Achado fora do escopo, para o stakeholder:** `PublicationItem.astro` junta os autores com `, `. No
formato `Sobrenome, Prenome` (Decisão 4) a fronteira entre autores fica ambígua, como em "Furuta,
Leonardo K. S., Magalhães, Renan B., …". A view não foi alterada.
