import type { CSSProperties } from 'react';

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
// Few, far-apart radii show as visible steps over high-contrast content (the ASCII cards).
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

export default function ProgressiveBlur() {
  return (
    <span className="progressive-blur" aria-hidden="true">
      {LAYERS.map(({ blur, from }) => (
        <span
          key={blur}
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: band(from),
            WebkitMaskImage: band(from),
          } as CSSProperties}
        />
      ))}
    </span>
  );
}
