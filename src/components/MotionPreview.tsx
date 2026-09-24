import { useEffect, useRef, useState } from 'react';
import { useNearView } from './useNearView';

// A Motion Lab frame from the shared motion bundle (public/motions/, built by
// `npm run sync:motions`), by id (e.g. bifrost/01), and the size it was built at.
export interface MotionScene {
  id: string;
  width: number;
  height: number;
  title: string;
}

type MotionBundle = {
  mount: (container: Element, id: string) => { ready: Promise<void>; unmount: () => void };
  stylesheet: string;
  warm: () => Promise<void>;
};

// Loaded once for the whole site; every motion shares its React and Rive runtime. A
// full URL built at runtime, so neither the site's build nor Vite's dev server rewrites
// it (in dev a bare "/…" import gets ?import appended and returns a URL stub instead).
const BUNDLE_URL = '/motions/motions.js';
let bundle: Promise<MotionBundle> | null = null;
const loadBundle = () => (bundle ??= import(/* @vite-ignore */ new URL(BUNDLE_URL, window.location.href).href) as Promise<MotionBundle>);

// On a page that shows motions, fetch the bundle and the Rive runtime once it's idle,
// so the first motion to come into view doesn't wait for them (or compile them
// mid-scroll). Pages without motions (About) never load them.
let warmed = false;
function warmWhenIdle() {
  if (warmed) return;
  warmed = true;
  const warm = () => loadBundle().then(motions => motions.warm()).catch(() => {});
  if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 3000 });
  else setTimeout(warm, 1500);
}

// Inside the shadow root: the site's inherited text styles (font, colour, tracking)
// reset to the browser defaults, as the motion had in its own page. Visibility still
// inherits, so hiding the card (the project transition lifts its image) hides it.
const HOST_RESET = ':host { all: initial; visibility: inherit; }';

// The motion keeps its original frame size and animation logic; only its display size
// changes to fill the box:
// - `fill` stretches it to the exact box. For boxes with the motion's own ratio, where
//   Motion Lab frames differ by a fraction of a pixel (e.g. 557 vs 556.7 tall) and fitting
//   would leave a hairline of background at one edge. The distortion is well under 0.1%.
// - `cover` scales it uniformly to cover the box and crops the overflow, centred. For
//   boxes whose ratio changes with the layout, such as the Works cards.
// It mounts into the page inside a shadow root (so the site's CSS can't reach it) only
// while near the screen and not covered (useNearView). `eager` keeps it mounted from the
// start: for covers that must paint during a project transition.
export default function MotionPreview({ scene, fit = 'fill', eager = false }: { scene: MotionScene; fit?: 'fill' | 'cover'; eager?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('none');
  const live = useNearView(viewportRef, eager);

  useEffect(warmWhenIdle, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const x = width / scene.width;
      const y = height / scene.height;
      if (fit === 'fill') {
        setTransform(`scale(${x}, ${y})`);
        return;
      }
      const scale = Math.max(x, y);
      const left = (width - scene.width * scale) / 2;
      const top = (height - scene.height * scale) / 2;
      setTransform(`translate(${left}px, ${top}px) scale(${scale})`);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fit, scene.height, scene.width]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !live) return;
    const shadow = stage.shadowRoot ?? stage.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    let motion: ReturnType<MotionBundle['mount']> | undefined;
    let cancelled = false;
    loadBundle().then(motions => {
      if (cancelled) return;
      if (!shadow.querySelector('style')) {
        const reset = document.createElement('style');
        reset.textContent = HOST_RESET;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = motions.stylesheet;
        shadow.append(reset, link);
      }
      shadow.append(container);
      motion = motions.mount(container, scene.id);
    }).catch(() => {});
    return () => {
      cancelled = true;
      motion?.unmount();
      container.remove();
    };
  }, [live, scene.id]);

  return (
    <div className="motion-preview" ref={viewportRef}>
      <div className="motion-preview-stage" ref={stageRef} role="img" aria-label={scene.title} style={{ width: scene.width, height: scene.height, transform }} />
    </div>
  );
}
