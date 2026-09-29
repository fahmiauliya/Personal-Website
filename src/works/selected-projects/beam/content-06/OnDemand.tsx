import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { OnDemandVisual1, OnDemandVisual2, OnDemandVisual3 } from './Visuals';
import { CounterSamples, T } from './text';
import ondemandInstant from './assets/ondemand-instant.svg';
import ondemandLoad from './assets/ondemand-load.svg';
import ondemandRepos from './assets/ondemand-repos.svg';
import './OnDemand.css';

// Content 06: Beam's "On demand files" section (Motion Lab beam-content/motion-06), in code,
// at the size the gallery showed its export at (1200 × 744, the desktop layout) and in its
// loop: each of the three points is shown in turn (the lab's saved timeline, ~15.7s), its
// visual and description crossfading in. The lab animates those with framer-motion; the same
// transitions here are the browser's own (0.5s, cubic-bezier(.25, .1, .25, 1)): the visual
// rises out of a 6px blur, the description opens to its line. The loop runs while the section
// is on screen. It's a picture of the page (inert). Text is outlines (./text).

const ITEMS: { key: string; title: string; description: string; icon: string; Visual: ComponentType }[] = [
  { key: 'instant', title: 'Everything appears instantly', description: 'See the full directory without downloading every file first.', icon: ondemandInstant, Visual: OnDemandVisual1 },
  { key: 'load', title: 'Contents load on demand', description: 'Open a file and Beam fetches its contents when needed.', icon: ondemandLoad, Visual: OnDemandVisual2 },
  { key: 'repos', title: 'Built for huge repos', description: 'Mount large monorepos without filling your local disk.', icon: ondemandRepos, Visual: OnDemandVisual3 },
];

// The lab's saved timeline (settings.json): a position that steps 0 → 1 → 2 → 3, each held
// about 5s; positions from 0.5, 1.5 and 2.5 show items 1, 2 and 0.
const STEPS = [
  { duration: 4.96, to: 0, ease: [0.63, 0.02, 0.3, 0.99] },
  { duration: 0.05, to: 1, ease: [0, 0.64, 0.25, 1] },
  { duration: 5.05, to: 1, ease: [0, 0, 1, 1] },
  { duration: 0.08, to: 2, ease: [0.25, 0.1, 0.25, 1] },
  { duration: 5.05, to: 2, ease: [0.8, 0.02, 0.18, 0.96] },
  { duration: 0.48, to: 3, ease: [0.25, 0.1, 0.25, 1] },
] as const;
const TOTAL = STEPS.reduce((total, step) => total + step.duration, 0);

function bezier(t: number, first: number, second: number) {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * first + 3 * inverse * t * t * second + t * t * t;
}
function eased(progress: number, ease: readonly number[]) {
  let lower = 0;
  let upper = 1;
  for (let index = 0; index < 12; index += 1) {
    const middle = (lower + upper) / 2;
    if (bezier(middle, ease[0], ease[2]) < progress) lower = middle;
    else upper = middle;
  }
  return bezier((lower + upper) / 2, ease[1], ease[3]);
}
function indexAt(seconds: number) {
  let remaining = ((seconds % TOTAL) + TOTAL) % TOTAL;
  let from = 0;
  let position = 0;
  for (const step of STEPS) {
    if (remaining <= step.duration) {
      position = from + (step.to - from) * eased(remaining / step.duration, step.ease);
      break;
    }
    remaining -= step.duration;
    from = step.to;
  }
  return position >= 2.5 ? 0 : position >= 1.5 ? 2 : position >= 0.5 ? 1 : 0;
}

const EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A visual: mounted when its item becomes active, fading in (except the first, shown at once,
 * as the lab's does); the same instance fades out as the next arrives, still showing where its
 * own animation got to.
 */
function VisualLayer({ index, leaving, appear, onLeft }: { index: number; leaving: boolean; appear: boolean; onLeft: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const appears = useRef(appear).current;
  useLayoutEffect(() => {
    const layer = ref.current;
    if (!layer || reduced()) return;
    if (!leaving) {
      if (!appears) return;
      layer.animate([{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: 500, easing: EASE });
      return;
    }
    const exit = layer.animate([{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: 'translateY(-10px)', filter: 'blur(6px)' }], { duration: 500, easing: EASE, fill: 'forwards' });
    exit.onfinish = onLeft;
    return () => exit.cancel();
  }, [leaving, appears, onLeft]);
  useEffect(() => { if (leaving && reduced()) onLeft(); }, [leaving, onLeft]);
  const { Visual } = ITEMS[index];
  return <div ref={ref} className="beam-od-visual-layer"><div className="beam-od-visual-slot"><Visual /></div></div>;
}

/** A description: opens to its line as its item becomes active, closes as it leaves. */
function Description({ active, text, k }: { active: boolean; text: string; k: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (first.current || reduced()) {
      first.current = false;
      element.style.height = active ? '20px' : '0px';
      element.style.opacity = active ? '1' : '0';
      return;
    }
    const shown = { height: '20px', opacity: 1, transform: 'none', filter: 'blur(0px)' };
    const keyframes = active
      ? [{ height: '0px', opacity: 0, transform: 'translateY(8px)', filter: 'blur(4px)' }, shown]
      : [shown, { height: '0px', opacity: 0, transform: 'translateY(-8px)', filter: 'blur(4px)' }];
    element.style.height = active ? '20px' : '0px';
    element.style.opacity = active ? '1' : '0';
    const animation = element.animate(keyframes, { duration: 500, easing: EASE });
    return () => animation.cancel();
  }, [active]);
  return <div ref={ref} className="beam-od-description"><T k={k}>{text}</T></div>;
}

export default function OnDemand() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const previousRef = useRef(0);
  const firstVisualRef = useRef(true);
  const clearLeaving = useCallback(() => setLeavingIndex(null), []);
  useEffect(() => { firstVisualRef.current = false; }, []);
  const layers = leavingIndex !== null && leavingIndex !== activeIndex ? [leavingIndex, activeIndex] : [activeIndex];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // As in the lab, the points keep stepping under reduced motion; only the transitions go.
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let inView = false;
    const tick = (now: number) => {
      if (last) elapsed += Math.min(100, now - last);
      last = now;
      const index = indexAt(elapsed / 1000);
      if (index !== previousRef.current) {
        setLeavingIndex(previousRef.current);
        previousRef.current = index;
        setActiveIndex(index);
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = inView && !document.hidden;
      if (run && !frame) { last = 0; frame = requestAnimationFrame(tick); }
      else if (!run && frame) { cancelAnimationFrame(frame); frame = 0; }
    };
    const observer = new IntersectionObserver(([entry]) => { inView = Boolean(entry?.isIntersecting); sync(); }, { threshold: 0.08 });
    observer.observe(section);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={sectionRef} className="beam-on-demand" inert>
      <div className="beam-od-text">
        <div className="beam-od-header">
          <div className="beam-od-label"><T k="label">On demand files</T></div>
          <h2><T k="title">The whole tree, a fraction of the disk</T></h2>
          <p><T k="lede">{'Beam keeps lightweight refs to every file and downloads contents only\nwhen something actually reads them. You conserve disk space\non laptops and small sandboxes, while the full file\nsystem stays browsable and searchable.'}</T></p>
        </div>
        <div className="beam-od-list">
          {ITEMS.map((item, index) => (
            <div key={item.key} className="beam-od-item">
              {index < ITEMS.length - 1 && (
                <div className="beam-od-rail" aria-hidden="true"><span style={{ transform: `scaleY(${activeIndex > index ? 1 : 0})` }} /></div>
              )}
              <div className="beam-od-icon"><img src={item.icon} alt="" width={12} height={12} style={{ opacity: index <= activeIndex ? 1 : 0.55 }} /></div>
              <div className="beam-od-item-text">
                <div className="beam-od-title" style={{ color: index <= activeIndex ? '#0a0a0a' : '#8f8f8f' }}><T k={`title:${item.key}`}>{item.title}</T></div>
                <Description active={index === activeIndex} text={item.description} k={`description:${item.key}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="beam-od-visual-area">
        <div className="beam-od-visual">
          {layers.map(index => (
            <VisualLayer key={`visual-${index}`} index={index} leaving={index !== activeIndex} appear={!firstVisualRef.current} onLeft={clearLeaving} />
          ))}
        </div>
      </div>
      <CounterSamples />
    </section>
  );
}
