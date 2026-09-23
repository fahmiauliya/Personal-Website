import { projects } from '../data/portfolio';
import { ASCII_GROUND, AsciiImage, AsciiText, asciiDefaults, type AsciiOptions } from './Ascii';
import MotionPreview from './MotionPreview';

// Projects without a page yet show their image as animated ASCII and their details as
// scrambled ASCII text (Motion Lab website-content, motion-works-cards). Values are the
// lab's saved dials (motion-works-cards/settings.json).
const ascii: AsciiOptions = { ...asciiDefaults, CellPx: 6, Contrast: 0.5, Brightness: -0.05, Saturation: 0, Cutoff: 0.08, Flicker: 0.06, Sweep: 0.35, SweepSeconds: 3.2, Fps: 24 };
/** ASCII cards in order, for the sweep that travels across the grid one card after another. */
const asciiCards = projects.filter(project => !project.href && project.coverImage).map(project => project.id);

export default function Works() {
  return (
    <section className="works-section" id="works">
      <span className="works-navigation-trigger" id="works-navigation-trigger" aria-hidden="true" />
      <h2 className="visually-hidden">Selected works</h2>
      <div className="works-grid">
        {projects.map((project) => (
          <article className={`project-card project-card--${project.id}`} key={project.id}>
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
