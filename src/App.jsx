import React from 'react';
import PageShell from './components/PageShell.jsx';

export default function App() {
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
