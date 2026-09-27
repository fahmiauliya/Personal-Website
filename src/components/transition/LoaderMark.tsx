import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import { HandoffLogo, handoffDefaults, type HandoffHandle } from './HandoffLogo';
import styles from './LoaderMark.module.css';

/** The ring, the texts and the finish, sizes in px, times in ms; the logo's own are HandoffLogo's. */
export const loaderMarkDefaults = {
  ...handoffDefaults,
  /** The ring's outer diameter (3× the logo). */
  RingSize: 120,
  /** How long 100% holds before anything leaves. */
  HoldMs: 240,
  /** The ring drawing itself away. */
  RetractMs: 420,
  /** The space between the ring and the texts beside it. */
  TextGap: 40,
};
export type LoaderMarkSettings = typeof loaderMarkDefaults;

const easeInOut = (t: number, power: number) => t < 0.5 ? 0.5 * (2 * t) ** power : 1 - 0.5 * (2 - 2 * t) ** power;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t ** 3;
const clamp = (t: number) => Math.min(1, Math.max(0, t));

/**
 * The loader's content, on the closed puzzle: the logo, its two petal groups taking turns, inside a thin ring that
 * fills clockwise from 12 o'clock with the loading progress, with the initials ("F . A") to its
 * left and the percentage to its right. No opacity anywhere: the logo arrives and leaves by
 * scale, the ring by its stroke, the texts by sliding up into and down out of a mask.
 *
 * `progress` holds the real share of the first screen that is ready (0 → 1), from
 * firstViewportReady. The shown value eases toward it every frame, so steps in the real value
 * become a smooth climb; while waiting it creeps a little toward the next step, never past it,
 * and it only reaches 100% once `complete` is set. No invented progress, no delay.
 *
 * At 100%: a short hold, then the ring draws itself away (its tail chasing its head round to
 * 12 o'clock) and the texts slide down out of view, while the logo finishes the beat it is in,
 * the resting group grows back so the logo is whole, and it scales out with a last turn; then
 * `onFinished` (the puzzle opens). The logo is HandoffLogo, the same as the page transition's.
 */
export function LoaderMark({ label, initials, progress, complete, settings, onFinished }: {
  label: string;
  initials: string;
  progress: MutableRefObject<number>;
  complete: boolean;
  settings?: Partial<LoaderMarkSettings>;
  onFinished: () => void;
}) {
  const s = { ...loaderMarkDefaults, ...settings };
  const logo = useRef<HandoffHandle>(null);
  const arc = useRef<SVGCircleElement>(null);
  const track = useRef<SVGCircleElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  const texts = useRef<HTMLSpanElement[]>([]);
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const finished = useRef(onFinished);
  finished.current = onFinished;
  const settingsRef = useRef(s);
  settingsRef.current = s;

  const centre = s.RingSize / 2;
  const radius = centre - 0.5; // a 1px stroke, inside the ring's box

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    let last = start;
    let shown = 0;
    let fullAt = 0; // when 100% was reached
    let logoGone = false;
    let asked = false;

    const tick = (now: number) => {
      const c = settingsRef.current;
      const dt = Math.min(64, now - last);
      last = now;
      const ring = 2 * Math.PI * (c.RingSize / 2 - 0.5);

      // Progress: ease toward the real value (a ~0.28 s time constant) plus a slow creep capped
      // just past it; once ready, finish briskly so the last few percent never linger. Never
      // faster than 5% per 50 ms, so a big real jump still becomes a smooth climb.
      if (!fullAt) {
        let next: number;
        if (completeRef.current) {
          next = shown + (1 - shown) * (1 - Math.exp(-dt / 260)) + dt * 0.00025;
        } else {
          const target = Math.min(0.99, progress.current);
          next = shown + (target - shown) * (1 - Math.exp(-dt / 280));
          next = Math.min(Math.max(next, shown + dt * 0.00004), target + 0.08, 0.99);
        }
        shown = Math.max(shown, Math.min(next, shown + dt * 0.001));
        if (completeRef.current && 1 - shown < 0.004) shown = 1;
        shown = Math.min(1, shown);
        if (shown >= 1) fullAt = now;
      }

      // The ring fills with `shown`; after the hold, the tail runs round to meet the head at 12
      // o'clock, taking the faint track with it.
      const retract = fullAt ? easeInOut(clamp((now - fullAt - c.HoldMs) / c.RetractMs), 3) : 0;
      const offset = `${-ring * retract}`;
      if (arc.current) {
        arc.current.style.strokeDasharray = `${ring * (fullAt ? 1 - retract : shown)} ${ring}`;
        arc.current.style.strokeDashoffset = offset;
      }
      if (track.current) {
        track.current.style.strokeDasharray = `${ring * (1 - retract)} ${ring}`;
        track.current.style.strokeDashoffset = offset;
      }

      if (number.current) number.current.textContent = `${Math.floor(shown * 100)}%`;
      // The texts: slide up in with the logo's arrival, down out as the ring starts drawing away.
      let rise = easeOut(clamp((now - start) / c.EnterMs));
      if (fullAt) rise -= easeIn(clamp((now - fullAt - c.HoldMs) / c.ExitMs));
      for (const text of texts.current) text.style.transform = `translateY(${(1 - rise) * 100}%)`;

      // After the hold, the logo finishes its beat, comes back whole and scales out.
      if (fullAt && !asked && now - fullAt >= c.HoldMs) {
        asked = true;
        logo.current?.leave({ atRest: true }).then(() => { logoGone = true; });
      }

      if (fullAt && logoGone && now >= fullAt + c.HoldMs + c.RetractMs) {
        finished.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  const text = (index: number) => (element: HTMLSpanElement | null) => { if (element) texts.current[index] = element; };
  return <div className={styles.mark} role="status" aria-label={label} style={{ width: s.RingSize, height: s.RingSize, '--gap': `${s.TextGap}px` } as CSSProperties}>
    <span className={`${styles.side} ${styles.left}`} aria-hidden="true">
      <span ref={text(0)} className={styles.text} style={{ transform: 'translateY(100%)' }}>{initials}</span>
    </span>
    <span className={`${styles.side} ${styles.right}`} aria-hidden="true">
      <span ref={text(1)} className={styles.text} style={{ transform: 'translateY(100%)' }}><span ref={number} className={styles.number}>0%</span></span>
    </span>
    <svg className={styles.ring} width={s.RingSize} height={s.RingSize} viewBox={`0 0 ${s.RingSize} ${s.RingSize}`} fill="none" aria-hidden="true">
      <circle ref={track} className={styles.track} cx={centre} cy={centre} r={radius} />
      <circle ref={arc} className={styles.arc} cx={centre} cy={centre} r={radius} style={{ strokeDasharray: `0 ${2 * Math.PI * radius}` }} />
    </svg>
    <span className={styles.logo}><HandoffLogo ref={logo} settings={s} /></span>
  </div>;
}
