# ADR-0003 — Painel por formulários, sem visual editing

- **Status:** Aceita
- **Data:** 2026-09-10
- **Decisão do PRD:** D-02 (§7.2)
- **Fase:** 1 (implementada nos planos 015 a 017)

## Contexto

O TinaCMS oferece dois modos de edição: formulários (o professor preenche campos rotulados em
vocabulário acadêmico, como "Adicionar publicação") e _visual editing_ (editar clicando no texto
da própria página renderizada). O visual editing é a vitrine do Tina, mas exige que a página seja
renderizada por requisição — `output: 'server'`, um adapter e uma ilha React do Tina embutida em
cada página pública — porque é assim que o painel sabe qual texto da tela corresponde a qual
campo do schema. O ADR-0001 já havia fixado o site como 100% estático, sem adapter e sem SSR
(D-01).

## Decisão

O painel do `/admin` edita **só por formulários**. Nenhuma página pública carrega código do Tina
nem permite clicar no texto para editar.

## Alternativas consideradas

**Visual editing do Tina.** Rejeitada: o único ganho concreto é "ver a página enquanto edita" —
conveniência, não requisito do briefing. O custo seria contrariar o ADR-0001 (exigiria
`output: 'server'` e `@astrojs/cloudflare`), colocar as requisições públicas dentro da cota de
100 mil/dia do plano gratuito do Workers e abrir uma classe de falhas em produção (erros que só
aparecem sob tráfego) que o site estático não tem. O fluxo do briefing — login, formulário,
publicar — é atendido integralmente sem isso.

## Consequências

- O professor não vê a página real enquanto edita; vê o formulário e, quando o campo é rich-text,
  uma pré-visualização formatada dentro do próprio painel.
- Custo aceito pelo stakeholder: não se clica no texto da página para editar (R-05 registra a
  mitigação — explicação no manual e pré-visualização do campo).
- O site público continua sem carregar React (medido no plano 015): nenhuma rota pública depende
  do Tina.
- Qualquer pedido futuro de visual editing implica revisitar o ADR-0001, não contornar este ADR.

## Referências

- PRD §3.2 (NG-04), §7.2 (D-01, D-02), R-05
- ADR-0001 — Astro estático, sem adapter e sem SSR
- `plans/fase-0-setup-e-provisionamento/012-roteiro-cloudflare-worker-e-primeiro-deploy.md`
- `plans/fase-1-modelo-de-conteudo/015-instalacao-do-tinacms-e-admin-local.md` — Evidência (React
  medido fora do bundle público)
