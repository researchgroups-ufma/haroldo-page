# Sabatina — Página de disciplina no modelo D

Redesenho da página de disciplina (RF-24) a partir do protótipo D (`src/pages/ensino/prototipo-d.astro`,
sem commit), escolhido pelo stakeholder em 2026-10-07. O D é o protótipo B, "Caderno", com as seções
em abas horizontais acima do conteúdo, no lugar da coluna à esquerda. A disciplina abre com uma capa
(imagem, descrição, ementa e atalhos). Embaixo fica uma faixa de abas presa ao topo durante a
rolagem, com um sublinhado que desliza até a aba escolhida. O conteúdo vem em cartões: as aulas com o
número num quadrado escuro, as listas, os materiais e os links em grade de dois.

## Decisão 1 — Modelo D, com abas horizontais

**Data:** 2026-10-07
**Questão:** entre os protótipos A (Cronograma), B (Caderno) e C (Índice), qual vira a página?
**Decisão:** o B, com as abas numa faixa horizontal em vez da coluna à esquerda (protótipo D). A
faixa fica presa ao topo enquanto a página rola, e a troca de aba no meio da leitura põe o painel
novo logo abaixo dela. No celular, a faixa rola para o lado, com a borda direita esmaecida enquanto
houver abas fora da tela.
**Justificativa:** escolha do stakeholder. A faixa fixa, a correção do salto e o esmaecimento vieram
da conferência do D no Vivaldi em 2026-10-07: a lista de aulas é longa, e sem a faixa fixa as abas
sumiam.
**Impacto no PRD:** nenhum no texto do RF-24 (o critério de aceite continua valendo);
`docs/identidade-visual.md` §6.5 reescrita.

## Decisão 2 — "Última aula" só em disciplina em curso

**Data:** 2026-10-07
**Questão:** a capa do D tem um botão "Última aula" e destaca o cartão dessa aula. Isso vale para
qualquer disciplina ou só para as em curso? E qual aula é a "última"?
**Decisão:** só em disciplina **em curso**. Na encerrada, a capa não tem o botão e nenhum cartão é
destacado. A "última aula" é a **última cadastrada**, na ordem do professor (RN-04), a mesma regra do
cartão da listagem de Ensino.
**Justificativa:** escolha do stakeholder quanto ao "só em curso", coerente com a Decisão 8 da
sabatina "Ensino modelo A" (datas só em curso). A regra de qual aula é a última foi do orquestrador:
o protótipo usava "a última com data até hoje", mas `aulas[].data` é texto livre e não se compara
como data com segurança. Como a `url` da aula é obrigatória, a aula só entra no painel quando o
material existe, então a última cadastrada é a última dada.
**Impacto no PRD:** nenhum no texto do RF-24; `docs/identidade-visual.md` §6.5.

## Decisão 3 — Título da lista inteiro

**Data:** 2026-10-07
**Questão:** o protótipo divide "Lista 1 — Geometria diferencial" no travessão, com "Lista 1" em
destaque e o assunto embaixo. Na página real, isso fica?
**Decisão:** não. O cartão mostra o **título inteiro**, num campo só, como hoje.
**Justificativa:** escolha do stakeholder. Dividir no travessão dependeria de o professor digitar o
caractere certo, e um campo novo de assunto mudaria o Zod, o Tina e o lock por pouco ganho.
**Impacto no PRD:** nenhum (§7.3 sem mudança).

## Escolhas padrão do orquestrador (sujeitas a veto, não perguntadas)

- **Capa:** imagem da disciplina (`imagem`) à esquerda a partir de `sm`; sem imagem, o bloco `tinta`
  com a inicial do nome, como no cartão da listagem. A descrição e a ementa saem do lado do
  `PageHeader` e entram na capa.
- **Botões da capa:** "Última aula" (Decisão 2) e "Listas de exercícios", este só quando houver
  lista. Ele leva a `#listas`, que abre a aba. Rótulos já existentes: `teaching.latestLesson` ("Última
  aula" / "Latest lecture") e `course.problemSets`.
- **Cartões:** a aula leva o número no quadrado escuro, o título ↗, a descrição, a data (só em curso)
  e o atalho para o script. O cartão inteiro é clicável, pelo título estendido. Listas, materiais e
  links ficam em grade de dois a partir de `sm`, e a bibliografia continua numa lista numerada.
- **Movimento:** o número da aula gira de leve no hover, os cartões entram em cascata ao trocar de
  aba e o sublinhado desliza. Tudo isso some com `prefers-reduced-motion: reduce`.
- **Altura mínima dos painéis** de uma tela, com as abas ativas. Sem isso, a troca para uma aba curta
  recua a rolagem e a faixa desce para o meio da tela. Efeito aceito: em aba curta, sobra espaço
  vazio no fim da página.
- Sem JS, como hoje: as seções empilhadas com os títulos, sem faixa (RNF-02).
