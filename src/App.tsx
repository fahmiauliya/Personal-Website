import { useEffect, useLayoutEffect, useState } from 'react';
import ContactFooter from './components/ContactFooter';
import Header from './components/Header';
import Intro from './components/Intro';
import Works from './components/Works';
import { useIntroCoverMotion } from './components/introCoverMotion';
import { isProjectPath, normalizePath, useProjectTransitions } from './components/projectTransition';
import { handoffDefaults } from './components/transition/HandoffLogo';
import { LoaderMark } from './components/transition/LoaderMark';
import { PuzzleOverlay } from './components/transition/PuzzleOverlay';
import { useSiteTransition } from './components/transition/useSiteTransition';
import AboutPage from './pages/About/AboutPage';
import BeamPage from './pages/Beam/BeamPage';
import BifrostPage from './pages/Bifrost/BifrostPage';
import RecentWorkPage from './pages/RecentWork/RecentWorkPage';
import { recentWorkProjectBySlug } from './pages/RecentWork/recentWorkData';

function PortfolioPage() {
  useIntroCoverMotion();

  useLayoutEffect(() => {
    // The Works anchor only exists after React mounts on a cross-page visit.
    if (window.location.hash === '#works') {
      document.getElementById('works')?.scrollIntoView();
    }
  }, []);

  return (
    <main className="portfolio">
      <Header />
      <Intro />
      <div className="foreground-layer">
        <Works />
        <ContactFooter />
      </div>
    </main>
  );
}

// /projects/recent/<slug> → that Recent Work project (recentWorkData.ts); undefined for
// any other path, including the fixed Beam/Bifrost routes below.
const recentWorkSlug = (path: string) => {
  const match = /^\/projects\/recent\/([\w-]+)$/.exec(path);
  return match ? match[1] : undefined;
};

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [preparedPath, setPreparedPath] = useState<string | null>(null);
  useProjectTransitions(path, setPath, setPreparedPath);
  // The site's first-load reveal and regular page navigation, both through Motion
  // Lab's puzzle wipe (transition-content). `stage` wraps whichever page is current; the
  // project system above is unaffected and keeps its own transition, since only one of
  // these two hooks ever reacts to a given navigation (see the popstate guard in
  // projectTransition.ts).
  const { stage, overlay, puzzleSettings, startCovered, loading, ready, progress, revealFirstLoad } = useSiteTransition(path, setPath);
  const isAboutPage = path === '/about';
  const detailPath = preparedPath ?? path;
  const isBeamPage = detailPath === '/projects/beam';
  const isBifrostPage = detailPath === '/projects/bifrost';
  const recentWork = recentWorkProjectBySlug.get(recentWorkSlug(detailPath) ?? '');

  useEffect(() => {
    document.title = isBeamPage
      ? 'Beam — Fahmi Auliya'
      : isBifrostPage
      ? 'Bifrost — Fahmi Auliya'
      : recentWork
      ? `${recentWork.title} — Fahmi Auliya`
      : isAboutPage
      ? 'About — Fahmi Auliya'
      : 'Fahmi Auliya — Product Designer';
  }, [isAboutPage, isBeamPage, isBifrostPage, recentWork]);

  return (
    <>
      <div ref={stage} className="site-stage">
        {isAboutPage ? <AboutPage /> : (
          <>
            <PortfolioPage />
            {/* Project pages open as a layer over the home page, which stays mounted
                underneath so the shared-element transition and the return scroll
                position work (projectTransition.ts). */}
            {isProjectPath(detailPath) && (
              <div className={`project-layer${preparedPath ? ' project-layer--preparing' : ''}`} aria-hidden={preparedPath ? true : undefined} inert={preparedPath ? true : undefined}>
                {isBeamPage ? <BeamPage /> : isBifrostPage ? <BifrostPage /> : recentWork ? <RecentWorkPage project={recentWork} /> : null}
              </div>
            )}
          </>
        )}
      </div>
      {/* The logo turning while covered is the loader's own mark (Motion Lab's saved Logo
          values are its defaults), so the loader and page changes read as one system. */}
      <PuzzleOverlay ref={overlay} startCovered={startCovered} settings={puzzleSettings} logo={handoffDefaults}>
        {loading && <LoaderMark label="Loading, please wait ..." initials="F . A" progress={progress} complete={ready} onFinished={revealFirstLoad} />}
      </PuzzleOverlay>
    </>
  );
}
