import { ease, mix } from '../../shared/motion/liveMotion';

/**
 * Velocity's "live analytics" loop. The dashboard steps through three days of data,
 * Sep 19 (the Figma state) → Sep 20 → Sep 18 → back to Sep 19, so the loop ends where it
 * starts. On each step the orange selection glides to its bar, the tooltip rides with it, every
 * bar eases to its new height, then the numbers roll in a light wave: tooltip, score panel, the
 * list's score, then the vitals. Nothing fades; the filters stay put.
 */
export const LOOP_SECONDS = 12;
/** When each step starts (seconds into the loop). */
const STEPS = [1.0, 5.0, 9.0];

export const velocityDefaults = { GlideSeconds: 0.9, RollSeconds: 0.55, Stagger: 0.08, Ease: 3.5, DataChange: 1 };
export type VelocitySettings = typeof velocityDefaults;

/** One day of data. State 0 is Figma's. */
type State = {
  selected: number;
  score: string;
  date: string;
  heights: number[];
  vitals: { value: string; bar: number }[];
};

export const STATES: State[] = [{
  selected: 3,
  score: '97',
  date: 'Sep 19',
  heights: [26.992, 57.933, 87.888, 119.817, 57.933, 103.029, 65.504],
  vitals: [{ value: '1.49', bar: 61.883 }, { value: '1.29', bar: 56.287 }, { value: '8', bar: 59.25 }, { value: '8', bar: 71.429 }, { value: '8', bar: 71.429 }],
}, {
  selected: 4,
  score: '94',
  date: 'Sep 20',
  heights: [31.5, 52.4, 92.1, 106.6, 113.2, 96.3, 71.8],
  vitals: [{ value: '1.52', bar: 64.6 }, { value: '1.31', bar: 58.9 }, { value: '9', bar: 62.2 }, { value: '8', bar: 69.4 }, { value: '9', bar: 68.9 }],
}, {
  selected: 2,
  score: '98',
  date: 'Sep 18',
  heights: [24.1, 63.7, 121.4, 101.5, 61.2, 108.8, 59.9],
  vitals: [{ value: '1.46', bar: 58.8 }, { value: '1.27', bar: 54.2 }, { value: '7', bar: 56.7 }, { value: '9', bar: 71.429 }, { value: '8', bar: 70.3 }],
}];

/**
 * Where the loop is, for a part that moves `delay` seconds after each step and takes `duration`:
 * `from` and `to` are the states it is between, `progress` how far (0 to 1, eased).
 */
export function stage(t: number, delay: number, duration: number, power: number) {
  let done = 0;
  let progress = 0;
  for (const start of STEPS) {
    const p = ease((t - start - delay) / duration, power);
    if (p >= 1) done += 1;
    else { progress = p; break; }
  }
  const from = done % STATES.length;
  return { from, to: (from + 1) % STATES.length, progress: done >= STEPS.length ? 0 : progress };
}

/** A number of one state, blended between two states and scaled back toward Figma's by `change`. */
export function blend(pick: (state: State) => number, at: { from: number; to: number; progress: number }, change: number) {
  const base = pick(STATES[0]);
  const a = mix(base, pick(STATES[at.from]), change);
  const b = mix(base, pick(STATES[at.to]), change);
  return mix(a, b, at.progress);
}
