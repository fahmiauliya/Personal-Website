import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useRetainedPreview } from '../../../components/useRetainedPreview';
import { useLoopClock } from '../useCardClock';
import { LOOP_SECONDS } from './content/motion';

const VelocityCard = lazy(() => import('./content/VelocityCard'));

// Velocity (Figma 312:2215, 536 × 410.204071): the 12s "live analytics" loop
// (velocity/content/motion.ts), at its default timing (velocity/settings.json has no
// overrides) — real time, linear, looping.
export default function LiveVelocityCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, playing: live } = useRetainedPreview(ref, eager);
  const position = useLoopClock(LOOP_SECONDS, live, 0, LOOP_SECONDS, 'velocity');
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {mounted && <Suspense fallback={<span data-cover-ready="pending" />}><VelocityCard position={position} /></Suspense>}
      </SceneFit>
    </div>
  );
}
