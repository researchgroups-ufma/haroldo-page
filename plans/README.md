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
| 005 | Vitest com o primeiro teste real (`slugify`) | ⬜ TODO | implementer | — |
| 006 | `.env.example` e `src/lib/config.ts` | ⬜ TODO | implementer | — |
| 007 | `wrangler.toml` para Workers Static Assets | ⬜ TODO | implementer | — |
| 008 | CI no GitHub Actions (lint, testes, build) | ⬜ TODO | implementer | — |
| 009 | `README.md` inicial | ⬜ TODO | implementer | — |
| 010 | 🧑 Repositório privado no GitHub e push inicial | ⬜ TODO | **humano** | — |
| 011 | 🧑 Projeto no TinaCloud vinculado ao repositório | ⬜ TODO | **humano** | — |
| 012 | 🧑 Conta Cloudflare, Worker e primeiro deploy | ⬜ TODO | **humano** | — |
| 013 | ADR-0001, ADR-0002, CHANGELOG e fechamento da fase 0 | ⬜ TODO | implementer | — |

**Próximo:** plano 005.

## Grafo de dependências

```
001 → 002 → ┬─ 003 ──┬→ 005 → ┬→ 008 → 009 → 010 → 011 ─┐
            │        │        │                          ├→ 013
            ├─ 004 ──┘        └→ 006              012 ──┘
            └─ 007
```

## Restrição que limita o paralelismo

**Os planos 002, 004, 005 e 007 editam `package.json` e `package-lock.json`.** Executados
concorrentemente, conflitam no lockfile. **Serialize qualquer par que toque `package.json`.**

Combinações seguras já validadas na prática:

- **003 ∥ 004** — executados em paralelo em 2026-09-01, sem conflito de arquivo. Mas
  apareceu uma **costura**: o `format:check` do 004 quebrou em `docs/CHANGELOG.md`, criado
  pelo 003. Nenhum dos dois executores tinha autoridade para resolver. Ambos pararam e
  reportaram — comportamento correto; a correção coube ao orquestrador.
- **006 ∥ 007** — não validado, mas os escopos não se tocam (`src/lib/` + `.env.example`
  contra `wrangler.toml`). Atenção: o 007 mexe em `package.json` (wrangler), então **não**
  pode correr junto com o 005.

## Instruções que todo despacho de executor deve conter

Aprendidas nos planos 001–004; sem elas, os agentes reincidem:

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

## Portão de qualidade (fluxo `/executar-plano`)

Um plano só vira `DONE` com **as duas coisas**: verificação independente com saída real *e*
revisão de código aprovada. Relato do executor dizendo "testes passaram" não substitui nenhuma
das duas.

Verificação autoritativa da fase 0 (ainda não há suíte; o Vitest entra no plano 005):

```
npm run lint          →  exit 0
npm run format:check  →  All matched files use Prettier code style!
npm run build         →  Complete!
```

## Pendências registradas nos planos posteriores

Cada uma está escrita como "Nota do orquestrador" no fim do plano que a herda — **leia o fim
do arquivo antes de despachar qualquer um destes**:

| Plano | Pendência |
|---|---|
| 006 | Verificar **empiricamente** se `PUBLIC_SITE_URL` é lida do `.env` pelo `astro.config.mjs` (`process.env` vs `loadEnv` do Vite). Fixar que código sob `src/` lê ambiente por `import.meta.env`, nunca `process.env` — um `process.env` em `src/lib/*.ts` não seria pego nem pelo ESLint nem pelo TypeScript, só quebraria no navegador |
| 007 | Acrescentar `public/_headers` com `X-Robots-Tag: noindex` enquanto o site viver em `*.workers.dev` (o `Disallow: /` do `robots.txt` bloqueia rastreamento, não garante não indexação) |
| 008 | Tabela de scripts desatualizada: `build` = `astro check && astro build` |
| 009 | Troubleshooting do campo `overrides` do `package.json` no README |
| 013 | ADR-0002 do pin do vite, com gatilho de revisão; migrar `tseslint.config` depreciado; reconciliar a linha comentada do `Sitemap` no `robots.txt` |
| Fase 5 | Reativar o `Sitemap` no `robots.txt`, remover o `Disallow: /` e o `X-Robots-Tag: noindex` |
