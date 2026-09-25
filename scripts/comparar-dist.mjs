/**
 * ============================================================================
 *  Arquivo      : comparar-dist.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Retrato e comparação do HTML normalizado de cada rota do
 *                 `dist/`. Prova, por artefato, que uma refatoração não mudou
 *                 as páginas geradas (sabatina fase 4, Decisão 6): a
 *                 normalização tira só o que o Astro muda por construção
 *                 quando marcação e `<style>` trocam de arquivo — o sufixo de
 *                 `data-astro-cid-*` e o hash dos nomes em `/_astro/` — e os
 *                 blocos `<style>` e `<link rel="stylesheet">`. Os `<script>`
 *                 ficam, e o script externo entra pelo **conteúdo** do `.js`:
 *                 são eles que carregam o comportamento da página.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-25
 *  Atualizado em: 2026-09-25
 *  Versão       : 0.3.0
 *
 *  Dependências : node:fs, node:path, node:process, node:console
 *  Entradas     : `dist/` (ou a pasta de `--dist`); dois retratos `.json`
 *  Saídas       : retrato `.json`; relatório rota a rota no stdout; código de
 *                 saída 0 (toda rota não ignorada igual) ou 1
 *  Uso          : node scripts/comparar-dist.mjs retrato <saida.json> [--dist <pasta>]
 *                 node scripts/comparar-dist.mjs comparar <antes.json> <depois.json> [--ignorar '<regex>']
 *
 *  Notas        : ferramenta de desenvolvimento — não entra no site, no
 *                 `build:pipeline` nem na cobertura (plano 055). Os retratos
 *                 vão para uma pasta de rascunho, nunca para o repositório.
 * ============================================================================
 */
// `process` e `console` por importação explícita: o `eslint.config.js` só concede globais de Node
// a `**/*.config.{js,mjs,cjs,ts}` (mesmo padrão de `scripts/verificar-promocao.mjs`).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import process from 'node:process';
import console from 'node:console';

const USO = `uso:
  node scripts/comparar-dist.mjs retrato <saida.json> [--dist <pasta>]
  node scripts/comparar-dist.mjs comparar <antes.json> <depois.json> [--ignorar '<regex de rota>']`;

/** Caracteres de contexto mostrados de cada lado da primeira divergência. */
const CONTEXTO = 120;

/** Hash de 8 caracteres que o Vite põe no nome dos arquivos de `/_astro/`. */
const HASH = String.raw`\.[A-Za-z0-9_-]{8}`;

/**
 * Conteúdo de um script externo de `/_astro/`, com o hash dos imports relativos (`./gsap.HASH.js`)
 * trocado por `*`. Um nível só: o conteúdo dos chunks importados (bibliotecas) não entra.
 *
 * @param {string} dist Pasta do build.
 * @param {string} arquivo Nome do arquivo sob `_astro/`.
 * @returns {string} Conteúdo normalizado, ou um marcador se o arquivo não existe.
 */
function conteudoDoScript(dist, arquivo) {
  const caminho = join(dist, '_astro', arquivo);
  if (!existsSync(caminho)) return `(ausente: ${arquivo})`;
  return readFileSync(caminho, 'utf8').replace(
    new RegExp(String.raw`(\.\/[^"'\`\s)]*?)${HASH}(\.js)`, 'g'),
    '$1.*$2',
  );
}

/**
 * Normaliza o HTML de uma rota. Mexe em exatamente cinco coisas, nesta ordem, e nada mais — o
 * comparador não pode esconder mudança de texto, de ordem, de outro atributo, de `<script>` ou de
 * asset (plano 055):
 *
 * 1–3. remove `<style>`, `<link rel="stylesheet">` e os atributos `data-astro-cid-*`;
 * 4. troca o `src="/_astro/….js"` de um `<script>` pelo **conteúdo** do arquivo
 *    (`conteudoDoScript`) — o nome do chunk segue o módulo `.astro` que o importa e muda quando o
 *    script troca de componente, e o hash é o que acusa mudança de conteúdo; os dois saem, o
 *    conteúdo fica;
 * 5. no que sobra de `/_astro/` (fontes, imagens), troca só o hash por `*` — o nome-base vem do
 *    arquivo-fonte, e trocar o asset tem de aparecer.
 *
 * Os `<script>` inline não são removidos: um script perdido numa extração de view quebra a página
 * sem mudar a marcação. A normalização é sobre a string inteira: o `dist/` sai minificado numa
 * linha só.
 *
 * @param {string} html HTML cru da rota.
 * @param {string} dist Pasta do build (para ler os scripts externos).
 * @returns {string} HTML normalizado.
 */
function normalizar(html, dist) {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link\b[^>]*\brel=(?:"stylesheet"|'stylesheet'|stylesheet)[^>]*>/gi, '')
    .replace(/\s+data-astro-cid-[a-z0-9]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g, '')
    .replace(
      /(<script\b[^>]*?\s)src=["']?\/_astro\/([^"'\s>]+\.js)["']?/gi,
      (_, inicio, arquivo) => `${inicio}src="(conteúdo) ${conteudoDoScript(dist, arquivo)}"`,
    )
    .replace(new RegExp(String.raw`(\/_astro\/[^"'\s)]*?)${HASH}(\.[a-z0-9]+)`, 'g'), '$1.*$2');
}

/**
 * Lista os `.html` de uma pasta, recursivamente, fora de `admin/` na raiz (painel do Tina).
 *
 * @param {string} raiz Pasta do build.
 * @param {string} [pasta] Pasta corrente da recursão.
 * @returns {string[]} Caminhos absolutos dos `.html`.
 */
function listarHtml(raiz, pasta = raiz) {
  const achados = [];
  for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) {
      if (pasta === raiz && entrada.name === 'admin') continue;
      achados.push(...listarHtml(raiz, caminho));
    } else if (entrada.name.endsWith('.html')) {
      achados.push(caminho);
    }
  }
  return achados;
}

/**
 * Grava o retrato `{ "<rota>": "<html normalizado>" }`, com a rota relativa ao build e
 * separador `/`, em ordem alfabética — o retrato do mesmo build é igual byte a byte.
 *
 * @param {string} saida Caminho do `.json` a gravar.
 * @param {string} dist Pasta do build.
 * @returns {number} Código de saída.
 */
function retrato(saida, dist) {
  if (!existsSync(dist)) {
    console.error(`erro: a pasta do build não existe: ${dist} (rode npm run build:pipeline)`);
    return 1;
  }
  const rotas = listarHtml(dist)
    .map((caminho) => [relative(dist, caminho).split(sep).join('/'), caminho])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const mapa = Object.fromEntries(
    rotas.map(([rota, caminho]) => [rota, normalizar(readFileSync(caminho, 'utf8'), dist)]),
  );
  writeFileSync(saida, JSON.stringify(mapa, null, 2) + '\n');
  console.log(`retrato: ${rotas.length} rota(s) de ${dist} em ${saida}`);
  return 0;
}

/**
 * Índice do primeiro caractere em que duas strings divergem (o menor comprimento, se uma é
 * prefixo da outra).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function primeiraDivergencia(a, b) {
  const limite = Math.min(a.length, b.length);
  for (let i = 0; i < limite; i++) if (a[i] !== b[i]) return i;
  return limite;
}

/**
 * Compara dois retratos rota a rota e imprime `IGUAL`, `DIFERENTE`, `SÓ ANTES`, `SÓ DEPOIS` ou
 * `IGNORADA`, com um resumo na última linha.
 *
 * @param {string} antesArq Retrato de antes.
 * @param {string} depoisArq Retrato de depois.
 * @param {RegExp|null} ignorar Rotas que casam não contam para o resultado.
 * @returns {number} 0 se toda rota não ignorada for `IGUAL`; 1 caso contrário.
 */
function comparar(antesArq, depoisArq, ignorar) {
  const antes = JSON.parse(readFileSync(antesArq, 'utf8'));
  const depois = JSON.parse(readFileSync(depoisArq, 'utf8'));
  const rotas = [...new Set([...Object.keys(antes), ...Object.keys(depois)])].sort();
  const contagem = { IGUAL: 0, DIFERENTE: 0, 'SÓ ANTES': 0, 'SÓ DEPOIS': 0, IGNORADA: 0 };

  for (const rota of rotas) {
    let estado;
    if (ignorar?.test(rota)) estado = 'IGNORADA';
    else if (!(rota in depois)) estado = 'SÓ ANTES';
    else if (!(rota in antes)) estado = 'SÓ DEPOIS';
    else estado = antes[rota] === depois[rota] ? 'IGUAL' : 'DIFERENTE';
    contagem[estado]++;
    console.log(`${estado.padEnd(9)}  ${rota}`);

    if (estado === 'DIFERENTE') {
      const i = primeiraDivergencia(antes[rota], depois[rota]);
      const trecho = (html) => html.slice(Math.max(0, i - CONTEXTO), i + CONTEXTO);
      console.log(`           primeira divergência no caractere ${i}`);
      console.log(`           antes : …${trecho(antes[rota])}…`);
      console.log(`           depois: …${trecho(depois[rota])}…`);
    }
  }

  console.log(
    'resumo: ' +
      Object.entries(contagem)
        .map(([estado, n]) => `${estado} ${n}`)
        .join(' · '),
  );
  return contagem.DIFERENTE + contagem['SÓ ANTES'] + contagem['SÓ DEPOIS'] === 0 ? 0 : 1;
}

/**
 * Lê o valor de uma opção `--nome valor` e a remove da lista de argumentos.
 *
 * @param {string[]} args Argumentos (alterados no lugar).
 * @param {string} nome Nome da opção, com os dois hífens.
 * @returns {string|undefined}
 */
function opcao(args, nome) {
  const i = args.indexOf(nome);
  if (i < 0) return undefined;
  const [, valor] = args.splice(i, 2);
  return valor;
}

const args = process.argv.slice(2);
const dist = opcao(args, '--dist') ?? 'dist';
const ignorar = opcao(args, '--ignorar');
const [comando, ...posicionais] = args;

if (comando === 'retrato' && posicionais.length === 1) {
  process.exit(retrato(posicionais[0], dist));
} else if (comando === 'comparar' && posicionais.length === 2) {
  process.exit(comparar(posicionais[0], posicionais[1], ignorar ? new RegExp(ignorar) : null));
} else {
  console.error(USO);
  process.exit(2);
}
