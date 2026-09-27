import { projects, recentWorks, type Project } from '../data/portfolio';
import { ASCII_GROUND, AsciiImage, AsciiText, asciiDefaults, type AsciiOptions } from './Ascii';
import MotionPreview from './MotionPreview';
import { useWorkTab, type WorkTab } from './workTab';

// Projects without a page yet show their image as animated ASCII and their details as
// scrambled ASCII text (Motion Lab website-content, motion-works-cards). Values are the
// lab's saved dials (motion-works-cards/settings.json).
const ascii: AsciiOptions = { ...asciiDefaults, CellPx: 6, Contrast: 0.5, Brightness: -0.05, Saturation: 0, Cutoff: 0.08, Flicker: 0.06, Sweep: 0.35, SweepSeconds: 3.2, Fps: 24 };

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
  /** ASCII cards in order, for the sweep that travels across the grid one card after another. */
  const asciiCards = cards.filter(project => !project.href && project.coverImage).map(project => project.id);
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
                  <h3><AsciiText text={project.title} /></h3>
                  <div>
                    <p><AsciiText text={project.description} /></p>
                    <time><AsciiText text={project.date} /></time>
                  </div>
                </header>}
            <div
              className={`project-image${project.cover || project.coverScene || project.coverImage ? ' project-image--media' : ''}`}
              role="img"
              aria-label={`${project.title}: ${project.imageLabel}`}
              style={!project.href && project.coverImage ? { background: ASCII_GROUND } : undefined}
            >
              {project.cover
                ? <MotionPreview scene={project.cover} fit="cover" />
                : project.coverScene
                ? <project.coverScene />
                : project.coverImage && !project.href
                ? <AsciiImage src={project.coverImage} options={ascii} order={asciiCards.indexOf(project.id)} />
                : project.coverImage
                ? <img className={`project-cover-image${project.coverImageFit === 'width' ? ' project-cover-image--fill-width' : ''}`} src={project.coverImage} alt="" loading="lazy" decoding="async" />
                : <span>{project.imageLabel}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
