import { projects, recentWorks, type Project } from '../data/portfolio';
import MotionPreview from './MotionPreview';
import { LockIcon, LockedGrid, Padlock } from './Padlock';
import { useWorkTab, type WorkTab } from './workTab';

// Projects without a page yet are locked "coming soon" cards (Motion Lab website-content,
// shared/site.tsx): a small lock after the title, "(soon)" for the date, and the cover
// under a dotted grid with a padlock on it, or the padlock alone on an empty box.

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
            <div
              className={`project-image${project.cover || project.coverScene || project.coverImage ? ' project-image--media' : project.href ? '' : ' project-image--locked'}`}
              role="img"
              aria-label={`${project.title}: ${project.imageLabel}`}
            >
              {project.cover
                ? <MotionPreview scene={project.cover} fit="cover" />
                : project.coverScene
                ? <project.coverScene />
                : project.coverImage
                ? <>
                    {project.coverVideo
                      ? <video className="project-cover-image" src={project.coverVideo} poster={project.coverImage} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
                      : <img className={`project-cover-image${project.coverImageFit === 'width' ? ' project-cover-image--fill-width' : ''}`} src={project.coverImage} alt="" loading="lazy" decoding="async" />}
                    {!project.href && <>
                      <LockedGrid className="project-locked-grid" />
                      <span className="project-locked-padlock"><Padlock width={53.354} /></span>
                    </>}
                  </>
                : project.href
                ? <span>{project.imageLabel}</span>
                : <Padlock />}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
