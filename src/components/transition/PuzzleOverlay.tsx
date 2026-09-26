import { forwardRef, useImperativeHandle, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './PuzzleOverlay.module.css';

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
   * Brings the pieces in until the screen is fully covered. Resolves when it is. `caption` is a
   * small, low-contrast note (e.g. "01 → 02 · Beam") shown while the screen is covered.
   */
  cover: (caption?: string) => Promise<void>;
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

// The caption's timing, as shares of one cover/reveal: it rolls in once the lower middle of the
// screen is covered, and rolls out early in the reveal, well before the page is fully back. The
// pieces rise from below and drop back down, so the lower middle is covered first and freed last.
const CAPTION_IN = 0.55;
const CAPTION_OUT = 0.12;
const CAPTION_MS = 380;

/**
 * A still grain tile for the pieces: faint light and dark specks, about 2% at most, so the dark
 * surface is less flat without any visible texture. Made once; it moves with the pieces, never
 * flickers.
 */
let grainUrl: string | undefined;
function grain() {
  if (grainUrl !== undefined || typeof document === 'undefined') return grainUrl ?? '';
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return (grainUrl = '');
  const image = context.createImageData(size, size);
  for (let index = 0; index < size * size; index += 1) {
    const light = Math.random() < 0.5;
    const alpha = Math.round(Math.random() * 6);
    image.data.set(light ? [255, 255, 255, alpha] : [0, 0, 0, alpha], index * 4);
  }
  context.putImageData(image, 0, 0);
  return (grainUrl = canvas.toDataURL());
}

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
  children?: ReactNode;
  className?: string;
}>(function PuzzleOverlay({ settings, startCovered = false, children, className }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const live = useRef(settings);
  live.current = settings;

  const caption = useRef<HTMLSpanElement>(null);
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
    // The caption rolls up into its small window, and later rolls up out of it: a slide, not a fade.
    const rollCaption = (phase: 'in' | 'out', delay: number) => {
      const text = caption.current;
      if (!text) return;
      const keyframes = phase === 'in'
        ? [{ transform: 'translate3d(0, 110%, 0)' }, { transform: 'translate3d(0, 0, 0)' }]
        : [{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(0, -110%, 0)' }];
      const animation = text.animate(keyframes, { duration: CAPTION_MS, delay, easing: live.current.easing, fill: 'both' });
      animation.finished.then(() => {
        text.style.transform = keyframes[1].transform;
        animation.cancel();
      }).catch(() => undefined);
    };
    return {
      cover: (label?: string) => {
        if (caption.current) {
          caption.current.textContent = label ?? '';
          caption.current.style.transform = 'translate3d(0, 110%, 0)';
          if (label) rollCaption('in', duration() * CAPTION_IN);
        }
        return run('cover');
      },
      reveal: () => {
        if (caption.current?.textContent) rollCaption('out', duration() * CAPTION_OUT);
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
    <div className={styles.caption} aria-hidden><span ref={caption} /></div>
    {children && <div className={styles.content}>{children}</div>}
  </div>;
});
