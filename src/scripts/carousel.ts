/**
 * ============================================================================
 *  Arquivo      : carousel.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Carrossel de fotos da postagem de extensão: as miniaturas
 *                 rolam a faixa até a foto escolhida e marcam a foto visível
 *                 com `aria-current`.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-10-07
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.1.0
 *
 *  Dependências : nenhuma
 *  Entradas     : DOM de `PostView`: `[data-carrossel]` > `[data-trilho]` >
 *                 `[data-slide]`*, e miniaturas `[data-marca="<índice>"]`
 *  Saídas       : efeito colateral no DOM; nenhuma exportação
 *  Uso          : <script>import '../scripts/carousel';</script> em `PostView`
 *
 *  Notas        : melhoria progressiva (RNF-02) — sem JS a faixa tem
 *                 `scroll-snap` e rola com o dedo, a roda ou o teclado, e cada
 *                 miniatura é um link para a âncora da foto. Com JS, o clique
 *                 rola só a faixa (a âncora rolaria também a página) e a classe
 *                 `pronto` esconde a barra de rolagem nativa da faixa.
 * ============================================================================
 */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Liga um carrossel: clique nas miniaturas e marcação da foto visível.
 *
 * @param root Elemento `[data-carrossel]`.
 */
function setup(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-trilho]');
  if (!track) return;
  const slides = [...track.querySelectorAll<HTMLElement>('[data-slide]')];
  const marks = [...root.querySelectorAll<HTMLElement>('[data-marca]')];
  // A posição de cada foto é medida a partir do início da faixa.
  const offsetOf = (slide: HTMLElement) => slide.offsetLeft - track.offsetLeft;

  const markVisible = (): void => {
    const x = track.scrollLeft;
    let current = 0;
    slides.forEach((slide, i) => {
      if (Math.abs(offsetOf(slide) - x) < Math.abs(offsetOf(slides[current]) - x)) current = i;
    });
    marks.forEach((mark) => {
      if (Number(mark.dataset.marca) === current) mark.setAttribute('aria-current', 'true');
      else mark.removeAttribute('aria-current');
    });
  };

  marks.forEach((mark) => {
    mark.addEventListener('click', (event) => {
      event.preventDefault();
      track.scrollTo({
        left: offsetOf(slides[Number(mark.dataset.marca)]),
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    });
  });
  root.classList.add('pronto');
  track.addEventListener('scroll', () => requestAnimationFrame(markVisible), { passive: true });
  markVisible();
}

document.querySelectorAll<HTMLElement>('[data-carrossel]').forEach(setup);
