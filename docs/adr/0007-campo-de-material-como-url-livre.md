# ADR-0007 — Campo de material como URL livre, agnóstica ao hospedeiro

- **Status:** Aceita
- **Data:** 2026-09-10
- **Decisão do PRD:** D-07 (§7.2, NG-02, RN-05)
- **Fase:** 1 (implementada no plano 016/017)

## Contexto

O site não hospeda PDFs, slides nem listas de exercícios (NG-02) — a infraestrutura gratuita do
projeto não é adequada para armazenar arquivos binários. O professor precisa de algum lugar para
colocar esse material e de um jeito de ligá-lo ao site. A pergunta levantada na sessão de
brainstorming (Q-08) era se esse campo deveria ser acoplado ao Google Drive especificamente
(seletor de arquivos, validação de domínio).

## Decisão

Todo campo de material (`url` em `aulas[]`, `listas[]`, `materiais[]`, `bibliografia[].url`,
`cv_url`, `pdf_url`, `scripts[].url`) é uma **string de URL livre**, sem validação de domínio nem
integração com qualquer provedor. O Google Drive é a recomendação do manual do professor, não uma
dependência de arquitetura.

## Alternativas consideradas

**Campo acoplado ao Google Drive** (seletor de arquivos do Drive, validação de que a URL é do
domínio `drive.google.com`). Rejeitada por decisão do stakeholder em 2026-09-01: o que importa é
o professor ter um link que funcione, não onde ele hospedou o arquivo. Acoplar ao Drive também
amarraria o projeto a uma conta Google específica e a uma API adicional sem necessidade.

## Consequências

- Qualquer hospedeiro serve — Drive, repositório institucional, arXiv, YouTube. Dissolveu a
  Q-08 (de quem é a conta Drive): deixou de haver conta a administrar.
- Nenhum acoplamento a mitigar na matriz de integrações (§7.4): "URL livre, qualquer hospedeiro
  serve" é a própria linha do plano de contingência.
- Risco aceito (R-08): links podem quebrar ou perder permissão pública sem que ninguém perceba. A
  mitigação é o texto de ajuda no campo e a instrução no manual; não há verificador automático no
  MVP.
- A única exceção à regra "material é link externo" é `scripts[].codigo` (RN-05, ADR-0006): por
  ser código-fonte a ser exibido com destaque de sintaxe, ele fica embutido no conteúdo em vez de
  ser uma URL.

## Referências

- PRD §7.2 (D-07), NG-02, RN-05, R-08, §7.4, Q-08
- ADR-0006 — Listas embutidas na disciplina (a exceção do `scripts[].codigo`)
- `plans/fase-1-modelo-de-conteudo/016-schemas-zod-das-cinco-colecoes.md`
- `plans/fase-1-modelo-de-conteudo/017-colecoes-completas-no-tina-config.md`
