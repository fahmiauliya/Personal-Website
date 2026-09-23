// Standalone page for one Motion Lab frame (Bifrost or Beam), built by ../sync.mjs.
// Draws the frame the way Motion Lab's BifrostWorkspace does (frame image, then the
// motion in its content box) at the frame's Figma size, without the "Motion N" label.
// Plain JS with createElement: Motion Lab's tsconfig JSX setting doesn't reach this folder.
import { createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@motion/rive-runtime';
import Motion from '@motion/motion';
import frameImage from '@motion/frame-image';
import geist from '@motion/geist';
import { buildTimeline, positionAt } from './timeline.js';

// Injected by sync.mjs from Motion Lab's frames.ts and the motion's settings.json.
/* global __MOTION_FRAME__, __MOTION_SETTINGS__ */
const frame = __MOTION_FRAME__;
const settings = __MOTION_SETTINGS__;
const timeline = frame.steps ? buildTimeline(settings, frame.steps) : null;

document.fonts.add(new FontFace('Geist', `url(${geist})`, { weight: '400', display: 'swap' }));

// Timeline motions get a looping `position`, as Motion Lab's timeline dock drives it.
function usePosition() {
  const [position, setPosition] = useState(timeline ? timeline.from : 0);
  useEffect(() => {
    if (!timeline) return undefined;
    const start = performance.now();
    let request = requestAnimationFrame(function tick(now) {
      setPosition(positionAt(timeline, (now - start) / 1000));
      request = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(request);
  }, []);
  return position;
}

function Frame() {
  const position = usePosition();
  const box = frame.content;
  return createElement('div', { style: { position: 'absolute', left: 0, top: 0, width: frame.width, height: frame.height, overflow: 'hidden', background: frame.background } },
    frameImage && createElement('img', { src: frameImage, alt: '', style: { position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' } }),
    createElement('div', { style: { position: 'absolute', left: box.x, top: box.y, width: box.width, height: box.height } },
      createElement(Motion, { position, values: settings.values ?? {} })));
}

createRoot(document.getElementById('root')).render(createElement(Frame));
