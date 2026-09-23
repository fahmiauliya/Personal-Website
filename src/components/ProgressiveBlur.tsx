import type { CSSProperties } from 'react';

// The progressive blur behind the navigation, used by every header (home intro and
// works states, and the project pages) so the treatment is identical everywhere: it
// spans the header's full width, strongest at the top and fading to none at the bottom
// edge. One backdrop-filter can only apply a single radius, so this stacks layers, each
// masked to its own band. Bands overlap so the steps blend. It fills the header, whose
// size never changes with the navigation morph, so it cannot blink.
const LAYERS = [
  { blur: 12, from: 0, to: 45 },
  { blur: 6, from: 25, to: 70 },
  { blur: 3, from: 50, to: 88 },
  { blur: 1.5, from: 72, to: 100 },
];

// Opaque across the band, fading out over the quarter of the band at each end. The top
// band starts opaque so the blur meets the top edge instead of leaving a sharp strip.
function band(from: number, to: number) {
  const fade = (to - from) / 4;
  const start = from === 0 ? `#000 0%` : `transparent ${from}%, #000 ${from + fade}%`;
  return `linear-gradient(to bottom, ${start}, #000 ${to - fade}%, transparent ${to}%)`;
}

export default function ProgressiveBlur() {
  return (
    <span className="progressive-blur" aria-hidden="true">
      {LAYERS.map(({ blur, from, to }) => (
        <span
          key={blur}
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: band(from, to),
            WebkitMaskImage: band(from, to),
          } as CSSProperties}
        />
      ))}
    </span>
  );
}
