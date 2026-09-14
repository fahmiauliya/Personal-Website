import { socialLinks } from '../data/portfolio';

interface SocialLinksProps {
  className?: string;
}

export default function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <nav className={`social-links ${className}`.trim()} aria-label="Social links">
      {socialLinks.map((social) => (
        <button key={social.label} type="button" disabled aria-label={social.label}>
          <img src={social.icon} alt="" />
        </button>
      ))}
    </nav>
  );
}
