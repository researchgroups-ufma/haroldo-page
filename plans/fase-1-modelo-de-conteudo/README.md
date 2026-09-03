# Planos da Fase 1 — Modelo de conteúdo

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo e as armadilhas.

Última atualização: 2026-09-02

**Critério de conclusão da fase** (§6.2 do PRD): *o professor consegue, localmente, criar e
editar item de cada coleção pelo painel.* Não é "os testes passam" — é usar o `/admin`.

## Estado

| Plano | Título | Status | Agente | Commits |
|---|---|---|---|---|
| 015 | Instalação do TinaCMS e `/admin` no ar localmente | ✅ DONE | implementer | `1d35c11`, `30ab365`, `475f65f` |
| 016 | Schemas Zod das cinco coleções | ⬜ TODO | implementer | — |
| 017 | As cinco coleções no `tina/config.ts` | ⬜ TODO | implementer | — |
| 018 | Grupo "Versão em inglês (opcional)" | ⬜ TODO | implementer | — |
| 019 | Teste de paridade Zod × Tina (D-06) | ⬜ TODO | implementer | — |
| 020 | Conteúdo placeholder representativo | ⬜ TODO | implementer | — |
| 021 | ADRs, verificação do `/admin` e fechamento | ⬜ TODO | implementer | — |

**Próximo:** plano 017 — as cinco coleções no `tina/config.ts`. O 016 está em revisão.

**O que o 015 descobriu** (leia antes do 017): Tina + Astro 7 funciona, mas cobrou cinco
correções depois de uma revisão que já havia aprovado. Três armadilhas que o 017 herda:

1. **`tina/tina-lock.json` é versionado**, ao contrário de `tina/__generated__/` e
   `public/admin/`. Sem ele o TinaCloud não indexa a branch e exibe "No Tina config was found
   on `main`" mesmo com o `tina/config.ts` presente. Ele só é gerado por `tinacms dev` — quem
   mudar o schema precisa subir o dev uma vez e commitar o lock atualizado. **Isto vale para o
   017**, que muda o schema.
2. **Gitignorar não esconde do ESLint.** Todo diretório gerado precisa entrar nas três listas:
   `.gitignore`, `eslint.config.js` e — quando não for gitignorado — `.prettierignore`.
3. **`email: PLACEHOLDER@ufma.br`** em `content/perfil/index.md` é marcado só por comentário,
   não por mecanismo. Quando o 017 puser `email` no schema do Tina, o painel passa a poder
   reserializar o arquivo e o comentário some. Q-07 segue aberta até a fase 3.

## Grafo de dependências

```
014 ─┬→ 015 ─→ 017 ─┬→ 018 ─┬→ 019 ─┬→ 021
     │              │       │       │
     └→ 016 ────────┴───────┴→ 020 ─┘
```

- **015 ∥ 016** — o 015 mexe em `package.json` e `tina/config.ts`; o 016 em
  `src/content.config.ts`. Escopos disjuntos. **Mas o 015 mexe no lockfile**, então serialize se
  o 016 precisar instalar qualquer coisa.
- **019 ∥ 020** — o 019 mexe em testes e, se preciso, nos dois schemas; o 020 só em `content/`.
  Podem correr juntos, desde que o 019 não altere schema enquanto o 020 cria conteúdo contra ele.

## Por onde isto pode dar errado

**1. Tina + Astro 7 é território novo.** O `@tinacms/astro@0.6.1` declara peer
`astro: ^5 || ^6 || ^7`, mas este é o primeiro projeto da casa nessa combinação. Por isso o 015
existe separado e mínimo: descobrir atrito com uma coleção só é barato; descobrir com cinco,
não.

**2. O Tina traz React para um projeto que não tem React.** Esperado — o painel é React. O que
**não** pode acontecer é o site público passar a carregar React. O plano 015 exige medir isso.

**3. A paridade Zod × Tina é a rede de proteção do professor, não burocracia.** Um campo que
exista só num lado produz build quebrado que ele não sabe diagnosticar (F-09, RNF-09). Os planos
016 e 017 transcrevem a §7.3 **independentemente** de propósito, para que o teste do 019 compare
duas leituras da mesma fonte em vez de uma cópia de si mesma. **É esperado que o 019 encontre
divergências reais** — se não encontrar nenhuma, desconfie do teste antes de comemorar.

**4. O repositório é público.** As 6 publicações do placeholder são inventadas e ficam legíveis
por qualquer pessoa, atribuídas a um professor real. Nunca use DOI ou arXiv real, e marque-as de
um jeito trivial de encontrar e apagar. Pela mesma razão, `publicado: false` esconde do site mas
**não** do GitHub (D-04, consequência registrada em 2026-09-01).

**5. `publicacoes` não traduz título nem autores** (RN-07). É a armadilha mais provável do 018:
título de artigo é dado factual e traduzi-lo produziria duas citações divergentes do mesmo
trabalho.

## Herdado da fase 0

- **Lições de despacho** — a lista das 10 lições no README da fase 0 vale integralmente aqui.
  As que mais importam nesta fase: `git add` por caminho explícito; `Status:` só o orquestrador
  promove; Evidência é saída literal colada; **teste novo tem de ser provado falsificável**.
- **Portão de qualidade** — um plano só vira `DONE` com verificação independente com saída real
  **e** revisão de código aprovada.
- **Dívidas herdadas: nenhuma.** As cinco que a fase 0 deixou foram resolvidas em 2026-09-01 —
  URL provisória em `.env.example` e no comentário do `wrangler.toml`, campo `Versão do PRD`,
  cobertura sem `thresholds` e a varredura de `process.env` que ignorava `.astro`. **Esta fase
  começa com a lista limpa; mantenha assim.**
- **A cobertura agora reprova.** O `vitest.config.ts` tem `thresholds` em 80% e o CI roda
  `npm run test:coverage`. Módulo novo em `src/lib/` ou `src/i18n/` sem teste **quebra o CI** —
  o que é o ponto, mas é bom saber antes de abrir o PR.

## Verificação autoritativa

```
npm ci                →  não reescreve o lock
npm run lint          →  exit 0
npm run format:check  →  All matched files use Prettier code style!
npm run test:coverage →  testes verdes E cobertura ≥ 80% (threshold imposto)
npm run build         →  0 errors, 0 warnings, 0 hints; Complete!
```
