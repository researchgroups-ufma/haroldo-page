# ADR-0005 — Rascunho como campo `publicado`, não Editorial Workflow

- **Status:** Aceita
- **Data:** 2026-09-10
- **Decisão do PRD:** D-04 (§7.2, RN-01, NG-07)
- **Fase:** 1 (implementada no plano 017)

## Contexto

O professor precisa poder deixar um item pela metade sem que ele apareça no site. O TinaCloud
oferece _Editorial Workflow_ (rascunho por branch, com aprovação antes de ir para `main`), mas
esse recurso é exclusivo do plano Team Plus (US$ 41/mês) — o projeto opera no plano Free (G-04,
RNF-14).

## Decisão

Toda coleção de listagem (`linhas-pesquisa`, `projetos`, `disciplinas`, `publicacoes`) ganha um
campo booleano `publicado`, obrigatório, com `defaultItem: { publicado: false }` para o item novo
não nascer visível por omissão. `perfil` não tem o campo — é singleton, sempre visível. A
renderização pública filtra por `publicado: true` (RN-01); é trabalho da fase 3.

## Alternativas consideradas

**Editorial Workflow do TinaCloud.** Rejeitada: indisponível no plano gratuito. Contratar o
Team Plus só para isto não se justifica frente ao custo zero que o projeto persegue (G-04).

## Consequências

- **Consequência aceita desde 2026-09-01, com o repositório tornado público:** `publicado: false`
  esconde o item do _site_, não do _GitHub_ — o arquivo e todo o histórico de edição ficam
  legíveis por qualquer pessoa que abra o repositório. RN-01 documenta essa distinção
  explicitamente.
- Sem fluxo de aprovação por terceiro: o professor publica sozinho, sem revisão antes do ar
  (coerente com G-01 — ele não depende do desenvolvedor).
- `defaultItem: { publicado: false }` é também o gatilho mais provável da armadilha do descarte
  silencioso do formulário Tina (achado do plano 020, registrado no README da fase 1): por contar
  como valor inicial, o interruptor "Publicado" é o campo mais propenso a reverter ao voltar de
  um subpainel sem que a tela avise.

## Referências

- PRD §7.2 (D-04), RN-01, NG-07, R-05
- `plans/fase-1-modelo-de-conteudo/017-colecoes-completas-no-tina-config.md` — Evidência
- `plans/fase-1-modelo-de-conteudo/README.md` — armadilha do descarte silencioso (plano 020)
