import { useEffect, useRef, type CSSProperties } from 'react';
import { cancelMotionFrame, frameDue, requestMotionFrame } from './frameRate';
import { drawSvg, parseSvg, untilNextChange } from './svgScene';

// One of the site's animated SVGs, played on a canvas (see svgScene.ts for why, and for what
// it can draw). `source` is the SVG's markup. It fills its box — give the parent a position —
// with the drawing fitted whole and centred, or covering the box with `cover`.
//
// It plays while `live`, at the visual frame budget, from where it last stopped; a drawing that
// only steps (the gauges) is redrawn exactly when it changes. Otherwise it holds its frame. The
// canvas is as sharp as the screen at the size it is actually shown (any scaling by its
// ancestors included), up to MAX_PIXELS.
const MAX_PIXELS = 6_000_000;

export default function SvgCanvas({ source, live, cover = false, className, style }: { source: string; live: boolean; cover?: boolean; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  /** Seconds into the timeline, kept while paused. */
  const time = useRef(0);
  const redraw = useRef<() => void>(() => {});

  // The drawing itself: now, and whenever its size on screen changes or an image in it arrives.
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !source) return;
    const scene = parseSvg(source);
    let disposed = false;
    const draw = () => {
      if (disposed) return;
      const box = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 3);
      const fit = Math.min(1, Math.sqrt(MAX_PIXELS / Math.max(1, box.width * box.height * density * density)));
      const width = Math.round(box.width * density * fit), height = Math.round(box.height * density * fit);
      if (!width || !height) return;
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      drawSvg(context, scene, time.current, width, height, cover);
    };
    redraw.current = draw;
    draw();
    for (const image of scene.images) if (!image.complete) void image.decode().then(draw, () => undefined);
    let frame = 0;
    const later = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    const sizes = new ResizeObserver(later);
    sizes.observe(canvas);
    window.addEventListener('resize', later);
    // SceneFit rescales its stage with a transform, which changes the canvas's size on screen
    // but not its box.
    const stage = canvas.closest('.scene-fit-stage');
    const fitted = new MutationObserver(later);
    if (stage) fitted.observe(stage, { attributes: true, attributeFilter: ['style'] });
    return () => {
      disposed = true;
      redraw.current = () => {};
      cancelAnimationFrame(frame);
      sizes.disconnect();
      fitted.disconnect();
      window.removeEventListener('resize', later);
    };
  }, [source, cover]);

  // The clock, running only while live.
  useEffect(() => {
    if (!live || !source) return;
    const scene = parseSvg(source);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let last = 0, drawn = 0, frame = 0, timer = 0;
    const next = () => {
      const wait = untilNextChange(scene, time.current);
      if (wait === 0) frame = requestMotionFrame(tick);
      // Just past the step, so the clock has reached it when the timer fires.
      else if (wait < Infinity) timer = window.setTimeout(step, wait * 1000 + 2);
    };
    const tick = (now: number) => {
      if (last) time.current += Math.min(100, now - last) / 1000;
      last = now;
      if (frameDue(now, drawn)) { drawn = now; redraw.current(); }
      next();
    };
    const step = () => {
      const now = performance.now();
      if (last) time.current += (now - last) / 1000;
      last = now;
      redraw.current();
      next();
    };
    const stop = () => {
      cancelMotionFrame(frame);
      window.clearTimeout(timer);
      frame = timer = 0;
      last = drawn = 0;
    };
    const update = () => {
      stop();
      if (document.hidden || reduced.matches) return;
      last = performance.now();
      next();
    };
    update();
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', update);
    };
  }, [live, source]);

  return <canvas ref={ref} aria-hidden="true" className={className} style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', ...style }} />;
}
