/**
 * ============================================================================
 *  Arquivo      : date.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Formata a data de aula (campo texto livre do schema) no
 *                 padrão pt-BR `dd/mm/aaaa`, por manipulação de string —
 *                 sem `Date` nem `Intl`, para não depender do fuso da
 *                 máquina de build.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-16
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : string livre (`aulaSchema.data`, `src/content.config.ts:299`)
 *  Saídas       : string formatada em pt-BR quando o valor for `aaaa-mm-dd`,
 *                 ou o valor original (sem alteração) caso contrário
 *  Uso          : const dataExibida = formatDate(aula.data)
 *
 *  Notas        : nenhum `Date`/`Intl` — `new Date('2026-08-10')` é meia-noite
 *                 UTC e em São Luís (UTC-3) viraria 09/08/2026
 * ============================================================================
 */

/**
 * Formata uma data no padrão pt-BR (`dd/mm/aaaa`, §8.3 do PRD).
 *
 * O campo `data` de uma aula é texto livre no schema
 * (`aulaSchema.data: z.string().optional()`), então valores fora do formato
 * `aaaa-mm-dd` (ex.: `"10/08"`) são devolvidos como o professor digitou, sem
 * o build falhar por isso. Não valida calendário: `2026-02-31` sai
 * `31/02/2026`.
 *
 * @param value Valor bruto do campo `data`.
 * @returns `dd/mm/aaaa` quando `value.trim()` casa com `aaaa-mm-dd`;
 *   caso contrário, `value.trim()` sem alteração.
 */
export function formatDate(value: string): string {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
