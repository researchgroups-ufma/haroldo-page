# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

Fase 0 — setup e provisionamento (planos 001 a 013):

- Site estático em Astro 5 com TypeScript em modo `strict` e Tailwind 4, publicado em
  <https://haroldo-page.and-near.workers.dev> pelo Cloudflare Workers Static Assets. Nenhuma
  rota executa código por requisição (ADR-0001).
- Estrutura de diretórios do §7.5 do PRD, com `content/` pronto para receber as coleções.
- Ferramentas de qualidade: Prettier, ESLint (flat config, `no-explicit-any` como erro) e
  Vitest, com cobertura configurada para `src/lib/` e `src/i18n/`.
- CI no GitHub Actions rodando lint, testes e build a cada push.
- Configuração de ambiente por `.env.example`, com `src/lib/config.ts` centralizando título,
  URL canônica, idiomas e dados institucionais.
- Repositório privado, projeto no TinaCloud vinculado a ele e Worker na Cloudflare — o
  provisionamento que a fase 1 vai consumir.
- `docs/adr/`: ADR-0001 (site estático, sem adapter) e ADR-0002 (pins de `vite`, `sharp` e
  `esbuild` por `overrides`, com gatilhos de revisão).
