import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import atlasUrl from '../../assets/material-atlas.webp';
import { selectedArtwork } from './geometry.js';
import { sequentialLayers } from './layers.js';
import { variantPhase } from './timeline.js';
import './motion.css';

export default function MotionScene({ paused = false, speed = 1, replayKey = 0, settings, preview, live = false, onPhaseChange, variant, images, className = '', style, ariaLabel, mark = '' }) {
  const stageRef = useRef(null);
  const markRef = useRef(null);
  const cardRefs = useRef([]);
  const clusterRef = useRef(null);
  const gooBlurRef = useRef(null);
  const gooFilterId = `gather-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const idleClock = useRef(0);
  const idleStarted = useRef(false);
  const layerOrder = useRef([]);
  const rotation = useRef({ x: 0, y: 0 });
  const gesture = useRef({ x: 0, y: 0, dragX: 0, dragY: 0, down: false, hover: false, lastX: 0, lastY: 0, ripples: [] });
  const phaseCallback = useRef(onPhaseChange);
  const previewRef = useRef(preview);
  const renderRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const customImages = images?.length ? images.slice(0, Math.max(1, Math.min(16, Math.round(settings.formation.imageCount)))) : null;
  const artwork = customImages ? customImages.map((_, i) => i) : selectedArtwork(settings);
  const count = artwork.length;
  const hoverEnabled = variant.hoverInteraction !== false;

  useEffect(() => { phaseCallback.current = onPhaseChange; }, [onPhaseChange]);
  useLayoutEffect(() => {
    previewRef.current = preview;
    // Live playback already has a frame loop; preview changes only update its sample.
    if (!live || paused || reduced) renderRef.current?.(performance.now());
  }, [preview, live, paused, reduced]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    let cancelled = false;
    setReady(false); setFailed(false);
    const urls = images?.length ? images.slice(0, count) : [atlasUrl];
    const loaders = urls.map(src => new Promise((resolve, reject) => {
      const image = new Image(); image.onload = resolve; image.onerror = reject; image.src = src;
    }));
    Promise.all(loaders).then(() => { if (!cancelled) setReady(true); }).catch(() => { if (!cancelled) { setFailed(true); phaseCallback.current?.('Image error'); } });
    return () => { cancelled = true; preference.removeEventListener('change', update); };
  }, [images, count]);

  useEffect(() => {
    idleClock.current = 0;
    idleStarted.current = false;
    layerOrder.current = [];
    rotation.current = { x: 0, y: 0 };
    Object.assign(gesture.current, { x: 0, y: 0, dragX: 0, dragY: 0, down: false, ripples: [] });
  }, [replayKey, ready, live]);

  useEffect(() => {
    if (!ready) return;
    const stage = stageRef.current;
    let frameId;
    let last = performance.now();
    let width = stage.clientWidth;
    let radii = variant.radii(width, stage.clientHeight, settings);
    let previousGooey;
    let previousBlur;
    let previousMarkOpacity;
    const painted = [];
    let previousPhase;
    function render(now) {
      const delta = Math.max(0, Math.min((now - last) / 1000, 0.05));
      last = now;
      const sample = previewRef.current;
      if (!sample) return;
      const finished = !settings.opening.enabled || variantPhase(variant, sample) === 'Floating';
      if (!finished) idleStarted.current = false;
      if (live && finished && !idleStarted.current) {
        idleClock.current = variant.sampleClock(sample, settings);
        idleStarted.current = true;
      }
      const active = live && finished && !paused && !reduced && !document.hidden;
      const hoverMode = hoverEnabled && gesture.current.hover ? settings.interaction.hoverBehavior : 'keep moving';
      const factor = hoverMode === 'pause' ? 0 : hoverMode === 'slow down' ? 0.2 : 1;
      if (active && factor > 0) {
        idleClock.current += delta * speed * variant.rate(settings) * factor;
        const smoothing = 1 - Math.exp(-delta * settings.interaction.response);
        const target = gesture.current;
        const pointerStrength = hoverEnabled ? settings.interaction.pointerStrength : 0;
        rotation.current.x += (target.dragX + target.x * pointerStrength - rotation.current.x) * smoothing;
        rotation.current.y += (target.dragY + target.y * pointerStrength * 0.64 - rotation.current.y) * smoothing;
      }
      const complete = reduced || !settings.opening.enabled;
      const currentRotation = live && finished && !reduced ? rotation.current : { x: 0, y: 0 };
      const angle = reduced ? 0 : live && finished ? idleClock.current : variant.sampleClock(sample, settings);
      const cards = Array.from({ length: count }, (_, index) => variant.frame(index, count, currentRotation, settings, sample, angle, complete, reduced ? {} : gesture.current));
      const gooey = cards[0]?.gooey ?? 0;
      // Threshold only the softened silhouette; composite the sharp artwork on top.
      // Turn the filter off completely once the images have separated.
      if ((gooey > .001) !== (previousGooey > .001) || previousGooey === undefined) {
        clusterRef.current.style.filter = gooey > .001 ? `url("#${gooFilterId}")` : 'none';
      }
      const blur = width * settings.formation.cardSize / 100 * .11 * gooey;
      if (blur !== previousBlur) {
        gooBlurRef.current.setAttribute('stdDeviation', String(blur));
        previousBlur = blur;
      }
      if (gooey !== previousGooey) {
        clusterRef.current.style.setProperty('--goo-radius', `${gooey * 42}%`);
        previousGooey = gooey;
      }
      if (variant.id === 'v1') {
        layerOrder.current = sequentialLayers(cards, layerOrder.current, width, radii, settings.formation.cardSize);
        layerOrder.current.forEach((index, rank) => { cards[index].zIndex = rank + 1; });
      }
      for (let index = 0; index < count; index++) {
        const element = cardRefs.current[index];
        if (!element) continue;
        const card = cards[index];
        let transform = `translate3d(${card.x * radii.x}px, ${card.y * radii.y}px, 0) translate(-50%, -50%) scale(${card.scale})`;
        if (card.scaleX !== undefined) {
          transform += ` skewX(${card.skew}deg) scale(${card.scaleX}, ${card.scaleY})`;
        }
        if (card.rotateX !== undefined) {
          transform += ` perspective(700px) rotateX(${card.rotateX}deg) rotateY(${card.rotateY}deg) rotateZ(${card.rotateZ}deg)`;
        }
        const previous = painted[index] ?? {};
        if (transform !== previous.transform) element.style.transform = transform;
        if (card.opacity !== previous.opacity) element.style.opacity = card.opacity;
        if (card.zIndex !== previous.zIndex) element.style.zIndex = card.zIndex;
        painted[index] = { transform, opacity: card.opacity, zIndex: card.zIndex };
      }
      const markOpacity = complete || variant.id !== 'v1' ? 0 : Math.min(1, sample.time / 0.35) * Math.max(0, 1 - sample.gather.current.progress * 6);
      if (markOpacity !== previousMarkOpacity) { markRef.current.style.opacity = markOpacity; previousMarkOpacity = markOpacity; }
      const phase = reduced ? 'Reduced motion' : finished ? 'Floating' : variantPhase(variant, sample);
      if (phase !== previousPhase) { phaseCallback.current?.(phase); previousPhase = phase; stage.dataset.phase = phase; }
    }
    function tick(now) {
      render(now);
      if (live && !paused && !reduced && !document.hidden) frameId = requestAnimationFrame(tick);
    }
    const observer = new ResizeObserver(() => {
      width = stage.clientWidth;
      radii = variant.radii(width, stage.clientHeight, settings);
      render(performance.now());
    });
    observer.observe(stage);
    function visibilityChanged() {
      cancelAnimationFrame(frameId);
      last = performance.now();
      if (!document.hidden) tick(last);
    }
    document.addEventListener('visibilitychange', visibilityChanged);
    renderRef.current = render;
    tick(last);
    return () => { cancelAnimationFrame(frameId); observer.disconnect(); document.removeEventListener('visibilitychange', visibilityChanged); renderRef.current = null; };
  }, [paused, speed, replayKey, reduced, ready, settings, live, count, variant]);

  function canInteract() {
    return live && !paused && !reduced && !(hoverEnabled && gesture.current.hover && settings.interaction.hoverBehavior === 'pause') && (!settings.opening.enabled || variantPhase(variant, previewRef.current) === 'Floating');
  }
  function pointerMove(event) {
    if (!canInteract()) return;
    const state = gesture.current;
    const box = stageRef.current.getBoundingClientRect();
    if (state.down) {
      state.dragX += (event.clientX - state.lastX) / box.width * settings.interaction.dragStrength * (variant.horizontalDragDirection ?? 1);
      const verticalDelta = (event.clientY - state.lastY) / box.height * settings.interaction.dragStrength;
      state.dragY = variant.fullVerticalDrag
        ? state.dragY - verticalDelta
        : Math.max(-0.7, Math.min(0.7, state.dragY - verticalDelta / 2));
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    } else if (hoverEnabled && event.pointerType !== 'touch') {
      state.x = (event.clientX - box.left) / box.width * 2 - 1;
      state.y = (event.clientY - box.top) / box.height * 2 - 1;

    }
  }
  function pointerDown(event) {
    if (!canInteract() || event.button !== 0) return;
    Object.assign(gesture.current, { down: true, lastX: event.clientX, lastY: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
  }
  function pointerEnd(event) {
    gesture.current.down = false;
    event.currentTarget.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return (
    <div className={`motion-lab-scene floating-images ${className}`} data-variant={variant.id} data-clipped={variant.clipOverflow || undefined} ref={stageRef} style={{ ...style, '--card-size': `${settings.formation.cardSize}%`, '--image-roundness': `${Math.max(0, Math.min(50, settings.formation.imageRoundness ?? 6))}%` }}
      role="img" aria-label={ariaLabel || `${count} material studies. ${variant.description}`}
      data-free-drag={variant.fullVerticalDrag && live && !paused && !reduced || undefined}
      onPointerMove={pointerMove} onPointerDown={pointerDown} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
      onPointerEnter={(event) => { if (hoverEnabled && event.pointerType !== 'touch') gesture.current.hover = true; }}
      onLostPointerCapture={() => { gesture.current.down = false; }}
      onPointerLeave={() => { gesture.current.x = 0; gesture.current.y = 0; gesture.current.hover = false; }}>
      <span className="opening-mark" ref={markRef} aria-hidden="true">{mark}</span>
      <svg className="goo-filter-defs" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id={gooFilterId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="soft" ref={gooBlurRef} />
            <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div className="image-cluster" ref={clusterRef} aria-hidden="true">
      {artwork.map((asset, index) => (
        <div key={asset} data-artwork={asset} className="image-card" aria-hidden="true" ref={(element) => { cardRefs.current[index] = element; }}>
          <div className="card-artwork" style={customImages ? { backgroundImage: `url(${customImages[asset]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: `url(${atlasUrl})`,
            backgroundPosition: `${100 * (((asset % 4) + 0.5) / 4 * 4.5 - 0.5) / 3.5}% ${100 * ((Math.floor(asset / 4) + 0.5) / 4 * 4.5 - 0.5) / 3.5}%` }} />
        </div>
      ))}
      </div>
      {failed && <p className="artwork-error" role="alert">The artwork couldn’t load. Refresh to try again.</p>}
    </div>
  );
}
