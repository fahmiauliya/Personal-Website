import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { LOGO_CENTRE, LogoMark } from './LogoMark';

/** The logo's hand-off, times in ms. The initial loader and the page transition share it. */
export const handoffDefaults = {
  /** The logo's height, px. */
  LogoSize: 40,
  /** How far a group turns on its beat: 90° lands it on itself. */
  StepDeg: 90,
  /** How long one beat turns. */
  StepMs: 450,
  /** The rest after each beat. */
  PauseMs: 150,
  /** The resting group's scale: 0 leaves one group alone (Figma 328:2222), 1 never shrinks. */
  Rest: 0,
  /** The beat's ease: power in-out, higher is snappier. */
  Ease: 3.5,
  /** The logo scaling (and turning) in on arrival and out at the end. */
  EnterMs: 380,
  ExitMs: 320,
  /** At the end, the resting group growing back so the whole logo leaves. */
  GatherMs: 280,
};
export type HandoffSettings = typeof handoffDefaults;

export type HandoffHandle = {
  /**
   * The resting group grows back, then the whole logo scales out with a last turn. With
   * `atRest`, it first finishes the beat it is in (the loader); without, it leaves at once (the
   * page transition, where the puzzle is already opening). Resolves once it is gone.
   */
  leave: (options?: { atRest?: boolean }) => Promise<void>;
};

const easeInOut = (t: number, power: number) => t < 0.5 ? 0.5 * (2 * t) ** power : 1 - 0.5 * (2 - 2 * t) ** power;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t ** 3;
const clamp = (t: number) => Math.min(1, Math.max(0, t));

/**
 * The logo taking turns (Figma 328:2222): beats alternate between the long cross and the short
 * diagonals. On its beat a group turns StepDeg and grows to full size while the other shrinks
 * toward the centre to Rest, so at each rest one group is alone at its own full size. It arrives
 * scaling in with a turn when mounted, and leaves via the handle. Never opacity: scale only.
 */
export const HandoffLogo = forwardRef<HandoffHandle, {
  settings?: Partial<HandoffSettings>;
  className?: string;
  /**
   * Called once `turns` beats have finished, each with its rest after it (the page transition
   * waits for it).
   */
  turns?: number;
  onTurns?: () => void;
  /** Hold the whole logo until it has fully arrived, then start turning (the page transition). */
  turnAfterEnter?: boolean;
}>(function HandoffLogo({ settings, className, turns, onTurns, turnAfterEnter = false }, ref) {
  const s = { ...handoffDefaults, ...settings };
  const wrap = useRef<HTMLSpanElement>(null);
  const long = useRef<SVGGElement | null>(null);
  const short = useRef<SVGGElement | null>(null);
  const live = useRef(s);
  live.current = s;
  const turned = useRef({ turns, onTurns, turnAfterEnter });
  turned.current = { turns, onTurns, turnAfterEnter };
  // Set by leave(): whether to wait for a rest, and the promise's resolve.
  const leaving = useRef<{ atRest: boolean; done: () => void } | null>(null);

  useImperativeHandle(ref, () => ({
    leave: ({ atRest = false } = {}) => new Promise<void>(done => { leaving.current = { atRest, done }; }),
  }), []);

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const start = performance.now();
    let exitAt = 0;
    let exitBeat = 0;
    let reported = false;

    const tick = (now: number) => {
      const c = live.current;
      // Beats of StepMs turning then PauseMs at rest; even beats are the cross's, odd beats the
      // diagonals'. Once leaving, the loop stays where it was.
      const beat = c.StepMs + c.PauseMs;
      const elapsed = now - start;
      const { turns: count, onTurns: report, turnAfterEnter: late } = turned.current;
      // The beats' clock: from mounting, or from the end of the arrival.
      const delay = late ? c.EnterMs : 0;
      const clock = elapsed - delay;
      if (!reported && count && clock >= count * beat) { reported = true; report?.(); }
      let b = Math.max(0, Math.floor(clock / beat));
      const turning = !still && !exitAt && clock >= 0 && clock - b * beat < c.StepMs;
      const request = leaving.current;
      if (request && !exitAt && (!request.atRest || !turning)) { exitAt = now; exitBeat = b; }
      if (exitAt) b = exitBeat;
      // Leaving mid-beat freezes the beat where it is; the gather then brings both groups back.
      const t = clamp(((exitAt ? exitAt - start : elapsed) - delay - b * beat) / c.StepMs);
      const p = still ? 1 : easeInOut(t, c.Ease);
      const crossTurn = b % 2 === 0;
      const from = b === 0 ? 1 : c.Rest; // the very first beat starts from the whole logo
      let crossScale = crossTurn ? from + (1 - from) * p : 1 - (1 - c.Rest) * p;
      let diagonalScale = crossTurn ? 1 - (1 - c.Rest) * p : from + (1 - from) * p;
      const crossAngle = (Math.floor((b + 1) / 2) + (crossTurn ? p : 0)) * c.StepDeg;
      const diagonalAngle = (Math.floor(b / 2) + (crossTurn ? 0 : p)) * c.StepDeg;

      let angle: number;
      let scale: number;
      if (exitAt) {
        const gather = easeInOut(clamp((now - exitAt) / c.GatherMs), 3);
        crossScale += (1 - crossScale) * gather;
        diagonalScale += (1 - diagonalScale) * gather;
        const out = easeIn(clamp((now - exitAt - c.GatherMs) / c.ExitMs));
        angle = out * 45;
        scale = 1 - out;
      } else {
        const enter = easeOut(clamp(elapsed / c.EnterMs));
        angle = -(1 - enter) * 45;
        scale = enter;
      }
      if (still) { crossScale = 1; diagonalScale = 1; angle = 0; }
      const { x, y } = LOGO_CENTRE;
      const about = (turn: number, size: number) => `translate(${x} ${y}) rotate(${still ? 0 : turn}) scale(${size}) translate(${-x} ${-y})`;
      long.current?.setAttribute('transform', about(crossAngle, crossScale));
      short.current?.setAttribute('transform', about(diagonalAngle, diagonalScale));
      if (wrap.current) wrap.current.style.transform = `rotate(${angle}deg) scale(${scale})`;

      if (exitAt && request && now >= exitAt + c.GatherMs + c.ExitMs) {
        request.done();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <span ref={wrap} className={className} style={{ display: 'flex', transform: 'scale(0)', willChange: 'transform' }}>
    <LogoMark size={s.LogoSize} groups={{ long: element => { long.current = element; }, short: element => { short.current = element; } }} />
  </span>;
});
