import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';
import styles from './LoaderMark.module.css';

/** The loader's finishing beats, in ms. */
export const loaderMarkTiming = {
  /** How long 100% holds before anything leaves: the completion beat. */
  holdMs: 320,
  /** The line retracting. */
  retractMs: 380,
  /** The label and percentage fading. */
  fadeMs: 240,
};

/**
 * The loader's content, on the closed puzzle: a short label ("Loading, please wait ..."), the
 * loading percentage, and one
 * thin line that fills left to right.
 *
 * `progress` holds the real share of the first screen that is ready (0 → 1), from
 * firstViewportReady. The shown value eases toward it every frame, so steps in the real value
 * (one image at a time) become a smooth climb; while waiting it creeps a little toward the
 * next step, never past it, and it only reaches 100% once `complete` is set. No invented
 * progress, no delay.
 *
 * At 100%: a short hold, the line retracts, the label and number fade; then `onFinished`
 * (the puzzle opens).
 */
export function LoaderMark({ name, progress, complete, onFinished }: {
  name: string;
  progress: MutableRefObject<number>;
  complete: boolean;
  onFinished: () => void;
}) {
  const number = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<'loading' | 'retract' | 'fade'>('loading');
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const finished = useRef(onFinished);
  finished.current = onFinished;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let shown = 0;
    let held = false;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const target = completeRef.current ? 1 : Math.min(0.99, progress.current);
      // Ease toward the real value (a ~0.28 s time constant), plus a slow creep while waiting,
      // capped just under the next step so it never runs ahead of reality. Once everything is
      // ready, finish briskly (a shorter constant and a minimum pace): the last few percent
      // must not linger, or the loader would feel stuck and hold the site back for nothing.
      let next: number;
      if (completeRef.current) {
        next = shown + (1 - shown) * (1 - Math.exp(-dt / 260)) + dt * 0.00025;
      } else {
        next = shown + (target - shown) * (1 - Math.exp(-dt / 280));
        next = Math.min(Math.max(next, shown + dt * 0.00004), target + 0.08, 0.99);
      }
      // Never faster than 1 per second (5% per 50 ms), so even a big real jump (fonts and every
      // on-screen image ready at once) becomes a smooth climb.
      shown = Math.max(shown, Math.min(next, shown + dt * 0.001));
      if (completeRef.current && 1 - shown < 0.004) shown = 1;
      shown = Math.min(1, shown);
      const percent = Math.floor(shown * 100);
      if (number.current) number.current.textContent = `${percent}%`;
      if (fill.current) fill.current.style.transform = `scaleX(${shown})`;
      if (shown >= 1 && !held) {
        held = true;
        const { holdMs, retractMs, fadeMs } = loaderMarkTiming;
        window.setTimeout(() => setPhase('retract'), holdMs);
        window.setTimeout(() => setPhase('fade'), holdMs + retractMs);
        window.setTimeout(() => finished.current(), holdMs + retractMs + fadeMs);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  const { retractMs, fadeMs } = loaderMarkTiming;
  return <div className={styles.mark} data-phase={phase} role="status" aria-label={name} style={{ '--retract-ms': `${retractMs}ms`, '--fade-ms': `${fadeMs}ms` } as CSSProperties}>
    <div className={styles.row}>
      <span>{name}</span>
      <span ref={number} className={styles.number}>0%</span>
    </div>
    <span className={styles.track}><span ref={fill} className={styles.fill} /></span>
  </div>;
}
