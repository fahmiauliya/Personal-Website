import type { CSSProperties } from 'react';
import MotionPreview from '../../components/MotionPreview';
import { motionLayout, motionSlots, type MotionId } from './bifrostMotions';

function MotionFrame({ id }: { id: MotionId }) {
  const slot = motionSlots[id];
  return (
    <figure
      id={`p2-${id}`}
      className="bifrost-motion"
      data-figma-label={slot.figmaLabel}
      style={{ '--frame-width': slot.width, '--frame-ratio': `${slot.width} / ${slot.height}`, background: slot.background } as CSSProperties}
    >
      <MotionPreview scene={slot.motion} />
      {slot.label && (
        <figcaption className={`bifrost-motion-label bifrost-motion-label--${slot.label.color}`} style={{ top: `${slot.label.top / slot.height * 100}%` }}>
          Motion {id.slice(-2)}
        </figcaption>
      )}
    </figure>
  );
}

export default function BifrostGallery() {
  return (
    <section className="bifrost-gallery" aria-label="Bifrost motion gallery">
      <div className="bifrost-gallery-rows">
        {motionLayout.map((columns, row) => (
          <div className="bifrost-gallery-row" key={row}>
            {columns.map(stack => (
              <div className="bifrost-gallery-column" key={stack[0]}>
                {stack.map(id => <MotionFrame key={id} id={id} />)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
