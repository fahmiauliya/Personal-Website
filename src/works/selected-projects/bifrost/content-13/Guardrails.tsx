import { useRef, type CSSProperties } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../../../../components/outlined/Outlined';
import RiveVisual from '../rive-visual/RiveVisual';
import { GLYPHS, TEXT } from './glyphs';
import '../labFrame.css';

// Bifrost motion 13, guardrails (Figma Portfolio-2026, frame 238:117663, 1408 × 812, with inset
// 238:117668), in code: Motion Lab's bifrost-content/motion-13. Every layer is code, like motions
// 01, 05, and 08; values are Figma px. Its visual was the Rive file m13-visual-1, the same file as
// motion 05's guardrails visual (m5-visual-3), so it is that ../rive-visual here, playing while the
// motion is near the screen. Text is outlines (./glyphs), so no font loads.
const T = createOutlined(GLYPHS, TEXT);
const INSET = { x: 179, y: 98.78, width: 1050, height: 614.22 };
const COLUMN_W = 70;
const HAIRLINE = 0.875;
// The frame lines continue the inset's own row rules (y 142.236 and 471.986 inside it)
// rather than Figma's separate vectors, which sit ~0.3px off and read as disconnected.
const LINES_Y = [142.236, 471.986].map(y => INSET.y + y);

// Same diagonal lattice as motions 01, 05, and 08: square marks touch corner-to-corner,
// with two empty pixel rows between stripes. White on the green frame, black on the inset.
const TILE = 3;
const tileUrls: Partial<Record<`${'dark' | 'light'}-${'left' | 'right'}`, string>> = {};

function stripPattern(side: 'left' | 'right', tone: 'dark' | 'light') {
  const key = `${tone}-${side}` as const;
  if (tileUrls[key]) return tileUrls[key];
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

// The lattice is anchored to the frame, so each strip offsets its tile by its frame x.
function stripStyle(side: 'left' | 'right', tone: 'dark' | 'light', frameX: number): CSSProperties {
  return {
    backgroundImage: `url(${stripPattern(side, tone)})`,
    backgroundPosition: `${-frameX}px 0`,
    backgroundSize: `${TILE}px ${TILE}px`,
    imageRendering: 'pixelated',
  };
}

const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "Geist, 'DM Sans', Arial, sans-serif";
const LINE = 'rgba(0,0,0,0.1)';
const INK = 'rgba(0,0,0,0.95)';

const column: CSSProperties = { position: 'absolute', top: 0, width: COLUMN_W, height: '100%', boxSizing: 'border-box' };

const SHIELD_SVG = `<svg width="17.5" height="17.5" viewBox="0 0 17.5 17.5" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="icon-park-twotone:shield"> <path id="Vector" d="M2.75905 3.49811L8.74832 1.75011L14.7316 3.49811V7.08255C14.7314 8.91952 14.1532 10.7099 13.079 12.2C12.0048 13.6902 10.489 14.8046 8.74632 15.3855C7.00297 14.8049 5.48656 13.6903 4.41196 12.1998C3.33736 10.7093 2.75908 8.91839 2.75905 7.08089V3.49811Z" stroke="#6FC3A8" stroke-width="1.09375" stroke-linejoin="round"/> </g> </svg>`;

// Layer order matches Figma: frame strips, frame lines, then the inset on top.
export default function Guardrails() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'focus');
  const rightColumnX = INSET.width - COLUMN_W;
  return (
    <div ref={ref} className="bifrost-lab-frame" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#00251a' }}>
      <div style={{ ...column, left: INSET.x, borderRight: `${HAIRLINE}px solid rgba(224,224,224,0.2)`, ...stripStyle('left', 'dark', INSET.x) }} />
      <div style={{ ...column, left: INSET.x + rightColumnX, borderLeft: `${HAIRLINE}px solid rgba(224,224,224,0.2)`, ...stripStyle('right', 'dark', INSET.x + rightColumnX) }} />
      {LINES_Y.map(y => <div key={y} style={{ position: 'absolute', left: 0, top: y, width: '100%', height: HAIRLINE, background: 'rgba(249,249,249,0.2)' }} />)}

      <div style={{ position: 'absolute', left: INSET.x, top: INSET.y, width: INSET.width, height: INSET.height, overflow: 'hidden', background: '#f9f9f9' }}>
        <div style={{ ...column, left: 0, borderRight: `${HAIRLINE}px solid #e0e0e0`, ...stripStyle('left', 'light', INSET.x) }} />
        <div style={{ ...column, left: rightColumnX, borderLeft: `${HAIRLINE}px solid #e0e0e0`, ...stripStyle('right', 'light', INSET.x + rightColumnX) }} />
        <div style={{ position: 'absolute', left: 979.785, top: 0, width: HAIRLINE, height: 776.124, background: LINE }} />

        {/* the row's rules run the full width of the inset */}
        <div style={{ position: 'absolute', left: 0, top: 142.236, width: '100%', height: 0.875, background: LINE }} />
        <div style={{ position: 'absolute', left: 0, top: 471.986, width: '100%', height: 0.875, background: LINE }} />

        <div style={{ position: 'absolute', left: 166.25, top: 142.236, width: 717.499, height: 329.75, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: `0.875px solid ${LINE}`, borderRight: `0.875px solid ${LINE}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 17.5, borderBottom: `0.875px solid ${LINE}` }}>
            <span style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
              <span style={{ display: 'block', width: 17.5, height: 17.5, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: SHIELD_SVG }} />
              <T k="title" style={{ fontFamily: MONO, fontWeight: 500, fontSize: 12.25, lineHeight: 1.4, color: INK, whiteSpace: 'nowrap' }}>GUARDRAILS</T>
            </span>
            <T k="body" style={{ width: 361.375, margin: 0, fontFamily: SANS, fontSize: 12.25, lineHeight: 1.4, color: INK, whiteSpace: 'normal' }}>
              Real-time model protection that blocks unsafe outputs, enforces compliance, and keeps your agents secure.
            </T>
          </div>
          <div style={{ position: 'relative', height: 236.25, overflow: 'hidden' }}>
            <RiveVisual name="m5-visual-3" fit="cover" live={live} />
          </div>
        </div>
      </div>
    </div>
  );
}
