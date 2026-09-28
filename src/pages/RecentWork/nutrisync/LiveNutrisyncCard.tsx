import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useRetainedPreview } from '../../../components/useRetainedPreview';

const NutrisyncCard = lazy(() => import('./content/NutrisyncCard'));

// Nutrisync (Figma 283:11481, 536 × 410.204071): a static composition — photo, symbol and
// wordmark — with no animation, so it needs no driver. Mounted only near the screen (the
// Works card, the Recent Work grid, or the detail cover), then retained while covered.
export default function LiveNutrisyncCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mounted } = useRetainedPreview(ref, eager);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {mounted && <Suspense fallback={<span data-cover-ready="pending" />}><NutrisyncCard /></Suspense>}
      </SceneFit>
    </div>
  );
}
