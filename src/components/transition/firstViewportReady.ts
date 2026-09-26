/**
 * Resolves once the first screen of the page can be shown: fonts are loaded, the images
 * actually inside `viewport`'s visible area are decoded, and layout has settled for a frame.
 * Nothing below the fold and no `loading="lazy"` image is waited for; those keep loading on
 * their own. `extra` adds anything else the first screen needs (e.g. a hero animation's file).
 *
 * `onProgress` reports real progress: the share of those tasks finished (0 → 1).
 *
 * No artificial delay: if all that is ready at once, this resolves at once. `capMs` is only a
 * safety net, so a stalled asset can't keep the site behind the loader.
 */
export async function firstViewportReady(viewport: HTMLElement, { extra = [], capMs = 4000, onProgress }: {
  extra?: Promise<unknown>[];
  capMs?: number;
  onProgress?: (share: number) => void;
} = {}) {
  const frame = () => new Promise(requestAnimationFrame);
  await frame(); // let the first layout happen, so positions are real
  // Site addition: the lab's `viewport` was always a dedicated, viewport-sized scroll
  // container, so its own bounding rect was the visible screen. This site scrolls the
  // window itself, and `viewport` here is the full page's content wrapper (as tall as
  // the whole page), so its bounding rect is not the screen — the actual browser window
  // is, which is what "first viewport" means regardless of which element is passed.
  const bounds = { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
  const visible = [...viewport.querySelectorAll('img')].filter(image => {
    if (image.loading === 'lazy') return false;
    const r = image.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > bounds.top && r.top < bounds.bottom && r.right > bounds.left && r.left < bounds.right;
  });
  const tasks: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    ...visible.map(image => image.decode()),
    ...extra,
  ];
  let done = 0;
  onProgress?.(0);
  const ready = Promise.all(tasks.map(task => task.catch(() => undefined).then(() => {
    done += 1;
    onProgress?.(done / tasks.length);
  })));
  await Promise.race([ready, new Promise(resolve => setTimeout(resolve, capMs))]);
  onProgress?.(1);
  await frame();
}
