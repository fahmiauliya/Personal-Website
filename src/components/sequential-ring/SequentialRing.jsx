'use client';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useDialTimeline } from 'dialkit';
import MotionScene from './MotionScene.jsx';
import { VARIANTS } from './variants.js';
import { dialTimeline, mergeSettings, openingEnd } from './timeline.js';
import useLiveOpening from './useLiveOpening.js';

function Player({ version, settings: overrides, timeline: customTimeline, images, paused = false, speed, replayKey = 0, onPhaseChange, className, style, ariaLabel, mark = '' }) {
  const variant = VARIANTS[version];
  const id = `motion-player-${useId()}`;
  const [phase, setPhase] = useState('Loading');
  const settings = useMemo(() => mergeSettings(variant.defaults, overrides), [variant, overrides]);
  const config = useMemo(() => customTimeline ? dialTimeline(customTimeline) : variant.timeline, [variant, customTimeline]);
  const timeline = useDialTimeline(variant.name, config, { id, persist: false, autoplay: false });
  const playbackSpeed = speed ?? settings.playback.speed;
  useLiveOpening({ live: true, paused, speed: playbackSpeed, enabled: settings.opening.enabled, end: openingEnd(variant, timeline), blocked: phase === 'Loading' || phase === 'Reduced motion' || phase === 'Image error', replayKey, timelineId: id });
  useEffect(() => { timeline.pause(); timeline.seek(0); }, [replayKey]);
  function phaseChanged(value) { setPhase(value); onPhaseChange?.(value); }
  return <MotionScene variant={variant} settings={settings} preview={timeline} live paused={paused} speed={playbackSpeed} replayKey={replayKey} onPhaseChange={phaseChanged} images={images} className={className} style={style} ariaLabel={ariaLabel} mark={mark} />;
}

export default function SequentialRing(props) {
  const version = VARIANTS[props.version] ? props.version : 'v1';
  // Replacing the timeline is a new sequence; remount its private transport.
  return <Player key={`${version}:${JSON.stringify(props.timeline ?? null)}`} {...props} version={version} />;
}
