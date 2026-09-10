import React, { lazy, Suspense } from 'react';
import PageShell from './components/PageShell.jsx';

const HeroAnimation = lazy(() => import('./components/HeroAnimation.jsx'));

export default function App() {
  return (
    <PageShell>
      <Suspense fallback={<div className="visual-panel" aria-hidden="true"><div className="motion-placeholder" /></div>}>
        <HeroAnimation />
      </Suspense>
      <section className="announcement" aria-labelledby="announcement-title">
        <p className="eyebrow entrance">Website under construction</p>
        <h1 id="announcement-title" className="headline entrance">
          A new experience is coming soon.
        </h1>
      </section>
    </PageShell>
  );
}
