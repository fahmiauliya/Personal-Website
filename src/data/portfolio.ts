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

import { createElement, type ComponentType } from 'react';
import type { MotionScene } from '../components/MotionPreview';
import TalentPlutoCover from '../pages/TalentPluto/TalentPlutoCover';
import { beamProject } from '../pages/Beam/beamData';
import { bifrostProject } from '../pages/Bifrost/bifrostData';
// Avea Robotics cover: ~/Documents/avea-robotics-2.jpg, resized for the web (1000px tall).
import aveaCover from '../assets/projects/avea/cover.jpg';
// Lasting Learn cover: Figma Portfolio-2026 node 265:4229 at 4x, resized for the web (1000px tall).
import lastingLearnCover from '../assets/projects/lasting-learn/cover.jpg';
// Almanac Market cover: Figma Portfolio-2026 node 267:4640 at 4x, resized for the web (1000px tall).
import almanacMarketCover from '../assets/projects/almanac-market/cover.jpg';
import githubIcon from '../assets/icons/social-github.svg';
import linkedinIcon from '../assets/icons/social-linkedin.svg';
import xIcon from '../assets/icons/social-x.svg';
import dribbbleIcon from '../assets/icons/social-dribbble.svg';

export const CONTACT_EMAIL = 'hello@fahmiauliya.com';

// TalentPluto's temporary cover video: ~/Documents/Video.mp4, re-encoded for the web
// (muted, 1200px wide, fast start) into public/talentpluto/.
const TalentPlutoCardCover = () => createElement(TalentPlutoCover, { video: '/talentpluto/cover.mp4', poster: '/talentpluto/cover-poster.jpg' });

export const projects: Project[] = Array.from({ length: 8 }, (_, index) => {
  const projectNumber = index + 1;

  return {
    id: projectNumber,
    title: projectNumber === 1 ? 'Beam' : projectNumber === 2 ? 'Bifrost' : projectNumber === 3 ? 'Lasting Learn' : projectNumber === 4 ? 'TalentPluto' : projectNumber === 5 ? 'Avea Robotics' : projectNumber === 6 ? 'Almanac Market' : `Project ${projectNumber}`,
    description: projectNumber === 1 ? 'Website, Web app' : `Description ${projectNumber}`,
    date: projectNumber === 1 ? '2022' : '00/00',
    imageLabel: projectNumber === 1 ? 'Cover' : `IMG-${projectNumber}`,
    href: projectNumber === 1 ? '/projects/beam/' : projectNumber === 2 ? '/projects/bifrost/' : undefined,
    cover: projectNumber === 1 ? beamProject.cover : projectNumber === 2 ? bifrostProject.cover : undefined,
    coverScene: projectNumber === 4 ? TalentPlutoCardCover : undefined,
    coverImage: projectNumber === 3 ? lastingLearnCover : projectNumber === 5 ? aveaCover : projectNumber === 6 ? almanacMarketCover : undefined,
    coverImageFit: projectNumber === 3 || projectNumber === 6 ? 'width' : undefined,
  };
});

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/fahmiauliya', icon: githubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fahmiauliya/', icon: linkedinIcon },
  { label: 'X', href: 'https://x.com/fahmiauliya', icon: xIcon },
  { label: 'Dribbble', href: 'https://dribbble.com/fahmiauliya', icon: dribbbleIcon },
];
