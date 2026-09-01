# Briefing do Projeto: Site Pessoal Acadêmico de Professor de Física

## 1. Objetivo

Desenvolver um site pessoal acadêmico para um professor de Física.

O site deve funcionar como:

- Página pessoal/profissional do professor.
- Currículo acadêmico resumido.
- Portfólio de pesquisa.
- Catálogo de publicações.
- Portal de disciplinas.
- Índice organizado de materiais didáticos.
- Página para divulgação de notícias, projetos e atividades acadêmicas.

O professor será o responsável pela manutenção do conteúdo após a entrega.

O objetivo principal é que **o professor consiga atualizar o site sem precisar conhecer programação, Git, Markdown, GitHub ou ferramentas de desenvolvimento**.

A experiência desejada para ele é essencialmente:

> Login → escolher o conteúdo → editar/preencher formulário → publicar.

---

# 2. Stack decidida

A stack inicialmente escolhida é:

- **Astro** como framework principal.
- **TypeScript**.
- **MDX/Markdown** para conteúdo estruturado.
- **Tailwind CSS** para estilização.
- **TinaCMS** como CMS.
- **TinaCloud** para autenticação/gerenciamento dos editores.
- **GitHub** como repositório e versionamento do conteúdo/código.
- **Cloudflare Workers** para hospedagem/deploy.
- **Google Drive** para armazenamento dos PDFs e arquivos acadêmicos.

### Arquitetura geral

```text
                    PROFESSOR
                        │
                        ▼
                  TinaCMS / Admin
                        │
                 autenticação
                        │
                        ▼
                    TinaCloud
                        │
                        ▼
                     GitHub
                        │
                        ▼
                      Astro
                        │
                        ▼
                Cloudflare Workers
                        │
                        ▼
                  SITE PÚBLICO
```

Os arquivos acadêmicos não serão necessariamente armazenados no site:

```text
                  Google Drive
                       │
              PDFs / Slides / etc.
                       │
                       ▼
                    TinaCMS
                       │
                  URL do arquivo
                       │
                       ▼
                 Site público
```

---

# 3. Por que Astro

O site é predominantemente uma publicação digital, não uma aplicação web altamente dinâmica.

O conteúdo esperado é principalmente:

- textos;
- páginas acadêmicas;
- disciplinas;
- publicações;
- notícias;
- links;
- PDFs;
- imagens;
- eventualmente componentes interativos.

Por isso, Astro foi escolhido em vez de construir tudo com Next.js.

Astro permite gerar um site extremamente leve e manter o conteúdo separado da lógica da aplicação.

React não precisa ser utilizado globalmente.

Caso sejam necessárias funcionalidades interativas específicas, React pode ser utilizado apenas em componentes isolados, por exemplo:

- gráficos;
- simuladores de Física;
- visualizações;
- widgets;
- demonstrações interativas.

---

# 4. Por que TinaCMS

O principal requisito é permitir que um professor não técnico administre o site.

O CMS deve esconder a complexidade técnica.

O professor não deve precisar:

- editar arquivos Markdown manualmente;
- usar Git;
- usar GitHub;
- fazer deploy;
- executar comandos;
- conhecer a estrutura do projeto.

O TinaCMS foi escolhido porque possui integração oficial com Astro e pode fornecer uma interface administrativa para edição do conteúdo.

O TinaCloud também permite trabalhar com autenticação e colaboradores sem necessariamente dar ao professor acesso direto ao repositório como desenvolvedor.

A interface deve ser projetada de acordo com o domínio acadêmico, e não simplesmente expor a estrutura técnica dos arquivos.

---

# 5. Hospedagem

Foi decidido utilizar **Cloudflare Workers**.

Inicialmente foi considerada a possibilidade de Cloudflare Pages, mas a integração atual do TinaCMS com Astro favorece Cloudflare Workers para o cenário de edição visual/server-side.

Portanto, não forçar Cloudflare Pages.

Arquitetura de deploy:

```text
GitHub
   │
   │ push
   ▼
Build Astro
   │
   ▼
Cloudflare Workers
   │
   ▼
Site
```

O projeto deve continuar dentro do ecossistema Cloudflare.

O objetivo é utilizar o plano gratuito enquanto o volume do site permanecer compatível com ele.

---

# 6. Google Drive

Os PDFs e arquivos didáticos não precisam ser hospedados pelo Astro/Tina.

O Google Drive será utilizado como armazenamento externo.

Exemplo:

```text
Google Drive
│
└── Física I
    ├── Aulas
    │   ├── Aula 01.pdf
    │   ├── Aula 02.pdf
    │   └── Aula 03.pdf
    │
    ├── Exercícios
    │   ├── Lista 01.pdf
    │   └── Lista 02.pdf
    │
    └── Bibliografia
```

No CMS, o professor poderá simplesmente informar o link:

```text
Título:
Oscilador Harmônico

Descrição:
Introdução ao oscilador harmônico simples.

Material:
https://drive.google.com/...
```

O site exibirá o link para o arquivo.

Não é necessário implementar inicialmente upload de arquivos para o próprio site.

---

# 7. Estrutura conceitual do site

Uma estrutura inicial sugerida:

```text
/
├── Sobre
├── Pesquisa
│   ├── Linhas de pesquisa
│   ├── Projetos
│   └── Grupo/colaboradores
│
├── Ensino
│   ├── Disciplinas atuais
│   └── Disciplinas anteriores
│
├── Materiais
│   ├── Notas de aula
│   ├── Listas de exercícios
│   ├── Slides
│   └── Materiais complementares
│
├── Publicações
│
├── Notícias
│
└── CV
```

A estrutura exata pode ser refinada durante o desenvolvimento.

---

# 8. Modelo de conteúdo desejado

## Professor

Informações como:

- nome;
- cargo;
- instituição;
- departamento;
- foto;
- biografia;
- formação;
- áreas de atuação;
- e-mail;
- links acadêmicos.

Links externos possíveis:

- Lattes;
- ORCID;
- Google Scholar;
- arXiv;
- ResearchGate;
- GitHub;
- página institucional.

---

## Disciplinas

Cada disciplina deve possuir informações como:

```text
Nome
Código
Semestre
Descrição
Ementa
Bibliografia
Status: atual/anterior
```

E possuir conteúdo associado:

```text
Aulas
Listas
Slides
Materiais complementares
Links
```

Exemplo:

```text
Mecânica Clássica
2026.2

Aulas
01 - Introdução
02 - Cinemática
03 - Leis de Newton
04 - Trabalho e Energia

Listas
Lista 01
Lista 02
Lista 03

Material complementar
Livro-texto
Simulações
```

---

# 9. Aulas

Uma aula deve ser representada como conteúdo estruturado, por exemplo:

```text
Título
Número da aula
Descrição
Data
Disciplina
Link para PDF
Links adicionais
```

O professor deve conseguir adicionar uma aula através do CMS sem editar código.

---

# 10. Publicações

As publicações devem ter estrutura própria.

Campos sugeridos:

```text
Título
Autores
Ano
Periódico
DOI
arXiv
Link para PDF
Tipo
Resumo
Palavras-chave
```

A página pública deve organizar automaticamente as publicações por ano.

Exemplo:

```text
2026

Título do artigo
Professor X, A. Silva, B. Souza

Physical Review B, 2026

[DOI] [arXiv] [PDF]
```

No futuro pode ser interessante integrar APIs como:

- ORCID;
- Crossref;
- OpenAlex;
- arXiv.

Porém, isso não é requisito para o MVP.

---

# 11. Notícias

O professor poderá criar notícias/postagens.

Campos:

```text
Título
Data
Imagem
Resumo
Conteúdo
Tags
```

Exemplos:

- participação em congresso;
- publicação de artigo;
- defesa de orientando;
- palestra;
- prêmio;
- evento;
- atualização de disciplina.

---

# 12. Interface do professor

O CMS deve ser pensado como um painel administrativo simples.

Exemplo conceitual:

```text
Olá, Professor.

┌───────────────────────────────┐
│ 📚 Disciplinas                │
│ 4 disciplinas                 │
│ [Gerenciar]                   │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 📄 Publicações                │
│ 37 artigos                    │
│ [Gerenciar]                   │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 📰 Notícias                   │
│ 8 publicações                 │
│ [Gerenciar]                   │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 👤 Perfil                     │
│ [Editar]                      │
└───────────────────────────────┘
```

O professor deve pensar em conceitos acadêmicos, não em arquivos.

Por exemplo:

> "Adicionar publicação"

é preferível a:

> "Criar arquivo publication-2026-09-01.md".

---

# 13. Permissões

Idealmente haverá pelo menos dois níveis:

### ADMIN

Responsável pelo desenvolvimento/manutenção técnica.

Pode:

- alterar código;
- alterar estrutura do CMS;
- gerenciar usuários;
- alterar configurações;
- editar conteúdo;
- publicar.

### EDITOR

Professor.

Pode:

- editar perfil;
- criar/editar notícias;
- criar/editar disciplinas;
- adicionar aulas;
- adicionar links para materiais;
- cadastrar publicações;
- publicar conteúdo.

O professor não deve ter acesso desnecessário ao código ou à infraestrutura.

---

# 14. Filosofia de arquitetura

Evitar overengineering.

Não adicionar inicialmente:

- banco de dados próprio;
- backend próprio;
- sistema de login customizado;
- API própria;
- armazenamento próprio de PDFs;
- microserviços;
- infraestrutura complexa.

A arquitetura desejada é:

```text
TinaCMS
   ↓
Git
   ↓
Astro
   ↓
Cloudflare Workers
```

com:

```text
Google Drive
   ↓
links de materiais
```

---

# 15. Conteúdo e código

Uma separação lógica desejável:

```text
src/
    componentes/
    layouts/
    pages/
    styles/

content/
    cursos/
    publicacoes/
    noticias/
    perfil/
    projetos/
```

O professor deve modificar apenas o conteúdo através do CMS.

O desenvolvedor controla:

```text
src/
configuração do Astro
configuração do Tina
estilos
componentes
deploy
```

---

# 16. Possíveis funcionalidades futuras

Não são requisitos do MVP, mas a arquitetura deve permitir evolução para:

### Pesquisa

- páginas de projetos;
- colaboradores;
- orientandos;
- grupos de pesquisa;
- equipamentos/laboratórios;
- datasets;
- códigos de pesquisa.

### Ensino

- simuladores interativos;
- gráficos;
- notebooks;
- códigos MATLAB/Python;
- vídeos;
- exercícios;
- páginas completas de disciplinas.

### Publicações

- importação automática de ORCID;
- Crossref/OpenAlex;
- BibTeX;
- exportação BibTeX;
- filtros por área/ano/tipo;
- busca.

### Site

- pesquisa global;
- dark mode;
- RSS;
- sitemap;
- SEO;
- acessibilidade;
- analytics.

---

# 17. Requisitos não funcionais

O site deve priorizar:

1. **Facilidade de administração pelo professor.**
2. **Baixa manutenção.**
3. **Performance.**
4. **SEO.**
5. **Acessibilidade.**
6. **Responsividade.**
7. **Versionamento do conteúdo.**
8. **Baixo custo de hospedagem.**
9. **Possibilidade de evolução.**
10. **Separação clara entre conteúdo e código.**

---

# 18. MVP recomendado

Antes de implementar funcionalidades avançadas, construir:

### Frontend

- Home
- Sobre
- Pesquisa
- Ensino
- Disciplinas
- Publicações
- Notícias
- Contato/CV

### CMS

- autenticação do professor;
- edição do perfil;
- CRUD de disciplinas;
- CRUD de aulas;
- CRUD de materiais;
- CRUD de publicações;
- CRUD de notícias.

### Integração

- GitHub;
- TinaCloud;
- Astro;
- Cloudflare Workers;
- links do Google Drive.

### Qualidade

- responsividade;
- SEO básico;
- sitemap;
- favicon;
- Open Graph;
- acessibilidade básica;
- página 404;
- otimização de imagens.

---

# 19. Ponto que ainda deve ser refinado

Antes de considerar a arquitetura definitiva, verificar na documentação atual do TinaCMS:

- fluxo exato de autenticação do TinaCloud;
- configuração de colaboradores;
- integração atual com Astro;
- funcionamento do editor visual;
- workflow de commits/publicação;
- integração/deploy com Cloudflare Workers;
- eventuais limitações do plano gratuito;
- como lidar com preview;
- como lidar com rascunhos;
- permissões disponíveis para diferentes usuários.

Não assumir que detalhes da implementação permanecem iguais a versões anteriores.

---

# 20. Decisão arquitetural atual

A decisão atual é:

> **Astro + TypeScript + Tailwind CSS + TinaCMS/TinaCloud + GitHub + Cloudflare Workers + Google Drive.**

A prioridade máxima é:

> **O professor deve conseguir administrar o conteúdo do site sem conhecimento técnico.**

A prioridade técnica é:

> **Manter o site simples, estático/majoritariamente estático, versionado e barato de hospedar.**

Não implementar backend ou banco de dados próprio sem uma necessidade concreta.

A implementação deve começar pelo **modelo de conteúdo e pela experiência do painel administrativo**, e não apenas pelo design da página pública. O modelo de conteúdo deve ser suficientemente flexível para permitir futuras disciplinas, publicações e materiais sem necessidade de alterar a estrutura do código.