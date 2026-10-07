# Sabatina — Página Ensino no modelo A, com disciplinas perenes

Redesenho da página Ensino (RF-23) a partir do protótipo A, "índice que inverte"
(`src/pages/prototipo-ensino/a.astro`, sem commit), escolhido pelo stakeholder em 2026-10-07
entre três protótipos. Pedido do stakeholder junto com a escolha: a disciplina deixa de ser uma
oferta por semestre e passa a ser perene — o professor a cadastra uma vez e a atualiza quando
quiser, e ela vale para qualquer momento. Semestre e datação do tipo "2026.2" saem da página.

## Decisão 1 — Destino do campo `semestre`

**Data:** 2026-10-07
**Questão:** `semestre` é obrigatório hoje (ex.: 2026.2) e aparece na listagem e na página da
disciplina. Com a disciplina perene, ele sai do schema ou fica?
**Decisão:** `semestre` fica no schema e no painel, mas **opcional e não exibido** em nenhuma página:
é anotação interna do professor.
**Justificativa:** escolha do stakeholder. Recomendei remover de vez (menos campo e nada que possa
voltar a aparecer por engano). Também se descartou exibi-lo na página da disciplina ("oferecida em
…"), por contradizer a disciplina atemporal.
**Impacto no PRD:** §7.3 `disciplinas` (`semestre` deixa de ser ✔ e ganha a observação "não
exibido"); RF-23 e RF-24 (sem semestre na listagem nem no cabeçalho da disciplina).

## Decisão 2 — Nome do arquivo e URL da disciplina

**Data:** 2026-10-07
**Questão:** o nome do arquivo, e com ele a URL, é `{semestre}-{slug(nome)}`
(`/ensino/2026-2-relatividade-geral/`). Com o semestre opcional e escondido, como fica?
**Decisão:** só o nome: `{slug(nome)}.md`, e a URL `/ensino/relatividade-geral/` ↔
`/en/teaching/relatividade-geral/`. Os dois arquivos de exemplo em `content/disciplinas/` são
renomeados. Duas disciplinas com o mesmo nome reprovam o build, como já faz `buildCourseSlugs`.
**Justificativa:** URL estável e atemporal, que o aluno pode guardar. Descartados: código + nome (o
código é opcional e muda com reforma de grade, e o nome do arquivo não acompanha a edição, RN-08) e
manter o semestre (a URL carregaria "2026-2" para sempre, e o semestre vazio geraria arquivo
começando com "-").
**Impacto no PRD:** §7.3 (template do nome de arquivo); RN-08 citado sem mudança de regra.

## Decisão 3 — `status` vira o interruptor `destaque`

**Data:** 2026-10-07
**Questão:** o modelo A tem cartões em destaque no topo (as "Atuais") e a lista de todas embaixo.
Sem semestre, o que põe uma disciplina no destaque?
**Decisão:** o enum `status` (`atual` | `anterior`) sai e entra o booleano `destaque`, que o
professor liga e desliga quando quiser. O bloco de cartões se chama "Em destaque", sem rótulo de
tempo. Nenhuma disciplina em destaque: o bloco some e fica só a lista. A RN-03 (transição manual de
status) é substituída por esta regra.
**Justificativa:** mantém o desenho escolhido (imagem e atalho para a última aula) sem datar nada.
Descartados: só a lista (perde o cartão e o atalho), todas em cartão (com 8 ou mais disciplinas a
página fica longa e perde a lista) e "Em andamento" (é marcação de tempo).
**Impacto no PRD:** RF-23 (os dois grupos rotulados viram "Em destaque" opcional + lista de todas);
RN-03 reescrita; §7.3 (`status` sai, `destaque` entra); ciclo de vida dos dados (§7) sem
"`status: anterior`".

## Decisão 4 — "Em curso" no topo, "Encerradas" na lista (revê os rótulos da Decisão 3)

**Data:** 2026-10-07
**Questão:** uma disciplina do bloco de cartões também aparece na lista de baixo?
**Decisão:** não. Os cartões do topo são as disciplinas **"Em curso"**, e a lista é a das
**"Encerradas"**: cada disciplina aparece num lugar só. Revê o rótulo "Em destaque" da Decisão 3.
Continua valendo: o professor marca e desmarca à mão, sem lógica de data, e bloco vazio some.
**Justificativa:** resposta do stakeholder, fora das opções oferecidas (recomendei a lista como
índice completo, com a repetição de 1–2 nomes). A disciplina continua perene e sem semestre; o que
muda é só o rótulo do momento, que o professor controla.
**Impacto no PRD:** RF-23 (grupos "Em curso" e "Encerradas"); chaves `teaching.current` e
`teaching.previous` do `pt.ts`/`en.ts` mudam de texto.

## Decisão 5 — `status` fica; mudam só os rótulos (substitui o campo `destaque` da Decisão 3)

**Data:** 2026-10-07
**Questão:** com "Em curso" / "Encerradas" (Decisão 4), o enum `status` (`atual` | `anterior`) já
faz o que o booleano `destaque` da Decisão 3 faria. Trocar o campo ou manter?
**Decisão:** manter `status` com os mesmos valores gravados (`atual` | `anterior`). Mudam só os
rótulos: no painel, "Em curso" e "Encerrada"; na página, os grupos "Em curso" e "Encerradas". O
campo `destaque` da Decisão 3 **não** é criado, e a RN-03 continua de pé, com os rótulos novos.
**Justificativa:** menor mudança possível — Zod, Tina, testes de paridade e os `.md` ficam como
estão. O interruptor pouparia um clique ao professor, mas exigiria migrar tudo sem ganho para o
visitante.
**Impacto no PRD:** RN-03 (só os rótulos); §7.3 (`status` com observação dos rótulos); a parte
"`status` sai, `destaque` entra" da Decisão 3 fica sem efeito.

## Decisão 6 — Ordem alfabética

**Data:** 2026-10-07
**Questão:** a ordem dentro de cada grupo hoje é `semestre` decrescente, com empate por `nome`. Com
o semestre escondido, qual é a ordem?
**Decisão:** alfabética pelo `nome` em português (colação `pt-BR`), nos dois grupos e nas duas
línguas (a rota EN ordena pelo nome PT, para a ordem não mudar entre idiomas — este detalhe é
escolha padrão do orquestrador, sujeita a veto, não foi perguntado). O `semestre` deixa
de influir em qualquer coisa.
**Justificativa:** previsível, sem campo novo, e é o que se espera de uma lista que funciona como
índice. Descartados: campo `ordem` manual (mais um campo para o professor lembrar) e semestre
escondido como chave (a ordem pareceria aleatória a quem não vê o dado).
**Impacto no PRD:** RF-23; `splitCourses` em `src/lib/courses.ts` e o teste dele.

## Decisão 7 — Imagem da disciplina

**Data:** 2026-10-07
**Questão:** o cartão "Em curso" do modelo A tem imagem, e `disciplinas` não tem campo de imagem.
**Decisão:** novo campo opcional `imagem` (upload no painel, grava em `public/uploads/`, como na
Extensão e nas linhas de pesquisa). Disciplina sem imagem mostra, no lugar dela, um bloco na cor
`tinta` com o código da disciplina (ou a inicial do nome, sem código) — a mesma regra da Pesquisa
modelo C, Decisão 1. A imagem é decorativa (`alt=""`): o cartão já se chama pelo nome.
**Justificativa:** o cartão nunca quebra e o professor não é obrigado a ter imagem. Descartados:
obrigatória (trava o cadastro e mexe na paridade Zod × Tina sem necessidade) e sem imagem (perde o
principal elemento visual do modelo A).
**Impacto no PRD:** §7.3 (`imagem` opcional em `disciplinas`); RF-23. Paridade Zod × Tina
(ADR-0008) ganha um campo.

## Decisão 8 — Datas de aula e de entrega só em disciplina "Em curso"

**Data:** 2026-10-07
**Questão:** `aulas[].data` e `listas[].data_entrega` são opcionais e aparecem na página da
disciplina (e a data da última aula no cartão). Numa disciplina perene, o que fazer com elas?
**Decisão:** os campos continuam no schema e no painel, opcionais. A página **só exibe** essas datas
quando a disciplina está "Em curso" (`status: atual`). Em disciplina "Encerrada", nenhuma data de
aula nem de entrega aparece, mesmo preenchida.
**Justificativa:** escolha do stakeholder. Resolve sozinho o esquecimento de datas antigas numa
disciplina encerrada, e o aluno continua vendo o prazo da lista enquanto ela corre. Recomendei
deixar como está (o professor apaga quando quiser), descartado pelo risco de datas esquecidas;
nunca exibir foi descartado porque o aluno perderia o prazo.
**Impacto no PRD:** RF-24 (critério: datas "quando houver" passa a "quando houver e a disciplina
estiver em curso"); `CourseView`, `LessonList`, `CourseResources`.

## Decisão 9 — Sem campo de nível

**Data:** 2026-10-07
**Questão:** o protótipo A mostrava "Graduação / Pós-graduação" ao lado do código, mas o nível foi
deduzido só para o protótipo; o campo não existe.
**Decisão:** não entra campo de nível. A linha pequena do cartão, da lista e do cabeçalho da
disciplina mostra só o código, e some quando não há código.
**Justificativa:** escolha do stakeholder. Recomendei um campo opcional (ajudaria o aluno a saber se
a disciplina é para ele), descartado: nenhum campo novo além da imagem.
**Impacto no PRD:** nenhum em §7.3; RF-23 e RF-24 (a linha de identificação é só o código).

## Decisão 10 — Grupo vazio some

**Data:** 2026-10-07
**Questão:** hoje os dois grupos sempre aparecem, com frase de vazio ("Nenhuma disciplina neste
semestre."). E agora?
**Decisão:** grupo sem disciplina some inteiro, rótulo incluído. Sem nenhuma disciplina publicada, a
página mostra uma frase só: "Nenhuma disciplina publicada ainda." (EN no vocabulário do Tong, a
redigir com revisão do stakeholder). As chaves `teaching.noCurrent` e `teaching.noPrevious` saem; a
frase "neste semestre", que datava a página, sai junto.
**Justificativa:** sem disciplina em curso a página começa direto na lista, sem um rótulo vazio no
lugar dos cartões. Descartado: manter os dois grupos sempre visíveis (mais explícito, mas o vazio
ocuparia o topo).
**Impacto no PRD:** RF-23 (critério de aceitação reescrito); RN-01 sem mudança; `pt.ts`/`en.ts`.

## Decisão 11 — Sem campo de código da disciplina

**Data:** 2026-10-07
**Questão:** depois da implementação, o stakeholder pediu a remoção do campo `codigo` (ex.:
FIS0123), por não ser necessário.
**Decisão:** `codigo` sai do Zod, do painel e do conteúdo de exemplo. O bloco sem imagem (Decisão 7) mostra a inicial do nome; a lista "Encerradas" fica sem nada à direita em repouso, e a descrição
entra ali no hover; o cabeçalho da disciplina mostra só "Em curso" ou "Encerrada". Revê as Decisões
7 e 9 no que citavam o código. Não confundir com `scripts[].codigo`, o código-fonte, que fica.
**Justificativa:** pedido direto do stakeholder; com a disciplina perene e sem semestre, o código
da UFMA (que muda com reforma de grade) era o último dado de oferta que restava.
**Impacto no PRD:** §7.3 (`codigo` sai de `disciplinas`); RF-23 (bloco com a inicial do nome).

## Decisão 12 — Aba Scripts com todos os scripts; atalho na aula

**Data:** 2026-10-07
**Questão:** os scripts com `aula` preenchida apareciam só dentro da aba Aulas, sob a aula; a aba
"Scripts da disciplina" só reunia os sem aula (F-13), e nem aparecia quando todos tinham aula. O
stakeholder pediu uma aba só para os scripts. O que acontece com os que estão sob a aula?
**Decisão:** todos os scripts ficam só na aba **"Scripts"** (EN "Scripts"): primeiro os ligados a
uma aula, na ordem das aulas, com "Aula N ·" antes de "Script · linguagem"; depois os gerais. Na
aba Aulas, a aula mostra, por script, um atalho "Script · título →" para o painel dele
(`#script-N`, pela posição em `scripts[]`); o `#id` na URL abre a aba que contém o alvo e rola até
ele. A aba aparece com qualquer script.
**Justificativa:** escolha do stakeholder, que era a recomendada: sem código repetido na página, e
quem está na aula ainda acha o script. Descartados: tirar da aula sem atalho (a aula esconderia que
tem script) e manter nos dois lugares (o mesmo código duas vezes na página).
**Impacto no PRD:** RF-37 e F-13 reescritos; `presentSections` deixa de receber a contagem dos
gerais e lê `scripts`; `ScriptPanel` perde `headingLevel` e ganha `id` e `lesson`.
