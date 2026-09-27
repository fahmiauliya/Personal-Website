import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { HandoffLogo, type HandoffHandle, type HandoffSettings } from './HandoffLogo';
import styles from './PuzzleOverlay.module.css';
import { grain } from '../surfaceGrain';

/** Timing and shape of the puzzle. Times in ms. */
export type PuzzleSettings = {
  /** Vertical columns across the screen. */
  columns: number;
  /** Full-height rectangular pieces side by side in each column, each travelling on its own. */
  pieces: number;
  /** How long one piece takes to travel. */
  pieceMs: number;
  /** Delay from one column to the next. */
  columnStaggerMs: number;
  /** Delay between the pieces of a column: the stepped, puzzle edge. */
  pieceStaggerMs: number;
  /** 0: the pieces leave back the way they came (opposite direction); 1: they carry on through. */
  revealThrough: number;
  easing: string;
};

export type PuzzleHandle = {
  /**
   * Brings the pieces in until the screen is fully covered. Resolves when it is. With `logo` set,
   * the mark appears in the middle once the lower middle is covered and turns while covered.
   */
  cover: () => Promise<void>;
  /** Resolves once the covered logo has made its turns (at once without a logo). */
  settled: () => Promise<void>;
  /** Takes the pieces away, uncovering the screen. Resolves when it is clear. */
  reveal: () => Promise<void>;
  /** Opens at once, without motion (reduced motion). */
  clear: () => void;
  /** How long cover() or reveal() takes, in ms. */
  duration: () => number;
};

// A fixed, irregular column order so the close reads as a puzzle, not a left-to-right sweep.
const ORDER_JITTER = [0, 0.7, 0.25, 1.1, 0.45, 0.9, 0.15, 0.65, 1.2, 0.35, 0.8, 0.05];
// The order pieces go in within a column, also irregular, so the steps don't all face one way.
const PIECE_ORDER = [[0], [1, 0], [1, 0, 2], [2, 0, 3, 1], [3, 1, 4, 0, 2]];

/** Piece widths for one column (fractions of the column, summing to 1), different per column. */
function pieceWidths(column: number, pieces: number) {
  const weights = Array.from({ length: pieces }, (_, piece) => 1 + 0.4 * Math.sin(column * 1.7 + piece * 2.3 + 0.6));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map(weight => weight / total);
}

// The logo appears once the lower middle of the screen is covered (a share of one cover): the
// pieces rise from below, so the middle is covered first. It leaves faster than it arrives, and
// turns LOGO_TURNS steps while covered before the reveal may start (settled()).
const LOGO_IN = 0.55;
const LOGO_LEAVE = { GatherMs: 180, ExitMs: 220 };
const LOGO_TURNS = 2;

type Deferred = { promise: Promise<void>; resolve: () => void };
const deferred = (): Deferred => {
  let resolve = () => {};
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
};

/**
 * A still grain tile for the pieces: faint light and dark specks, about 2% at most, so the dark
 * surface is less flat without any visible texture. Made once; it moves with the pieces, never
 * flickers.
 */

/**
 * The page-transition overlay: dark vertical columns, each split into a few full-height
 * rectangular pieces side by side. It stays mounted above the pages for good; cover() and
 * reveal() move the pieces with transforms only. Columns start at slightly different times and
 * the pieces within a column lag one another, so the edge closes as a stepped puzzle rather than
 * one flat curtain. Every piece spans the full height, so nothing ever opens inside the cover.
 *
 * `startCovered` mounts it closed, the site's first-load state: the initial loader is this
 * overlay before its first reveal(). `children` sit above the pieces (the loader's identity note).
 */
export const PuzzleOverlay = forwardRef<PuzzleHandle, {
  settings: PuzzleSettings;
  startCovered?: boolean;
  /** The handoff logo shown in the middle while covered (Motion Lab's Logo values). */
  logo?: Partial<HandoffSettings>;
  children?: ReactNode;
  className?: string;
}>(function PuzzleOverlay({ settings, startCovered = false, logo, children, className }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const live = useRef(settings);
  live.current = settings;

  const logoHandle = useRef<HandoffHandle>(null);
  const [logoKey, setLogoKey] = useState(0);
  // Resolved until the first cover(): settled() before any cover never waits.
  const settled = useRef<Deferred>({ promise: Promise.resolve(), resolve: () => {} });
  const logoTimer = useRef<number | undefined>(undefined);
  const hasLogo = useRef(Boolean(logo));
  hasLogo.current = Boolean(logo);
  const layout = useMemo(() => Array.from({ length: settings.columns }, (_, column) => pieceWidths(column, settings.pieces)), [settings.columns, settings.pieces]);
  const surface = useMemo(() => ({ '--puzzle-grain': `url(${grain()})` }) as CSSProperties, []);

  useImperativeHandle(ref, () => {
    const pieces = () => [...(root.current?.querySelectorAll<HTMLElement>('[data-piece]') ?? [])];
    // A column's start, in ms: its place in the jittered order.
    const columnDelay = (column: number) => (column + ORDER_JITTER[column % ORDER_JITTER.length]) * live.current.columnStaggerMs;
    const duration = () => {
      const s = live.current;
      return (s.columns - 1 + 1.2) * s.columnStaggerMs + (s.pieces - 1) * s.pieceStaggerMs + s.pieceMs;
    };
    const run = (phase: 'cover' | 'reveal') => {
      const element = root.current;
      if (!element) return Promise.resolve();
      const s = live.current;
      const height = element.clientHeight;
      element.dataset.active = 'true';
      const travel = height + 2;
      const below = `translate3d(0, ${travel}px, 0)`;
      const above = `translate3d(0, ${-travel}px, 0)`;
      const home = 'translate3d(0, 0, 0)';
      const animations = pieces().map(piece => {
        const column = Number(piece.dataset.column);
        const index = Number(piece.dataset.index);
        const count = Number(piece.dataset.count);
        // Covering, the pieces rise from below; revealing, they drop back the way they came in
        // the opposite order, or carry on upward in the same order.
        const through = phase === 'reveal' && s.revealThrough >= 0.5;
        const order = PIECE_ORDER[Math.min(count, PIECE_ORDER.length) - 1] ?? [];
        const place = Math.max(0, order.indexOf(index));
        const lead = phase === 'cover' || through ? place : count - 1 - place;
        const delay = columnDelay(column) + lead * s.pieceStaggerMs;
        const keyframes = phase === 'cover'
          ? [{ transform: below }, { transform: home }]
          : [{ transform: home }, { transform: through ? above : below }];
        const animation = piece.animate(keyframes, { duration: s.pieceMs, delay, easing: s.easing, fill: 'both' });
        return animation.finished.then(() => {
          piece.style.transform = keyframes[1].transform;
          animation.cancel();
        });
      });
      return Promise.all(animations).then(() => {
        if (phase === 'reveal') delete element.dataset.active;
      });
    };
    return {
      cover: () => {
        settled.current.resolve();
        settled.current = deferred();
        window.clearTimeout(logoTimer.current);
        if (hasLogo.current) logoTimer.current = window.setTimeout(() => setLogoKey(key => key + 1), duration() * LOGO_IN);
        else settled.current.resolve();
        return run('cover');
      },
      settled: () => settled.current.promise,
      reveal: () => {
        window.clearTimeout(logoTimer.current);
        settled.current.resolve();
        const leaving = logoHandle.current;
        if (leaving) void leaving.leave().then(() => setLogoKey(0));
        else setLogoKey(0);
        return run('reveal');
      },
      clear: () => {
        const element = root.current;
        if (!element) return;
        pieces().forEach(piece => { piece.style.transform = `translate3d(0, ${element.clientHeight + 2}px, 0)`; });
        delete element.dataset.active;
      },
      duration,
    };
  }, []);

  // Closed from the first frame when startCovered (the pieces rest in place until reveal()).
  const initial = useRef(startCovered ? { 'data-active': 'true' } : {});
  return <div ref={root} className={[styles.overlay, className].filter(Boolean).join(' ')} style={surface} {...initial.current}>
    {layout.map((column, columnIndex) => <div key={columnIndex} className={styles.column} aria-hidden>
      {column.map((width, index) => <div
        key={index}
        className={styles.piece}
        data-piece
        data-column={columnIndex}
        data-index={index}
        data-count={column.length}
        style={{ flexGrow: width }}
      />)}
    </div>)}
    {logo && logoKey > 0 && <div className={styles.logo} aria-hidden>
      <HandoffLogo
        key={logoKey}
        ref={logoHandle}
        settings={{ ...logo, ...LOGO_LEAVE }}
        turns={LOGO_TURNS}
        turnAfterEnter
        onTurns={() => settled.current.resolve()}
      />
    </div>}
    {children && <div className={styles.content}>{children}</div>}
  </div>;
});
