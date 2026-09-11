# ADR-0009 — Os pipelines automáticos rodam `tinacms build --skip-cloud-checks`

- **Status:** Aceita
- **Data:** 2026-09-11
- **Decisão do PRD:** fora da tabela D-01..D-07 — RF-11 (publicação sem intervenção do
  desenvolvedor), RNF-04, RNF-12, e a dívida 1 que a fase 1 deixou aberta para a fase 2
- **Fase:** 2 (implementada no plano 024; este é o primeiro ADR da fase — o primeiro plano da
  fase é o 023, trivial e já `DONE`)

## Contexto

`tinacms build` compara o schema local com o que o TinaCloud indexou na branch `main` e aborta
com `ERR_CLOUD_CHECK_FAILED` enquanto os dois não baterem. Saída literal do modo de falha,
reproduzida com um campo canário durante a verificação deste plano (2026-09-11):

```
The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes
to GitHub to update your remote GraphQL schema. null

Additional info:

	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Local GraphQL version: 2.4.10 / Remote GraphQL version: 2.4.10
	Last indexed at: Thu, 10 Sep 2026 13:46:09 GMT
	Reason: [NON_BREAKING - FIELD_ADDED] Field 'canario_024' was added to object type 'Linhas_pesquisa'

    errorCode: 'ERR_CLOUD_CHECK_FAILED'
```

Na máquina do desenvolvedor esse aviso tem informação real: "você mudou o schema e ainda não
empurrou". Num pipeline automático (GitHub Actions e, a partir do plano 025, Cloudflare Workers
Builds) não tem, e por dois motivos diferentes conforme o gatilho. Em `push` para `main` o commit
já está lá por construção, e o que resta do cloud check ali é uma corrida contra a reindexação
assíncrona do TinaCloud — um push que altere schema pode disparar o build automático antes de o
TinaCloud reindexar e reprovar **sem haver defeito nenhum**. Em `pull_request`, o `ci.yml` também
dispara, e ali o schema do branch da PR nunca foi indexado (só `main` é) — o cloud check falharia
de forma **determinística**, não por corrida, mas ainda assim sem apontar defeito algum no código
da PR. Nos planos 017, 018 e 022 esse bloqueio foi absorvido por um humano (empurrar, esperar a
reindexação, repetir o build); no Workers Builds não há humano nessa posição — esta é a dívida 1
que a fase 1 deixou para a fase 2.

## Decisão

**Os dois pipelines automáticos (GitHub Actions e Cloudflare Workers Builds) rodam
`tinacms build --skip-cloud-checks`; o comando local `npm run build` continua com o cloud
check.** Concretamente, `package.json` ganha:

```json
"build:pipeline": "vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build"
```

Quatro pontos, cada um com razão própria:

1. **`--skip-cloud-checks` só no pipeline.** No pipeline, em `push`, o cloud check só acrescenta a
   corrida com a reindexação; em `pull_request`, ele falharia sempre, de forma determinística,
   porque o schema do branch da PR nunca foi indexado. Em nenhum dos dois casos ele aponta defeito
   real. Na máquina do desenvolvedor ele acrescenta informação real. Por isso `npm run build` não
   muda — continua o portão pré-push obrigatório de todo plano que mexa em schema, na mesma ordem
   de fechamento que os planos 017, 018 e 022 já usaram (revisão → commit → push → TinaCloud
   reindexa → `npm run build` verde → `Status: DONE`).
2. **O mesmo comando no GitHub Actions e no Workers Builds.** Comandos diferentes em CI e deploy
   fariam o verde do CI parar de dizer algo sobre o deploy — o tipo de armadilha que já deixou o
   CI vermelho por 14 commits seguidos nesta fase 1, por falta das credenciais do TinaCloud,
   resolvido em 2026-09-04 (`82fb4de`; ver README, seção "Variáveis de ambiente", e
   `plans/fase-1-modelo-de-conteudo/022-scripts-em-disciplinas.md`, "O CI agora é verificação
   real").
3. **`vitest run tests/content` na frente.** É o que torna o build do deploy capaz de recusar
   conteúdo inválido salvo pelo painel — o `astro check` imprime `[ERROR] [content]` e ainda assim
   encerra com `0 errors`/exit 0 (achado dos planos 020 e 021): o exit code do build não protege
   contra referência de conteúdo inválida. `tests/content/` roda em ~1s, determinístico.
4. **`npm run deploy` (deploy manual) fica como está**, chamando `npm run build` com cloud check —
   é o caminho de emergência, rodado por um humano numa máquina onde o disco pode não estar em
   sincronia com `main`.

## Alternativas consideradas

- **Manter o cloud check no pipeline e reexecutar o job quando falhar por reindexação.**
  Rejeitada: transforma um bloqueio determinístico do build em um problema de retry/polling contra
  um serviço assíncrono de terceiro, sem garantia de prazo — o professor veria um deploy vermelho
  aleatório até a reexecução manual ou automática acertar a corrida.
- **Mover o deploy para o GitHub Actions** (em vez de manter Cloudflare Workers Builds como
  disparador). Rejeitada: o RF-11 e o item 2 do §12 da fase 2 já preveem os dois pipelines
  automáticos funcionando em paralelo; concentrar o deploy só no GitHub Actions descartaria a
  integração nativa do Workers Builds com o Cloudflare sem motivo — o problema é o cloud check, não
  o disparador do deploy.

## Consequências

- Os pipelines automáticos deixam de ter um sinal automático de "o TinaCloud indexou o schema de
  `main`". Esse sinal passa a ser dado onde ele é real: no `/admin` **em produção** (plano 026, que
  abre o painel e edita por ele) e no `npm run build` local antes de empurrar mudança de schema.
  Um TinaCloud que pare de indexar quebra o `/admin`, não o site — o site público não depende do
  TinaCloud em runtime (§7.1, F-03).
- Verificado que `--skip-cloud-checks` pula só a _validação_ contra o TinaCloud, não a _geração_
  dos artefatos: `npm run build` e `npm run build:pipeline`, rodados em sequência sobre o mesmo
  schema, produzem `dist/`, `public/admin/` e `tina/__generated__/` byte-idênticos, com uma única
  exceção não atribuível à flag — o `cacheDir` embutido em `tina/__generated__/client.ts` inclui um
  timestamp que muda a cada invocação de `tinacms build`, com ou sem `--skip-cloud-checks`. Provado
  por experimento de controle (duas execuções seguidas de `npm run build`, sem a flag, com hash e
  `cacheDir` divergindo entre elas) e por diff textual do arquivo com o token redigido, mostrando
  que nenhum outro caractere diverge além do epoch do `cacheDir`. Evidência completa (hash MD5
  arquivo a arquivo, as duas execuções de controle e o diff normalizado) na Evidência do plano 024.
- Prova adicional por canário A/B, também na Evidência do plano 024: um campo opcional acrescentado
  aos dois schemas faz `npm run build` reprovar com `ERR_CLOUD_CHECK_FAILED` (saída reproduzida
  acima) e `npm run build:pipeline` passar a etapa do Tina com o mesmo schema local — isola que a
  única diferença entre os dois comandos é o cloud check.
- `--skip-cloud-checks` **não** dispensa `TINA_CLIENT_ID`/`TINA_TOKEN`: a falha por credencial
  ausente ("Client not configured properly. Missing clientId, token") acontece antes do cloud
  check, na construção do cliente (apurado em 2026-09-04, plano do CI). O `ci.yml` continua
  passando os dois secrets ao passo de build.

## Gatilhos de revisão

- O TinaCMS passar a oferecer uma verificação de indexação **não bloqueante** (aviso em vez de
  erro fatal) — nesse caso o cloud check volta a ser seguro no pipeline, e `build:pipeline` pode
  voltar a usar `tinacms build` sem a flag.
- O `/admin` em produção quebrar por schema não indexado sem que isso seja percebido a tempo —
  sinal de que o sinal de indexação perdido por esta decisão precisa de um substituto mais
  visível que a inspeção manual do painel.

## Referências

- PRD §7.1 (F-03), RF-11, RNF-04, RNF-12, §12 (itens 1 e 2 da fase 2)
- `plans/fase-2-pipeline-de-publicacao/024-build-de-pipeline-e-o-cloud-check-do-tinacloud.md` —
  Evidência completa: baseline vs. `build:pipeline` (hash MD5 dos três artefatos) e canário A/B
- `docs/adr/0008-paridade-zod-tina-como-rede-de-protecao.md` — molde deste ADR
- `plans/fase-1-modelo-de-conteudo/020-conteudo-placeholder-representativo.md` e
  `021-fechamento-da-fase-1.md` — achado do `[ERROR] [content]` com exit 0 do `astro check`, que
  motiva o `vitest run tests/content` na frente do `build:pipeline`
