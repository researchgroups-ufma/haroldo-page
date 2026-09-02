# Plano 017 — As cinco coleções no `tina/config.ts`, com rótulos em português e templates de nome

**Status:** TODO
**RFs cobertos:** RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10; RN-08; D-05
**Depende de:** plano 015 (Tina instalado). Pode rodar em paralelo com o 016.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`tina/config.ts` descreve as cinco coleções da §7.3 com **vocabulário acadêmico em português**,
textos de ajuda, o interruptor Rascunho/Publicado e nomes de arquivo gerados por template — o
professor nunca digita nome de arquivo.

## Arquivos afetados

- `tina/config.ts` — expandir de uma coleção para cinco

> Não toque em `src/content.config.ts` (plano 016). Se notar divergência entre os dois, **anote
> e reporte** — reconciliar é o plano 019, que é onde o teste de paridade vive.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). O plano
015 deixou o Tina instalado com uma coleção `perfil` mínima e `/admin` funcionando.

### O ponto do plano: o painel é para um professor, não para um desenvolvedor

A **RF-03** é explícita: *"o painel apresenta as coleções em vocabulário acadêmico"* — o menu lê
"Perfil", "Linhas de pesquisa", "Projetos", "Disciplinas", "Publicações". Nunca "collections",
"entries", "slug" ou "frontmatter".

A **A-08** foi confirmada pela Q-02 em 2026-09-01: **a interface estrutural do Tina fica em
inglês mesmo** (botões "Save", "Create New") e isso é aceitável. O que tem de estar em português
é tudo que o projeto controla: nomes de coleção, rótulos de campo e textos de ajuda.

**Texto de ajuda em todo campo não óbvio.** `resumo_home` precisa dizer "1–2 frases exibidas na
Home". `status` de disciplina precisa dizer que a transição é manual (RN-03). `destaque` precisa
dizer que a publicação aparece na Home. `url` de material precisa dizer que serve qualquer link
— Drive, repositório institucional, arXiv, YouTube (D-07).

### Regras que este plano materializa

- **RN-08 — nome de arquivo por template, nunca digitado.** Disciplinas:
  `{semestre}-{slug(nome)}.md`. Publicações: `{ano}-{slug(titulo)}.md`. Para
  `linhas-pesquisa` e `projetos` o PRD não prescreve template — **escolha um, coerente com os
  dois acima, e registre a escolha na Evidência.** O projeto já tem um `slugify` em `src/lib/`
  com testes (plano 005): confira se o Tina pode reusá-lo ou se a lógica precisa ser espelhada,
  e **diga qual dos dois na Evidência**.
- **RN-01 / D-04 — interruptor Rascunho/Publicado** nas quatro coleções de listagem, com rótulo
  que um professor entenda. Não em `perfil`.
- **D-05 — aulas, listas e materiais embutidos** na disciplina, como campos de objeto repetíveis.
  O professor abre a disciplina e vê tudo num lugar só. **Não** crie coleção separada de aulas.
  Configure o rótulo de item da lista para mostrar algo útil (o título da aula, não "Item 1").
- **D-02 — sem visual editing.** Formulários, só.
- **D-07 — URL livre.** Nenhuma validação de domínio.

**O grupo "Versão em inglês" NÃO entra aqui** — é o plano 018.

**Não crie a coleção `noticias`** (v1.1, NG-01).

### Cuidado com a paridade

A **D-06** diz que o Zod é o portão de validação e o Tina é a interface de entrada, com paridade
garantida por teste. Um campo que exista só no Tina produz frontmatter que o Zod rejeita, e o
build quebra com um erro que o professor não sabe diagnosticar (F-09, RNF-09). Escreva os
campos olhando a §7.3, **não** olhando o `src/content.config.ts` — assim o teste do plano 019
compara duas leituras independentes da mesma fonte, em vez de uma cópia de si mesma.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Transcrever as cinco coleções da §7.3 para `tina/config.ts`, com rótulos em português.
   → verify: `npm run build` verde; `/admin` lista as cinco coleções com os nomes corretos.
2. Acrescentar texto de ajuda a todo campo não óbvio.
   → verify: liste na Evidência os campos que receberam ajuda e os que julgou óbvios.
3. Configurar os templates de nome de arquivo (RN-08) das quatro coleções de pasta.
   → verify: criar um item de cada pelo painel e conferir o nome do arquivo gerado.
4. Configurar o interruptor Rascunho/Publicado nas quatro coleções de listagem.
   → verify: visível no formulário, com rótulo em português.
5. Configurar aulas, listas e materiais como listas embutidas com rótulo de item útil.
   → verify: acrescentar uma aula pelo painel e ver o título dela na lista, não "Item 1".
6. **Verificação objetiva:** criar um item de cada coleção pelo painel e conferir os arquivos.
   → verify: `git status --short` lista os cinco arquivos, com os nomes que o template previa.
   Remova-os ao fim — o conteúdo real é o plano 020.

## Critérios de aceitação

- [ ] As cinco coleções em `tina/config.ts`, sem `noticias`
- [ ] Nomes de coleção e **rótulos de todos os campos em português** (RF-03)
- [ ] Texto de ajuda em todo campo não óbvio, com a lista dos que ficaram sem e o motivo
- [ ] Templates de nome de arquivo nas quatro coleções de pasta (RN-08); escolha registrada
      para `linhas-pesquisa` e `projetos`, que o PRD não prescreve
- [ ] Registrado se o `slugify` de `src/lib/` é reusado ou espelhado
- [ ] Interruptor Rascunho/Publicado nas quatro de listagem; ausente em `perfil`
- [ ] Aulas, listas e materiais **embutidos**, com rótulo de item útil (D-05)
- [ ] Grupo "Versão em inglês" **não** incluído — é o plano 018
- [ ] Visual editing **não** configurado (D-02)
- [ ] **Verificação objetiva:** um item de cada coleção criado pelo painel, com o nome de
      arquivo previsto pelo template, e removido depois
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] Divergências percebidas em relação ao `src/content.config.ts` **anotadas e reportadas**,
      não corrigidas aqui

## Evidência

<Preenchido pelo executor: saída dos quatro comandos de qualidade, nomes dos arquivos gerados
pelos templates, captura ou descrição do formulário de disciplina mostrando as listas
embutidas, lista de campos com e sem texto de ajuda, e as divergências percebidas com o Zod.>
