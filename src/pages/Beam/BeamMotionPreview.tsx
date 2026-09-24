import { useEffect, useRef, useState } from 'react';
import { useNearView } from '../../components/useNearView';

const scenes = {
  1: { width: 1200, height: 756, title: 'Beam Problem to Solution motion', page: 'beam-problem-solution.html', mode: 'loop' },
  2: { width: 1500, height: 895, title: 'Beam Secrets motion', page: 'beam-secrets.html', mode: 'loop' },
  3: { width: 1500, height: 865, title: 'Beam Hero motion', page: 'beam-hero.html', mode: 'demo' },
  5: { width: 1340, height: 836, title: 'Beam Footer motion', page: 'beam-footer.html', mode: 'loop' },
  6: { width: 1200, height: 744, title: 'Beam On Demand motion', page: 'beam-on-demand.html', mode: 'loop' },
} as const;

// The exported Motion Lab scene keeps its original viewport and animation logic.
// Only the iframe's display size changes to fit the Beam gallery frame. These are full
// Motion Lab pages (not in the shared motion bundle), so each stays an iframe, loaded
// only while near the screen and removed once it's far away (useNearView).
export default function BeamMotionPreview({ motion }: { motion: 1 | 2 | 3 | 5 | 6 }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scene = scenes[motion];
  const live = useNearView(viewportRef);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / scene.width, height / scene.height));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scene.height, scene.width]);

  return (
    <div className="beam-motion-preview" ref={viewportRef}>
      {live && (
        <iframe
          title={scene.title}
          src={`/motion-0${motion}/${scene.page}?mode=${scene.mode}`}
          style={{ width: scene.width, height: scene.height, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
