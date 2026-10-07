# Sabatina — Página Pesquisa no modelo C

Redesenho da página Pesquisa (RF-22) a partir do protótipo C, "Ensaio com imagem fixa"
(`src/pages/extensao/prototipo-pesquisa-c.astro`, sem commit), escolhido pelo stakeholder em
2026-10-07 entre três protótipos. A partir de `lg`, a imagem da linha fica parada à esquerda e troca
enquanto o texto rola. Os projetos abrem a descrição sob o cursor. No celular, a imagem vai para o
topo de cada linha.

## Decisão 1 — Linha sem imagem

**Data:** 2026-10-07
**Questão:** `imagem` é opcional em `linhas-pesquisa`; o modelo C depende de uma imagem por linha.
**Decisão:** linha sem imagem mostra um bloco neutro na cor `tinta`, com o número grande da linha, no
lugar da imagem. O campo continua opcional.
**Justificativa:** mantém o layout e não mexe no schema. Tornar a imagem obrigatória exigiria mudar
o Tina, o Zod e os testes de paridade (ADR-0008). Ocupar a largura toda exigiria trocar o layout no
meio da rolagem.
**Impacto no PRD:** RF-22 (descrição da página); §7.3 sem mudança.

## Decisão 2 — Palavras-chave da linha

**Data:** 2026-10-07
**Questão:** o protótipo mostra palavras-chave por linha, mas `linhas-pesquisa` não tem esse campo.
**Decisão:** a página não mostra palavras-chave.
**Justificativa:** é o caminho mais rápido, sem mudar o schema. Um campo `palavras[]` exigiria mudar
o Tina, o Zod, os testes de paridade e o grupo `en`, por um elemento decorativo.
**Impacto no PRD:** nenhum (§7.3 sem mudança).

## Decisão 3 — Parágrafo de abertura

**Data:** 2026-10-07
**Questão:** o protótipo abre com um parágrafo-guia que não vem de nenhum campo.
**Decisão:** a página começa direto na primeira linha de pesquisa, sem parágrafo de abertura.
**Justificativa:** não muda o schema e não deixa texto de pesquisa no código. Um texto fixo no
dicionário só seria editável pelo desenvolvedor; um campo novo no perfil exigiria mudar o Tina, o
Zod e os testes.
**Impacto no PRD:** nenhum.

## Decisão 4 — Publicações por linha

**Data:** 2026-10-07
**Questão:** o protótipo lista as publicações de cada linha, mas `publicacoes` não tem ligação com
`linhas-pesquisa`.
**Decisão:** `publicacoes` ganha o campo `linha_relacionada` (referência a `linhas-pesquisa`,
opcional), editável no painel. A seção de cada linha lista as publicações ligadas a ela.
**Justificativa:** o stakeholder quer mostrar a produção de cada linha. Tirar a lista era o caminho
mais rápido, mas foi descartado. O campo segue o padrão que `projetos.linha_relacionada` já usa.
**Impacto no PRD:** §7.3 (`publicacoes` ganha `linha_relacionada`); RF-22.

## Decisão 5 — Uma linha por publicação

**Data:** 2026-10-07
**Questão:** uma publicação pode pertencer a mais de uma linha?
**Decisão:** não. `publicacoes.linha_relacionada` é uma referência única e opcional, como
`projetos.linha_relacionada`.
**Justificativa:** reaproveita no Tina, no Zod e no teste de paridade o padrão que os projetos já
usam. Uma lista de referências cobriria o artigo entre as duas linhas, mas seria um padrão novo.
**Impacto no PRD:** §7.3 (tipo do campo).

## Decisão 6 — Quais publicações aparecem na linha

**Data:** 2026-10-07
**Questão:** quantas publicações aparecem em cada linha, e o que acontece quando não há nenhuma?
**Decisão:** só as que o professor ligar à linha pelo `linha_relacionada`, todas elas. Linha sem
publicação ligada não mostra a seção, nem o título "Publicações". A ordem é do ano mais recente ao
mais antigo, e o título não é link (a página Publicações não tem âncora por artigo). Ordem e link
são o padrão adotado; o stakeholder só falou da seleção.
**Justificativa:** o stakeholder quer controlar a lista: aparecem só as publicações que ele escolher.
A seção vazia some para a página não ganhar rótulo órfão (mesma regra do RF-21).
**Impacto no PRD:** RF-22 (critério de aceite).

## Decisão 7 — Projetos sem linha

**Data:** 2026-10-07
**Questão:** projetos sem `linha_relacionada` vão para "Outros projetos". No modelo C, o que fica à
esquerda quando esse bloco está na tela?
**Decisão:** "Outros projetos" sai da grade de duas colunas e vira uma lista simples, em largura
toda, depois da última linha. A imagem fixa acaba antes dele. Sem projetos soltos, o bloco não
aparece.
**Justificativa:** com a imagem da última linha parada ao lado, pareceria que esses projetos são
daquela linha. Um bloco neutro faria "Outros projetos" parecer uma linha de pesquisa a mais.
**Impacto no PRD:** RF-22.

## Decisão 8 — Linha só com texto

**Data:** 2026-10-07
**Questão:** o professor precisa ligar projetos ou publicações a toda linha?
**Decisão:** não. Projetos e publicações são opcionais em cada linha. Linha sem projeto não mostra a
seção "Projetos"; linha sem publicação não mostra "Publicações" (Decisão 6). Uma linha só com
título, resumo e corpo (e imagem, se houver) é uma linha completa.
**Justificativa:** pedido do stakeholder, para o professor poder apresentar uma linha sem acrescentar
mais nada. A página atual já esconde o bloco de projetos vazio; o modelo C mantém isso.
**Impacto no PRD:** RF-22 (critério de aceite).

## Decisão 9 — Resumo e texto completo da linha

**Data:** 2026-10-07
**Questão:** a linha mostra dois parágrafos, `resumo` (cinza) e `corpo` (preto), que no conteúdo de
exemplo dizem quase o mesmo. Qual a diferença?
**Decisão:** os dois campos continuam. No painel, o `resumo` passa a ser descrito como a frase de
abertura em destaque, e o `corpo` como o desenvolvimento, opcional, que vem depois. O exemplo da
linha 1 é reescrito para o `corpo` continuar o `resumo` em vez de repeti-lo.
**Justificativa:** a separação vinha da listagem com botão "Texto completo", descartada no desenho
da fase 3; com os dois na mesma página, faltava dizer ao professor o papel de cada um. Fundir os dois
num campo só mudaria o schema, o painel, os testes e o conteúdo.
**Impacto no PRD:** nenhum (§7.3 sem mudança).

## Decisão 10 — "Outros projetos" no modelo das linhas (revê a Decisão 7)

**Data:** 2026-10-07
**Questão:** "Outros projetos" deve seguir o modelo das linhas, com imagem à esquerda?
**Decisão:** sim. "Outros projetos" passa a ser o último bloco da coluna de texto, com o próximo
número (com duas linhas, "03") no palco e no índice, e uma imagem fixa no código
(`/uploads/extensao-exemplo-4.jpg`). Do lado do texto, o número pequeno, o título "Outros projetos"
e a lista de projetos, sem a rubrica "Projetos". Some se não houver projeto solto.
**Justificativa:** pedido do stakeholder, para a página manter um padrão só. A imagem fixa foi a
escolha dele: o professor não troca essa imagem pelo painel. Um campo novo exigiria mudar o schema,
e o bloco neutro foi descartado. O número "03" mantém o índice uniforme, embora sugira uma terceira
linha.
**Impacto no PRD:** RF-22 (descrição).
