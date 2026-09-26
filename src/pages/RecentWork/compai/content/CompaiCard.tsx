import { useEffect } from 'react';
import { Alignment, Fit, Layout, RuntimeLoader, useRive } from '@rive-app/react-canvas';
import heroAnimation from './assets/compai_hero_animation.riv?url';
import styles from './CompaiCard.module.css';

// Figma: Portfolio-2026, Compai card 282:1295 (536 × 410.204071): a blank #979797 frame
// holding the Compai hero Rive animation (compai_hero_animation.riv, 1200 × 900 artboard,
// "Timeline 1"), centred and fitted inside the card. The .riv here is patched so its gray
// background fill stays transparent and the card's #979797 shows through (see README).

// Site addition: Rive fetches its runtime (~2MB of WASM) from the unpkg CDN by default —
// a slow external round trip, and part of why the detail cover's Rive canvas used to take
// most of a second to draw its first frame after opening. public/rive/rive.wasm is the
// same file, copied from this package's own node_modules (a different Rive version than
// Motion Lab's shared motion bundle, which sets its own copy at /motions/rive.wasm).
RuntimeLoader.setWasmUrl('/rive/rive.wasm');

/** Rive dial defaults. Scale 1 fits the artboard to the card; below 1 shrinks it, centred. */
export const riveDefaults = { Scale: 1 };

/**
 * The timeline to show. It is named up front: the file also has "State Machine 1", which
 * isn't used, and starting both at once shows nothing.
 */
const TIMELINE = 'Timeline 1';
/** Timeline 1's length: 900 frames at 60 fps. The lab's timeline dock runs 0 → this. */
export const TIMELINE_SECONDS = 15;

/**
 * Draws Timeline 1 at `time` seconds. Rive doesn't run its own clock here: the lab's
 * timeline dock does (play, pause, scrub, loop, and speed from Playback Rate), and each
 * new time is drawn with `scrub`. Without a time it plays on its own, once.
 */
function HeroAnimation({ time }: { time?: number }) {
  const driven = time !== undefined;
  // The canvas follows the screen's pixel ratio (2× on retina), so it stays sharp.
  // `customDevicePixelRatio` is ignored by this Rive runtime, so it isn't set.
  const { rive, RiveComponent } = useRive({
    src: heroAnimation,
    animations: TIMELINE,
    autoplay: !driven,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  useEffect(() => {
    if (rive && driven) rive.scrub(TIMELINE, Math.min(TIMELINE_SECONDS, Math.max(0, time)));
  }, [rive, driven, time]);

  return <RiveComponent className={styles.riveCanvas} />;
}

/** `position` is the time in Timeline 1, in seconds, when the lab's timeline drives it. */
export default function CompaiCard({ position, values }: { position?: number; values?: Record<string, Record<string, number>> }) {
  const { Scale } = { ...riveDefaults, ...(values?.Rive ?? {}) };
  return <figure className={styles.card} aria-label="Compai" data-node-id="282:1295">
    <div className={styles.rive} style={{ transform: Scale === 1 ? undefined : `scale(${Scale})` }}>
      <HeroAnimation time={position} />
    </div>
  </figure>;
}
