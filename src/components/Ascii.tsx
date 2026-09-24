import { useEffect, useRef } from 'react';
import { RESUME_DELAY_MS, RESUME_STAGGER_MS } from './useNearView';

// Copied from Motion Lab (website-content/shared/ascii.tsx), where it is tuned; keep the
// two in step. The Works grid passes the lab's saved dial values (see Works.tsx).
// Site-only addition: everything here stops while a project page covers the home page
// (see below). It keeps playing while the page scrolls.

// While a project page is open (html.project-open, projectTransition.ts) it covers the
// Works grid completely, so the ASCII there stops instead of drawing unseen frames. It
// also holds still while a project opens or closes, resuming once the close has
// finished, so it never draws while the shared image animates.
const isCovered = () => {
  const root = document.documentElement.classList;
  return root.contains('project-open') || root.contains('project-vt-open') || root.contains('project-vt-close');
};
const coverListeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  new MutationObserver(() => coverListeners.forEach(listener => listener()))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

/**
 * An image drawn as animated coloured ASCII. The image is sampled on a grid of monospace
 * cells; each cell's brightness picks a character (denser glyphs for brighter spots) and
 * its colour tints that character, on a near-black ground. Two motions keep it alive:
 *
 * - Flicker: each tick a small share of cells swap to a neighbouring glyph on the ramp,
 *   so the texture shimmers without the image losing shape.
 * - Sweep: a soft band of light drifts diagonally across; cells inside it get denser and
 *   brighter, and dark blank cells briefly fill in as it passes.
 *
 * The image is sampled once per size or setting change; each frame only re-draws glyphs.
 * It runs at a capped frame rate, pauses off-screen, and holds still for reduced motion.
 * Used for the Works cards whose projects have no page yet.
 */
export type AsciiOptions = {
  /** Cell height in px; cell width follows the monospace glyph ratio. */
  CellPx: number;
  Contrast: number;
  /** Added to brightness before a glyph is chosen (-0.5 to 0.5). */
  Brightness: number;
  /** Colour saturation of the glyphs (1 keeps the image's own). */
  Saturation: number;
  /** Cells darker than this stay blank, so the ground shows through. */
  Cutoff: number;
  /** Share of cells that swap glyph on each tick (0 to 0.5). */
  Flicker: number;
  /** How much the light band lifts the cells it passes (0 turns the sweep off). */
  Sweep: number;
  /** Seconds for the band to cross the card. */
  SweepSeconds: number;
  /** Seconds between one card's sweep and the next, so the light travels across the grid. */
  SweepStagger: number;
  /** Frame cap; ASCII reads well, and costs less, at a retro rate. */
  Fps: number;
};

export const asciiDefaults: AsciiOptions = {
  CellPx: 9,
  Contrast: 1.1,
  Brightness: -0.05,
  Saturation: 1.3,
  Cutoff: 0.08,
  Flicker: 0.06,
  Sweep: 0.35,
  SweepSeconds: 3.2,
  SweepStagger: 0.4,
  Fps: 24,
};

export const ASCII_GROUND = '#0b0b0b';
// Light to dense, so brighter cells get heavier glyphs on the dark ground.
const RAMP = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const GLYPH_RATIO = 0.6;
const FONT = "700 {size}px 'Geist Mono', ui-monospace, Menlo, monospace";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// A cell and its glyph packed into one number for the colour batches (Ascii image).
const GLYPH_SLOTS = 128;
// Fill styles for the rounded colours (5 bits per channel), built once each.
const colourStyles = new Map<number, string>();
const colourStyle = (colour: number) => {
  let style = colourStyles.get(colour);
  if (!style) {
    const channel = (shift: number) => (((colour >> shift) & 31) << 3) | 4;
    style = `rgb(${channel(10)}, ${channel(5)}, ${channel(0)})`;
    colourStyles.set(colour, style);
  }
  return style;
};

/** A stable pseudo-random number in 0..1 for a cell and a tick. */
function hash(cell: number, tick: number) {
  let h = (cell * 374761393 + tick * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type Grid = {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  width: number;
  height: number;
  /** Each cell's levelled brightness, 0..1. */
  level: Float32Array;
  /** Each cell's saturated, normalised colour, 0..1 per channel. */
  hue: Float32Array;
};

/** `order` is this card's place in the sweep wave: it sweeps `order × SweepStagger` late. */
export function AsciiImage({ src, options, order = 0 }: { src: string; options: AsciiOptions; order?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  // Motion settings are read live by the loop, so tuning them never re-samples the image.
  const motion = useRef({ ...options, order });
  motion.current = { ...options, order };
  const { CellPx, Contrast, Brightness, Saturation } = options;

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    let cancelled = false;
    let grid: Grid | null = null;
    const image = new Image();
    image.src = src;

    // Sample the image into per-cell brightness and colour (once per size or setting).
    const sample = () => {
      if (cancelled || !image.naturalWidth) return;
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      const dpr = Math.max(2, window.devicePixelRatio || 1);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cellH = Math.max(3, CellPx);
      const cellW = cellH * GLYPH_RATIO;
      const cols = Math.ceil(width / cellW);
      const rows = Math.ceil(height / cellH);
      const probe = document.createElement('canvas');
      probe.width = cols;
      probe.height = rows;
      const probeContext = probe.getContext('2d', { willReadFrequently: true });
      if (!probeContext) return;
      // Cropped to cover the card, centred.
      const scale = Math.max((cols * cellW) / image.naturalWidth, (rows * cellH) / image.naturalHeight);
      const sw = (cols * cellW) / scale;
      const sh = (rows * cellH) / scale;
      probeContext.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, 0, 0, cols, rows);
      const { data } = probeContext.getImageData(0, 0, cols, rows);

      // Auto-level: stretch this image's own brightness range (5th to 95th percentile)
      // to the full scale, so dark and bright photos both use the whole glyph ramp.
      const lumas: number[] = [];
      for (let i = 0; i < data.length; i += 4) lumas.push((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255);
      const sorted = [...lumas].sort((a, b) => a - b);
      const low = sorted[Math.floor(sorted.length * 0.05)] ?? 0;
      const high = sorted[Math.floor(sorted.length * 0.95)] ?? 1;
      const span = Math.max(0.05, high - low);

      const level = new Float32Array(cols * rows);
      const hue = new Float32Array(cols * rows * 3);
      for (let cell = 0; cell < cols * rows; cell += 1) {
        const luma = lumas[cell];
        level[cell] = clamp01((clamp01((luma - low) / span) - 0.5) * Contrast + 0.5 + Brightness);
        // Saturate around the cell's own grey, then normalise so glyphs stay readable.
        const r = clamp01(luma + (data[cell * 4] / 255 - luma) * Saturation);
        const g = clamp01(luma + (data[cell * 4 + 1] / 255 - luma) * Saturation);
        const b = clamp01(luma + (data[cell * 4 + 2] / 255 - luma) * Saturation);
        const peak = Math.max(r, g, b, 0.001);
        hue[cell * 3] = r / peak;
        hue[cell * 3 + 1] = g / peak;
        hue[cell * 3 + 2] = b / peak;
      }
      grid = { cols, rows, cellW, cellH, width, height, level, hue };
      context.font = FONT.replace('{size}', String(cellH));
      context.textBaseline = 'top';
    };

    // Cells of each rounded colour, reused from frame to frame.
    const batches = new Map<number, number[]>();

    // Draw one frame of glyphs at time `seconds`.
    const paint = (seconds: number) => {
      if (!grid) return;
      const { cols, rows, cellW, cellH, width, height, level, hue } = grid;
      const { Cutoff, Flicker, Sweep, SweepSeconds, SweepStagger, Fps, order: place } = motion.current;
      context.fillStyle = ASCII_GROUND;
      context.fillRect(0, 0, width, height);
      const tick = Math.floor(seconds * Math.max(1, Fps));
      // The band's centre runs along the diagonal, from before the card to past it.
      const diagonal = width + height;
      // Each card runs the same sweep, shifted by its place in the wave.
      const sweepTime = seconds - place * Math.max(0, SweepStagger);
      const phase = ((sweepTime / Math.max(0.3, SweepSeconds)) % 1 + 1) % 1;
      const centre = (phase * 1.6 - 0.3) * diagonal;
      const bandWidth = diagonal * 0.18;
      const last = RAMP.length - 1;
      // Site-only: glyphs are grouped by colour and each colour is set once per frame,
      // instead of building a colour string and switching fill for every cell. Colours
      // are rounded to 32 steps per channel (at most 4/255 off, not visible).
      for (const cells of batches.values()) cells.length = 0;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const cell = y * cols + x;
          const distance = (x * cellW + y * cellH - centre) / bandWidth;
          const band = Sweep > 0 ? Math.exp(-distance * distance) * Sweep : 0;
          const lit = clamp01(level[cell] + band);
          if (lit < Cutoff) continue;
          let index = Math.round(lit * last);
          // Flicker: a few cells borrow a neighbouring glyph this tick.
          const roll = hash(cell, tick);
          if (roll < Flicker) index = Math.min(last, Math.max(1, index + (roll < Flicker / 2 ? -1 : 1) * (1 + Math.floor((roll * 97) % 3))));
          if (RAMP[index] === ' ') continue;
          const lift = 0.35 + 0.65 * lit;
          const colour = (Math.min(31, (hue[cell * 3] * lift * 32) | 0) << 10) | (Math.min(31, (hue[cell * 3 + 1] * lift * 32) | 0) << 5) | Math.min(31, (hue[cell * 3 + 2] * lift * 32) | 0);
          let cells = batches.get(colour);
          if (!cells) batches.set(colour, (cells = []));
          cells.push(cell * GLYPH_SLOTS + index);
        }
      }
      for (const [colour, cells] of batches) {
        if (!cells.length) continue;
        context.fillStyle = colourStyle(colour);
        for (const packed of cells) {
          const cell = (packed / GLYPH_SLOTS) | 0;
          context.fillText(RAMP[packed % GLYPH_SLOTS], (cell % cols) * cellW, ((cell / cols) | 0) * cellH);
        }
      }
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    // Drawing only while the canvas is on screen and not under an open project page.
    const active = () => visible && !isCovered();
    let raf = 0;
    let sleep = 0;
    let lastPaint = -Infinity;
    const start = performance.now();
    // Site-only: between drawn frames the loop sleeps on a timer rather than waking on
    // every display frame just to skip it.
    const loop = (now: number) => {
      raf = 0;
      if (cancelled || !active()) return;
      const frameMs = 1000 / Math.max(1, motion.current.Fps);
      if (now - lastPaint >= frameMs - 1) {
        lastPaint = now;
        paint((now - start) / 1000);
      }
      const wait = Math.max(0, lastPaint + frameMs - performance.now() - 4);
      sleep = window.setTimeout(() => { sleep = 0; raf = requestAnimationFrame(loop); }, wait);
    };
    let resume = 0;
    const stop = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (sleep) { window.clearTimeout(sleep); sleep = 0; }
      if (resume) { window.clearTimeout(resume); resume = 0; }
    };
    const run = () => {
      if (reduced) { paint(0); return; }
      if (!raf && !sleep && active()) raf = requestAnimationFrame(loop);
    };
    const refresh = () => { sample(); lastPaint = -Infinity; if (reduced) paint(0); else run(); };

    image.decode().then(refresh).catch(() => {});
    document.fonts?.ready.then(refresh).catch(() => {});
    const resize = new ResizeObserver(refresh);
    resize.observe(element);
    // Coming back from under a project page, the covers resume one after another
    // (in sweep order) shortly after the transition ends, not all in its last frame.
    const update = (uncovered = false) => {
      if (!active()) { stop(); return; }
      if (!uncovered) { run(); return; }
      if (!raf && !sleep && !resume) resume = window.setTimeout(() => { resume = 0; run(); }, RESUME_DELAY_MS + Math.max(0, motion.current.order) * RESUME_STAGGER_MS);
    };
    const onCover = () => update(true);
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      update();
    });
    onScreen.observe(element);
    coverListeners.add(onCover);
    return () => {
      cancelled = true;
      stop();
      resize.disconnect();
      onScreen.disconnect();
      coverListeners.delete(onCover);
    };
  }, [src, CellPx, Contrast, Brightness, Saturation]);

  return <canvas ref={canvas} style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />;
}

// Glyphs for scrambled text: printable ASCII that reads as "encoded" rather than words.
const SCRAMBLE = '!#$%&*+-/0123456789<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_{}~';
const pick = (seed: number) => SCRAMBLE[Math.floor(hash(seed, 7) * SCRAMBLE.length)];

/**
 * Text shown as scrambled ASCII: every non-space character becomes a random glyph, and a
 * share of them re-roll each tick so it shimmers like the ASCII images. Spaces stay, so
 * the line keeps its length and shape. It writes the DOM directly, never re-rendering.
 * Used for the titles and details of projects without a page yet (instead of a blur).
 */
export function AsciiText({ text, rate = 12, churn = 0.18 }: { text: string; rate?: number; churn?: number }) {
  const span = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = span.current;
    if (!element) return;
    const chars = [...text];
    // Seed from the text itself, so lines of equal length still scramble differently.
    const seed = chars.reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
    const glyphs = chars.map((char, index) => (char === ' ' ? ' ' : pick(index * 31 + seed)));
    element.textContent = glyphs.join('');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tick = 0;
    const timer = window.setInterval(() => {
      if (isCovered()) return;
      tick += 1;
      for (let index = 0; index < chars.length; index += 1) {
        if (chars[index] !== ' ' && hash(index + seed * 131, tick) < churn) glyphs[index] = pick(index * 7919 + seed + tick * 104729);
      }
      element.textContent = glyphs.join('');
    }, 1000 / rate);
    return () => window.clearInterval(timer);
  }, [text, rate, churn]);

  return <span ref={span} aria-hidden="true" style={{ fontFamily: "'Geist Mono', ui-monospace, Menlo, monospace" }} />;
}
