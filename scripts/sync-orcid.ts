/**
 * ============================================================================
 *  Arquivo      : sync-orcid.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Cadastra em content/publicacoes/ os trabalhos do ORCID do
 *                 professor que o site ainda não viu (RF-17), com autores e
 *                 veículo pela Crossref.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-09
 *  Atualizado em: 2026-10-09
 *  Versão       : 0.1.0
 *
 *  Dependências : gray-matter, src/lib/orcid.ts; rede (ORCID e Crossref)
 *  Entradas     : links.orcid de content/perfil/index.md; content/publicacoes/;
 *                 data/orcid-vistos.json; CROSSREF_MAILTO (opcional)
 *  Saídas       : .md novos em content/publicacoes/; data/orcid-vistos.json;
 *                 `mudou` e `novos` em GITHUB_OUTPUT; mensagem de commit em
 *                 ORCID_COMMIT_MSG
 *  Uso          : npm run sync-orcid (semanal pelo .github/workflows/orcid.yml)
 *
 *  Notas        : só acrescenta, nunca altera nem apaga arquivo. "Visto" é
 *                 permanente: publicação apagada no painel não volta. DOI que a
 *                 Crossref não conhece (404) vira visto com aviso; falha de rede
 *                 ou 5xx deixa o DOI para a próxima execução. Decisões em
 *                 docs/sabatinas/CHANGELOG_sabatina_sync-orcid.md.
 * ============================================================================
 */
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import console from 'node:console';
import process from 'node:process';
import matter from 'gray-matter';
import {
  buildPublication,
  commitMessage,
  normalizeDoi,
  parseCrossref,
  parseOrcidWorks,
  selectNew,
  type CrossrefWork,
  type PublicationEntry,
} from '../src/lib/orcid.ts';

const PUBLICACOES = 'content/publicacoes';
const PERFIL = 'content/perfil/index.md';
const VISTOS = 'data/orcid-vistos.json';
const USER_AGENT = 'haroldo-page (https://github.com/researchgroups-ufma/haroldo-page)';
// O gray-matter repassa as opções ao js-yaml. `lineWidth: -1` impede que título longo saia
// dobrado em `>-`: o painel grava numa linha, e o primeiro salvamento reescreveria o arquivo.
// Constante, e não literal na chamada, porque o tipo do gray-matter não declara `lineWidth`.
const YAML = { language: 'yaml', lineWidth: -1 };

type CrossrefResult =
  | { status: 'ok'; work: CrossrefWork }
  | { status: 'ausente' }
  | { status: 'falha'; motivo: string };

/** ORCID iD do professor, lido do perfil para que trocar no painel troque a fonte. */
function orcidDoPerfil(): string {
  const link = String(matter(readFileSync(PERFIL, 'utf-8')).data.links?.orcid ?? '');
  const id = /\d{4}-\d{4}-\d{4}-\d{3}[\dX]/.exec(link)?.[0];
  if (!id) throw new Error(`links.orcid ausente ou inválido em ${PERFIL}: "${link}"`);
  return id;
}

/** DOIs normalizados de todas as publicações do site, publicadas ou não. */
function doisNoSite(): Set<string> {
  const dois = new Set<string>();
  for (const nome of readdirSync(PUBLICACOES).filter((n) => n.endsWith('.md'))) {
    const doi = normalizeDoi(matter(readFileSync(join(PUBLICACOES, nome), 'utf-8')).data.doi);
    if (doi) dois.add(doi);
  }
  return dois;
}

function lerVistos(): Set<string> {
  return existsSync(VISTOS)
    ? new Set(JSON.parse(readFileSync(VISTOS, 'utf-8')) as string[])
    : new Set();
}

function gravarVistos(vistos: Set<string>): void {
  mkdirSync(dirname(VISTOS), { recursive: true });
  writeFileSync(VISTOS, `${JSON.stringify([...vistos].sort(), null, 2)}\n`);
}

async function buscarOrcid(orcid: string) {
  const res = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`ORCID respondeu HTTP ${res.status}`);
  return parseOrcidWorks(await res.json());
}

async function buscarCrossref(doi: string, mailto: string): Promise<CrossrefResult> {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': mailto ? `${USER_AGENT} mailto:${mailto}` : USER_AGENT },
    });
    if (res.status === 404) return { status: 'ausente' };
    if (!res.ok) return { status: 'falha', motivo: `HTTP ${res.status}` };
    return { status: 'ok', work: parseCrossref((await res.json()).message) };
  } catch (erro) {
    return { status: 'falha', motivo: String(erro) };
  }
}

function saida(chave: string, valor: string | number): void {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${chave}=${valor}\n`);
}

async function main(): Promise<void> {
  const orcid = orcidDoPerfil();
  const works = await buscarOrcid(orcid);
  console.log(`ORCID ${orcid}: ${works.length} trabalhos`);

  const vistos = lerVistos();
  const { novos, semDoi, jaNoSite } = selectNew(works, vistos, doisNoSite());
  for (const work of semDoi) console.warn(`  sem DOI, ignorado: ${work.title}`);

  // Viram vistos sem gerar arquivo: o que já estava no site e o que a Crossref não conhece.
  const soMarcados = [...jaNoSite];
  const adicionadas: PublicationEntry[] = [];
  for (const work of novos) {
    const crossref = await buscarCrossref(work.doi, process.env.CROSSREF_MAILTO ?? '');
    if (crossref.status === 'falha') {
      console.warn(
        `  Crossref falhou para ${work.doi} (${crossref.motivo}); fica para a próxima execução`,
      );
      continue;
    }
    if (crossref.status === 'ausente') {
      console.warn(
        `  DOI desconhecido na Crossref, marcado como visto: ${work.doi} (${work.title})`,
      );
      soMarcados.push(work.doi);
      continue;
    }
    const entry = buildPublication(work, crossref.work, orcid);
    if (!entry) {
      console.warn(`  sem título, autor ou ano; revisar à mão: ${work.doi}`);
      continue;
    }
    const arquivo = join(PUBLICACOES, entry.fileName);
    if (existsSync(arquivo)) {
      console.warn(`  ${arquivo} já existe com outro DOI; revisar à mão: ${work.doi}`);
      continue;
    }
    writeFileSync(arquivo, matter.stringify('', entry.data, YAML));
    adicionadas.push(entry);
    console.log(`  + ${arquivo}`);
  }

  for (const doi of [...soMarcados, ...adicionadas.map((e) => e.data.doi)]) vistos.add(doi);
  const mudou = adicionadas.length > 0 || soMarcados.length > 0;
  if (mudou) gravarVistos(vistos);
  saida('mudou', mudou ? 1 : 0);
  saida('novos', adicionadas.length);
  console.log(
    `${adicionadas.length} publicação(ões) nova(s); ${soMarcados.length} DOI(s) só marcado(s) como visto(s).`,
  );

  if (mudou && process.env.ORCID_COMMIT_MSG) {
    writeFileSync(process.env.ORCID_COMMIT_MSG, commitMessage(adicionadas, soMarcados));
  }
}

main().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
