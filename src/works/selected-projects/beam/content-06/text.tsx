import { createOutlined, placeText } from '../Outlined';
import { GLYPHS, TEXT } from './glyphs';

// Content 06's text, drawn as outlines (glyphs.ts), so the section loads no font: TikTok Sans
// for the page, and for the two counters inside the visuals, Inter with tabular figures and
// Geist Mono (the embed drew that one in the system's monospace).
export const T = createOutlined(GLYPHS, TEXT);

/** The visuals' counters: each is traced once per shape of number, plus every digit. */
export const COUNTERS = {
  // Visual 1: "12,480 files available", Inter 20px, tabular figures, -0.2px tracking.
  files: { className: 'beam-od-counter beam-od-counter--files', suffix: ' files available', max: '12,480' },
  // Visual 3: "1,250,000 files+ available", monospace 24px.
  repos: { className: 'beam-od-counter beam-od-counter--repos', suffix: ' files+ available', max: '1,250,000' },
} as const;
type Counter = keyof typeof COUNTERS;

const shapeOf = (value: string) => value.replace(/\d/g, '0');
/** Every shape its numbers take from 0 up to its largest: "0", "00", … "00,000". */
const shapesUpTo = (max: string) => Array.from({ length: max.replace(/\D/g, '').length }, (_, index) =>
  Number('9'.repeat(index + 1)).toLocaleString('en-US').replace(/\d/g, '0'));

/** The counter's text at `value` as one path, its baseline starting at (x, y) in its SVG. */
export function counterPath(counter: Counter, value: number, x: number, y: number) {
  const label = `${value.toLocaleString('en-US')}${COUNTERS[counter].suffix}`;
  const text = TEXT[`${counter}:${shapeOf(label)}`];
  return text ? placeText(GLYPHS, text, x, y, label) : '';
}

/** Only until the counters are traced: their shapes and digits as live text, for the tracing script. */
export function CounterSamples() {
  if (TEXT['files:0 files available']) return null;
  return (
    <div className="beam-od-samples" aria-hidden="true">
      {(Object.keys(COUNTERS) as Counter[]).map(counter => (
        <div key={counter} className={COUNTERS[counter].className}>
          {shapesUpTo(COUNTERS[counter].max).map(shape => <T key={shape} k={`${counter}:${shape}${COUNTERS[counter].suffix}`}>{`${shape}${COUNTERS[counter].suffix}`}</T>)}
          <T k={`${counter}:digits`}>0123456789</T>
        </div>
      ))}
    </div>
  );
}
