import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { playSvg } from '../../../../components/motion/frameRate';

// The four benchmark gauges (Motion Lab's /rive/gauge-1…4.riv), without the Rive player: each
// SVG is its Rive artboard's own drawing (382 × 129), recorded from the Rive runtime a frame at
// a time, its labels already outlines. The only thing that moves is the two rings' reveal,
// which steps between five states and back (the artboard's Timeline 2, ping-pong over frames
// 0–16 at 30fps, a 1.133s cycle): SMIL in the file does that, so it costs no script.
//
// Drawn to fit its box whole, centred (Rive's Fit.Contain), and paused while `live` is false.
// Each file is its own chunk, fetched when a gauge showing it first mounts (the home page's
// cover needs only gauge 1), then kept for every later copy.
const LOADERS = {
  1: () => import('./gauge-1.svg?raw'),
  2: () => import('./gauge-2.svg?raw'),
  3: () => import('./gauge-3.svg?raw'),
  4: () => import('./gauge-4.svg?raw'),
} as const;
type GaugeNumber = keyof typeof LOADERS;
const loaded = new Map<GaugeNumber, string>();

export default function Gauge({ gauge, live }: { gauge: GaugeNumber; live: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(() => loaded.get(gauge) ?? '');
  useEffect(() => {
    let cancelled = false;
    const cached = loaded.get(gauge);
    if (cached) setSource(cached);
    else void LOADERS[gauge]().then(module => { loaded.set(gauge, module.default); if (!cancelled) setSource(module.default); });
    return () => { cancelled = true; };
  }, [gauge]);
  // Ids made unique to this gauge, so two copies of one gauge on a page each use their own
  // clips (one paused off screen would otherwise freeze the other).
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  const markup = useMemo(() => source
    .replace(/ id="/g, ` id="${prefix}`)
    .replace(/url\(#/g, `url(#${prefix}`)
    .replace(/href="#/g, `href="#${prefix}`)
    .replace('<svg ', '<svg width="100%" height="100%" '), [source, prefix]);

  useEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    return playSvg(svg, live);
  }, [live, markup]);

  return <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: markup }} />;
}
