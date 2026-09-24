import { socialLinks } from '../data/portfolio';

interface SocialLinksProps {
  className?: string;
}

export default function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <nav className={`social-links ${className}`.trim()} aria-label="Social links">
      {socialLinks.map((social) => (
        <button key={social.label} className="social-button" type="button" aria-label={social.label}>
          <img src={social.icon} alt="" />
        </button>
      ))}
    </nav>
  );
}
