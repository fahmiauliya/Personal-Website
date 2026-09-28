import { useEffect, useLayoutEffect, useRef } from 'react';
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

// The navigation never changes shape while visible: the current one (the home pill, or
// the detail page's header controls) hides before the morph starts, the other stays
// hidden through it, and only once the page has settled does it slide down into place.
// `translate` and `filter`, not `transform`, so the navigation's own layout transforms are
// untouched. The detail header's progressive blur is left out: a filtered or translucent
// ancestor would switch its backdrop blur off.
const NAV_SHOWN = { opacity: 1, translate: '0 0', filter: 'blur(0px)' };
const NAV_HIDDEN = { opacity: 0, translate: '0 -12px', filter: 'blur(4px)' };
const NAV_HIDE_MS = 160;
const NAV_REVEAL_MS = 300;

const homeNavigation = () => [...document.querySelectorAll<HTMLElement>('.portfolio .site-nav')];
const detailNavigation = () => [...document.querySelectorAll<HTMLElement>('.project-layer [data-project-part="actions"] > :not(.progressive-blur)')];

/** Hides the navigation; the returned animations hold it hidden until cancelled. */
async function hideNavigation(elements: HTMLElement[]) {
  const animations = elements.map(element => element.animate([NAV_SHOWN, NAV_HIDDEN], { duration: NAV_HIDE_MS, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }));
  await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)));
  return animations;
}

/** Keeps a navigation that is about to appear invisible, including in the new snapshot. */
const concealNavigation = (elements: HTMLElement[]) => elements.forEach(element => { element.style.opacity = '0'; });

/** Slides the navigation down into place: no overshoot, ease-out. */
const revealNavigation = (elements: HTMLElement[]) => elements.forEach(element => {
  element.animate([NAV_HIDDEN, NAV_SHOWN], { duration: NAV_REVEAL_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
  element.style.opacity = '';
});

// A timer, not requestAnimationFrame: rendering (and so rAF) is paused while a view
// transition's update is pending.
const tick = () => new Promise<void>(resolve => setTimeout(resolve, 16));

// Prepare before starting View Transitions: canvas/Rive need live animation frames,
// which browsers suspend inside the transition's update callback.
async function coverReady(cover: HTMLElement | null, timeout = 6000) {
  if (!cover) return false;
  const start = performance.now();
  const probe = document.createElement('canvas');
  probe.width = probe.height = 12;
  const context = probe.getContext('2d', { willReadFrequently: true });
  while (performance.now() - start < timeout) {
    const stage = cover.querySelector('.motion-preview-stage');
    const frame = stage?.shadowRoot ?? cover;
    const pending = cover.querySelector('[data-cover-ready="pending"]');
    const content = frame.querySelector('figure, canvas, img, .scene-fit-stage > *');
    const images = [...frame.querySelectorAll('img')];
    const canvases = [...frame.querySelectorAll('canvas')];
    const painted = canvases.every(canvas => {
      if (!context || !canvas.width || !canvas.height) return false;
      try {
        context.clearRect(0, 0, 12, 12);
        context.drawImage(canvas, 0, 0, 12, 12);
        const { data } = context.getImageData(0, 0, 12, 12);
        for (let i = 4; i < data.length; i += 4) {
          if (data[i] !== data[0] || data[i + 1] !== data[1] || data[i + 2] !== data[2] || data[i + 3] !== data[3]) return true;
        }
        return false;
      } catch { return true; } // Cross-origin canvases cannot be sampled.
    });
    if (content && !pending && images.every(image => image.complete && image.naturalWidth > 0) && painted) {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return true;
    }
    await tick();
  }
  return false;
}

// Match SceneFit's cover crop at BOTH ends. Width-only snapshot scaling incorrectly
// shrank the artwork at the narrow thumbnail end, then snapped on the live handoff.
function setCoverGeometry(from: HTMLElement, to: HTMLElement, sceneRatio: number) {
  for (const [label, element] of [['from', from], ['to', to]] as const) {
    const rect = element.getBoundingClientRect();
    const width = Math.max(rect.width, rect.height * sceneRatio);
    const height = width / sceneRatio;
    const values = { width, height, left: (rect.width - width) / 2, top: (rect.height - height) / 2 };
    for (const [key, value] of Object.entries(values)) document.documentElement.style.setProperty(`--cover-${label}-${key}`, `${value}px`);
  }
  document.documentElement.classList.add('project-cover-fitted');
}

export function useProjectTransitions(path: string, setPath: (path: string) => void, setPreparedPath: (path: string | null) => void) {
  const pathRef = useRef(path);
  pathRef.current = path;
  // Lock the page underneath while a project layer is open; its scroll position stays.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('project-open', isProjectPath(path));
    // Ordinary navigation may close the layer through the puzzle instead of go().
    if (!isProjectPath(path)) {
      document.querySelectorAll<HTMLElement>('.project-card .project-image').forEach(card => {
        card.style.visibility = '';
      });
      history.scrollRestoration = 'manual';
    }
  }, [path]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let running = false;
    const go = async (next: string) => {
      const current = pathRef.current;
      if (next === current) return;
      const opening = isProjectPath(next);
      const card = cardImage(opening ? next : current);
      // While a layer is open the layer owns scrolling, so the browser must not restore
      // window scroll on back/forward; regular pages also restore under their puzzle.
      // The card's image is "lifted" into the detail page while it is open, so the grid
      // shows its empty slot as the cover flies out and back.
      const apply = () => {
        pathRef.current = next;
        flushSync(() => { setPath(next); setPreparedPath(null); });
        history.scrollRestoration = 'manual';
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
      running = true;
      document.documentElement.classList.add('project-preparing');
      if (opening) {
        flushSync(() => setPreparedPath(next));
        const ready = await coverReady(detailCover());
        if (!ready || normalizePath(window.location.pathname) !== next) {
          flushSync(() => setPreparedPath(null));
          document.documentElement.classList.remove('project-preparing');
          if (normalizePath(window.location.pathname) === next) history.replaceState(null, '', current);
          running = false;
          return;
        }
      }
      // Hide the current navigation first; the morph starts once it is gone.
      const hidden = await hideNavigation(opening ? homeNavigation() : detailNavigation());
      const from = opening ? card : detailCover();
      // The card the image returns to may mount its motion during the close
      // (useNearView); every other motion waits for the transition to end.
      if (!opening) card.dataset.projectReturning = '';
      const cover = detailCover();
      if (from && cover) {
        const rect = cover.getBoundingClientRect();
        setCoverGeometry(from, opening ? cover : card, rect.width / rect.height);
      }
      setDirection(opening ? 'open' : 'close');
      setName(from, true);
      if (!opening) nameLayers(true);
      const transition = doc.startViewTransition(() => {
        setName(from, false);
        // The incoming navigation switches in hidden, before the new view is captured.
        if (!opening) concealNavigation(homeNavigation());
        apply();
        if (opening) concealNavigation(detailNavigation());
        const to = opening ? detailCover() : card;
        setName(to, true);
        if (opening) nameLayers(true);
      });
      transition.finished.finally(() => {
        running = false;
        hidden.forEach(animation => animation.cancel());
        revealNavigation(opening ? detailNavigation() : homeNavigation());
        setName(card, false);
        setName(detailCover(), false);
        nameLayers(false);
        delete card.dataset.projectReturning;
        setDirection(null);
        document.documentElement.classList.remove('project-preparing', 'project-cover-fitted');
        for (const end of ['from', 'to']) for (const property of ['width', 'height', 'left', 'top']) {
          document.documentElement.style.removeProperty(`--cover-${end}-${property}`);
        }
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const current = pathRef.current;
      const target = event.target as Element | null;
      const open = target?.closest<HTMLAnchorElement>('a.project-card-link[href^="/projects/"]');
      const close = target?.closest<HTMLAnchorElement>('a[data-project-close]');
      if ((open || (close && isProjectPath(current))) && running) {
        event.preventDefault();
        return;
      }
      if (open) {
        event.preventDefault();
        history.pushState({ fromGrid: true }, '', open.getAttribute('href'));
        void go(normalizePath(new URL(open.href).pathname));
      } else if (close && isProjectPath(current)) {
        event.preventDefault();
        if ((history.state as { fromGrid?: boolean } | null)?.fromGrid) history.back();
        else {
          history.pushState(null, '', '/');
          void go('/');
        }
      }
    };
    const onPopState = () => {
      const next = normalizePath(window.location.pathname);
      const current = pathRef.current;
      // Project entry and project → Works history keep the existing cover morph.
      // All other regular page changes are handled by useSiteTransition.
      if (!isProjectPath(next) && !(isProjectPath(current) && next === '/')) return;
      void go(next);
    };

    if (isProjectPath(pathRef.current)) history.scrollRestoration = 'manual';
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
    // Mounted once; pathRef also tracks routes changed by the site navigation hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
