import { useEffect, useRef, useState } from 'react';
import { patternLoopAt } from './patternLoop';
import { patternCellAt } from './patternCells';

/** Drives the loop clock. `playbackRate` scales time; pausing freezes the current frame. */
export function usePatternLoop(playing: boolean, playbackRate = 1) {
  const elapsed = useRef(0);
  const rate = useRef(playbackRate);
  rate.current = Math.min(3, Math.max(0.1, playbackRate));
  const [clock, setClock] = useState(() => patternLoopAt(0));

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      if (!document.hidden) elapsed.current += Math.min(100, now - previous) / 1000 * rate.current;
      previous = now;
      setClock(patternLoopAt(elapsed.current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  return clock;
}

export function WalkingPattern({ progress, time, opacity, glow }: ReturnType<typeof patternLoopAt>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !size.width || !size.height) return;
    const density = Math.max(2, window.devicePixelRatio || 1);
    const width = Math.round(size.width * density);
    const height = Math.round(size.height * density);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.setTransform(density, 0, 0, density, 0, 0);
    context.clearRect(0, 0, size.width, size.height);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    context.save();
    context.fillStyle = '#7fa5a8';
    for (let row = 0; row * 5 < size.height; row += 1) {
      for (let column = 0; column * 5 < size.width; column += 1) {
        const cell = patternCellAt(column, row, size.width, { progress, time, opacity }, reduced);
        if (cell.alpha <= 0) continue;
        const side = 2 * cell.scale;
        context.globalAlpha = cell.alpha;
        context.fillRect(column * 5 + 1 - side / 2, row * 5 + 2 - side / 2, side, side);
      }
    }
    context.restore();
  }, [progress, time, opacity, size]);

  return <>
    {glow > 0 && <span className="uploadProgressLoop__glow" aria-hidden="true" style={{ opacity: glow }} />}
    <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
  </>;
}
