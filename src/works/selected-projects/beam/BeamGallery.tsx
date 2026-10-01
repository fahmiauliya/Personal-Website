import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import darkHorizontal from './assets/guide-dark-horizontal.svg';
import darkVertical from './assets/guide-dark-vertical.svg';
import lightHorizontal from './assets/guide-light-horizontal.svg';
import lightVertical from './assets/guide-light-vertical.svg';
import { beamVisuals, type BeamVisual } from './beamData';
import SceneFit from '../../../components/motion/SceneFit';
import { useNearView } from '../../../components/motion/useNearView';
// Motion 14 (upload progress loop), copied as source from Motion Lab beam-content/motion-14.
import UploadProgressLoop from './motion-14';
// Content 04 (the Beam website on an iPhone), built in code from Figma 339:4983.
import BeamPhone from './content-04/BeamPhone';
// Content 07 (delete dialog) and 08 (app icons), built in code from Figma 141:7067 / 141:8249.
import DeleteDialog from './content-07/DeleteDialog';
import AppIcons from './content-08/AppIcons';
// Content 09 (folder stack), built in code from Figma 141:27745.
import ForgeStack from './content-09/ForgeStack';
// Content 10 (file browser), 11 (plan chooser), 12 (switch to Pro) and 13 (account menu),
// built in code from Figma 141:25483 / 141:8699 / 141:8810 / 151:4984.
import FileBrowser from './content-10/FileBrowser';
import PlanChooser from './content-11/PlanChooser';
import SwitchToPro from './content-12/SwitchToPro';
import AccountMenu from './content-13/AccountMenu';
// Content 01 (Problem → Solution), 02 (Secrets), 03 (the hero), 05 (the footer) and 06 (on
// demand), ported from Motion Lab beam-content/motion-01 to -06 into code (no iframe, no font). Each is its own chunk, fetched once
// its tile comes near the screen and kept after that; each pauses its own loop when it's far
// away. (Bifrost's gallery unmounts its far motions, which are large SVGs; these are small, and
// rebuilding them on every pass measured as more work than keeping them.) They fill the preview
// box whole from its top left, as the iframes did.
const ProblemSolution = lazy(() => import('./content-01/ProblemSolution'));
const Secrets = lazy(() => import('./content-02/Secrets'));
const BeamHero = lazy(() => import('./content-03/BeamHero'));
const BeamFooter = lazy(() => import('./content-05/BeamFooter'));
const OnDemand = lazy(() => import('./content-06/OnDemand'));

function PortedMotion({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearView(ref);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (near) setLoaded(true); }, [near]);
  return (
    <div className="beam-content-coded" ref={ref}>
      {loaded && <Suspense fallback={null}><SceneFit width={width} height={height} contain>{children}</SceneFit></Suspense>}
    </div>
  );
}

// Motion 14 runs its loop only while on screen; elsewhere it holds its frame, so a visitor
// scrolling elsewhere pays nothing for it.
function Motion14({ visual }: { visual: BeamVisual }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearView(ref, false, 'focus');
  return (
    <div className="beam-motion-14" ref={ref}>
      <SceneFit width={visual.width} height={visual.height}><div className="beam-motion-14-frame"><UploadProgressLoop className="beam-motion-14-bar" playing={near} /></div></SceneFit>
    </div>
  );
}

// Tiles 1–7 draw their guides as SVG lines over the tile, at Figma's positions with its 0.34
// strokes (30% white on a dark frame, 15% black on a light one). A line that thin drawn as an
// image comes out faint or not at all; as a stroke it renders as it does in Figma.
function LineGuides({ visual, axis }: { visual: BeamVisual; axis: 'vertical' | 'horizontal' }) {
  const { width, height } = visual;
  const lines = axis === 'vertical' ? visual.verticalGuides : visual.horizontalGuides;
  if (!lines?.length) return null;
  return (
    <svg className={`beam-line-guides beam-line-guides--${axis}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <g stroke={visual.dark ? '#fff' : '#000'} strokeOpacity={visual.dark ? 0.3 : 0.15} strokeWidth="0.34">
        {lines.map(at => axis === 'vertical'
          ? <line key={at} x1={at} y1="0" x2={at} y2={height} />
          : <line key={at} x1="0" y1={at} x2={width} y2={at} />)}
      </g>
    </svg>
  );
}

function Visual({ visual }: { visual: BeamVisual }) {
  const { preview } = visual;
  return (
    <figure id={`content-${String(visual.id).padStart(2, '0')}`} className={`beam-visual${visual.dark ? ' beam-visual--dark' : ''}`} style={{ '--visual-ratio': `${visual.width} / ${visual.height}` } as CSSProperties}>
      {visual.id <= 7 && <><LineGuides visual={visual} axis="horizontal" /><LineGuides visual={visual} axis="vertical" /></>}
      {visual.id > 7 && visual.verticalGuides?.map(x => (
        <img key={`x-${x}`} className="beam-guide beam-guide--vertical" src={visual.dark ? darkVertical : lightVertical} alt="" style={{ left: `${x / visual.width * 100}%` }} />
      ))}
      {visual.id > 7 && visual.horizontalGuides?.map(y => (
        <img key={`y-${y}`} className="beam-guide beam-guide--horizontal" src={visual.dark ? darkHorizontal : lightHorizontal} alt="" style={{ top: `${y / visual.height * 100}%` }} />
      ))}
      {visual.id === 4 && (
        <div className="beam-content-04">
          <SceneFit width={visual.width} height={visual.height}><BeamPhone /></SceneFit>
        </div>
      )}
      {visual.id === 7 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><DeleteDialog /></SceneFit></div>}
      {visual.id === 8 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><AppIcons /></SceneFit></div>}
      {visual.id === 9 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><ForgeStack /></SceneFit></div>}
      {visual.id === 10 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><FileBrowser /></SceneFit></div>}
      {visual.id === 11 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><PlanChooser /></SceneFit></div>}
      {visual.id === 12 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><SwitchToPro /></SceneFit></div>}
      {visual.id === 13 && <div className="beam-content-coded"><SceneFit width={visual.width} height={visual.height}><AccountMenu /></SceneFit></div>}
      {visual.id === 14 && <Motion14 visual={visual} />}
      {preview && (
        <div className="beam-visual-preview" style={{ left: `${preview.x / visual.width * 100}%`, top: `${preview.y / visual.height * 100}%`, width: `${preview.width / visual.width * 100}%`, height: `${preview.height / visual.height * 100}%`, background: preview.background }}>
          {visual.id === 1 ? <PortedMotion width={1200} height={756}><ProblemSolution /></PortedMotion>
            : visual.id === 2 ? <PortedMotion width={1500} height={895}><Secrets /></PortedMotion>
            : visual.id === 3 ? <PortedMotion width={1500} height={865}><BeamHero /></PortedMotion>
            : visual.id === 5 ? <PortedMotion width={1340} height={836}><BeamFooter /></PortedMotion>
            : visual.id === 6 ? <PortedMotion width={1200} height={744}><OnDemand /></PortedMotion> : preview.src && <img src={preview.src} alt={preview.alt ?? ''} loading="lazy" width={preview.width} height={preview.height} />}
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
