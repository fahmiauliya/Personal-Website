import { useEffect, useLayoutEffect, useState } from 'react';
import ContactFooter from './components/ContactFooter';
import Header from './components/Header';
import Intro from './components/Intro';
import Works from './components/Works';
import { useIntroCoverMotion } from './components/introCoverMotion';
import { isProjectPath, normalizePath, useProjectTransitions } from './components/projectTransition';
import AboutPage from './pages/About/AboutPage';
import BeamPage from './pages/Beam/BeamPage';
import BifrostPage from './pages/Bifrost/BifrostPage';

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

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  useProjectTransitions(path, setPath);
  const isAboutPage = path === '/about';
  const isBeamPage = path === '/projects/beam';
  const isBifrostPage = path === '/projects/bifrost';

  useEffect(() => {
    document.title = isBeamPage
      ? 'Beam — Fahmi Auliya'
      : isBifrostPage
      ? 'Bifrost — Fahmi Auliya'
      : isAboutPage
      ? 'About — Fahmi Auliya'
      : 'Fahmi Auliya — Product Designer';
  }, [isAboutPage, isBeamPage, isBifrostPage]);

  if (isAboutPage) return <AboutPage />;
  // Project pages open as a layer over the home page, which stays mounted underneath so
  // the shared-element transition and the return scroll position work (projectTransition.ts).
  return (
    <>
      <PortfolioPage />
      {isProjectPath(path) && (
        <div className="project-layer">
          {isBeamPage ? <BeamPage /> : isBifrostPage ? <BifrostPage /> : null}
        </div>
      )}
    </>
  );
}
