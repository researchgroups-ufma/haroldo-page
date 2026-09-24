/**
 * ============================================================================
 *  Arquivo      : profile.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Monta a lista de perfis acadêmicos do professor (Lattes,
 *                 ORCID, … e o CV em PDF) na ordem fixa do schema, para o
 *                 bloco "Contato" da Home e da Sobre mostrarem a mesma
 *                 sequência.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-24
 *  Atualizado em: 2026-09-24
 *  Versão       : 0.1.0
 *
 *  Dependências : src/i18n/pt.ts (tipo `UiStrings`, só para tipar os rótulos)
 *  Entradas     : `perfil.links`, `perfil.cv_url` e os rótulos do idioma da rota
 *  Saídas       : `{ href, label }[]` — só os campos preenchidos
 *  Uso          : profileLinks(perfil.links, perfil.cv_url, pt.about.links)
 *
 *  Notas        : os rótulos entram por parâmetro para a rota `/en` (fase 4)
 *                 passar os seus.
 * ============================================================================
 */
import type { UiStrings } from '../i18n/pt';

/** Ordem fixa dos perfis acadêmicos, igual à do `linksSchema` (§7.3); o CV vem depois. */
const LINK_ORDER = [
  'lattes',
  'orcid',
  'scholar',
  'arxiv',
  'researchgate',
  'github',
  'institucional',
] as const;

/**
 * Lista os perfis acadêmicos preenchidos, na ordem fixa do schema, com o CV em PDF por último.
 *
 * RF-21: campo vazio não entra — não há rótulo sem link.
 *
 * @param links `perfil.links` (todos opcionais).
 * @param cvUrl `perfil.cv_url`, se houver.
 * @param labels Rótulos do idioma da rota (`pt.about.links`).
 * @returns `{ href, label }` de cada perfil preenchido, na ordem de exibição.
 */
export function profileLinks(
  links: Partial<Record<(typeof LINK_ORDER)[number], string>> | undefined,
  cvUrl: string | undefined,
  labels: UiStrings['about']['links'],
): { href: string; label: string }[] {
  const result = LINK_ORDER.flatMap((key) => {
    const href = links?.[key];
    return href ? [{ href, label: labels[key] }] : [];
  });
  if (cvUrl) result.push({ href: cvUrl, label: labels.cv });
  return result;
}
