# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

Fase 1 — modelo de conteúdo (planos 015 a 022; critério de conclusão da fase — `/admin` criando e
editando item de cada coleção — demonstrado pelo orquestrador; pendência restante é só a promoção
administrativa do plano 021, não o critério em si):

- TinaCMS instalado e `/admin` no ar localmente, integrado ao Astro 7 (plano 015).
- Schemas Zod das cinco coleções do MVP em `src/content.config.ts` — `perfil`, `linhas-pesquisa`,
  `projetos`, `disciplinas`, `publicacoes` — e as mesmas cinco coleções em `tina/config.ts`, com
  rótulos e textos de ajuda em português, vocabulário acadêmico (planos 016 e 017).
- Campo `publicado` em toda coleção de listagem, substituindo o Editorial Workflow pago do
  TinaCloud (D-04, plano 017).
- Grupo "Versão em inglês (opcional)" nas cinco coleções traduzíveis, com fallback implícito para
  o português (D-03, RN-06, plano 018).
- Teste de paridade entre `src/content.config.ts` e `tina/config.ts` rodando no CI, provado
  falsificável nos dois sentidos (D-06, RNF-09, plano 019). Corrigiu uma divergência real de
  formato do valor de `projetos.linha_relacionada` entre o Tina e o loader `glob()` do Astro.
- Conteúdo placeholder representativo nas cinco coleções, criado pelo painel: 1 perfil com dados
  reais, 2 linhas de pesquisa, 2 projetos, 2 disciplinas e 6 publicações marcadas como exemplo
  (plano 020).
- Lista embutida `scripts[]` em `disciplinas` (RF-37), para código-fonte exibido com destaque de
  sintaxe na fase 3 — única exceção a "material é link externo" (RN-05). Verificado no painel que
  a indentação do código sobrevive à gravação via YAML (R-13, plano 022).
- `docs/adr/0003` a `0008`: as decisões D-02 a D-07 e D-06 da fase 1, cada uma com alternativa
  rejeitada e consequência aceita.
- Suíte de testes da fase: 107 testes em 4 arquivos, cobertura 100% de `src/lib/`, `src/i18n/` e
  `src/content.config.ts` — acima da meta de 80% da §11, imposta por `thresholds` no
  `vitest.config.ts`.

### Corrigido

- Docstring de `normalizeLinhaRelacionadaId` (`src/content.config.ts`): chamava a referência
  inválida a uma linha de pesquisa de "falha silenciosa que só apareceria na fase 3" — o
  `astro check` já reporta o erro hoje (`[ERROR] [content]`); o silencioso é o exit code (0), não
  o erro (achado do plano 020).

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

### Alterado

- **Astro 5.18.2 → 7.2.10**, feito antes de a fase 1 escrever os schemas de conteúdo, porque a
  migração muda a API de coleções e sobe para Zod 4 — fazê-lo depois implicaria reescrevê-los.
  O `npm audit` passa de 1 vulnerabilidade high para zero.
- **Todos os `overrides` do npm removidos.** O Astro 7 exige `vite ^8.0.13` e já pede
  nativamente as versões corrigidas de `sharp` e `esbuild`, o que dispensou os três pins. Ver
  o desfecho no ADR-0002.
