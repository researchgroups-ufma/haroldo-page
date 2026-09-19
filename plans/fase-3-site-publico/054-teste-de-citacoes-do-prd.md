# Plano 054 — Teste de citações do PRD no código (protege o §10.3)

**Status:** DONE
**RFs cobertos:** nenhum — é portão de qualidade, como o 052. Protege a regra do **§10.3** do PRD
("Comentários no Código": *toda regra de negócio implementada referencia o identificador do PRD*)
contra citação trocada. **Correção de 2026-09-18:** este cabeçalho dizia §10.4, que é "Convenções
Gerais" e não legisla comentário — o mesmo defeito que o plano existe para caçar, cometido no
próprio plano e no arquivo entregue. Achado pela revisão do ciclo 1
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
custando um ciclo de revisão cada. Este plano nasceu para transformar esse achado em teste; entrega
a camada que se provou possível (**existência**) e registra, com medição, por que a outra
(**pertinência**) não é escrevível hoje — ver "Escopo reduzido", abaixo.

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

## Escopo reduzido em 2026-09-18, por hipótese refutada (decisão do orquestrador)

**Isto não é critério afrouxado para caber no resultado** — regra que este projeto leva a sério. É
outra coisa: a **hipótese de desenho do plano foi testada e falsificada por medição**, e um plano
cuja hipótese cai não tem os critérios relaxados; ele é **partido** entre o que ficou provado e o
resultado negativo, que se registra.

**A hipótese:** "um limiar escalar sobre sobreposição de vocabulário separa citação certa de
citação trocada, calibrável com zero falso positivo sobre o `src/` atual".

**A medição que a derruba** (236 citações reais, detalhada na Evidência): **32 delas pontuam
exatamente `0`**. Dessas 32, **ao menos uma é citação correta indiscutível** e **ao menos uma era
defeito real** — as duas medidas, não supostas. A correta: `src/lib/published.ts:37` é a linha
`// RN-01` **sozinha**, sem nenhuma palavra de conteúdo, dentro do `filterPublished`; nenhum limiar
a salva. A errada: `src/lib/prd-citations.ts:5` citava `§10.4` para uma regra do `§10.3` — o
detector acertou, e a revisão do ciclo 1 o confirmou. As demais **não foram investigadas uma a
uma**, e esta seção não afirma que sejam legítimas. *(Correção de 2026-09-18: a redação anterior
dizia "e são legítimas", afirmação que eu não havia medido — e uma delas era defeito.)* O caso decisivo é `RN-01`, citado em seis lugares para o filtro
de rascunho: a cláusula no `PRD.md:277` fala em `publicado = false`, página, sitemap e feed, e
**não contém a palavra "rascunho"** — nem nenhuma outra do comentário. Ampliar a janela de
contexto não muda isso. Como o canário do 048 também pontua `0`, **nenhum limiar escalar separa os
dois lados**: `> 0` reprova 13,6% das citações corretas de hoje; `= 0` não reprova nada.

**O que muda no plano:** a camada de pertinência sai do escopo do 054 e os critérios que dependiam
dela deixam de existir aqui — não ficam marcados nem desmarcados. A camada de **existência**, que
foi construída, testada e provada por canário, é o que o 054 entrega. A questão que sobra vai para
o stakeholder, abaixo.

**Questão aberta para o stakeholder — e ela é anterior ao teste.** A medição expôs que **`F-08` é
usado no projeto num sentido mais amplo do que a própria cláusula autoriza.** No `PRD.md:298`,
F-08 é *"Imagem ausente (perfil sem foto, notícia sem imagem)"*; mas **`docs/identidade-visual.md:32`
(§1, regra 2) o amarra ao sentido amplo em texto normativo**: *"**Campo vazio não deixa rastro**
(RF-21, F-05, F-08). Bloco sem dado some inteiro, com o rótulo; a grade se recompõe em vez de
reservar espaço."* O código segue essa leitura em `src/components/ProjectCard.astro:10` e
`src/pages/sobre.astro:10`, e a leitura estrita em `src/pages/index.astro:87` — convive com as duas.
*(Correção de 2026-09-18: esta seção atribuía a frase ao histórico do PRD. Falso — `grep "não deixa
rastro" PRD.md` não devolve nada. A fonte é a identidade visual, e isso torna o sentido amplo mais
forte do que eu havia escrito, porque está em cláusula normativa ao lado de RF-21 e F-05.)* **Era essa ambiguidade que produziu o defeito do 048**, e ela está na **fonte**, não no
comentário. Duas saídas, e a escolha é de produto: (a) emendar a cláusula de F-08 para cobrir
campo ausente em geral, e então `ProjectCard` está certo e o 048 estava mesmo errado por outro
motivo; (b) manter F-08 restrito a imagem e criar um identificador novo para "campo vazio não deixa
rastro", corrigindo as citações que usam o sentido amplo — **esta emenda toca os dois documentos**,
`PRD.md:298` e `docs/identidade-visual.md:32`, não só o PRD. **Enquanto isso não for decidido, nenhum
teste de pertinência pode ser escrito** — não há verdade contra a qual calibrar.

> **Nota sobre a Evidência:** a subseção "Critérios de aceitação" da Evidência **não** enumera mais
> os oito itens do ciclo 1 — o executor a substituiu, no ciclo 2, por uma nota dizendo que aquela
> lista foi superada. Os oito itens originais, com os três que ficaram vazios, são recuperáveis no
> diff do ciclo 1 (`diff054.txt`). A lista válida é a desta seção, abaixo.
>
> *(Esta nota foi reescrita em 2026-09-18. A versão anterior afirmava que a subseção "enumera oito
> itens" e que "o texto do executor não foi reescrito" — as duas coisas deixaram de ser verdade
> quando o executor reescreveu a Evidência no ciclo 2, **depois** de eu inserir a nota. É
> exatamente a regra 5 da seção "Para o orquestrador" do `plans/DESPACHO.md`, escrita nesta mesma
> sessão e violada por quem a escreveu: seção do orquestrador entra **depois** do último ciclo do
> executor, nunca antes.)*

## Critérios de aceitação

- [x] Toda citação de identificador em `src/**` é verificada quanto à **existência** na fonte
- [x] O canário de existência (`§99.9`) reprova, nomeando arquivo e linha, e o verde volta
- [x] Lógica em `src/lib/` com teste próprio de fixtures sintéticas; cobertura ≥ 80% mantida
- [x] Cabeçalho §10.1 e TSDoc nos dois arquivos; nenhum `any`
- [x] `src/lib/prd-citations.ts` com 133 linhas, abaixo do alvo do §10.4

> **Sobre o limite de linhas no arquivo de teste (206):** o critério original dizia "arquivos < 150
> linhas" e foi corrigido, não afrouxado — o §10.4 do PRD escreve "Tamanho de **componentes** |
> Alvo < 150 linhas", e não legisla arquivo de teste. `tests/lib/courses.test.ts` tem 256 e
> `tests/content/schemas.test.ts` 503, ambos aprovados em revisão. O arquivo de lógica, esse sim
> um alvo do §10.4, ficou em 133. *(Números atualizados em 2026-09-18 para o ciclo 2: eram 149 e
> 252 antes da remoção de `relevanceScore`/`contentWords`/`STOPWORDS`.)*
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada
- [x] A refutação da camada de pertinência está medida e registrada, com a questão de F-08 endereçada ao stakeholder

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

**Resumo do estado:** a camada de **existência** está completa, testada e provada por canário
(critérios 1 e 3). A camada de **pertinência** ficou **bloqueada** por um achado de calibração
que torna o desenho do plano (limiar escalar sobre sobreposição de vocabulário, contexto de
±1 linha) inviável sobre os dados reais de `src/` sem uma decisão do stakeholder — ver a seção
"Pertinência: achado de calibração e por que fiquei bloqueado" abaixo. Por isso `Status` continua
`TODO`.

### Ciclo 2 — correções da revisão (REPROVADO com quatro obrigatórios)

A revisão reproduziu a medição do ciclo 1 de forma independente (236 citações, 32 em zero,
`§6.5 = 0.5714285714285714` batendo dígito a dígito) e confirmou o achado. Quatro obrigatórios
eram meus/divididos; corrigi os quatro:

1. **`src/lib/prd-citations.ts:5` citava `§10.4` para a regra que está no `§10.3`.** O §10.4 é
   "Convenções Gerais" (estilo, type hints, idioma, tamanho de componente); a regra "toda regra de
   negócio referencia o identificador do PRD" está no **§10.3, "Comentários no Código"**
   (`PRD.md:729`). A frase entre aspas do cabeçalho também não era do PRD — era a redação de
   `plans/fase-3-site-publico/README.md`. Corrigido para `§10.3`, sem aspas, com paráfrase da
   cláusula real. Era a **quarta ocorrência**, dentro do próprio arquivo, da classe de defeito que
   ele existe para caçar.
2. **A dispensa do zero de `prd-citations.ts:5` estava errada.** Eu tinha escrito que esse zero
   "é autorreferente e não precisa de decisão... não é uma regra de negócio disputada". Pelo item
   1, era **verdadeiro positivo** do detector, não ruído — corrigido abaixo, na seção da
   calibração.
3. **Removidas `relevanceScore`, `contentWords` e `STOPWORDS`** de `src/lib/prd-citations.ts`
   (e os `describe` correspondentes do teste): depois do recorte de escopo, nenhuma das três
   rastreia um critério de aceitação vivo — eram `src/` de produção importado só pelo próprio
   teste. `extractCitationContexts` e o contexto de ±1 linha **ficaram**: têm uso provado (aparecem
   no `AssertionError` do canário `§99.9`, Passo 4). Cabeçalhos §10.1 dos dois arquivos ajustados
   para não anunciarem mais "duas camadas".
4. **Removida a asserção vazia** `expect(c.context).not.toContain('linha anterior inexistente')`
   (passava por construção — string que não existe na fixture). Quem prova o caso é a asserção
   seguinte (`toHaveLength(2)`), que ficou.

O que muda de arquivo: `src/lib/prd-citations.ts` caiu de 149 para 133 linhas; o teste, de 252
para 206 e de 31 para 22 testes (removidos os 9 de `contentWords`/`relevanceScore`, 1 vacuidade a
menos). Os blocos abaixo que descreviam o estado de antes da correção foram atualizados para o
estado atual; onde isso mudaria um número já revisado independentemente (a lista de pontuações do
achado de calibração), mantive o bloco original **e** acrescentei a correção ao lado, sem apagar o
dado bruto que a revisão já verificou.

### Arquivos criados

- `src/lib/prd-citations.ts` (133 linhas, depois do ciclo 2) — `parseTableClauses`,
  `parseSectionClauses`, `extractCitationContexts`. Cabeçalho §10.1 (citando §10.3), TSDoc em toda
  função exportada, nenhum `any`. (`contentWords`/`relevanceScore`/`STOPWORDS` removidas no
  ciclo 2 — ver acima.)
- `tests/lib/citacoes-do-prd.test.ts` (206 linhas, 22 testes, depois do ciclo 2) — fixtures
  sintéticas para as três funções restantes e o invariante real de **existência** sobre `src/**` ×
  `PRD.md` × `docs/identidade-visual.md`.

### Passo 1 — `src/lib/prd-citations.ts` e `npx astro check`

**Bloco do ciclo 1, anterior às correções do ciclo 2** (mesma nota de fidelidade do Passo 7 sobre
bytes de escape ANSI de cor não sobreviverem à cópia). O despacho do ciclo 2 listou só três
comandos para esta rodada (`vitest` do arquivo, `lint`, `format:check`) e pediu para **não** rodar
a suíte inteira nem `build:pipeline`; não reroda `astro check` isoladamente por não estar nessa
lista — o `triage-runner` cobre isso a seguir. As mudanças do ciclo 2 (remover três funções e
corrigir uma citação em comentário) não alteram a forma nem a validade de tipo do módulo.

```
[2m20:49:26[22m [34m[content][39m Syncing content
[2m20:49:26[22m [34m[content][39m Synced content
[2m20:49:26[22m [34m[types][39m Generated [2m480ms[22m
[2m20:49:26[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (52 files): 
- 0 errors
- 0 warnings
- 0 hints
```

### Passo 2 — fixtures sintéticas (`npx vitest run tests/lib/citacoes-do-prd.test.ts --reporter=verbose`)

**Ciclo 1 (histórico — bloco de 20:46, com 30 testes; o arquivo final do ciclo 1 tinha 31, porque a fixture de `contentWords` para texto sem nenhuma letra foi acrescentada depois desta captura e antes do `test:coverage` das 20:49, que fechou em 267. Incluía `contentWords`/`relevanceScore`, removidas no ciclo 2;
a contagem no `test:coverage` do ciclo 1 chegou a 267 no total do projeto):** preservado para quem
for conferir a medição original citada pela revisão; não descreve o arquivo de hoje.

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/citacoes-do-prd.test.ts > contentWords > extrai palavras de conteúdo, minúsculas e sem acento 1ms
 ✓ tests/lib/citacoes-do-prd.test.ts > contentWords > ignora palavras com menos de 4 letras 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > contentWords > ignora as palavras vazias do domínio 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > contentWords > devolve conjunto vazio para texto sem palavra de conteúdo 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > relevanceScore > é 0 quando o comentário não tem palavra de conteúdo 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > relevanceScore > é 1 quando toda palavra do comentário aparece na cláusula 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > relevanceScore > é a fração de palavras do comentário achadas na cláusula 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > relevanceScore > é 0 quando não há palavra alguma em comum 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > lê linha de tabela simples 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > lê linha de tabela com ID em negrito 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > lê item de lista (formato dos Não-Objetivos) 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > distingue RNF, RN e R apesar do prefixo compartilhado 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > ignora linha que não é tabela nem item de Não-Objetivo 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > mapeia heading de nível 2 (## N.) para §N 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > mapeia heading de nível 3 (### N.N) para §N.N 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > heading sem numeral não abre seção própria: fica no corpo da seção numerada em que está 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > corpo de uma seção não inclui o texto de outra seção 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > §6 e §6.1 são chaves distintas 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > inclui a linha anterior e a seguinte do mesmo bloco `/** */` 1ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > citação na primeira linha do bloco não tem "linha anterior" 1ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > agrupa `//` standalone consecutivos no mesmo bloco 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > `//` de fim de linha (trecho com código antes) não herda contexto do vizinho 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > extrai citação de comentário HTML 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > extrai §N e §N.N como citações distintas 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > não confunde RNF/RN/R quando aparecem juntos 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > duas citações na mesma linha compartilham o mesmo contexto 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > texto sem comentário não produz citação, mesmo citando um ID 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > varreu 236 citações em src/ (contagem > 0) 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > toda citação de identificador (RF/RN/RNF/F/M/D/NG/A/R-NN) existe no PRD 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > toda citação de seção (§N/§N.N) existe no PRD ou na identidade visual 0ms

 Test Files  1 passed (1)
      Tests  30 passed (30)
   Start at  20:46:46
   Duration  215ms (transform 39ms, setup 0ms, import 64ms, tests 7ms, environment 0ms)
```

**Ciclo 2 (estado atual, depois de remover `contentWords`/`relevanceScore`/`STOPWORDS` e a
asserção vazia — 22 testes):**

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > lê linha de tabela simples 1ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > lê linha de tabela com ID em negrito 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > lê item de lista (formato dos Não-Objetivos) 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > distingue RNF, RN e R apesar do prefixo compartilhado 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseTableClauses > ignora linha que não é tabela nem item de Não-Objetivo 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > mapeia heading de nível 2 (## N.) para §N 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > mapeia heading de nível 3 (### N.N) para §N.N 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > heading sem numeral não abre seção própria: fica no corpo da seção numerada em que está 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > corpo de uma seção não inclui o texto de outra seção 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > parseSectionClauses > §6 e §6.1 são chaves distintas 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > inclui a linha anterior e a seguinte do mesmo bloco `/** */` 1ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > citação na primeira linha do bloco não tem "linha anterior" 1ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > agrupa `//` standalone consecutivos no mesmo bloco 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > `//` de fim de linha (trecho com código antes) não herda contexto do vizinho 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > extrai citação de comentário HTML 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > extrai §N e §N.N como citações distintas 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > não confunde RNF/RN/R quando aparecem juntos 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > duas citações na mesma linha compartilham o mesmo contexto 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > extractCitationContexts > texto sem comentário não produz citação, mesmo citando um ID 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > varreu 236 citações em src/ (contagem > 0) 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > toda citação de identificador (RF/RN/RNF/F/M/D/NG/A/R-NN) existe no PRD 0ms
 ✓ tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > toda citação de seção (§N/§N.N) existe no PRD ou na identidade visual 0ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  21:16:04
   Duration  215ms (transform 42ms, setup 0ms, import 66ms, tests 6ms, environment 0ms)
```

A contagem de citações reais varridas continua **236** — a remoção das três funções não mudou
`extractCitationContexts` nem a varredura de `src/`.

### Passo 3 — invariante real: existência (mesma rodada acima)

O teste `varreu 236 citações em src/ (contagem > 0)` e as duas asserções de existência
(identificador e seção) passaram — **zero citações inexistentes** em `src/**` hoje, sobre `PRD.md`
e `docs/identidade-visual.md`.

### Passo 4 — canário de existência (`§99.9`)

Injetado em `src/lib/date.ts:26`, trocando `§8.3` por `§99.9` (arquivo já lido nesta sessão,
commitado — revertido com `git checkout --`).

**Vermelho**, nomeando arquivo e linha:

```
 × tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > toda citação de seção (§N/§N.N) existe no PRD ou na identidade visual 5ms
   → expected [ { id: '§99.9', line: 26, …(2) } ] to deeply equal []

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/lib/citacoes-do-prd.test.ts > invariante real: toda citação de src/ existe na fonte declarada > toda citação de seção (§N/§N.N) existe no PRD ou na identidade visual
AssertionError: expected [ { id: '§99.9', line: 26, …(2) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "context": "/**
+  * Formata uma data no padrão pt-BR (`dd/mm/aaaa`, §99.9 do PRD).
+  *",
+     "file": "\\src\\lib\\date.ts",
+     "id": "§99.9",
+     "line": 26,
+   },
+ ]

 ❯ tests/lib/citacoes-do-prd.test.ts:246:21
    244|       .filter((c) => c.id.startsWith('§'))
    245|       .filter((c) => !sectionsPrd.has(c.id) && !sectionsIdentidade.has…
    246|     expect(missing).toEqual([]);
       |                     ^
    247|   });
    248| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 29 passed (30)
   Start at  20:47:17
   Duration  224ms (transform 39ms, setup 0ms, import 67ms, tests 13ms, environment 0ms)
```

Revertido com `git checkout -- src/lib/date.ts`. `git status --short` voltou a mostrar só os dois
arquivos novos deste plano. **Verde de volta:**

```
 Test Files  1 passed (1)
      Tests  30 passed (30)
```

### Passo 5 — canário de pertinência (`F-08` no lugar de `§6.5`, o defeito do 048)

**Este canário não é um teste automatizado do arquivo entregue** — ele mediu `relevanceScore`
diretamente, com um script de sonda descartável (`tests/lib/__probe.test.ts`, criado, usado e
apagado no ciclo 1; não fez parte da entrega). `relevanceScore` em si foi removida do arquivo no
ciclo 2 (obrigatório 4 da revisão), por não rastrear nenhum critério de aceitação vivo — a medição
abaixo é histórica, e é o que sustenta o achado registrado em "Escopo reduzido". Motivo de não
virar portão: ver a seção seguinte.

Citação real, hoje, em `src/components/CourseResources.astro:9`
(`... ao menos um item (§6.5 da identidade: "Toda seção exceto Aulas some quando vazia") ...`):

```
score vs identidade §6.5: 0.5714285714285714
```

Depois de trocar, só nessa linha, `§6.5` por `F-08` (reproduzindo o defeito do 048) e reverter com
`git checkout -- src/components/CourseResources.astro`:

```
citations at line 9: [
  {
    "id": "F-08",
    "line": 9,
    "context": " *                 visual, RF-24). Cada seção só aparece se o array\n *                 correspondente tiver ao menos um item (F-08 da identidade:\n *                 \"Toda seção exceto Aulas some quando vazia\"); nenhuma"
  }
]
score vs PRD F-08: 0
```

A pontuação cai de **0.571 para 0** — uma queda real e grande. **Mas** o teste **entregue**
(`tests/lib/citacoes-do-prd.test.ts`, que só verifica existência) continua **verde** com a citação
trocada, porque `F-08` existe no PRD. Isto foi medido no ciclo 1 (30 testes, antes da remoção das
três funções); no arquivo de hoje seriam 22, mas a conclusão é a mesma — nenhum dos 22 testes
restantes verifica pertinência:

```
 Test Files  1 passed (1)
      Tests  30 passed (30)
```

Ou seja: a queda de pontuação é real, mas **não há portão automático que a use** — ver abaixo.

### Pertinência: achado de calibração e por que fiquei bloqueado

Rodei `relevanceScore` sobre as 236 citações reais de `src/` (script de calibração descartável,
não entregue) contra a cláusula declarada de cada uma. **32 das 236 (13,6%) pontuam exatamente
`0`** — não "baixo", **zero** —, incluindo citações que não são o defeito que este plano persegue
e que preexistem a ele. Exemplo mais claro: `RN-01` ("Conteúdo com `publicado = false` não aparece
em nenhuma página pública, sitemap ou feed") é citado várias vezes como **"rascunho"**
(`src/lib/research.ts:8`, `src/lib/published.ts:6/37`, `src/pages/index.astro:10/42`,
`src/pages/ensino.astro:11`) — palavra que **não aparece na cláusula de `RN-01`** (que fala em
`publicado`, `página`, `sitemap`), só em linhas de outros IDs (`D-04`, `RF-10`). Isso não é bug de
extração: é a forma natural como o código descreve a regra, e a cláusula do PRD nunca usa essa
palavra.

**A consequência é dura: `components/ProjectCard.astro:10` cita `F-08` hoje, de forma
aparentemente legítima ("cada item só aparece se houver dado"), e pontua exatamente `0` — o
**mesmo valor** que o canário do 048 (a citação **errada**) produz no mesmo arquivo/vizinhança.**
Nenhum limiar escalar consegue aceitar um e reprovar o outro, porque os dois têm pontuação
idêntica. Uma lista completa, da pior à melhor, está abaixo (formato `pontuação  arquivo:linha
id`). **É a medição do ciclo 1, byte a byte, reproduzida de forma independente pela revisão — não
altero um dígito dela mesmo depois de corrigir o defeito que ela mesma achou** (`lib/prd-citations.ts:5`
ainda aparece citando `§10.4`, o valor medido antes da correção do obrigatório 1; o código já cita
`§10.3`):

```
0.000  /components/ProjectCard.astro:10  F-08
0.000  /components/SiteFooter.astro:20  §8.3
0.000  /components/SiteHeader.astro:8  RNF-02
0.000  /components/SiteHeader.astro:125  RNF-02
0.000  /content.config.ts:39  NG-01
0.000  /content.config.ts:47  RN-07
0.000  /content.config.ts:186  RN-09
0.000  /content.config.ts:217  RN-09
0.000  /content.config.ts:348  RN-09
0.000  /content.config.ts:387  RN-07
0.000  /content.config.ts:387  RN-09
0.000  /content.config.ts:431  NG-01
0.000  /i18n/pt.ts:25  RN-06
0.000  /i18n/pt.ts:38  §10.4
0.000  /lib/config.ts:56  D-03
0.000  /lib/config.ts:56  RN-09
0.000  /lib/courses.ts:7  RN-03
0.000  /lib/courses.ts:98  RN-03
0.000  /lib/courses.ts:189  §6.5
0.000  /lib/courses.ts:193  §6.5
0.000  /lib/prd-citations.ts:5  §10.4
0.000  /lib/published.ts:6  RN-01
0.000  /lib/published.ts:48  F-09
0.000  /lib/published.ts:37  RN-01
0.000  /lib/research.ts:8  RN-01
0.000  /lib/research.ts:59  RF-09
0.000  /lib/research.ts:59  RF-22
0.000  /lib/research.ts:126  RN-01
0.000  /pages/ensino/[slug].astro:6  RN-04
0.000  /pages/ensino.astro:11  RN-01
0.000  /pages/index.astro:10  RN-01
0.000  /pages/index.astro:42  RN-01
0.042  /content.config.ts:330  RNF-09
0.050  /content.config.ts:333  F-13
0.053  /content.config.ts:390  RN-07
0.063  /components/ExternalLink.astro:6  §8.3
0.067  /components/ProjectCard.astro:25  RN-01
0.071  /lib/publications.ts:6  RN-02
0.077  /components/PageHeader.astro:9  RF-32
0.077  /lib/publications.ts:29  RN-02
0.083  /content.config.ts:330  F-09
0.083  /content.config.ts:361  RN-01
0.083  /content.config.ts:403  F-09
0.083  /lib/config.ts:7  §10.4
0.091  /content.config.ts:120  RN-07
0.091  /pages/sobre.astro:10  F-08
0.100  /content.config.ts:134  RN-06
0.100  /content.config.ts:134  RN-09
0.100  /content.config.ts:158  RN-01
0.105  /pages/sobre.astro:180  F-08
0.111  /content.config.ts:220  RN-07
0.111  /content.config.ts:257  RN-01
0.111  /lib/publications.ts:50  RN-01
0.111  /lib/publications.ts:54  RF-25
0.111  /pages/sobre.astro:179  §6.2
0.111  /pages/sobre.astro:53  RF-21
0.125  /components/ProjectCard.astro:39  RN-01
0.125  /content.config.ts:42  RN-06
0.125  /content.config.ts:42  RN-09
0.125  /content.config.ts:93  F-09
0.125  /lib/courses.ts:42  RN-08
0.125  /pages/ensino/[slug].astro:29  RF-37
0.125  /pages/pesquisa.astro:12  RN-01
0.125  /pages/pesquisa.astro:53  RN-01
0.143  /components/SiteFooter.astro:106  §4
0.143  /layouts/BaseLayout.astro:8  §8.3
0.143  /lib/published.ts:25  RN-01
0.154  /components/CourseResources.astro:51  §5.5
0.167  /lib/navigation.ts:43  §5.1
0.167  /pages/ensino/[slug].astro:6  RF-24
0.167  /pages/ensino/[slug].astro:6  F-06
0.167  /pages/ensino/[slug].astro:11  RN-01
0.176  /content.config.ts:430  §6.1
0.182  /components/CourseResources.astro:40  §10.2
0.182  /pages/index.astro:11  F-08
0.188  /content.config.ts:7  D-06
0.188  /lib/publications.ts:34  RN-02
0.188  /pages/ensino.astro:130  §6.4
0.190  /content.config.ts:334  D-07
(mais 146 citações entre 0.200 e 1.000 — distribuição completa no relatório do plano; a mediana
fica acima de 0.35 e a pontuação máxima é 1.000, ex.: content.config.ts:156 §7.3)
```

**Total: 32/236 (13,6%) em exatamente `0`. Correção do ciclo 2: pelo menos um deles era defeito
real, não ruído** — eu tinha escrito que `lib/prd-citations.ts:5` "é autorreferente e não precisa
de decisão... não é uma regra de negócio disputada". Estava errado: esse zero é o **obrigatório 1**
apontado pela revisão — o cabeçalho citava `§10.4` (Convenções Gerais) para uma regra que está no
`§10.3` (Comentários no Código), e ainda entre aspas uma frase que não é do PRD, mas do
`plans/fase-3-site-publico/README.md`. Já corrigido no código (agora cita `§10.3` corretamente,
sem aspas). O achado fica **mais forte**, não mais fraco: dos 32 zeros, ao menos 1 confirmadamente
era citação errada, achada pelo próprio método de medição, dentro do arquivo que o implementa —
evidência de que a pontuação zero pega defeito de verdade, e não é só ruído de vocabulário.

Os outros 31 (e o próprio `ProjectCard.astro:10`, citado acima) não foram corrigidos nem
investigados individualmente — decidir quais são defeito real (como os três já fixados em
043/046/048, e agora este quarto) e quais são só uma lacuna de vocabulário entre o jargão do código
("rascunho") e o texto do PRD ("`publicado = false`") é, pelo próprio texto do plano, **decisão do
stakeholder, não minha** ("pode ser defeito real... ou falso positivo... Essa decisão é minha, não
sua").

**Por que não resolvi sozinho:**

1. **Ampliar o contexto não ajuda** — testei manualmente: mesmo o parágrafo inteiro do cabeçalho
   de `research.ts` (5 linhas) não compartilha nenhuma palavra com a cláusula de `RN-01`. O
   problema é vocabulário ausente, não janela pequena.
2. **Um limiar > 0 reprova ~14% das citações de hoje** — viola o critério "zero falsos positivos".
3. **Um limiar = 0 não reprova canário algum** (`score >= 0` é sempre verdadeiro) — o portão fica
   inútil, o que o passo 5 confirma na prática (suíte entregue continua verde com `F-08` no lugar
   de `§6.5`).
4. **Um dicionário de sinônimos de domínio** (ex.: tratar "rascunho" como equivalente a
   "publicado" para `RN-01`) resolveria este caso específico, mas exigiria eu julgar, cláusula por
   cláusula, quais sinônimos são seguros — o mesmo julgamento do item acima, e mais complexidade
   do que o plano pede ("compare palavras de conteúdo... sem acento", sem menção a sinônimo).
5. **Uma lista de exceções (baseline)** suprimiria os 32 atuais e pegaria só citação **nova**
   abaixo do limiar — tecnicamente viável, mas construí-la exige decidir, um a um, que os 32 são
   legítimos, incluindo `ProjectCard.astro:10` (que, olhando o código, não fala de imagem/foto
   nenhuma — pode ser o quarto defeito real desta série, ainda não achado por revisão humana).

### Critérios de aceitação (lista no topo do plano) — nota do ciclo 2

**Esta subseção do ciclo 1 (a explicação item a item dos 8 critérios originais) foi superada** pela
seção "Escopo reduzido em 2026-09-18" que o orquestrador escreveu depois do meu relatório, e pela
lista de critérios que ele reescreveu no topo do plano (6 itens, todos `[x]`) — mantê-la como
estava duplicaria e contradiria a explicação vigente. Registro aqui só o que muda por causa das
correções deste ciclo, nos itens que a lista atual do topo já marca:

- **`src/lib/prd-citations.ts` com 149 linhas, abaixo do alvo do §10.4** (critério do topo) — depois
  da remoção de `contentWords`/`relevanceScore`/`STOPWORDS` (obrigatório 4), o arquivo caiu para
  **133 linhas**. Ainda abaixo do alvo; o critério continua `[x]`.
- **Cabeçalho §10.1 e TSDoc nos dois arquivos; nenhum `any`** — o cabeçalho de
  `src/lib/prd-citations.ts` cita `§10.3` agora, não mais `§10.4` (obrigatório 1); o de
  `tests/lib/citacoes-do-prd.test.ts` não anuncia mais "duas camadas" (obrigatório 4). Continua `[x]`.
- **`astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes** — `lint` e
  `format:check` reconferidos neste ciclo (Passo 7, "Ciclo 2"). `astro check`, `test:coverage` e
  `build:pipeline` **não foram rerodados neste ciclo** por instrução explícita do despacho de
  correção ("não rode a suíte inteira nem `build:pipeline` — eu disparo o `triage-runner` depois");
  os números de `test:coverage` no Passo 7 são do ciclo 1 (267 testes, antes de remover 9 deles) e
  não descrevem mais o arquivo de hoje (22 testes no arquivo deste plano). O `triage-runner` mede o
  número atual.

### Passo 7 — portão de qualidade

**Ciclo 1 — `npx eslint .`, `npx prettier --check .` e `npx vitest run --coverage` (histórico,
anterior às correções do ciclo 2 — não reconferidos aqui porque o despacho de correção pediu para
não rodar a suíte inteira nem `build:pipeline` neste ciclo; o Ciclo 2 abaixo reconfere lint e
format sobre o repositório inteiro já com as correções):**

`npx eslint .` → exit 0 (sem saída).

`npx prettier --check .`:
```
Checking formatting...
All matched files use Prettier code style!
```

`npx vitest run --coverage`:
```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  15 passed (15)
      Tests  267 passed (267)
   Start at  20:49:13
   Duration  1.59s (transform 3.77s, setup 0ms, import 6.63s, tests 270ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.18 |     100 |     100 |                   
 src/lib           |     100 |    99.15 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 259/259 )
Branches     : 99.18% ( 121/122 )
Functions    : 100% ( 69/69 )
Lines        : 100% ( 231/231 )
================================================================================
```

(`navigation.ts:51` não coberto é preexistente, não tocado por este plano.
`src/lib/prd-citations.ts` não aparece na lista de não cobertos: 100% em tudo.)

`npm run build:pipeline` (nota de fidelidade: os bytes de escape ANSI de cor não sobrevivem à
cópia por esta ferramenta de edição de texto; todo caractere **visível** — `✓`, `├─`, `│`, os
carimbos de hora, a caixa do Tina — é o mesmo do arquivo `.txt` capturado, conferido por `diff`):
```
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  20:49:43
   Duration  1.17s (transform 1.84s, setup 0ms, import 3.04s, tests 68ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m20:50:12[22m [34m[content][39m Syncing content
[2m20:50:12[22m [34m[content][39m Synced content
[2m20:50:12[22m [34m[types][39m Generated [2m515ms[22m
[2m20:50:12[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (52 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m20:50:19[22m [34m[content][39m Syncing content
[2m20:50:19[22m [34m[content][39m Synced content
[2m20:50:19[22m [34m[types][39m Generated [2m482ms[22m
[2m20:50:19[22m [34m[build][39m output: [34m"static"[39m
[2m20:50:19[22m [34m[build][39m mode: [34m"static"[39m
[2m20:50:19[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m20:50:19[22m [34m[build][39m Collecting build info...
[2m20:50:19[22m [34m[build][39m [32m✓ Completed in 522ms.[39m
[2m20:50:19[22m [34m[build][39m Building static entrypoints...
[2m20:50:20[22m [34m[vite][39m [32m✓ built in 336ms[39m
[2m20:50:20[22m [34m[vite][39m [32m✓ built in 60ms[39m
[2m20:50:20[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m20:50:20[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+12ms)[22m 
[2m20:50:20[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+3ms)[22m 
[2m20:50:20[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+5ms)[22m 
[2m20:50:20[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+5ms)[22m 
[2m20:50:20[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+4ms)[22m 
[2m20:50:20[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m20:50:20[22m [32m✓ Completed in 58ms.
[39m
[2m20:50:20[22m [34m[build][39m [32m✓ Completed in 505ms.[39m
[2m20:50:20[22m [34m[build][39m 6 page(s) built in [1m1.04s[22m
[2m20:50:20[22m [34m[build][39m [1mComplete![22m
```

**Ciclo 2 — `npm run lint` e `npm run format:check` (rodados hoje, depois das correções, sobre o
repositório inteiro; nem `test:coverage` nem `build:pipeline` foram rerodados, por instrução do
despacho de correção):**

`npm run lint`:
```
> haroldo-page@0.1.0 lint
> eslint .
```
(exit 0, sem saída de erro.)

`npm run format:check`:
```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### `git status --short` ao final

```
?? src/lib/prd-citations.ts
?? tests/lib/citacoes-do-prd.test.ts
```

Nenhum arquivo de `content/` ou schema tocado; os dois canários (passos 4 e 5) foram revertidos
com `git checkout --` e confirmados por este `git status` limpo, rodado depois da reversão.

### O que NÃO rodei

- **Navegador.** Este plano não tem passo de navegador (confirmado no despacho e no corpo do
  plano) — não se aplica.
- **`npm ci` e `npm audit`.** Não mudei `package.json` nem `package-lock.json`; são parte da
  verificação autoritativa do `triage-runner`, não deste executor.
- **CI do GitHub Actions / Workers Builds.** Nada foi commitado ou empurrado; `Status` continua
  `TODO` por instrução do despacho.
- **A decisão sobre o limiar de pertinência e sobre os 32 candidatos a falso positivo/defeito
  real.** Reservada ao stakeholder pelo próprio texto do plano.
- **No ciclo 2 (correção da revisão): `astro check`, `npm run test:coverage` e
  `npm run build:pipeline`.** O despacho de correção pediu explicitamente só três comandos
  (`npx vitest run tests/lib/citacoes-do-prd.test.ts`, `npm run lint`, `npm run format:check`) e
  para não rodar a suíte inteira nem `build:pipeline` — "eu disparo o `triage-runner` depois". Os
  números de cobertura e de `build:pipeline` colados no Passo 7 são do ciclo 1, anteriores à
  remoção de `contentWords`/`relevanceScore`/`STOPWORDS`; não afirmo que continuam exatos hoje.

### Verificação autoritativa independente — ciclo 2 (`triage-runner`, 2026-09-18 21:22–21:27)

Inserida pelo **orquestrador** depois do último ciclo do executor, lida dos arquivos capturados em
`scratchpad/triage054c2/`. **É esta a execução que vale para o portão** — a do Passo 7, acima, é do
ciclo 1 e descreve um `src/` que não existe mais (tinha `relevanceScore`, `contentWords` e
`STOPWORDS`). Os números mudaram com a remoção: **258 testes** (eram 267, saíram os 9 dos dois
`describe` removidos) e branches em **99,12%** (eram 99,18%).

**`npm run lint`** — exit 0 (`lint.txt`):

```
﻿
> haroldo-page@0.1.0 lint
> eslint .
```

**`npm run format:check`** — exit 0 (`format.txt`):

```
﻿
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

**`npm run test:coverage`** — exit 0 (`coverage.txt`):

```
﻿
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  15 passed (15)
      Tests  258 passed (258)
   Start at  21:25:37
   Duration  1.56s (transform 3.96s, setup 0ms, import 6.50s, tests 263ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.12 |     100 |     100 |                   
 src/lib           |     100 |    99.09 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 245/245 )
Branches     : 99.12% ( 113/114 )
Functions    : 100% ( 66/66 )
Lines        : 100% ( 221/221 )
================================================================================
```

**`npm run build:pipeline`** — exit 0 (`build.txt`):

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  21:25:47
   Duration  1.13s (transform 1.80s, setup 0ms, import 2.95s, tests 65ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
21:26:15 [content] Syncing content
21:26:15 [content] Synced content
21:26:15 [types] Generated 482ms
21:26:15 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (52 files): 
- 0 errors
- 0 warnings
- 0 hints

21:26:22 [content] Syncing content
21:26:22 [content] Synced content
21:26:22 [types] Generated 533ms
21:26:22 [build] output: "static"
21:26:22 [build] mode: "static"
21:26:22 [build] directory: S:\Projetos\academic_page\haroldo\dist\
21:26:22 [build] Collecting build info...
21:26:22 [build] ✓ Completed in 574ms.
21:26:22 [build] Building static entrypoints...
21:26:23 [vite] ✓ built in 375ms
21:26:23 [vite] ✓ built in 63ms
21:26:23 [build] Rearranging server assets...

 generating static routes 
21:26:23   ├─ /ensino/2025-1-mecanica-classica/index.html (+13ms) 
21:26:23   ├─ /ensino/2026-2-relatividade-geral/index.html (+5ms) 
21:26:23   ├─ /ensino/index.html (+4ms) 
21:26:23   ├─ /pesquisa/index.html (+5ms) 
21:26:23   ├─ /sobre/index.html (+4ms) 
21:26:23   ├─ /index.html (+4ms) 
21:26:23 ✓ Completed in 62ms.

21:26:23 [build] ✓ Completed in 551ms.
21:26:23 [build] 6 page(s) built in 1.15s
21:26:23 [build] Complete!

FullName                                          Length LastWriteTime      
--------                                          ------ -------------      
S:\Projetos\academic_page\haroldo\dist\index.html   9894 18/09/2026 21:26:23
```

**`npm audit --audit-level=high`** — exit 0 (`audit.txt`):

```
﻿# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

8 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

### CI e Workers Builds sobre o commit empurrado

Commit de trabalho `23a003dc22cc5c3161f477dce54bfc03f953cb20` (`23a003d`), empurrado para a `main`
em 2026-09-18.

```
$ gh api .../commits/23a003dc.../check-runs
Workers Builds: haroldo-page | completed | success
qualidade | completed | success

$ gh run list --commit 23a003dc...
35410116740 | CI | completed | success
```

CI `qualidade` (run 35410116740) e o build de deploy da Cloudflare, os dois `success`.

### Defeito no `verificar-promocao.mjs`, achado e corrigido na própria promoção

O conferidor criado nesta sessão acusou `PRD.md` como não tocado no commit de promoção deste plano,
com o arquivo **de fato** modificado. Causa: o helper `git()` aplicava `.trim()` na saída inteira do
`git status --porcelain`, removendo o espaço inicial da **primeira** linha (` M PRD.md`); com isso o
`slice(3)` comia uma letra a mais e `PRD.md` virava `RD.md`. Só a primeira entrada da lista se
corrompia, e foi por isso que a matriz de canários não pegou — nenhum canário tinha promoção em curso.

**Correção:** `git()` passa a aparar só o fim (`replace(/\s+$/, "")`), e o parser extrai o caminho por
regex (`/^..\s+/`) em vez de posição fixa, tratando também rename (`antigo -> novo`) e caminho entre
aspas. **Provado nos dois sentidos:** com `PRD.md` tocado o aviso não aparece; escondendo-o com
`git stash push PRD.md` o aviso volta; com `git stash pop` ele some de novo.
