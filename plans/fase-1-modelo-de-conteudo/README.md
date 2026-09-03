# Planos da Fase 1 — Modelo de conteúdo

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo e as armadilhas.

Última atualização: 2026-09-03

**Critério de conclusão da fase** (§6.2 do PRD): *o professor consegue, localmente, criar e
editar item de cada coleção pelo painel.* Não é "os testes passam" — é usar o `/admin`.

## Estado

| Plano | Título | Status | Agente | Commits |
|---|---|---|---|---|
| 015 | Instalação do TinaCMS e `/admin` no ar localmente | ✅ DONE | implementer | `1d35c11`, `30ab365`, `475f65f` |
| 016 | Schemas Zod das cinco coleções | ✅ DONE | implementer | `462ffb4` |
| 017 | As cinco coleções no `tina/config.ts` | ✅ DONE | implementer | `8a58afb` |
| 018 | Grupo "Versão em inglês (opcional)" | ⬜ TODO | implementer | — |
| 019 | Teste de paridade Zod × Tina (D-06) | ⬜ TODO | implementer | — |
| 020 | Conteúdo placeholder representativo | ⬜ TODO | implementer | — |
| 021 | ADRs, verificação do `/admin` e fechamento | ⬜ TODO | implementer | — |

**Próximo:** plano 018 — Grupo "Versão em inglês (opcional)".

**O que o 015 descobriu** (leia antes do 018): Tina + Astro 7 funciona, mas cobrou cinco
correções depois de uma revisão que já havia aprovado. Três armadilhas que o 017 herdou:

1. **`tina/tina-lock.json` é versionado** — cumprida. O lock foi regenerado e commitado no 017;
   coerência verificada pelo revisor recompilando o config com esbuild (`IDENTICAL: true`, md5
   `920af9a27ca48e3d97c044eb599b8e07`). **Continua valendo para o 018**, que também mexe no
   schema.
2. **Gitignorar não esconde do ESLint.** Todo diretório gerado precisa entrar nas três listas:
   `.gitignore`, `eslint.config.js` e — quando não for gitignorado — `.prettierignore`. O 017
   não criou diretório gerado novo, então não a exercitou; **a regra continua valendo** para
   qualquer plano que crie um.
3. **`email: PLACEHOLDER@ufma.br`** em `content/perfil/index.md` é marcado só por comentário —
   **materializou-se no 017**. Ao pôr `email` no schema do Tina, o painel passa a reserializar o
   arquivo via `gray-matter`/`js-yaml`, que não preservam comentários YAML. O Perfil foi aberto
   e conferido pelo orquestrador **mas não salvo**, de propósito, para preservar o marcador.
   **Risco operacional ativo:** qualquer save real do formulário "Perfil" apaga as seis linhas de
   comentário que registram Q-07 como aberta até a fase 3. Quem for tocar nisso precisa
   substituir o e-mail placeholder por um institucional real **antes** do primeiro save.

**O que o 016 deixou aberto e o 017 fechou:** `corpo` (linhas-pesquisa), `ementa` (disciplinas) e
`resumo` (publicações) seguem como `string` + `textarea` (frontmatter), **não** como body Markdown,
por razão técnica verificada: o `rich-text` do Tina sem `isBody` serializa árvore de sintaxe,
incompatível com `z.string()`; com `isBody` sai do frontmatter e o Zod não o vê. A única opção
que preserva string plana é `type: 'string'` com `ui: { component: 'textarea' }` — solução já
usada para `bio` desde o 015. Migrar para corpo Markdown via `render()` é decisão explícita da
fase 3, não do 017.

**O que o 017 deixa para o 019** (insumos para teste de paridade — não peguem em teste ingênuo):

- **Divergência de formato de valor em `linha_relacionada`:** Tina grava o id como caminho
  completo com extensão (`content/linhas-pesquisa/x.md`); Astro `reference()` monta id que o
  `glob()` do Zod nunca gera (`x`). Resultado: `getEntry()` devolve `undefined` — falha
  silenciosa na fase 3. Teste de paridade por nome/tipo/obrigatoriedade não detecta isso.
- **Subcampo obrigatório de lista embutida não bloqueia save:** orquestrador gravou `aulas: [ {} ]`
  com `numero`, `titulo` e `url` (obrigatórios) vazios — Zod rejeita esse frontmatter.
- **`defaultItem` está @deprecated** em favor de `ui.defaultItem`, que não é tipada para coleção
  baseada em `fields`. O 017 usa deliberadamente — upgrade futuro pode removê-lo.
- **Limitação genérica do Tina:** com campo obrigatório vazio, adicionar item dispara erro sem
  dizer qual campo falta.

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
