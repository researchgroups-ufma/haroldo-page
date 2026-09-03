/**
 * ============================================================================
 *  Arquivo      : content.config.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Schemas Zod das cinco coleções de conteúdo do MVP (§7.3 do
 *                 PRD), usando a Content Layer API do Astro 7 com o loader
 *                 `glob()`. É o portão de validação (D-06): todo arquivo em
 *                 `content/` passa por aqui antes de virar página. O painel
 *                 TinaCMS (`tina/config.ts`, plano 017) é só a interface de
 *                 entrada — quem decide o que é um dado válido é este arquivo.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-02
 *  Atualizado em: 2026-09-03
 *  Versão       : 0.2.0
 *
 *  Dependências : astro:content (defineCollection, reference), astro/loaders
 *                 (glob), astro/zod (z)
 *  Entradas     : arquivos Markdown com frontmatter em `content/perfil/`,
 *                 `content/linhas-pesquisa/`, `content/projetos/`,
 *                 `content/disciplinas/`, `content/publicacoes/`
 *  Saídas       : `collections` — mapa consumido automaticamente pelo Astro
 *                 (`getCollection`, `getEntry`) e usado para gerar os tipos de
 *                 `astro:content`. Cada schema Zod (`perfilSchema`,
 *                 `linhasPesquisaSchema`, `projetosSchema`,
 *                 `disciplinasSchema`, `publicacoesSchema`) também é
 *                 exportado nomeadamente, para quem precisar do `ZodObject`
 *                 concreto sem passar pelo tipo união de `collections.*.schema`
 *                 (`ZodObject | ((context: SchemaContext) => ZodObject) |
 *                 undefined`, imposto pela Content Layer API) — é o caso dos
 *                 testes deste plano e do teste de paridade Zod × Tina do
 *                 plano 019
 *  Uso          : lido automaticamente pelo Astro a partir deste caminho fixo
 *                 (`src/content.config.ts`, raiz de `src/`)
 *
 *  Notas        : Astro 7 removeu as coleções legadas — `legacy.collections`
 *                 não existe mais, e `schema` como função de topo (fora da
 *                 Content Layer) também não. `z` vem de `astro/zod` (Zod 4);
 *                 `astro:schema` e o `z` antes exportado por `astro:content`
 *                 não existem mais. A coleção `noticias` (v1.1, NG-01 desta
 *                 fase) fica de fora de propósito.
 *
 *                 O grupo `en` (RN-06, RN-09, plano 018) foi acrescentado às
 *                 cinco coleções, sempre `.optional()` e `.strict()`: opcional
 *                 porque o português é canônico (RN-09) — todo campo dentro
 *                 dele também é opcional individualmente —, estrito para que
 *                 um campo factual colado ali dentro (ex.: `en.titulo` em
 *                 `publicacoes`, RN-07) seja rejeitado em vez de
 *                 silenciosamente descartado. A função de fallback por campo
 *                 (RN-06: campo vazio em `en` ⇒ usa o valor em PT) é da fase
 *                 4, não deste arquivo.
 *
 *                 Decisão de modelagem: os quatro campos "rich-text" da §7.3
 *                 (`bio`, `corpo`, `ementa`, `resumo`) são tratados como
 *                 campos de frontmatter (`z.string()`), não como o corpo do
 *                 arquivo Markdown — mas o motivo não é o mesmo para os
 *                 quatro, e é importante não confundir os dois:
 *
 *                 `bio` (perfil) é o único **obrigatório** (✔) e o único que
 *                 a §7.3 rotula como "corpo do arquivo". Para ele, a
 *                 justificativa é técnica: a Content Layer API só valida
 *                 `data` (frontmatter) pelo schema Zod — o corpo do arquivo
 *                 (`render()`) fica fora do alcance do Zod —, então
 *                 "obrigatório" deixaria de ser verificável se `bio` fosse o
 *                 corpo. Isso também casa com o que o plano 015 já gravou em
 *                 `content/perfil/index.md`: `bio` é um campo de frontmatter.
 *
 *                 `corpo` (linhas-pesquisa), `ementa` (disciplinas) e
 *                 `resumo` (publicacoes) são **opcionais** na §7.3 — para um
 *                 campo opcional, a Content Layer API valida "presente ou
 *                 ausente" sem problema estivesse ele em `data` ou fosse o
 *                 corpo do arquivo via `render()`, que é aliás o padrão mais
 *                 idiomático da Content Layer API para texto longo. Mantê-los
 *                 em frontmatter aqui é **só uma escolha de consistência e
 *                 simplicidade** dentro desta fase — os quatro tratados da
 *                 mesma forma, um único mecanismo de leitura —, não uma
 *                 necessidade técnica. Divergência de leitura assumida:
 *                 registrada na Evidência do plano 016 para que os planos 017
 *                 (schema do Tina) e 019 (paridade Zod × Tina) decidam de
 *                 olhos abertos se querem preservar essa escolha ou migrar
 *                 os três opcionais para corpo do arquivo quando a fase 3
 *                 definir como esse texto longo será renderizado.
 * ============================================================================
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Item de formação acadêmica dentro do perfil.
 *
 * `ano` é texto livre (não `number`) porque a formação costuma ser expressa
 * como período ("2019–2023"), diferente de `publicacoes.ano`, que é um único
 * ano numérico validado pela F-09.
 */
const formacaoSchema = z.object({
  grau: z.string(),
  curso: z.string(),
  instituicao: z.string(),
  ano: z.string(),
});

/** Links acadêmicos do perfil (§7.3) — todos opcionais e, quando preenchidos, URLs válidas. */
const linksSchema = z.object({
  lattes: z.url().optional(),
  orcid: z.url().optional(),
  scholar: z.url().optional(),
  arxiv: z.url().optional(),
  researchgate: z.url().optional(),
  github: z.url().optional(),
  institucional: z.url().optional(),
});

/**
 * Subconjunto traduzível de `formacaoSchema`, dentro do grupo `en` (plano 018).
 *
 * A §7.3 marca `formacao[]` como "✔ (título)", mas o objeto `{grau, curso,
 * instituicao, ano}` não tem campo `titulo` — o título de uma formação é a
 * junção de `grau` e `curso` (ex.: "Doutorado em Física" → "PhD in Physics");
 * traduzir só `curso` produziria "Doutorado in Physics" na rota `/en`.
 * `instituicao` e `ano` são dados factuais (RN-07) e ficam fora.
 *
 * `en.formacao[]` é uma lista paralela a `formacao[]`, alinhada por índice —
 * reordenar a lista em português desalinha a tradução. O realinhamento não é
 * implementado aqui: é um mecanismo da fase 4, junto do fallback.
 */
const formacaoEnSchema = z
  .object({
    grau: z.string().optional(),
    curso: z.string().optional(),
  })
  .strict();

/**
 * Grupo `en` da coleção `perfil` (§7.3, RN-06, RN-09, plano 018) — opcional,
 * e cada campo dentro dele também. `.strict()`: um campo factual (ex.:
 * `email`, `nome`) colado dentro de `en` é rejeitado em vez de
 * silenciosamente descartado.
 *
 * `en.areas[]` é lista paralela a `areas[]`, alinhada por índice — mesma
 * ressalva de `formacaoEnSchema` acima.
 */
const perfilEnSchema = z
  .object({
    cargo: z.string().optional(),
    instituicao: z.string().optional(),
    departamento: z.string().optional(),
    bio: z.string().optional(),
    resumo_home: z.string().optional(),
    formacao: z.array(formacaoEnSchema).optional(),
    areas: z.array(z.string()).optional(),
  })
  .strict();

/**
 * Schema Zod da coleção `perfil` — singleton em `content/perfil/index.md`
 * (§7.3).
 *
 * Sem `publicado`: é um singleton, não uma coleção de listagem (RN-01 só se
 * aplica a `linhas-pesquisa`, `projetos`, `disciplinas` e `publicacoes`).
 * Exportado nomeadamente para ser consumido como `ZodObject` concreto (ver
 * nota de "Saídas" no cabeçalho do arquivo).
 */
export const perfilSchema = z.object({
  nome: z.string(),
  cargo: z.string(),
  instituicao: z.string(),
  departamento: z.string().optional(),
  // "imagem" (§7.3): caminho/URL para o arquivo gravado no repositório pelo
  // painel (RF-12); validação de formato de imagem fica com o Tina/upload.
  foto: z.string().optional(),
  bio: z.string(),
  resumo_home: z.string(),
  formacao: z.array(formacaoSchema).optional(),
  areas: z.array(z.string()).optional(),
  email: z.email(),
  links: linksSchema.optional(),
  cv_url: z.url().optional(),
  en: perfilEnSchema.optional(),
});

const perfil = defineCollection({
  loader: glob({ pattern: 'index.md', base: './content/perfil' }),
  schema: perfilSchema,
});

/** Grupo `en` da coleção `linhas-pesquisa` (§7.3, RN-06, RN-09, plano 018). */
const linhasPesquisaEnSchema = z
  .object({
    titulo: z.string().optional(),
    resumo: z.string().optional(),
    corpo: z.string().optional(),
  })
  .strict();

/**
 * Schema Zod da coleção `linhas-pesquisa` — `content/linhas-pesquisa/*.md`
 * (§7.3).
 *
 * `publicado` obrigatório: RN-01, é coleção de listagem.
 */
export const linhasPesquisaSchema = z.object({
  titulo: z.string(),
  ordem: z.number().optional(),
  resumo: z.string(),
  corpo: z.string().optional(),
  imagem: z.string().optional(),
  publicado: z.boolean(),
  en: linhasPesquisaEnSchema.optional(),
});

const linhasPesquisa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/linhas-pesquisa' }),
  schema: linhasPesquisaSchema,
});

/**
 * Grupo `en` da coleção `projetos` (RN-06, RN-09, plano 018).
 *
 * A §7.3 diz apenas "grupo `en`", sem listar campos. Decisão deste plano, por
 * RN-07: traduzível é `titulo` e `descricao`; `periodo`, `financiador`,
 * `status`, `colaboradores` e `linha_relacionada` são dados factuais e ficam
 * fora.
 */
const projetosEnSchema = z
  .object({
    titulo: z.string().optional(),
    descricao: z.string().optional(),
  })
  .strict();

/**
 * Schema Zod da coleção `projetos` — `content/projetos/*.md` (§7.3).
 *
 * `linha_relacionada` referencia `linhas-pesquisa` (opcional). `publicado`
 * obrigatório: RN-01, é coleção de listagem.
 */
export const projetosSchema = z.object({
  titulo: z.string(),
  periodo: z
    .object({
      inicio: z.string(),
      fim: z.string().optional(),
    })
    .optional(),
  financiador: z.string().optional(),
  status: z.enum(['em andamento', 'concluído']).optional(),
  descricao: z.string(),
  // "colaboradores[]" (§7.3): string livre no MVP, sem coleção própria.
  colaboradores: z.array(z.string()).optional(),
  linha_relacionada: reference('linhas-pesquisa').optional(),
  publicado: z.boolean(),
  en: projetosEnSchema.optional(),
});

const projetos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/projetos' }),
  schema: projetosSchema,
});

/** Referência bibliográfica dentro de uma disciplina. */
const bibliografiaSchema = z.object({
  referencia: z.string(),
  url: z.url().optional(),
});

/**
 * Aula dentro de uma disciplina (D-05: lista embutida, não coleção própria).
 *
 * `url` é URL livre, agnóstica ao hospedeiro (D-07) — validada apenas como
 * URL, nunca por domínio (ex.: não se exige que seja um link do Google Drive).
 */
const aulaSchema = z.object({
  numero: z.number(),
  titulo: z.string(),
  data: z.string().optional(),
  descricao: z.string().optional(),
  url: z.url(),
});

/** Lista de exercícios dentro de uma disciplina (D-05). URL livre (D-07). */
const listaSchema = z.object({
  titulo: z.string(),
  data_entrega: z.string().optional(),
  url: z.url(),
});

/** Material complementar dentro de uma disciplina (D-05). URL livre (D-07). */
const materialSchema = z.object({
  titulo: z.string(),
  tipo: z.enum(['slides', 'notas', 'complementar']),
  descricao: z.string().optional(),
  url: z.url(),
});

/** Link externo (simulação, vídeo, página) dentro de uma disciplina. */
const linkDisciplinaSchema = z.object({
  titulo: z.string(),
  url: z.url(),
});

/** Grupo `en` da coleção `disciplinas` (§7.3, RN-06, RN-09, plano 018). */
const disciplinasEnSchema = z
  .object({
    nome: z.string().optional(),
    descricao: z.string().optional(),
    ementa: z.string().optional(),
  })
  .strict();

/**
 * Schema Zod da coleção `disciplinas` — `content/disciplinas/*.md` (§7.3).
 *
 * `aulas`, `listas` e `materiais` são listas embutidas no arquivo da
 * disciplina (D-05), não coleções separadas. `publicado` obrigatório: RN-01,
 * é coleção de listagem.
 */
export const disciplinasSchema = z.object({
  nome: z.string(),
  codigo: z.string().optional(),
  semestre: z.string(),
  status: z.enum(['atual', 'anterior']),
  descricao: z.string().optional(),
  ementa: z.string().optional(),
  bibliografia: z.array(bibliografiaSchema).optional(),
  aulas: z.array(aulaSchema).optional(),
  listas: z.array(listaSchema).optional(),
  materiais: z.array(materialSchema).optional(),
  links: z.array(linkDisciplinaSchema).optional(),
  publicado: z.boolean(),
  en: disciplinasEnSchema.optional(),
});

const disciplinas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/disciplinas' }),
  schema: disciplinasSchema,
});

/**
 * Grupo `en` da coleção `publicacoes` (§7.3, RN-06, RN-07, RN-09, plano 018).
 *
 * Apenas `resumo` — `titulo` e `autores` não entram: são dados factuais
 * (RN-07), e traduzi-los produziria duas citações divergentes do mesmo
 * trabalho. `.strict()` é o que torna esse limite verificável: `en.titulo`
 * ou `en.autores` são rejeitados, não silenciosamente descartados.
 */
const publicacoesEnSchema = z
  .object({
    resumo: z.string().optional(),
  })
  .strict();

/**
 * Schema Zod da coleção `publicacoes` — `content/publicacoes/*.md` (§7.3).
 *
 * `ano` validado entre 1900 e 2100 (F-09). `tipo` é um enum fechado. `titulo`
 * e `autores` não são traduzíveis (RN-07) — dado factual, existe uma única
 * vez, e o grupo `en` (plano 018) não os toca.
 */
export const publicacoesSchema = z.object({
  titulo: z.string(),
  autores: z.array(z.string()).min(1),
  ano: z.number().int().min(1900).max(2100),
  veiculo: z.string().optional(),
  tipo: z.enum(['artigo', 'preprint', 'capítulo', 'livro', 'anais', 'tese', 'outro']),
  doi: z.string().optional(),
  arxiv: z.string().optional(),
  pdf_url: z.url().optional(),
  resumo: z.string().optional(),
  palavras_chave: z.array(z.string()).optional(),
  destaque: z.boolean().optional(),
  publicado: z.boolean(),
  en: publicacoesEnSchema.optional(),
});

const publicacoes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/publicacoes' }),
  schema: publicacoesSchema,
});

/**
 * Mapa de coleções consumido pelo Astro (`getCollection`, `getEntry`) e usado
 * para gerar os tipos de `astro:content`. As cinco coleções do MVP (§6.1) —
 * `noticias` fica fora de propósito, é v1.1 (NG-01).
 */
export const collections = {
  perfil,
  'linhas-pesquisa': linhasPesquisa,
  projetos,
  disciplinas,
  publicacoes,
};
