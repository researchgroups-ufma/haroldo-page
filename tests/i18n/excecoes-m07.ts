/**
 * ============================================================================
 *  Arquivo      : excecoes-m07.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Lista de caminhos de chave do dicionário de interface
 *                 (`UiStrings`) cujo valor é legitimamente igual nos dois
 *                 idiomas — nome próprio, sigla ou empréstimo do inglês
 *                 também usado em português. Alimenta o teste de "valor
 *                 copiado" de `tests/i18n/en.test.ts` (sabatina fase 4,
 *                 Decisão 12) e é reusada pelo teste da M-07 sobre o `dist/`
 *                 no plano 072.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-28
 *  Atualizado em: 2026-09-28
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : nenhuma
 *  Saídas       : `M07_EXCEPTIONS` (caminhos de chave, ex.: `'about.links.orcid'`)
 *  Uso          : import { M07_EXCEPTIONS } from './excecoes-m07'
 *
 *  Notas        : lista fechada aos casos que `src/i18n/en.ts` de fato
 *                 produz hoje — não especulativa. Cada item tem um
 *                 comentário de uma linha com o porquê.
 * ============================================================================
 */

/**
 * Caminhos de chave de `UiStrings` (notação de ponto) cujo valor é igual em `pt` e `en`.
 */
export const M07_EXCEPTIONS: string[] = [
  'site.pageTitle', // modelo tipográfico (`${a} — ${b}`) sem texto fixo traduzível além do separador
  'site.menu', // empréstimo do inglês, também usado em português
  'about.links.orcid', // sigla — nome próprio da plataforma
  'about.links.scholar', // nome próprio da plataforma ("Google Scholar")
  'about.links.arxiv', // nome próprio da plataforma ("arXiv")
  'about.links.researchgate', // nome próprio da plataforma ("ResearchGate")
  'about.links.github', // nome próprio da plataforma ("GitHub")
  'course.links', // palavra "Links" igual nos dois idiomas
  'course.materialType.slides', // empréstimo do inglês, também usado em português
  'script.language.python', // nome próprio da linguagem
  'script.language.r', // nome/sigla da linguagem
  'script.language.matlab', // nome próprio da linguagem
  'script.language.bash', // nome próprio da linguagem
  'script.eyebrow', // "Script" é empréstimo do inglês; a amostra ("Python") é nome próprio igual nos dois idiomas
  'publications.type.preprint', // empréstimo do inglês, também usado em português
  'publications.doi', // sigla
  'publications.arxiv', // nome próprio da plataforma
  'publications.pdf', // sigla
];
