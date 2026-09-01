# PRD — [Nome do Projeto]

> **Product Requirements Document (Documento de Requisitos de Produto)**
> Modelo base para projetos de software, automação, análise de dados e ferramentas de laboratório.
> Preencha todas as seções aplicáveis. Seções não aplicáveis devem ser marcadas como `N/A` com justificativa breve — nunca deletadas (isso preserva o registro de que a seção foi considerada).

---

## 0. Metadados do Documento

| Campo | Valor |
|---|---|
| **Nome do projeto** | |
| **Codinome / sigla** | |
| **Versão do PRD** | v0.1 |
| **Status** | 🟡 Rascunho / 🔵 Em revisão / 🟢 Aprovado / ⚫ Arquivado |
| **Autor(es)** | |
| **Revisores / aprovadores** | |
| **Data de criação** | AAAA-MM-DD |
| **Última atualização** | AAAA-MM-DD |
| **Repositório** | |
| **Documentos relacionados** | (links para RFCs, ADRs, planilhas, protótipos) |

### 0.1 Histórico de Versões (Changelog)

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| v0.1 | AAAA-MM-DD | | Versão inicial |

---

## 1. Resumo Executivo

> **Objetivo da seção:** qualquer pessoa deve entender o projeto inteiro lendo apenas isto. Máximo de 5 parágrafos.

- **O que é:** uma frase descrevendo o produto/ferramenta.
- **Problema que resolve:** qual dor existe hoje e quem sofre com ela.
- **Solução proposta:** abordagem em alto nível, sem detalhes técnicos.
- **Resultado esperado:** o que muda no mundo quando o projeto estiver pronto.
- **Esforço estimado:** ordem de grandeza (dias / semanas / meses) e nº de fases.

---

## 2. Contexto e Motivação

### 2.1 Situação Atual (As-Is)
Descreva o processo/fluxo atual **antes** do projeto. Inclua: passos manuais, ferramentas usadas, tempo gasto, pontos de falha, quem executa.

### 2.2 Problemas Identificados
Liste cada problema com identificador rastreável:

| ID | Problema | Impacto | Frequência | Evidência |
|---|---|---|---|---|
| P-01 | | Alto/Médio/Baixo | Diária/Semanal/Eventual | |

### 2.3 Por Que Agora?
Justifique o momento: gatilhos, oportunidades, dependências resolvidas, custo de não fazer.

### 2.4 Alternativas Consideradas
Soluções existentes (comerciais, open-source, processos manuais) e por que foram descartadas ou insuficientes.

| Alternativa | Prós | Contras | Motivo da rejeição |
|---|---|---|---|

---

## 3. Objetivos e Métricas de Sucesso

### 3.1 Objetivos (Goals)
Objetivos devem ser **SMART** (específicos, mensuráveis, atingíveis, relevantes, com prazo).

| ID | Objetivo | Métrica associada |
|---|---|---|
| G-01 | | M-01 |

### 3.2 Não-Objetivos (Non-Goals)
> Tão importante quanto o que o projeto faz é o que ele **deliberadamente não faz**. Isto previne scope creep.

- NG-01: ...
- NG-02: ...

### 3.3 Métricas de Sucesso (KPIs)

| ID | Métrica | Baseline atual | Meta | Como medir | Quando medir |
|---|---|---|---|---|---|
| M-01 | | | | | |

---

## 4. Usuários e Stakeholders

### 4.1 Personas

Para cada persona relevante:

**Persona 1 — [Nome/Papel]**
- **Quem é:** (cargo, contexto, nível técnico)
- **O que precisa fazer:** tarefas principais com o produto
- **Dores atuais:** o que frustra hoje
- **Nível de acesso:** (admin / operador / leitura)

### 4.2 Stakeholders

| Papel | Nome | Responsabilidade | Envolvimento (RACI) |
|---|---|---|---|
| Dono do produto | | Decisões de escopo | A (Accountable) |
| Desenvolvedor | | Implementação | R (Responsible) |
| Usuário-chave | | Validação | C (Consulted) |
| | | | I (Informed) |

---

## 5. Requisitos

> **Convenção de prioridade (MoSCoW):**
> - **[MUST]** — obrigatório para o MVP; sem isso o projeto não entrega valor.
> - **[SHOULD]** — importante, mas o MVP funciona sem.
> - **[COULD]** — desejável se houver tempo.
> - **[WONT]** — explicitamente fora desta versão (registrar para o futuro).

### 5.1 Requisitos Funcionais (RF)

| ID | Prioridade | Requisito | Critério de aceitação | Status |
|---|---|---|---|---|
| RF-01 | MUST | O sistema deve... | Dado X, quando Y, então Z | ⬜ |
| RF-02 | SHOULD | | | ⬜ |

> **Regra:** todo requisito funcional precisa de pelo menos um critério de aceitação verificável, preferencialmente no formato *Gherkin* (Dado / Quando / Então).

### 5.2 Requisitos Não-Funcionais (RNF)

| ID | Categoria | Requisito | Meta mensurável |
|---|---|---|---|
| RNF-01 | Desempenho | Tempo de resposta de comandos | < 3 s em 95% dos casos |
| RNF-02 | Confiabilidade | Disponibilidade / tolerância a falhas | |
| RNF-03 | Usabilidade | Curva de aprendizado | |
| RNF-04 | Segurança | Controle de acesso, dados sensíveis | |
| RNF-05 | Manutenibilidade | Cobertura de testes, padrões de código | Ver §10 |
| RNF-06 | Portabilidade | SOs/ambientes suportados | |
| RNF-07 | Escalabilidade | Limites de carga/volume previstos | |

### 5.3 Regras de Negócio (RN)

| ID | Regra | Origem/Justificativa |
|---|---|---|
| RN-01 | | |

### 5.4 Casos de Borda e Cenários de Falha (Fallbacks)

> Mapear o que acontece quando as coisas dão errado. Cada cenário deve ter comportamento definido — nunca "comportamento indefinido".

| ID | Cenário | Comportamento esperado | Mensagem ao usuário |
|---|---|---|---|
| F-01 | Entrada inválida | | |
| F-02 | Serviço externo indisponível | | |
| F-03 | Timeout / operação lenta | | |
| F-04 | Dados corrompidos/inconsistentes | | |
| F-05 | Operação cancelada no meio | | |

---

## 6. Escopo e Fases

### 6.1 Escopo do MVP
Lista mínima e fechada do que constitui a primeira versão entregável.

### 6.2 Roadmap de Fases

| Fase | Nome | Entregáveis | Critério de conclusão | Dependências |
|---|---|---|---|---|
| 0 | Setup do projeto | Repositório, ambiente, estrutura de pastas, config | Ambiente reproduzível por terceiros | — |
| 1 | | | | Fase 0 |
| 2 | | | | Fase 1 |
| N | Polimento e entrega | Documentação final, testes E2E | Checklist §12 100% | Fases anteriores |

### 6.3 Fora de Escopo (desta versão)
Itens adiados, com versão-alvo se conhecida.

---

## 7. Arquitetura e Design Técnico

### 7.1 Visão Geral da Arquitetura
Diagrama (ASCII, Mermaid ou link para imagem) mostrando camadas, componentes e fluxo de dados.

```
[Interface] → [Lógica de Negócio] → [Camada de Dados / Hardware / APIs]
```

### 7.2 Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa da escolha |
|---|---|---|---|
| Linguagem | | | |
| Framework/libs principais | | | |
| Banco de dados | | | |
| Infraestrutura/deploy | | | |
| Ferramentas de dev | | | |

> **Regra:** toda escolha de tecnologia deve ter justificativa registrada. Decisões arquiteturais significativas merecem um **ADR** (Architecture Decision Record) separado, referenciado aqui.

### 7.3 Modelo de Dados
Entidades principais, relacionamentos, esquema (tabelas/coleções) e ciclo de vida dos dados (criação → uso → arquivamento → exclusão).

### 7.4 Integrações e APIs Externas

| Serviço | Finalidade | Autenticação | Limites/custos | Plano B se falhar |
|---|---|---|---|---|

### 7.5 Estrutura de Diretórios do Projeto

```
projeto/
├── README.md            # Visão geral, instalação, uso rápido
├── PRD.md               # Este documento
├── config.yaml          # TODAS as variáveis configuráveis (nunca hardcoded)
├── requirements.txt     # ou pyproject.toml / package.json
├── .env.example         # Modelo de variáveis sensíveis (NUNCA commitar .env real)
├── src/                 # Código-fonte
│   ├── __init__.py
│   ├── main.py
│   └── ...
├── tests/               # Testes espelham a estrutura de src/
├── docs/                # Documentação adicional, ADRs, diagramas
├── data/                # Dados locais (adicionar ao .gitignore se sensível)
└── scripts/             # Utilitários e automações pontuais
```

### 7.6 Configuração e Segredos
- Todas as variáveis configuráveis em arquivo de configuração único (`config.yaml` ou equivalente).
- Segredos (tokens, chaves de API, senhas) **exclusivamente** em variáveis de ambiente / `.env` (fora do versionamento).
- Fornecer sempre um `.env.example` documentado.

---

## 8. Experiência do Usuário (UX)

### 8.1 Fluxos Principais
Para cada fluxo: gatilho → passos → resultado. Usar diagramas de fluxo quando houver ramificações.

### 8.2 Interface
- Protótipos / wireframes / exemplos de interação (para bots: transcrições de conversa exemplo; para CLI: exemplos de comando e saída).
- Mensagens de erro: tom, idioma, nível de detalhe técnico.

### 8.3 Acessibilidade e Idioma
Idioma(s) da interface, convenções de formatação (datas, números), considerações de acessibilidade.

---

## 9. Segurança, Privacidade e Conformidade

| Aspecto | Definição |
|---|---|
| **Controle de acesso** | Quem pode fazer o quê (matriz papel × permissão) |
| **Dados sensíveis** | Quais dados são sensíveis e como são protegidos |
| **Retenção de dados** | Por quanto tempo dados são mantidos e política de exclusão |
| **Logs e auditoria** | O que é registrado, onde, por quanto tempo |
| **Conformidade** | LGPD ou outras normas aplicáveis |
| **Backup e recuperação** | Estratégia, frequência, teste de restauração |

---

## 10. Padrões de Qualidade de Código e Documentação

> **Esta seção é normativa.** Código que não segue estes padrões não deve ser mesclado à branch principal.

### 10.1 Cabeçalho Obrigatório de Scripts

Todo arquivo de código deve iniciar com um cabeçalho padronizado:

```python
"""
================================================================================
 Arquivo      : nome_do_arquivo.py
 Projeto      : [Nome do Projeto]
 Descrição    : O que este script faz, em 2-4 linhas. Deve responder:
                qual problema resolve e qual seu papel na arquitetura.
 Autor        : [Nome]
 Criado em    : AAAA-MM-DD
 Atualizado em: AAAA-MM-DD
 Versão       : 0.1.0

 Dependências : libs externas relevantes (ex: pyvisa>=1.13, pyyaml)
 Entradas     : argumentos, arquivos lidos, variáveis de ambiente esperadas
 Saídas       : arquivos gerados, efeitos colaterais (BD, hardware, rede)
 Uso          : exemplo mínimo de execução
                $ python nome_do_arquivo.py --opcao valor

 Notas        : limitações conhecidas, suposições, TODOs estruturais
================================================================================
"""
```

### 10.2 Docstrings de Funções e Classes

- **Toda** função/classe pública deve ter docstring (padrão Google ou NumPy — escolher um e manter).
- Docstring mínima: o que faz, parâmetros (`Args`), retorno (`Returns`), exceções (`Raises`).
- Funções privadas triviais (< 5 linhas, nome autoexplicativo) podem omitir, mas na dúvida, documente.

```python
def calcular_prioridade(frascos: list[Frasco]) -> Frasco:
    """Seleciona o frasco prioritário para consumo.

    A prioridade segue duas regras em cascata: (1) menor data de
    validade primeiro; (2) em caso de empate, menor quantidade restante.

    Args:
        frascos: Lista de frascos disponíveis do mesmo reagente.

    Returns:
        O frasco que deve ser consumido primeiro.

    Raises:
        ValueError: Se a lista estiver vazia.
    """
```

### 10.3 Comentários no Código

- Comentários explicam **por quê**, não **o quê** (o código já diz o quê).
- Blocos de lógica não-óbvia (algoritmos, workarounds, regras de negócio) exigem comentário.
- Marcadores padronizados e rastreáveis:
  - `# TODO(autor): descrição` — trabalho pendente
  - `# FIXME(autor): descrição` — bug conhecido
  - `# HACK(autor): descrição` — solução temporária com justificativa
  - `# NOTE: descrição` — contexto importante para futuros leitores
- Proibido: código comentado morto na branch principal (usar o histórico do git).

### 10.4 Convenções Gerais

| Item | Padrão |
|---|---|
| Estilo (Python) | PEP 8, formatado com `black`; lint com `ruff` |
| Type hints | Obrigatórios em assinaturas públicas |
| Nomes | Variáveis/funções descritivas em inglês ou português — escolher **um** idioma e manter |
| Tamanho de funções | Alvo < 50 linhas; acima disso, considerar refatorar |
| Constantes mágicas | Proibidas — extrair para `config.yaml` ou constantes nomeadas |
| Logging | Usar `logging` (nunca `print` em código de produção), com níveis adequados (DEBUG/INFO/WARNING/ERROR) |
| Commits | Mensagens no padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`) |

### 10.5 Documentação do Projeto

| Documento | Conteúdo mínimo | Quando atualizar |
|---|---|---|
| `README.md` | O que é, instalação, configuração, uso básico, troubleshooting | A cada mudança de uso/instalação |
| `PRD.md` | Este documento | A cada mudança de escopo/requisito |
| `docs/CHANGELOG.md` | Mudanças por versão (formato Keep a Changelog) | A cada release |
| `docs/adr/` | Decisões arquiteturais numeradas | A cada decisão significativa |
| `.env.example` | Todas as variáveis de ambiente com descrição | A cada nova variável |

---

## 11. Estratégia de Testes

| Nível | Escopo | Ferramenta | Meta de cobertura |
|---|---|---|---|
| Unitário | Funções e classes isoladas | `pytest` | ≥ 80% da lógica de negócio |
| Integração | Componentes em conjunto (BD, APIs mockadas) | `pytest` + fixtures | Fluxos principais |
| End-to-end | Sistema completo em ambiente real/simulado | Manual ou automatizado | Casos de uso do MVP |
| Regressão | Re-execução após mudanças | CI ou script local | Suíte completa verde antes de merge |

**Regras:**
- Todo bug corrigido ganha um teste que o reproduz (previne regressão).
- Testes devem ser determinísticos — nada de dependência de horário, rede real ou ordem de execução.
- Cenários de falha da §5.4 devem ter testes correspondentes.

---

## 12. Checklist de Implementação

> **Como usar:** marcar `[x]` ao concluir cada item. Cada fase só é considerada concluída quando todos os seus itens (ou os marcados como obrigatórios) estiverem feitos. Atualizar a tabela de progresso abaixo a cada sessão de trabalho.

### 📊 Progresso Geral

| Fase | Itens concluídos | Status |
|---|---|---|
| Fase 0 — Setup | 0/8 | ⬜ Não iniciada |
| Fase 1 — [Nome] | 0/N | ⬜ Não iniciada |
| Fase 2 — [Nome] | 0/N | ⬜ Não iniciada |
| Fase N — Entrega | 0/N | ⬜ Não iniciada |

Legenda: ⬜ Não iniciada · 🟡 Em andamento · 🟢 Concluída · 🔴 Bloqueada

### Fase 0 — Setup do Projeto
- [ ] Repositório criado com `.gitignore` adequado
- [ ] Ambiente virtual / gerenciador de dependências configurado
- [ ] Estrutura de diretórios criada conforme §7.5
- [ ] `config.yaml` inicial com variáveis identificadas
- [ ] `.env.example` criado e documentado
- [ ] `README.md` inicial (instalação + visão geral)
- [ ] Ferramentas de qualidade configuradas (formatter, linter, pytest)
- [ ] Primeiro commit e verificação de que outra máquina consegue reproduzir o ambiente

### Fase 1 — [Nome da Fase]
- [ ] [Entregável 1.1]
- [ ] [Entregável 1.2]
- [ ] Testes unitários da fase escritos e passando
- [ ] Documentação (docstrings + README) atualizada
- [ ] Revisão de código realizada

### Fase 2 — [Nome da Fase]
- [ ] [Entregável 2.1]
- [ ] Testes da fase passando
- [ ] Documentação atualizada

### Fase N — Polimento e Entrega
- [ ] Todos os requisitos [MUST] da §5.1 implementados e verificados
- [ ] Todos os cenários de falha (§5.4) tratados e testados
- [ ] Suíte completa de testes verde
- [ ] Cobertura de testes ≥ meta da §11
- [ ] `README.md` completo (instalação, configuração, uso, troubleshooting)
- [ ] `CHANGELOG.md` da versão 1.0 escrito
- [ ] Cabeçalhos de script (§10.1) presentes em todos os arquivos
- [ ] Validação com usuário-chave realizada
- [ ] Métricas de sucesso (§3.3) com plano de medição ativo
- [ ] Tag de versão criada no git (`v1.0.0`)

### ✅ Definition of Done (por item de trabalho)
Um item individual só está "pronto" quando:
1. Código implementado e funcionando localmente;
2. Testes escritos e passando;
3. Docstrings e comentários conforme §10;
4. Sem warnings novos de linter;
5. Documentação afetada atualizada;
6. Checklist desta seção atualizado.

---

## 13. Riscos e Mitigações

| ID | Risco | Probabilidade | Impacto | Mitigação | Plano de contingência | Dono |
|---|---|---|---|---|---|---|
| R-01 | | Alta/Média/Baixa | Alto/Médio/Baixo | (ação preventiva) | (se acontecer, fazer X) | |

---

## 14. Dependências e Premissas

### 14.1 Dependências Externas
Hardware, serviços, pessoas ou aprovações de que o projeto depende e que estão fora do controle da equipe.

### 14.2 Premissas (Assumptions)
Coisas assumidas como verdadeiras. **Se uma premissa cair, o PRD deve ser revisado.**

| ID | Premissa | Impacto se for falsa |
|---|---|---|
| A-01 | | |

---

## 15. Cronograma e Estimativas

| Fase | Estimativa | Início previsto | Fim previsto | Real |
|---|---|---|---|---|

> Estimativas são compromissos de *ordem de grandeza*, não promessas. Revisar ao fim de cada fase e registrar desvios com causa.

---

## 16. Questões em Aberto

> Perguntas sem resposta no momento da escrita. Nenhuma fase que dependa de uma questão aberta deve ser iniciada antes de resolvê-la.

| ID | Questão | Bloqueia o quê | Responsável por resolver | Prazo | Resolução |
|---|---|---|---|---|---|
| Q-01 | | | | | |

---

## 17. Glossário

| Termo | Definição |
|---|---|
| MVP | Minimum Viable Product — menor versão que entrega valor real |
| ADR | Architecture Decision Record — registro de decisão arquitetural |
| MoSCoW | Técnica de priorização: Must/Should/Could/Won't |
| | (adicionar termos de domínio específicos do projeto) |

---

## Apêndice A — Referências
Links, artigos, manuais de equipamento, documentação de APIs.

## Apêndice B — Anexos
Diagramas detalhados, protótipos, planilhas de dados de exemplo.
