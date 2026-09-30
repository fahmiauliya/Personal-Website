import { useRef, type CSSProperties } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../../../../components/outlined/Outlined';
import RiveVisual, { type RiveVisualName } from '../rive-visual/RiveVisual';
import { GLYPHS, TEXT } from './glyphs';
import styles from './Features.module.css';
import '../labFrame.css';

// Bifrost motion 05, the features (Figma Portfolio-2026, frame 225:112838, 698 × 556.7), in code:
// Motion Lab's bifrost-content/motion-05. Every layer is code; values are Figma px. The three card
// visuals were Rive files (m5-visual-1…3); they are ../rive-visual here, without the Rive player,
// playing while the motion is near the screen. Text is outlines (./glyphs), so no font loads; the
// lab's uppercase is written out.
const T = createOutlined(GLYPHS, TEXT);
const LINES_Y = [86.93, 272.93, 282.93, 468.93];

// Match Motion 1's accepted one-direction diagonal hatch exactly.
type PatternTone = 'dark' | 'light';
const TILE = 3;
const tileUrls: Partial<Record<`${PatternTone}-${'left' | 'right'}`, string>> = {};

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


/* Inset content (Figma 238:116705): two feature cards over one wide card. */
const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "Geist, 'DM Sans', Arial, sans-serif";
const CARD_LINE = 'rgba(0,0,0,0.1)';
const INK = 'rgba(0,0,0,0.95)';

const KEY_SVG = `<svg width="9.80883" height="9.80883" viewBox="0 0 9.80883 9.80883" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="key 1" clip-path="url(#clip0_0_4)"> <g id="Vector"> </g> <path id="Vector_2" d="M3.57107 4.70633C3.4393 4.37846 3.37204 4.02824 3.37297 3.67487C3.37297 2.19665 4.56383 0.968249 6.04128 0.92112C6.41871 0.908539 6.79469 0.97358 7.14596 1.11221C7.49722 1.25085 7.81629 1.46012 8.08339 1.72708C8.35048 1.99403 8.55993 2.31298 8.69875 2.66417C8.83758 3.01536 8.90282 3.39132 8.89044 3.76875C8.84178 5.2462 7.61338 6.43706 6.13516 6.43706C5.78179 6.43799 5.43157 6.37073 5.1037 6.23896L4.59908 6.74358H3.6795V7.66316H2.75992V8.58274H1.53382C1.45252 8.58274 1.37456 8.55044 1.31707 8.49296C1.25959 8.43547 1.22729 8.35751 1.22729 8.27621V7.17693C1.22733 7.09575 1.25957 7.01789 1.31695 6.96045L3.57107 4.70633Z" stroke="#6FC3A8" stroke-width="0.613052" stroke-linecap="round" stroke-linejoin="round"/> <path id="Vector_3" d="M6.89802 3.3718C7.15196 3.3718 7.35781 3.16594 7.35781 2.91201C7.35781 2.65807 7.15196 2.45222 6.89802 2.45222C6.64409 2.45222 6.43823 2.65807 6.43823 2.91201C6.43823 3.16594 6.64409 3.3718 6.89802 3.3718Z" fill="#6FC3A8"/> </g> <defs> <clipPath id="clip0_0_4"> <rect width="9.80883" height="9.80883" fill="white"/> </clipPath> </defs> </svg>`;
const MCP_SVG = `<svg width="9.80883" height="9.80883" viewBox="0 0 9.80883 9.80883" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="key 1" clip-path="url(#clip0_0_4)"> <g id="Vector"> </g> <path id="Vector_2" d="M3.57095 4.70633C3.43918 4.37846 3.37192 4.02824 3.37286 3.67487C3.37286 2.19665 4.56371 0.968249 6.04116 0.92112C6.41859 0.908539 6.79458 0.97358 7.14584 1.11221C7.49711 1.25085 7.81617 1.46012 8.08327 1.72708C8.35037 1.99403 8.55981 2.31298 8.69864 2.66417C8.83746 3.01536 8.9027 3.39132 8.89032 3.76875C8.84166 5.2462 7.61326 6.43706 6.13504 6.43706C5.78168 6.43799 5.43145 6.37073 5.10358 6.23896L4.59896 6.74358H3.67938V7.66316H2.7598V8.58274H1.5337C1.4524 8.58274 1.37444 8.55044 1.31695 8.49296C1.25947 8.43547 1.22717 8.35751 1.22717 8.27621V7.17693C1.22721 7.09575 1.25946 7.01789 1.31683 6.96045L3.57095 4.70633Z" stroke="#6FC3A8" stroke-width="0.613052" stroke-linecap="round" stroke-linejoin="round"/> <path id="Vector_3" d="M6.8979 3.3718C7.15184 3.3718 7.35769 3.16594 7.35769 2.91201C7.35769 2.65807 7.15184 2.45222 6.8979 2.45222C6.64397 2.45222 6.43812 2.65807 6.43812 2.91201C6.43812 3.16594 6.64397 3.3718 6.8979 3.3718Z" fill="#6FC3A8"/> </g> <defs> <clipPath id="clip0_0_4"> <rect width="9.80883" height="9.80883" fill="white"/> </clipPath> </defs> </svg>`;
const SHIELD_SVG = `<svg width="9.80883" height="9.80883" viewBox="0 0 9.80883 9.80883" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="icon-park-twotone:shield"> <path id="Vector" d="M1.55106 1.96064L4.90808 0.980877L8.26174 1.96064V3.96974C8.26161 4.99937 7.93755 6.00287 7.33545 6.83811C6.73336 7.67335 5.88375 8.298 4.90696 8.62359C3.9298 8.29814 3.07984 7.67343 2.47753 6.83799C1.87521 6.00254 1.55107 4.99873 1.55106 3.96881V1.96064Z" stroke="#6FC3A8" stroke-width="0.613052" stroke-linejoin="round"/> </g> </svg>`;

const cards: Array<{ icon: string; title: string; body: string; visual: RiveVisualName; x: number; y: number; width: number; height: number; copyWidth: number }> = [
  { icon: KEY_SVG, title: 'GOVERNANCE', body: 'Organizations can manage budgets per team or virtual key, track audit logs and maintain access control via SSO', visual: 'm5-visual-1', x: 93.184, y: 39.235, width: 199.119, height: 185.96, copyWidth: 179.502 },
  { icon: MCP_SVG, title: 'MCP', body: 'Built in MCP gateway\nto use all tools within the agent', visual: 'm5-visual-2', x: 296.227, y: 39.522, width: 199.119, height: 185.387, copyWidth: 179.502 },
  { icon: SHIELD_SVG, title: 'GUARDRAILS', body: 'Real-time model protection that blocks unsafe outputs,\nenforces compliance, and keeps your agents secure.', visual: 'm5-visual-3', x: 93.184, y: 235.004, width: 402.162, height: 185.96, copyWidth: 202.552 },
];

function FeatureCard({ card, live }: { card: typeof cards[number]; live: boolean }) {
  return <div style={{ position: 'absolute', left: card.x, top: card.y, width: card.width, height: card.height, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#f6f6f6', border: `0.49px solid ${CARD_LINE}` }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3.924, padding: 9.809, borderBottom: `0.245px solid ${CARD_LINE}` }}>
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 3.924 }}>
        <span style={{ display: 'block', width: 9.809, height: 9.809, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: card.icon }} />
        <T k={`title:${card.title}`} style={{ fontFamily: MONO, fontWeight: 500, fontSize: 6.866, lineHeight: 1.4, color: INK, whiteSpace: 'nowrap' }}>{card.title}</T>
      </span>
      <T k={`body:${card.title}`} style={{ width: card.copyWidth, margin: 0, fontFamily: SANS, fontSize: 6.866, lineHeight: 1.4, color: INK, whiteSpace: 'pre-line' }}>{card.body}</T>
    </div>
    <div style={{ position: 'relative', flex: 1, display: 'grid', placeItems: 'center', padding: 0, background: '#f6f6f6', overflow: 'hidden' }}>
      <RiveVisual name={card.visual} fit="cover" live={live} />
    </div>
  </div>;
}

function InsetContent({ live }: { live: boolean }) {
  return <div className={styles.inset}>
    <div className={`${styles.insetColumn} ${styles.insetColumnLeft}`} style={{ left: 0, ...insetStripStyle('left', 0) }} />
    <div className={`${styles.insetColumn} ${styles.insetColumnRight}`} style={{ left: 549.297, ...insetStripStyle('right', 549.297) }} />
    <div className={styles.insetRule} />
    <div className={styles.topRowFrame} />
    <div className={styles.bottomRowFrame} />
    {cards.map(card => <FeatureCard key={card.title} card={card} live={live} />)}
  </div>;
}

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'screen');
  return (
    <div ref={ref} className={`${styles.frame} bifrost-lab-frame`}>
      <div className={`${styles.strip} ${styles.stripLeft}`} style={stripStyle('left', 55, 0)} />
      <div className={`${styles.strip} ${styles.stripRight}`} style={stripStyle('right', 604, 6)} />
      <InsetContent live={live} />
      {LINES_Y.map(y => <div key={y} className={styles.line} style={{ top: y - 0.245 }} />)}
    </div>
  );
}
