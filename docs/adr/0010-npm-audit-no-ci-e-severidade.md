# ADR-0010 — `npm audit` no CI, reprovando em `high`/`critical`

- **Status:** Aceita
- **Data:** 2026-09-12
- **Decisão do PRD:** RNF-07, RNF-08; dívida 6 da fase 1
- **Fase:** 2 (plano 032)

## Contexto

O CI não rodava `npm audit`. O estado da árvore mudou três vezes desde a fase 0:

- 2026-09-01 (fim da fase 0, plano 014): **0 vulnerabilidades**, depois do upgrade Astro 5 → 7
  e da remoção de todos os `overrides` (ver `docs/adr/0002-pin-do-vite-via-overrides.md`).
- 2026-09-03 (fase 1, plano 015 trouxe o TinaCMS): **8 vulnerabilidades moderadas**, de duas
  origens diferentes, ambas por trás do TinaCMS mas em cadeias distintas:
  - 5 via `tinacms@3.12.1 → react-router-dom → react-router@6.30.6`. Advisories
    [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) (open redirect via
    barra invertida em `<Link>`/`useNavigate`) e
    [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg) (Arbitrary
    Constructor Injection via `deserializeErrors()` em hidratação SSR).
  - 3 via `@tinacms/cli@2.6.1 → altair-express-middleware → express`/`body-parser → qs@6.15.3`.
    Advisories [GHSA-x5fp-wj9c-mxmx](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx)
    (array-limit bypass via parsing de vírgula em chave entre colchetes) e
    [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) (DoS via
    `isBuffer` controlado pelo atacante).

  Alcance das duas cadeias: o painel `/admin`, React, autenticado, usado por uma pessoa. O site
  público não carrega React (D-01, medido no plano 015) — a superfície exposta a visitante é
  zero.

- 2026-09-12 (plano 032, medição do orquestrador): o número deixou de ser 8. Chegaram **3
  vulnerabilidades `high`**, de outra cadeia — `sharp` (via `libheif`, advisory
  [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)), instalado sob
  `miniflare`, instalado sob `wrangler@4.128.0`, cuja faixa vulnerável ia de `4.16.0` a
  `4.130.0`. `wrangler` é `devDependency`, versão exata (sem `^`); a versão publicada mais
  recente, `4.131.1`, está fora dessa faixa, é o mesmo major (não é upgrade de breaking change)
  e não é adiantamento algum — é a última disponível.

**Retrato "antes" (`npm audit`, medido em 2026-09-12, antes de qualquer mudança neste plano):**

```
11 vulnerabilities (8 moderate, 3 high)
```

- `qs` 2.2.5–6.15.3 (moderate) — via `body-parser`, `express`; corrigível sem major.
- `react-router` 6.0.0–7.17.0 (moderate) — via `react-router-dom`, `@tinacms/app`,
  `@tinacms/cli`, `tinacms`; `npm audit` só oferece `tinacms@1.5.5`/`@tinacms/cli@0.61.23`,
  `isSemVerMajor: true` — downgrade, não correção (estamos em `tinacms@3.12.1` e
  `@tinacms/cli@2.6.1`).
- `sharp` <0.35.4 (**high**) — via `miniflare` → `wrangler@4.128.0`; corrigível com
  `wrangler@4.131.1`, mesmo major.

`npm ls react-router`: `tinacms@3.12.1 → react-router-dom@6.30.6 → react-router@6.30.6`.
`npm ls wrangler miniflare`: `wrangler@4.128.0 → miniflare@5.20260831.0-alpha`.

**O `sharp` já estava na árvore antes, numa cópia diferente da vulnerável.** `astro@7.2.10`
(dependência de produção) já trazia `sharp@0.35.4` no nível superior — confirmado em
`git show HEAD:package-lock.json` antes de qualquer mudança deste plano. A cópia vulnerável era
a **aninhada** sob `miniflare` (`sharp@<0.35.4`, especificamente `0.35.2`), instalada porque
`wrangler@4.128.0` fixava um `miniflare` que não deduplicava contra a cópia de cima. O `sharp`
em si **não é `devDependency`** — ele chega por `astro`, produção — e não saiu do projeto; ver
o retrato "depois" abaixo.

Três fatos decidem o caso do `wrangler`:

1. A faixa vulnerável termina em `4.130.0`; `4.131.1` sai dela por definição, não por promessa.
2. Não é major: `4.128 → 4.131`, mesmo major, e é a última publicada.
3. **O `wrangler` em si** é `devDependency`: não entra no artefato do Worker — o site serve
   assets estáticos (D-01, confirmado pela plataforma com `has_modules: false` no plano 025).
   Isso não é o motivo de o `sharp` ficar de fora do Worker (ele não fica: ver abaixo) — é o
   motivo de a subida do `wrangler`, por si só, não mudar nada em produção.

**Retrato "depois" (`npm audit`, medido em 2026-09-12, depois de subir o `wrangler` para
`4.131.1`):**

```
8 moderate severity vulnerabilities
```

As três `high` desapareceram — **mas o `sharp` não saiu da árvore, e isso é o ponto.**
`npm ls sharp`, medido depois da subida:

```
+-- astro@7.2.10
| `-- sharp@0.35.4
`-- wrangler@4.131.1
  `-- miniflare@5.20260911.0-alpha
    `-- sharp@0.35.4 deduped
```

O `miniflare` novo passou a **deduplicar** na cópia segura de `sharp@0.35.4` que `astro` já
trazia, em vez de instalar a sua própria cópia aninhada e desatualizada. Não houve remoção de
pacote — houve resolução de árvore convergindo para uma única versão, já corrigida. O `sharp`
continua no projeto, como dependência de produção via `astro`; o que ele **não** faz é entrar no
Worker publicado — não por ser `devDependency` (não é: `astro` é produção), mas porque é usado
só em **tempo de build**, para a otimização de imagem do Astro, e o site é estático: não há
runtime de Node no Worker que carregue `sharp` (D-01, `has_modules: false`, medido no plano 025).

`npm ls wrangler miniflare`: `wrangler@4.131.1 → miniflare@5.20260911.0-alpha`.
`git diff --stat -- package-lock.json` tocou 682 linhas, todas dentro da cadeia
`wrangler → miniflare → sharp` (a entrada aninhada do `sharp` sob
`node_modules/miniflare/node_modules/` desaparece do lock, e com ela seus binários de
plataforma) — nenhum pacote fora dela.

**Achado da mesma medição: nem todas as 8 moderadas são irreparáveis.** São 5 sem correção
nossa disponível, não 8:

| Pacote                                                                        | `fixAvailable`                                                  | Leitura                                                                                        |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tinacms`, `react-router`, `react-router-dom`, `@tinacms/app`, `@tinacms/cli` | `tinacms@1.5.5` / `@tinacms/cli@0.61.23`, `isSemVerMajor: true` | Não é correção — é downgrade. O npm reporta assim quando não existe versão mais nova corrigida |
| `body-parser`, `express`, `qs`                                                | `true`                                                          | Corrigíveis sem major                                                                          |

Este ADR registra a pendência nomeada: `body-parser`, `express` e `qs` (3 pacotes, dentro das 8
moderadas) têm correção disponível via `npm audit fix` e **não foram corrigidos neste plano**,
de propósito — são `moderate`, não afetam o portão descrito abaixo, e corrigi-los exigiria rodar
`npm audit fix`, cujo churn de lockfile esta fase manda desconfiar (restrição aprendida nos
planos 002/004/005/007 da fase 0), e seria escopo especulativo num plano que já mexe em
dependência.

## Decisão

**O CI ganha um passo `npm audit --audit-level=high`, entre `npm ci` e `npm run lint`,
sem `continue-on-error`. A subida do `wrangler` de `4.128.0` para `4.131.1` é parte da mesma
decisão** — sem ela, o portão nasceria vermelho com as três `high` de hoje.

Três pontos, cada um com razão:

1. **Reprova em `high`/`critical`, não em `moderate`.** Reprovar em `moderate` deixaria o CI
   vermelho permanentemente, por uma vulnerabilidade que não temos como corrigir sem downgrade
   e que não alcança visitante nenhum (painel `/admin`, autenticado, uma pessoa). Este projeto
   já viveu o custo de um sinal sempre vermelho: o CI ficou vermelho por 14 commits seguidos e
   ninguém olhou — um portão que se espera que falhe treina as pessoas a ignorá-lo.
2. **As moderadas continuam visíveis.** Confirmado na prática (não só na documentação):
   `npm audit --audit-level=high` roda até o fim e **imprime** as 8 moderadas com sua árvore de
   dependência completa antes de encerrar com exit 0 — a bandeira só muda o exit code, não a
   listagem.
3. **Sem `continue-on-error`.** Um passo que nunca falha é decoração. Provado falsificável:
   `npm audit --audit-level=high` sai com exit 0 na árvore corrigida, enquanto
   `npm audit --audit-level=moderate`, rodado na mesma árvore, sai com exit 1 pelas 8 moderadas
   — o passo é capaz de reprovar o CI quando a condição existe.

**Onde o passo entra:** depois de `npm ci` e antes do `lint` — falha barata primeiro. Não
precisa de segredo.

**O que se faz quando aparecer uma `high`:** avaliar alcance, e (a) atualizar a dependência,
(b) registrar exceção **datada** com justificativa escrita neste ADR, ou (c) trocar a
dependência. Nunca afrouxar o nível para passar.

## Alternativas consideradas

- **Reprovar em `moderate`.** Rejeitada: as 8 moderadas de hoje (5 sem correção nossa, 3
  adiadas de propósito) deixariam o CI vermelho permanentemente — o modo de falha que já custou
  14 commits ignorados nesta fase.
- **Reprovar só em `critical`.** Rejeitada: afrouxaria o portão **permanentemente** para
  contornar um problema — a `high` do `sharp`/`wrangler` — que tinha correção trivial e
  não-major. Compraria cegueira a `high` para sempre, quando o caso concreto que motivou a
  cautela já foi resolvido pelo passo 1 deste plano.
- **Exceção nomeada e datada para o advisory do `sharp`.** Rejeitada: criaria dívida de
  manutenção (ADR + gatilho + alguém lembrar de revisar) para um problema que **não precisa**
  de exceção — havia correção não-major disponível. Exceção se reserva ao que não tem saída, e
  aqui tinha.
- **`continue-on-error: true`.** Rejeitada: um passo que nunca falha é decoração, não portão.
- **Recriar `overrides` para as moderadas.** Rejeitada: o plano 014 removeu todos os `overrides`
  deliberadamente (`docs/adr/0002-pin-do-vite-via-overrides.md`); as 5 moderadas sem correção
  nossa não têm versão corrigida para fixar via override — só downgrade, que um override não
  resolveria sem reintroduzir o problema que o override existiria para evitar.
- **Não auditar.** Rejeitada: é o estado anterior a este plano — a árvore chegou a 3 `high` sem
  que ninguém percebesse até a medição manual de 2026-09-12.

## Consequências

- O CI passa a reprovar automaticamente quando surgir uma `high`/`critical` nova, em vez de
  depender de medição manual — foi assim que as 3 `high` do `sharp` chegaram e ficaram
  despercebidas entre 2026-09-03 e 2026-09-12.
- As 8 moderadas continuam na árvore, visíveis no log de todo CI verde, sem bloquear nada. 5
  delas (via `tinacms`) não têm correção nossa disponível hoje; 3 (`body-parser`, `express`,
  `qs`) têm e ficaram de fora deste plano, de propósito, como pendência nomeada.
- `npm audit` **não** entra em `build:pipeline` — auditoria é assunto do portão de qualidade
  (CI), não do deploy. Um advisory publicado às 3 da manhã não pode impedir o professor de
  publicar uma aula pelo Workers Builds.
- O comando de build do `ci.yml` não muda — é escopo do plano 024.

## Gatilhos de revisão

- O TinaCMS subir `react-router-dom` para uma versão sem o advisory — nesse momento as 5
  moderadas sem correção nossa deixam de existir e este ADR deve ser atualizado.
- Surgir uma `high`/`critical` nova na árvore — o CI já reprova sozinho; a decisão aqui é qual
  das três respostas (atualizar, exceção datada, trocar dependência) se aplica.
- O site público passar a carregar React — hoje impossível por D-01. Se isso mudar, a decisão
  de reprovar só em `high` (e não em `moderate`, por causa do `react-router`) precisa ser
  reaberta como decisão arquitetural própria, porque o alcance do advisory deixaria de estar
  restrito ao `/admin` autenticado.

## Referências

- PRD RNF-07, RNF-08; dívida 6 da fase 1
- `plans/fase-2-pipeline-de-publicacao/032-npm-audit-no-ci-e-politica-de-severidade.md` —
  Evidência completa: os dois retratos do `npm audit`, o churn do lockfile medido, a prova de
  falsificabilidade
- `docs/adr/0002-pin-do-vite-via-overrides.md` — histórico dos `overrides` removidos no plano
  014 e por que não voltam sem motivo escrito
- `plans/fase-2-pipeline-de-publicacao/025-roteiro-workers-builds-e-variaveis-no-cloudflare.md`
  (D-01, `has_modules: false`) — por que o `wrangler` como `devDependency` não entra no
  artefato do Worker
