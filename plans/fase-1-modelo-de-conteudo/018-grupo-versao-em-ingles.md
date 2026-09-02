# Plano 018 — Grupo "Versão em inglês (opcional)" nas coleções traduzíveis

**Status:** TODO
**RFs cobertos:** fase 1, item "Grupo 'Versão em inglês (opcional)'"; D-03; RN-06, RN-07, RN-09
**Depende de:** planos 016 (Zod) e 017 (Tina)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Cada coleção traduzível ganha um grupo `en` **opcional**, recolhível no painel, com apenas os
campos que fazem sentido traduzir — em `src/content.config.ts` e em `tina/config.ts`, em
paridade.

## Arquivos afetados

- `src/content.config.ts` — acrescentar o grupo `en`
- `tina/config.ts` — acrescentar o grupo `en`
- testes dos schemas — cobrir o grupo opcional

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### A decisão D-03, e por que ela é assim

> i18n por grupo "Versão em inglês" recolhível **dentro do mesmo arquivo**, com fallback por
> campo. Alternativa rejeitada: pastas `pt/` e `en/` espelhadas (padrão do LaFiM com Decap).
> Motivo: um único editor — um arquivo por item elimina o risco de par órfão e mantém um
> formulário só. O fallback vira "campo vazio ⇒ usa PT".

**Consequência para este plano:** **um** arquivo por item, **um** formulário. Não crie pasta
`en/`, não duplique coleção, não crie item espelhado.

### O que é traduzível em cada coleção (§7.3 — transcreva, não deduza)

| Coleção | Campos do grupo `en` |
|---|---|
| `perfil` | `cargo`, `instituicao`, `departamento`, `bio`, `resumo_home`, `formacao[]` (só o título), `areas[]` |
| `linhas-pesquisa` | `titulo`, `resumo`, `corpo` |
| `projetos` | o PRD diz "grupo `en`" sem listar campos — **decida a partir de RN-07 e registre**: o traduzível é `titulo` e `descricao`; `periodo`, `financiador`, `status` e `colaboradores` são factuais |
| `disciplinas` | `nome`, `descricao`, `ementa` |
| `publicacoes` | **apenas `resumo`** — título e autores **não** se traduzem (RN-07) |

⚠️ **`publicacoes` é a armadilha.** A tentação é traduzir o título. A RN-07 proíbe: o título de
um artigo é dado factual, existe uma vez só. Traduzir produziria duas citações divergentes do
mesmo trabalho.

**RN-09 — o português é canônico.** Todo item existe em PT; o inglês é opcional. Portanto o
grupo `en` inteiro é opcional, **e cada campo dentro dele também**. Um item com o título em
inglês preenchido e o resumo em inglês vazio é válido.

**RN-06 — fallback por campo, não por item.** Campo vazio no `en` ⇒ a rota `/en` exibe o valor
em português correspondente. **A implementação do fallback é da fase 4**, não deste plano. Aqui
só o schema e o formulário. Não escreva a função de fallback.

**No painel, o grupo tem de ser recolhível** e vir depois dos campos em português, para não
poluir o formulário de quem só escreve em PT.

### Paridade

Os dois arquivos precisam concordar. O teste que garante isso é o plano 019 — mas ele só
consegue comparar se este plano tratar os dois lados igual. Se você acrescentar um campo ao
`en` de um lado e esquecer o outro, o 019 vai reprovar.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Acrescentar o grupo `en` opcional às cinco coleções em `src/content.config.ts`, com os campos
   da tabela acima.
   → verify: `npm run build` verde; um item sem `en` continua válido.
2. Acrescentar o mesmo grupo em `tina/config.ts`, recolhível e depois dos campos em PT.
   → verify: no `/admin`, o grupo aparece recolhido e não atrapalha o formulário em PT.
3. Registrar a decisão sobre os campos traduzíveis de `projetos`, que o PRD não lista.
   → verify: decisão e justificativa por RN-07 na Evidência.
4. Escrever testes: item sem `en` é válido; item com `en` parcial é válido; campo factual **não**
   aceito dentro de `en`.
   → verify: `npm run test` verde, com canário provando falsificabilidade.
5. **Verificação objetiva:** preencher o `en` de um item pelo painel e conferir o frontmatter.
   → verify: `git diff` mostra o grupo `en` aninhado no mesmo arquivo, não em arquivo novo.

## Critérios de aceitação

- [ ] Grupo `en` **opcional** nas cinco coleções, nos dois arquivos, em paridade
- [ ] Campos traduzíveis conforme a tabela; decisão de `projetos` registrada
- [ ] **`publicacoes` traduz apenas `resumo`** — título e autores fora do grupo (RN-07)
- [ ] Cada campo dentro de `en` é individualmente opcional (RN-09)
- [ ] Um item **sem** grupo `en` continua válido
- [ ] Grupo recolhível no painel, depois dos campos em português
- [ ] **Um arquivo por item** — nenhuma pasta `en/`, nenhum item espelhado (D-03)
- [ ] Função de fallback **não** implementada — é fase 4
- [ ] Testes cobrindo grupo ausente, parcial e campo factual recusado, provados falsificáveis
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

<Preenchido pelo executor: saída dos quatro comandos de qualidade, `git diff` de um item com
`en` preenchido pelo painel, decisão sobre os campos de `projetos`, e a saída do canário.>
