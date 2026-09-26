import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './liveMotion.module.css';

/*
 * Motion parts shared by the Recent Work cards' "live app" loops (Finova, Velocity). Nothing
 * fades: values roll in place, things glide or flip, and each motion plays back the way it came.
 */

/** One symmetric ease-in-out; a higher power holds still longer at both ends. */
export function ease(t: number, power: number) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? Math.pow(2 * x, power) / 2 : 1 - Math.pow(2 - 2 * x, power) / 2;
}

/**
 * A motion that goes out at `start` and comes back at `back`, each over `duration`: 0 → 1 → 0.
 * Both halves use the same curve, so the return is the forward motion played backwards.
 */
export function there(t: number, start: number, back: number, duration: number, power: number) {
  return ease((t - start) / duration, power) - ease((t - back) / duration, power);
}

/** A quick press: 0 → 1 → 0 over `duration`, for a button tap. */
export function press(t: number, start: number, duration: number) {
  const x = (t - start) / duration;
  return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
}

/** Linear blend. */
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/**
 * Text that rolls from `from` to `to` in place, one character slot at a time: in each slot the
 * old character slides up out of view as the new one slides up into it, like an odometer.
 * Characters that don't change stay still. `stagger` delays each slot (in progress units).
 */
export function RollText({ from, to, progress, stagger = 0, className, toClassName, style }: {
  from: string;
  to: string;
  progress: number;
  stagger?: number;
  className?: string;
  /** A class for the new text only, e.g. a new colour. */
  toClassName?: string;
  style?: CSSProperties;
}) {
  const length = Math.max(from.length, to.length);
  const a = from.padStart(length, ' ');
  const b = to.padStart(length, ' ');
  // A new colour rolls every character; otherwise only the characters that change.
  const recolour = toClassName !== undefined && toClassName !== className;
  const changed = [...b].map((char, index) => recolour || char !== a[index]);
  const count = changed.filter(Boolean).length;
  // At rest it is plain text, exactly as the static design sets it; slots exist only mid-roll.
  if (progress <= 0 || progress >= 1) {
    const text = progress <= 0 ? from : to;
    const restClass = progress <= 0 ? className : (toClassName ?? className);
    return <span className={restClass} style={style}>{text}</span>;
  }
  // Unchanged characters stay together as plain text (keeping the font's kerning); each
  // changing character gets its own rolling slot.
  const parts: ReactNode[] = [];
  let run = '';
  let order = 0;
  [...b].forEach((char, index) => {
    if (!changed[index]) { run += char; return; }
    if (run) { parts.push(<span key={`run${index}`} className={className}>{run}</span>); run = ''; }
    // Spread the stagger over the changing slots only, so the whole roll keeps its length.
    const delay = stagger * order++;
    const span = Math.max(0.0001, 1 - stagger * Math.max(0, count - 1));
    const p = Math.min(1, Math.max(0, (progress - delay) / span));
    parts.push(<Slot key={index} progress={p} from={<span className={className}>{a[index]}</span>} to={<span className={toClassName ?? className}>{char}</span>} />);
  });
  if (run) parts.push(<span key="run-end" className={className}>{run}</span>);
  return <span className={styles.roll} style={style} aria-label={progress < 0.5 ? from : to}>{parts}</span>;
}

/**
 * One rolling slot: `from` slides up and out as `to` slides up in. Its width eases from the old
 * character's width to the new one's, so at rest the spacing is exactly the static text's.
 */
export function Slot({ from, to, progress }: { from: ReactNode; to: ReactNode; progress: number }) {
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    // Measure each face's rendered text exactly (a Range, not the rounded offsetWidth), then undo
    // any CSS scale on the way up (the lab shows frames scaled), read from a large ancestor.
    const textWidth = (element: HTMLElement) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const width = range.getBoundingClientRect().width;
      let reference = element.parentElement;
      while (reference && reference.offsetWidth < 200) reference = reference.parentElement;
      const scale = reference ? reference.getBoundingClientRect().width / reference.offsetWidth : 1;
      return width / (scale || 1);
    };
    const measure = () => {
      if (fromRef.current && toRef.current) setWidths([textWidth(fromRef.current), textWidth(toRef.current)]);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, []);
  const width = widths ? widths[0] + (widths[1] - widths[0]) * progress : undefined;
  return <span className={styles.slot} style={{ width }}>
    <span ref={fromRef} className={styles.face} style={{ transform: `translateY(${-progress * 100}%)` }}>{from}</span>
    <span ref={toRef} className={styles.face} style={{ transform: `translateY(${(1 - progress) * 100}%)` }}>{to}</span>
  </span>;
}

/** A whole block that rolls to another block in place (e.g. a status row), same rule as Slot. */
export function RollSwap({ from, to, progress, className }: { from: ReactNode; to: ReactNode; progress: number; className?: string }) {
  return <div className={[styles.swap, className].filter(Boolean).join(' ')}>
    <div className={styles.face} style={{ transform: `translateY(${-progress * 100}%)` }}>{from}</div>
    <div className={styles.face} style={{ transform: `translateY(${(1 - progress) * 100}%)` }}>{to}</div>
  </div>;
}

/** A card flip about the horizontal axis: `front` turns away as `back` turns into view. */
export function Flip({ front, back, progress, className }: { front: ReactNode; back: ReactNode; progress: number; className?: string }) {
  const angle = progress * 180;
  return <div className={[styles.flip, className].filter(Boolean).join(' ')}>
    <div className={styles.flipFace} style={{ transform: `rotateX(${angle}deg)` }}>{front}</div>
    <div className={styles.flipFace} style={{ transform: `rotateX(${angle - 180}deg)` }}>{back}</div>
  </div>;
}
