# Sabatina — Recorte do escopo: o que anda sem o professor

Decisão do stakeholder em 2026-09-12: **tudo que depende de interação com o professor vai para a
fase 5 (polimento e entrega); tudo que não depende dele é executado agora, até existir um site
navegável.** O motivo é de sequência, não de escopo — é preferível levar ao professor um site
concreto do que consumir a sessão dele para verificar um painel sobre um site que ainda não
renderiza uma linha de conteúdo.

O que torna isso uma sabatina, e não uma simples reordenação de planos: **o critério de conclusão
da fase 2 (§6.2) é exatamente o passo do professor** — _"um usuário EDITOR edita no `/admin` em
produção e a mudança aparece no site sem intervenção do ADMIN (M-02)"_. Tirar os planos 027 e 029
da fase 2 sem tocar no PRD deixaria uma fase que não pode fechar pelo próprio critério, e o §16
ainda proíbe começar fase que dependa de questão aberta — o que alcança a fase 3 pela Q-04.

Levantamento feito sobre `PRD.md` (§0, §3.3, §4.2, §6.2, §12, §16), `plans/README.md`, o README da
fase 2 e os cabeçalhos dos doze planos 023–034. **Dois planos dependem do professor:** o **027**
(ele aceita o convite do TinaCloud e entra no `/admin` com a própria conta) e o **029** (ao menos
uma das 10 medições tem de ser feita na sessão EDITOR dele). O **028** exige o orquestrador logado
em painel da Cloudflare — não o professor.

---

## Decisão 1 — O critério da fase 2 passa a ser o ciclo do ADMIN; a verificação do EDITOR migra para a fase 5

**Data:** 2026-09-12
**Questão:** tirando 027 e 029, a fase 2 não fecha pelo critério do §6.2, que exige o professor.
Como tratar formalmente a fase — reescrever o critério, deixar a fase pendurada como bloqueada, ou
partir a fase em 2a/2b?
**Decisão:** **reescrever o critério de conclusão da fase 2 no §6.2** para o ciclo ponta a ponta do
**ADMIN** — já demonstrado pelo plano 026 —, com cada elo provado por artefato, e **migrar para a
fase 5** os itens 4, 5 e 7 do checklist §12 da fase 2 (usuário EDITOR criado; EDITOR não consegue
alterar schema/código/configuração; ciclo cronometrado M-02 com o EDITOR) junto com os planos
**027** e **029**. A fase 2 passa de 8 para 5 itens (3/5 hoje); a fase 5 passa de 14 para 17.
**Justificativa:** a fase 5 já é onde o professor aparece no PRD — "treinamento e validação
assistida", M-01 ("o professor publica um item sozinho") e a remedição de M-02 que o §3.3 agenda
para lá. Pôr a habilitação do EDITOR ao lado dessas três é agrupar o que sempre foi a mesma sessão
com a mesma pessoa, em vez de espalhá-la por duas fases separadas por meses. _Deixar a fase 2
aberta_ foi descartado por criar uma fase pendurada por tempo indeterminado e caixas de §12 que
ninguém marca — o modo de falha que este projeto já pagou caro ao deixar o CI vermelho por 14
commits sem ninguém olhar. _Partir em 2a/2b_ foi descartado por custo de vocabulário: acrescenta
uma linha ao §6.2, uma seção ao §12 e uma sétima linha à tabela de progresso, para representar
exatamente a mesma migração que a opção escolhida representa sem inventar fase nova.
**Impacto no PRD:** §6.2 — critério de conclusão e entregáveis da fase 2 reescritos, entregáveis da
fase 5 ganham a conta EDITOR; §12 — itens 4, 5 e 7 da fase 2 movidos para a fase 5, tabela de
progresso de `3/8` para `3/5` na fase 2 e de `0/14` para `0/17` na fase 5; §3.3 — M-02 deixa de ser
medida na fase 2 (ver Decisão 3). Sem impacto em RF: nenhum requisito muda, só onde ele é
verificado.

---

## Decisão 2 — O plano 028 fica na fase 2 e é executado agora

**Data:** 2026-09-12
**Questão:** o 028 (notificação de falha de build ao ADMIN) não depende do professor, mas depende
do orquestrador logado no painel da Cloudflare e de um push deliberadamente quebrado na `main`.
Fica na fase 2 agora, migra para a fase 5 junto com os outros planos humanos, ou continua sendo da
fase 2 mas só roda depois da fase 3?
**Decisão:** **fica na fase 2 e é executado agora**, antes da fase 3. O item 6 do §12 permanece na
fase 2.
**Justificativa:** o 028 é um experimento controlado que quebra a `main` de propósito para provar
F-02, F-09 e RNF-04 com falha real. O momento mais barato para fazê-lo é **exatamente agora**:
nenhuma página renderiza conteúdo (o `src/` só tem `index.astro`), então o site publicado não
exibe nada que alguém note quebrado, embora o repositório seja público. Depois da fase 3 o mesmo
experimento derruba um site de verdade, com rotas que já funcionavam. _Migrar para a fase 5_ foi
descartado porque o recorte que o stakeholder pediu é "o que depende do professor", e o 028 não
depende — adiá-lo seria ampliar o recorte sem ganho. _Adiar a execução mantendo-o na fase 2_ foi
descartado por manter a fase 2 aberta até depois da fase 3, que é justamente o estado que a
Decisão 1 evitou, e por encarecer a janela de `main` quebrada.
**Impacto no PRD:** nenhum além do que a Decisão 1 já registra. O item 6 do §12 continua na fase 2.

---

## Decisão 3 — O plano 029 migra inteiro; M-02 passa a ser medida só na fase 5

**Data:** 2026-09-12
**Questão:** as 10 medições do plano 029 são do orquestrador e só **uma** precisa ser na sessão
EDITOR do professor. O plano migra inteiro para a fase 5, é fatiado (medições do ADMIN agora,
sessão EDITOR depois), ou migra inteiro com um baseline informal registrado agora?
**Decisão:** **migra inteiro para a fase 5**, e o §3.3 passa a agendar M-02 apenas para a fase 5,
em vez de "Fases 2 e 5".
**Justificativa:** dois motivos independentes, cada um suficiente. Primeiro, **o custo de medir
agora**: o próprio README da fase 2 registra que enquanto o 029 cronometra a `main` fica congelada,
porque qualquer outro push enfileira build (R-12) e contamina a amostra — e o passo seguinte deste
recorte é a fase 3 inteira, que empurra dezenas de commits. Segundo, **o valor do número**: o que
se mediria hoje é o build de um site que não renderiza uma página; a fase 3 muda materialmente o
tempo de build, tornando a amostra obsoleta antes de ser usada. _Fatiar_ foi descartado por pagar
esses dois custos e ainda criar um plano a mais para manter. O _baseline informal_ foi descartado
por precisão: o que os planos 025 e 026 colheram é n=1 sem protocolo, e registrá-lo no campo de uma
métrica convida a ser lido depois como se fosse a medição — os números continuam disponíveis nas
Evidências dos dois planos, que é o lugar deles.
**Impacto no PRD:** §3.3 — coluna "Quando medir" de M-02 passa de `Fases 2 e 5` para `Fase 5`.
Combinado com a Decisão 1, o item 7 do §12 (ciclo cronometrado) migra para a fase 5 junto com o
plano 029.

---

## Decisão 4 — ADIADA: a Q-04 continua aberta e continua bloqueando a fase 3

**Data:** 2026-09-12
**Questão:** a Q-04 (referências visuais do site) bloqueia a fase 3 pela regra do §16, e o
responsável por ela é o **dono do produto** — não o professor. Como destravar: o desenvolvedor
propõe direções para o stakeholder escolher, o stakeholder fornece as referências, ou a fase 3 é
construída com identidade provisória e a identidade real desce para a fase 5?
**Decisão:** **ADIADA por escolha do stakeholder** — ele fornecerá as referências visuais. A Q-04
permanece **aberta** no §16, com responsável e bloqueio inalterados, e **continua bloqueando o
`/fatiar` da fase 3**.
**Justificativa:** o stakeholder preferiu fornecer as referências a escolher entre direções
propostas, o que é o que a Q-04 literalmente pede e o caminho mais fiel ao gosto dele. _Identidade
provisória com a real na fase 5_ foi descartada pelo retrabalho: são sete rotas cujo CSS teria de
ser refeito, e o §8.2 lista restrições (contraste AA, leitura em 360 px, `prefers-reduced-motion`)
que se verificam sobre a identidade final, não sobre uma neutra descartável.
**Consequência operacional, e é a mais importante deste changelog:** o recorte pedido pelo
stakeholder — "tudo que não depende do professor, até ter um site navegável" — **não alcança o site
navegável enquanto a Q-04 não for respondida.** O que fica executável de imediato são os quatro
planos restantes da fase 2 (**028**, **032**, **033**, **034**), que a fecham em 5/5. A fase 3 só
começa quando as referências chegarem.
**Impacto no PRD:** nenhum. A Q-04 fica como está no §16; o §8.2 já registra que as referências
vêm do stakeholder antes da fase 3.
