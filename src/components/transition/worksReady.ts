/** Wait behind the cover for both Works panels, including lazy chunks and motion frames.
 * Only nearby cards are included; distant scenes keep their normal lazy lifecycle.
 * A failed/stalled asset must never trap navigation behind the puzzle.
 */
export async function worksReady(capMs = 12000): Promise<void> {
  const root = document.getElementById('works');
  if (!root || document.documentElement.classList.contains('project-open')) return;
  const deadline = performance.now() + capMs;
  const decoded = new WeakSet<HTMLImageElement>();
  const decoding = new WeakSet<HTMLImageElement>();
  let stable = 0;
  while (root.isConnected && performance.now() < deadline) {
    const cards = [...root.querySelectorAll<HTMLElement>('.project-image')].filter(card => {
      const rect = card.getBoundingClientRect();
      return rect.bottom > -innerHeight && rect.top < innerHeight * 2;
    });
    let pending = document.fonts.status === 'loading';
    for (const card of cards) {
      if (card.querySelector('[data-cover-ready="pending"]')) pending = true;
      // A near-view wrapper may exist for a frame before IntersectionObserver mounts it.
      for (const scene of card.querySelectorAll('.scene-fit-stage')) {
        if (!scene.childElementCount) pending = true;
      }
      for (const image of card.querySelectorAll('img')) {
        if (decoded.has(image)) continue;
        pending = true;
        image.loading = 'eager';
        if (!decoding.has(image)) {
          decoding.add(image);
          void image.decode().catch(() => undefined).then(() => decoded.add(image));
        }
      }
    }
    stable = pending ? 0 : stable + 1;
    if (stable >= 3) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
