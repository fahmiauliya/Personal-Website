// A Motion Lab timeline (Bifrost motions 04, 09 and 11): a position that steps through targets,
// each step easing from the last position to its target over its duration, looping — as Motion
// Lab's timeline dock and the old motion bundle played it (scripts/motion-export/timeline.js).
export type Ease = [number, number, number, number];
export type Step = { duration: number; to: number; ease: Ease };

/** The default timeline for `count` steps: hold, then slide to the next (as Motion Lab builds it). */
export const holdSlide = (count: number, hold = 2, slide = 1.2): Step[] =>
  Array.from({ length: count }, (_, index) => [
    { duration: hold, to: index, ease: [0, 0, 1, 1] as Ease },
    { duration: slide, to: index + 1, ease: [0.65, 0, 0.35, 1] as Ease },
  ]).flat();

// DialKit's cubic-bezier sampling (as Motion Lab plays it): Newton steps, then bisection.
export function cubicBezier(p: number, [x1, y1, x2, y2]: Ease) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const axis = (t: number, a1: number, a2: number) => (1 - 3 * a2 + 3 * a1) * t ** 3 + (3 * a2 - 6 * a1) * t ** 2 + 3 * a1 * t;
  const slope = (t: number, a1: number, a2: number) => 3 * (1 - 3 * a2 + 3 * a1) * t ** 2 + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
  let t = p;
  for (let i = 0; i < 8; i += 1) {
    const x = axis(t, x1, x2) - p;
    if (Math.abs(x) < 1e-5) return axis(t, y1, y2);
    const dx = slope(t, x1, x2);
    if (Math.abs(dx) < 1e-6) break;
    t -= x / dx;
  }
  let lo = 0;
  let hi = 1;
  t = p;
  while (hi - lo > 1e-5) {
    if (axis(t, x1, x2) < p) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return axis(t, y1, y2);
}

/** The position `seconds` into the looping timeline. */
export function positionAt(steps: Step[], seconds: number) {
  const total = steps.reduce((sum, step) => sum + step.duration, 0);
  let elapsed = total > 0 ? seconds % total : 0;
  let value = 0;
  for (const step of steps) {
    if (elapsed < step.duration) return value + (step.to - value) * cubicBezier(step.duration > 0 ? elapsed / step.duration : 1, step.ease);
    elapsed -= step.duration;
    value = step.to;
  }
  return value;
}

/**
 * Runs `onPosition` every frame with the timeline's position while `live`; paused, it holds and
 * its clock stops (the elapsed time is kept on `holder`).
 */
export function runTimeline(steps: Step[], live: boolean, holder: { elapsed: number }, onPosition: (position: number) => void) {
  if (!live) return () => {};
  let last = 0;
  let frame = requestAnimationFrame(function tick(now) {
    if (last) holder.elapsed += Math.min(100, now - last) / 1000;
    last = now;
    onPosition(positionAt(steps, holder.elapsed));
    frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
}
