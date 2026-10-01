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
