import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useNearView } from '../../../components/useNearView';
import { useLoopClock } from '../useCardClock';
import { LOOP_SECONDS } from './content/motion';

const VelocityCard = lazy(() => import('./content/VelocityCard'));

// Velocity (Figma 312:2215, 536 × 410.204071): the 12s "live analytics" loop
// (velocity/content/motion.ts), at its default timing (velocity/settings.json has no
// overrides) — real time, linear, looping.
export default function LiveVelocityCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, eager);
  const position = useLoopClock(LOOP_SECONDS, live);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {live && <Suspense fallback={null}><VelocityCard position={position} /></Suspense>}
      </SceneFit>
    </div>
  );
}
