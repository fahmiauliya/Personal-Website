import { useLayoutEffect, useRef, type CSSProperties } from 'react';

// The soft fade behind the navigation, used by every header (home intro and works states,
// and the project pages) so the treatment is identical everywhere: the page colour at the
// top, easing out to transparent at the header's bottom edge, across its full width. It's
// one gradient (no blur), so the page scrolling under it costs nothing to redraw. On the
// home page it fades in over the first 80px of scroll, so the intro starts clear.
export default function HeaderFade({ revealOnScroll = false }: { revealOnScroll?: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!revealOnScroll) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, window.scrollY / 80));
      root.current?.style.setProperty('opacity', String(progress * progress * (3 - 2 * progress)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [revealOnScroll]);
  return <span ref={root} className="header-fade" aria-hidden="true" style={{ opacity: revealOnScroll ? 0 : 1 } as CSSProperties} />;
}
