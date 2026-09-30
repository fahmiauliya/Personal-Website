import type { CSSProperties, ReactNode } from 'react';
import './outlined.css';

// Text drawn as outlines, so a coded tile loads no font. Each tile has its own glyphs.ts
// (generated): the glyph outlines it uses, traced from TikTok Sans at 1px, and each text
// piece's box and every character's measured position (x, baseline y, and its font size
// where that differs from the piece's). The outlines replace the text inside a box of the
// text's own measured size, so nothing around it moves, and fill with the current colour.
//
// Each piece is one path, its characters already placed in it (not a path and a transform
// per character): the browser then has one shape per piece to track, so a tile with a lot of
// text stays cheap to repaint while it animates.
export type Glyphs = Record<string, Record<string, string>>;
// A character is [char, x, baseline y, its font size if not the piece's, its font if not the
// piece's] (a span in another family inside the piece).
export type OutlinedText = { width: number; height: number; size: number; weight: string; chars: [string, number, number, number?, string?][] };

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi;
const round = (value: number) => String(Math.round(value * 1000) / 1000);

/** A glyph's path (absolute M/L/H/V/Q/C/Z commands, in em) scaled by `size` and moved to (x, y). */
function placeGlyph(d: string, x: number, y: number, size: number) {
  let out = '';
  for (const [, command, args] of d.matchAll(/([MLHVQCZ])([^MLHVQCZ]*)/gi)) {
    const values = (args.match(NUMBER) ?? []).map(Number);
    const upper = command.toUpperCase();
    if (upper === 'Z') out += 'Z';
    else if (upper === 'H') out += `H${values.map(v => round(x + v * size)).join(' ')}`;
    else if (upper === 'V') out += `V${values.map(v => round(y + v * size)).join(' ')}`;
    else out += upper + values.map((v, i) => round(i % 2 ? y + v * size : x + v * size)).join(' ');
  }
  return out;
}

/**
 * A traced piece as one path, its first baseline at (x, y) — for text drawn inside an SVG.
 * `chars`, if given, replaces the piece's characters one for one (spaces aside): a counter
 * traced once per shape of number ("0,000 files") draws every number of that shape, its
 * digits being tabular, so each sits where the traced one did.
 */
export function placeText(glyphs: Glyphs, text: OutlinedText, x: number, y: number, chars?: string) {
  const outlines = glyphs[text.weight];
  const baseline = text.chars[0]?.[2] ?? 0;
  const drawn = chars?.replace(/\s/g, '');
  return text.chars.map(([char, cx, cy, size = text.size], index) =>
    placeGlyph(outlines[drawn ? drawn[index] : char] ?? '', x + cx, y + cy - baseline, size)).join('');
}

/**
 * Characters `from`..`to` (indexes into the piece's traced characters, which skip spaces) of a
 * traced piece as one path, in the piece's own box — for text drawn part by part (typing, or one
 * colour at a time).
 */
export function charsPath(glyphs: Glyphs, text: OutlinedText, from: number, to: number) {
  return text.chars.slice(from, to).map(([char, x, y, size = text.size, font = text.weight]) => placeGlyph(glyphs[font][char] ?? '', x, y, size)).join('');
}

export function createOutlined(glyphs: Glyphs, texts: Record<string, OutlinedText>) {
  const paths = new Map<string, string>();
  const pathFor = (key: string, text: OutlinedText) => {
    let d = paths.get(key);
    if (d === undefined) {
      d = text.chars.map(([char, x, y, size = text.size, font = text.weight]) => placeGlyph(glyphs[font][char], x, y, size)).join('');
      paths.set(key, d);
    }
    return d;
  };

  return function T({ k, className, style, children }: { k: string; className?: string; style?: CSSProperties; children: ReactNode }) {
    const text = texts[k];
    // Until a key has been traced it renders the live text instead (with data-t, which the
    // tracing script measures).
    if (!text) {
      const content = typeof children === 'string'
        ? children.split('\n').map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)
        : children;
      return <span data-t={k} className={className} style={style}>{content}</span>;
    }
    return (
      <span className={`beam-outlined${className ? ` ${className}` : ''}`} style={{ ...style, width: text.width, height: text.height }}>
        <svg aria-hidden="true"><path fill="currentColor" d={pathFor(k, text)} /></svg>
      </span>
    );
  };
}
