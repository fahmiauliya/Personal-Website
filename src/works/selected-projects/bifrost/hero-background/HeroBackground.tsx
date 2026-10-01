import type { CSSProperties } from 'react';
import SvgCanvas from '../../../../components/motion/SvgCanvas';
import still from './static.svg';
import moving from './animated.svg?raw';

// Bifrost's hero background (Motion Lab's /rive/Hero-bg-home.riv, 1200 × 538), without the Rive
// player: the artboard's own drawing, recorded from the Rive runtime (scripts/bifrost-hero). What
// never moves is an image (drawn once); what moves is a second SVG over it, animated with SMIL
// and played on a canvas (SvgCanvas), each piece on its own loop, as the Rive file plays them
// together:
// - the 20 wind lines (the main timeline, frames 16–46 at half speed: 2s)
// - the two funnels: their rim ticks (a set repeating every 0.3s), flowing curves (1.33s) and
//   the mask over the rim's marks (2s)
// - the two code blocks (0.47s) and the two binary circles (0.68s)
// Drawn as the Rive canvas was, in the box `style` gives: the artboard fitted whole and centred
// (Fit.Contain). Paused while `live` is false.
export default function HeroBackground({ live, style }: { live: boolean; style: CSSProperties }) {
  const layer: CSSProperties = { position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', objectFit: 'contain' };
  return <div aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
    <img src={still} alt="" decoding="async" style={layer} />
    <SvgCanvas source={moving} live={live} />
  </div>;
}
