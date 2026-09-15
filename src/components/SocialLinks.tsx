import dribbbleIcon from '../assets/icons/social-dribbble.svg';
import githubIcon from '../assets/icons/social-github.svg';
import linkedinIcon from '../assets/icons/social-linkedin.svg';
import xIcon from '../assets/icons/social-x.svg';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/fahmiauliya',
    icon: githubIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://id.linkedin.com/in/fahmiauliya',
    icon: linkedinIcon,
  },
  {
    label: 'X',
    href: 'https://x.com/fahmiauliya',
    icon: xIcon,
  },
  {
    label: 'Dribbble',
    href: 'https://dribbble.com/FahmiAuliya',
    icon: dribbbleIcon,
  },
] as const;

export default function SocialLinks() {
  return (
    <nav className="social-links" aria-label="Social links">
      {socialLinks.map(({ label, href, icon }) => (
        <a
          className="social-link"
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          key={label}
        >
          <img src={icon} alt="" width="14" height="14" />
        </a>
      ))}
    </nav>
  );
}
