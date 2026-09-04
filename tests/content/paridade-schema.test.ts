/**
 * ============================================================================
 *  Arquivo      : paridade-schema.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Teste de paridade entre o schema Zod (`src/content.config.ts`,
 *                 o portão de validação, D-06) e o schema do TinaCMS
 *                 (`tina/config.ts`, a interface de entrada). Falha quando um
 *                 campo existe só de um lado, quando a obrigatoriedade diverge,
 *                 quando um enum tem valores diferentes, ou quando o grupo `en`
 *                 (plano 018) ou uma lista embutida de disciplina (D-05) não
 *                 batem. É a rede de proteção do professor (F-09, RNF-09): sem
 *                 este teste, um campo acrescentado só ao Tina produz um build
 *                 quebrado que ele não sabe diagnosticar.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-03
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, src/content.config.ts, tina/config.ts
 *  Entradas     : nenhuma (introspecção dos dois schemas em memória)
 *  Saídas       : nenhuma — só asserções
 *  Uso          : `npm run test` / `npm run test:coverage`
 *
 *  Notas        : abordagem de comparação = introspecção (não declaração
 *                 única — fora do escopo da fase 1, ver plano 019). Os dois
 *                 schemas são objetos JavaScript de formatos diferentes;
 *                 `classifyZod`/`classifyTina` normalizam cada um para a
 *                 mesma forma comparável (`NormField`), e `compareFields`
 *                 percorre as duas árvores em paralelo.
 *
 *                 `classifyZod` lê `._zod.def` — introspecção de internos do
 *                 Zod 4 (via `astro/zod`, `zod@4.5.4`), não API pública
 *                 documentada. **Limitação assumida:** um upgrade de versão
 *                 do Zod pode mudar esse formato interno e quebrar este
 *                 teste — não o schema em si. A alternativa (derivar os dois
 *                 schemas de uma declaração única em TypeScript) eliminaria
 *                 essa fragilidade por construção, mas é reescrita dos planos
 *                 016 e 017 e está fora do escopo desta fase.
 *
 *                 `tina/config.ts` importa `tinacms` (`defineConfig`), cujo
 *                 bundle completo (React, color-picker etc.) não carrega sob
 *                 Vitest/Vite por um problema de interop CJS/ESM alheio a
 *                 este schema (`color-string` não expõe export nomeado
 *                 `get`). Por isso o módulo `tinacms` é mockado
 *                 (`vi.mock`) com um `defineConfig` identidade antes de
 *                 importar `tina/config.ts` — o `defineConfig` real
 *                 (`node_modules/tinacms/dist/index.js`) só valida o schema
 *                 e devolve o `config` inalterado; o mock preserva esse
 *                 comportamento de passagem para um schema que já validou
 *                 com sucesso via `tinacms dev`/`build` nos planos 017/018.
 *
 *                 Três divergências não são tratadas como bug — ver
 *                 `describe` dedicado abaixo: o identificador interno da
 *                 coleção `linhas_pesquisa` (Tina) × `linhas-pesquisa` (Zod,
 *                 pasta); restrições finas do Zod sem equivalente no Tina
 *                 (faixa de `publicacoes.ano`, mínimo de `autores`,
 *                 `z.email()`, `z.url()` — o próprio D-06); e a assimetria
 *                 esperada dentro do grupo `en` (nenhum subcampo obrigatório
 *                 dos dois lados).
 *
 *                 O formato do valor de `projetos.linha_relacionada` (Tina
 *                 grava o id completo do documento; o loader `glob()` do
 *                 Astro espera o id sem pasta nem extensão) não é uma
 *                 divergência de forma de schema — é testado à parte, com o
 *                 valor literal que o Tina grava.
 * ============================================================================
 */
import { describe, expect, it, vi } from 'vitest';
import {
  perfilSchema,
  linhasPesquisaSchema,
  projetosSchema,
  disciplinasSchema,
  publicacoesSchema,
} from '../../src/content.config';

// `defineConfig` real só valida o schema e devolve o `config` inalterado (ver Notas do
// cabeçalho) — o mock evita carregar o bundle completo do `tinacms` sob Vitest.
vi.mock('tinacms', () => ({
  defineConfig: (config: unknown) => config,
}));

const { default: tinaConfig } = await import('../../tina/config');

/** Tipos de campo que este normalizador reconhece dos dois lados. */
type Kind = 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object' | 'reference';

/** Forma normalizada de um campo, comparável entre Zod e Tina. */
interface NormField {
  required: boolean;
  kind: Kind;
  enumValues?: string[];
  children?: Record<string, NormField>;
  item?: NormField;
}

// ---------------------------------------------------------------------------
// Lado Zod — introspecção de `._zod.def` (ver limitação nas Notas do cabeçalho)
// ---------------------------------------------------------------------------

/**
 * Recorte mínimo de `._zod.def` usado por este normalizador — não é a API
 * pública do Zod. Cada propriedade só existe conforme `type`: `innerType` em
 * `optional`/`nullable`/`default`; `in`/`out` em `pipe`; `element` em
 * `array`; `shape` em `object`; `entries` em `enum`; `options` em `union`.
 */
interface ZodDefLike {
  type: string;
  innerType?: ZodIntrospectable;
  in?: ZodIntrospectable;
  out?: ZodIntrospectable;
  element?: ZodIntrospectable;
  shape?: Record<string, ZodIntrospectable>;
  entries?: Record<string, string>;
  options?: ZodIntrospectable[];
}

/** Qualquer `ZodType` do schema, reduzido ao que este normalizador lê. */
interface ZodIntrospectable {
  safeParse(value: unknown): { success: boolean };
  _zod: { def: ZodDefLike };
}

/** Remove `optional`/`nullable`/`default` e segue um `pipe` (ex.: `z.preprocess`) até o tipo-núcleo. */
function unwrapZod(schema: ZodIntrospectable): ZodIntrospectable {
  let atual = schema;
  for (;;) {
    const def = atual._zod.def;
    if (def.type === 'optional' || def.type === 'nullable' || def.type === 'default') {
      atual = def.innerType as ZodIntrospectable;
      continue;
    }
    if (def.type === 'pipe') {
      atual = (def.out ?? def.in) as ZodIntrospectable;
      continue;
    }
    return atual;
  }
}

/**
 * Detecta um campo `reference()` do Astro (`astro/dist/content/runtime.js`,
 * `createReference`): por baixo de `optional`/`pipe` (inclusive o
 * `z.preprocess` de `linha_relacionada`), existe uma `union` de 4 alternativas
 * — número, string, objeto `{id, collection}` e objeto `{slug, collection}`.
 */
function isReferenceSchema(schema: ZodIntrospectable | undefined, profundidade = 0): boolean {
  if (!schema || profundidade > 8) return false;
  const def = schema._zod.def;
  if (def.type === 'optional' || def.type === 'nullable' || def.type === 'default') {
    return isReferenceSchema(def.innerType, profundidade + 1);
  }
  if (def.type === 'pipe') {
    return isReferenceSchema(def.in, profundidade + 1) || isReferenceSchema(def.out, profundidade + 1);
  }
  if (def.type === 'union' && Array.isArray(def.options) && def.options.length === 4) {
    const formas = def.options.map((opcao) => {
      const opcaoDef = opcao._zod.def;
      if (opcaoDef.type !== 'object' || !opcaoDef.shape) return opcaoDef.type;
      return Object.keys(opcaoDef.shape).sort().join(',');
    });
    return formas.includes('collection,id') && formas.includes('collection,slug');
  }
  return false;
}

/** Normaliza um `ZodType` de `src/content.config.ts` para `NormField`. */
function classifyZod(schema: ZodIntrospectable): NormField {
  const required = !schema.safeParse(undefined).success;
  if (isReferenceSchema(schema)) {
    return { required, kind: 'reference' };
  }
  const nucleo = unwrapZod(schema);
  const def = nucleo._zod.def;
  switch (def.type) {
    case 'string':
      return { required, kind: 'string' };
    case 'number':
      return { required, kind: 'number' };
    case 'boolean':
      return { required, kind: 'boolean' };
    case 'enum':
      return { required, kind: 'enum', enumValues: Object.keys(def.entries ?? {}).sort() };
    case 'array':
      return { required, kind: 'array', item: classifyZod(def.element as ZodIntrospectable) };
    case 'object': {
      const children: Record<string, NormField> = {};
      for (const [nome, campo] of Object.entries(def.shape ?? {})) {
        children[nome] = classifyZod(campo);
      }
      return { required, kind: 'object', children };
    }
    default:
      throw new Error(`classifyZod: tipo Zod não tratado pelo normalizador de paridade: "${def.type}"`);
  }
}

// ---------------------------------------------------------------------------
// Lado Tina — árvore de `fields` de `tina/config.ts`
// ---------------------------------------------------------------------------

/** Recorte mínimo de um campo de `tina/config.ts` usado por este normalizador. */
interface TinaFieldLike {
  type: string;
  name: string;
  required?: boolean;
  list?: boolean;
  options?: unknown[];
  fields?: TinaFieldLike[];
}

/** Mapeia `type` de campo do Tina para `Kind` — `image` (foto, imagem) equivale a `string` no Zod. */
function mapScalarKind(tipo: string): Kind {
  if (tipo === 'string' || tipo === 'image') return 'string';
  if (tipo === 'number') return 'number';
  if (tipo === 'boolean') return 'boolean';
  throw new Error(`mapScalarKind: tipo Tina não tratado pelo normalizador de paridade: "${tipo}"`);
}

/** Normaliza um campo de `tina/config.ts` para `NormField`. */
function classifyTina(campo: TinaFieldLike): NormField {
  const required = campo.required === true;
  if (campo.list) {
    const item: NormField =
      campo.type === 'object'
        ? { required: true, kind: 'object', children: buildTinaChildren(campo.fields ?? []) }
        : { required: true, kind: mapScalarKind(campo.type) };
    return { required, kind: 'array', item };
  }
  if (campo.type === 'object') {
    return { required, kind: 'object', children: buildTinaChildren(campo.fields ?? []) };
  }
  if (campo.type === 'reference') {
    return { required, kind: 'reference' };
  }
  if (campo.type === 'string' && Array.isArray(campo.options) && campo.options.length > 0) {
    return { required, kind: 'enum', enumValues: [...(campo.options as string[])].sort() };
  }
  return { required, kind: mapScalarKind(campo.type) };
}

function buildTinaChildren(campos: TinaFieldLike[]): Record<string, NormField> {
  const children: Record<string, NormField> = {};
  for (const campo of campos) {
    children[campo.name] = classifyTina(campo);
  }
  return children;
}

// ---------------------------------------------------------------------------
// Comparação
// ---------------------------------------------------------------------------

/** Compara dois `NormField` recursivamente, empilhando mensagens em `erros`. */
function compareFields(caminho: string, zod: NormField, tina: NormField, erros: string[]): void {
  if (zod.kind !== tina.kind) {
    erros.push(`${caminho}: tipo diverge — Zod="${zod.kind}", Tina="${tina.kind}"`);
    return;
  }
  if (zod.required !== tina.required) {
    erros.push(
      `${caminho}: obrigatoriedade diverge — Zod=${zod.required ? 'obrigatório' : 'opcional'}, Tina=${tina.required ? 'obrigatório' : 'opcional'}`,
    );
  }
  if (zod.kind === 'enum') {
    const zodValues = (zod.enumValues ?? []).join('|');
    const tinaValues = (tina.enumValues ?? []).join('|');
    if (zodValues !== tinaValues) {
      erros.push(`${caminho}: valores de enum divergem — Zod=[${zodValues}], Tina=[${tinaValues}]`);
    }
  }
  if (zod.kind === 'array' && zod.item && tina.item) {
    compareFields(`${caminho}[]`, zod.item, tina.item, erros);
  }
  if (zod.kind === 'object' && zod.children && tina.children) {
    compareObjects(caminho, zod.children, tina.children, erros);
  }
}

function compareObjects(
  caminho: string,
  zodChildren: Record<string, NormField>,
  tinaChildren: Record<string, NormField>,
  erros: string[],
): void {
  const todosOsCampos = new Set([...Object.keys(zodChildren), ...Object.keys(tinaChildren)]);
  for (const campo of todosOsCampos) {
    const caminhoCompleto = caminho ? `${caminho}.${campo}` : campo;
    if (!(campo in zodChildren)) {
      erros.push(`${caminhoCompleto}: existe só no Tina`);
      continue;
    }
    if (!(campo in tinaChildren)) {
      erros.push(`${caminhoCompleto}: existe só no Zod`);
      continue;
    }
    compareFields(caminhoCompleto, zodChildren[campo], tinaChildren[campo], erros);
  }
}

/** `linhas_pesquisa` (identificador GraphQL interno do Tina) ~ `linhas-pesquisa` (pasta, chave do Zod). */
function normalizeCollectionName(nomeTina: string): string {
  return nomeTina.replace(/_/g, '-');
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

const zodSchemas: Record<string, ZodIntrospectable> = {
  perfil: perfilSchema as unknown as ZodIntrospectable,
  'linhas-pesquisa': linhasPesquisaSchema as unknown as ZodIntrospectable,
  projetos: projetosSchema as unknown as ZodIntrospectable,
  disciplinas: disciplinasSchema as unknown as ZodIntrospectable,
  publicacoes: publicacoesSchema as unknown as ZodIntrospectable,
};

const tinaCollections = tinaConfig.schema.collections as unknown as (TinaFieldLike & {
  name: string;
  fields: TinaFieldLike[];
})[];

describe('paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts)', () => {
  it('as cinco coleções existem dos dois lados, com o mesmo mapeamento de nome', () => {
    const nomesTina = tinaCollections.map((c) => normalizeCollectionName(c.name)).sort();
    const nomesZod = Object.keys(zodSchemas).sort();
    expect(nomesTina).toEqual(nomesZod);
  });

  for (const tinaCollection of tinaCollections) {
    const nome = normalizeCollectionName(tinaCollection.name);

    it(`coleção ${nome}: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas`, () => {
      const zodNorm = classifyZod(zodSchemas[nome]);
      const tinaNorm: NormField = {
        required: true,
        kind: 'object',
        children: buildTinaChildren(tinaCollection.fields),
      };
      const erros: string[] = [];
      compareFields(nome, zodNorm, tinaNorm, erros);
      expect(erros).toEqual([]);
    });
  }
});

describe('formato do valor de projetos.linha_relacionada (divergência real corrigida)', () => {
  const base = { titulo: 'Projeto de sombras', descricao: 'Descrição do projeto.', publicado: true };

  it('normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera', () => {
    const resultado = projetosSchema.safeParse({
      ...base,
      linha_relacionada: 'content/linhas-pesquisa/minha-linha.md',
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.linha_relacionada).toEqual({ id: 'minha-linha', collection: 'linhas-pesquisa' });
    }
  });

  it('continua aceitando o id já normalizado, sem pasta nem extensão', () => {
    const resultado = projetosSchema.safeParse({ ...base, linha_relacionada: 'minha-linha' });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.linha_relacionada).toEqual({ id: 'minha-linha', collection: 'linhas-pesquisa' });
    }
  });

  it('não mexe em valores que já não são string — forma `{id, collection}` do próprio `reference()` passa intacta', () => {
    const resultado = projetosSchema.safeParse({
      ...base,
      linha_relacionada: { id: 'minha-linha', collection: 'linhas-pesquisa' },
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.linha_relacionada).toEqual({ id: 'minha-linha', collection: 'linhas-pesquisa' });
    }
  });
});

describe('três falsos positivos que um teste ingênuo reprovaria sem haver divergência real', () => {
  it('`linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) — só o identificador interno diverge', () => {
    const tinaLinhas = tinaCollections.find((c) => c.name === 'linhas_pesquisa');
    expect(tinaLinhas).toBeDefined();
    expect(normalizeCollectionName(tinaLinhas!.name)).toBe('linhas-pesquisa');
  });

  it('restrições finas do Zod sem equivalente no Tina (faixa de `ano`, mínimo de `autores`, `z.email()`, `z.url()`) não reprovam a paridade — é o próprio D-06', () => {
    const tinaPublicacoes = tinaCollections.find((c) => normalizeCollectionName(c.name) === 'publicacoes')!;
    const erros: string[] = [];
    compareFields(
      'publicacoes',
      classifyZod(zodSchemas.publicacoes),
      { required: true, kind: 'object', children: buildTinaChildren(tinaPublicacoes.fields) },
      erros,
    );
    expect(erros).toEqual([]);
  });

  it('grupo `en`: nenhum subcampo é obrigatório dos dois lados — não é assimetria de paridade (RN-09)', () => {
    const zodEn = classifyZod(zodSchemas.disciplinas).children?.en;
    const tinaDisciplinas = tinaCollections.find((c) => normalizeCollectionName(c.name) === 'disciplinas')!;
    const tinaEnCampo = tinaDisciplinas.fields.find((f) => f.name === 'en')!;
    const tinaEn = classifyTina(tinaEnCampo);

    expect(zodEn?.required).toBe(false);
    expect(tinaEn.required).toBe(false);
    for (const [, filho] of Object.entries(zodEn?.children ?? {})) {
      expect(filho.required).toBe(false);
    }
    for (const [, filho] of Object.entries(tinaEn.children ?? {})) {
      expect(filho.required).toBe(false);
    }
  });
});
