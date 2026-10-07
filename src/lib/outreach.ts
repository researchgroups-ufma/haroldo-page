/**
 * ============================================================================
 *  Arquivo      : outreach.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Ordena as postagens de extensão (sabatina "Extensão",
 *                 2026-10-07, Decisão 2): data decrescente, empate por título; e
 *                 converte o instante gravado pelo seletor de data do painel na
 *                 data de calendário de São Luís.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-07
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : array de entradas de `extensao`, na forma devolvida por
 *                 `getCollection` (`{ data: {...} }`), tipadas estruturalmente
 *  Saídas       : cópia ordenada, sem mutar a entrada; data `aaaa-mm-dd`
 *  Uso          : const posts = sortPosts(filterPublished(await getCollection('extensao')))
 *
 *  Notas        : funções puras, testáveis sem a content layer do Astro. O slug da
 *                 postagem segue a regra da disciplina (`courseSlug` em
 *                 `src/lib/courses.ts`, a partir do nome do arquivo).
 * ============================================================================
 */

/**
 * Data de calendário (`aaaa-mm-dd`) do campo `data` de uma postagem, como o professor a escolheu.
 *
 * O seletor de data do Tina grava o instante em UTC: a meia-noite local do dia escolhido, ou seja
 * `'2026-09-12T03:00:00.000Z'` para 12/09 escolhido em São Luís. O dia vale pelo calendário de São
 * Luís, não pelo de UTC. Limite aceito: quem escolher a data num fuso a leste de UTC grava a véspera
 * em UTC, e o site mostra a véspera — o painel é usado do Brasil.
 *
 * O Tina grava o instante sem aspas, e o YAML o lê como `Date`, não como texto (medido no painel
 * em 2026-10-07); por isso `Date` também é aceito. Valor que já é `aaaa-mm-dd` em texto, ou de outro
 * tipo, passa intacto — o Zod reprova o que sobrar fora do formato. Usado pelo Zod
 * (`content.config.ts`) e pelo nome de arquivo do painel (`tina/config.ts`).
 *
 * @param value Valor bruto do campo `data`.
 * @returns `aaaa-mm-dd` quando `value` é um `Date` ou um instante ISO em texto válidos; senão,
 *   `value` sem alteração.
 */
export function toCalendarDate(value: unknown): unknown {
  let instant: Date;
  if (value instanceof Date) instant = value;
  else if (typeof value === 'string' && value.includes('T')) instant = new Date(value);
  else return value;
  if (Number.isNaN(instant.getTime())) return value;
  // `en-CA` formata como `aaaa-mm-dd`; `America/Fortaleza` é o fuso IANA do Maranhão (UTC−3, sem horário de verão).
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

/** Entrada de `extensao` com os campos usados na ordenação. */
type PostLike = { data: { data: string; titulo: string } };

/**
 * Ordena postagens da mais recente para a mais antiga. `data` é `aaaa-mm-dd` (o Zod garante), então
 * a comparação de texto é a comparação de datas. No mesmo dia, ordem alfabética do título em
 * pt-BR, para a página não depender da ordem dos arquivos no disco.
 *
 * @param posts Entradas de `extensao`.
 * @returns Novo array ordenado; não muta `posts`.
 */
export function sortPosts<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      b.data.data.localeCompare(a.data.data) || a.data.titulo.localeCompare(b.data.titulo, 'pt-BR'),
  );
}
