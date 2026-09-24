export interface Project {
  id: number;
  title: string;
  description: string;
  date: string;
  imageLabel: string;
  href?: string;
  /** Motion shown as the card image; shares the project page's cover so both stay in sync. */
  cover?: MotionScene;
  /** Cover built in code (e.g. a video with UI on top), shown as the card image. */
  coverScene?: ComponentType;
  /** Static cover image (e.g. a Figma SVG export), shown as the card image. */
  coverImage?: string;
  /** Which side of the card the cover image fills (ratio locked, centred, overflow cropped). Defaults to height. */
  coverImageFit?: 'height' | 'width';
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

import type { ComponentType } from 'react';
import type { MotionScene } from '../components/MotionPreview';
import { beamProject } from '../pages/Beam/beamData';
import { bifrostProject } from '../pages/Bifrost/bifrostData';
// Avea Robotics cover: ~/Documents/avea-robotics-2.jpg, resized for the web (600px tall, 2x the card).
import aveaCover from '../assets/projects/avea/cover.jpg';
// Lasting Learn cover: Figma Portfolio-2026 node 265:4229 at 4x, resized for the web (600px tall, 2x the card).
import lastingLearnCover from '../assets/projects/lasting-learn/cover.jpg';
// Almanac Market cover: Figma Portfolio-2026 node 267:4640 at 4x, resized for the web (600px tall, 2x the card).
import almanacMarketCover from '../assets/projects/almanac-market/cover.jpg';
// TalentPluto card image: a still of its cover video, from Motion Lab website-content/shared/assets.
import talentPlutoCover from '../assets/projects/talentpluto/cover.jpg';
// Eden AI (7) and Tika Security (8) covers: Figma Portfolio-2026 nodes 271:309 and 272:488 at 4x, resized for the web (600px tall, 2x the card).
import edenAiCover from '../assets/projects/eden-ai/cover.jpg';
import tikaSecurityCover from '../assets/projects/tika-security/cover.jpg';
import githubIcon from '../assets/icons/social-github.svg';
import linkedinIcon from '../assets/icons/social-linkedin.svg';
import xIcon from '../assets/icons/social-x.svg';
import dribbbleIcon from '../assets/icons/social-dribbble.svg';

export const CONTACT_EMAIL = 'hello@fahmiauliya.com';

export const projects: Project[] = Array.from({ length: 8 }, (_, index) => {
  const projectNumber = index + 1;

  return {
    id: projectNumber,
    title: projectNumber === 1 ? 'Beam' : projectNumber === 2 ? 'Bifrost' : projectNumber === 3 ? 'Lasting Learn' : projectNumber === 4 ? 'TalentPluto' : projectNumber === 5 ? 'Avea Robotics' : projectNumber === 6 ? 'Almanac Market' : projectNumber === 7 ? 'Eden AI' : 'Tika Security',
    description: projectNumber === 1 ? 'Website, Web app' : `Description ${projectNumber}`,
    date: projectNumber === 1 ? '2022' : '00/00',
    imageLabel: projectNumber === 1 ? 'Cover' : `IMG-${projectNumber}`,
    href: projectNumber === 1 ? '/projects/beam/' : projectNumber === 2 ? '/projects/bifrost/' : undefined,
    cover: projectNumber === 1 ? beamProject.cover : projectNumber === 2 ? bifrostProject.cover : undefined,
    coverImage: projectNumber === 3 ? lastingLearnCover : projectNumber === 4 ? talentPlutoCover : projectNumber === 5 ? aveaCover : projectNumber === 6 ? almanacMarketCover : projectNumber === 7 ? edenAiCover : projectNumber === 8 ? tikaSecurityCover : undefined,
    coverImageFit: projectNumber === 3 || projectNumber === 6 ? 'width' : undefined,
  };
});

// Recent Work tab: placeholder cards until their projects and images are ready. Same card
// as Selected Project, scattered differently on the grid (.recent-card--N in global.css).
export const recentWorks: Project[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: `Recent Work ${index + 1}`,
  description: `Description ${index + 1}`,
  date: '00/00',
  imageLabel: `IMG-${index + 1}`,
}));

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/fahmiauliya', icon: githubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fahmiauliya/', icon: linkedinIcon },
  { label: 'X', href: 'https://x.com/fahmiauliya', icon: xIcon },
  { label: 'Dribbble', href: 'https://dribbble.com/fahmiauliya', icon: dribbbleIcon },
];
