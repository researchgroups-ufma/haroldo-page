# Plano 027 — Roteiro humano: usuário EDITOR do professor e a matriz de permissões da §9

**Status:** TODO
**RFs cobertos:** RF-01, RF-02; RNF-07; fase 2, **itens 4 e 5** do §12; matriz papel × permissão
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

## Objetivo

O professor tem conta própria no TinaCloud, com papel **EDITOR**, e o que ele pode e não pode
fazer está verificado **exercitando as interfaces** contra a matriz da §9 — não contra a
documentação do TinaCloud.

Fecha os itens 4 e 5 do checklist da fase 2. O item 5 ("verificado que o EDITOR **não** consegue
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

<Preenchida por quem executar. Nenhuma linha da matriz se declara satisfeita por leitura de
documentação do TinaCloud: a prova é o que a interface respondeu à tentativa. Se o professor não
estiver disponível, o plano fica bloqueado e o bloqueio é registrado — não se substitui a sessão
dele pela do ADMIN.>
