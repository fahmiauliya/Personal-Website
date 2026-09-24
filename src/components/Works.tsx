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
  const { heading, cards, placement } = categories[tab];
  /** ASCII cards in order, for the sweep that travels across the grid one card after another. */
  const asciiCards = cards.filter(project => !project.href && project.coverImage).map(project => project.id);
  return (
    <section className="works-section" id="works">
      <span className="works-navigation-trigger" id="works-navigation-trigger" aria-hidden="true" />
      <h2 className="visually-hidden">{heading}</h2>
      {/* Keyed by tab, so switching remounts the grid and it fades in with its own cards. */}
      <div className="works-grid" id="works-panel" role="tabpanel" aria-labelledby={`nav-tab-${tab}`} key={tab}>
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
    </section>
  );
}
