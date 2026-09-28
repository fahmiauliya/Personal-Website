import { useEffect, useId, useRef, type RefObject } from 'react';
import type { FoilRenderer } from './capabilityFoil';

const contourLines = Array.from({ length: 31 }, (_, index) => {
  const y = -54 + index * 9;
  return `M -38 ${y} C -3 ${y - 22} 25 ${y - 30} 54 ${y - 9} C 82 ${y + 14} 104 ${y + 25} 130 ${y + 6} C 154 ${y - 13} 180 ${y - 29} 228 ${y - 6}`;
});

function TopographicPattern({ variant, gradientId, gradientRef, spatialMaskId }: {
  variant: 'neutral' | 'structure' | 'holographic' | 'specular';
  gradientId?: string;
  spatialMaskId?: string;
  gradientRef?: RefObject<SVGLinearGradientElement | null>;
}) {
  return (
    <svg
      className={`capability-card__pattern capability-card__pattern--${variant}`}
      viewBox="0 0 190 165"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {variant === 'holographic' && (
        <defs>
          <linearGradient ref={gradientRef} id={gradientId} gradientUnits="userSpaceOnUse" x1="44" y1="58" x2="146" y2="107">
            <stop offset="0%" stopColor="#69dfe2" />
            <stop offset="20%" stopColor="#73a8f8" />
            <stop offset="39%" stopColor="#a99bf6" />
            <stop offset="57%" stopColor="#efacd7" />
            <stop offset="76%" stopColor="#a9e4c8" />
            <stop offset="100%" stopColor="#efd99b" />
          </linearGradient>
        </defs>
      )}
      <g mask={spatialMaskId ? `url(#${spatialMaskId})` : undefined} stroke={variant === 'holographic' ? `url(#${gradientId})` : undefined}
        transform={variant === 'specular' ? 'translate(0 -.35)' : undefined}>
        {contourLines.map((path, index) => <path key={index} d={path} />)}
      </g>
    </svg>
  );
}

export default function CapabilityCard({ title }: { title: string }) {
  const cardRef = useRef<HTMLLIElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const hotspotRef = useRef<SVGRadialGradientElement>(null);
  const bridgeRefs = useRef<(SVGPathElement | null)[]>([]);
  const gradientId = `capability-spectrum-${useId().replace(/:/g, '')}`;
  const spatialMaskId = `${gradientId}-reveal`;

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let renderer: FoilRenderer | null = null;
    let attempted = false;
    let disposed = false;
    let frame: number | null = null;
    let lastFrame = 0;
    let active = false;
    let nearby = false;
    const board = card.closest('.capabilities-board');
    let current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let origin = { x: .5, y: .5 };
    const stages = ['edge', 'structure', 'material', 'texture', 'reflection'] as const;
    const levels = { edge: 0, structure: 0, material: 0, texture: 0, reflection: 0 };
    type Track = { start: number; from: number; to: number; duration: number };
    const tracks: Record<typeof stages[number], Track> = {
      edge: { start: 0, from: 0, to: 0, duration: 0 },
      texture: { start: 0, from: 0, to: 0, duration: 0 },
      structure: { start: 0, from: 0, to: 0, duration: 0 },
      material: { start: 0, from: 0, to: 0, duration: 0 },
      reflection: { start: 0, from: 0, to: 0, duration: 0 },
    };
    let bounds = card.getBoundingClientRect();
    let client = { x: 0, y: 0 };
    const defaults = {
      'cursor-smoothing': 85, 'holographic-saturation': .78,
      'reflection-width': .032, 'reflection-angle': 22,
      'edge-glow': 1.15, 'right-edge-intensity': 1,
      'edge-in': 110, 'structure-delay': 80, 'structure-in': 220,
      'material-delay': 240, 'material-in': 500, 'texture-delay': 320, 'texture-in': 480,
      'reflection-delay': 640, 'reflection-in': 360,
      'reflection-fade-out': 180, 'color-fade-out': 340,
      'texture-fade-out': 400, 'pattern-fade-out': 480, 'edge-fade-out': 580,
    };
    let settings = { ...defaults };
    const readSettings = () => {
      const style = getComputedStyle(card);
      for (const name of Object.keys(defaults) as (keyof typeof defaults)[]) {
        const value = parseFloat(style.getPropertyValue(`--capability-${name}`));
        settings[name] = Number.isFinite(value) ? value : defaults[name];
      }
    };
    const paint = () => {
      const width = canvas.clientWidth || 190;
      const height = canvas.clientHeight || 165;
      const x = Math.max(-.15, Math.min(1.15, current.x / width));
      const y = Math.max(-.15, Math.min(1.15, current.y / height));
      card.style.setProperty('--capability-pointer-x', `${current.x.toFixed(2)}px`);
      card.style.setProperty('--capability-pointer-y', `${current.y.toFixed(2)}px`);
      // Compact, overlapping masks keep the light local, including on SVG ridges.
      const distances = [x * width, (1 - x) * width, y * height, (1 - y) * height];
      const nearest = Math.min(...distances);
      const weights = distances.map(distance => Math.exp(-(distance - nearest) / 8));
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      const px = Math.max(0, Math.min(1, x)) * 190;
      const py = Math.max(0, Math.min(1, y)) * 165;
      hotspotRef.current?.setAttribute('gradientTransform', `translate(${px} ${py}) scale(57 59.4)`);
      const anchors = [[0, py], [190, py], [px, 0], [px, 165]];
      anchors.forEach(([ax, ay], index) => {
        const weight = weights[index] / total;
        card.style.setProperty(`--capability-edge-${index}`, weight.toFixed(4));
        // Four separate soft corridors avoid pulling a blended edge into the card.
        bridgeRefs.current[index]?.setAttribute('d', `M ${ax} ${ay} Q ${(ax + px) / 2} ${(ay + py) / 2 + (index < 2 ? (px - ax) * .06 : 0)} ${px} ${py}`);
        bridgeRefs.current[index]?.setAttribute('opacity', (weight * .30).toFixed(4));
      });
      // Also drive the inexpensive fallback and the light caught on the ridges.
      card.style.setProperty('--capability-light-position', `${(100 * x + 7.5 * (1 - levels.reflection)).toFixed(2)}%`);
      card.style.setProperty('--capability-light-angle', `${(90 - settings['reflection-angle'] - (y - .5) * 7).toFixed(2)}deg`);
      card.style.setProperty('--capability-light-width', `${(settings['reflection-width'] * 100).toFixed(2)}%`);
      for (const stage of stages) card.style.setProperty(`--capability-${stage}-level`, levels[stage].toFixed(4));
      // Transient masks only: at level 1 every contour is fully restored.
      card.style.setProperty('--capability-structure-front', `${(-18 + levels.structure * 140).toFixed(2)}%`);
      card.style.setProperty('--capability-material-front', `${(-18 + levels.material * 140).toFixed(2)}%`);
      gradientRef.current?.setAttribute('gradientTransform', `translate(${(x - .5) * 26} ${(y - .5) * 12})`);
      renderer?.draw({
        width, height, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)),
        originX: origin.x, originY: origin.y,
        structure: levels.structure, texture: levels.texture,
        material: levels.material, reflection: levels.reflection, edge: levels.edge,
        edgeGlow: settings['edge-glow'], edgeIntensity: settings['right-edge-intensity'],
        saturation: settings['holographic-saturation'], reflectionWidth: settings['reflection-width'],
        angle: settings['reflection-angle'],
      });
    };
    const tick = (now: number) => {
      frame = null;
      const elapsed = lastFrame ? Math.min(now - lastFrame, 40) : 1000 / 60;
      lastFrame = now;
      const easing = motionQuery.matches ? 1 : 1 - Math.exp(-elapsed / Math.max(1, settings['cursor-smoothing']));
      current.x += (target.x - current.x) * easing;
      current.y += (target.y - current.y) * easing;
      const remaining = Math.hypot(target.x - current.x, target.y - current.y);
      if (remaining < .08) current = { ...target };
      let transitioning = false;
      for (const stage of stages) {
        const track = tracks[stage];
        const progress = motionQuery.matches || !track.duration ? 1
          : Math.max(0, Math.min(1, (now - track.start) / track.duration));
        const eased = progress * progress * (3 - 2 * progress);
        levels[stage] = track.from + (track.to - track.from) * eased;
        if (progress < 1) transitioning = true;
      }
      paint();
      if (((active || nearby) && remaining >= .08) || transitioning) frame = requestAnimationFrame(tick);
      else lastFrame = 0;
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(tick); };
    const transition = (to: number, keepEdge = false) => {
      const now = performance.now();
      const entering = {
        edge: { delay: 0, duration: settings['edge-in'] },
        structure: { delay: settings['structure-delay'], duration: settings['structure-in'] },
        material: { delay: settings['material-delay'], duration: settings['material-in'] },
        texture: { delay: settings['texture-delay'], duration: settings['texture-in'] },
        reflection: { delay: settings['reflection-delay'], duration: settings['reflection-in'] },
      };
      const leaving = {
        edge: settings['edge-fade-out'], structure: settings['pattern-fade-out'],
        material: settings['color-fade-out'], texture: settings['texture-fade-out'],
        reflection: settings['reflection-fade-out'],
      };
      for (const stage of stages) {
        const destination = stage === 'edge' && keepEdge ? 1 : to;
        const from = levels[stage];
        const delay = destination && from === 0 ? entering[stage].delay : 0;
        tracks[stage] = {
          from, to: destination, start: now + delay,
          duration: (destination ? entering[stage].duration : leaving[stage]) * Math.abs(destination - from),
        };
      }
      schedule();
    };
    const rendererFailed = () => {
      if (disposed) return;
      renderer?.dispose();
      renderer = null;
      card.dataset.foilRenderer = 'fallback';
    };
    const ensureRenderer = () => {
      if (attempted || !hoverQuery.matches) return;
      attempted = true;
      // Keep WebGPU and shader compilation out of the initial page bundle.
      void import('./capabilityFoil').then(({ createCapabilityFoil }) => {
        if (disposed) return;
        const next = createCapabilityFoil(canvas, rendererFailed);
        renderer = next;
        paint();
        return next.ready.then(() => {
          if (disposed || renderer !== next) return;
          card.dataset.foilRenderer = 'webgpu';
          paint();
        });
      }).catch(rendererFailed);
    };
    // Warm the pipeline shortly before the card becomes visible, without a render loop.
    const visibility = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        ensureRenderer();
        visibility.disconnect();
      }
    }, { rootMargin: '120px' });
    visibility.observe(card);
    const insideCard = (x: number, y: number) =>
      x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    const withinEdgeBand = (x: number, y: number) =>
      x >= bounds.left - 16 && x <= bounds.right + 16 && y >= bounds.top - 16 && y <= bounds.bottom + 16;
    const point = (event: PointerEvent) => ({
      x: event.clientX - bounds.left - card.clientLeft,
      y: event.clientY - bounds.top - card.clientTop,
    });
    const captureOrigin = () => {
      const x = Math.max(0, Math.min(1, target.x / (canvas.clientWidth || 190)));
      const y = Math.max(0, Math.min(1, target.y / (canvas.clientHeight || 165)));
      origin = { x, y };
      // Start the line reveal at the nearest entry edge, without moving any paths.
      const distances = [x, 1 - x, y, 1 - y];
      const angle = [90, 270, 180, 0][distances.indexOf(Math.min(...distances))];
      card.style.setProperty('--capability-entry-angle', `${angle}deg`);
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !hoverQuery.matches) return;
      bounds = card.getBoundingClientRect();
      readSettings();
      ensureRenderer();
      client = { x: event.clientX, y: event.clientY };
      target = point(event);
      if (levels.edge === 0 && levels.structure === 0) current = { ...target };
      // Preserve the spatial reveal on interrupted re-entry.
      if (levels.structure === 0 && levels.material === 0) captureOrigin();
      nearby = true;
      active = true;
      paint();
      card.dataset.holographicActive = 'true';
      transition(1);
    };
    const move = (event: PointerEvent) => {
      if (!active || event.pointerType !== 'mouse') return;
      client = { x: event.clientX, y: event.clientY };
      target = point(event);
      schedule();
    };
    const leave = (event: PointerEvent) => {
      if (!active) return;
      active = false;
      nearby = event.type !== 'pointercancel' && withinEdgeBand(event.clientX, event.clientY);
      target = { ...current };
      delete card.dataset.holographicActive;
      transition(0, nearby);
    };
    // This listener is scoped to the existing board; distant movement does no rendering.
    const proximity = (event: Event) => {
      const pointer = event as PointerEvent;
      if (active || pointer.pointerType !== 'mouse' || !hoverQuery.matches) return;
      if (pointer.type !== 'pointerleave' && insideCard(pointer.clientX, pointer.clientY)) {
        enter(pointer);
        return;
      }
      const close = pointer.type !== 'pointerleave' && withinEdgeBand(pointer.clientX, pointer.clientY);
      if (!close && !nearby) return;
      client = { x: pointer.clientX, y: pointer.clientY };
      if (close) {
        if (!nearby) {
          readSettings();
          ensureRenderer();
          if (levels.edge === 0 && levels.structure === 0) current = point(pointer);
          transition(0, true);
        }
        target = point(pointer);
      } else {
        target = { ...current };
        transition(0);
      }
      nearby = close;
      schedule();
    };
    const reset = () => {
      active = false;
      nearby = false;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastFrame = 0;
      for (const stage of stages) {
        levels[stage] = 0;
        tracks[stage] = { start: 0, from: 0, to: 0, duration: 0 };
        card.style.setProperty(`--capability-${stage}-level`, '0');
      }
      delete card.dataset.holographicActive;
    };
    const preferenceChange = () => {
      if (!hoverQuery.matches) reset();
      else if (active || nearby || frame !== null) { readSettings(); schedule(); }
    };
    const refreshBounds = () => {
      bounds = card.getBoundingClientRect();
      if ((active && !insideCard(client.x, client.y)) || (nearby && !withinEdgeBand(client.x, client.y))) {
        active = false;
        nearby = withinEdgeBand(client.x, client.y);
        target = { ...current };
        delete card.dataset.holographicActive;
        transition(0, nearby);
      } else if (active || nearby) {
        target = { x: client.x - bounds.left - card.clientLeft, y: client.y - bounds.top - card.clientTop };
        schedule();
      }
    };
    const visibilityChange = () => { if (document.hidden) reset(); };
    board?.addEventListener('pointermove', proximity, { passive: true });
    board?.addEventListener('pointerleave', proximity);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
    hoverQuery.addEventListener('change', preferenceChange);
    motionQuery.addEventListener('change', preferenceChange);
    window.addEventListener('scroll', refreshBounds, { passive: true, capture: true });
    window.addEventListener('resize', refreshBounds, { passive: true });
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', visibilityChange);

    return () => {
      disposed = true;
      visibility.disconnect();
      reset();
      renderer?.dispose();
      delete card.dataset.foilRenderer;
      board?.removeEventListener('pointermove', proximity);
      board?.removeEventListener('pointerleave', proximity);
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      card.removeEventListener('pointercancel', leave);
      hoverQuery.removeEventListener('change', preferenceChange);
      motionQuery.removeEventListener('change', preferenceChange);
      window.removeEventListener('scroll', refreshBounds, true);
      window.removeEventListener('resize', refreshBounds);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', visibilityChange);
    };
  }, []);

  return (
    <li ref={cardRef} className="capability-card capability-card--interactive">
      <svg className="capability-card__mask-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient ref={hotspotRef} id={`${spatialMaskId}-hotspot`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="35%" stopColor="#fff" stopOpacity=".96" />
            <stop offset="65%" stopColor="#fff" stopOpacity=".62" />
            <stop offset="85%" stopColor="#fff" stopOpacity=".20" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${spatialMaskId}-soft`} x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <mask id={spatialMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="190" height="165">
            <g filter={`url(#${spatialMaskId}-soft)`} fill="none" stroke="#fff" strokeWidth="30" strokeLinecap="round">
              {[0, 1, 2, 3].map(index => <path key={index} ref={node => { bridgeRefs.current[index] = node; }} />)}
            </g>
            <rect width="190" height="165" fill={`url(#${spatialMaskId}-hotspot)`} />
          </mask>
        </defs>
      </svg>
      <TopographicPattern variant="neutral" />
      <span className="capability-card__edge" aria-hidden="true" />
      <TopographicPattern variant="structure" spatialMaskId={spatialMaskId} />
      <span className="capability-card__sheen" aria-hidden="true" />
      <canvas ref={canvasRef} className="capability-card__material" aria-hidden="true" />
      <TopographicPattern variant="holographic" gradientId={gradientId} gradientRef={gradientRef} spatialMaskId={spatialMaskId} />
      <span className="capability-card__grain capability-card__grain--active" aria-hidden="true" />
      <TopographicPattern variant="specular" spatialMaskId={spatialMaskId} />
      <span className="capability-card__reflection" aria-hidden="true" />
      <span className="capability-card__title">{title}</span>
    </li>
  );
}
