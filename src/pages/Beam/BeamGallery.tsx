import type { CSSProperties } from 'react';
import darkHorizontal from '../../assets/projects/beam/guide-dark-horizontal.svg';
import darkVertical from '../../assets/projects/beam/guide-dark-vertical.svg';
import lightHorizontal from '../../assets/projects/beam/guide-light-horizontal.svg';
import lightVertical from '../../assets/projects/beam/guide-light-vertical.svg';
import { beamVisuals, type BeamVisual } from './beamData';
import BeamMotionPreview from './BeamMotionPreview';

function Visual({ visual }: { visual: BeamVisual }) {
  const { preview } = visual;
  const labelStyle = { top: `${visual.labelTop / visual.height * 100}%` };
  return (
    <figure id={`content-${String(visual.id).padStart(2, '0')}`} className={`beam-visual${visual.dark ? ' beam-visual--dark' : ''}`} style={{ '--visual-ratio': `${visual.width} / ${visual.height}` } as CSSProperties}>
      {visual.artwork && <img className="beam-visual-artwork" src={visual.artwork} alt="Beam project illustration" width={visual.width} height={visual.height} />}
      {visual.verticalGuides?.map(x => (
        <img key={`x-${x}`} className="beam-guide beam-guide--vertical" src={visual.dark ? darkVertical : lightVertical} alt="" style={{ left: `${x / visual.width * 100}%` }} />
      ))}
      {visual.horizontalGuides?.map(y => (
        <img key={`y-${y}`} className="beam-guide beam-guide--horizontal" src={visual.dark ? darkHorizontal : lightHorizontal} alt="" style={{ top: `${y / visual.height * 100}%` }} />
      ))}
      {preview && (
        <div className="beam-visual-preview" style={{ left: `${preview.x / visual.width * 100}%`, top: `${preview.y / visual.height * 100}%`, width: `${preview.width / visual.width * 100}%`, height: `${preview.height / visual.height * 100}%`, background: preview.background }}>
          {visual.id === 1 || visual.id === 2 || visual.id === 3 || visual.id === 5 || visual.id === 6 ? <BeamMotionPreview motion={visual.id} /> : preview.src && <img src={preview.src} alt={preview.alt ?? ''} loading="lazy" width={preview.width} height={preview.height} />}
        </div>
      )}
      {visual.id !== 1 && visual.id !== 2 && visual.id !== 3 && visual.id !== 5 && visual.id !== 6 && !visual.artwork && <figcaption className="beam-visual-label" style={labelStyle}>img {visual.id}</figcaption>}
      {visual.overlappingLabel && <span className="beam-visual-label beam-visual-label--overlap" style={labelStyle} aria-hidden="true">{visual.overlappingLabel}</span>}
    </figure>
  );
}

export default function BeamGallery() {
  return (
    <section className="beam-gallery" aria-label="Beam project visuals">
      {Array.from({ length: beamVisuals.length / 2 }, (_, row) => (
        <div className={`beam-gallery-row${row === 1 ? ' beam-gallery-row--wide-left' : row === 4 ? ' beam-gallery-row--wide-right' : ''}`} key={row}>
          {beamVisuals.slice(row * 2, row * 2 + 2).map(visual => <Visual key={visual.id} visual={visual} />)}
        </div>
      ))}
    </section>
  );
}
