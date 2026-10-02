import { projects, recentWorks, type Project } from '../../data/portfolio';
import { useRef, useState, type PointerEvent } from 'react';
import { useNearView } from '../../components/motion/useNearView';
import { LockIcon, LockedGrid, Padlock } from './Padlock';
import { useWorkTab, type WorkTab } from '../../components/navigation/workTab';

// Projects without a page yet are locked "coming soon" cards (Motion Lab website-content,
// shared/site.tsx): a small lock after the title, "(soon)" for the date, and the cover
// under a dotted grid with a padlock on it, or the padlock alone on an empty box.

// Locked covers are monochrome; a spotlight of true colour follows the cursor over them
// (global.css, .project-colour-reveal). The pointer position is written as CSS variables
// once per frame.
let revealFrame = 0;
function followCursor(event: PointerEvent<HTMLDivElement>) {
  const box = event.currentTarget;
  const { left, top } = box.getBoundingClientRect();
  const x = event.clientX - left, y = event.clientY - top;
  cancelAnimationFrame(revealFrame);
  revealFrame = requestAnimationFrame(() => {
    box.style.setProperty('--reveal-x', `${x}px`);
    box.style.setProperty('--reveal-y', `${y}px`);
  });
}
const revealHandlers = {
  onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    followCursor(event);
    event.currentTarget.dataset.reveal = '';
  },
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === 'mouse') followCursor(event); },
  onPointerLeave: (event: PointerEvent<HTMLDivElement>) => { delete event.currentTarget.dataset.reveal; },
};

// Each navigation tab shows its own cards in the same grid, with its own placement
// (.project-card--N for Selected Project, .recent-card--N for Recent Work).
const categories: Record<WorkTab, { heading: string; cards: Project[]; placement: string }> = {
  selected: { heading: 'Selected projects', cards: projects, placement: 'project-card' },
  recent: { heading: 'Recent work', cards: recentWorks, placement: 'recent-card' },
};

export default function Works() {
  const tab = useWorkTab();
  return <section className="works-section" id="works">
    <span className="works-navigation-trigger" id="works-navigation-trigger" aria-hidden="true" />
    {(Object.keys(categories) as WorkTab[]).map(category => <WorksPanel key={category} category={category} active={category === tab} />)}
  </section>;
}

function WorksPanel({ category, active }: { category: WorkTab; active: boolean }) {
  const { heading, cards, placement } = categories[category];
  return (
    <div className="works-panel" data-work-panel={category} data-active={active} aria-hidden={!active} inert={!active}>
      <h2 className="visually-hidden">{heading}</h2>
      {/* Both panels retain their ready covers when the navigation tab changes. */}
      <div className="works-grid" id={active ? "works-panel" : undefined} role="tabpanel" aria-labelledby={`nav-tab-${category}`}>
        {cards.map((project) => (
          <article className={`project-card ${placement}--${project.id}`} key={project.id}>
            {project.href
              ? <header className="project-meta">
                  <h3><a className="project-card-link" href={project.href}>{project.title}</a></h3>
                  <div>
                    <p>{project.description}</p>
                    <time>{project.date}</time>
                  </div>
                </header>
              : <header className="project-meta" aria-label={`${project.title}, coming soon`}>
                  <h3 className="project-locked-title">{project.title}<LockIcon /></h3>
                  <div>
                    <p>{project.description}</p>
                    <time className="project-soon">(soon)</time>
                  </div>
                </header>}
            <ProjectImage project={project} />
          </article>
        ))}
      </div>
    </div>
  );
}

// The card's cover. Image covers load like the motion covers: once the card is
// near the screen and not under an open project page (useNearView), so a visitor who
// lands straight on a project page doesn't download the Works grid behind it. Once
// shown, they stay.
function ProjectImage({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearView(ref);
  const [shown, setShown] = useState(false);
  if (near && !shown) setShown(true);
  return (
    <div
      ref={ref}
      className={`project-image${project.coverScene || project.coverImage ? ' project-image--media' : project.href ? '' : ' project-image--locked'}`}
      role="img"
      aria-label={`${project.title}: ${project.imageLabel}`}
      {...(!project.href && project.coverImage ? revealHandlers : {})}
    >
      {project.coverScene
        ? <project.coverScene />
        : project.coverImage
        ? <>
            {shown && <img className={`project-cover-image${!project.href ? ' project-cover-image--locked' : ''}${project.coverImageFit === 'width' ? ' project-cover-image--fill-width' : ''}`} src={project.coverImage} alt="" decoding="async" />}
            {!project.href && <>
              <span className="project-colour-reveal" aria-hidden="true" />
              <LockedGrid className="project-locked-grid" />
              <span className="project-locked-padlock"><Padlock width={53.354} /></span>
            </>}
          </>
        : project.href
        ? <span>{project.imageLabel}</span>
        : <Padlock />}
    </div>
  );
}
