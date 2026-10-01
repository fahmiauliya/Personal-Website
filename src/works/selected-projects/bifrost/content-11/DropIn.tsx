import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { charsPath, createOutlined } from '../../../../components/outlined/Outlined';
import { runTimeline, type Step } from '../shared/timeline';
import frame from './frame.webp';
import { GLYPHS, TEXT } from './glyphs';
import boltIcon from './assets/bolt.svg';
import codeIcon from './assets/code.svg';
import copyIcon from './assets/copy.svg';
import tabOpenai from './assets/tab-openai.svg';
import tabAnthropic from './assets/tab-anthropic.svg';
import tabLitellm from './assets/tab-litellm.png';
import tabGenai from './assets/tab-genai.svg';
import logo1 from './assets/logo-1.svg';
import logo2 from './assets/logo-2.svg';
import logo3 from './assets/logo-3.svg';
import logo4 from './assets/logo-4.svg';
import logo5 from './assets/logo-5.svg';
import logo6 from './assets/logo-6.svg';
import logo7 from './assets/logo-7.svg';
import logo8 from './assets/logo-8.svg';
import logo9 from './assets/logo-9.svg';
import styles from './DropIn.module.css';
import '../labFrame.css';

// Bifrost motion 11, the drop-in SDK card (Figma Portfolio-2026, frame 185:10286, 698 × 556.7; card
// 221:99485 fills the frame's content box, 593 × 397.31), in code: Motion Lab's
// bifrost-content/motion-11 with its frame image. Values are Figma px. The timeline's position
// walks the SDK tabs (the lab's saved timeline: 2s on a tab, 1s to the next): the highlight slides
// over, the snippet appears, and its Bifrost `base_url` line types itself out. It runs while the
// motion is near the screen. Text is outlines (./glyphs), so no font loads; each code line is
// traced once and drawn a colour at a time, only as far as it has typed.
const T = createOutlined(GLYPHS, TEXT);
const STEPS: Step[] = [0, 1, 2, 3].flatMap(i => [{ duration: 2, to: i, ease: [0, 0, 1, 1] }, { duration: 1, to: i + 1, ease: [0, 0, 0, 0] }]);
const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "Geist, 'DM Sans', Arial, sans-serif";
const HAIRLINE = 0.494;
const TAB_PAD = 7.907;
const INK = 'rgba(0,0,0,0.95)';
const BIFROST_URL = '<your_bifrost_deployment_base_url>';

const TILE = 3;
const tileUrls: Partial<Record<'left' | 'right', string>> = {};

// Motion 1's one-direction diagonal hatch, light tone, for the inset gutters.
function stripPattern(side: 'left' | 'right') {
  const cached = tileUrls[side];
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
      image.data.set([0, 0, 0, visible ? 8 : 0], (y * TILE + x) * 4);
    }
  }
  context.putImageData(image, 0, 0);
  tileUrls[side] = canvas.toDataURL();
  return tileUrls[side] ?? '';
}

// The lattice is anchored to the inset, so the right gutter offsets its tile.
function gutterStyle(side: 'left' | 'right', left: number): CSSProperties {
  return {
    backgroundImage: `url(${stripPattern(side)})`,
    backgroundPosition: `${-left}px 0`,
    backgroundSize: `${TILE}px ${TILE}px`,
  };
}

// Provider grid, left-to-right then top-to-bottom, composed from Figma's vector layers.
const logos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9];

// Tab widths are Figma's, so the highlight lands exactly on each pill. Snippets are the
// Bifrost docs' own; the line naming the Bifrost URL is the one that types.
const tabs = [
  {
    label: 'open AI.py',
    icon: tabOpenai,
    width: 63.627,
    code: `import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="https://${BIFROST_URL}/openai",
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Hello world"}
    ]
)`,
  },
  {
    label: 'Anthropic.py',
    icon: tabAnthropic,
    width: 66.627,
    code: `import os
from anthropic import Anthropic

anthropic = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
    base_url="https://${BIFROST_URL}/anthropic",
)

message = anthropic.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ]
)`,
  },
  {
    label: 'LiteLLM.py',
    icon: tabLitellm,
    width: 63.627,
    code: `import os
from litellm import Completion

# Set environment variable
os.environ["OPENAI_API_KEY"] = os.environ.get("OPENAI_API_KEY")
api_base="https://${BIFROST_URL}/litellm",

response = completion(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello world"}]
)`,
  },
  {
    label: 'Genai.py',
    icon: tabGenai,
    width: 57.627,
    code: `from google import genai

from google.genai.types import HttpOptions

client = genai.Client(
  api_key="dummy-api-key", # Handled by Bifrost
  http_options=HttpOptions(base_url="https://${BIFROST_URL}/genai")
)

response = client.models.generate_content(
  model="gemini-2.5-pro", # or "provider/model" for other providers (openai/gpt-4o-mini)
    contents="Hello!"
)`,
  },
];

const tabOffsets = tabs.map((_, index) => tabs.slice(0, index).reduce((sum, tab) => sum + tab.width, 0));
const pillRect = (index: number) => ({ x: tabOffsets[index] + TAB_PAD, width: tabs[index].width - 2 * TAB_PAD });
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const text = (font: string, size: number, tracking: number, color: string, weight = 400): CSSProperties => ({
  fontFamily: font,
  fontSize: size,
  letterSpacing: tracking,
  lineHeight: 1.4,
  color,
  fontWeight: weight,
  whiteSpace: 'nowrap',
});

// L-shaped corner ticks, as drawn on Figma's tabs and the copy button.
function Corners({ color, arm = 2.224 }: { color: string; arm?: number }) {
  const corners: Array<[string, string]> = [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']];
  return <>{corners.map(([vertical, horizontal]) => (
    <span key={`${vertical}${horizontal}`} style={{
      position: 'absolute',
      [vertical]: 0,
      [horizontal]: 0,
      width: arm,
      height: arm,
      boxSizing: 'border-box',
      [vertical === 'top' ? 'borderTop' : 'borderBottom']: `${HAIRLINE}px solid ${color}`,
      [horizontal === 'left' ? 'borderLeft' : 'borderRight']: `${HAIRLINE}px solid ${color}`,
      pointerEvents: 'none',
    } as CSSProperties} />
  ))}</>;
}

// Keywords, string literals and comments take Figma's syntax colours; the rest stays black.
function tokens(line: string) {
  return line.split(/("[^"]*"|#.*$|\b(?:import|from)\b)/g).filter(Boolean).map(part => ({
    text: part,
    color: part.startsWith('"') ? '#ca643c' : part.startsWith('#') ? '#a6a6a6' : part === 'import' || part === 'from' ? '#3a7eb4' : undefined,
  }));
}

// A code line's text: traced once (key `k`), then drawn a token colour at a time, only its first
// `typed` characters (undefined: all), with the caret after them while it types. The traced
// characters skip spaces, so they're mapped back to the line's own positions.
function CodeText({ k, source, typed }: { k: string; source: string; typed?: number }) {
  const text = TEXT[k];
  if (!source) return <span />;
  // Until traced, the whole line as live text (with data-t, which the tracing script measures).
  if (!text) return <span data-t={k} style={{ display: 'block', whiteSpace: 'pre' }}>{source}</span>;
  const index: number[] = [];   // source position of each traced character
  for (let i = 0; i < source.length; i += 1) if (source[i].trim()) index.push(i);
  const limit = typed ?? source.length;
  const paths = new Map<string, string>();
  let position = 0;
  for (const token of tokens(source)) {
    const start = position; const end = position + token.text.length; position = end;
    const from = index.findIndex(i => i >= start);
    let to = index.findIndex(i => i >= Math.min(end, limit));
    if (to < 0) to = index.length;
    if (from < 0 || to <= from) continue;
    const colour = token.color ?? '#000';
    paths.set(colour, (paths.get(colour) ?? '') + charsPath(GLYPHS, text, from, to));
  }
  // Monospaced: every character's pen position from the first traced one and the advance.
  const advance = index.length > 1 ? (text.chars[index.length - 1][1] - text.chars[0][1]) / (index[index.length - 1] - index[0]) : 0;
  const penAt = (i: number) => text.chars[0][1] + (i - index[0]) * advance;
  const baseline = text.chars[0][2];
  return <span className="beam-outlined" style={{ width: text.width, height: text.height, overflow: 'visible' }}>
    <svg aria-hidden="true">{[...paths].map(([colour, d]) => <path key={colour} fill={colour} d={d} />)}</svg>
    {typed !== undefined && typed < source.length && <span className={styles.caret} style={{ position: 'absolute', left: penAt(typed) + 0.3, top: baseline + 0.9 - 5.437, margin: 0 }} />}
  </span>;
}

// `typed` is the number of characters shown so far; undefined shows the whole line.
function CodeLine({ tab, number, source, typed, style }: { tab: number; number: number; source: string; typed?: number; style?: CSSProperties }) {
  return <div className={styles.line} style={style}>
    <T k={`num:${number}`} className={styles.lineNumber}>{String(number)}</T>
    <CodeText k={`code:${tab}:${number}`} source={source} typed={typed} />
  </div>;
}

// The static lines show at once; the Bifrost line types out character by character.
function Snippet({ tab, typing, measuring }: { tab: number; typing: number; measuring?: boolean }) {
  const lines = tabs[tab].code.split('\n');
  const important = lines.findIndex(line => line.includes(BIFROST_URL));
  return <div className={styles.pre} style={measuring ? { visibility: 'hidden' } : undefined}>
    {lines.map((line, index) => index === important && !measuring
      ? <CodeLine key={index} tab={tab} number={index + 1} source={line} typed={Math.round(typing * line.length)} />
      : <CodeLine key={index} tab={tab} number={index + 1} source={line} />)}
  </div>;
}
// Every code line traced? Until then, all four snippets are laid out (hidden) to be measured.
const CODE_TRACED = tabs.every((tab, index) => tab.code.split('\n').every((line, n) => !line || TEXT[`code:${index}:${n + 1}`]));

function DropInCard({ position }: { position: number }) {
  // `position` counts tabs advanced; the timeline in Motion Lab drives it. Resting on a
  // whole number shows that tab complete. As soon as it moves, the next tab is up: its
  // lines cut in at once, then its Bifrost line types over the remaining 85%. Tab 4
  // wraps to tab 0, so position 0 and 4 look the same and the loop restart is seamless.
  const clamped = Math.max(0, Math.min(tabs.length, position));
  const step = Math.floor(clamped);
  const t = clamped - step;
  const from = step % tabs.length;
  const active = (t > 0 ? step + 1 : step) % tabs.length;
  // The highlight glides to the new tab over the first fifth, landing before typing starts.
  const slide = t > 0 ? smoothstep(clamp01(t / 0.2)) : 1;
  const typing = t > 0 ? clamp01((t - 0.15) / 0.85) : 1;
  const a = pillRect(from);
  const b = pillRect(active);
  const pill = { x: lerp(a.x, b.x, slide), width: lerp(a.width, b.width, slide) };
  const activeWeight = (index: number) => index === active ? slide : index === from ? 1 - slide : 0;

  return (
    <div className={styles.card}>
      <div className={`${styles.gutter} ${styles.gutterLeft}`} style={gutterStyle('left', 0)} />
      <div className={`${styles.gutter} ${styles.gutterRight}`} style={gutterStyle('right', 593 - 39.533)} />

      <div className={`${styles.row} ${styles.header}`}>
        <div className={styles.headerInner}>
          <div className={styles.copy}>
            <div className={styles.tag}>
              <img src={boltIcon} alt="" />
              <T k="tag" style={{ ...text(MONO, 5.93, 0.3558, '#177b62', 500), lineHeight: 1.6 }}>[QUICK SETUP]</T>
            </div>
            <T k="title" style={{ ...text(SANS, 13.837, -0.2767, INK, 500), margin: 0, width: 156.651, lineHeight: 1.2, whiteSpace: 'normal' }}>Drop-in replacement for any AI SDK</T>
            <T k="lede" style={{ ...text(SANS, 6.918, 0, '#525252'), margin: 0, width: 167.522, whiteSpace: 'normal' }}>Change just one line of code. Works with OpenAI, Anthropic, Vercel AI SDK, LangChain, and more.</T>
          </div>
          <div className={styles.grid}>
            {logos.map((logo, index) => <div key={index} className={styles.cell}><img src={logo} alt="" /></div>)}
          </div>
        </div>
      </div>

      <div className={`${styles.row} ${styles.tabs}`}>
        <div className={styles.tabGroup}>
          <div className={styles.highlight} style={{ left: pill.x, width: pill.width }} />
          {tabs.map((tab, index) => {
            const weight = activeWeight(index);
            return <div key={tab.label} className={styles.tab} style={{ width: tab.width }}>
              <div className={styles.pill}>
                <Corners color="#e0e0e0" />
                <img src={tab.icon} alt="" style={{ width: 6.918, height: 6.918, opacity: 0.3 + 0.7 * weight }} />
                <T k={`tab:${tab.label}`} style={{ ...text(MONO, 4.942, 0.1977, '#292929', 600), opacity: 0.5 + 0.5 * weight }}>{tab.label.toUpperCase()}</T>
              </div>
            </div>;
          })}
        </div>
        <div className={styles.tab} style={{ width: 59.638 }}>
          <div className={styles.pill}>
            <Corners color="#e0e0e0" />
            <img src={copyIcon} alt="" style={{ width: 5.93, height: 5.93 }} />
            <T k="copy" style={text(MONO, 4.942, 0.1977, '#292929', 600)}>COPY CODE</T>
          </div>
        </div>
      </div>

      <div className={`${styles.row} ${styles.body}`}>
        <div className={styles.caption}>
          <img src={codeIcon} alt="" />
          <T k="caption" style={{ ...text(MONO, 5.93, 0.2372, '#525252'), width: 53.864, whiteSpace: 'normal', opacity: 0.5 }}>DROP IN ONCE, RUN EVERYWHERE</T>
        </div>
        <div className={styles.panel}>
          {[2.22, 7.66, 13.09].map(left => <span key={left} className={styles.dot} style={{ left }} />)}
          <div className={styles.window}>
            {CODE_TRACED
              ? <Snippet tab={active} typing={typing} />
              : tabs.map((_, index) => <div key={index} style={{ position: 'absolute', inset: 0 }}><Snippet tab={index} typing={1} measuring /></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The motion's frame (698 × 557): its image, and the card in its content box, on the timeline. */
export default function DropIn() {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useRef({ elapsed: 0 });
  const live = useNearView(ref, false, 'focus');
  const [position, setPosition] = useState(0);
  useEffect(() => runTimeline(STEPS, live, clock.current, setPosition), [live]);
  return (
    <div ref={ref} className="bifrost-lab-frame" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#00281e' }}>
      <img src={frame} alt="" decoding="async" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', left: 53, top: 79.89, width: 593, height: 397.31 }}>
        <DropInCard position={position} />
      </div>
    </div>
  );
}
