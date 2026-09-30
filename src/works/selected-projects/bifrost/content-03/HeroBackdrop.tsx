import { useRef } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import HeroBackground from '../hero-background/HeroBackground';

// Bifrost motion 03 (Figma Portfolio-2026, frame 225:112451, 1408 × 600), in code: Motion Lab's
// bifrost-content/motion-03, the hero's background on its own, in the frame's content box
// (817.95 × 450.55 at 295.03, 74.72), raised 20px and scaled 1.3× about its centre as the lab
// drew its Rive canvas. The frame image was a plain #f9f9f9 fill, the frame's own colour.
export default function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'screen');
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#f9f9f9' }}>
      <div style={{ position: 'absolute', left: 295.03, top: 74.72, width: 817.95, height: 450.55 }}>
        <HeroBackground live={live} style={{ inset: 0, width: '100%', height: '100%', transform: 'translateY(-20px) scale(1.3)', transformOrigin: 'center' }} />
      </div>
    </div>
  );
}
