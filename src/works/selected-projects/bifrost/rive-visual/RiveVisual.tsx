import { useEffect, useState } from 'react';
import SvgCanvas from '../../../../components/motion/SvgCanvas';

// The Rive visuals of Bifrost motions 05, 08 and 09 (Motion Lab's /rive/m5-visual-1…3.riv and
// /rive/motion-9-6th…9th_visual.riv), without the Rive player: each is its artboard's own drawing,
// recorded from the Rive runtime frame by frame as the motions played it (autoplay, then the file's
// state machine), rebuilt as an SVG animated with SMIL, each shape on its own loop
// (scripts/bifrost-rive) — and played on a canvas, as Rive played it (SvgCanvas), so a frame
// costs only its own drawing. Like a Rive instance, it starts from its beginning when it mounts.
//
// Each file is its own chunk, fetched when a visual showing it first mounts, then kept. Fitted like
// the Rive canvas: `cover` fills the box (cropping, centred), `contain` fits it whole. Paused while
// `live` is false.
const LOADERS = {
  'm5-visual-1': () => import('./m5-visual-1.svg?raw'),
  'm5-visual-2': () => import('./m5-visual-2.svg?raw'),
  'm5-visual-3': () => import('./m5-visual-3.svg?raw'),
  'motion-9-6th': () => import('./motion-9-6th.svg?raw'),
  'motion-9-7th': () => import('./motion-9-7th.svg?raw'),
  'motion-9-8th': () => import('./motion-9-8th.svg?raw'),
  'motion-9-9th': () => import('./motion-9-9th.svg?raw'),
} as const;
export type RiveVisualName = keyof typeof LOADERS;
const loaded = new Map<RiveVisualName, string>();

export default function RiveVisual({ name, fit, live, className }: { name: RiveVisualName; fit: 'cover' | 'contain'; live: boolean; className?: string }) {
  const [source, setSource] = useState(() => loaded.get(name) ?? '');
  useEffect(() => {
    let cancelled = false;
    const cached = loaded.get(name);
    if (cached) setSource(cached);
    else void LOADERS[name]().then(module => { loaded.set(name, module.default); if (!cancelled) setSource(module.default); });
    return () => { cancelled = true; };
  }, [name]);
  return <SvgCanvas source={source} live={live} cover={fit === 'cover'} className={className} style={{ pointerEvents: 'none' }} />;
}
