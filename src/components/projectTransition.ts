import { useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';

// Shared-element project open/close. The detail page opens as a layer over the home
// page in the same document (history.pushState), so the home page, and its scroll
// position, never unmount. The View Transitions API then morphs one element: the grid
// card's image and the detail cover share the name `project-cover` (only one of them
// holds it at any moment), so the browser animates a single object's position and size
// between them, using only the destination snapshot (no crossfade between two images;
// see ::view-transition-*(project-cover) in global.css). Closing runs the same morph in
// reverse to the card's exact grid position. Browsers without View Transitions, or with
// reduced motion, switch instantly.
//
// Around the morph, the detail page runs one timeline in layers (tuned in Motion Lab,
// website-content/motion-project-open): the page background fades in from see-through,
// then its content arrives as a staggered wave (title, category, metadata and URL,
// description, header). Each layer gets its own view-transition-name for the transition
// only: a named element is a backdrop root, which would switch off the header's blur.
// Closing plays the layers backwards. The timings are the ::view-transition-* rules in
// global.css, keyed to the html.project-vt-open / project-vt-close class set here.
const COVER_NAME = 'project-cover';
const LAYER_NAME = 'project-layer';
const PART_PREFIX = 'project-part-';

export const normalizePath = (pathname: string) => (pathname === '/' ? pathname : pathname.replace(/\/$/, ''));
export const isProjectPath = (path: string) => path.startsWith('/projects/');

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> };
};

const cardImage = (projectPath: string) => document
  .querySelector(`.project-card-link[href="${projectPath}/"]`)
  ?.closest('.project-card')
  ?.querySelector<HTMLElement>('.project-image') ?? null;

const detailCover = () => document.querySelector<HTMLElement>('.project-layer [data-project-cover]');

const setName = (element: HTMLElement | null, named: boolean) => {
  if (element) element.style.viewTransitionName = named ? COVER_NAME : '';
};

/** Names the detail page's background and content layers, or clears them. */
const nameLayers = (named: boolean) => {
  const layer = document.querySelector<HTMLElement>('.project-layer');
  if (!layer) return;
  layer.style.viewTransitionName = named ? LAYER_NAME : '';
  for (const part of layer.querySelectorAll<HTMLElement>('[data-project-part]')) {
    part.style.viewTransitionName = named ? `${PART_PREFIX}${part.dataset.projectPart}` : '';
  }
};

const setDirection = (direction: 'open' | 'close' | null) => {
  const root = document.documentElement.classList;
  root.toggle('project-vt-open', direction === 'open');
  root.toggle('project-vt-close', direction === 'close');
};

// A timer, not requestAnimationFrame: rendering (and so rAF) is paused while a view
// transition's update is pending.
const tick = () => new Promise<void>(resolve => setTimeout(resolve, 16));

// The detail cover is a freshly mounted motion (MotionPreview, in its shadow root).
// Before the new view is captured, wait for it to render, then until its canvases have
// painted or a short grace has passed, so the expanding cover is never blank. Canvases
// that draw immediately (the Beam dot field) end the wait early. Rive draws on
// requestAnimationFrame, which is paused during the update, so it can't paint here; the
// grace lets its file load so it draws in the frame the browser captures. The old view
// stays frozen on screen meanwhile, and the whole wait is capped so a slow network can't
// stall the open.
async function coverReady(cover: HTMLElement | null, grace = 200, timeout = 700) {
  const stage = cover?.querySelector('.motion-preview-stage');
  if (!stage) return;
  const probe = document.createElement('canvas');
  probe.width = probe.height = 12;
  const probeContext = probe.getContext('2d', { willReadFrequently: true });
  const painted = (canvas: HTMLCanvasElement) => {
    if (!probeContext || !canvas.width || !canvas.height) return false;
    probeContext.clearRect(0, 0, 12, 12);
    probeContext.drawImage(canvas, 0, 0, 12, 12);
    const { data } = probeContext.getImageData(0, 0, 12, 12);
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
    return false;
  };
  const start = performance.now();
  let mountedAt = 0;
  while (performance.now() - start < timeout) {
    const frame = stage.shadowRoot?.querySelector('div');
    if (frame?.firstElementChild) {
      mountedAt ||= performance.now();
      const canvases = [...frame.querySelectorAll('canvas')];
      if (canvases.length && canvases.every(painted)) return;
      if (performance.now() - mountedAt >= grace) return;
    }
    await tick();
  }
}

export function useProjectTransitions(path: string, setPath: (path: string) => void) {
  // Lock the page underneath while a project layer is open; its scroll position stays.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('project-open', isProjectPath(path));
  }, [path]);

  useEffect(() => {
    let current = path;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const go = (next: string) => {
      if (next === current) return;
      const opening = isProjectPath(next);
      const card = cardImage(opening ? next : current);
      // While a layer is open the layer owns scrolling, so the browser must not restore
      // window scroll on back/forward; normal restoration returns once it closes.
      // The card's image is "lifted" into the detail page while it is open, so the grid
      // shows its empty slot as the cover flies out and back.
      const apply = () => {
        current = next;
        flushSync(() => setPath(next));
        history.scrollRestoration = opening ? 'manual' : 'auto';
        if (card) card.style.visibility = opening ? 'hidden' : '';
      };
      const doc = document as ViewTransitionDocument;
      if (!doc.startViewTransition || !card || reducedMotion.matches) {
        apply();
        return;
      }
      // Closing: bring the card on screen under the layer first, so the morph lands on it.
      if (!opening) {
        const rect = card.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) card.scrollIntoView({ block: 'center' });
      }
      const from = opening ? card : detailCover();
      // The card the image returns to may mount its motion during the close
      // (useNearView); every other motion waits for the transition to end.
      if (!opening) card.dataset.projectReturning = '';
      setDirection(opening ? 'open' : 'close');
      setName(from, true);
      if (!opening) nameLayers(true);
      const transition = doc.startViewTransition(async () => {
        setName(from, false);
        apply();
        const to = opening ? detailCover() : card;
        // No grace: once the cover's document has mounted, the open starts, rather than
        // freezing the page until its Rive gauge draws (it paints in a frame or two).
        if (opening) await coverReady(to, 0);
        setName(to, true);
        if (opening) nameLayers(true);
      });
      transition.finished.finally(() => {
        setName(card, false);
        setName(detailCover(), false);
        nameLayers(false);
        delete card.dataset.projectReturning;
        setDirection(null);
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const open = target?.closest<HTMLAnchorElement>('a.project-card-link[href^="/projects/"]');
      const close = target?.closest<HTMLAnchorElement>('a[data-project-close]');
      if (open) {
        event.preventDefault();
        history.pushState({ fromGrid: true }, '', open.getAttribute('href'));
        go(normalizePath(new URL(open.href).pathname));
      } else if (close && isProjectPath(current)) {
        event.preventDefault();
        if ((history.state as { fromGrid?: boolean } | null)?.fromGrid) history.back();
        else {
          history.pushState(null, '', '/');
          go('/');
        }
      }
    };
    const onPopState = () => go(normalizePath(window.location.pathname));

    if (isProjectPath(current)) history.scrollRestoration = 'manual';
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
    // Mounted once; `current` tracks the path inside the handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
