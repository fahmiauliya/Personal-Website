import React from 'react';
import PageShell from './components/PageShell.jsx';

export default function App() {
  return (
    <PageShell>
      <section className="announcement" aria-labelledby="announcement-title">
        <p className="eyebrow entrance">Website under construction</p>
        <h1 id="announcement-title" className="headline entrance">
          <span>A new experience</span>{' '}
          <span>is coming soon.</span>
        </h1>
        <p className="supporting-text entrance">
          I’m rebuilding this website with a clearer story, a smoother experience,
          and a fresh new look.
        </p>
      </section>
    </PageShell>
  );
}
