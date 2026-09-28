// When the first screen is done, so background work can start without competing with it.
//
// The hidden Works tab (Recent Work) is laid out in the same place as the visible one, so
// its cards would otherwise load with the first screen: the Compai card alone brings a
// ~1.9MB Rive runtime and a ~1.4MB animation. Instead they wait for this, then load in the
// background while the visitor reads the page, so the tab is already rendered when opened.

let resolveRevealed: () => void = () => undefined;
const revealed = new Promise<void>(resolve => { resolveRevealed = resolve; });

/** The first load is revealed: the loader has opened, or there was no loader this visit. */
export const markFirstLoadRevealed = () => resolveRevealed();

let ready = false;
/** Resolves once the page is revealed and the browser has a moment to spare. */
export const backgroundReady: Promise<void> = revealed.then(() => new Promise<void>(resolve => {
  const done = () => { ready = true; resolve(); };
  // Safari has no requestIdleCallback; a short timer stands in.
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(done, { timeout: 1500 });
  else setTimeout(done, 300);
}));

export const isBackgroundReady = () => ready;
