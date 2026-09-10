# ADR-0008 — Zod é o portão de validação; paridade com o Tina garantida por teste

- **Status:** Aceita
- **Data:** 2026-09-10
- **Decisão do PRD:** D-06 (§7.2, RNF-09)
- **Fase:** 1 (implementada no plano 019)

## Decisão sobre registrar esta decisão num ADR próprio

A §7.2 do PRD determina que cada decisão da tabela D-01 a D-07 vire um ADR na fase em que for
implementada, e este plano (021) pediu explicitamente para decidir se a D-06 merece um ADR
próprio ou se o plano 019 já basta. **Decisão: ADR próprio**, por dois motivos. Primeiro,
consistência: as outras seis decisões implementadas (D-01 a D-05 e D-07) já têm ADR; abrir
exceção só para a D-06 tornaria `docs/adr/` uma lista incompleta sem motivo visível para quem
chegar depois. Segundo, precedente já aberto neste próprio projeto: o ADR-0002 foi escrito mesmo
com o detalhe técnico completo já registrado no plano 002 e no plano 014 — o ADR não duplica essa
evidência, só a resume e aponta para ela. Este arquivo segue o mesmo molde: curto, com a prova
detalhada permanecendo no plano 019.

## Contexto

Dois schemas descrevem o mesmo conteúdo: `src/content.config.ts` (Zod, consumido pelo Astro) e
`tina/config.ts` (a estrutura de campos do painel). Um campo acrescentado a um dos lados e
esquecido no outro produz uma divergência silenciosa: o professor preenche e salva um campo que o
Zod não conhece (ou deixa vazio um que o Zod exige), o commit dispara o build, e o build falha
com um erro de validação que ele não sabe diagnosticar (F-09, RNF-09, risco R-02).

## Decisão

**Zod é o portão de validação** — quem decide o que é conteúdo válido. **Tina é só a interface de
entrada** — o formulário que produz o frontmatter. A paridade entre os dois é garantida por um
teste automatizado (`tests/content/paridade-schema.test.ts`, plano 019) que roda no CI e compara,
por introspecção do Zod 4 contra a árvore `fields` do Tina: conjunto de campos, obrigatoriedade,
valores de enum, estrutura do grupo `en` e subcampos das listas embutidas — provado falsificável
nos dois sentidos (campo/obrigatoriedade/enum errado em cada lado faz o teste cair).

## Alternativas consideradas

**Confiar apenas no schema do Tina**, sem um segundo schema Zod independente. Rejeitada: um único
schema não detecta a própria divergência com o que o Astro espera — seria o schema verificando a
si mesmo. Os planos 016 e 017 transcreveram a §7.3 **independentemente**, de propósito, para que
o teste comparasse duas leituras da mesma fonte em vez de uma cópia de si mesma.

## Consequências

- O teste de paridade é a rede de proteção do professor, não burocracia de desenvolvedor — é o
  que fecha a mitigação prevista para o risco R-02.
- O teste **encontrou uma divergência real**: o Tina grava `linha_relacionada` como caminho
  completo com extensão, enquanto o `glob()` do Zod espera o id sem os dois. Corrigida do lado do
  Zod (`normalizeLinhaRelacionadaId`, `src/content.config.ts`), por ser comprovável com teste
  unitário e por dispensar qualquer mudança de schema no Tina (sem `ERR_CLOUD_CHECK_FAILED`).
- O teste **não** cobre paridade de comportamento do painel — só de schema. A armadilha do
  descarte silencioso de campo já preenchido (achado do plano 020) e o subcampo obrigatório de
  lista embutida que não bloqueia o save (achado dos planos 017/019) estão fora do alcance desta
  rede, porque são do comportamento do formulário, não do formato dos dois schemas.
- Três buracos conhecidos e ainda abertos, que a revisão do plano 019 encontrou: o `path` da
  coleção no Tina nunca é comparado contra a pasta que o `glob()` do Zod lê; a detecção de enum
  do lado Tina, se um campo tivesse `list: true` **e** `options` ao mesmo tempo, não compararia
  os valores; e a prova de falsificabilidade foi produzida contra 11 testes, não contra o
  artefato final de 12. Nenhum é defeito ativo hoje — ficam para a fase 2 e seguintes, registrados
  no README da fase 1.

## Referências

- PRD §7.2 (D-06), RNF-09, R-02
- ADR-0002 — molde de ADR curto apontando para a Evidência de um plano, em vez de duplicá-la
- `plans/fase-1-modelo-de-conteudo/019-teste-de-paridade-zod-tina.md` — Evidência completa,
  incluindo a prova de falsificabilidade e a correção de `linha_relacionada`
- `plans/fase-1-modelo-de-conteudo/README.md` — os três buracos latentes e o que os planos 016 e
  017 deixaram como insumo
