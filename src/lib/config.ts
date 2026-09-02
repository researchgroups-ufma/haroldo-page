/**
 * ============================================================================
 *  Arquivo      : config.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Centraliza valores de configuração do site (título, URL
 *                 canônica, idiomas, dados institucionais) num único módulo
 *                 tipado, conforme §7.6 e §10.4 do PRD — nunca espalhados
 *                 pelos componentes.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-01
 *  Atualizado em: 2026-09-01
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : variável de ambiente `PUBLIC_SITE_URL` (opcional), lida via
 *                 `import.meta.env` — nunca `process.env` (ver nota abaixo)
 *  Saídas       : `siteConfig` (objeto `as const`) e o tipo `Locale`
 *  Uso          : import { siteConfig } from '../lib/config'
 *
 *  Notas        : código sob `src/` lê variáveis de ambiente por
 *                 `import.meta.env`, nunca por `process.env` — `process.env`
 *                 não existe no navegador e um uso indevido aqui não seria
 *                 pego nem pelo ESLint nem pelo TypeScript (ambos aceitam
 *                 `process.env` em `.ts` porque `@types/node` está instalado),
 *                 só quebraria em produção. `astro.config.mjs` é a única
 *                 exceção legítima, por rodar em Node durante o build.
 * ============================================================================
 */

/** Valor provisório de `PUBLIC_SITE_URL`, usado até a fase 5 confirmar domínio próprio (A-07, Q-05). */
const DEFAULT_SITE_URL = 'https://haroldo-page.and-near.workers.dev';

/**
 * Configuração central do site: título, URL canônica, idiomas suportados e
 * dados institucionais usados como metadados (título de página, autor do
 * Open Graph). Não inclui dados que o professor deva editar pelo painel
 * (coleção `perfil`, fase 1) nem e-mail (Q-07 em aberto).
 */
export const siteConfig = {
  siteUrl: (import.meta.env.PUBLIC_SITE_URL as string | undefined) ?? DEFAULT_SITE_URL,
  title: 'Prof. Haroldo C. D. Lima Junior',
  shortTitle: 'Haroldo Lima Junior',
  description:
    'Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA.',
  author: {
    name: 'Haroldo Cilas Duarte Lima Junior',
    citationName: 'LIMA JUNIOR, HAROLDO C. D.',
  },
  institution: 'Universidade Federal do Maranhão (UFMA), Campus São Luís',
  department: 'Centro Tecnológico — Departamento de Física',
  role: 'Professor Adjunto A',
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
} as const;

/** Locale suportado pelo site, derivado de `siteConfig.locales` (D-03, RN-09). */
export type Locale = (typeof siteConfig.locales)[number];
