import { useRef, type CSSProperties } from 'react';
import darkHorizontal from './assets/guide-dark-horizontal.svg';
import darkVertical from './assets/guide-dark-vertical.svg';
import lightHorizontal from './assets/guide-light-horizontal.svg';
import lightVertical from './assets/guide-light-vertical.svg';
import { beamVisuals, type BeamVisual } from './beamData';
import BeamMotionPreview from './BeamMotionPreview';
import SceneFit from '../../../components/motion/SceneFit';
import { useNearView } from '../../../components/motion/useNearView';
// Motion 14 (upload progress loop), copied as source from Motion Lab beam-content/motion-14.
import UploadProgressLoop from './motion-14';
// Content 04 (the Beam website on an iPhone), built in code from Figma 339:4983.
import BeamPhone from './content-04/BeamPhone';
// Content 07 (delete dialog) and 08 (app icons), built in code from Figma 141:7067 / 141:8249.
import DeleteDialog from './content-07/DeleteDialog';
import AppIcons from './content-08/AppIcons';
// Content 11 (plan chooser), 12 (switch to Pro) and 13 (account menu), built in code from
// Figma 141:8699 / 141:8810 / 151:4984.
import PlanChooser from './content-11/PlanChooser';
import SwitchToPro from './content-12/SwitchToPro';
import AccountMenu from './content-13/AccountMenu';

// Motion 14 runs its loop only while near the screen; far away it holds its frame, so a
// visitor scrolling elsewhere pays nothing for it.
function Motion14({ visual }: { visual: BeamVisual }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearView(ref);
  return (
    <div className="beam-motion-14" ref={ref}>
      <SceneFit width={visual.width} height={visual.height}><div className="beam-motion-14-frame"><UploadProgressLoop className="beam-motion-14-bar" playing={near} /></div></SceneFit>
    </div>
  );
}

function Visual({ visual }: { visual: BeamVisual }) {
  const { preview } = visual;
  return (
    <figure id={`content-${String(visual.id).padStart(2, '0')}`} className={`beam-visual${visual.dark ? ' beam-visual--dark' : ''}`} style={{ '--visual-ratio': `${visual.width} / ${visual.height}` } as CSSProperties}>
      {/* Lazy: these artworks sit far down the page, so they load as the
          visitor scrolls toward them, not while the project opens. */}
      {visual.artwork && <img className="beam-visual-artwork" src={visual.artwork} alt="Beam project illustration" width={visual.width} height={visual.height} loading="lazy" decoding="async" />}
      {visual.verticalGuides?.map(x => (
        <img key={`x-${x}`} className="beam-guide beam-guide--vertical" src={visual.dark ? darkVertical : lightVertical} alt="" style={{ left: `${x / visual.width * 100}%` }} />
      ))}
      {visual.horizontalGuides?.map(y => (
        <img key={`y-${y}`} className="beam-guide beam-guide--horizontal" src={visual.dark ? darkHorizontal : lightHorizontal} alt="" style={{ top: `${y / visual.height * 100}%` }} />
      ))}
      {visual.id === 4 && (
        <div className="beam-content-04">
          <SceneFit width={visual.width} height={visual.height}><BeamPhone /></SceneFit>
        </div>
      )}
      {visual.id === 7 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><DeleteDialog /></SceneFit></div>}
      {visual.id === 8 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><AppIcons /></SceneFit></div>}
      {visual.id === 11 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><PlanChooser /></SceneFit></div>}
      {visual.id === 12 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><SwitchToPro /></SceneFit></div>}
      {visual.id === 13 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><AccountMenu /></SceneFit></div>}
      {visual.id === 14 && <Motion14 visual={visual} />}
      {preview && (
        <div className="beam-visual-preview" style={{ left: `${preview.x / visual.width * 100}%`, top: `${preview.y / visual.height * 100}%`, width: `${preview.width / visual.width * 100}%`, height: `${preview.height / visual.height * 100}%`, background: preview.background }}>
          {visual.id === 1 || visual.id === 2 || visual.id === 3 || visual.id === 5 || visual.id === 6 ? <BeamMotionPreview motion={visual.id} /> : preview.src && <img src={preview.src} alt={preview.alt ?? ''} loading="lazy" width={preview.width} height={preview.height} />}
        </div>
      )}
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
