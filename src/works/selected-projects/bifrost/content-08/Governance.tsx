import { useRef, type CSSProperties } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../../../../components/outlined/Outlined';
import RiveVisual from '../rive-visual/RiveVisual';
import keyIcon from './key.svg';
import { GLYPHS, TEXT } from './glyphs';
import styles from './Governance.module.css';
import '../labFrame.css';

// Bifrost motion 08, governance (Figma detail frame 238:117499, 698 × 556.7), in code: Motion Lab's
// bifrost-content/motion-08, motion 05's first card enlarged. Match the accepted Motion 1 diagonal
// lattice in both the green side strips and the light inset gutters. Its visual was the Rive file
// m5-visual-1; it is ../rive-visual here, playing while the motion is near the screen. Text is
// outlines (./glyphs), so no font loads; the lab's uppercase is written out.
const T = createOutlined(GLYPHS, TEXT);
const LINES_Y = [108.23, 448];
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

function stripStyle(side: 'left' | 'right', tone: 'dark' | 'light', offset: number): CSSProperties {
  return {
    backgroundImage: `url(${stripPattern(side, tone)})`,
    backgroundPosition: `${-offset}px 0`,
    backgroundSize: `${TILE}px ${TILE}px`,
  };
}

const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "Geist, 'DM Sans', Arial, sans-serif";
const INK = 'rgba(0,0,0,0.95)';

export default function Governance() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'screen');
  return (
    <div ref={ref} className={`${styles.frame} bifrost-lab-frame`}>
      <div className={styles.inset}>
        <div className={styles.insetColumnLeft} style={stripStyle('left', 'light', 0)} />
        <div className={styles.insetColumnRight} style={stripStyle('right', 'light', 549.61)} />
        <div className={styles.row}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.heading}>
                <img src={keyIcon} alt="" width={17.979} height={17.979} />
                <T k="title" style={{ fontFamily: MONO, fontWeight: 500, fontSize: 12.585, lineHeight: 1.4, color: INK, whiteSpace: 'nowrap' }}>GOVERNANCE</T>
              </div>
              <T k="body" style={{ margin: 0, fontFamily: SANS, fontSize: 12.585, lineHeight: 1.4, letterSpacing: '-0.12px', color: INK, whiteSpace: 'normal' }}>
                Organizations can manage budgets per team or virtual key, track audit logs and maintain access control via SSO
              </T>
            </div>
            <div className={styles.cardVisual}>
              <RiveVisual name="m5-visual-1" fit="cover" live={live} />
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.strip} ${styles.stripLeft}`} style={{ left: 55, ...stripStyle('left', 'dark', 55) }} />
      <div className={`${styles.strip} ${styles.stripRight}`} style={{ left: 604.4, ...stripStyle('right', 'dark', 610.4) }} />
      {LINES_Y.map(y => <div key={y} className={styles.line} style={{ top: y - 0.45 }} />)}
    </div>
  );
}
