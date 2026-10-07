import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import {
  buildCourseSlugs,
  courseSlug,
  groupScriptsByLesson,
  presentSections,
  scriptsForTab,
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
  // Sabatina "Ensino modelo A", Decisão 6: ordem alfabética pelo nome; `semestre` não influi.
  const course = (nome: string, status: 'atual' | 'anterior', semestre?: string) => ({
    data: { nome, status, semestre },
  });

  it('ordena por nome pt-BR dentro do grupo, com acento no lugar certo', () => {
    const entries = [
      course('Relatividade Geral', 'anterior'),
      course('Óptica', 'anterior'),
      course('Mecânica Clássica', 'anterior'),
      course('Eletromagnetismo', 'anterior'),
    ];
    const { current, previous } = splitCourses(entries);
    expect(previous.map((e) => e.data.nome)).toEqual([
      'Eletromagnetismo',
      'Mecânica Clássica',
      'Óptica',
      'Relatividade Geral',
    ]);
    expect(current).toEqual([]);
  });

  it('ignora o semestre: o mais recente não vem antes por isso', () => {
    const entries = [
      course('Zebra', 'anterior', '2026.2'),
      course('Abelha', 'anterior', '2020.1'),
      course('Meio', 'anterior'),
    ];
    const { previous } = splitCourses(entries);
    expect(previous.map((e) => e.data.nome)).toEqual(['Abelha', 'Meio', 'Zebra']);
  });

  it('separa status mistos, com toEqual exato em current e em previous', () => {
    const atualA = course('Física Matemática', 'atual');
    const atualB = course('Relatividade Geral', 'atual');
    const anteriorA = course('Eletromagnetismo', 'anterior');
    const anteriorB = course('Mecânica Clássica', 'anterior');
    // Ordem embaralhada de propósito: sem ordenação, `current` sairia `[atualB, atualA]`.
    const entries = [anteriorB, atualB, anteriorA, atualA];
    const { current, previous } = splitCourses(entries);
    expect(current).toEqual([atualA, atualB]);
    expect(previous).toEqual([anteriorA, anteriorB]);
  });

  it('não muta o array de entrada', () => {
    const entries = [course('Zebra', 'anterior'), course('Relatividade Geral', 'atual')];
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
    expect(presentSections({})).toEqual([{ id: 'aulas', key: 'lessons', count: 0 }]);
  });

  it('disciplina completa: todas as seções, na ordem fixa do §6.5', () => {
    const data = {
      ementa: 'Uma ementa qualquer.',
      aulas: [{}, {}],
      scripts: [{}, {}],
      listas: [{}],
      materiais: [{}, {}],
      bibliografia: [{}],
      links: [{}],
    };
    expect(presentSections(data)).toEqual([
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
    expect(presentSections({ ementa: '   ' })).toEqual([{ id: 'aulas', key: 'lessons', count: 0 }]);
  });

  it('aba Scripts aparece com qualquer script, inclusive os ligados a uma aula (Decisão 12)', () => {
    expect(presentSections({ aulas: [{}], scripts: [{ aula: 1 }] })).toEqual([
      { id: 'aulas', key: 'lessons', count: 1 },
      { id: 'scripts', key: 'courseScripts', count: 1 },
    ]);
  });

  it('sem script, sem aba Scripts', () => {
    expect(presentSections({ aulas: [{}], scripts: [] })).toEqual([
      { id: 'aulas', key: 'lessons', count: 1 },
    ]);
  });
});

describe('scriptsForTab', () => {
  const lessons = [{ numero: 1 }, { numero: 4 }, { numero: 2 }];
  const s = (titulo: string, aula?: number) => ({ titulo, aula });

  it('ordena pelos da aula, na ordem das aulas, e depois os gerais; âncora pela posição original', () => {
    const scripts = [
      s('geral'),
      s('da aula 2', 2),
      s('órfão', 9),
      s('da aula 4', 4),
      s('aula 1', 1),
    ];
    expect(
      scriptsForTab(lessons, scripts).map(({ script, lesson, anchor }) => [
        script.titulo,
        lesson,
        anchor,
      ]),
    ).toEqual([
      ['aula 1', 1, 'script-5'],
      ['da aula 4', 4, 'script-4'],
      ['da aula 2', 2, 'script-2'],
      ['geral', undefined, 'script-1'],
      ['órfão', undefined, 'script-3'],
    ]);
  });

  it('sem scripts, lista vazia', () => {
    expect(scriptsForTab(lessons, [])).toEqual([]);
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
