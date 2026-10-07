/**
 * ============================================================================
 *  Arquivo      : auditar-dependencias.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Portão de `npm audit` do CI (ADR-0010): reprova em aviso
 *                 `high`/`critical`, exceto os da lista de exceções datadas
 *                 abaixo, cada um com motivo escrito no ADR. Avisa quando uma
 *                 exceção deixou de ser necessária, para ser retirada.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-07
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.1.0
 *
 *  Dependências : node:child_process, node:process, node:url, node:console
 *  Entradas     : saída de `npm audit --json` na raiz do projeto
 *  Saídas       : relatório no stdout; código de saída 0 (aprovado) ou 1
 *  Uso          : node scripts/auditar-dependencias.mjs
 *
 *  Notas        : substitui `npm audit --audit-level=high` no `ci.yml` desde
 *                 2026-10-07, quando três avisos `high` sem correção compatível
 *                 apareceram em dependências de build e do painel. O nível do
 *                 portão não muda: só o aviso nomeado aqui passa.
 * ============================================================================
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import console from 'node:console';

/**
 * Avisos `high`/`critical` aceitos temporariamente, por id GHSA. Cada um tem a justificativa, o
 * alcance e o gatilho de retirada no ADR-0010, seção "Exceções datadas". Exceção nova exige
 * entrada lá também.
 */
export const EXCECOES = {
  'GHSA-7mx3-vvmw-hjmv': {
    desde: '2026-10-07',
    pacote: '@graphql-tools/utils',
    motivo: 'só via @tinacms/cli; a única correção do npm é o downgrade para @tinacms/cli@0.56.5',
  },
  'GHSA-vfj7-8cjw-p6xm': {
    desde: '2026-10-07',
    pacote: 'braces',
    motivo: 'só via tinacms/@tinacms/cli; a única correção do npm é downgrade do Tina',
  },
  'GHSA-wq5f-xc86-pv6w': {
    desde: '2026-10-07',
    pacote: 'sharp',
    motivo: 'miniflare (wrangler, até o 4.148.0) fixa sharp@0.35.4 exato; a corrigida é a 0.35.5',
  },
};

/** Severidades que reprovam o portão (ADR-0010). */
const REPROVA = new Set(['high', 'critical']);

/**
 * Separa os avisos `high`/`critical` do relatório do `npm audit` em aceitos (na lista de
 * exceções) e novos, e aponta as exceções que não aparecem mais.
 *
 * @param {{ vulnerabilities?: Record<string, { via: (string | { url: string, severity: string, name: string, title: string })[] }> }} relatorio
 *   Saída de `npm audit --json`.
 * @param {Record<string, unknown>} excecoes Lista de exceções, por id GHSA.
 * @returns {{ novos: { id: string, severidade: string, pacote: string, titulo: string }[], aceitos: string[], obsoletas: string[] }}
 */
export function avaliar(relatorio, excecoes) {
  const avisos = new Map();
  for (const pacote of Object.values(relatorio.vulnerabilities ?? {})) {
    for (const via of pacote.via) {
      // `via` em texto é só o nome do pacote vulnerável de que este depende; o aviso está nele.
      if (typeof via === 'string' || !REPROVA.has(via.severity)) continue;
      const id = via.url.split('/').pop();
      avisos.set(id, { id, severidade: via.severity, pacote: via.name, titulo: via.title });
    }
  }
  const novos = [...avisos.values()].filter((aviso) => !(aviso.id in excecoes));
  const aceitos = [...avisos.keys()].filter((id) => id in excecoes);
  const obsoletas = Object.keys(excecoes).filter((id) => !avisos.has(id));
  return { novos, aceitos, obsoletas };
}

/** Roda o `npm audit`, imprime o relatório e encerra com 0 ou 1. */
function main() {
  // `npm audit` sai com 1 quando há qualquer vulnerabilidade; quem decide aqui é `avaliar`.
  // Comando numa string só: com `shell: true` (necessário para achar o `npm.cmd` no Windows), passar
  // argumentos em lista é obsoleto no Node (DEP0190).
  const run = spawnSync('npm audit --json', { encoding: 'utf8', shell: true });
  let relatorio;
  try {
    relatorio = JSON.parse(run.stdout);
  } catch {
    console.error('auditar-dependencias: a saída do `npm audit --json` não é JSON.');
    console.error(run.stderr || run.stdout);
    process.exit(1);
  }
  if (relatorio.error) {
    console.error(`auditar-dependencias: o npm audit falhou: ${JSON.stringify(relatorio.error)}`);
    process.exit(1);
  }

  const { novos, aceitos, obsoletas } = avaliar(relatorio, EXCECOES);
  const totais = relatorio.metadata?.vulnerabilities ?? {};
  console.log(`npm audit: ${JSON.stringify(totais)}`);
  for (const id of aceitos) {
    const { pacote, desde, motivo } = EXCECOES[id];
    console.log(`exceção aceita (desde ${desde}, ADR-0010): ${id} ${pacote} — ${motivo}`);
  }
  for (const id of obsoletas) {
    console.log(
      `AVISO: a exceção ${id} (${EXCECOES[id].pacote}) não aparece mais; retire-a daqui e do ADR-0010.`,
    );
  }
  if (novos.length > 0) {
    for (const { id, severidade, pacote, titulo } of novos) {
      console.error(`REPROVADO: ${severidade} ${id} ${pacote} — ${titulo}`);
    }
    console.error(
      'Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).',
    );
    process.exit(1);
  }
  console.log('aprovado: nenhum aviso high/critical fora das exceções.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
