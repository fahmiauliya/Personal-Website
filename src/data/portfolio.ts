export interface Project {
  id: number;
  title: string;
  description: string;
  date: string;
  imageLabel: string;
  href?: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

import githubIcon from '../assets/icons/social-github.svg';
import linkedinIcon from '../assets/icons/social-linkedin.svg';
import xIcon from '../assets/icons/social-x.svg';
import dribbbleIcon from '../assets/icons/social-dribbble.svg';

export const CONTACT_EMAIL = 'hello@fahmiauliya.com';

export const projects: Project[] = Array.from({ length: 8 }, (_, index) => {
  const projectNumber = index + 1;

  return {
    id: projectNumber,
    title: projectNumber === 1 ? 'Beam' : `Project ${projectNumber}`,
    description: projectNumber === 1 ? 'Website, Web app' : `Description ${projectNumber}`,
    date: projectNumber === 1 ? '2022' : '00/00',
    imageLabel: projectNumber === 1 ? 'Cover' : `IMG-${projectNumber}`,
    href: projectNumber === 1 ? '/projects/beam/' : undefined,
  };
});

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/fahmiauliya', icon: githubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fahmiauliya/', icon: linkedinIcon },
  { label: 'X', href: 'https://x.com/fahmiauliya', icon: xIcon },
  { label: 'Dribbble', href: 'https://dribbble.com/fahmiauliya', icon: dribbbleIcon },
];
