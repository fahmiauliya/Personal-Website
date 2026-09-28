import { useLayoutEffect } from 'react';

// Intro → Works handoff. Native scrolling still moves the Works surface
// (.foreground-layer) over the fixed intro; this adds two transform-only layers:
//
// - Weight: the surface trails the scroll position on a critically damped spring (no
//   bounce, like the navigation morph), capped at MAX_LAG_PX. The lag fades out as the
//   surface finishes covering the intro, so scrolling through the projects stays 1:1.
// - Depth: the intro recedes as it is covered (--intro-cover, 0 → 1), styled in CSS.
//
// Transforms are written straight to the elements each frame, never through React
// state, so nothing re-renders or reflows. Reduced motion keeps both layers static.
const SPRING_FREQUENCY = 9;
const MAX_LAG_PX = 40;
// The lag is full until the surface is this far through the handoff, then eases to 0.
const LAG_FADE_START = 0.8;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function useIntroCoverMotion() {
  useLayoutEffect(() => {
    const intro = document.querySelector<HTMLElement>('.intro-layer');
    const surface = document.querySelector<HTMLElement>('.foreground-layer');
    if (!intro || !surface) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let followed = window.scrollY;
    let velocity = 0;
    let frame = 0;
    let previousTime = 0;

    const write = (scroll: number, lag: number) => {
      const cover = clamp(scroll / Math.max(window.innerHeight, 1), 0, 1);
      const fade = 1 - clamp((cover - LAG_FADE_START) / (1 - LAG_FADE_START), 0, 1);
      const settle = fade * fade * (3 - 2 * fade);
      intro.style.setProperty('--intro-cover', cover.toFixed(4));
      const offset = clamp(lag, -MAX_LAG_PX, MAX_LAG_PX) * settle;
      surface.style.transform = Math.abs(offset) < 0.05 ? '' : `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const tick = (time: number) => {
      const dt = Math.min((time - previousTime) / 1000, 0.032);
      previousTime = time;
      const target = window.scrollY;
      const offset = followed - target;
      const impulse = velocity + SPRING_FREQUENCY * offset;
      const decay = Math.exp(-SPRING_FREQUENCY * dt);
      followed = target + (offset + impulse * dt) * decay;
      velocity = (velocity - SPRING_FREQUENCY * impulse * dt) * decay;
      // Keep the lag within its cap so a long jump (e.g. an anchor link) settles quickly.
      followed = clamp(followed, target - MAX_LAG_PX, target + MAX_LAG_PX);
      if (Math.abs(followed - target) < 0.05 && Math.abs(velocity) < 0.5) {
        followed = target;
        velocity = 0;
        frame = 0;
        write(target, 0);
        return;
      }
      write(target, target - followed);
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (reducedMotion.matches) {
        followed = window.scrollY;
        write(window.scrollY, 0);
        return;
      }
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    write(window.scrollY, 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    reducedMotion.addEventListener('change', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      reducedMotion.removeEventListener('change', onScroll);
      intro.style.removeProperty('--intro-cover');
      surface.style.transform = '';
    };
  }, []);
}
