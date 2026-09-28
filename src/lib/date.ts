/**
 * ============================================================================
 *  Arquivo      : date.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Formata a data de aula (campo texto livre do schema) no
 *                 padrão do locale da rota (§8.3 do PRD: `dd/mm/aaaa` em PT,
 *                 `"March 15, 2026"` em EN), por manipulação de string —
 *                 sem `Date` nem `Intl`, para não depender do fuso da
 *                 máquina de build. O formato em si vem do dicionário
 *                 (`strings(lang).date.format`, decisão 6 do fatiamento da
 *                 fase 4).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-16
 *  Atualizado em: 2026-09-28
 *  Versão       : 0.2.0
 *
 *  Dependências : src/i18n (strings), src/lib/config.ts (tipo `Locale`)
 *  Entradas     : string livre (`aulaSchema.data`, `src/content.config.ts:299`)
 *                 e o `Locale` da rota
 *  Saídas       : string formatada no locale pedido quando o valor for
 *                 `aaaa-mm-dd`, ou o valor original (sem alteração) caso
 *                 contrário
 *  Uso          : const dataExibida = formatDate(aula.data, lang)
 *
 *  Notas        : nenhum `Date`/`Intl` — `new Date('2026-08-10')` é meia-noite
 *                 UTC e em São Luís (UTC-3) viraria 09/08/2026
 * ============================================================================
 */
import { strings } from '../i18n';
import type { Locale } from './config';

/**
 * Formata uma data no padrão do locale pedido (§8.3 do PRD).
 *
 * O campo `data` de uma aula é texto livre no schema
 * (`aulaSchema.data: z.string().optional()`), então valores fora do formato
 * `aaaa-mm-dd` (ex.: `"10/08"`) são devolvidos como o professor digitou, sem
 * o build falhar por isso. Não valida calendário: `strings(lang).date.format`
 * decide o que fazer com um mês fora de 01–12.
 *
 * @param value Valor bruto do campo `data`.
 * @param lang Locale da rota.
 * @returns `strings(lang).date.format(ano, mes, dia)` quando `value.trim()`
 *   casa com `aaaa-mm-dd`; caso contrário, `value.trim()` sem alteração.
 */
export function formatDate(value: string, lang: Locale): string {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;
  const [, year, month, day] = match;
  return strings(lang).date.format(year, month, day);
}
