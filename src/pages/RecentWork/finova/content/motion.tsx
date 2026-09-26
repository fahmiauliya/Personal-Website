
/**
 * Finova's "live app" loop. Nothing fades: values roll in place, the progress line grows, the
 * tab pill glides, a card row slides. Both phones move together, then everything winds back the
 * way it came, so the end of the loop is exactly its start.
 */
export const LOOP_SECONDS = 12;

/** Dial defaults (seconds, except Stagger and Ease). */
export const finovaDefaults = { RollSeconds: 0.55, Stagger: 0.035, LineSeconds: 0.8, SlideSeconds: 0.9, Ease: 3.5 };
export type FinovaSettings = typeof finovaDefaults;

// The loop's parts (ease, there, press, mix, RollText, Slot, RollSwap, Flip) are shared.
export * from '../../shared/motion/liveMotion';
