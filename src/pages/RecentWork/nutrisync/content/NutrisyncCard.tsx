import { SymbolOverlay, SymbolDetail, WordmarkSolid } from './NutrisyncBrand';
import background from './assets/background-3x.jpg';
import styles from './NutrisyncCard.module.css';

/** Figma 283:11481. Photo, translucent symbol, and solid white wordmark remain independent. */
export default function NutrisyncCard() {
  return <figure className={styles.card} role="img" aria-label="Nutrisync green symbol and white wordmark over a fitness photograph" data-node-id="283:11481">
    {/* 3× photo-only export includes the exact crop, grading and 20% darkening. */}
    <img className={styles.background} src={background} alt="" draggable={false} data-node-id="283:12035" />
    <div className={`${styles.symbol} ${styles.overlay}`} data-node-id="283:12036">
      <SymbolOverlay className={styles.symbolAsset} />
    </div>
    <div className={styles.symbol} data-node-id="283:12051">
      <SymbolDetail className={styles.symbolAsset} />
    </div>
    <div className={styles.wordmark} data-node-id="283:12066">
      <WordmarkSolid />
    </div>
  </figure>;
}
