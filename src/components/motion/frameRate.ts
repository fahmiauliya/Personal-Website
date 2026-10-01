// Budget expensive visual loops independently of monitor refresh. Navigation and
// pointer motion keep their own native-rate scheduling.
export const HALF_RATE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
export const MOTION_FRAME_MS = 1000 / (HALF_RATE ? 30 : 60);
// Quantized wall time also keeps the average budget on 144/165Hz monitors,
// where waiting a fixed number of refreshes would accidentally drop below 60fps.
export const frameDue = (now: number, last: number) => !last ||
  Math.floor((now + 0.5) / MOTION_FRAME_MS) > Math.floor((last + 0.5) / MOTION_FRAME_MS);

// The next frame of a budgeted loop. Desktops: the next display frame. Touch devices: about
// every other one, with nothing run on the frame in between — a timer waits it out, where a
// requestAnimationFrame loop that only skipped its turn would still wake the page 60 times a
// second to draw 30.
const SKIP_MS = 22;
const waiting = new Map<number, { timer: number; frame: number }>();
let handles = 0;
export function requestMotionFrame(callback: FrameRequestCallback) {
  if (!HALF_RATE) return requestAnimationFrame(callback);
  const handle = --handles; // negative, so never a requestAnimationFrame id
  const entry = {
    frame: 0,
    timer: window.setTimeout(() => {
      entry.timer = 0;
      entry.frame = requestAnimationFrame(now => { waiting.delete(handle); callback(now); });
    }, SKIP_MS),
  };
  waiting.set(handle, entry);
  return handle;
}
export function cancelMotionFrame(handle: number) {
  if (handle >= 0) return cancelAnimationFrame(handle);
  const entry = waiting.get(handle);
  if (!entry) return;
  waiting.delete(handle);
  window.clearTimeout(entry.timer);
  cancelAnimationFrame(entry.frame);
}

// An SVG whose animations all step (calcMode discrete) only changes its picture at their key
// times: a few times a second, for the gauges. `steps` is those times, per distinct loop, or
// null when anything in the SVG moves continuously (or isn't a plain endless loop from 0).
type Steps = { duration: number; times: number[] }[];
const MIN_STEP_SECONDS = 0.034; // steps closer than two display frames gain nothing over drawing every frame
const analysed = new WeakMap<SVGSVGElement, Steps | null>();
const clock = (value: string | null) => {
  const match = value?.trim().match(/^([\d.]+)(ms|s)?$/);
  return match ? Number(match[1]) / (match[2] === 'ms' ? 1000 : 1) : NaN;
};
function stepsOf(svg: SVGSVGElement): Steps | null {
  if (analysed.has(svg)) return analysed.get(svg)!;
  const loops = new Map<string, Steps[number]>();
  let steps: Steps | null = null;
  const stepped = [...svg.querySelectorAll('animate, animateTransform, animateMotion, set')].every(animation => {
    const duration = clock(animation.getAttribute('dur'));
    const begin = animation.getAttribute('begin');
    if (!/^animate(Transform)?$/.test(animation.localName) || animation.getAttribute('calcMode') !== 'discrete') return false;
    if (!(duration > 0) || animation.getAttribute('repeatCount') !== 'indefinite' || (begin !== null && clock(begin) !== 0)) return false;
    const keyTimes = animation.getAttribute('keyTimes');
    const count = (animation.getAttribute('values') ?? '').split(';').length;
    const times = (keyTimes ? keyTimes.split(';').map(Number) : Array.from({ length: count }, (_, index) => index / count)).map(time => time * duration);
    if (times.some(time => !(time >= 0 && time < duration))) return false;
    // Every gap, the one back round to the loop's start included.
    if (times.some((time, index) => (index ? time - times[index - 1] : duration - times[times.length - 1]) < MIN_STEP_SECONDS)) return false;
    loops.set(`${duration}|${times.join()}`, { duration, times });
    return true;
  });
  if (stepped) steps = [...loops.values()];
  analysed.set(svg, steps);
  return steps;
}
/** Seconds from `time` until the picture next changes. */
function untilNextStep(steps: Steps, time: number) {
  let wait = Infinity;
  for (const { duration, times } of steps) {
    const at = time % duration;
    wait = Math.min(wait, (times.find(step => step > at + 1e-4) ?? duration) - at);
  }
  return wait;
}

/**
 * Pause the SVG clock and draw its original timeline: at the visual frame budget, or — for an
 * SVG that only steps — exactly when its picture changes, so the page isn't redrawn in between
 * (each redraw of an inline SVG costs the whole page a rendering pass).
 */
export function playSvg(svg: SVGSVGElement, live: boolean) {
  svg.pauseAnimations();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = stepsOf(svg);
  let time = svg.getCurrentTime();
  let last = 0, drawn = 0, frame = 0, timer = 0;
  const tick = (now: number) => {
    if (last) time += Math.min(100, now - last) / 1000;
    last = now;
    if (frameDue(now, drawn)) { drawn = now; svg.setCurrentTime(time); }
    frame = requestMotionFrame(tick);
  };
  const step = () => {
    const now = performance.now();
    if (last) { time += (now - last) / 1000; svg.setCurrentTime(time); }
    last = now;
    // Just past the step, so the clock has reached it when the timer fires.
    timer = window.setTimeout(step, untilNextStep(steps!, time) * 1000 + 2);
  };
  const stop = () => {
    cancelMotionFrame(frame);
    window.clearTimeout(timer);
    frame = timer = 0;
    last = drawn = 0;
  };
  const update = () => {
    stop();
    if (!live || document.hidden || reduced.matches) return;
    if (!steps) frame = requestMotionFrame(tick);
    else if (steps.length) step();
  };
  update();
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  return () => {
    stop();
    document.removeEventListener('visibilitychange', update);
    reduced.removeEventListener('change', update);
  };
}
