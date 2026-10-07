# Planos da Fase 5 — Polimento e entrega

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo e as armadilhas.

Última atualização: 2026-09-12

**A fase ainda não foi fatiada.** Os dois planos abaixo chegaram aqui **migrados da fase 2** em
2026-09-12; os outros quinze itens do checklist (§12 do PRD) continuam sem plano escrito, e o
`/fatiar` da fase só faz sentido depois que as fases 3 e 4 fecharem — é delas que sai o que o
polimento tem de polir.

**Critério de conclusão da fase** (§6.2 do PRD): *checklist §12 fechado; um usuário EDITOR edita no
`/admin` em produção e a mudança aparece no site sem intervenção do ADMIN; M-01, M-02, M-04 e M-05
atingidas.*

## Estado

| Plano | Título | Status | Executável por | Agente | Commits |
|---|---|---|---|---|---|
| 027 | 🧑 Usuário EDITOR do professor e a matriz de permissões da §9 | ⬜ TODO | **stakeholder** (professor) | nenhum | — |
| 029 | 🧑 Ciclo ponta a ponta cronometrado (M-02) e o critério do §6.2 | ⬜ TODO | orquestrador + **stakeholder** | nenhum | — |

**Numeração é global e contínua e não é ordem de execução.** Os números 027 e 029 vieram da fase 2
e **não foram renumerados** — a convenção do `plans/README.md` é que um "plano 027" identifique um
arquivo só, para sempre, porque ele já está citado em commits, Evidências e no PRD. O que mudou foi
a pasta, porque mudou o checklist que eles fecham.

## Por que estes dois planos estão aqui

Decisão do stakeholder em **2026-09-12**, tomada em sabatina e registrada em
[`docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`](../../docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md)
(4 decisões): **tudo que exige uma sessão com o professor passa para esta fase; o que não exige é
executado antes.** O motivo é de sequência, não de escopo — é preferível levar ao professor um site
navegável do que gastar a sessão dele verificando um painel sobre um site que ainda não renderiza
uma linha de conteúdo.

Isso obrigou a mexer no PRD, e a mudança não é cosmética: **o critério de conclusão da fase 2 era
literalmente o passo do professor.** O §6.2 da fase 2 passou a ser o ciclo do **ADMIN** — já
demonstrado pelo plano 026 — e o critério do EDITOR **veio para cá**, junto com três itens do §12:

| Item do §12 da fase 5 | Vinha de | Plano |
|---|---|---|
| 11 — usuário EDITOR criado, permissões verificadas contra a matriz da §9 | item 4 da fase 2 | 027 |
| 12 — verificado que o EDITOR **não** altera schema, código ou configuração | item 5 da fase 2 | 027 |
| 13 — ciclo ponta a ponta cronometrado, edição do EDITOR visível no site (M-02) | item 7 da fase 2 | 029 |

O §3.3 também mudou: **M-02 passa a ser medida só nesta fase**, não mais "nas fases 2 e 5". Medir
na fase 2 congelaria a `main` (R-12) às vésperas da fase 3, e mediria o tempo de build de um site
sem páginas — número que a própria fase 3 invalidaria.

**Nenhum requisito mudou. Só onde ele é verificado.**

## Ordem de execução

```
(fase 3)  →  (fase 4)  →  demais planos da fase 5, ainda não fatiados
                                    │
028 (fase 2)  ────────────────────→ 029
027  ───────────────────────────────┘
```

O **027 vem antes do 029**: não se cronometra o ciclo do EDITOR antes de o EDITOR existir. O **028**
é da fase 2 e já terá fechado — é ele que garante que uma falha de build durante a medição chega ao
ADMIN em vez de passar despercebida.

**O 027 e o 029 podem ser executados na mesma sessão com o professor**, e essa é a intenção da
migração: o convite, a verificação da matriz de permissões, a medição do ciclo, o treinamento e a
validação assistida (M-01) são a mesma conversa com a mesma pessoa.

## Por onde isto pode dar errado

**1. A sessão do EDITOR não se substitui pela do ADMIN.** É literalmente o que o critério pede.
Se o professor não estiver disponível, o plano fica **bloqueado e registrado** — critério de
aceitação não se reescreve para caber no resultado (lição 5 da fase 0). A migração de 2026-09-12
**não afrouxou o critério**: transferiu-o de fase, por inteiro, com a exigência intacta.

**2. Enquanto o 029 cronometrar, a `main` fica congelada.** Ele mede tempo de build em 10
publicações; qualquer outro push durante a medição enfileira build (R-12) e contamina a amostra.

**3. Duas vagas no TinaCloud, e a segunda é a do professor.** Hoje só a do ADMIN está ocupada — o
convite nunca chegou a ser criado. Ao fim do 027 o plano gratuito fica cheio (A-01); um terceiro
editor passa a exigir plano pago ou Decap (R-03, R-04).

**4. Prova de painel de terceiro é a interface, não o código.** Vale aqui como valeu na fase 2,
e com força maior nas linhas "✘" da matriz da §9: ausência de botão só conta se estiver descrita.
Este projeto já aprovou uma correção que não funcionava porque a prova foi leitura de
`node_modules` em vez de exercício da interface.

**5. A Q-05 (domínio próprio) bloqueia esta fase.** Continua aberta no §16, com o stakeholder como
responsável e prazo "antes da fase 5". Ela decide URL canônica, sitemap e indexação (A-07).

   **Roteiro da migração, levantado em 2026-10-07** (exemplo: `haroldolima.com`; ainda sem plano —
   vira plano com sabatina curta quando o domínio existir):
   1. Domínio como zona na Cloudflare (nameservers do registrador apontados para ela, ou registro
      pela própria Cloudflare) — pré-requisito de *Custom Domain* em Worker.
   2. *Custom Domain* no Worker `haroldo-page` (painel ou `routes = [{ pattern = "...",
      custom_domain = true }]` no `wrangler.toml`); `www` redirecionado por regra da zona.
   3. URL do site nos três lugares: `DEFAULT_SITE_URL` (`src/lib/config.ts`), `site`
      (`astro.config.mjs`) e `PUBLIC_SITE_URL` nas variáveis de **build** do Workers Builds.
      Canonical, `hreflang` e sitemap derivam daí.
   4. `/admin` no domínio novo: conferir no app.tina.io se o projeto precisa do endereço novo na
      lista de URLs do site (não verificado) e testar o login antes de avisar o professor.
   5. Indexação: tirar `Disallow: /` do `public/robots.txt` e o `X-Robots-Tag: noindex` do
      `public/_headers`, reativar a linha `Sitemap` (RF-30); cadastrar no Search Console.
   6. `*.workers.dev`: Worker só de assets não redireciona; desligar (`workers_dev = false`, conferir
      antes o efeito nas prévias da `design`) ou mantê-lo com `noindex`.

   Decisões a sabatinar: `www` ou raiz como canônico, destino do `workers.dev`, e se o convite do
   plano 027 espera o domínio (o professor guardaria já o endereço definitivo do `/admin`).

## Insumos que outras fases deixaram para cá

- **`docs/avisos-do-painel-para-o-manual.md`** — entrega do plano 033 (fase 2): o que o painel deixa
  o professor fazer de errado, com origem citada arquivo por arquivo. O manual do professor (§10.5)
  é **obrigado** a cobrir cada caso.
- **Os três achados do plano 026** sobre o painel em produção — vocabulário de arquivo um clique
  adiante do menu, trilha que trunca `2026.2-...` no ponto, e o aviso do TinaCloud sobre troca do
  sistema de autenticação em outubro (R-03). O 033 os absorve.
- **A dívida 7(b) da fase 1**, deliberadamente adiada para a fase 3: não existe hoje campo com
  `list: true` **e** `options` para exercitar `classifyTina`.

## Portão de qualidade

Vale integralmente o da fase 0 (seção "Portão de qualidade" daquele README): um plano só vira
`DONE` com **verificação independente com saída real** *e* **revisão de código aprovada**. Planos
com passo em painel de terceiro acrescentam uma linha própria: o que a interface mostrou,
transcrito ou capturado, com data e horário. Sem isso, o plano não fecha.
