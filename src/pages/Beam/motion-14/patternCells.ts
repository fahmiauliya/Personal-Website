import { patternArrivalAt } from './patternLoop';

export type PatternClock = { progress: number; time: number; opacity: number };

const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function patternEdgeOpacityAt(distanceFromStart: number) {
  return smooth(distanceFromStart / 110);
}

const WAKE_LENGTH = 190;
const WAKE_FLOOR = 0.2;

// Behind the front the field settles into a calm wake that travels with it.
// The wake never reaches the head, so the active front stays fully dense.
function patternWakeAt(distanceBehindFront: number) {
  return WAKE_FLOOR + (1 - WAKE_FLOOR) * (1 - smooth(distanceBehindFront / WAKE_LENGTH));
}

// The tail fades in from the start edge; the moving head stays dense.
function patternTailAt(distanceFromStart: number, distanceBehindFront: number, row: number, time: number, seed: number) {
  // Stagger the first visible dots so there is no shared vertical boundary.
  const start = patternEdgeOpacityAt(distanceFromStart + (random(seed + 41) - 0.5) * 18);
  // A slow row ripple bends the wake boundary so it rolls like water, not a vertical wipe.
  const ripple = Math.sin(row * 0.85 - time * 2.4) * 14 + (random(seed + 67) - 0.5) * 22;
  const wake = patternWakeAt(Math.max(0, distanceBehindFront + ripple));
  const coverage = start * wake;
  // Stable thresholds thin the dots toward the start edge; soft ramps avoid a hard cutoff.
  const density = smooth((coverage - random(seed + 53) * 0.78) / 0.22);
  return coverage * density;
}

// Every cell has its own arrival, pop, and blink phase. No advancing clip or fill mask.
export function patternCellAt(column: number, row: number, width: number, clock: PatternClock, reduced = false) {
  const seed = column * 37 + row * 113;
  const jitter = random(seed);
  const x = column * 5;
  const arrival = Math.max(0.15, patternArrivalAt(x / width) + (jitter - 0.5) * 0.24 + Math.sin(row * 1.3) * 0.055);
  const age = clock.time - arrival;
  if (clock.progress <= 0 || clock.opacity <= 0 || age < -0.14) return { alpha: 0, scale: 0 };
  const base = 0.16 + random(seed + 7) * 0.16;
  const front = width * clock.progress / 100;
  const edgeBlend = patternTailAt(x, front - x, row, clock.time, seed);
  if (reduced) return { alpha: age >= 0 ? base * clock.opacity * edgeBlend : 0, scale: 1 };

  // A few cells preview the approaching front. Keep them sparse and quiet.
  if (age < 0) {
    if (random(seed + 19) < 0.72) return { alpha: 0, scale: 0 };
    const spark = Math.max(0, Math.sin((age + 0.14) * 50 + jitter * 6));
    return { alpha: spark ** 8 * 0.18 * clock.opacity * edgeBlend, scale: 0.7 + spark * 0.3 };
  }
  const pop = Math.max(0, Math.sin(Math.min(1, age / 0.28) * Math.PI));
  const settle = Math.min(1, age / 0.045);
  const blink = Math.max(0, Math.sin(age * (6 + jitter * 3) + jitter * Math.PI * 2)) ** 12;
  const wave = Math.max(0, Math.sin(clock.time * 4.2 - column * 0.28 + row * 0.72)) ** 10;
  const shimmer = 0.9 + 0.1 * Math.sin(age * 8 + seed);
  return {
    alpha: Math.min(0.95, base * shimmer + pop * 0.34 + blink * 0.12 + wave * 0.06) * clock.opacity * settle * edgeBlend,
    scale: Math.max(0.25, settle) + pop * 0.38 + blink * 0.07,
  };
}
