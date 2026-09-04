# Sabatina — Scripts Python nas disciplinas

Escopo novo levantado pelo stakeholder em 2026-09-04: junto dos materiais de disciplina serão
disponibilizados scripts em Python, exibidos na página com destaque de sintaxe e botão de copiar.

O PRD não previa isso. A **RN-05** determina que _todo material didático é referenciado por URL
externa; o site não hospeda o arquivo_ (NG-02, D-07), e exibir código com destaque exige o código
**dentro** do conteúdo — o oposto de "só a URL". Daí a sabatina.

---

## Decisão 1 — O script vive numa lista própria `scripts[]`

**Data:** 2026-09-04
**Questão:** onde o script entra no schema de `disciplinas` — estendendo `materiais[]`, como lista
própria irmã de `materiais[]`/`aulas[]`/`listas[]`, ou aninhado dentro de `aulas[]`?
**Decisão:** lista própria `scripts[]` na disciplina, com a forma
`{titulo, descricao?, linguagem, codigo, url?}`.
**Justificativa:** `materiais[]` tem `url` **obrigatório** e semântica de "link para arquivo
hospedado fora". Acomodar código ali exigiria afrouxar `url` para opcional em todos os materiais
e acrescentar `script` ao enum `tipo` — criando dois estados inválidos que nenhum schema pega
(`tipo=script` sem `codigo`, `tipo=slides` sem `url`) e mexendo justamente no enum que o teste de
paridade do plano 019 passou a cobrir. Lista própria deixa `codigo` ser obrigatório sem afrouxar
nada e não obriga a retrabalho no 019. Aninhar em `aulas[]` foi descartado por criar lista dentro
de lista no painel e por não dar endereço a um script geral da disciplina, que não pertence a
nenhuma aula.
**Impacto no PRD:** RF novo (gestão de scripts na disciplina, irmão do RF-07); §7.3 ganha
`scripts[]` em `disciplinas`; D-05 (listas embutidas, não coleções próprias) passa a valer para
mais uma lista.

---

## Decisão 2 — Código colado e link externo convivem; `url` é opcional

**Data:** 2026-09-04
**Questão:** o código colado substitui o link externo, convive com ele, ou os dois são mutuamente
exclusivos?
**Decisão:** convivem. `codigo` é obrigatório no item; `url` é opcional e serve para apontar o
arquivo original (Drive, GitHub, repositório institucional).
**Justificativa:** preserva a D-07 (link agnóstico ao hospedeiro) e o hábito já estabelecido nas
outras listas, sem obrigar o professor a manter dois lugares. A exclusividade mútua foi
descartada por exigir validação customizada entre campos — e o plano 019 já provou, contra os
tipos de `@tinacms/schema-tools`, que o Tina não oferece `validate` tipado para campo `object`
com `fields:`; a regra não seria imposta no painel e viraria promessa não cumprida.
**Consequência aceita:** o código exibido pode divergir do arquivo linkado. É risco de conteúdo,
não de schema, e entra no manual do professor (fase 5).
**Impacto no PRD:** RN-05 precisa de emenda (ver Decisão 7); nenhum impacto em D-07.

---

## Decisão 3 — `linguagem` é enum curto, com `python` como padrão

**Data:** 2026-09-04
**Questão:** a linguagem é fixa em Python, um enum fechado ou string livre?
**Decisão:** enum `python | r | matlab | bash | outro`, com `python` como valor padrão do item
novo.
**Justificativa:** o Shiki precisa do identificador de linguagem para colorir. String livre
transforma um erro de digitação em bloco sem cor nenhuma, sem mensagem e sem como o professor
diagnosticar — exatamente o modo de falha que a F-09 e a RNF-09 mandam evitar. Fixar em Python
foi descartado porque o custo de acrescentar o campo depois, com o modelo já em produção, é
maior que o de tê-lo agora: são disciplinas de física, e `.m` ou shell aparecem.
**Impacto no PRD:** §7.3, campo `linguagem` no item de `scripts[]`, enum fechado como os demais
(`publicacoes.tipo`, `disciplinas.status`, `materiais.tipo`).

---

## Decisão 4 — Sem download gerado; copiar, mais o `url` opcional

**Data:** 2026-09-04
**Questão:** o aluno pode baixar o `.py`, além de copiar? Se sim, o arquivo é gerado no build ou
montado no cliente?
**Decisão:** não há download gerado pelo site. O botão copia para a área de transferência; quando
o professor quiser oferecer o arquivo, preenche o `url` opcional da Decisão 2.
**Justificativa:** gerar o `.py` no build faria o site hospedar arquivo de material didático, que
é exatamente o que a NG-02 e a RN-05 excluem — e obrigaria a decidir rota, nome e colisão de nome
entre disciplinas. Montar o arquivo no cliente por Blob acrescenta JavaScript a uma rota que, de
outro modo, só precisa do `navigator.clipboard`, e o RNF-02 impõe teto de 50 KB comprimido com
zero framework de UI. A combinação escolhida não gasta nem artefato nem quilobyte.
**Impacto no PRD:** nenhum na NG-02; o critério de aceitação do RF novo menciona copiar, não
baixar.

---

## Decisão 5 — Script não entra no grupo "Versão em inglês"

**Data:** 2026-09-04
**Questão:** `titulo` e `descricao` do script entram no grupo `en` de `disciplinas`?
**Decisão:** não, por ora. O `en` de `disciplinas` continua com `nome`, `descricao` e `ementa`,
como o plano 018 fechou. O `codigo` nunca traduz — é dado factual (RN-07).
**Justificativa:** coerência com as outras quatro listas embutidas (`aulas[]`, `listas[]`,
`materiais[]`, `bibliografia[]`), que o plano 018 também deixou fora do grupo `en`. Traduzir só
`scripts[]` criaria assimetria sem razão. A alternativa de lista paralela alinhada por índice foi
descartada porque o próprio 018 registrou o defeito do mecanismo: reordenar a lista em português
desalinha a tradução, e o realinhamento não existe. Traduzir todas as listas embutidas de uma vez
é escopo bem maior, mexe no grupo `en` recém-fechado e depende do fallback (RN-06), que é da
fase 4.
**Impacto no PRD:** nenhum em RN-06/RN-07/RN-09; fica como item para a fase 4 revisitar se
fizer falta.

---

## Decisão 6 — O schema entra na fase 1, em plano próprio antes do fechamento

**Data:** 2026-09-04
**Questão:** o campo `scripts[]` é implementado na fase 1 (modelo de conteúdo, em fechamento), na
fase 3 (site público) ou adiado para depois da entrega?
**Decisão:** o **schema** entra na fase 1, num plano novo — o **022** — executado **antes** do
021, que fecha a fase. A **renderização** (Shiki + botão de copiar) é da fase 3.
**Justificativa:** a fase 1 é a fase do modelo de conteúdo; é onde campo novo nasce barato. Levar
o schema para a fase 3 significaria reabrir um modelo já declarado concluído, mexer de novo nos
dois arquivos e refazer a paridade Zod × Tina que o plano 019 acabou de construir e provar
falsificável. Adiar tudo para depois da entrega foi descartado porque o material já existe: o
professor teria script como link solto, que é o problema que motivou a conversa.
**Nota de numeração:** o 022 executar antes do 021 não fere a convenção — a numeração é global e
contínua, não é ordem de execução. Precedente registrado: o plano 014 rodou depois de a fase 0
fechar, e está na pasta da fase 0.
**Impacto no PRD:** §12 da fase 1 ganha um item (de 9 para 10); §6.2 mantém a fase 1 aberta até
022 e 021; a fase 3 ganha o item de renderização.

---

## Decisão 7 — RN-05 ganha exceção explícita para código-fonte; NG-02 fica intacta

**Data:** 2026-09-04
**Questão:** a RN-05 determina que _todo material didático é referenciado por URL externa; o site
não hospeda o arquivo_. Código colado no conteúdo a contradiz. Emendar a RN-05, criar regra nova
ou mexer também na NG-02?
**Decisão:** emendar a própria RN-05, com exceção nomeada: material didático continua sendo
referenciado por URL externa, **exceto código-fonte, que fica no próprio conteúdo justamente para
poder ser exibido**. A NG-02 não muda.
**Justificativa:** a NG-02 fala de _upload e hospedagem de PDFs/slides pelo site_, e código colado
num campo de formulário não é upload nem arquivo — o site continua sem hospedar arquivo algum
(reforçado pela Decisão 4, que descartou gerar o `.py`). Criar uma RN nova deixaria duas regras
concorrentes sobre o mesmo assunto, e quem lesse a RN-05 sozinha concluiria o oposto do que vale.
**Impacto no PRD:** RN-05 reescrita; NG-02 e D-07 inalteradas.

---

## Decisão 8 — Sem limite técnico de tamanho; orientação no campo e no manual

**Data:** 2026-09-04
**Questão:** há teto para o tamanho do código colado?
**Decisão:** nenhum limite no schema. O `description` do campo no painel sugere link para scripts
longos, e a mesma orientação entra no manual do professor (fase 5).
**Justificativa:** qualquer número seria arbitrário, e um limite no Zod produziria exatamente a
falha que a F-09 e a RNF-09 mandam evitar: o painel deixa salvar — o plano 019 comprovou que o
Tina não impõe validação customizada — e o erro só apareceria no build, ilegível para o
professor. Orientação preventiva no ponto de entrada custa nada e age antes do problema.
**Impacto no PRD:** nenhum requisito novo; item para o manual da fase 5.

---

## Decisão 9 — Campo `aula` opcional no script

**Data:** 2026-09-04
**Questão:** o script pode ser vinculado a uma aula específica?
**Decisão:** sim. O item de `scripts[]` ganha `aula`, **numérico e opcional**, para a fase 3 poder
agrupar os scripts sob a aula correspondente.
**Divergiu da recomendação.** A recomendação era não ter vínculo, pela simplicidade de
`materiais[]`. O stakeholder optou pelo vínculo, e a razão é boa: os scripts acompanham aulas
específicas, e sem o campo a associação existiria só na cabeça de quem escreveu a ordem da lista.
**Consequências aceitas, que a fase 3 e o plano 022 herdam:**

- **Não há integridade referencial.** O Tina não oferece `reference` entre listas embutidas do
  mesmo documento, e o Zod valida o item isoladamente. Nada impede `aula: 7` numa disciplina com
  cinco aulas.
- Portanto o caso órfão precisa de comportamento definido — ver Decisão 10.
- Renumerar ou remover uma aula não atualiza os scripts que apontam para ela. É o mesmo defeito
  de alinhamento que o plano 018 registrou para `en.formacao[]`/`en.areas[]`, aqui por número em
  vez de por índice.
  **Impacto no PRD:** §7.3, campo `aula` no item de `scripts[]`; critério de aceitação do RF novo
  menciona o agrupamento por aula.

---

## Decisão 10 — Script com `aula` inexistente cai no grupo "sem aula"

**Data:** 2026-09-04
**Questão:** consequência da Decisão 9 — o que a página faz quando `aula` não corresponde a
nenhuma aula da disciplina?
**Decisão:** a fase 3 agrupa os scripts sob a aula quando o número casa, e reúne os demais — os
órfãos e os que nunca tiveram `aula` — num grupo geral da disciplina. Nada falha, nada some.
**Justificativa:** as duas alternativas erram para os lados opostos que este projeto já decidiu
evitar. Derrubar o build por dado de apresentação é o cenário F-09/R-01 — o professor levaria o
site inteiro fora do ar por causa de um número errado num script, sem saber diagnosticar. Omitir
o script da página é falha silenciosa: material publicado desapareceria sem aviso, a classe de
defeito que o plano 019 acabou de construir uma rede para pegar. O grupo geral degrada de forma
visível: o script aparece fora do lugar, e é o próprio aviso ao professor.
**Impacto no PRD:** cenário de falha novo na §5.4 (script apontando para aula inexistente);
critério de aceitação do RF novo cobre o caso.

---

## Decisão 11 — `aula` é campo numérico digitado, com texto de ajuda

**Data:** 2026-09-04
**Questão:** o painel oferece a lista de aulas do documento para escolher, ou o professor digita o
número?
**Decisão:** campo numérico simples, com `description` explicando que é o número da aula
correspondente, se houver.
**Justificativa:** um seletor lendo as aulas do mesmo documento eliminaria o órfão já na entrada,
mas exigiria o primeiro componente React customizado do projeto — e a lição da casa é que
comportamento de UI de terceiro só se prova exercitando o painel, o que transformaria o plano 022
num plano de descoberta. O campo simples é o que o Tina entrega sem componente customizado, e a
Decisão 10 já garante que o órfão degrada sem quebrar. Fica como melhoria candidata para depois,
não como pré-requisito.
**Impacto no PRD:** nenhum requisito novo; RF-03 (vocabulário acadêmico e ajuda em campo não
óbvio) já cobre a exigência do texto de ajuda.

---

## Forma final do schema decidida nesta sabatina

```
disciplinas.scripts[]        (lista embutida, D-05 — como aulas[], listas[], materiais[])
  titulo      string    obrigatório
  descricao   string    opcional
  linguagem   enum      python | r | matlab | bash | outro   (padrão: python)
  codigo      string    obrigatório      textarea no painel
  aula        number    opcional         número da aula correspondente
  url         string    opcional         URL do arquivo original, se houver
```

Fora do grupo `en` (Decisão 5). Sem limite de tamanho (Decisão 8). Sem integridade referencial
em `aula`, com degradação definida (Decisões 9 e 10).

## Risco técnico a verificar no plano 022, antes de fechar

Código Python indentado dentro de YAML depende de o `js-yaml` usado pelo Tina serializar o campo
como _block scalar_ (`|`) e reler sem alterar espaçamento. Se ele escapar como string de linha
única, a indentação — que em Python é sintaxe — se perde.

**Isto não se aprova lendo `node_modules`.** É exatamente a lição que este projeto pagou caro:
comportamento de biblioteca de terceiro no caminho de escrita se prova salvando pelo painel e
lendo o arquivo gravado. O plano 022 tem de colar o `.md` resultante na Evidência, com um script
que tenha bloco indentado, linha em branco no meio e aspas.
