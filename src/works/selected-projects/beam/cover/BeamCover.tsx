import { useEffect, useRef } from 'react';
import SceneFit from '../../../../components/motion/SceneFit';
import { cancelMotionFrame, frameDue, requestMotionFrame } from '../../../../components/motion/frameRate';
import { useNearView } from '../../../../components/motion/useNearView';
import { BeamMark } from '../BeamMark';
import { buildDotField, FIELD_DECAY_MS, FIELD_PROPAGATION_MS, FIELD_REACH, laserReactionAt, receptionResponse } from '../dotField';
import styles from './BeamCover.module.css';

// The Beam cover (Figma Portfolio-2026 248:3595, 806 × 706), in code: Motion Lab's
// beam-content/motion-cover, which is motion 1's settled solution scene cropped — its dot
// field, logo disc and Beam mark at the cover's scale, with the field rippling each time
// motion 1's laser would pass Beam (the cover draws no laser; the field keeps its clock).
// The values are the lab's saved ones (motion-cover/settings.json).

/** Motion 1's `--laser-cycle` and `--laser-travel`. */
const LASER_CYCLE_MS = 1150;
const LASER_TRAVEL = 0.74;
/** Where the field starts to sense the laser: halfway between the source card's edge on the rail and Beam. */
const CARD_RAIL = (10.017 + 23.701 - 26.18) / 46.927;
const TRIGGER_RAIL = (CARD_RAIL + 0.5) / 2;
/** The field's canvas box: 28cqw at the cover's scale. */
const FIELD_PX = 1030;
/** The lab's saved playback rate: the ripple's speed. */
const PLAYBACK_RATE = 0.8;
/** The lab's saved particle settings (its Particles dials). */
const PARTICLES = { Spacing: 8, Empty: 0.42, MinSize: 2, MaxSize: 4, SmallBias: 1.6, ShadeMin: 0.06, ShadeMax: 0.46, Ripple: 0.8 };

const DOTS = (() => {
  const p = PARTICLES;
  const min = Math.min(p.MinSize, p.MaxSize);
  const steps = Math.max(1, Math.floor(Math.abs(p.MaxSize - p.MinSize)) + 1);
  return buildDotField({
    size: FIELD_PX,
    pitch: Math.max(2, p.Spacing),
    skip: Math.min(0.98, Math.max(0, p.Empty)),
    // Whole-pixel steps from MinSize to MaxSize; SmallBias > 1 favours the small end.
    dotSize: random => min + Math.min(steps - 1, Math.floor(Math.pow(random(), p.SmallBias) * steps)),
    glow: random => p.ShadeMin + random() * Math.max(0, p.ShadeMax - p.ShadeMin),
  });
})();

// Motion 1's field in its settled state: resting dots, plus the reception ripple each time
// the laser passes Beam. The resting field is drawn once and kept as an image; each frame
// of a ripple draws that image and, over it, only the dots the ripple is touching, each
// at the opacity that brings it to the lab's colour (so the result matches drawing every
// dot anew). Between ripples nothing is drawn. The clock runs only while the cover is live
// (useNearView: near the screen, not covered, and its Works tab showing); reduced motion
// keeps the field at rest.
/** The dots' indexes, nearest the centre first, and the first of them at least `distance` out. */
const BY_DISTANCE = DOTS.map((_, index) => index).sort((a, b) => DOTS[a].distance - DOTS[b].distance);
function firstAtLeast(distance: number) {
  let low = 0;
  let high = BY_DISTANCE.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (DOTS[BY_DISTANCE[middle]].distance < distance) low = middle + 1;
    else high = middle;
  }
  return low;
}

function DotField() {
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useNearView(wrapper, false, 'focus');
  const drawRef = useRef<{ resize: () => void; rest: () => void; ripple: (clock: number) => boolean } | null>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;

    // The bitmap matches the canvas's layout size at the screen's density (at least 2×).
    // Each square is centred on its grid point, with an even side in device pixels, so it
    // lands on whole pixels and stays crisp at any size.
    let bitmap = 0;
    let unit = 1;
    const resting = document.createElement('canvas');
    const restingContext = resting.getContext('2d')!;
    const restAlpha = new Float32Array(DOTS.length);
    const place = (dot: (typeof DOTS)[number]) => {
      const side = Math.max(2, 2 * Math.round((dot.size * unit) / 2));
      return [Math.round(dot.x * unit) - side / 2, Math.round(dot.y * unit) - side / 2, side] as const;
    };
    const resize = () => {
      const size = Math.ceil(element.getBoundingClientRect().width * Math.max(2, window.devicePixelRatio || 1));
      if (!size || size === bitmap) return false;
      bitmap = size;
      element.width = element.height = resting.width = resting.height = size;
      unit = size / FIELD_PX;
      restingContext.clearRect(0, 0, size, size);
      DOTS.forEach((dot, index) => {
        const alpha = dot.glow * dot.falloff;
        restAlpha[index] = alpha < 0.012 ? 0 : Math.min(0.72, alpha);
        if (!restAlpha[index]) return;
        const [x, y, side] = place(dot);
        restingContext.fillStyle = `rgba(10, 10, 10, ${restAlpha[index].toFixed(3)})`;
        restingContext.fillRect(x, y, side, side);
      });
      return true;
    };
    const rest = () => {
      context.clearRect(0, 0, bitmap, bitmap);
      context.drawImage(resting, 0, 0);
    };
    // One frame of the ripple; false when there's no ripple at this moment. The ripple is a
    // ring: a dot responds only while the front has reached it and not yet decayed there, so
    // only the dots whose distance falls in that band (found in the distance-sorted list)
    // are looked at.
    const ripple = (clock: number) => {
      const reaction = laserReactionAt(clock, LASER_CYCLE_MS, LASER_TRAVEL, TRIGGER_RAIL);
      if (!reaction) return false;
      rest();
      const outer = (reaction.since / FIELD_PROPAGATION_MS) * FIELD_REACH;
      const inner = ((reaction.since - FIELD_DECAY_MS) / FIELD_PROPAGATION_MS) * FIELD_REACH;
      for (let at = firstAtLeast(inner); at < BY_DISTANCE.length && DOTS[BY_DISTANCE[at]].distance <= outer; at++) {
        const index = BY_DISTANCE[at];
        const dot = DOTS[index];
        const response = receptionResponse(dot.distance, reaction.since, reaction.impact);
        if (response <= 0) continue;
        const alpha = (dot.glow + response * PARTICLES.Ripple) * dot.falloff;
        const target = alpha < 0.012 ? 0 : Math.min(0.72, alpha);
        const under = restAlpha[index];
        if (target <= under) continue;
        const [x, y, side] = place(dot);
        // Over the resting dot (alpha `under`), this alpha composites to `target`.
        context.fillStyle = `rgba(10, 10, 10, ${((target - under) / (1 - under)).toFixed(3)})`;
        context.fillRect(x, y, side, side);
      }
      return true;
    };
    drawRef.current = { resize, rest, ripple };
    const refresh = () => {
      // A page-class change with unchanged geometry must not reset the ripple.
      if (resize() && !ripple(clock.current)) rest();
    };
    // SceneFit changes a parent transform, which does not resize the canvas's CSS box.
    let resizeFrame = 0;
    const scheduleRefresh = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(refresh);
    };
    const pageState = new MutationObserver(scheduleRefresh);
    pageState.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const stage = element.closest('.scene-fit-stage');
    const fit = new MutationObserver(refresh);
    if (stage) fit.observe(stage, { attributes: true, attributeFilter: ['style'] });
    refresh();
    window.addEventListener('resize', refresh);
    const sizes = new ResizeObserver(refresh);
    sizes.observe(element);
    return () => { sizes.disconnect(); fit.disconnect(); pageState.disconnect(); cancelAnimationFrame(resizeFrame); window.removeEventListener('resize', refresh); drawRef.current = null; };
  }, []);

  // The laser clock, advanced only while the cover is live.
  const clock = useRef(0);
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || !live || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = 0;
    let rippling = false;
    let lastDrawn = 0;
    let frame = requestMotionFrame(function tick(now) {
      if (last) clock.current += (now - last) * PLAYBACK_RATE;
      last = now;
      if (!frameDue(now, lastDrawn)) { frame = requestMotionFrame(tick); return; }
      lastDrawn = now;
      const drawn = draw.ripple(clock.current);
      if (!drawn && rippling) draw.rest();
      rippling = drawn;
      frame = requestMotionFrame(tick);
    });
    return () => cancelMotionFrame(frame);
  }, [live]);

  return <div ref={wrapper} className={styles.dotField} aria-hidden="true"><canvas ref={canvas} className={styles.dotCanvas} width={FIELD_PX} height={FIELD_PX} /></div>;
}

/** The cover at its design size (806 × 706). */
export function BeamCoverScene() {
  return (
    <div className={styles.frame}>
      <div className={`${styles.rule} ${styles.ruleAcross}`} style={{ top: 177.83 }} />
      <div className={`${styles.rule} ${styles.ruleAcross}`} style={{ top: 549.09 }} />
      <div className={`${styles.rule} ${styles.ruleDown}`} style={{ left: 82 }} />
      <div className={`${styles.rule} ${styles.ruleDown}`} style={{ left: 723.648 }} />
      {/* The field fades out well before the frame edges; the disc stays sharp above it. */}
      <div className={styles.fieldFade}>
        <div className={styles.scene}><DotField /></div>
      </div>
      <div className={styles.scene}>
        <div className={styles.solutionScene}>
          <div className={styles.logoDisc}><BeamMark className={styles.logo} /></div>
        </div>
      </div>
    </div>
  );
}

/** The cover scaled to cover its box, cropped and centred (the Beam page and its Works card). */
export default function BeamCover() {
  return <SceneFit width={806} height={706}><BeamCoverScene /></SceneFit>;
}
