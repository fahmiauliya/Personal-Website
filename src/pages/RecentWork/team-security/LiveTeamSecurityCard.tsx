import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useNearView } from '../../../components/useNearView';

const TeamSecurityCard = lazy(() => import('./content/TeamSecurityCard'));

// Team Security (Figma 284:18514, 536 × 410.204071): the 8s light loop runs on its own CSS
// animation when `position` is left undefined (TeamSecurityCard.tsx), so no JS driver is
// needed here — only the usual near-view mount/unmount.
export default function LiveTeamSecurityCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, eager);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {live && <Suspense fallback={null}><TeamSecurityCard /></Suspense>}
      </SceneFit>
    </div>
  );
}
