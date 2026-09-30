import { useCallback, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { pinViewportLayers } from './pinViewportLayers';
import type { PuzzleHandle } from './PuzzleOverlay';

export type PageMotion = {
  /** The page's scale when zoomed away (leaving) and when it starts (entering). */
  scale: number;
  /** The page's opacity at that point: a very slight dim, not a fade. */
  opacity: number;
  /** A pause, fully covered, around the route change. */
  holdMs: number;
  easing: string;
};

/**
 * Page-to-page navigation through the puzzle overlay, in two halves:
 *
 *   leave:  the current page zooms out (1 → scale) while the puzzle closes over it
 *   switch: fully covered, the route changes (flushSync, so the new page is mounted first)
 *   enter:  the new page, at `scale` behind the overlay, zooms to 1 while the puzzle opens
 *
 * navigate(next) runs all three. The site's first load is only `enter`: the overlay mounts
 * closed (PuzzleOverlay startCovered), the home page waits behind it at `scale`, and once its
 * first viewport is ready, enter() opens the puzzle. One system for both.
 *
 * `stage` is the element the pages render in (it gets the zoom); `scroller` is the scroll
 * container, locked while the overlay is up and returned to the top for a new page. One
 * transition at a time; with reduced motion the page just switches.
 */
export function usePageTransition<Page>({ setPage, stage, scroller, overlay, motion, startCovered = false }: {
  setPage: (page: Page) => void;
  // | null: React 19's useRef(null) types the ref itself as possibly-null (a ref that
  // hasn't attached yet, or a plain object ref like the scroller below), unlike the
  // React 18 types this was written against.
  stage: RefObject<HTMLElement | null>;
  scroller: RefObject<HTMLElement | null>;
  overlay: RefObject<PuzzleHandle | null>;
  motion: PageMotion;
  /** The overlay starts closed (first load): the first thing to run is enter(). */
  startCovered?: boolean;
}) {
  const live = useRef(motion);
  live.current = motion;
  const running = useRef(false);
  const [busy, setBusy] = useState(startCovered);
  const lockedOverflow = useRef<string | null>(null);
  const lockedPadding = useRef<{ value: string; priority: string } | null>(null);
  const releaseFixed = useRef<(() => void) | null>(null);
  const restoreFixed = useCallback(() => {
    releaseFixed.current?.();
    releaseFixed.current = null;
  }, []);
  // The headers' fade (HeaderFade) belongs to the top of the screen, not to the page: while
  // the page zooms, each fade gets the inverse scale about the same point, so it stays
  // full-width at the top edge instead of shrinking away with the navigation.
  const blurs = useRef<HTMLElement[]>([]);
  const releaseBlurs = useCallback(() => {
    for (const blur of blurs.current) {
      blur.getAnimations().forEach(animation => animation.cancel());
      blur.style.transform = '';
      blur.style.transformOrigin = '';
    }
    blurs.current = [];
  }, []);
  const prepareZoom = useCallback((page: HTMLElement) => {
    // This synchronous reset is either before the first animation frame or under
    // the closed puzzle. Measure viewport-fixed layers before the containing block changes.
    page.style.transform = '';
    restoreFixed();
    releaseBlurs();
    // The page zooms about the middle of the viewport (origin() below). Measured at scale 1
    // and before pinning: pinned fixed layers only sit right once the stage is transformed.
    blurs.current = [...page.querySelectorAll<HTMLElement>('.header-fade')];
    const origins = blurs.current.map(blur => {
      const box = blur.getBoundingClientRect();
      return `${window.innerWidth / 2 - box.left}px ${window.innerHeight / 2 - box.top}px`;
    });
    releaseFixed.current = pinViewportLayers(page);
    blurs.current.forEach((blur, index) => { blur.style.transformOrigin = origins[index]; });
  }, [restoreFixed, releaseBlurs]);

  const lock = useCallback(() => {
    const scroll = scroller.current;
    if (!scroll || lockedOverflow.current !== null) return;
    lockedOverflow.current = scroll.style.overflow;
    lockedPadding.current = {
      value: scroll.style.getPropertyValue('padding-right'),
      priority: scroll.style.getPropertyPriority('padding-right'),
    };
    const width = scroll.getBoundingClientRect().width;
    const padding = parseFloat(getComputedStyle(scroll).paddingRight) || 0;
    scroll.style.overflow = 'hidden';
    // Reserve only the space actually freed by hiding a desktop scrollbar.
    // Overlay scrollbars free no space, so their layout stays untouched.
    const gutter = scroll.getBoundingClientRect().width - width;
    if (gutter > 0) scroll.style.paddingRight = `${padding + gutter}px`;
  }, [scroller]);
  const unlock = useCallback(() => {
    const scroll = scroller.current;
    if (scroll && lockedOverflow.current !== null) {
      scroll.style.overflow = lockedOverflow.current;
      const padding = lockedPadding.current;
      if (padding?.value) scroll.style.setProperty('padding-right', padding.value, padding.priority);
      else scroll.style.removeProperty('padding-right');
    }
    lockedOverflow.current = null;
    lockedPadding.current = null;
  }, [scroller]);

  // Zoom about the middle of what is on screen, wherever the page is scrolled to.
  const origin = useCallback((page: HTMLElement) => {
    const scroll = scroller.current;
    return `50% ${(scroll?.scrollTop ?? 0) + (scroll?.clientHeight ?? page.clientHeight) / 2}px`;
  }, [scroller]);
  // Omit transform from the animation entirely at scale 1: even a none → none
  // transform animation establishes a containing block for fixed descendants.
  const small = () => live.current.scale === 1
    ? { opacity: live.current.opacity }
    : { transform: `scale(${live.current.scale})`, opacity: live.current.opacity };
  const full = () => live.current.scale === 1
    ? { opacity: 1 }
    : { transform: 'scale(1)', opacity: 1 };
  // The fade's counter-zoom (see prepareZoom): scale(1 / s) while the page is at s.
  const unzoomed = () => `scale(${1 / live.current.scale})`;
  const counterZoom = (from: string, to: string, timing: KeyframeAnimationOptions) => {
    if (live.current.scale === 1) return;
    for (const blur of blurs.current) blur.animate([{ transform: from }, { transform: to }], timing);
  };
  const holdBlurs = () => {
    if (live.current.scale === 1) return;
    for (const blur of blurs.current) blur.style.transform = unzoomed();
  };

  /** Holds the page small behind a closed overlay: the state enter() starts from. */
  const hold = useCallback(() => {
    const page = stage.current;
    if (!page) return;
    // Under the closed puzzle, measure the incoming fixed layers with the
    // normal scrollbar present, then lock and zoom in the same frame.
    unlock();
    prepareZoom(page);
    lock();
    page.style.transformOrigin = origin(page);
    Object.assign(page.style, small());
    holdBlurs();
  }, [stage, lock, unlock, origin, prepareZoom]);

  /** The puzzle opens while the page (held small) comes toward the viewer. */
  const enter = useCallback(async () => {
    const page = stage.current;
    const puzzle = overlay.current;
    if (!page || !puzzle) return;
    running.current = true;
    setBusy(true);
    hold();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      puzzle.clear();
      page.style.transform = '';
      page.style.opacity = '';
      page.style.transformOrigin = '';
      releaseBlurs();
      restoreFixed();
      unlock();
      running.current = false;
      setBusy(false);
      return;
    }
    await new Promise(requestAnimationFrame);
    const timing = { duration: puzzle.duration(), easing: live.current.easing, fill: 'forwards' } as const;
    const animation = page.animate([small(), full()], timing);
    counterZoom(unzoomed(), 'scale(1)', timing);
    await puzzle.reveal();
    await animation.finished.catch(() => undefined);
    page.style.transform = '';
    page.style.opacity = '';
    page.style.transformOrigin = '';
    animation.cancel();
    releaseBlurs();
    restoreFixed();
    unlock();
    running.current = false;
    setBusy(false);
  }, [stage, overlay, hold, unlock, restoreFixed, releaseBlurs]);

  // Prepare the destination (e.g. its anchor position) while the puzzle is closed.
  const navigate = useCallback(async (next: Page, prepare?: () => void | Promise<void>) => {
    const page = stage.current;
    const scroll = scroller.current;
    const puzzle = overlay.current;
    if (running.current || !page || !puzzle) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flushSync(() => setPage(next));
      if (scroll) scroll.scrollTop = 0;
      await prepare?.();
      return;
    }
    running.current = true;
    setBusy(true);
    // Capture fixed layers before hiding the scrollbar changes viewport width.
    prepareZoom(page);
    lock();

    // Leave: zoom away while the puzzle closes.
    page.style.transformOrigin = origin(page);
    const leaveTiming = { duration: puzzle.duration(), easing: live.current.easing, fill: 'forwards' } as const;
    const leave = page.animate([full(), small()], leaveTiming);
    counterZoom('scale(1)', unzoomed(), leaveTiming);
    await puzzle.cover();
    await leave.finished.catch(() => undefined);

    // Fully covered: change the page. The new one mounts small, behind the puzzle.
    Object.assign(page.style, small());
    leave.cancel();
    page.style.transform = '';
    releaseBlurs();
    restoreFixed();
    flushSync(() => setPage(next));
    if (scroll) scroll.scrollTop = 0;
    await prepare?.();
    // The hold, and the covered logo's turns: whichever is longer.
    await Promise.all([new Promise(resolve => setTimeout(resolve, live.current.holdMs)), puzzle.settled()]);

    await enter();
  }, [setPage, stage, scroller, overlay, lock, origin, enter, prepareZoom, restoreFixed, releaseBlurs]);

  return { navigate, enter, hold, busy };
}
