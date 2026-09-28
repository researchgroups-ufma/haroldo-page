/**
 * ============================================================================
 *  Arquivo      : index.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Ponto único de acesso ao dicionário de strings de interface
 *                 pelo idioma da rota (sabatina fase 4, Decisão 6: cada
 *                 página fina declara `lang` e o repassa à view).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-28
 *  Atualizado em: 2026-09-28
 *  Versão       : 0.1.0
 *
 *  Dependências : src/i18n/pt.ts, src/i18n/en.ts, src/lib/config.ts (tipo `Locale`)
 *  Entradas     : `Locale` ('pt' | 'en')
 *  Saídas       : `UiStrings` do idioma pedido
 *  Uso          : import { strings } from '../i18n'; strings(lang).nav.home
 * ============================================================================
 */
import type { Locale } from '../lib/config';
import type { UiStrings } from './pt';
import { pt } from './pt';
import { en } from './en';

/**
 * Devolve o dicionário de strings de interface do idioma pedido.
 *
 * @param lang Idioma da rota.
 * @returns `pt` quando `lang === 'pt'`; `en` quando `lang === 'en'`.
 */
export function strings(lang: Locale): UiStrings {
  return lang === 'en' ? en : pt;
}
