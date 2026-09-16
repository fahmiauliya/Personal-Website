import { useEffect, useLayoutEffect } from 'react';
import ContactFooter from './components/ContactFooter';
import Header from './components/Header';
import Intro from './components/Intro';
import Works from './components/Works';
import AboutPage from './pages/About/AboutPage';
import BeamPage from './pages/Beam/BeamPage';

function PortfolioPage() {
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

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/$/, '');
}

export default function App() {
  const path = normalizePath(window.location.pathname);
  const isAboutPage = path === '/about';
  const isBeamPage = path === '/projects/beam';

  useEffect(() => {
    document.title = isBeamPage
      ? 'Beam — Fahmi Auliya'
      : isAboutPage
      ? 'About — Fahmi Auliya'
      : 'Fahmi Auliya — Product Designer';
  }, [isAboutPage, isBeamPage]);

  return isBeamPage ? <BeamPage /> : isAboutPage ? <AboutPage /> : <PortfolioPage />;
}
