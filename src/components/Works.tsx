import { projects } from '../data/portfolio';

export default function Works() {
  return (
    <section className="works-section" id="works">
      <span className="works-navigation-trigger" id="works-navigation-trigger" aria-hidden="true" />
      <h2 className="visually-hidden">Selected works</h2>
      <div className="works-grid">
        {projects.map((project) => (
          <article className={`project-card project-card--${project.id}`} key={project.id}>
            <header className="project-meta">
              <h3>{project.title}</h3>
              <div>
                <p>{project.description}</p>
                <time>{project.date}</time>
              </div>
            </header>
            <div className="project-image" role="img" aria-label={`${project.title}: ${project.imageLabel}`}>
              <span>{project.imageLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
