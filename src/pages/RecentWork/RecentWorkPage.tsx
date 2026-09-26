import ContactCta from '../../components/ContactCta';
import SocialLinks from '../../components/SocialLinks';
import RecentWorkHeader from './RecentWorkHeader';
import type { RecentWorkProject } from './recentWorkData';
import './recentWork.css';

// One page shell for every Recent Work project (mirrors BeamPage/BifrostPage), so the
// open/close shared-element transition, the header and the footer are identical; only
// the copy and the live cover component change per project. There is no gallery section
// below the overview: unlike Beam and Bifrost, these projects have no additional shots.
export default function RecentWorkPage({ project }: { project: RecentWorkProject }) {
  const { Cover } = project;
  return (
    <div className="recent-work-page">
      <RecentWorkHeader title={project.title} />
      <main className="recent-work-main">
        <section className="recent-work-overview" aria-labelledby="recent-work-title">
          <div className="recent-work-details">
            <div>
              <h1 id="recent-work-title" data-project-part="title">{project.title}</h1>
              <p className="recent-work-category" data-project-part="category">{project.category}</p>
              <dl className="recent-work-facts" data-project-part="metadata">
                {project.details.map(({ label, lines }, index) => (
                  <div className="recent-work-fact" key={`${label}-${index}`}>
                    <dt>{label}</dt>
                    <dd>{lines.map(line => <span key={line}>{line}</span>)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="recent-work-cover" data-project-cover style={{ background: project.background }}>
            <Cover eager />
          </div>
          <div className="recent-work-description" data-project-part="description">
            <div>{project.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <p>{project.note}</p>
          </div>
        </section>
      </main>
      <footer className="recent-work-footer">
        <ContactCta />
        <div className="recent-work-socials"><SocialLinks /></div>
      </footer>
    </div>
  );
}
