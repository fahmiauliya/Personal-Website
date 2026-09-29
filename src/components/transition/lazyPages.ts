// Pages whose code is its own file (App.tsx loads them with React.lazy). Each load is
// started once and remembered, and while one is in flight the first-load loader waits for
// it (lazyPagesReady, useSiteTransition.ts), so a visit that lands on such a page reveals
// the page, not an empty layer.
const pending = new Set<Promise<unknown>>();

export function lazyPage<T>(load: () => Promise<T>) {
  let started: Promise<T> | null = null;
  return () => {
    if (!started) {
      started = load();
      pending.add(started);
      void started.catch(() => undefined).finally(() => pending.delete(started!));
    }
    return started;
  };
}

/** Resolves once every page load in flight has finished and rendered a frame. */
export const lazyPagesReady = () =>
  Promise.all([...pending].map(load => load.catch(() => undefined)))
    .then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
