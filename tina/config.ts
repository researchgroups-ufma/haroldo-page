/**
 * ============================================================================
 *  Arquivo      : config.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Configuração completa do TinaCMS — as cinco coleções do MVP
 *                 (§7.3 do PRD: `perfil`, `linhas-pesquisa`, `projetos`,
 *                 `disciplinas`, `publicacoes`), com rótulos e textos de ajuda
 *                 em vocabulário acadêmico (RF-03), templates de nome de
 *                 arquivo (RN-08) e o interruptor Rascunho/Publicado (RN-01,
 *                 D-04) nas quatro coleções de listagem. Esta é a interface de
 *                 entrada do professor — quem valida o dado é o Zod
 *                 (`src/content.config.ts`, D-06).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-02
 *  Atualizado em: 2026-09-03
 *  Versão       : 0.2.0
 *
 *  Dependências : tinacms (defineConfig), src/lib/slug.ts (slugify, reusado
 *                 nos templates de nome de arquivo — ver nota abaixo)
 *  Entradas     : TINA_CLIENT_ID, TINA_TOKEN, TINA_BRANCH — variáveis de
 *                 ambiente lidas do `.env` local pelo `@tinacms/cli`
 *  Saídas       : configuração consumida por `tinacms dev` / `tinacms build`,
 *                 que gera o painel estático em `public/admin` e o cliente em
 *                 `tina/__generated__`
 *  Uso          : lido automaticamente pela CLI do Tina a partir deste caminho
 *
 *  Notas        : sem visual/contextual editing (D-02) — o painel funciona só
 *                 por formulários; `astro.config.mjs` continua com
 *                 `output: 'static'` (D-01), sem integração `@tinacms/astro`
 *                 wireada — essa integração exigiria SSR.
 *
 *                 `slugify` é importado de `../src/lib/slug` (plano 005), não
 *                 espelhado aqui: a CLI do Tina (`@tinacms/cli`) empacota este
 *                 arquivo com esbuild e resolve imports relativos para
 *                 qualquer módulo TypeScript do projeto, sem configuração
 *                 adicional — confirmado rodando `tinacms dev` com este
 *                 import (ver Evidência do plano 017).
 *
 *                 `name: 'linhas_pesquisa'` (com underscore) diverge de
 *                 `label`/`path` (com hífen) porque o Tina exige que o `name`
 *                 de uma coleção seja alfanumérico/underscore — é o
 *                 identificador GraphQL interno, validado por
 *                 `tinacms build`. O hífen só sobrevive onde o professor e o
 *                 sistema de arquivos enxergam: `label: 'Linhas de pesquisa'`
 *                 e `path: 'content/linhas-pesquisa'`. A referência em
 *                 `projetos.linha_relacionada.collections` usa o `name` com
 *                 underscore pelo mesmo motivo.
 *
 *                 Decisão de modelagem (herdada em aberto do plano 016, ver
 *                 README da fase 1): os campos "rich-text" opcionais da §7.3
 *                 — `corpo` (linhas-pesquisa), `ementa` (disciplinas) e
 *                 `resumo` (publicacoes) — são modelados aqui como
 *                 `type: 'string'` com `ui.component: 'textarea'`, **não**
 *                 como `type: 'rich-text'`, e ficam no frontmatter, como em
 *                 `src/content.config.ts`. O motivo é técnico, não inércia: o
 *                 tipo `rich-text` do Tina, quando não é `isBody: true`,
 *                 serializa o campo como uma árvore de sintaxe (objeto
 *                 `{ type: 'root', children: [...] }`), não como uma string —
 *                 incompatível com o `z.string()` do schema Zod atual. Com
 *                 `isBody: true` o valor sai do frontmatter e vira o corpo
 *                 Markdown do arquivo, o que o Zod (que só valida `data`, via
 *                 Content Layer API) deixaria de enxergar, quebrando a
 *                 paridade D-06 sem tocar em `src/content.config.ts` (fora do
 *                 escopo deste plano). `type: 'string'` + `textarea` é a única
 *                 opção que preserva string plana em frontmatter dos dois
 *                 lados. A mesma lógica já vale para `bio` (perfil, plano
 *                 015). Migrar os quatro para corpo Markdown via `render()` é
 *                 decisão explícita da fase 3, quando o modelo de renderização
 *                 de texto longo estiver definido.
 * ============================================================================
 */
import { defineConfig } from 'tinacms';
import { slugify } from '../src/lib/slug';

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      publicFolder: 'public',
      mediaRoot: 'uploads',
    },
  },
  schema: {
    collections: [
      // `perfil` — singleton (content/perfil/index.md, §7.3). Sem `publicado`
      // (RN-01 só se aplica às quatro coleções de listagem abaixo) e sem
      // template de nome de arquivo (RN-08 é sobre coleções de pasta).
      {
        name: 'perfil',
        label: 'Perfil',
        path: 'content/perfil',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'nome',
            label: 'Nome',
            required: true,
          },
          {
            type: 'string',
            name: 'cargo',
            label: 'Cargo',
            required: true,
            description: 'Ex.: Professor Adjunto.',
          },
          {
            type: 'string',
            name: 'instituicao',
            label: 'Instituição',
            required: true,
          },
          {
            type: 'string',
            name: 'departamento',
            label: 'Departamento',
          },
          {
            type: 'image',
            name: 'foto',
            label: 'Foto',
            description: 'Imagem de perfil, armazenada no repositório do site.',
          },
          {
            type: 'string',
            name: 'bio',
            label: 'Biografia',
            required: true,
            ui: { component: 'textarea' },
            description: 'Texto descritivo da carreira acadêmica, exibido na página Sobre.',
          },
          {
            type: 'string',
            name: 'resumo_home',
            label: 'Resumo para a Home',
            required: true,
            ui: { component: 'textarea' },
            description: '1–2 frases exibidas na Home.',
          },
          {
            type: 'object',
            name: 'formacao',
            label: 'Formação acadêmica',
            list: true,
            description: 'Graus, cursos e instituições, do mais recente ao mais antigo.',
            ui: {
              itemProps: (item) => ({
                label: [item?.grau, item?.curso].filter(Boolean).join(' — ') || 'Nova formação',
              }),
            },
            fields: [
              { type: 'string', name: 'grau', label: 'Grau', required: true },
              { type: 'string', name: 'curso', label: 'Curso', required: true },
              { type: 'string', name: 'instituicao', label: 'Instituição', required: true },
              {
                type: 'string',
                name: 'ano',
                label: 'Ano',
                required: true,
                description: 'Período em formato livre, ex.: 2019–2023.',
              },
            ],
          },
          {
            type: 'string',
            name: 'areas',
            label: 'Áreas de atuação',
            list: true,
            description: 'Uma área por item — toque em "+" para adicionar outra.',
          },
          {
            type: 'string',
            name: 'email',
            label: 'E-mail',
            required: true,
            description: 'E-mail institucional — nunca o pessoal (LGPD, §9).',
          },
          {
            type: 'object',
            name: 'links',
            label: 'Links acadêmicos',
            description: 'Perfis acadêmicos — todos opcionais.',
            fields: [
              { type: 'string', name: 'lattes', label: 'Lattes' },
              { type: 'string', name: 'orcid', label: 'ORCID' },
              { type: 'string', name: 'scholar', label: 'Google Scholar' },
              { type: 'string', name: 'arxiv', label: 'arXiv' },
              { type: 'string', name: 'researchgate', label: 'ResearchGate' },
              { type: 'string', name: 'github', label: 'GitHub' },
              { type: 'string', name: 'institucional', label: 'Página institucional' },
            ],
          },
          {
            type: 'string',
            name: 'cv_url',
            label: 'Currículo (PDF)',
            description: 'Link do currículo em PDF (ex.: Google Drive).',
          },
        ],
      },

      // `linhas-pesquisa` — pasta (content/linhas-pesquisa/*.md, §7.3).
      // Nome de arquivo não prescrito pelo PRD para esta coleção: escolhido
      // `{slug(titulo)}.md`, coerente com o padrão de `publicacoes` (que usa
      // o slug do título como parte do nome) e seguro porque `titulo` é o
      // único campo sempre presente (RN-08; ver Evidência do plano 017).
      //
      // `name` usa underscore, não hífen: o Tina exige que o `name` da
      // coleção seja alfanumérico/underscore (é o identificador GraphQL
      // interno). `label` (o que o professor vê) e `path` (a pasta real em
      // `content/`) continuam com hífen — só o identificador interno muda.
      {
        name: 'linhas_pesquisa',
        label: 'Linhas de pesquisa',
        path: 'content/linhas-pesquisa',
        format: 'md',
        // `defaultItem` semeia o documento novo com `publicado: false`, para o interruptor não
        // nascer `undefined` (que o Tina marca "Required" antes de qualquer interação do
        // professor — achado da revisão do plano 017; a tentativa anterior com
        // `ui.defaultValue` no campo não funcionou, confirmado pelo orquestrador pelo painel).
        // Verificado pelo orquestrador no painel em 2026-09-03: documento novo salvo sem tocar
        // no interruptor gravou `publicado: false` no frontmatter (ver Evidência do plano 017).
        //
        // `BaseCollection.defaultItem` está marcado @deprecated em
        // @tinacms/schema-tools/dist/types/index.d.ts:811-814 ("use `ui.defaultItem` on the
        // each `template` instead"). Não migrado: `ui.defaultItem` só é tipado em `Template`, e
        // estas cinco coleções usam `fields` diretamente, não `templates` — `UICollection`
        // (mesmo arquivo, linha 868) não declara `defaultItem`, e o próprio Tina só acessa essa
        // forma via `// @ts-ignore` (tinacms/dist/index.js:75157-75159). Entre a API depreciada
        // (type-safe aqui) e a recomendada (não tipada para `fields`), ficamos com a depreciada,
        // deliberadamente. Risco: um upgrade do Tina pode remover este campo sem aviso — se
        // isso acontecer, o sintoma volta a ser o do ciclo 1 (ver Evidência do plano 017).
        defaultItem: { publicado: false },
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => slugify(String(values?.titulo ?? '')),
            description: 'Gerado automaticamente a partir do título — não é digitado.',
          },
        },
        fields: [
          {
            type: 'boolean',
            name: 'publicado',
            label: 'Publicado',
            required: true,
            description: 'Quando desmarcado, a linha de pesquisa fica invisível no site (RN-01).',
          },
          {
            type: 'string',
            name: 'titulo',
            label: 'Título',
            required: true,
          },
          {
            type: 'number',
            name: 'ordem',
            label: 'Ordem de exibição',
            description: 'Define a posição na listagem — menor aparece primeiro.',
          },
          {
            type: 'string',
            name: 'resumo',
            label: 'Resumo',
            required: true,
            ui: { component: 'textarea' },
            description: 'Texto curto exibido na listagem de linhas de pesquisa.',
          },
          {
            type: 'string',
            name: 'corpo',
            label: 'Texto completo',
            ui: { component: 'textarea' },
            description: 'Texto completo da linha de pesquisa, opcional.',
          },
          {
            type: 'image',
            name: 'imagem',
            label: 'Imagem',
          },
        ],
      },

      // `projetos` — pasta (content/projetos/*.md, §7.3). Nome de arquivo não
      // prescrito pelo PRD: mesmo raciocínio de `linhas-pesquisa` —
      // `{slug(titulo)}.md`. Não se usa `periodo.inicio` no nome porque
      // `periodo` é opcional na §7.3 (um projeto sem período ainda precisa de
      // nome de arquivo previsível).
      {
        name: 'projetos',
        label: 'Projetos',
        path: 'content/projetos',
        format: 'md',
        // Ver nota equivalente em `linhas_pesquisa` — mesmo mecanismo, verificado pelo mesmo
        // teste do orquestrador em 2026-09-03 (Evidência do plano 017).
        defaultItem: { publicado: false },
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => slugify(String(values?.titulo ?? '')),
            description: 'Gerado automaticamente a partir do título — não é digitado.',
          },
        },
        fields: [
          {
            type: 'boolean',
            name: 'publicado',
            label: 'Publicado',
            required: true,
            description: 'Quando desmarcado, o projeto fica invisível no site (RN-01).',
          },
          {
            type: 'string',
            name: 'titulo',
            label: 'Título',
            required: true,
          },
          {
            type: 'object',
            name: 'periodo',
            label: 'Período de execução',
            fields: [
              { type: 'string', name: 'inicio', label: 'Início', required: true },
              {
                type: 'string',
                name: 'fim',
                label: 'Fim',
                description: 'Deixe em branco se o projeto ainda está em andamento.',
              },
            ],
          },
          {
            type: 'string',
            name: 'financiador',
            label: 'Financiador',
          },
          {
            type: 'string',
            name: 'status',
            label: 'Status',
            options: ['em andamento', 'concluído'],
          },
          {
            type: 'string',
            name: 'descricao',
            label: 'Descrição',
            required: true,
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'colaboradores',
            label: 'Colaboradores',
            list: true,
            description: 'Nomes de colaboradores só entram com anuência (LGPD, §9).',
          },
          {
            // NOTE (revisão do plano 017, divergência de paridade não corrigida aqui — ver
            // Evidência): o Tina grava aqui o id completo do documento referenciado
            // ("content/linhas-pesquisa/<slug>.md"), enquanto o `glob` loader do
            // `reference('linhas-pesquisa')` em `src/content.config.ts` espera o id no formato
            // do loader ("<slug>", sem prefixo de pasta nem extensão). `getEntry()` devolve
            // `undefined` em runtime — falha silenciosa, não capturada por `npm run build` nem
            // `npm run test`. Reconciliar é o plano 019.
            type: 'reference',
            name: 'linha_relacionada',
            label: 'Linha de pesquisa relacionada',
            collections: ['linhas_pesquisa'],
            description: 'Linha de pesquisa relacionada a este projeto, se houver.',
          },
        ],
      },

      // `disciplinas` — pasta (content/disciplinas/*.md, §7.3). `aulas`,
      // `listas` e `materiais` embutidos como listas de objeto (D-05) — sem
      // coleção separada. Nome de arquivo prescrito: `{semestre}-{slug(nome)}`
      // (RN-08).
      {
        name: 'disciplinas',
        label: 'Disciplinas',
        path: 'content/disciplinas',
        format: 'md',
        // Ver nota equivalente em `linhas_pesquisa` — mesmo mecanismo, verificado pelo mesmo
        // teste do orquestrador em 2026-09-03 (Evidência do plano 017).
        defaultItem: { publicado: false },
        ui: {
          filename: {
            readonly: true,
            slugify: (values) =>
              `${String(values?.semestre ?? '')}-${slugify(String(values?.nome ?? ''))}`,
            description: 'Gerado automaticamente a partir do semestre e do nome — não é digitado.',
          },
        },
        fields: [
          {
            type: 'boolean',
            name: 'publicado',
            label: 'Publicado',
            required: true,
            description: 'Quando desmarcado, a disciplina fica invisível no site (RN-01).',
          },
          {
            type: 'string',
            name: 'nome',
            label: 'Nome',
            required: true,
            description: 'Ex.: Mecânica Clássica.',
          },
          {
            type: 'string',
            name: 'codigo',
            label: 'Código',
            description: 'Ex.: FIS0123.',
          },
          {
            type: 'string',
            name: 'semestre',
            label: 'Semestre',
            required: true,
            description: 'Formato livre, ex.: 2026.2.',
          },
          {
            type: 'string',
            name: 'status',
            label: 'Status',
            required: true,
            options: ['atual', 'anterior'],
            description:
              'A transição de "Atual" para "Anterior" é manual — o painel não faz isso sozinho.',
          },
          {
            type: 'string',
            name: 'descricao',
            label: 'Descrição',
            ui: { component: 'textarea' },
            description: 'Resumo curto exibido na listagem de disciplinas.',
          },
          {
            type: 'string',
            name: 'ementa',
            label: 'Ementa',
            ui: { component: 'textarea' },
          },
          {
            type: 'object',
            name: 'bibliografia',
            label: 'Bibliografia',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.referencia || 'Nova referência' }),
            },
            fields: [
              { type: 'string', name: 'referencia', label: 'Referência', required: true },
              {
                type: 'string',
                name: 'url',
                label: 'Link',
                description: 'Link opcional para a referência.',
              },
            ],
          },
          {
            type: 'object',
            name: 'aulas',
            label: 'Aulas',
            list: true,
            description: 'Aulas da disciplina, na ordem em que devem aparecer.',
            ui: {
              itemProps: (item) => ({
                label: item?.titulo ? `${item?.numero ?? ''} — ${item.titulo}` : 'Nova aula',
              }),
            },
            fields: [
              { type: 'number', name: 'numero', label: 'Número', required: true },
              { type: 'string', name: 'titulo', label: 'Título', required: true },
              { type: 'string', name: 'data', label: 'Data' },
              {
                type: 'string',
                name: 'descricao',
                label: 'Descrição',
                ui: { component: 'textarea' },
              },
              {
                type: 'string',
                name: 'url',
                label: 'Link',
                required: true,
                description:
                  'Link do material da aula — Drive, repositório institucional, arXiv, YouTube etc.',
              },
            ],
          },
          {
            type: 'object',
            name: 'listas',
            label: 'Listas de exercícios',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.titulo || 'Nova lista' }),
            },
            fields: [
              { type: 'string', name: 'titulo', label: 'Título', required: true },
              { type: 'string', name: 'data_entrega', label: 'Data de entrega' },
              {
                type: 'string',
                name: 'url',
                label: 'Link',
                required: true,
                description: 'Link da lista de exercícios — qualquer hospedeiro serve.',
              },
            ],
          },
          {
            type: 'object',
            name: 'materiais',
            label: 'Materiais complementares',
            list: true,
            description: 'Slides, notas de aula e textos extras.',
            ui: {
              itemProps: (item) => ({ label: item?.titulo || 'Novo material' }),
            },
            fields: [
              { type: 'string', name: 'titulo', label: 'Título', required: true },
              {
                type: 'string',
                name: 'tipo',
                label: 'Tipo',
                required: true,
                options: ['slides', 'notas', 'complementar'],
              },
              {
                type: 'string',
                name: 'descricao',
                label: 'Descrição',
                ui: { component: 'textarea' },
              },
              {
                type: 'string',
                name: 'url',
                label: 'Link',
                required: true,
                description: 'Link do material — qualquer hospedeiro serve.',
              },
            ],
          },
          {
            type: 'object',
            name: 'links',
            label: 'Links externos',
            list: true,
            description: 'Simulações, vídeos ou páginas externas relacionadas à disciplina.',
            ui: {
              itemProps: (item) => ({ label: item?.titulo || 'Novo link' }),
            },
            fields: [
              { type: 'string', name: 'titulo', label: 'Título', required: true },
              { type: 'string', name: 'url', label: 'Link', required: true },
            ],
          },
        ],
      },

      // `publicacoes` — pasta (content/publicacoes/*.md, §7.3). Nome de
      // arquivo prescrito: `{ano}-{slug(titulo)}` (RN-08). `titulo` e
      // `autores` não são traduzíveis (RN-07) — sem grupo `en` aqui (plano
      // 018 cuida do grupo "Versão em inglês" nas coleções que o admitem).
      {
        name: 'publicacoes',
        label: 'Publicações',
        path: 'content/publicacoes',
        format: 'md',
        // Ver nota equivalente em `linhas_pesquisa` — mesmo mecanismo, verificado pelo mesmo
        // teste do orquestrador em 2026-09-03 (Evidência do plano 017).
        defaultItem: { publicado: false },
        ui: {
          filename: {
            readonly: true,
            slugify: (values) =>
              `${String(values?.ano ?? '')}-${slugify(String(values?.titulo ?? ''))}`,
            description: 'Gerado automaticamente a partir do ano e do título — não é digitado.',
          },
        },
        fields: [
          {
            type: 'boolean',
            name: 'publicado',
            label: 'Publicado',
            required: true,
            description: 'Quando desmarcado, a publicação fica invisível no site (RN-01).',
          },
          {
            type: 'string',
            name: 'titulo',
            label: 'Título',
            required: true,
          },
          {
            type: 'string',
            name: 'autores',
            label: 'Autores',
            list: true,
            required: true,
            description:
              'Um autor por item, na ordem da citação — toque em "+" para adicionar outro; o nome do professor é destacado automaticamente na exibição.',
          },
          {
            type: 'number',
            name: 'ano',
            label: 'Ano',
            required: true,
            description: 'Ano de publicação, entre 1900 e 2100.',
          },
          {
            type: 'string',
            name: 'veiculo',
            label: 'Veículo',
            description: 'Periódico, conferência ou editora.',
          },
          {
            type: 'string',
            name: 'tipo',
            label: 'Tipo',
            required: true,
            options: ['artigo', 'preprint', 'capítulo', 'livro', 'anais', 'tese', 'outro'],
          },
          {
            type: 'string',
            name: 'doi',
            label: 'DOI',
          },
          {
            type: 'string',
            name: 'arxiv',
            label: 'arXiv',
          },
          {
            type: 'string',
            name: 'pdf_url',
            label: 'Link do PDF',
            description: 'Link do Drive ou repositório institucional.',
          },
          {
            type: 'string',
            name: 'resumo',
            label: 'Resumo',
            ui: { component: 'textarea' },
            description: 'Resumo da publicação, opcional.',
          },
          {
            type: 'string',
            name: 'palavras_chave',
            label: 'Palavras-chave',
            list: true,
            description: 'Uma palavra-chave por item — toque em "+" para adicionar outra.',
          },
          {
            type: 'boolean',
            name: 'destaque',
            label: 'Destaque',
            description: 'Quando marcado, a publicação aparece em destaque na Home.',
          },
        ],
      },
    ],
  },
});
