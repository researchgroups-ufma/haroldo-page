import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import {
  buildCourseSlugs,
  courseSlug,
  groupScriptsByLesson,
  presentSections,
  splitCourses,
} from '../../src/lib/courses';

describe('courseSlug', () => {
  it('deriva o slug do nome do arquivo real, preservando o ponto do semestre como hífen', () => {
    expect(courseSlug('content/disciplinas/2026.2-relatividade-geral.md')).toBe(
      '2026-2-relatividade-geral',
    );
  });

  it('aceita separador de caminho \\ (Windows)', () => {
    expect(courseSlug('content\\disciplinas\\2026.2-relatividade-geral.md')).toBe(
      '2026-2-relatividade-geral',
    );
  });

  it('lança com a mensagem "filePath ausente" se filePath for undefined', () => {
    expect(() => courseSlug(undefined)).toThrow(/courseSlug: filePath ausente/);
  });

  it('lança com a mensagem "slug vazio" se o slug resultante for vazio (\'.md\')', () => {
    expect(() => courseSlug('.md')).toThrow(/courseSlug: slug vazio para o caminho "\.md"/);
  });
});

describe('buildCourseSlugs', () => {
  it('constrói o mapa de slug para filePath para caminhos distintos', () => {
    const map = buildCourseSlugs([
      { filePath: 'content/disciplinas/2026.2-relatividade-geral.md' },
      { filePath: 'content/disciplinas/2025.1-mecanica-classica.md' },
    ]);
    expect(map.size).toBe(2);
    expect(map.get('2026-2-relatividade-geral')).toBe(
      'content/disciplinas/2026.2-relatividade-geral.md',
    );
    expect(map.get('2025-1-mecanica-classica')).toBe(
      'content/disciplinas/2025.1-mecanica-classica.md',
    );
  });

  it('lança nomeando os dois caminhos quando dois arquivos geram o mesmo slug', () => {
    const pathA = 'content/disciplinas/2026.2-x.md';
    const pathB = 'content/disciplinas/2026-2-x.md';
    expect(() => buildCourseSlugs([{ filePath: pathA }, { filePath: pathB }])).toThrow(
      /2026\.2-x\.md.*2026-2-x\.md|2026-2-x\.md.*2026\.2-x\.md/,
    );
  });
});

describe('splitCourses', () => {
  const course = (semestre: string, nome: string, status: 'atual' | 'anterior') => ({
    data: { semestre, nome, status },
  });

  it('ordena por semestre decrescente dentro do grupo — fixture do plano (2025.1, 2026.2, 2025.2)', () => {
    const entries = [
      course('2025.1', 'Mecânica Clássica', 'anterior'),
      course('2026.2', 'Relatividade Geral', 'anterior'),
      course('2025.2', 'Eletromagnetismo', 'anterior'),
    ];
    const { current, previous } = splitCourses(entries);
    expect(previous.map((e) => e.data.semestre)).toEqual(['2026.2', '2025.2', '2025.1']);
    expect(current).toEqual([]);
  });

  it('separa status mistos, com toEqual exato em current e em previous', () => {
    const atualRecente = course('2026.2', 'Relatividade Geral', 'atual');
    const atualAntigo = course('2026.1', 'Mecânica Quântica', 'atual');
    const anteriorRecente = course('2025.2', 'Eletromagnetismo', 'anterior');
    const anteriorAntigo = course('2025.1', 'Mecânica Clássica', 'anterior');
    // Ordem embaralhada de propósito, com a atual mais antiga ANTES da mais recente: se
    // `splitCourses` não ordenasse `current`, o resultado sairia na ordem de entrada
    // (`[atualAntigo, atualRecente]`), diferente do esperado abaixo.
    const entries = [anteriorAntigo, atualAntigo, anteriorRecente, atualRecente];
    const { current, previous } = splitCourses(entries);
    expect(current).toEqual([atualRecente, atualAntigo]);
    expect(previous).toEqual([anteriorRecente, anteriorAntigo]);
  });

  it('ordena semestre por colação numérica: 2026.10 vem antes de 2026.9', () => {
    const entries = [course('2026.9', 'A', 'anterior'), course('2026.10', 'B', 'anterior')];
    const { previous } = splitCourses(entries);
    expect(previous.map((e) => e.data.semestre)).toEqual(['2026.10', '2026.9']);
  });

  it('desempata semestres iguais por nome crescente pt-BR', () => {
    const entries = [course('2025.1', 'Zebra', 'anterior'), course('2025.1', 'Abelha', 'anterior')];
    const { previous } = splitCourses(entries);
    expect(previous.map((e) => e.data.nome)).toEqual(['Abelha', 'Zebra']);
  });

  it('não muta o array de entrada', () => {
    const entries = [
      course('2025.1', 'Zebra', 'anterior'),
      course('2026.2', 'Relatividade Geral', 'atual'),
    ];
    const original = [...entries];
    splitCourses(entries);
    expect(entries).toEqual(original);
  });
});

describe('groupScriptsByLesson', () => {
  type TestScript = { id: string; aula?: number };

  it('coloca o script na aula cujo numero casa (F-13)', () => {
    const lessons = [{ numero: 1 }, { numero: 4 }];
    const scripts: TestScript[] = [{ id: 'kerr', aula: 4 }];
    const { byLesson, general } = groupScriptsByLesson(lessons, scripts);
    expect(byLesson).toEqual([[], [{ id: 'kerr', aula: 4 }]]);
    expect(general).toEqual([]);
  });

  it('script com aula inexistente vai para general (F-13)', () => {
    const lessons = [{ numero: 1 }, { numero: 2 }];
    const scripts: TestScript[] = [{ id: 'orfao', aula: 99 }];
    const { byLesson, general } = groupScriptsByLesson(lessons, scripts);
    expect(byLesson).toEqual([[], []]);
    expect(general).toEqual([{ id: 'orfao', aula: 99 }]);
  });

  it('script sem aula vai para general', () => {
    const lessons = [{ numero: 1 }];
    const scripts: TestScript[] = [{ id: 'sem-aula' }];
    const { byLesson, general } = groupScriptsByLesson(lessons, scripts);
    expect(byLesson).toEqual([[]]);
    expect(general).toEqual([{ id: 'sem-aula' }]);
  });

  it('numero de aula repetido: script vai para a primeira aula com esse numero', () => {
    const lessons = [{ numero: 5 }, { numero: 5 }];
    const scripts: TestScript[] = [{ id: 'repetido', aula: 5 }];
    const { byLesson } = groupScriptsByLesson(lessons, scripts);
    expect(byLesson[0]).toEqual([{ id: 'repetido', aula: 5 }]);
    expect(byLesson[1]).toEqual([]);
  });

  it('invariante: byLesson.flat().length + general.length === scripts.length', () => {
    const lessons = [{ numero: 1 }, { numero: 2 }, { numero: 2 }];
    const scripts: TestScript[] = [
      { id: 'a', aula: 1 },
      { id: 'b' },
      { id: 'c', aula: 2 },
      { id: 'd', aula: 99 },
      { id: 'e', aula: 2 },
    ];
    const { byLesson, general } = groupScriptsByLesson(lessons, scripts);
    expect(byLesson.flat().length + general.length).toBe(scripts.length);
  });

  it('preserva a ordem relativa dos scripts em cada grupo', () => {
    const lessons = [{ numero: 1 }];
    const scripts: TestScript[] = [
      { id: 'geral-1' },
      { id: 'aula-1', aula: 1 },
      { id: 'geral-2' },
      { id: 'aula-2', aula: 1 },
    ];
    const { byLesson, general } = groupScriptsByLesson(lessons, scripts);
    expect(byLesson[0].map((s) => s.id)).toEqual(['aula-1', 'aula-2']);
    expect(general.map((s) => s.id)).toEqual(['geral-1', 'geral-2']);
  });

  it('nunca reordena lessons (RN-04)', () => {
    const lessons = [{ numero: 3 }, { numero: 1 }, { numero: 2 }];
    const original = [...lessons];
    groupScriptsByLesson(lessons, []);
    expect(lessons).toEqual(original);
  });
});

describe('presentSections', () => {
  it('disciplina só com os campos obrigatórios: só Aulas, com count 0 (F-06)', () => {
    expect(presentSections({}, 0)).toEqual([{ id: 'aulas', key: 'lessons', count: 0 }]);
  });

  it('disciplina completa: todas as seções, na ordem fixa do §6.5', () => {
    const data = {
      ementa: 'Uma ementa qualquer.',
      aulas: [{}, {}],
      listas: [{}],
      materiais: [{}, {}],
      bibliografia: [{}],
      links: [{}],
    };
    expect(presentSections(data, 2)).toEqual([
      { id: 'ementa', key: 'syllabus', count: 1 },
      { id: 'aulas', key: 'lessons', count: 2 },
      { id: 'scripts', key: 'courseScripts', count: 2 },
      { id: 'listas', key: 'problemSets', count: 1 },
      { id: 'materiais', key: 'materials', count: 2 },
      { id: 'bibliografia', key: 'bibliography', count: 1 },
      { id: 'links', key: 'links', count: 1 },
    ]);
  });

  it('ementa só em branco não conta como presente', () => {
    expect(presentSections({ ementa: '   ' }, 0)).toEqual([
      { id: 'aulas', key: 'lessons', count: 0 },
    ]);
  });

  it('scripts só aparece se houver script geral (ligados a aula ficam dentro de Aulas)', () => {
    expect(presentSections({ aulas: [{}] }, 0)).toEqual([
      { id: 'aulas', key: 'lessons', count: 1 },
    ]);
  });
});

describe('courseSlug / buildCourseSlugs — invariante com conteúdo real de content/disciplinas', () => {
  // Fixtures reais, não sintéticas (decisão 6 do README da fase): só a invariante é afirmada.
  const disciplinasDir = join(__dirname, '../../content/disciplinas');

  it('courseSlug não lança para nenhum arquivo real, e buildCourseSlugs não lança sobre o conjunto', () => {
    const arquivos = readdirSync(disciplinasDir).filter((nome) => nome.endsWith('.md'));
    expect(arquivos.length).toBeGreaterThan(0);

    const entries = arquivos.map((nome) => {
      const filePath = join(disciplinasDir, nome);
      // Confirma que o arquivo é markdown com frontmatter válido, como a content layer exige.
      matter(readFileSync(filePath, 'utf-8'));
      return { filePath };
    });

    for (const entry of entries) {
      expect(() => courseSlug(entry.filePath)).not.toThrow();
    }
    expect(() => buildCourseSlugs(entries)).not.toThrow();
  });
});
