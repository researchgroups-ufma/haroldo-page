/**
 * ============================================================================
 *  Arquivo      : tina-lock-coerente.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Verifica que `tina/tina-lock.json` (o único artefato do Tina
 *                 versionado, ver README §"Painel de edição") está em dia com
 *                 `tina/config.ts`. O lock só é regenerado por `npx tinacms
 *                 dev`, manualmente; sem este teste, quem muda o schema e
 *                 esquece de subir o dev server produz um lock defasado que
 *                 segue para `main` em silêncio e só aparece dias depois,
 *                 como "No Tina config was found on main" no painel do
 *                 TinaCloud (RNF-09, dívida 2 da fase 1).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-11
 *  Atualizado em: 2026-09-11
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, tina/config.ts, tina/tina-lock.json
 *  Entradas     : nenhuma (introspecção do config em memória e leitura do lock em disco)
 *  Saídas       : nenhuma — só asserções
 *  Uso          : `npm run test` / `npm run test:coverage` / `vitest run tests/content`
 *
 *  Notas        : compara a **forma declarativa** das cinco coleções — `name`, `path`,
 *                 `format` no nível da coleção, e `type`, `required`, `list`, `options`,
 *                 `collections` (alvo de `type: 'reference'`) por campo, por caminho
 *                 qualificado (ex.: `disciplinas.scripts[].linguagem`) —, não a validade do
 *                 GraphQL gerado (seção `graphql` do lock): a árvore declarativa basta para
 *                 detectar um lock defasado, e o SDL é derivado dela.
 *
 *                 `options` e `collections` são comparados **na ordem declarada**, não como
 *                 conjunto — reordenar sem mudar os valores já é divergência (achado da revisão
 *                 do plano 031, defeito 2: um `.sort()` anterior mascarava essa reordenação).
 *
 *                 `tina/config.ts` importa `tinacms` (`defineConfig`), cujo bundle não carrega
 *                 sob Vitest (interop CJS/ESM de `color-string`) — o mesmo problema documentado
 *                 em `tests/content/paridade-schema.test.ts`. Por isso o módulo é mockado com o
 *                 mesmo `defineConfig` identidade antes de importar `tina/config.ts`.
 *
 *                 Chaves explicitamente NÃO comparadas por este teste, e o motivo de cada uma:
 *                   - `label`, `description` — texto de apresentação, não estrutura.
 *                   - `ui`, `itemProps`, `defaultItem` — funções; não sobrevivem à serialização
 *                     JSON do lock (gerado por `tinacms dev`, que descarta closures) e dariam
 *                     falso positivo permanente se comparadas.
 *                   - `namespace`, `searchable`, `uid` — sintetizadas pelo Tina só no lock; não
 *                     existem em `tina/config.ts` (candidatas óbvias a falso positivo).
 *
 *                 `collections` (o alvo de um campo `type: 'reference'`, ex.:
 *                 `linha_relacionada`) **é comparado** — na ordem declarada, junto com `type`,
 *                 `required`, `list` e `options` (achado da revisão do plano 031, defeito 1: uma
 *                 referência apontando para a coleção errada, com o lock intocado, passava
 *                 despercebida).
 *
 *                 Se `schema.collections` do lock não existir ou não for um array, o teste
 *                 falha alto (`loadLockCollections` lança), em vez de aproximar por contagem de
 *                 ocorrências de texto — o que detectaria campo adicionado, mas não renomeação
 *                 nem mudança de `required`.
 * ============================================================================
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

// `defineConfig` real só valida o schema e devolve o `config` inalterado (ver Notas do
// cabeçalho) — o mock evita carregar o bundle completo do `tinacms` sob Vitest.
vi.mock('tinacms', () => ({
  defineConfig: (config: unknown) => config,
}));

const { default: tinaConfig } = await import('../../tina/config');

/** Recorte mínimo de um campo, comum a `tina/config.ts` e a `tina/tina-lock.json`. */
interface DeclarativeField {
  type: string;
  name: string;
  required?: boolean;
  list?: boolean;
  options?: unknown[];
  fields?: DeclarativeField[];
  /** Alvo de um campo `type: 'reference'` (ex.: `linha_relacionada: ['linhas_pesquisa']`). */
  collections?: string[];
}

/** Recorte mínimo de uma coleção, comum aos dois lados. */
interface DeclarativeCollection {
  name: string;
  path: string;
  format: string;
  fields: DeclarativeField[];
}

/** Forma do `tina/tina-lock.json` usada por este teste — só `schema.collections`. */
interface TinaLockFile {
  schema: {
    collections: DeclarativeCollection[];
  };
}

/**
 * Lê e valida a forma mínima esperada de `tina/tina-lock.json`.
 *
 * @throws Se `schema.collections` não existir ou não for um array — sinal de que a estrutura
 * do lock mudou e este teste precisa ser revisto antes de confiar no resultado (ver Notas).
 */
function loadLockCollections(): DeclarativeCollection[] {
  const raw = readFileSync(join(__dirname, '../../tina/tina-lock.json'), 'utf-8');
  const parsed = JSON.parse(raw) as Partial<TinaLockFile>;
  const collections = parsed.schema?.collections;
  if (!Array.isArray(collections)) {
    throw new Error(
      'tina-lock.json: schema.collections não existe ou não é um array — a estrutura do lock ' +
        'mudou; este teste (plano 031) precisa ser revisto antes de confiar no resultado.',
    );
  }
  return collections;
}

/** Subconjunto declarativo e serializável de um campo, comparável entre config e lock. */
interface FieldSignature {
  type: string;
  required: boolean;
  list: boolean;
  // `options` e `collections` são comparados na ordem declarada, não como conjunto: a ordem de
  // `options` é a ordem do select no painel (o lock a preserva), e a de `collections` é a lista
  // de coleções aceitas por uma `reference` — as duas fazem parte da forma declarativa, não só
  // os valores presentes (achado da revisão do plano 031, defeito 2).
  options?: string[];
  collections?: string[];
}

/** Reduz um `DeclarativeField` ao subconjunto comparável (ver lista de chaves ignoradas nas Notas). */
function extractSignature(field: DeclarativeField): FieldSignature {
  const signature: FieldSignature = {
    type: field.type,
    required: field.required === true,
    list: field.list === true,
  };
  if (field.options) {
    signature.options = [...(field.options as string[])];
  }
  if (field.collections) {
    signature.collections = [...field.collections];
  }
  return signature;
}

/**
 * Percorre `fields` recursivamente, acumulando `caminho -> assinatura` em `out`.
 *
 * Campos-objeto com `list: true` propagam `[]` no prefixo dos filhos (ex.:
 * `disciplinas.scripts[].linguagem`); campos-objeto sem `list` propagam o próprio caminho
 * (ex.: `projetos.periodo.inicio`).
 */
function collectPaths(fields: DeclarativeField[], prefix: string, out: Map<string, FieldSignature>): void {
  for (const field of fields) {
    const caminho = `${prefix}.${field.name}`;
    out.set(caminho, extractSignature(field));
    if (field.fields) {
      collectPaths(field.fields, field.list ? `${caminho}[]` : caminho, out);
    }
  }
}

/** Monta o mapa de caminhos qualificados de todas as coleções, prefixados pelo nome da coleção. */
function buildAllPaths(collections: DeclarativeCollection[]): Map<string, FieldSignature> {
  const paths = new Map<string, FieldSignature>();
  for (const collection of collections) {
    collectPaths(collection.fields, collection.name, paths);
  }
  return paths;
}

/** Compara duas assinaturas de um mesmo caminho, empilhando mensagens em `erros`. */
function compareSignatures(caminho: string, config: FieldSignature, lock: FieldSignature, erros: string[]): void {
  if (config.type !== lock.type) {
    erros.push(`${caminho}: type diverge — config="${config.type}", lock="${lock.type}"`);
  }
  if (config.required !== lock.required) {
    erros.push(
      `${caminho}: required diverge — config=${config.required ? 'obrigatório' : 'opcional'}, lock=${lock.required ? 'obrigatório' : 'opcional'}`,
    );
  }
  if (config.list !== lock.list) {
    erros.push(`${caminho}: list diverge — config=${config.list}, lock=${lock.list}`);
  }
  // Comparação por ordem declarada (não por conjunto) — ver comentário em `FieldSignature`.
  const configOptions = (config.options ?? []).join('|');
  const lockOptions = (lock.options ?? []).join('|');
  if (configOptions !== lockOptions) {
    erros.push(`${caminho}: options divergem — config=[${configOptions}], lock=[${lockOptions}]`);
  }
  const configCollections = (config.collections ?? []).join('|');
  const lockCollections = (lock.collections ?? []).join('|');
  if (configCollections !== lockCollections) {
    erros.push(
      `${caminho}: collections divergem — config=[${configCollections}], lock=[${lockCollections}]`,
    );
  }
}

/**
 * Compara os dois mapas de caminhos por conjunto (campo só de um lado) e, para os caminhos em
 * comum, por assinatura (`type`, `required`, `list`, `options`, `collections`).
 */
function compareTrees(
  configPaths: Map<string, FieldSignature>,
  lockPaths: Map<string, FieldSignature>,
): { erros: string[]; caminhosComuns: number } {
  const erros: string[] = [];
  const todosOsCaminhos = new Set([...configPaths.keys(), ...lockPaths.keys()]);
  let caminhosComuns = 0;
  for (const caminho of todosOsCaminhos) {
    const config = configPaths.get(caminho);
    const lock = lockPaths.get(caminho);
    if (!config) {
      erros.push(`${caminho}: existe só no lock`);
      continue;
    }
    if (!lock) {
      erros.push(`${caminho}: existe só no config`);
      continue;
    }
    caminhosComuns += 1;
    compareSignatures(caminho, config, lock, erros);
  }
  return { erros, caminhosComuns };
}

const configCollections = tinaConfig.schema.collections as unknown as DeclarativeCollection[];
const lockCollections = loadLockCollections();

describe('coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1)', () => {
  it('as cinco coleções existem nos dois lados, com os mesmos nomes', () => {
    const nomesConfig = configCollections.map((c) => c.name).sort();
    const nomesLock = lockCollections.map((c) => c.name).sort();
    expect(nomesLock).toEqual(nomesConfig);
  });

  for (const collection of configCollections) {
    it(`coleção ${collection.name}: path e format do lock batem com o config`, () => {
      const lockCollection = lockCollections.find((c) => c.name === collection.name);
      expect(lockCollection).toBeDefined();
      expect(lockCollection?.path).toBe(collection.path);
      expect(lockCollection?.format).toBe(collection.format);
    });
  }

  it('árvore de campos declarativos bate por caminho qualificado — type, required, list, options e collections', () => {
    const configPaths = buildAllPaths(configCollections);
    const lockPaths = buildAllPaths(lockCollections);
    const { erros, caminhosComuns } = compareTrees(configPaths, lockPaths);

    // Varredura vazia (zero caminhos comuns) passaria por vacuidade — não é proteção real.
    expect(caminhosComuns).toBeGreaterThan(50);
    expect(erros).toEqual([]);
  });
});
