/**
 * ============================================================================
 *  Arquivo      : schemas.test.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Testes unitários dos schemas Zod das cinco coleções
 *                 definidas em `src/content.config.ts` (§7.3, §11 do PRD).
 *                 Exercita os schemas diretamente via `.safeParse`, sem
 *                 depender de arquivos em `content/` — o schema é o portão de
 *                 validação (D-06); o conteúdo real (placeholder) é o plano
 *                 020. Importa os `ZodObject` exportados nomeadamente
 *                 (`perfilSchema` etc.), não `collections.*.schema` — esse
 *                 último é tipado como união (`ZodObject | função | undefined`)
 *                 pela Content Layer API e não expõe `.safeParse` sem
 *                 narrowing.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-02
 *  Atualizado em: 2026-09-02
 *  Versão       : 0.1.0
 *
 *  Dependências : vitest, src/content.config.ts
 *  Entradas     : nenhuma (objetos sintéticos construídos no próprio teste)
 *  Saídas       : nenhuma — só asserções
 *  Uso          : `npm run test` / `npm run test:coverage`
 *
 *  Notas        : cada `describe` cobre uma coleção. F-09 (ano de publicação
 *                 entre 1900 e 2100), os enums fechados (`tipo` de publicação,
 *                 `status` de disciplina) e a ausência de campo obrigatório
 *                 têm teste dedicado, conforme o plano 016 exige.
 * ============================================================================
 */
import { describe, expect, it } from 'vitest';
import {
  collections,
  perfilSchema,
  linhasPesquisaSchema,
  projetosSchema,
  disciplinasSchema,
  publicacoesSchema,
} from '../../src/content.config';

/** Devolve uma cópia de `obj` sem a chave `chave`, para testar campo obrigatório ausente. */
function omit<T extends Record<string, unknown>>(obj: T, chave: keyof T): Record<string, unknown> {
  const copia: Record<string, unknown> = { ...obj };
  delete copia[chave as string];
  return copia;
}

describe('coleção perfil', () => {
  const valido = {
    nome: 'Haroldo Cilas Duarte Lima Junior',
    cargo: 'Professor Adjunto A',
    instituicao: 'Universidade Federal do Maranhão (UFMA)',
    bio: 'Professor do Departamento de Física.',
    resumo_home: 'Físico teórico, trabalha com Relatividade Geral.',
    email: 'haroldo@ufma.br',
  };

  it('aceita o conjunto mínimo de campos obrigatórios do §7.3', () => {
    const resultado = perfilSchema.safeParse(valido);
    expect(resultado.success).toBe(true);
  });

  it('não exige `publicado` — é singleton, não coleção de listagem (RN-01)', () => {
    const resultado = perfilSchema.safeParse(valido);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).not.toHaveProperty('publicado');
    }
  });

  it.each(['nome', 'cargo', 'instituicao', 'bio', 'resumo_home', 'email'] as const)(
    'rejeita quando falta o campo obrigatório `%s`',
    (campo) => {
      const resultado = perfilSchema.safeParse(omit(valido, campo));
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues.some((issue) => issue.path.includes(campo))).toBe(true);
      }
    },
  );

  it('rejeita e-mail em formato inválido', () => {
    const resultado = perfilSchema.safeParse({ ...valido, email: 'não é um email' });
    expect(resultado.success).toBe(false);
  });

  it('aceita `links` com URLs válidas e todos os campos opcionais ausentes', () => {
    const resultado = perfilSchema.safeParse({
      ...valido,
      links: { lattes: 'http://lattes.cnpq.br/123' },
    });
    expect(resultado.success).toBe(true);
  });
});

describe('coleção linhas-pesquisa', () => {
  const valido = { titulo: 'Buracos negros', resumo: 'Estudo de sombras de buracos negros.', publicado: true };

  it('aceita o conjunto mínimo de campos obrigatórios do §7.3', () => {
    expect(linhasPesquisaSchema.safeParse(valido).success).toBe(true);
  });

  it('rejeita quando falta `publicado` (RN-01)', () => {
    expect(
      linhasPesquisaSchema.safeParse(omit(valido, 'publicado')).success,
    ).toBe(false);
  });

  it('aceita `ordem` numérica opcional', () => {
    const resultado = linhasPesquisaSchema.safeParse({ ...valido, ordem: 2 });
    expect(resultado.success).toBe(true);
  });
});

describe('coleção projetos', () => {
  const valido = { titulo: 'Projeto de sombras', descricao: 'Descrição do projeto.', publicado: true };

  it('aceita o conjunto mínimo de campos obrigatórios do §7.3', () => {
    expect(projetosSchema.safeParse(valido).success).toBe(true);
  });

  it('rejeita `status` fora do enum `em andamento` | `concluído`', () => {
    const resultado = projetosSchema.safeParse({ ...valido, status: 'pausado' });
    expect(resultado.success).toBe(false);
  });

  it('aceita `status` dentro do enum', () => {
    const resultado = projetosSchema.safeParse({ ...valido, status: 'em andamento' });
    expect(resultado.success).toBe(true);
  });

  it('aceita `linha_relacionada` como referência à coleção linhas-pesquisa', () => {
    const resultado = projetosSchema.safeParse({
      ...valido,
      linha_relacionada: 'buracos-negros',
    });
    expect(resultado.success).toBe(true);
  });
});

describe('coleção disciplinas', () => {
  const valido = { nome: 'Mecânica Clássica', semestre: '2026.2', status: 'atual', publicado: true };

  it('aceita o conjunto mínimo de campos obrigatórios do §7.3', () => {
    expect(disciplinasSchema.safeParse(valido).success).toBe(true);
  });

  it('rejeita `status` fora do enum `atual` | `anterior`', () => {
    const resultado = disciplinasSchema.safeParse({ ...valido, status: 'futura' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues.some((issue) => issue.path.includes('status'))).toBe(true);
    }
  });

  it('aceita `status` dentro do enum', () => {
    expect(
      disciplinasSchema.safeParse({ ...valido, status: 'anterior' }).success,
    ).toBe(true);
  });

  it('rejeita quando falta `publicado` (RN-01)', () => {
    expect(disciplinasSchema.safeParse(omit(valido, 'publicado')).success).toBe(
      false,
    );
  });

  it('aceita aulas, listas e materiais como listas embutidas (D-05)', () => {
    const resultado = disciplinasSchema.safeParse({
      ...valido,
      aulas: [{ numero: 1, titulo: 'Introdução', url: 'https://exemplo.test/aula1' }],
      listas: [{ titulo: 'Lista 1', url: 'https://exemplo.test/lista1' }],
      materiais: [{ titulo: 'Slides', tipo: 'slides', url: 'https://exemplo.test/slides1' }],
    });
    expect(resultado.success).toBe(true);
  });

  it('rejeita `tipo` de material fora do enum slides|notas|complementar', () => {
    const resultado = disciplinasSchema.safeParse({
      ...valido,
      materiais: [{ titulo: 'Slides', tipo: 'video', url: 'https://exemplo.test/x' }],
    });
    expect(resultado.success).toBe(false);
  });

  it('aceita URL de material em qualquer hospedeiro, sem restrição de domínio (D-07)', () => {
    const resultado = disciplinasSchema.safeParse({
      ...valido,
      aulas: [
        { numero: 1, titulo: 'Aula no Drive', url: 'https://drive.google.com/file/d/abc' },
        { numero: 2, titulo: 'Aula fora do Drive', url: 'https://meusite.pessoal.com/aula2.pdf' },
      ],
    });
    expect(resultado.success).toBe(true);
  });

  it('rejeita quando a URL de uma aula não é uma URL válida', () => {
    const resultado = disciplinasSchema.safeParse({
      ...valido,
      aulas: [{ numero: 1, titulo: 'Aula sem link', url: 'não-é-uma-url' }],
    });
    expect(resultado.success).toBe(false);
  });
});

describe('coleção publicacoes', () => {
  const valido = {
    titulo: 'Tidal forces in Kerr spacetime',
    autores: ['Lima Junior, H. C. D.'],
    ano: 2024,
    tipo: 'artigo',
    publicado: true,
  };

  it('aceita o conjunto mínimo de campos obrigatórios do §7.3', () => {
    expect(publicacoesSchema.safeParse(valido).success).toBe(true);
  });

  it.each([1899, 2101, 1000, 3000])('rejeita `ano` fora de 1900–2100 (F-09): %d', (ano) => {
    const resultado = publicacoesSchema.safeParse({ ...valido, ano });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues.some((issue) => issue.path.includes('ano'))).toBe(true);
    }
  });

  it.each([1900, 2100, 2024])('aceita `ano` dentro de 1900–2100 (F-09): %d', (ano) => {
    expect(publicacoesSchema.safeParse({ ...valido, ano }).success).toBe(true);
  });

  it('rejeita `tipo` fora do enum fechado', () => {
    const resultado = publicacoesSchema.safeParse({ ...valido, tipo: 'blog post' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues.some((issue) => issue.path.includes('tipo'))).toBe(true);
    }
  });

  it.each(['artigo', 'preprint', 'capítulo', 'livro', 'anais', 'tese', 'outro'])(
    'aceita `tipo` = %s',
    (tipo) => {
      expect(publicacoesSchema.safeParse({ ...valido, tipo }).success).toBe(true);
    },
  );

  it('rejeita `autores` vazio — ao menos um autor é exigido', () => {
    const resultado = publicacoesSchema.safeParse({ ...valido, autores: [] });
    expect(resultado.success).toBe(false);
  });

  it('preserva a ordem dos autores informada', () => {
    const autores = ['Terceiro', 'Primeiro', 'Segundo'];
    const resultado = publicacoesSchema.safeParse({ ...valido, autores });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.autores).toEqual(autores);
    }
  });

  it('rejeita quando falta `publicado` (RN-01)', () => {
    expect(publicacoesSchema.safeParse(omit(valido, 'publicado')).success).toBe(
      false,
    );
  });
});

describe('coleção noticias', () => {
  it('não existe no schema — v1.1, fora do MVP (NG-01)', () => {
    expect(Object.keys(collections)).not.toContain('noticias');
    expect(Object.keys(collections)).toEqual([
      'perfil',
      'linhas-pesquisa',
      'projetos',
      'disciplinas',
      'publicacoes',
    ]);
  });
});
