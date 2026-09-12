# Plano 027 — Roteiro humano: usuário EDITOR do professor e a matriz de permissões da §9

**Status:** TODO
**RFs cobertos:** RF-01, RF-02; RNF-07; fase 5, **itens 11 e 12** do §12 (eram os itens 4 e 5 da
fase 2 até 2026-09-12); matriz papel × permissão
da §9; A-01, R-04
**Depende de:** plano **026** (não convide o professor para um `/admin` que ainda não se sabe se
autentica em produção)
**Modelo recomendado:** — (execução humana)
**Agente recomendado:** nenhum
**Executável por:** **stakeholder** — o convite é criado pelo orquestrador no TinaCloud, mas
**dois passos só o professor pode executar**: aceitar o convite com `haroldo.lima@ufma.br` e
entrar no `/admin` de produção com a própria conta. Ver "O passo humano, e o que ele tem de
devolver".
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

> **Migrado da fase 2 para a fase 5 em 2026-09-12**, por decisão do stakeholder registrada em
> `docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`. O motivo é de sequência: este plano
> exige uma sessão com o professor, e a fase 5 já reservava essa sessão para o treinamento e a
> validação assistida (M-01). O arquivo e o número **não** mudaram — a numeração deste projeto é
> global e contínua, e o plano mudou de pasta porque mudou o checklist que ele fecha.

## Objetivo

O professor tem conta própria no TinaCloud, com papel **EDITOR**, e o que ele pode e não pode
fazer está verificado **exercitando as interfaces** contra a matriz da §9 — não contra a
documentação do TinaCloud.

Fecha os itens 11 e 12 do checklist da fase 5. O item 5 ("verificado que o EDITOR **não** consegue
alterar schema, código ou configuração") é a metade que costuma ser assumida sem prova: ele exige
**tentar** e registrar o que a interface respondeu.

## Arquivos afetados

- **Nenhum arquivo do projeto.**
- `content/**` — o professor edita **um** item existente durante a verificação. O arquivo alterado
  é evidência.

> `git status --short` só pode mostrar o item que o professor editou.

## Contexto necessário

**Decisões já fechadas — não reabra:**

| Item | Valor | Origem |
|---|---|---|
| E-mail da conta EDITOR | **`haroldo.lima@ufma.br`** | Q-06, resolvida em 2026-09-03 (PRD v0.1.13) |
| Papel | **EDITOR** (o plano gratuito do TinaCloud oferece 2 papéis) | §7.2, §9 |
| Painel em inglês é aceitável | sim | Q-02, resolvida em 2026-09-01; A-08 confirmada |
| Vagas de usuário | 2 no plano gratuito; **1 já ocupada** pelo ADMIN | plano 011 |

**Consequência de A-01/R-04 que precisa ficar dita ao stakeholder na hora:** com o professor
dentro, **as duas vagas do plano gratuito estão ocupadas**. Um terceiro editor (bolsista,
secretaria) exige plano pago ou migração para Decap (R-03, R-04). Registre na Evidência que isso
foi comunicado.

**A matriz da §9, que é o gabarito deste plano:**

| Ação | ADMIN (desenvolvedor) | EDITOR (professor) |
|---|---|---|
| Editar conteúdo pelo painel | ✔ | ✔ |
| Publicar / despublicar conteúdo | ✔ | ✔ |
| Enviar imagens | ✔ | ✔ |
| Alterar schema do painel | ✔ | ✘ |
| Alterar código, estilos, layout | ✔ | ✘ |
| Acessar o repositório GitHub | ✔ | ✘ |
| Gerenciar contas e infraestrutura | ✔ | ✘ |
| Configurar deploy | ✔ | ✘ |

**Uma nuance que a matriz não diz e a Evidência tem de dizer:** o repositório é **público** desde
2026-09-01 (D-04). "Acessar o repositório GitHub" na linha do EDITOR significa **acesso de
escrita/administração** — leitura, qualquer pessoa do mundo tem, inclusive o professor. A prova
correta é que `haroldo.lima@ufma.br` **não é colaborador** do repositório e não consegue empurrar
commit direto; os commits dele chegam pelo GitHub App do TinaCloud, não por conta própria.

### O passo humano, e o que ele tem de devolver

**Quem:** Prof. Haroldo (stakeholder/usuário-chave).
**O que ele faz:**
1. Aceita, no e-mail `haroldo.lima@ufma.br`, o convite do TinaCloud.
2. Entra em <https://haroldo-page.and-near.workers.dev/admin> com essa conta.
3. Edita **um** item existente (sugestão: a `descricao` de uma linha de pesquisa) e salva.
4. Tenta, uma a uma, as ações que a matriz nega ao EDITOR, e **descreve o que a tela respondeu**.

**O que ele tem de devolver, e sem o que este plano não fecha:**
- confirmação de que o convite chegou e foi aceito, com a data;
- o que o menu do painel mostrou a ele (as cinco coleções? mais alguma coisa?);
- o item que editou e o texto que digitou;
- **para cada linha "✘" da matriz**: o que apareceu quando ele tentou — botão ausente, tela de
  permissão negada, ou (achado grave) a ação disponível;
- se algum passo o confundiu — insumo direto para o manual da fase 5 (RNF-05, R-07).

**A sessão é dele.** Não peça a senha, não peça para "usar a conta dele um minutinho", não
compartilhe credencial. Se ele não estiver disponível, o plano fica **bloqueado** e isso é
registrado — não se substitui por "o ADMIN testou e deve funcionar igual". Sessão assistida (ele
na máquina dele, compartilhando a tela) é aceitável e recomendável, porque encurta o ciclo de
perguntas.

### O que este plano NÃO faz

- ⛔ **Não cronometra o ciclo** (M-02 é o plano 029) — mas registre, se der, o horário do save e o
  horário em que a versão nova apareceu; é insumo, não critério.
- ⛔ **Não treina o professor.** Treinamento e manual são a fase 5 (M-01, RNF-05). Aqui ele
  executa um roteiro curto, com você junto.
- ⛔ **Não cria conteúdo novo.** Editar item existente basta e evita lixo num repositório público
  atribuído a uma pessoa real.
- ⛔ **Não altera configuração nenhuma** no TinaCloud, no GitHub ou na Cloudflare além de criar o
  convite.

### Armadilhas do painel que o professor vai encontrar — avise ANTES, não depois

Se ele tropeçar nelas sem aviso, o registro do plano vira "o painel está quebrado" e o achado se
perde:

- **Alteração em campo que já tinha valor pode ser descartada em silêncio** ao voltar de um
  subpainel (planos 020 e 021). Contorno: **salvar sem sair do subpainel**. Confira sempre o
  arquivo gravado — a tela não é prova.
- **O painel deixa salvar item de lista com subcampo obrigatório vazio** — o erro só aparece no
  build.
- Os botões estruturais do painel (Save, Delete, Add) estão **em inglês** — é o esperado (A-08,
  Q-02), não um defeito.

## Passos

1. 🧑 **(orquestrador)** No painel do TinaCloud, convidar `haroldo.lima@ufma.br` com papel
   **EDITOR**.
   → verify: cole o que o painel mostrou — usuário listado, papel atribuído, estado do convite —,
   e o contador de usuários (deve indicar 2 de 2 após o aceite).
2. 🧑 **(professor)** Aceitar o convite pelo e-mail institucional.
   → verify: data e confirmação, registradas por quem acompanhou.
3. 🧑 **(professor)** Entrar em `/admin` de produção com a conta dele.
   → verify: descreva a tela de login e a tela pós-login. Liste o menu que **ele** viu — comparar
   com o que o ADMIN viu no plano 026 é parte do teste.
4. 🧑 **(professor)** Editar um item existente e salvar, com marcador rastreável e datado.
   → verify: (a) commit na `main` — SHA, autor e mensagem colados; note se o commit é atribuído
   ao professor ou ao app do TinaCloud, e registre qual (RNF-16, §9); (b) frontmatter gravado
   colado; (c) build automático disparado, com o SHA batendo.
5. 🧑 **(professor)** Verificar a linha "Publicar / despublicar" da matriz: alternar o interruptor
   `publicado` de um item e voltar ao valor original.
   → verify: os dois saves conferidos **no arquivo**, não na tela (armadilha do plano 020 — o
   `publicado` é a vítima mais provável dela).
6. 🧑 **(professor)** Verificar "Enviar imagens": subir uma imagem pequena por um campo de imagem.
   → verify: o que o painel respondeu e onde o arquivo foi parar (`public/uploads/`, §7.5). Se o
   TinaCloud recusar por limite de assets do plano gratuito (≤ 100 MB, §7.4), registre o texto do
   erro. Remova a imagem de teste depois, pelo painel, e registre a remoção.
7. 🧑 **(professor)** Tentar, uma a uma, as quatro linhas "✘" da matriz e registrar o que a
   interface respondeu:
   a. alterar schema/campos do painel;
   b. alterar código, estilo ou layout por alguma via do painel;
   c. acessar configurações do projeto no TinaCloud (tokens, integrações, usuários);
   d. acessar configuração de deploy (Cloudflare) e o repositório com escrita.
   → verify: uma linha de Evidência por item, com o que a tela mostrou. **Ausência de botão conta
   como prova** desde que descrita ("no menu lateral não existe item X"); "não deve dar" **não**
   conta.
8. 🧑 **(orquestrador)** Conferir na página de colaboradores do GitHub que `haroldo.lima@ufma.br`
   **não** é colaborador do repositório, e registrar a nuance do repositório público.
   → verify: a lista de colaboradores, transcrita.
9. 🧑 **(orquestrador)** Comunicar ao stakeholder que as duas vagas do plano gratuito estão
   ocupadas (A-01, R-04) e registrar a comunicação.
   → verify: uma linha na Evidência, com data.

## Critérios de aceitação

- [ ] Usuário `haroldo.lima@ufma.br` criado no TinaCloud com papel **EDITOR**, convite **aceito**
- [ ] Contador de usuários do plano gratuito mostrando 2 de 2, colado
- [ ] O professor entrou no `/admin` **de produção** com a conta dele (RF-01), com a tela descrita
- [ ] Uma edição salva **pela sessão do professor**, com commit na `main` (SHA, autor, mensagem) e
      o frontmatter gravado colados
- [ ] Interruptor `publicado` alternado e conferido **no arquivo** nos dois sentidos
- [ ] Envio de imagem exercitado, com o resultado (sucesso ou erro literal) registrado
- [ ] **As quatro linhas "✘" da matriz da §9 verificadas uma a uma**, com o que a interface
      respondeu em cada — item 5 do §12
- [ ] `haroldo.lima@ufma.br` **não** é colaborador do repositório GitHub, com a nuance do
      repositório público registrada
- [ ] Comunicação de A-01/R-04 (duas vagas ocupadas) registrada
- [ ] Nenhuma configuração alterada além da criação do convite
- [ ] Dificuldades relatadas pelo professor registradas como insumo do manual da fase 5
- [ ] `git status --short` mostrando apenas o item editado
- [ ] §12 do PRD (itens 4 e 5 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao
      promover `Status: DONE`

## Evidência

> **Execução parcial, registrada em 2026-09-11.** O plano **não** está DONE e o `Status:`
> continua `TODO`. O que segue é (a) o registro formal do bloqueio e (b) os dois passos de
> orquestrador que não dependem do professor e foram executados. O vocabulário de `Status:` deste
> projeto tem dois valores — `TODO` e `DONE` — e não foi inventado um terceiro para descrever o
> bloqueio: ele mora aqui.

### Registro de bloqueio — 2026-09-11

**O plano está bloqueado no stakeholder.** Sete dos nove passos (2 a 7) e sete dos treze critérios
de aceitação exigem a **sessão do próprio professor**, com as permissões da conta dele. O plano
proíbe explicitamente o contorno:

> "A sessão é dele. Não peça a senha, não peça para 'usar a conta dele um minutinho', não
> compartilhe credencial. Se ele não estiver disponível, o plano fica **bloqueado** e isso é
> registrado — não se substitui por 'o ADMIN testou e deve funcionar igual'."

**Decisão do stakeholder em 2026-09-11:** **não criar o convite ainda.** O passo 1 dispara um
e-mail real para `haroldo.lima@ufma.br` e não foi executado — **nada foi alterado no TinaCloud**,
e o contador de usuários do plano gratuito continua em 1 de 2, com a vaga do EDITOR livre.

**O que falta para desbloquear:** disponibilidade do professor para uma sessão assistida (ele na
máquina dele, compartilhando a tela — a forma que o plano recomenda, porque permite avisá-lo das
armadilhas do painel **antes** de ele tropeçar nelas e encurta o ciclo de perguntas).

**Por que isto não é desculpa para adiar a fase.** Os planos **030, 031, 032 e 033** são de agente
e não dependem de pessoa nenhuma; o README da fase já recomendava rodá-los "enquanto se agenda a
sessão do professor". O bloqueio do 027 não bloqueia a fase — bloqueia a linha 027 → 029.

### Passo 8 — o EDITOR não tem acesso de escrita ao repositório (orquestrador, terminal)

Executado porque não depende do professor. Saída literal do `gh`:

```
=== colaboradores do repositorio ===
abbadrava | admin | admin=true push=true

=== visibilidade ===
private=false | visibility=public | org=researchgroups-ufma

=== convites pendentes ===
(nenhum)
```

**A matriz fala só de colaborador, mas acesso por organização passaria despercebido**, então os
outros dois caminhos foram fechados também:

```
=== membros da organizacao ===
abbadrava

=== permissao default da org para repos ===
default_repository_permission=read | members_can_create_repos=true

=== equipes com acesso ao repo ===
(nenhuma)
```

**Três caminhos verificados e fechados:** `haroldo.lima@ufma.br` não é colaborador do repositório,
não é membro da organização `researchgroups-ufma`, e não existe equipe com acesso. O único
colaborador e o único membro da organização é `abbadrava` — a conta ADMIN do desenvolvedor.

**A nuance do repositório público, que a matriz não diz.** O repositório é **público** desde
2026-09-01 (D-04): `private=false`, `visibility=public`. Portanto "Acessar o repositório GitHub ✘"
na linha do EDITOR significa **escrita e administração**, não leitura — leitura tem qualquer
pessoa do mundo, o professor inclusive, sem conta nenhuma. Ainda que fosse membro da organização,
`default_repository_permission=read` não daria escrita. Os commits do professor chegarão pelo
GitHub App do TinaCloud, não por conta própria dele.

**Ressalva de método, dita por inteiro:** colaborador no GitHub é identificado por **login**, não
por e-mail. O que está provado é que **existe um único colaborador e um único membro da
organização**, e que ele é a conta do desenvolvedor — o que fecha a questão para qualquer conta do
professor, seja qual for o login dela. Não foi feita (nem é possível) uma consulta por
`haroldo.lima@ufma.br` diretamente.

### Passo 9 — comunicação de A-01 / R-04 (orquestrador)

**Comunicado ao stakeholder em 2026-09-11**, antes de qualquer ação sobre o convite: com o
professor dentro, **as duas vagas do plano gratuito do TinaCloud ficam ocupadas** (1 já é do ADMIN,
plano 011). Um terceiro editor — bolsista, secretaria — exigirá **plano pago ou migração para
Decap** (R-03, R-04).

Como o convite não foi criado, a segunda vaga **continua livre** nesta data. A comunicação fica
registrada aqui para que o passo 9 não precise ser refeito quando a sessão acontecer.

### Passos 1 a 7 — não executados

| Passo | Quem | Estado |
|---|---|---|
| 1. Convidar `haroldo.lima@ufma.br` como EDITOR | orquestrador | **não executado** — por decisão do stakeholder em 2026-09-11; nada alterado no TinaCloud |
| 2. Aceitar o convite | professor | bloqueado (depende do 1) |
| 3. Entrar no `/admin` de produção | professor | bloqueado |
| 4. Editar um item e salvar | professor | bloqueado |
| 5. Alternar `publicado` nos dois sentidos | professor | bloqueado |
| 6. Enviar imagem | professor | bloqueado |
| 7. As quatro linhas "✘" da matriz da §9 | professor | bloqueado |

`git status --short` não mostra alteração alguma em `content/` — nenhuma edição foi feita por
conta deste plano, o que é o esperado enquanto os passos do professor não acontecem.
