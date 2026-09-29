import type { ReactNode } from 'react';
import './outlined.css';

// Text drawn as outlines, so a coded tile loads no font. Each tile has its own glyphs.ts
// (generated): the glyph outlines it uses, traced from TikTok Sans at 1px, and each text
// piece's box and every character's measured position (x, baseline y, and its font size
// where that differs from the piece's). The outlines replace the text inside a box of the
// text's own measured size, so nothing around it moves, and fill with the current colour.
export type Glyphs = Record<string, Record<string, string>>;
export type OutlinedText = { width: number; height: number; size: number; weight: string; chars: [string, number, number, number?][] };

export function createOutlined(glyphs: Glyphs, texts: Record<string, OutlinedText>) {
  return function T({ k, className, children }: { k: string; className?: string; children: ReactNode }) {
    const text = texts[k];
    // Until a key has been traced it renders the live text instead (with data-t, which the
    // tracing script measures).
    if (!text) {
      const content = typeof children === 'string'
        ? children.split('\n').map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)
        : children;
      return <span data-t={k} className={className}>{content}</span>;
    }
    const outlines = glyphs[text.weight];
    return (
      <span className={`beam-outlined${className ? ` ${className}` : ''}`} style={{ width: text.width, height: text.height }}>
        <svg aria-hidden="true">
          <g fill="currentColor">
            {text.chars.map(([char, x, y, size = text.size], index) => (
              <path key={index} d={outlines[char]} transform={`translate(${x} ${y}) scale(${size})`} />
            ))}
          </g>
        </svg>
      </span>
    );
  };
}
