import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isProjectPath, normalizePath } from '../projectTransition';
import { firstViewportReady } from './firstViewportReady';
import { PuzzleHandle } from './PuzzleOverlay';
import { usePageTransition } from './usePageTransition';

// The site's one puzzle overlay (Motion Lab's transition-content), used for two things:
//
// - The first load: the overlay starts closed (near-black, grained) with a small
//   "Loading, please wait ..." note and a percentage; the page underneath is already
//   mounted, held small behind it, scrolling locked. Once the first screen's fonts and
//   on-screen images are ready, the note finishes and the puzzle opens as the page comes
//   forward — whatever that first page is (Home, About, or a project opened by a direct
//   link), since it just reveals whatever the stage is already showing.
// - Regular page links use the same puzzle from any current page. Project-card
//   links and explicit project-close controls retain their shared-element transition.
//   History navigation into a project, or from a project back to Works, belongs to
//   that system; other page navigation belongs here.
const CAPTION_OF: Record<string, string> = { '/': 'Works', '/about': 'About' };
export const isSitePath = (path: string) => Object.prototype.hasOwnProperty.call(CAPTION_OF, path);

// Motion Lab's saved dial values (motion-page-transition/settings.json, "Puzzle" group);
// the loader uses the same settings, so the two transitions read as one system.
const PUZZLE_SETTINGS = {
  columns: 8,
  pieces: 4,
  pieceMs: 820,
  columnStaggerMs: 55,
  pieceStaggerMs: 70,
  revealThrough: 1,
  easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
};
const PAGE_MOTION = { scale: 0.96, opacity: 0.9, holdMs: 120, easing: PUZZLE_SETTINGS.easing };

// "First load" means the first time this browser tab visits the site, not every reload:
// sessionStorage remembers it for the rest of the tab's session (a fresh tab, or the
// browser reopening, sees the loader again; navigating around the same tab does not).
// Module scope, not inside the component: this file is evaluated once per real page
// load, so the read-then-write below runs exactly once, unlike the component function
// itself, which StrictMode deliberately double-invokes in development.
const seenBefore = (() => {
  try {
    if (sessionStorage.getItem('site-visited') === '1') return true;
    sessionStorage.setItem('site-visited', '1');
    return false;
  } catch {
    return false; // storage unavailable (private mode, etc.): show the loader anyway
  }
})();

export function useSiteTransition(path: string, setPath: (path: string) => void) {
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<PuzzleHandle>(null);
  // document.documentElement, not a dedicated scroll container: the site scrolls the
  // window itself, and html.project-open (projectTransition.ts) already locks the same
  // way for the project system, so this reuses that element rather than introducing one.
  const scroller = useRef<HTMLElement>(document.documentElement);
  // The latest path, read by the click/popstate handlers below; kept as a ref (rather than
  // relying on the effect re-running) so the handlers stay attached once but never see a
  // stale value, including when the project system changes the path independently.
  const pathRef = useRef(path);
  pathRef.current = path;

  // Site addition, not in the Motion Lab source: hold() sets its shrink and scroll lock
  // with no reduced-motion check (it is a static style, not an animated one, so the lab
  // never needed one there), but LoaderMark's own finish sequence (a hold, a retract, a
  // fade, ~940ms minimum) is real motion with no such check, and would otherwise run for
  // a visitor who asked not to see it. Reduced motion skips the whole loader: the overlay
  // never starts covered, so the page shows at once, same as this hook's other
  // transitions (usePageTransition's own enter()/navigate() already check it themselves).
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipLoader = reducedMotion || seenBefore;

  // setPath from useState is already stable; wrapping it still needs its own useCallback
  // so `navigate`'s identity (built from it inside usePageTransition) stays stable too,
  // and the effect below can register its listeners once instead of on every render.
  const setPage = useCallback((next: string) => {
    pathRef.current = next;
    history.scrollRestoration = 'auto';
    setPath(next);
  }, [setPath]);
  const { navigate, enter, hold, busy } = usePageTransition<string>({
    setPage,
    stage,
    scroller,
    overlay,
    motion: PAGE_MOTION,
    caption: next => CAPTION_OF[next],
    startCovered: !skipLoader,
  });

  // --- First load: the loader --------------------------------------------------------
  const [loading, setLoading] = useState(!skipLoader);
  const [ready, setReady] = useState(false);
  /** The real share of the first screen that is ready, read by LoaderMark every frame. */
  const progress = useRef(0);

  // Before the first paint: the page waits small behind the closed overlay, scrolling
  // locked (a layout effect, so there is no flash of the page at full size first).
  useLayoutEffect(() => { if (!skipLoader) hold(); }, [hold, skipLoader]);

  useEffect(() => {
    if (skipLoader) return;
    let cancelled = false;
    const viewport = stage.current;
    if (!viewport) return;
    firstViewportReady(viewport, { onProgress: share => { progress.current = share; } }).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
    // Runs once, for the one first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LoaderMark calls this once its own finish (100%, a hold, the line retracting, the
  // text fading) is done: only then does the puzzle actually open.
  const revealFirstLoad = useCallback(async () => {
    await enter();
    setLoading(false);
  }, [enter]);

  // --- Regular page navigation ----------------------------------------------------
  const busyRef = useRef(false);
  busyRef.current = busy || loading;

  useEffect(() => {
    let pending: string | null = null;
    let active = false;
    let disposed = false;
    const go = async (next: string, hash = '') => {
      if (active) { pending = next; return; }
      active = true;
      busyRef.current = true;
      try {
        await navigate(next, async () => {
          if (!hash || disposed) return;
          let anchor: string;
          try { anchor = decodeURIComponent(hash.slice(1)); } catch { return; }
          const target = document.getElementById(anchor);
          if (!target) return;
          // Layout offsets ignore the stage's temporary 0.96 transition scale.
          // scrollIntoView would align the scaled bounds and shift when it returns to 1.
          let top = 0;
          for (let element: HTMLElement | null = target; element; element = element.offsetParent as HTMLElement | null) {
            top += element.offsetTop;
          }
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
          window.scrollTo({ top: Math.max(0, top - margin), behavior: 'instant' });
          // Let scroll-driven navigation and the intro handoff update behind the cover.
          await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        });
      } finally {
        active = false;
        busyRef.current = false;
        const queued = pending;
        pending = null;
        if (!disposed && queued && queued !== pathRef.current) void go(queued, window.location.hash);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const next = normalizePath(url.pathname);
      // Keep project links, external destinations, files and same-page anchors native
      // to their existing handlers. Accept both /about and /about/.
      if (isProjectPath(next) || link.matches('[data-project-close]') || !isSitePath(next)) return;
      if (next === pathRef.current) return;
      event.preventDefault();
      if (busyRef.current || active) return;
      history.pushState({ siteTransition: true }, '', url.pathname + url.search + url.hash);
      void go(next, url.hash);
    };
    const onPopState = () => {
      const current = pathRef.current;
      const next = normalizePath(window.location.pathname);
      if (!isSitePath(next) || next === current) return;
      // Back/close from project to Works retains the project-cover morph.
      if (isProjectPath(current) && next === '/') return;
      void go(next, window.location.hash);
    };

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      disposed = true;
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, [navigate]);

  // startCovered goes to <PuzzleOverlay> too: it decides the overlay's own first-render
  // state independently, so both need the same value or a reduced-motion visitor would
  // see the overlay start closed with nothing driving it to reopen.
  return { stage, overlay, puzzleSettings: PUZZLE_SETTINGS, startCovered: !skipLoader, loading, ready, progress, revealFirstLoad };
}
