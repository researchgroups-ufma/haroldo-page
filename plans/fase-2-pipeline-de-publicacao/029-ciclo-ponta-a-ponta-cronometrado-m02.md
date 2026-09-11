# Plano 029 — Ciclo ponta a ponta cronometrado (M-02) e o critério de conclusão da fase

**Status:** TODO
**RFs cobertos:** RF-11; **M-02**; fase 2, **item 7** do §12; **critério de conclusão da fase 2
(§6.2)**; R-06, R-12
**Depende de:** planos **025**, **026**, **027** e **028** — nesta ordem. O 028 antes porque
cronometrar o ciclo feliz enquanto ainda se pode quebrar a `main` de propósito é pedir para
contaminar a amostra.
**Modelo recomendado:** — (execução humana, com cronômetro)
**Agente recomendado:** nenhum
**Executável por:** **orquestrador + stakeholder** — as 10 medições são do orquestrador; **pelo
menos uma delas tem de ser feita na sessão do professor (EDITOR)**, porque é isso que o §6.2 pede.
Ver "O passo humano".
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Está medido, com horários registrados, quanto tempo passa entre salvar no `/admin` de produção e a
mudança estar publicada — **M-02: < 5 min**. E o critério de conclusão da fase 2 (§6.2) está
demonstrado: **um usuário EDITOR edita no `/admin` em produção e a mudança chega ao ar sem
nenhuma intervenção do ADMIN.**

Como na fase 1, o critério não é "os testes passam" — é exercitar o ciclo real.

## Arquivos afetados

- **Nenhum arquivo de código.**
- `content/**` — um mesmo item existente é editado ~10 vezes, num campo de texto simples. Ao final,
  o campo volta ao valor de origem.

> Não crie 10 itens novos. O repositório é público e o conteúdo é atribuído a uma pessoa real —
> editar repetidamente a `descricao` de **um** item placeholder, com marcador datado, deixa o
> repositório limpo e o histórico legível.

## Contexto necessário

**O que M-02 exige, literalmente** (§3.3): *"Tempo entre salvar no painel e conteúdo visível no
site — meta < 5 min em 95% das publicações — como medir: cronometragem em **10 publicações de
teste** — quando medir: **fases 2 e 5**."*

**A honestidade estatística que a Evidência tem de conter:** com n = 10 não se resolve uma taxa de
95%. O critério operacional desta fase é, portanto, **os 10 ciclos abaixo de 5 min**; um único
acima já é achado a reportar, não a arredondar. O PRD manda medir de novo na **fase 5**, e é lá
que a taxa ganha sentido.

### ⚠️ O que a fase 2 **não** consegue provar, e que precisa estar escrito na Evidência

**Não existe página que renderize conteúdo.** `src/` tem apenas `content.config.ts`, `env.d.ts`,
`lib/config.ts`, `lib/slug.ts`, `pages/index.astro` e `styles/global.css` — o site público é a
**fase 3**, e nenhum plano da fase 2 constrói página. Logo, "conteúdo **visível** no site" é
literalmente inverificável agora: editar uma `descricao` não muda um byte do HTML publicado.

O que esta fase mede, então, é o **ciclo de publicação inteiro até a borda da renderização**:

```
save no /admin  →  commit na main  →  build automático  →  versão nova publicada no Worker
```

E prova cada elo com artefato: SHA do commit do painel, o mesmo SHA no log do build da Cloudflare,
id da versão publicada e resposta HTTP do site. **Registre explicitamente que o último elo —
"o texto novo aparece na página" — fica para a fase 3, e que M-02 é remedida na fase 5**, como o
próprio PRD agenda. Não escreva "conteúdo visível no site" se o que você mediu foi "versão nova
publicada": seria exatamente o tipo de relato que este projeto não aceita.

### O passo humano

**Quem:** Prof. Haroldo, com a conta EDITOR criada no plano 027.
**O que ele faz:** **um** ciclo completo — entra no `/admin` de produção, edita a `descricao` de
um item, salva, e avisa a hora exata do save.
**O que ele devolve:** o horário do save (com minuto e segundo, se der), o item editado e o texto
digitado. Nada mais.

**Por que só um, e por que isso basta:** o caminho medido — commit → build → deploy — é idêntico
para os dois papéis; o que muda é quem assinou o commit. Um ciclo do EDITOR é o que satisfaz o
§6.2 ("um usuário EDITOR edita … e a mudança aparece no site **sem intervenção do ADMIN**"); os
outros nove medem a **latência do pipeline**, que não depende do papel. **Isto é uma substituição
declarada, não um atalho escondido** — a Evidência tem de dizer quantos ciclos foram do EDITOR e
quantos do ADMIN, e a fase 5 remede M-02 com o professor operando sozinho (M-01).

Se o stakeholder quiser os 10 ciclos na sessão do professor, melhor ainda — registre assim.

### Duas armadilhas de medição

1. **R-12 — build simultâneo único.** O plano gratuito faz **1 build por vez**; saves em sequência
   rápida enfileiram builds e a fila **infla o tempo medido**. Meça **em série**: cada ciclo só
   começa depois de o anterior ter publicado. Depois dos 10, faça **uma** observação separada de
   dois saves em sequência rápida, para caracterizar R-12 — e registre-a como observação, fora da
   amostra.
2. **O relógio.** Registre para cada ciclo: horário do save (fuso declarado), horário do commit
   (GitHub), início e fim do build (Cloudflare) e horário em que a versão nova apareceu. O ΔT de
   M-02 é **save → versão publicada**. Os intermediários explicam onde o tempo foi, e é isso que
   torna o número útil se ele estourar.

### O que este plano NÃO faz

- ⛔ **Não constrói página** para tornar a edição visível. Fase 3.
- ⛔ **Não treina o professor** nem valida M-01. Fase 5.
- ⛔ **Não altera configuração** do pipeline. Se algum ciclo estourar 5 min, o achado é reportado
  com os intermediários; a otimização (se couber) é decisão nova.
- ⛔ **Não escreve a documentação do pipeline** — plano 034.

**Ambiente.** Windows 11 / PowerShell. Site: <https://haroldo-page.and-near.workers.dev>.

## Passos

1. 🧑 Escolher o item e o campo da medição (sugestão: `descricao` de
   `content/linhas-pesquisa/sombras-de-buracos-negros.md`) e anotar o valor original **literal**.
   → verify: o valor original colado — é para onde o campo volta no passo 6.
2. 🧑 Rodar **9 ciclos** pela sessão ADMIN, em série, cada um pondo no campo um marcador
   incremental e datado (ex.: `[M-02 ciclo 3 — 2026-09-DD hh:mm]`).
   → verify: uma linha de tabela por ciclo, com save / commit (SHA) / início e fim do build / id
   da versão / **ΔT total**. Nenhum ciclo começa antes de o anterior publicar.
3. 🧑 Rodar **1 ciclo pela sessão do professor (EDITOR)** — o ciclo que satisfaz o §6.2.
   → verify: a mesma linha de tabela, mais: (a) o commit atribuído à edição dele; (b) declaração
   explícita de que **nenhuma ação do ADMIN** ocorreu entre o save e a publicação — nem aprovação,
   nem merge, nem rebuild manual.
4. 🧑 Consolidar a amostra: os 10 ΔT, mínimo, máximo, mediana, e quantos ficaram abaixo de 5 min.
   → verify: a tabela completa e o veredito de M-02 — com a ressalva de n = 10 escrita.
5. 🧑 Caracterizar R-12 **fora da amostra**: dois saves em sequência rápida, observando a fila.
   → verify: o que o painel mostrou (build enfileirado?) e o ΔT do segundo. Registre se o
   comportamento aceito em R-12 ("a fila resolve sozinha") se confirmou.
6. 🧑 Devolver o campo ao valor original pelo painel e conferir **no arquivo**.
   → verify: `git log --oneline` dos commits do painel, e o frontmatter final colado, igual ao
   passo 1. Atenção à armadilha do plano 020: a tela não é prova; o arquivo é.
7. 🧑 Registrar consumo e custo: minutos de build somados nos ~12 builds desta sessão, cota
   restante e custo (R-06, RNF-14, M-06).
   → verify: os números do painel, colados.
8. 🧑 Escrever, na Evidência, o veredito do **§6.2** — em uma frase, com os artefatos que o
   sustentam — e, na mesma seção, **o que esta fase não provou** (renderização na página), com o
   encaminhamento para a fase 3 e a remedição na fase 5.
   → verify: as duas afirmações presentes e distinguíveis.

## Critérios de aceitação

- [ ] **10 ciclos medidos em série**, com tabela contendo save / commit / build / versão / ΔT
- [ ] **Pelo menos 1 ciclo executado na sessão do EDITOR**, com declaração explícita de que não
      houve intervenção do ADMIN entre o save e a publicação (**§6.2**)
- [ ] Quantos ciclos foram do EDITOR e quantos do ADMIN, dito na Evidência — substituição
      declarada, não escondida
- [ ] Veredito de M-02 com mínimo, máximo e mediana, e a ressalva explícita de que n = 10 não
      resolve uma taxa de 95%
- [ ] Qualquer ciclo acima de 5 min **reportado** com os tempos intermediários, não arredondado
- [ ] Observação de R-12 (dois saves em sequência rápida) registrada **fora** da amostra
- [ ] Registro explícito de que "conteúdo **visível** na página" não é verificável nesta fase, com
      o encaminhamento para a fase 3 e a remedição de M-02 na fase 5
- [ ] Campo devolvido ao valor original, conferido **no arquivo**; `git status --short` limpo
- [ ] Minutos de build consumidos, cota restante e custo US$ 0,00 registrados (R-06, RNF-14, M-06)
- [ ] §12 do PRD (item 7 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao promover
      `Status: DONE`
- [ ] CI do GitHub Actions verde nos commits do painel gerados por esta sessão

## Evidência

<Preenchida por quem executar. Horários com fuso declarado. "A mudança apareceu no site" só pode
ser escrito se houver página mostrando a mudança — nesta fase não há; escreva "versão nova
publicada" e registre a diferença.>
