# Planos da Fase 0 — estado e ordem de execução

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a fonte de verdade
> do que já foi feito é o campo `Status:` de cada um. Este arquivo existe para o que não cabe
> em nenhum dos dois: a ordem, o paralelismo e as armadilhas de execução.

Última atualização: 2026-09-01

> **Este arquivo morava em `plans/README.md`** até 2026-09-01, quando os planos foram separados
> por fase em subpastas. Referências a "`plans/README.md`" nas Evidências e nos planos 001–014
> apontam para cá — não para o índice que hoje ocupa aquele caminho.

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
| 011 | 🧑 Projeto no TinaCloud vinculado ao repositório | 🟢 DONE | **humano** | `219d61c` |
| 012 | 🧑 Conta Cloudflare, Worker e primeiro deploy | 🟢 DONE | **humano** | `b2f0234` |
| 013 | ADR-0001, ADR-0002, CHANGELOG e fechamento da fase 0 | 🟢 DONE | orquestrador | `9150233`, `b1cc6c1` |
| 014 | Upgrade do Astro 5 → 7 antes da fase 1 | 🟢 DONE | orquestrador | — |

**Próximo:** nenhum. **A fase 0 está fechada** — 13 de 13 planos DONE. A fase 1 começa pelo
modelo de conteúdo (§6.1 do PRD), e antes dela cabe o plano de upgrade do Astro (ver
"Segurança").

**Commits fora do fluxo de planos:** `c1d23bb` (tira `CLAUDE.md` do versionamento, exclui
`coverage` do `astro check`) e `07521cd` (overrides de `sharp` e `esbuild` — ver "Segurança").

## Onde o projeto está — 2026-09-01

- **Repositório:** <https://github.com/researchgroups-ufma/haroldo-page> — **público** desde
  2026-09-01, por necessidade do projeto (antes privado; ver PRD v0.1.5 e as notas ao fim dos
  planos 010 e 011). Varredura na virada não achou segredo em commit algum. Na
  organização `researchgroups-ufma`. Não é a conta pessoal do desenvolvedor, como o PRD §4.2
  previa; foi decisão do stakeholder, registrada na Evidência do plano 010.
- **CI:** verde. Primeira execução real em 2026-09-01, `Success` em 48s sobre `9dc42c7`.
- **Suíte:** 2 arquivos, 12 testes. `lint`, `format:check` e `build` verdes.
- **Site:** **no ar** em <https://haroldo-page.and-near.workers.dev> — deploy manual em
  2026-09-01, versão `85adc91c`. Raiz responde 200 com a página placeholder estilizada; rota
  inexistente responde 404; `x-robots-tag: noindex` presente. Custo US$ 0,00. **A URL
  divergiu do provisório** `https://haroldo-page.workers.dev` — o subdomínio da conta é
  `and-near`. Reconciliado no código pelo plano 013.
- **Conteúdo:** `content/` vazio (só `.gitkeep`). Uma única página, `src/pages/index.astro`.
- **Checklist §12 da fase 0:** **10/10 🟢 Concluída**, marcado no PRD pelo plano 013.

## Grafo de dependências

```
001 → 002 → ┬─ 003 ──┬→ 005 → ┬→ 008 → 009 → 010 → 011 ─┐
            │        │        │                          ├→ 013
            ├─ 004 ──┘        └→ 006              012 ──┘
            └─ 007
```

Todos os 14 planos estão fechados. O 014 é posterior ao fechamento da fase 0: nasceu da
dívida do upgrade do Astro, executado antes de a fase 1 começar.

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
npm run test:coverage →  testes verdes E cobertura ≥ 80% (threshold imposto)
npm run build         →  0 errors, 0 warnings, 0 hints; Complete!
```

O `1 hint` da depreciação de `tseslint.config` **acabou**: o plano 013 migrou
`eslint.config.js` para `defineConfig` de `eslint/config`. O build está limpo.

**Exceções registradas.** O plano 009 foi fechado com aprovação direta do usuário, que revisou
o README por conta própria; o ciclo automatizado foi interrompido antes do veredito. A
verificação independente da suíte e da veracidade do documento foi executada normalmente. O
plano 010 foi executado apesar de o 009 ainda estar aberto na ocasião.

## Segurança — `npm audit`

**`npm audit`: 0 vulnerabilidades.** Estado alcançado em 2026-09-01 pelo plano 014, que subiu
`astro@5.18.2` → `7.2.10` (dois majors) e **removeu todos os `overrides`** do `package.json`.

Histórico, porque o caminho explica os arquivos: eram 3 vulnerabilidades. O commit `07521cd`
corrigiu duas por `overrides` (`sharp` 0.34.5→0.35.4, `esbuild` 0.27.7→0.28.2). A terceira, no
núcleo do Astro, só saía com os dois majors — e a análise da época concluiu que ela era
**inaplicável** a este site (os 8 advisories exigem SSR, impossível por D-01, ou dependem de
recursos com zero ocorrência em `src/`).

O upgrade foi feito assim mesmo, e **não por segurança**: o Astro v6 remove as coleções
legadas, exige Content Layer API e sobe para Zod 4. Como o primeiro item da fase 1 é
`src/content.config.ts` com os schemas Zod das cinco coleções, migrar depois significaria
reescrevê-los. Com `content/` vazio e um único `.astro`, este era o momento mais barato
possível. Ver ADR-0002 (seção "Desfecho") e a Evidência do plano 014.

## Pendências registradas nos planos posteriores

Cada uma está escrita como "Nota do orquestrador" no fim do plano que a herda — **leia o fim
do arquivo antes de despachar qualquer um destes**:

| Plano | Pendência |
|---|---|
| ~~012~~ | ~~Conferir que o header `X-Robots-Tag: noindex` do `public/_headers` chega na resposta HTTP~~ — **resolvida em 2026-09-01**: `curl.exe -sI` na raiz do Worker devolve `x-robots-tag: noindex` |
| ~~013~~ | ~~ADR-0002 do pin do vite, com os três overrides e gatilho de revisão~~ — feito |
| ~~013~~ | ~~Migrar o `tseslint.config` depreciado~~ — feito; o build não emite mais hints |
| ~~013~~ | ~~Reconciliar a linha comentada do `Sitemap` no `robots.txt`~~ — feito; segue comentada até a fase 5 |
| ~~Fase 1~~ | ~~ADR do upgrade do Astro, ou plano próprio antes de a fase 1 entregar conteúdo~~ — **feito pelo plano 014** em 2026-09-01 |
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
- ~~`.env.example:23` com o subdomínio provisório~~ e ~~`wrangler.toml:5-6` com o comentário
  obsoleto~~ — **resolvidos em 2026-09-01**. Nenhum arquivo de código ou configuração menciona
  mais `haroldo-page.workers.dev`; as ocorrências restantes estão só em Evidências de planos,
  que registram o que era verdade na execução e não se reescrevem.
- ~~O campo `Versão do PRD` em `PRD.md` §0 continua `v0.1`~~ — **corrigido em 2026-09-01** para
  `v0.1.7`, junto com a linha de histórico que registra a correção.
