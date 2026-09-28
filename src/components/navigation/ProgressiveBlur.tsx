import { useLayoutEffect, useRef, type CSSProperties } from 'react';

// The progressive blur behind the navigation, used by every header (home intro and
// works states, and the project pages) so the treatment is identical everywhere: it
// spans the header's full width, strongest at the top and fading to none at the bottom
// edge. One backdrop-filter can only apply a single radius, so this stacks layers, each
// masked to its own band. It fills the header, whose size never changes with the
// navigation morph, so it cannot blink.
//
// The radius doubles from one layer to the next (12px at the top down to 0.75px at the
// bottom), and each band fades in over one step, holds for one, and fades out over
// the next, so neighbouring layers cross-fade and the blur ramps down smoothly to none.
// Few, far-apart radii show as visible steps over high-contrast content (the cover images).
const MAX_BLUR = 12;
// Five layers: each one is re-filtered every frame the page scrolls under it, and radii
// below 0.75px can't be seen, so more layers cost frame time for nothing.
const LAYER_COUNT = 5;
const STEP = 100 / (LAYER_COUNT + 1);
const LAYERS = Array.from({ length: LAYER_COUNT }, (_, index) => ({
  blur: MAX_BLUR / 2 ** (LAYER_COUNT - 1 - index),
  // Band edges measured from the bottom, in %: weakest layer lowest, strongest at the top.
  from: index * STEP,
}));

// Transparent → opaque over one step, opaque for one, then back to transparent. Bands
// that would end past the top stay opaque to the top edge, so the strongest blur meets it
// instead of leaving a sharp strip.
function band(from: number) {
  const hold = from + 2 * STEP;
  const end = hold >= 100 - 0.001 ? '#000 100%' : `#000 ${hold}%, transparent ${hold + STEP}%`;
  return `linear-gradient(to top, transparent ${from}%, #000 ${from + STEP}%, ${end})`;
}

export default function ProgressiveBlur({ revealOnScroll = false }: { revealOnScroll?: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!revealOnScroll) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, window.scrollY / 80));
      const strength = progress * progress * (3 - 2 * progress);
      root.current?.style.setProperty('--progressive-blur-strength', String(strength));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [revealOnScroll]);
  return (
    <span ref={root} className="progressive-blur" aria-hidden="true" style={{ '--progressive-blur-strength': revealOnScroll ? 0 : 1 } as CSSProperties}>
      {LAYERS.map(({ blur, from }) => (
        <span
          key={blur}
          style={{
            backdropFilter: `blur(calc(${blur}px * var(--progressive-blur-strength, 1)))`,
            WebkitBackdropFilter: `blur(calc(${blur}px * var(--progressive-blur-strength, 1)))`,
            maskImage: band(from),
            WebkitMaskImage: band(from),
          } as CSSProperties}
        />
      ))}
    </span>
  );
}
