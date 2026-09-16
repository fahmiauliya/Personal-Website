import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import aboutIcon from '../assets/icons/nav-about.svg';
import homeIcon from '../assets/icons/logo.svg';
import contactIcon from '../assets/icons/nav-contact.svg';
import worksIcon from '../assets/icons/nav-works.svg';
import NavigationMaterial from './NavigationMaterial';
import { materialPath, useNavigationProgress } from './navigationMotion';

const NAVIGATION_CONTROL_HEIGHT = 28;
type WorkTab = 'selected' | 'exploration';

export default function Header({ isAboutPage = false }: { isAboutPage?: boolean }) {
  const progress = useNavigationProgress();
  const [activeTab, setActiveTab] = useState<WorkTab>('selected');
  const centerLeft = 110 - 46 * progress;
  const centerWidth = 155 + 92 * progress;
  const aboutLeft = 186.5 + 128.5 * progress;
  const labelProgress = Math.min(1, progress / 0.55);
  const collapse = labelProgress * labelProgress * (3 - 2 * labelProgress);
  const aboutWidth = 74 - 46 * collapse;
  const labelWidth = 36 * (1 - collapse);
  const aboutCenter = aboutLeft + (aboutWidth - labelWidth) / 2;
  const projectsOpacity = Math.max(0, Math.min(1, (progress - 0.3) / 0.4));
  const worksOpacity = Math.max(0, 1 - progress / 0.35);
  const contentClip = Math.max(0, 240 - (aboutLeft - centerLeft - 7));
  const isIntroSettled = progress === 0;
  const isWorksSettled = progress === 1;
  const navigationStyle = {
    '--navigation-control-height': `${NAVIGATION_CONTROL_HEIGHT}px`,
    '--navigation-rim-top': 'var(--color-control-stroke-top)',
    '--navigation-rim-bottom': 'var(--color-control-stroke-bottom)',
  } as CSSProperties;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextTab: WorkTab | undefined;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      nextTab = event.currentTarget.id === 'nav-tab-selected' ? 'exploration' : 'selected';
    } else if (event.key === 'Home') {
      nextTab = 'selected';
    } else if (event.key === 'End') {
      nextTab = 'exploration';
    }
    if (!nextTab) return;
    event.preventDefault();
    setActiveTab(nextTab);
    document.getElementById(`nav-tab-${nextTab}`)?.focus();
  };

  return (
    <header className="site-header">
      <nav className="site-nav" data-state={progress < 0.5 ? 'intro' : 'works'} data-material-hidden={(isIntroSettled || isWorksSettled) || undefined} data-works-settled={isWorksSettled || undefined} style={navigationStyle} aria-label="Primary navigation">
        <NavigationMaterial path={materialPath(centerLeft, centerWidth, aboutCenter, progress, NAVIGATION_CONTROL_HEIGHT / 2)} />

        <a className="nav-circle nav-surface nav-home" style={{ transform: `translateX(${78 - 46 * progress}px)` }} href="/" aria-label="Back to introduction">
          <span className="nav-icon nav-icon--logo" aria-hidden="true">
            <span><img src={homeIcon} alt="" /></span>
          </span>
        </a>

        <div className={`nav-segments${isIntroSettled || isWorksSettled ? ' nav-surface' : ''}`} style={{ width: centerWidth, transform: `translateX(${centerLeft}px)` }}>
          <div className="nav-segments-content nav-segments-content--intro" style={{ opacity: worksOpacity }} aria-hidden={worksOpacity === 0}>
            <a href="/#works" tabIndex={isIntroSettled ? 0 : -1} style={{ pointerEvents: isIntroSettled ? 'auto' : 'none' }}>
              <span className="nav-icon nav-icon--works" aria-hidden="true">
                <span><img src={worksIcon} alt="" /></span>
              </span>
              <span>Works</span>
            </a>
          </div>
          <div className="nav-segments-content nav-segments-content--works" data-active={activeTab} role="tablist" aria-label="Work categories" style={{ opacity: projectsOpacity, clipPath: `inset(0 ${contentClip}px 0 0)` }} aria-hidden={projectsOpacity === 0}>
            <span className="nav-tab-indicator" aria-hidden="true" />
            <button id="nav-tab-selected" className="nav-project-tab" type="button" role="tab" aria-selected={activeTab === 'selected'} tabIndex={isWorksSettled && activeTab === 'selected' ? 0 : -1} onClick={() => setActiveTab('selected')} onKeyDown={handleTabKeyDown}>Selected Project</button>
            <button id="nav-tab-exploration" className="nav-project-tab" type="button" role="tab" aria-selected={activeTab === 'exploration'} tabIndex={isWorksSettled && activeTab === 'exploration' ? 0 : -1} onClick={() => setActiveTab('exploration')} onKeyDown={handleTabKeyDown}>Design Exploration</button>
          </div>
        </div>

        {/* This link and its icon remain mounted and visible through the entire morph. */}
        <a className={`nav-about${isWorksSettled ? ' nav-surface' : ''}`} href="/about/" aria-label="About" aria-current={isAboutPage ? 'page' : undefined} style={{ width: aboutWidth, transform: `translateX(${aboutLeft}px)` }}>
          <span className="nav-icon nav-icon--about" aria-hidden="true">
            <span><img src={aboutIcon} alt="" /></span>
          </span>
          <span className="nav-about-label" aria-hidden="true" style={{ width: labelWidth, opacity: 1 - collapse }}><span>About</span></span>
        </a>

        <button className="nav-circle nav-surface nav-email" style={{ transform: `translateX(${269 + 78 * progress}px)` }} type="button" disabled aria-label="Send an email">
          <span className="nav-icon nav-icon--contact" aria-hidden="true"><img src={contactIcon} alt="" /></span>
        </button>
      </nav>
    </header>
  );
}
