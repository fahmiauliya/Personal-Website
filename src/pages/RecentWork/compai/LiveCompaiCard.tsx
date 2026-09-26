import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useNearView } from '../../../components/useNearView';
import { useLoopClock } from '../useCardClock';

// @rive-app/react-canvas (and its RuntimeLoader.setWasmUrl call) live inside this lazy
// chunk, not here, so importing this file doesn't pull ~450KB of Rive's JS into the main
// bundle before a visitor ever opens Compai.
const CompaiCard = lazy(() => import('./content/CompaiCard'));

// Compai (Figma 282:1295, 536 × 410.204071): the Rive hero animation's Timeline 1, 15s
// long, played over a 12.01s loop (compai/settings.json's saved timeline; its ease
// [0,0,0,0] is linear), at Scale 0.89 (settings.json's saved Rive.Scale) — the values
// tuned in Motion Lab, replayed here without its lab UI. `@rive-app/react-canvas` and the
// .riv file only load once this mounts (lazy + near-view).
export default function LiveCompaiCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, eager);
  const position = useLoopClock(12.01, live, 0, 15);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {live && (
          <Suspense fallback={null}>
            <CompaiCard position={position} values={{ Rive: { Scale: 0.89 } }} />
          </Suspense>
        )}
      </SceneFit>
    </div>
  );
}
