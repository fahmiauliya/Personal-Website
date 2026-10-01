import { useEffect, useRef, type RefObject } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import Guides from '../Guides';
import forge from './assets/forge.svg?raw';
import './ForgeStack.css';

// Content 09 (Figma Portfolio-2026, node 141:27745): Beam's folders stacked in the "/01 Forge"
// tray, an isometric illustration at the frame's design size (384 × 479). BeamGallery scales
// it to the tile with SceneFit. The artwork is Figma's own vectors (assets/forge.svg,
// cleaned: each repeated shape written once, ids prefixed per tile), written into the page as
// inline SVG, so the tile makes no image request; its one label is already outlines, so it
// loads no font. As in Figma, the guides run over it.
//
// The folders shuffle on a loop: the front one sinks down into the tray, the other four each
// slide one slot forward, taking on the greys (face and X mark) of their new place, and a folder rises out of
// the tray into the back slot. Nothing fades: each folder is clipped at its slot's floor
// line (forge.svg, #c09-floorN), so the tray hides it as it goes in and shows it as it comes
// out. It runs only while the tile is near the screen (useNearView), and holds still for
// reduced motion.

// The five slots, back to front: where each folder sits in Figma (its group's top-left, design
// px), its face's grey there and its X mark's (a shade darker; the back slot has no mark in
// Figma, so it takes the front one's, over the same grey).
const SLOTS = [
  { x: 122.352, y: 45.019, face: [0x29, 0x29, 0x29], mark: [0x0a, 0x0a, 0x0a] },
  { x: 104.734, y: 31.243, face: [0x3d, 0x3d, 0x3d], mark: [0x29, 0x29, 0x29] },
  { x: 86.713, y: 7.308, face: [0x52, 0x52, 0x52], mark: [0x29, 0x29, 0x29] },
  { x: 69.55, y: 54.708, face: [0x3d, 0x3d, 0x3d], mark: [0x14, 0x14, 0x14] },
  { x: 51.505, y: 92.793, face: [0x29, 0x29, 0x29], mark: [0x0a, 0x0a, 0x0a] },
];
const FRONT = SLOTS.length - 1;

// One step (the front folder down into the tray and up at the back, the rest one slot
// forward), in seconds; SINK is how far down a folder goes to be out of sight (design px).
const STEP = 3;
const SINK = 104;
const DOWN = { length: 0.9 };
const SLIDE = { start: 0.3, length: 1.2 };
const UP = { start: 1.2, length: 1 };

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const grey = (a: number[], b: number[], t: number) => `rgb(${a.map((value, i) => Math.round(mix(value, b[i], t))).join(' ')})`;

function useFolderShuffle(ref: RefObject<HTMLElement | null>, playing: boolean) {
  // Which folder is in which slot (back to front), and how far into the loop it is, kept
  // across pauses so it picks up where it stopped.
  const state = useRef<{ order: SVGGElement[]; home: number[]; elapsed: number } | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const folders = [...root.querySelectorAll<SVGGElement>('.c09-folder')];
    if (folders.length !== SLOTS.length) return;
    // Each folder's own slot in the artwork: its transform moves it from there.
    state.current ??= { order: folders, home: folders.map((_, i) => i), elapsed: 0 };
    const current = state.current;
    const homeOf = (folder: SVGGElement) => current.home[folders.indexOf(folder)];
    const place = (folder: SVGGElement, x: number, y: number, sink: number, face: string, mark: string) => {
      const home = SLOTS[homeOf(folder)];
      folder.setAttribute('transform', `translate(${(x - home.x).toFixed(2)} ${(y - home.y).toFixed(2)})`);
      folder.querySelector('.c09-lift')?.setAttribute('transform', sink ? `translate(0 ${sink.toFixed(2)})` : '');
      folder.querySelector<SVGElement>('.c09-face')?.style.setProperty('fill', face);
      folder.querySelector<SVGElement>('.c09-mark')?.style.setProperty('fill', mark);
    };

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      current.elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      // A step ended: the front folder is now the back one (already drawn first).
      while (current.elapsed >= STEP) {
        current.elapsed -= STEP;
        current.order = [current.order[FRONT], ...current.order.slice(0, FRONT)];
      }
      const t = current.elapsed;
      const slide = easeInOut(clamp((t - SLIDE.start) / SLIDE.length));
      current.order.forEach((folder, slot) => {
        if (slot === FRONT) return;
        const from = SLOTS[slot], to = SLOTS[slot + 1];
        place(folder, mix(from.x, to.x, slide), mix(from.y, to.y, slide), 0, grey(from.face, to.face, slide), grey(from.mark, to.mark, slide));
      });
      const traveller = current.order[FRONT];
      if (t < DOWN.length) {
        // Sinking into the tray at the front, speeding up as it goes.
        const from = SLOTS[FRONT];
        place(traveller, from.x, from.y, easeIn(clamp(t / DOWN.length)) * SINK, grey(from.face, from.face, 0), grey(from.mark, from.mark, 0));
      } else {
        // Out of sight below the floor: now the back folder, drawn behind the others, rising.
        const back = current.order[0];
        if (traveller.nextElementSibling !== back) back.before(traveller);
        const to = SLOTS[0];
        place(traveller, to.x, to.y, (1 - easeOut(clamp((t - UP.start) / UP.length))) * SINK, grey(to.face, to.face, 0), grey(to.mark, to.mark, 0));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ref, playing]);
}

// The markup is this folder's own SVG file, bundled at build time (never visitor input), so
// writing it into the page is safe.
export default function ForgeStack() {
  const ref = useRef<HTMLDivElement>(null);
  const playing = useNearView(ref, false, 'focus');
  useFolderShuffle(ref, playing);
  return (
    <div className="beam-forge" ref={ref} aria-hidden="true">
      <span className="beam-forge__art" dangerouslySetInnerHTML={{ __html: forge }} />
      <Guides x={[60.05, 324]} y={[]} />
    </div>
  );
}
