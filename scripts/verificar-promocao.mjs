/**
 * ============================================================================
 *  Arquivo      : verificar-promocao.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Conferidor de pré-promoção de plano atômico. Roda antes do
 *                 commit de promoção e falha quando o plano afirma menos (ou
 *                 mais) do que a Evidência sustenta: critério de aceitação em
 *                 branco, passo declarado "NÃO rodei" com seção preenchida,
 *                 `Status:` fora do vocabulário, texto de preenchimento do
 *                 fatiamento esquecido. Avisa, ainda, quando a promoção em
 *                 curso não toca `PRD.md` e `plans/README.md` — os dois da
 *                 convenção que têm caminho fixo (o plano e o README da fase
 *                 variam, e por isso não são conferidos aqui).
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-18
 *  Atualizado em: 2026-09-18
 *  Versão       : 0.1.0
 *
 *  Dependências : node:fs, node:child_process, node:process, node:console
 *  Entradas     : caminho de um arquivo `plans/**\/NNN-*.md`
 *  Saídas       : relatório no stdout; código de saída 0 (aprovado) ou 1
 *  Uso          : node scripts/verificar-promocao.mjs plans/fase-3-site-publico/048-*.md
 *
 *  Notas        : ferramenta de desenvolvimento — não entra no site nem no
 *                 `build:pipeline`. Nasceu do plano 048, em que a seção de
 *                 verificação no navegador nunca foi inserida no plano e o
 *                 defeito só apareceu na segunda revisão (ver
 *                 `plans/DESPACHO.md`, "Para o orquestrador").
 * ============================================================================
 */
// `process` e `console` entram por importação explícita, e não como global: o `eslint.config.js`
// só concede globais de Node a `**/*.config.{js,mjs,cjs,ts}`, e ampliar aquela lista por causa
// deste utilitário mexeria em configuração compartilhada sem necessidade.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import console from 'node:console';

/** Arquivos que o commit de promoção a DONE tem de tocar, por convenção do projeto. */
const ARQUIVOS_DA_PROMOCAO = ['PRD.md', 'plans/README.md'];

/**
 * Executa um comando git e devolve a saída, ou `null` se o comando falhar (ex.: fora de um
 * repositório). Nunca lança: a ausência de git degrada o conferidor, não o impede.
 *
 * @param {string[]} args Argumentos do `git`.
 * @returns {string|null} Saída sem espaços nas pontas, ou `null`.
 */
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/**
 * Confere um plano atômico antes da promoção.
 *
 * @param {string} caminho Caminho do arquivo do plano.
 * @returns {{erros: string[], avisos: string[], naoExecutado?: boolean}} Achados; `erros`
 *   reprova, `avisos` não. `naoExecutado` marca plano ainda sem Evidência (nada a conferir).
 */
function conferir(caminho) {
  const erros = [];
  const avisos = [];
  const texto = readFileSync(caminho, 'utf8');
  const linhas = texto.split('\n');

  // Um plano recém-fatiado, ainda não executado, tem critérios em branco e o texto de
  // preenchimento **por construção** — reprová-lo seria ruído. As checagens estritas valem a
  // partir do momento em que a Evidência tem seções reais, isto é, o plano foi executado. É esse o
  // momento em que o orquestrador roda este conferidor, antes de virar o `Status:` para DONE.
  const evidencia = texto.slice(texto.indexOf('## Evidência'));
  const executado = texto.includes('## Evidência') && /^###\s+/m.test(evidencia);
  if (!executado) {
    return {
      erros: [],
      avisos: [],
      naoExecutado: true,
    };
  }

  // 1. Nenhum critério de aceitação pode ficar em branco num plano que vai a DONE.
  const vazios = linhas
    .map((linha, i) => ({ linha, n: i + 1 }))
    .filter(({ linha }) => /^\s*-\s*\[ \]/.test(linha));
  for (const { linha, n } of vazios) {
    erros.push(`critério de aceitação em branco (linha ${n}): ${linha.trim().slice(0, 90)}`);
  }

  // 2. "NÃO rodei"/"NÃO foi rodado" sobre um passo cuja seção existe na Evidência é contradição:
  //    foi o defeito do plano 048, em que a seção do orquestrador nunca chegou ao arquivo.
  const passosComSecao = new Set();
  for (const linha of linhas) {
    const m = linha.match(/^###\s+(?:Passo\s+)?(\d+)[.\s—-]/);
    if (m) passosComSecao.add(m[1]);
  }
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(/-\s*Passo\s+(\d+)\b[^\n]*N[ÃA]O\s+(?:rodei|foi rodado)/i);
    if (m && passosComSecao.has(m[1])) {
      erros.push(
        `linha ${i + 1}: declara o passo ${m[1]} como não rodado, mas a Evidência tem a seção ` +
          `"${m[1]}" — o plano se contradiz. Se quem rodou foi o orquestrador, escreva de quem ` +
          `foi a execução em vez de "NÃO rodei" (defeito do plano 048)`,
      );
    }
  }

  // 3. O `Status:` tem de estar declarado, e num dos dois valores que o fluxo usa.
  const status = texto.match(/^\*\*Status:\*\*\s*(\w+)/m)?.[1];
  if (!status) {
    erros.push('não encontrei a linha `**Status:**` no plano');
  } else if (!['TODO', 'DONE'].includes(status)) {
    erros.push(`\`Status:\` com valor fora do vocabulário (TODO|DONE): ${status}`);
  }

  // 4. A Evidência não pode ter ficado com o texto de preenchimento do fatiamento.
  if (/<Preenchido pelo executor/.test(texto)) {
    erros.push('a seção `## Evidência` ainda tem o texto de preenchimento do fatiamento');
  }

  // 5. Estado do repositório, quando há git. O aviso só faz sentido quando uma promoção está de
  //    fato em curso — isto é, quando o próprio plano está entre os arquivos modificados. Sem essa
  //    guarda o conferidor acusa qualquer árvore suja, que foi o falso positivo da primeira versão.
  const arquivosSujos = git(['status', '--porcelain']);
  if (arquivosSujos !== null && status === 'DONE') {
    const tocados = arquivosSujos
      .split('\n')
      .filter(Boolean)
      .map((l) => l.slice(3).trim().replace(/\\/g, '/'));
    const planoNormalizado = caminho.replace(/\\/g, '/').replace(/^\.\//, '');
    const promocaoEmCurso = tocados.some((t) => t.endsWith(planoNormalizado));
    const faltando = ARQUIVOS_DA_PROMOCAO.filter((a) => !tocados.includes(a));
    if (promocaoEmCurso && faltando.length > 0) {
      avisos.push(
        `promoção a DONE normalmente toca também: ${faltando.join(', ')} ` +
          `(ver plans/README.md, "O topo do PRD tem de refletir a realidade")`,
      );
    }
  }

  return { erros, avisos };
}

const alvo = process.argv[2];
if (!alvo) {
  console.error('uso: node scripts/verificar-promocao.mjs <caminho do plano>');
  process.exit(2);
}
if (!existsSync(alvo)) {
  console.error(`arquivo não encontrado: ${alvo}`);
  process.exit(2);
}

const { erros, avisos, naoExecutado } = conferir(alvo);
if (naoExecutado) {
  console.log(`PULADO  ${alvo}: plano ainda sem Evidência executada — nada a conferir`);
  process.exit(0);
}
for (const a of avisos) console.log(`AVISO   ${a}`);
for (const e of erros) console.log(`ERRO    ${e}`);

if (erros.length === 0) {
  console.log(`OK      ${alvo}: pronto para promoção (${avisos.length} aviso(s))`);
  process.exit(0);
}
console.log(`\nREPROVADO: ${erros.length} erro(s) em ${alvo}`);
process.exit(1);
