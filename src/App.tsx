import { useEffect } from 'react';
import PageShell from './components/PageShell';
import AboutPage from './pages/About/AboutPage';

function HomePage() {
  return (
    <PageShell>
      <div className="visual-panel entrance" aria-hidden="true" />
      <section className="announcement" aria-labelledby="announcement-title">
        <p className="eyebrow entrance">Website under construction</p>
        <h1 id="announcement-title" className="headline entrance">
          A new experience is coming soon.
        </h1>
      </section>
    </PageShell>
  );
}

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/$/, '');
}

export default function App() {
  const path = normalizePath(window.location.pathname);
  const isAboutPage = path === '/about';

  useEffect(() => {
    document.title = isAboutPage
      ? 'About — Fahmi Auliya'
      : 'Fahmi Auliya — Coming soon';
  }, [isAboutPage]);

  return isAboutPage ? <AboutPage /> : <HomePage />;
}
