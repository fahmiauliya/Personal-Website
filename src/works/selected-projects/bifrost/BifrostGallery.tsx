import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type CSSProperties, type LazyExoticComponent } from 'react';
import SceneFit from '../../../components/motion/SceneFit';
import { useNearView } from '../../../components/motion/useNearView';
import { motionLayout, motionSlots, type MotionId, type MotionSlot } from './bifrostMotions';

// Every motion is code, ported from Motion Lab (no Rive player, no font). Each is its own chunk,
// fetched once its slot comes near the screen and kept after that; each pauses its own animation
// when it's far away.
const coded: Record<MotionId, LazyExoticComponent<ComponentType>> = {
  'motion-01': lazy(() => import('./content-01/Benchmark')),
  'motion-02': lazy(() => import('./content-02/Hero')),
  'motion-03': lazy(() => import('./content-03/HeroBackdrop')),
  'motion-04': lazy(() => import('./content-04/SocialPosts')),
  'motion-05': lazy(() => import('./content-05/Features')),
  'motion-06': lazy(() => import('./content-06/Banner')),
  'motion-07': lazy(() => import('./content-07/Enterprise')),
  'motion-08': lazy(() => import('./content-08/Governance')),
  'motion-09': lazy(() => import('./content-09/Carousel')),
  'motion-10': lazy(() => import('./content-10/Architecture')),
  'motion-11': lazy(() => import('./content-11/DropIn')),
  'motion-12': lazy(() => import('./content-12/BinaryWaves')),
  'motion-13': lazy(() => import('./content-13/Guardrails')),
};

function CodedMotion({ slot, Motion }: { slot: MotionSlot; Motion: LazyExoticComponent<ComponentType> }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearView(ref);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (near) setLoaded(true); }, [near]);
  return (
    <div className="bifrost-motion-stage" ref={ref} role="img" aria-label={slot.motion.title}>
      {loaded && <Suspense fallback={null}><SceneFit width={slot.motion.width} height={slot.motion.height} fill><Motion /></SceneFit></Suspense>}
    </div>
  );
}

function MotionFrame({ id }: { id: MotionId }) {
  const slot = motionSlots[id];
  return (
    <figure
      id={`p2-${id}`}
      className="bifrost-motion"
      data-figma-label={slot.figmaLabel}
      style={{ '--frame-width': slot.width, '--frame-ratio': `${slot.width} / ${slot.height}`, background: slot.background } as CSSProperties}
    >
      <CodedMotion slot={slot} Motion={coded[id]} />
    </figure>
  );
}

export default function BifrostGallery() {
  return (
    <section className="bifrost-gallery" aria-label="Bifrost motion gallery">
      <div className="bifrost-gallery-rows">
        {motionLayout.map((columns, row) => (
          <div className="bifrost-gallery-row" key={row}>
            {columns.map(stack => (
              <div className="bifrost-gallery-column" key={stack[0]}>
                {stack.map(id => <MotionFrame key={id} id={id} />)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
