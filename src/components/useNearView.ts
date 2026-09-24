import { useEffect, useRef, useState, type RefObject } from 'react';

// Whether a motion should be running: near the screen (within one screen height of it)
// and not under an open project page. Motions mount when this turns true and unmount
// when it turns false, so they load only when they're about to be seen and cost
// nothing once they're far away or covered. Hiding a motion doesn't stop its
// animation loop; unmounting does.
//
// Inside a project page the page itself scrolls (.project-layer), so it is the root
// the distance is measured against. On the home page the window is, and an open
// project page (html.project-open, projectTransition.ts) covers everything there.
const NEAR = '100% 0px';
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
// after it, so the ones that need to mount (or the ASCII covers resuming, Ascii.tsx)
// don't all start in the frame the transition finishes. Releases that change nothing
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

export function useNearView(ref: RefObject<Element | null>, always = false) {
  const [near, setNear] = useState(false);
  const [covered, setCovered] = useState(false);
  // Motions created mid-transition (the project page's gallery) start out held too.
  const [held, setHeld] = useState(isTransitioning);
  const live = useRef(false);
  // The latest values, for the release queue, which runs outside of rendering.
  const latest = useRef({ near, covered, held });
  latest.current = { near, covered, held };

  useEffect(() => {
    const element = ref.current;
    if (!element || always) return;
    const intersection = new IntersectionObserver(([entry]) => setNear(entry?.isIntersecting ?? false), {
      root: element.closest('.project-layer'),
      rootMargin: NEAR,
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
      intersection.disconnect();
      cover.disconnect();
      window.clearTimeout(timer);
      dropRelease(release);
    };
  }, [ref, always]);

  // During a transition keep the last value; take the new one once it ends.
  if (!held) live.current = near && !covered;
  return always || live.current;
}
