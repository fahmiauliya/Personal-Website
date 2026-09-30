import { useRef } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import BinaryWave, { type BinaryWaveProps } from './BinaryWave';

// Bifrost motion 12, the binary wave (Figma Portfolio-2026, frame 225:115664, 698 × 557), in code:
// Motion Lab's bifrost-content/motion-12 with the lab's saved dial values (settings.json). Two
// faint 13-cell grids near the top and bottom edges, and the two bands Figma marks for code
// components running the binary wave, the bottom one mirrored. It draws while near the screen.
const GRID_LINE = '#e2e2e2';
const CELLS = 13;
const WAVE: BinaryWaveProps = {
  cellSize: 6, fontSize: 6, speed: 2.8, frequency: 4.9, amplitude: 0.13, baseHeight: 0.48, density: 0.6, crestScatter: 0.45,
  blinkSpeed: 10.6, blinkDepth: 0.46, opacity: 0.89, zeroChance: 0.21, centerGap: 0.08, seed: 266075,
};
// Push the top band down and the bottom band up, in Figma px.
const TOP_OFFSET = 53;
const BOTTOM_OFFSET = 53;

function Grid({ top, flip }: { top: number; flip?: boolean }) {
  return <div style={{ position: 'absolute', left: -5.958, top, width: 710.441, height: 49.384, display: 'flex', alignItems: 'center', opacity: 0.2, boxSizing: 'border-box', transform: flip ? 'scaleY(-1)' : undefined, borderLeft: `0.866px solid ${GRID_LINE}`, borderRight: `0.866px solid ${GRID_LINE}` }}>
    {Array.from({ length: CELLS }, (_, index) => (
      <span key={index} style={{ flex: '1 0 0', minWidth: 0, height: 49.384, boxSizing: 'border-box', borderLeft: `0.866px solid ${GRID_LINE}`, borderRight: `0.866px solid ${GRID_LINE}`, borderBottom: `0.866px solid ${GRID_LINE}` }} />
    ))}
  </div>;
}

function Band({ top, reflect, playing }: { top: number; reflect?: boolean; playing: boolean }) {
  return <div style={{ position: 'absolute', left: 0, top, width: 698, height: 126, overflow: 'hidden' }}>
    <BinaryWave {...WAVE} reflectVertical={reflect} playing={playing} />
  </div>;
}

export default function BinaryWaves() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'screen');
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#00251a' }}>
      <Grid top={0} />
      <Grid top={507.32} flip />
      <Band top={-0.113 + TOP_OFFSET} playing={live} />
      <Band top={430.887 - BOTTOM_OFFSET} reflect playing={live} />
    </div>
  );
}
