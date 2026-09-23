// Replays a motion's timeline the way Motion Lab's BifrostWorkspace sets it up
// in DialKit: a saved timeline (settings.json) wins; otherwise one hold + slide pair per
// step. Durations are divided by the playback rate, and the whole timeline loops.
// Each step eases from the previous position to its target over the step's full duration.

const LINEAR = [0, 0, 1, 1];
const SLIDE = [0.65, 0, 0.35, 1];

export function buildTimeline(settings, stepCount) {
  const rate = Math.min(3, Math.max(0.1, settings.playbackRate || 1));
  const saved = settings.timeline;
  if (saved?.steps?.length) {
    const steps = saved.steps.map(step => {
      if (step.transition?.type !== 'easing') throw new Error('Only easing timeline steps are supported.');
      return { duration: step.duration / rate, to: step.to, ease: step.transition.ease };
    });
    return withTotal({ at: saved.at / rate, from: saved.from, steps });
  }
  const hold = Math.max(0, settings.holdSeconds) / rate;
  const slide = Math.max(0.2, settings.slideSeconds) / rate;
  const steps = Array.from({ length: stepCount }, (_, index) => [
    { duration: hold, to: index, ease: LINEAR },
    { duration: slide, to: index + 1, ease: SLIDE },
  ]).flat();
  return withTotal({ at: 0, from: 0, steps });
}

function withTotal(timeline) {
  return { ...timeline, duration: timeline.at + timeline.steps.reduce((sum, step) => sum + step.duration, 0) };
}

export function positionAt(timeline, seconds) {
  let elapsed = timeline.duration > 0 ? seconds % timeline.duration : 0;
  if (elapsed < timeline.at) return timeline.from;
  elapsed -= timeline.at;
  let value = timeline.from;
  for (const step of timeline.steps) {
    if (elapsed < step.duration) {
      const progress = step.duration > 0 ? elapsed / step.duration : 1;
      return value + (step.to - value) * cubicBezier(progress, step.ease);
    }
    elapsed -= step.duration;
    value = step.to;
  }
  return value;
}

// Same sampling as DialKit's cubicBezierProgress: Newton steps, then bisection.
function cubicBezier(p, [x1, y1, x2, y2]) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const axis = (t, a1, a2) => (1 - 3 * a2 + 3 * a1) * t ** 3 + (3 * a2 - 6 * a1) * t ** 2 + 3 * a1 * t;
  const slope = (t, a1, a2) => 3 * (1 - 3 * a2 + 3 * a1) * t ** 2 + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
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
