// The demo's loop (Motion Lab beam-content/motion-03/timeline.ts and settings.json): one pass
// through My Beam → Folder 001 → file preview → My Beam, as a position 0–1 over ~8.8s. Each
// step eases to its position along a cubic-bezier; the steps are the lab's saved values.
type Step = { duration: number; to: number; ease: readonly [number, number, number, number] };

const START = 0;
const STEPS: Step[] = [
  { duration: 0.8, to: 0, ease: [0, 0, 1, 1] },
  { duration: 1.3, to: 0.2, ease: [0, 0.84, 1, 1] },
  { duration: 0.57, to: 0.33, ease: [0, 0, 1, 1] },
  { duration: 1.2, to: 0.45, ease: [0, 0.92, 1, 1] },
  { duration: 0.69, to: 0.65, ease: [0, 0.78, 1, 1] },
  { duration: 1.05, to: 0.78, ease: [0, 0.82, 1, 1] },
  { duration: 1.8, to: 0.9, ease: [0, 0.92, 1, 1] },
  { duration: 1.3, to: 1, ease: [0, 0.57, 1, 1] },
  { duration: 0.05, to: 1, ease: [0, 0, 1, 1] },
  { duration: 0.05, to: 1, ease: [0, 0.75, 1, 1] },
];
const TOTAL = STEPS.reduce((total, step) => total + step.duration, 0);

function bezierValue(t: number, first: number, second: number) {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * first + 3 * inverse * t * t * second + t * t * t;
}

function easedProgress(progress: number, ease: Step['ease']) {
  let lower = 0;
  let upper = 1;
  for (let index = 0; index < 12; index += 1) {
    const middle = (lower + upper) / 2;
    if (bezierValue(middle, ease[0], ease[2]) < progress) lower = middle;
    else upper = middle;
  }
  return bezierValue((lower + upper) / 2, ease[1], ease[3]);
}

export function positionAtTime(seconds: number) {
  let remaining = ((seconds % TOTAL) + TOTAL) % TOTAL;
  let from = START;
  for (const step of STEPS) {
    if (remaining <= step.duration) return from + (step.to - from) * easedProgress(remaining / step.duration, step.ease);
    remaining -= step.duration;
    from = step.to;
  }
  return 0;
}
