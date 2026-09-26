import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useNearView } from '../../../components/useNearView';
import { useStepClock } from '../useCardClock';

// CareerAgentCard's own STORY_STEPS (its `stories` array length): kept as a plain number
// here, not imported, so this file has no static reference into the lazy-loaded module —
// a static import of even one named export pulls the whole component into the main
// bundle instead of its own chunk (Rollup can no longer split it out).
const STORY_STEPS = 4;

const CareerAgentCard = lazy(() => import('./content/CareerAgentCard'));

// Career Agent (Figma 285:19188, 536 × 410.204071): the story carousel steps right to
// left, one story per step, holding 2s and sliding 1.2s between (career-agent/settings.json
// has no overrides, so these are the lab's own defaults), looping after the last step.
export default function LiveCareerAgentCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, eager);
  const position = useStepClock(STORY_STEPS, 2, 1.2, live);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {live && <Suspense fallback={null}><CareerAgentCard position={position} /></Suspense>}
      </SceneFit>
    </div>
  );
}
