import { useEffect, useRef, useState, type RefObject } from 'react';

// Whether a motion should be live: near the screen (within one screen height of it) — or, with
// `reach` 'screen', actually on it —
// not under an open project page, and, on the home page, in the Works tab that's showing
// (the hidden tab's cards load only once it's opened, and pause while it's hidden). Motions mount when this turns true and unmount
// when it turns false, so they load only when they're about to be seen and cost
// nothing once they're far away or covered. Hiding a motion doesn't stop its
// animation loop; unmounting does.
//
// Inside a project page the page itself scrolls (.project-layer), so it is the root
// the distance is measured against. On the home page the window is, and an open
// project page (html.project-open, projectTransition.ts) covers everything there.
// 'near' (within a screen height) decides what loads, so it's ready before it's seen; 'screen'
// decides what plays, so nothing animates out of sight.
const NEAR = '100% 0px';
const REACH = { near: NEAR, screen: '0px' } as const;
// The project page fades in over the home page (1300ms open, global.css), so home
// motions stop only once it's fully opaque; uncovering takes effect at once.
const COVER_DELAY_MS = 1400;

const isCovered = (element: Element) => document.documentElement.classList.contains('project-open') && !element.closest('.project-layer');
// While a project opens or closes (projectTransition.ts), motions neither mount nor
// unmount: each holds its state until the transition ends, so no motion starts up
// while the shared image animates. The card the image is returning to is the one
// exception (data-project-returning): it mounts at the start of the close so it's
// ready when the image lands on it.
const isTransitioning = () => {
  const root = document.documentElement.classList;
  return root.contains('project-vt-open') || root.contains('project-vt-close');
};
const isReturning = (element: Element) => Boolean(element.closest('[data-project-returning]'));

// When a transition ends, held motions are released one at a time, starting shortly
// after it, so the ones that need to mount don't all start in the frame the transition finishes. Releases that change nothing
// don't take a turn.
export const RESUME_DELAY_MS = 250;
export const RESUME_STAGGER_MS = 80;
type Release = () => boolean;
let releases: Release[] = [];
let releaseTimer = 0;
function releaseNext() {
  releaseTimer = 0;
  while (releases.length) if (releases.shift()!()) break;
  if (releases.length) releaseTimer = window.setTimeout(releaseNext, RESUME_STAGGER_MS);
}
function queueRelease(release: Release) {
  if (!releases.includes(release)) releases.push(release);
  if (!releaseTimer) releaseTimer = window.setTimeout(releaseNext, RESUME_DELAY_MS);
}
const dropRelease = (release: Release) => { releases = releases.filter(queued => queued !== release); };

export function useNearView(ref: RefObject<Element | null>, always = false, reach: keyof typeof REACH = 'near') {
  const [near, setNear] = useState(false);
  const [covered, setCovered] = useState(false);
  // Motions created mid-transition (the project page's gallery) start out held too.
  const [held, setHeld] = useState(isTransitioning);
  // A card in the hidden Works tab isn't live: it doesn't load until its tab is first
  // opened, and once loaded it pauses whenever its tab is hidden again.
  const [tabHidden, setTabHidden] = useState(false);
  const live = useRef(false);
  // The latest values, for the release queue, which runs outside of rendering.
  const latest = useRef({ near, covered, held });
  latest.current = { near, covered, held };

  useEffect(() => {
    const element = ref.current;
    if (!element || always) return;
    const panel = element.closest<HTMLElement>('.works-panel');
    const syncTab = () => setTabHidden(panel?.dataset.active === 'false');
    syncTab();
    const panelWatch = new MutationObserver(syncTab);
    if (panel) panelWatch.observe(panel, { attributes: true, attributeFilter: ['data-active'] });
    const intersection = new IntersectionObserver(([entry]) => setNear(entry?.isIntersecting ?? false), {
      root: element.closest('.project-layer'),
      rootMargin: REACH[reach],
    });
    intersection.observe(element);
    let timer = 0;
    // Returns whether releasing mounts or unmounts the motion.
    const release: Release = () => {
      const { near: isNear, covered: isHidden } = latest.current;
      setHeld(false);
      return (isNear && !isHidden) !== live.current;
    };
    const update = () => {
      if (isTransitioning() && !isReturning(element)) {
        dropRelease(release);
        setHeld(true);
      } else if (latest.current.held) queueRelease(release);
      window.clearTimeout(timer);
      if (!isCovered(element)) setCovered(false);
      else timer = window.setTimeout(() => setCovered(isCovered(element)), COVER_DELAY_MS);
    };
    // Already covered on load (a project page opened directly): stop straight away.
    setCovered(isCovered(element));
    setHeld(isTransitioning() && !isReturning(element));
    const cover = new MutationObserver(update);
    cover.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      panelWatch.disconnect();
      intersection.disconnect();
      cover.disconnect();
      window.clearTimeout(timer);
      dropRelease(release);
    };
  }, [ref, always, reach]);

  // During a transition keep the last value; take the new one once it ends.
  if (!held) live.current = near && !covered && !tabHidden;
  return always || live.current;
}
