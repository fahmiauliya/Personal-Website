import { useEffect, useState } from 'react';
import aboutIcon from '../assets/icons/nav-about.svg';
import homeIcon from '../assets/icons/logo.svg';
import contactIcon from '../assets/icons/nav-contact.svg';
import worksIcon from '../assets/icons/nav-works.svg';

type NavigationState = 'intro' | 'works';

export default function Header() {
  const [navigationState, setNavigationState] = useState<NavigationState>('intro');

  useEffect(() => {
    const trigger = document.querySelector('#works-navigation-trigger');

    if (!trigger) return;

    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 61;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        const nextState: NavigationState = entry.isIntersecting
          ? 'intro'
          : entry.boundingClientRect.top < headerHeight
            ? 'works'
            : 'intro';

        setNavigationState((currentState) => currentState === nextState ? currentState : nextState);
      },
      {
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, []);

  const isWorksState = navigationState === 'works';

  return (
    <header className="site-header">
      <nav className="site-nav" data-state={navigationState} aria-label="Primary navigation">
        <span className="nav-leading-slot" aria-hidden="true" />

        <button className="nav-circle nav-surface" type="button" disabled aria-label="Back to introduction">
          <span className="nav-icon nav-icon--logo" aria-hidden="true">
            <span><img src={homeIcon} alt="" /></span>
          </span>
        </button>

        <div className="nav-segments nav-surface">
          <div className="nav-segments-content nav-segments-content--intro" aria-hidden={isWorksState}>
            <button type="button" disabled>
              <span className="nav-icon nav-icon--works" aria-hidden="true">
                <span><img src={worksIcon} alt="" /></span>
              </span>
              <span>Works</span>
            </button>
            <button type="button" disabled>
              <span className="nav-icon nav-icon--about" aria-hidden="true">
                <span><img src={aboutIcon} alt="" /></span>
              </span>
              <span>About</span>
            </button>
          </div>

          <div className="nav-segments-content nav-segments-content--works" aria-hidden={!isWorksState}>
            <button className="nav-project-tab nav-project-tab--active" type="button" disabled>
              Selected Project
            </button>
            <button className="nav-project-tab" type="button" disabled>
              Design Exploration
            </button>
          </div>
        </div>

        <button
          className="nav-circle nav-surface nav-work-about"
          type="button"
          disabled
          aria-label="About"
          aria-hidden={!isWorksState}
        >
          <span className="nav-icon nav-icon--about" aria-hidden="true">
            <span><img src={aboutIcon} alt="" /></span>
          </span>
        </button>

        <button className="nav-circle nav-surface" type="button" disabled aria-label="Send an email">
          <span className="nav-icon nav-icon--contact" aria-hidden="true">
            <img src={contactIcon} alt="" />
          </span>
        </button>
      </nav>
    </header>
  );
}
