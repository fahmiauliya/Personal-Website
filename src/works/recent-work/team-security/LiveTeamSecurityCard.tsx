import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/motion/SceneFit';
import { useRetainedPreview } from '../../../components/motion/useRetainedPreview';

import { useLoopClock } from '../useCardClock';

const TeamSecurityCard = lazy(() => import('./content/TeamSecurityCard'));

// Team Security: drive its existing 8s CSS light loop from the shared clock, so the
// thumbnail and detail retain the same phase across project navigation.
export default function LiveTeamSecurityCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, playing: live } = useRetainedPreview(ref, eager);
  const position = useLoopClock(8, live, 0, 8, 'team-security');
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {mounted && <Suspense fallback={<span data-cover-ready="pending" />}><TeamSecurityCard position={position} /></Suspense>}
      </SceneFit>
    </div>
  );
}
