import { useRef, type CSSProperties } from 'react';
import SceneFit from '../../../../components/motion/SceneFit';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../../../../components/outlined/Outlined';
import Gauge from '../gauge/Gauge';
import { GLYPHS, TEXT } from './glyphs';
import frame from './frame.webp';
import styles from './BifrostCover.module.css';

// The Bifrost cover (Figma Portfolio-2026 244:2284, 806 × 706), in code: Motion Lab's
// bifrost-content/motion-cover. Motion 10's dithered blur behind (frame.webp, cropped so its
// dots come out as in the gallery), and the Memory Usage card at Figma px: motion 1's first
// benchmark card at 3.752×, playing the same gauge (../gauge, no Rive player). Text is
// outlines (./glyphs), so no font loads; the lab's uppercase is written out.
const T = createOutlined(GLYPHS, TEXT);
const HAIRLINE = 1.84;
const BLACK_LINE = 'rgba(0,0,0,0.1)';

const text = (size: number, tracking: number, color: string): CSSProperties => ({
  fontFamily: "'Geist Mono', ui-monospace, monospace",
  fontSize: size,
  letterSpacing: tracking,
  lineHeight: 1.4,
  color,
  whiteSpace: 'nowrap',
});

function Bracket({ side }: { side: 'left' | 'right' }) {
  return <span style={{
    position: 'absolute',
    top: 0,
    [side]: 0,
    width: 11.039,
    height: 38.638,
    boxSizing: 'border-box',
    borderTop: `${HAIRLINE}px solid #33c19e`,
    borderBottom: `${HAIRLINE}px solid #33c19e`,
    [side === 'left' ? 'borderLeft' : 'borderRight']: `${HAIRLINE}px solid #33c19e`,
  } as CSSProperties} />;
}

function Reading({ name, value, mint }: { name: string; value: string; mint?: boolean }) {
  return <div className={`${styles.reading} ${mint ? styles.readingFirst : ''}`}>
    <span className={styles.name}>
      <span className={styles.dotWrap}>
        <span className={styles.dot} style={{ background: mint ? '#63dcbf' : BLACK_LINE, boxShadow: `0 0 0 3.68px ${mint ? 'rgba(0,217,146,0.12)' : 'rgba(0,0,0,0.04)'}` }} />
      </span>
      <T k={`name:${name}`} style={{ ...text(22.079, 0.8832, 'rgba(0,0,0,0.9)'), opacity: 0.4 }}>{name}</T>
    </span>
    <T k={`value:${name}`} style={text(36.798, 1.4719, 'rgba(0,0,0,0.95)')}>{value}</T>
  </div>;
}

export function BifrostCoverScene() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'focus');
  return (
    <div ref={ref} className={styles.frame}>
      <img className={styles.image} src={frame} alt="" decoding="async" />
      <div className={styles.card}>
        <div className={styles.header}>
          <T k="label" style={text(25.759, 1.0303, 'rgba(0,0,0,0.4)')}>MEMORY USAGE</T>
          <span className={styles.badge}>
            <Bracket side="left" />
            <T k="badge" style={{ ...text(22.079, 0.8832, '#33c19e'), fontWeight: 500 }}>68% LESS</T>
            <Bracket side="right" />
          </span>
        </div>
        <div className={styles.chart}>
          <div className={styles.gauge}>
            <Gauge gauge={1} live={live} />
            <span aria-hidden="true" className={`${styles.mask} ${styles.maskLeft}`} />
            <span aria-hidden="true" className={`${styles.mask} ${styles.maskRight}`} />
          </div>
          <div className={styles.readings}>
            <Reading name="BIFROST" value="120MB" mint />
            <Reading name="LITELLM" value="372MB" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BifrostCover() {
  return <SceneFit width={806} height={706}><BifrostCoverScene /></SceneFit>;
}
