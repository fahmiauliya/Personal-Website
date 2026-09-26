import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useNearView } from '../../../components/useNearView';
import { useLoopClock } from '../useCardClock';
import { LOOP_SECONDS } from './content/motion';

const FinovaCard = lazy(() => import('./content/FinovaCard'));

// Finova (Figma 282:1447, 536 × 410.204071): the 12s "live app" loop (finova/content/motion.tsx),
// played at its default timing (finova/settings.json has no overrides) — real time, linear,
// looping, matching how the lab's clock drives it with no saved timeline.
export default function LiveFinovaCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, eager);
  const position = useLoopClock(LOOP_SECONDS, live);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {live && <Suspense fallback={null}><FinovaCard position={position} /></Suspense>}
      </SceneFit>
    </div>
  );
}
