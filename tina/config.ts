/**
 * ============================================================================
 *  Arquivo      : config.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Configuração mínima do TinaCMS — só a coleção `perfil`, com
 *                 os campos `nome`, `cargo` e `bio`. É a fatia vertical que
 *                 prova a integração Tina + Astro 7 antes do schema completo
 *                 das cinco coleções (plano 017 fecha as demais).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-02
 *  Atualizado em: 2026-09-02
 *  Versão       : 0.1.0
 *
 *  Dependências : tinacms (defineConfig)
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
 * ============================================================================
 */
import { defineConfig } from 'tinacms';

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
          },
          {
            type: 'string',
            name: 'bio',
            label: 'Biografia',
            ui: { component: 'textarea' },
          },
        ],
      },
    ],
  },
});
