import { useEffect, type RefObject } from 'react';

// Degrees per pixel scrolled: one full turn every 1440px, enough to read as rolling
// without spinning.
const DEG_PER_PX = 0.25;
// Time constant of the smoothing, in ms: the rendered angle closes ~63% of the gap to
// the scroll-driven angle every 55ms, so it follows the scroll closely and settles
// within ~200ms of it stopping, with no overshoot (a plain exponential approach).
const SMOOTH_MS = 55;
// The angle carries over when a page change mounts a new Header, so the logo continues
// from where it stopped instead of snapping back to 0.
let carried = 0;

/**
 * Rolls `element` with the page's scroll: down turns it forward, up backward, in
 * proportion to the distance, and it stays at whatever angle it stopped at. Only
 * `transform: rotate()` is written, on the element itself (its CSS centre is the pivot).
 *
 * It follows its own page's scroll: a project page's `.project-layer`, otherwise the
 * window. Scroll jumps made while a page transition or an open project has locked the
 * window (usePageTransition, projectTransition) are not user movement, so they are
 * skipped rather than spinning the logo behind the cover.
 */
export function useScrollRoll(element: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = element.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = node.closest<HTMLElement>('.project-layer');
    const html = document.documentElement;
    const read = () => (layer ? layer.scrollTop : window.scrollY);
    const locked = () => !layer && (html.style.overflow === 'hidden' || html.classList.contains('project-open'));

    let last = read();
    let target = carried;
    let shown = carried;
    if (shown) node.style.transform = `rotate(${shown}deg)`;
    let frame = 0;
    let then = 0;

    const tick = (now: number) => {
      const dt = then ? Math.min(64, now - then) : 16;
      then = now;
      shown += (target - shown) * (1 - Math.exp(-dt / SMOOTH_MS));
      if (Math.abs(target - shown) < 0.02) shown = target;
      node.style.transform = `rotate(${shown}deg)`;
      frame = shown === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const y = read();
      const delta = y - last;
      last = y;
      if (!delta || locked()) return;
      target += delta * DEG_PER_PX;
      carried = target;
      if (!frame) {
        then = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const source: HTMLElement | Window = layer ?? window;
    source.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      source.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [element]);
}
