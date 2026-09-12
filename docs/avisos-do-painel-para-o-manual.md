# Avisos do painel para o manual da fase 5

- **Propósito:** consolidar, num único lugar, o que o painel `/admin` (TinaCMS) deixa o professor
  fazer de errado — insumo direto para `docs/manual-do-professor.md` (entregável da fase 5, §10.5).
  Este documento **não é** o manual: não tem captura de tela, não usa linguagem de professor além
  da frase citada em cada aviso, e não conserta nada.
- **Origem:** planos 020, 021 e 022 (fase 1), README da fase 1
  (`plans/fase-1-modelo-de-conteudo/README.md`) e PRD (`PRD.md`).
- **Criado em:** 2026-09-12, pelo plano 033 (`plans/fase-2-pipeline-de-publicacao/033-avisos-do-painel-para-o-manual-da-fase-5.md`).
- **Destino:** fase 5 — `docs/manual-do-professor.md` e a sessão de treinamento de 30 min de
  RNF-05.
- **Versão do TinaCMS observada:** 3.12.1 (`package.json`; confirmada também no contexto do plano 022) — vale para os Avisos 1 a 3, que são comportamento do painel. Os Avisos 4 e 5 **não** são
  defeito do TinaCMS (são o pipeline de build e a decisão de arquitetura D-04, respectivamente); a
  linha "Quando revisar" de cada um já deixa isso explícito.

## Os cinco avisos

### Aviso 1 — O painel descarta edição em silêncio ao voltar de um subpainel (dívida 4)

**O que acontece.** Causa única: ao voltar de um subpainel de grupo `object` — o "Versão em
inglês", o "Período de execução", um item de lista embutida — o formulário do Tina re-inicializa a
partir do documento carregado. Duas manifestações observadas da mesma causa:

- **Plano 020:** gravação silenciosa do valor **antigo**, com a tela mostrando o **novo** — campo
  que já tinha valor perde a alteração, campo que estava vazio sobrevive. `defaultItem: {
publicado: false }` conta como valor inicial, o que faz do interruptor "Publicado" a vítima mais
  provável (reproduzido com A/B de uma variável: uma linha de pesquisa gravou `publicado: false`
  com o interruptor ligado na tela; no Perfil, `nome` e `bio` reverteram enquanto `departamento`,
  vazio antes, gravou o valor novo).
- **Plano 021:** perda **visível** da edição pendente, não do mesmo tipo — ao editar `resumo` e
  `corpo` de uma linha de pesquisa (um com valor, outro vazio) e entrar/sair do subpainel "Versão
  em inglês", os dois campos voltaram ao valor anterior **na própria tela**, o botão `Save`
  desabilitou e o indicador de estado voltou a "limpo", inclusive no campo que estava vazio (que no
  020 tinha sobrevivido).

Não desmente o 020: a causa é uma só, mas o caminho até ela decide qual efeito aparece, e esse
caminho não está mapeado.

**Como reproduzir.** Editar um campo que já tem valor (ex.: `nome`, `bio`, `resumo`, o interruptor
"Publicado"), visitar qualquer subpainel de grupo `object` (Versão em inglês, Período de execução,
um item de lista embutida) e voltar sem salvar dentro dele; salvar o formulário-pai depois. A tela
mostra o valor novo; o arquivo grava o antigo (020) ou a própria tela reverte antes do save (021).

**Contorno.** O mais confiável, achado no plano 022: **salvar sem sair do subpainel** — o gatilho é
a volta ao formulário-pai, não o save. Alternativa mais fraca (020/021): alterar por último os
campos que já têm valor, depois de sair de qualquer subpainel, e conferir o arquivo gravado a cada
save — a tela nunca é prova.

**O que o manual tem de dizer ao professor.** _"Depois de editar um campo que já tinha texto, salve
antes de abrir qualquer outra seção do formulário — se você abrir 'Versão em inglês' ou outra seção
parecida e voltar, o que você acabou de mudar pode não ser salvo, mesmo que a tela pareça certa."_

**Quando revisar.** Observado no TinaCMS 3.12.1. Perde objeto se uma versão futura do Tina parar de
re-inicializar o formulário a partir do documento carregado ao sair de um subpainel de grupo
`object` — ou seja, se o estado do formulário passar a sobreviver à navegação entre subpainéis sem
salvar.

**Origem.** README da fase 1, seções "O que o 020 descobriu, e que o 022 vai encontrar" e "O que o
021 descobriu ao demonstrar o critério de conclusão da fase"; Evidência do plano 020 ("Achado 1 — o
formulário do Tina descarta alterações ao voltar de um subpainel"); Evidência do plano 021 (seção
7, "Achado corrigido no README da fase 1 por esta verificação"); Evidência do plano 022 ("Os seis
campos conferidos um a um contra o que a tela mostrava" — contorno de salvar dentro do subpainel).

---

### Aviso 2 — O painel deixa salvar item de lista com subcampo obrigatório vazio (dívida 3)

**O que acontece.** Na variante de lista embutida (`{ type: 'object', fields: [...], list: true
}`), o `ui` do campo é tipado como `Template['ui']`, que **não declara `validate`** — diferença
conferida contra `node_modules/@tinacms/schema-tools` pela revisão do plano 019. O Tina não bloqueia
o salvamento do documento pai com o subcampo vazio; o Zod só rejeita depois, no build. Instâncias
conhecidas: `aulas[]`, `listas[]`, `materiais[]`, `bibliografia[]`, `scripts[].titulo`,
`scripts[].codigo` (plano 022) e — desde o plano 021 — `publicacoes.autores[]`, a primeira
instância em lista de **string simples**, não de objetos.

**Isto contradiz o F-01 do PRD** ("O Tina bloqueia o salvamento e destaca o campo") para o caso de
lista embutida: o manual não pode prometer ao professor o que o painel não faz nesse caso
específico.

**Como reproduzir.** Adicionar um item a qualquer uma das listas acima deixando o subcampo
obrigatório em branco (ex.: uma aula sem `numero`/`titulo`/`url`, um autor vazio em
`publicacoes.autores[]`) e salvar o documento — o botão `Save` habilita e o arquivo grava o item
incompleto (ex.: `aulas: [ {} ]`); o erro só aparece no `npm run build` seguinte, no `astro check`.

**Contorno.** Nenhum no painel: preencher todos os subcampos obrigatórios de cada item antes de
adicionar o próximo, e conferir o frontmatter gravado depois de salvar, não só a tela.

**O que o manual tem de dizer ao professor.** _"Ao adicionar um item numa lista (aula, material,
script, autor), preencha todos os campos antes de sair dele — o painel às vezes deixa salvar um
item incompleto, e o problema só aparece minutos depois, no site."_

**Quando revisar.** Observado no TinaCMS 3.12.1. Perde objeto se uma versão futura do
`@tinacms/schema-tools` passar a tipar (e o Tina passar a executar) `validate` para a variante de
lista de objetos — o que também tornaria o F-01 do PRD verdadeiro para este caso.

**Origem.** README da fase 1, item 3 de "O que a fase 1 empurra para a fase 2" e seção "O que o 019
fechou, e o que ele deixa para o 020 e o 021"; Evidência do plano 022 ("Dívida herdada do plano 019,
duas instâncias novas"); Evidência do plano 021 ("`publicacoes.autores[]` é outra instância..."); e
`PRD.md`, tabela de F-01.

---

### Aviso 3 — Projeto sem linha de pesquisa grava `linha_relacionada: ''`

**O que acontece.** O painel não omite o campo `linha_relacionada` quando o projeto não tem linha
de pesquisa relacionada — ele grava string vazia (`''`), que é uma referência inválida para o Astro
(`getEntry()`/`reference()`). Contraste registrado: `codigo` vazio numa disciplina **é** omitido do
frontmatter pelo painel — o problema é específico do tipo `reference`.

**Materializou-se em 2026-09-10** editando **apenas a `descricao`** do projeto
`content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md` pelo painel, durante a demonstração
do critério de conclusão da fase 1 (§6.2) pelo orquestrador (plano 021): o arquivo já existia sem o
campo `linha_relacionada` (criado assim pelo plano 020, de propósito, como caso de borda), e o Tina
acrescentou `linha_relacionada: ''` mesmo sem esse campo ter sido tocado no formulário.

**Como reproduzir.** Abrir um projeto sem `linha_relacionada`, editar qualquer outro campo
(ex.: `descricao`) e salvar — o Tina acrescenta `linha_relacionada: ''` ao frontmatter. O
`npm run build` (via `astro check`) reproduz: `[ERROR] [content] Invalid content reference: entry
"..." in collection "projetos" (field: linha_relacionada) references "" in collection
"linhas-pesquisa", but that entry does not exist.` — **mas o comando termina com `0 errors` e exit
0**; o erro é impresso, não reprova o build.

**Contorno.** Nenhum no painel. Depois de qualquer edição num projeto sem linha relacionada, abrir
o `.md` gravado e remover a linha `linha_relacionada: ''` à mão, se ela tiver aparecido; e ler o
texto da saída do `npm run build`/`astro check`, não confiar no exit code.

**O que o manual tem de dizer ao professor.** _"Se um projeto não tem linha de pesquisa
relacionada, edite-o com atenção redobrada — e avise o responsável técnico depois de qualquer
alteração nele, mesmo que pareça não ter mexido nesse campo."_

**Quando revisar.** Observado no TinaCMS 3.12.1. Perde objeto se uma versão futura passar a omitir
`reference` vazio do frontmatter (como já faz hoje para campos de string simples como `codigo`), em
vez de gravar string vazia.

**Origem.** Evidência do plano 020 ("Achado 2 — projeto criado sem escolher linha de pesquisa grava
string vazia, e o Astro rejeita"); Evidência do plano 021 (seção 6, "Tentativa 2" e o parágrafo "O
que produziu essa saída, com precisão..."); README da fase 1, item 5 de "O que a fase 1 empurra para
a fase 2" e a seção "O que o 020 descobriu, e que o 022 vai encontrar".

---

### Aviso 4 — O que acontece quando o professor quebra o build

**O que acontece.** Segundo F-02 do PRD: se um build falha depois de um salvamento do professor
(por exemplo, por um item de lista salvo com subcampo obrigatório vazio — Aviso 2 — ou por
qualquer outro conteúdo que o Zod rejeite), o site continua no ar com a **versão anterior**, e
**nenhuma mensagem chega ao professor** — quem é notificado é o ADMIN. É o Fluxo E da §8.1 do PRD:
"Professor salva → build falha → site continua no ar com a versão anterior → ADMIN recebe
notificação → corrige o conteúdo ou o schema → build volta a passar."

⚠️ **Ressalva que o manual precisa herdar:** a notificação automática ao ADMIN (F-02) ainda está
**pendente de implementação** — `PRD.md`, checklist da fase 2, item em aberto: "Notificação de
falha de build chegando ao ADMIN (F-02)". O comportamento de manter a versão anterior no ar (que
não depende de notificação) já é consequência do próprio Cloudflare Workers Builds; o alerta ao
ADMIN é o que falta.

**Como reproduzir.** Qualquer uma das falhas de build já descritas no Aviso 2 (subcampo obrigatório
vazio numa lista embutida) produz esse cenário: o `npm run build`/`tinacms build && astro check &&
astro build` do pipeline falha, e o deploy anterior permanece publicado.

**Contorno.** Não há contorno no painel — é o comportamento desejado do sistema (RNF-04: falha de
build não derruba o site). O que existe é o hábito a criar: avisar o responsável técnico se um
conteúdo salvo não aparecer no site depois de alguns minutos.

**O que o manual tem de dizer ao professor.** _"Se o que você salvou não aparecer no site depois de
alguns minutos, o conteúdo não se perdeu — avise o responsável técnico."_ Ligado a F-11: conteúdo
apagado por engano também é recuperável pelo histórico do Git, pelo ADMIN.

**Quando revisar.** Não é comportamento do TinaCMS, e sim do pipeline de build (Cloudflare Workers
Builds) e de uma notificação ainda não implementada — este aviso perde parte do objeto quando a
notificação ao ADMIN (F-02) for entregue pela fase 2, mas a frase ao professor continua válida
enquanto builds puderem falhar.

**Origem.** `PRD.md` — F-02, RNF-04, F-11, §8.1 (Fluxo E), checklist da fase 2 (item pendente de
notificação ao ADMIN).

---

### Aviso 5 — O repositório é público (D-04)

**O que acontece.** `publicado: false` esconde um item do **site**, não do **GitHub** — o arquivo e
todo o histórico de edição (inclusive versões anteriores de um rascunho) ficam legíveis por
qualquer pessoa que abra o repositório público. Rascunho não é privado.

**Como reproduzir.** Criar ou editar qualquer item com `publicado: false` e observar que ele não
aparece no site — mas o arquivo `.md` correspondente, e todo commit que o tocou, continuam visíveis
no repositório do GitHub para qualquer visitante.

**Contorno.** Nenhum técnico — é uma decisão de arquitetura (D-04: Editorial Workflow do TinaCloud é
pago; o campo `publicado` entrega só o essencial). O contorno é comportamental: nunca tratar
`publicado: false` como um lugar seguro para rascunho sensível ou dado que não deva ser público.

**O que o manual tem de dizer ao professor.** _"Marcar algo como 'Rascunho' esconde do site, mas
não do histórico do projeto no GitHub — qualquer pessoa pode ver o que foi escrito ali, mesmo antes
de publicar."_

**Quando revisar.** Não é uma falha do TinaCMS 3.12.1 a corrigir — é a consequência de uma decisão
de arquitetura (D-04) enquanto o repositório for público e o projeto operar no plano gratuito do
TinaCloud (sem Editorial Workflow). Perde objeto só se o repositório deixar de ser público ou o
projeto contratar o plano com Editorial Workflow.

**Origem.** `PRD.md` — D-04, RN-01 (nota "a regra vale para o site — não para o repositório, que é
público"); README da fase 1, "Por onde isto pode dar errado", item 4.

## A decisão da fase 2 sobre a dívida 4

A dívida 4 (Aviso 1 — o painel descarta edição em silêncio) **não tem verificação automatizável**.
É a única dívida da fase 1 que passa por **todo** o portão de qualidade do projeto: build, testes,
lint e CI ficam verdes com o conteúdo errado (ou a edição perdida) no disco, porque o conteúdo
gravado é **válido** pelo schema — só não é o que o professor quis escrever. Nenhum teste do
repositório consegue distinguir "o professor quis gravar isto" de "o formulário reverteu sozinho".

**Entrega correspondente, nomeada aqui para que a fase 5 não precise redescobri-la:** aviso
obrigatório no manual do professor (`docs/manual-do-professor.md`, §10.5) **e** na sessão de
treinamento de 30 minutos que a RNF-05 prevê. Não é item de código da fase 2.
