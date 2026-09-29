import { socialLinks } from '../../data/portfolio';

interface SocialLinksProps {
  className?: string;
}

export default function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <nav className={`social-links ${className}`.trim()} aria-label="Social links">
      {socialLinks.map((social) => (
        <a key={social.label} className="social-button tap-target" href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} (opens in a new tab)`}>
          <img src={social.icon} alt="" />
        </a>
      ))}
    </nav>
  );
}
