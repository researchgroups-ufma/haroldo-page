# ADR-0011 — Vigia agendado no GitHub Actions para a falha do build de deploy

- **Status:** Aceita
- **Data:** 2026-09-12
- **Decisão do PRD:** F-02, RNF-04; fase 2, item 4 do §12
- **Fase:** 2 (plano 028)

## Contexto

O F-02 exige que, quando um build falha depois de um save do professor, o ADMIN receba **alerta
por e-mail**. O plano 028 foi escrito supondo que o Cloudflare Workers Builds, que faz o build de
deploy (plano 025, ADR-0009), notificasse falha por e-mail. **Não notifica.** Medido em 2026-09-12
na conta `98e35087677f329c2adbf68711ecebbf`:

- `GET /accounts/<id>/alerting/v3/available_alerts`: 30 grupos de alerta, **nenhum de Workers
  Builds**. `pages_event_alert` é do Cloudflare Pages; `workers_observability_alert` é erro do
  Worker em runtime, não de build.
- O painel, conferido pelo ADMIN, não tem opção de notificação de build.
- A documentação da Cloudflare (changelog de 2026-01-09) oferece só **Event Subscriptions**: os
  eventos de build vão para uma Queue que um Worker próprio consome.

O `ci.yml` roda o mesmo `build:pipeline`, e o GitHub avisa por e-mail quando ele falha. Só que ele
**não é o build de deploy**: é um portão paralelo (ADR-0009), e os dois podem divergir.

## Decisão

**Um workflow agendado, `.github/workflows/vigia-do-deploy.yml`, lê o check run
`Workers Builds: haroldo-page` do commit mais recente da `main` e reprova se o build de deploy
falhou.** A reprovação gera o e-mail de falha do GitHub Actions ao ADMIN.

1. **Gatilho `schedule`, não `push`.** Pela documentação do GitHub, _"notifications for scheduled
   workflows are sent to the user who last modified the cron syntax in the workflow file"_. Num
   workflow de `push`, o e-mail vai para quem empurrou. Quando o professor salva pelo painel,
   quem empurra é o TinaCloud, e esse é o caso que o F-02 descreve.
2. **Uma vez por dia, às 12:17 UTC.** Decisão do stakeholder: o site é pouco editado e o objetivo
   é o ADMIN saber antes de o professor perceber, não em minutos. Fora da hora cheia porque o
   GitHub atrasa agendamentos nesse horário.
3. **Fonte: o check run no GitHub, não a API da Cloudflare.** O `GITHUB_TOKEN` com
   `checks: read` basta; não há secret novo para manter.
4. **Reprova também quando falta o check** num commit com mais de 30 minutos. O Workers Builds só
   cria o check ao terminar; se ele não existe muito depois do commit, o build não foi registrado,
   que é o sintoma do app GitHub ↔ Cloudflare desconectado (plano 025).
5. **Olha só o commit mais recente.** Um save quebrado seguido de um save válido antes da execução
   não gera aviso, e é o correto, porque o site já foi atualizado.

## Alternativas consideradas

- **Queue + Worker notificador (caminho oficial da Cloudflare).** Rejeitada: cria infraestrutura
  nova numa conta compartilhada com outro projeto, e mandar e-mail de um Worker exige Email Routing
  com domínio verificado, que o projeto não tem.
- **Contar com o e-mail do `ci.yml`.** Rejeitada: o CI não é o build de deploy. Um CI verde com
  deploy vermelho (variável de build ausente, falha de plataforma) passaria em silêncio.
- **Gatilho `push` ou `check_run`.** Rejeitada: o e-mail iria para quem disparou o evento (o
  TinaCloud ou o app da Cloudflare), não para o ADMIN.
- **Consultar a API de builds da Cloudflare.** Rejeitada: exige token da Cloudflare como secret,
  com escopo e validade para manter, sem cobrir nada que o check run não cubra.
- **Mover o deploy para o GitHub Actions** (plano B da §7.4). Rejeitada: desfaz o plano 025 para
  resolver um problema de notificação.

## Consequências

- O aviso chega em até ~24 h depois da falha, e **repete uma vez por dia** enquanto a `main`
  continuar quebrada.
- **Risco nomeado: desligamento por inatividade.** _"In a public repository, scheduled workflows
  are automatically disabled when no repository activity has occurred in 60 days."_ Se o professor
  passar 60 dias sem editar, o vigia desliga, e o primeiro save depois disso não é vigiado. Não é
  resolvido aqui; o manual do ADMIN (§10.5, fase 5) tem de dizer como reativar
  (_Actions → Vigia do deploy → Enable workflow_).
- **O destinatário depende de quem mexeu no cron por último.** Quem alterar essa linha passa a
  receber os avisos. Trocar de ADMIN significa essa pessoa fazer um commit no cron.
- **Falso alarme possível:** a idade é medida pela data do commit, não pela do push. Um commit
  feito mais de 30 min antes de ser empurrado, com o vigia rodando logo depois do push, reprova
  sem motivo. É raro com uma execução por dia, e a execução seguinte corrige.
- O e-mail depende das configurações de notificação da conta do ADMIN
  (_Settings → Notifications → Actions_), que ficam fora do repositório.

## Gatilhos de revisão

- A Cloudflare passar a oferecer notificação nativa de falha do Workers Builds.
- O vigia aparecer desativado por inatividade.
- O deploy sair do Workers Builds (o nome do check muda ou deixa de existir).

## Referências

- PRD F-02, RNF-04, §7.4
- `plans/fase-2-pipeline-de-publicacao/028-notificacao-de-falha-de-build-ao-admin.md`, "A emenda
  de 2026-09-12" e Evidência
- `docs/adr/0009-build-de-pipeline-sem-cloud-check.md`: por que o CI não é o portão do deploy
- GitHub Docs, "Events that trigger workflows", seção `schedule`
