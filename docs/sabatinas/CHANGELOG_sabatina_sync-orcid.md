# Sabatina — Sincronização das publicações com o ORCID

Pedido do stakeholder em 2026-10-09: um workflow do GitHub Actions que cadastra no site as
publicações do ORCID do professor (`0000-0002-3702-7683`) pela API pública, adaptando o sync já
feito no repositório `lafim` (`scripts/sync-orcid.ts`, `scripts/orcid-lib.ts`,
`.github/workflows/orcid.yml`).

Levantamento feito antes das perguntas (API pública do ORCID e da Crossref, 2026-10-09):

- o ORCID tem 28 registros, todos `journal-article`; 4 são cópias de preprint vindas do Web of
  Science, sem DOI e sem id do arXiv; 1 tem DOI digitado errado (`10.1142/SO21827182041014X`, letra
  O no lugar do zero), que a Crossref devolve 404; restam 23 trabalhos únicos com DOI;
- o site só tem as 6 publicações `[EXEMPLO]` da fase 1;
- a Crossref grava o professor como `given: "Haroldo C. D."`, `family: "Lima"`, com o ORCID dele no
  autor; o destaque do site (`isProfessorAuthor`) compara com `LIMA JUNIOR, HAROLDO C. D.` e
  `LIMA, HAROLDO C.D.` (`src/lib/config.ts`);
- publicações não têm título em inglês (RN-07): o sync escreve um arquivo só, sem a cópia `en/` do
  lafim.

## Decisão 1 — A importação do ORCID entra no escopo

**Data:** 2026-10-09
**Questão:** o PRD declara a importação automática fora do MVP (NG-03, RF-17 WONT, §6.3 "v2").
**Decisão:** entra, fora de fase, como a Extensão: RF-17 passa de WONT a SHOULD, restrito ao ORCID
(com a Crossref para autores, veículo e data). OpenAlex, BibTeX e a exportação BibTeX continuam na v2.
**Justificativa:** pedido explícito do stakeholder; a solução já existe e foi validada no `lafim`.
**Impacto no PRD:** NG-03 reescrito; RF-17 WONT → SHOULD com critério de aceite; linha do §6.3
reduzida a OpenAlex/BibTeX.

## Decisão 2 — A primeira execução importa tudo

**Data:** 2026-10-09
**Questão:** na primeira execução, o sync importa os 23 trabalhos que já estão no ORCID ou só os
marca como vistos, como no lafim?
**Decisão:** importa todos. As execuções seguintes só trazem DOIs ainda não vistos.
**Justificativa:** o site não tem publicação real; marcar como vistos deixaria a página vazia e a
carga inicial seria manual. Descartados: "só marca como vistos" (o comportamento do lafim, que tinha
conteúdo cadastrado) e "a partir de um ano de corte" (sem motivo para esconder a produção anterior).
**Impacto no PRD:** critério de aceite do RF-17.

## Decisão 3 — Importadas entram publicadas

**Data:** 2026-10-09
**Questão:** a publicação importada entra com `publicado: true` ou como rascunho (`false`)?
**Decisão:** `publicado: true`. Para tirar uma do ar, o professor desliga o interruptor no painel; o
sync nunca altera arquivo existente, então ela não volta a aparecer.
**Justificativa:** o ORCID é cadastrado pelo próprio professor, então o dado chega curado. Rascunho
deixaria a página vazia até o convite do EDITOR (fase 5) e tornaria cada artigo novo dependente de um
clique. Descartados: "tudo em rascunho" e "carga inicial publicada, novas em rascunho" (mesmo
problema para os novos).
**Impacto no PRD:** critério de aceite do RF-17.

## Decisão 4 — Autores como a Crossref os grava

**Data:** 2026-10-09
**Questão:** em que formato o sync grava os autores vindos da Crossref?
**Decisão:** `Sobrenome, Prenome` exatamente como a Crossref divide `family` e `given`, sem mudar a
caixa (`Macedo, Caio F. B.`); sem `given`, só o sobrenome; autoria institucional, o `name`. Espaços
especiais (a Crossref manda ` ` entre iniciais) viram espaço simples. O professor, reconhecido
pelo ORCID no registro do autor, sempre recebe a primeira grafia de `citationNames`
(`LIMA JUNIOR, HAROLDO C. D.`), a que o site destaca.
**Justificativa:** escolha do stakeholder; é a forma mais fiel ao artigo e dispensa a lista de grafias
fixas do lafim (`data/grafias-autores.json`), que existia para uniformizar o ABNT abreviado.
Descartados: ABNT abreviado (`MACEDO, C. F. B.`, o do lafim) e ordem natural (`C. F. B. Macedo`, que
obrigaria a trocar `citationNames`).
**Impacto no PRD:** critério de aceite do RF-17.

## Decisão 5 — Registro sem DOI é ignorado

**Data:** 2026-10-09
**Questão:** o que fazer com registro do ORCID sem DOI (hoje 4, cópias de preprint vindas do Web of
Science, sem id do arXiv)?
**Decisão:** ignorar, com aviso no log da execução. Preprint sem DOI se cadastra pelo painel.
**Justificativa:** sem DOI não há Crossref, então não há autores, e o schema exige ao menos um; os 4 de
hoje duplicariam artigos que entram pelo DOI. Descartado: importar como `preprint` quando o título não
repetir.
**Impacto no PRD:** critério de aceite do RF-17.

## Decisão 6 — DOI que a Crossref não conhece vira "visto"

**Data:** 2026-10-09
**Questão:** o que fazer quando a Crossref responde 404 para um DOI (hoje `10.1142/SO21827182041014X`,
letra O no lugar do zero, duplicata do artigo de forças de maré em Hayward)?
**Decisão:** 404 marca o DOI como visto e deixa aviso no log. Falha de rede ou resposta 5xx adia o DOI
para a próxima execução, como no lafim.
**Justificativa:** 404 é permanente; repetir toda semana só gera ruído. Se o professor corrigir o DOI
no ORCID, o DOI corrigido é outro e entra normalmente. Descartados: tentar toda semana (o lafim) e
falhar o workflow (bloquearia o resto da importação).
**Impacto no PRD:** critério de aceite do RF-17.
**Nota de 2026-10-09 (revisão final do plano):** 404 da Crossref também acontece com DOI válido de
outra agência, como os preprints do arXiv e o Zenodo, que são da DataCite. A regra continua (vira
visto), mas o sync consulta `/works/{doi}/agency` e o aviso diz qual é o caso: DOI inexistente
(corrigir no ORCID) ou de outra agência (cadastrar pelo painel). Commit `bef594c`.

## Decisão 7 — As publicações de exemplo saem

**Data:** 2026-10-09
**Questão:** o que fazer com as 6 publicações `[EXEMPLO]` da fase 1 quando as reais entrarem?
**Decisão:** apagá-las na mesma entrega que traz a carga inicial.
**Justificativa:** cinco estão com `publicado: true` e se misturariam aos artigos reais. Descartados:
despublicar (sujaria a lista do painel) e manter.
**Impacto no PRD:** nenhum no texto dos RFs. Efeitos a tratar no plano: duas delas
(`2024-exemplo-desvios-…` e `2025-exemplo-sombras-…`) têm `linha_relacionada`, então a página Pesquisa
fica sem publicação ligada a uma linha até o professor ligar as reais pelo painel; e a varredura de
rascunho de `tests/dist/site-gerado.test.ts` perde o único rascunho de publicações (o de geodésicas
nulas). Conferir cada teste que lê `content/publicacoes/`.

## Decisão 8 — Execução semanal

**Data:** 2026-10-09
**Questão:** com que frequência o workflow consulta o ORCID?
**Decisão:** toda segunda-feira às 08:00 de São Luís (`0 11 * * 1` UTC), como no lafim, e também sob
demanda (`workflow_dispatch`).
**Justificativa:** artigo publicado não tem urgência de horas; fica uma hora antes do Vigia do deploy
(09:17), que confere o build do commit do sync. Descartados: diária (7× as execuções, quase todas
vazias) e mensal (até 30 dias de atraso).
**Impacto no PRD:** critério de aceite do RF-17.

## Decisão 9 — Sem busca do id do arXiv

**Data:** 2026-10-09
**Questão:** nem o ORCID nem a Crossref trazem o id do arXiv; o sync deve procurá-lo na API do arXiv?
**Decisão:** não. O campo `arxiv` fica vazio na importação; o professor o preenche pelo painel se
quiser.
**Justificativa:** mantém o sync em duas fontes; o DOI já dá um link por artigo. Descartado: busca por
título na API do arXiv (terceira API, limite de 1 requisição a cada 3 s, e título alterado entre
preprint e publicação fica sem link).
**Impacto no PRD:** nenhum além do critério do RF-17.

## Escolhas técnicas sem pergunta

Herdadas do lafim ou impostas pelo projeto. Ficam registradas para que o stakeholder possa contestar
alguma antes do plano.

- **Fontes:** ORCID `pub.orcid.org/v3.0/<id>/works` (pública, sem credencial) diz quais trabalhos
  existem; a Crossref (`api.crossref.org/works/<doi>`, com `mailto`) dá autores e veículo. O id do
  ORCID é lido de `links.orcid` em `content/perfil/index.md`, não fica fixo no script.
- **Campos gravados:** `publicado: true`, `titulo` (do ORCID, que vem limpo; a Crossref só na falta),
  `autores` (Decisão 4), `ano` (do ORCID; a Crossref na falta), `veiculo` (`container-title` da
  Crossref; `journal-title` do ORCID na falta), `tipo` e `doi`. Nada de `resumo` (a página não o
  mostra e a APS não o deposita na Crossref), `arxiv` (Decisão 9), `destaque`, `linha_relacionada`
  nem grupo `en` (título é factual, RN-07).
- **Tipo:** `journal-article` → `artigo`, `preprint` → `preprint`, `book-chapter` → `capítulo`,
  `book` → `livro`, `conference-paper` → `anais`, `dissertation-thesis` → `tese`, qualquer outro →
  `outro`. Hoje os 28 registros são `journal-article`.
- **Arquivo:** `content/publicacoes/{ano}-{slug(titulo)}.md`, o padrão do painel. Se o nome já existir
  com outro DOI, não sobrescreve: avisa no log.
- **Só acrescenta:** nunca altera nem apaga arquivo existente. `data/orcid-vistos.json` guarda os DOIs
  já vistos, de modo que publicação apagada ou despublicada no painel não volta. DOI já presente em
  algum arquivo de `content/publicacoes/` (em qualquer forma: puro, `doi:` ou URL) conta como visto.
- **Duplicatas dentro do ORCID:** o mesmo DOI em dois grupos entra uma vez.
- **Código:** as funções puras em `src/lib/orcid.ts`, cobertas pelo limiar de 80% do
  `test:coverage`; rede e disco num script fino em `scripts/`. Testes sem rede, com registros reais
  da Crossref como fixture.
- **Workflow `.github/workflows/orcid.yml`:** push feito com o `GITHUB_TOKEN` não dispara o `ci.yml`,
  então o próprio workflow roda `test:coverage` e `build:pipeline` (com os secrets do TinaCloud)
  **antes** do push; se falhar, nada é publicado e o GitHub manda e-mail. O Workers Builds publica a
  partir do push, como num salvamento do painel. Commit `docs: publicações novas do ORCID`, com a
  lista no corpo, assinado com o noreply do GitHub do desenvolvedor e sem trailer.
