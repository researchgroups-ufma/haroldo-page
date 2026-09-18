# Plano 054 — Teste de citações do PRD no código (§10.1, §10.2)

**Status:** TODO
**RFs cobertos:** nenhum — é portão de qualidade, como o 052. Protege a regra do §10.4 do PRD
("Comentário com o identificador do PRD em toda regra de negócio") contra citação trocada
**Depende de:** nada de código. Só dos arquivos que já existem (`PRD.md`,
`docs/identidade-visual.md`, `src/**`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código e canários) — **não** precisa do orquestrador no navegador
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um comentário que cita `F-08` para uma regra que está no `§6.5` passa por `lint`, `astro check`,
build e testes — só a revisão humana pega. Aconteceu **três vezes** nesta fase (043, 046, 048),
custando um ciclo de revisão cada. Este plano transforma esse achado recorrente em teste.

## Por que a verificação óbvia não serve

**Conferir que o identificador existe não pegaria nenhum dos três defeitos.** `F-08`, `§6.3` e
`§5.5` existem todos. O defeito é citação **trocada**, não inexistente. Portanto o teste tem duas
camadas, e a segunda é a que importa:

1. **Existência** (objetiva): todo identificador citado em `src/**` existe na fonte declarada.
2. **Pertinência** (heurística, calibrada): o texto do comentário que carrega a citação tem
   sobreposição de vocabulário com o texto da cláusula citada. Baixa sobreposição = citação
   provavelmente trocada.

A camada 2 só se sustenta se o limiar for calibrado sobre dados reais — e eles existem: `src/`
tem hoje ~100 citações, **todas corretas** (as três erradas já foram corrigidas). Isso dá a
condição de calibração: **zero falsos positivos sobre o `src/` atual**, e o caso conhecido do 048
disparando quando reintroduzido.

## Arquivos afetados

- `tests/lib/citacoes-do-prd.test.ts` — novo
- `src/lib/prd-citations.ts` — novo (a lógica; o teste só orquestra, e assim a função entra na
  cobertura como o resto de `src/lib/`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não corrija citação alguma em `src/**`** — se o teste acusar alguma, **pare e reporte**: pode
> ser defeito real (e aí é outro plano) ou falso positivo (e aí o limiar é que está errado).
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Leia antes:** `plans/DESPACHO.md`, seções "Para o executor" e as regras de código em
`plans/fase-3-site-publico/README.md`.

**Precedente direto de varredura de `src/`:** `tests/lib/config.test.ts` já percorre `src/`
recursivamente em `.ts` e `.astro` e falha quando encontra `process.env` fora de comentário.
**Reaproveite a estratégia de caminhada de diretório dali** (não copie o arquivo; extraia o que
servir para `src/lib/prd-citations.ts`).

**As duas fontes de citação:**

| Prefixo citado | Fonte | Como localizar a cláusula |
|---|---|---|
| `RF-NN`, `RN-NN`, `RNF-NN`, `F-NN`, `M-NN`, `D-NN`, `NG-NN`, `A-NN`, `R-NN` | `PRD.md` | linha de tabela que começa com `\| ID \|` ou `\| **ID** \|` |
| `§N` e `§N.N` | `PRD.md` **e** `docs/identidade-visual.md` | heading `## N.` / `### N.N` |

Um `§` pode existir nas duas fontes (ex.: `§6.5` existe nas duas). Nesse caso a citação é
pertinente se casar com **qualquer uma** — não invente regra para escolher.

**O que conta como "o texto do comentário":** a linha do comentário que contém a citação, mais a
linha anterior e a seguinte se forem do mesmo bloco de comentário. Não puxe o código em volta.

**Sobreposição:** compare palavras de conteúdo (≥ 4 letras, minúsculas, sem acento) do comentário
contra as da cláusula. Ignore uma lista curta de palavras vazias do domínio (`plano`, `regra`,
`ver`, `identidade`, `visual`, `secao`, `campo`, `site`). Métrica e limiar são **decisão sua**,
desde que os critérios de aceitação abaixo sejam satisfeitos e a escolha esteja documentada em
TSDoc com o número medido.

**Cabeçalho §10.1 obrigatório** nos dois arquivos novos. Autor: `Desenvolvedor`. Hoje é
**2026-09-18** (data local confirmada).

## Passos

1. `src/lib/prd-citations.ts` com: extração de citações de um texto-fonte, leitura das cláusulas
   de `PRD.md` e `docs/identidade-visual.md`, e o cálculo de pertinência → verify: `npx astro check`
   colado.
2. `tests/lib/citacoes-do-prd.test.ts` cobrindo a lógica com **fixtures sintéticas** (valores
   exatos, sem depender de `content/` nem do texto real do PRD) → verify: `npx vitest run tests/lib/citacoes-do-prd.test.ts` colado.
3. O teste de invariante sobre o `src/` real: **toda citação existe** e **nenhuma fica abaixo do
   limiar** → verify: verde, com a **contagem de citações varridas** impressa e colada.
4. **Canário de existência:** injete temporariamente um `§99.9` num comentário de um arquivo de
   `src/` que você já tenha aberto, rode o teste, cole o vermelho nomeando arquivo e linha, desfaça
   com `git checkout -- <arquivo>` (seguro: são arquivos commitados) e cole o verde de volta.
5. **Canário de pertinência — o caso real do 048:** reintroduza temporariamente, em
   `src/components/CourseResources.astro`, a citação `(F-08)` no lugar da atual `(§6.5 …)`, rode o
   teste e **prove que ele reprova**; desfaça com `git checkout --` e cole o verde. Se **não**
   reprovar, o limiar está frouxo: ajuste e repita, colando as duas rodadas.
6. **Falso positivo é reprovação:** cole a lista completa das citações varridas com a pontuação de
   cada uma, ou ao menos as **dez de menor pontuação**, para o revisor ver a margem entre a pior
   citação legítima e o limiar → verify: saída colada.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`,
   `npm run build:pipeline` colados.

## Critérios de aceitação

- [ ] Toda citação de identificador em `src/**` é verificada quanto à **existência** na fonte
- [ ] **Zero falsos positivos** sobre o `src/` atual: a suíte passa sem nenhuma citação corrigida
- [ ] O canário de existência (`§99.9`) reprova, nomeando arquivo e linha, e o verde volta
- [ ] O canário de pertinência (`F-08` do 048) **reprova** — é o defeito que motivou o plano
- [ ] A margem entre a pior citação legítima e o limiar está colada na Evidência
- [ ] Lógica em `src/lib/` com teste próprio de fixtures sintéticas; cobertura ≥ 80% mantida
- [ ] Cabeçalho §10.1 e TSDoc nos dois arquivos; nenhum `any`; arquivos < 150 linhas
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Por onde isto pode dar errado

1. **Limiar frouxo demais** passa o caso do 048 (o plano morre sem valor); **apertado demais**
   acusa citação legítima (o teste vira ruído e alguém o desliga). Os critérios 2 e 4 cercam os dois
   lados — é por isso que existem.
2. **Citação em `.astro` está dentro do frontmatter e dentro de `<style>`.** O `config.test.ts`
   já lida com as duas zonas; reaproveite.
3. **`§7` e `§7.3` são citações distintas.** Não normalize uma na outra.
4. **Acento e caixa** variam entre comentário e PRD (`Seção`/`secao`). Normalize os dois lados.
5. **Não deixe o teste depender de `content/`** — a Decisão 6 do fatiamento é explícita: teste que
   afirma número do conteúdo fica vermelho no primeiro save do professor.

## Evidência
