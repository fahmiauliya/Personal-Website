import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { subscribeCardClock } from '../../useCardClock';
import styles from './CompaiCard.module.css';

// Figma: Portfolio-2026, Compai card 282:1295 (536 × 410.204071): a blank #979797 frame
// holding the Compai hero animation (1200 × 900, "Timeline 1"), centred and fitted inside the
// card. It was a Rive file (compai_hero_animation.riv, patched so its gray background stays
// transparent and the card's #979797 shows through); it is that timeline's own drawing here,
// without the Rive player: recorded from the Rive runtime at each of its 900 frames and rebuilt as
// an SVG keyframed over its 15s (scripts/bifrost-rive, `timeline` mode). As with Rive, nothing
// runs on its own: the SVG subscribes directly to the shared Recent Work clock,
// with `position` retained for explicit timeline previews. Hidden copies stay paused.

/** Dial defaults. Scale 1 fits the artboard to the card; below 1 shrinks it, centred. */
export const riveDefaults = { Scale: 1 };

/** Timeline 1's length: 900 frames at 60 fps. */
export const TIMELINE_SECONDS = 15;

// Fetched with this chunk (it only loads once the card mounts), then kept.
let source: string | undefined;
const loadSource = () => import('./assets/compai-hero.svg?raw').then(module => (source = module.default));

/** Draws Timeline 1 at `time` seconds (without a time, its first frame). */
function HeroAnimation({ time, playing }: { time?: number; playing?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [markupSource, setMarkupSource] = useState(source);
  useEffect(() => { if (!markupSource) void loadSource().then(setMarkupSource); }, [markupSource]);
  // Ids made unique to this copy (the grid card and the detail view can both be mounted).
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  const markup = useMemo(() => markupSource
    ?.replace(/(id="|url\(#|href="#)rv/g, `$1${prefix}`)
    .replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '), [markupSource, prefix]);
  // Paused from the start; each new time is drawn by setting the SVG's clock.
  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    svg.pauseAnimations();
    svg.setCurrentTime(Math.min(TIMELINE_SECONDS, Math.max(0, time ?? 0)));
  }, [markup, time]);
  useEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg || playing === undefined) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let unsubscribe = () => {};
    const update = () => {
      unsubscribe();
      svg.pauseAnimations();
      unsubscribe = subscribeCardClock('compai', playing && !reduced.matches, elapsed => {
        svg.setCurrentTime(reduced.matches ? TIMELINE_SECONDS : (elapsed % 12.01) / 12.01 * TIMELINE_SECONDS);
      });
    };
    update();
    reduced.addEventListener('change', update);
    return () => { unsubscribe(); reduced.removeEventListener('change', update); };
  }, [markup, playing]);
  return <div ref={ref} className={styles.riveCanvas} aria-hidden="true" data-cover-ready={markup ? 'ready' : 'pending'} dangerouslySetInnerHTML={markup ? { __html: markup } : undefined} />;
}

/** `position` is the time in Timeline 1, in seconds. */
export default function CompaiCard({ position, playing, values }: { position?: number; playing?: boolean; values?: Record<string, Record<string, number>> }) {
  const { Scale } = { ...riveDefaults, ...(values?.Rive ?? {}) };
  return <figure className={styles.card} aria-label="Compai" data-node-id="282:1295">
    <div className={styles.rive} style={{ transform: Scale === 1 ? undefined : `scale(${Scale})` }}>
      <HeroAnimation time={position} playing={playing} />
    </div>
  </figure>;
}
