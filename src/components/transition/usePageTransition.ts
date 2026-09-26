import { useCallback, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
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
export function usePageTransition<Page>({ setPage, stage, scroller, overlay, motion, caption, startCovered = false }: {
  setPage: (page: Page) => void;
  // | null: React 19's useRef(null) types the ref itself as possibly-null (a ref that
  // hasn't attached yet, or a plain object ref like the scroller below), unlike the
  // React 18 types this was written against.
  stage: RefObject<HTMLElement | null>;
  scroller: RefObject<HTMLElement | null>;
  overlay: RefObject<PuzzleHandle | null>;
  motion: PageMotion;
  /** The small note shown while covered, for going to `next` (e.g. "01 → 02 · Beam"). */
  caption?: (next: Page) => string;
  /** The overlay starts closed (first load): the first thing to run is enter(). */
  startCovered?: boolean;
}) {
  const live = useRef(motion);
  live.current = motion;
  const captionFor = useRef(caption);
  captionFor.current = caption;
  const running = useRef(false);
  const [busy, setBusy] = useState(startCovered);
  const lockedOverflow = useRef<string | null>(null);

  const lock = useCallback(() => {
    const scroll = scroller.current;
    if (!scroll || lockedOverflow.current !== null) return;
    lockedOverflow.current = scroll.style.overflow;
    scroll.style.overflow = 'hidden';
  }, [scroller]);
  const unlock = useCallback(() => {
    const scroll = scroller.current;
    if (scroll && lockedOverflow.current !== null) scroll.style.overflow = lockedOverflow.current;
    lockedOverflow.current = null;
  }, [scroller]);

  // Zoom about the middle of what is on screen, wherever the page is scrolled to.
  const origin = useCallback((page: HTMLElement) => {
    const scroll = scroller.current;
    return `50% ${(scroll?.scrollTop ?? 0) + (scroll?.clientHeight ?? page.clientHeight) / 2}px`;
  }, [scroller]);
  const small = () => ({ transform: `scale(${live.current.scale})`, opacity: live.current.opacity });
  const full = { transform: 'scale(1)', opacity: 1 };

  /** Holds the page small behind a closed overlay: the state enter() starts from. */
  const hold = useCallback(() => {
    const page = stage.current;
    if (!page) return;
    lock();
    page.style.transformOrigin = origin(page);
    Object.assign(page.style, small());
  }, [stage, lock, origin]);

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
      unlock();
      running.current = false;
      setBusy(false);
      return;
    }
    await new Promise(requestAnimationFrame);
    const animation = page.animate([small(), full], { duration: puzzle.duration(), easing: live.current.easing, fill: 'forwards' });
    await puzzle.reveal();
    await animation.finished.catch(() => undefined);
    page.style.transform = '';
    page.style.opacity = '';
    page.style.transformOrigin = '';
    animation.cancel();
    unlock();
    running.current = false;
    setBusy(false);
  }, [stage, overlay, hold, unlock]);

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
    lock();

    // Leave: zoom away while the puzzle closes.
    page.style.transformOrigin = origin(page);
    const leave = page.animate([full, small()], { duration: puzzle.duration(), easing: live.current.easing, fill: 'forwards' });
    await puzzle.cover(captionFor.current?.(next));
    await leave.finished.catch(() => undefined);

    // Fully covered: change the page. The new one mounts small, behind the puzzle.
    Object.assign(page.style, small());
    leave.cancel();
    flushSync(() => setPage(next));
    if (scroll) scroll.scrollTop = 0;
    await prepare?.();
    await new Promise(resolve => setTimeout(resolve, live.current.holdMs));

    await enter();
  }, [setPage, stage, scroller, overlay, lock, origin, enter]);

  return { navigate, enter, hold, busy };
}
