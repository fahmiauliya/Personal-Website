import { projects } from '../data/portfolio';
import MotionPreview from './MotionPreview';

export default function Works() {
  return (
    <section className="works-section" id="works">
      <span className="works-navigation-trigger" id="works-navigation-trigger" aria-hidden="true" />
      <h2 className="visually-hidden">Selected works</h2>
      <div className="works-grid">
        {projects.map((project) => (
          <article className={`project-card project-card--${project.id}`} key={project.id}>
            <header className={`project-meta${project.href ? '' : ' project-meta--blurred'}`}>
              <h3>{project.href ? <a className="project-card-link" href={project.href}>{project.title}</a> : project.title}</h3>
              <div>
                <p>{project.description}</p>
                <time>{project.date}</time>
              </div>
            </header>
            <div className={`project-image${project.cover || project.coverScene || project.coverImage ? ' project-image--media' : ''}`} role="img" aria-label={`${project.title}: ${project.imageLabel}`}>
              {project.cover
                ? <MotionPreview scene={project.cover} fit="cover" />
                : project.coverScene
                ? <project.coverScene />
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
