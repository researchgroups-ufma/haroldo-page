/**
 * ============================================================================
 *  Arquivo      : course-items.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Tratamento dos itens embutidos de uma disciplina (aulas, listas,
 *                 bibliografia, scripts, materiais e links): link em branco vale como
 *                 ausente (RF-07, RF-24) e o salvamento do painel descarta o item vazio
 *                 e recusa o item pela metade e o link que não é endereço (F-09).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-11-21
 *  Atualizado em: 2026-11-21
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : `values` do formulário da coleção `disciplinas` (Tina)
 *  Saídas       : `{ values, problems }` (`prepareCourseItems`); o valor ou
 *                 `undefined` (`blankToUndefined`)
 *  Uso          : `z.preprocess(blankToUndefined, z.url().optional())` em
 *                 `src/content.config.ts`; `prepareCourseItems(values)` no
 *                 `ui.beforeSubmit` de `tina/config.ts`
 *
 *  Notas        : o Tina importa este módulo no navegador, então ele não pode importar
 *                 `astro:*` nem `zod`. O Zod continua sendo o portão do build: a
 *                 checagem de endereço daqui (`URL.canParse`) só antecipa o erro ao
 *                 professor, e `tests/lib/course-items.test.ts` confere o veredito
 *                 contra `z.url()`. Plano 086.
 * ============================================================================
 */

/** Campo obrigatório de um item, com o rótulo que o painel mostra. */
interface RequiredField {
  name: string;
  label: string;
}

/** Descrição de uma lista embutida de `disciplinas`. */
interface ItemList {
  /** Nome do campo no frontmatter. */
  key: string;
  /** Rótulo da lista no painel. */
  label: string;
  required: RequiredField[];
  /** `true` quando o item é o próprio link (`materiais`, `links`). */
  linkRequired: boolean;
  /** Campos que o `defaultItem` preenche sozinhos e por isso não contam como preenchidos. */
  ignoredForEmpty?: string[];
}

const TITLE: RequiredField = { name: 'titulo', label: 'Título' };
const LINK: RequiredField = { name: 'url', label: 'Link' };

const LISTS: ItemList[] = [
  {
    key: 'aulas',
    label: 'Aulas',
    required: [{ name: 'numero', label: 'Número' }, TITLE],
    linkRequired: false,
  },
  { key: 'listas', label: 'Listas de exercícios', required: [TITLE], linkRequired: false },
  {
    key: 'bibliografia',
    label: 'Bibliografia',
    required: [{ name: 'referencia', label: 'Referência' }],
    linkRequired: false,
  },
  {
    key: 'scripts',
    label: 'Scripts',
    required: [
      TITLE,
      { name: 'linguagem', label: 'Linguagem' },
      { name: 'codigo', label: 'Código' },
    ],
    linkRequired: false,
    ignoredForEmpty: ['linguagem'],
  },
  {
    key: 'materiais',
    label: 'Materiais complementares',
    required: [TITLE, { name: 'tipo', label: 'Tipo' }, LINK],
    linkRequired: true,
  },
  { key: 'links', label: 'Links externos', required: [TITLE, LINK], linkRequired: true },
];

/**
 * Pré-processador do Zod para link opcional: texto só de espaço em branco vale como ausente.
 *
 * Usado como `z.preprocess(blankToUndefined, z.url().optional())` (RF-07, RF-24): o painel
 * deixou o professor gravar `' '` para passar o "obrigatório" e o build recusava o arquivo.
 *
 * @param value Valor bruto do campo.
 * @returns `undefined` quando `value` é string vazia ou só de espaço; `value` intacto nos demais casos.
 */
export function blankToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

/** Valor preenchido: número finito, ou texto com algo além de espaço. */
function isFilled(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Prepara os itens embutidos de uma disciplina para o salvamento do painel (F-09, RNF-09).
 *
 * Por lista (`aulas`, `listas`, `bibliografia`, `scripts`, `materiais`, `links`): o item vazio
 * (o "+" clicado à toa) sai em silêncio; o item pela metade e o link preenchido que não é endereço
 * viram mensagens em `problems`; o link opcional em branco perde a chave, para o arquivo não voltar
 * a acumular `' '`. Em `scripts`, `linguagem` não conta como preenchida: o `defaultItem` já a
 * preenche. Lista ausente ou que não é array fica como está.
 *
 * @param values `values` do formulário, como o Tina os entrega ao `beforeSubmit`.
 * @returns `values` com as listas limpas e `problems` com uma frase por defeito; `problems` vazio
 *   significa que o salvamento pode seguir.
 */
export function prepareCourseItems(values: Record<string, unknown>): {
  values: Record<string, unknown>;
  problems: string[];
} {
  const result: Record<string, unknown> = { ...values };
  const problems: string[] = [];

  for (const list of LISTS) {
    const items = values[list.key];
    if (!Array.isArray(items)) continue;

    const kept: Record<string, unknown>[] = [];
    items.forEach((raw, index) => {
      const item: Record<string, unknown> =
        raw !== null && typeof raw === 'object' ? { ...(raw as Record<string, unknown>) } : {};
      const filled = Object.entries(item).some(
        ([name, value]) => !list.ignoredForEmpty?.includes(name) && isFilled(value),
      );
      if (!filled) return; // F-09: item vazio sai em silêncio

      const where = `${list.label}, item ${index + 1}`;
      const missing = list.required.filter((field) => !isFilled(item[field.name]));
      if (missing.length > 0) {
        problems.push(`${where}: falta ${missing.map((field) => field.label).join(', ')}.`);
      }

      const url = item.url;
      if (isFilled(url)) {
        if (typeof url !== 'string' || !URL.canParse(url.trim())) {
          problems.push(
            `${where}: o link "${String(url)}" não é um endereço — comece com https://.`,
          );
        }
      } else if (!list.linkRequired) {
        delete item.url; // RF-24: link opcional em branco vale como ausente
      }
      kept.push(item);
    });
    result[list.key] = kept;
  }

  return { values: result, problems };
}
