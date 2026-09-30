import { useRef, type CSSProperties } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../../../../components/outlined/Outlined';
import Gauge from '../gauge/Gauge';
import { GLYPHS, TEXT } from './glyphs';
import styles from './Benchmark.module.css';

// Bifrost motion 01, the benchmark (Figma Portfolio-2026, frame 225:111827, 698 × 556.7, with
// the benchmark visual 235:115875), in code: Motion Lab's bifrost-content/motion-01. Every
// layer is code; values are Figma px. The four gauges are ../gauge (no Rive player), playing
// while the motion is near the screen. Text is outlines (./glyphs), so no font loads; the
// lab's uppercase is written out.
const T = createOutlined(GLYPHS, TEXT);
const INSET_TOP = 91.97;
// The frame lines continue the inset's own rules (heading bottom, card rows top and
// bottom), so they're placed from those rules rather than from Figma's separate vectors,
// which sit up to 1.85px off and read as disconnected.
const LINES_Y = [90.823, 110.441, 352.42].map(y => INSET_TOP + y);

type PatternTone = 'dark' | 'light';

const TILE = 3;
const tileUrls: Partial<Record<`${PatternTone}-${'left' | 'right'}`, string>> = {};

// One-direction diagonal hatch: square marks touch corner-to-corner, with two
// empty pixel rows between each stripe so it never reads as a checkerboard.
function stripPattern(side: 'left' | 'right', tone: PatternTone) {
  const key = `${tone}-${side}` as const;
  const cached = tileUrls[key];
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = TILE;
  canvas.height = TILE;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const image = context.createImageData(TILE, TILE);
  for (let y = 0; y < TILE; y += 1) {
    for (let x = 0; x < TILE; x += 1) {
      const patternX = side === 'right' ? TILE - 1 - x : x;
      const visible = (patternX + y) % TILE === 0;
      const alpha = visible ? (tone === 'dark' ? 16 : 8) : 0;
      const channel = tone === 'dark' ? 255 : 0;
      image.data.set([channel, channel, channel, alpha], (y * TILE + x) * 4);
    }
  }
  context.putImageData(image, 0, 0);
  tileUrls[key] = canvas.toDataURL();
  return tileUrls[key] ?? '';
}

// The lattice is anchored to the frame, not to the strip, so each strip offsets its tile.
function stripStyle(side: 'left' | 'right', left: number, phase: number) {
  return {
    left,
    backgroundImage: `url(${stripPattern(side, 'dark')})`,
    backgroundPosition: `${-(left + phase)}px 0`,
    backgroundSize: `${TILE}px ${TILE}px`,
  };
}

function insetStripStyle(side: 'left' | 'right', left: number): CSSProperties {
  return {
    backgroundImage: `url(${stripPattern(side, 'light')})`,
    backgroundPosition: `${-left}px 0`,
    backgroundSize: `${TILE}px ${TILE}px`,
  };
}

/* Benchmark visual as laid out inside the frame (Figma 238:116221), 588.53 × 372.74. */
const INSET_W = 588.53;
const INSET_H = 372.74;
const HAIRLINE = 0.49;
const BLACK_LINE = 'rgba(0,0,0,0.1)';
const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "Geist, 'DM Sans', Arial, sans-serif";
const COL_LEFT = 93.184;
const CARD_W = 199.119;
const CARD_X = [COL_LEFT, 296.227];

const cards: Array<{ label: string; badge: string; bifrost: string; litellm: string; gauge: 1 | 2 | 3 | 4 }> = [
  { label: 'MEMORY USAGE', badge: '68% LESS', bifrost: '120MB', litellm: '372MB', gauge: 1 },
  { label: 'P99 LATENCY', badge: '54X FASTER', bifrost: '1.68S', litellm: '90.72S', gauge: 2 },
  { label: 'THROUGHPUT', badge: '9.5X HIGHER', bifrost: '424/S', litellm: '44.84/S', gauge: 3 },
  { label: 'SUCCESS RATE', badge: '11.22% HIGHER', bifrost: '100%', litellm: '88.78%', gauge: 4 },
];

const text = (font: string, size: number, tracking: number, color: string): CSSProperties => ({
  fontFamily: font,
  fontSize: size,
  letterSpacing: tracking,
  lineHeight: 1.4,
  color,
  whiteSpace: 'nowrap',
});

const rule = (x: number, y: number, width: number, color = BLACK_LINE): CSSProperties => ({
  position: 'absolute', left: x, top: y, width, height: HAIRLINE, background: color,
});

function Bracket({ side }: { side: 'left' | 'right' }) {
  return <span style={{
    position: 'absolute',
    top: 0,
    [side]: 0,
    width: 2.943,
    height: 10.299,
    borderTop: `${HAIRLINE}px solid #33c19e`,
    borderBottom: `${HAIRLINE}px solid #33c19e`,
    [side === 'left' ? 'borderLeft' : 'borderRight']: `${HAIRLINE}px solid #33c19e`,
  } as CSSProperties} />;
}

// The gauge fills the chart area (fitted whole, as Rive's Fit.Contain drew it), with white
// masks over the faint side rules in its artboard.
function ChartGauge({ gauge, live }: { gauge: 1 | 2 | 3 | 4; live: boolean }) {
  return <>
    <Gauge gauge={gauge} live={live} />
    <span aria-hidden="true" style={{ position: 'absolute', zIndex: 1, inset: '0 auto 0 0', width: 2.5, background: '#fff', pointerEvents: 'none' }} />
    <span aria-hidden="true" style={{ position: 'absolute', zIndex: 1, inset: '0 0 0 auto', width: 2.5, background: '#fff', pointerEvents: 'none' }} />
  </>;
}

function Reading({ card, name, value, mint }: { card: string; name: string; value: string; mint?: boolean }) {
  return <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.924px 5.885px', borderRight: mint ? `${HAIRLINE}px solid #ebebeb` : undefined }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 1.962 }}>
      <span style={{ display: 'flex', padding: 0.981 }}>
        <span style={{ width: 1.962, height: 1.962, background: mint ? '#63dcbf' : BLACK_LINE, boxShadow: `0 0 0 0.981px ${mint ? 'rgba(0,217,146,0.12)' : 'rgba(0,0,0,0.04)'}` }} />
      </span>
      <T k={`name:${name}`} style={{ ...text(MONO, 5.885, 0.2354, 'rgba(0,0,0,0.9)'), opacity: 0.4 }}>{name}</T>
    </span>
    <T k={`value:${card}:${name}`} style={text(MONO, 9.809, 0.3924, 'rgba(0,0,0,0.95)')}>{value}</T>
  </div>;
}

function Card({ card, x, y, height, live }: { card: typeof cards[number]; x: number; y: number; height: number; live: boolean }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: CARD_W, height, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3.924, padding: 5.885, borderLeft: `${HAIRLINE}px solid ${BLACK_LINE}`, borderRight: `${HAIRLINE}px solid ${BLACK_LINE}` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <T k={`label:${card.gauge}`} style={text(MONO, 6.866, 0.2746, 'rgba(0,0,0,0.4)')}>{card.label}</T>
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 10.299, padding: '0.981px 3.924px', background: '#ebfff4', boxSizing: 'border-box' }}>
        <Bracket side="left" />
        <T k={`badge:${card.gauge}`} style={{ ...text(MONO, 5.885, 0.2354, '#33c19e'), fontWeight: 500 }}>{card.badge}</T>
        <Bracket side="right" />
      </span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%', height: 93.184, boxSizing: 'border-box', overflow: 'hidden', background: '#fff', border: `${HAIRLINE}px solid #ebebeb`, boxShadow: '0 0.981px 3.924px 0.981px rgba(0,0,0,0.04)' }}>
      <div style={{ position: 'relative', height: 63.267, overflow: 'hidden', borderBottom: `${HAIRLINE}px solid #ebebeb` }}>
        <ChartGauge gauge={card.gauge} live={live} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Reading card={String(card.gauge)} name="BIFROST" value={card.bifrost} mint />
        <Reading card={String(card.gauge)} name="LITELLM" value={card.litellm} />
      </div>
    </div>
  </div>;
}

function BenchmarkVisual({ live }: { live: boolean }) {
  return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
    {/* side columns and the rule between the right column and the content */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: 39.235, height: 452.678, boxSizing: 'border-box', borderRight: `${HAIRLINE}px solid #e5e5e5`, ...insetStripStyle('left', 0) }} />
    <div style={{ position: 'absolute', left: 549.297, top: 0, width: 39.235, height: 452.678, boxSizing: 'border-box', borderRight: `${HAIRLINE}px solid #e5e5e5`, ...insetStripStyle('right', 549.297) }} />
    <div style={{ position: 'absolute', left: 549.171, top: 0, width: HAIRLINE, height: 435.022, background: BLACK_LINE }} />

    {/* heading block, y 20.32 to 90.82 */}
    <div style={rule(0, 20.32, INSET_W, '#e2e2e2')} />
    <div style={{ position: 'absolute', left: COL_LEFT, top: 20.32, width: 402.162, height: 70.503, boxSizing: 'border-box', borderLeft: `${HAIRLINE}px solid ${BLACK_LINE}`, borderRight: `${HAIRLINE}px solid ${BLACK_LINE}` }}>
      <T k="eyebrow" style={{ ...text(MONO, 5.885, 0.3531, '#177b62'), position: 'absolute', left: '50%', top: 9.809, transform: 'translateX(-50%)', lineHeight: 1.6, fontWeight: 500 }}>[BENCHMARK]</T>
      <div style={{ position: 'absolute', left: 9.809, top: 22.732, width: 382.544, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.962 }}>
        <T k="title" style={{ ...text(SANS, 13.732, -0.2746, 'rgba(0,0,0,0.95)'), fontWeight: 500, lineHeight: 1.2 }}>50x faster than LiteLLM</T>
        <T k="lede" style={{ ...text(SANS, 6.866, 0, '#525252'), width: 217.756, margin: 0, textAlign: 'center', whiteSpace: 'normal' }}>
          (P99 latency) Bifrost vs LiteLLM at 500 RPS on identical hardware (beyond this, LiteLLM breaks with latency going up to 4 minutes)
        </T>
      </div>
    </div>
    <div style={rule(0, 90.823, INSET_W)} />

    {/* card rows, y 110.44 and y 233.54 */}
    <div style={rule(0, 110.441, INSET_W)} />
    <Card card={cards[0]} x={CARD_X[0]} y={110.441} height={119.177} live={live} />
    <Card card={cards[1]} x={CARD_X[1]} y={110.59} height={118.878} live={live} />
    <div style={rule(0, 229.618, INSET_W)} />
    <div style={rule(0, 233.542, INSET_W)} />
    <Card card={cards[2]} x={CARD_X[0]} y={233.542} height={118.878} live={live} />
    <Card card={cards[3]} x={CARD_X[1]} y={233.542} height={118.878} live={live} />
    <div style={rule(0, 352.42, INSET_W)} />
    <div style={{ position: 'absolute', left: INSET_W - HAIRLINE, top: 110.441, width: HAIRLINE, height: 242.278, background: BLACK_LINE }} />
  </div>;
}

export default function Benchmark() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'screen');
  return (
    <div ref={ref} className={styles.frame}>
      <div className={`${styles.strip} ${styles.stripLeft}`} style={stripStyle('left', 55, 0)} />
      <div className={`${styles.strip} ${styles.stripRight}`} style={stripStyle('right', 604, 6)} />
      {LINES_Y.map(y => <div key={y} className={styles.line} style={{ top: y }} />)}
      <div className={styles.inset} style={{ width: INSET_W, height: INSET_H }}>
        <BenchmarkVisual live={live} />
      </div>
    </div>
  );
}
