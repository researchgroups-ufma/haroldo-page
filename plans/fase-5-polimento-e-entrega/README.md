# Planos da Fase 5 — Polimento e entrega

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo e as armadilhas.

Última atualização: 2026-11-23 — 087 DONE (`7ea9400`…`a018b50`, evidência em `bed5038`): o CI `qualidade` voltou a verde na `main`.

**A fase está parcialmente fatiada.** Têm plano só os itens da auditoria de qualidade de 2026-10-12
(075–085, sabatina
[`CHANGELOG_sabatina_auditoria-qualidade.md`](../../docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md),
9 decisões) e os dois planos **migrados da fase 2** em 2026-09-12 (027 e 029). Os demais itens dos 21
do checklist (§12 do PRD) continuam sem plano escrito.

**Critério de conclusão da fase** (§6.2 do PRD): *checklist §12 fechado; um usuário EDITOR edita no
`/admin` em produção e a mudança aparece no site sem intervenção do ADMIN; M-01, M-02, M-04 e M-05
atingidas.*

## Estado

| Plano | Título | Status | Executável por | Agente | Commits |
|---|---|---|---|---|---|
| 027 | 🧑 Usuário EDITOR do professor e a matriz de permissões da §9 | ⬜ TODO | **stakeholder** (professor) | nenhum | — |
| 029 | 🧑 Ciclo ponta a ponta cronometrado (M-02) e o critério do §6.2 | ⬜ TODO | orquestrador + **stakeholder** | nenhum | — |
| 075 | `/admin` fora da indexação por bloco próprio no `_headers` (RF-30, Decisão 8) | ⬜ TODO | agente (sonnet) | implementer | — |
| 076 | Meta description das páginas fixas (RF-30, Decisões 2 e 9) | ⬜ TODO | agente (sonnet); textos revisados pelo stakeholder | implementer | — |
| 077 | Meta description da disciplina e do item de Extensão (RF-30, Decisão 6) | ⬜ TODO | agente (sonnet) | implementer | — |
| 078 | Open Graph, Twitter card e `public/og.png` (RF-30, Decisões 1 e 9) | ⬜ TODO | agente (sonnet) + orquestrador (imagem, produção) | implementer | — |
| 079 | JSON-LD `Person` + `WebSite` na Home (RF-38, Decisão 7) | ⬜ TODO | agente (sonnet) + orquestrador (validador) | implementer | — |
| 080 | Variantes WebP de `/uploads` com `sharp` e o retrato (Decisão 3) | ⬜ TODO | agente (sonnet) + orquestrador (navegador, §7.2) | implementer | — |
| 081 | Variantes WebP nas demais `<img>` (Decisão 3) | ⬜ TODO | agente (sonnet) + orquestrador (navegador, Lighthouse) | implementer | — |
| 082 | Cabeçalhos de segurança e cache no `_headers` (RNF-17, RNF-18) | ⬜ TODO | agente (sonnet) + orquestrador (`curl`) | implementer | — |
| 083 | CSP do site público por `security.csp` (RNF-17) | ⬜ TODO | agente (sonnet) + orquestrador (medição que escolhe o ramo) | implementer | — |
| 084 | `apple-touch-icon.png` e `favicon.ico` (Decisão 9) | ⬜ TODO | agente (sonnet) + orquestrador (`curl`) | implementer | — |
| 085 | 🧑 Indexação no domínio próprio, HSTS e "Always Use HTTPS" — **BLOQUEADO pela Q-05** | ⬜ TODO | orquestrador + **stakeholder** | nenhum | — |
| 086 | Link opcional em aula e lista; item vazio descartado no painel (RF-07, RF-24, F-09) | ✅ DONE | agente (sonnet) + orquestrador (painel, produção) | implementer | `19ece89` |
| 087 | Dependências atualizadas para o portão de audit voltar a verde, na branch `atualiza-dependencias` (RNF-07, RNF-08, ADR-0010) | ✅ DONE | agente (sonnet) + orquestrador (painel, PR, merge, produção) | implementer | `7ea9400`…`a018b50` |

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

### Os planos da auditoria de qualidade (075–085)

A numeração segue a **ordem de importância** dada pelo stakeholder (Decisão 5), e nenhuma
dependência técnica obrigou trocá-la. Onde um item dependia de outro mais abaixo na lista, a
verificação foi dividida em vez de a ordem mudar (ver "Armadilhas", item 3).

```
075 ──────────────────────────────┬──→ 082 ──→ 084
076 ──→ 077 ──→ 078 ──────────────┘     │
079                                     083
080 ──→ 081
075 (obrigatório) + 076..084 (recomendados) + Q-05 + migração do domínio ──→ 085
```

| Plano | Depende de | Por quê |
|---|---|---|
| 077 | 076 | usa os textos de Ensino e de Extensão como reserva |
| 078 | — | sem dependência de código; depois do 077 para o `og:description` sair por página |
| 081 | 080 | usa `src/lib/images.ts` e a integração |
| 082 | 075, 078 | reaproveita `parseHeadersFile`; o `curl` do `og.png` precisa dele |
| 083 | — | fecha o RNF-17 junto com o 082 |
| 084 | 082 | as regras de cache dos ícones já estão no `_headers` |
| 085 | 075, Q-05 | sem o `/admin/*`, tirar o `noindex` global expõe o painel |

Ordem sugerida: **075 → 076 → 077 → 078 → 079 → 080 → 081 → 082 → 083 → 084**, e o 085 quando a Q-05
e a sabatina da migração existirem. **Sem paralelismo:** a regra da casa é um plano por vez, com
confirmação antes do próximo, e um build por vez no working tree. Quase todos tocam
`tests/dist/site-gerado.test.ts`, e vários o `BaseLayout.astro`, a `HomeView.astro` ou o
`astro.config.mjs`. Em tese, 075, 076, 079 e 080 não dependem um do outro.

**Itens do §12 que estes planos fecham** (o último plano do grupo marca a caixa):

| Item do §12 da fase 5 | Planos |
|---|---|
| SEO completo (RF-30) | 075, 076, 077, 078 |
| Otimização de imagens | 080, 081 |
| Dados estruturados JSON-LD (RF-38) | 079 |
| Cabeçalhos de segurança e cache (RNF-17, RNF-18) | 082, 083, 084 |
| Ícones | 084 |
| Indexação no domínio próprio | 085 (bloqueado) |

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

   Os passos 5 e 6, mais HSTS e "Always Use HTTPS", são o **plano 085**. Desde o 075 e o 082, o passo
   5 tira **só a linha** `X-Robots-Tag` do `/*`: o bloco `/admin/*` e os cabeçalhos de segurança ficam.
   Os valores do HSTS também entram na sabatina da migração: a Decisão 9 não os fixou.

6. **Armadilhas dos planos da auditoria (075–085).**
   1. **O `_headers` soma blocos.** Uma URL que casa `/*` e `/uploads/*` recebe os cabeçalhos dos dois,
      e a documentação da Cloudflare diz que o mesmo nome em dois blocos sai com os valores unidos por
      vírgula (não medido aqui). Por isso o `/*` não leva `Cache-Control` (082).
   2. **O `/admin` fica fora da CSP de conteúdo por construção:** a `<meta>` é do Astro, e o painel é
      `public/admin/`, copiado sem passar por ele. A proteção contra moldura vai por cabeçalho e vale
      para o painel também (082).
   3. **O RNF-18 se verifica em dois planos.** As regras de cache dos cinco caminhos entram no 082,
      mas `favicon.ico` e `apple-touch-icon.png` só existem depois do 084, que faz o `curl` deles.
      Assim os ícones, os menos importantes, continuam por último.
   4. **A medição da CSP é do orquestrador e escolhe o ramo** (083): o executor entrega o ramo B e uma
      cópia do `dist/` do ramo A. Na especificação, o atributo `style` do Shiki cai no ramo A.
   5. **A prévia de compartilhamento só funciona depois do 085:** o robô do X/Twitter respeita o
      `robots.txt`, e ele está em `Disallow: /`. O 078 confere as tags e a imagem servida.
   6. **O `sharp` vira dependência direta só na 0.35.4** (080): o `miniflare` do `wrangler` fixa essa
      versão, e a 0.35.5 duplicaria o pacote. Nada de `npm audit fix`.
   7. **A M-07 lê `meta[content]`** (`tests/dist/i18n.test.ts`): description, `og:title` e
      `og:description` das rotas EN não podem trazer valor do dicionário `pt`. A regra da Decisão 6
      (EN nunca mostra o texto PT do item) e esse teste se reforçam.
   8. **A pré-condição L-9 tem uma parte no código:** `src/views/ResearchView.astro:100` fixa
      `/uploads/extensao-exemplo-4.jpg` como imagem de "Outros projetos". O professor não troca isso
      pelo painel (085).
   9. **GIF tem de continuar animado** (PRD v0.1.81, nota de 2026-10-19 na Decisão 3): imagem animada
      não ganha variante WebP, porque o `sharp` sem `animated: true` gera só o primeiro quadro. O `.gif`
      fica fora da lista de formatos e o `.webp` com `metadata().pages > 1` devolve só `{ src }` (080);
      a asserção de `dist` do 081 pula as animadas.

## Regras de código que todo plano desta fase herda

As da fase 4 valem inteiras (`plans/fase-4-internacionalizacao/README.md`, seção de mesmo nome), com
estes acréscimos:

- **Identificadores do PRD desta fase:** SEO, description, Open Graph, favicon, sitemap e `/admin`
  fora da indexação são **RF-30**; JSON-LD é **RF-38**; cabeçalhos de segurança e CSP são **RNF-17**;
  cache de `/uploads/*` e dos ícones é **RNF-18**; fallback de idioma segue **RN-06**. Decisão da
  sabatina se cita como "sabatina 'Lacunas da auditoria de qualidade', Decisão N", não como
  identificador do PRD.
- **`set:html`:** proibido com conteúdo do professor, com uma exceção, a confirmar pelo orquestrador
  antes do despacho do 079: o JSON-LD da Home, só sobre a saída de `serializeJsonLd`, que escapa `<`,
  `>`, `&`, U+2028 e U+2029. O 083 pode usá-lo, no ramo S2, com uma constante do código.
- **Arquivo binário gerado uma vez** (`og.png`, ícones) entra no repositório; o script ou o HTML que o
  gerou fica no scratchpad e vai **inteiro** para a Evidência, para a imagem poder ser refeita.
- **Asserção de `_headers`** usa `parseHeadersFile` (075), nunca `includes` sobre o texto cru.

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
