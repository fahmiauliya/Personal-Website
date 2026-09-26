import type { CSSProperties } from 'react';
import { SymbolLight, GuideLight, GridWave } from './SecurityLight';
import grid from './assets/construction-grid.svg';
import symbol from './assets/team-security-symbol.svg';
import styles from './TeamSecurityCard.module.css';

/** Original Figma vector layers, clipped to the project card at their native scale. */
export const LOOP_SECONDS = 8;

export default function TeamSecurityCard({ position }: { position?: number }) {
  const timeline = { '--light-delay': `${-(position ?? 0)}s`, '--light-play': position === undefined ? 'running' : 'paused' } as CSSProperties;
  return <figure style={timeline} className={styles.card} role="img" aria-label="Team Security blue symbol on a light construction grid" data-node-id="284:18514">
    <div className={styles.slide} data-node-id="284:18603">
      <div className={styles.artboard} data-node-id="284:18604">
        <img className={styles.grid} src={grid} alt="" draggable={false} data-node-id="284:18605" />
        <GridWave />
        <GuideLight />
        <div className={styles.icon} data-node-id="284:18622">
          <img className={styles.symbol} src={symbol} alt="" draggable={false} data-node-id="284:18640" />
          <SymbolLight />
        </div>
      </div>
    </div>
  </figure>;
}
