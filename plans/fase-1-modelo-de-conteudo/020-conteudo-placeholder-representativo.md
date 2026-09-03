# Plano 020 — Conteúdo placeholder representativo nas cinco coleções

**Status:** TODO
**RFs cobertos:** fase 1, item "Conteúdo placeholder representativo"; base de RF-04 a RF-10
**Depende de:** planos 016, 017 e 018 (o 019 pode rodar em paralelo)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`content/` tem conteúdo suficiente para que a fase 3 construa e teste todas as rotas sem
inventar dados: 1 perfil, 2 linhas de pesquisa, 2 projetos, 2 disciplinas (uma com 5 aulas) e
6 publicações distribuídas em 3 anos.

## Arquivos afetados

- `content/perfil/index.md` — completar (o plano 015 criou uma versão mínima)
- `content/linhas-pesquisa/*.md` — 2 arquivos
- `content/projetos/*.md` — 2 arquivos
- `content/disciplinas/*.md` — 2 arquivos
- `content/publicacoes/*.md` — 6 arquivos

> Não altere schema nem configuração. Se o conteúdo não couber no schema, **pare e reporte** —
> pode ser defeito do schema, e corrigi-lo aqui furaria a paridade que o plano 019 protege.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### O que "representativo" quer dizer, e por que a quantidade é essa

O checklist da §12 pede exatamente: **1 perfil, 2 linhas, 2 projetos, 2 disciplinas (uma com 5
aulas), 6 publicações em 3 anos.** Os números não são arbitrários — cada um existe para exercer
algo que a fase 3 vai construir:

- **2 linhas** exercem a ordenação por `ordem`
- **2 disciplinas**, uma `atual` e uma `anterior`, exercem a RN-03 e a separação da listagem
- **5 aulas** numa delas exercem a ordenação de aulas (RN-04) e as listas embutidas da D-05
- **6 publicações em 3 anos** exercem o agrupamento por ano (RN-02) — não use 6 do mesmo ano
- Ao menos uma publicação com `destaque: true` exerce a seleção da Home

**Cubra também os casos de borda**, que é onde a fase 3 vai quebrar se o placeholder for
otimista demais: ao menos um item com `publicado: false` (RN-01), ao menos um item **sem** grupo
`en` e um **com** o grupo parcialmente preenchido (RN-06, RN-09), uma disciplina sem `codigo`,
uma publicação sem `doi`, um projeto sem `linha_relacionada`.

### Dados reais × dados inventados — a regra

O **Apêndice C** do PRD traz os dados reais do professor, extraídos do `lattes.pdf`: nome,
nome em citações (`LIMA JUNIOR, HAROLDO C. D.`), cargo (Professor Adjunto A), instituição
(UFMA, Campus São Luís), unidade (Centro Tecnológico — Departamento de Física), bolsa de
Produtividade CNPq nível C, Lattes, ORCID, e a formação completa (graduação, mestrado e
doutorado na UFPA, pós-doutorado, formação no ICTP). A área é **relatividade geral** — buracos
negros de Kerr, forças de maré, campos escalares, sombras.

**Use os dados reais no `perfil`.** Eles resolvem a Q-01 e são a fonte prevista pelo PRD.

**O Apêndice C avisa que a lista de publicações NÃO está no `lattes.pdf`** e precisará vir do
ORCID/Scholar ou ser cadastrada pelo professor. Portanto:

⚠️ **As 6 publicações do placeholder são inventadas.** Elas precisam ser **plausíveis para a
área** (títulos de relatividade geral, veículos como Physical Review D, Classical and Quantum
Gravity) mas **inequivocamente marcadas como placeholder** — nunca um DOI real, nunca um arXiv
real, nunca um trabalho existente atribuído a alguém. O site é **público**, e um placeholder que
pareça publicação real é desinformação sobre uma pessoa real.

**Como marcar:** decida um mecanismo e registre-o na Evidência — sugestão, `publicado: false`
em todas, mais um comentário no frontmatter. O importante é que exista um jeito trivial de
encontrá-las e apagá-las quando o professor cadastrar as verdadeiras.

O mesmo vale para disciplinas, linhas e projetos: plausíveis para a área, marcados como
placeholder. As disciplinas podem usar nomes reais de disciplinas de Física (Mecânica Clássica,
Relatividade Geral) — o exemplo do PRD na RF-06 é "Mecânica Clássica / 2026.2 / atual".

### Links de material

Todo `url` é **URL livre** (D-07). Use URLs que não apontem para lugar nenhum de verdade — não
invente link de Drive que possa colidir com um real.

### Nomes de arquivo

Os templates do plano 017 governam (RN-08): `{semestre}-{slug(nome)}.md` para disciplinas,
`{ano}-{slug(titulo)}.md` para publicações. **Crie o conteúdo pelo painel sempre que possível**,
para que os nomes saiam do template e não da sua mão — e para exercer o caminho que o professor
vai usar.

### 🚨 A armadilha da Q-07 detona neste plano — leia antes de abrir o Perfil

`content/perfil/index.md` tem hoje `email: PLACEHOLDER@ufma.br`, e o que marca esse valor como
fictício são **seis linhas de comentário YAML** no próprio arquivo, que registram a Q-07 como
aberta até a fase 3.

O Tina reserializa o frontmatter com `gray-matter`/`js-yaml`
(`node_modules/@tinacms/graphql/dist/index.js:3418-3419` e `:3619`), que **não preservam
comentário YAML**. Portanto: **o primeiro save do formulário "Perfil" pelo painel apaga essas
seis linhas.** Os planos 017 e 018 evitaram isso não abrindo o Perfil — este plano precisa
preenchê-lo, então não tem como evitar.

**Ordem obrigatória, antes de qualquer save do Perfil:**

1. Obtenha o e-mail institucional real do professor. Se ele não estiver disponível, **pare e
   reporte** — não invente, não mantenha o placeholder, não apague o comentário "para depois".
2. Substitua o `PLACEHOLDER@ufma.br` pelo valor real **editando o arquivo diretamente**, junto
   com a remoção do bloco de comentário da Q-07.
3. Só então use o painel.

Se o e-mail real não vier a tempo, a alternativa é preencher o Perfil **editando o arquivo à
mão**, sem abrir o formulário — o placeholder e o comentário sobrevivem, e a Q-07 segue aberta
para a fase 3. Registre na Evidência qual dos dois caminhos foi seguido e por quê. O repositório
é público: um e-mail errado exposto é pior que um placeholder marcado como tal.

### Duas armadilhas do painel que você vai encontrar ao criar o conteúdo

**1. Lista embutida com campo obrigatório vazio.** Ao adicionar uma aula (ou lista, ou material)
e tentar sair dela antes de preencher `numero`, `titulo` e `url`, o Tina dispara
`Cannot navigate away from an invalid form` **sem dizer qual campo falta**. É limitação genérica
do produto, não defeito do schema. Preencha os três campos de cada item antes de adicionar o
próximo. A disciplina de 5 aulas é onde isso mais aparece.

**Pior ainda:** o Tina **não bloqueia o save do documento pai** com o subcampo vazio — ele grava
`aulas: [ {} ]`, que o Zod rejeita e o build recusa. Confira o frontmatter gravado depois de
salvar, não só a tela.

**2. Item novo nasce `publicado: false`.** As quatro coleções de listagem têm
`defaultItem: { publicado: false }`, para o interruptor não nascer inválido. Isso é proposital —
mas significa que **todo item que você criar pelo painel nasce despublicado**. O plano pede ao
menos um `publicado: false` (RN-01); os demais precisam ser marcados explicitamente, ou o
placeholder inteiro fica invisível para a fase 3.

### Ordem em relação ao plano 019

O cabeçalho diz que o 019 pode rodar em paralelo, e isso continua valendo **com uma ressalva**:
o campo `projetos.linha_relacionada` tem divergência de formato de valor conhecida (o Tina grava
o caminho completo, o Astro espera o id sem pasta nem extensão), e **corrigi-la é do 019**. Se o
019 ainda não tiver fechado, crie os dois projetos com o campo **vazio** e deixe o
preenchimento de `linha_relacionada` para depois — caso contrário o valor gravado agora pode
ficar no formato errado e ninguém perceber, porque a falha é silenciosa. Registre na Evidência
qual dos dois casos ocorreu.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Preencher `content/perfil/index.md` com os dados reais do Apêndice C.
   → verify: `npm run build` verde; nenhum campo obrigatório vazio.
2. Criar 2 linhas de pesquisa com `ordem` distinta, 2 projetos (um sem `linha_relacionada`).
   → verify: arquivos válidos pelo schema.
3. Criar 2 disciplinas — uma `atual` com 5 aulas, listas e materiais; uma `anterior`, sem
   `codigo`.
   → verify: a de 5 aulas exercita as três listas embutidas da D-05.
4. Criar 6 publicações **inventadas e marcadas como placeholder**, em 3 anos distintos, ao menos
   uma com `destaque: true` e uma sem `doi`.
   → verify: nenhum DOI ou arXiv real; mecanismo de marcação registrado.
5. Garantir os casos de borda: um item `publicado: false`, um sem grupo `en`, um com `en`
   parcial.
   → verify: liste na Evidência qual item cobre cada caso.
6. Rodar a sequência de qualidade.
   → verify: os quatro verdes, com o build reconhecendo todas as entradas.

## Critérios de aceitação

- [ ] 1 perfil com os **dados reais** do Apêndice C
- [ ] 2 linhas de pesquisa com `ordem` distinta
- [ ] 2 projetos, um deles sem `linha_relacionada`
- [ ] 2 disciplinas — uma `atual` com **5 aulas**, listas e materiais; uma `anterior` sem `codigo`
- [ ] 6 publicações em **3 anos distintos**, ao menos uma com `destaque` e uma sem `doi`
- [ ] **Nenhum DOI, arXiv ou trabalho real** entre as publicações inventadas
- [ ] Mecanismo de marcação do placeholder definido e registrado — o repositório é **público**
- [ ] Casos de borda cobertos: `publicado: false`, item sem `en`, item com `en` parcial
- [ ] Nomes de arquivo gerados pelos templates (RN-08), não digitados
- [ ] **Q-07 tratada antes do primeiro save do Perfil:** e-mail institucional real no lugar do
      placeholder, ou Perfil preenchido à mão preservando o comentário — o caminho escolhido
      registrado na Evidência, com o motivo
- [ ] **Frontmatter conferido depois de cada save**, não só a tela — nenhuma lista embutida
      gravada com item vazio (`aulas: [ {} ]`)
- [ ] `publicado` explicitamente marcado nos itens que devem aparecer — o padrão do painel é
      `false`
- [ ] `projetos.linha_relacionada` só preenchido se o plano 019 já tiver corrigido o formato do
      valor; caso contrário, deixado vazio e registrado
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] Nenhuma alteração em schema ou configuração

## Evidência

<Preenchido pelo executor: `ls` de `content/` com os 13 arquivos, saída dos quatro comandos,
mecanismo de marcação do placeholder, e a tabela de qual item cobre qual caso de borda.>
