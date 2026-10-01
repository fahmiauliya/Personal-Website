// Budget expensive visual loops independently of monitor refresh. Navigation and
// pointer motion keep their own native-rate scheduling.
export const HALF_RATE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
export const MOTION_FRAME_MS = 1000 / (HALF_RATE ? 30 : 60);
// Quantized wall time also keeps the average budget on 144/165Hz monitors,
// where waiting a fixed number of refreshes would accidentally drop below 60fps.
export const frameDue = (now: number, last: number) => !last ||
  Math.floor((now + 0.5) / MOTION_FRAME_MS) > Math.floor((last + 0.5) / MOTION_FRAME_MS);

/** Pause the SVG clock and draw its original timeline at the visual frame budget. */
export function playSvg(svg: SVGSVGElement, live: boolean) {
  svg.pauseAnimations();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let time = svg.getCurrentTime();
  let last = 0, drawn = 0, frame = 0;
  const tick = (now: number) => {
    if (last) time += Math.min(100, now - last) / 1000;
    last = now;
    if (frameDue(now, drawn)) { drawn = now; svg.setCurrentTime(time); }
    frame = requestAnimationFrame(tick);
  };
  const update = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = drawn = 0;
    if (live && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  };
  update();
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', update);
    reduced.removeEventListener('change', update);
  };
}
