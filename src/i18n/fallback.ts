/**
 * ============================================================================
 *  Arquivo      : fallback.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Resolve campos traduzíveis para o idioma da rota, com
 *                 fallback para o português (RN-06), e devolve o `lang` que o
 *                 elemento precisa levar e o sinal que liga o aviso único da
 *                 página (F-07).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-29
 *  Atualizado em: 2026-09-29
 *  Versão       : 0.1.0
 *
 *  Dependências : src/lib/routes.ts (`HTML_LANG`), src/lib/config.ts (tipo `Locale`)
 *  Entradas     : valor em português, valor em inglês (opcional) e `Locale`
 *  Saídas       : `LocalizedText` (texto, `lang` quando é português em rota
 *                 EN, `fellBack`) e o booleano de `hasFallback`
 *  Uso          : const bio = localize(perfil.bio, perfil.en?.bio, lang);
 *                 const notice = hasFallback([bio, cargo]);
 *
 *  Notas        : função pura, sem I/O. Campo factual (RN-07) não passa por
 *                 aqui. O texto sai como está, sem `trim`: quem divide em
 *                 parágrafos é `toParagraphs` (`src/lib/text.ts`).
 * ============================================================================
 */
import type { Locale } from '../lib/config';
import { HTML_LANG } from '../lib/routes';

/** Resultado da resolução de um campo para o idioma da rota. */
export interface LocalizedText {
  /** Texto a exibir. */
  text: string;
  /** `'pt-BR'` quando o texto exibido numa rota EN é o português; ausente caso contrário. */
  lang?: 'pt-BR';
  /** `true` quando a rota é EN e o texto exibido é o português (F-07: liga o aviso da página). */
  fellBack: boolean;
}

/** Preenchido é texto com algo além de espaço; vazio é `undefined` ou só espaço. */
function hasText(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== '';
}

/**
 * Resolve um campo traduzível com fallback para o português.
 *
 * Implementa a RN-06: se o valor em inglês estiver ausente ou vazio numa rota `/en`,
 * devolve o valor em português (RN-09: o português é o idioma canônico), marcado com
 * `lang: 'pt-BR'` e `fellBack: true`.
 *
 * @param ptValue Valor em português (canônico).
 * @param enValue Valor do grupo "Versão em inglês", ou `undefined`. Ignorado em rota PT.
 * @param lang Idioma da rota atual.
 * @returns O texto no idioma da rota, ou o português com `lang` e `fellBack`.
 */
export function localize(
  ptValue: string,
  enValue: string | undefined,
  lang: Locale,
): LocalizedText {
  if (lang === 'pt') return { text: ptValue, fellBack: false };
  if (hasText(enValue)) return { text: enValue, fellBack: false };
  return { text: ptValue, lang: HTML_LANG.pt, fellBack: true };
}

/**
 * Como {@link localize}, para campo opcional: campo vazio não deixa rastro (RF-21).
 *
 * Em rota EN, o inglês preenchido aparece mesmo com o português vazio (decisão de fatiamento
 * 10 da fase 4); em rota PT, português vazio não mostra nada.
 *
 * @param ptValue Valor em português, ou `undefined`.
 * @param enValue Valor em inglês, ou `undefined`.
 * @param lang Idioma da rota atual.
 * @returns `undefined` se não há o que mostrar; senão, o mesmo que `localize`.
 */
export function localizeOptional(
  ptValue: string | undefined,
  enValue: string | undefined,
  lang: Locale,
): LocalizedText | undefined {
  if (hasText(ptValue)) return localize(ptValue, enValue, lang);
  if (lang === 'en' && hasText(enValue)) return { text: enValue, fellBack: false };
  return undefined;
}

/**
 * Marca texto livre em português que não tem campo em inglês (tipo "P" do README da fase 4).
 *
 * Em rota EN recebe `lang: 'pt-BR'`, mas `fellBack` fica `false`: sabatina fase 4, Decisão 13
 * ("`lang` sim, aviso não") — só o fallback de campo traduzível (RN-06) liga o aviso (F-07).
 *
 * @param ptValue Texto em português.
 * @param lang Idioma da rota atual.
 * @returns O texto, com `lang` quando a rota é EN.
 */
export function portugueseOnly(ptValue: string, lang: Locale): LocalizedText {
  if (lang === 'pt') return { text: ptValue, fellBack: false };
  return { text: ptValue, lang: HTML_LANG.pt, fellBack: false };
}

/**
 * Diz se algum texto da página caiu no português, o que liga o aviso único (F-07).
 *
 * @param values Resultados de `localize`/`localizeOptional`/`portugueseOnly`; itens `undefined` são ignorados.
 * @returns `true` se algum item definido tem `fellBack`; `false` para lista vazia.
 */
export function hasFallback(values: readonly (LocalizedText | undefined)[]): boolean {
  return values.some((value) => value?.fellBack === true);
}
