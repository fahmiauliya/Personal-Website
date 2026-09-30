export interface Project {
  id: number;
  title: string;
  description: string;
  date: string;
  imageLabel: string;
  href?: string;
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
import { beamProject } from '../works/selected-projects/beam/beamData';
import BeamCover from '../works/selected-projects/beam/cover/BeamCover';
import BifrostCover from '../works/selected-projects/bifrost/cover/BifrostCover';
import { bifrostProject } from '../works/selected-projects/bifrost/bifrostData';
import { recentWorkPath, recentWorkProjects } from '../works/recent-work/recentWorkData';
// The other Selected Project covers are still images, 600px tall (2x the card) as WebP.
// Avea Robotics cover: ~/Documents/avea-robotics-2.jpg.
import aveaCover from '../works/selected-projects/avea/cover.webp';
// Lasting Learn cover: Figma Portfolio-2026 node 265:4229.
import lastingLearnCover from '../works/selected-projects/lasting-learn/cover.webp';
// Almanac Market cover: Figma Portfolio-2026 node 267:4640.
import almanacMarketCover from '../works/selected-projects/almanac-market/cover.webp';
// TalentPluto cover: a still of its former cover video (Motion Lab website-content/shared/assets).
import talentPlutoCover from '../works/selected-projects/talentpluto/cover.webp';
// Eden AI (7) and Tika Security (8) covers: Figma Portfolio-2026 nodes 271:309 and 272:488.
import edenAiCover from '../works/selected-projects/eden-ai/cover.webp';
import tikaSecurityCover from '../works/selected-projects/tika-security/cover.webp';
import githubIcon from '../assets/icons/social-github.svg';
import linkedinIcon from '../assets/icons/social-linkedin.svg';
import xIcon from '../assets/icons/social-x.svg';
import dribbbleIcon from '../assets/icons/social-dribbble.svg';

export const CONTACT_EMAIL = 'fahmiauliyarohman@gmail.com';
export const CONTACT_TELEGRAM = 'https://t.me/fahmiauliya';

export const projects: Project[] = Array.from({ length: 8 }, (_, index) => {
  const projectNumber = index + 1;

  return {
    id: projectNumber,
    title: projectNumber === 1 ? 'Beam' : projectNumber === 2 ? 'Bifrost' : projectNumber === 3 ? 'Lasting Learn' : projectNumber === 4 ? 'TalentPluto' : projectNumber === 5 ? 'Avea Robotics' : projectNumber === 6 ? 'Almanac Market' : projectNumber === 7 ? 'Eden AI' : 'Tika Security',
    description: projectNumber === 1 ? beamProject.category : projectNumber === 2 ? bifrostProject.category : projectNumber === 3 ? 'Web App Design' : projectNumber === 4 ? 'Website Design + Implementation' : projectNumber === 5 ? 'Website Design, Deck, VR Interface' : projectNumber === 6 ? 'Web App Design' : projectNumber === 7 ? 'Website Design + Implementation' : `Description ${projectNumber}`,
    date: projectNumber === 1 || projectNumber === 2 ? '2026' : '00/00',
    imageLabel: projectNumber === 1 ? 'Cover' : `IMG-${projectNumber}`,
    href: projectNumber === 1 ? '/projects/beam/' : projectNumber === 2 ? '/projects/bifrost/' : undefined,
    coverScene: projectNumber === 1 ? BeamCover : projectNumber === 2 ? BifrostCover : undefined,
    coverImage: projectNumber === 3 ? lastingLearnCover : projectNumber === 4 ? talentPlutoCover : projectNumber === 5 ? aveaCover : projectNumber === 6 ? almanacMarketCover : projectNumber === 7 ? edenAiCover : projectNumber === 8 ? tikaSecurityCover : undefined,
    coverImageFit: projectNumber === 3 || projectNumber === 6 ? 'width' : undefined,
  };
});

// Recent Work tab: the projects developed in Motion Lab (recent-work-content/), each a
// live card with an open/close detail page like Beam and Bifrost. Scattered differently
// on the grid (.recent-card--N in global.css) from Selected Project's own placement.
// Slot 8 stays a placeholder until an eighth project exists.
export const recentWorks: Project[] = Array.from({ length: 8 }, (_, index) => {
  const project = recentWorkProjects[index];
  if (project) {
    return {
      id: index + 1,
      title: project.title,
      description: project.category,
      date: '2024',
      imageLabel: project.title,
      href: recentWorkPath(project.slug),
      coverScene: project.Cover,
    };
  }
  return {
    id: index + 1,
    title: `Recent Work ${index + 1}`,
    description: `Description ${index + 1}`,
    date: '00/00',
    imageLabel: `IMG-${index + 1}`,
  };
});

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/fahmiauliya', icon: githubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fahmiauliya/', icon: linkedinIcon },
  { label: 'X', href: 'https://x.com/fahmiauliyaa', icon: xIcon },
  { label: 'Dribbble', href: 'https://dribbble.com/FahmiAuliya', icon: dribbbleIcon },
];
