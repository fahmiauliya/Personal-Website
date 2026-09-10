import React from 'react';
import SequentialRing from './sequential-ring/SequentialRing.jsx';

export default function HeroAnimation() {
  return (
    <div className="visual-panel">
      <SequentialRing
        className="website-motion"
        mark="f·a"
        ariaLabel="A collection of sculptural material studies. Drag in any direction to explore."
      />
    </div>
  );
}
