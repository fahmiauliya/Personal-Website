import { useCallback, useSyncExternalStore } from 'react';

// Drives the `position` prop of a Recent Work card the way Motion Lab's timeline dock
// does (BifrostWorkspace.tsx), for the two shapes its cards use. Values match each
// project's saved settings.json (see each Live<Name>.tsx wrapper), read once here rather
// than through a settings-file loader, since the website has no dial UI to save new ones.

// Same sampling as DialKit's cubicBezierProgress (Newton steps, then bisection): used by
// both clocks below so eased steps match the lab exactly.
function cubicBezier(p: number, [x1, y1, x2, y2]: [number, number, number, number]) {
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

// Grid and detail use the same clock. Hidden subscribers retain the exact frame;
// only visible subscribers drive time. During a handoff both scenes hold that frame.
type Clock = { elapsed: number; last: number | null; raf: number; listeners: Map<() => void, boolean> };
const clocks = new Map<string, Clock>();
function getClock(key: string) {
  let clock = clocks.get(key);
  if (!clock) {
    clock = { elapsed: 0, last: null, raf: 0, listeners: new Map() };
    clocks.set(key, clock);
  }
  return clock;
}
function start(clock: Clock) {
  if (clock.raf || ![...clock.listeners.values()].some(Boolean)) return;
  const frame = (now: number) => {
    clock.raf = 0;
    if (![...clock.listeners.values()].some(Boolean)) { clock.last = null; return; }
    const root = document.documentElement.classList;
    const frozen = root.contains('project-preparing') || root.contains('project-vt-open') || root.contains('project-vt-close');
    if (frozen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clock.last = null;
    } else {
      if (clock.last !== null) clock.elapsed += (now - clock.last) / 1000;
      clock.last = now;
      clock.listeners.forEach((_, notify) => notify());
    }
    clock.raf = requestAnimationFrame(frame);
  };
  clock.raf = requestAnimationFrame(frame);
}
const reducedSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribeReduced = (notify: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const useReduced = () => useSyncExternalStore(subscribeReduced, reducedSnapshot, () => false);

function useElapsed(key: string, playing: boolean) {
  const clock = getClock(key);
  const subscribe = useCallback((notify: () => void) => {
    clock.listeners.set(notify, playing);
    start(clock);
    return () => {
      clock.listeners.delete(notify);
      if (![...clock.listeners.values()].some(Boolean)) {
        cancelAnimationFrame(clock.raf);
        clock.raf = 0;
        clock.last = null;
      }
    };
  }, [clock, playing]);
  return useSyncExternalStore(subscribe, () => clock.elapsed, () => 0);
}

export function useLoopClock(seconds: number, playing: boolean, from = 0, to = seconds, key = `loop-${seconds}-${from}-${to}`): number {
  const reduced = useReduced();
  const elapsed = useElapsed(key, playing && !reduced);
  if (reduced) return to;
  return seconds > 0 ? from + (to - from) * ((elapsed % seconds) / seconds) : from;
}

const SLIDE_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

/**
 * A step count from 0 to `steps`, holding on each whole step for `holdSeconds` then
 * sliding to the next over `slideSeconds` (eased), looping — the lab's default steps
 * shape (no saved timeline). Used by Career Agent's story carousel.
 */
export function useStepClock(steps: number, holdSeconds: number, slideSeconds: number, playing: boolean, key = 'career-agent'): number {
  const reduced = useReduced();
  const elapsed = useElapsed(key, playing && !reduced);
  if (reduced) return 0;
  if (steps <= 0) return 0;
  const stepDuration = holdSeconds + slideSeconds;
  const time = elapsed % (steps * stepDuration);
  const index = Math.floor(time / stepDuration);
  const within = time % stepDuration;
  return within < holdSeconds ? index : index + cubicBezier((within - holdSeconds) / slideSeconds, SLIDE_EASE);
}

export function useElapsedClock(key: string, playing: boolean) {
  const reduced = useReduced();
  const elapsed = useElapsed(key, playing && !reduced);
  return reduced ? 0 : elapsed;
}
