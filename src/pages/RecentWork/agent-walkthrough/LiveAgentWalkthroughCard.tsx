import { lazy, Suspense, useRef } from 'react';
import SceneFit from '../../../components/SceneFit';
import { useNearView } from '../../../components/useNearView';

const AgentWalkthroughCard = lazy(() => import('./content/AgentWalkthroughCard'));

// Values from agent-walkthrough/settings.json (the background's saved dials; the orb's
// own dials come from agent-walkthrough/orb/settings.json, read directly by AgentOrb.tsx
// itself, so nothing needs passing through for it).
const BACKGROUND_VALUES = { Background: { Flow: 1.5, Band: 2.15, Grain: 0 } };

// Agent Walkthrough (Figma 285:43271, 536 × 410.204071): the animated shader background and
// the orb both run their own clock and pause off screen when `position` is left undefined
// (AnimatedBackground.tsx, useShaderCanvas.ts) — the lab's timeline only exists to scrub the
// preview. Unmounting on top of that (near-view) fully releases the WebGL contexts instead
// of only pausing them.
export default function LiveAgentWalkthroughCard({ eager = false }: { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, eager);
  return (
    <div className="recent-work-card-viewport" ref={ref}>
      <SceneFit width={536} height={410.2040710449219}>
        {live && <Suspense fallback={null}><AgentWalkthroughCard values={BACKGROUND_VALUES} /></Suspense>}
      </SceneFit>
    </div>
  );
}
