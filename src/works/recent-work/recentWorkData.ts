import type { ComponentType } from 'react';
import LiveCompaiCard from './compai/LiveCompaiCard';
import LiveFinovaCard from './finova/LiveFinovaCard';
import LiveNutrisyncCard from './nutrisync/LiveNutrisyncCard';
import LiveTeamSecurityCard from './team-security/LiveTeamSecurityCard';
import LiveAgentWalkthroughCard from './agent-walkthrough/LiveAgentWalkthroughCard';
import LiveCareerAgentCard from './career-agent/LiveCareerAgentCard';
import LiveVelocityCard from './velocity/LiveVelocityCard';

// Recent Work projects, developed in Motion Lab (recent-work-content/) and brought over
// here: each card is the live composition itself (not a video or a static export), the
// same component that runs in the lab, driven the same way (useCardClock.ts replays the
// lab's saved settings.json timing). The detail pages reuse the exact card at its native
// 536 × 410.204071 ratio, uncropped; the grid thumbnail crops it to the standard card box.
//
// Facts and descriptions below are placeholders (no case-study copy exists for these yet),
// in the same spirit as the site's other placeholder projects — replace them once written.
export interface RecentWorkProject {
  slug: string;
  title: string;
  category: string;
  background: string;
  details: { label: string; lines: string[] }[];
  description: string[];
  note: string;
  /** The live card, used both as the Works/Recent Work grid thumbnail and the detail cover. */
  Cover: ComponentType<{ eager?: boolean }>;
}

const CARD_WIDTH = 536;
const CARD_HEIGHT = 410.2040710449219;
/** The card's own ratio, so the detail cover shows it uncropped (see recentWork.css). */
export const RECENT_WORK_COVER_RATIO = CARD_WIDTH / CARD_HEIGHT;

export const recentWorkProjects: RecentWorkProject[] = [
  {
    slug: 'compai',
    title: 'Compai',
    category: 'Product design (Design exploration)',
    background: '#979797',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['UI Design', 'Motion', 'Rive'] },
    ],
    description: [
      'Compai is a design exploration for an AI product’s hero moment: a looping animation that introduces the brand before any interface loads.',
      'Built and tuned frame by frame in Rive, then brought into the site exactly as authored.',
    ],
    note: 'Rive, Motion Lab.',
    Cover: LiveCompaiCard,
  },
  {
    slug: 'finova',
    title: 'Finova',
    category: 'Mobile app (Design exploration)',
    background: '#f0f0f0',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['UI Design', 'Motion', 'Prototyping'] },
    ],
    description: [
      'Finova is a fintech app concept exploring a "live" interface: nothing fades in or out, every number rolls and every card glides in place, the way a real dashboard would feel mid-use.',
      'Two phones loop through a shared 12-second story — a task completing on one, a portfolio updating on the other — and land exactly back where they started.',
    ],
    note: 'Rolling numbers, gliding tabs.',
    Cover: LiveFinovaCard,
  },
  {
    slug: 'nutrisync',
    title: 'Nutrisync',
    category: 'Brand, Mobile app (Design exploration)',
    background: '#f0f0f0',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['Branding', 'UI Design'] },
    ],
    description: [
      'Nutrisync is a fitness brand study: a symbol and wordmark set over a photograph, kept as independent layers so the mark can move on its own from the background later.',
    ],
    note: 'Brand over photography.',
    Cover: LiveNutrisyncCard,
  },
  {
    slug: 'team-security',
    title: 'Team Security',
    category: 'Brand identity (Design exploration)',
    background: '#f5f5f5',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['Branding', 'Motion'] },
    ],
    description: [
      'A construction-themed security mark, with a fine highlight that traces its circular build path and a soft reflection sweeping across the logo on an eight-second loop.',
    ],
    note: 'A quiet, looping light.',
    Cover: LiveTeamSecurityCard,
  },
  {
    slug: 'agent-walkthrough',
    title: 'Agent Walkthrough',
    category: 'Product design (Design exploration)',
    background: '#f5f5f5',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['UI Design', 'WebGL', 'Motion'] },
    ],
    description: [
      'An onboarding panel for talking to an AI career agent, set over a live shader background: warm and cool light masses drift and bend into each other behind frosted glass.',
      'The agent’s avatar is a small nebula orb, painted in the background’s own colours, rendered live rather than as a video loop.',
    ],
    note: 'A living background, in WebGL.',
    Cover: LiveAgentWalkthroughCard,
  },
  {
    slug: 'career-agent',
    title: 'Career Agent',
    category: 'Landing page (Design exploration)',
    background: '#dadada',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['UI Design', 'Motion'] },
    ],
    description: [
      'A landing page for an AI career agent, TalentPluto: a halftone hero of 11,881 dots behind the pitch, and a carousel of outcome stories that steps through on its own.',
    ],
    note: 'A halftone hero, a story carousel.',
    Cover: LiveCareerAgentCard,
  },
  {
    slug: 'velocity',
    title: 'Velocity',
    category: 'Web app (Design exploration)',
    background: '#bebebe',
    details: [
      { label: 'Year', lines: ['2024'] },
      { label: 'Role', lines: ['Product Designer'] },
      { label: 'Services', lines: ['UI Design', 'Data visualisation', 'Motion'] },
    ],
    description: [
      'Velocity is a performance-analytics dashboard concept: a "live" loop steps through three days of data, easing every bar, score and vital into place as if someone were actually browsing it.',
    ],
    note: 'A dashboard that keeps moving.',
    Cover: LiveVelocityCard,
  },
];

export const recentWorkProjectBySlug = new Map(recentWorkProjects.map(project => [project.slug, project]));
// Trailing slash to match the site's other project hrefs (/projects/beam/); the router
// normalizes it away before comparing (projectTransition.ts's normalizePath).
export const recentWorkPath = (slug: string) => `/projects/recent/${slug}/`;
