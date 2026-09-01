# Planos da Fase 0 — estado e ordem de execução

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a fonte de verdade
> do que já foi feito é o campo `Status:` de cada um. Este arquivo existe para o que não cabe
> em nenhum dos dois: a ordem, o paralelismo e as armadilhas de execução.

Última atualização: 2026-09-01

## Estado

| Plano | Título | Status | Agente | Commits |
|---|---|---|---|---|
| 001 | Repositório Git local, `.gitignore`, `.nvmrc`, editorconfig | 🟢 DONE | implementer | `78759a9`, `40d79fb` |
| 002 | Scaffolding Astro 5 estático + TS strict + Tailwind 4 | 🟢 DONE | implementer | `35edfea`, `a5fe94e`, `aa2b9b7` |
| 003 | Estrutura de diretórios conforme §7.5 | 🟢 DONE | implementer (haiku) | `caeee45`, `5cf8ec7`, `8fdba38` |
| 004 | Prettier e ESLint para Astro + TypeScript | 🟢 DONE | implementer | `d42af39`, `dfdbe19`, `8fdba38` |
| 005 | Vitest com o primeiro teste real (`slugify`) | 🟢 DONE | implementer | `7d417ac`, `2a5bdbf` |
| 006 | `.env.example` e `src/lib/config.ts` | 🟢 DONE | implementer | `cd7dfb0`, `363d41a` |
| 007 | `wrangler.toml` para Workers Static Assets | 🟢 DONE | implementer | `ee35dca`, `363d41a` |
| 008 | CI no GitHub Actions (lint, testes, build) | 🟢 DONE | implementer | `8b71999`, `af72c49`, `ac6e52d` |
| 009 | `README.md` inicial | 🟢 DONE | implementer | `9dc42c7`, `ac6e52d` |
| 010 | 🧑 Repositório privado no GitHub e push inicial | 🟢 DONE | **humano** | `ac6e52d` |
| 011 | 🧑 Projeto no TinaCloud vinculado ao repositório | ⬜ TODO | **humano** | — |
| 012 | 🧑 Conta Cloudflare, Worker e primeiro deploy | ⬜ TODO | **humano** | — |
| 013 | ADR-0001, ADR-0002, CHANGELOG e fechamento da fase 0 | ⬜ TODO | implementer | — |

**Próximo:** plano 011 (TinaCloud). Depois o 012, e o 013 fecha a fase.

**Commits fora do fluxo de planos:** `c1d23bb` (tira `CLAUDE.md` do versionamento, exclui
`coverage` do `astro check`) e `07521cd` (overrides de `sharp` e `esbuild` — ver "Segurança").

## Onde o projeto está — 2026-09-01

- **Repositório:** <https://github.com/researchgroups-ufma/haroldo-page> — privado, na
  organização `researchgroups-ufma`. Não é a conta pessoal do desenvolvedor, como o PRD §4.2
  previa; foi decisão do stakeholder, registrada na Evidência do plano 010.
- **CI:** verde. Primeira execução real em 2026-09-01, `Success` em 48s sobre `9dc42c7`.
- **Suíte:** 2 arquivos, 12 testes. `lint`, `format:check` e `build` verdes.
- **Site:** ainda **não publicado**. Nenhum deploy foi feito — é o plano 012.
- **Conteúdo:** `content/` vazio (só `.gitkeep`). Uma única página, `src/pages/index.astro`.
- **Checklist §12 da fase 0:** 8 de 10. Faltam TinaCloud (011) e Cloudflare (012).

## Grafo de dependências

```
001 → 002 → ┬─ 003 ──┬→ 005 → ┬→ 008 → 009 → 010 → 011 ─┐
            │        │        │                          ├→ 013
            ├─ 004 ──┘        └→ 006              012 ──┘
            └─ 007
```

Os planos 001–010 estão fechados. Restam 011 e 012 — ambos humanos e independentes entre si
— e o 013, que depende dos dois.

## Restrição que limita o paralelismo

**Os planos 002, 004, 005 e 007 editam `package.json` e `package-lock.json`.** Executados
concorrentemente, conflitam no lockfile. **Serialize qualquer par que toque `package.json`.**

- **003 ∥ 004** — executados em paralelo em 2026-09-01, sem conflito de arquivo. Mas
  apareceu uma **costura**: o `format:check` do 004 quebrou em `docs/CHANGELOG.md`, criado
  pelo 003. Nenhum dos dois executores tinha autoridade para resolver. Ambos pararam e
  reportaram — comportamento correto; a correção coube ao orquestrador.
- **006 ∥ 007** — os escopos não se tocam, mas foram **serializados** na prática: ambos
  disputam o repositório git e o 007 mexe em `package.json`. Serializar custou pouco e
  preservou um commit por plano, que é o que o `/fechar-fase` precisa para gerar changelog.

## Instruções que todo despacho de executor deve conter

Aprendidas nos planos 001–010; sem elas, os agentes reincidem:

1. **`git add` por caminho explícito. Nunca `git add -A` nem `git add .`** — em execução
   paralela, varre o trabalho do outro agente para dentro do commit errado.
2. **Se o `git commit` falhar por `index.lock`,** esperar alguns segundos e tentar de novo.
3. **`Status:` fica em `TODO`.** A promoção para `DONE` é do orquestrador, depois da
   verificação independente **e** da revisão aprovada. O executor do 003 se autopromoveu e
   teve de ser revertido.
4. **Evidência é saída literal, colada.** Nada de saída de um comando rotulada como de outro,
   nada de anotação dentro do bloco de código. O executor do 004 colou saída de
   `prettier --write` sob o rótulo `prettier --check` e reprovou por isso.
5. **Critério de aceitação não se reescreve para caber no resultado.** Se um bloqueio externo
   impede satisfazê-lo, a caixa fica vazia e o bloqueio é reportado. Também motivo de
   reprovação no 004.
6. **Listar os arquivos que outro agente está tocando naquele momento**, com instrução
   explícita de não editá-los mesmo que uma verificação falhe por causa deles.
7. **Avisar o revisor de que a Evidência fica vazia até o fechamento.** É convenção do
   orquestrador. O despacho do 009 esqueceu de dizê-lo e o revisor reprovou por um item que
   era processo, não erro do executor.
8. **Mandar o executor declarar o que NÃO rodou.** Foi assim que se descobriu, no 009, que o
   `nvm use` documentado no README nunca fora testado — e que `nvm` sequer está instalado
   nesta máquina.
9. **Teste novo tem de ser provado falsificável.** No 006, a verificação independente injetou
   um `process.env` de canário para confirmar que o teste da regra de fato falhava. Sem isso,
   "o teste passa" não significa nada.
10. **Desconfiar de churn grande no lockfile.** O 007 gerou 5677 linhas de diff no
    `package-lock.json`; a checagem mostrou que nenhuma versão fixada mudou (era a árvore do
    wrangler). Verificar sempre, em vez de supor.

## Portão de qualidade (fluxo `/executar-plano`)

Um plano só vira `DONE` com **as duas coisas**: verificação independente com saída real *e*
revisão de código aprovada. Relato do executor dizendo "testes passaram" não substitui nenhuma
das duas.

Verificação autoritativa hoje:

```
npm ci                →  não reescreve o lock (conferido por hash)
npm run lint          →  exit 0
npm run format:check  →  All matched files use Prettier code style!
npm run test          →  Test Files 2 passed (2) | Tests 12 passed (12)
npm run build         →  0 errors, 0 warnings, 1 hint; Complete!
```

O `1 hint` é a depreciação de `tseslint.config` em `eslint.config.js` — pendência do 013.

**Exceções registradas.** O plano 009 foi fechado com aprovação direta do usuário, que revisou
o README por conta própria; o ciclo automatizado foi interrompido antes do veredito. A
verificação independente da suíte e da veracidade do documento foi executada normalmente. O
plano 010 foi executado apesar de o 009 ainda estar aberto na ocasião.

## Segurança — `npm audit`

`npm audit` acusa **1 vulnerabilidade high**, no núcleo do `astro@5.18.2`. Eram 3: o commit
`07521cd` corrigiu duas por `overrides` (`sharp` 0.34.5→0.35.4, `esbuild` 0.27.7→0.28.2),
verificadas de ponta a ponta com uma página `astro:assets` temporária que provou que a
otimização de imagem continua funcionando.

A restante só se resolve subindo para `astro@7.2.10` — **dois majors**. Análise de 2026-09-01:
os 8 advisories do Astro ou exigem SSR (o SSRF de Host header e as server islands são
impossíveis aqui, porque D-01 proíbe SSR e o `wrangler.toml` não tem `main`), ou dependem de
recursos que o site não usa (`define:vars`, spread props, `transition:*`, slots — grep
confirmou zero ocorrências em `src/`).

**Passa a importar na fase 1**, quando conteúdo entrar pelo TinaCMS e imagens forem
processadas pelo `sharp` durante o build. **Recomendação: plano dedicado de upgrade do Astro
antes de a fase 1 entregar conteúdo.**

## Pendências registradas nos planos posteriores

Cada uma está escrita como "Nota do orquestrador" no fim do plano que a herda — **leia o fim
do arquivo antes de despachar qualquer um destes**:

| Plano | Pendência |
|---|---|
| 012 | Conferir com `curl -I` que o header `X-Robots-Tag: noindex` do `public/_headers` chega mesmo na resposta HTTP. Só verificável com o site no ar |
| 013 | ADR-0002 do pin do vite — **com os três overrides** (`vite`, `sharp`, `esbuild`), não só o vite; incluir gatilho de revisão |
| 013 | Migrar o `tseslint.config` depreciado — é o único `hint` que o `astro check` ainda emite |
| 013 | Reconciliar a linha comentada do `Sitemap` no `robots.txt` |
| 013 | ADR do upgrade do Astro (ver "Segurança"), ou plano próprio antes da fase 1 |
| Fase 1 | Cobertura cobre só `src/lib/` e `src/i18n/`, e o `vitest.config.ts` **não tem `thresholds`** — a meta de ≥80% da §11 é relatada, nunca imposta |
| Fase 1 | O teste da regra `process.env` varre só `.ts` sob `src/`; um `process.env` em `<script>` de arquivo `.astro` passaria batido |
| Fase 1 | Reconferir o override do `sharp` com imagens reais — a validação usou imagem sintética |
| Fase 5 | Reativar o `Sitemap` no `robots.txt`, remover o `Disallow: /` e o `X-Robots-Tag: noindex` |

## Dívida de fora do fluxo

- `vite` é importado em `astro.config.mjs` (`loadEnv`) mas **não está declarado** em
  `package.json` — só existe como transitiva de `astro`, `@tailwindcss/vite` e `vitest`.
- `plans/.idea/` aparece como untracked (projeto JetBrains). Nunca foi commitado; falta
  decidir se entra no `.gitignore`.
- A tabela de cobertura por arquivo sai vazia no Windows (defeito cosmético do reporter de
  texto do v8). O relatório HTML em `coverage/` mostra os arquivos corretamente.
