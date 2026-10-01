import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { frameDue } from '../../components/motion/frameRate';

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

// Grid and detail share elapsed time. Hidden subscribers hold a stable rendered
// snapshot; both copies synchronize once before a project handoff is captured.
type Listener = { playing: boolean; elapsed: number; notify: () => void };
type Clock = { elapsed: number; pending: number; drawn: number; last: number | null; raf: number; listeners: Set<Listener> };
const clocks = new Map<string, Clock>();
function getClock(key: string) {
  let clock = clocks.get(key);
  if (!clock) {
    clock = { elapsed: 0, pending: 0, drawn: 0, last: null, raf: 0, listeners: new Set() };
    clocks.set(key, clock);
  }
  return clock;
}
function start(clock: Clock) {
  if (clock.raf || ![...clock.listeners].some(listener => listener.playing)) return;
  const frame = (now: number) => {
    clock.raf = 0;
    if (![...clock.listeners].some(listener => listener.playing)) { clock.last = null; return; }
    const root = document.documentElement.classList;
    const frozen = root.contains('project-preparing') || root.contains('project-vt-open') || root.contains('project-vt-close');
    if (frozen || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clock.last = null;
    } else {
      // Time is kept every frame; visuals redraw at the desktop/touch frame budget.
      if (clock.last !== null) clock.pending += (now - clock.last) / 1000;
      clock.last = now;
      if (frameDue(now, clock.drawn)) {
        clock.drawn = now;
        clock.elapsed += clock.pending;
        clock.pending = 0;
        clock.listeners.forEach(listener => {
          if (!listener.playing) return;
          listener.elapsed = clock.elapsed;
          listener.notify();
        });
      }
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

// Inactive subscribers keep a stable snapshot, even if another copy drives time.
function attach(clock: Clock, listener: Listener) {
  clock.listeners.add(listener);
  start(clock);
  return () => {
    clock.listeners.delete(listener);
    if (![...clock.listeners].some(item => item.playing)) {
      cancelAnimationFrame(clock.raf);
      clock.raf = 0;
      clock.last = null;
    }
  };
}

/** One synchronized frame before the browser captures a project handoff. */
export function syncCardClocks() {
  clocks.forEach(clock => clock.listeners.forEach(listener => {
    listener.elapsed = clock.elapsed;
    listener.notify();
  }));
}

/** Imperative SVG/canvas consumers don't need a React render for each frame. */
export function subscribeCardClock(key: string, playing: boolean, draw: (elapsed: number) => void) {
  const clock = getClock(key);
  const listener: Listener = { playing, elapsed: clock.elapsed, notify: () => draw(listener.elapsed) };
  listener.notify();
  return attach(clock, listener);
}

function useElapsed(key: string, playing: boolean) {
  const clock = getClock(key);
  const listener = useMemo<Listener>(() => ({ playing, elapsed: clock.elapsed, notify: () => {} }), [clock, playing]);
  const subscribe = useCallback((notify: () => void) => {
    listener.notify = notify;
    return attach(clock, listener);
  }, [clock, listener]);
  return useSyncExternalStore(subscribe, () => listener.elapsed, () => 0);
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
